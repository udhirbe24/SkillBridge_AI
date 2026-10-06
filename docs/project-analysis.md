# Project Analysis — SkillBridge AI

> **Document ID:** PA-001
> **Created:** 2026-10-06
> **Source:** Master Engineering & Execution Prompt (primary requirements source)
> **Status:** Baseline

---

## 1. Workspace Discovery Report

### 1.1 Inspection Results

| Item | Finding |
|------|---------|
| Project report file | **Not found** — The master engineering prompt serves as the primary requirements source |
| Existing source code | None — Greenfield project |
| Configuration files | None |
| Assets | None |
| Documentation | `CLAUDE.md` (engineering constitution, created in Step 1) |
| Infrastructure | None — No Docker, CI/CD, or deployment config exists |
| Dependencies | None — No `package.json`, `node_modules`, or lock files |
| Version control | Not yet initialized |

### 1.2 Constraints Identified

| Constraint | Source | Impact |
|------------|--------|--------|
| University project | Academic context | Must demonstrate SE methodology; must be defensible in academic evaluation |
| Single developer / small team | Implied by context | Architecture must remain manageable; avoid over-engineering |
| Time-bounded | Academic semester | Must prioritize core features over exhaustive coverage |
| AI API costs | External dependency | Must implement rate limiting and cost controls |
| Local development feasibility | Student environment | Must run on a standard development machine without cloud dependencies |

---

## 2. Problem Statement

University students and early-career professionals lack a unified, intelligent platform that bridges the gap between academic learning and professional career readiness. Existing tools are fragmented — resume builders, job boards, learning platforms, and interview preparation tools operate in silos without interconnection or personalization.

### 2.1 Core Problems

1. **Skill Visibility Gap** — Students cannot objectively assess which skills they have vs. what employers require.
2. **Career Path Ambiguity** — No personalized, adaptive guidance from current state to career goals.
3. **Resume Quality Gap** — Students create resumes without understanding ATS optimization or job-description alignment.
4. **Interview Preparedness** — Limited access to realistic, role-specific interview practice with actionable feedback.
5. **Mentorship Scarcity** — Difficulty finding industry mentors aligned with specific career goals and skill profiles.
6. **Progress Blindness** — No unified view of career development progress across multiple dimensions.

---

## 3. Motivation

- The career development journey is fragmented across dozens of disconnected tools.
- AI capabilities (NLP, skill extraction, personalized recommendations) are mature enough to provide genuine value.
- A unified platform can create a feedback loop: resume analysis → skill gaps → learning paths → assessments → improved resume → better job matches.
- University SE projects should demonstrate real engineering value, not just CRUD operations.

---

## 4. Objectives

### 4.1 Primary Objectives

| # | Objective | Measurable Outcome |
|---|-----------|-------------------|
| O1 | Enable AI-powered resume analysis | Users receive structured analysis with actionable recommendations |
| O2 | Provide skill-gap identification | System maps current skills against target role requirements |
| O3 | Generate personalized career roadmaps | Adaptive learning paths based on skill gaps and career goals |
| O4 | Deliver AI mock interview preparation | Role-specific questions with structured feedback |
| O5 | Implement coding assessment capability | Question bank with evaluation, scoring, and analytics |
| O6 | Build explainable job recommendations | Match scores with transparent reasoning |
| O7 | Provide career intelligence dashboard | Unified view of readiness, progress, and next actions |

### 4.2 Secondary Objectives

| # | Objective | Measurable Outcome |
|---|-----------|-------------------|
| O8 | Support recruiter workflows | Candidate search, filtering, and shortlisting |
| O9 | Enable mentorship matching | Algorithm-driven pairing based on skills and goals |
| O10 | Demonstrate SE best practices | Comprehensive testing, documentation, CI/CD, security |

---

## 5. Scope

### 5.1 In Scope

