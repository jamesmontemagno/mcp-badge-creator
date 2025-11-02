import { test, expect } from '@playwright/test';

test.describe('Extensions Page - URI Schema', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the extensions page
    await page.goto('http://localhost:5173/extensions');
    
    // Switch to manual entry mode since tests use manual input
    const manualEntryBtn = page.locator('button', { hasText: 'Manual Entry' });
    await manualEntryBtn.click();
  });

  test('should generate badges with vscode URI scheme for stable', async ({ page }) => {
    // Fill in an extension ID
    const input = page.locator('#extensionInput');
    await input.fill('ms-python.python');

    // Click generate button
    const generateBtn = page.locator('button[type="submit"]');
    await generateBtn.click();

    // Wait for output to appear
    await page.waitForSelector('.extensions-output', { timeout: 5000 });

    // Check that the VS Code markdown contains vscode:extension/ URI
    const vsCodeMarkdown = page.locator('.markdown-card').first().locator('pre code');
    const vsCodeMarkdownText = await vsCodeMarkdown.textContent();
    expect(vsCodeMarkdownText).toContain('vscode:extension/ms-python.python');
    expect(vsCodeMarkdownText).not.toContain('marketplace.visualstudio.com');

    // Check that the preview link uses the correct URI
    const stableLink = page.locator('.extensions-preview-row a').first();
    const stableHref = await stableLink.getAttribute('href');
    expect(stableHref).toBe('vscode:extension/ms-python.python');
  });

  test('should generate badges with vscode-insiders URI scheme for insiders', async ({ page }) => {
    // Fill in an extension ID
    const input = page.locator('#extensionInput');
    await input.fill('ms-vscode.cpptools');

    // Click generate button
    const generateBtn = page.locator('button[type="submit"]');
    await generateBtn.click();

    // Wait for output to appear
    await page.waitForSelector('.extensions-output', { timeout: 5000 });

    // Check that the VS Code Insiders markdown contains vscode-insiders:extension/ URI
    const insidersMarkdown = page.locator('.markdown-card').nth(1).locator('pre code');
    const insidersMarkdownText = await insidersMarkdown.textContent();
    expect(insidersMarkdownText).toContain('vscode-insiders:extension/ms-vscode.cpptools');
    expect(insidersMarkdownText).not.toContain('marketplace.visualstudio.com');

    // Check that the preview link uses the correct URI
    const insidersLink = page.locator('.extensions-preview-row a').nth(1);
    const insidersHref = await insidersLink.getAttribute('href');
    expect(insidersHref).toBe('vscode-insiders:extension/ms-vscode.cpptools');
  });

  test('should generate combined markdown with both URI schemes', async ({ page }) => {
    // Fill in an extension ID
    const input = page.locator('#extensionInput');
    await input.fill('github.copilot');

    // Click generate button
    const generateBtn = page.locator('button[type="submit"]');
    await generateBtn.click();

    // Wait for output to appear
    await page.waitForSelector('.extensions-output', { timeout: 5000 });

    // Check that the combined markdown contains both URI schemes
    const combinedMarkdown = page.locator('.combined-markdown pre code');
    const combinedMarkdownText = await combinedMarkdown.textContent();
    expect(combinedMarkdownText).toContain('vscode:extension/github.copilot');
    expect(combinedMarkdownText).toContain('vscode-insiders:extension/github.copilot');
    expect(combinedMarkdownText).not.toContain('marketplace.visualstudio.com');
  });
});
