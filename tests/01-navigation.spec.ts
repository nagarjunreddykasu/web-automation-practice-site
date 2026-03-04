import { test, expect } from '@playwright/test';
import { NAV, SECTIONS } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Navigation & Home Page Tests
 *
 * Covers the top navigation menu, page switching, and welcome section.
 * Ensures every menu item renders the correct section and hides others.
 */

test.describe('Navigation & Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display the welcome/home section by default', async ({ page }) => {
    // The welcome section should be visible on initial load
    await expect(page.locator(SECTIONS.welcome)).toBeVisible();
    await expect(page.locator(SECTIONS.welcome)).toHaveClass(/active/);
  });

  test('should display the site title in the header', async ({ page }) => {
    // Verify the site branding is visible
    await expect(page.locator('.topbar-brand h1')).toContainText('Automation');
    await expect(page.locator('.topbar-brand h1')).toContainText('Practice Hub');
  });

  test('should show all navigation menu items', async ({ page }) => {
    // Verify every expected menu link is present in the navigation
    const menuItems = ['Home', 'Login', 'Register', 'Checkboxes', 'Webtables',
      'Calculator', 'KMart', 'Dropdowns', 'Upload', 'Interactions'];

    for (const item of menuItems) {
      await expect(page.locator(`${NAV.menu} a`).filter({ hasText: item })).toBeVisible();
    }
  });

  test('should navigate to Login page when clicking Login menu', async ({ page }) => {
    await navigateToSection(page, 'login');
    // Login section becomes visible, welcome hides
    await expect(page.locator(SECTIONS.login)).toBeVisible();
    await expect(page.locator(SECTIONS.welcome)).not.toBeVisible();
  });

  test('should navigate to Register page when clicking Register menu', async ({ page }) => {
    await navigateToSection(page, 'register');
    await expect(page.locator(SECTIONS.register)).toBeVisible();
    await expect(page.locator(SECTIONS.welcome)).not.toBeVisible();
  });

  test('should navigate back to Home from any section', async ({ page }) => {
    // Navigate away first
    await navigateToSection(page, 'calculator');
    await expect(page.locator(SECTIONS.calculator)).toBeVisible();

    // Navigate back home
    await navigateToSection(page, 'home');
    await expect(page.locator(SECTIONS.welcome)).toBeVisible();
    await expect(page.locator(SECTIONS.calculator)).not.toBeVisible();
  });

  test('should navigate through all menu items sequentially', async ({ page }) => {
    // Iterate over every nav section and verify visibility toggles correctly
    const sectionKeys: Array<keyof typeof NAV> = [
      'login', 'register', 'checkboxes', 'webtables',
      'calculator', 'kmart', 'dropdowns', 'upload', 'interactions',
    ];

    for (const key of sectionKeys) {
      await navigateToSection(page, key);
      const sectionSelector = SECTIONS[key as keyof typeof SECTIONS];
      await expect(page.locator(sectionSelector)).toBeVisible();
    }
  });

  test('should highlight the active nav link', async ({ page }) => {
    // Click on Checkboxes and verify the link receives the "active" class
    await page.locator(NAV.checkboxes).click();
    await expect(page.locator(NAV.checkboxes)).toHaveClass(/active/);
    // The Home link should no longer be active
    await expect(page.locator(NAV.home)).not.toHaveClass(/active/);
  });

  // ─── Edge / Negative Tests ──────────────────────────────────

  test('should only show one section at a time', async ({ page }) => {
    // Navigate to Login, then verify no other section is active
    await navigateToSection(page, 'login');
    const activeSections = page.locator('.page-section.active');
    await expect(activeSections).toHaveCount(1);
  });

  test('should keep the section visible when clicking the same menu item twice', async ({ page }) => {
    await navigateToSection(page, 'calculator');
    await navigateToSection(page, 'calculator');
    await expect(page.locator(SECTIONS.calculator)).toBeVisible();
  });

  test('should display contact information in the header', async ({ page }) => {
    // Verify contact links are present
    await expect(page.locator('a[href="mailto:nagarjun.sdet@gmail.com"]')).toBeVisible();
    await expect(page.locator('a[href="tel:+919030086420"]')).toBeVisible();
  });
});
