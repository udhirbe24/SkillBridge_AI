# Test Plan — SkillBridge AI

> **Document ID:** TEST-001
> **Version:** 1.0.0
> **Created:** 2026-10-06
> **Status:** Baseline

---

## 1. Testing Strategy Overview

```
┌───────────────────────────────────────────────────┐
│                    E2E Tests                       │
│          (Playwright — User Journeys)              │
│  ┌─────────────────────────────────────────────┐   │
│  │           Integration Tests                 │   │
│  │       (Jest + Supertest — API + DB)         │   │
│  │  ┌───────────────────────────────────────┐  │   │
│  │  │          Unit Tests                   │  │   │
│  │  │   (Jest — Services, Utils, Logic)     │  │   │
│  │  └───────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────┘   │
│         Security Tests (Manual + Automated)        │
│         UI Tests (Responsive, Accessibility)       │
└───────────────────────────────────────────────────┘
```

---

## 2. Test Levels

### 2.1 Unit Tests

| Aspect | Detail |
|--------|--------|
| **Tool** | Jest |
| **Scope** | Individual functions, services, utilities, validators |
| **Coverage Target** | ≥80% line coverage for business logic |
| **Location** | Co-located: `<module>.test.js` |
| **Execution** | `npm test` (< 30 seconds) |
| **Mocking** | External services (AI, DB) mocked |

**What to test:**
- All validation schemas (Zod)
- All service methods (business logic)
- All utility functions
- Score calculation algorithms
- Error class behavior
- Middleware logic

### 2.2 Integration Tests

| Aspect | Detail |
|--------|--------|
| **Tool** | Jest + Supertest |
| **Scope** | API endpoints + database interactions |
| **Location** | `tests/integration/` |
| **Database** | Test database (separate from dev) |
| **Execution** | `npm run test:integration` |

**What to test:**
- All API endpoints (success + error cases)
- Authentication flow (register → login → access → refresh → logout)
- RBAC enforcement (student/recruiter/admin access)
- File upload pipeline
- Database constraints and relationships
- Pagination, filtering, sorting

### 2.3 End-to-End Tests

| Aspect | Detail |
|--------|--------|
| **Tool** | Playwright |
| **Scope** | Complete user journeys through the UI |
| **Location** | `tests/e2e/` |
| **Execution** | `npm run test:e2e` |

**Core User Journeys:**

| Journey | Steps |
|---------|-------|
| **Registration → Profile** | Register → Login → Complete profile → Set career goals |
| **Resume Analysis** | Login → Upload resume → Trigger analysis → View results |
| **Job Matching** | Login → Select resume → Paste JD → View match results |
| **Skill Gap** | Login → View skills → Set target role → View gaps |
| **Roadmap** | Login → Generate roadmap → Mark item complete → View progress |
| **Assessment** | Login → Browse assessments → Start → Submit → View analytics |
| **Interview** | Login → Start interview → Answer questions → View feedback |

### 2.4 Security Tests

| Test | Description |
|------|-------------|
| Unauthorized access | Attempt protected endpoints without token |
| Privilege escalation | Student attempts admin-only endpoints |
| Invalid tokens | Expired, malformed, tampered tokens |
| Rate limiting | Exceed rate limits and verify rejection |
| SQL injection | Malicious inputs in all text fields |
| XSS | Script injection in profile, resume text |
| File upload abuse | Wrong MIME type, oversized files, malicious files |
| CSRF | Cross-site request forgery attempts |
| Password brute force | Verify account lockout behavior |

### 2.5 UI Tests

| Test | Description |
|------|-------------|
| Responsive layout | Desktop (1920px), Tablet (768px), Mobile (375px) |
| Keyboard navigation | Tab through all interactive elements |
| Form validation | Required fields, format validation, error display |
| Loading states | Skeleton/spinner during async operations |
| Error states | Network errors, API errors, empty states |
| Color contrast | WCAG AA compliance (4.5:1 ratio) |

---

## 3. Test Data Strategy

### 3.1 Seed Data

