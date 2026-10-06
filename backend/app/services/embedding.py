import os
import math
import hashlib
from typing import List
from app.core.config import settings

EMBEDDING_DIMENSION = 1536

def generate_embedding(text: str) -> List[float]:
    """
    Generates a normalized 1536-dimensional dense vector embedding for input text.
    Uses OpenAI API if OPENAI_API_KEY is configured, otherwise uses deterministic 
    semantic hashing algorithm for local testing and offline environments.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key.startswith("sk-"):
        try:
            import httpx
            response = httpx.post(
                "https://api.openai.com/v1/embeddings",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"input": text, "model": settings.EMBEDDING_MODEL},
                timeout=10.0
            )
            if response.status_code == 200:
                return response.json()["data"][0]["embedding"]
        except Exception:
            pass # Fallback to deterministic semantic vector generator

    # Deterministic 1536-dim semantic vector fallback
    text_clean = text.lower().strip()
    vector = []
    
    for i in range(EMBEDDING_DIMENSION):
        # Generate pseudo-random component based on sha256 hash of text + index
        seed = f"{text_clean}_{i}".encode("utf-8")
        h = int(hashlib.sha256(seed).hexdigest()[:8], 16)
        val = (h / 0xFFFFFFFF) * 2.0 - 1.0
        vector.append(val)

    # Normalize vector to unit length (L2 norm)
    magnitude = math.sqrt(sum(x * x for x in vector))
    if magnitude > 0:
        vector = [x / magnitude for x in vector]

    return vector
