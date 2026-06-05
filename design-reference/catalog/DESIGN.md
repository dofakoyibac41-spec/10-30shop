---
name: Editorial Brutalism
colors:
  surface: '#121314'
  surface-dim: '#121314'
  surface-bright: '#393939'
  surface-container-lowest: '#0d0e0f'
  surface-container-low: '#1b1c1c'
  surface-container: '#1f2020'
  surface-container-high: '#292a2a'
  surface-container-highest: '#343535'
  on-surface: '#e4e2e2'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e4e2e2'
  inverse-on-surface: '#303031'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#303030'
  tertiary-container: '#e4e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474747'
  background: '#121314'
  on-background: '#e4e2e2'
  surface-variant: '#343535'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 80px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 24px
  section-gap: 120px
---

## Brand & Style

The brand identity is built on the intersection of technical precision and high-fashion editorial aesthetics. It targets a discerning audience that values scarcity, structural integrity, and a "post-luxury" streetwear sensibility. 

The design style is a fusion of **Minimalism** and **Brutalism**. It utilizes a monochromatic palette to strip away distractions, focusing entirely on silhouette, texture (via imagery), and typography. The interface should feel like a physical fashion lookbook—stark, intentional, and unapologetically sharp. Every element is governed by a strict grid, evoking a sense of architectural permanence.

## Colors

This design system utilizes a high-contrast monochromatic palette to establish an atmosphere of exclusivity. 

- **Primary (Pure White):** Reserved for high-priority actions, highlights, and active states. It acts as a beacon against the matte surroundings.
- **Secondary (Surface):** A deep charcoal used for card backgrounds and container surfaces to provide subtle separation from the background.
- **Tertiary (Borders):** A structured grey used for all 1px strokes, defining the architecture of the UI without breaking the dark aesthetic.
- **Neutral (Secondary Text):** A muted grey for metadata, labels, and less critical information to maintain a clear visual hierarchy.
- **Background:** A deep matte black that serves as the canvas for the entire experience.

## Typography

The typography is the primary driver of the visual narrative. 

**Space Grotesk** is used for all headlines. It should be set with tight letter-spacing to create a "locked" and technical appearance. Large-scale headings (XL) are meant to be intrusive and commanding, often breaking across lines to create an editorial layout.

**Inter** provides a functional counterpoint. It is used for all body copy and utility labels to ensure maximum legibility against the dark background. Labels should frequently use uppercase with increased letter-spacing to mimic industrial tagging and garment labeling.

## Layout & Spacing

The layout philosophy is defined by "Generous Whitespace." Large gaps between sections (Section-Gap) are intentional, creating a sense of luxury through "wasted" space.

- **Grid:** Use a 12-column fixed grid for desktop. Content should often be offset or centered within a narrow column span (e.g., 6 or 8 columns) to increase side margins.
- **Rhythm:** All spacing must be a multiple of 8px. 
- **Reflow:** On mobile, margins reduce to 24px, and vertical spacing remains aggressive to maintain the editorial rhythm. Elements should stack vertically with no corner rounding, maintaining the "wall-to-wall" structural look.

## Elevation & Depth

This design system avoids traditional shadows. Depth is achieved through **Tonal Layering** and **High-Contrast Outlines**.

1. **Background:** Level 0 (#111111).
2. **Surfaces:** Level 1 (#1A1A1A). Surfaces do not "float"; they are docked or separated by 1px borders (#2E2E2E).
3. **Active State:** Depth is signaled by a transition to a white border or a subtle white outer glow (5px blur, low opacity) to simulate a light source hitting a physical edge.

All elements are treated as flat, physical objects. Visual hierarchy is dictated by size and contrast rather than Z-axis elevation.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Every UI element—from primary buttons to image containers and input fields—must feature 90-degree corners. This evokes a sense of architectural precision and uncompromising industrial design. There are no exceptions for icons or avatars; all containers remain rectangular or square.

## Components

### Buttons
- **Primary:** Solid #F0F0F0 background with #111111 text. 0px radius.
- **Secondary/Ghost:** Transparent background, 1px solid #2E2E2E border. 
- **Hover State:** For all buttons, transition the border color to #FFFFFF and apply a 0.25s ease-in-out transition.

### Input Fields
- **Styling:** 1px solid bottom border only (#2E2E2E). Background remains transparent.
- **Focus:** The bottom border transitions to #FFFFFF.

### Cards & Containers
- **Styling:** 1px solid #2E2E2E border. Background can be #1A1A1A or transparent depending on the content density.
- **Images:** All images should be contained within sharp-edged containers. Hovering over a card may trigger a subtle scale-up of the image, but the container must clip the edges strictly.

### Chips & Tags
- **Styling:** Small, rectangular boxes with #2E2E2E borders. Text uses `label-sm` typography (uppercase, tracked out).

### Lists
- Separate list items with a 1px solid #2E2E2E horizontal divider. Ensure generous padding (24px+) between the text and the divider to maintain the airy editorial feel.