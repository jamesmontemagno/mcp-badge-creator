# MCP Badge Creator - Implementation Notes

## Recent Updates (October 2025)

### Configuration Import Feature
Added dual import functionality allowing users to populate the form from existing MCP configurations:

**1. Upload File Option**
- File picker for `.json` files
- Parses multiple MCP JSON formats
- Auto-populates all form fields

**2. Paste JSON Modal**
- Modal dialog with large textarea
- Direct JSON paste and import
- Same parsing logic as file upload

**Import Formats Supported:**
```typescript
// Standard format
{ "servers": { "name": {...} }, "inputs": [...] }

// VS Code format  
{ "mcpServers": { "name": {...} } }

// Direct config
{ "type": "http", "url": "...", ... }
```

**Parsing Features:**
- Auto-detects server type (HTTP vs STDIO)
- Extracts HTTP headers with password detection
- Parses environment variables with `${input:id}` references
- Links inputs to their descriptions
- Separates standalone vs referenced inputs
- Handles all config types (npx, uvx, dnx, docker, local)

### HTTP Headers Support
Added HTTP header configuration for HTTP-type MCP servers:

**Interface:**
```typescript
interface DynamicHeader {
  key: string;
  value: string;
  password?: boolean;
  inputName?: string;
  inputDescription?: string;
}
```

**Features:**
- Custom header names and values
- Password protection for sensitive headers (e.g., Authorization)
- Custom input IDs and descriptions for password prompts
- Headers stored in `config.headers` (not `config.env`)

**Example:**
```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${input:github_token}"
      }
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "github_token",
      "description": "GitHub Personal Access Token",
      "password": true
    }
  ]
}
```

### Custom Input Names and Descriptions
Enhanced password inputs with customizable identifiers:

**New Fields:**
- `inputName`: Custom input ID (e.g., `github_token` instead of auto-generated)
- `inputDescription`: User-friendly prompt text (e.g., "GitHub Personal Access Token")

**Smart Defaults:**
- Auto-generates safe IDs if not provided (lowercase, underscores only)
- Appears conditionally when "Password" checkbox is checked
- Available for both headers and environment variables

**UI Enhancement:**
- Card-based layout for each header/env var
- Expandable input details section
- Cleaner visual separation with dashed borders

### Standalone Additional Inputs
Added support for arbitrary inputs not tied to specific headers or env vars:

**Interface:**
```typescript
interface StandaloneInput {
  id: string;
  description: string;
  password?: boolean;
}
```

**Use Cases:**
- Shared inputs across multiple env vars
- Inputs referenced in custom arguments
- Pre-defined prompts for complex configurations

**Example:**
```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "shared_api_token",
      "description": "API Token for authentication",
      "password": true
    }
  ],
  "servers": {
    "server1": {
      "command": "node",
      "args": ["server.js"],
      "env": {
        "API_TOKEN": "${input:shared_api_token}"
      }
    }
  }
}
```

### Configuration Structure Updates

**HTTP Servers (type: "http"):**
- Has: `type`, `url`, `headers`, `inputs`
- No: `env`, `command`, `args`

**STDIO Servers (docker, npx, uvx, dnx, local):**
- Has: `command`, `args`, `env`, `inputs`
- No: `headers`, `url`, `type`

### UI/UX Improvements

**1. Delete Button Styling**
- Compact 36x36px square button
- Subtle red gradient with hover effects
- Circular ripple animation
- Reduced from bold to refined appearance

**2. Tab Toggle Enhancements**
- Segmented control design (pills in rounded container)
- Active state with elevated shadow and lift
- Theme-aware colors (Dark: VS Code Insiders green, Light: VS Code blue)
- Applied to both main tabs and output tabs

**3. Form Spacing**
- 2.5rem spacer above Server Name
- 3rem spacer above Generated Output toggle
- 2rem spacing between output sections
- 1rem gap between badge previews

**4. Layout Improvements**
- Increased max-width from 1250px to 1400px
- Better organization of form sections
- Card-based layout for headers/env vars
- Responsive mobile design

**5. Import Modal Design**
- Dark backdrop with blur effect
- Smooth fade-in and slide-up animations
- Monospace textarea for JSON
- Purple gradient import button
- Responsive and keyboard-friendly

### Getting Started README Updates
Enhanced documentation to include password input information:

**Features:**
- Callout box listing all secure prompts
- Shows input ID and description for each
- Explains secure storage
- Updated Visual Studio manual installation instructions
- Added headers/env vars context where applicable

### TypeScript Interfaces

```typescript
interface MCPConfig {
  name?: string;
  type?: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  headers?: Record<string, string>;
}

interface MCPInput {
  type: 'promptString';
  id: string;
  description: string;
  password?: boolean;
}

interface DynamicArgument {
  flag: string;
  value: string;
}

interface DynamicEnvVar {
  key: string;
  value: string;
  password?: boolean;
  inputName?: string;
  inputDescription?: string;
}

interface DynamicHeader {
  key: string;
  value: string;
  password?: boolean;
  inputName?: string;
  inputDescription?: string;
}

interface StandaloneInput {
  id: string;
  description: string;
  password?: boolean;
}
```

