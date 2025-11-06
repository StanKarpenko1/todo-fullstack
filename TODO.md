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

### 📂 **Current Test Status:**
```
backend/tests/
  ├─ middleware.test.ts  ✅ KEPT (uses test.db, refactor later)
  ├─ setup.ts            ✅ KEPT (will update for unit tests)
  └─ tsconfig.json       ✅ Config file

Database Files:
  ├─ dev.db    ✅ Development database (app uses this)
  └─ test.db   ✅ Test database (middleware.test.ts uses this)
```

### 🎯 **Next Session - Start Here:**
**Primary Goal:** Write proper unit tests with mocked dependencies

**Step-by-step:**
1. Create `tests/unit/controllers/` folder
2. Write `auth.controller.test.ts`:
   - Mock `@prisma/client`, `bcryptjs`, `jsonwebtoken`
   - Test `register()` and `login()` functions directly
   - No HTTP requests, no database
3. Write `todos.controller.test.ts`:
   - Mock `@prisma/client`
   - Test CRUD controller functions
   - Test authorization logic

**Tools needed:** Only Jest (supertest NOT needed for unit tests)

### 🚀 **Future Sessions:**
2. Implement HTTPS for learning
3. Add password reset feature
4. Migrate to PostgreSQL + Docker

### 🧠 **Key Decisions Made:**
- ✅ SQLite → PostgreSQL → Docker (phased approach)
- ✅ Unit tests (Jest) + E2E tests (Cypress later)
- ✅ No integration tests (replaced by unit + E2E)
- ✅ Keep supertest for now (middleware.test.ts needs it)