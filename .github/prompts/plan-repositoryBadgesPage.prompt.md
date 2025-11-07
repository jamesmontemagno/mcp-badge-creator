# Plan: Repository Badges Page with Inline Color Customization

Add a "Repository" page for generating GitHub repository badges with essential/CI/CD/advanced sections, inline color pickers with reset buttons, clickable workflow chips with checkmarks, and grouped badge preview with display options.

## Steps

### 1. Create badge generation utility

Add `src/utils/repositoryBadge.ts` with:
- `parseRepositoryInput()` - Extract owner/repo from GitHub URLs (github.com/owner/repo) or direct format (owner/repo)
- `generateRepositoryBadges()` - Accept `BadgeConfig[]` with `{type, enabled, customColor, workflowFile}` and return Shields.io markdown with hex colors stripped of `#`
- `validateWorkflowFilename()` - Check `.yml`/`.yaml` extensions
- `getSemanticDefaultColor()` - Return defaults:
  - Green `2ea44f` (workflow/CI)
  - Blue `0969da` (stars/forks)
  - Yellow `dfb317` (license)
  - Orange `ff6f00` (issues)
  - Purple `8957e5` (contributors/release)
  - Gray `6e7681` (language/size/commit)
- Include comprehensive unit tests in `repositoryBadge.test.ts`

### 2. Build Repository page with interactive sections

Create `src/pages/Repository.tsx` following Extensions.tsx patterns with:
- Search/manual input modes
- Three form sections with `.sectionHeader` styling:
  - **Essential Badges**: stars, license, contributors, release
  - **CI/CD Workflows**: clickable workflow chips for ci.yml/test.yml/build.yml/deploy.yml/release.yml/lint.yml that show ✓ checkmark when selected, auto-enable checkbox and populate filename, custom workflow input with real-time `.yml`/`.yaml` validation
  - **Advanced Badges**: forks, issues, language, code size, last commit, repo size
- Each badge row: checkbox, label, right-aligned color picker + reset button (`↺`)
- Output section with:
  - Preview display toggle (Grouped/Flat)
  - Individual markdown cards
  - Combined markdown
- "Request a Badge" button in header

### 3. Style with right-aligned color controls

Create `src/pages/Repository.module.css` with:
- `.sectionHeader` - Match form section styling
- `.badgeCheckboxRow` - Flexbox with `justify-content: space-between` (checkbox+label left, color controls right)
- `.colorControls` - Wrapper for picker+reset (`display: flex; gap: 0.5rem; align-items: center`)
- `.colorPicker` - Styling (`width: 60px; height: 32px; border-radius: 6px`)
- `.resetColorBtn` - Icon button (`width: 28px; height: 28px; border-radius: 50%`)
- `.workflowChips` - Grid with `.workflowChip` hover states and `.workflowChipActive` showing checkmark icon
- `.previewToggle` - Buttons for view switching
- `.previewGrouped` - Section dividers using same header styling
- `.previewFlat` - Horizontal row
- Use CSS variables exclusively

### 4. Integrate navigation

Update `src/App.tsx`:
- Add `{ to: '/repository', label: 'Repository' }` in `navItems` array after Packages
- Add `<Route path="repository" element={<Repository />} />` to Routes

### 5. Create structured issue template

Add `.github/ISSUE_TEMPLATE/badge-request.yml` with:
- YAML form structure
- `name: "Badge Request"`
- `description: "Request a new badge type or feature"`
- `title: "[Badge Request] "`
- `labels: ["enhancement", "badge-request"]`
- Body fields:
  - Badge category dropdown (Repository/Extension/Package/MCP/CLI/IDE/Other)
  - Badge type input
  - Description textarea (required)
  - Example markdown textarea with Shields.io sample placeholder
  - Use case textarea

## Design Decisions

### Finalized Choices
- ✅ Inline color pickers with reset buttons
- ✅ Right-aligned color controls for clean vertical rhythm  
- ✅ Clickable workflow chips with ✓ checkmarks for selected state
- ✅ Grouped preview with consistent section header styling
- ✅ Workflow filename validation (`.yml`/`.yaml`)
- ✅ Semantic default colors per badge type
- ✅ Request a Badge button linking to GitHub issue template

### Badge Organization

