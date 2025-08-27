import { test, expect } from '@playwright/test';

test.describe('ECOMM Tests', () => {
  const url = 'https://s2.cengagelearning.com.au/';

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Cengage | Publisher for the school and higher education markets for Australia and New Zealand \| Cengage Australia/);
  });
  test('can accept cookies', async ({ page }) => {
    // Ensure the "Understood" button is visible before attempting to click
    await page.locator('xpath=//*[@id="Body"]/div[1]/span[1]');
    await expect(page.locator('id=cookieconsent:desc')).toBeVisible({ timeout: 10000 });
    
    // Click the button once it's visible
    await page.locator('xpath=//*[@id="Body"]/div[1]/div/a').click();
  });

});
