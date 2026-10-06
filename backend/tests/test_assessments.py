import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.assessment_engine import evaluate_code_submission

client = TestClient(app)

def test_evaluation_engine_unit():
    test_cases = [
        {"input": {"nums": [2, 7, 11, 15], "target": 9}, "expected": [0, 1]},
        {"input": {"nums": [3, 2, 4], "target": 6}, "expected": [1, 2]}
    ]

    passing_code = """
def solution(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
"""
    result = evaluate_code_submission(passing_code, test_cases)
    assert result["status"] == "passed"
    assert result["score"] == 100.0
    assert result["passed_test_cases"] == 2

    failing_code = """
def solution(nums, target):
    return [0, 0]
"""
    fail_result = evaluate_code_submission(failing_code, test_cases)
    assert fail_result["status"] == "failed"
    assert fail_result["score"] == 0.0

def test_assessment_questions_and_submission_api():
    # 1. Register student
    student_payload = {
        "email": "coding.student@university.edu",
        "password": "Password123!",
        "full_name": "Coding Test Student",
        "role": "STUDENT"
    }
    client.post("/api/v1/auth/register", json=student_payload)

    # 2. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "coding.student@university.edu",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. List questions
    list_res = client.get("/api/v1/assessments", headers=headers)
    assert list_res.status_code == 200
    questions = list_res.json()
    assert len(questions) >= 3

    two_sum_q = next(q for q in questions if "Two Sum" in q["title"])
    question_id = two_sum_q["id"]

    # 4. Get question details
    detail_res = client.get(f"/api/v1/assessments/{question_id}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["title"] == two_sum_q["title"]
    assert "def solution" in detail["starter_code"]

    # 5. Submit passing solution
    passing_solution = """
def solution(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
"""
    sub_res = client.post(
        f"/api/v1/assessments/{question_id}/submit",
        json={"code": passing_solution, "language": "python"},
        headers=headers
    )
    assert sub_res.status_code == 201
    sub_data = sub_res.json()
    assert sub_data["status"] == "passed"
    assert sub_data["score"] == 100.0

    # 6. Check submission history
    history_res = client.get("/api/v1/assessments/submissions", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 1
    assert history[0]["status"] == "passed"

    # 7. Check analytics
    analytics_res = client.get("/api/v1/assessments/analytics", headers=headers)
    assert analytics_res.status_code == 200
    analytics = analytics_res.json()
    assert analytics["total_attempted"] >= 1
    assert analytics["total_passed"] >= 1
    assert analytics["pass_rate"] == 100.0
    assert analytics["average_score"] == 100.0
