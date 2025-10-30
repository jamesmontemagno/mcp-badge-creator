# CSS Modules Migration Plan

## Overview

Migrate from monolithic `App.css` (~1,945 lines) to CSS Modules architecture with component-level scoping, global design tokens, standardized responsive breakpoints (mobile ≤768px, tablet 769-1024px, desktop ≥1025px), and systematic checkpoint validation.

## Objectives

1. **Component-level scoping**: Split CSS into `.module.css` files for better maintainability and preventing className collisions
2. **Global design system**: Centralize theme variables, spacing scale, shadows, border radii, and brand colors
3. **Standardized breakpoints**: Consolidate responsive styles to 3 breakpoints (mobile ≤768px, tablet 769-1024px, desktop ≥1025px)
4. **External SVG assets**: Replace hardcoded SVG data URIs with external files that adapt to themes
5. **Reusable components**: Extract common patterns (buttons, cards, forms) into shared modules
6. **Brand-specific colors**: Add CSS variables for IDE/platform brand colors (VS Code blue, VS Code Insiders green, etc.)

## Design Decisions

### 1. Theme Variables: Global `:root` Scope
- **Decision**: Keep themes in global `:root` (not wrapped in CSS Modules)
- **Rationale**: Easy access across all components, simpler theme switching logic, maintains existing theme architecture

### 2. Utility Classes: Global `utilities.css`
- **Decision**: Create global utilities for flex helpers, spacing, text alignment
- **Rationale**: Frequently used across components, reduces duplication, follows utility-first patterns

### 3. SVG Icons: External Files
- **Decision**: Replace hardcoded SVG data URIs with external `.svg` files
- **Rationale**: Enables theme-aware coloring via `currentColor`, easier maintenance, better performance

### 4. Brand Colors: CSS Variables in `tokens.css`
- **Decision**: Add brand-specific CSS variables (`--vscode-blue`, `--vscode-insiders-green`, etc.)
- **Rationale**: Centralized color management, easy to update, consistent across components

## File Structure

```
src/
├── styles/
│   ├── tokens.css              (Global: spacing, shadows, radius, brand colors, breakpoints)
│   ├── themes.css              (Global: 5 theme definitions with CSS variables)
│   ├── utilities.css           (Global: flex helpers, text alignment, visibility)
│   └── components/
│       ├── Button.module.css   (Reusable button variants)
│       ├── Card.module.css     (Reusable card patterns)
│       ├── Form.module.css     (Form controls, inputs, selects, alerts)
│       └── Badge.module.css    (Badge preview, markdown output components)
├── assets/
│   └── icons/
│       ├── chevron-down.svg    (Select dropdown arrow)
│       └── hamburger.svg       (Mobile menu icon)
├── App.module.css              (App layout: shell, nav, header, footer)
├── pages/
│   ├── Home.module.css         (Home page specific styles)
│   ├── MCP.module.css          (MCP page: IDE cards, platform checkboxes, tabs)
│   ├── Extensions.module.css   (Extensions page specific styles)
│   ├── Packages.module.css     (Packages page: form, preview, commands)
│   └── Settings.module.css     (Settings page: theme options, toggles)
└── index.css                   (Global resets + imports)
```

## CSS Variable Architecture

### Design Tokens (`tokens.css`)

```css
:root {
  /* Spacing Scale */
  --space-xs: 0.25rem;    /* 4px */
  --space-sm: 0.5rem;     /* 8px */
  --space-md: 1rem;       /* 16px */
  --space-lg: 1.5rem;     /* 24px */
  --space-xl: 2rem;       /* 32px */
  --space-2xl: 3rem;      /* 48px */
  --space-3xl: 4rem;      /* 64px */

  /* Shadow Scale */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  /* Border Radius Scale */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  /* Breakpoints (for reference in media queries) */
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 769px;
  --breakpoint-desktop: 1025px;

  /* Brand Colors - IDE/Platform Specific */
  --vscode-blue: #0098FF;
  --vscode-insiders-green: #24bfa5;
  --visual-studio-purple: #C16FDE;
  --cursor-blue: #0078D4;
  --goose-green: #10B981;
  --lm-studio-orange: #FF6B35;
}
```

