import { test, expect } from '@playwright/test';
import { INTERACTIONS } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';

/**
 * Interactions Page Tests — Drag & Drop
 *
 * Tests dragging items between source and target zones,
 * verifying item counts and output text updates.
 */

const DND = INTERACTIONS.dragDrop;

test.describe('Interactions — Drag & Drop', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'interactions');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display source zone with 4 draggable items', async ({ page }) => {
    const sourceItems = page.locator(`${DND.selectors.source} .dnd-item`);
    await expect(sourceItems).toHaveCount(4);
  });

  test('should display empty target (dropped) zone', async ({ page }) => {
    const targetItems = page.locator(`${DND.selectors.target} .dnd-item`);
    await expect(targetItems).toHaveCount(0);
  });

  test('should show default drag output text', async ({ page }) => {
    await expect(page.locator(DND.selectors.output)).toHaveText('Drag items to the drop zone.');
  });

  test('should display item names in source zone', async ({ page }) => {
    for (const item of DND.items) {
      await expect(page.locator(`${DND.selectors.source}`)).toContainText(item);
    }
  });

  test('should drag an item from source to target zone', async ({ page }) => {
    // Drag Apple (data-id="1") from source to target
    const sourceItem = page.locator(DND.selectors.item(1));
    const target = page.locator(DND.selectors.target);

    await sourceItem.dragTo(target);

    // Source should have 3 items, target should have 1
    await expect(page.locator(`${DND.selectors.source} .dnd-item`)).toHaveCount(3);
    await expect(page.locator(`${DND.selectors.target} .dnd-item`)).toHaveCount(1);

    // Output should be updated
    await expect(page.locator(DND.selectors.output)).toContainText('Moved');
  });

  test('should drag multiple items to target zone', async ({ page }) => {
    const target = page.locator(DND.selectors.target);

    // Drag Apple and Banana
    await page.locator(DND.selectors.item(1)).dragTo(target);
    await page.locator(DND.selectors.item(2)).dragTo(target);

    await expect(page.locator(`${DND.selectors.source} .dnd-item`)).toHaveCount(2);
    await expect(page.locator(`${DND.selectors.target} .dnd-item`)).toHaveCount(2);
  });

  test('should drag all items to target zone', async ({ page }) => {
    const target = page.locator(DND.selectors.target);

    for (let i = 1; i <= 4; i++) {
      await page.locator(DND.selectors.item(i)).dragTo(target);
    }

    await expect(page.locator(`${DND.selectors.source} .dnd-item`)).toHaveCount(0);
    await expect(page.locator(`${DND.selectors.target} .dnd-item`)).toHaveCount(4);
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should drag item back from target to source', async ({ page }) => {
    const target = page.locator(DND.selectors.target);
    const source = page.locator(DND.selectors.source);

    // Move to target first
    await page.locator(DND.selectors.item(1)).dragTo(target);
    await expect(page.locator(`${DND.selectors.target} .dnd-item`)).toHaveCount(1);

    // Move back to source
    await page.locator(DND.selectors.item(1)).dragTo(source);
    await expect(page.locator(`${DND.selectors.source} .dnd-item`)).toHaveCount(4);
    await expect(page.locator(`${DND.selectors.target} .dnd-item`)).toHaveCount(0);
  });

  test('should update output with correct count after drag', async ({ page }) => {
    const target = page.locator(DND.selectors.target);

    await page.locator(DND.selectors.item(3)).dragTo(target);

    // Output should mention Available: 3, Dropped: 1
    await expect(page.locator(DND.selectors.output)).toContainText('Available: 3');
    await expect(page.locator(DND.selectors.output)).toContainText('Dropped: 1');
  });

  test('each draggable item should have draggable attribute', async ({ page }) => {
    for (let i = 1; i <= 4; i++) {
      await expect(page.locator(DND.selectors.item(i))).toHaveAttribute('draggable', 'true');
    }
  });
});
