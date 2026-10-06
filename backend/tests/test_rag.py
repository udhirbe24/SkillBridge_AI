import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.vector_store import hybrid_rrf_search, index_document_chunk, cosine_similarity, sparse_bm25_score

client = TestClient(app)

def test_vector_store_unit_functions():
    # Test cosine similarity
    vec1 = [1.0, 0.0, 0.0]
    vec2 = [1.0, 0.0, 0.0]
    vec3 = [0.0, 1.0, 0.0]
    assert cosine_similarity(vec1, vec2) == 1.0
    assert cosine_similarity(vec1, vec3) == 0.0

    # Test sparse BM25 score
    query = "FastAPI Python"
    content = "Learn how to build REST API services using FastAPI and Python 3.14."
    score = sparse_bm25_score(query, content)
    assert score > 0.0

def test_rag_search_and_index_api():
    # 1. Register and login student
    student_payload = {
        "email": "rag.student@university.edu",
        "password": "Password123!",
        "full_name": "RAG Test Student",
        "role": "STUDENT"
    }
    client.post("/api/v1/auth/register", json=student_payload)

    login_res = client.post("/api/v1/auth/login", json={
        "email": "rag.student@university.edu",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test RAG document indexing
    index_payload = {
        "id": "CURR-TEST-99",
        "title": "Advanced Kubernetes Microservice Deployment",
        "skill": "Kubernetes",
        "category": "DevOps",
        "content": "Master Helm charts, ingress controllers, and zero-downtime rolling updates in Kubernetes."
    }
    index_res = client.post("/api/v1/rag/index", json=index_payload, headers=headers)
    assert index_res.status_code == 201
    assert index_res.json()["id"] == "CURR-TEST-99"

    # 3. Test RAG hybrid search
    search_payload = {
        "query": "Kubernetes Helm microservice",
        "top_k": 3
    }
    search_res = client.post("/api/v1/rag/search", json=search_payload, headers=headers)
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["query"] == "Kubernetes Helm microservice"
    assert search_data["total_results"] > 0
    top_result = search_data["results"][0]
    assert top_result["id"] == "CURR-TEST-99"
    assert "Kubernetes" in top_result["skill"]
