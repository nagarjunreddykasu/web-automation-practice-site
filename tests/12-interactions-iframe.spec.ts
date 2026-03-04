import { test, expect } from '@playwright/test';
import { INTERACTIONS } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Interactions Page Tests — Iframe
 *
 * Tests interaction with the inline iframe: verifying content loads,
 * clicking the button inside the iframe, and checking iframe message.
 */

const IFRAME = INTERACTIONS.iframe;

test.describe('Interactions — Iframe', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'interactions');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display the iframe element', async ({ page }) => {
    await expect(page.locator(IFRAME.selectors.frame)).toBeVisible();
  });

  test('should load iframe content with heading', async ({ page }) => {
    const frame = page.frameLocator(IFRAME.selectors.frame);
    await expect(frame.locator('h2')).toContainText('Hello from the iframe');
  });

  test('should load iframe content with description paragraph', async ({ page }) => {
    const frame = page.frameLocator(IFRAME.selectors.frame);
    await expect(frame.locator('p')).toContainText('embedded inline frame');
  });

  test('should have a clickable button inside the iframe', async ({ page }) => {
    const frame = page.frameLocator(IFRAME.selectors.frame);
    await expect(frame.locator('button')).toBeVisible();
    await expect(frame.locator('button')).toContainText('Click Me Inside');
  });

  test('should show message when button inside iframe is clicked', async ({ page }) => {
    const frame = page.frameLocator(IFRAME.selectors.frame);

    // The message is hidden initially
    await expect(frame.locator('#iframeMsg')).toBeHidden();

    // Click the button inside the iframe
    await frame.locator('button').click();

    // The message should become visible
    await expect(frame.locator('#iframeMsg')).toBeVisible();
    await expect(frame.locator('#iframeMsg')).toContainText('Button inside iframe was clicked');
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should verify iframe is isolated from parent page content', async ({ page }) => {
    // The iframe should have its own document context
    const frame = page.frameLocator(IFRAME.selectors.frame);
    // The parent page's login form should not be accessible inside the iframe
    await expect(frame.locator('#loginForm')).toHaveCount(0);
  });

  test('should permit clicking iframe button multiple times', async ({ page }) => {
    const frame = page.frameLocator(IFRAME.selectors.frame);
    await frame.locator('button').click();
    await expect(frame.locator('#iframeMsg')).toBeVisible();

    // Click again — message should remain visible
    await frame.locator('button').click();
    await expect(frame.locator('#iframeMsg')).toBeVisible();
  });
});
