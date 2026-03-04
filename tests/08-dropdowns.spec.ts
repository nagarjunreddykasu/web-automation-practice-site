import { test, expect } from '@playwright/test';
import { DROPDOWNS } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Dropdowns Page Tests
 *
 * Tests all four dropdown selectors (Country, Currency, Language, Framework),
 * output text updates, and edge cases like re-selecting default options.
 */

const SEL = DROPDOWNS.selectors;
const OPTIONS = DROPDOWNS.options;

test.describe('Dropdowns Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'dropdowns');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display all four dropdowns', async ({ page }) => {
    await expect(page.locator(SEL.country)).toBeVisible();
    await expect(page.locator(SEL.currency)).toBeVisible();
    await expect(page.locator(SEL.language)).toBeVisible();
    await expect(page.locator(SEL.framework)).toBeVisible();
  });

  test('should show default output text', async ({ page }) => {
    await expect(page.locator(SEL.output)).toHaveText('Select values from the dropdowns above.');
  });

  test('should select a country and update output', async ({ page }) => {
    await page.locator(SEL.country).selectOption('India');
    await expect(page.locator(SEL.country)).toHaveValue('India');
    await expect(page.locator(SEL.output)).toContainText('India');
  });

  test('should select a currency and update output', async ({ page }) => {
    await page.locator(SEL.currency).selectOption('USD');
    await expect(page.locator(SEL.currency)).toHaveValue('USD');
    await expect(page.locator(SEL.output)).toContainText('USD');
  });

  test('should select a language and update output', async ({ page }) => {
    await page.locator(SEL.language).selectOption('Telugu');
    await expect(page.locator(SEL.language)).toHaveValue('Telugu');
    await expect(page.locator(SEL.output)).toContainText('Telugu');
  });

  test('should select a framework and update output', async ({ page }) => {
    await page.locator(SEL.framework).selectOption('Playwright');
    await expect(page.locator(SEL.framework)).toHaveValue('Playwright');
    await expect(page.locator(SEL.output)).toContainText('Playwright');
  });

  test('should select values in all dropdowns and reflect them in output', async ({ page }) => {
    await page.locator(SEL.country).selectOption('USA');
    await page.locator(SEL.currency).selectOption('GBP');
    await page.locator(SEL.language).selectOption('Hindi');
    await page.locator(SEL.framework).selectOption('Selenium');

    const output = page.locator(SEL.output);
    await expect(output).toContainText('USA');
    await expect(output).toContainText('GBP');
    await expect(output).toContainText('Hindi');
    await expect(output).toContainText('Selenium');
  });

  test('should have correct country options', async ({ page }) => {
    for (const option of OPTIONS.country) {
      await page.locator(SEL.country).selectOption(option);
      await expect(page.locator(SEL.country)).toHaveValue(option);
    }
  });

  test('should have correct currency options', async ({ page }) => {
    for (const option of OPTIONS.currency) {
      await page.locator(SEL.currency).selectOption(option);
      await expect(page.locator(SEL.currency)).toHaveValue(option);
    }
  });

  test('should have correct language options', async ({ page }) => {
    for (const option of OPTIONS.language) {
      await page.locator(SEL.language).selectOption(option);
      await expect(page.locator(SEL.language)).toHaveValue(option);
    }
  });

  test('should have correct framework options', async ({ page }) => {
    for (const option of OPTIONS.framework) {
      await page.locator(SEL.framework).selectOption(option);
      await expect(page.locator(SEL.framework)).toHaveValue(option);
    }
  });

  // ─── Negative Tests ─────────────────────────────────────────

  test('should show "Not selected" in output when default placeholder is chosen', async ({ page }) => {
    // Select a value first, then switch back to default
    await page.locator(SEL.country).selectOption('India');
    await page.locator(SEL.country).selectOption('');
    await expect(page.locator(SEL.output)).toContainText('Not selected');
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should allow changing selections multiple times', async ({ page }) => {
    // Change country multiple times
    await page.locator(SEL.country).selectOption('India');
    await expect(page.locator(SEL.output)).toContainText('India');

    await page.locator(SEL.country).selectOption('UK');
    await expect(page.locator(SEL.output)).toContainText('UK');
    // India should no longer appear (replaced by UK)
    await expect(page.locator(SEL.output)).not.toContainText('India');
  });

  test('should update output only for the changed dropdown', async ({ page }) => {
    // Select country and framework
    await page.locator(SEL.country).selectOption('Germany');
    await page.locator(SEL.framework).selectOption('Cypress');

    // Now change only framework
    await page.locator(SEL.framework).selectOption('Puppeteer');

    const output = page.locator(SEL.output);
    await expect(output).toContainText('Germany');
    await expect(output).toContainText('Puppeteer');
    await expect(output).not.toContainText('Cypress');
  });

  test('should retain other dropdown values when one is changed', async ({ page }) => {
    await page.locator(SEL.country).selectOption('Australia');
    await page.locator(SEL.currency).selectOption('AUD');

    // Change country, currency should remain
    await page.locator(SEL.country).selectOption('USA');
    await expect(page.locator(SEL.currency)).toHaveValue('AUD');
  });
});
