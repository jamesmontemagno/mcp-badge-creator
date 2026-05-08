import { test, expect } from '@playwright/test';

test.describe('MCP GitHub Copilot CLI README option', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mcp');
    await page.waitForLoadState('networkidle');
  });

  test('shows GitHub Copilot CLI by default and renders its README section', async ({ page }) => {
    const copilotCliCard = page.locator('.ide-card', { hasText: 'GitHub Copilot CLI' }).first();
    await expect(copilotCliCard).toBeVisible();
    await expect(copilotCliCard).toHaveClass(/active/);

    await page.fill('#serverName', 'my-copilot-cli-server');
    await page.click('button:has-text("Getting Started README")');

    const readmeOutput = page.locator('.readme-preview pre code');
    await expect(readmeOutput).toContainText('<summary>GitHub Copilot CLI</summary>');
    await expect(readmeOutput).toContainText('~/.copilot/mcp-config.json');
    await expect(readmeOutput).toContainText('/mcp add');
  });

  test('omits GitHub Copilot CLI section when toggled off', async ({ page }) => {
    const copilotCliCard = page.locator('.ide-card', { hasText: 'GitHub Copilot CLI' }).first();
    await copilotCliCard.click();
    await expect(copilotCliCard).not.toHaveClass(/active/);

    await page.fill('#serverName', 'my-copilot-cli-server');
    await page.click('button:has-text("Getting Started README")');

    const readmeOutput = page.locator('.readme-preview pre code');
    await expect(readmeOutput).not.toContainText('<summary>GitHub Copilot CLI</summary>');
  });
});
