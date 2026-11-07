import os
import secrets
import socket
import subprocess
import sys
import time
import uuid
from pathlib import Path
from urllib.parse import urlparse

import httpx
from pymongo import MongoClient

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import get_settings


def available_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def require_status(response: httpx.Response, expected_status: int) -> None:
    if response.status_code != expected_status:
        raise AssertionError(
            f"{response.request.method} {response.request.url} "
            f"devolvio {response.status_code}; esperado {expected_status}: "
            f"{response.text}"
        )


def main() -> None:
    settings = get_settings()
    mongo_uri = settings.mongo_uri
    if urlparse(mongo_uri).hostname not in {"localhost", "127.0.0.1"}:
        raise RuntimeError(
            "Este smoke test solo permite MongoDB local para evitar crear y borrar "
            "bases temporales en servidores remotos."
        )

    database_name = f"intranet_smoke_{uuid.uuid4().hex[:12]}"
    admin_email = f"admin-{uuid.uuid4().hex[:8]}@example.com"
    admin_password = secrets.token_urlsafe(24)
    port = available_port()
    environment = os.environ.copy()
    environment.update(
        {
            "APP_ENV": "development",
            "MONGO_URI": mongo_uri,
            "DATABASE_NAME": database_name,
            "INITIAL_ADMIN_EMAIL": admin_email,
            "INITIAL_ADMIN_NAME": "Temporary smoke test admin",
            "INITIAL_ADMIN_PASSWORD": admin_password,
        }
    )

    mongo = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    mongo.admin.command("ping")
    server = None
    try:
        server = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "app.main:app",
                "--host",
                "127.0.0.1",
                "--port",
                str(port),
            ],
            cwd=PROJECT_ROOT,
            env=environment,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )

        base_url = f"http://127.0.0.1:{port}"
        with httpx.Client(base_url=base_url, timeout=5.0) as client:
            openapi_response = None
            for _ in range(60):
                if server.poll() is not None:
                    break
                try:
                    openapi_response = client.get("/openapi.json")
                    if openapi_response.status_code == 200:
                        break
                except httpx.HTTPError:
                    time.sleep(1)
            if openapi_response is None or openapi_response.status_code != 200:
                if server.poll() is None:
                    server.terminate()
                output, _ = server.communicate(timeout=15)
                raise RuntimeError(
                    "La API no arranco correctamente. Salida de Uvicorn:\n"
                    f"{output}"
                )
            print("API y documentacion OpenAPI: OK")

            admin_login = client.post(
                "/api/intranet/v1/auth/login",
                json={"email": admin_email, "password": admin_password},
            )
            require_status(admin_login, 200)
            admin_tokens = admin_login.json()
            admin_headers = {
                "Authorization": f"Bearer {admin_tokens['access_token']}"
            }

            profile = client.get(
                "/api/intranet/v1/users/me",
                headers=admin_headers,
            )
            require_status(profile, 200)
            assert profile.json()["email"] == admin_email
            print("Login y perfil del administrador: OK")

            roles = client.get(
                "/api/intranet/v1/roles",
                headers=admin_headers,
            )
            require_status(roles, 200)
            assert any(role["name"] == "profesor" for role in roles.json())
            print(f"Roles inicializados en MongoDB: {len(roles.json())}")

            teacher_email = f"teacher-{uuid.uuid4().hex[:8]}@example.com"
            teacher_password = secrets.token_urlsafe(18)
            created_user = client.post(
                "/api/intranet/v1/users/register",
                headers=admin_headers,
                json={
                    "name": "Temporary",
                    "surname": "Teacher",
                    "email": teacher_email,
                    "password": teacher_password,
                    "role": "profesor",
                },
            )
            require_status(created_user, 201)
            assert "password_hash" not in created_user.json()

            teacher_login = client.post(
                "/api/intranet/v1/auth/login",
                json={"email": teacher_email, "password": teacher_password},
            )
            require_status(teacher_login, 200)
            teacher_headers = {
                "Authorization": (
                    f"Bearer {teacher_login.json()['access_token']}"
                )
            }
            forbidden = client.get(
                "/api/intranet/v1/users",
                headers=teacher_headers,
            )
            require_status(forbidden, 403)
            print("Creacion de usuario, hash no expuesto y permisos: OK")

            refresh = client.post(
                "/api/intranet/v1/auth/refresh",
                json={"refresh_token": admin_tokens["refresh_token"]},
            )
            require_status(refresh, 200)
            assert refresh.json()["refresh_token"]

            replay = client.post(
                "/api/intranet/v1/auth/refresh",
                json={"refresh_token": admin_tokens["refresh_token"]},
            )
            require_status(replay, 401)

            refreshed_headers = {
                "Authorization": f"Bearer {refresh.json()['access_token']}"
            }
            logout = client.post(
                "/api/intranet/v1/auth/logout",
                headers=refreshed_headers,
            )
            require_status(logout, 200)
            revoked_profile = client.get(
                "/api/intranet/v1/users/me",
                headers=refreshed_headers,
            )
            require_status(revoked_profile, 401)
            print("Rotacion de refresh token y revocacion de sesion: OK")

        database = mongo[database_name]
        assert database.users.count_documents({}) == 2
        assert database.roles.count_documents({}) == 4
        assert database.sessions.count_documents({}) >= 1
        audit_events = list(database.audit_logs.find({}, {"_id": 0}))
        assert sum(event["action"] == "auth.login" for event in audit_events) == 2
        assert sum(event["action"] == "users.register" for event in audit_events) == 1
        assert sum(event["action"] == "auth.logout" for event in audit_events) == 1
        assert all(
            not {"email", "password", "access_token", "refresh_token"} & event.keys()
            for event in audit_events
        )
        print(
            "Persistencia MongoDB: 2 usuarios, 4 roles, sesiones y auditoria verificadas"
        )
    finally:
        if server is not None:
            if server.poll() is None:
                server.terminate()
            server.communicate(timeout=15)
        mongo.drop_database(database_name)
        mongo.close()
        print("Base temporal eliminada y servidor de prueba detenido.")


if __name__ == "__main__":
    main()
