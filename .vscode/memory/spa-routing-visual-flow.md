# SPA Routing Fix - Visual Flow

## Before Fix (Problem)
```
User visits: https://mcpbadge.dev/mcp
         ↓
GitHub Pages: "Looking for /mcp/index.html"
         ↓
GitHub Pages: "File not found!"
         ↓
Result: 404 Error Page ❌
```

## After Fix (Solution)
```
User visits: https://mcpbadge.dev/mcp
         ↓
GitHub Pages: "Looking for /mcp/index.html"
         ↓
GitHub Pages: "File not found! Serving 404.html"
         ↓
404.html script executes:
  - Captures path: "/mcp"
  - Encodes as query param: "?/mcp"
  - Redirects to: https://mcpbadge.dev/?/mcp
         ↓
Browser loads: https://mcpbadge.dev/?/mcp
         ↓
GitHub Pages: "Serving /index.html"
         ↓
index.html script executes BEFORE React loads:
  - Detects query param: "?/mcp"
  - Decodes back to: "/mcp"
  - Uses history.replaceState to change URL
  - URL now shows: https://mcpbadge.dev/mcp
         ↓
React loads and sees URL: /mcp
         ↓
React Router routes to: MCP component
         ↓
Result: MCP page displays correctly ✅
```

## Key Technical Details

### 404.html Script
```javascript
// Converts: /mcp → /?/mcp
var segmentCount = 0; // Set to 0 for root domain
l.replace(
  l.protocol + '//' + l.hostname + 
  '/?/' + l.pathname.slice(1) + 
  l.hash
);
```

### index.html Script
```javascript
// Converts: /?/mcp → /mcp
if (l.search[1] === '/' ) {
  var decoded = l.search.slice(1);
  window.history.replaceState(null, null,
    l.pathname.slice(0, -1) + decoded + l.hash
  );
}
```

## Why This Works

1. **GitHub Pages behavior**: Always serves 404.html when file not found
2. **Query parameters**: Don't trigger file lookups, always route to root
3. **history.replaceState**: Changes URL without triggering navigation
4. **Timing**: Redirect happens before React/Router initialize

## Works With
- All client-side routes: `/mcp`, `/extensions`, `/settings`
- Hash fragments: `/mcp#section`
- Query parameters: `/mcp?param=value`
- Browser back/forward buttons
- Bookmarks and direct links

## Doesn't Break
- Home page (`/`)
- Existing navigation
- Browser history
- SEO (search engines see correct URLs)