- User authentication and authorization (RBAC: Student, Recruiter, Admin)
- Student profile management with career goals
- Resume upload, parsing, and AI-powered analysis
- ATS-oriented evaluation and scoring
- Job description matching with explainable scores
- Skill extraction and skill-gap analysis
- Personalized career roadmap generation
- Coding assessments with question bank and analytics
- AI mock interviews with structured feedback
- Job/internship recommendations with match explanations
- Career intelligence dashboard with meaningful metrics
- Recruiter functionality (opportunity management, candidate search)
- Admin functionality (user management, platform configuration)
- Notification system
- Progress tracking and analytics
- 3D/advanced visualizations (selective, performance-friendly)

### 5.2 Out of Scope

- Real-time video interviewing
- Payment processing
- Social networking features
- Mobile native applications (responsive web only)
- Real ATS engine replication (we provide "ATS-oriented evaluation")
- Psychological profiling or personality assessments
- Integration with real job boards (we maintain our own opportunity data)
- Production-scale deployment (the system demonstrates deployment capability)

---

## 6. Stakeholders

| Stakeholder | Role | Interest |
|-------------|------|----------|
| University Students | Primary users | Career development, skill building, interview prep |
| Recent Graduates | Primary users | Job readiness, resume optimization |
| Industry Mentors | Secondary users | Providing guidance, talent discovery |
| Recruiters | Secondary users | Candidate discovery, skill-based filtering |
| Platform Administrators | Internal users | System management, content curation |
| University Faculty | Evaluators | Academic merit, SE methodology demonstration |
| Development Team | Builders | Engineering quality, learning outcomes |

---

## 7. Target Users

### 7.1 Primary: University Students & Recent Graduates

- **Demographics:** 18-28 years old, tech-literate, career-focused
- **Goals:** Land first job/internship, understand skill gaps, improve resume
- **Pain Points:** Uncertainty about career path, resume rejection, interview anxiety
- **Technical Comfort:** High (target is CS/Engineering students)

### 7.2 Secondary: Recruiters

- **Goals:** Find qualified candidates efficiently
- **Pain Points:** Resume volume, skill verification
- **Technical Comfort:** Moderate

### 7.3 Tertiary: Mentors

- **Goals:** Guide mentees effectively, give back to community
- **Pain Points:** Time management, finding aligned mentees
- **Technical Comfort:** High

---

## 8. Functional Requirements

### FR-AUTH: Authentication & Authorization

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | Users can register with email, password, and role selection | Must Have |
| FR-AUTH-02 | Users can login with email and password | Must Have |
| FR-AUTH-03 | System issues JWT access tokens (15 min) and refresh tokens (7 days) | Must Have |
| FR-AUTH-04 | Users can logout (server-side token invalidation) | Must Have |
| FR-AUTH-05 | System enforces RBAC (Student, Recruiter, Admin) at API level | Must Have |
| FR-AUTH-06 | Account lockout after 5 failed login attempts (15 min cooldown) | Must Have |
| FR-AUTH-07 | Users can reset password via email verification | Should Have |
| FR-AUTH-08 | Rate limiting on all auth endpoints (5 req/min/IP) | Must Have |

### FR-PROFILE: User Profiles

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PROF-01 | Students can create and edit their profile (name, bio, education, experience) | Must Have |
| FR-PROF-02 | Students can set career goals and target roles | Must Have |
| FR-PROF-03 | Students can view their skill inventory | Must Have |
| FR-PROF-04 | Recruiters can create and edit their company profile | Should Have |
| FR-PROF-05 | Admins can view and manage all user profiles | Must Have |

### FR-RESUME: Resume Intelligence

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RES-01 | Students can upload resume (PDF, DOCX; max 5MB) | Must Have |
| FR-RES-02 | System validates file type and size before processing | Must Have |
| FR-RES-03 | System extracts text from uploaded resume | Must Have |
| FR-RES-04 | System detects resume sections (contact, education, experience, skills, projects) | Must Have |
| FR-RES-05 | System extracts structured information from each section | Must Have |
| FR-RES-06 | System extracts skills from resume content | Must Have |
| FR-RES-07 | System generates ATS-oriented evaluation with scores | Must Have |
| FR-RES-08 | System provides improvement recommendations | Must Have |
| FR-RES-09 | System evaluates keyword relevance, structure, completeness, readability | Must Have |
| FR-RES-10 | Students can view analysis history | Should Have |

