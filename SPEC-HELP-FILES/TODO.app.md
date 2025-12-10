# TODO - Next Development Tasks

## Current Status

**Test Suite:** 127 tests passing (~21 seconds)
- 47 tests: Auth controllers (register, login, forgotPassword, resetPassword)
- 23 tests: Todo controllers (CRUD operations)
- 14 tests: Auth middleware (JWT validation)
- 24 tests: Security middleware (input sanitization, request size limiting)
- 19 tests: ErrorHandler middleware
- Coverage: 100% statement coverage on all controllers & middleware

**Architecture:** Express 5, TypeScript, Prisma ORM, PostgreSQL (Docker)
**Database:** PostgreSQL 15 (Docker container)
**Security:** See `SPEC-HELP-FILES/TODO.sec.md` for detailed security status

---

## High Priority Tasks

### 1. [DONE] PostgreSQL Migration
**Status:** [DONE] Migrated from SQLite to PostgreSQL (Docker)

**Completed:**
- [DONE] PostgreSQL 15 running in Docker container
- [DONE] Prisma schema updated (`provider = "postgresql"`)
- [DONE] Connection string updated (localhost:5432)
- [DONE] Migrations applied successfully
- [DONE] All 127 tests passing (DB-agnostic, fully mocked)
- [DONE] Backend connects to PostgreSQL successfully

**Setup:**
```powershell
# PostgreSQL running
docker ps  # Container: todo-postgres

# Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo_dev"

# Check data
docker exec -it todo-postgres psql -U postgres -d todo_dev
npx prisma studio  # GUI at localhost:5555
```

**Reference:** See `SPEC-HELP-FILES/GUIDE.db.md` for database management

---

### 2. [IN PROGRESS] GitHub Actions CI Pipeline (NEXT TASK)
**Priority:** HIGH - Professional practice, immediate value

**Why:**
- Automated testing on every push/PR
- Catch breaking changes before merge
- Foundation for full CI/CD pipeline
- Senior-level development practice

**What to do:**
1. **Create workflow file**
   - `.github/workflows/test.yml`
2. **Configure unit tests job**
   - Runs on push/pull_request
   - Node.js setup
   - Install dependencies
   - Run `npm test`
3. **Add branch protection rules**
   - Require tests to pass before merge
4. **Verify workflow**
   - Push code, watch Actions tab
   - Green checkmark = tests passed

**Benefits:**
- Prevent broken code from reaching main
- Automated quality gates
- Learn CI/CD concepts
- Professional portfolio piece

**Reference:** GitHub Actions documentation

---

### 3. [TODO] E2E API Tests with Supertest (NEXT TASK)
**Priority:** HIGH - Add API testing coverage

**Why:**
- Test real API flows (not mocked)
- Validate database integration
- Test authentication flows end-to-end
- Foundation for full E2E testing

**What to do:**
1. **Install Supertest**
   - `npm install -D supertest @types/supertest`
2. **Create E2E test structure**
   - `tests/e2e/auth.e2e.test.ts`
   - `tests/e2e/todos.e2e.test.ts`
   - `tests/e2e/setup.ts` (DB cleanup helpers)
3. **Write E2E tests**
   - Auth flow: register → login → protected route
   - Todo CRUD: create → read → update → delete
   - Error cases: validation, auth failures
4. **Add to package.json**
   - `"test:e2e": "jest --config jest.e2e.config.js"`
5. **Update GitHub Actions**
   - Add E2E job with PostgreSQL service

**Benefits:**
- Real database testing
- Catch integration issues
- Learn E2E testing patterns
- Higher confidence in deployments

**Reference:** Supertest documentation

---

### 4. [TODO] Backend Dockerization (AFTER E2E)
**Priority:** HIGH - Production readiness

**Why:**
- Complete containerization (backend + database)
- Team environment consistency
- Production deployment preparation
- Learn Docker networking and volumes

**What to do:**
1. **Create Dockerfile**
   - Multi-stage build (build → production)
   - Node.js base image
   - Copy source, install deps, build
2. **Create docker-compose.yml**
   - Backend service (with volume mounts)
   - PostgreSQL service
   - Network configuration
