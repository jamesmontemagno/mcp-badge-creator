# DNX Support & JSON Format Fix - Oct 9, 2025

## Summary
Added .NET DNX package support and corrected the JSON configuration format for all MCP server types to match the official VS Code MCP specification.

## Changes Made

### 1. Added DNX Configuration Type
**New Type**: `'dnx'` added to `ConfigType` union

**State Variables**:
- `dnxPackage` - stores the DNX package name with version (e.g., `Contoso.SampleMcpServer@0.0.1-beta`)

**Configuration Format**:
```json
{
  "command": "dnx",
  "args": ["Contoso.SampleMcpServer@0.0.1-beta", "--yes"],
  "env": {}
}
```

**UI Changes**:
- Added "DNX Package (.NET)" option to configuration type dropdown
- Added form field for DNX package input
- Placeholder: `Contoso.SampleMcpServer@0.0.1-beta`
- Helper text: "Example: Contoso.SampleMcpServer@0.0.1-beta or your-package@version"

### 2. Fixed JSON Configuration Format

**Problem**: Previous implementation incorrectly included `name` property in all configurations.

**Solution**: Corrected to match VS Code MCP specification:

#### HTTP Servers (type: "http")
```json
{
  "url": "https://api.githubcopilot.com/mcp/",
  "type": "http"
}
```
- ❌ No `name` property
- ❌ No `command` or `args`
- ✅ Only `url` and `type`

#### STDIO Servers (npx, uvx, dnx, docker, local)
```json
{
  "command": "npx",
  "args": ["-y", "css-mcp"],
  "env": {}
}
```
- ❌ No `name` property
- ❌ No `type` property  
- ✅ Only `command`, `args`, and `env`

**Note**: The `name` parameter is used in the VS Code install URL (`?name=...`), but NOT in the actual configuration JSON.

### 3. Code Changes

#### `src/App.tsx`
1. **Type Definition**:
   ```typescript
   type ConfigType = 'http' | 'docker' | 'local' | 'npx' | 'uvx' | 'dnx';
   ```

2. **Interface Update**:
   ```typescript
   interface MCPConfig {
     name?: string; // Only for URL encoding, not in config
     type?: string;
     url?: string;
     command?: string;
     args?: string[];
     env?: Record<string, string>;
   }
   ```

3. **generateConfig() Function**:
   - Removed `name` from all configs
   - HTTP configs only include `type` and `url`
   - STDIO configs only include `command`, `args`, and `env`
   - Added `dnx` case:
     ```typescript
     case 'dnx':
       config.command = 'dnx';
       config.args = [dnxPackage, '--yes'];
       config.env = {};
       break;
     ```

### 4. Documentation Updates

#### `README.md`
- Updated feature count from 5 to 6 configuration types
- Corrected all JSON examples to remove `name` property
- Added DNX Package section:
  ```markdown
  ### 4. DNX Package (.NET)
  For .NET-based MCP servers using DNX package manager.
  ```
- Fixed numbering (Docker is now #5, Local Binary is #6)

#### `CLI-COMMANDS.md`
- Created comprehensive guide with correct JSON formats
- Added DNX example
- Added important notes about configuration format differences
- Clarified HTTP vs STDIO server configurations
- Added reference to VS Code documentation

### 5. Testing Results
- ✅ TypeScript compilation successful
- ✅ ESLint passing (no errors)
- ✅ Production build successful
- ✅ No runtime errors
- ✅ Dev server running correctly
- ✅ All 6 configuration types working

## Configuration Examples (Corrected)

### HTTP Server
```json
{
  "url": "https://api.githubcopilot.com/mcp/",
  "type": "http"
}
```

### NPX Package
```json
{
  "command": "npx",
  "args": ["-y", "css-mcp"],
  "env": {}
}
```

### UVX Package
```json
{
  "command": "uvx",
  "args": ["--from", "mcp-server-git", "mcp-server-git"],
  "env": {}
}
```

### DNX Package (NEW!)
```json
{
  "command": "dnx",
  "args": ["Contoso.SampleMcpServer@0.0.1-beta", "--yes"],
  "env": {}
}
```

### Docker Container
```json
{
  "command": "docker",
  "args": ["run", "-i", "--rm", "username/image:latest"],
  "env": {}
}
```

### Local Binary
```json
{
  "command": "node",
  "args": ["server.js", "--port", "3000"],
  "env": {}
}
```

## CLI Command Examples

### DNX Package
```bash
code --add-mcp '{\"command\":\"dnx\",\"args\":[\"Contoso.SampleMcpServer@0.0.1-beta\",\"--yes\"],\"env\":{}}'
```

### HTTP Server
```bash
code --add-mcp '{\"url\":\"https://api.githubcopilot.com/mcp/\",\"type\":\"http\"}'
```

## References

- [VS Code MCP Documentation](https://code.visualstudio.com/docs/copilot/customization/mcp-servers#_configuration-format)
- [Model Context Protocol](https://modelcontextprotocol.io)
- DNX example from user request (Contoso.SampleMcpServer)

## Impact

### User Benefits
1. **Correct configurations** - Generated JSON now matches VS Code specification exactly
2. **.NET support** - Developers can now create badges for .NET MCP servers
3. **No manual corrections** - Users don't need to fix generated JSON anymore
4. **CLI commands work** - All generated CLI commands are valid and work correctly

### Technical Benefits
1. **Spec compliance** - Code now follows official VS Code MCP configuration format
2. **Maintainability** - Clear separation between HTTP and STDIO server configs
3. **Extensibility** - Easy to add more STDIO-based server types in future
4. **Type safety** - TypeScript interface correctly reflects optional properties

## Future Considerations

### Potential Enhancements
1. Add validation for DNX package format (package@version)
2. Support for environment variables in all server types
3. Support for `envFile` property (loads env vars from file)
4. Add examples/templates for common DNX packages

### Known Limitations
1. DNX currently always adds `--yes` flag (could be made optional)
2. No validation of package format (e.g., checking for `@` symbol)
3. Environment variables (`env` object) always empty by default
