# CLAUDE.md — SkillBridge AI Engineering Constitution

> **This file is the permanent engineering constitution of the SkillBridge AI project.**
> Every development action, code commit, design decision, and architectural change
> MUST respect the rules defined here. If a future instruction conflicts with this
> constitution, the conflict must be identified and resolved deliberately — never
> silently violated.

**Last Updated:** 2026-10-06
**Version:** 1.0.0

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Engineering Principles](#2-engineering-principles)
3. [Architecture Principles](#3-architecture-principles)
4. [Technology Stack](#4-technology-stack)
5. [Coding Standards](#5-coding-standards)
6. [Security Rules](#6-security-rules)
7. [Privacy Rules](#7-privacy-rules)
8. [Testing Requirements](#8-testing-requirements)
9. [Git Conventions](#9-git-conventions)
10. [Documentation Requirements](#10-documentation-requirements)
11. [Dependency Rules](#11-dependency-rules)
12. [AI Usage Rules](#12-ai-usage-rules)
13. [Definition of Done](#13-definition-of-done)
14. [Quality Gates](#14-quality-gates)
15. [Incremental Development Rules](#15-incremental-development-rules)
16. [No-Fake-Feature Policy](#16-no-fake-feature-policy)
17. [No-Secret-Commit Policy](#17-no-secret-commit-policy)
18. [Change Management Rules](#18-change-management-rules)
19. [Review Requirements](#19-review-requirements)
20. [Deployment & Reproducibility Requirements](#20-deployment--reproducibility-requirements)
21. [Amendment Process](#21-amendment-process)

---

## 1. Project Vision

**SkillBridge AI** is an Intelligent Career Development Platform designed to bridge the gap between academic learning and professional career readiness.

### 1.1 Mission Statement

Empower university students and early-career professionals with AI-driven, personalized career development — including skill-gap analysis, learning path generation, resume intelligence, interview preparation, and mentorship matching — delivered through a production-quality, secure, and accessible web platform.

### 1.2 Core Value Propositions

| # | Value | Description |
|---|-------|-------------|
| 1 | **Personalized Skill Analysis** | AI-powered assessment of current skills vs. target career requirements |
| 2 | **Intelligent Learning Paths** | Curated, adaptive learning recommendations from verified sources |
| 3 | **Resume Intelligence** | AI-assisted resume building, analysis, and optimization against job descriptions |
| 4 | **Interview Preparation** | Context-aware mock interview system with feedback |
| 5 | **Mentorship Matching** | Algorithm-driven pairing of mentors and mentees based on skills, goals, and availability |
| 6 | **Progress Analytics** | Visual dashboards tracking skill development over time |

### 1.3 Target Users

- University students (primary)
- Recent graduates
- Early-career professionals seeking career transitions
- Mentors / industry professionals (secondary — providing mentorship)

### 1.4 Academic Objective

This project is a university Software Engineering capstone. It must demonstrate mastery of:

- Software engineering methodology (requirements → design → implementation → testing → deployment)
- Clean architecture and design patterns
- Security-first development
- Comprehensive testing strategy
- Professional documentation
- Reproducible CI/CD pipeline

---

## 2. Engineering Principles

These principles govern **every** engineering decision.

### 2.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Correctness Over Speed** | Working, tested code is always preferred over fast, untested code. |
| **Simplicity First** | Choose the simplest solution that fully solves the problem. Complexity must be justified. |
| **Explicit Over Implicit** | Code should clearly express intent. Avoid magic numbers, hidden side effects, and implicit dependencies. |
| **Fail Fast, Fail Loudly** | Errors must be caught early and reported clearly. Silent failures are forbidden. |
| **Single Responsibility** | Every module, class, and function should have exactly one well-defined responsibility. |
| **DRY (Don't Repeat Yourself)** | Shared logic must be extracted into reusable modules. Copy-paste duplication is a defect. |
| **YAGNI (You Aren't Gonna Need It)** | Do not build features, abstractions, or infrastructure until they are actually needed. |
| **Separation of Concerns** | Business logic, data access, presentation, and infrastructure must remain in separate layers. |
| **Convention Over Configuration** | Follow established patterns and conventions. Deviations require documented justification. |
| **Defensive Programming** | Never trust external input. Validate at boundaries. Handle edge cases. |

### 2.2 Decision-Making Hierarchy

When principles conflict, resolve in this order:

1. **Security** — never compromise security for convenience
2. **Correctness** — correct behavior before performance
3. **Maintainability** — readable, maintainable code over clever code
4. **Performance** — optimize only after profiling identifies bottlenecks
5. **Features** — ship features only when they meet all quality gates

---

## 3. Architecture Principles

### 3.1 High-Level Architecture

SkillBridge AI follows a **layered monolith** architecture with clear module boundaries, designed for potential future decomposition into microservices.

```
┌──────────────────────────────────────────────────────┐
│                   CLIENT (React/Next.js)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │Dashboard │ │SkillMap  │ │ Resume   │ │ Auth   │  │
│  │Module    │ │Module    │ │Module    │ │Module  │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
├──────────────────────────────────────────────────────┤
│                    API GATEWAY                       │
├──────────────────────────────────────────────────────┤
│                 SERVER (Node.js / Express)           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │Auth      │ │Skills    │ │AI/ML     │ │Mentor  │  │
│  │Service   │ │Service   │ │Service   │ │Service │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
├──────────────────────────────────────────────────────┤
│           DATA LAYER (PostgreSQL / Redis)            │
└──────────────────────────────────────────────────────┘
```

### 3.2 Architectural Rules

| Rule | Description |
|------|-------------|
| **Layer Isolation** | Upper layers may depend on lower layers, never the reverse. No circular dependencies. |
| **API-First Design** | All backend functionality is exposed exclusively through versioned REST APIs. |
| **Stateless Server** | The server does not hold session state in-memory. Sessions are stored in the database or Redis. |
| **Environment Parity** | Dev, staging, and production environments must be structurally identical. |
| **Config via Environment** | All configuration (DB credentials, API keys, feature flags) comes from environment variables, never hardcoded. |
| **Module Boundaries** | Each feature domain (auth, skills, resume, mentorship) is a self-contained module with its own routes, controllers, services, and models. |
| **No Direct DB Access from Routes** | Routes → Controllers → Services → Repositories → Database. No shortcuts. |

### 3.3 Directory Structure (Planned)

```
SkillBridge/
├── CLAUDE.md                    # This file — engineering constitution
├── README.md                    # Project overview and setup guide
├── LICENSE
├── .env.example                 # Template for environment variables
├── .gitignore
├── docker-compose.yml           # Local development orchestration
├── Dockerfile                   # Production container definition
│
├── client/                      # Frontend application
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Static assets (images, fonts)
│   │   ├── components/          # Reusable UI components
│   │   │   └── common/          # Shared components (Button, Modal, etc.)
│   │   ├── features/            # Feature-based modules
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── skills/
│   │   │   ├── resume/
│   │   │   ├── interview/
│   │   │   └── mentorship/
│   │   ├── hooks/               # Custom React hooks
│   │   ├── context/             # React context providers
│   │   ├── services/            # API client services
│   │   ├── utils/               # Utility functions
│   │   ├── styles/              # Global styles and design tokens
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Backend application
│   ├── src/
│   │   ├── config/              # Configuration loaders
│   │   ├── middleware/           # Express middleware (auth, validation, error handling)
│   │   ├── modules/             # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── auth.model.js
│   │   │   │   ├── auth.validation.js
│   │   │   │   └── auth.test.js
│   │   │   ├── skills/
│   │   │   ├── resume/
│   │   │   ├── interview/
│   │   │   ├── mentorship/
│   │   │   └── analytics/
│   │   ├── shared/              # Shared utilities, constants, types
│   │   ├── database/            # Database connection, migrations, seeds
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── app.js               # Express app setup
│   │   └── server.js            # Server entry point
│   ├── package.json
│   └── jest.config.js
│
├── docs/                        # Project documentation
│   ├── architecture/
│   ├── api/
│   ├── deployment/
│   └── testing/
│
├── scripts/                     # Utility scripts (setup, seeding, etc.)
│
└── tests/                       # End-to-end / integration tests
    ├── e2e/
    └── integration/
```

---

## 4. Technology Stack

### 4.1 Approved Technologies

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Frontend Framework** | React | 18.x+ | Industry standard, rich ecosystem, component-based |
| **Frontend Build Tool** | Vite | 5.x+ | Fast HMR, modern defaults, ESM-native |
| **Styling** | Vanilla CSS + CSS Modules | — | Maximum control, no framework lock-in |
| **Backend Runtime** | Node.js | 20.x LTS | JavaScript full-stack consistency, large ecosystem |
| **Backend Framework** | Express.js | 4.x | Lightweight, flexible, well-documented |
| **Database** | PostgreSQL | 15.x+ | Robust relational DB, excellent for structured data |
| **ORM** | Prisma | 5.x+ | Type-safe queries, excellent migration tooling |
| **Cache / Sessions** | Redis | 7.x+ | In-memory performance for sessions and caching |
| **Authentication** | JWT + bcrypt | — | Stateless auth with secure password hashing |
| **AI/ML Integration** | OpenAI API / HuggingFace | — | NLP capabilities for resume analysis, skill matching |
| **Testing (Unit)** | Jest | 29.x+ | Standard JS testing framework |
| **Testing (E2E)** | Playwright | Latest | Cross-browser E2E testing |
| **Containerization** | Docker + Docker Compose | — | Reproducible environments |
| **Linting** | ESLint | 8.x+ | Code quality enforcement |
| **Formatting** | Prettier | 3.x+ | Consistent code formatting |

### 4.2 Technology Addition Rules

- **No new dependency** may be added without documented justification.
- Prefer well-maintained packages with >1000 GitHub stars and recent commits.
- Every dependency must have a clear security and license review.
- Native/built-in solutions are preferred over third-party libraries.

---

## 5. Coding Standards

### 5.1 General Rules

- **Language:** JavaScript (ES2022+) for both client and server.
- **Module System:** ESM (`import/export`) everywhere. No CommonJS (`require`) in new code.
- **Semicolons:** Required.
- **Quotes:** Single quotes for strings, backticks for template literals.
- **Indentation:** 2 spaces. No tabs.
- **Line Length:** 100 characters soft limit, 120 hard limit.
- **Trailing Commas:** Required in multi-line constructs (arrays, objects, parameters).
- **No `var`:** Use `const` by default, `let` only when reassignment is necessary.
- **No `any` equivalents:** All function parameters and return types should be clearly documented with JSDoc.

### 5.2 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Variables / functions | camelCase | `getUserSkills` |
| Constants | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| Classes / Components | PascalCase | `SkillAnalyzer` |
| Files (components) | PascalCase | `SkillCard.jsx` |
| Files (utilities) | camelCase | `formatDate.js` |
| Files (modules) | camelCase with dot notation | `auth.controller.js` |
| CSS classes | BEM (Block__Element--Modifier) | `skill-card__title--active` |
| Database tables | snake_case, plural | `user_skills` |
| Database columns | snake_case | `created_at` |
| API endpoints | kebab-case, plural nouns | `/api/v1/learning-paths` |
| Environment variables | UPPER_SNAKE_CASE with prefix | `SKILLBRIDGE_DB_URL` |

### 5.3 Function Standards

- Maximum function length: **40 lines** (excluding comments and blank lines).
- Maximum function parameters: **4**. Use an options object for more.
- Every public function must have a JSDoc comment with `@param` and `@returns`.
- Pure functions are preferred. Side effects must be documented.
- Arrow functions for callbacks/lambdas. Named `function` declarations for top-level functions.

### 5.4 Error Handling

- Use custom error classes extending `Error` (e.g., `ValidationError`, `AuthenticationError`, `NotFoundError`).
- Never swallow errors with empty `catch` blocks.
- All async functions must have proper error handling (try/catch or `.catch()`).
- HTTP errors must return consistent JSON responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email address is required.",
    "details": []
  }
}
```

### 5.5 API Response Format

All API responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150
  }
}
```

---

## 6. Security Rules

> **Security is non-negotiable. Every rule in this section is mandatory.**

### 6.1 Authentication & Authorization

| Rule | Details |
|------|---------|
| **Password Hashing** | bcrypt with minimum 12 salt rounds. Never store plaintext passwords. |
| **JWT Tokens** | Short-lived access tokens (15 min). Refresh tokens stored httpOnly, Secure, SameSite=Strict. |
| **Rate Limiting** | All auth endpoints rate-limited (max 5 attempts per minute per IP). |
| **Account Lockout** | Lock account after 5 consecutive failed login attempts for 15 minutes. |
| **Session Invalidation** | Logout must invalidate the refresh token server-side. |
| **RBAC** | Role-Based Access Control: `student`, `mentor`, `admin`. Every route must check permissions. |

### 6.2 Input Validation & Sanitization

- **ALL user input** must be validated on both client and server.
- Use a validation library (e.g., Joi, Zod) for schema-based validation.
- Sanitize all text inputs to prevent XSS (DOMPurify on client, sanitize-html on server).
- Parameterized queries only — **no string concatenation in SQL/ORM queries**.
- File uploads: whitelist allowed MIME types, enforce size limits, scan for malicious content.

### 6.3 Data Protection

- Sensitive data (passwords, tokens, PII) must **never** appear in logs.
- All API responses must strip internal fields (`__v`, internal IDs where inappropriate).
- CORS must be explicitly configured — no wildcard (`*`) origins in production.
- All cookies must have `HttpOnly`, `Secure`, and `SameSite` attributes.
- HTTPS enforced in production.

### 6.4 Security Headers

The following headers are **required** on all responses:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 6.5 Secrets Management

- **No secrets in source code.** Ever. No exceptions.
- All secrets come from environment variables.
- `.env` files are **gitignored**. Only `.env.example` (with placeholder values) is committed.
- API keys must be scoped to minimum required permissions.

---

## 7. Privacy Rules

### 7.1 Data Collection Principles

- **Minimal Collection:** Collect only data that is directly necessary for functionality.
- **Purpose Limitation:** Data collected for one purpose must not be repurposed without consent.
- **Transparency:** Users must be informed about what data is collected and why.
- **User Control:** Users can view, export, and delete their personal data.

### 7.2 PII Handling

| Data Type | Classification | Storage Rules |
|-----------|---------------|---------------|
| Email | PII | Encrypted at rest |
| Password | Sensitive | bcrypt hash only — never stored in plaintext |
| Resume content | PII | Encrypted at rest, access-controlled |
| Skill assessments | Personal | Access-controlled, user-owned |
| Chat/interview logs | Personal | Retained for max 90 days, then purged |

### 7.3 Data Retention

- User accounts: retained until deletion is requested.
- Session data: 7-day maximum retention.
- Analytics data: aggregated and anonymized after 90 days.
- Deleted accounts: all PII purged within 30 days of deletion request.

### 7.4 Third-Party Data Sharing

- No user data is shared with third parties without explicit consent.
- AI API calls (OpenAI, etc.) must not include unnecessary PII.
- AI prompts must be reviewed to ensure minimal data exposure.

---

## 8. Testing Requirements

### 8.1 Testing Strategy

| Level | Tool | Scope | Minimum Coverage |
|-------|------|-------|-----------------|
| **Unit Tests** | Jest | Individual functions, services, utilities | 80% line coverage |
| **Integration Tests** | Jest + Supertest | API endpoints, database interactions | All critical paths |
| **E2E Tests** | Playwright | User workflows (login, skill assessment, resume upload) | Core user journeys |
| **Security Tests** | Manual + OWASP ZAP | Authentication, authorization, injection | All auth flows |

### 8.2 Testing Rules

- **No feature is complete without tests.** Tests are part of the Definition of Done.
- Tests must be **deterministic** — no flaky tests allowed.
- Tests must be **independent** — no test may depend on another test's state.
- Tests must be **fast** — unit test suite must complete in under 30 seconds.
- Mock external services (AI APIs, email) in tests — never call real external services.
- Test file naming: `<module>.test.js` co-located with the module, or in `/tests/` for integration/E2E.

### 8.3 What Must Be Tested

- All API endpoints (success + error cases)
- All authentication/authorization flows
- All validation logic
- All business logic in services
- All database queries (via integration tests)
- All critical UI interactions (via E2E)
- Edge cases and boundary conditions

### 8.4 What Should NOT Be Tested

- Third-party library internals
- Trivial getters/setters with no logic
- Framework-generated boilerplate

---

## 9. Git Conventions

### 9.1 Branch Strategy

```
main              ← production-ready code (protected)
├── develop       ← integration branch for current sprint
│   ├── feature/* ← new features (feature/add-skill-assessment)
│   ├── fix/*     ← bug fixes (fix/login-validation)
│   ├── docs/*    ← documentation updates
│   └── chore/*   ← maintenance, refactoring, tooling
```

### 9.2 Commit Message Format

Follow **Conventional Commits** (https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`

**Examples:**

```
feat(auth): implement JWT-based login flow
fix(skills): correct skill-gap calculation for missing data
docs(api): add OpenAPI spec for /learning-paths endpoint
test(resume): add unit tests for resume parser service
chore(deps): upgrade Prisma to 5.10.0
```

### 9.3 Commit Rules

- Each commit must be **atomic** — one logical change per commit.
- Each commit must leave the project in a **buildable, runnable state**.
- **No commits to `main` directly.** All changes go through `develop` or feature branches.
- Commit messages must be **descriptive** — future developers must understand the change from the message alone.
- **No WIP commits** on shared branches. Squash or amend before merging.

---

## 10. Documentation Requirements

### 10.1 Code Documentation

- All public functions: JSDoc with `@param`, `@returns`, `@throws`.
- All modules: file-level JSDoc comment explaining purpose and responsibilities.
- Complex algorithms: inline comments explaining the *why*, not the *what*.
- All API endpoints: documented in an OpenAPI/Swagger specification.

### 10.2 Project Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| README.md | Root | Project overview, quick start, architecture summary |
| CLAUDE.md | Root | This file — engineering constitution |
| CHANGELOG.md | Root | Version history with notable changes |
| API Documentation | `docs/api/` | Endpoint specifications (OpenAPI) |
| Architecture Decision Records | `docs/architecture/` | ADRs for significant design decisions |
| Deployment Guide | `docs/deployment/` | How to deploy the application |
| Testing Guide | `docs/testing/` | How to run and write tests |
| Contributing Guide | Root | How to contribute (for academic context) |

### 10.3 Architecture Decision Records (ADRs)

For every significant architectural decision, create an ADR using this template:

```markdown
# ADR-NNN: Title

## Status: Proposed | Accepted | Deprecated | Superseded

## Context
What is the issue or problem?

## Decision
What was decided?

## Consequences
What are the positive and negative impacts?

## Alternatives Considered
What other options were evaluated and why were they rejected?
```

---

## 11. Dependency Rules

### 11.1 Adding Dependencies

Before adding any dependency:

1. **Justify:** Document why a built-in solution or existing dependency cannot solve the problem.
2. **Evaluate:** Check GitHub stars, maintenance activity, open issues, security advisories.
3. **License:** Only MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, and ISC licenses are permitted.
4. **Size:** Prefer lightweight packages. Avoid packages that pull in large dependency trees.
5. **Security:** Run `npm audit` after adding any dependency. Zero critical/high vulnerabilities.

### 11.2 Dependency Updates

- Run `npm audit` weekly.
- Security patches must be applied within 48 hours of disclosure.
- Major version upgrades require an ADR documenting the migration plan.

### 11.3 Banned Patterns

- No `*` or `latest` version ranges in `package.json`. Pin exact or use `^` for minor updates.
- No `postinstall` scripts that download binaries from external URLs.
- No dependencies with known critical vulnerabilities.

---

## 12. AI Usage Rules

### 12.1 Transparency

- All AI-generated code must be reviewed and understood by the team before merging.
- AI assistance is a tool, not a substitute for engineering judgment.
- AI-generated code must meet the same quality standards as human-written code.

### 12.2 AI Feature Rules

- AI-powered features (resume analysis, skill matching) must have **graceful degradation** — the app must remain functional if the AI service is unavailable.
- AI responses must be clearly labeled as AI-generated in the UI.
- AI prompts and model configurations must be version-controlled.
- AI API costs must be monitored and rate-limited per user.

### 12.3 Academic Integrity

- The use of AI assistance in development must be disclosed in the project report.
- All team members must be able to explain any code in the codebase.
- AI-generated code that is not understood is technical debt and must be refactored.

---

## 13. Definition of Done

A feature/task is **Done** when ALL of the following are satisfied:

- [ ] Code is written and follows all coding standards in Section 5
- [ ] Code passes all linting and formatting checks (zero warnings)
- [ ] Unit tests are written and passing (≥80% coverage for new code)
- [ ] Integration tests are written for API endpoints (if applicable)
- [ ] Security rules from Section 6 are satisfied
- [ ] Input validation is implemented on both client and server
- [ ] Error handling follows the standard error format
- [ ] JSDoc documentation is complete for all public functions
- [ ] The feature works in the development environment
- [ ] No new npm audit vulnerabilities introduced
- [ ] Commit messages follow Conventional Commits format
- [ ] Code has been self-reviewed for obvious issues
- [ ] The feature is accessible (keyboard navigation, screen reader compatible, color contrast)

---

## 14. Quality Gates

### 14.1 Pre-Commit Gate

Before any commit:

- [ ] ESLint passes with zero errors and zero warnings
- [ ] Prettier formatting is applied
- [ ] All existing tests pass
- [ ] No secrets or credentials in the diff

### 14.2 Pre-Merge Gate

Before merging to `develop`:

- [ ] All new code has tests
- [ ] Test coverage has not decreased
- [ ] No new npm audit vulnerabilities
- [ ] Documentation is updated (if behavior changed)
- [ ] The application builds successfully
- [ ] Manual smoke test passes

### 14.3 Release Gate

Before merging `develop` to `main`:

- [ ] All quality gates above are satisfied
- [ ] E2E tests pass
- [ ] CHANGELOG.md is updated
- [ ] Security audit is clean
- [ ] Performance is acceptable (page load < 3s, API response < 500ms for 95th percentile)

---

## 15. Incremental Development Rules

### 15.1 Milestone-Driven Development

The project is built in discrete milestones, each delivering **working, tested, deployable software**.

| Milestone | Deliverable |
|-----------|-------------|
| **M0** | Project scaffolding, tooling, CI/CD, empty shell with auth |
| **M1** | User authentication & profile management (fully tested) |
| **M2** | Skill assessment & gap analysis engine |
| **M3** | Learning path generation & recommendations |
| **M4** | Resume builder & AI analysis |
| **M5** | Interview preparation module |
| **M6** | Mentorship matching system |
| **M7** | Analytics dashboard & polish |
| **M8** | Final integration, E2E tests, security audit, deployment |

### 15.2 Rules

- **No milestone may begin until the previous milestone's Definition of Done is met.**
- Each milestone produces a working, deployable application.
- Milestones may be adjusted with an ADR documenting the change.
- Scope creep within a milestone is forbidden — create a new issue for future milestones.

---

## 16. No-Fake-Feature Policy

> **Every feature in the application must be genuinely functional.**

- **No hardcoded demo data** presented as real functionality.
- **No mock API responses** in production builds.
- **No placeholder text** that implies functionality exists when it does not (e.g., "Coming Soon" buttons that suggest backend work is done).
- **No simulated AI responses** — if the AI service is down, show an honest error, not a canned response.
- If a feature cannot be fully implemented, it must either:
  - Be clearly marked as a prototype/demo with explicit labeling, or
  - Be excluded from the release entirely.
- Seed data for development/testing is acceptable and encouraged, but must be clearly distinguished from production data.

---

## 17. No-Secret-Commit Policy

> **No secret, credential, API key, or sensitive token may ever be committed to version control.**

### 17.1 Prohibited Items in Git

- API keys (OpenAI, any third-party service)
- Database connection strings with credentials
- JWT secret keys
- OAuth client secrets
- Private keys or certificates
- Passwords or password hashes
- Personal access tokens
- `.env` files (only `.env.example` is committed)

### 17.2 Enforcement

- `.gitignore` must include `.env`, `.env.local`, `.env.*.local`, `*.pem`, `*.key`.
- A pre-commit hook should scan for common secret patterns.
- If a secret is accidentally committed, it must be:
  1. Rotated immediately (the old secret is considered compromised).
  2. Removed from Git history using `git filter-repo` or BFG Repo-Cleaner.
  3. Documented as a security incident.

---

## 18. Change Management Rules

### 18.1 Changing This Constitution

This document (`CLAUDE.md`) may only be modified when:

1. A genuine conflict is identified between a rule and a project requirement.
2. The change is documented with an ADR explaining the rationale.
3. The previous version of the rule is preserved as a comment or in the ADR.

### 18.2 Changing Architecture

Architectural changes (new services, database schema changes, new external integrations) require:

1. An ADR documenting the decision.
2. Impact analysis on existing features.
3. A migration plan for any data changes.
4. Updated documentation.

### 18.3 Changing Dependencies

- Adding a new dependency: follow Section 11.1.
- Removing a dependency: ensure no code references it, update documentation.
- Upgrading a major version: create an ADR, test thoroughly.

---

## 19. Review Requirements

### 19.1 Code Review Standards

All code must be reviewed against:

- [ ] Correctness: Does it do what it's supposed to?
- [ ] Security: Does it follow Section 6?
- [ ] Performance: Are there obvious performance issues?
- [ ] Readability: Can a new team member understand this code?
- [ ] Testing: Are the tests meaningful and comprehensive?
- [ ] Documentation: Is the code properly documented?
- [ ] Edge Cases: Are boundary conditions handled?
- [ ] Error Handling: Are errors handled gracefully?

### 19.2 Self-Review Checklist

Before requesting a review, verify:

- [ ] I have read my own diff line by line.
- [ ] I have tested the feature manually.
- [ ] I have run the full test suite.
- [ ] I have checked for hardcoded values, debug logs, and TODO comments.
- [ ] I have verified no secrets are in the diff.

---

## 20. Deployment & Reproducibility Requirements

### 20.1 Reproducibility

Any developer must be able to set up and run the project from scratch with:

```bash
git clone <repo>
cp .env.example .env   # + fill in values
docker-compose up -d   # start infrastructure (DB, Redis)
npm install             # install dependencies
npm run db:migrate      # run database migrations
npm run db:seed         # seed development data
npm run dev             # start development server
```

**Maximum time from clone to running app: 10 minutes.**

### 20.2 Docker Requirements

- `Dockerfile` must use multi-stage builds for minimal image size.
- `docker-compose.yml` must define all required services (app, database, Redis).
- Docker images must not contain secrets, development tools, or test files.
- Health checks must be defined for all services.

### 20.3 CI/CD Pipeline

The CI/CD pipeline must:

1. **Lint** — Run ESLint and Prettier checks.
2. **Test** — Run unit and integration tests with coverage reporting.
3. **Audit** — Run `npm audit` for security vulnerabilities.
4. **Build** — Build the production bundle.
5. **Deploy** — Deploy to staging/production (when configured).

### 20.4 Environment Variables

All required environment variables must be documented in `.env.example`:

```env
# Application
SKILLBRIDGE_PORT=3000
SKILLBRIDGE_NODE_ENV=development

# Database
SKILLBRIDGE_DB_HOST=localhost
SKILLBRIDGE_DB_PORT=5432
SKILLBRIDGE_DB_NAME=skillbridge
SKILLBRIDGE_DB_USER=your_db_user
SKILLBRIDGE_DB_PASSWORD=your_db_password

# Redis
SKILLBRIDGE_REDIS_URL=redis://localhost:6379

# JWT
SKILLBRIDGE_JWT_SECRET=your_jwt_secret_here
SKILLBRIDGE_JWT_EXPIRES_IN=15m
SKILLBRIDGE_JWT_REFRESH_EXPIRES_IN=7d

# AI Services
SKILLBRIDGE_OPENAI_API_KEY=your_openai_key_here

# CORS
SKILLBRIDGE_CORS_ORIGIN=http://localhost:5173
```

---

## 21. Amendment Process

### 21.1 How to Amend This Constitution

1. Identify the section to be amended.
2. Write an ADR (`docs/architecture/ADR-NNN-amend-claude-md.md`) explaining:
   - What rule is being changed.
   - Why the change is necessary.
   - What the new rule is.
   - What risks the change introduces.
3. Update `CLAUDE.md` with the new rule.
4. Update the `Last Updated` date and increment the version number.
5. Commit with message: `docs(constitution): amend section N.N — <reason>`

### 21.2 Versioning

- **Patch** (1.0.x): Typo fixes, clarifications that don't change meaning.
- **Minor** (1.x.0): New rules added, existing rules tightened.
- **Major** (x.0.0): Fundamental changes to architecture, stack, or philosophy.

---

> **This constitution is a living document. It exists to protect the quality, security,
> and integrity of the SkillBridge AI project. Treat it with the same seriousness as
> production code — because it governs all production code.**
