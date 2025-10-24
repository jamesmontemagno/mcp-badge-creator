import { test, expect } from '@playwright/test';

test.describe('MCP Badge Creator', () => {
  // Run seed test before each test to set up the page
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173/');
  });

  test('should load the page and display the main content', async ({ page }) => {
    // Check that the page is visible
    await expect(page).toHaveTitle(/MCP Badge Creator/i);

    // Check that main heading is visible
    const heading = page.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible();

    // Check that the app container is visible
    const appElement = page.locator('[id="root"]');
    await expect(appElement).toBeVisible();
  });
});
