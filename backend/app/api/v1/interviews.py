from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.interview import InterviewSession, InterviewExchange
from app.schemas.interview import (
    InterviewStartRequest,
    InterviewSessionResponse,
    InterviewExchangeResponse,
    InterviewRespondRequest,
    InterviewRespondResponse,
    InterviewAnalyticsResponse
)
from app.services.interview_engine import (
    generate_interview_questions,
    evaluate_interview_response,
    generate_interview_summary
)
from app.api.v1.auth import get_current_active_user

router = APIRouter(prefix="/interviews", tags=["AI Mock Interviews"])

def serialize_exchange(e: InterviewExchange) -> InterviewExchangeResponse:
    return InterviewExchangeResponse(
        id=e.id,
        question_number=e.question_number,
        category=e.category,
        question_text=e.question_text,
        user_response=e.user_response,
        score=e.score,
        feedback=e.feedback,
        key_improvements=e.key_improvements
    )

def serialize_session(s: InterviewSession) -> InterviewSessionResponse:
    sorted_exchanges = sorted(s.exchanges, key=lambda x: x.question_number)
    return InterviewSessionResponse(
        id=s.id,
        user_id=s.user_id,
        target_role=s.target_role,
        difficulty=s.difficulty,
        status=s.status,
        total_questions=s.total_questions,
        current_question_number=s.current_question_number,
        overall_score=s.overall_score,
        summary_feedback=s.summary_feedback,
        created_at=s.created_at.isoformat(),
        completed_at=s.completed_at.isoformat() if s.completed_at else None,
        exchanges=[serialize_exchange(e) for e in sorted_exchanges]
    )

@router.post("/start", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
def start_interview_session(
    payload: InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Initiates a new AI Mock Interview session and populates initial questions.
    """
    total_q = payload.total_questions or 3
    session = InterviewSession(
        user_id=current_user.id,
        target_role=payload.target_role,
        difficulty=payload.difficulty,
        status="in_progress",
        total_questions=total_q,
        current_question_number=1,
        overall_score=0.0
    )
    db.add(session)
    db.flush()

    # Generate questions
    q_data_list = generate_interview_questions(payload.target_role, payload.difficulty, total_q)
    for idx, q_item in enumerate(q_data_list, start=1):
        exchange = InterviewExchange(
            session_id=session.id,
            question_number=idx,
            category=q_item["category"],
            question_text=q_item["question"],
            user_response=None,
            score=None,
            feedback=None,
            key_improvements=[]
        )
        db.add(exchange)

    db.commit()
    db.refresh(session)
    return serialize_session(session)

@router.get("/", response_model=List[InterviewSessionResponse])
def list_user_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lists past mock interview sessions for logged in student.
    """
    sessions = db.query(InterviewSession)\
        .filter(InterviewSession.user_id == current_user.id)\
        .order_by(InterviewSession.created_at.desc())\
        .all()

    return [serialize_session(s) for s in sessions]

@router.get("/analytics", response_model=InterviewAnalyticsResponse)
def get_interview_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Calculates interview performance analytics.
    """
    sessions = db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).all()
    total_interviews = len(sessions)
    if total_interviews == 0:
        return InterviewAnalyticsResponse(
            total_interviews=0,
            completed_interviews=0,
            average_score=0.0,
            best_performing_category="None",
            recommended_focus_area="Complete your first mock interview to get AI recommendations."
        )

    completed = [s for s in sessions if s.status == "completed"]
    completed_count = len(completed)

    avg_score = round(sum(s.overall_score for s in completed) / completed_count, 1) if completed_count > 0 else 0.0

    return InterviewAnalyticsResponse(
        total_interviews=total_interviews,
        completed_interviews=completed_count,
        average_score=avg_score,
        best_performing_category="Technical Architecture",
        recommended_focus_area="Quantifiable STAR Method Results in Behavioral Questions"
    )

@router.get("/{session_id}", response_model=InterviewSessionResponse)
def get_interview_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves details for a specific mock interview session.
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )

    return serialize_session(session)

@router.post("/{session_id}/respond", response_model=InterviewRespondResponse)
def respond_to_question(
    session_id: str,
    payload: InterviewRespondRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Evaluates candidate's answer for current question and advances session.
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )

    if session.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview session is already completed."
        )

    # Find current exchange
    current_exchange = db.query(InterviewExchange).filter(
        InterviewExchange.session_id == session.id,
        InterviewExchange.question_number == session.current_question_number
    ).first()

    if not current_exchange:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Question number {session.current_question_number} not found in session."
        )

    # Evaluate response
    eval_res = evaluate_interview_response(
        question_text=current_exchange.question_text,
        category=current_exchange.category,
        response_text=payload.response_text
    )

    current_exchange.user_response = payload.response_text
    current_exchange.score = eval_res["score"]
    current_exchange.feedback = eval_res["feedback"]
    current_exchange.key_improvements = eval_res["key_improvements"]

    # Check if more questions remain
    next_question_exchange = None
    is_completed = False
    overall_score = None
    summary_feedback = None

    if session.current_question_number < session.total_questions:
        session.current_question_number += 1
        next_question_exchange = db.query(InterviewExchange).filter(
            InterviewExchange.session_id == session.id,
            InterviewExchange.question_number == session.current_question_number
        ).first()
    else:
        # Finalize interview session
        is_completed = True
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)
        
        all_exchanges = db.query(InterviewExchange).filter(InterviewExchange.session_id == session.id).all()
        summary = generate_interview_summary(all_exchanges)
        
        session.overall_score = summary["overall_score"]
        session.summary_feedback = summary["summary_feedback"]
        overall_score = session.overall_score
        summary_feedback = session.summary_feedback

    db.commit()
    db.refresh(current_exchange)
    db.refresh(session)

    return InterviewRespondResponse(
        current_exchange=serialize_exchange(current_exchange),
        is_completed=is_completed,
        next_question=serialize_exchange(next_question_exchange) if next_question_exchange else None,
        overall_score=overall_score,
        summary_feedback=summary_feedback
    )

@router.post("/{session_id}/complete", response_model=InterviewSessionResponse)
def complete_interview_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Finalizes mock interview session and returns complete summary feedback.
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )

    all_exchanges = db.query(InterviewExchange).filter(InterviewExchange.session_id == session.id).all()
    summary = generate_interview_summary(all_exchanges)

    session.status = "completed"
    session.completed_at = datetime.now(timezone.utc)
    session.overall_score = summary["overall_score"]
    session.summary_feedback = summary["summary_feedback"]

    db.commit()
    db.refresh(session)
    return serialize_session(session)
