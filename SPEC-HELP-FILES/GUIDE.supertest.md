# Supertest E2E API Testing - Implementation Guide

## Overview
Supertest = White box API integration testing (same repo, direct app import, real PostgreSQL)

## Implementation Progress

### [DONE] Step 1: E2E Test Structure (COMPLETED)
**Created:**
- `backend/tests/e2e/` folder
- `backend/jest.e2e.config.js` - E2E Jest config
- `backend/tests/e2e/setup.ts` - Database helpers
- `backend/tests/e2e/jest.setup.js` - Environment setup

**jest.e2e.config.js key settings:**
- Pattern: `**/*.e2e.test.ts`
- `maxWorkers: 1` (serial execution, avoid DB race conditions)
- `testTimeout: 10000` (10s for DB operations)
- `setupFiles: ['<rootDir>/tests/e2e/jest.setup.js']` - Sets NODE_ENV=test

**setup.ts functions:**
- `cleanDatabase()` - Delete todos (FK constraint order), then users
- `disconnectDatabase()` - Prisma cleanup
- `createTestUser()` - Helper for direct DB user creation (not used in E2E - see best practices)
- `generateTestToken()` - JWT helper (not used in E2E - see best practices)
- Separate Prisma instance for E2E tests

---

### [DONE] Step 2: NPM Scripts (COMPLETED)
**Added to package.json:**
```json
"test:e2e": "jest --config jest.e2e.config.js",
"test:e2e:watch": "jest --config jest.e2e.config.js --watch"
```

**Run commands:**
```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:watch        # Watch mode
npm run test:e2e -- --verbose # Real-time test output
```

---

### [DONE] Step 3: Auth E2E Tests (COMPLETED)
**File:** `backend/tests/e2e/auth.e2e.test.ts`

**Test Coverage (11 tests):**
- **POST /api/auth/register** (4 tests)
  - Success case with token return
  - Duplicate email rejection
  - Email validation
  - Password validation
- **POST /api/auth/login** (3 tests)
  - Successful login with valid credentials
  - Invalid email rejection
  - Invalid password rejection
- **Protected Routes Authentication** (4 tests)
  - Valid token access
  - Missing token rejection
  - Invalid token rejection
  - Malformed Authorization header rejection

---

### [DONE] Step 4: Todo CRUD E2E Tests (COMPLETED)
**File:** `backend/tests/e2e/todos.e2e.test.ts`

**Test Coverage (23 tests):**
- **POST /api/todos** (4 tests)
  - Create todo with auth
  - Create without description
  - Validation (missing title)
  - Unauthorized access rejection
- **GET /api/todos** (3 tests)
  - Get all todos for user
  - Empty array for no todos
  - **User isolation** (can't see other users' todos)
- **GET /api/todos/:id** (3 tests)
  - Get single todo by ID
  - 404 for non-existent todo
  - **Authorization** (can't access other users' todos)
- **PUT /api/todos/:id** (6 tests)
  - Update title
  - Update completion status
  - Update multiple fields
  - 404 for non-existent todo
  - **Authorization check**
  - Verify no unauthorized modification
- **DELETE /api/todos/:id** (3 tests)
  - Delete todo successfully
  - 404 for non-existent todo
  - **Authorization check** with verification

**Total E2E Tests:** 34 (11 auth + 23 todos)

---

### [DONE] Step 5: Log Cleanup (COMPLETED)
**Problem:** Test logs cluttered with expected errors

**Solution:**
1. **errorHandler middleware** - Conditional logging
   ```typescript
   const shouldLog = process.env.NODE_ENV !== 'test' || !isOperational;
   ```
   - Only logs non-operational errors in test environment
2. **dotenv.config** - Disabled debug mode
   ```typescript
   dotenv.config({ debug: false });
   ```
3. **cleanDatabase logs** - Removed debug output
   - Silent cleanup between tests

**Result:** Clean test output, only Jest results visible

---

## Test Execution Strategy

**Unit Tests (existing):**
```bash
npm test                 # jest.config.js → *.test.ts (mocked, parallel)
npm run test:coverage    # With coverage report
```

**E2E Tests (new):**
```bash
npm run test:e2e         # jest.e2e.config.js → *.e2e.test.ts (real DB, serial)
npm run test:e2e:watch   # Watch mode
```

**Combined:**
```bash
npm test && npm run test:e2e  # Run both suites
```

---

## Architecture

