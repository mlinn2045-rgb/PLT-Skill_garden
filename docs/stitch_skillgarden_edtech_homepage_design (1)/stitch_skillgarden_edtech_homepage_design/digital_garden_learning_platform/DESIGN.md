---
name: Digital Garden Learning Platform
colors:
  surface: '#fbf8ff'
  surface-dim: '#d7d7f8'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2ff'
  surface-container: '#eeecff'
  surface-container-high: '#e7e6ff'
  surface-container-highest: '#e0e0ff'
  on-surface: '#171a31'
  on-surface-variant: '#464651'
  inverse-surface: '#2c2e47'
  inverse-on-surface: '#f1efff'
  outline: '#777683'
  outline-variant: '#c7c5d3'
  surface-tint: '#5155ad'
  primary: '#24277f'
  on-primary: '#ffffff'
  primary-container: '#3c4097'
  on-primary-container: '#b1b4ff'
  inverse-primary: '#bfc1ff'
  secondary: '#2c6a3d'
  on-secondary: '#ffffff'
  secondary-container: '#acefb6'
  on-secondary-container: '#306f41'
  tertiary: '#35342e'
  on-tertiary: '#ffffff'
  tertiary-container: '#4c4a44'
  on-tertiary-container: '#bdbab1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#bfc1ff'
  on-primary-fixed: '#050369'
  on-primary-fixed-variant: '#383c93'
  secondary-fixed: '#aff2b9'
  secondary-fixed-dim: '#94d69e'
  on-secondary-fixed: '#00210b'
  on-secondary-fixed-variant: '#0e5227'
  tertiary-fixed: '#e6e2d9'
  tertiary-fixed-dim: '#cac6be'
  on-tertiary-fixed: '#1c1c16'
  on-tertiary-fixed-variant: '#484740'
  background: '#fbf8ff'
  on-background: '#171a31'
  surface-variant: '#e0e0ff'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter-mobile: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin-mobile: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
---

## Brand & Style
The design system combines enterprise software authority with an organic learning metaphor. It communicates cultivation, continuous personal growth, and institutional rigor without succumbing to rustic novelty or childish gamification. 

The aesthetic is Modern Organic Corporate: crisp information architecture, balanced typography, and structured SaaS components paired with botanical progression indicators, breathing room, and soft natural accents. Interfaces should evoke intellectual clarity, sustained accomplishment, and a calm, distraction-free environment for professional upskilling.

## Colors
The color palette establishes high visual hierarchy by contrasting enterprise deep indigo with botanical growth tones.

- **Primary (`#3C4097`):** Anchors global navigation, primary actions, core brand identity, and key focal interactions. Hover state shifts to `#292C72`.
- **Growth Accent (`#6FAF7B`):** Reserved for active progression states, mastery indicators, milestones, and success states. Supported by a light growth tint (`#DCEFE1`) for badge fills, progress tracks, and highlight states.
- **Warm Neutral Accent (`#F5F1E8`):** Applied to secondary cards, callouts, empty-state containers, and supportive visual backgrounds to introduce warmth against the cooler indigo tones.
- **Canvas & Surface:** Base canvas is set to `#FAFAF7` (warm off-white), while active surfaces and interactive cards utilize pure `#FFFFFF`.
- **Borders & Dividers:** Subtle, structural borders sit at `#E2E4EB`, preventing muddy contrast.
- **Typography & Neutrals:** Primary text relies on `#20223A` (deep navy charcoal) for legibility, with `#6B6D7A` serving secondary metadata, supporting text, and subtle icons.

## Typography
The typographic hierarchy establishes distinct roles: **Plus Jakarta Sans** lends a geometric, approachable presence to headings and primary milestones, while **Inter** delivers neutral, high-density legibility for curricula, dashboards, code blocks, and granular learning content.

- All display and large headings feature tightened tracking (`-0.02em` to `-0.01em`) to create a refined editorial authority.
- Body text prioritizes comfortable reading lengths (60–75 characters per line) with generous line heights to prevent cognitive fatigue during extended study sessions.
- Small labels and growth tags use uppercase or semi-bold weights with slight positive tracking (`+0.02em` to `+0.04em`) to ensure instant recognition at glanceable sizes.

## Layout & Spacing
The layout follows an 8-point harmonic spacing grid structured across responsive breakpoints:

- **Desktop (1200px+):** 12-column grid, max-width of 1360px centered, 32px gutters, 48px outer margins. Supports complex split layouts with persistent left-hand navigation, deep syllabus trees, and interactive garden canvases.
- **Tablet (768px - 1199px):** 8-column grid, 24px gutters, 32px outer margins. Garden sidebars collapse into contextual drawers or sliding panels.
- **Mobile (< 768px):** 4-column grid, 16px gutters, 16px margins. Modular cards stack vertically, and growth metrics convert into sticky bottom-anchored sheets.

Spacing between functional groupings should remain generous (`space-xl` to `space-2xl`), reinforcing an uncluttered mindset. Internal component paddings stay dense (`space-sm` to `space-lg`) to balance structural rigor with modern comfort.

