/**
 * Shared helper functions for navigating and interacting with the
 * Automation Practice Hub. Each helper encapsulates repeated actions
 * so that tests stay concise and DRY.
 */

import { Page, expect } from '@playwright/test';
import { NAV, SECTIONS } from './constants';

/** Navigate to the site and wait for content to load */
export async function navigateToSite(page: Page): Promise<void> {
  await page.goto('./');
  await expect(page.locator(SECTIONS.welcome)).toBeVisible();
}

/**
 * Click a navigation menu item and wait for the corresponding section to appear.
 * @param page - Playwright Page object
 * @param menuKey - Key of the NAV selector (e.g., 'login', 'register')
 */
export async function navigateToSection(
  page: Page,
  menuKey: keyof typeof NAV
): Promise<void> {
  await page.locator(NAV[menuKey]).click();
  const sectionKey = menuKey === 'home' ? 'welcome' : menuKey;
  const sectionSelector = SECTIONS[sectionKey as keyof typeof SECTIONS];
  if (sectionSelector) {
    await expect(page.locator(sectionSelector)).toBeVisible();
  }
}

/** Fill the login form and submit */
export async function fillLoginForm(
  page: Page,
  username: string,
  password: string,
  description?: string
): Promise<void> {
  await page.locator('#loginUser').fill(username);
  await page.locator('#loginPass').fill(password);
  if (description) {
    await page.locator('#loginUserDesc').fill(description);
  }
  await page.locator('#loginForm button[type="submit"]').click();
}

/** Press a sequence of calculator buttons */
export async function pressCalcButtons(
  page: Page,
  sequence: string[]
): Promise<void> {
  for (const val of sequence) {
    await page.locator(`.calc-btn[data-val="${val}"]`).click();
  }
}

/** Get the current calculator display value */
export async function getCalcDisplay(page: Page): Promise<string> {
  return (await page.locator('#calcDisplay').textContent()) ?? '';
}
