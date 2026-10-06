# Security & Privacy Audit Report — SkillBridge AI

> **Document ID:** SEC-AUD-001  
> **Version:** 1.0.0  
> **Audited Date:** 2026-10-06  
> **Status:** PASSED / HARDENED  
> **Compliance:** OWASP Top 10 (2025/2026 Standards), IEEE 830 SRS, GDPR Data Privacy Principles

---

## 1. OWASP Top 10 Security Assessment Summary

| OWASP Vulnerability Risk Category | Implementation & Defense Mechanism | Status |
|-----------------------------------|-----------------------------------|--------|
| **A01: Broken Access Control** | Role-Based Access Control (RBAC) enforced via FastAPI `RoleChecker` dependencies (`STUDENT`, `RECRUITER`, `ADMIN`). Unauthorized role endpoints return `403 Forbidden`. | ✅ PASSED |
| **A02: Cryptographic Failures** | Passwords hashed using direct `bcrypt` algorithm with salt rounds. Safe 72-byte truncation handling. In-transit encryption over TLS. JWT signed with HMAC-SHA256. | ✅ PASSED |
| **A03: Injection (SQLi, NoSQL, Command)** | SQLAlchemy ORM parameterized queries prevent SQL injection. Input schemas validated using Pydantic V2. Evaluation sandbox isolates AST code execution. | ✅ PASSED |
| **A04: Insecure Design** | Architectural separation of concerns between API gateway, authentication middleware, domain engines, and vector stores. | ✅ PASSED |
| **A05: Security Misconfiguration** | Defensive OWASP HTTP response headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Content-Security-Policy`). | ✅ PASSED |
| **A06: Vulnerable & Outdated Components** | Python 3.14 runtime, FastAPI, SQLAlchemy 2.0, Pydantic V2, and PyJWT audited with zero high-severity CVEs. | ✅ PASSED |
| **A07: Identification & Auth Failures** | Strict JWT bearer token expiration (15-min access, 7-day refresh). Server-side token invalidation and audit log tracking. | ✅ PASSED |
| **A08: Software & Data Integrity Failures** | Input validation on all multipart file uploads (resume PDF magic bytes check, 5MB size limit). Sanitized AST evaluation. | ✅ PASSED |
| **A09: Security Logging & Monitoring** | Audit log system records `USER_REGISTERED`, `USER_LOGIN_SUCCESS`, `SKILL_GAP_ANALYZED`, and admin activity. | ✅ PASSED |
| **A10: Server-Side Request Forgery (SSRF)** | Vector store embeddings engine and LLM calls operate strictly over verified outbound endpoints with no user-controlled URL redirections. | ✅ PASSED |

---

## 2. Security Middleware Hardening

### 2.1 Injected Security Headers
```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; frame-ancestors 'none';
```

### 2.2 Rate Limiting
- **IP Rate Limiting:** Enforced via `SecurityHeadersAndRateLimitMiddleware`.
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- **Limit:** 60 requests / minute per client IP. Overflow requests return `429 Too Many Requests`.

---

## 3. Privacy & GDPR Compliance

1. **Data Minimization:** Candidate profiles only retain necessary career development metrics and user-uploaded resumes.
2. **Right to Erasure (Delete Account):** Cascading database deletes (`ondelete="CASCADE"`) clean up student profiles, skill gap analyses, roadmaps, assessment submissions, and interview logs.
3. **Data Protection:** Passwords and JWT tokens are never logged or returned in plain text in API payloads.

---

## 4. Verification & Audit Sign-Off

- **Test Suite:** `backend/tests/test_security.py` passes 100%.
- **Status:** Approved for production readiness.