### Key Functions

**1. generateConfig()**
- Merges dynamic args, env vars, and headers
- Uses `${input:id}` for password fields
- Helper function for generating safe input IDs

**2. generateFullConfig()**
- Creates root-level `inputs` array
- Combines all password inputs (headers, env vars, standalone)
- Generates complete MCP configuration

**3. parseAndImportConfig()**
- Parses multiple JSON formats
- Auto-detects config type
- Populates all form fields
- Links password inputs to descriptions

**4. handleImportConfig()**
- File upload handler
- Uses FileReader API
- Calls parseAndImportConfig()

**5. handleImportFromText()**
- Modal text import handler
- Direct JSON parsing
- Same import logic as file

### CSS Styling

**Component Styles (MCP.module.css):**
- `.importBtn` - Purple gradient upload/paste buttons
- `.headerCard` - Card container for headers/env vars
- `.inputDetailsRow` - Expandable input fields section
- `.inputNameField` / `.inputDescField` - Custom input styling
- `.deleteBtn` - Refined delete button with ripple
- `.tabs` / `.tab` - Segmented control tabs
- `.modalOverlay` / `.modalContent` - Import modal
- `.jsonTextarea` - Monospace JSON input

**Global Styles (global.css):**
- `.badge-preview` - 1rem gap between badges
- `.preview`, `.markdown-output`, etc. - 2rem bottom margins

**Theme Support:**
- Import button: Different purple shades per theme
- Tabs: Theme-specific active colors
- All elements respect CSS variables

### Testing Scenarios

**Scenario 1: HTTP Server with Headers**
1. Select HTTP config type
2. Enter URL
3. Add Authorization header (password checked)
4. Customize input name and description
5. Verify `headers` object in config (not `env`)

**Scenario 2: Import Existing Config**
1. Click "Upload File" or "Paste JSON"
2. Provide MCP JSON configuration
3. Verify form auto-populates
4. Check headers, env vars, and inputs are preserved

**Scenario 3: Standalone Inputs**
1. Add standalone input with custom ID
2. Reference in multiple env vars using `${input:id}`
3. Verify single prompt generated

**Scenario 4: Custom Input Names**
1. Add env var with password checked
2. Expand input details
3. Enter custom input ID and description
4. Verify used in config and inputs array

### Files Modified
- `src/pages/MCP.tsx` - Core logic, interfaces, import, and JSX
- `src/pages/MCP.module.css` - Component styles
- `src/styles/global.css` - Global spacing updates
- `.github/copilot-instructions.md` - Documentation updates

### Browser Behavior
- Config type switching preserves per-type state
- Password checkbox disables value field
- Real-time config preview updates
- Modal closes on overlay click or cancel
- File input resets after import
- Success/error alerts for feedback

### Notes
- HTTP servers use `headers` field, not `env`
- STDIO servers have no `headers` field
- Input IDs are sanitized (lowercase, underscores)
- Import supports nested and flat JSON structures
- All password values stored as `${input:id}` references
- Compatible with all MCP server types
- Max-width increased for better UX on large screens
- Mobile-responsive design maintained throughout

---

## MCP Registry Search Feature (November 2, 2025)

### Overview
Implemented MCP registry search functionality to allow users to discover and import MCP server configurations directly from the official Model Context Protocol registry.

### Files Changed
- **New**: `src/utils/mcpRegistryApi.ts` (274 lines) - API client and parser
- **New**: `src/components/MCPSearchDropdown.tsx` (158 lines) - Search component
- **New**: `tests/mcp-search.spec.ts` (112 lines) - Test suite
- **New**: `specs/MCP_REGISTRY_SEARCH.md` - Feature documentation
- **Modified**: `src/pages/MCP.tsx` (+74 lines) - Integration
- **Modified**: `src/pages/MCP.module.css` (+25 lines) - Styling

### Technical Implementation
- API endpoint: `https://registry.modelcontextprotocol.io/v0/servers`
- Supports 6 config types: HTTP, NPX, UVX, DNX, Docker, Local
- Debounced search (300ms) with keyboard navigation
- Modal-based UI following existing patterns
- Form auto-population with customization support

### Testing & Quality
- 6 Playwright tests written (pending browser installation)
- ✅ Linting: Pass
- ✅ Build: Success
- ✅ CodeQL: No vulnerabilities
- ✅ Code Review: 2 issues fixed

### Known Limitations
- MCP Registry API may not be publicly accessible yet
- Implementation follows documented spec
- Will work when API is available
- Graceful error handling in place

### User Flow
1. Click "Search Registry" → 2. Search → 3. Select → 4. Customize → 5. Generate badges

