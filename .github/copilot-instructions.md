# MCP Badge Creator - AI Coding Agent Instructions

## Project Overview
A Vite + React + TypeScript single-page application that generates one-click install badges for Model Context Protocol (MCP) servers. Users fill a form, and the app generates markdown badges with encoded JSON configurations for VS Code, VS Code Insiders, and Visual Studio.

## Architecture & Key Files

### Single-Component React App
- **`src/App.tsx`**: Entire application logic in one component (~400 lines)
  - State management with `useState` for form fields
  - Five config types: `http`, `npx`, `uvx`, `docker`, `local`
  - Badge generation with URL encoding of JSON configs
  - No external state management library - pure React hooks

### Build & Deploy Pipeline
- **Vite bundler**: Fast dev server and optimized production builds
- **GitHub Actions**: `.github/workflows/deploy.yml` auto-deploys to GitHub Pages on push to main
- **Base path**: `vite.config.ts` sets `base: '/mcp-badge-creator/'` for GitHub Pages hosting
- **TypeScript**: Strict mode with separate configs (`tsconfig.app.json`, `tsconfig.node.json`)

## MCP Badge URL Patterns (Critical Domain Knowledge)

The core business logic encodes MCP server configurations into URL parameters:

### VS Code URLs
```typescript
// VS Code stable
https://vscode.dev/redirect/mcp/install?name={NAME}&config={ENCODED_JSON}

// VS Code Insiders
https://insiders.vscode.dev/redirect/mcp/install?name={NAME}&config={ENCODED_JSON}&quality=insiders
```

### Visual Studio URL
```typescript
https://vs-open.link/mcp-install?{ENCODED_JSON}
```

### Configuration JSON Structures
See `generateConfig()` in `App.tsx` for exact patterns:
- **HTTP**: `{ name, type: "http", url }`
- **NPX**: `{ name, command: "npx", args: ["-y", package], env: {} }`
- **UVX**: `{ name, command: "uvx", args: ["--from", from, package] || [package], env: {} }`
- **Docker**: `{ name, command: "docker", args: ["run", "-i", "--rm", image], env: {} }`
- **Local**: `{ name, command, args: [...], env: {} }`

## Development Workflow

### Local Development
```bash
npm install       # Install dependencies
npm run dev       # Start dev server at http://localhost:5173/mcp-badge-creator/
npm run build     # TypeScript compile + Vite build to ./dist
npm run preview   # Preview production build locally
npm run lint      # ESLint check
```

### Deployment Process
1. Push to `main` branch triggers GitHub Actions workflow
2. Workflow runs `npm ci` → `npm run build` → deploys `./dist` to GitHub Pages
3. Must configure repo Settings > Pages > Source: "GitHub Actions"
4. **Critical**: `vite.config.ts` base path must match repo name

## Project-Specific Conventions

### No Component Splitting
- Entire UI in single `App.tsx` component (intentional design choice)
- Inline styles via `className` targeting `App.css`
- Form sections and output sections in one file for simplicity

### Badge Color Scheme
From `App.tsx` and documented in memory:
- **VS Code**: `#0098FF` (blue) with `visualstudiocode` logo
- **VS Code Insiders**: `#24bfa5` (green) with `visualstudiocode` logo
- **Visual Studio**: `#C16FDE` (purple) with `visualstudio` logo
- UI theme matches VS Code Insiders green gradient

### State Management Pattern
```typescript
// Each config type has dedicated state variables
const [configType, setConfigType] = useState<ConfigType>('http')
const [serverUrl, setServerUrl] = useState('')      // for http
const [npxPackage, setNpxPackage] = useState('')    // for npx
const [uvxPackage, setUvxPackage] = useState('')    // for uvx
// ... and so on

// Conditional rendering based on configType
{configType === 'http' && <input ... />}
{configType === 'npx' && <input ... />}
```

### URL Encoding Logic
```typescript
const encodeConfig = (config: MCPConfig): string => {
  return encodeURIComponent(JSON.stringify(config));
}
```
**Important**: Double encoding via `encodeURIComponent` for both `name` parameter and entire `config` JSON.

## Documentation Structure
- **`README.md`**: User-facing documentation, deployment instructions
- **`USAGE.md`**: Detailed usage examples for each config type
- **`DEPLOYMENT.md`**: Step-by-step GitHub Pages deployment guide
- **`MCP_GUIDE.md`**: Educational content about MCP protocol (not used by app logic)
- **`QUICKSTART.md`**: Quick setup guide
- **`ICON-DESIGN.md`**: Custom icon design specifications

## Custom Branding
- Custom SVG icons in `public/` (favicon.svg, icon.svg, icon-192.svg)
- PWA manifest (`public/manifest.json`) for installable web app
- VS Code Insiders green gradient theme (#24bfa5, #1a9667, #0e7153)

## Testing & Debugging
- No unit tests currently (add to `package.json` scripts if needed)
- Manual testing: Fill form → copy markdown → paste in test README → click badge
- Badge URLs can be tested directly in browser to verify JSON encoding

## Common Modifications

### Adding a New Config Type
1. Add type to `ConfigType` union in `App.tsx`
2. Add state variables for new fields
3. Add case in `generateConfig()` switch statement
4. Add conditional form section with inputs
5. Update `USAGE.md` with example

### Changing Base Path (for different repo name)
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/YOUR-NEW-REPO-NAME/',  // Must match GitHub repo name
})
```

### Modifying Badge Styles
Edit Shields.io URL parameters in `generateMarkdown()`:
- `style=flat-square` → badge shape
- `0098FF` → hex color (no #)
- `logo=visualstudiocode` → logo name

## External Dependencies
- **Shields.io**: Badge image generation (external service, no API key needed)
- **React 19.1.1**: Latest React with hooks
- **Vite 7.x**: Build tool and dev server
- **TypeScript 5.9.3**: Type checking

## Important Notes
- No backend server - pure static site
- No API calls except clipboard API for copy functionality
- Form validation is basic (required field checks in JSX)
- Environment variables not used (no `.env` files)
- No authentication or user accounts

## When Making Changes
1. Always test locally with `npm run dev` first
2. Verify badge URLs work by clicking generated badges
3. Check responsive design (mobile/tablet/desktop)
4. Update documentation if adding features
5. Remember GitHub Actions will auto-deploy on push to main


## When documenting and creating memories at the end of a turn
ALWAYS put the documents in the .vscode\memory folder
