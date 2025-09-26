import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

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

test.describe('CART Tests', () => {

    test('AU - Add to Cart and Verify Total (with Conditional Shipping)', async ({ page }) => {

        // --- Setup and Navigation ---
        await page.goto('https://cengage.com.au/');
        await page.locator('#dnn_CENGAGESUBMENU_PrimaryLink').getByRole('link', { name: 'Primary' }).click();
        await page.locator('#nondiv-searchbtn').click();
        await page.goto('https://cengage.com.au/search/pg/1/sortOrder/r/div/primary/qry/');

        // Add 3 items (adjust this section to ensure the subtotal is BELOW $200 for testing shipping logic)
        await page.locator('#AddToCartBtn110333').click();
        await page.locator('#AddToCartBtn110335').click();
        await page.locator('#AddToCartBtn110331').click();

        // Go to My Cart
        await page.getByRole('link', { name: /My Cart/i }).click();
        // Wait for the URL to change to the cart page
        await page.waitForURL('**/list/item/cart');

        // --- 1. Calculate the Subtotal (Sum of Line Items) ---
        console.log('Calculating line item subtotals...');
        const lineItemSelector = '.PriceComputed.line-total';
        await page.locator(lineItemSelector).first().waitFor({ state: 'visible', timeout: 10000 });

        const lineTotalElements = await page.locator(lineItemSelector).all();
        let subtotal = 0.0; // We use 'subtotal' to clearly separate it from the final total

        for (const element of lineTotalElements) {
            const priceText = await element.innerText();
            // Remove '$' or any non-digit/non-decimal characters
            const cleanedPrice = priceText.replace(/[^0-9.]/g, '');
            subtotal += parseFloat(cleanedPrice);
        }

        // --- 2. Calculate Conditional Shipping Cost and Final Total ---

        let shippingCost = 0.0;

        // Check if the subtotal is below the $200 threshold
        if (subtotal < 200) {
            // Find the shipping cost element and extract its value
            const shippingCostLocator = page.locator('#ShippingCostLabel');
            await shippingCostLocator.waitFor({ state: 'visible' });

            const shippingText = await shippingCostLocator.innerText();

            // Clean and parse the shipping cost
            const cleanedShipping = shippingText.replace(/[^0-9.]/g, '');
            shippingCost = parseFloat(cleanedShipping);

            console.log(`Subtotal $${subtotal.toFixed(2)} is BELOW $200. Adding shipping cost of $${shippingCost.toFixed(2)}.`);
        } else {
            console.log(`Subtotal $${subtotal.toFixed(2)} is $200 or ABOVE. Shipping is free.`);
        }

        // Calculate the final expected total
        let finalCalculatedTotalValue = subtotal + shippingCost;

        // Round the calculated total to two decimal places for assertion
        const finalCalculatedTotal = finalCalculatedTotalValue.toFixed(2);
        console.log(`Calculated Final Total (Subtotal + Shipping): ${finalCalculatedTotal}`);

        // --- 3. Locate and Extract the Expected Cart Total (from the UI) ---
        const expectedTotalLocator = page.locator('#CartTotalLabelFooter');
        await expectedTotalLocator.waitFor({ state: 'visible' });

        const expectedTotalText = await expectedTotalLocator.innerText();
        const cleanedExpectedTotal = expectedTotalText.replace(/[^0-9.]/g, '');
        const finalExpectedTotal = parseFloat(cleanedExpectedTotal).toFixed(2);

        console.log(`Displayed Total: ${finalExpectedTotal}`);

        // --- 4. Assertion ---
        // Assert that the sum of the subtotal and conditional shipping matches the displayed grand total
        expect(finalCalculatedTotal).toBe(finalExpectedTotal);

        console.log('✅ Cart Total Verification Passed!');
    });

    test('NZ - Add to Cart and Verify Total (with Conditional Shipping)', async ({ page }) => {

        // --- Setup and Navigation ---
        await page.goto('https://cengage.co.nz/');
        await page.locator('#dnn_CENGAGESUBMENU_PrimaryLink').getByRole('link', { name: 'Primary' }).click();
        await page.locator('#nondiv-searchbtn').click();
        await page.goto('https://cengage.co.nz/search/pg/1/sortOrder/r/div/primary/qry/');

        // Add 3 items (adjust this section to ensure the subtotal is BELOW $200 for testing shipping logic)
        await page.locator('#AddToCartBtn110333').click();
        await page.locator('#AddToCartBtn110335').click();
        await page.locator('#AddToCartBtn110331').click();

        // Go to My Cart
        await page.getByRole('link', { name: /My Cart/i }).click();
        // Wait for the URL to change to the cart page
        await page.waitForURL('**/list/item/cart');

        // --- 1. Calculate the Subtotal (Sum of Line Items) ---
        console.log('Calculating line item subtotals...');
        const lineItemSelector = '.PriceComputed.line-total';
        await page.locator(lineItemSelector).first().waitFor({ state: 'visible', timeout: 10000 });

        const lineTotalElements = await page.locator(lineItemSelector).all();
        let subtotal = 0.0; // We use 'subtotal' to clearly separate it from the final total

        for (const element of lineTotalElements) {
            const priceText = await element.innerText();
            // Remove '$' or any non-digit/non-decimal characters
            const cleanedPrice = priceText.replace(/[^0-9.]/g, '');
            subtotal += parseFloat(cleanedPrice);
        }

        // --- 2. Calculate Conditional Shipping Cost and Final Total ---

        let shippingCost = 0.0;

        // Check if the subtotal is below the $200 threshold
        if (subtotal < 200) {
            // Find the shipping cost element and extract its value
            const shippingCostLocator = page.locator('#ShippingCostLabel');
            await shippingCostLocator.waitFor({ state: 'visible' });

            const shippingText = await shippingCostLocator.innerText();

            // Clean and parse the shipping cost
            const cleanedShipping = shippingText.replace(/[^0-9.]/g, '');
            shippingCost = parseFloat(cleanedShipping);

            console.log(`Subtotal $${subtotal.toFixed(2)} is BELOW $200. Adding shipping cost of $${shippingCost.toFixed(2)}.`);
        } else {
            console.log(`Subtotal $${subtotal.toFixed(2)} is $200 or ABOVE. Shipping is free.`);
        }

        // Calculate the final expected total
        let finalCalculatedTotalValue = subtotal + shippingCost;

        // Round the calculated total to two decimal places for assertion
        const finalCalculatedTotal = finalCalculatedTotalValue.toFixed(2);
        console.log(`Calculated Final Total (Subtotal + Shipping): ${finalCalculatedTotal}`);

        // --- 3. Locate and Extract the Expected Cart Total (from the UI) ---
        const expectedTotalLocator = page.locator('#CartTotalLabelFooter');
        await expectedTotalLocator.waitFor({ state: 'visible' });

        const expectedTotalText = await expectedTotalLocator.innerText();
        const cleanedExpectedTotal = expectedTotalText.replace(/[^0-9.]/g, '');
        const finalExpectedTotal = parseFloat(cleanedExpectedTotal).toFixed(2);

        console.log(`Displayed Total: ${finalExpectedTotal}`);

        // --- 4. Assertion ---
        // Assert that the sum of the subtotal and conditional shipping matches the displayed grand total
        expect(finalCalculatedTotal).toBe(finalExpectedTotal);

        console.log('✅ Cart Total Verification Passed!');
    });


});