### FR-JOB-MATCH: Job Description Matching

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-JM-01 | Students can paste or upload a job description | Must Have |
| FR-JM-02 | System generates resume-to-JD match score | Must Have |
| FR-JM-03 | System identifies matching skills | Must Have |
| FR-JM-04 | System identifies missing skills | Must Have |
| FR-JM-05 | System identifies relevant experience alignment | Should Have |
| FR-JM-06 | System identifies missing keywords | Must Have |
| FR-JM-07 | System provides prioritized improvement recommendations | Must Have |
| FR-JM-08 | System explains why the score was produced | Must Have |

### FR-SKILLS: Skill Intelligence

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SK-01 | System maintains a structured skill taxonomy (career → role → skills → subskills) | Must Have |
| FR-SK-02 | System identifies user's existing skills from resume and assessments | Must Have |
| FR-SK-03 | System identifies skill gaps against target role | Must Have |
| FR-SK-04 | System prioritizes skills for development | Must Have |
| FR-SK-05 | System recommends learning resources per skill | Should Have |
| FR-SK-06 | System tracks skill progression over time | Should Have |

### FR-ROADMAP: Personalized Career Roadmap

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RM-01 | System generates personalized roadmap from current skills to target role | Must Have |
| FR-RM-02 | Each roadmap item includes: skill, objective, action, resource, assessment | Must Have |
| FR-RM-03 | Roadmap adapts based on user progress | Should Have |
| FR-RM-04 | Users can mark roadmap items as complete | Must Have |
| FR-RM-05 | System uses resume, assessments, interview performance, and career goals as inputs | Must Have |

### FR-ASSESS: Coding Assessments

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AS-01 | System provides a question bank organized by topic and difficulty | Must Have |
| FR-AS-02 | Students can attempt assessments with time tracking | Must Have |
| FR-AS-03 | System evaluates submissions against test cases | Must Have |
| FR-AS-04 | System records scores, time, and attempt history | Must Have |
| FR-AS-05 | System provides analytics: accuracy, topic performance, difficulty trends, weak areas | Must Have |
| FR-AS-06 | Admins can manage the question bank | Should Have |

### FR-INTERVIEW: AI Mock Interviews

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-IV-01 | Students select target role and difficulty for mock interview | Must Have |
| FR-IV-02 | System generates role-specific interview questions using AI | Must Have |
| FR-IV-03 | Students provide text-based responses | Must Have |
| FR-IV-04 | System evaluates responses on: technical correctness, relevance, completeness, communication | Must Have |
| FR-IV-05 | System provides structured feedback with improvement suggestions | Must Have |
| FR-IV-06 | System generates an improvement plan after the interview | Should Have |
| FR-IV-07 | Students can review past interview sessions | Should Have |

### FR-JOBS: Job/Internship Recommendations

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-JB-01 | System recommends opportunities based on skills, target role, experience, education | Must Have |
| FR-JB-02 | Each recommendation includes: match percentage, matching skills, missing skills, reasoning | Must Have |
| FR-JB-03 | Recommendations are explainable (not arbitrary scores) | Must Have |
| FR-JB-04 | Recruiters can post and manage opportunities | Should Have |
| FR-JB-05 | Recruiters can define required skills per opportunity | Should Have |
| FR-JB-06 | Admins can manage opportunities | Should Have |

### FR-DASH: Career Intelligence Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DA-01 | Dashboard displays career readiness score | Must Have |
| FR-DA-02 | Dashboard displays resume score | Must Have |
| FR-DA-03 | Dashboard displays skill coverage and gaps | Must Have |
| FR-DA-04 | Dashboard displays roadmap progress | Must Have |
| FR-DA-05 | Dashboard displays coding performance analytics | Must Have |
| FR-DA-06 | Dashboard displays interview readiness | Should Have |
| FR-DA-07 | Dashboard displays recommended next action | Must Have |
| FR-DA-08 | Dashboard displays recent activity | Should Have |
| FR-DA-09 | Every metric has documented meaning (no fake precision) | Must Have |

