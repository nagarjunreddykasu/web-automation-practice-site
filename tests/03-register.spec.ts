import { test, expect } from '@playwright/test';
import { REGISTER } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Registration Page Tests
 *
 * Tests the registration form covering valid submissions, validation
 * for mismatched passwords, empty required fields, and form reset.
 */

const SEL = REGISTER.selectors;
const DATA = REGISTER.validData;

/** Helper to fill the complete registration form */
async function fillRegistrationForm(
  page: import('@playwright/test').Page,
  overrides: Partial<typeof DATA> = {}
): Promise<void> {
  const d = { ...DATA, ...overrides };
  await page.locator(SEL.firstName).fill(d.firstName);
  await page.locator(SEL.lastName).fill(d.lastName);
  await page.locator(SEL.email).fill(d.email);
  await page.locator(SEL.phone).fill(d.phone);
  await page.locator(SEL.gender).selectOption(d.gender);
  await page.locator(SEL.address).fill(d.address);
  await page.locator(SEL.city).fill(d.city);
  await page.locator(SEL.state).fill(d.state);
  await page.locator(SEL.zip).fill(d.zip);
  await page.locator(SEL.country).selectOption(d.country);
  await page.locator(SEL.username).fill(d.username);
  await page.locator(SEL.password).fill(d.password);
  await page.locator(SEL.confirmPassword).fill(d.confirmPassword);
}

test.describe('Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'register');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display the registration form with all fields', async ({ page }) => {
    await expect(page.locator(SEL.firstName)).toBeVisible();
    await expect(page.locator(SEL.lastName)).toBeVisible();
    await expect(page.locator(SEL.email)).toBeVisible();
    await expect(page.locator(SEL.phone)).toBeVisible();
    await expect(page.locator(SEL.gender)).toBeVisible();
    await expect(page.locator(SEL.address)).toBeVisible();
    await expect(page.locator(SEL.city)).toBeVisible();
    await expect(page.locator(SEL.state)).toBeVisible();
    await expect(page.locator(SEL.zip)).toBeVisible();
    await expect(page.locator(SEL.country)).toBeVisible();
    await expect(page.locator(SEL.username)).toBeVisible();
    await expect(page.locator(SEL.password)).toBeVisible();
    await expect(page.locator(SEL.confirmPassword)).toBeVisible();
  });

  test('should register successfully with valid data', async ({ page }) => {
    await fillRegistrationForm(page);
    await page.locator(SEL.submitButton).click();

    const msg = page.locator(SEL.message);
    await expect(msg).toContainText('Registration successful');
    await expect(msg).toHaveClass(/msg-success/);
  });

  test('should register with minimal required fields only', async ({ page }) => {
    // Fill only required fields: first name, last name, email, username, password, confirm
    await page.locator(SEL.firstName).fill(DATA.firstName);
    await page.locator(SEL.lastName).fill(DATA.lastName);
    await page.locator(SEL.email).fill(DATA.email);
    await page.locator(SEL.username).fill(DATA.username);
    await page.locator(SEL.password).fill(DATA.password);
    await page.locator(SEL.confirmPassword).fill(DATA.confirmPassword);
    await page.locator(SEL.submitButton).click();

    await expect(page.locator(SEL.message)).toContainText('Registration successful');
  });

  test('should display the username in success message', async ({ page }) => {
    await fillRegistrationForm(page);
    await page.locator(SEL.submitButton).click();
    await expect(page.locator(SEL.message)).toContainText(DATA.username);
  });

  // ─── Negative Tests ─────────────────────────────────────────

  test('should show error when passwords do not match', async ({ page }) => {
    await fillRegistrationForm(page, { confirmPassword: 'DifferentPass' });
    await page.locator(SEL.submitButton).click();

    const msg = page.locator(SEL.message);
    await expect(msg).toHaveText('Passwords do not match.');
    await expect(msg).toHaveClass(/msg-error/);
  });

  test('should not submit when first name is empty', async ({ page }) => {
    await fillRegistrationForm(page, { firstName: '' });
    // Clear the field explicitly (fill with empty may not trigger required)
    await page.locator(SEL.firstName).clear();
    await page.locator(SEL.submitButton).click();
    // HTML5 validation prevents submission — no message should appear
    await expect(page.locator(SEL.message)).toBeEmpty();
  });

  test('should not submit when email is empty', async ({ page }) => {
    await fillRegistrationForm(page, { email: '' });
    await page.locator(SEL.email).clear();
    await page.locator(SEL.submitButton).click();
    await expect(page.locator(SEL.message)).toBeEmpty();
  });

  test('should not submit when username is empty', async ({ page }) => {
    await fillRegistrationForm(page, { username: '' });
    await page.locator(SEL.username).clear();
    await page.locator(SEL.submitButton).click();
    await expect(page.locator(SEL.message)).toBeEmpty();
  });

  test('should not submit when password is empty', async ({ page }) => {
    await fillRegistrationForm(page, { password: '', confirmPassword: '' });
    await page.locator(SEL.password).clear();
    await page.locator(SEL.confirmPassword).clear();
    await page.locator(SEL.submitButton).click();
    await expect(page.locator(SEL.message)).toBeEmpty();
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should reset all fields when Reset button is clicked', async ({ page }) => {
    await fillRegistrationForm(page);
    await page.locator(SEL.resetButton).click();

    // All fields should be cleared
    await expect(page.locator(SEL.firstName)).toHaveValue('');
    await expect(page.locator(SEL.lastName)).toHaveValue('');
    await expect(page.locator(SEL.email)).toHaveValue('');
    await expect(page.locator(SEL.username)).toHaveValue('');
    await expect(page.locator(SEL.password)).toHaveValue('');
    await expect(page.locator(SEL.confirmPassword)).toHaveValue('');
  });

  test('should allow selecting all gender options', async ({ page }) => {
    const genders = ['Male', 'Female', 'Other'];
    for (const gender of genders) {
      await page.locator(SEL.gender).selectOption(gender);
      await expect(page.locator(SEL.gender)).toHaveValue(gender);
    }
  });

  test('should allow selecting all country options', async ({ page }) => {
    const countries = ['India', 'USA', 'UK', 'Germany', 'Australia', 'Canada'];
    for (const country of countries) {
      await page.locator(SEL.country).selectOption(country);
      await expect(page.locator(SEL.country)).toHaveValue(country);
    }
  });

  test('should handle special characters in all text fields', async ({ page }) => {
    await fillRegistrationForm(page, {
      firstName: "O'Brien",
      lastName: 'De la Cruz',
      address: '123 Main St, Apt #5',
      city: 'São Paulo',
    });
    await page.locator(SEL.submitButton).click();
    await expect(page.locator(SEL.message)).toContainText('Registration successful');
  });

  test('should verify password fields mask input', async ({ page }) => {
    await expect(page.locator(SEL.password)).toHaveAttribute('type', 'password');
    await expect(page.locator(SEL.confirmPassword)).toHaveAttribute('type', 'password');
  });

  test('should verify email field validates format', async ({ page }) => {
    // Fill all required fields but with an invalid email
    await page.locator(SEL.firstName).fill(DATA.firstName);
    await page.locator(SEL.lastName).fill(DATA.lastName);
    await page.locator(SEL.email).fill('not-an-email');
    await page.locator(SEL.username).fill(DATA.username);
    await page.locator(SEL.password).fill(DATA.password);
    await page.locator(SEL.confirmPassword).fill(DATA.confirmPassword);
    await page.locator(SEL.submitButton).click();
    // HTML5 email validation should prevent submission
    await expect(page.locator(SEL.message)).toBeEmpty();
  });
});
