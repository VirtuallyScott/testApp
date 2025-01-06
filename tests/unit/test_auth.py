import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from src.api.auth import verify_password, create_access_token
from src.api.main import app

client = TestClient(app)

def test_verify_password():
    hashed = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY9uhNOIbQMDwxS"  # hash for 'test123'
    assert verify_password("test123", hashed) == True
    assert verify_password("wrongpass", hashed) == False

def test_create_access_token():
    data = {"sub": "testuser"}
    expires = timedelta(minutes=15)
    token = create_access_token(data, expires)
    assert isinstance(token, str)
    assert len(token) > 0

def test_login_endpoint():
    response = client.post(
        "/token",
        data={"username": "testuser", "password": "wrongpass"}
    )
    assert response.status_code == 401
