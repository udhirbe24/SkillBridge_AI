# ADR-001: Technology Stack Selection

## Status: Accepted

## Date: 2026-10-06

## Context

SkillBridge AI requires a full-stack web technology selection that balances:
- Reliability and maturity
- Student feasibility (learning curve, documentation)
- AI integration capability
- Testing ecosystem
- Deployment simplicity
- Academic defensibility

## Decision

### Frontend
- **React 18** — Industry-standard component framework with extensive ecosystem, documentation, and community support. Chosen over Vue.js (smaller ecosystem for this use case) and Angular (steeper learning curve, heavier framework).
- **Vite 5** — Modern build tool with fast HMR and ESM-native support. Chosen over Create React App (deprecated maintenance) and Webpack (slower, more complex configuration).
- **Vanilla CSS + CSS Modules** — Maximum flexibility without framework lock-in. Chosen over Tailwind CSS (utility-class clutter, opinionated) and styled-components (runtime overhead, mixing concerns).

### Backend
- **Node.js 20 LTS** — Full-stack JavaScript consistency reduces context switching. LTS ensures stability. Chosen over Python/Django (separate language) and Go (overkill for this scope).
- **Express.js 4** — Lightweight, flexible, extensively documented. Chosen over Fastify (smaller community) and Nest.js (too opinionated for learning purposes).

### Database
- **PostgreSQL 15** — Robust relational database with JSON support, excellent for structured career/skill data. Chosen over MongoDB (relational data needs foreign keys) and MySQL (PostgreSQL has better feature set).
- **Prisma 5** — Type-safe ORM with excellent migration tooling and developer experience. Chosen over Sequelize (older API, weaker types) and Knex (query builder, not full ORM).

### Cache
- **Redis 7** — Industry standard for session storage, rate limiting, and caching. No serious alternatives at this scope.

### Authentication
- **JWT + bcrypt** — Stateless authentication suitable for SPA architecture. bcrypt provides industry-standard password hashing.

### Validation
- **Zod** — TypeScript-first schema validation with excellent DX and composability. Chosen over Joi (heavier, less modern API) and Yup (weaker ecosystem).

### Testing
- **Jest** — Standard JavaScript testing framework with excellent mocking and coverage.
- **Supertest** — HTTP assertion library for Express integration tests.
- **Playwright** — Cross-browser E2E testing with modern API. Chosen over Cypress (slower, limited cross-browser).

### AI
- **OpenAI API (GPT-4 / GPT-3.5-turbo)** — Leading NLP API with structured output support. Sufficient for resume analysis, interview generation, and recommendation tasks.

### DevOps
- **Docker + Docker Compose** — Reproducible development and deployment environments.
- **ESLint + Prettier** — Industry-standard linting and formatting.

## Consequences

### Positive
- Full-stack JavaScript reduces cognitive load
- All technologies are well-documented and community-supported
- Stack is defensible in academic evaluation
- Testing ecosystem is mature across all layers
- Docker ensures reproducibility

### Negative
- Node.js single-threaded model may bottleneck on CPU-intensive tasks (mitigated: AI work is I/O-bound via API calls)
- Express lacks built-in validation/structure (mitigated: modular architecture with Zod)
- OpenAI API introduces external dependency and cost (mitigated: graceful degradation, caching, rate limiting)

### Risks
- OpenAI API pricing may increase → Monitor costs, implement per-user limits
- Prisma may have edge cases with complex queries → Use raw queries as escape hatch if needed

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Next.js (full-stack) | SSR adds complexity without clear benefit for this SPA use case |
| Python/FastAPI backend | Language context-switching, separate ecosystems |
| MongoDB | Relational data model (users → skills → jobs) benefits from PostgreSQL |
| Tailwind CSS | Utility classes obscure component structure; Vanilla CSS is more educational |
| TypeScript | Adds compilation step; JSDoc provides sufficient type documentation for this scope |

---

# ADR-002: Modular Monolith Architecture

## Status: Accepted

## Date: 2026-10-06

## Context

The system needs an architectural pattern that supports:
- Clear module boundaries (auth, resume, skills, etc.)
- Simple deployment
- Small team development
- Academic demonstrability
- Future extensibility

Options considered: monolith, modular monolith, microservices, serverless.

## Decision

**Modular Monolith** — A single deployable application with internally separated feature modules, each with its own routes, controllers, services, and data access.

