from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.job import JobPosting

DEFAULT_JOB_POSTINGS = [
    {
        "title": "Backend Systems Engineer",
        "company_name": "TechCorp Innovations",
        "company_logo": "https://img.icons8.com/color/96/server.png",
        "location": "Remote (US/EU)",
        "job_type": "full_time",
        "experience_level": "entry",
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "Git"],
        "optional_skills": ["Docker", "Redis", "SQLAlchemy"],
        "description": "Join our backend platform engineering team to build scalable REST API microservices, connection pools, and real-time data pipelines using Python 3.14 and FastAPI.",
        "salary_range": "$95,000 - $125,000 / year",
        "is_active": True
    },
    {
        "title": "Fullstack Software Developer Intern",
        "company_name": "NexGen AI Labs",
        "company_logo": "https://img.icons8.com/color/96/code.png",
        "location": "San Francisco, CA (Hybrid)",
        "job_type": "internship",
        "experience_level": "entry",
        "required_skills": ["Python", "React", "TypeScript", "FastAPI"],
        "optional_skills": ["Next.js", "TailwindCSS", "PostgreSQL"],
        "description": "Exciting 3-month summer internship building responsive AI-driven user interfaces in Next.js 14 combined with robust async Python FastAPI endpoints.",
        "salary_range": "$45 - $55 / hour",
        "is_active": True
    },
    {
        "title": "AI & RAG Systems Architect",
        "company_name": "Cognitive Cloud Solutions",
        "company_logo": "https://img.icons8.com/color/96/brain.png",
        "location": "Remote",
        "job_type": "full_time",
        "experience_level": "mid",
        "required_skills": ["Python", "RAG", "Qdrant", "OpenAI", "Embeddings"],
        "optional_skills": ["FastAPI", "Docker", "LangChain"],
        "description": "Architect high-precision Retrieval-Augmented Generation (RAG) search engines utilizing Qdrant vector databases, Reciprocal Rank Fusion, and cross-encoders.",
        "salary_range": "$140,000 - $175,000 / year",
        "is_active": True
    }
]

def seed_default_jobs_if_empty(db: Session):
    """
    Seeds default job postings if table is empty.
    """
    count = db.query(JobPosting).count()
    if count == 0:
        for job_data in DEFAULT_JOB_POSTINGS:
            job = JobPosting(**job_data)
            db.add(job)
        db.commit()

def calculate_job_match(user_skills: List[str], required_skills: List[str], optional_skills: List[str]) -> Dict[str, Any]:
    """
    Computes candidate job match score and provides match explanation breakdown.
    """
    user_set = {s.strip().lower() for s in user_skills}
    req_map = {s.strip().lower(): s for s in required_skills}
    opt_map = {s.strip().lower(): s for s in optional_skills}

    matching_req = [req_map[k] for k in req_map if k in user_set]
    missing_req = [req_map[k] for k in req_map if k not in user_set]

    matching_opt = [opt_map[k] for k in opt_map if k in user_set]
    missing_opt = [opt_map[k] for k in opt_map if k not in user_set]

    matching_all = sorted(matching_req + matching_opt)

    req_score = (len(matching_req) / len(required_skills)) if required_skills else 1.0
    opt_score = (len(matching_opt) / len(optional_skills)) if optional_skills else 1.0

    match_score = round((req_score * 0.85 + opt_score * 0.15) * 100, 1)

    if match_score >= 80.0:
        explanation = f"Excellent match ({match_score}%). You possess {len(matching_req)} of {len(required_skills)} required core skills."
    elif match_score >= 50.0:
        explanation = f"Moderate match ({match_score}%). Recommended to acquire missing core skills: {', '.join(missing_req)}."
    else:
        explanation = f"Low match ({match_score}%). Missing foundational requirements: {', '.join(missing_req[:3])}."

    return {
        "match_score": match_score,
        "explanation": {
            "matching_skills": matching_all,
            "missing_required_skills": sorted(missing_req),
            "missing_optional_skills": sorted(missing_opt),
            "explanation": explanation
        }
    }
