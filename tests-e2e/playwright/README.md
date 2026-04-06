# Playwright E2E Tests

UI end-to-end tests for the Todo application using Playwright.

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers (~300MB)
npx playwright install
```

## Running Tests

### UI Mode (Recommended for Development)
```bash
npm run test:pw:ui
```
- Interactive test runner
- Time travel debugging
- Watch mode

### Headless Mode (CI/Production)
```bash
npm run test:pw
```

### Headed Mode (See Browser)
```bash
npm run test:pw:headed
```

### Debug Mode (Step-by-Step)
```bash
npm run test:pw:debug
```

## Code Generation

Generate tests by recording your actions:
```bash
npm run codegen:pw
```
- Opens browser
- Click around the app
- Playwright writes the code for you!

## View Test Report

After running tests:
```bash
npm run report:pw
```

## Project Structure

```
tests-e2e/playwright/
├─ tests/
│   └─ example.spec.ts        # Example test (delete when ready)
├─ playwright.config.ts       # Main configuration
├─ package.json               # Dependencies and scripts
└─ README.md                  # This file
```

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page.locator('h1')).toHaveText('Dashboard');
});
```

### Key Concepts

**Auto-waiting:**
- Playwright waits automatically for elements to be ready
- No need for manual sleeps or waits

**Locators:**
```typescript
page.locator('button')           // By tag
page.locator('.btn-primary')     // By class
page.locator('#submit')          // By ID
page.locator('[data-testid="login"]')  // By data attribute
page.locator('text=Click me')    // By text
```

**Assertions:**
```typescript
await expect(page.locator('h1')).toBeVisible();
await expect(page.locator('input')).toHaveValue('test');
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveTitle(/Dashboard/);
```

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Group related tests** with `test.describe()`
3. **Use beforeEach** for common setup
4. **Take screenshots** on failure (automatic)
5. **Run in parallel** when possible
6. **Use Page Object Model** for complex apps

## Learning Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## Next Steps

1. ✅ Verify setup: `npm run test:pw:ui`
2. ✅ Try codegen: `npm run codegen:pw`
3. ✅ Delete `example.spec.ts`
4. ✅ Write real tests for todo app features:
   - User registration
   - User login
   - Create todo
   - Edit todo
   - Delete todo
   - Filter todos