### Theme Variables (`themes.css`)

Existing 17 CSS variables per theme remain unchanged:
- `--primary-color`, `--primary-dark`, `--primary-darker`
- `--bg-gradient-start`, `--bg-gradient-mid`, `--bg-gradient-end`
- `--text-color`, `--text-light`, `--text-lighter`
- `--bg-white`, `--bg-light`
- `--border-color`, `--border-light`
- `--shadow-color`, `--shadow-light`
- `--header-text`, `--footer-text`, `--footer-border`

5 themes: `:root` (default green), `.theme-light`, `.theme-dark`, `.theme-green`, `.theme-tron`

### Utility Classes (`utilities.css`)

```css
/* Flexbox Utilities */
.flex-row { display: flex; flex-direction: row; }
.flex-col { display: flex; flex-direction: column; }
.flex-grow { flex-grow: 1; }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }
.gap-lg { gap: var(--space-lg); }

/* Text Alignment */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* Visibility */
.hidden { display: none; }
.sr-only { /* Screen reader only styles */ }
```

## Implementation Phases

### Phase 1: Foundation - Create Global Design System

**Files to Create:**
1. `src/styles/tokens.css` - Spacing, shadows, radius, brand colors, breakpoints
2. `src/styles/themes.css` - Extract lines 5-113 from `App.css` (5 theme definitions)
3. `src/styles/utilities.css` - Flex helpers, text alignment, visibility utilities
4. Update `src/index.css` - Add imports for all three global files

**Tasks:**
- [ ] Create `src/styles/` directory
- [ ] Create `tokens.css` with spacing scale (xs through 3xl)
- [ ] Create `tokens.css` with shadow scale (sm through xl)
- [ ] Create `tokens.css` with radius scale (sm through xl)
- [ ] Create `tokens.css` with breakpoint constants
- [ ] Create `tokens.css` with brand color variables (VS Code, Insiders, VS, Cursor, Goose, LM Studio)
- [ ] Create `themes.css` by copying theme sections from `App.css` lines 5-113
- [ ] Create `utilities.css` with flex utilities (`.flex-row`, `.flex-col`, `.flex-grow`, `.gap-*`)
- [ ] Create `utilities.css` with text alignment utilities
- [ ] Update `src/index.css` to import `tokens.css`, `themes.css`, `utilities.css`

**Checkpoint Validation:**
- [ ] Build succeeds without errors
- [ ] All 5 themes apply correctly (test theme switcher in Settings)
- [ ] Brand color CSS variables accessible in browser DevTools
- [ ] Utility classes work when added to test element

---

### Phase 2: Replace SVG Data URIs with External Files

**Files to Create:**
1. `src/assets/icons/chevron-down.svg` - Select dropdown arrow with `fill="currentColor"`
2. `src/assets/icons/hamburger.svg` - Mobile menu icon with `fill="currentColor"`

**Files to Update:**
- `src/styles/components/Form.module.css` - Update select background-image to use external SVG

**Tasks:**
- [ ] Create `src/assets/icons/` directory
- [ ] Create `chevron-down.svg` with `<path fill="currentColor">` for theme adaptation
- [ ] Create `hamburger.svg` with `<path fill="currentColor">` for theme adaptation
- [ ] Update Form module CSS to reference external SVG: `background-image: url('../../assets/icons/chevron-down.svg')`
- [ ] Test SVG color inheritance using CSS `filter` or `mask` properties if needed
- [ ] Remove hardcoded SVG data URIs from original `App.css` lines 618-630

**Checkpoint Validation:**
- [ ] Select dropdowns display chevron correctly in all themes
- [ ] Chevron color adapts to theme (dark themes show light chevron)
- [ ] Mobile hamburger menu icon displays correctly
- [ ] No hardcoded colors in SVG files (uses `currentColor`)

---

### Phase 3: Shared Component Modules

**Files to Create:**
1. `src/styles/components/Button.module.css`
2. `src/styles/components/Card.module.css`
3. `src/styles/components/Form.module.css`
4. `src/styles/components/Badge.module.css`

