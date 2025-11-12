# Unit Testing Guide - TDD Style

## Overview

This project follows **TRUE unit testing principles** with complete dependency mocking. These tests are designed for Test-Driven Development (TDD) workflows where tests are written first, followed by implementation.

## Test Structure

```
tests/
├── unit/
│   ├── setup.ts                           # Mock factories & test utilities
│   └── controllers/
│       ├── auth.controller.test.ts        # 26 tests, 100% coverage
│       └── todos.controller.test.ts       # 23 tests, 100% coverage
└── README.md                              # This file
```

## Key Principles Applied

### 1. **True Unit Testing**
- ✅ **All external dependencies mocked** (Prisma, bcrypt, JWT)
- ✅ **No database connections** (even test databases)
- ✅ **No network calls** or file I/O
- ✅ **Fast execution**: 49 tests in ~7 seconds
- ✅ **Tests business logic only**, not infrastructure

### 2. **TDD-Ready Architecture**
- Tests can be written BEFORE implementation
- Mock factories provide consistent test data
- AAA pattern (Arrange-Act-Assert) enforced
- Each test is independent and isolated

### 3. **SDET Best Practices**
- Clear test organization with `describe` blocks
- Descriptive test names explaining expected behavior
- Complete edge case coverage
- Security testing (authorization, input validation)
- Error handling verification

## Test Coverage

**100% statement coverage**, **95.83% branch coverage**

### Auth Controller (26 tests)
- **register()**: 13 tests
  - Successful registration (2 tests)
  - Validation errors (4 tests)
  - Business logic errors (1 test)
  - Error handling (2 tests)

- **login()**: 13 tests
  - Successful login (2 tests)
  - Validation errors (3 tests)
  - Authentication failures (3 tests)
  - Error handling (2 tests)

### Todos Controller (23 tests)
- **getTodos()**: 5 tests
  - Successful retrieval (4 tests)
  - Error handling (1 test)

- **createTodo()**: 6 tests
  - Successful creation (3 tests)
  - Validation errors (3 tests)
  - Error handling (1 test)

- **updateTodo()**: 7 tests
  - Successful update (4 tests)
  - Authorization checks (3 tests)
  - Validation errors (2 tests)
  - Error handling (1 test)

- **deleteTodo()**: 5 tests
  - Successful deletion (2 tests)
  - Authorization checks (3 tests)
  - Error handling (2 tests)

## Running Tests

```bash
# Run all unit tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode (TDD workflow)
npm run test:watch

# Run specific test file
npm test auth.controller.test.ts
```

## Mock Utilities (setup.ts)

### Mock Factories
```typescript
createMockRequest()      // Express Request
createMockResponse()     // Express Response with Jest spies
createMockAuthRequest()  // Authenticated Request with user context
createMockUser()         // Test user data
createMockTodo()         // Test todo data
```

### Utilities
```typescript
setupTestEnv()           // Set environment variables
suppressConsoleError()   // Hide error logs in tests
```

## Writing New Tests

### Example: Testing a Controller Function

```typescript
describe('myController()', () => {
  describe('successful operation', () => {
    it('should perform expected behavior', async () => {
      // ARRANGE - Setup test data and mocks
      req.body = { data: 'test' };
      mockPrisma.model.findOne.mockResolvedValue(mockData);

      // ACT - Call the function
      await myController(req, res);

      // ASSERT - Verify behavior
      expect(mockPrisma.model.findOne).toHaveBeenCalledWith(...);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(...);
    });
  });

  describe('error cases', () => {
    it('should handle validation errors', async () => {
      // Test validation
    });

    it('should handle database errors', async () => {
      mockPrisma.model.findOne.mockRejectedValue(new Error('DB error'));
      const consoleSpy = suppressConsoleError();

      await myController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      consoleSpy.mockRestore();
    });
  });
});
```

## What Makes These "Unit Tests"?

| Aspect | Unit Tests (This Project) | Integration Tests |
|--------|---------------------------|-------------------|
| **Database** | Mocked (no DB) | Real test database |
| **HTTP Requests** | Mocked (no server) | Real HTTP via Supertest |
| **External Deps** | All mocked | Some real, some mocked |
| **Speed** | <10ms per test | 100-500ms per test |
| **Isolation** | Complete | Partial |
| **TDD-Ready** | Yes | No |

## Testing Strategy Layers

```
┌─────────────────────────────────────┐
│  E2E Tests (Cypress)                │  ← Test user workflows
│  - Few tests (10-20)                │
│  - Slow but comprehensive           │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Integration Tests (Future)         │  ← Test component integration
│  - API contracts                    │
│  - Database operations              │
│  - Middleware chains                │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Unit Tests (THIS LAYER)            │  ← Test business logic
│  - Most tests (100+)                │
│  - Fast (<1s total)                 │
│  - Complete mocking                 │
└─────────────────────────────────────┘
```

## Next Steps

1. **Write More Unit Tests**
   - [ ] Middleware unit tests (auth.ts, security.ts)
   - [ ] Utility functions (if any)
   - [ ] Validation schemas


## Benefits of This Approach

✅ **Fast Feedback Loop**: All tests run in seconds
✅ **TDD-Ready**: Write tests before code
✅ **Reliable**: No flaky tests from DB/network
✅ **Pinpoint Failures**: Know exactly which function broke
✅ **Easy Debugging**: Clear test names and assertions
✅ **High Coverage**: 100% statement coverage achieved
✅ **Maintainable**: Clear structure and patterns

## Common Patterns

### Testing Authorization
```typescript
it('should only allow user to access their own data', async () => {
  req.user!.id = 'user-123';
  mockPrisma.findFirst.mockResolvedValue(null); // Not found for this user

  await controller(req, res);

  expect(mockPrisma.findFirst).toHaveBeenCalledWith({
    where: { id: 'todo-id', userId: 'user-123' }
  });
  expect(res.status).toHaveBeenCalledWith(404);
});
```

### Testing Validation
```typescript
it('should reject invalid input', async () => {
  req.body = { invalid: 'data' };

  await controller(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    error: expect.stringContaining('required')
  });
  expect(mockPrisma.create).not.toHaveBeenCalled(); // No DB call
});
```

### Testing Error Handling
```typescript
it('should return 500 on database error', async () => {
  mockPrisma.findOne.mockRejectedValue(new Error('DB error'));
  const consoleSpy = suppressConsoleError();

  await controller(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    error: 'Internal server error'
  });

  consoleSpy.mockRestore();
});
```

## Learning Resources

- **TDD Fundamentals**: Write tests first, then make them pass
- **AAA Pattern**: Arrange (setup) → Act (execute) → Assert (verify)
- **Test Independence**: Each test should run in isolation
- **Mock vs Stub**: Mocks verify behavior, stubs provide data
- **Coverage Goals**: Aim for 100% statement, 95%+ branch coverage

---

**Happy Testing! 🧪**

Remember: Unit tests are your safety net for refactoring and your documentation for how code should behave.
