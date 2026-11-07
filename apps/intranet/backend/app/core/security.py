from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash

from app.core.config import get_settings
from app.db.mongodb import get_database

password_hash = PasswordHash.recommended()
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_token(
    *,
    subject: str,
    session_id: str,
    token_type: str,
    expires_delta: timedelta,
    token_id: str | None = None,
) -> tuple[str, str]:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    jti = token_id or str(uuid4())
    payload = {
        "sub": subject,
        "sid": session_id,
        "jti": jti,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)
    return token, jti


def decode_token(token: str) -> dict:
    settings = get_settings()
    try:
        return jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["sub", "sid", "jti", "type", "exp"]},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    database=Depends(get_database),
) -> dict:
    if credentials is None:
        raise unauthorized()

    payload = decode_token(credentials.credentials)
    if payload["type"] != "access":
        raise unauthorized()

    session = database.sessions.find_one(
        {"_id": payload["sid"], "revoked": False, "user_id": payload["sub"]}
    )
    if session is None:
        raise unauthorized()

    user = database.users.find_one({"_id": payload["sub"], "is_active": True})
    if user is None:
        raise unauthorized()

    user["session_id"] = payload["sid"]
    return user


def require_permission(permission: str):
    def permission_dependency(
        current_user: dict = Depends(get_current_user),
        database=Depends(get_database),
    ) -> dict:
        roles = list(
            database.roles.find({"name": {"$in": current_user.get("roles", [])}})
        )
        permissions = {
            granted
            for role in roles
            for granted in role.get("permissions", [])
        }
        if "*" not in permissions and permission not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes.",
            )
        return current_user

    return permission_dependency
