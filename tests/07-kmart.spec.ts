import { test, expect } from '@playwright/test';
import { KMART } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * KMart (Grocery Store) Page Tests
 *
 * Tests product display, search/filter, cart increment/decrement,
 * total calculation, and edge cases like quantity boundary conditions.
 */

const SEL = KMART.selectors;
const PRODUCTS = KMART.products;

test.describe('KMart — Grocery Store Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'kmart');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display all products in the grid', async ({ page }) => {
    const cards = page.locator('.product-card');
    await expect(cards).toHaveCount(PRODUCTS.length);
  });

  test('should display product names and prices', async ({ page }) => {
    // Verify first product has correct name and price
    const firstCard = page.locator('.product-card').first();
    await expect(firstCard).toContainText(PRODUCTS[0].name);
    await expect(firstCard).toContainText(`$${PRODUCTS[0].price.toFixed(2)}`);
  });

  test('should show cart with 0 items and $0.00 total initially', async ({ page }) => {
    await expect(page.locator(SEL.cartItems)).toHaveText('0');
    await expect(page.locator(SEL.cartTotal)).toHaveText('0.00');
  });

  test('should increment product quantity when + button is clicked', async ({ page }) => {
    // Add one Broccoli (index 0)
    await page.locator(SEL.incrementBtn(0)).click();
    await expect(page.locator(SEL.qtyDisplay(0))).toHaveText('1');
    await expect(page.locator(SEL.cartItems)).toHaveText('1');
    await expect(page.locator(SEL.cartTotal)).toHaveText(PRODUCTS[0].price.toFixed(2));
  });

  test('should increment multiple times correctly', async ({ page }) => {
    // Add 3 of the first product
    for (let i = 0; i < 3; i++) {
      await page.locator(SEL.incrementBtn(0)).click();
    }
    await expect(page.locator(SEL.qtyDisplay(0))).toHaveText('3');
    await expect(page.locator(SEL.cartItems)).toHaveText('3');
    const expectedTotal = (PRODUCTS[0].price * 3).toFixed(2);
    await expect(page.locator(SEL.cartTotal)).toHaveText(expectedTotal);
  });

  test('should decrement product quantity when - button is clicked', async ({ page }) => {
    // Add 2, then remove 1
    await page.locator(SEL.incrementBtn(0)).click();
    await page.locator(SEL.incrementBtn(0)).click();
    await page.locator(SEL.decrementBtn(0)).click();
    await expect(page.locator(SEL.qtyDisplay(0))).toHaveText('1');
    await expect(page.locator(SEL.cartItems)).toHaveText('1');
  });

  test('should add multiple different products to cart', async ({ page }) => {
    // Add 1 Broccoli (120) + 2 Cauliflower (60 each)
    await page.locator(SEL.incrementBtn(0)).click();
    await page.locator(SEL.incrementBtn(1)).click();
    await page.locator(SEL.incrementBtn(1)).click();

    await expect(page.locator(SEL.cartItems)).toHaveText('3');
    const expectedTotal = (PRODUCTS[0].price + PRODUCTS[1].price * 2).toFixed(2);
    await expect(page.locator(SEL.cartTotal)).toHaveText(expectedTotal);
  });

  test('should filter products by search keyword', async ({ page }) => {
    await page.locator(SEL.searchInput).fill('Broccoli');
    const cards = page.locator('.product-card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText('Broccoli');
  });

  test('should display the search input field', async ({ page }) => {
    await expect(page.locator(SEL.searchInput)).toBeVisible();
    await expect(page.locator(SEL.searchInput)).toHaveAttribute('placeholder', 'Search products...');
  });

  // ─── Negative Tests ─────────────────────────────────────────

  test('should not decrement below zero', async ({ page }) => {
    // Try to decrement when quantity is already 0
    await page.locator(SEL.decrementBtn(0)).click();
    await expect(page.locator(SEL.qtyDisplay(0))).toHaveText('0');
    await expect(page.locator(SEL.cartItems)).toHaveText('0');
    await expect(page.locator(SEL.cartTotal)).toHaveText('0.00');
  });

  test('should show no products for non-matching search', async ({ page }) => {
    await page.locator(SEL.searchInput).fill('NonExistentProduct');
    const cards = page.locator('.product-card');
    await expect(cards).toHaveCount(0);
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should restore all products when search is cleared', async ({ page }) => {
    await page.locator(SEL.searchInput).fill('Corn');
    await expect(page.locator('.product-card')).toHaveCount(1);

    await page.locator(SEL.searchInput).fill('');
    await expect(page.locator('.product-card')).toHaveCount(PRODUCTS.length);
  });

  test('should perform case-insensitive search', async ({ page }) => {
    await page.locator(SEL.searchInput).fill('tomato');
    const cards = page.locator('.product-card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText('Tomato');
  });

  test('should search with partial keyword', async ({ page }) => {
    // "Bro" should match "Broccoli"
    await page.locator(SEL.searchInput).fill('Bro');
    const cards = page.locator('.product-card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText('Broccoli');
  });

  test('should calculate total correctly after adding and removing items', async ({ page }) => {
    // Add 2 of product 0 (120 each) and 1 of product 4 (44)
    await page.locator(SEL.incrementBtn(0)).click();
    await page.locator(SEL.incrementBtn(0)).click();
    await page.locator(SEL.incrementBtn(4)).click();

    let expectedTotal = (PRODUCTS[0].price * 2 + PRODUCTS[4].price).toFixed(2);
    await expect(page.locator(SEL.cartTotal)).toHaveText(expectedTotal);

    // Remove 1 of product 0
    await page.locator(SEL.decrementBtn(0)).click();
    expectedTotal = (PRODUCTS[0].price + PRODUCTS[4].price).toFixed(2);
    await expect(page.locator(SEL.cartTotal)).toHaveText(expectedTotal);
  });

  test('should display all product quantities as zero initially', async ({ page }) => {
    // Check first few products have quantity 0
    for (let i = 0; i < 3; i++) {
      await expect(page.locator(SEL.qtyDisplay(i))).toHaveText('0');
    }
  });
});
