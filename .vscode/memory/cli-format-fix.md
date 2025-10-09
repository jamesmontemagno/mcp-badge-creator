# CLI Command Format Fix - Oct 9, 2025

## Issue
The CLI command was using the mcpServers wrapper format, but the `--add-mcp` flag requires a different format with the `name` property inside the JSON.

## VS Code Documentation

According to the official VS Code documentation:

> To add an MCP server to your user profile, use the `--add-mcp` VS Code command line option, and provide the JSON server configuration in the form `{\"name\":\"server-name\",\"command\":...}`.

**Example from VS Code:**
```bash
code --add-mcp "{\"name\":\"my-server\",\"command\": \"uvx\",\"args\": [\"mcp-server-fetch\"]}"
```

## Solution

Updated the `generateCliCommand()` function to include the `name` property inside the configuration JSON.

### Code Change

**Before:**
```typescript
const generateCliCommand = (isInsiders: boolean = false): string => {
  const fullConfig = generateFullConfig(); // Returns {mcpServers: {...}}
  const jsonString = JSON.stringify(fullConfig);
  const escapedJson = jsonString.replace(/"/g, '\\"');
  const command = isInsiders ? 'code-insiders' : 'code';
  return `${command} --add-mcp '${escapedJson}'`;
}
```

**After:**
```typescript
const generateCliCommand = (isInsiders: boolean = false): string => {
  const config = generateConfig();
  // CLI command requires name property inside the config JSON
  const cliConfig = { name: serverName, ...config };
  const jsonString = JSON.stringify(cliConfig);
  const escapedJson = jsonString.replace(/"/g, '\\"');
  const command = isInsiders ? 'code-insiders' : 'code';
  return `${command} --add-mcp '${escapedJson}'`;
}
```

## Format Differences

### CLI Command Format
The `--add-mcp` command requires the name **inside** the JSON:

```json
{
  "name": "css",
  "command": "npx",
  "args": ["-y", "css-mcp"],
  "env": {}
}
```

**CLI Command:**
```bash
code --add-mcp '{\"name\":\"css\",\"command\":\"npx\",\"args\":[\"-y\",\"css-mcp\"],\"env\":{}}'
```

### mcp.json File Format
The mcp.json file uses the name as a **key** in the mcpServers object:

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

## Examples

### NPX Package
**CLI Command:**
```bash
code --add-mcp '{\"name\":\"css\",\"command\":\"npx\",\"args\":[\"-y\",\"css-mcp\"],\"env\":{}}'
```

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

### HTTP Server
**CLI Command:**
```bash
code --add-mcp '{\"name\":\"github\",\"url\":\"https://api.githubcopilot.com/mcp/\",\"type\":\"http\"}'
```

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

### DNX Package
**CLI Command:**
```bash
code --add-mcp '{\"name\":\"sample\",\"command\":\"dnx\",\"args\":[\"Contoso.SampleMcpServer@0.0.1-beta\",\"--yes\"],\"env\":{}}'
```

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

## Documentation Updated

### CLI-COMMANDS.md
- Created comprehensive guide in project root
- Explained CLI format vs mcp.json format difference
- Added examples for all 6 configuration types
- Included official VS Code documentation quote
- Added troubleshooting section

### Key Points
1. **CLI commands** have `name` inside: `{"name": "...", "command": "...", ...}`
2. **mcp.json files** have name as key: `{"mcpServers": {"name": {...}}}`
3. Both formats are correct for their respective use cases
4. The badge creator now generates both formats correctly

## Testing

- ✅ ESLint passing
- ✅ TypeScript compilation successful
- ✅ Build successful
- ✅ CLI commands now match VS Code specification
- ✅ mcp.json format remains correct for file usage

## User Impact

Users can now:
1. ✅ Copy CLI commands that work with `code --add-mcp`
2. ✅ Copy mcp.json configuration for manual file editing
3. ✅ Understand the difference between the two formats
4. ✅ Use commands that follow official VS Code documentation
