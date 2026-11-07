def test_login_refresh_and_logout_revoke_session(client, login):
    tokens = login()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    profile = client.get(
        "/api/intranet/v1/users/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert profile.status_code == 200
    assert profile.json()["email"] == "admin@centro.es"

    refreshed = client.post(
        "/api/intranet/v1/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert refreshed.status_code == 200
    assert refreshed.json()["refresh_token"] != tokens["refresh_token"]

    reused = client.post(
        "/api/intranet/v1/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert reused.status_code == 401

    logout = client.post(
        "/api/intranet/v1/auth/logout",
        headers={"Authorization": f"Bearer {refreshed.json()['access_token']}"},
    )
    assert logout.status_code == 200

    revoked = client.get(
        "/api/intranet/v1/users/me",
        headers={"Authorization": f"Bearer {refreshed.json()['access_token']}"},
    )
    assert revoked.status_code == 401


def test_invalid_credentials_are_rejected(client):
    response = client.post(
        "/api/intranet/v1/auth/login",
        json={"email": "admin@centro.es", "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_protected_endpoint_requires_authentication(client):
    response = client.get("/api/intranet/v1/users/me")
    assert response.status_code == 401
