import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('CART Tests', () => {

  test('AU - Add to Cart and Verify Total', async ({ page }) => {
    const cart = new CartPage(page);

    await cart.goto('https://cengage.com.au/');
    await cart.openPrimaryCategory();
    await cart.triggerSearch();
    await cart.addFirstItems(3);
    await cart.goToCart();
    await cart.verifyTotal();
  });

  test('NZ - Add to Cart and Verify Total', async ({ page }) => {
    const cart = new CartPage(page);

    await cart.goto('https://cengage.co.nz/');
    await cart.openPrimaryCategory();
    await cart.triggerSearch();
    await cart.addFirstItems(3);
    await cart.goToCart();
    await cart.verifyTotal();
  });

  test('AU - Add and Remove to List', async ({ page }) => {
    const login = new LoginPage(page);
    const cart = new CartPage(page);

    // LOGIN
    await login.goto('https://cengage.com.au/');
    await login.acceptCookies();
    await login.clickLogin();
    await login.login(
      process.env.PROD_EMAIL!,
      process.env.PROD_PASSWORD!
    );
    await login.assertLoginSuccess();

    // ADD ITEMS TO CART
    await cart.goto('https://cengage.com.au/');
    await cart.openPrimaryCategory();
    await cart.triggerSearch();
    await cart.addFirstItems(3);
    await cart.goToCart();

    // ADD FIRST ITEM TO LIST
    await page.locator('.row.cart-item').first().click();
    await page.getByRole('button', { name: 'Add to List' }).first().click();
    await page.getByRole('link', { name: 'Shopping List' }).click();

    // VERIFY IN LIST
    await page.getByRole('link', { name: 'My Lists' }).first().click();

    const shoppingListRow = page.locator('.ListTblRow', {
      has: page.locator('.listnamegridlabel', { hasText: 'Shopping List' }),
    });

    await shoppingListRow.getByRole('link', { name: 'Open' }).click();
    await expect(page).toHaveURL(/\/list\?listname/i);

    // CLEAR AND RESET CART
    await page.locator('#cartlnk').click();
    await page.locator('#linkDelete').first().click();
    await page.locator('#btnClearCartConfirm').click();
  });

});