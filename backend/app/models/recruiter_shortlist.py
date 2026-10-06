import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class RecruiterShortlist(Base):
    __tablename__ = "recruiter_shortlists"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    recruiter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    recruiter = relationship("User", foreign_keys=[recruiter_id], backref="shortlisted_candidates")
    student = relationship("User", foreign_keys=[student_id])
