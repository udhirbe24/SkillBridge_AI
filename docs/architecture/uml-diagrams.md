# Visual & UML Architecture Diagrams — SkillBridge AI

> **Document ID:** ARCH-UML-001  
> **Version:** 1.0.0  
> **Created:** 2026-10-06  
> **Status:** Approved Baseline  

---

## 1. System Use Case Diagram

```mermaid
graph TD
    subgraph Users
        S[Student / Job Seeker]
        R[Recruiter / Employer]
        A[Platform Administrator]
        E[University Evaluator]
    end

    subgraph SkillBridge AI Platform
        UC1[UC-01: Profile & Resume Processing]
        UC2[UC-02: AI Skill Gap Analysis]
        UC3[UC-03: RAG Personalized Roadmap Generation]
        UC4[UC-04: Interactive Interview Simulation]
        UC5[UC-05: Real-time Job Matching]
        UC6[UC-06: Candidate Search & Filter]
        UC7[UC-07: Post Job Listing]
        UC8[UC-08: Analytical Dashboard Viewing]
        UC9[UC-09: User & System Administration]
        UC10[UC-10: RAG Precision & Audit Verification]
    end

    S --> UC1
    S --> UC2
    S --> UC3
    S --> UC4
    S --> UC5
    
    R --> UC5
    R --> UC6
    R --> UC7
    
    A --> UC8
    A --> UC9
    
    E --> UC8
    E --> UC10
```

---

## 2. Dynamic Sequence Diagrams

### 2.1 Sequence 01: Resume Upload & RAG Skill Gap Analysis Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student User
    participant WebApp as Web Client (Next.js)
    participant API as API Gateway (Node/FastAPI)
    participant Parser as Resume Parser Worker
    participant VectorDB as Qdrant Vector Store
    participant LLM as LLM Engine (DeepSeek/OpenAI)
    participant DB as PostgreSQL DB

    Student->>WebApp: Upload PDF Resume
    WebApp->>API: POST /api/v1/resumes/upload (Multipart FormData)
    API->>DB: Save raw file record (status: PENDING)
    API->>Parser: Dispatch Background Task (resume_id)
    API-->>WebApp: 202 Accepted (Job ID)
    
    activate Parser
    Parser->>Parser: Extract text (pdf-parse / PyMuPDF)
    Parser->>LLM: Structure extraction (Skills, Experience, Education)
    LLM-->>Parser: Structured JSON Payload
    Parser->>VectorDB: Generate & Store Embeddings (Text-embedding-3-small)
    Parser->>DB: Update Profile & Skill Entities (status: COMPLETED)
    deactivate Parser

    Student->>WebApp: View Skill Gap Analysis
    WebApp->>API: GET /api/v1/skills/gap-analysis
    API->>VectorDB: Hybrid Search (Candidate Skills vs Target Role Benchmark)
    VectorDB-->>API: Similarity Scores & Missing Skill Vectors
    API->>LLM: Generate Tailored Recommendations (Context: Gap Vectors)
    LLM-->>API: Skill Gap Summary & Learning Path
    API-->>WebApp: 200 OK (Gap Analysis JSON)
    WebApp-->>Student: Display Dynamic Gap Chart & Roadmap
```

### 2.2 Sequence 02: AI Interview Simulator Loop

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student User
    participant Client as Web Client (WebSocket/WebRTC)
    participant WSS as Interview WS Handler
    participant RAG as RAG Retrieval Service
    participant Evaluator as Audio/Text Evaluator
    participant DB as Postgres Store

    Student->>Client: Start Interview Session (Target Role: Fullstack Dev)
    Client->>WSS: Connect ws://api.skillbridge.ai/ws/interview/{session_id}
    WSS->>DB: Validate Token & Initialize Session
    WSS->>RAG: Retrieve Question Bank (Role, Difficulty, User Gaps)
    RAG-->>WSS: Contextual Question Prompts
    WSS-->>Client: Send Question 1 (Audio + Text Payload)

    loop Interview Question Cycle
        Student->>Client: Record Audio / Submit Text Answer
        Client->>WSS: Stream Audio/Text Chunk
        WSS->>Evaluator: STT + LLM Sentiment/Technical Scoring
        Evaluator-->>WSS: Score (0-100), Clarity, Key Concept Match
        WSS->>DB: Store Answer & Real-time Evaluation
        WSS-->>Client: Feedback + Next Question Prompt
    end

    Student->>Client: Complete Interview Session
    WSS->>DB: Finalize Session Score & Performance Breakdown
    WSS-->>Client: Session Completed + Redirect to Analytics Report
```

---

## 3. Structural Component Architecture Diagram

