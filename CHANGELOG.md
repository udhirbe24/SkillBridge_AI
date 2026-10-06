# Changelog — SkillBridge AI

All notable changes to the SkillBridge AI platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-06

### Added
- **M0 - Foundation & Architecture:** Initialized monorepo with Next.js 14 frontend and Python FastAPI backend engine. Configured Docker Compose for PostgreSQL 16, Redis, Qdrant Vector DB, and MinIO storage.
- **M1 - Auth & Access Control:** Argon2id/bcrypt password hashing, JWT Access & Refresh Token authorization, and Role-Based Access Control (`STUDENT`, `RECRUITER`, `ADMIN`, `EVALUATOR`).
- **M2 - Resume Intelligence:** Multipart file ingestion pipeline with magic byte validation (PDF/DOCX max 5MB), pdfplumber text extraction, ATS scoring engine, and skill extraction taxonomy.
- **M3 - Skill Gap Analysis Engine:** RoleBenchmark data model and skill gap prioritization algorithm comparing candidate skills against industry standards.
- **M4 - RAG Vector Store & Roadmaps:** Dense Cosine Embedding generator (1536-dim normalized) + Sparse BM25 Reciprocal Rank Fusion (RRF) hybrid search orchestrator. Personalized AI Career Roadmap generation and task progress tracking.
- **M5 - Coding Assessment Engine:** Code evaluation sandbox supporting Python solution evaluation against test cases, output log capture, and candidate performance analytics.
- **M6 - AI Mock Interviews:** AI question generator (Technical Architecture, System Design, STAR Method), candidate answer evaluator with depth scoring and structured key improvements, and session summary reports.
- **M7 - Job & Internship Recommendations:** JobPosting schema, skill-matching algorithm (85% required + 15% optional weighted fit), explainable match breakdown, and recruiter job management endpoints.
- **M8 - Analytics Dashboard:** 4-pillar composite career readiness engine (Skill Gap 35%, Coding 25%, Mock Interviews 20%, Resume Quality 20%) with smart next-action recommendations.
- **M9 - Recruiter & Admin Control Panels:** Candidate search, recruiter shortlisting, user account management (activate/deactivate), security audit log viewer, and platform system statistics.
- **M10 - Security Hardening:** Injected OWASP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `CSP`), IP rate limiting middleware, and comprehensive Security & Privacy Audit report.
- **M11 - Final Polish:** End-to-end unit and integration test suite with 30/30 passing test assertions across all modules.
