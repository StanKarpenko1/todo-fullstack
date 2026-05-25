import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async expectVisible(): Promise<void> {
    await this.page.getByTestId('login-form-container').waitFor({ state: 'visible' });
  }

  async enterEmail(email: string): Promise<void> {
    await this.page.getByLabel('Email').fill(email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.page.getByLabel('Password').fill(password);
  }

  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async loginAs(credentials: { email: string; password: string }): Promise<void> {
    await this.enterEmail(credentials.email);
    await this.enterPassword(credentials.password);
    await this.submit();
    await this.page.waitForURL(/\/todos$/);
  }
}
