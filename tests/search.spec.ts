import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://s2.cengagelearning.com.au/');
  await page.locator('#dnn_CENGAGESUBMENU_PrimaryLink').getByRole('link', { name: 'Primary' }).click();
  await page.locator('#dnn_CENGAGESUBMENU_PrimaryLink').getByRole('link', { name: 'Primary' }).press('F15');
  await page.getByPlaceholder('Search Primary by title,').click();
  await page.locator('#nondiv-searchbtn').click();
  await page.goto('https://s2.cengagelearning.com.au/search/pg/1/sortOrder/r/div/primary/qry/');
  await page.getByText('9780170334747').dblclick();
  await page.locator('#Body').press('ControlOrMeta+c');
  await page.getByPlaceholder('Search Primary by title,').click();
  await page.getByPlaceholder('Search Primary by title,').fill('9780170334747');
  await page.locator('#nondiv-searchbtn').click();
  await page.goto('https://s2.cengagelearning.com.au/product/division/primary/title/power-up/isbn/9780170334747');
});