```mermaid
graph TB
    subgraph Client Layer
        Web[Next.js 14 React Web Application]
        Mobile[Responsive PWA Interface]
    end

    subgraph API Gateway & Edge
        Nginx[Nginx Reverse Proxy / Load Balancer]
        Gateway[FastAPI / Express API Gateway]
        Auth[OAuth2 / JWT Auth Middleware]
    end

    subgraph Application Service Layer
        UserService[User & Profile Management Service]
        SkillService[Skill Assessment & Gap Engine]
        RAGService[RAG Engine & Vector Orchestrator]
        InterviewService[AI Mock Interview Engine]
        MatchingService[Recruiter & Job Matchmaking Service]
        AnalyticsService[Analytics & Reporting Engine]
    end

    subgraph Storage & Data Layer
        PrimaryDB[(PostgreSQL 16 - Relational Store)]
        VectorDB[(Qdrant / ChromaDB - Vector Store)]
        CacheDB[(Redis 7 - Session & Cache Store)]
        ObjectStore[(MinIO / S3 - Resume & Audio Files)]
    end

    Web --> Nginx
    Mobile --> Nginx
    Nginx --> Gateway
    Gateway --> Auth
    Auth --> UserService
    Auth --> SkillService
    Auth --> RAGService
    Auth --> InterviewService
    Auth --> MatchingService
    Auth --> AnalyticsService

    UserService --> PrimaryDB
    SkillService --> PrimaryDB
    SkillService --> VectorDB
    RAGService --> VectorDB
    RAGService --> PrimaryDB
    RAGService --> CacheDB
    InterviewService --> PrimaryDB
    InterviewService --> ObjectStore
    MatchingService --> PrimaryDB
    MatchingService --> VectorDB
    AnalyticsService --> PrimaryDB
    AnalyticsService --> CacheDB
```

---

## 4. Class & Data Entity Diagram

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String passwordHash
        +Role role
        +Boolean isVerified
        +DateTime createdAt
        +register()
        +login()
        +getProfile()
    }

    class StudentProfile {
        +UUID id
        +UUID userId
        +String fullName
        +String headline
        +String targetRole
        +Float readinessScore
        +String resumeUrl
        +JSON metadata
        +calculateReadiness()
    }

    class Skill {
        +UUID id
        +String name
        +String category
        +SkillLevel level
        +Vector embedding
    }

    class StudentSkill {
        +UUID studentId
        +UUID skillId
        +ProficiencyLevel proficiency
        +VerificationStatus status
        +DateTime assessedAt
    }

    class CareerRoadmap {
        +UUID id
        +UUID studentId
        +String title
        +String targetRole
        +List~Milestone~ milestones
        +Float progressPercent
        +generateRAGRoadmap()
    }

    class InterviewSession {
        +UUID id
        +UUID studentId
        +String roleCategory
        +Integer overallScore
        +SessionStatus status
        +DateTime startedAt
        +DateTime completedAt
        +evaluateResponse()
    }

    class JobPosting {
        +UUID id
        +UUID recruiterId
        +String title
        +String companyName
        +List~String~ requiredSkills
        +String location
        +Money salaryRange
        +Boolean isActive
    }

    User "1" -- "1" StudentProfile : has
    StudentProfile "1" -- "0..*" StudentSkill : possesses
    Skill "1" -- "0..*" StudentSkill : categorized_by
    StudentProfile "1" -- "0..*" CareerRoadmap : guided_by
    StudentProfile "1" -- "0..*" InterviewSession : practices
    User "1" -- "0..*" JobPosting : creates
```

---

## 5. State Machine Diagrams

### 5.1 Interview Session State Transition

```mermaid
stateDiagram-v2
    [*] --> Initialized: Student Requests Session
    Initialized --> LoadingContext: RAG Fetches Questions
    LoadingContext --> InProgress: Questions Loaded & Client Ready
    
    state InProgress {
        [*] --> QuestionPrompted
        QuestionPrompted --> RecordingAnswer: User Speaks / Types
        RecordingAnswer --> Evaluating: Answer Submitted
        Evaluating --> FeedbackReady: Evaluation Finished
        FeedbackReady --> QuestionPrompted: Next Question Available
    }

    InProgress --> Paused: Connection Interrupted / User Pause
    Paused --> InProgress: User Resumes
    InProgress --> Finalizing: All Questions Answered
    Finalizing --> Completed: Overall Report Generated
    InProgress --> Terminated: User Aborts Session
    Completed --> [*]
    Terminated --> [*]
```

---

## 6. Physical Deployment Architecture

```mermaid
graph TD
    subgraph Client Environment
        Browser[Modern Web Browser Chrome/Firefox/Safari]
    end

    subgraph AWS / Cloud Infrastructure / Docker Swarm
        subgraph Ingress / Security Boundary
            ALB[Application Load Balancer / TLS Ingress]
            WAF[AWS WAF / Cloudflare DDoS Protection]
        end

        subgraph Container Cluster (Kubernetes / Docker Compose)
            Pod1[Web Frontend App Node 1]
            Pod2[Web Frontend App Node 2]
            Pod3[FastAPI Backend Engine Pod 1]
            Pod4[FastAPI Backend Engine Pod 2]
            Pod5[Celery / Async Task Worker Pod]
        end

        subgraph Managed Data Services
            RDS[(AWS RDS PostgreSQL Multi-AZ)]
            QdrantCloud[(Qdrant Vector DB Cluster)]
            RedisCluster[(ElastiCache Redis Cluster)]
            S3Bucket[(AWS S3 Object Store - Media/Resumes)]
        end
    end

    Browser --> WAF
    WAF --> ALB
    ALB --> Pod1
    ALB --> Pod2
    Pod1 --> Pod3
    Pod2 --> Pod4
    Pod3 --> Pod5
    Pod4 --> Pod5

    Pod3 --> RDS
    Pod4 --> RDS
    Pod3 --> QdrantCloud
    Pod4 --> QdrantCloud
    Pod3 --> RedisCluster
    Pod4 --> RedisCluster
    Pod5 --> S3Bucket
```

---
*End of Document: Visual & UML Architecture Diagrams*
