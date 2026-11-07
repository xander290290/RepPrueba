def test_admin_can_register_user(client, login):
    tokens = login()
    response = client.post(
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
    assert response.status_code == 201
    assert response.json()["email"] == "ana@centro.es"
    assert "password_hash" not in response.json()


def test_teacher_cannot_list_users(client, login):
    tokens = login("profe@centro.es", "TeacherPassword123!")
    response = client.get(
        "/api/intranet/v1/users",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert response.status_code == 403
