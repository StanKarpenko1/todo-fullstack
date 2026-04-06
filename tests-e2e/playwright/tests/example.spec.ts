import { test, expect } from '@playwright/test';

/**
 * Example Playwright Test - Verify Setup
 *
 * This is a placeholder test to verify Playwright is installed correctly.
 * Delete or replace this file when you start writing real tests.
 */
test.describe('Playwright Setup Verification', () => {
  test('should load the frontend homepage', async ({ page, browserName }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:5173/');

     console.log(`rinning on ${browserName}`);

    await page.waitForTimeout(5000)

   

   
  });


});

/**
 * Learning Resources:
 *
 * 1. Auto-waiting - Playwright waits automatically for elements
 *    await page.click('button');  // Waits for button to be visible + enabled
 *
 * 2. Locators - Modern approach (recommended)
 *    await page.locator('button').click();
 *    await expect(page.locator('h1')).toHaveText('Welcome');
 *
 * 3. Navigation
 *    await page.goto('/login');
 *    await page.goBack();
 *
 * 4. Assertions
 *    await expect(page.locator('h1')).toBeVisible();
 *    await expect(page.locator('input')).toHaveValue('test');
 *
 * 5. Actions
 *    await page.fill('input[name="email"]', 'test@example.com');
 *    await page.click('button[type="submit"]');
 *    await page.check('input[type="checkbox"]');
 *
 * Next steps:
 * - Run `npm run test:pw:ui` to see this test in UI mode
 * - Run `npm run codegen:pw` to record actions and generate code
 * - Delete this file and write real tests for your todo app
 */
