# CLI Commands Feature Update

## Date: October 9, 2025

## Changes Made

### 1. Added CLI Command Generation
- Created `generateCliCommand(isInsiders: boolean)` function in `App.tsx`
- Generates cross-platform compatible commands using single quotes with backslash-escaped JSON
- Format: `code --add-mcp '{\"name\":\"...\",\"command\":\"...\",\"args\":[...],\"env\":{}}'`
- Works in PowerShell, Bash, and Zsh

### 2. Added Copy Buttons
- Added three new state variables:
  - `copiedJson` - for JSON config copy button
  - `copiedCli` - for VS Code CLI command copy button
  - `copiedCliInsiders` - for VS Code Insiders CLI command copy button
- Created `copyToClipboardWithState()` helper function for reusable copy logic
- Each section now has its own copy button with visual feedback (✓ Copied!)

### 3. Updated UI
- JSON Configuration section now has a header with copy button
- VS Code CLI Command section (conditionally shown if VS Code is selected)
- VS Code Insiders CLI Command section (conditionally shown if VS Code Insiders is selected)
- Added helper text: "Works in PowerShell, Bash, and Zsh"
- All sections use consistent `.output-header` and `.copy-btn` styling

### 4. Fixed ESLint Error
- Added curly braces around the `uvx` case block to satisfy `no-case-declarations` rule
- Changed from `case 'uvx':` to `case 'uvx': { ... }`

### 5. Documentation
- Created `CLI-COMMANDS.md` with comprehensive documentation
- Updated `README.md` to mention CLI command feature
- Added examples for all configuration types
- Documented cross-platform compatibility

## Testing Results
- ✅ Build successful
- ✅ ESLint passing
- ✅ TypeScript compilation successful
- ✅ Dev server running
- ✅ No runtime errors

## Example Output

For an NPX package "css-mcp":

**JSON Configuration:**
```json
{
  "name": "css",
  "command": "npx",
  "args": ["-y", "css-mcp"],
  "env": {}
}
```

**VS Code CLI Command:**
```bash
code --add-mcp '{\"name\":\"css\",\"command\":\"npx\",\"args\":[\"-y\",\"css-mcp\"],\"env\":{}}'
```

**VS Code Insiders CLI Command:**
```bash
code-insiders --add-mcp '{\"name\":\"css\",\"command\":\"npx\",\"args\":[\"-y\",\"css-mcp\"],\"env\":{}}'
```

## User Benefits
1. **No manual JSON editing** - Copy and paste commands directly
2. **Cross-platform** - Same command works everywhere
3. **Faster setup** - One command vs editing settings.json
4. **Team sharing** - Easy to share exact installation commands
5. **No typos** - Guaranteed correct JSON formatting

## References
- [VS Code MCP Documentation](https://code.visualstudio.com/docs/copilot/customization/mcp-servers#_add-an-mcp-server)
- User reported issue: JSON formatting errors in PowerShell
- Solution: Use single quotes with backslash escaping for universal compatibility
