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

### 📂 **Current Test Status:**
```
backend/tests/
  ├─ unit/
  │   ├─ setup.ts                              ✅ Mock factories & utilities
  │   └─ controllers/
  │       ├─ auth.controller.test.ts           ✅ 26 tests passing
  │       └─ todos.controller.test.ts          ✅ 23 tests passing
  ├─ tsconfig.json                             ✅ Test config
  └─ README.md                                 ✅ Testing documentation

Test Results: 49 tests passing | ~7 seconds | 100% statement coverage
Architecture: Express 5 native async error handling (no asyncHandler needed)
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

### 🎯 **Next Session - Pick Up Here:**

**Options for next session:**

**Option A: Continue Learning Path (Recommended)**
```
Let's implement HTTPS for the backend! (Task #2 in TODO.md)

Goals:
- Generate development certificates with mkcert
- Configure Express to use HTTPS
- Update Helmet configuration for HSTS
- Test secure connections locally

This will teach practical TLS/SSL concepts and security headers.
```

**Option B: Expand Testing**
```
Let's add more test coverage:
- Unit tests for middleware (auth.ts, security.ts)
- Unit tests for errorHandler middleware
- Learn to test Express middleware in isolation
```

**Option C: Add New Feature**
```
Implement password reset functionality (Task #3)
- Practice adding new endpoints
- Learn token-based flows
- Apply unit testing to new code (TDD approach)
```

### 🚀 **Future Sessions:**
2. Implement HTTPS for learning
3. Add password reset feature
4. Migrate to PostgreSQL + Docker

### 🧠 **Key Decisions Made:**
- ✅ SQLite → PostgreSQL → Docker (phased approach)
- ✅ Unit tests (Jest) + E2E tests (Cypress later)
- ✅ No integration tests (replaced by unit + E2E)
- ✅ Keep supertest for now (middleware.test.ts needs it)