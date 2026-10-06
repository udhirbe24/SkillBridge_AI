import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_recruiter_portal_flow():
    # 1. Register Student Candidate
    cand_payload = {
        "email": "cand.rec@university.edu",
        "password": "Password123!",
        "full_name": "Candidate Student",
        "role": "STUDENT",
        "student_profile": {
            "headline": "Fullstack Student",
            "target_role": "Fullstack Developer",
            "skills": ["Python", "React"]
        }
    }
    cand_reg = client.post("/api/v1/auth/register", json=cand_payload)
    assert cand_reg.status_code == 201
    student_id = cand_reg.json()["id"]

    # 2. Register Recruiter
    rec_payload = {
        "email": "rec.portal@techcorp.com",
        "password": "Password123!",
        "full_name": "Portal Recruiter",
        "role": "RECRUITER",
        "recruiter_profile": {
            "company_name": "TechCorp Innovations"
        }
    }
    rec_reg = client.post("/api/v1/auth/register", json=rec_payload)
    assert rec_reg.status_code == 201

    r_login = client.post("/api/v1/auth/login", json={
        "email": "rec.portal@techcorp.com",
        "password": "Password123!"
    })
    rec_token = r_login.json()["access_token"]
    rec_headers = {"Authorization": f"Bearer {rec_token}"}

    # 3. Recruiter searches candidates
    search_res = client.get("/api/v1/recruiter/candidates?target_role=Fullstack", headers=rec_headers)
    assert search_res.status_code == 200
    candidates = search_res.json()
    assert len(candidates) >= 1
    assert any(c["id"] == student_id for c in candidates)

    # 4. Recruiter gets candidate detail
    detail_res = client.get(f"/api/v1/recruiter/candidates/{student_id}", headers=rec_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == student_id

    # 5. Recruiter shortlists candidate
    short_payload = {
        "student_id": student_id,
        "notes": "Excellent skills match for summer internship."
    }
    short_res = client.post("/api/v1/recruiter/shortlist", json=short_payload, headers=rec_headers)
    assert short_res.status_code == 201
    short_data = short_res.json()
    assert short_data["student"]["id"] == student_id
    shortlist_id = short_data["id"]

    # 6. Recruiter lists shortlist
    list_short = client.get("/api/v1/recruiter/shortlist", headers=rec_headers)
    assert list_short.status_code == 200
    assert len(list_short.json()) >= 1

    # 7. Recruiter removes candidate from shortlist
    del_short = client.delete(f"/api/v1/recruiter/shortlist/{shortlist_id}", headers=rec_headers)
    assert del_short.status_code == 204

def test_admin_control_panel_flow():
    # 1. Register Admin User
    admin_payload = {
        "email": "admin.system@skillbridge.ai",
        "password": "AdminSecurePassword123!",
        "full_name": "System Administrator",
        "role": "ADMIN"
    }
    client.post("/api/v1/auth/register", json=admin_payload)

    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin.system@skillbridge.ai",
        "password": "AdminSecurePassword123!"
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Admin lists all users
    users_res = client.get("/api/v1/admin/users", headers=admin_headers)
    assert users_res.status_code == 200
    users = users_res.json()
    assert len(users) >= 2

    test_target_id = users[0]["id"]

    # 3. Admin gets user details by ID
    get_u = client.get(f"/api/v1/admin/users/{test_target_id}", headers=admin_headers)
    assert get_u.status_code == 200
    assert get_u.json()["id"] == test_target_id

    # 4. Admin updates user status (deactivate / reactivate)
    patch_u = client.patch(f"/api/v1/admin/users/{test_target_id}", json={"is_active": True}, headers=admin_headers)
    assert patch_u.status_code == 200
    assert patch_u.json()["is_active"] == True

    # 5. Admin views audit logs
    audit_res = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    assert len(audit_res.json()) >= 1

    # 6. Admin views system stats
    stats_res = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_users"] >= 2
    assert stats["total_students"] >= 1