### FR-RECRUIT: Recruiter Features

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RC-01 | Recruiters can search candidates by skills | Should Have |
| FR-RC-02 | Recruiters can filter candidates by education, experience, skills | Should Have |
| FR-RC-03 | Recruiters can view candidate profiles (with consent) | Should Have |
| FR-RC-04 | Recruiters can shortlist candidates | Should Have |

### FR-ADMIN: Administration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AD-01 | Admins can manage users (view, activate, deactivate) | Must Have |
| FR-AD-02 | Admins can manage platform data (skills taxonomy, resources) | Must Have |
| FR-AD-03 | Admins can manage assessment question bank | Should Have |
| FR-AD-04 | Admins can manage opportunities | Should Have |
| FR-AD-05 | Admins can view audit logs and system information | Must Have |
| FR-AD-06 | Admins can manage platform configuration | Should Have |

### FR-NOTIF: Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NF-01 | System sends in-app notifications for important events | Should Have |
| FR-NF-02 | Users can view notification history | Should Have |
| FR-NF-03 | Users can mark notifications as read | Should Have |

---

## 9. Non-Functional Requirements

| ID | Category | Requirement | Target |
|----|----------|-------------|--------|
| NFR-01 | **Security** | All passwords hashed with bcrypt (≥12 rounds) | Mandatory |
| NFR-02 | **Security** | JWT with short-lived access tokens (15 min) | Mandatory |
| NFR-03 | **Security** | RBAC enforced at API level | Mandatory |
| NFR-04 | **Security** | All inputs validated server-side | Mandatory |
| NFR-05 | **Security** | Security headers on all responses | Mandatory |
| NFR-06 | **Security** | No secrets in source code | Mandatory |
| NFR-07 | **Privacy** | Resumes and career data treated as sensitive PII | Mandatory |
| NFR-08 | **Privacy** | Minimal data collection principle | Mandatory |
| NFR-09 | **Privacy** | Users can view, export, and delete their data | Should Have |
| NFR-10 | **Performance** | Page load time < 3 seconds | Target |
| NFR-11 | **Performance** | API response time < 500ms (95th percentile, non-AI) | Target |
| NFR-12 | **Performance** | AI-powered features respond within 10 seconds | Target |
| NFR-13 | **Scalability** | System handles 100 concurrent users without degradation | Target |
| NFR-14 | **Reliability** | Graceful degradation when AI services are unavailable | Mandatory |
| NFR-15 | **Reliability** | No data loss on component failure | Mandatory |
| NFR-16 | **Availability** | System available during evaluation/demo periods | Mandatory |
| NFR-17 | **Maintainability** | Modular architecture with clear boundaries | Mandatory |
| NFR-18 | **Maintainability** | All public functions documented with JSDoc | Mandatory |
| NFR-19 | **Usability** | Consistent, intuitive UI across all modules | Mandatory |
| NFR-20 | **Usability** | Meaningful error messages (no raw stack traces) | Mandatory |
| NFR-21 | **Accessibility** | Keyboard navigation support | Should Have |
| NFR-22 | **Accessibility** | Sufficient color contrast (WCAG AA) | Should Have |
| NFR-23 | **Responsiveness** | Functional on desktop and tablet viewports | Must Have |
| NFR-24 | **Responsiveness** | Functional on mobile viewports | Should Have |
| NFR-25 | **Testability** | ≥80% unit test coverage for business logic | Target |
| NFR-26 | **Testability** | Integration tests for all API endpoints | Mandatory |
| NFR-27 | **Testability** | E2E tests for core user journeys | Must Have |
| NFR-28 | **Observability** | Structured logging for all API requests | Should Have |
| NFR-29 | **Observability** | Audit logging for security-relevant actions | Must Have |
| NFR-30 | **Data Integrity** | Foreign key constraints and validation at DB level | Mandatory |
| NFR-31 | **Data Integrity** | Transactions for multi-step operations | Mandatory |
| NFR-32 | **Extensibility** | Module boundaries allow adding features without refactoring core | Mandatory |
| NFR-33 | **Reproducibility** | Clone-to-running in ≤ 10 minutes | Target |