**Essential Badges** (Most Common):
- ⭐ Stars - Blue (`0969da`)
- 📄 License - Yellow (`dfb317`)
- 👥 Contributors - Purple (`8957e5`)
- 📦 Release - Purple (`8957e5`)

**CI/CD Workflows** (Dedicated Section):
- ✅ Workflow Status - Green (`2ea44f`)
- Recommended chips: ci.yml, test.yml, build.yml, deploy.yml, release.yml, lint.yml
- Custom workflow filename input

**Advanced Badges** (Optional):
- 🍴 Forks - Blue (`0969da`)
- 🐛 Issues - Orange (`ff6f00`)
- 💻 Language - Gray (`6e7681`)
- 📊 Code Size - Gray (`6e7681`)
- 🕒 Last Commit - Gray (`6e7681`)
- 💾 Repo Size - Gray (`6e7681`)

### UX Patterns

**Workflow Chip Interaction**:
1. User clicks workflow chip (e.g., "ci.yml")
2. Chip shows ✓ checkmark and active styling
3. Workflow checkbox auto-enables
4. Filename field auto-populates with workflow name
5. Color picker shows with default green

**Color Customization Flow**:
1. User enables badge via checkbox
2. Color picker appears (right-aligned) with semantic default
3. User can click picker to choose custom color
4. Reset button (↺) restores semantic default
5. Color updates preview in real-time

**Preview Display Options**:
- **Grouped View**: Badges organized by section (Essential/CI/CD/Advanced) with section headers
- **Flat View**: All badges in single horizontal row for compact display

### Technical Requirements

**Shields.io Badge URL Format**:
```
https://img.shields.io/github/{metric}/{owner}/{repo}?style=flat-square&color={HEX_NO_HASH}&logo={icon}
```

**GitHub URLs Supported**:
- `https://github.com/owner/repo`
- `http://github.com/owner/repo`
- `github.com/owner/repo`
- `owner/repo` (direct)

**Workflow Badge Format**:
```
https://img.shields.io/github/actions/workflow/status/{owner}/{repo}/{workflow-file}?style=flat-square&color={HEX}&logo=github
```

**Validation Rules**:
- Workflow filename must end with `.yml` or `.yaml`
- Show inline error if validation fails
- Owner/repo must match GitHub format (alphanumeric, hyphens, underscores)

### Implementation Notes

**State Management Pattern** (from Extensions.tsx):
```typescript
const [inputValue, setInputValue] = useState('')
const [inputMode, setInputMode] = useState<'manual' | 'search'>('search')
const [error, setError] = useState<string | null>(null)
const [badgeConfigs, setBadgeConfigs] = useState<BadgeConfig[]>([])
const [workflowFilename, setWorkflowFilename] = useState('')
const [previewMode, setPreviewMode] = useState<'grouped' | 'flat'>('grouped')
const [copiedBadge, setCopiedBadge] = useState<string | null>(null)
```

**Badge Config Interface**:
```typescript
interface BadgeConfig {
  type: 'stars' | 'forks' | 'issues' | 'license' | 'workflow' | 'contributors' | 'release' | 'language' | 'codeSize' | 'lastCommit' | 'repoSize'
  enabled: boolean
  customColor: string // hex with #
  label?: string // custom label override
  workflowFile?: string // for workflow badges
}
```

**CSS Theming Requirements**:
- ALWAYS use CSS variables (no hardcoded colors)
- Test all 5 themes (System, Light, Dark, Green, Tron)
- Use `var(--primary-color)`, `var(--text-color)`, `var(--bg-white)`, etc.

**Testing Checklist**:
- [ ] Run `npm run lint` (must pass with 0 errors)
- [ ] Run `npm run test:unit:run` (all tests pass)
- [ ] Test URL parsing (GitHub URLs, direct format)
- [ ] Test workflow validation (.yml/.yaml)
- [ ] Test color picker functionality
- [ ] Test reset button restores defaults
- [ ] Test workflow chip interactions
- [ ] Test preview toggle (grouped/flat)
- [ ] Test copy functionality
- [ ] Test all 5 themes
- [ ] Test responsive design (mobile/tablet/desktop)

## Implementation Ready

This plan is complete and ready for implementation with all design decisions finalized.
