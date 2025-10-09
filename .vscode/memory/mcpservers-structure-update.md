# Full mcpServers Structure Update - Oct 9, 2025

## Issue
The JSON configuration and CLI commands were not showing the complete structure with the server name as a key in the `mcpServers` object.

## Solution
Updated the output to show the full `mcp.json` file structure that VS Code expects.

## Changes Made

### 1. Added `generateFullConfig()` Function
```typescript
const generateFullConfig = () => {
  const config = generateConfig();
  return {
    mcpServers: {
      [serverName]: config
    }
  };
}
```

This wraps the configuration in the proper `mcpServers` object with the server name as a dynamic key.

### 2. Updated JSON Configuration Display
**Before:**
```json
{
  "command": "npx",
  "args": ["-y", "css-mcp"],
  "env": {}
}
```

**After:**
```json
{
  "mcpServers": {
    "css": {
      "command": "npx",
      "args": ["-y", "css-mcp"],
      "env": {}
    }
  }
}
```

**Changes:**
- Changed section title from "JSON Configuration" to "mcp.json Configuration"
- Added helper text: "Add this to your workspace or user mcp.json file"
- Now shows complete structure that can be directly pasted into mcp.json

### 3. Updated CLI Commands
**Before:**
```bash
code --add-mcp '{\"command\":\"npx\",\"args\":[\"-y\",\"css-mcp\"],\"env\":{}}'
```

**After:**
```bash
code --add-mcp '{\"mcpServers\":{\"css\":{\"command\":\"npx\",\"args\":[\"-y\",\"css-mcp\"],\"env\":{}}}}'
```

**Changes:**
- CLI commands now include the full `mcpServers` wrapper
- Server name is included as the key
- Complete structure matches what VS Code expects

### 4. Updated Documentation

#### CLI-COMMANDS.md (Recreated in root)
- Updated all examples to show full mcpServers structure
- Added section explaining the configuration structure
- Clarified HTTP vs STDIO server formats
- Added PowerShell here-string example with full structure

## Examples

### NPX Package
**mcp.json Configuration:**
```json
{
  "mcpServers": {
    "css": {
      "command": "npx",
      "args": ["-y", "css-mcp"],
      "env": {}
    }
  }
}
```

**CLI Command:**
```bash
code --add-mcp '{\"mcpServers\":{\"css\":{\"command\":\"npx\",\"args\":[\"-y\",\"css-mcp\"],\"env\":{}}}}'
```

### HTTP Server
**mcp.json Configuration:**
```json
{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "type": "http"
    }
  }
}
```

**CLI Command:**
```bash
code --add-mcp '{\"mcpServers\":{\"github\":{\"url\":\"https://api.githubcopilot.com/mcp/\",\"type\":\"http\"}}}'
```

### DNX Package
**mcp.json Configuration:**
```json
{
  "mcpServers": {
    "sample": {
      "command": "dnx",
      "args": ["Contoso.SampleMcpServer@0.0.1-beta", "--yes"],
      "env": {}
    }
  }
}
```

**CLI Command:**
```bash
code --add-mcp '{\"mcpServers\":{\"sample\":{\"command\":\"dnx\",\"args\":[\"Contoso.SampleMcpServer@0.0.1-beta\",\"--yes\"],\"env\":{}}}}'
```

## Benefits

1. **Complete Structure**: Users see exactly what goes in their mcp.json file
2. **Copy-Paste Ready**: Can copy the JSON output directly into mcp.json
3. **Server Name Included**: No confusion about where the server name goes
4. **CLI Commands Work**: Commands include everything needed for installation
5. **Matches VS Code Format**: Structure exactly matches official documentation

## Testing

- ✅ ESLint passing
- ✅ TypeScript compilation successful
- ✅ Build successful
- ✅ All 6 configuration types generate correct output
- ✅ CLI commands include full mcpServers wrapper

## User Impact

Users can now:
1. Copy the JSON configuration and paste directly into `mcp.json`
2. Run CLI commands that include the server name
3. See the complete structure without manual editing
4. Understand how the configuration fits into the mcp.json file
