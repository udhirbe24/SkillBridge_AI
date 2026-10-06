import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_generate_and_track_roadmap():
    # 1. Register and login student
    student_payload = {
        "email": "roadmap.student@university.edu",
        "password": "Password123!",
        "full_name": "Roadmap Test Student",
        "role": "STUDENT",
        "student_profile": {
            "headline": "Junior Dev",
            "target_role": "Backend Engineer",
            "skills": ["Python", "FastAPI"]
        }
    }
    client.post("/api/v1/auth/register", json=student_payload)

    login_res = client.post("/api/v1/auth/login", json={
        "email": "roadmap.student@university.edu",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Generate roadmap for Backend Engineer
    gen_payload = {
        "target_role": "Backend Engineer",
        "target_months": 3
    }
    gen_res = client.post("/api/v1/roadmaps/generate", json=gen_payload, headers=headers)
    assert gen_res.status_code == 201
    roadmap = gen_res.json()
    assert roadmap["target_role"] == "Backend Engineer"
    assert len(roadmap["items"]) > 0
    assert roadmap["total_estimated_hours"] > 0

    first_item = roadmap["items"][0]
    roadmap_id = roadmap["id"]
    item_id = first_item["id"]

    # 3. List roadmaps for user
    list_res = client.get("/api/v1/roadmaps/", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 4. Get specific roadmap
    get_res = client.get(f"/api/v1/roadmaps/{roadmap_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == roadmap_id

    # 5. Update item status to completed
    update_res = client.patch(
        f"/api/v1/roadmaps/{roadmap_id}/items/{item_id}",
        json={"status": "completed"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "completed"
