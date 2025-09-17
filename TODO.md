# TODO - Next Development Tasks

## High Priority Tasks

### 1. 🧪 Rewrite All Unit Tests (CRITICAL)
**Current Problem:** Tests are integration-style, causing flakiness and violating unit test principles.

**What to do:**
- **Mock all external dependencies** (Prisma, bcrypt, jwt)
- **Test controller functions in isolation** without HTTP requests
- **Remove database interactions** from unit tests
- **Focus on business logic testing** only

**Structure:**
```
tests/
  unit/
    controllers/
      auth.controller.test.ts    ← Mock Prisma, test registration logic
      todos.controller.test.ts   ← Mock Prisma, test CRUD logic
  integration/
    auth.test.ts               ← Keep existing for API endpoint testing
    todos.test.ts              ← Keep existing for API endpoint testing
```

**Benefits:**
- ✅ Fast, reliable tests
- ✅ No database pollution
- ✅ True unit test isolation
- ✅ Easier debugging when logic breaks

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

## Additional Notes

### Test Strategy Clarification:
- **Unit Tests** → Mock everything, test logic only
- **Integration Tests** → Test API endpoints, use test database
- **E2E Tests** → Cypress/Playwright later for full user flows

### HTTPS Learning Goals:
- Understand certificate generation
- Practice secure header configuration
- Learn development vs production TLS patterns

### Password Reset Security:
- Use cryptographically secure tokens
- Implement token expiration
- Rate limit reset requests
- Secure token validation

---

## Session Wrap-up

✅ **Completed Today:**
- Refactored to MVC pattern with controllers
- Modernized Helmet security configuration
- Updated documentation for security changes
- Analyzed test strategy issues

🎯 **Next Session Focus:**
1. Fix unit tests first (most important)
2. Then implement HTTPS for learning
3. Add password reset as feature practice

**Key Principle:** Keep test types separate and focused on their purpose!