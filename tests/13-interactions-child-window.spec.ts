import { test, expect } from '@playwright/test';
import { INTERACTIONS } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Interactions Page Tests — Child Window
 *
 * Tests opening and closing child/popup windows from the parent page,
 * interacting with child window elements, and verifying status output.
 */

const CHILD = INTERACTIONS.childWindow;

test.describe('Interactions — Child Window', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'interactions');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display Open and Close child window buttons', async ({ page }) => {
    await expect(page.locator(CHILD.selectors.openBtn)).toBeVisible();
    await expect(page.locator(CHILD.selectors.closeBtn)).toBeVisible();
  });

  test('should show default child window status text', async ({ page }) => {
    await expect(page.locator(CHILD.selectors.output)).toHaveText('Child window status will appear here.');
  });

  test('should open a child window and update status', async ({ page, context }) => {
    // Listen for the new page (popup)
    const popupPromise = context.waitForEvent('page');
    await page.locator(CHILD.selectors.openBtn).click();
    const popup = await popupPromise;

    // Wait for the popup to load
    await popup.waitForLoadState();

    // Verify parent page output
    await expect(page.locator(CHILD.selectors.output)).toHaveText('Child window opened successfully!');

    // Verify child window content
    await expect(popup.locator('h1')).toContainText('Child Window');
    await expect(popup.locator('p')).toContainText('separate child window');

    // Clean up
    await popup.close();
  });

  test('should interact with button inside child window', async ({ page, context }) => {
    const popupPromise = context.waitForEvent('page');
    await page.locator(CHILD.selectors.openBtn).click();
    const popup = await popupPromise;
    await popup.waitForLoadState();

    // The message should be hidden initially
    await expect(popup.locator('#childMsg')).toBeHidden();

    // Click the button inside the child window
    await popup.locator('button:not(.close)').first().click();

    // The message should appear
    await expect(popup.locator('#childMsg')).toBeVisible();
    await expect(popup.locator('#childMsg')).toContainText('Button clicked inside child window');

    await popup.close();
  });

  test('should close child window via the Close button in child window', async ({ page, context }) => {
    const popupPromise = context.waitForEvent('page');
    await page.locator(CHILD.selectors.openBtn).click();
    const popup = await popupPromise;
    await popup.waitForLoadState();

    // Close the child window using its own Close button
    const closePromise = popup.waitForEvent('close');
    await popup.locator('button.close').click();
    await closePromise;
    expect(popup.isClosed()).toBe(true);
  });

  // ─── Negative Tests ─────────────────────────────────────────

  test('should show "No child window" message when closing without opening', async ({ page }) => {
    await page.locator(CHILD.selectors.closeBtn).click();
    await expect(page.locator(CHILD.selectors.output)).toHaveText('No child window is currently open.');
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should close child window from parent page', async ({ page, context }) => {
    const popupPromise = context.waitForEvent('page');
    await page.locator(CHILD.selectors.openBtn).click();
    const popup = await popupPromise;
    await popup.waitForLoadState();

    // Close via parent's Close button
    await page.locator(CHILD.selectors.closeBtn).click();
    await expect(page.locator(CHILD.selectors.output)).toHaveText('Child window has been closed.');
  });

  test('should focus existing child window if opened twice', async ({ page, context }) => {
    // Open first time
    const popupPromise = context.waitForEvent('page');
    await page.locator(CHILD.selectors.openBtn).click();
    const popup = await popupPromise;
    await popup.waitForLoadState();

    // Try opening again — should focus existing
    await page.locator(CHILD.selectors.openBtn).click();
    await expect(page.locator(CHILD.selectors.output)).toHaveText('Child window already open — focused it.');

    await popup.close();
  });
});
