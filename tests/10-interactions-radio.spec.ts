import { test, expect } from '@playwright/test';
import { INTERACTIONS } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Interactions Page Tests — Radio Buttons
 *
 * Tests radio button selection, mutual exclusion, and output display.
 */

const RADIO = INTERACTIONS.radio;

test.describe('Interactions — Radio Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'interactions');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display all radio button options', async ({ page }) => {
    for (const option of RADIO.options) {
      await expect(page.locator(RADIO.selectors.option(option))).toBeVisible();
    }
  });

  test('should show default output "No selection made."', async ({ page }) => {
    await expect(page.locator(RADIO.selectors.output)).toHaveText('No selection made.');
  });

  test('should select a radio button and update output', async ({ page }) => {
    await page.locator(RADIO.selectors.option('Python')).check();
    await expect(page.locator(RADIO.selectors.option('Python'))).toBeChecked();
    await expect(page.locator(RADIO.selectors.output)).toHaveText('Selected: Python');
  });

  test('should allow selecting each radio option', async ({ page }) => {
    for (const option of RADIO.options) {
      await page.locator(RADIO.selectors.option(option)).check();
      await expect(page.locator(RADIO.selectors.option(option))).toBeChecked();
      await expect(page.locator(RADIO.selectors.output)).toHaveText(`Selected: ${option}`);
    }
  });

  // ─── Negative / Edge Tests ──────────────────────────────────

  test('should only allow one option to be selected at a time (mutual exclusion)', async ({ page }) => {
    await page.locator(RADIO.selectors.option('Java')).check();
    await page.locator(RADIO.selectors.option('TypeScript')).check();

    // Java should no longer be checked
    await expect(page.locator(RADIO.selectors.option('Java'))).not.toBeChecked();
    await expect(page.locator(RADIO.selectors.option('TypeScript'))).toBeChecked();
    await expect(page.locator(RADIO.selectors.output)).toHaveText('Selected: TypeScript');
  });

  test('should keep selection when clicking the same option twice', async ({ page }) => {
    await page.locator(RADIO.selectors.option('JavaScript')).check();
    await page.locator(RADIO.selectors.option('JavaScript')).check();
    await expect(page.locator(RADIO.selectors.option('JavaScript'))).toBeChecked();
  });
});