**Source Mapping from `App.css`:**
- **Button.module.css**: Lines 468-493 (`.btn`, `.btnPrimary`), 829-843 (`.copyBtn`), 1631-1649 (`.resetButton`)
- **Card.module.css**: Lines 360-391 (`.homeCard`), 714-808 (`.ideCard` patterns)
- **Form.module.css**: Lines 692-739 (`.formGroup`, `.label`, `.input`, `.select`, `.fieldHint`), 487-515 (`.formAlert`)
- **Badge.module.css**: Lines 944-1016 (`.badgePreview`, `.markdownOutput`, `.outputHeader`)

**Tasks:**
- [ ] Create `src/styles/components/` directory
- [ ] Create `Button.module.css` with `.btn`, `.btnPrimary`, `.btnSecondary` base classes
- [ ] Add `.copyBtn` styles to Button module (from lines 829-843)
- [ ] Add `.resetButton` styles to Button module (from lines 1631-1649)
- [ ] Create `Card.module.css` with `.card`, `.cardHover`, `.cardActive` base patterns
- [ ] Create `Form.module.css` with `.formGroup`, `.label`, `.input`, `.select` (lines 692-739)
- [ ] Add `.fieldHint` to Form module (line 734-739)
- [ ] Add `.checkboxGroup`, `.checkboxLabel` to Form module (lines 742-760)
- [ ] Add `.formRow` to Form module (from Packages page, lines 1711-1715)
- [ ] Add `.formAlert`, `.formAlertError`, `.formAlertSuccess` to Form module (lines 487-515)
- [ ] Create `Badge.module.css` with `.badgePreview`, `.markdownOutput`, `.outputHeader`, `.configOutput`
- [ ] Replace magic numbers with CSS variables (use `var(--space-*)`, `var(--radius-*)`, `var(--shadow-*)`)

**Checkpoint Validation:**
- [ ] `npm run build` succeeds without errors
- [ ] No TypeScript errors in terminal
- [ ] CSS Modules generate scoped class names (check `.module.css.d.ts` files if using TypeScript CSS Modules plugin)
- [ ] Visual inspection: Buttons, cards, forms render with correct base styles

---

### Phase 4: Layout Migration - App.module.css

**Files to Create:**
1. `src/App.module.css`

**Files to Update:**
- `src/App.tsx` - Import CSS module, convert classNames to scoped references

**Source Mapping from `App.css`:**
- Lines 134-269: `.appShell`, `.appTopBar`, `.brand`, `.brandMark`, `.brandText`, `.appNav`, `.navLink`, `.hamburgerButton`, `.appMain`
- Lines 272-328: Mobile responsive styles (consolidate into single media query)

**Tasks:**
- [ ] Create `src/App.module.css`
- [ ] Extract `.appShell` styles (lines 134-137)
- [ ] Extract `.appTopBar` styles (lines 140-150)
- [ ] Extract `.brand`, `.brandMark`, `.brandText` styles (lines 153-173)
- [ ] Extract `.appNav` styles (lines 176-180)
- [ ] Extract `.navLink`, `.navLinkActive` styles (lines 205-230)
- [ ] Extract `.hamburgerButton`, `.hamburgerLine` styles (lines 184-202)
- [ ] Extract `.settingsLink`, `.settingsIcon`, `.settingsLabel` styles (lines 240-261)
- [ ] Extract `.appMain` styles (lines 264-269)
- [ ] Consolidate mobile responsive styles into single `@media (max-width: 768px)` block at file end
- [ ] Update `src/App.tsx`: Add `import styles from './App.module.css'`
- [ ] Convert all className strings to scoped references: `className={styles.appShell}`
- [ ] Handle active state composition: `className={\`${styles.navLink} ${isActive ? styles.navLinkActive : ''}\`}`
- [ ] Replace inline hamburger icon with external SVG reference

