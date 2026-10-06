import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_role = Column(String(255), nullable=False)
    difficulty = Column(String(50), nullable=False, default="mid")  # junior, mid, senior
    status = Column(String(50), nullable=False, default="in_progress")  # in_progress, completed
    total_questions = Column(Integer, nullable=False, default=3)
    current_question_number = Column(Integer, nullable=False, default=1)
    overall_score = Column(Float, nullable=True, default=0.0)
    summary_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", backref="interview_sessions")
    exchanges = relationship("InterviewExchange", back_populates="session", cascade="all, delete-orphan")

class InterviewExchange(Base):
    __tablename__ = "interview_exchanges"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    question_number = Column(Integer, nullable=False)
    category = Column(String(100), nullable=False, default="Technical Architecture")
    question_text = Column(Text, nullable=False)
    user_response = Column(Text, nullable=True)
    score = Column(Float, nullable=True, default=0.0)  # 0.0 - 100.0
    feedback = Column(Text, nullable=True)
    key_improvements = Column(JSON, default=list, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    session = relationship("InterviewSession", back_populates="exchanges")
