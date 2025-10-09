# CLI Commands for MCP Installation

The MCP Badge Creator generates CLI commands for installing MCP servers directly from your terminal!

## Features

### 🎯 What's New
- **VS Code CLI Command**: One-click copy for `code --add-mcp` command
- **VS Code Insiders CLI Command**: One-click copy for `code-insiders --add-mcp` command
- **Cross-Platform Compatibility**: Commands work in PowerShell, Bash, and Zsh
- **Copy Buttons**: Easy copy-to-clipboard for JSON config and CLI commands

### 📋 Command Format

The generated commands use single quotes with backslash-escaped JSON for maximum compatibility. 

**Important**: The `--add-mcp` CLI command requires the `name` property **inside** the JSON configuration.

```bash
code --add-mcp '{\"name\":\"server-name\",\"command\":\"npx\",\"args\":[\"-y\",\"package\"],\"env\":{}}'
```

**CLI Format**: `{"name": "...", "command": "...", "args": [...], "env": {}}`

This format works reliably across:
- ✅ PowerShell (Windows)
- ✅ Bash (Linux/macOS)
- ✅ Zsh (macOS default)
- ✅ Other common shells

### 📝 CLI Format vs mcp.json Format

The CLI command format is **different** from the mcp.json file format:

**CLI Command Format** (with `name` inside):
```json
{
  "name": "css",
  "command": "npx",
  "args": ["-y", "css-mcp"],
  "env": {}
}
```

**mcp.json File Format** (name as key):
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

## Usage

1. Fill out the MCP Badge Creator form with your server details
2. Scroll to the output section
3. Find the **VS Code CLI Command** or **VS Code Insiders CLI Command** section
4. Click the **📋 Copy** button
5. Paste and run in your terminal

## Examples

### NPX Package (Node.js)
```bash
code --add-mcp '{\"name\":\"css\",\"command\":\"npx\",\"args\":[\"-y\",\"css-mcp\"],\"env\":{}}'
```

### UVX Package (Python)
```bash
code --add-mcp '{\"name\":\"git\",\"command\":\"uvx\",\"args\":[\"mcp-server-git\"],\"env\":{}}'
```

### DNX Package (.NET)
```bash
code --add-mcp '{\"name\":\"sample\",\"command\":\"dnx\",\"args\":[\"Contoso.SampleMcpServer@0.0.1-beta\",\"--yes\"],\"env\":{}}'
```

### Docker Container
```bash
code --add-mcp '{\"name\":\"myserver\",\"command\":\"docker\",\"args\":[\"run\",\"-i\",\"--rm\",\"username/image:latest\"],\"env\":{}}'
```

### Local Binary
```bash
code --add-mcp '{\"name\":\"local-server\",\"command\":\"node\",\"args\":[\"server.js\",\"--port\",\"3000\"],\"env\":{}}'
```

### HTTP Server
```bash
code --add-mcp '{\"name\":\"github\",\"url\":\"https://api.githubcopilot.com/mcp/\",\"type\":\"http\"}'
```

## Troubleshooting

### PowerShell
If you get a JSON parsing error, ensure you're using the exact format with escaped quotes:
```powershell
code --add-mcp '{\"name\":\"...\",\"command\":\"...\",\"args\":[...],\"env\":{}}'
```

### Bash/Zsh
The same format works in Unix shells. No modifications needed:
```bash
code --add-mcp '{\"name\":\"...\",\"command\":\"...\",\"args\":[...],\"env\":{}}'
```

### Alternative: Here-String (PowerShell Only)
For PowerShell, you can also use a here-string for better readability:
```powershell
$json = @'
{"name":"css","command":"npx","args":["-y","css-mcp"],"env":{}}
'@
code --add-mcp $json
```

## Benefits Over Manual Installation

- ✅ **No typos**: Copy exact JSON configuration
- ✅ **Faster**: One command vs editing settings.json manually
- ✅ **Portable**: Share commands with your team
- ✅ **Consistent**: Same format across all platforms
- ✅ **Correct format**: Follows VS Code CLI specification exactly

## Official VS Code Documentation

According to the VS Code documentation:

> To add an MCP server to your user profile, use the `--add-mcp` VS Code command line option, and provide the JSON server configuration in the form `{\"name\":\"server-name\",\"command\":...}`.

Example from VS Code docs:
```bash
code --add-mcp "{\"name\":\"my-server\",\"command\": \"uvx\",\"args\": [\"mcp-server-fetch\"]}"
```

## References

- [VS Code MCP Documentation](https://code.visualstudio.com/docs/copilot/customization/mcp-servers#_add-an-mcp-server)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP Badge Creator](https://jamesmontemagno.github.io/mcp-badge-creator/)
