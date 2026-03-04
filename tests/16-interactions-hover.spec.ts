import { test, expect } from '@playwright/test';
import { INTERACTIONS } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Interactions Page Tests — Mouse Hover
 *
 * Tests hovering over colored boxes, verifying tooltip visibility,
 * tooltip text content, and the output text updates.
 */

const HOVER = INTERACTIONS.hover;

test.describe('Interactions — Mouse Hover', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'interactions');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display all 5 hover boxes', async ({ page }) => {
    const boxes = page.locator(`${HOVER.selectors.grid} .hover-box`);
    await expect(boxes).toHaveCount(5);
  });

  test('should show default hover output text', async ({ page }) => {
    await expect(page.locator(HOVER.selectors.output)).toHaveText('Hover over a box to see details.');
  });

  test('should display each box with correct label text', async ({ page }) => {
    for (const box of HOVER.boxes) {
      const colorLabel = box.color.charAt(0).toUpperCase() + box.color.slice(1);
      await expect(
        page.locator(`${HOVER.selectors.grid} .hover-box`).filter({ hasText: colorLabel })
      ).toBeVisible();
    }
  });

  test('should show tooltip when hovering over Blue box', async ({ page }) => {
    const blueBox = page.locator('.hover-box[data-color="blue"]');
    await blueBox.hover();

    // Output should update with blue box details
    await expect(page.locator(HOVER.selectors.output)).toContainText('Blue');
    await expect(page.locator(HOVER.selectors.output)).toContainText('Primary actions');
  });

  test('should update output for each hover box', async ({ page }) => {
    for (const box of HOVER.boxes) {
      const element = page.locator(`.hover-box[data-color="${box.color}"]`);
      await element.hover();

      const colorLabel = box.color.charAt(0).toUpperCase() + box.color.slice(1);
      await expect(page.locator(HOVER.selectors.output)).toContainText(colorLabel);
    }
  });

  test('should show tooltip with correct text for Green box', async ({ page }) => {
    const greenBox = page.locator('.hover-box[data-color="green"]');
    await greenBox.hover();

    const tooltip = page.locator(HOVER.selectors.tooltip);
    await expect(tooltip).toHaveText('Green — Success status');
    await expect(tooltip).toHaveClass(/visible/);
  });

  // ─── Negative / Edge Tests ──────────────────────────────────

  test('should hide tooltip when mouse leaves the box', async ({ page }) => {
    const purpleBox = page.locator('.hover-box[data-color="purple"]');
    await purpleBox.hover();
    await expect(page.locator(HOVER.selectors.tooltip)).toHaveClass(/visible/);

    // Move mouse away by hovering over a different non-box element
    await page.locator(HOVER.selectors.output).hover();
    // The output should revert to default
    await expect(page.locator(HOVER.selectors.output)).toHaveText('Hover over a box to see details.');
  });

  test('should verify each box has correct data-tooltip attribute', async ({ page }) => {
    for (const box of HOVER.boxes) {
      const element = page.locator(`.hover-box[data-color="${box.color}"]`);
      await expect(element).toHaveAttribute('data-tooltip', box.tooltip);
    }
  });

  test('should switch tooltip when hovering from one box to another', async ({ page }) => {
    // Hover over orange first
    await page.locator('.hover-box[data-color="orange"]').hover();
    await expect(page.locator(HOVER.selectors.tooltip)).toHaveText('Orange — Warning level');

    // Then hover over pink
    await page.locator('.hover-box[data-color="pink"]').hover();
    await expect(page.locator(HOVER.selectors.tooltip)).toHaveText('Pink — Highlight item');
  });
});
