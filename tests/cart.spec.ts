import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { LoginPage } from '../pages/LoginPage';
import { getBaseUrl, getCredentials } from '../utils/env';


const ENV = 'PROD';

test.describe('CART Tests', () => {

  test('AU - Add to Cart and Verify Total', async ({ page }) => {
    const cart = new CartPage(page);

    await cart.goto(getBaseUrl(ENV, 'AU'));
    await cart.openPrimaryCategory();
    await cart.triggerSearch();
    await cart.addFirstItems();
    await cart.goToCart();
    await cart.verifyTotal();
  });

  test('NZ - Add to Cart and Verify Total', async ({ page }) => {
    const cart = new CartPage(page);

    await cart.goto(getBaseUrl(ENV, 'NZ'));
    await cart.openPrimaryCategory();
    await cart.triggerSearch();
    await cart.addFirstItems();
    await cart.goToCart();
    await cart.verifyTotal();
  });

test('AU- Add and Remove from List', async ({ page }, testInfo) => {
  const ENV = testInfo.project.name as 'S2' | 'PROD';

  const login = new LoginPage(page);
  const cart = new CartPage(page);

  const creds = getCredentials(ENV, 'AU');
  const baseUrl = getBaseUrl(ENV, 'AU');

  await login.goto(baseUrl);
  await login.acceptCookies();
  await login.clickLogin();
  await login.login(creds.email, creds.password);
  await login.assertLoginSuccess();

  await cart.goto(baseUrl);
  await cart.openPrimaryCategory();
  await cart.triggerSearch();
  await cart.addFirstItems();
  await cart.goToCart();

  await page.locator('.row.cart-item').first().click();
  await page.getByRole('button', { name: 'Add to List' }).first().click();
  await page.getByRole('link', { name: 'Shopping List' }).click();

  await page.getByRole('link', { name: 'My Lists' }).first().click();
 await expect(page).toHaveURL(
      /\/list(\?listname=.*)?$/i
    );

  await cart.clearCart();
  // Assert cart page
  await expect(page).toHaveURL(/\/list\/item\/cart$/i);

  // Assert cart count is zero
  await expect(page.locator('#Cart')).toHaveText('0');

  });

  test('NZ - Add and Remove from List', async ({ page }, testInfo) => {
  const ENV = testInfo.project.name as 'S2' | 'PROD';

  const login = new LoginPage(page);
  const cart = new CartPage(page);

  const creds = getCredentials(ENV, 'NZ');
  const baseUrl = getBaseUrl(ENV, 'NZ');

  await login.goto(baseUrl);
  await login.acceptCookies();
  await login.clickLogin();
  await login.login(creds.email, creds.password);
  await login.assertLoginSuccess();

  await cart.goto(baseUrl);
  await cart.openPrimaryCategory();
  await cart.triggerSearch();
  await cart.addFirstItems();
  await cart.goToCart();

  await page.locator('.row.cart-item').first().click();
  await page.getByRole('button', { name: 'Add to List' }).first().click();
  await page.getByRole('link', { name: 'Shopping List' }).click();

  await page.getByRole('link', { name: 'My Lists' }).first().click();
 await expect(page).toHaveURL(
      /\/list(\?listname=.*)?$/i
    );

  await cart.clearCart();
  // Assert cart page
  await expect(page).toHaveURL(/\/list\/item\/cart$/i);

  // Assert cart count is zero
  await expect(page.locator('#Cart')).toHaveText('0');

  });

});
