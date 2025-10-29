# Plan: Add Settings Page with Gear Icon Navigation & Mobile Hamburger Menu

**Implement a Settings page with theme and preferences management. Add a gear icon button to the top-right of the navigation bar. Refactor the navigation to use a hamburger menu on mobile (≤768px) that includes Home, MCP Badges, VS Code Extensions, and Settings.**

## Steps

1. **Create `src/pages/Settings.tsx`** with theme selector, copy notification toggle, and other UI preferences in a card-based layout.

2. **Move theme logic to `Layout` component** in `src/App.tsx` — add useState for theme, useEffect to sync localStorage and system preference, and apply theme class to document root.

3. **Add Settings route** to Routes in `src/App.tsx` at path `/settings`.

4. **Create gear icon button** in `src/App.tsx` Layout's `app-top-bar` that links to Settings page with SVG or emoji icon.

5. **Add hamburger menu component** in `src/App.tsx` (mobile-only, hidden on desktop) with three-line icon that toggles visibility of nav items at ≤768px breakpoint.

6. **Update `src/App.css`** with styles for: gear icon button, hamburger toggle button, mobile menu drawer/expanded state, responsive layout adjustments, and smooth transitions.

7. **Add Settings to `navItems`** array so it appears in both desktop nav and mobile menu.

## Implementation Details

### User Preferences

1. **Settings should be in the navigation and icon only** (for desktop)
2. **Include theme selector and smart default preferences** (beyond just theme)
3. **Mobile menu should be hamburger style** for all nav options, including Settings

### Mobile Behavior

- **Breakpoint**: ≤768px
- **Menu style**: Hamburger toggle with stacked navigation items
- **Gear icon**: Appears in both desktop and mobile (part of nav)
- **Responsive**: Navigation items stack vertically in mobile menu, horizontally on desktop

### Theme Options

The Settings page should allow users to choose from:
- System (default)
- Light
- Dark
- Green
- Tron

Theme preference persists to localStorage with key `mcp-badge-theme`.

### Additional Preferences

Beyond theme, consider adding:
- Copy notification duration toggle
- Default badge text customization
- Other UI/UX preferences

## Files to Create

- `src/pages/Settings.tsx` — New Settings page component

## Files to Modify

- `src/App.tsx` — Add theme state, hamburger menu logic, gear icon button, Settings route
- `src/App.css` — Add styles for mobile hamburger menu, gear icon, responsive navigation

## Status

- [ ] Create Settings page component
- [ ] Move theme logic to Layout component
- [ ] Add Settings route
- [ ] Create gear icon button
- [ ] Add hamburger menu component
- [ ] Update CSS styles
- [ ] Add Settings to navItems
- [ ] Test responsive design on mobile
- [ ] Test theme persistence
- [ ] Test hamburger menu functionality
