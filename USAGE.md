# MCP Badge Creator - Usage Guide

## Quick Start

1. **Open the Application**: Navigate to the deployed site or run locally with `npm run dev`

2. **Enter Server Name**: 
   - Type your MCP server name (e.g., "my-awesome-server")
   - This will be used in both the badge and the configuration

3. **Select Configuration Type**:
   - **Remote HTTP Server**: For servers accessible via URL
   - **Docker Container**: For Dockerized MCP servers
   - **Local Binary**: For locally installed executables

4. **Fill Configuration Details**:
   - **HTTP**: Enter your server URL (e.g., `https://api.example.com/`)
   - **Docker**: Enter your Docker image name (e.g., `username/image-name`)
   - **Local**: Enter command (e.g., `node`) and arguments (e.g., `dist/index.js`)

5. **Select Target IDEs**:
   - Check the boxes for the IDEs you want to support
   - VS Code (blue badge)
   - VS Code Insiders (green badge)
   - Visual Studio (purple badge)

6. **Preview & Copy**:
   - See live preview of your badges
   - View the generated markdown
   - View the JSON configuration
   - Click "Copy" to copy markdown to clipboard

7. **Add to Your README**:
   - Paste the copied markdown into your project's README.md
   - Typically place badges near the top after the title

## Example Configurations

### Example 1: HTTP Server
```
Server Name: weather-mcp
Configuration Type: Remote HTTP Server
Server URL: https://weather.example.com/mcp
Target IDEs: All three
```

### Example 2: Docker Container
```
Server Name: database-mcp
Configuration Type: Docker Container
Docker Image: myusername/database-mcp:latest
Target IDEs: VS Code, VS Code Insiders
```

### Example 3: Local Binary
```
Server Name: local-tools
Configuration Type: Local Binary
Command: node
Arguments: /usr/local/bin/tools.js, --verbose
Target IDEs: VS Code
```

## URL Encoding

The tool automatically handles URL encoding of your JSON configuration. Common characters that get encoded:

- `{` → `%7B`
- `}` → `%7D`
- `"` → `%22`
- `:` → `%3A`
- `/` → `%2F`
- `[` → `%5B`
- `]` → `%5D`
- `,` → `%2C`

## Badge URL Patterns

### VS Code
```
https://insiders.vscode.dev/redirect/mcp/install?name=[NAME]&config=[ENCODED_CONFIG]
```

### VS Code Insiders
```
https://insiders.vscode.dev/redirect/mcp/install?name=[NAME]&config=[ENCODED_CONFIG]&quality=insiders
```

### Visual Studio
```
https://vs-open.link/mcp-install?[ENCODED_CONFIG]
```

## Tips

1. **Test First**: Always test your MCP server configuration before creating badges
2. **Be Descriptive**: Use clear, descriptive server names
3. **Support Multiple Options**: If you have both Docker and HTTP, create badges for both
4. **Documentation**: Add a section in your README explaining what your MCP server does
5. **Verification**: After adding badges, click them to verify they work correctly

## Troubleshooting

### Badges Don't Appear
- Check that you've filled in all required fields (marked with *)
- Ensure at least one IDE is selected

### Copy Doesn't Work
- Make sure your browser allows clipboard access
- Try manually selecting and copying the markdown

### Installation Fails
- Verify your JSON configuration is correct
- Test the configuration manually first
- Check that URLs are accessible and valid

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Badge Styling Guide](https://github.com/jamesmontemagno/MonkeyMCP/blob/main/.github/prompts/add-mcp-install-badges.md)
- [Shields.io](https://shields.io) - Badge generation service
