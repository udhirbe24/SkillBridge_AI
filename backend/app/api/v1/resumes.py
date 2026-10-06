from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, StudentProfile, UserRole, AuditLog
from app.models.resume import ResumeDocument, IngestionStatus
from app.schemas.resume import ResumeDocumentResponse
from app.api.deps import get_current_active_user, RoleChecker
from app.services.storage import validate_and_save_resume_file
from app.services.resume_parser import extract_text_from_pdf, parse_resume_text

router = APIRouter(prefix="/resumes", tags=["Resume Ingestion & Parsing"])

@router.post("/upload", response_model=ResumeDocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Uploads candidate PDF resume, parses raw text, extracts skill taxonomy, and syncs student profile.
    """
    # 1. Validate and save raw file to storage
    file_path, file_size = validate_and_save_resume_file(file, current_user.id)

    # 2. Extract raw text from saved PDF
    raw_text = extract_text_from_pdf(file_path)

    # 3. Parse skill taxonomy & metrics from text
    parsed_info = parse_resume_text(raw_text)

    # 4. Create ResumeDocument database record
    resume_doc = ResumeDocument(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_size=file_size,
        mime_type="application/pdf",
        raw_text=raw_text,
        parsed_data=parsed_info,
        status=IngestionStatus.COMPLETED
    )
    db.add(resume_doc)
    db.flush()

    # 5. Sync extracted skills & resume URL with StudentProfile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if profile:
        # Merge existing skills with newly extracted skills
        existing_skills = set(profile.skills or [])
        new_skills = set(parsed_info.get("skills", []))
        profile.skills = sorted(list(existing_skills.union(new_skills)))
        profile.resume_url = file_path

    # 6. Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="RESUME_UPLOADED",
        resource=f"resume:{resume_doc.id}",
        details={"skills_extracted": parsed_info.get("total_skills_count", 0)}
    )
    db.add(audit)

    db.commit()
    db.refresh(resume_doc)
    return resume_doc

@router.get("/me", response_model=ResumeDocumentResponse)
def get_my_resume(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the latest uploaded resume document for the current authenticated user.
    """
    resume = db.query(ResumeDocument)\
        .filter(ResumeDocument.user_id == current_user.id)\
        .order_by(ResumeDocument.created_at.desc())\
        .first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume document found for current user."
        )

    return resume

@router.get("/{resume_id}", response_model=ResumeDocumentResponse)
def get_resume_by_id(
    resume_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves specific resume document by ID (Owner or Recruiter/Admin allowed).
    """
    resume = db.query(ResumeDocument).filter(ResumeDocument.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume document not found."
        )

    if resume.user_id != current_user.id and current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN, UserRole.EVALUATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this resume document."
        )

    return resume
