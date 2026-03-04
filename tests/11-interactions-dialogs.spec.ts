import { test, expect } from '@playwright/test';
import { INTERACTIONS } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Interactions Page Tests — Dialogs (Alert, Confirm, Prompt)
 *
 * Tests handling of browser-native dialogs: alert, confirm (accept/dismiss),
 * and prompt (with input, empty, and cancel).
 */

const DIALOGS = INTERACTIONS.dialogs;

test.describe('Interactions — Dialogs', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'interactions');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display dialog action buttons', async ({ page }) => {
    await expect(page.locator(DIALOGS.selectors.alertBtn)).toBeVisible();
    await expect(page.locator(DIALOGS.selectors.confirmBtn)).toBeVisible();
    await expect(page.locator(DIALOGS.selectors.promptBtn)).toBeVisible();
  });

  test('should handle Alert dialog and update output', async ({ page }) => {
    // Set up alert handler before triggering
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toContain('sample Alert dialog');
      await dialog.accept();
    });

    await page.locator(DIALOGS.selectors.alertBtn).click();
    await expect(page.locator(DIALOGS.selectors.output)).toHaveText('Alert was displayed and dismissed.');
  });

  test('should handle Confirm dialog — accept', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    await page.locator(DIALOGS.selectors.confirmBtn).click();
    await expect(page.locator(DIALOGS.selectors.output)).toHaveText('Confirm result: OK (true)');
  });

  test('should handle Confirm dialog — dismiss', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss();
    });

    await page.locator(DIALOGS.selectors.confirmBtn).click();
    await expect(page.locator(DIALOGS.selectors.output)).toHaveText('Confirm result: Cancel (false)');
  });

  test('should handle Prompt dialog — enter a name', async ({ page }) => {
    const nameInput = 'Nagarjun';
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept(nameInput);
    });

    await page.locator(DIALOGS.selectors.promptBtn).click();
    await expect(page.locator(DIALOGS.selectors.output)).toContainText(`Prompt returned: "${nameInput}"`);
  });

  test('should handle Prompt dialog — submit empty string', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.accept('');
    });

    await page.locator(DIALOGS.selectors.promptBtn).click();
    await expect(page.locator(DIALOGS.selectors.output)).toHaveText('Prompt returned empty string.');
  });

  // ─── Negative Tests ─────────────────────────────────────────

  test('should handle Prompt dialog — cancel', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    await page.locator(DIALOGS.selectors.promptBtn).click();
    await expect(page.locator(DIALOGS.selectors.output)).toHaveText('Prompt was cancelled.');
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should handle Prompt dialog with special characters', async ({ page }) => {
    const specialInput = '<script>alert("xss")</script>';
    page.on('dialog', async (dialog) => {
      await dialog.accept(specialInput);
    });

    await page.locator(DIALOGS.selectors.promptBtn).click();
    await expect(page.locator(DIALOGS.selectors.output)).toContainText('Prompt returned:');
  });

  test('should update output correctly when triggering multiple dialogs sequentially', async ({ page }) => {
    // First: Alert
    let dialogCount = 0;
    page.on('dialog', async (dialog) => {
      dialogCount++;
      await dialog.accept();
    });

    await page.locator(DIALOGS.selectors.alertBtn).click();
    await expect(page.locator(DIALOGS.selectors.output)).toHaveText('Alert was displayed and dismissed.');

    // Second: Confirm (accept)
    await page.locator(DIALOGS.selectors.confirmBtn).click();
    await expect(page.locator(DIALOGS.selectors.output)).toHaveText('Confirm result: OK (true)');

    expect(dialogCount).toBe(2);
  });
});