3. **Volume mounts for development**
   - `./backend:/app` (live code sync)
   - `npm run dev` (nodemon auto-restart)
4. **Test setup**
   - `docker-compose up`
   - Verify backend + database work
   - Run tests inside Docker
5. **Update GitHub Actions**
   - Build Docker image in CI
   - Test Docker deployment

**Benefits:**
- Production-ready deployment
- Learn Docker orchestration
- Real-world containerization
- Dev-prod parity

**Reference:** Docker documentation, docker-compose best practices

---

### 5. HTTPS Understanding (DEPLOYMENT PRIORITY - Moved)
**Priority:** LOW for now - Deferred to deployment phase
**Status:** Moved to deployment priorities

**Decision:**
- **Not implementing locally** - Unnecessary complexity for development
- **Already production-ready** - Helmet configured for production HTTPS
- **Platform handles it** - Vercel/Railway provide automatic HTTPS
- **Learn during deployment** - Better timing when actually needed

**What you already have:**
```javascript
// backend/src/server.ts - Production-ready configuration
app.use(helmet({
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false  // Disabled in dev (correct!)
}));
```

**Why skip for now:**
- Local HTTPS adds certificate management complexity
- Your JWT-based auth doesn't require HTTPS cookies
- Modern platforms handle HTTPS automatically
- Better to learn HTTPS concepts during actual deployment

**Reference:** See `SPEC-HELP-FILES/TODO.sec.md` for detailed HTTPS concepts and deployment checklist

---

### 6. [DONE] Unit Tests
**Status:** [DONE] 127 tests passing, 100% coverage, Express 5 architecture

**Completed:**
- [DONE] Auth controller tests (47 tests - register, login, forgotPassword, resetPassword)
- [DONE] Todo controller tests (23 tests - CRUD operations)
- [DONE] Auth middleware tests (14 tests - JWT validation)
- [DONE] Security middleware tests (24 tests - input sanitization, XSS prevention, request size limiting)
- [DONE] ErrorHandler middleware tests (19 tests - 100% coverage)

**Test Structure:**
```
backend/tests/
  unit/
    controllers/
      auth.controller.test.ts    [DONE] 47 tests
      todos.controller.test.ts   [DONE] 23 tests (not shown in original - added later)
    middleware/
      auth.test.ts               [DONE] 14 tests
      security.test.ts           [DONE] 24 tests
      errorHandler.test.ts       [DONE] (coverage complete)
    setup.ts                     [DONE] Mock utilities
```

**Benefits Achieved:**
- Fast test execution (~12 seconds for 106 tests)
- No database dependencies
- True unit test isolation
- TDD workflow practiced (password reset feature)

---

### 7. [DONE] Password Reset Feature
**Status:** [DONE] Implemented using TDD approach (RED → GREEN → REFACTOR)

**Completed Features:**
- [DONE] `POST /api/auth/forgot-password` - Generate reset token
- [DONE] `POST /api/auth/reset-password` - Reset password with token
- [DONE] Token-based system using crypto.randomBytes(32)
- [DONE] Token hashing with bcrypt (10 rounds)
- [DONE] 1-hour token expiry
- [DONE] Rate limiting (5 requests per 15 minutes on forgot-password)
- [DONE] User enumeration prevention (generic messages)
- [DONE] 21 unit tests for password reset flow

**Key Security Patterns Implemented:**
- Token generation: `crypto.randomBytes(32).toString('hex')`
- Token storage: Hashed with bcrypt (never plaintext)
- Token validation: `bcrypt.compare()` for verification
- Single-use tokens: Cleared after successful reset
- Time-limited tokens: 1-hour expiry window

**Reference:** See `SPEC-FILES/TDD-GUIDE.md` for TDD patterns used

---

## Future Enhancements

### 5. [TODO] Docker Multi-Container Setup (AFTER POSTGRESQL)
**Pattern:** SQLite (prototype) → PostgreSQL (production) → Docker

