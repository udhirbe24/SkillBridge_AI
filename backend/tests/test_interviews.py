import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_mock_interview_full_flow():
    # 1. Register student
    student_payload = {
        "email": "interview.candidate@university.edu",
        "password": "Password123!",
        "full_name": "Interview Candidate",
        "role": "STUDENT"
    }
    client.post("/api/v1/auth/register", json=student_payload)

    # 2. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "interview.candidate@university.edu",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Start mock interview
    start_payload = {
        "target_role": "Backend Engineer",
        "difficulty": "mid",
        "total_questions": 3
    }
    start_res = client.post("/api/v1/interviews/start", json=start_payload, headers=headers)
    assert start_res.status_code == 201
    session = start_res.json()
    assert session["target_role"] == "Backend Engineer"
    assert session["status"] == "in_progress"
    assert len(session["exchanges"]) == 3

    session_id = session["id"]

    # 4. Get interview session detail
    get_res = client.get(f"/api/v1/interviews/{session_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == session_id

    # 5. Respond to Question 1
    resp1 = client.post(
        f"/api/v1/interviews/{session_id}/respond",
        json={"response_text": "In high-concurrency FastAPI applications, we configure SQLAlchemy connection pool size to 20 with max overflow 10, using async engine handlers to prevent blocking main event loop threads."},
        headers=headers
    )
    assert resp1.status_code == 200
    r1_data = resp1.json()
    assert r1_data["is_completed"] == False
    assert r1_data["current_exchange"]["score"] >= 70.0
    assert r1_data["next_question"]["question_number"] == 2

    # 6. Respond to Question 2
    resp2 = client.post(
        f"/api/v1/interviews/{session_id}/respond",
        json={"response_text": "We implement Redis caching for GET query endpoints with TTL of 300 seconds and eviction policies, using distributed lock keys to prevent cache stampedes under heavy traffic loads."},
        headers=headers
    )
    assert resp2.status_code == 200
    r2_data = resp2.json()
    assert r2_data["is_completed"] == False
    assert r2_data["next_question"]["question_number"] == 3

    # 7. Respond to Question 3 (Final question)
    resp3 = client.post(
        f"/api/v1/interviews/{session_id}/respond",
        json={"response_text": "When facing a high-concurrency database connection bottleneck during flash sales, I identified unindexed queries, added composite index keys, tuned connection pool parameters, and achieved a 65% reduction in API p99 latency."},
        headers=headers
    )
    assert resp3.status_code == 200
    r3_data = resp3.json()
    assert r3_data["is_completed"] == True
    assert r3_data["overall_score"] > 70.0
    assert r3_data["summary_feedback"] is not None

    # 8. Check interview history
    history_res = client.get("/api/v1/interviews/", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 1
    assert history[0]["status"] == "completed"

    # 9. Check analytics
    analytics_res = client.get("/api/v1/interviews/analytics", headers=headers)
    assert analytics_res.status_code == 200
    analytics = analytics_res.json()
    assert analytics["completed_interviews"] >= 1
    assert analytics["average_score"] > 70.0