## Elevation & Depth
Elevation conveys a layered digital sanctuary through subtle tinting and diffuse shadows rather than heavy drop shadows:

- **Level 0 (Flat / Canvas):** Applied to the `#FAFAF7` application background. Zero shadow.
- **Level 1 (Default Surface / Interactive Cards):** `#FFFFFF` surface resting above canvas. Shadow: `0 2px 8px -2px rgba(32, 34, 58, 0.04), 0 1px 3px -1px rgba(32, 34, 58, 0.06)`, framed by a 1px solid `#E2E4EB` border.
- **Level 2 (Hover & Raised Tiles):** Raised card state on pointer interaction. Shadow: `0 8px 20px -4px rgba(32, 34, 58, 0.08), 0 3px 6px -2px rgba(32, 34, 58, 0.04)`, border softens to `#D8DAE3`.
- **Level 3 (Overlays & Flyouts):** Dropdowns, syllabus popovers, and contextual action menus. Shadow: `0 16px 32px -6px rgba(32, 34, 58, 0.12), 0 4px 12px -2px rgba(32, 34, 58, 0.06)`.
- **Level 4 (Modals & Focus States):** Full study session dialogs and milestone reveals. Shadow: `0 24px 48px -12px rgba(32, 34, 58, 0.18)`.
- **Growth Bloom Effect:** Special accent elevation for completed stages and garden milestones: a subtle diffused glow of `0 4px 16px 0 rgba(111, 175, 123, 0.24)`.

## Shapes
Geometry uses balanced, contemporary rounded profiles that reinforce growth metaphors while preserving enterprise credibility.

- **Standard Elements (Buttons, Inputs, Badges, Tabs):** 12px radius (`rounded-md` equivalent in this system), providing clean tactile definition.
- **Surface Containers (Course modules, Garden nodes, Dashboard widgets):** 16px radius (`rounded-lg`), grounding major content blocks.
- **Hero Banners, Milestone Modals, & Featured Plots:** 20px radius (`rounded-xl`), creating distinct, friendly anchor points.
- **Indicator Tags & Pill Indicators:** Fully rounded (`9999px`) for quick-scan metadata like skill level, stage tag, or completed status.

## Components

### Buttons
- **Primary:** Background `#3C4097`, text `#FFFFFF`, border-radius 12px. Hover: `#292C72` with subtle transform scale (1.01). Focus ring: 2px offset with `#6FAF7B`.
- **Secondary / Growth Action:** Background `#DCEFE1`, text `#2A5A35`, border-radius 12px. Hover: `#C8E6CF`.
- **Ghost / Outlined:** Background transparent, border 1px solid `#E2E4EB`, text `#20223A`. Hover: background `#FFFFFF`, border `#3C4097`.

### Chips & Badges
- **Status & Growth Tags:** Height 28px, padding 4px 12px, border-radius 9999px. Active/In-Progress uses background `#DCEFE1` with text `#235830`. Category markers use background `#F5F1E8` with text `#5E5B4B`.
- **Filter Chips:** Height 36px, border 1px solid `#E2E4EB`, background `#FFFFFF`. Selected state transitions to `#3C4097` background with white typography.

### Form Inputs & Selects
- Height 44px, padding 0 16px, background `#FFFFFF`, border 1px solid `#E2E4EB`, radius 12px.
- Text color `#20223A`, placeholder color `#8C8E9A`.
- Focus state: border-color `#3C4097`, outer shadow ring `0 0 0 3px rgba(60, 64, 151, 0.15)`.

### Checkboxes & Radio Controls
- Checkbox size 20px, radius 6px, border 1.5px solid `#CCD0DE`. Checked state: background `#6FAF7B`, border `#6FAF7B`, white checkmark vector.
- Radio buttons: 20px circular outline with `#6FAF7B` inner disk on selection.

### Cards & Container Panels
- **Default Card:** Background `#FFFFFF`, border 1px solid `#E2E4EB`, border-radius 16px, padding 24px.
- **Garden Accent Card:** Background `#F5F1E8`, border 1px solid rgba(60, 64, 151, 0.08), border-radius 16px, padding 24px. Used for notes, side quests, and organic mentor tips.

### Lists & Curriculum Trees
- Flat structure with 8px vertical gaps. List items use 12px border radius, 12px 16px internal padding, transitioning to `#F5F6FA` on hover. Active lessons feature a 3px left border accent in `#6FAF7B`.

### Digital Garden Domain Components
- **Growth Progress Bar:** Track height 8px, border-radius 9999px, background `#E2E4EB`. Fill uses continuous gradient from `#6FAF7B` to `#89C795`.
- **Plant Growth Stage Node:** 48px to 64px rounded glyph container (`rounded-lg` or circular) depicting learning milestones (Seedling, Sprout, Bloom, Mature Tree). Incomplete stages have a dashed 1.5px border `#CCD0DE`; active stages have a solid `#6FAF7B` border with `#DCEFE1` fill.
- **Garden Grid Canvas:** Interactive map or skill tree container using an off-white background (`#FAFAF7`) with an ultra-faint dot matrix (`#E2E4EB`), keeping the interface professional, systematic, and organized.