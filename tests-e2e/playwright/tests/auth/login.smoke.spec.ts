import { test, expect } from '../../framework/test';
import users from '../../../fixtures/users.json';

test.describe('Login — smoke', () => {
  test('standard user can log in and reach /todos', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.expectVisible();
    await loginPage.loginAs(users.standard);

    await expect(page).toHaveURL(/\/todos$/);
    await expect(page.getByTestId('todos-page-container')).toBeVisible();
  });
});