**Phase 1: Keep SQLite (Current)**
- [DONE] Fast prototyping with zero setup
- [DONE] Focus on features, not infrastructure
- [DONE] Learn Prisma fundamentals

**Phase 2: Migrate to PostgreSQL (Before Docker)**
- Change Prisma provider from "sqlite" to "postgresql"
- Update DATABASE_URL connection string
- Run migrations (Prisma handles the rest!)
- All code stays the same - just database changes

**Phase 3: Dockerize (3 containers)**
- Frontend container (React + Nginx)
- Backend container (Node.js + Express)
- Database container (PostgreSQL)

**Benefits:**
- Learn database migration strategies
- Practice Docker multi-container orchestration
- Real-world production patterns
- Understand database networking

**Why This Order:**
- SQLite perfect for fast development
- PostgreSQL needed for Docker container separation
- Learn incrementally, not overwhelmed

---

## Additional Notes

### Test Strategy Clarification:
- **Unit Tests (Jest)** → Mock everything, test controller logic only
- **E2E Tests (Cypress)** → Test full user flows, security, integration
- **No more integration tests** → Replaced by unit + E2E approach

### Database Migration Strategy:
- **Now:** SQLite for rapid prototyping
- **Before Docker:** Migrate to PostgreSQL (easy with Prisma)
- **Then:** Dockerize with 3 separate containers

### HTTPS Learning Goals:
- Understand certificate generation (mkcert)
- Practice secure header configuration
- Learn development vs production TLS patterns

### Password Reset Security:
- Use cryptographically secure tokens
- Implement token expiration
- Rate limit reset requests
- Secure token validation

---

## Session Wrap-up

### [DONE] **Completed This Session (2025-11-04):**
1. **Analyzed project structure** - Full-stack Todo app with MVC pattern
2. **Cleaned up tests:**
   - Deleted `auth.test.ts`, `todos.test.ts`, `security.test.ts` (integration tests)
   - Kept `middleware.test.ts` (auth middleware tests)
   - Ready to write proper unit tests from scratch
3. **Documented strategy:**
   - Created `INDEX.md` with quick start guide
   - Updated `TODO.md` with clear next steps
   - Planned SQLite → PostgreSQL → Docker migration path

### [DONE] **Completed This Session (2025-11-12) - Unit Testing Implementation:**
1. **Unit tests fully implemented** - 49 tests passing in ~15 seconds
2. **Test coverage achieved:**
   - `auth.controller.test.ts` - 26 tests (register & login)
   - `todos.controller.test.ts` - 23 tests (CRUD operations)
   - 100% statement coverage, 95.83% branch coverage
3. **Learned unit testing fundamentals:**
   - Understood mocking strategy (Prisma, bcrypt, JWT)
   - AAA pattern (Arrange-Act-Assert)
   - Test organization with describe blocks
   - Mock utilities in setup.ts

### [DONE] **Completed This Session (2025-11-17) - Express 5 Refactor & Test Fixes:**
1. **Discovered unnecessary asyncHandler wrapper** - Already on Express 5.1.0!
2. **Removed asyncHandler pattern:**
   - Deleted `src/utils/asyncHandler.ts` (redundant with Express 5)
   - Removed wrapper from `auth.controller.ts` (2 functions)
   - Removed wrapper from `todos.controller.ts` (4 functions)
3. **Updated all tests to modern error testing pattern:**
   - Changed 30 tests from testing `res.status()` calls to `expect().rejects.toThrow()`
   - Removed unused `suppressConsoleError` and `NextFunction` imports
   - Tests now validate **thrown errors** instead of response formatting
