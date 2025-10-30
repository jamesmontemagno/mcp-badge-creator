# SPA Routing Fix for GitHub Pages

## Problem
Single Page Applications (SPAs) using client-side routing (like React Router's `BrowserRouter`) face a common issue when deployed to GitHub Pages: direct navigation to subpages results in 404 errors.

## Why This Happens
- SPAs have only one `index.html` file at the root
- All routing is handled client-side by JavaScript
- When you visit `/mcp` directly, GitHub Pages looks for `/mcp/index.html`
- Since this file doesn't exist, GitHub Pages returns a 404 error

## Solution
We implement the standard GitHub Pages SPA workaround using a two-step redirect:

### Step 1: 404.html Redirect
- Located in `public/404.html`
- When GitHub Pages returns 404, it serves this file
- The script captures the requested path (e.g., `/mcp`)
- Converts it to a query parameter: `/?/mcp`
- Redirects to the root with the path preserved

### Step 2: index.html Path Restoration
- Located in `index.html` (added script in `<head>`)
- When the root loads, checks for the special query parameter format
- Restores the original URL using `history.replaceState()`
- React Router then handles the routing normally

## How It Works (Example)
1. User visits `https://mcpbadge.dev/mcp`
2. GitHub Pages: "No file at /mcp/index.html" → Returns 404.html
3. 404.html script: Redirect to `/?/mcp`
4. Browser loads index.html with query parameter
5. index.html script: Restore URL to `/mcp` 
6. React Router: Route to MCP component

## Files Modified
- `public/404.html` - New file with redirect script
- `index.html` - Added path restoration script
- `src/App.tsx` - Fixed useLocation hook import (unrelated lint warning)

## Testing
Direct navigation to any route should now work:
- `/` - Home page
- `/mcp` - MCP Badges page
- `/extensions` - VS Code Extensions page
- `/settings` - Settings page

## References
This solution is based on the [spa-github-pages](https://github.com/rafgraph/spa-github-pages) approach, which is widely used by SPAs deployed to GitHub Pages.