**Checkpoint Validation:**
- [ ] Navigation renders correctly on desktop (horizontal nav bar)
- [ ] Navigation renders correctly on mobile (hamburger menu, collapsible)
- [ ] Hamburger menu toggles open/closed on click
- [ ] Active nav link highlights correctly
- [ ] Theme classes still apply globally (test theme switching)
- [ ] Settings gear icon displays and links to Settings page
- [ ] Brand logo displays correctly

---

### Phase 5: Simple Page - Home.module.css

**Files to Create:**
1. `src/pages/Home.module.css`

**Files to Update:**
- `src/pages/Home.tsx` - Import CSS module, convert classNames

**Source Mapping from `App.css`:**
- Lines 332-427: Home page styles

**Tasks:**
- [ ] Create `src/pages/Home.module.css`
- [ ] Extract `.homePage` styles (lines 332-335)
- [ ] Extract `.homeHero` styles (lines 338-341)
- [ ] Extract `.homeOverline` styles (lines 344-349)
- [ ] Extract `.homeSubtitle` styles (lines 358-363)
- [ ] Extract `.homeCardGrid` styles (lines 366-370)
- [ ] Extract `.homeCard` styles (lines 373-391)
- [ ] Extract `.homeCardIcon` styles (lines 394-396)
- [ ] Extract `.homeCardContent` styles (lines 399-408)
- [ ] Extract `.cardCta` styles (lines 411-416)
- [ ] Extract `.cardMcp`, `.cardExtensions` gradient styles (lines 434-443)
- [ ] Consolidate responsive styles to single `@media (max-width: 768px)` block at file end (lines 419-423)
- [ ] Update `src/pages/Home.tsx`: Add `import styles from './Home.module.css'`
- [ ] Convert all className strings to scoped references
- [ ] Test className composition for card variants: `className={\`${styles.homeCard} ${styles.cardMcp}\`}`

**Checkpoint Validation:**
- [ ] Home page renders correctly
- [ ] Hero section displays with correct typography
- [ ] Navigation cards display in grid (2 columns on desktop)
- [ ] Cards are clickable and link to correct routes
- [ ] Hover effects work on cards
- [ ] Mobile responsive: Cards stack vertically on ≤768px
- [ ] Gradient backgrounds on cards display correctly

---

### Phase 6: Medium Complexity - Extensions.module.css

**Files to Create:**
1. `src/pages/Extensions.module.css`

**Files to Update:**
- `src/pages/Extensions.tsx` - Import CSS modules (page + shared components)

**Source Mapping from `App.css`:**
- Lines 427-557: Extensions page styles

**Tasks:**
- [ ] Create `src/pages/Extensions.module.css`
- [ ] Extract `.extensionsPage` styles (lines 427-432)
- [ ] Extract `.extensionsHeader` styles (lines 435-438)
- [ ] Extract `.eyebrow` styles (lines 441-447)
- [ ] Extract `.subtitle` styles (lines 450-451)
- [ ] Extract `.extensionsForm` styles (lines 454-465)
- [ ] Extract `.extensionsOutput` styles (lines 518-520)
- [ ] Extract `.markdownColumns` styles (lines 523-526)
- [ ] Extract `.markdownCard`, `.combinedMarkdown` styles (lines 531-536)
- [ ] Extract `.extensionsPreview`, `.extensionsPreviewRow` styles (lines 539-547)
- [ ] Consolidate responsive styles to `@media (max-width: 768px)` block (lines 554-557)
- [ ] Update `src/pages/Extensions.tsx`: Import page CSS module + shared Button/Form modules
- [ ] Convert all className strings to scoped references
- [ ] Import and use shared component classes: `import buttonStyles from '../styles/components/Button.module.css'`
- [ ] Compose shared button classes: `className={buttonStyles.btnPrimary}`

**Checkpoint Validation:**
- [ ] Extensions page renders correctly
- [ ] Form displays with proper layout
- [ ] Extension badge generation works (submit form, see output)
- [ ] Copy buttons functional (click to copy markdown)
- [ ] Badge preview displays correctly
- [ ] Markdown output sections render
- [ ] Mobile responsive: Form fields stack vertically
- [ ] Alert messages display (error and success states)

---

### Phase 7: Complex Pages - MCP, Packages, Settings

