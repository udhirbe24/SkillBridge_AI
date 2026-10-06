import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_security_headers_present():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    headers = response.headers

    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert "Strict-Transport-Security" in headers
    assert "Content-Security-Policy" in headers

def test_rate_limit_headers_present():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    headers = response.headers

    assert "X-RateLimit-Limit" in headers
    assert "X-RateLimit-Remaining" in headers

def test_invalid_jwt_token_rejection():
    invalid_headers = {"Authorization": "Bearer fake_tampered_jwt_token_12345"}
    response = client.get("/api/v1/auth/me", headers=invalid_headers)
    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"]


def test_privilege_escalation_rejection():
    # 1. Register student
    student_payload = {
        "email": "sec.student@university.edu",
        "password": "Password123!",
        "full_name": "Security Student",
        "role": "STUDENT"
    }
    client.post("/api/v1/auth/register", json=student_payload)

    # 2. Login as student
    login_res = client.post("/api/v1/auth/login", json={
        "email": "sec.student@university.edu",
        "password": "Password123!"
    })
    student_token = login_res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 3. Attempt admin access -> Must return 403 Forbidden
    admin_res = client.get("/api/v1/admin/users", headers=student_headers)
    assert admin_res.status_code == 403
    assert "Operation not permitted" in admin_res.json()["detail"]