---

## 10. User Roles & Permissions Matrix

| Capability | Student | Recruiter | Admin |
|------------|---------|-----------|-------|
| Register / Login | ✅ | ✅ | ✅ |
| Manage own profile | ✅ | ✅ | ✅ |
| Upload & analyze resume | ✅ | ❌ | ❌ |
| View ATS-oriented analysis | ✅ | ❌ | ❌ |
| Match resume to job description | ✅ | ❌ | ❌ |
| View skill gaps | ✅ | ❌ | ❌ |
| Set career goals | ✅ | ❌ | ❌ |
| Generate career roadmap | ✅ | ❌ | ❌ |
| Complete coding assessments | ✅ | ❌ | ❌ |
| View assessment analytics | ✅ | ❌ | ❌ |
| Conduct AI mock interviews | ✅ | ❌ | ❌ |
| View interview feedback | ✅ | ❌ | ❌ |
| View job recommendations | ✅ | ❌ | ❌ |
| View career dashboard | ✅ | ❌ | ❌ |
| Track career progress | ✅ | ❌ | ❌ |
| Post opportunities | ❌ | ✅ | ✅ |
| Define required skills | ❌ | ✅ | ✅ |
| Search candidates | ❌ | ✅ | ✅ |
| Filter candidates | ❌ | ✅ | ✅ |
| View candidate profiles | ❌ | ✅ | ✅ |
| Shortlist candidates | ❌ | ✅ | ❌ |
| Manage users | ❌ | ❌ | ✅ |
| Manage platform data | ❌ | ❌ | ✅ |
| Manage assessments | ❌ | ❌ | ✅ |
| Manage opportunities | ❌ | ❌ | ✅ |
| Manage configuration | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |

---

## 11. Proposed Modules

| Module | Description | Dependencies |
|--------|-------------|-------------|
| **Auth** | Registration, login, JWT, RBAC | Database |
| **Profile** | User profile CRUD, career goals | Auth |
| **Resume** | Upload, parse, analyze, score | Auth, Profile, AI Service |
| **Job Match** | Resume-to-JD comparison | Resume, Skills, AI Service |
| **Skills** | Skill taxonomy, extraction, gap analysis | Profile, Resume |
| **Roadmap** | Career roadmap generation and tracking | Skills, Profile, AI Service |
| **Assessment** | Coding question bank, evaluation, analytics | Auth, Skills |
| **Interview** | AI mock interviews with feedback | Auth, Skills, AI Service |
| **Jobs** | Opportunity management, recommendations | Skills, Profile |
| **Dashboard** | Career intelligence aggregation | All modules |
| **Recruiter** | Candidate search, filtering, shortlisting | Auth, Profile, Skills |
| **Admin** | User/platform/content management | Auth, all modules |
| **Notification** | In-app notification delivery | Auth |
| **AI Service** | Centralized AI integration layer | External AI APIs |

---

## 12. Expected Workflows

### 12.1 Resume Analysis Workflow

```
Upload Resume → Validate File → Extract Text → Detect Sections →
Extract Information → Extract Skills → Analyze Quality → Generate Score →
Generate Recommendations → Display Results
```

### 12.2 Career Development Workflow

```
Set Career Goal → Select Target Role → Analyze Current Skills →
Identify Skill Gaps → Generate Roadmap → Complete Roadmap Items →
Track Progress → Update Roadmap → Repeat
```

### 12.3 Interview Preparation Workflow

```
Select Role → Select Difficulty → Start Interview → Receive Question →
Submit Response → Receive Evaluation → Receive Feedback →
Review Improvement Plan → Practice Again
```

### 12.4 Job Matching Workflow

```
Upload/Select Resume → Paste Job Description → Analyze Match →
View Match Score → View Matching Skills → View Missing Skills →
View Improvement Priorities → Apply Improvements
```

### 12.5 Coding Assessment Workflow

