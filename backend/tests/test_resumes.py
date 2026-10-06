import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_synthetic_pdf_bytes(text_content: str) -> bytes:
    """
    Creates valid minimal PDF binary stream with embedded text for testing.
    """
    pdf_header = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    pdf_body = f"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length {len(text_content)} >>\nstream\n{text_content}\nendstream\nendobj\n".encode("latin-1")
    pdf_footer = b"trailer\n<< /Root 1 0 R >>\n%%EOF"
    return pdf_header + pdf_body + pdf_footer

def test_upload_valid_resume_pdf():
    # 1. Register student
    student_payload = {
        "email": "resume.student@university.edu",
        "password": "Password123!",
        "full_name": "Resume Test Student",
        "role": "STUDENT"
    }
    client.post("/api/v1/auth/register", json=student_payload)

    # 2. Login to get token
    login_res = client.post("/api/v1/auth/login", json={
        "email": "resume.student@university.edu",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]

    # 3. Create synthetic PDF content containing tech skills
    pdf_text = "Alex Resume Student\nExperienced in Python, FastAPI, React, PostgreSQL, Docker, RAG, and Git."
    pdf_bytes = create_synthetic_pdf_bytes(pdf_text)

    files = {
        "file": ("test_resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")
    }
    headers = {"Authorization": f"Bearer {token}"}

    # 4. Upload resume
    response = client.post("/api/v1/resumes/upload", files=files, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["filename"] == "test_resume.pdf"
    assert data["status"] == "COMPLETED"
    
    parsed_skills = data["parsed_data"]["skills"]
    assert "Python" in parsed_skills
    assert "FastAPI" in parsed_skills
    assert "React" in parsed_skills
    assert "PostgreSQL" in parsed_skills
    assert "Docker" in parsed_skills
    assert "RAG" in parsed_skills

def test_upload_non_pdf_file_rejected():
    # Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "resume.student@university.edu",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]

    # Upload plaintext file masquerading as pdf
    files = {
        "file": ("invalid_doc.txt", io.BytesIO(b"Hello world text"), "text/plain")
    }
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/v1/resumes/upload", files=files, headers=headers)
    assert response.status_code == 400
    assert "Only PDF resumes are accepted" in response.json()["detail"]

def test_get_my_resume():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "resume.student@university.edu",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/resumes/me", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["filename"] == "test_resume.pdf"
    assert data["parsed_data"]["total_skills_count"] >= 5
