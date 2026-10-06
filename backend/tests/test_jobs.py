import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.job_engine import calculate_job_match

client = TestClient(app)

def test_job_matching_unit():
    user_skills = ["Python", "FastAPI", "PostgreSQL", "Git"]
    req_skills = ["Python", "FastAPI", "PostgreSQL", "Git"]
    opt_skills = ["Docker", "Redis"]

    match_res = calculate_job_match(user_skills, req_skills, opt_skills)
    assert match_res["match_score"] == 85.0 # 100% required (85) + 0% optional (0)
    assert "Python" in match_res["explanation"]["matching_skills"]
    assert "Docker" in match_res["explanation"]["missing_optional_skills"]

def test_job_postings_and_recommendations_flow():
    # 1. Register candidate student
    student_payload = {
        "email": "job.seeker@university.edu",
        "password": "Password123!",
        "full_name": "Job Seeker Candidate",
        "role": "STUDENT",
        "student_profile": {
            "headline": "Backend Dev Student",
            "skills": ["Python", "FastAPI", "PostgreSQL", "Git"]
        }
    }
    client.post("/api/v1/auth/register", json=student_payload)

    login_res = client.post("/api/v1/auth/login", json={
        "email": "job.seeker@university.edu",
        "password": "Password123!"
    })
    candidate_token = login_res.json()["access_token"]
    cand_headers = {"Authorization": f"Bearer {candidate_token}"}

    # 2. List public job postings
    list_res = client.get("/api/v1/jobs")
    assert list_res.status_code == 200
    jobs = list_res.json()
    assert len(jobs) >= 3

    # 3. Get candidate recommendations
    rec_res = client.get("/api/v1/jobs/recommendations", headers=cand_headers)
    assert rec_res.status_code == 200
    recommendations = rec_res.json()
    assert len(recommendations) >= 3
    # Top recommendation should have high match score
    top_rec = recommendations[0]
    assert top_rec["match_score"] >= 80.0
    assert "explanation" in top_rec["explanation"]

    # 4. Register recruiter
    recruiter_payload = {
        "email": "hiring.manager@techcorp.com",
        "password": "RecruiterPass123!",
        "full_name": "Hiring Manager",
        "role": "RECRUITER",
        "recruiter_profile": {
            "company_name": "TechCorp Innovations"
        }
    }
    reg_res = client.post("/api/v1/auth/register", json=recruiter_payload)
    assert reg_res.status_code == 201


    r_login = client.post("/api/v1/auth/login", json={
        "email": "hiring.manager@techcorp.com",
        "password": "RecruiterPass123!"
    })
    recruiter_token = r_login.json()["access_token"]
    rec_headers = {"Authorization": f"Bearer {recruiter_token}"}

    # 5. Create new job posting as recruiter
    create_job_payload = {
        "title": "Lead DevOps & Cloud Engineer",
        "company_name": "TechCorp Innovations",
        "location": "Remote",
        "job_type": "full_time",
        "experience_level": "senior",
        "required_skills": ["Docker", "Kubernetes", "AWS", "CI/CD"],
        "optional_skills": ["Terraform", "Python"],
        "description": "Lead multi-cloud infrastructure and automated Kubernetes deployment pipelines.",
        "salary_range": "$150,000 - $180,000"
    }
    create_res = client.post("/api/v1/jobs", json=create_job_payload, headers=rec_headers)
    assert create_res.status_code == 201
    created_job = create_res.json()
    assert created_job["title"] == "Lead DevOps & Cloud Engineer"
    job_id = created_job["id"]

    # 6. Update job posting
    update_res = client.put(f"/api/v1/jobs/{job_id}", json={"location": "Hybrid (Austin, TX)"}, headers=rec_headers)
    assert update_res.status_code == 200
    assert update_res.json()["location"] == "Hybrid (Austin, TX)"

    # 7. Delete job posting
    delete_res = client.delete(f"/api/v1/jobs/{job_id}", headers=rec_headers)
    assert delete_res.status_code == 204
