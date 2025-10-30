# Plan: Package Manager Badges and Installation Links

Add a new page that generates version and download badges for packages from NPM, NuGet, PyPI, Maven Central, RubyGems, and Crates.io. Users can paste a package URL or enter package details manually. The page will display badges, markdown, and installation commands for one package manager at a time using Shields.io badge generation.

## Steps

### 1. Create `src/utils/packageBadge.ts` utility

- `parsePackageInput()` to detect package manager from URL patterns (npmjs.com, nuget.org, pypi.org, crates.io, rubygems.org, central.sonatype.com)
- Parse Maven coordinates (groupId:artifactId format or URL)
- Return `PackageParseResult` with manager type and package identifiers
- `generatePackageBadges()` to create Shields.io badge URLs and markdown for version/downloads badges
- `getInstallCommands()` to return manager-specific installation command templates

### 2. Create `src/pages/Packages.tsx` component

Following the `Extensions.tsx` pattern with:
- Single input field for URL or package identifier
- Dropdown for manual package manager selection (6 options: NPM, NuGet, PyPI, Maven, RubyGems, Crates)
- Conditional form fields for Maven requiring both groupId and artifactId inputs
- State management with `useState` for:
  - `packageManager`
  - `packageId`
  - `groupId`
  - `artifactId`
  - Output state for generated badges and commands

### 3. Build output section in `Packages.tsx`

Displaying:
- Badge preview rendering actual images via `dangerouslySetInnerHTML`
- Individual markdown code blocks for version badge and downloads badge with copy buttons
- Installation commands section showing all relevant commands:
  - NPM: npm/yarn/pnpm
  - NuGet: dotnet/Install-Package
  - PyPI: pip/pipx/uv
  - Maven: Maven XML/Gradle
  - RubyGems: gem
  - Crates: cargo
- Link to package page on respective registry

### 4. Add routing and navigation

Update `App.tsx`:
- Add `<Route path="/packages" element={<Packages />} />`
- Import `Packages` component
- Add "Package Badges" navigation link in header `<nav>` between "MCP Badges" and "VS Code Extensions" links
- Add matching mobile menu entry

### 5. Create `Packages.css` stylesheet

Following CSS variable patterns from `.github/copilot-instructions.md`:
- Use `var(--primary-color)`, `var(--bg-white)`, `var(--text-color)`, etc.
- Style `.packages-page` container
- Form sections with `.package-input` and `.package-dropdown`
- `.maven-fields` for dual input layout
- `.output-section` cards for badges and commands
- `.command-block` styling with copy buttons

## Implementation Notes

- **Maven support**: Both `groupId:artifactId` format parsing and URL detection from central.sonatype.com
- **Single package per generation**: Each package generates badges for only its detected/selected package manager
- **No API calls needed**: Shields.io handles data fetching and badge rendering
- **Follow existing patterns**: Use `Extensions.tsx` component structure for consistency

## Package Manager Details

### NPM (npmjs.com)
- **URL Pattern**: `npmjs.com/package/{package-name}` or `npmjs.com/package/@{scope}/{package-name}`
- **Badges**: Version, Total Downloads, Monthly Downloads
- **Commands**: `npm install`, `yarn add`, `pnpm add`

### NuGet (nuget.org)
- **URL Pattern**: `nuget.org/packages/{PackageId}`
- **Badges**: Version, Total Downloads
- **Commands**: `dotnet add package`, `Install-Package`

### PyPI (pypi.org)
- **URL Pattern**: `pypi.org/project/{package-name}/`
- **Badges**: Version, Monthly Downloads
- **Commands**: `pip install`, `pipx install`, `uv pip install`

### Maven Central (central.sonatype.com)
- **URL Pattern**: `central.sonatype.com/artifact/{groupId}/{artifactId}`
- **Input Format**: `groupId:artifactId` or separate fields
- **Badges**: Version
- **Commands**: Maven XML dependency, Gradle implementation

### RubyGems (rubygems.org)
- **URL Pattern**: `rubygems.org/gems/{gem-name}`
- **Badges**: Version, Total Downloads, Monthly Downloads
- **Commands**: `gem install`

### Crates.io (Rust)
- **URL Pattern**: `crates.io/crates/{crate-name}`
- **Badges**: Version, Total Downloads, Recent Downloads
- **Commands**: `cargo add`, Cargo.toml dependency

## Shields.io Badge URLs

### NPM
```
Version: https://img.shields.io/npm/v/{package-name}?style=flat-square&logo=npm
Downloads: https://img.shields.io/npm/dt/{package-name}?style=flat-square&logo=npm&label=downloads
Monthly: https://img.shields.io/npm/dm/{package-name}?style=flat-square&logo=npm&label=downloads/month
```

### NuGet
```
Version: https://img.shields.io/nuget/v/{PackageId}?style=flat-square&logo=nuget
Downloads: https://img.shields.io/nuget/dt/{PackageId}?style=flat-square&logo=nuget&label=downloads
```

### PyPI
```
Version: https://img.shields.io/pypi/v/{package-name}?style=flat-square&logo=pypi
Monthly: https://img.shields.io/pypi/dm/{package-name}?style=flat-square&logo=pypi&label=downloads/month
```

### Maven
```
Version: https://img.shields.io/maven-central/v/{groupId}/{artifactId}?style=flat-square&logo=apache-maven
```

### RubyGems
```
Version: https://img.shields.io/gem/v/{gem-name}?style=flat-square&logo=rubygems
Downloads: https://img.shields.io/gem/dt/{gem-name}?style=flat-square&logo=rubygems&label=downloads
Monthly: https://img.shields.io/gem/dm/{gem-name}?style=flat-square&logo=rubygems&label=downloads/month
```

### Crates.io
```
Version: https://img.shields.io/crates/v/{crate-name}?style=flat-square&logo=rust
Downloads: https://img.shields.io/crates/d/{crate-name}?style=flat-square&logo=rust&label=downloads
Recent: https://img.shields.io/crates/dr/{crate-name}?style=flat-square&logo=rust&label=recent downloads
```

## URL Detection Regex Patterns

```typescript
const urlPatterns = [
  {
    manager: 'npm',
    regex: /npmjs\.com\/package\/(@?[^\/]+(?:\/[^\/]+)?)/,
    groupIndex: 1
  },
  {
    manager: 'nuget',
    regex: /nuget\.org\/packages\/([^\/]+)/,
    groupIndex: 1
  },
  {
    manager: 'pypi',
    regex: /pypi\.org\/project\/([^\/]+)/,
    groupIndex: 1
  },
  {
    manager: 'maven',
    regex: /central\.sonatype\.com\/artifact\/([^\/]+)\/([^\/]+)/,
    groupIndex: [1, 2] // groupId and artifactId
  },
  {
    manager: 'rubygems',
    regex: /rubygems\.org\/gems\/([^\/]+)/,
    groupIndex: 1
  },
  {
    manager: 'crates',
    regex: /crates\.io\/crates\/([^\/]+)/,
    groupIndex: 1
  }
]
```

## TypeScript Interfaces

```typescript
export type PackageManager = 'npm' | 'nuget' | 'pypi' | 'maven' | 'rubygems' | 'crates'

export interface PackageParseResult {
  manager: PackageManager | null
  packageId: string | null // For simple packages
  groupId?: string // For Maven
  artifactId?: string // For Maven
  displayName: string // User-friendly display
  source: 'url' | 'direct'
  error?: string
  message?: string
}

export interface BadgeSet {
  version: {
    markdown: string
    imageUrl: string
  }
  downloads?: {
    markdown: string
    imageUrl: string
  }
  packageUrl: string // Link to package page
}
```
