import mongomock
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.init_db import initialize_database
from app.db.mongodb import get_database
from app.main import app


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("SECRET_KEY", "test-only-secret-key-with-at-least-32-chars")
    get_settings.cache_clear()

    database = mongomock.MongoClient().intranet_test
    initialize_database(database, get_settings())
    database.users.insert_one(
        {
            "_id": "admin-1",
            "name": "Admin",
            "surname": "Test",
            "email": "admin@centro.es",
            "password_hash": hash_password("AdminPassword123!"),
            "roles": ["admin"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
        }
    )
    database.users.insert_one(
        {
            "_id": "teacher-1",
            "name": "Profe",
            "surname": "Test",
            "email": "profe@centro.es",
            "password_hash": hash_password("TeacherPassword123!"),
            "roles": ["profesor"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
        }
    )
    app.dependency_overrides[get_database] = lambda: database

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    get_settings.cache_clear()


@pytest.fixture
def login(client):
    def perform_login(email="admin@centro.es", password="AdminPassword123!"):
        response = client.post(
            "/api/intranet/v1/auth/login",
            json={"email": email, "password": password},
        )
        return response.json()

    return perform_login
