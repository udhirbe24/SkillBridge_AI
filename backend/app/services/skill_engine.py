from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.skills import RoleBenchmark

# Default Industry Standard Benchmarks for Software Engineering Roles
DEFAULT_ROLE_BENCHMARKS = [
    {
        "role_name": "Fullstack Developer",
        "category": "Web & Software Engineering",
        "required_skills": ["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Git"],
        "optional_skills": ["Docker", "Next.js", "Redis", "GraphQL", "TailwindCSS"],
        "description": "Develops end-to-end web applications combining modern frontend frameworks and scalable API gateways."
    },
    {
        "role_name": "Backend Engineer",
        "category": "Backend Systems",
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "SQL"],
        "optional_skills": ["Kubernetes", "gRPC", "Kafka", "AWS", "Nginx"],
        "description": "Architects resilient, high-throughput microservices, database schemas, and background task queues."
    },
    {
        "role_name": "AI/ML RAG Specialist",
        "category": "Artificial Intelligence & RAG",
        "required_skills": ["Python", "PyTorch", "RAG", "Qdrant", "Embeddings", "OpenAI"],
        "optional_skills": ["FastAPI", "LangChain", "LlamaIndex", "Docker", "NLP"],
        "description": "Engineers retrieval-augmented generation pipelines, vector databases, and LLM agentic systems."
    },
    {
        "role_name": "DevOps & Cloud Engineer",
        "category": "Infrastructure & Cloud",
        "required_skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git"],
        "optional_skills": ["Terraform", "Ansible", "Nginx", "Python", "Prometheus"],
        "description": "Automates cloud deployment pipelines, container orchestration, and security monitoring."
    }
]

def seed_role_benchmarks_if_empty(db: Session):
    """
    Ensures default role benchmarks exist in database table.
    """
    count = db.query(RoleBenchmark).count()
    if count == 0:
        for benchmark_data in DEFAULT_ROLE_BENCHMARKS:
            benchmark = RoleBenchmark(**benchmark_data)
            db.add(benchmark)
        db.commit()

def calculate_skill_gap(
    user_skills: List[str], 
    required_skills: List[str], 
    optional_skills: List[str]
) -> Dict[str, Any]:
    """
    Computes exact matching skills, missing required skills, missing optional skills, and weighted readiness score.
    """
    user_set = {s.strip().lower() for s in user_skills}
    req_map = {s.strip().lower(): s for s in required_skills}
    opt_map = {s.strip().lower(): s for s in optional_skills}

    matching_required = [req_map[k] for k in req_map if k in user_set]
    missing_required = [req_map[k] for k in req_map if k not in user_set]

    matching_optional = [opt_map[k] for k in opt_map if k in user_set]
    missing_optional = [opt_map[k] for k in opt_map if k not in user_set]

    matching_all = matching_required + matching_optional

    req_score = (len(matching_required) / len(required_skills)) if required_skills else 1.0
    opt_score = (len(matching_optional) / len(optional_skills)) if optional_skills else 1.0

    readiness_score = round((req_score * 0.85 + opt_score * 0.15) * 100, 1)

    # Generate human-readable analysis summary
    if readiness_score >= 80.0:
        summary = f"High Career Readiness ({readiness_score}%). Strong match for required core skills."
    elif readiness_score >= 50.0:
        summary = f"Moderate Career Readiness ({readiness_score}%). Recommended to acquire missing core skills: {', '.join(missing_required[:3])}."
    else:
        summary = f"Needs Skill Enhancement ({readiness_score}%). Focus on foundational required skills: {', '.join(missing_required[:4])}."

    return {
        "matching_skills": sorted(matching_all),
        "missing_required_skills": sorted(missing_required),
        "missing_optional_skills": sorted(missing_optional),
        "readiness_score": readiness_score,
        "analysis_summary": summary
    }

def perform_skill_gap_analysis(db: Session, user_id: str, target_role: str) -> Dict[str, Any]:
    """
    Retrieves user skills and target role benchmark from DB to compute skill gap analysis.
    """
    seed_role_benchmarks_if_empty(db)
    benchmark = db.query(RoleBenchmark).filter(
        RoleBenchmark.role_name.ilike(target_role)
    ).first()

    if not benchmark:
        required = ["Python", "Git", "Problem Solving"]
        optional = ["Docker", "CI/CD"]
    else:
        required = benchmark.required_skills
        optional = benchmark.optional_skills

    from app.models.user import StudentProfile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    acquired_skills = profile.skills if profile and profile.skills else []

    return calculate_skill_gap(acquired_skills, required, optional)

