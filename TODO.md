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

✅ **Completed Recently:**
- Refactored to MVC pattern with controllers
- Modernized Helmet security configuration
- Deleted old integration tests
- Planned SQLite → PostgreSQL → Docker migration path

🎯 **Next Session Focus:**
1. Write proper unit tests with mocks (in progress)
2. Implement HTTPS for learning
3. Add password reset feature
4. Later: Migrate to PostgreSQL + Docker

**Key Principles:**
- Keep test types separate (unit vs E2E)
- Prototype fast with SQLite, migrate to PostgreSQL before Docker
- Learn incrementally!