```
backend/
├── tests/
│   ├── unit/                          # Mocked dependencies (127 tests)
│   │   ├── controllers/
│   │   │   ├── auth.controller.test.ts
│   │   │   └── todos.controller.test.ts
│   │   ├── middleware/
│   │   │   ├── auth.test.ts
│   │   │   ├── security.test.ts
│   │   │   └── errorHandler.test.ts
│   │   └── setup.ts
│   ├── e2e/                           # Real PostgreSQL integration (34 tests)
│   │   ├── auth.e2e.test.ts           # 11 tests
│   │   ├── todos.e2e.test.ts          # 23 tests
│   │   ├── setup.ts                   # DB helpers
│   │   └── jest.setup.js              # NODE_ENV=test
│   └── tsconfig.json
├── jest.config.js                     # Unit test config
└── jest.e2e.config.js                 # E2E test config
```

---

## Key Differences: Unit vs E2E

| Aspect | Unit Tests | E2E Tests |
|--------|-----------|-----------|
| **Config** | `jest.config.js` | `jest.e2e.config.js` |
| **Pattern** | `*.test.ts` | `*.e2e.test.ts` |
| **Database** | Mocked (Prisma mock) | Real PostgreSQL |
| **Execution** | Parallel | Serial (`maxWorkers: 1`) |
| **Speed** | Fast (~21s for 127 tests) | Slower (~8s for 34 tests) |
| **Isolation** | Jest mocks | DB cleanup between tests |
| **Purpose** | Business logic | HTTP + DB integration |
| **Coverage** | Controllers, middleware | Full API flows |

---

## E2E Best Practices (SDET Perspective)

### 1. **Test Like a User (Not Like a Developer)**

[RIGHT] **Correct (current approach):**
```typescript
beforeEach(async () => {
  await cleanDatabase();

  // Register user via API (real flow)
  const response = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com', password: 'password123' });

  authToken = response.body.token;
  userId = response.body.user.id;
});
```

[WRONG] **Incorrect (unit test mentality):**
```typescript
beforeEach(async () => {
  // Direct DB insertion (bypasses auth validation)
  const user = await createTestUser({ email: '...' });
  authToken = generateTestToken(user.id);  // Bypasses JWT generation
});
```

**Why current approach is better:**
- Tests authentication endpoints work
- Validates JWT generation
- Catches integration issues
- Real user journey

### 2. **User Isolation Testing**
- Create multiple users in same test
- Verify user A can't access user B's data
- Test authorization at API layer (not just middleware)

### 3. **Database Cleanup Strategy**
- `beforeEach` cleans DB (not `afterEach`)
- Ensures clean state even if test fails
- Serial execution prevents race conditions

### 4. **Error Suppression**
- Suppress expected operational errors in test logs
- Keep non-operational errors visible (real bugs)

---

## CI/CD Integration (Future)

**GitHub Actions E2E Job:**
```yaml
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: todo_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run test:e2e
```

---

## Comparison: Supertest vs True E2E (Cypress/Playwright)

| Feature | Supertest (API E2E) | Cypress (Full E2E) |
|---------|---------------------|-------------------|
| **Scope** | Backend API only | Frontend + Backend |
| **Browser** | No browser | Real browser |
| **Speed** | Fast (~8s for 34 tests) | Slower (UI rendering) |
| **Access** | White box (code access) | Black box (user perspective) |
| **Setup** | Same repo | Separate or same repo |
| **Use Case** | API integration | Full user flows |

**When to use Supertest:**
- API testing (backend only)
- Quick feedback on API changes
- CI pipeline (fast execution)

**When to use Cypress:**
- Full-stack testing (UI + API)
- Visual regression testing
- User interaction flows

---

## Testing Philosophy

**Supertest E2E Tests:**
- Test through HTTP interface (like external client)
- Use real database (not mocked)
- Import Express app directly (white box)
- No actual HTTP server (ephemeral instances)
- Serial execution (avoid DB conflicts)

**Result:** Confidence in API + DB integration without frontend.

---

## Notes

- Supertest requires same repo (imports Express app directly)
- No actual HTTP server started (ephemeral instances via supertest)
- Database cleanup critical (`beforeEach` hook)
- Serial execution prevents race conditions
- Helper functions (`createTestUser`, `generateTestToken`) available but not used in E2E (prefer real API flows)

---

## Summary

**Status:** [DONE] E2E API testing fully implemented

**Coverage:**
- 34 E2E tests (11 auth + 23 todos)
- Real PostgreSQL database
- User isolation tested
- Authorization validated
- Clean test logs

**Next Steps:**
- Add E2E job to GitHub Actions
- Consider E2E coverage reporting
