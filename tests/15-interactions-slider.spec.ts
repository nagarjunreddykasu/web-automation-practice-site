import { test, expect } from '@playwright/test';
import { INTERACTIONS } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Interactions Page Tests — Slider
 *
 * Tests the range slider control: default value, setting min/max,
 * intermediate values, and verifying output synchronisation.
 */

const SLIDER = INTERACTIONS.slider;

test.describe('Interactions — Slider', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'interactions');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display the slider control', async ({ page }) => {
    await expect(page.locator(SLIDER.selectors.range)).toBeVisible();
  });

  test('should have default value of 50', async ({ page }) => {
    await expect(page.locator(SLIDER.selectors.range)).toHaveValue('50');
    await expect(page.locator(SLIDER.selectors.value)).toHaveText('50');
    await expect(page.locator(SLIDER.selectors.output)).toHaveText('Current value: 50');
  });

  test('should have correct min and max attributes', async ({ page }) => {
    await expect(page.locator(SLIDER.selectors.range)).toHaveAttribute('min', '0');
    await expect(page.locator(SLIDER.selectors.range)).toHaveAttribute('max', '100');
    await expect(page.locator(SLIDER.selectors.range)).toHaveAttribute('step', '1');
  });

  test('should update value and output when slider is moved to 75', async ({ page }) => {
    await page.locator(SLIDER.selectors.range).fill('75');
    await expect(page.locator(SLIDER.selectors.value)).toHaveText('75');
    await expect(page.locator(SLIDER.selectors.output)).toHaveText('Current value: 75');
  });

  test('should set slider to minimum value (0)', async ({ page }) => {
    await page.locator(SLIDER.selectors.range).fill('0');
    await expect(page.locator(SLIDER.selectors.value)).toHaveText('0');
    await expect(page.locator(SLIDER.selectors.output)).toHaveText('Current value: 0');
  });

  test('should set slider to maximum value (100)', async ({ page }) => {
    await page.locator(SLIDER.selectors.range).fill('100');
    await expect(page.locator(SLIDER.selectors.value)).toHaveText('100');
    await expect(page.locator(SLIDER.selectors.output)).toHaveText('Current value: 100');
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should allow changing slider value multiple times', async ({ page }) => {
    const values = ['10', '50', '90', '25', '0', '100'];
    for (const val of values) {
      await page.locator(SLIDER.selectors.range).fill(val);
      await expect(page.locator(SLIDER.selectors.value)).toHaveText(val);
      await expect(page.locator(SLIDER.selectors.output)).toHaveText(`Current value: ${val}`);
    }
  });

  test('should synchronize value display with slider input', async ({ page }) => {
    // Set to 33 and verify both the bubble and output are synchronised
    await page.locator(SLIDER.selectors.range).fill('33');
    const displayText = await page.locator(SLIDER.selectors.value).textContent();
    const outputText = await page.locator(SLIDER.selectors.output).textContent();
    expect(outputText).toContain(displayText!);
  });
});