**Files to Create:**
1. `src/pages/MCP.module.css`
2. `src/pages/Packages.module.css`
3. `src/pages/Settings.module.css`

**Files to Update:**
- `src/pages/MCP.tsx` - Import CSS module, remove inline styles, convert classNames
- `src/pages/Packages.tsx` - Import CSS module, convert classNames
- `src/pages/Settings.tsx` - Import CSS module, convert classNames

#### MCP Page Migration

**Source Mapping from `App.css`:**
- Lines 560-1135: MCP page styles (forms, IDE cards, platform checkboxes, tabs, README sections)

**Tasks:**
- [ ] Create `src/pages/MCP.module.css`
- [ ] Extract `.mcpPage` header styles (lines 560-582)
- [ ] Extract `.headerContent` styles (lines 566-570)
- [ ] Extract `.themeSwitch`, `.themeLabel`, `.themeSelectorContainer`, `.themeSelect` (lines 586-659)
- [ ] Extract form section styles: `.content`, `.formSection`, `.outputSection` (lines 662-681)
- [ ] Extract `.ideCardsGrid` styles (lines 764-773)
- [ ] Extract `.ideCard` styles with hover/active states (lines 776-814)
- [ ] Create brand-specific icon classes using CSS variables:
  - `.ideCardIconVscode { backgroundColor: var(--vscode-blue); }`
  - `.ideCardIconInsiders { backgroundColor: var(--vscode-insiders-green); }`
  - `.ideCardIconVs { backgroundColor: var(--visual-studio-purple); }`
  - `.ideCardIconCursor { backgroundColor: var(--cursor-blue); }`
  - `.ideCardIconGoose { backgroundColor: var(--goose-green); }`
  - `.ideCardIconLmStudio { backgroundColor: var(--lm-studio-orange); }`
- [ ] Extract `.ideCardToggle`, `.toggleDot` toggle switch styles (lines 873-919)
- [ ] Extract platform checkbox styles: `.platformCheckbox`, `.readmePlatformsGrid`, `.sectionHeader`, `.selectAllToggle` (lines 1096-1330)
- [ ] Extract tabs styles: `.tabs`, `.tab`, `.tabActive` (lines 1057-1083)
- [ ] Extract `.readmePreview` styles (lines 1086-1092)
- [ ] Consolidate responsive styles to standardized breakpoints (768px, 1024px)
- [ ] Update `src/pages/MCP.tsx`: Import CSS module
- [ ] Remove all inline `style={{ backgroundColor: '#...' }}` from IDE card icons
- [ ] Replace with scoped class composition: `className={styles.ideCardIconVscode}`
- [ ] Convert all other className strings to scoped references

**Checkpoint Validation:**
- [ ] MCP page renders correctly
- [ ] Form displays and accepts input
- [ ] IDE card selection works (click to toggle)
- [ ] IDE card icons display with correct brand colors
- [ ] Platform checkboxes work (individual + select all)
- [ ] Tabs switch between "Badges & Config" and "Getting Started README"
- [ ] Badge preview displays generated badges
- [ ] Markdown output sections render
- [ ] JSON config displays
- [ ] Copy buttons functional
- [ ] Mobile responsive: IDE cards stack, form adjusts

#### Packages Page Migration

**Source Mapping from `App.css`:**
- Lines 1668-1947: Packages page styles

**Tasks:**
- [ ] Create `src/pages/Packages.module.css`
- [ ] Extract `.packagesPage` styles (lines 1672-1673)
- [ ] Extract `.packagesHeader` styles (lines 1676-1698)
- [ ] Extract `.packagesForm` styles (lines 1703-1802)
- [ ] Extract `.formRow` styles (lines 1711-1715)
- [ ] Extract `.mavenFields` styles (lines 1768-1776)
- [ ] Extract `.packagesOutput` styles (lines 1807-1808)
- [ ] Extract `.packagesPreview` styles (lines 1811-1823)
- [ ] Extract `.badgePreviewGrid` styles (lines 1826-1855)
- [ ] Extract `.combinedSection` styles (lines 1858-1863)
- [ ] Extract `.installationSection` styles (lines 1866-1874)
- [ ] Extract `.commandBlocks` styles (lines 1877-1899)
- [ ] Consolidate responsive styles to `@media (max-width: 768px)` and `@media (max-width: 480px)` blocks (lines 1903-1947)
- [ ] Update `src/pages/Packages.tsx`: Import CSS module + shared component modules
- [ ] Convert all className strings to scoped references
- [ ] Use shared Form component classes where applicable

