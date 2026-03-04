import { test, expect } from '@playwright/test';
import { CHECKBOXES } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Checkboxes Page Tests
 *
 * Tests checkbox toggling, Select All / Deselect All buttons,
 * readonly checkboxes, and output display updates.
 */

const SEL = CHECKBOXES.selectors;

test.describe('Checkboxes Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'checkboxes');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display all checkbox items', async ({ page }) => {
    // Verify all 8 checkboxes (6 enabled + 2 disabled) are present
    const allCheckboxes = page.locator(SEL.allCheckboxes);
    await expect(allCheckboxes).toHaveCount(8);
  });

  test('should display Select All and Deselect All buttons', async ({ page }) => {
    await expect(page.locator(SEL.selectAllBtn)).toBeVisible();
    await expect(page.locator(SEL.deselectAllBtn)).toBeVisible();
  });

  test('should show default output text "No items selected."', async ({ page }) => {
    await expect(page.locator(SEL.output)).toHaveText('No items selected.');
  });

  test('should check a single checkbox and update output', async ({ page }) => {
    const firstCheckbox = page.locator(SEL.enabledCheckboxes).first();
    await firstCheckbox.check();
    await expect(firstCheckbox).toBeChecked();
    // Output should show the selected item
    await expect(page.locator(SEL.output)).toContainText('Selected:');
    await expect(page.locator(SEL.output)).toContainText(CHECKBOXES.items[0]);
  });

  test('should check multiple checkboxes and reflect all in output', async ({ page }) => {
    // Check first three items
    const checkboxes = page.locator(SEL.enabledCheckboxes);
    for (let i = 0; i < 3; i++) {
      await checkboxes.nth(i).check();
    }
    const output = page.locator(SEL.output);
    for (let i = 0; i < 3; i++) {
      await expect(output).toContainText(CHECKBOXES.items[i]);
    }
  });

  test('should uncheck a checkbox and update output accordingly', async ({ page }) => {
    const firstCheckbox = page.locator(SEL.enabledCheckboxes).first();
    await firstCheckbox.check();
    await expect(page.locator(SEL.output)).toContainText(CHECKBOXES.items[0]);

    await firstCheckbox.uncheck();
    await expect(firstCheckbox).not.toBeChecked();
    // "Accept Terms" is pre-checked and disabled, so it always appears in output
    await expect(page.locator(SEL.output)).not.toContainText(CHECKBOXES.items[0]);
  });

  test('should select all enabled checkboxes with Select All button', async ({ page }) => {
    await page.locator(SEL.selectAllBtn).click();

    // Verify all enabled checkboxes are checked
    const enabledCheckboxes = page.locator(SEL.enabledCheckboxes);
    const count = await enabledCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(enabledCheckboxes.nth(i)).toBeChecked();
    }

    // Output should list all selectable items
    const output = page.locator(SEL.output);
    for (const item of CHECKBOXES.items) {
      await expect(output).toContainText(item);
    }
  });

  test('should deselect all checkboxes with Deselect All button', async ({ page }) => {
    // First select all, then deselect all
    await page.locator(SEL.selectAllBtn).click();
    await page.locator(SEL.deselectAllBtn).click();

    const enabledCheckboxes = page.locator(SEL.enabledCheckboxes);
    const count = await enabledCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(enabledCheckboxes.nth(i)).not.toBeChecked();
    }
    // "Accept Terms" stays checked (disabled), so output still shows it
    await expect(page.locator(SEL.output)).toContainText('Accept Terms and Conditions');
    // But none of the user-selectable items should appear
    for (const item of CHECKBOXES.items) {
      await expect(page.locator(SEL.output)).not.toContainText(item);
    }
  });

  // ─── Negative / Readonly Tests ──────────────────────────────

  test('should have "Accept Terms and Conditions" as readonly and pre-checked', async ({ page }) => {
    const termsCheckbox = page.locator('input[value="Accept Terms and Conditions"]');
    await expect(termsCheckbox).toBeChecked();
    await expect(termsCheckbox).toBeDisabled();
  });

  test('should have "Required cookies" as readonly and unchecked', async ({ page }) => {
    const cookiesCheckbox = page.locator('input[value="Required cookies"]');
    await expect(cookiesCheckbox).not.toBeChecked();
    await expect(cookiesCheckbox).toBeDisabled();
  });

  test('should not toggle disabled checkboxes when Select All is clicked', async ({ page }) => {
    // "Required cookies" is disabled and unchecked — Select All should not check it
    await page.locator(SEL.selectAllBtn).click();
    const cookiesCheckbox = page.locator('input[value="Required cookies"]');
    await expect(cookiesCheckbox).not.toBeChecked();
  });

  test('should not uncheck "Accept Terms" when Deselect All is clicked', async ({ page }) => {
    // "Accept Terms" is disabled and checked — Deselect All should not uncheck it
    await page.locator(SEL.deselectAllBtn).click();
    const termsCheckbox = page.locator('input[value="Accept Terms and Conditions"]');
    await expect(termsCheckbox).toBeChecked();
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should toggle a checkbox on and off multiple times', async ({ page }) => {
    const checkbox = page.locator(SEL.enabledCheckboxes).first();
    // Toggle 5 times
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) {
        await checkbox.check();
        await expect(checkbox).toBeChecked();
      } else {
        await checkbox.uncheck();
        await expect(checkbox).not.toBeChecked();
      }
    }
  });

  test('should handle Select All when some are already checked', async ({ page }) => {
    // Check two manually, then click Select All
    await page.locator(SEL.enabledCheckboxes).nth(0).check();
    await page.locator(SEL.enabledCheckboxes).nth(2).check();
    await page.locator(SEL.selectAllBtn).click();

    // All enabled should be checked
    const enabledCheckboxes = page.locator(SEL.enabledCheckboxes);
    const count = await enabledCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(enabledCheckboxes.nth(i)).toBeChecked();
    }
  });

  test('should handle Deselect All when none are checked', async ({ page }) => {
    // Clicking Deselect All when nothing user-selectable is checked
    await page.locator(SEL.deselectAllBtn).click();
    // "Accept Terms" is disabled+checked so it still shows in output
    await expect(page.locator(SEL.output)).toContainText('Accept Terms and Conditions');
  });
});
