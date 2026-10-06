from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RAGSearchRequest(BaseModel):
    query: str = Field(..., examples=["FastAPI async architecture"])
    top_k: Optional[int] = Field(5, ge=1, le=20)


class RAGDocumentChunk(BaseModel):
    id: str
    title: str
    skill: str
    category: str
    content: str
    score: float
    dense_rank: int
    sparse_rank: int

class RAGSearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[RAGDocumentChunk]

class RAGIndexRequest(BaseModel):
    id: str
    title: str
    skill: str
    category: str
    content: str
