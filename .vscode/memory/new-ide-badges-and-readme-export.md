# New IDE Badge Support and README Export Feature

## Date: 2025-10-10

## Changes Summary
Added support for three new IDE badge options (Cursor, Goose, LM Studio) and a new "Getting Started README" export tab.

## New IDEs Supported

### 1. Cursor (AI-powered IDE)
- **Color**: Purple (#8B5CF6)
- **URL Format**: `cursor://anysphere.cursor-deeplink/mcp/install?name={NAME}&config={ENCODED_JSON}`
- **State Variable**: `includeCursor`
- **Badge Label**: "Install in Cursor"

### 2. Goose (AI coding assistant)
- **Color**: Green (#10B981)
- **URL Format**: `goose://install-mcp?name={NAME}&config={ENCODED_JSON}`
- **State Variable**: `includeGoose`
- **Badge Label**: "Install in Goose"
- **Installation**: Can also be installed via `npx --yes -p @dylibso/mcpx@latest install --client goose --url "{URL}"`

### 3. LM Studio (Local LLM platform)
- **Color**: Blue (#3B82F6)
- **URL Format**: `lmstudio://add_mcp?name={NAME}&config={BASE64_JSON}`
- **State Variable**: `includeLMStudio`
- **Badge Label**: "Install in LM Studio"
- **Special Note**: Uses **base64 encoding** instead of URL encoding for the config parameter

## Badge Generation Logic

All badges now follow this pattern in `generateMarkdown()`:
1. Check if IDE is included via state variable
2. Encode configuration appropriately (URL encoding for most, base64 for LM Studio)
3. Generate Shields.io badge with deeplink URL
4. Add to badges array

## New Tab: Getting Started README

### Purpose
Provides a complete "Getting Started" section that users can copy directly into their README.md files.

### Components
1. **Quick Install Section**: All badge buttons for one-click installation
2. **Manual Installation**: Step-by-step instructions for each IDE
   - VS Code / VS Code Insiders (with CLI commands)
   - Visual Studio
   - Cursor
   - Goose (with npx command option)
   - LM Studio
3. **Configuration Details**: Summary of server type and configuration
4. **Help Section**: Link to MCP documentation

### Implementation
- New state variable: `activeTab` (values: 'badges' | 'readme')
- New function: `generateReadmeContent()` - generates markdown for README section
- New function: `copyReadmeToClipboard()` - copies README content
- New state variable: `copiedReadme` - tracks copy button state
- Tab buttons to switch between "Badges & Config" and "Getting Started README"

## UI Changes

### IDE Cards Section
Now displays 6 IDE cards (was 3):
1. VS Code (Blue #0098FF)
2. VS Code Insiders (Green #24bfa5)
3. Visual Studio (Purple #C16FDE)
4. Cursor (Purple #8B5CF6)
5. Goose (Green #10B981)
6. LM Studio (Blue #3B82F6)

### Output Section
- Changed heading from "Generated Badges" to "Generated Output"
- Added tab navigation with two tabs:
  - "Badges & Config" - existing functionality
  - "Getting Started README" - new functionality
- Tab styling with active state and hover effects

## CSS Additions

### Tab Styles (in App.css)
```css
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.tab {
  background: transparent;
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s;
}

.tab:hover {
  color: #24bfa5;
}

.tab.active {
  color: #24bfa5;
  border-bottom-color: #24bfa5;
}

.readme-preview {
  margin-bottom: 1.5rem;
}

.readme-preview pre {
  max-height: 600px;
  overflow-y: auto;
}
```

## State Variables Added
- `includeCursor: boolean` (default: true)
- `includeGoose: boolean` (default: true)
- `includeLMStudio: boolean` (default: true)
- `copiedReadme: boolean` (default: false)
- `activeTab: 'badges' | 'readme'` (default: 'badges')

## Key Functions Modified/Added

### Modified
- `generateMarkdown()`: Added Cursor, Goose, and LM Studio badge generation

### Added
- `generateReadmeContent()`: Generates complete README Getting Started section
- `copyReadmeToClipboard()`: Copies README content to clipboard

## Testing Notes
- All badges generate correctly with proper URL encoding
- LM Studio uses btoa() for base64 encoding
- Tab switching works smoothly
- Toggle switches properly filter badges in both tabs
- Copy buttons work for all sections
- Build and lint pass successfully

## Browser Compatibility
- Uses `btoa()` for base64 encoding (widely supported)
- Uses `navigator.clipboard` API (modern browsers)
- CSS uses flexbox (widely supported)

## Future Considerations
- Could add more IDEs as they add MCP support
- Could add preview rendering of the README markdown
- Could add customization options for README template
