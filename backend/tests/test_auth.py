import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_student_success():
    payload = {
        "email": "alex.student@university.edu",
        "password": "SecureStudentPassword123!",
        "full_name": "Alex Student",
        "role": "STUDENT",
        "student_profile": {
            "headline": "Fullstack Engineering Student",
            "target_role": "Backend Engineer",
            "skills": ["Python", "FastAPI", "PostgreSQL"]
        }
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alex.student@university.edu"
    assert data["role"] == "STUDENT"
    assert data["student_profile"]["target_role"] == "Backend Engineer"
    assert data["student_profile"]["readiness_score"] == 0.0

def test_register_duplicate_email():
    payload = {
        "email": "alex.student@university.edu",
        "password": "AnotherPassword123!",
        "full_name": "Alex Duplicate",
        "role": "STUDENT"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_register_recruiter_success():
    payload = {
        "email": "recruiter@techcorp.com",
        "password": "RecruiterPass2026!",
        "full_name": "Sarah Recruiter",
        "role": "RECRUITER",
        "recruiter_profile": {
            "company_name": "TechCorp Innovations",
            "company_website": "https://techcorp.com",
            "industry": "Software Engineering"
        }
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "recruiter@techcorp.com"
    assert data["role"] == "RECRUITER"
    assert data["recruiter_profile"]["company_name"] == "TechCorp Innovations"

def test_login_success():
    login_payload = {
        "email": "alex.student@university.edu",
        "password": "SecureStudentPassword123!"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "alex.student@university.edu"

def test_login_invalid_password():
    login_payload = {
        "email": "alex.student@university.edu",
        "password": "WrongPassword123!"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_get_me_authenticated():
    # Login first
    login_res = client.post("/api/v1/auth/login", json={
        "email": "alex.student@university.edu",
        "password": "SecureStudentPassword123!"
    })
    token = login_res.json()["access_token"]

    # Request /me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    data = me_res.json()
    assert data["email"] == "alex.student@university.edu"
    assert data["role"] == "STUDENT"

def test_rbac_candidate_search_permission():
    # Student token
    student_login = client.post("/api/v1/auth/login", json={
        "email": "alex.student@university.edu",
        "password": "SecureStudentPassword123!"
    })
    student_token = student_login.json()["access_token"]
    
    # Recruiter token
    recruiter_login = client.post("/api/v1/auth/login", json={
        "email": "recruiter@techcorp.com",
        "password": "RecruiterPass2026!"
    })
    recruiter_token = recruiter_login.json()["access_token"]

    # 1. Student attempts candidate listing -> Should receive 403 Forbidden
    res_student = client.get("/api/v1/users/candidates", headers={"Authorization": f"Bearer {student_token}"})
    assert res_student.status_code == 403

    # 2. Recruiter attempts candidate listing -> Should receive 200 OK
    res_recruiter = client.get("/api/v1/users/candidates", headers={"Authorization": f"Bearer {recruiter_token}"})
    assert res_recruiter.status_code == 200
    candidates = res_recruiter.json()
    assert len(candidates) >= 1
    candidate_emails = [c["email"] for c in candidates]
    assert "alex.student@university.edu" in candidate_emails

