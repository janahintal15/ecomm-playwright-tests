import dotenv from 'dotenv';
dotenv.config(); // Load .env values

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';



// ✅ Load env variables here
const email = process.env.S2_EMAIL!;
const password = process.env.S2_PASSWORD!;


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
    
  const baseUrl = 'https://s2.cengagelearning.com.au/';

  test('can load homepage and validate title', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto(baseUrl);

    await expect(page).toHaveTitle(/Cengage \| Publisher.*Australia and New Zealand/);
  });

  test('can accept cookie consent modal', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto(baseUrl);

    await loginPage.acceptCookies();
  });

  test('can login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto(baseUrl);
    await loginPage.acceptCookies();
    //await loginPage.clickLogin();
    console.log('EMAIL:', process.env.EMAIL);
    // ✅ Use env-based credentials
  await page.getByText('Log in').click();

  await loginPage.login(process.env.S2_EMAIL!, process.env.S2_PASSWORD!);

  await page.waitForURL(/\/(dashboard|subscriptions)$/i);
  });
});
