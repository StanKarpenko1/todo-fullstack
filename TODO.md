# TODO - Next Development Tasks

## High Priority Tasks

### 1. 🧪 Write Proper Unit Tests ✅ COMPLETED
**Status:** 49 tests passing, 100% statement coverage, Express 5 architecture

**What to do:**
- **Mock all external dependencies** (Prisma, bcrypt, jwt)
- **Test controller functions in isolation** without HTTP requests
- **No database or HTTP layer** in unit tests
- **Focus on business logic testing** only

**Structure:**
```
tests/
  unit/
    controllers/
      auth.controller.test.ts    ← NEW: Mock Prisma, bcrypt, jwt
      todos.controller.test.ts   ← NEW: Mock Prisma
  middleware.test.ts             ← KEPT: Auth middleware tests
  setup.ts                       ← KEPT: Will update for unit tests
```

**Deleted (moved to Cypress later):**
- ❌ auth.test.ts (integration tests)
- ❌ todos.test.ts (integration tests)
- ❌ security.test.ts (integration tests)

**Benefits:**
- ✅ Fast, reliable tests (1-5ms each)
- ✅ No database pollution
- ✅ True unit test isolation
- ✅ Easier debugging when logic breaks

**Note:** E2E tests will be added with Cypress later

---

### 2. 🔒 Implement HTTPS (LEARNING)
**Why:** Essential security concept to understand practically.

**What to do:**
- **Generate development certificates** using mkcert
- **Update server.ts** to support HTTPS in development
- **Configure Helmet** for HSTS headers
- **Test HTTPS functionality** locally
- **Document the process** in security guide

**Implementation:**
```
backend/
  certs/
    localhost+2.pem         ← Certificate
    localhost+2-key.pem     ← Private key
  src/
    https-server.ts         ← HTTPS configuration
```

**Benefits:**
- 🎓 Learn TLS/SSL concepts
- 🛡️ Practice security implementation
- 📚 Understand production deployment patterns

---

### 3. 📧 Add Password Reset Functionality (DUMMY)
**Why:** Common authentication feature, good practice for email integration patterns.

**What to do:**
- **Create reset token system** (JWT-based for simplicity)
- **Add database fields** for reset tokens
- **Implement API endpoints:**
  - `POST /api/auth/forgot-password` - Generate reset token
  - `POST /api/auth/reset-password` - Reset with token
- **Dummy email service** (console.log for now)
- **Add validation** and security measures

**Database Changes:**
```sql
-- Add to User model
resetToken: String?
resetTokenExpires: DateTime?
```

**Endpoints:**
- `POST /forgot-password` → Generate token, "send" email
- `POST /reset-password` → Verify token, update password

**Benefits:**
- 🔐 Complete auth flow
- 🏗️ Practice token management
- 📧 Foundation for real email service later

---

## Future Enhancements

### 4. 🐳 Docker + PostgreSQL Migration (PLANNED)
**Pattern:** SQLite (prototype) → PostgreSQL (production) → Docker

**Phase 1: Keep SQLite (Current)**
- ✅ Fast prototyping with zero setup
- ✅ Focus on features, not infrastructure
- ✅ Learn Prisma fundamentals

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
- 🎯 Learn database migration strategies
- 🐳 Practice Docker multi-container orchestration
- 🌐 Real-world production patterns
- 📚 Understand database networking

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

### ✅ **Completed This Session (2025-11-04):**
1. **Analyzed project structure** - Full-stack Todo app with MVC pattern
2. **Cleaned up tests:**
   - Deleted `auth.test.ts`, `todos.test.ts`, `security.test.ts` (integration tests)
   - Kept `middleware.test.ts` (auth middleware tests)
   - Ready to write proper unit tests from scratch
3. **Documented strategy:**
   - Created `INDEX.md` with quick start guide
   - Updated `TODO.md` with clear next steps
   - Planned SQLite → PostgreSQL → Docker migration path

### ✅ **Completed This Session (2025-11-12) - Unit Testing Implementation:**
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

### ✅ **Completed This Session (2025-11-17) - Express 5 Refactor & Test Fixes:**
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

### ✅ **Completed This Session (2025-11-19) - ErrorHandler Middleware Unit Tests:**
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

### 📂 **Current Test Status:**
```
backend/tests/
  ├─ unit/
  │   ├─ setup.ts                              ✅ Mock factories & utilities
  │   ├─ controllers/
  │   │   ├─ auth.controller.test.ts           ✅ 26 tests passing
  │   │   └─ todos.controller.test.ts          ✅ 23 tests passing
  │   └─ middleware/
  │       └─ errorHandler.test.ts              ✅ 19 tests passing
  ├─ tsconfig.json                             ✅ Test config
  └─ README.md                                 ✅ Testing documentation (updated with advanced patterns)

Test Results: 68 tests passing | ~8 seconds | 100% statement coverage
Architecture: Express 5 native async error handling (no asyncHandler needed)
Coverage: Controllers 100% | ErrorHandler Middleware 100%
```

---

## 🎓 **CURRENT LEARNING TRACK: Unit Testing (COMPLETED!)**

### **Status:** ✅ Unit tests complete - Ready for next task

