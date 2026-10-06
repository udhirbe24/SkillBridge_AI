import math
import re
from typing import List, Dict, Any
from app.services.embedding import generate_embedding

# In-Memory Vector Store Storage for local dev / testing fallback
VECTOR_COLLECTION: List[Dict[str, Any]] = []

def initialize_vector_collection():
    """
    Initializes vector collection and populates default learning curriculum modules if empty.
    """
    global VECTOR_COLLECTION
    if len(VECTOR_COLLECTION) == 0:
        default_docs = [
            {
                "id": "CURR-PY-01",
                "title": "Mastering Python AsyncIO & FastAPI Architecture",
                "skill": "FastAPI",
                "category": "Backend Development",
                "content": "Comprehensive guide to building async REST APIs using FastAPI, Pydantic V2 models, and SQLAlchemy connection pooling."
            },
            {
                "id": "CURR-DB-02",
                "title": "PostgreSQL Performance Optimization & Indexing",
                "skill": "PostgreSQL",
                "category": "Databases",
                "content": "Deep dive into PostgreSQL indexing techniques, B-Tree indexes, composite keys, query optimization, and EXPLAIN ANALYZE."
            },
            {
                "id": "CURR-RAG-03",
                "title": "Advanced RAG Architecture with Vector DBs",
                "skill": "RAG",
                "category": "AI & Vector Search",
                "content": "Designing high-precision Retrieval-Augmented Generation pipelines using Qdrant vector store, hybrid search, and cross-encoder re-ranking."
            },
            {
                "id": "CURR-REACT-04",
                "title": "Next.js 14 App Router & Glassmorphism Design Systems",
                "skill": "React",
                "category": "Frontend Engineering",
                "content": "Building responsive modern Web applications using Next.js 14 App Router, React Server Components, TypeScript, and HSL CSS tokens."
            },
            {
                "id": "CURR-DOCKER-05",
                "title": "Container Orchestration with Docker & Kubernetes",
                "skill": "Docker",
                "category": "DevOps",
                "content": "Containerizing Python and Node.js microservices, writing multi-stage Dockerfiles, Docker Compose networking, and Kubernetes pod management."
            }
        ]
        for doc in default_docs:
            index_document_chunk(doc["id"], doc["title"], doc["skill"], doc["category"], doc["content"])

def index_document_chunk(doc_id: str, title: str, skill: str, category: str, content: str) -> Dict[str, Any]:
    """
    Generates embedding for content chunk and stores document in vector collection.
    """
    global VECTOR_COLLECTION
    embedding = generate_embedding(f"{title} {skill} {content}")
    entry = {
        "id": doc_id,
        "title": title,
        "skill": skill,
        "category": category,
        "content": content,
        "vector": embedding
    }
    # Check duplicate ID replacement
    VECTOR_COLLECTION = [item for item in VECTOR_COLLECTION if item["id"] != doc_id]
    VECTOR_COLLECTION.append(entry)
    return entry

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """
    Calculates cosine similarity dot product between two normalized vectors.
    """
    if len(vec_a) != len(vec_b):
        return 0.0
    return sum(a * b for a, b in zip(vec_a, vec_b))

def sparse_bm25_score(query: str, content: str) -> float:
    """
    Computes keyword matching score based on query term frequency.
    """
    query_terms = set(re.findall(r'\w+', query.lower()))
    content_terms = re.findall(r'\w+', content.lower())
    if not query_terms or not content_terms:
        return 0.0

    matches = sum(1 for term in content_terms if term in query_terms)
    score = matches / (len(content_terms) + 10)
    return score

def hybrid_rrf_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Performs RRF Hybrid Search combining Dense Cosine similarity and Sparse BM25 keyword matching.
    """
    initialize_vector_collection()
    if not VECTOR_COLLECTION:
        return []

    # 1. Generate dense query embedding
    query_vector = generate_embedding(query)

    # 2. Compute Dense Scores & Rank
    dense_scored = []
    for doc in VECTOR_COLLECTION:
        sim = cosine_similarity(query_vector, doc["vector"])
        dense_scored.append((doc, sim))
    dense_scored.sort(key=lambda x: x[1], reverse=True)

    dense_ranks = {doc["id"]: rank + 1 for rank, (doc, _) in enumerate(dense_scored)}

    # 3. Compute Sparse BM25 Scores & Rank
    sparse_scored = []
    for doc in VECTOR_COLLECTION:
        bm25 = sparse_bm25_score(query, f"{doc['title']} {doc['skill']} {doc['content']}")
        sparse_scored.append((doc, bm25))
    sparse_scored.sort(key=lambda x: x[1], reverse=True)

    sparse_ranks = {doc["id"]: rank + 1 for rank, (doc, _) in enumerate(sparse_scored)}

    # 4. Compute RRF Hybrid Score (k = 60)
    k_const = 60.0
    hybrid_results = []
    for doc in VECTOR_COLLECTION:
        doc_id = doc["id"]
        dense_rank = dense_ranks[doc_id]
        sparse_rank = sparse_ranks[doc_id]

        rrf_score = (1.0 / (k_const + dense_rank)) + (1.0 / (k_const + sparse_rank))
        
        hybrid_results.append({
            "id": doc["id"],
            "title": doc["title"],
            "skill": doc["skill"],
            "category": doc["category"],
            "content": doc["content"],
            "score": round(rrf_score, 5),
            "dense_rank": dense_rank,
            "sparse_rank": sparse_rank
        })

    hybrid_results.sort(key=lambda x: x["score"], reverse=True)
    return hybrid_results[:top_k]
