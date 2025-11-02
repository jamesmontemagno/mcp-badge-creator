# MCP Registry Search Feature

## Overview

The MCP Registry Search feature allows users to search the official Model Context Protocol (MCP) registry and automatically populate the MCP badge creation form with server configurations.

## User Guide

### How to Use

1. **Navigate to MCP Page**: Go to the MCP Badge Creator page
2. **Click Search Registry**: In the "Import Configuration" section, click the "🔍 Search Registry" button (first option)
3. **Search for Servers**: Type the name of an MCP server (e.g., "filesystem", "git", "postgres")
4. **Select a Server**: Click on a server from the search results
5. **Customize**: The form will auto-populate with the server's configuration. Customize any fields as needed
6. **Generate Badges**: Click generate to create installation badges for your MCP server

### Features

- **Real-time Search**: Debounced search with 300ms delay for responsive UX
- **Keyboard Navigation**: Use arrow keys, Enter, and Escape for keyboard-only navigation
- **Auto-Population**: Automatically fills all form fields with server configuration
- **Customizable**: Imported configurations can be modified before generating badges
- **Multiple Config Types**: Supports HTTP, NPX, UVX, DNX, Docker, and Local configurations

## Technical Details

### Architecture

#### MCP Registry API Client (`src/utils/mcpRegistryApi.ts`)

```typescript
// Search for MCP servers
const servers = await searchMCPServers('filesystem', 10);

// Parse runtime config into form-compatible format
const parsed = parseRuntimeConfig(server.runtime);
```

**Functions**:
- `searchMCPServers(query, limit)`: Search the MCP registry
- `getMCPServerDetails(serverId)`: Get full details for a specific server
- `parseRuntimeConfig(runtime)`: Convert registry data to form format

#### Search Dropdown Component (`src/components/MCPSearchDropdown.tsx`)

React component that provides:
- Debounced search (300ms)
- Keyboard navigation (↑, ↓, Enter, Esc)
- Click-outside-to-close
- Loading and error states
- Result list with server metadata

#### Integration (`src/pages/MCP.tsx`)

Modal-based search interface integrated into the import section:
- Search modal with input field
- Result selection handler
- Form auto-population logic
- Success/error notifications

### API Specification

**Endpoint**: `https://registry.modelcontextprotocol.io/v0/servers`

**Query Parameters**:
- `search`: Search query string
- `version`: Filter by version (default: "latest")
- `updated_since`: Filter by update timestamp (RFC3339 format)

**Response Format**:
```json
[
  {
    "id": "io.github.user/server-name",
    "name": "Server Display Name",
    "description": "Server description",
    "version": "1.0.0",
    "runtime": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": {}
    },
    "tags": ["filesystem", "git"]
  }
]
```

### Configuration Parsing

The parser supports multiple runtime types:

#### HTTP Servers
```json
{
  "type": "http",
  "url": "https://server.example.com",
  "headers": {
    "Authorization": "Bearer token"
  }
}
```

#### NPX Packages
```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem"],
  "env": {}
}
```

#### UVX Packages
```json
{
  "command": "uvx",
  "args": ["--from", "mcp-server-git", "mcp-server-git"],
  "env": {}
}
```

#### DNX Packages
```json
{
  "command": "dnx",
  "args": ["Contoso.SampleMcpServer@0.0.1-beta", "--yes"],
  "env": {}
}
```

#### Docker Containers
```json
{
  "command": "docker",
  "args": ["run", "-i", "--rm", "username/image"],
  "env": {}
}
```

#### Local Binaries
```json
{
  "command": "node",
  "args": ["path/to/server.js"],
  "env": {}
}
```

## Testing

### Unit Tests

Test file: `tests/mcp-search.spec.ts`

**Test Coverage**:
1. Search button visibility
2. Modal open/close interactions
3. Search input functionality
4. Result selection
5. Button order verification
6. Keyboard navigation

**Running Tests**:
```bash
npm test -- tests/mcp-search.spec.ts
```

### Manual Testing

1. **Search Functionality**:
   - Type "filesystem" → verify results appear
   - Type "git" → verify results appear
   - Type invalid query → verify "no results" message

2. **Form Population**:
   - Select NPX server → verify package name filled
   - Select HTTP server → verify URL filled
   - Select Docker server → verify image filled

3. **Error Handling**:
   - Disconnect network → verify error message
   - Invalid selection → verify graceful handling

## Limitations & Known Issues

### API Availability

The MCP registry API (`registry.modelcontextprotocol.io`) may not be publicly accessible yet or may require authentication. The implementation follows the documented API specification and will work when the registry is fully available.

### CORS Restrictions

Some environments may have CORS restrictions that prevent API calls. The implementation includes proper error handling and user-friendly messages for such cases.

### Response Format Variations

The actual API response format may differ from documentation. The parser handles multiple possible response structures gracefully.

## Future Enhancements

1. **Caching**: Implement client-side caching for search results
2. **Advanced Filters**: Add filtering by tags, popularity, or version
3. **Favorites**: Allow users to save frequently used servers
4. **Preview**: Show detailed server information before importing
5. **Validation**: Validate imported configurations against schema
6. **Offline Mode**: Cache popular servers for offline use

## Security Considerations

### Input Validation

- Search queries are sanitized and URL-encoded
- Server configurations are validated before import
- Environment variables with passwords are handled securely

### Network Security

- All API calls use HTTPS
- CORS-enabled requests with proper headers
- No sensitive data is stored or transmitted insecurely

### CodeQL Analysis

The implementation has been scanned with CodeQL and found no security vulnerabilities.

## Troubleshooting

### Search Not Working

**Symptom**: Search returns no results or shows error message

**Solutions**:
1. Check network connectivity
2. Verify MCP registry API is accessible
3. Try different search terms
4. Check browser console for detailed errors

### Form Not Populating

**Symptom**: Selected server doesn't populate form

**Solutions**:
1. Verify server has valid runtime configuration
2. Check console for parsing errors
3. Try manual import as fallback
4. Report issue with server ID

### Modal Not Closing

**Symptom**: Search modal stays open after selection

**Solutions**:
1. Click Cancel button
2. Click outside modal
3. Press Escape key
4. Refresh page if stuck

## Support

For issues, questions, or feature requests:
1. Check existing GitHub issues
2. Review this documentation
3. Create new issue with detailed description
4. Include browser console logs if applicable

## References

- [MCP Registry Documentation](https://modelcontextprotocol.info/tools/registry/)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io)
- [MCP Badge Creator Repository](https://github.com/jamesmontemagno/mcp-badge-creator)
