# Pink Theme Implementation

## Overview
Added a new vibrant pink theme option to the MCP Badge Creator app.

## Color Palette
The pink theme uses the following color scheme:

### Primary Colors
- **Primary Color**: `#ec4899` (Hot Pink)
- **Primary Dark**: `#db2777` (Deeper Pink)
- **Primary Darker**: `#be185d` (Dark Pink)

### Background Gradient
- **Gradient Start**: `#db2777`
- **Gradient Mid**: `#ec4899`
- **Gradient End**: `#be185d`

### Text Colors
- **Text Color**: `#333` (Dark gray)
- **Text Light**: `#666` (Medium gray)
- **Text Lighter**: `#999` (Light gray)

### Background Colors
- **BG White**: `white`
- **BG Light**: `#fdf2f8` (Very light pink)

### Border Colors
- **Border Color**: `#fbcfe8` (Light pink)
- **Border Light**: `#f9a8d4` (Lighter pink)

### Shadow Colors
- **Shadow Color**: `rgba(236, 72, 153, 0.2)`
- **Shadow Light**: `rgba(236, 72, 153, 0.08)`

### Header/Footer Colors
- **Header Text**: `white`
- **Footer Text**: `white`
- **Footer Border**: `rgba(255, 255, 255, 0.2)`

## Theme Description
"Vibrant and fun" - A lively pink theme that brings energy and personality to the badge creator interface.

## Implementation Details
- CSS class: `.theme-pink`
- Theme type value: `'pink'`
- Applied to all pages: Home, MCP Badges, Extensions, Settings
- Uses CSS custom properties for consistent theming
- Follows the same pattern as other themes (green, tron, dark, light)

## Files Modified
1. `src/App.css` - Added `.theme-pink` CSS class with all color variables
2. `src/App.tsx` - Added `'pink'` to ThemeType union and classList management
3. `src/pages/Settings.tsx` - Added pink theme option to theme selector

## Design Decisions
- Chose a vibrant pink (#ec4899) as the primary color for a fun, energetic feel
- Used white text on the gradient header/footer for good contrast
- Light pink background (#fdf2f8) for cards to maintain readability
- Pink-tinted borders and shadows for visual consistency
- Follows the same structure as the green theme (which has a gradient header) rather than the dark theme
