import { test, expect } from '@playwright/test';
import { UPLOAD } from './helpers/constants';
import { navigateToSite, navigateToSection } from './helpers/actions';
import path from 'path';
import fs from 'fs';

/**
 * Upload / Download Page Tests
 *
 * Tests file upload via the file input (click to browse), verifying
 * uploaded files appear in the list, download button presence, and
 * edge cases like uploading multiple files.
 */

const SEL = UPLOAD.selectors;

/** Create a temporary test file for upload tests */
function createTempFile(filename: string, content: string): string {
  const tmpDir = path.join(__dirname, '..', 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  const filePath = path.join(tmpDir, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
}

test.describe('Upload / Download Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSite(page);
    await navigateToSection(page, 'upload');
  });

  // ─── Positive Tests ─────────────────────────────────────────

  test('should display the upload zone', async ({ page }) => {
    await expect(page.locator(SEL.uploadZone)).toBeVisible();
    await expect(page.locator(SEL.uploadZone)).toContainText('Drag & drop files here or click to browse');
  });

  test('should display download buttons', async ({ page }) => {
    await expect(page.locator(SEL.downloadTxt)).toBeVisible();
    await expect(page.locator(SEL.downloadTxt)).toContainText('Download sample.txt');
    await expect(page.locator(SEL.downloadCsv)).toBeVisible();
    await expect(page.locator(SEL.downloadCsv)).toContainText('Download data.csv');
  });

  test('should upload a single file and display it in the file list', async ({ page }) => {
    const filePath = createTempFile('test-upload.txt', 'Hello, this is a test file.');
    // Set the file on the hidden input
    await page.locator(SEL.fileInput).setInputFiles(filePath);

    // File should appear in the list
    const fileList = page.locator(`${SEL.fileList} li`);
    await expect(fileList).toHaveCount(1);
    await expect(fileList.first()).toContainText('test-upload.txt');
  });

  test('should upload multiple files and display them all', async ({ page }) => {
    const file1 = createTempFile('file1.txt', 'Content 1');
    const file2 = createTempFile('file2.txt', 'Content 2');
    const file3 = createTempFile('file3.txt', 'Content 3');

    await page.locator(SEL.fileInput).setInputFiles([file1, file2, file3]);

    const fileList = page.locator(`${SEL.fileList} li`);
    await expect(fileList).toHaveCount(3);
    await expect(fileList.nth(0)).toContainText('file1.txt');
    await expect(fileList.nth(1)).toContainText('file2.txt');
    await expect(fileList.nth(2)).toContainText('file3.txt');
  });

  test('should show file size in the file list', async ({ page }) => {
    const content = 'A'.repeat(1024); // ~1 KB
    const filePath = createTempFile('size-test.txt', content);
    await page.locator(SEL.fileInput).setInputFiles(filePath);

    const fileList = page.locator(`${SEL.fileList} li`);
    await expect(fileList.first()).toContainText('KB');
  });

  test('should remove an uploaded file when Remove button is clicked', async ({ page }) => {
    const filePath = createTempFile('removable.txt', 'To be removed');
    await page.locator(SEL.fileInput).setInputFiles(filePath);

    await expect(page.locator(`${SEL.fileList} li`)).toHaveCount(1);

    // Click the Remove button
    await page.locator(`${SEL.fileList} li button`).click();
    await expect(page.locator(`${SEL.fileList} li`)).toHaveCount(0);
  });

  test('should trigger sample.txt download', async ({ page }) => {
    // Listen for download event
    const downloadPromise = page.waitForEvent('download');
    await page.locator(SEL.downloadTxt).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('sample.txt');
  });

  test('should trigger data.csv download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator(SEL.downloadCsv).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('data.csv');
  });

  // ─── Negative Tests ─────────────────────────────────────────

  test('should start with an empty file list', async ({ page }) => {
    const fileList = page.locator(`${SEL.fileList} li`);
    await expect(fileList).toHaveCount(0);
  });

  // ─── Edge Case Tests ───────────────────────────────────────

  test('should handle uploading a file with special characters in name', async ({ page }) => {
    const filePath = createTempFile('test file (1).txt', 'Special name content');
    await page.locator(SEL.fileInput).setInputFiles(filePath);

    const fileList = page.locator(`${SEL.fileList} li`);
    await expect(fileList).toHaveCount(1);
    await expect(fileList.first()).toContainText('test file (1).txt');
  });

  test('should allow uploading files sequentially', async ({ page }) => {
    const file1 = createTempFile('first.txt', 'First upload');
    const file2 = createTempFile('second.txt', 'Second upload');

    // Upload first file
    await page.locator(SEL.fileInput).setInputFiles(file1);
    await expect(page.locator(`${SEL.fileList} li`)).toHaveCount(1);

    // Upload second file (the input clears and re-triggers change)
    await page.locator(SEL.fileInput).setInputFiles(file2);
    // Both files should be in the list (the handler appends)
    await expect(page.locator(`${SEL.fileList} li`)).toHaveCount(2);
  });

  test('should verify download content of sample.txt', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator(SEL.downloadTxt).click();
    const download = await downloadPromise;

    // Save and read the downloaded file
    const filePath = path.join(__dirname, '..', 'tmp', 'downloaded-sample.txt');
    await download.saveAs(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('sample text file');
  });

  test('should verify download content of data.csv', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator(SEL.downloadCsv).click();
    const download = await downloadPromise;

    const filePath = path.join(__dirname, '..', 'tmp', 'downloaded-data.csv');
    await download.saveAs(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('First Name,Last Name,Email');
    expect(content).toContain('John,Smith');
  });

  // Clean up temp files after all tests
  test.afterAll(() => {
    const tmpDir = path.join(__dirname, '..', 'tmp');
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