A seed script creates consistent test data:
- 3 test users (1 student, 1 recruiter, 1 admin)
- Sample resumes (PDF fixtures)
- Pre-populated skill taxonomy
- Sample assessments with questions
- Sample job listings

### 3.2 Test Isolation

- Each integration test suite starts with a clean database state
- Tests do not depend on other tests' data
- Fixtures are version-controlled in `tests/fixtures/`

### 3.3 AI Mocking

AI service responses are mocked in all test environments:
- Predefined mock responses for resume analysis
- Predefined mock responses for interview questions
- Mocked error scenarios for graceful degradation testing

---

## 4. Test Execution Matrix

| Test Level | Trigger | Environment | Duration Target |
|-----------|---------|-------------|----------------|
| Unit | Pre-commit hook | Local | < 30 seconds |
| Integration | Pre-merge CI | CI + test DB | < 2 minutes |
| E2E | Pre-release CI | CI + full stack | < 5 minutes |
| Security | Manual + CI | CI + full stack | < 5 minutes |

---

## 5. Coverage Requirements

| Module | Unit Coverage | Integration Coverage |
|--------|-------------|---------------------|
| Auth | ≥90% | All endpoints |
| Resume Service | ≥80% | Upload, analyze, match |
| Skill Service | ≥80% | CRUD, gap analysis |
| Roadmap Service | ≥80% | Generate, track |
| Assessment Service | ≥80% | Questions, evaluate |
| Interview Service | ≥80% | Start, respond, complete |
| Validation schemas | 100% | — |
| Utility functions | ≥90% | — |

---

## 6. Test Case Summary (Partial)

### TC-AUTH: Authentication

| ID | Test Case | Type | Priority |
|----|-----------|------|----------|
| TC-AUTH-01 | Register with valid data → 201 + token | Integration | Critical |
| TC-AUTH-02 | Register with duplicate email → 409 | Integration | Critical |
| TC-AUTH-03 | Register with weak password → 400 | Unit + Integration | High |
| TC-AUTH-04 | Login with valid credentials → 200 + token | Integration | Critical |
| TC-AUTH-05 | Login with wrong password → 401 | Integration | Critical |
| TC-AUTH-06 | Login locked account → 403 | Integration | High |
| TC-AUTH-07 | Access protected route without token → 401 | Integration | Critical |
| TC-AUTH-08 | Access admin route as student → 403 | Integration | Critical |
| TC-AUTH-09 | Refresh token → new access token | Integration | High |
| TC-AUTH-10 | Logout → refresh token invalidated | Integration | High |

### TC-RESUME: Resume Intelligence

| ID | Test Case | Type | Priority |
|----|-----------|------|----------|
| TC-RES-01 | Upload valid PDF → 201 + stored | Integration | Critical |
| TC-RES-02 | Upload invalid file type → 400 | Integration | High |
| TC-RES-03 | Upload oversized file → 400 | Integration | High |
| TC-RES-04 | Analyze resume → scores + recommendations | Integration | Critical |
| TC-RES-05 | Match resume to JD → match results | Integration | Critical |
| TC-RES-06 | AI service unavailable → graceful error | Integration | High |
| TC-RES-07 | Score calculation is deterministic | Unit | High |

### TC-SECURITY: Security

| ID | Test Case | Type | Priority |
|----|-----------|------|----------|
| TC-SEC-01 | SQL injection in search fields → no effect | Security | Critical |
| TC-SEC-02 | XSS in profile bio → sanitized | Security | Critical |
| TC-SEC-03 | Tampered JWT → 401 | Security | Critical |
| TC-SEC-04 | Rate limit exceeded → 429 | Security | High |
| TC-SEC-05 | Malicious file upload → rejected | Security | Critical |
| TC-SEC-06 | Student accesses other student's resume → 403 | Security | Critical |
| TC-SEC-07 | Passwords not in logs → verified | Security | Critical |
| TC-SEC-08 | Security headers present → verified | Security | High |

---

## 7. Test Reporting

- Coverage reports generated by Jest (`--coverage`)
- HTML coverage reports stored in `coverage/`
- CI pipeline fails if coverage drops below threshold
- Test results included in milestone reports