```
Browse Topics → Select Assessment → Read Question → Submit Solution →
Run Test Cases → Receive Score → View Analytics →
Identify Weak Areas → Practice Targeted Topics
```

---

## 13. Technology Requirements (from Source)

| Requirement | Decision |
|-------------|----------|
| Web-based platform | Yes — responsive web application |
| AI integration | OpenAI API for NLP tasks (resume analysis, interviews, recommendations) |
| Structured data storage | PostgreSQL with Prisma ORM |
| Session/cache management | Redis |
| Frontend framework | React with Vite |
| Backend framework | Node.js with Express |
| Testing framework | Jest (unit/integration), Playwright (E2E) |
| Containerization | Docker + Docker Compose |
| Code quality | ESLint + Prettier |

---

## 14. Evaluation Criteria (Academic)

Based on SE project evaluation standards:

| Criterion | Weight | How We Address It |
|-----------|--------|-------------------|
| Requirements Engineering | High | Formal SRS, traceability matrix, user stories |
| Architecture & Design | High | Documented architecture, ADRs, diagrams |
| Implementation Quality | High | Clean code, design patterns, modularity |
| Testing | High | Multi-level testing strategy, coverage reports |
| Security | Medium | OWASP-aware, security audit, RBAC |
| Documentation | Medium | Comprehensive docs, API specs, guides |
| Innovation / AI Integration | Medium | Genuine AI features with graceful degradation |
| UI/UX Quality | Medium | Modern, cohesive design identity |
| Deployment & Reproducibility | Medium | Docker, CI/CD, setup automation |
| Project Management | Medium | Milestones, backlog, sprint evidence |

---

## 15. Assumptions

| # | Assumption | Risk if Wrong |
|---|-----------|---------------|
| A1 | OpenAI API is available and functional during development/demo | AI features degrade gracefully; deterministic fallbacks needed |
| A2 | Team has access to a machine capable of running Docker | Provide non-Docker setup instructions as alternative |
| A3 | PostgreSQL and Redis are available locally or via Docker | Docker Compose handles infrastructure |
| A4 | Project evaluation includes live demonstration | System must be runnable on demo day |
| A5 | File uploads are limited to PDF and DOCX formats | Simplifies parsing requirements |
| A6 | Coding assessments evaluate output correctness, not runtime performance | Simplifies evaluation engine |
| A7 | All user interactions are text-based (no video/audio) | Reduces infrastructure requirements |
| A8 | The system serves English-language content only | Simplifies NLP and UI |

---

## 16. Risks

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| R1 | AI API rate limits or downtime | Medium | High | Graceful degradation, caching, retry logic |
| R2 | Scope creep beyond semester timeline | High | Critical | Strict milestone control, MoSCoW prioritization |
| R3 | Resume parsing inaccuracy | Medium | Medium | Multiple parsing strategies, user correction UI |
| R4 | Security vulnerability discovered late | Low | Critical | Security-first design, early audit |
| R5 | Database schema requires major changes mid-project | Medium | High | Prisma migrations, careful upfront design |
| R6 | AI-generated content is inaccurate or harmful | Medium | High | Output validation, human-readable disclaimers |
| R7 | Performance issues with AI-heavy features | Medium | Medium | Async processing, loading states, timeouts |

---

## 17. Existing Design Decisions (from Constitution)

| Decision | Source | Status |
|----------|--------|--------|
| Modular monolith architecture | CLAUDE.md §3 | Accepted |
| React + Vite frontend | CLAUDE.md §4 | Accepted |
| Node.js + Express backend | CLAUDE.md §4 | Accepted |
| PostgreSQL + Prisma data layer | CLAUDE.md §4 | Accepted |
| JWT authentication | CLAUDE.md §4, §6 | Accepted |
| Vanilla CSS (no Tailwind) | CLAUDE.md §4 | Accepted |
| ESM modules only | CLAUDE.md §5 | Accepted |
| Conventional Commits | CLAUDE.md §9 | Accepted |
| Multi-level testing strategy | CLAUDE.md §8 | Accepted |
| Docker-based deployment | CLAUDE.md §20 | Accepted |
