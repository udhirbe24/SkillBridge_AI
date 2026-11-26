from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.skills import RoleBenchmark

# Default Industry Standard Benchmarks for Software Engineering Roles
DEFAULT_ROLE_BENCHMARKS = [
    {
        "role_name": "Frontend Developer",
        "category": "Web & Software Engineering",
        "required_skills": ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Git"],
        "optional_skills": ["Next.js", "TailwindCSS", "Redux", "GraphQL", "Vue.js"],
        "description": "Designs and builds responsive, interactive client-side web applications and UI components."
    },
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
        "role_name": "Data Scientist",
        "category": "Data Science & Analytics",
        "required_skills": ["Python", "SQL", "Pandas", "NumPy", "PyTorch", "Git"],
        "optional_skills": ["TensorFlow", "NLP", "Computer Vision", "Docker", "PostgreSQL"],
        "description": "Analyzes complex datasets, extracts statistical insights, and develops predictive ML models."
    },
    {
        "role_name": "DevOps & Cloud Engineer",
        "category": "Infrastructure & Cloud",
        "required_skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git"],
        "optional_skills": ["Terraform", "Ansible", "Nginx", "Python", "Prometheus"],
        "description": "Automates cloud deployment pipelines, container orchestration, and security monitoring."
    },
    {
        "role_name": "Cloud Architect",
        "category": "Infrastructure & Cloud",
        "required_skills": ["AWS", "GCP", "Docker", "Kubernetes", "Linux", "CI/CD"],
        "optional_skills": ["Terraform", "Azure", "Python", "Nginx", "Ansible"],
        "description": "Architects highly-available, secure, multi-region cloud infrastructures and service networks."
    },
    {
        "role_name": "AI/ML RAG Specialist",
        "category": "Artificial Intelligence & RAG",
        "required_skills": ["Python", "PyTorch", "RAG", "Qdrant", "Embeddings", "OpenAI"],
        "optional_skills": ["FastAPI", "LangChain", "LlamaIndex", "Docker", "NLP"],
        "description": "Engineers retrieval-augmented generation pipelines, vector databases, and LLM agentic systems."
    },
    {
        "role_name": "Machine Learning Engineer",
        "category": "Artificial Intelligence & ML",
        "required_skills": ["Python", "PyTorch", "TensorFlow", "Docker", "SQL", "Git"],
        "optional_skills": ["FastAPI", "Embeddings", "NLP", "AWS", "Redis"],
        "description": "Productionizes machine learning models, inference pipelines, and scalable model serving systems."
    },
    {
        "role_name": "Mobile Developer",
        "category": "Mobile Application Development",
        "required_skills": ["JavaScript", "TypeScript", "React", "Git", "HTML", "CSS"],
        "optional_skills": ["Swift", "Kotlin", "GraphQL", "Docker", "Redis"],
        "description": "Develops cross-platform and native mobile applications with intuitive touch interfaces."
    },
    {
        "role_name": "Cybersecurity Analyst",
        "category": "Security & Compliance",
        "required_skills": ["Linux", "Python", "SQL", "Git", "Docker", "CI/CD"],
        "optional_skills": ["AWS", "Nginx", "Redis", "PostgreSQL"],
        "description": "Secures applications and infrastructure, conducts vulnerability assessments, and enforces compliance."
    },
    {
        "role_name": "Product Manager",
        "category": "Product & Strategy",
        "required_skills": ["SQL", "Git", "Python", "Problem Solving", "Communication"],
        "optional_skills": ["Docker", "React", "PostgreSQL"],
        "description": "Guides product vision, aligns cross-functional engineering teams, and analyzes user metrics."
    }
]

def seed_role_benchmarks_if_empty(db: Session):
    """
    Ensures default role benchmarks exist in database table.
    """
    existing_roles = {b.role_name.lower() for b in db.query(RoleBenchmark).all()}
    added = False
    for benchmark_data in DEFAULT_ROLE_BENCHMARKS:
        if benchmark_data["role_name"].lower() not in existing_roles:
            benchmark = RoleBenchmark(**benchmark_data)
            db.add(benchmark)
            added = True
    if added:
        db.commit()

def find_role_benchmark(db: Session, target_role: str) -> RoleBenchmark | None:
    """
    Robust benchmark lookup: exact, case-insensitive, normalized spaces, or partial match.
    """
    seed_role_benchmarks_if_empty(db)
    clean_target = target_role.strip()
    
    # 1. Exact case-insensitive match
    bm = db.query(RoleBenchmark).filter(RoleBenchmark.role_name.ilike(clean_target)).first()
    if bm:
        return bm
        
    # 2. Normalized spaces comparison (e.g., 'Full Stack' vs 'Fullstack')
    target_norm = clean_target.lower().replace(" ", "").replace("&", "").replace("-", "")
    all_bms = db.query(RoleBenchmark).all()
    for b in all_bms:
        b_norm = b.role_name.lower().replace(" ", "").replace("&", "").replace("-", "")
        if b_norm == target_norm or target_norm in b_norm or b_norm in target_norm:
            return b
            
    # 3. Substring match fallback
    for b in all_bms:
        first_word = clean_target.lower().split()[0] if clean_target else ""
        if first_word and first_word in b.role_name.lower():
            return b

    return all_bms[0] if all_bms else None

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
    benchmark = find_role_benchmark(db, target_role)

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

