def test_authenticated_user_can_read_roles_and_permissions(client, login):
    tokens = login()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    roles = client.get("/api/intranet/v1/roles", headers=headers)
    assert roles.status_code == 200
    assert {role["name"] for role in roles.json()} >= {"admin", "profesor"}

    permissions = client.get(
        "/api/intranet/v1/roles/profesor/permissions",
        headers=headers,
    )
    assert permissions.status_code == 200
    assert permissions.json() == ["announcements.read"]


def test_unknown_role_returns_404(client, login):
    tokens = login()
    response = client.get(
        "/api/intranet/v1/roles/unknown/permissions",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert response.status_code == 404
