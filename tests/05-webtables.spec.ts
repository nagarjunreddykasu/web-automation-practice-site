import { test, expect } from '@playwright/test';
import { WEBTABLES } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Web Tables Page Tests
 *
 * Tests the data table: initial rendering, search/filter, adding new users,
 * editing existing users, deleting users, and modal behavior.
 */

const SEL = WEBTABLES.selectors;
const NEW_USER = WEBTABLES.newUser;

/** Fill the Add/Edit User modal form */
async function fillUserModal(
  page: import('@playwright/test').Page,
  data: typeof NEW_USER
): Promise<void> {
  await page.locator(SEL.modalFirstName).fill(data.firstName);
  await page.locator(SEL.modalLastName).fill(data.lastName);
  await page.locator(SEL.modalUserName).fill(data.userName);
  await page.locator(SEL.modalCustomer).selectOption(data.customer);
  await page.locator(SEL.modalRole).selectOption(data.role);
  await page.locator(SEL.modalEmail).fill(data.email);
  await page.locator(SEL.modalPhone).fill(data.phone);
}

test.describe('Web Tables Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'webtables');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display the data table with correct headers', async ({ page }) => {
    const headers = ['First Name', 'Last Name', 'User Name', 'Customer', 'Role', 'E-mail', 'Cell Phone', 'Actions'];
    for (const header of headers) {
      await expect(page.locator(`${SEL.table} th`).filter({ hasText: header })).toBeVisible();
    }
  });

  test('should render the initial set of users', async ({ page }) => {
    const rows = page.locator(`${SEL.tableBody} tr`);
    await expect(rows).toHaveCount(WEBTABLES.initialRowCount);
  });

  test('should display search input and Add User button', async ({ page }) => {
    await expect(page.locator(SEL.searchInput)).toBeVisible();
    await expect(page.locator(SEL.addUserBtn)).toBeVisible();
  });

  test('should filter table rows when searching', async ({ page }) => {
    // Search for "John" — should match John Smith
    await page.locator(SEL.searchInput).fill('John');
    const rows = page.locator(`${SEL.tableBody} tr`);
    // At least one row should contain "John"
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    // Verify the visible row contains "John"
    await expect(rows.first()).toContainText('John');
  });

  test('should add a new user via the modal form', async ({ page }) => {
    // Open Add User modal
    await page.locator(SEL.addUserBtn).click();
    await expect(page.locator(SEL.modal)).toHaveClass(/visible/);
    await expect(page.locator(SEL.modalTitle)).toHaveText('Add User');

    // Fill and save
    await fillUserModal(page, NEW_USER);
    await page.locator(SEL.modalSaveBtn).click();

    // Modal should close
    await expect(page.locator(SEL.modal)).not.toHaveClass(/visible/);

    // Table should have one more row
    const rows = page.locator(`${SEL.tableBody} tr`);
    await expect(rows).toHaveCount(WEBTABLES.initialRowCount + 1);

    // New user should be visible in the table
    const lastRow = rows.last();
    await expect(lastRow).toContainText(NEW_USER.firstName);
    await expect(lastRow).toContainText(NEW_USER.email);
  });

  test('should edit an existing user', async ({ page }) => {
    // Click Edit on the first row
    await page.locator('[data-edit="0"]').click();
    await expect(page.locator(SEL.modal)).toHaveClass(/visible/);
    await expect(page.locator(SEL.modalTitle)).toHaveText('Edit User');

    // Change the first name
    const updatedFirstName = 'UpdatedJohn';
    await page.locator(SEL.modalFirstName).clear();
    await page.locator(SEL.modalFirstName).fill(updatedFirstName);
    await page.locator(SEL.modalSaveBtn).click();

    // Modal should close and the first row should reflect the update
    await expect(page.locator(SEL.modal)).not.toHaveClass(/visible/);
    const firstRow = page.locator(`${SEL.tableBody} tr`).first();
    await expect(firstRow).toContainText(updatedFirstName);
  });

  test('should delete a user after confirmation', async ({ page }) => {
    const initialCount = WEBTABLES.initialRowCount;
    // Set up dialog handler to accept the confirmation
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.locator('[data-delete="0"]').click();

    // Table should have one fewer row
    const rows = page.locator(`${SEL.tableBody} tr`);
    await expect(rows).toHaveCount(initialCount - 1);
  });

  test('should cancel modal without adding a user', async ({ page }) => {
    await page.locator(SEL.addUserBtn).click();
    await expect(page.locator(SEL.modal)).toHaveClass(/visible/);

    await page.locator(SEL.modalCancelBtn).click();
    await expect(page.locator(SEL.modal)).not.toHaveClass(/visible/);

    // Row count unchanged
    await expect(page.locator(`${SEL.tableBody} tr`)).toHaveCount(WEBTABLES.initialRowCount);
  });

  // ─── Negative Tests ─────────────────────────────────────────

  test('should show no rows for a search that matches nothing', async ({ page }) => {
    await page.locator(SEL.searchInput).fill('zzzznonexistent');
    const rows = page.locator(`${SEL.tableBody} tr`);
    await expect(rows).toHaveCount(0);
  });

  test('should not add user if required fields are empty', async ({ page }) => {
    await page.locator(SEL.addUserBtn).click();
    // Try to save without filling anything
    await page.locator(SEL.modalSaveBtn).click();
    // Modal should remain open because HTML5 validation prevents submission
    await expect(page.locator(SEL.modal)).toHaveClass(/visible/);
    // No new row should be added
    await expect(page.locator(`${SEL.tableBody} tr`)).toHaveCount(WEBTABLES.initialRowCount);
  });

  test('should not delete user when confirm dialog is dismissed', async ({ page }) => {
    // Set up dialog handler to dismiss the confirmation
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    await page.locator('[data-delete="0"]').click();

    // Row count should remain unchanged
    await expect(page.locator(`${SEL.tableBody} tr`)).toHaveCount(WEBTABLES.initialRowCount);
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should restore full table when search is cleared', async ({ page }) => {
    await page.locator(SEL.searchInput).fill('John');
    // Clear the search
    await page.locator(SEL.searchInput).fill('');
    await expect(page.locator(`${SEL.tableBody} tr`)).toHaveCount(WEBTABLES.initialRowCount);
  });

  test('should perform case-insensitive search', async ({ page }) => {
    await page.locator(SEL.searchInput).fill('john');
    const rows = page.locator(`${SEL.tableBody} tr`);
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should search by email column', async ({ page }) => {
    await page.locator(SEL.searchInput).fill('sarah.j@mail.com');
    const rows = page.locator(`${SEL.tableBody} tr`);
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Sarah');
  });

  test('should search by role column', async ({ page }) => {
    await page.locator(SEL.searchInput).fill('Admin');
    const rows = page.locator(`${SEL.tableBody} tr`);
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should close modal by clicking outside', async ({ page }) => {
    await page.locator(SEL.addUserBtn).click();
    await expect(page.locator(SEL.modal)).toHaveClass(/visible/);

    // Click on the overlay (outside the modal box)
    await page.locator(SEL.modal).click({ position: { x: 5, y: 5 } });
    await expect(page.locator(SEL.modal)).not.toHaveClass(/visible/);
  });
});
