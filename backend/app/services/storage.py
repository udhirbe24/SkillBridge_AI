import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status

UPLOAD_DIR = Path("storage/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit

def validate_and_save_resume_file(file: UploadFile, user_id: str) -> tuple[str, int]:
    """
    Validates PDF file headers (magic bytes), size limits, and saves to storage directory.
    Returns (saved_file_path, file_size).
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF resumes are accepted."
        )

    # Read content to check magic bytes and size
    content = file.file.read()
    file_size = len(content)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum limit of 10MB (Received: {file_size / (1024*1024):.2f}MB)."
        )

    # Validate PDF Magic Bytes (%PDF-)
    if not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Corrupted file or invalid PDF header."
        )

    # Save to storage with unique filename
    unique_filename = f"{user_id}_{uuid.uuid4().hex[:8]}.pdf"
    file_path = UPLOAD_DIR / unique_filename

    with open(file_path, "wb") as f:
        f.write(content)

    # Reset file cursor position
    file.file.seek(0)
    return str(file_path), file_size
