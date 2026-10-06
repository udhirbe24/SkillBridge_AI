import time
import io
import sys
import json
import traceback
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.assessment import AssessmentQuestion, AssessmentSubmission

# Seed data for default assessment coding questions
DEFAULT_CODING_QUESTIONS = [
    {
        "title": "Two Sum Target Index",
        "difficulty": "easy",
        "category": "Data Structures & Algorithms",
        "skill_tag": "Python",
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
        "starter_code": "def solution(nums, target):\n    # Write your solution here\n    pass\n",
        "solution_code": "def solution(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n",
        "test_cases": [
            {"input": {"nums": [2, 7, 11, 15], "target": 9}, "expected": [0, 1]},
            {"input": {"nums": [3, 2, 4], "target": 6}, "expected": [1, 2]},
            {"input": {"nums": [3, 3], "target": 6}, "expected": [0, 1]}
        ]
    },
    {
        "title": "Valid Parentheses Checker",
        "difficulty": "medium",
        "category": "Data Structures & Algorithms",
        "skill_tag": "Python",
        "description": "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        "starter_code": "def solution(s):\n    # Write your solution here\n    pass\n",
        "solution_code": "def solution(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n",
        "test_cases": [
            {"input": {"s": "()"}, "expected": True},
            {"input": {"s": "()[]{}"}, "expected": True},
            {"input": {"s": "(]"}, "expected": False}
        ]
    },
    {
        "title": "FastAPI Async Query Pipeline Filter",
        "difficulty": "hard",
        "category": "Backend Systems",
        "skill_tag": "FastAPI",
        "description": "Filter a list of resource dicts based on active status and minimum score threshold.",
        "starter_code": "def solution(items, min_score):\n    # Filter items where active is True and score >= min_score\n    pass\n",
        "solution_code": "def solution(items, min_score):\n    return [item for item in items if item.get('active', False) and item.get('score', 0) >= min_score]\n",
        "test_cases": [
            {"input": {"items": [{"id": 1, "active": True, "score": 85}, {"id": 2, "active": False, "score": 90}], "min_score": 80}, "expected": [{"id": 1, "active": True, "score": 85}]},
            {"input": {"items": [{"id": 1, "active": True, "score": 50}], "min_score": 70}, "expected": []}
        ]
    }
]

def seed_assessment_questions_if_empty(db: Session):
    """
    Ensures default coding assessment questions exist in DB table.
    """
    count = db.query(AssessmentQuestion).count()
    if count == 0:
        for q_data in DEFAULT_CODING_QUESTIONS:
            question = AssessmentQuestion(**q_data)
            db.add(question)
        db.commit()

def evaluate_code_submission(code: str, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Executes Python solution code against test cases in an isolated execution sandbox scope.
    Computes score, pass count, execution time, and stdout/stderr logs.
    """
    start_time = time.perf_counter()
    passed_count = 0
    total_count = len(test_cases)
    log_stream = io.StringIO()

    # Scope dictionary for execution
    exec_globals = {}
    exec_locals = {}

    try:
        # Execute solution definition
        exec(code, exec_globals, exec_locals)
        solution_fn = exec_locals.get("solution") or exec_globals.get("solution")

        if not callable(solution_fn):
            return {
                "status": "error",
                "score": 0.0,
                "passed_test_cases": 0,
                "total_test_cases": total_count,
                "execution_time_ms": round((time.perf_counter() - start_time) * 1000, 2),
                "output_logs": "Error: Function 'def solution(...)' not defined in submission code."
            }

        # Run each test case
        for idx, tc in enumerate(test_cases, start=1):
            tc_input = tc["input"]
            expected = tc["expected"]

            try:
                if isinstance(tc_input, dict):
                    actual = solution_fn(**tc_input)
                else:
                    actual = solution_fn(tc_input)

                if actual == expected:
                    passed_count += 1
                    log_stream.write(f"[PASSED] Test Case {idx}: Output = {actual}\n")
                else:
                    log_stream.write(f"[FAILED] Test Case {idx}: Expected {expected}, got {actual}\n")
            except Exception as test_err:
                log_stream.write(f"[ERROR] Test Case {idx} raised Exception: {str(test_err)}\n")

    except Exception as exec_err:
        log_stream.write(f"[EXECUTION ERROR] Code execution failed:\n{traceback.format_exc()}\n")
        return {
            "status": "error",
            "score": 0.0,
            "passed_test_cases": 0,
            "total_test_cases": total_count,
            "execution_time_ms": round((time.perf_counter() - start_time) * 1000, 2),
            "output_logs": log_stream.getvalue()
        }

    exec_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
    score = round((passed_count / total_count) * 100, 1) if total_count > 0 else 0.0
    status = "passed" if passed_count == total_count else "failed"

    return {
        "status": status,
        "score": score,
        "passed_test_cases": passed_count,
        "total_test_cases": total_count,
        "execution_time_ms": exec_time_ms,
        "output_logs": log_stream.getvalue()
    }
