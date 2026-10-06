import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_role_benchmarks():
    response = client.get("/api/v1/skills/benchmarks")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    role_names = [b["role_name"] for b in data]
    assert "Fullstack Developer" in role_names
    assert "Backend Engineer" in role_names
    assert "AI/ML RAG Specialist" in role_names

def test_run_skill_gap_analysis_partial_match():
    # 1. Register student
    student_payload = {
        "email": "gap.student@university.edu",
        "password": "Password123!",
        "full_name": "Gap Test Student",
        "role": "STUDENT",
        "student_profile": {
            "headline": "Junior Dev",
            "target_role": "Fullstack Developer",
            "skills": ["Python", "FastAPI", "React"]
        }
    }
    client.post("/api/v1/auth/register", json=student_payload)

    # 2. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "gap.student@university.edu",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Run Skill Gap Analysis against Fullstack Developer
    gap_req = {"target_role": "Fullstack Developer"}
    res = client.post("/api/v1/skills/gap-analysis", json=gap_req, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["target_role"] == "Fullstack Developer"
    assert data["readiness_score"] == 42.5  # 3 of 6 required skills matched (50% * 0.85 = 42.5%)
    assert "TypeScript" in data["missing_required_skills"]
    assert "PostgreSQL" in data["missing_required_skills"]
    assert "Git" in data["missing_required_skills"]

def test_run_skill_gap_analysis_full_match():
    # 1. Register candidate with full skill set
    student_payload = {
        "email": "senior.student@university.edu",
        "password": "Password123!",
        "full_name": "Senior Test Student",
        "role": "STUDENT",
        "student_profile": {
            "headline": "Senior Fullstack Student",
            "target_role": "Fullstack Developer",
            "skills": ["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Git", "Docker", "Next.js", "Redis", "GraphQL", "TailwindCSS"]
        }
    }
    client.post("/api/v1/auth/register", json=student_payload)

    # 2. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "senior.student@university.edu",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Run Gap Analysis
    res = client.post("/api/v1/skills/gap-analysis", json={"target_role": "Fullstack Developer"}, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["readiness_score"] == 100.0
    assert len(data["missing_required_skills"]) == 0

    # 4. Check readiness endpoint
    readiness_res = client.get("/api/v1/skills/readiness", headers=headers)
    assert readiness_res.status_code == 200
    assert readiness_res.json()["readiness_score"] == 100.0
