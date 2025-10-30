import { test, expect } from '@playwright/test';

test.describe('Direct URL Navigation', () => {
  test('should navigate directly to /mcp page', async ({ page }) => {
    // Navigate directly to the MCP page URL
    await page.goto('/mcp');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the URL is correct
    expect(page.url()).toContain('/mcp');
    
    // Verify the page content is loaded (check for MCP specific content)
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    
    // Check that the MCP nav link is active
    const mcpNavLink = page.locator('a.nav-link.active', { hasText: 'MCP Badges' });
    await expect(mcpNavLink).toBeVisible();
  });

  test('should navigate directly to /extensions page', async ({ page }) => {
    // Navigate directly to the Extensions page URL
    await page.goto('/extensions');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the URL is correct
    expect(page.url()).toContain('/extensions');
    
    // Verify the page content is loaded
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    
    // Check that the Extensions nav link is active
    const extensionsNavLink = page.locator('a.nav-link.active', { hasText: 'VS Code Extensions' });
    await expect(extensionsNavLink).toBeVisible();
  });

  test('should navigate directly to /settings page', async ({ page }) => {
    // Navigate directly to the Settings page URL
    await page.goto('/settings');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the URL is correct
    expect(page.url()).toContain('/settings');
    
    // Verify the page content is loaded
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    
    // Check that the Settings nav link is active
    const settingsNavLink = page.locator('a.nav-link.settings-link.active');
    await expect(settingsNavLink).toBeVisible();
  });

  test('should handle deep linking with query parameters', async ({ page }) => {
    // Navigate to a page with query parameters
    await page.goto('/mcp?test=value');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the URL preserves query parameters
    expect(page.url()).toContain('/mcp');
    expect(page.url()).toContain('test=value');
    
    // Verify the page loaded correctly
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should navigate from home to subpage and back', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to MCP page
    await page.click('a.nav-link:has-text("MCP Badges")');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the MCP page
    expect(page.url()).toContain('/mcp');
    
    // Navigate back to home
    await page.click('a.nav-link:has-text("Home")');
    await page.waitForLoadState('networkidle');
    
    // Verify we're back at home
    expect(page.url()).not.toContain('/mcp');
    expect(page.url()).not.toContain('/extensions');
  });
});
