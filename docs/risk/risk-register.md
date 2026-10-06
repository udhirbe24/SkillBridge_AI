# Engineering & Project Risk Register — SkillBridge AI

> **Document ID:** RISK-001  
> **Version:** 1.0.0  
> **Created:** 2026-10-06  
> **Status:** Active Control  

---

## 1. Risk Management Framework

Risks are evaluated using Probability ($P: 1-5$) and Impact ($I: 1-5$), yielding a Risk Score ($R = P \times I$).

- **High Risk ($R \ge 15$):** Immediate mitigation required; weekly tracking.
- **Medium Risk ($8 \le R < 15$):** Active monitoring; mitigation planned.
- **Low Risk ($R < 8$):** Periodic review.

---

## 2. Risk Matrix Overview

| Risk ID | Category | Risk Description | Prob (1-5) | Impact (1-5) | Score | Mitigation Strategy | Contingency Plan | Status |
|---|---|---|---|---|---|---|---|---|
| **RSK-01** | AI / RAG | **LLM Hallucination in Roadmap / Interview Recommendations:** LLM invents non-existent technical concepts or incorrect learning paths. | 4 | 4 | **16 (High)** | Implement RAG hybrid search with strict context grounding and citation requirement. Temperature set to $\le 0.2$. | Fallback to pre-curated rule-based curriculum templates when groundedness score $<0.85$. | Open |
| **RSK-02** | Technical | **Vector Database Scalability & High Latency:** Qdrant search exceeds 500ms under concurrent user loads. | 3 | 4 | **12 (Med)** | Enable HNSW indexing in Qdrant, payload indexing, and Redis caching for top skill query vectors. | Downscale vector dimension from 1536 to 768 or switch to local ChromaDB for development/staging. | Open |
| **RSK-03** | Security | **Prompt Injection Attack:** Malicious resume text overrides LLM instruction system prompt to leak system data or alter scores. | 3 | 5 | **15 (High)** | Input sanitization, strict delimiter isolation (`<resume>...</resume>`), Pydantic structural validation. | Hard block input containing prompt injection signatures (`"ignore previous instructions"`). | Open |
| **RSK-04** | Security | **PII & Resume Data Leakage:** Direct access to raw resume PDF files stored in S3/MinIO by unauthorized users. | 2 | 5 | **10 (Med)** | S3 buckets configured to private access only. Access strictly via short-lived signed URLs (15-min expiry). | Immediate URL revocation and audit log inspection. | Open |
| **RSK-05** | Performance | **Audio WebRTC/WebSocket Latency in Mock Interview:** Real-time speech scoring causes stuttering or session drops. | 3 | 3 | **9 (Med)** | Stream chunking (2-second audio chunks), lightweight local STT pre-processing (Whisper-small). | Provide text-only backup mode for slow client network connections. | Open |
| **RSK-06** | Third-Party | **LLM Provider Rate Limits or Downtime:** OpenAI / DeepSeek API outages block user roadmap generation. | 3 | 4 | **12 (Med)** | Multi-provider fallback strategy (Primary: DeepSeek-V3/OpenAI, Fallback: Local Ollama / vLLM / Groq). | Automatic failover to local CPU/GPU fallback LLM or cached responses. | Open |
| **RSK-07** | Evaluation | **Academic Evaluator Rejection of AI Metrics:** System lacks quantitative proof of RAG effectiveness during defense. | 2 | 5 | **10 (Med)** | Build dedicated `/admin/rag-audit` dashboard with automated RAG Triad evaluation metrics (Faithfulness, Relevance, Groundedness). | Prepare offline benchmarking script (`ragas` framework) with pre-computed evaluation reports. | Open |
| **RSK-08** | Schedule | **Milestone Slippage in AI Interview Module:** Complex audio processing delays overall project timeline. | 3 | 3 | **9 (Med)** | Strict milestone control (M6 Audio Mock Interview isolated in modular scope). | Deliver text-based mock interview interface first as M6 MVP, then add audio in M9. | Open |

---

## 3. Monitoring & Review Protocol

- **Weekly Review:** Risk register updated during sprint planning.
- **Trigger Conditions:** Any risk elevating to Score $\ge 15$ triggers an immediate architecture spike.

---
*End of Document: Risk Register*
