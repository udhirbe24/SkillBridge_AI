# API Design — SkillBridge AI

> **Document ID:** API-001
> **Version:** 1.0.0
> **Created:** 2026-10-06
> **Base URL:** `/api/v1`
> **Format:** JSON
> **Auth:** JWT Bearer Token

---

## 1. API Conventions

### 1.1 Request/Response Format

**Success Response:**
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

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}
```

### 1.2 Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (e.g., email already exists) |
| 422 | Unprocessable Entity | Valid syntax but semantically invalid |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | External service (AI) unavailable |

### 1.3 Pagination

Query parameters for paginated endpoints:
- `page` (default: 1)
- `pageSize` (default: 20, max: 100)
- `sortBy` (field name)
- `sortOrder` (asc | desc)

### 1.4 Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

Refresh tokens are sent/received via httpOnly cookies.

---

## 2. Endpoint Specifications

### 2.1 Authentication — `/api/v1/auth`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/register` | ❌ | — | Register new user |
| POST | `/auth/login` | ❌ | — | Login and receive tokens |
| POST | `/auth/refresh` | Cookie | — | Refresh access token |
| POST | `/auth/logout` | ✅ | Any | Logout (invalidate refresh token) |
| GET | `/auth/me` | ✅ | Any | Get current user info |

**POST `/auth/register`**
```json
// Request
{
  "email": "student@university.edu",
  "password": "SecureP@ss123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@university.edu",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student"
    },
    "accessToken": "jwt..."
  }
}
```

**POST `/auth/login`**
```json
// Request
{
  "email": "student@university.edu",
  "password": "SecureP@ss123"
}

// Response 200
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "student" },
    "accessToken": "jwt..."
  }
}
// + Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
```

### 2.2 Profile — `/api/v1/profile`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/profile` | ✅ | Any | Get own profile |
| PUT | `/profile` | ✅ | Any | Update own profile |
| GET | `/profile/education` | ✅ | Student | Get education records |
| POST | `/profile/education` | ✅ | Student | Add education record |
| PUT | `/profile/education/:id` | ✅ | Student | Update education record |
| DELETE | `/profile/education/:id` | ✅ | Student | Delete education record |
| GET | `/profile/experience` | ✅ | Student | Get experience records |
| POST | `/profile/experience` | ✅ | Student | Add experience record |
| PUT | `/profile/experience/:id` | ✅ | Student | Update experience record |
| DELETE | `/profile/experience/:id` | ✅ | Student | Delete experience record |

### 2.3 Resume — `/api/v1/resumes`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/resumes/upload` | ✅ | Student | Upload resume file |
| GET | `/resumes` | ✅ | Student | List own resumes |
| GET | `/resumes/:id` | ✅ | Student | Get resume details |
| DELETE | `/resumes/:id` | ✅ | Student | Delete resume |
| POST | `/resumes/:id/analyze` | ✅ | Student | Trigger AI analysis |
| GET | `/resumes/:id/analysis` | ✅ | Student | Get latest analysis |
| GET | `/resumes/:id/analyses` | ✅ | Student | Get analysis history |
| POST | `/resumes/:id/match-job` | ✅ | Student | Match against JD |
| GET | `/resumes/:id/matches` | ✅ | Student | Get match history |

**POST `/resumes/upload`**
```
Content-Type: multipart/form-data
Field: resume (file, max 5MB, PDF/DOCX)

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "originalFilename": "john_doe_resume.pdf",
    "fileSize": 245760,
    "mimeType": "application/pdf",
    "createdAt": "2026-10-06T..."
  }
}
```

**POST `/resumes/:id/analyze`**
```json
// Response 200
{
  "success": true,
  "data": {
    "analysisId": "uuid",
    "overallScore": 72.5,
    "scores": {
      "keyword": 68.0,
      "structure": 85.0,
      "completeness": 70.0,
      "readability": 78.0,
      "experience": 65.0
    },
    "sectionsDetected": ["contact", "education", "experience", "skills", "projects"],
    "skillsExtracted": [
      { "name": "JavaScript", "confidence": 0.95, "section": "skills" },
      { "name": "React", "confidence": 0.90, "section": "projects" }
    ],
    "recommendations": [
      {
        "category": "keywords",
        "priority": "high",
        "title": "Add quantifiable achievements",
        "description": "Include metrics and numbers..."
      }
    ]
  }
}
```

**POST `/resumes/:id/match-job`**
```json
// Request
{
  "jobDescription": "We are looking for a Full Stack Developer...",
  "jobTitle": "Full Stack Developer"
}

// Response 200
{
  "success": true,
  "data": {
    "matchScore": 65.0,
    "matchingSkills": ["JavaScript", "React", "Node.js"],
    "missingSkills": ["TypeScript", "AWS", "Docker"],
    "matchingExperience": ["Web development at XYZ Corp"],
    "missingKeywords": ["cloud", "CI/CD", "agile"],
    "improvementPriorities": [
      { "priority": 1, "action": "Add TypeScript experience or projects" },
      { "priority": 2, "action": "Highlight cloud platform exposure" }
    ],
    "explanation": "Your resume matches 65% of the requirements..."
  }
}
```

### 2.4 Skills — `/api/v1/skills`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/skills` | ✅ | Any | Get skill taxonomy |
| GET | `/skills/my` | ✅ | Student | Get my skills |
| POST | `/skills/my` | ✅ | Student | Add skill manually |
| PUT | `/skills/my/:id` | ✅ | Student | Update skill level |
| DELETE | `/skills/my/:id` | ✅ | Student | Remove skill |
| GET | `/skills/gaps` | ✅ | Student | Get skill gaps for target role |
| GET | `/skills/roles` | ✅ | Any | Get target roles |
| GET | `/skills/roles/:id` | ✅ | Any | Get role skill requirements |

