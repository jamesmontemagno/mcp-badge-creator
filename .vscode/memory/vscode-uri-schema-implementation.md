# VS Code URI Schema Implementation

## Date: 2025-10-30

## Summary
Successfully implemented proper VS Code URI schema for extension badges on the Extensions page, replacing marketplace URLs with native VS Code URI handlers.

## Problem Statement
The Extensions page was using marketplace URLs (`https://marketplace.visualstudio.com/items?itemName=...`) for badge links. The requirement was to use VS Code's native URI schema to directly launch and open VS Code instead of just navigating to the marketplace.

## Research Findings

### VS Code URI Schema Documentation
Based on official VS Code documentation and research:

1. **Extension Installation URI Format:**
   - VS Code stable: `vscode:extension/{publisher.extension-name}`
   - VS Code Insiders: `vscode-insiders:extension/{publisher.extension-name}`

2. **Benefits:**
   - Clicking the link directly opens VS Code/Insiders
   - Prompts to install the extension immediately
   - Better user experience than navigating to marketplace

3. **Documentation Sources:**
   - VS Code API documentation on URI handlers
   - Stack Overflow discussions on vscode:// URL scheme
   - Official VS Code extension samples

## Implementation Details

### Files Modified

#### 1. `src/utils/extensionBadge.ts`
**Changes:**
- Removed `MARKETPLACE_URL` constant
- Updated `badgeMarkdown` function signature to accept `uriScheme` parameter
- Changed from `marketplaceUrl` to `extensionUri` property
- Generate URIs in format: `{uriScheme}:extension/{extensionId}`

**Key Code:**
```typescript
const badgeMarkdown = (label: string, color: string, extensionId: string, uriScheme: string) => {
  const encodedLabel = encodeURIComponent(label)
  const badgeUrl = `https://img.shields.io/badge/${encodedLabel}-Install-${color}?logo=visualstudiocode&logoColor=white`
  const extensionUri = `${uriScheme}:extension/${extensionId}`
  return {
    markdown: `[![Install in ${label}](${badgeUrl})](${extensionUri})`,
    badgeUrl,
    extensionUri,
  }
}

export const generateExtensionBadges = (extensionId: string) => {
  const stable = badgeMarkdown('VS Code', '0098FF', extensionId, 'vscode')
  const insiders = badgeMarkdown('VS Code Insiders', '24bfa5', extensionId, 'vscode-insiders')
  // ...
}
```

#### 2. `src/pages/Extensions.tsx`
**Changes:**
- Updated preview links to use `badgeData.stable.extensionUri` instead of `marketplaceUrl`
- Updated preview links to use `badgeData.insiders.extensionUri` instead of `marketplaceUrl`

**Key Code:**
```tsx
<a href={badgeData.stable.extensionUri} target="_blank" rel="noopener noreferrer">
  <img src={badgeData.stable.badgeUrl} alt="Install in VS Code" />
</a>
<a href={badgeData.insiders.extensionUri} target="_blank" rel="noopener noreferrer">
  <img src={badgeData.insiders.badgeUrl} alt="Install in VS Code Insiders" />
</a>
```

### Testing

#### Manual Testing
- Started dev server on `http://localhost:5173`
- Navigated to Extensions page
- Generated badges for `ms-python.python` extension
- Verified output contains:
  - VS Code markdown: `vscode:extension/ms-python.python`
  - VS Code Insiders markdown: `vscode-insiders:extension/ms-python.python`
  - Preview links use correct URI schema
  - Combined markdown includes both schemes

#### Test Suite
Created `tests/extensions.spec.ts` with three comprehensive tests:
1. **VS Code stable URI schema test**: Verifies markdown and preview links use `vscode:extension/`
2. **VS Code Insiders URI schema test**: Verifies markdown and preview links use `vscode-insiders:extension/`
3. **Combined markdown test**: Verifies both URI schemes appear in combined output

**Note:** Tests are written but Playwright browser installation had issues during execution. Manual testing confirmed functionality works correctly.

### Build & Quality Checks

#### Lint Results
✅ Passed - Only pre-existing warning in App.tsx (unrelated to changes)

#### Build Results
✅ Passed - TypeScript compilation and Vite build successful

#### Security Scan (CodeQL)
✅ Passed - No security vulnerabilities detected

#### Code Review
8 suggestions for test improvements (all about test robustness, no actual bugs):
- Use environment variables for localhost URL
- Extract timeout constants
- Use more specific selectors instead of positional selectors
- Add data-testid attributes for better test stability

These are good suggestions for future improvements but don't affect the core functionality.

## Result Examples

### Generated Markdown
**VS Code Stable:**
```markdown
[![Install in VS Code](https://img.shields.io/badge/VS%20Code-Install-0098FF?logo=visualstudiocode&logoColor=white)](vscode:extension/ms-python.python)
```

**VS Code Insiders:**
```markdown
[![Install in VS Code Insiders](https://img.shields.io/badge/VS%20Code%20Insiders-Install-24bfa5?logo=visualstudiocode&logoColor=white)](vscode-insiders:extension/ms-python.python)
```

## Migration Notes
- **Breaking Change:** None - this is a user-facing improvement
- **Backward Compatibility:** Users with existing badges will need to regenerate them to get the new URI schema
- **Documentation:** No documentation updates needed as the UI clearly shows the generated markdown

## Future Considerations
1. Could add a toggle to support both marketplace URLs and URI schemas for users who prefer different behaviors
2. Consider adding tooltips explaining what clicking the badge will do
3. Test with more extension types and edge cases

## References
- [VS Code URI Handler Documentation](https://code.visualstudio.com/api/references/vscode-api#window.registerUriHandler)
- [VS Code Command Line - Opening with URIs](https://code.visualstudio.com/docs/editor/command-line#_opening-files-and-folders-with-uri-schemes)
- [Stack Overflow: vscode:// URL scheme options](https://stackoverflow.com/questions/67491505/what-options-are-available-to-use-with-the-vscode-url-scheme)
