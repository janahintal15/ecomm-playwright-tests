import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

function getCredentials(projectName: string) {
  const prefix = projectName.toUpperCase();
  return {
    email: process.env[`${prefix}_EMAIL`]!,
    password: process.env[`${prefix}_PASSWORD`]!,
    baseUrl: process.env[`${prefix}_BASE_URL`]!,
  };
}

test.describe('CART Tests', () => {

  const addToCartAndVerify = async (page, baseUrl: string) => {
    // --- Setup & Navigation ---
    await page.goto(baseUrl);
    await page.locator('#dnn_CENGAGESUBMENU_PrimaryLink').getByRole('link', { name: 'Primary' }).click();
    await page.locator('#nondiv-searchbtn').click();
    await page.goto(`${baseUrl}search/pg/1/sortOrder/r/div/primary/qry/`);

    // --- Add First 3 Items Dynamically ---
    const addToCartButtons = page.locator('button[id^="AddToCartBtn"]');
    const totalButtons = await addToCartButtons.count();

    console.log(`Found ${totalButtons} Add to Cart buttons.`);

    for (let i = 0; i < Math.min(3, totalButtons); i++) {
      const button = addToCartButtons.nth(i);
      const productTitle = await button.locator('xpath=ancestor::div[contains(@class, "product-results")]//h2//span').textContent().catch(() => '');
      console.log(`🛒 Adding item #${i + 1}: ${productTitle?.trim() || '(unknown title)'}`);
      await button.scrollIntoViewIfNeeded();
      await button.click();
      await page.waitForTimeout(1000); // short delay between adds
    }

    // --- Go to My Cart ---
    await page.getByRole('link', { name: /My Cart/i }).click();
    await page.waitForURL('**/list/item/cart');

    // --- Calculate Subtotal ---
    console.log('Calculating line item subtotals...');
    const lineItemSelector = '.PriceComputed.line-total';
    await page.locator(lineItemSelector).first().waitFor({ state: 'visible', timeout: 10000 });

    const prices = await page.locator(lineItemSelector).allInnerTexts();
    const subtotal = prices.reduce((acc, price) => acc + parseFloat(price.replace(/[^0-9.]/g, '')), 0);

    // --- Shipping Logic ---
    let shippingCost = 0;
    if (subtotal < 200) {
      const shippingText = await page.locator('#ShippingCostLabel').innerText();
      shippingCost = parseFloat(shippingText.replace(/[^0-9.]/g, ''));
      console.log(`Subtotal $${subtotal.toFixed(2)} < $200 → Shipping $${shippingCost.toFixed(2)}`);
    } else {
      console.log(`Subtotal $${subtotal.toFixed(2)} ≥ $200 → Free shipping`);
    }

    // --- Total Verification ---
    const finalCalculatedTotal = (subtotal + shippingCost).toFixed(2);
    const expectedTotalText = await page.locator('#CartTotalLabelFooter').innerText();
    const finalExpectedTotal = parseFloat(expectedTotalText.replace(/[^0-9.]/g, '')).toFixed(2);

    console.log(`Calculated Total: ${finalCalculatedTotal}`);
    console.log(`Displayed Total: ${finalExpectedTotal}`);
    expect(finalCalculatedTotal).toBe(finalExpectedTotal);

    console.log('✅ Cart Total Verification Passed!');
  };

  test('AU - Add to Cart and Verify Total', async ({ page }) => {
    await addToCartAndVerify(page, 'https://cengage.com.au/');
  });

  test('NZ - Add to Cart and Verify Total', async ({ page }) => {
    await addToCartAndVerify(page, 'https://cengage.co.nz/');
  });
});
