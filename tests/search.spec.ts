// Your Test File (e.g., cart.test.ts)

import { test, expect } from '@playwright/test';

// Define the expected ISBNs once for readability
const EXPECTED_ISBNS = [
    '9780170346641',
    '9780170486781',
    '9780170335201',
];

const SEARCH_QUERY = EXPECTED_ISBNS.join(',');

test.describe('Search Tests', () => {

    test('NZ can search isbn from landing page and verify all results', async ({ page }) => {
        
        await page.goto('https://cengage.co.nz/');
        await page.getByLabel('Search').click();
        await page.getByLabel('Search').fill(SEARCH_QUERY);
        await page.getByLabel('Search').press('Enter');
        
        // Wait for a URL that contains the beginning of the query
        await page.waitForURL('**/qry/9780170346641*');
        
        // Get the main product results container once
        const resultsContainer = page.locator('#ProductResultDiv');

        // Assert that the container contains ALL three ISBN texts
        for (const isbn of EXPECTED_ISBNS) {
            // Assert that the specific ISBN text is visible within the container
            await expect(resultsContainer).toContainText(isbn, { timeout: 10000 });
        }
        
    });

    test('AU can search isbn from landing page and verify all results', async ({ page }) => {
        
        await page.goto('https://cengage.com.au/');
        await page.getByLabel('Search').click();
        await page.getByLabel('Search').fill(SEARCH_QUERY);
        await page.getByLabel('Search').press('Enter');
        
        // Wait for a URL that contains the beginning of the query
        await page.waitForURL('**/qry/9780170346641*');
        
        // Get the main product results container once
        const resultsContainer = page.locator('#ProductResultDiv');

        // Assert that the container contains ALL three ISBN texts
        for (const isbn of EXPECTED_ISBNS) {
            // Assert that the specific ISBN text is visible within the container
            await expect(resultsContainer).toContainText(isbn, { timeout: 10000 });
        }
        
    });

});