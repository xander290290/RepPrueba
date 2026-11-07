from app.db.mongodb import get_database
from app.main import app


def test_login_success_and_failure_are_audited_without_credentials(client):
    successful_login = client.post(
        "/api/intranet/v1/auth/login",
        json={"email": "admin@centro.es", "password": "AdminPassword123!"},
    )
    assert successful_login.status_code == 200

    failed_login = client.post(
        "/api/intranet/v1/auth/login",
        json={"email": "admin@centro.es", "password": "wrong-password"},
    )
    assert failed_login.status_code == 401

    database = app.dependency_overrides[get_database]()
    events = list(database.audit_logs.find({}, {"_id": 0}))
    assert [event["outcome"] for event in events] == ["success", "failure"]
    assert events[0]["action"] == "auth.login"
    assert events[0]["actor_id"] == "admin-1"
    assert events[1]["action"] == "auth.login"
    assert events[1]["actor_id"] is None
    assert all("email" not in event and "password" not in event for event in events)
    assert all("occurred_at" in event for event in events)


def test_logout_and_user_registration_are_audited(client, login):
    tokens = login()
    logout = client.post(
        "/api/intranet/v1/auth/logout",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert logout.status_code == 200

    tokens = login()
    registration = client.post(
        "/api/intranet/v1/users/register",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
        json={
            "name": "Ana",
            "surname": "Garcia",
            "email": "ana@centro.es",
            "password": "SecurePassword123!",
            "role": "profesor",
        },
    )
    assert registration.status_code == 201

    database = app.dependency_overrides[get_database]()
    events = list(
        database.audit_logs.find(
            {"action": {"$in": ["auth.logout", "users.register"]}},
            {"_id": 0},
        )
    )
    assert {event["action"] for event in events} == {
        "auth.logout",
        "users.register",
    }

    registered_user = next(
        event for event in events if event["action"] == "users.register"
    )
    assert registered_user["actor_id"] == "admin-1"
    assert registered_user["target_id"] == registration.json()["id"]
    assert all(event["outcome"] == "success" for event in events)
    assert all(
        "password" not in event
        and "token" not in event
        and "email" not in event
        for event in events
    )
