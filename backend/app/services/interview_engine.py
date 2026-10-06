import re
from typing import List, Dict, Any

# Curated question templates by role and difficulty
QUESTION_TEMPLATES = {
    "Backend Engineer": [
        {
            "category": "Technical Architecture",
            "question": "How do you handle asynchronous request execution and database connection pooling in high-concurrency FastAPI & PostgreSQL microservices?"
        },
        {
            "category": "System Design & Performance",
            "question": "Explain your strategy for implementing Redis caching, cache invalidation, and handling cache stampedes in REST APIs."
        },
        {
            "category": "Behavioral STAR Method",
            "question": "Describe a production outage or critical failure you encountered. How did you diagnose, resolve, and prevent it using the STAR framework?"
        }
    ],
    "Fullstack Developer": [
        {
            "category": "Technical Architecture",
            "question": "How do Server Components in Next.js 14 optimize bundle size and data fetching compared to traditional client-side SPA rendering?"
        },
        {
            "category": "System Design & Performance",
            "question": "Walk me through how you implement secure JWT authentication, httpOnly refresh token cookies, and Role-Based Access Control across frontend and backend."
        },
        {
            "category": "Behavioral STAR Method",
            "question": "Tell me about a time you had a technical disagreement with a team member regarding system design. How did you align and resolve it?"
        }
    ],
    "AI/ML RAG Specialist": [
        {
            "category": "Technical Architecture",
            "question": "Explain the difference between Dense vector embeddings and Sparse BM25 keyword search. How does Reciprocal Rank Fusion (RRF) combine them?"
        },
        {
            "category": "System Design & Performance",
            "question": "How do you measure and optimize RAG Triad Metrics (Faithfulness, Answer Relevance, and Context Precision) to prevent LLM hallucinations?"
        },
        {
            "category": "Behavioral STAR Method",
            "question": "Describe a complex AI feature you deployed. How did you test performance latency, fallback mechanisms, and cost optimization?"
        }
    ]
}

DEFAULT_QUESTIONS = [
    {
        "category": "Technical Architecture",
        "question": "Explain the architectural design of a scalable microservice system you built, including protocol choices and database layer."
    },
    {
        "category": "System Design & Performance",
        "question": "How do you optimize slow database queries and monitor latency across distributed cloud endpoints?"
    },
    {
        "category": "Behavioral STAR Method",
        "question": "Give an example of a challenging software project deadline. How did you prioritize tasks and deliver production quality code under pressure?"
    }
]

def generate_interview_questions(target_role: str, difficulty: str, total_questions: int = 3) -> List[Dict[str, str]]:
    """
    Generates role and difficulty tailored interview questions.
    """
    questions = QUESTION_TEMPLATES.get(target_role, DEFAULT_QUESTIONS)
    return questions[:total_questions]

def evaluate_interview_response(question_text: str, category: str, response_text: str) -> Dict[str, Any]:
    """
    Evaluates candidate's verbal response against domain criteria, technical depth, and structure.
    """
    words = re.findall(r'\w+', response_text)
    word_count = len(words)

    if word_count < 15:
        return {
            "score": 40.0,
            "feedback": "Response is too brief. Elaborate further with concrete technical examples and architectural detail.",
            "key_improvements": [
                "Provide technical depth rather than single-sentence summaries.",
                "Include specific frameworks, design patterns, or metrics from experience."
            ]
        }

    # Depth & Keyword Analysis
    technical_keywords = ["async", "fastapi", "postgresql", "redis", "cache", "token", "jwt", "star", "rrf", "embedding", "architecture", "query", "index", "latency", "scale", "component", "state", "pipeline", "docker", "test", "security"]
    found_keywords = [w for w in set(words) if w.lower() in technical_keywords]

    base_score = 65.0
    # Length bonus up to 20 pts
    length_bonus = min(20.0, (word_count / 100.0) * 20.0)
    # Keyword bonus up to 15 pts
    keyword_bonus = min(15.0, len(found_keywords) * 3.0)

    total_score = min(100.0, round(base_score + length_bonus + keyword_bonus, 1))

    if category == "Behavioral STAR Method":
        has_situation = any(w in response_text.lower() for w in ["situation", "when", "project", "task", "company"])
        has_result = any(w in response_text.lower() for w in ["result", "outcome", "improved", "reduced", "delivered", "learned"])
        
        feedback = f"Solid behavioral response ({word_count} words). "
        if has_situation and has_result:
            feedback += "Great demonstration of the STAR framework (Situation, Task, Action, Result)."
        else:
            feedback += "To strengthen your response, explicitly state the quantifiable Result achieved (e.g. 'reduced latency by 35%')."
    else:
        feedback = f"Good technical depth ({word_count} words). Highlighted key concepts: {', '.join(found_keywords[:4]) if found_keywords else 'core principles'}."

    improvements = []
    if len(found_keywords) < 3:
        improvements.append("Incorporate more industry-standard technical terminology.")
    if word_count < 60:
        improvements.append("Elaborate on edge-case handling and production monitoring.")
    if not improvements:
        improvements.append("Excellent articulate explanation. Consider adding quantitative metrics.")

    return {
        "score": total_score,
        "feedback": feedback,
        "key_improvements": improvements
    }

def generate_interview_summary(exchanges: List[Any]) -> Dict[str, Any]:
    """
    Computes overall weighted performance score and summary recommendation across exchanges.
    """
    scores = [e.score for e in exchanges if e.score is not None]
    if not scores:
        return {"overall_score": 0.0, "summary_feedback": "No answers evaluated."}

    avg_score = round(sum(scores) / len(scores), 1)

    if avg_score >= 85.0:
        summary = f"Outstanding Performance ({avg_score}%). Demonstrates senior-level technical depth, clear communication, and strong structural reasoning."
    elif avg_score >= 70.0:
        summary = f"Strong Performance ({avg_score}%). Good technical grasp across topics. Focus on providing quantitative results for behavioral questions."
    else:
        summary = f"Developing Candidate ({avg_score}%). Recommended to review system design patterns and practice structured responses using the STAR method."

    return {
        "overall_score": avg_score,
        "summary_feedback": summary
    }
