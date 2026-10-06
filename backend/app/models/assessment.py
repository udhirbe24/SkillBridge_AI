import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    difficulty = Column(String(50), nullable=False, default="medium")  # easy, medium, hard
    category = Column(String(100), nullable=False, default="Algorithms")
    skill_tag = Column(String(100), nullable=False, default="Python")
    description = Column(Text, nullable=False)
    starter_code = Column(Text, nullable=False)
    solution_code = Column(Text, nullable=True)
    test_cases = Column(JSON, default=list, nullable=False) # List of {"input": ..., "expected": ...}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    submissions = relationship("AssessmentSubmission", back_populates="question", cascade="all, delete-orphan")

class AssessmentSubmission(Base):
    __tablename__ = "assessment_submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String(36), ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False)
    code = Column(Text, nullable=False)
    language = Column(String(50), nullable=False, default="python")
    status = Column(String(50), nullable=False, default="passed")  # passed, failed, error
    score = Column(Float, nullable=False, default=0.0)  # 0.0 - 100.0
    passed_test_cases = Column(Integer, nullable=False, default=0)
    total_test_cases = Column(Integer, nullable=False, default=0)
    execution_time_ms = Column(Float, nullable=False, default=0.0)
    output_logs = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="assessment_submissions")
    question = relationship("AssessmentQuestion", back_populates="submissions")