**Checkpoint Validation:**
- [ ] Packages page renders correctly
- [ ] Form displays with package input and manager selector
- [ ] Maven-specific fields show/hide based on selection
- [ ] Badge generation works (submit form, see badges)
- [ ] Badge preview displays version + download badges
- [ ] Multiple markdown output sections render
- [ ] Combined markdown section displays all badges
- [ ] Installation commands section displays
- [ ] Copy buttons functional for all sections
- [ ] Mobile responsive: Form adjusts, badges stack

#### Settings Page Migration

**Source Mapping from `App.css`:**
- Lines 1334-1665: Settings page styles

**Tasks:**
- [ ] Create `src/pages/Settings.module.css`
- [ ] Extract `.settingsPage` styles (lines 1334-1337)
- [ ] Extract `.settingsHeader` styles (lines 1340-1349)
- [ ] Extract `.settingsGrid` styles (lines 1352-1355)
- [ ] Extract `.settingsCard` styles (lines 1358-1371)
- [ ] Extract `.settingsDescription` styles (lines 1374-1377)
- [ ] Extract `.themeOptions`, `.themeOption` styles (lines 1381-1425)
- [ ] Extract `.settingGroup`, `.settingLabel`, `.settingHint` styles (lines 1429-1449)
- [ ] Extract toggle switch styles: `.settingToggle`, `.toggleSlider` (lines 1453-1510)
- [ ] Extract `.durationControl`, `.durationValue` styles (lines 1514-1554)
- [ ] Extract `.settingInput` styles (lines 1558-1572)
- [ ] Extract `.badgePreviewSample`, `.previewLabel` styles (lines 1576-1594)
- [ ] Extract `.settingsAbout`, `.aboutInfo`, `.aboutLinks` styles (lines 1598-1627)
- [ ] Extract `.resetButton` styles (lines 1631-1649)
- [ ] Consolidate responsive styles to `@media (max-width: 768px)` block (lines 1653-1665)
- [ ] Update `src/pages/Settings.tsx`: Import CSS module
- [ ] Convert all className strings to scoped references

**Checkpoint Validation:**
- [ ] Settings page renders correctly
- [ ] Settings cards display in grid layout
- [ ] Theme selector displays all 5 options (system, light, dark, green, tron)
- [ ] Theme selection works (radio buttons functional)
- [ ] Theme changes apply immediately
- [ ] Toggle switches work (copy notifications, etc.)
- [ ] Duration slider works and displays value
- [ ] Badge text input works
- [ ] Badge preview sample displays
- [ ] About section displays with links
- [ ] Reset to defaults button works
- [ ] Mobile responsive: Settings cards stack vertically

---

### Phase 8: Cleanup and Production Validation

**Files to Delete:**
- `src/App.css` (after confirming all styles migrated)

**Tasks:**
- [ ] Verify all pages and components migrated to CSS Modules
- [ ] Delete `src/App.css`
- [ ] Run `npm run build` to create production bundle
- [ ] Check for unused CSS warnings in build output
- [ ] Run `npm run lint` and fix any linting issues
- [ ] Verify no console errors in browser (all routes)

**Comprehensive Testing Matrix:**

Test all **5 themes × 3 breakpoints = 15 scenarios**:

| Theme | Mobile (≤768px) | Tablet (769-1024px) | Desktop (≥1025px) |
|-------|----------------|---------------------|-------------------|
| System | ✅ | ✅ | ✅ |
| Light | ✅ | ✅ | ✅ |
| Dark | ✅ | ✅ | ✅ |
| Green | ✅ | ✅ | ✅ |
| Tron | ✅ | ✅ | ✅ |

