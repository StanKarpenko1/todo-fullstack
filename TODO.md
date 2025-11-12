# TODO - Next Development Tasks

## High Priority Tasks

### 1. 🧪 Write Proper Unit Tests (IN PROGRESS)
**Status:** Old integration tests deleted, ready to write unit tests

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

Test Results: 49 tests passing | ~15 seconds | 100% statement coverage
```

---

## 🎓 **CURRENT LEARNING TRACK: Unit Testing Deep Dive**

### **Status:** Learning unit testing methodology step-by-step

**Learning Approach:**
I prefer an **incremental, hands-on approach** where I:
1. Start writing the test file immediately (`auth.controller.test.ts`)
2. Build utilities (in `setup.ts`) as I need them (just-in-time)
3. Learn by doing, not by pre-planning everything
4. Ask questions on specific lines of code as I encounter them

**Current Progress:**
- ✅ Understood the practical starting point (test file first, not setup)
- ✅ Learned about scoped NPM packages (`@prisma/client`)
- 🔄 **STOPPED AT:** Understanding `mockPrismaUser.findUnique.mockResolvedValue(null);`

### 🎯 **Next Session - Continue Here:**

**Prompt for Claude:**
```
I'm learning unit testing in my full-stack Todo app. Last session we were going
through the first test step-by-step:

Test: "should register new user and return user data with token"
Location: backend/tests/unit/controllers/auth.controller.test.ts

I stopped at this line:
    mockPrismaUser.findUnique.mockResolvedValue(null);

Please continue teaching me line-by-line:
1. Explain what `mockResolvedValue(null)` does
2. Why we pass `null` specifically
3. How this connects to the controller code
4. Continue through the rest of this test incrementally

My learning style:
- Small, granular steps (one concept at a time)
- Connect test code to actual controller implementation
- Ask me if I have questions before moving to the next line
- Act as a senior developer mentor who teaches by doing

Files to reference:
- Test: backend/tests/unit/controllers/auth.controller.test.ts (lines 64-127)
- Controller: backend/src/controllers/auth.controller.ts (register function)
- Setup: backend/tests/unit/setup.ts
```

### 📚 **Learning Concepts Covered:**
- ✅ Unit test fundamentals (mocking, isolation, speed)
- ✅ AAA pattern (Arrange-Act-Assert)
- ✅ Test structure (describe blocks, it blocks)
- ✅ Incremental test development workflow
- ✅ Mock utilities and factories
- ✅ Jest mocking basics (`jest.mock()`)
- ✅ NPM scoped packages (`@prisma/client`)
- 🔄 Mock function methods (`.mockResolvedValue()`, `.mockReturnValue()`)
- 🔄 Understanding test assertions (`expect()`)
- 🔄 Testing patterns (validation, authorization, error handling)

### 🎯 **Next Learning Goals:**
1. Complete understanding of the first test case
2. Learn mock function methods in detail
3. Understand how mocks interact with controller code
4. Practice writing a second test case independently
5. Learn testing patterns (error cases, edge cases)

### 🚀 **Future Sessions:**
2. Implement HTTPS for learning
3. Add password reset feature
4. Migrate to PostgreSQL + Docker

### 🧠 **Key Decisions Made:**
- ✅ SQLite → PostgreSQL → Docker (phased approach)
- ✅ Unit tests (Jest) + E2E tests (Cypress later)
- ✅ No integration tests (replaced by unit + E2E)
- ✅ Keep supertest for now (middleware.test.ts needs it)