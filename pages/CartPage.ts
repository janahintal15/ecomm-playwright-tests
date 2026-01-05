import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;

  readonly primaryMenu: Locator;
  readonly searchButton: Locator;
  readonly addToCartButtons: Locator;
  readonly cartLink: Locator;
  readonly lineItemTotals: Locator;
  readonly shippingLabel: Locator;
  readonly cartTotalFooter: Locator;

  constructor(page: Page) {
    this.page = page;

    // Unique + stable
    this.primaryMenu = page.locator('#dnn_CENGAGESUBMENU_PrimaryLink');

    this.searchButton = page.locator('#nondiv-searchbtn');
    this.addToCartButtons = page.locator('button[id^="AddToCartBtn"]');
    this.cartLink = page.getByRole('link', { name: /My Cart/i });
    this.lineItemTotals = page.locator('.PriceComputed.line-total');
    this.shippingLabel = page.locator('#ShippingCostLabel');
    this.cartTotalFooter = page.locator('#CartTotalLabelFooter');
  }

  async goto(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async openPrimaryCategory() {
    await this.primaryMenu.click();
  }

  async triggerSearch() {
    await this.searchButton.click();

    // Wait for results to load (replaces networkidle)
    await this.addToCartButtons.first().waitFor({ timeout: 15000 });
  }

  async addFirstItems(count: number = 3) {
    const total = await this.addToCartButtons.count();
    const limit = Math.min(count, total);

    for (let i = 0; i < limit; i++) {
      const btn = this.addToCartButtons.nth(i);

      await btn.scrollIntoViewIfNeeded();
      await btn.click();

      // tiny buffer for UI changes (SAFE!)
      await this.page.waitForTimeout(400);
    }
  }

  async goToCart() {
    await this.cartLink.click();
    await this.page.waitForURL('**/list/item/cart', { timeout: 15000 });
  }

  async calculateSubtotal() {
    await expect(this.lineItemTotals.first()).toBeVisible({ timeout: 10000 });

    const prices = await this.lineItemTotals.allInnerTexts();
    return prices.reduce(
      (acc, price) => acc + parseFloat(price.replace(/[^0-9.]/g, '')),
      0
    );
  }

  async getShipping(subtotal: number) {
    if (subtotal < 200) {
      const txt = await this.shippingLabel.innerText();
      return parseFloat(txt.replace(/[^0-9.]/g, ''));
    }
    return 0;
  }

  async getDisplayedTotal() {
    const txt = await this.cartTotalFooter.innerText();
    return parseFloat(txt.replace(/[^0-9.]/g, ''));
  }

  async verifyTotal() {
    const subtotal = await this.calculateSubtotal();
    const shipping = await this.getShipping(subtotal);

    const expected = (subtotal + shipping).toFixed(2);
    const displayed = (await this.getDisplayedTotal()).toFixed(2);

    expect(displayed).toBe(expected);
  }
}
