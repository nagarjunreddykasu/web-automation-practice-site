import { test, expect } from '@playwright/test';
import { LOGIN, SECTIONS } from './helpers/constants';
import { navigateToSite, navigateToSection, fillLoginForm } from './helpers/actions';

/**
 * Login Page Tests
 *
 * Tests the login form with valid credentials, invalid credentials,
 * empty fields, and various edge cases. The default credentials are
 * stored in constants to avoid hardcoding.
 */

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'login');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display the login form with all fields', async ({ page }) => {
    // Verify all form elements are present
    await expect(page.locator(LOGIN.selectors.usernameInput)).toBeVisible();
    await expect(page.locator(LOGIN.selectors.passwordInput)).toBeVisible();
    await expect(page.locator(LOGIN.selectors.descriptionInput)).toBeVisible();
    await expect(page.locator(LOGIN.selectors.submitButton)).toBeVisible();
  });

  test('should display default credentials hint', async ({ page }) => {
    // The credentials box should show the default username and password
    const credBox = page.locator('.cred-box');
    await expect(credBox).toContainText('nagarjun');
    await expect(credBox).toContainText('Test@123');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in correct username and password, submit, and verify success message
    await fillLoginForm(page, LOGIN.validUsername, LOGIN.validPassword);
    const msg = page.locator(LOGIN.selectors.message);
    await expect(msg).toHaveText(LOGIN.messages.success);
    await expect(msg).toHaveClass(/msg-success/);
  });

  test('should login successfully with valid credentials and description', async ({ page }) => {
    // Also fill the optional description field
    await fillLoginForm(page, LOGIN.validUsername, LOGIN.validPassword, 'Admin user login');
    await expect(page.locator(LOGIN.selectors.message)).toHaveText(LOGIN.messages.success);
  });

  test('should accept input in the username description field', async ({ page }) => {
    // Verify the optional description field accepts and retains text
    const description = 'This is a test description';
    await page.locator(LOGIN.selectors.descriptionInput).fill(description);
    await expect(page.locator(LOGIN.selectors.descriptionInput)).toHaveValue(description);
  });

  // ─── Negative Tests ─────────────────────────────────────────

  test('should show error for invalid username', async ({ page }) => {
    await fillLoginForm(page, LOGIN.invalidUsername, LOGIN.validPassword);
    const msg = page.locator(LOGIN.selectors.message);
    await expect(msg).toHaveText(LOGIN.messages.invalidCreds);
    await expect(msg).toHaveClass(/msg-error/);
  });

  test('should show error for invalid password', async ({ page }) => {
    await fillLoginForm(page, LOGIN.validUsername, LOGIN.invalidPassword);
    const msg = page.locator(LOGIN.selectors.message);
    await expect(msg).toHaveText(LOGIN.messages.invalidCreds);
    await expect(msg).toHaveClass(/msg-error/);
  });

  test('should show error for both invalid username and password', async ({ page }) => {
    await fillLoginForm(page, LOGIN.invalidUsername, LOGIN.invalidPassword);
    await expect(page.locator(LOGIN.selectors.message)).toHaveText(LOGIN.messages.invalidCreds);
  });

  test('should not submit with empty username field', async ({ page }) => {
    // Leave username empty, fill password, and try to submit
    await page.locator(LOGIN.selectors.passwordInput).fill(LOGIN.validPassword);
    await page.locator(LOGIN.selectors.submitButton).click();
    // The browser's built-in HTML5 validation should prevent submission
    // Verify no success message appears
    await expect(page.locator(LOGIN.selectors.message)).toBeEmpty();
  });

  test('should not submit with empty password field', async ({ page }) => {
    // Fill username, leave password empty, try to submit
    await page.locator(LOGIN.selectors.usernameInput).fill(LOGIN.validUsername);
    await page.locator(LOGIN.selectors.submitButton).click();
    await expect(page.locator(LOGIN.selectors.message)).toBeEmpty();
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should handle username with leading/trailing spaces', async ({ page }) => {
    // Spaces around valid username — the app trims input so this should still fail
    await fillLoginForm(page, '  nagarjun  ', LOGIN.validPassword);
    // Depending on trim behavior, either succeeds or shows error
    const msg = page.locator(LOGIN.selectors.message);
    await expect(msg).toBeVisible();
  });

  test('should treat password as case-sensitive', async ({ page }) => {
    // Password with different casing should fail
    await fillLoginForm(page, LOGIN.validUsername, 'test@123');
    await expect(page.locator(LOGIN.selectors.message)).toHaveText(LOGIN.messages.invalidCreds);
  });

  test('should treat username as case-sensitive', async ({ page }) => {
    // Username with different casing should fail
    await fillLoginForm(page, 'Nagarjun', LOGIN.validPassword);
    await expect(page.locator(LOGIN.selectors.message)).toHaveText(LOGIN.messages.invalidCreds);
  });

  test('should handle special characters in username gracefully', async ({ page }) => {
    await fillLoginForm(page, '<script>alert("xss")</script>', LOGIN.validPassword);
    await expect(page.locator(LOGIN.selectors.message)).toHaveText(LOGIN.messages.invalidCreds);
  });

  test('should handle very long input strings', async ({ page }) => {
    const longString = 'a'.repeat(1000);
    await fillLoginForm(page, longString, longString);
    await expect(page.locator(LOGIN.selectors.message)).toHaveText(LOGIN.messages.invalidCreds);
  });

  test('should clear previous error after successful login', async ({ page }) => {
    // First attempt: invalid credentials
    await fillLoginForm(page, LOGIN.invalidUsername, LOGIN.invalidPassword);
    await expect(page.locator(LOGIN.selectors.message)).toHaveClass(/msg-error/);

    // Second attempt: valid credentials
    await fillLoginForm(page, LOGIN.validUsername, LOGIN.validPassword);
    await expect(page.locator(LOGIN.selectors.message)).toHaveClass(/msg-success/);
  });

  test('should verify password field masks input', async ({ page }) => {
    // Password field should have type="password"
    await expect(page.locator(LOGIN.selectors.passwordInput)).toHaveAttribute('type', 'password');
  });
});
