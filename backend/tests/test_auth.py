def test_register_user(client):
    payload = {
        "email": "fresh_dreamer@ideas.io",
        "password": "strongpassword123",
        "display_name": "Cosmic Voyager"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == payload["email"]
    assert data["user"]["display_name"] == payload["display_name"]

def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@ideas.io",
        "password": "password123",
        "display_name": "Original"
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_login_user(client):
    email = "login_test@ideas.io"
    password = "loginpassword123"
    client.post("/api/v1/auth/register", json={"email": email, "password": password, "display_name": "User"})

    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == email

def test_get_current_user_profile(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test_creator@universe.space"
