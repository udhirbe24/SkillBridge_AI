from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.schemas.rag import RAGSearchRequest, RAGSearchResponse, RAGIndexRequest, RAGDocumentChunk
from app.services.vector_store import hybrid_rrf_search, index_document_chunk
from app.api.v1.auth import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/rag", tags=["RAG Vector Search"])

@router.post("/search", response_model=RAGSearchResponse)
def search_rag_curriculum(
    payload: RAGSearchRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Performs Reciprocal Rank Fusion (RRF) Hybrid Search combining Dense Cosine Embeddings & Sparse BM25 Keywords.
    """
    results_raw = hybrid_rrf_search(query=payload.query, top_k=payload.top_k)
    
    formatted_results = [
        RAGDocumentChunk(
            id=item["id"],
            title=item["title"],
            skill=item["skill"],
            category=item["category"],
            content=item["content"],
            score=item["score"],
            dense_rank=item["dense_rank"],
            sparse_rank=item["sparse_rank"]
        )
        for item in results_raw
    ]

    return RAGSearchResponse(
        query=payload.query,
        total_results=len(formatted_results),
        results=formatted_results
    )

@router.post("/index", status_code=status.HTTP_201_CREATED)
def index_curriculum_chunk(
    payload: RAGIndexRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Indexes a document chunk into the RAG vector store.
    """
    entry = index_document_chunk(
        doc_id=payload.id,
        title=payload.title,
        skill=payload.skill,
        category=payload.category,
        content=payload.content
    )
    return {
        "message": "Document indexed successfully",
        "id": entry["id"]
    }
