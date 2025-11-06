# Unit Tests for MCP Badge Generator

This directory contains comprehensive unit tests for the MCP badge generation functionality.

## Running Tests

```bash
# Run all unit tests
npm run test:unit:run

# Run tests in watch mode
npm run test:unit

# Run tests with UI
npm run test:unit:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite covers the following areas:

### Core Functions

1. **encodeConfig()** - Tests URL encoding of MCP configurations
   - Simple HTTP configs
   - Docker configs with environment variables
   - Configs with inputs array

2. **generateVSCodeBadge()** - Tests VS Code badge generation
   - Basic badge generation
   - Badge with inputs
   - Custom badge text

3. **generateVSCodeInsidersBadge()** - Tests VS Code Insiders badge generation
   - Basic badge with quality parameter
   - Inputs preservation

4. **generateVisualStudioBadge()** - Tests Visual Studio badge generation
   - Basic badge generation
   - Inputs in badge URL

5. **generateCursorBadge()** - Tests Cursor badge generation
   - Base64 encoding
   - Inputs preservation with base64

6. **generateVSCodeCLICommand()** - Tests CLI command generation
   - Standard code command
   - Insiders variant
   - Inputs in CLI JSON
   - Proper JSON escaping

7. **mergeConfigWithInputs()** - Tests config/inputs merging
   - Merge with inputs present
   - No inputs scenarios

8. **createFullMCPConfig()** - Tests full config structure
   - Servers and inputs
   - Servers without inputs

9. **generateAllBadges()** - Tests multi-platform badge generation
   - Default platforms
   - Selective platforms
   - Custom badge text
   - Inputs preservation across platforms

### Common Scenarios

The test suite includes real-world scenarios:

- **HTTP Server with Authorization Headers** - Testing password-protected API tokens
- **Docker Container with Multiple Environment Variables** - Similar to the original issue
- **NPX Packages** - Standard Node.js packages without inputs
- **UVX Python Packages** - Python packages with --from flag

## Test Files

- `mcpBadgeGenerator.test.ts` - Main test suite (30 tests)
- `mcpBadgeGenerator.ts` - Utility functions being tested

## Key Test Cases

### Issue Reproduction Test

The test suite includes a specific test case that reproduces the original issue:

```typescript
it('should handle Docker container with multiple environment variables', () => {
  const config: ConfigWithInputs = {
    command: 'docker',
    args: ['run', '-i', '--rm', 'fboucher/check-in-doc-mcp'],
    env: {
      'ALLOWED_DOMAINS': '${input:allowed_domains}',
      'APIKEY': '${input:apikey}'
    },
    inputs: [
      {
        type: 'promptString',
        id: 'allowed_domains',
        description: 'Enter the comma-separated list of documentation domains',
        password: false
      },
      {
        type: 'promptString',
        id: 'apikey',
        description: 'Enter your API key',
        password: true
      }
    ]
  };
  
  const cliCommand = generateVSCodeCLICommand('check-in-docs', config);
  // ... assertions verify inputs are included
});
```

## Adding New Tests

When adding new badge generation features:

1. Add the function to `mcpBadgeGenerator.ts`
2. Export the function and relevant types
3. Create test cases in `mcpBadgeGenerator.test.ts`
4. Test with and without inputs
5. Test encoding/decoding roundtrip
6. Test real-world scenarios

## Continuous Integration

These tests run as part of the CI pipeline to ensure:
- Badge URLs properly encode inputs
- CLI commands include inputs array
- Configuration structures are correct
- No regressions in badge generation logic
