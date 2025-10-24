import { test, expect } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // Navigate to the base page
    await page.goto('http://localhost:5173/');

    // Verify the page is visible
    await expect(page).toHaveTitle(/MCP Badge Creator/i);

    // Verify the app container is visible
    const appElement = page.locator('[id="root"]');
    await expect(appElement).toBeVisible();
  });
});