**Test Checklist Per Theme/Breakpoint:**
- [ ] Navigation displays correctly (desktop: horizontal, mobile: hamburger)
- [ ] Home page cards display and are clickable
- [ ] MCP page: Form works, IDE cards toggle, badges generate
- [ ] Extensions page: Form works, badges generate, copy buttons functional
- [ ] Packages page: Form works, badges generate, commands display
- [ ] Settings page: Theme selector works, toggles functional
- [ ] All text readable (proper contrast)
- [ ] All interactive elements clickable/tappable
- [ ] No layout overflow or broken styles
- [ ] Smooth transitions on hover/focus states

**Additional Validation:**
- [ ] No className collisions between modules
- [ ] Theme CSS variables accessible across all modules (test in DevTools)
- [ ] No hardcoded colors remaining (search codebase for hex values)
- [ ] All responsive breakpoints use standardized values (768px, 1024px)
- [ ] External SVG icons render and adapt to themes
- [ ] Brand color CSS variables used correctly in IDE cards

**Playwright Tests (if available):**
- [ ] Run `npm test` or `npx playwright test`
- [ ] Verify all E2E tests pass
- [ ] Fix any failing tests related to className changes

**Checkpoint Validation:**
- [ ] Production build succeeds (`npm run build` completes without errors)
- [ ] Build output shows optimized CSS bundle sizes
- [ ] No console errors when running production build locally (`npm run preview`)
- [ ] Visual regression check passed (all pages look correct)
- [ ] Performance: No significant increase in bundle size
- [ ] Accessibility: No regression in keyboard navigation or screen reader support

## Migration Benefits

### Before Migration
- ❌ Single 1,945-line CSS file
- ❌ Global namespace (className collisions possible)
- ❌ Scattered media queries (11 different breakpoints)
- ❌ Hardcoded colors in SVG data URIs
- ❌ Magic numbers for spacing/shadows
- ❌ Difficult to find styles for specific components

### After Migration
- ✅ Modular CSS architecture (10+ scoped files)
- ✅ Component-level scoping (no className collisions)
- ✅ Standardized breakpoints (3 consistent values)
- ✅ Theme-aware external SVG icons
- ✅ Centralized design tokens (spacing, shadows, colors)
- ✅ Easy to locate and modify component styles
- ✅ Better maintainability and scalability
- ✅ Improved developer experience

## Rollback Plan

If issues arise during migration:

1. **Phase 1-2 Issues**: Revert global style files, restore original `App.css` import in `index.css`
2. **Phase 3-4 Issues**: Keep shared component modules, revert layout migration, restore `App.css` for app shell
3. **Phase 5-7 Issues**: Revert specific page module, restore original `App.css` for that page's styles
4. **Phase 8 Issues**: Restore `App.css` from git history, remove CSS module imports

**Git Strategy:**
- Commit after each phase checkpoint
- Use feature branch: `git checkout -b css-modules-migration`
- Merge to main only after Phase 8 complete

## Notes

- **CSS Modules naming convention**: Use camelCase for class names in `.module.css` files (e.g., `.appShell`, `.navLink`)
- **Composing classes**: Use template literals: `className={\`${styles.base} ${styles.variant}\`}`
- **Global classes**: Can still use global classes from `utilities.css` alongside scoped classes
- **Theme variables**: Accessible in all CSS files via `var(--variable-name)` (no import needed)
- **TypeScript support**: Consider adding `typescript-plugin-css-modules` for auto-generated `.d.ts` files

## Success Criteria

✅ All pages render correctly in production build  
✅ All 5 themes work across all pages  
✅ All 3 breakpoints display correctly  
✅ No hardcoded colors or magic numbers  
✅ No className collisions  
✅ Build size comparable or smaller than original  
✅ Developer experience improved (easier to find/edit styles)  
✅ All interactive features functional  
✅ No accessibility regressions  
✅ Clean production build with no warnings  

---

**Migration Start Date**: TBD  
**Estimated Duration**: 2-3 days (with checkpoints)  
**Status**: Planning Complete - Ready for Implementation