**What We Learned:**
1. ✅ Unit test fundamentals (mocking, isolation, speed)
2. ✅ AAA pattern (Arrange-Act-Assert)
3. ✅ Test structure (describe blocks, it blocks)
4. ✅ Incremental test development workflow
5. ✅ Mock utilities and factories
6. ✅ Jest mocking basics (`jest.mock()`)
7. ✅ NPM scoped packages (`@prisma/client`)
8. ✅ Mock function methods (`.mockResolvedValue()`, `.mockReturnValue()`)
9. ✅ Understanding test assertions (`expect()`)
10. ✅ Testing patterns (validation, authorization, error handling)
11. ✅ Express 5 vs 4 async error handling
12. ✅ Modern error testing with `expect().rejects.toThrow()`
13. ✅ Separation of concerns (controllers vs error handlers)
14. ✅ **Advanced mocking patterns** (console spying, environment mocking)
15. ✅ **Test doubles** (spies, mocks, stubs, fakes - when to use each)
16. ✅ **Isolation patterns** (test, module, environment, side-effect isolation)
17. ✅ **Parametric testing** (testing multiple scenarios efficiently)
18. ✅ **Partial object matching** (`expect.objectContaining()`)
19. ✅ **Type-safe matchers** (`expect.any(Type)`)
20. ✅ **Testing middleware in isolation** (errorHandler complete coverage)
21. ✅ **Mock cleanup patterns** (mockRestore, environment restoration)
22. ✅ **AppError prototype chain** (`Object.setPrototypeOf`, `Error.captureStackTrace`, `isOperational`)

### 🎯 **Next Session - Pick Up Here:**

## 📋 **SESSION STARTUP PROMPT FOR NEXT AGENT**

**Context:** This is a pet project for learning full-stack development best practices from an SDET/Lead QA perspective. I'm working as an SDET and want to improve both my testing skills and full-stack development knowledge. My goal is to learn senior-level development patterns, especially around testing (unit, integration, e2e), while building practical features.

**Current State:**
- ✅ Express 5 backend with SQLite + Prisma ORM
- ✅ 68 unit tests passing (100% coverage on controllers + errorHandler middleware)
- ✅ Mastered advanced unit testing patterns (spies, environment mocking, isolation)
- ✅ Understanding of TDD red-green-refactor cycle
- 📂 See `@TODO.md` for full context and `backend/tests/README.md` for testing patterns

**My Next Goals (in priority order):**

**Priority 1: PostgreSQL Migration**
```
Migrate from SQLite to PostgreSQL (Phase 2 of planned migration path)

Tasks:
1. Update Prisma schema (provider: "postgresql")
2. Update DATABASE_URL for PostgreSQL connection
3. Run Prisma migrations
4. Verify unit tests still pass (they should - fully mocked!)
5. Test application manually

Learning Goals:
- Database migration strategies
- Connection string management
- Environment variable best practices
- Understanding why unit tests are DB-agnostic
```

**Priority 2: Password Reset Feature (TDD Approach)**
```
Implement password reset functionality using Test-Driven Development

TDD Workflow:
1. Write failing tests FIRST for forgot-password endpoint
2. Implement just enough code to make tests pass (green)
3. Refactor if needed
4. Write failing tests for reset-password endpoint
5. Implement and make tests pass
6. Run full test suite to ensure no regressions

Feature Requirements:
- POST /api/auth/forgot-password (generate reset token)
- POST /api/auth/reset-password (reset with token)
- Token-based system (JWT or crypto.randomBytes)
- Dummy email service (console.log for now)
- Token expiration (15-30 min)
- Security measures (rate limiting consideration)

Database Changes:
- Add resetToken: String? to User model
- Add resetTokenExpires: DateTime? to User model

Learning Goals:
- TDD red-green-refactor cycle in practice
- Writing tests before implementation
- Token management patterns
- Security considerations for password reset flows
- How mocking makes TDD easier (no DB setup needed!)
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
1. Read `@TODO.md` to understand full project context
2. Start with Priority 1 (PostgreSQL migration) OR Priority 2 (Password Reset TDD)
3. If doing Password Reset: Write tests FIRST, then implement (pure TDD)
4. Explain senior dev patterns and best practices as we work
5. Keep the same teaching style from previous sessions (thorough, practical, SDET-focused)

Pick up from here and guide me through the next phase of development!

### 🚀 **Completed Sessions Summary:**
1. ✅ **Session 2025-11-04:** Project analysis, cleaned up test structure
2. ✅ **Session 2025-11-12:** Implemented controller unit tests (49 tests)
3. ✅ **Session 2025-11-17:** Express 5 refactor, removed asyncHandler
4. ✅ **Session 2025-11-19:** ErrorHandler middleware tests (19 tests), advanced mocking patterns

### 🚀 **Next Sessions Roadmap:**
1. **PostgreSQL Migration** - Database migration best practices
2. **Password Reset (TDD)** - Pure test-driven development workflow
3. **HTTPS Implementation** - Security and certificate management
4. **Docker + Multi-container** - Production deployment patterns

### 🧠 **Key Decisions Made:**
- ✅ SQLite → PostgreSQL → Docker (phased approach)
- ✅ Unit tests (Jest) + E2E tests (Cypress later)
- ✅ No integration tests (replaced by unit + E2E)
- ✅ Keep supertest for now (middleware.test.ts needs it)