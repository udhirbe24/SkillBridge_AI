import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_dashboard_summary_and_readiness_flow():
    # 1. Register candidate student
    student_payload = {
        "email": "dash.student@university.edu",
        "password": "Password123!",
        "full_name": "Dashboard Test Student",
        "role": "STUDENT",
        "student_profile": {
            "headline": "Junior Dev",
            "target_role": "Backend Engineer",
            "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "SQL"]
        }
    }
    client.post("/api/v1/auth/register", json=student_payload)

    # 2. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "dash.student@university.edu",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Run Skill Gap Analysis (100% match for Backend Engineer)
    client.post("/api/v1/skills/gap-analysis", json={"target_role": "Backend Engineer"}, headers=headers)

    # 4. Complete a Coding Assessment
    ass_list = client.get("/api/v1/assessments", headers=headers).json()
    q_id = ass_list[0]["id"]
    passing_code = "def solution(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n"
    client.post(f"/api/v1/assessments/{q_id}/submit", json={"code": passing_code}, headers=headers)

    # 5. Fetch Dashboard Summary
    dash_res = client.get("/api/v1/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash = dash_res.json()

    assert dash["target_role"] == "Backend Engineer"
    assert dash["career_readiness_score"] > 0.0
    assert dash["breakdown"]["skill_gap_score"] == 85.0
    assert dash["breakdown"]["assessment_score"] == 100.0
    assert dash["next_action"]["title"] is not None

    # 6. Fetch Readiness Breakdown
    read_res = client.get("/api/v1/dashboard/readiness", headers=headers)
    assert read_res.status_code == 200
    r_data = read_res.json()
    assert r_data["skill_gap_score"] == 85.0


    # 7. Fetch Next Action
    action_res = client.get("/api/v1/dashboard/next-action", headers=headers)
    assert action_res.status_code == 200
    assert "title" in action_res.json()
