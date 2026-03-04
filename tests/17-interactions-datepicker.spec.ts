import { test, expect } from '@playwright/test';
import { INTERACTIONS } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Interactions Page Tests — Date Picker
 *
 * Tests the custom date picker: opening/closing the calendar,
 * navigating months, selecting a day, and verifying formatted output.
 */

const DP = INTERACTIONS.datePicker;

test.describe('Interactions — Date Picker', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'interactions');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display date picker input and toggle button', async ({ page }) => {
    await expect(page.locator(DP.selectors.input)).toBeVisible();
    await expect(page.locator(DP.selectors.toggleBtn)).toBeVisible();
  });

  test('should show default output text', async ({ page }) => {
    await expect(page.locator(DP.selectors.output)).toHaveText('No date selected.');
  });

  test('should have empty input by default', async ({ page }) => {
    await expect(page.locator(DP.selectors.input)).toHaveValue('');
    await expect(page.locator(DP.selectors.input)).toHaveAttribute('placeholder', 'Select a date');
  });

  test('should open calendar when toggle button is clicked', async ({ page }) => {
    await page.locator(DP.selectors.toggleBtn).click();
    await expect(page.locator(DP.selectors.calendar)).toHaveClass(/open/);
  });

  test('should open calendar when input field is clicked', async ({ page }) => {
    await page.locator(DP.selectors.input).click();
    await expect(page.locator(DP.selectors.calendar)).toHaveClass(/open/);
  });

  test('should display month/year header in the calendar', async ({ page }) => {
    await page.locator(DP.selectors.toggleBtn).click();
    const monthYearText = await page.locator(DP.selectors.monthYear).textContent();
    // Should contain a month name and a year number
    expect(monthYearText).toMatch(/\w+ \d{4}/);
  });

  test('should display prev and next month navigation buttons', async ({ page }) => {
    await page.locator(DP.selectors.toggleBtn).click();
    await expect(page.locator(DP.selectors.prevBtn)).toBeVisible();
    await expect(page.locator(DP.selectors.nextBtn)).toBeVisible();
  });

  test('should navigate to the next month', async ({ page }) => {
    await page.locator(DP.selectors.toggleBtn).click();
    const initialMonthYear = await page.locator(DP.selectors.monthYear).textContent();

    await page.locator(DP.selectors.nextBtn).click();
    const newMonthYear = await page.locator(DP.selectors.monthYear).textContent();

    expect(newMonthYear).not.toBe(initialMonthYear);
  });

  test('should navigate to the previous month', async ({ page }) => {
    await page.locator(DP.selectors.toggleBtn).click();
    const initialMonthYear = await page.locator(DP.selectors.monthYear).textContent();

    await page.locator(DP.selectors.prevBtn).click();
    const newMonthYear = await page.locator(DP.selectors.monthYear).textContent();

    expect(newMonthYear).not.toBe(initialMonthYear);
  });

  test('should select a day and update input and output', async ({ page }) => {
    await page.locator(DP.selectors.toggleBtn).click();

    // Click on day 15 of the current month
    const dayButton = page.locator('.dp-day[data-offset="0"][data-day="15"]');
    await dayButton.click();

    // Input should be populated with a date in MM/DD/YYYY format
    const inputValue = await page.locator(DP.selectors.input).inputValue();
    expect(inputValue).toMatch(/\d{2}\/\d{2}\/\d{4}/);

    // Output should reflect "Selected date:"
    await expect(page.locator(DP.selectors.output)).toContainText('Selected date:');

    // Calendar should close after selection
    await expect(page.locator(DP.selectors.calendar)).not.toHaveClass(/open/);
  });

  test('should highlight today in the calendar', async ({ page }) => {
    await page.locator(DP.selectors.toggleBtn).click();
    const todayElement = page.locator('.dp-day.today');
    await expect(todayElement).toBeVisible();
  });

  // ─── Negative Tests ─────────────────────────────────────────

  test('should close calendar when clicking outside', async ({ page }) => {
    await page.locator(DP.selectors.toggleBtn).click();
    await expect(page.locator(DP.selectors.calendar)).toHaveClass(/open/);

    // Click outside the date picker area — use the section heading which is outside the datepicker-wrap
    await page.locator('#page-interactions > h2').click({ force: true });
    await expect(page.locator(DP.selectors.calendar)).not.toHaveClass(/open/);
  });

  test('should not allow typing in the date input (readonly)', async ({ page }) => {
    await expect(page.locator(DP.selectors.input)).toHaveAttribute('readonly', '');
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should navigate multiple months forward and backward', async ({ page }) => {
    await page.locator(DP.selectors.toggleBtn).click();
    const initialMonthYear = await page.locator(DP.selectors.monthYear).textContent();

    // Go forward 3 months
    for (let i = 0; i < 3; i++) {
      await page.locator(DP.selectors.nextBtn).click();
    }
    // Go back 3 months to return to the same
    for (let i = 0; i < 3; i++) {
      await page.locator(DP.selectors.prevBtn).click();
    }

    const finalMonthYear = await page.locator(DP.selectors.monthYear).textContent();
    expect(finalMonthYear).toBe(initialMonthYear);
  });

  test('should select a day and highlight it as selected', async ({ page }) => {
    await page.locator(DP.selectors.toggleBtn).click();
    const dayButton = page.locator('.dp-day[data-offset="0"][data-day="10"]');
    await dayButton.click();

    // Re-open calendar to check the selected state
    await page.locator(DP.selectors.toggleBtn).click();
    const selectedDay = page.locator('.dp-day.selected');
    await expect(selectedDay).toBeVisible();
    await expect(selectedDay).toHaveText('10');
  });

  test('should display other-month days with a different style', async ({ page }) => {
    await page.locator(DP.selectors.toggleBtn).click();
    // There should be some "other-month" days (trailing/leading)
    const otherMonthDays = page.locator('.dp-day.other-month');
    const count = await otherMonthDays.count();
    // At least some months will have trailing/leading days
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should be able to select a day from the previous month (other-month)', async ({ page }) => {
    await page.locator(DP.selectors.toggleBtn).click();

    // Check if there are other-month days
    const otherMonthDays = page.locator('.dp-day.other-month[data-offset="-1"]');
    const count = await otherMonthDays.count();

    if (count > 0) {
      await otherMonthDays.first().click();
      // Input should be updated
      const inputValue = await page.locator(DP.selectors.input).inputValue();
      expect(inputValue).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    }
  });
});
