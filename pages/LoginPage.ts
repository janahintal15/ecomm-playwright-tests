import { Page, Locator, FrameLocator, expect } from '@playwright/test';

export class LoginPage {
  private page: Page;
  private loginFrame: FrameLocator;
  private loginButton: Locator;
  private cookieDescription: Locator;
  private cookieAcceptButton: Locator;
  private userLabel: Locator;
  private emailField: Locator;
  private passwordField: Locator;
  private loginBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.loginFrame = page.frameLocator('xpath=//*[@id="wrapperLogin"]');
    this.emailField = page.getByText('This page requires frames in').contentFrame().getByPlaceholder('Email');
    this.passwordField = page.getByText('This page requires frames in').contentFrame().getByPlaceholder('Password');
    this.loginBtn = page.getByText('This page requires frames in').contentFrame().getByRole('button', { name: 'Log in' });

    this.loginButton = page.getByText('Log in');
    this.cookieDescription = page.locator('#cookieconsent\\:desc');
    this.cookieAcceptButton = page.locator('xpath=//*[@id="Body"]/div[1]/div/a');
    this.userLabel = page.locator('#LoginNameLabel');
  }

  async goto(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async acceptCookies() {
    // Only try to accept cookies if the modal is present
    if (await this.cookieDescription.isVisible({ timeout: 5000 })) {
      await expect(this.cookieAcceptButton).toBeVisible();
      await this.cookieAcceptButton.click();
    }
  }

  async clickLogin() {
    await expect(this.loginButton).toBeVisible();
    await this.loginButton.click();
  }

  async login(email: string, password: string) {
  // Wait for the iframe before accessing its content
  await this.loginBtn.click();
  //await this.page.waitForSelector('#wrapperLogin', { timeout: 10000 });

    await this.emailField.fill(email);
    await this.passwordField.fill(password);

    await this.loginBtn.click();

  }

  async assertLoginSuccess() {
    await this.page.waitForURL(/\/(dashboard|subscriptions)$/i, { timeout: 15000 });
    await expect(this.userLabel).toBeVisible({ timeout: 10000 });
  }
}