### 2.5 Career Goals — `/api/v1/career-goals`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/career-goals` | ✅ | Student | Get career goals |
| POST | `/career-goals` | ✅ | Student | Create career goal |
| PUT | `/career-goals/:id` | ✅ | Student | Update career goal |
| DELETE | `/career-goals/:id` | ✅ | Student | Delete career goal |

### 2.6 Roadmap — `/api/v1/roadmaps`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/roadmaps` | ✅ | Student | Get my roadmaps |
| POST | `/roadmaps/generate` | ✅ | Student | Generate AI roadmap |
| GET | `/roadmaps/:id` | ✅ | Student | Get roadmap with items |
| PATCH | `/roadmaps/:id/items/:itemId` | ✅ | Student | Update item status |
| DELETE | `/roadmaps/:id` | ✅ | Student | Delete roadmap |

### 2.7 Assessments — `/api/v1/assessments`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/assessments` | ✅ | Student | List available assessments |
| GET | `/assessments/:id` | ✅ | Student | Get assessment details |
| GET | `/assessments/:id/questions` | ✅ | Student | Get assessment questions |
| POST | `/assessments/:id/submit` | ✅ | Student | Submit answers |
| GET | `/assessments/submissions` | ✅ | Student | Get submission history |
| GET | `/assessments/analytics` | ✅ | Student | Get performance analytics |

### 2.8 Interviews — `/api/v1/interviews`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/interviews/start` | ✅ | Student | Start mock interview |
| GET | `/interviews/:id` | ✅ | Student | Get interview session |
| POST | `/interviews/:id/respond` | ✅ | Student | Submit response to question |
| POST | `/interviews/:id/complete` | ✅ | Student | End interview |
| GET | `/interviews` | ✅ | Student | List past interviews |
| GET | `/interviews/analytics` | ✅ | Student | Interview performance analytics |

### 2.9 Jobs — `/api/v1/jobs`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/jobs` | ✅ | Any | List jobs (with filters) |
| GET | `/jobs/:id` | ✅ | Any | Get job details |
| POST | `/jobs` | ✅ | Recruiter | Create job posting |
| PUT | `/jobs/:id` | ✅ | Recruiter | Update job posting |
| DELETE | `/jobs/:id` | ✅ | Recruiter | Delete job posting |
| GET | `/jobs/recommendations` | ✅ | Student | Get personalized recommendations |

### 2.10 Dashboard — `/api/v1/dashboard`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/dashboard` | ✅ | Student | Get full dashboard data |
| GET | `/dashboard/readiness` | ✅ | Student | Get career readiness score |
| GET | `/dashboard/activity` | ✅ | Student | Get recent activity |
| GET | `/dashboard/next-action` | ✅ | Student | Get recommended next action |

### 2.11 Recruiter — `/api/v1/recruiter`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/recruiter/candidates` | ✅ | Recruiter | Search candidates |
| GET | `/recruiter/candidates/:id` | ✅ | Recruiter | View candidate profile |
| POST | `/recruiter/shortlist` | ✅ | Recruiter | Add to shortlist |
| GET | `/recruiter/shortlist` | ✅ | Recruiter | View shortlist |
| DELETE | `/recruiter/shortlist/:id` | ✅ | Recruiter | Remove from shortlist |

### 2.12 Admin — `/api/v1/admin`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/admin/users` | ✅ | Admin | List all users |
| GET | `/admin/users/:id` | ✅ | Admin | Get user details |
| PATCH | `/admin/users/:id` | ✅ | Admin | Update user status |
| GET | `/admin/skills` | ✅ | Admin | Manage skills |
| POST | `/admin/skills` | ✅ | Admin | Add skill |
| PUT | `/admin/skills/:id` | ✅ | Admin | Update skill |
| DELETE | `/admin/skills/:id` | ✅ | Admin | Remove skill |
| GET | `/admin/audit-logs` | ✅ | Admin | View audit logs |
| GET | `/admin/stats` | ✅ | Admin | Platform statistics |

### 2.13 Notifications — `/api/v1/notifications`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/notifications` | ✅ | Any | Get notifications |
| PATCH | `/notifications/:id/read` | ✅ | Any | Mark as read |
| PATCH | `/notifications/read-all` | ✅ | Any | Mark all as read |
| GET | `/notifications/unread-count` | ✅ | Any | Get unread count |

---

## 3. Common Query Parameters

### 3.1 Filtering

```
GET /api/v1/jobs?type=internship&experienceLevel=entry&location=remote
GET /api/v1/skills?category=technical&search=javascript
GET /api/v1/admin/users?role=student&isActive=true
```

### 3.2 Sorting

```
GET /api/v1/jobs?sortBy=postedAt&sortOrder=desc
GET /api/v1/assessments?sortBy=difficulty&sortOrder=asc
```

### 3.3 Pagination

```
GET /api/v1/jobs?page=2&pageSize=10
```

---

## 4. Rate Limiting

| Endpoint Group | Limit | Window |
|---------------|-------|--------|
| Auth (login, register) | 5 requests | 1 minute |
| AI endpoints (analyze, match, interview) | 10 requests | 5 minutes |
| General API | 100 requests | 1 minute |
| File uploads | 5 uploads | 10 minutes |

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696593600
```

---

## 5. Middleware Chain

```
Request
  │
  ├── CORS Middleware
  ├── Helmet (Security Headers)
  ├── Body Parser (JSON, 10MB limit)
  ├── Cookie Parser
  ├── Request Logger
  ├── Rate Limiter
  ├── Auth Middleware (extract JWT, attach user)
  ├── RBAC Middleware (check role permissions)
  ├── Validation Middleware (Zod schema)
  ├── Controller Handler
  ├── Error Handler (global)
  │
Response
```
