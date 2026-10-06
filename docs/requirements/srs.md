# Software Requirements Specification (SRS)

## SkillBridge AI — Intelligent Career Development Platform

> **Document ID:** SRS-001
> **Version:** 1.0.0
> **Created:** 2026-10-06
> **Status:** Baseline
> **Classification:** Academic / Internal

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [User Stories & Acceptance Criteria](#4-user-stories--acceptance-criteria)
5. [External Interface Requirements](#5-external-interface-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Data Requirements](#7-data-requirements)
8. [Constraints](#8-constraints)
9. [Appendices](#9-appendices)

---

## 1. Introduction

### 1.1 Purpose

This SRS defines the functional and non-functional requirements for SkillBridge AI, an intelligent career development platform. It serves as the contract between requirements and implementation for the university Software Engineering project.

### 1.2 Scope

SkillBridge AI is a web-based platform that uses AI to provide personalized career development services including resume analysis, skill-gap identification, career roadmap generation, mock interviews, coding assessments, and job recommendations.

### 1.3 Definitions & Acronyms

| Term | Definition |
|------|-----------|
| ATS | Applicant Tracking System |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |
| PII | Personally Identifiable Information |
| JD | Job Description |
| NLP | Natural Language Processing |
| RAG | Retrieval-Augmented Generation |
| SRS | Software Requirements Specification |

### 1.4 References

- `CLAUDE.md` — Engineering Constitution
- `docs/project-analysis.md` — Project Analysis

---

## 2. Overall Description

### 2.1 Product Perspective

SkillBridge AI is a self-contained web application. It does not integrate with external job boards or university systems. It uses external AI APIs (OpenAI) for NLP capabilities but operates independently otherwise.

### 2.2 Product Functions (Summary)

```
┌─────────────────────────────────────────────────────────────┐
│                      SkillBridge AI                         │
│                                                             │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │  Auth &  │  │  Resume   │  │  Skill   │  │  Career    │   │
│  │ Profiles │  │  Intel    │  │  Intel   │  │  Roadmap   │   │
│  └─────────┘  └──────────┘  └──────────┘  └────────────┘   │
│                                                             │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │ Coding  │  │    AI     │  │   Job    │  │  Career    │   │
│  │ Assess  │  │ Interview │  │  Match   │  │ Dashboard  │   │
│  └─────────┘  └──────────┘  └──────────┘  └────────────┘   │
│                                                             │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐                    │
│  │Recruiter│  │  Admin   │  │ Notific  │                    │
│  │ Portal  │  │  Panel   │  │  ations  │                    │
│  └─────────┘  └──────────┘  └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 User Classes

| Role | Description | Frequency of Use |
|------|-------------|-----------------|
| **Student** | Primary user — uses all career development features | Daily/Weekly |
| **Recruiter** | Posts opportunities, searches candidates | Weekly |
| **Admin** | Manages platform, users, and content | As needed |

### 2.4 Operating Environment

- **Client:** Modern web browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)
- **Server:** Node.js 20.x LTS on Linux/Docker
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **AI:** OpenAI API (GPT-4 / GPT-3.5-turbo)

### 2.5 Design Constraints

- Must use React + Vite for frontend (per CLAUDE.md §4)
- Must use Node.js + Express for backend (per CLAUDE.md §4)
- Must use PostgreSQL + Prisma for data (per CLAUDE.md §4)
- Must use Vanilla CSS, not Tailwind (per CLAUDE.md §4)
- Must use ESM modules exclusively (per CLAUDE.md §5)

---

## 3. System Features

### 3.1 Feature Priority Matrix

| Feature | MoSCoW | Milestone |
|---------|--------|-----------|
| Authentication & RBAC | Must | M1 |
| User Profiles & Career Goals | Must | M1 |
| Resume Upload & Parsing | Must | M2 |
| Resume AI Analysis & Scoring | Must | M2 |
| Job Description Matching | Must | M2 |
| Skill Taxonomy & Extraction | Must | M3 |
| Skill Gap Analysis | Must | M3 |
| Career Roadmap Generation | Must | M4 |
| Roadmap Progress Tracking | Must | M4 |
| Coding Assessment Engine | Must | M5 |
| Assessment Analytics | Must | M5 |
| AI Mock Interviews | Must | M6 |
| Interview Feedback | Must | M6 |
| Job Recommendations | Should | M7 |
| Career Dashboard | Must | M8 |
| Advanced Visualizations | Should | M8 |
| Recruiter Portal | Should | M9 |
| Admin Panel | Must | M9 |
| Notification System | Should | M9 |
| Security Hardening | Must | M10 |
| Final Polish & Deployment | Must | M11 |

---

## 4. User Stories & Acceptance Criteria

### Epic: Authentication (AUTH)

#### US-AUTH-01: User Registration

> As a **new user**, I want to **register with my email, name, and role** so that I can **access the platform**.

**Acceptance Criteria:**
- [ ] Registration form validates email format, password strength (min 8 chars, 1 uppercase, 1 number, 1 special)
- [ ] System checks for duplicate email addresses
- [ ] Password is hashed with bcrypt (12 rounds) before storage
- [ ] User receives a success confirmation
- [ ] System assigns selected role (Student/Recruiter)
- [ ] JWT access token and refresh token are issued upon successful registration

#### US-AUTH-02: User Login

> As a **registered user**, I want to **login with email and password** so that I can **access my account**.

**Acceptance Criteria:**
- [ ] System validates credentials against stored hash
- [ ] Failed attempts are tracked per account
- [ ] After 5 failed attempts, account locks for 15 minutes
- [ ] Successful login issues JWT access token (15 min) and refresh token (7 days)
- [ ] Rate limiting: max 5 attempts per minute per IP

#### US-AUTH-03: Token Refresh

> As a **logged-in user**, I want my **session to remain active** so that I **don't have to re-login frequently**.

**Acceptance Criteria:**
- [ ] Client automatically refreshes access token using refresh token before expiry
- [ ] Refresh token is stored in httpOnly, Secure, SameSite=Strict cookie
- [ ] Expired refresh tokens return 401 and redirect to login

#### US-AUTH-04: Logout

> As a **logged-in user**, I want to **logout** so that my **session is terminated securely**.

**Acceptance Criteria:**
- [ ] Server invalidates the refresh token
- [ ] Client clears all stored tokens
- [ ] Subsequent requests with the old token return 401

---

### Epic: Profile Management (PROF)

#### US-PROF-01: Create/Edit Student Profile

> As a **student**, I want to **create and edit my profile** so that the **platform can personalize my experience**.

**Acceptance Criteria:**
- [ ] Student can set: full name, bio, university, degree, graduation year, location
- [ ] Student can add education history (institution, degree, field, GPA, dates)
- [ ] Student can add work experience (company, title, description, dates)
- [ ] All fields validated on both client and server
- [ ] Profile updates are persisted immediately

#### US-PROF-02: Set Career Goals

> As a **student**, I want to **set my career goals and target roles** so that the **platform can generate relevant recommendations**.

**Acceptance Criteria:**
- [ ] Student can select target role(s) from a curated list
- [ ] Student can describe career aspirations in free text
- [ ] System uses career goals as input for roadmap and recommendations
- [ ] Goals can be updated at any time

---

### Epic: Resume Intelligence (RES)

#### US-RES-01: Upload Resume

> As a **student**, I want to **upload my resume** so that the **platform can analyze it**.

**Acceptance Criteria:**
- [ ] System accepts PDF and DOCX files only
- [ ] Maximum file size: 5MB
- [ ] Invalid files are rejected with a clear error message
- [ ] File is stored securely with access control
- [ ] Previous uploads are preserved (history)

#### US-RES-02: Resume Analysis

> As a **student**, I want to **receive an AI-powered analysis of my resume** so that I can **improve it**.

**Acceptance Criteria:**
- [ ] System extracts text from the uploaded document
- [ ] System identifies sections: contact, education, experience, skills, projects, certifications
- [ ] System extracts skills from resume content
- [ ] System generates an ATS-oriented evaluation with category scores
- [ ] System provides specific, actionable improvement recommendations
- [ ] Analysis results are persisted for future reference
- [ ] If AI service is unavailable, system shows an honest error (no fake results)

#### US-RES-03: Job Description Match

> As a **student**, I want to **compare my resume against a job description** so that I can **tailor my application**.

**Acceptance Criteria:**
- [ ] Student can paste or upload a job description
- [ ] System generates a match score with breakdown
- [ ] System lists matching skills, missing skills, and relevant experience
- [ ] System provides prioritized improvement recommendations
- [ ] System explains the scoring methodology
- [ ] Matching does not claim to reproduce any proprietary ATS

---

### Epic: Skill Intelligence (SKILL)

#### US-SK-01: View Skill Inventory

> As a **student**, I want to **see all my identified skills** so that I can **understand my current capabilities**.

**Acceptance Criteria:**
- [ ] Skills are extracted from resume and assessment results
- [ ] Skills are categorized (technical, soft, domain-specific)
- [ ] Each skill shows proficiency level and source
- [ ] Skills update automatically when new data is available

#### US-SK-02: Skill Gap Analysis

> As a **student**, I want to **see which skills I'm missing for my target role** so that I can **focus my development**.

**Acceptance Criteria:**
- [ ] System compares user skills against target role requirements
- [ ] Missing skills are listed with priority ranking
- [ ] System recommends learning order based on impact and prerequisites
- [ ] Visualization clearly shows coverage vs. gaps

---

### Epic: Career Roadmap (ROAD)

#### US-ROAD-01: Generate Roadmap

> As a **student**, I want to **receive a personalized career roadmap** so that I have a **clear path to my career goal**.

**Acceptance Criteria:**
- [ ] Roadmap is generated using: current skills, target role, resume data, assessment performance, career goals
- [ ] Each item includes: skill, objective, recommended action, resource link, assessment reference
- [ ] Items are ordered by priority and prerequisites
- [ ] Roadmap is visually presented as a progressive timeline

#### US-ROAD-02: Track Roadmap Progress

> As a **student**, I want to **mark roadmap items as complete** and **see my progress** so that I stay **motivated and on track**.

**Acceptance Criteria:**
- [ ] User can mark items as: Not Started, In Progress, Complete
- [ ] Progress percentage updates automatically
- [ ] Completion is reflected in dashboard metrics
- [ ] Roadmap adapts recommendations based on completed items

---

### Epic: Coding Assessment (ASSESS)

#### US-AS-01: Take Assessment

> As a **student**, I want to **complete coding assessments** so that I can **evaluate and improve my technical skills**.

**Acceptance Criteria:**
- [ ] Questions organized by topic (data structures, algorithms, databases, etc.) and difficulty
- [ ] Timer tracks time spent per question
- [ ] Submissions evaluated against predefined test cases
- [ ] Immediate score and feedback after submission
- [ ] Attempt history preserved

#### US-AS-02: View Assessment Analytics

> As a **student**, I want to **see my assessment performance analytics** so that I can **identify weak areas**.

**Acceptance Criteria:**
- [ ] Analytics show: overall accuracy, per-topic accuracy, difficulty breakdown
- [ ] Trend charts show improvement over time
- [ ] Weak areas are highlighted with recommendations
- [ ] Analytics feed into skill assessment and roadmap

---

### Epic: AI Mock Interview (INTV)

#### US-IV-01: Conduct Mock Interview

> As a **student**, I want to **practice interviews with AI** so that I can **prepare for real interviews**.

**Acceptance Criteria:**
- [ ] Student selects target role and difficulty level
- [ ] AI generates relevant interview questions
- [ ] Student provides text-based responses
- [ ] AI evaluates each response on: correctness, relevance, completeness, communication structure
- [ ] AI provides specific feedback with improvement suggestions
- [ ] Interview session is saved for review

#### US-IV-02: Review Interview History

> As a **student**, I want to **review past interview sessions** so that I can **track my improvement**.

**Acceptance Criteria:**
- [ ] Past sessions are listed with date, role, difficulty, and overall score
- [ ] Student can view full question-response-feedback details
- [ ] Aggregate trends are visible (improvement over time)

---

### Epic: Job Recommendations (JOBS)

#### US-JB-01: View Recommendations

> As a **student**, I want to **see job/internship recommendations** so that I can **find relevant opportunities**.

**Acceptance Criteria:**
- [ ] Recommendations are based on: skills, target role, experience, education, resume
- [ ] Each recommendation shows: title, company, match %, matching skills, missing skills
- [ ] Recommendations include an explanation of why it was recommended
- [ ] No unexplained arbitrary scores

---

### Epic: Dashboard (DASH)

#### US-DA-01: Career Intelligence Dashboard

> As a **student**, I want to **see a unified dashboard of my career readiness** so that I can **understand my overall progress**.

**Acceptance Criteria:**
- [ ] Dashboard shows: career readiness score, resume score, skill coverage, skill gaps
- [ ] Dashboard shows: roadmap progress, coding performance, interview readiness
- [ ] Dashboard shows: recommended next action, recent activity
- [ ] Every metric has a documented calculation methodology
- [ ] No fake precision (e.g., "87.3% ready" without a clear methodology)
- [ ] Dashboard loads within 3 seconds

---

### Epic: Recruiter (RECRUIT)

#### US-RC-01: Post Opportunities

> As a **recruiter**, I want to **post job/internship opportunities** so that **students can discover them**.

**Acceptance Criteria:**
- [ ] Recruiter can create, edit, and deactivate opportunities
- [ ] Each opportunity includes: title, description, required skills, location, type
- [ ] Required skills are selected from the platform's skill taxonomy

#### US-RC-02: Search Candidates

> As a **recruiter**, I want to **search and filter candidates** so that I can **find qualified applicants**.

**Acceptance Criteria:**
- [ ] Search by skills, education, experience level
- [ ] Filter results by multiple criteria
- [ ] View candidate profile summaries (with consent framework)
- [ ] Shortlist candidates for further review

---

### Epic: Administration (ADMIN)

#### US-AD-01: User Management

> As an **admin**, I want to **manage platform users** so that I can **maintain platform integrity**.

**Acceptance Criteria:**
- [ ] View all users with search and filter
- [ ] Activate/deactivate user accounts
- [ ] View user activity summary
- [ ] Cannot modify user career data

#### US-AD-02: Content Management

> As an **admin**, I want to **manage platform content** (skills, resources, assessments) so that the **platform stays current**.

**Acceptance Criteria:**
- [ ] CRUD operations on skill taxonomy
- [ ] CRUD operations on assessment question bank
- [ ] CRUD operations on opportunity listings
- [ ] View audit logs of administrative actions

---

## 5. External Interface Requirements

### 5.1 User Interfaces

- Single-page application (SPA) built with React
- Responsive layout (desktop-first, mobile-friendly)
- Consistent design language with SkillBridge AI brand identity
- Loading states for all async operations
- Error states with actionable messages
- Empty states with helpful guidance

### 5.2 API Interfaces

- RESTful API over HTTPS
- Base URL: `/api/v1/`
- JSON request/response bodies
- JWT Bearer token authentication
- Consistent error response format
- Pagination: cursor-based or offset-based with `page` and `pageSize`

### 5.3 External System Interfaces

| System | Interface | Purpose |
|--------|-----------|---------|
| OpenAI API | REST (HTTPS) | Resume analysis, interview Q&A, skill extraction, roadmap generation |
| File System | Server local / cloud storage | Resume file storage |

---

## 6. Non-Functional Requirements

(Detailed in `docs/project-analysis.md` §9 — NFR-01 through NFR-33)

**Summary of critical NFRs:**

- Security: bcrypt, JWT, RBAC, input validation, security headers
- Performance: <3s page load, <500ms API (non-AI), <10s AI features
- Reliability: Graceful AI degradation, no data loss
- Testability: ≥80% unit coverage, integration tests for all APIs
- Reproducibility: Clone-to-running ≤10 minutes

---

## 7. Data Requirements

### 7.1 Entity-Relationship Overview

```
User ──┬── StudentProfile ──── CareerGoal
       │         │
       │         ├── Resume ──── ResumeAnalysis
       │         │
       │         ├── UserSkill ──── SkillGap
       │         │
       │         ├── CareerRoadmap ──── RoadmapItem
       │         │
       │         ├── Submission ──── Assessment ──── Question
       │         │
       │         ├── Interview ──── InterviewQuestion ──── InterviewResponse
       │         │
       │         └── ProgressRecord
       │
       ├── RecruiterProfile
       │
       └── Role

Skill ──── JobSkill ──── Job ──── Recommendation

Notification ──── User

AuditLog
```

### 7.2 Data Retention

| Data Type | Retention | Notes |
|-----------|----------|-------|
| User account | Until deletion requested | Soft delete, PII purge within 30 days |
| Resume files | Until user deletes | Encrypted at rest |
| Analysis results | Indefinite (user-accessible) | Tied to resume version |
| Session tokens | 7 days max | Auto-expired |
| Audit logs | 1 year | Anonymized after retention period |
| Interview logs | 90 days active, then archived | User can request deletion |

---

## 8. Constraints

| # | Constraint | Impact |
|---|-----------|--------|
| C1 | Academic semester timeline | Prioritize Must Have features; defer Should Have if needed |
| C2 | OpenAI API cost | Rate limit AI calls per user; cache repeated queries |
| C3 | Single-developer feasibility | Architecture must be manageable by a small team |
| C4 | No real ATS replication | Brand as "ATS-oriented evaluation" not "ATS simulation" |
| C5 | Browser-only interface | No native mobile apps |
| C6 | English language only | No i18n required |

---

## 9. Appendices

### 9.1 Traceability Matrix (Partial — Full version in docs/traceability/)

| Requirement | User Story | Module | Milestone |
|-------------|-----------|--------|-----------|
| FR-AUTH-01 | US-AUTH-01 | Auth | M1 |
| FR-AUTH-02 | US-AUTH-02 | Auth | M1 |
| FR-AUTH-05 | US-AUTH-01, US-AUTH-02 | Auth | M1 |
| FR-RES-01 | US-RES-01 | Resume | M2 |
| FR-RES-07 | US-RES-02 | Resume | M2 |
| FR-JM-02 | US-RES-03 | Job Match | M2 |
| FR-SK-03 | US-SK-02 | Skills | M3 |
| FR-RM-01 | US-ROAD-01 | Roadmap | M4 |
| FR-AS-01 | US-AS-01 | Assessment | M5 |
| FR-IV-02 | US-IV-01 | Interview | M6 |
| FR-JB-02 | US-JB-01 | Jobs | M7 |
| FR-DA-01 | US-DA-01 | Dashboard | M8 |

### 9.2 Glossary

| Term | Definition |
|------|-----------|
| Career Readiness Score | Composite metric reflecting skill coverage, resume quality, interview performance, and assessment results |
| ATS-Oriented Evaluation | SkillBridge AI's analysis of resume quality using criteria commonly used by applicant tracking systems |
| Skill Taxonomy | Hierarchical structure: Career → Role → Skill Category → Skill → Subskill |
| Roadmap Item | Single actionable unit in a career roadmap: skill + objective + action + resource |
| Match Score | Calculated alignment between a user's profile/resume and a job description or role requirements |
