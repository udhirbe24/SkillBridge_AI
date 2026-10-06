from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.user import User
from app.models.assessment import AssessmentQuestion, AssessmentSubmission
from app.schemas.assessment import (
    AssessmentQuestionListItem,
    AssessmentQuestionDetail,
    AssessmentSubmitRequest,
    AssessmentSubmissionResponse,
    AssessmentAnalyticsResponse
)
from app.services.assessment_engine import seed_assessment_questions_if_empty, evaluate_code_submission
from app.api.v1.auth import get_current_active_user

router = APIRouter(prefix="/assessments", tags=["Coding Assessments & Evaluation"])

@router.get("", response_model=List[AssessmentQuestionListItem])
def list_assessment_questions(
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: easy, medium, hard"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """
    Lists available coding assessment questions with optional filtering.
    """
    seed_assessment_questions_if_empty(db)
    query = db.query(AssessmentQuestion)
    if difficulty:
        query = query.filter(AssessmentQuestion.difficulty.ilike(difficulty))
    if category:
        query = query.filter(AssessmentQuestion.category.ilike(category))

    questions = query.all()
    return [
        AssessmentQuestionListItem(
            id=q.id,
            title=q.title,
            difficulty=q.difficulty,
            category=q.category,
            skill_tag=q.skill_tag,
            created_at=q.created_at.isoformat()
        )
        for q in questions
    ]

@router.get("/submissions", response_model=List[AssessmentSubmissionResponse])
def get_user_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves submission history for the logged in user.
    """
    submissions = db.query(AssessmentSubmission)\
        .filter(AssessmentSubmission.user_id == current_user.id)\
        .order_by(AssessmentSubmission.created_at.desc())\
        .all()

    return [
        AssessmentSubmissionResponse(
            id=s.id,
            question_id=s.question_id,
            status=s.status,
            score=s.score,
            passed_test_cases=s.passed_test_cases,
            total_test_cases=s.total_test_cases,
            execution_time_ms=s.execution_time_ms,
            output_logs=s.output_logs,
            created_at=s.created_at.isoformat()
        )
        for s in submissions
    ]

@router.get("/analytics", response_model=AssessmentAnalyticsResponse)
def get_assessment_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Computes coding performance analytics for the logged in student.
    """
    submissions = db.query(AssessmentSubmission).filter(AssessmentSubmission.user_id == current_user.id).all()
    
    total_attempted = len(submissions)
    if total_attempted == 0:
        return AssessmentAnalyticsResponse(
            total_attempted=0,
            total_passed=0,
            pass_rate=0.0,
            average_score=0.0,
            breakdown_by_difficulty={"easy": 0, "medium": 0, "hard": 0}
        )

    total_passed = sum(1 for s in submissions if s.status == "passed")
    pass_rate = round((total_passed / total_attempted) * 100, 1)
    average_score = round(sum(s.score for s in submissions) / total_attempted, 1)

    breakdown = {"easy": 0, "medium": 0, "hard": 0}
    for s in submissions:
        if s.question and s.question.difficulty in breakdown:
            breakdown[s.question.difficulty] += 1

    return AssessmentAnalyticsResponse(
        total_attempted=total_attempted,
        total_passed=total_passed,
        pass_rate=pass_rate,
        average_score=average_score,
        breakdown_by_difficulty=breakdown
    )

@router.get("/{question_id}", response_model=AssessmentQuestionDetail)
def get_question_detail(
    question_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves full details and starter code for a specific coding question.
    """
    seed_assessment_questions_if_empty(db)
    question = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment question not found"
        )

    return AssessmentQuestionDetail(
        id=question.id,
        title=question.title,
        difficulty=question.difficulty,
        category=question.category,
        skill_tag=question.skill_tag,
        description=question.description,
        starter_code=question.starter_code,
        test_cases_count=len(question.test_cases or []),
        created_at=question.created_at.isoformat()
    )

@router.post("/{question_id}/submit", response_model=AssessmentSubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_question_solution(
    question_id: str,
    payload: AssessmentSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Evaluates submitted solution code against question test cases and records submission metrics.
    """
    seed_assessment_questions_if_empty(db)
    question = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment question not found"
        )

    # Evaluate code
    eval_result = evaluate_code_submission(
        code=payload.code,
        test_cases=question.test_cases
    )

    submission = AssessmentSubmission(
        user_id=current_user.id,
        question_id=question.id,
        code=payload.code,
        language=payload.language,
        status=eval_result["status"],
        score=eval_result["score"],
        passed_test_cases=eval_result["passed_test_cases"],
        total_test_cases=eval_result["total_test_cases"],
        execution_time_ms=eval_result["execution_time_ms"],
        output_logs=eval_result["output_logs"]
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return AssessmentSubmissionResponse(
        id=submission.id,
        question_id=submission.question_id,
        status=submission.status,
        score=submission.score,
        passed_test_cases=submission.passed_test_cases,
        total_test_cases=submission.total_test_cases,
        execution_time_ms=submission.execution_time_ms,
        output_logs=submission.output_logs,
        created_at=submission.created_at.isoformat()
    )
