import { test, expect } from '@playwright/test';

test('can register AU', async ({ page }) => {
    // Generate a unique email with current datetime
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const uniqueEmail = `ibcqa_au${timestamp}@yopmail.com`;

    console.log(` Using unique email: ${uniqueEmail}`);

    await page.goto('https://cengage.com.au/');
    await page.getByRole('link', { name: ' Sign Up' }).click();

    // Fill in signup form
    await page.getByLabel('First name:').fill('IBC');
    await page.getByLabel('Last name:').fill('QA');
    await page.getByLabel('Email:', { exact: true }).fill(uniqueEmail);
    await page.getByLabel('Confirm Email:').fill(uniqueEmail);
    await page.locator('#Password').click();
    await page.getByLabel('Password:').fill('Password1');

    await page.locator('#termsImg').click();
    await page.getByLabel('dismiss cookie message').click();
    await page.getByRole('button', { name: 'Create my account' }).click();

    // after creating the account…
    await page.waitForURL('**/signup?e=confirmation', { timeout: 30000 });

    // Assert successful registration
    await expect(page.getByRole('link', { name: 'MY DASHBOARD' })).toBeVisible();
});

test('can register NZ', async ({ page }) => {
    // Generate a unique email with current datetime
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const uniqueEmailNZ = `ibcqa_nz${timestamp}@yopmail.com`;

    console.log(` Using unique email: ${uniqueEmailNZ}`);

    await page.goto('https://cengage.co.nz/');
    await page.getByRole('link', { name: ' Sign Up' }).click();

    // Fill in signup form
    await page.getByLabel('First name:').fill('IBC');
    await page.getByLabel('Last name:').fill('QA');
    await page.getByLabel('Email:', { exact: true }).fill(uniqueEmailNZ);
    await page.getByLabel('Confirm Email:').fill(uniqueEmailNZ);
    await page.locator('#Password').click();
    await page.getByLabel('Password:').fill('Password1');
    await page.locator('#termsImg').click();
        await page.getByLabel('dismiss cookie message').click();
    await page.getByRole('button', { name: 'Create my account' }).click();

    // after creating the account…
    await page.waitForURL('**/signup?e=confirmation', { timeout: 30000 });

    // Assert successful registration
    await expect(page.getByRole('link', { name: 'MY DASHBOARD' })).toBeVisible();

});


test('can change country', async ({ page }) => {
    await page.goto('https://s2.cengagelearning.com.au/');

    // Fill in signup form
    await page.locator('#CountryName').click();
    //await page.locator('//*[@id="countrydropdown"]/span').click();
});