4. **Learned key concepts:**
   - Express 5 automatically catches async errors (no wrapper needed!)
   - Modern error testing: Test that controllers throw correct errors
   - Separation of concerns: Controllers throw, error handler formats
   - Reference project comparison (why they don't use asyncHandler)
5. **All 49 tests passing** - Clean refactor, no functionality broken

### [DONE] **Completed This Session (2025-11-19) - ErrorHandler Middleware Unit Tests:**
1. **Created comprehensive errorHandler middleware tests** - 19 new tests, 100% coverage
2. **Advanced mocking patterns mastered:**
   - Console spying (jest.spyOn with mockRestore)
   - Environment variable mocking (process.env.NODE_ENV)
   - Partial object matching (expect.objectContaining)
   - Parametric testing (forEach with jest.clearAllMocks)
   - Type-safe matchers (expect.any(String))
3. **Test categories implemented:**
   - AppError handling (3 tests)
   - Generic Error handling (3 tests)
   - Environment-based behavior (3 tests)
   - Logging behavior (3 tests)
   - Prototype chain (2 tests)
   - Response format consistency (3 tests)
   - Edge cases (2 tests)
4. **Key learning outcomes:**
   - Test doubles deep dive (spies, mocks, stubs, fakes)
   - Isolation patterns (test, module, environment, side-effect)
   - Testing middleware in isolation
   - AAA pattern reinforcement
   - Understanding when to test errorHandler separately vs in controllers
5. **All 68 tests passing** (~8 seconds) - Complete unit test coverage for controllers + middleware

###  **Current Test Status:**
```
backend/tests/
  ├─ unit/
  │   ├─ setup.ts                              [DONE] Mock factories & utilities
  │   ├─ controllers/
  │   │   ├─ auth.controller.test.ts           [DONE] 26 tests passing
  │   │   └─ todos.controller.test.ts          [DONE] 23 tests passing
  │   └─ middleware/
  │       └─ errorHandler.test.ts              [DONE] 19 tests passing
  ├─ tsconfig.json                             [DONE] Test config
  └─ README.md                                 [DONE] Testing documentation (updated with advanced patterns)

Test Results: 68 tests passing | ~8 seconds | 100% statement coverage
Architecture: Express 5 native async error handling (no asyncHandler needed)
Coverage: Controllers 100% | ErrorHandler Middleware 100%
```

---

##  **CURRENT LEARNING TRACK: Unit Testing (COMPLETED!)**

### **Status:** [DONE] Unit tests complete - Ready for next task

**What We Learned:**
1. [DONE] Unit test fundamentals (mocking, isolation, speed)
2. [DONE] AAA pattern (Arrange-Act-Assert)
3. [DONE] Test structure (describe blocks, it blocks)
4. [DONE] Incremental test development workflow
5. [DONE] Mock utilities and factories
6. [DONE] Jest mocking basics (`jest.mock()`)
7. [DONE] NPM scoped packages (`@prisma/client`)
8. [DONE] Mock function methods (`.mockResolvedValue()`, `.mockReturnValue()`)
9. [DONE] Understanding test assertions (`expect()`)
10. [DONE] Testing patterns (validation, authorization, error handling)
11. [DONE] Express 5 vs 4 async error handling
12. [DONE] Modern error testing with `expect().rejects.toThrow()`
13. [DONE] Separation of concerns (controllers vs error handlers)
14. [DONE] **Advanced mocking patterns** (console spying, environment mocking)
15. [DONE] **Test doubles** (spies, mocks, stubs, fakes - when to use each)
16. [DONE] **Isolation patterns** (test, module, environment, side-effect isolation)
17. [DONE] **Parametric testing** (testing multiple scenarios efficiently)
18. [DONE] **Partial object matching** (`expect.objectContaining()`)
19. [DONE] **Type-safe matchers** (`expect.any(Type)`)
20. [DONE] **Testing middleware in isolation** (errorHandler complete coverage)
21. [DONE] **Mock cleanup patterns** (mockRestore, environment restoration)
22. [DONE] **AppError prototype chain** (`Object.setPrototypeOf`, `Error.captureStackTrace`, `isOperational`)

###  **Next Session - Pick Up Here:**

## **SESSION STARTUP PROMPT FOR NEXT AGENT**

**Context:** This is a pet project for learning full-stack development best practices from an SDET/Lead QA perspective. I'm working as an SDET and want to improve both my testing skills and full-stack development knowledge. My goal is to learn senior-level development patterns, especially around testing (unit, integration, e2e), while building practical features.

**Current State:**
- [DONE] Express 5 backend with SQLite + Prisma ORM
- [DONE] 106 unit tests passing (100% coverage on controllers + all middleware)
- [DONE] Mastered TDD workflow (password reset feature implemented with TDD)
- [DONE] Advanced testing patterns (mocking, spies, environment mocking, isolation)
- [DONE] Security middleware fully tested (auth, sanitization, rate limiting)
-  See `SPEC-HELP-FILES/TODO.app.md` for full context
-  See `SPEC-FILES/TDD-GUIDE.md` for TDD patterns
-  See `SPEC-HELP-FILES/TODO.sec.md` for security status

**My Next Goals (in priority order):**

**Priority 1: PostgreSQL Migration (NEXT TASK)**
```
Migrate from SQLite to PostgreSQL (Phase 2 of planned migration path)

Tasks:
1. Update Prisma schema (provider: "postgresql")
2. Setup PostgreSQL (local install OR Docker container)
3. Update DATABASE_URL for PostgreSQL connection
4. Run Prisma migrations
5. Verify unit tests still pass (they should - fully mocked!)
6. Test application manually

Learning Goals:
- Database migration strategies
- Connection string management
- Environment variable best practices
- Understanding why unit tests are DB-agnostic
- Connection pooling concepts
```

**Priority 2: Docker + Multi-Container Setup**
```
Containerize application with Docker (requires PostgreSQL first)

Tasks:
1. Create Dockerfile for backend (Node.js)
2. Create Dockerfile for frontend (React + Nginx) - when ready
3. Create docker-compose.yml (multi-container orchestration)
4. Configure PostgreSQL container
5. Set up container networking
6. Test local Docker deployment

Learning Goals:
- Docker containerization patterns
- Multi-container orchestration with docker-compose
- Container networking and volumes
- Environment variable management across containers
- Production deployment preparation

Reference: Standard Docker best practices for Node.js and PostgreSQL
```

**My Learning Style:**
- I prefer understanding "why" over "what"
- I want senior dev perspective on best practices
- I value clean, atomic patterns and proper isolation
- I like TLDR explanations for complex concepts
- I learn best when building practical features with proper testing

**What I DON'T need:**
- Don't skip testing - tests are critical for my learning
- Don't oversimplify - I can handle senior-level concepts
- Don't implement without tests - I want to learn TDD properly

**Instructions for Agent:**
1. Read `SPEC-HELP-FILES/TODO.app.md` to understand full project context
2. Read `SPEC-HELP-FILES/TODO.sec.md` for security implementation status
3. Start with Priority 1 (PostgreSQL migration) OR Priority 2 (HTTPS implementation)
4. Explain senior dev patterns and best practices as we work
5. Keep the same teaching style from previous sessions (thorough, practical, SDET-focused)

Pick up from here and guide me through the next phase of development!

###  **Completed Sessions Summary:**
1. [DONE] **Session 2025-11-04:** Project analysis, cleaned up test structure
2. [DONE] **Session 2025-11-12:** Implemented controller unit tests (49 tests)
3. [DONE] **Session 2025-11-17:** Express 5 refactor, removed asyncHandler
4. [DONE] **Session 2025-11-19:** ErrorHandler middleware tests (19 tests), advanced mocking patterns
5. [DONE] **Session 2025-11-23:** Auth middleware tests (14 tests), consistent error handling
6. [DONE] **Session 2025-11-24:** Security middleware tests (24 tests), password reset TDD implementation
7. [DONE] **Session 2025-11-28:** Documentation organization (SPEC-FILES/, guides created), TODO.app.md update

###  **Next Sessions Roadmap:**
1. **PostgreSQL Migration** - Database migration best practices (NEXT)
2. **Docker + Multi-container** - Production deployment patterns
3. **Frontend Development** - React + TypeScript + Vite
4. **Deployment + HTTPS** - Learn HTTPS during actual deployment

###  **Key Decisions Made:**
- [DONE] SQLite → PostgreSQL → Docker (phased approach)
- [DONE] Unit tests (Jest) + E2E tests (Cypress later)
- [DONE] No integration tests (replaced by unit + E2E)
- [DONE] Keep supertest for now (middleware.test.ts needs it)