### Module Structure
```
server/src/modules/
├── auth/           ← Self-contained auth module
├── resume/         ← Self-contained resume module
├── skills/         ← Self-contained skills module
├── roadmap/        ← Self-contained roadmap module
├── assessment/     ← Self-contained assessment module
├── interview/      ← Self-contained interview module
├── jobs/           ← Self-contained jobs module
├── dashboard/      ← Aggregation module (reads from others)
├── recruiter/      ← Self-contained recruiter module
├── admin/          ← Self-contained admin module
└── notification/   ← Self-contained notification module
```

### Rules
1. Modules communicate through service-level interfaces, not by importing each other's repositories directly.
2. Each module owns its Prisma model definitions (collocated), but all share a single database.
3. Cross-module queries go through the dependent module's service.
4. The Dashboard module is a special aggregation module that reads from multiple module services.

## Consequences

### Positive
- Simple deployment (one app, one Docker container)
- Easy debugging (single process, no network hops)
- Clear boundaries prepare for potential future decomposition
- Academically explainable and defensible
- Fast development iteration

### Negative
- Modules share a database (tight coupling at data layer)
- Must enforce boundaries through convention, not technology
- Large codebases may become unwieldy (not a concern at this scale)

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Microservices | Over-engineered for team size and scope; introduces distributed systems complexity |
| Pure monolith | No internal boundaries; harder to maintain and demonstrate modularity |
| Serverless | Vendor lock-in, cold start latency, harder to test locally |

---

# ADR-003: AI Integration Strategy

## Status: Accepted

## Date: 2026-10-06

## Context

Multiple features require AI/NLP capabilities. The architecture must define how AI is integrated, what the fallback strategy is, and how costs are controlled.

## Decision

### Centralized AI Service
All AI interactions go through a single `AIService` class in `server/src/shared/ai/`. No module calls OpenAI directly.

### Prompt Management
- Prompts are stored as versioned templates in `server/src/shared/ai/prompts/`
- Each prompt is a function that accepts structured input and returns a formatted prompt string
- Prompts are version-controlled and testable

### Structured Output
- All AI calls request JSON-formatted responses
- Responses are validated against Zod schemas before use
- Invalid responses trigger retry (once) then fallback

### Graceful Degradation Strategy
1. **Retry:** One automatic retry with exponential backoff
2. **Cache:** Serve cached result if available (Redis, TTL per feature)
3. **Partial:** Return deterministic partial result (e.g., rule-based scoring) with AI-enhanced fields marked as unavailable
4. **Error:** Show honest error message to user — never fake AI results

### Cost Control
- Per-user rate limits (configurable via env vars)
- AI response caching (identical inputs → cached response)
- Use GPT-3.5-turbo for simpler tasks, GPT-4 for complex analysis
- Monitor token usage per feature

## Consequences

### Positive
- Single point of AI integration simplifies maintenance
- Structured prompts are testable and version-controlled
- Graceful degradation ensures app remains functional
- Cost is controlled and monitorable

### Negative
- Centralized service is a single point of failure (mitigated by fallbacks)
- Prompt engineering requires iteration and testing
- AI output quality depends on prompt design

---

# ADR-004: RAG Not Implemented

## Status: Accepted

## Date: 2026-10-06

## Context

Retrieval-Augmented Generation (RAG) was evaluated for career guidance, skill resources, and interview preparation.

## Decision

RAG will **not** be implemented in the initial version.

## Rationale

1. **No large corpus:** The platform does not maintain a large, evolving document corpus requiring semantic search.
2. **Structured data suffices:** Skill taxonomy, career paths, and learning resources are structured database records, efficiently queryable without vector search.
3. **LLM general knowledge:** GPT-4 has sufficient general knowledge about careers, skills, and industries for the guidance tasks required.
4. **Complexity cost:** RAG requires vector database (Pinecone/pgvector), embedding pipeline, chunking strategy, retrieval ranking — significant complexity for marginal benefit.
5. **Focus:** Engineering effort is better spent on core features (resume analysis, assessments, interviews) than on RAG infrastructure.

## Future Trigger

Reconsider RAG if:
- The platform adds a large corpus of curated career articles, university resources, or industry reports
- Users need answers grounded in specific, updateable documents
- General LLM knowledge proves insufficient for domain-specific guidance

## Consequences

- RAG evaluation audit (Step 18) will be replaced with a documented rationale
- AI features will use direct prompting with structured context from the database
- Simpler architecture, fewer infrastructure requirements
