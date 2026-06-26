---
name: Executive Precision
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#41484e'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#71787f'
  outline-variant: '#c0c7cf'
  surface-tint: '#1d648e'
  primary: '#004364'
  on-primary: '#ffffff'
  primary-container: '#0d5b85'
  on-primary-container: '#99d2ff'
  inverse-primary: '#91cdfd'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#ffc641'
  on-secondary-container: '#715300'
  tertiary: '#3b4041'
  on-tertiary: '#ffffff'
  tertiary-container: '#535759'
  on-tertiary-container: '#c9ccce'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cae6ff'
  primary-fixed-dim: '#91cdfd'
  on-primary-fixed: '#001e30'
  on-primary-fixed-variant: '#004b70'
  secondary-fixed: '#ffdfa0'
  secondary-fixed-dim: '#f6be39'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#181c1e'
  on-tertiary-fixed-variant: '#434749'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
  success: '#2D8A39'
  info: '#0D5B85'
  warning: '#E67E22'
  surface-dark: '#083B56'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  section-padding-lg: 80px
  section-padding-sm: 48px
---

## Brand & Style

The visual identity of the design system is anchored in **Corporate Modernism**, prioritizing clarity, authority, and reliability. It is designed to serve professionals in human resources and public management who require actionable, high-quality training.

The brand personality is authoritative yet accessible—a "trusted advisor" that simplifies complex bureaucracies. The UI utilizes structured layouts, generous whitespace, and a focused color palette to instill a sense of order and institutional stability. Every element is designed to reduce cognitive load, allowing the educational content to remain the primary focus.

## Colors

The palette is led by **Deep Navy (#0D5B85)**, representing intelligence and formal expertise. This is contrasted by **Executive Gold (#D4A017)**, used exclusively for high-priority calls to action and critical highlights.

- **Primary:** Used for headers, primary navigation, and core branding elements.
- **Secondary (Gold):** Reserved for "urgent" actions like course enrollment or trial starts.
- **Neutral:** A range of cool grays is used for typography and structural borders, ensuring the interface feels modern rather than dated.
- **Backgrounds:** A soft off-white/ice-blue tier (#F4F7F9) is used to differentiate content sections without the harshness of pure white.

## Typography

This design system uses a dual-typeface strategy to balance impact with legibility:
- **Montserrat** (Headlines): Chosen for its geometric precision and confident stance. It should be used for all headings to establish brand authority.
- **Inter** (Body/UI): A highly legible sans-serif designed for screens. It handles dense information—like course descriptions and curriculum lists—with exceptional clarity.

**Scaling Rules:**
On mobile devices, large display headings should scale down by 15-20% to maintain readability within the viewport. Paragraph spacing should remain generous (1.5x - 1.75x font size) to ensure an open, approachable feel.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop (max-width 1200px) and a **Fluid Grid** on mobile.

- **The 8px Rule:** All margins and paddings are multiples of 8px to maintain a rhythmic vertical flow.
- **Sectioning:** Large vertical gaps (80px+) are used between major content blocks (e.g., "Our Courses" vs "Testimonials") to prevent the UI from feeling cluttered.
- **Responsive Behavior:**
  - **Desktop:** 12-column grid with 24px gutters.
  - **Tablet:** 8-column grid with 20px gutters.
  - **Mobile:** 4-column grid with 16px margins.

## Elevation & Depth

To maintain a clean, corporate aesthetic, this design system uses **Tonal Layers** supplemented by **Ambient Shadows**.

1.  **Level 0 (Base):** Light gray or white surfaces (#FFFFFF or #F4F7F9).
2.  **Level 1 (Cards):** Pure white cards with a subtle 1px border (#E1E8ED) and a soft, low-opacity shadow (0px 4px 12px rgba(0,0,0,0.05)).
3.  **Level 2 (Active/Hover):** When an element is interacted with, the shadow deepens and the element may lift slightly (2px translation) to provide tactile feedback.
4.  **Overlays:** High-contrast navy backgrounds (#083B56) are used for "sticky" call-to-action sections and footers to create a strong visual "anchor" at the bottom of pages.

## Shapes

The shape language is **Soft (0.25rem)**. This slight rounding takes the edge off the "stiff" corporate feel, making the brand appear modern and tech-forward without losing its professional seriousness.

- **Buttons & Inputs:** 4px (0.25rem) corner radius.
- **Cards & Containers:** 8px (0.5rem) corner radius for a more prominent, framed appearance.
- **Icons:** Use linear, medium-stroke icons with slightly rounded caps to match the typography's weight.

## Components

### Buttons
- **Primary Action:** Solid Executive Gold (#D4A017) with white or deep navy text. High-contrast and bold.
- **Secondary Action:** Ghost style with Deep Navy (#0D5B85) borders and text.
- **Tertiary:** Text-only with an underline or trailing arrow, used for "Read More" links.

### Input Fields
Clean, outlined boxes with 1px borders. The label should always be visible above the field (using `label-bold` style). On focus, the border transitions to Primary Blue with a subtle outer glow.

### Cards
Cards are the primary vehicle for course listings. They feature a white background, the Level 1 shadow, and a top-accent bar in Primary Blue to denote category or status.

### Chips & Badges
Small, rounded-pill indicators used for "New," "In-Company," or "100% Practical." These use low-saturation background tints of the primary colors to stay subtle.

### Progress Indicators
Used within course modules. A thick, horizontal bar in Primary Blue, providing clear visual feedback of completion status.

---

> **Nota de governança (2026-06-10):** este documento é a fonte canônica de tokens do redesign "Executive Precision" (origem: Google Stitch), **aprovado pelo stakeholder em 2026-06-10**. As 15 telas HTML de referência estão versionadas em `docs/design/executive-precision/screens/` (gate B1 cumprido) — cada story extrai seus critérios de aceite diretamente da tela correspondente (Article IV). Atenção da @architect: o par `secondary-container #ffc641` com texto `on-secondary-container #715300` **reprova WCAG AA** — texto sobre gold deve usar navy escuro dedicado (AC de EP-0.1/EP-0.3). Classes `dark:` presentes nos protótipos são ruído de protótipo — **dark mode foi excluído do produto** (decisão #9 do stakeholder).
