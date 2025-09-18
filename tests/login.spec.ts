import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { LoginPage } from '../pages/LoginPage';

dotenv.config();

// Utility: Get credentials based on current project
function getCredentials(projectName: string) {
  const prefix = projectName.toUpperCase(); // 'S2' or 'PROD'
  return {
    email: process.env[`${prefix}_EMAIL`]!,
    password: process.env[`${prefix}_PASSWORD`]!,
    baseUrl: process.env[`${prefix}_BASE_URL`]!,
  };
}

test.describe('ECOMM Login Flow', () => {
  let loginPage: LoginPage;
  let baseUrl: string;
  let email: string;
  let password: string;

  test.beforeEach(async ({ page }, testInfo) => {
    // ⬇️ Dynamically load env vars per project
    const creds = getCredentials(testInfo.project.name);
    email = creds.email;
    password = creds.password;
    baseUrl = creds.baseUrl;

    loginPage = new LoginPage(page);

    // ⬇️ Visit the base URL before each test
    await loginPage.goto(baseUrl);
  });

  test('can load homepage and validate title', async ({ page }) => {
    await expect(page).toHaveTitle(/Cengage \| Publisher.*Australia and New Zealand/);
  });

  test('can accept cookie consent modal', async () => {
    await loginPage.acceptCookies();
  });

  test('can login successfully', async ({ page }) => {
    await loginPage.acceptCookies();
    await page.getByText('Log in').click();
    await loginPage.login(email, password);
    await page.waitForURL(/\/(dashboard|subscriptions)$/i);
    await loginPage.assertLoginSuccess();
  });

    test('failing login', async ({ page }) => {
    await loginPage.acceptCookies();
    await page.getByText('Log in').click();
    await loginPage.login('test@gg.com', password);
    await page.waitForURL(/\/(dashboard|subscriptions)$/i);
    await loginPage.assertLoginSuccess();
  });
});

