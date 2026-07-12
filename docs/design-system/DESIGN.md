name: Trust Keith
colors:
  primary: "#235875"
  secondary: "#4285f4"
  tertiary: "#2459b3"
  neutral: "#4f5057"
  surface: "#ebebeb"
  text: "#222525"
  text-muted: "#4f5057"
  border: "#ebebeb"
  error: "#ea384c"
  success: "#068466"
  bright-blue-light: "#e0eeff"
  dark-cream: "#c3b6aa"
  light-cream: "#fffaf4"
  lightest-grey: "#fafafa"
typography:
  display-hero:
    fontFamily: "Fraunces"
    fontSize: 3.75rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display-large:
    fontFamily: "Fraunces"
    fontSize: 2.75rem
    fontWeight: 700
    lineHeight: 1.2
  section-heading:
    fontFamily: "Fraunces"
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.25
  subheading-large:
    fontFamily: "Helvetica Neue"
    fontSize: 1.5rem
    fontWeight: 300
    lineHeight: 1.35
  subheading:
    fontFamily: "Helvetica Neue"
    fontSize: 1.25rem
    fontWeight: 400
    lineHeight: 1.4
  body-large:
    fontFamily: "Inter"
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Inter"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Inter"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  button:
    fontFamily: "Inter"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.2
  button-small:
    fontFamily: "Inter"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.1
  link:
    fontFamily: "Inter"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.2
  caption:
    fontFamily: "Inter"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.2
  caption-small:
    fontFamily: "Inter"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.1
rounded:
  none: "0px"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "1rem"
  xl: "1.5rem"
  full: "100rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  "2xl": "3rem"
preview_tokens:
  button_primary_bg: "#235875"
  button_primary_text: "#ffffff"
  button_primary_border: "#235875"
  button_secondary_bg: "rgba(0,0,0,0.05)"
  button_secondary_text: "#222525"
  button_secondary_border: "#ebebeb"
  button_tertiary_text: "#4285f4"
  surface_bg: "#ffffff"
  card_bg: "#ffffff"
  text: "#222525"
  text_muted: "#4f5057"
  border: "#ebebeb"
  accent: "#4285f4"
  button_radius: "6px"
  card_radius: "24px"
  input_radius: "4px"
components:
  button-primary:
    bg: "#235875"
    text: "#ffffff"
    border: "#235875"
    radius: "6px"
    padding: "20px 20px"
    font: "14px Inter weight 500"
    hover_bg: "#194359"
  button-secondary:
    bg: "rgba(0,0,0,0.05)"
    text: "#222525"
    border: "#ebebeb"
    radius: "6px"
    padding: "20px 20px"
    font: "14px Inter weight 500"
    hover_bg: "rgba(0,0,0,0.08)"
  button-ghost:
    bg: "transparent"
    text: "#222525"
    border: "transparent"
    radius: "6px"
    padding: "20px 20px"
    font: "14px Inter weight 500"
  card:
    bg: "#ffffff"
    border: "#ebebeb"
    radius: "24px"
    shadow: "0 2px 16px rgba(0,0,0,0.02), 0 16px 64px rgba(0,0,0,0.5)"
    padding: "32px"
  card-glass:
    bg: "#ffffff"
    border: "#ebebeb"
    radius: "16px"
    shadow: "0 4px 16px rgba(0,0,0,0.08)"
    padding: "28px"
  input-text:
    bg: "#ffffff"
    text: "#222525"
    border: "#ebebeb"
    radius: "0px"
    padding: "8px 12px"
    focus_border: "#4d65ff"
    focus_outline: "0.125rem solid #4d65ff"
  badge-default:
    bg: "#ffffff"
    text: "#222525"
    border: "transparent"
    radius: "100rem"
    padding: "4px 12px"
    font: "14px Inter weight 500"
  nav-header:
    bg: "#ebebeb"
    text: "#222525"
    border_bottom: "#000000"
    height: "auto"
    padding: "16px 20px"
---

## 1. Visual Theme & Atmosphere

Trust Keith projects a professional, premium aesthetic rooted in the **apple-glass** archetype—one that balances meticulous attention to typography and spacing with a generous, breathing layout. The visual language is calm and trustworthy, reflecting the brand's mission to make privacy management accessible and confidence-building. 

The palette anchors on a sophisticated **teal-navy** brand color (`#235875`) paired with a bright, energetic UI blue (`#4285f4`). Supporting this are warm, creamy accents (`#fffaf4`, `#ebddd0`) that humanize the otherwise technical nature of privacy compliance, and a neutral gray scale (`#ebebeb`, `#222525`) that reinforces clarity and legibility.

Typography is layered and purposeful: bold, heavy sans-serif headlines (Fraunces at 700) command attention, while elegant serif subheadings (Helvetica Neue at 300) add sophistication. Body text uses Inter at regular weights, maintaining exceptional readability. Spacing is intentionally roomy—cards breathe at 32px padding, navigation offers ample breathing room—creating a sense that the platform is not cramming complexity at you, but rather orchestrating it with care.

Shadow and depth are used expressively, particularly in cards (dual-layer shadows at 2px and 16px blur offsets) to create a subtle glass-like elevation that suggests layers of intelligent processing happening beneath a clean surface.

**Key Characteristics:**
- Teal-navy brand color used sparingly for trust and authority, bright blue for interactive affordance
- High card radius (24px) creates gentle, approachable surfaces; button radius (6px) stays tight and functional
- Generous whitespace and 1.5–2rem padding signals confidence and openness, not clutter
- Serif subheadings paired with sans-serif body establish hierarchy without formality
- Strong, layered shadow system creates glass-like depth without glassmorphism effects
- Warm cream accents humanize technical functionality
- Typography weight progression (300 → 400 → 500 → 700) is used as a primary design signal, not just emphasis

## 2. Color Palette & Roles

### Primary
- **Trust Keith Teal** (`#235875`): Brand identity anchor, appears in logo, primary CTAs ("Talk to an expert"), and hero emphasis moments. Used sparingly to maintain authority.
- **Keith Dark Blue** (`#194359`): Button hover state, reinforces interactive feedback with darkened teal.

### Secondary Action
- **Bright Blue** (`#4285f4`): Google-inspired blue used for secondary CTAs, links, and interactive highlights across the UI. This is the high-frequency UI accent that drives engagement without competing with brand authority.
- **Bright Blue Dark** (`#2459b3`): Hover state for secondary actions, adds depth and confirms interaction.

### Neutral Scale
- **Dark Gray** (`#222525`): Default body text, high contrast for accessibility.
- **Gray** (`#4f5057`): Secondary text, muted labels, reduced visual weight.
- **Light Gray New** (`#ebebeb`): Navigation backgrounds, borders, dividers, surface contrast.
- **Lightest Gray New** (`#fafafa`): Subtle background tints, alternate row shading.
- **White** (`#ffffff`): Primary surface, card backgrounds, maximum contrast canvas.

### Surface & Depth
- **Light Cream** (`#fffaf4`): Warm, inviting backgrounds for testimonial or featured content sections.
- **Dark Cream** (`#c3b6aa`): Subtle accent or divider in cream-themed contexts.
- **Black with 8% opacity** (`#00000014`): Universal shadow overlay, used for depth and subtle focus rings.

### Interactive & Feedback
- **Success** (`#068466`): Confirmation badges, positive states (shown in green tooltip circles).
- **Error** (`#ea384c`): Alert, destructive action indicators.
- **Light Blue** (`#e0eeff`): Hover background for blue-accented elements, creates subtle visual feedback.

### Color Philosophy
The palette deliberately separates **brand identity** (teal navy, used sparingly) from **UI accent** (bright blue, used frequently). This follows the principle that brand colors anchor perception while UI affordances must be visible and responsive. The warm cream accents soften the technical nature of privacy compliance, humanizing the interface. Grays are used consciously across a seven-step scale—no true black body text, but dark enough for WCAG AA contrast. Shadows are always dark-tinted (never colored), creating a professional glass effect rather than a playful or material-design aesthetic.

## 3. Typography Rules

### Font Family
- **Primary**: Inter (400, 500, 600 weights) — clean, neutral, optimized for UI and body text readability.
- **Serif Accent**: Helvetica Neue (300 weight) — elegant, warm, used for subheadings to add personality and visual hierarchy.
- **Display**: Fraunces (700 weight) — bold, distinctive, anchors hero sections and major headings.
- **Handwriting**: Caveat (700 weight) — optional, accent use only (e.g. testimonial signatures or decorative moments).

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Features | Notes |
|------|------|------|--------|-------------|---|--|
| Display Hero | Fraunces | 60px (3.75rem) | 700 | 1.1 | -0.02em | — | Hero headlines, maximum impact |
| Display Large | Fraunces | 44px (2.75rem) | 700 | 1.2 | -0.02em | — | Section headers, feature callouts |
| Section Heading | Fraunces | 32px (2rem) | 700 | 1.25 | normal | — | Page section breaks |
| Subheading Large | Helvetica Neue | 24px (1.5rem) | 300 | 1.35 | normal | — | Feature descriptions, elegant contrast |
| Subheading | Helvetica Neue | 20px (1.25rem) | 400 | 1.4 | normal | — | Subsection breaks |
| Body Large | Inter | 17px (1.0625rem) | 400 | 1.45 | normal | — | Product descriptions, feature copy |
| Body | Inter | 16px (1rem) | 400 | 1.5 | normal | — | Default body text, standard legibility |
| Body Small | Inter | 14px (0.875rem) | 400 | 1.4 | normal | — | Secondary text, reduced emphasis |
| Button | Inter | 14px (0.875rem) | 500 | 1.2 | normal | — | CTA text, clear affordance |
| Button Small | Inter | 12px (0.75rem) | 500 | 1.1 | normal | — | Secondary buttons, icon labels |
| Link | Inter | 14px (0.875rem) | 500 | 1.2 | normal | — | Inline links, consistent with buttons |
| Caption | Inter | 12px (0.75rem) | 400 | 1.2 | normal | — | Helper text, metadata |
| Caption Small | Inter | 11px (0.6875rem) | 400 | 1.1 | normal | — | Micro labels, timestamps |

**Legacy role names** (for backward compatibility): `h1` → display-hero, `h2` → display-large, `h3` → section-heading, `h4` → subheading, `body-lg` → body-large, `body-md` → body, `body-sm` → body-small, `label` → button, `mono` → not declared (use code-body when needed).

### Principles
- **Weight is hierarchy, not emphasis.** Inter 300 is lighter than Inter 400, which is lighter than 500 and 600. Use weight progression to guide the eye, not bolding or italics.
- **Serif headings slow the reader down intentionally.** Helvetica Neue at 300 weight creates an elegant pause before product descriptions; it signals "this matters, read this carefully."
- **Letter spacing stays tight at display sizes.** Fraunces headlines are tracked normally to -0.02em, keeping them compact and impactful.
- **Line height increases with size reduction.** Body text (16px) gets 1.5, small text (12px) gets 1.2. This counterintuitive spacing improves legibility at small sizes.
- **No all-caps headings.** Trust Keith headings use sentence case (capital first letter only), which is more approachable and readable than shouting.
- **Body text color is dark gray (`#222525`), never pure black.** This reduces eye strain and creates a slightly softer, more premium feel.

## 4. Components

### Buttons

**Primary Button** (`button-primary`)
- Background: `#235875` (teal navy, brand)
- Text: `#ffffff` (white)
- Padding: 20px horizontal, 20px vertical
- Border Radius: 6px (tight, functional)
- Font: 14px Inter, weight 500
- Hover: Background darkens to `#194359` (keith-dark-blue)
- Use: Primary CTA ("Talk to an expert", "Explore Privacy OS", major actions)

**Secondary Button** (`button-secondary`)
- Background: `rgba(0,0,0,0.05)` (subtle black overlay)
- Text: `#222525` (dark gray)
- Border: 1px `#ebebeb` (light gray divider)
- Border Radius: 6px
- Font: 14px Inter, weight 500
- Hover: Background opacity increases to `rgba(0,0,0,0.08)`
- Use: Alternative actions ("See how it works", less critical flows)

**Ghost Button** (`button-ghost`)
- Background: `transparent`
- Text: `#222525` (dark gray)
- Border: none
- Border Radius: 6px
- Font: 14px Inter, weight 500
- Hover: Opacity reduces to .76 or background subtly fills
- Use: Links styled as buttons, navigation, minimal emphasis

### Cards & Containers

**Standard Card** (`card`)
- Background: `#ffffff` (white)
- Border: 1px `#ebebeb` (light gray)
- Border Radius: 24px (generous rounding)
- Padding: 32px (2rem, breathing room)
- Shadow: `0 2px 16px rgba(0,0,0,0.02), 0 16px 64px rgba(0,0,0,0.5)` (dual-layer glass effect)
- Hover: `translateY(-2px)` with opacity `.92` (subtle lift and dim)
- Use: Feature cards, content containers, elevated surfaces (testimonials, case studies)

**Glass Card Variant** (`card-glass`)
- Background: `#ffffff` (white)
- Border: 1px `#ebebeb`
- Border Radius: 16px (slightly less rounded than standard)
- Padding: 28px (slightly less generous)
- Shadow: `0 4px 16px rgba(0,0,0,0.08)` (single, lighter shadow)
- Use: Inline cards, sidebar containers, embedded UI surfaces

### Inputs & Forms

**Text Input** (`input-text`)
- Background: `#ffffff` (white)
- Text: `#222525` (dark gray)
- Border: 1px `#ebebeb` (light gray)
- Border Radius: 0px (square, utilitarian)
- Padding: 8px horizontal, 12px vertical
- Focus State: Outline `0.125rem solid #4d65ff` (bright blue, custom)
- Focus Outline Offset: `0.125rem`
- Font: 14px Inter, regular weight
- Transition: border-color 0.2s ease
- Use: Email, text, search, all form inputs

### Badges & Tags

**Default Badge** (`badge-default`)
- Background: `#ffffff` (white)
- Text: `#222525` (dark gray)
- Border: transparent
- Border Radius: 100rem (fully rounded pill shape)
- Padding: 4px horizontal, 12px vertical (tight, compact)
- Font: 14px Inter, weight 500
- Use: Status labels ("AI Governance"), feature tags, metadata

### Navigation

**Nav Header** (`nav-header`)
- Background: `#ebebeb` (light gray, subtle separation)
- Text: `#222525` (dark gray)
- Border Bottom: 1px `#00000014` (black 8% opacity)
- Padding: 16px vertical, 20px horizontal
- Height: auto (grows with content)
- Font: 14px Inter, weight 500
- Transition: height 0.5s ease (smooth collapse/expand on mobile)
- Use: Top navigation bar, product layout nav, solutions layout nav (variants exist for bg tone)

### Decorative Elements
- **Dividers**: 1px `#ebebeb` solid (light gray), no shadows
- **Focus Rings**: `0.125rem solid #4d65ff` (bright blue outline, strong signal)
- **Shadow Accents**: Always dark (`#0000001f`, `#00000014`) — no colored shadows
- **No Glassmorphism**: The system deliberately avoids `backdrop-filter: blur()`. "Glass" refers to the shadow and radius treatment, not frosted-glass backgrounds.

## 5. Layout Principles

### Spacing System
- **Base unit**: 4px (0.25rem)
- **Scale**: 4px → 8px → 12px → 16px → 20px (1.25rem) → 24px → 32px (2rem) → 48px → 64px (4rem)
- **Common padding**: Cards use 32px (2rem), buttons use 20px, inputs use 8–12px
- **Common margins**: Section separation is 48–64px; component separation is 16–24px

### Grid & Container
- **Max width**: Not explicitly constrained in the CSS vars, but visual layout suggests 1200px–1400px range for hero/content sections
- **Hero pattern**: Full-width image or graphic on light background, with text overlaid or beside (stacked on mobile)
- **Multi-column**: Product feature cards typically 3-column desktop, 1-column mobile, reflow at tablet

### Whitespace Philosophy
Trust Keith's whitespace is a design *choice*, not an absence of content. The "very-roomy" spacing density signal reflects a deliberate decision to give every element room to breathe. This serves two purposes: it makes complex privacy concepts feel less overwhelming, and it reinforces the premium, human-centric positioning (many CTOs and compliance teams get cramped SaaS UIs; generous spacing is a relief). No element is ever "trapped" in a container; padding and margins are always 16px or more.

### Border Radius Scale
- **0px**: Utilitarian inputs, links, text elements (square, no-nonsense)
- **6px** (0.375rem): Buttons, small alerts (tight, functional, suggests action)
- **16px** (1rem): Glass card variant, some sections (modern, approachable)
- **24px** (1.5rem): Standard cards, feature containers (generous, premium, primary visual form)
- **100rem** (fully rounded): Badge pills, toggle switches (max softness, accent use)

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | No shadow, border only (1px `#ebebeb`) | Dividers, subtle containers, secondary surfaces |
| Ambient | Single shadow `0 4px 16px rgba(0,0,0,0.08)` | Glass card variant, embedded UI, subtle elevation |
| Standard | Dual shadow `0 2px 16px rgba(0,0,0,0.02), 0 16px 64px rgba(0,0,0,0.5)` | Primary cards, elevated content, default elevated state |
| Elevated | `0 2px 16px rgba(0,0,0,0.02), 0 16px 64px rgba(0,0,0,0.5)` + `translateY(-2px)` on hover | Interactive cards, engagement cues |
| Deep | Not explicitly used in the system; depth maxes out at Standard level | Modals, overlays, or full-page takeovers (reserved for future) |
| Ring | `0.125rem solid #4d65ff` outline (bright blue focus ring) | Focus states, keyboard navigation, accessibility |

### Shadow Philosophy
Trust Keith's shadow system is **always dark-tinted**, never colored. The logic is simple: shadows represent light being blocked, which is always darker. The dual-layer approach (2px crisp edge + 16px soft diffusion) mimics real-world light falloff and creates the "glass" effect—surfaces feel like polished glass panes floating over the page, not like they're floating in 3D space. Shadows intensify on hover to confirm interactivity without changing scale or position (minimalist feedback).

## 7. Do's and Don'ts

### Do's
- **Do use Fraunces weight 700 for all headlines.** This is the brand's typographic DNA. Never substitute with Inter Bold for headlines; the distinctive serif italic of Fraunces is what makes Trust Keith visually recognizable.
- **Do respect the 24px card radius as the visual anchor.** It's the most prominent curved element and defines the brand's softer, approachable premium aesthetic.
- **Do apply the dual-shadow formula to all elevated surfaces.** The 2px + 16px combination is Trust Keith's signature; single-layer shadows flatten the design.
- **Do use teal navy (`#235875`) for primary CTAs only.** This color carries authority; overusing it dilutes the brand signal. Links and secondary actions should be bright blue.
- **Do increase line-height for small text.** 12px body should get 1.2 line-height, not 1.5. The inverse relationship improves legibility at small sizes.
- **Do include 32px padding in cards.** Cramping padding makes the interface feel claustrophobic and undermines the "off your plate, confidently" positioning.

### Don'ts
- **Don't use Inter Bold for headlines.** Fraunces is distinctive and brand-owned; Inter Bold looks generic. If Fraunces is unavailable, use a serif alternative, not another sans-serif.
- **Don't reduce button border-radius below 6px.** Buttons are functional, not decorative; a 0px button looks industrial and breaks the glass aesthetic.
- **Don't use true black (`#000000`) for body text.** Trust Keith uses `#222525` (dark gray), which is warmer and less harsh on the eye. It also maintains the "gentle confidence" tone.
- **Don't add glassmorphism effects (backdrop-filter blur).** The "glass" aesthetic comes from radius + shadows, not from blurred backgrounds. Avoid `backdrop-filter: blur()`.
- **Don't use multiple shadow colors.** Shadows are always dark-tinted. Colored shadows (tinted shadows to match the brand color) are anti-patterns here.
- **Don't reduce spacing below 16px between major layout blocks.** The "roomy" density is intentional; cramping negates the premium positioning.

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | ≥1024px | 3-column grids, full navigation, 32px padding in cards |
| Tablet | 768px–1023px | 2-column grids, hamburger nav shows, padding reduced to 24px |
| Mobile | <768px | 1-column layout, full-width cards, padding 16px, typography downscaled 1 step (e.g. body-large → body) |

### Touch Targets
- Minimum button height: 44px (to accommodate 44×44 touch zones per WCAG)
- Minimum padding around interactive elements: 8px
- Minimum font size: 12px (caption-small); anything smaller is metadata or decorative

### Collapsing Strategy
- **Navigation**: Desktop shows horizontal menu; tablet/mobile shows hamburger icon. Submenus collapse under accordion pattern.
- **Grid Layout**: Desktop 3-column → Tablet 2-column → Mobile 1-column
- **Typography**: Display-large stays at 44px on tablet; drops to 32px on mobile. Body text stays 16px throughout (legibility priority).
- **Padding**: Cards reduce from 32px (desktop) → 24px (tablet) → 16px (mobile)
- **Modals**: Desktop modal width ~600px; mobile modals expand to screen width with 16px margins

### Image Behavior
- Hero images: 100% width, object-fit cover, aspect-ratio maintained (16:9 or 4:3 depending on section)
- Product screenshots: Scale down proportionally, maintain 1:1 aspect on mobile
- Customer logos: 100px max width on desktop; 60px on mobile; never stretch horizontally

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA Button: Trust Keith Teal (`#235875`)
- Secondary CTA Button: Bright Blue (`#4285f4`)
- CTA Hover (Primary): Keith Dark Blue (`#194359`)
- CTA Hover (Secondary): Bright Blue Dark (`#2459b3`)
- Page Background: White (`#ffffff`)
- Card Surface: White (`#ffffff`)
- Card Border / Divider: Light Gray (`#ebebeb`)
- Heading Text: Dark Gray (`#222525`)
- Body Text: Dark Gray (`#222525`)
- Muted/Secondary Text: Gray (`#4f5057`)
- Success/Confirmation: Green (`#068466`)
- Alert/Error: Red (`#ea384c`)
- Warm Accent (Features): Light Cream (`#fffaf4`)

### Example Component Prompts

> Create a hero section with white background. Hero headline at 60px Fraunces weight 700, line-height 1.1, color #222525, tracking -0.02em. Subtitle at 20px Helvetica Neue weight 300, line-height 1.4, color #4f5057. Two CTAs below: primary button with teal background (#235875), white text, 20px padding, 6px radius; secondary button with transparent background, dark gray text (#222525), light gray border (#ebebeb), 6px radius, 20px padding. Both buttons Inter 14px weight 500. Hero imagery on the right (desktop) or below (mobile) with 16:9 aspect ratio.

> Build a feature card with white background (#ffffff), 1px border #ebebeb, 24px border-radius, 32px padding. Card title: 20px Helvetica Neue weight 400, color #222525. Card description: 16px Inter weight 400, color #4f5057, line-height 1.5. Include an optional icon in 40×40px size. Apply shadow: `0 2px 16px rgba(0,0,0,0.02), 0 16px 64px rgba(0,0,0,0.5)`. On hover, translate the card up 2px and reduce opacity to .92.

> Design a navigation bar with light gray background (#ebebeb), dark gray text (#222525). Nav height auto, padding 16px vertical 20px horizontal. Nav items: 14px Inter weight 500. Active/hover state: text color stays #222525, add bottom border 2px teal (#235875). On mobile, transform to hamburger menu; menu items stack vertically with 8px gap. Navigation dropdown menus appear on hover (desktop) or on click (mobile) with 200ms ease transition.

> Build an email input field: white background (#ffffff), 1px border #ebebeb, 0px border-radius (square), 8px horizontal 12px vertical padding, 14px Inter weight 400. Placeholder text #999 (gray). On focus, remove default outline, apply custom outline: `0.125rem solid #4d65ff` with 0.125rem offset. Include a validation state: error state shows border #ea384c (red) with error message at 12px Inter weight 400, color #ea384c, positioned 4px below the input.

### Iteration Guide

1. **Fraunces is the headline font.** Every major heading (h1, h2, h3) must use Fraunces weight 700. If Fraunces is unavailable, use a bold serif; never substitute with Inter Bold.

2. **Card radius is 24px by default.** This is the brand's visual signature. Keep this radius on primary cards. Only use 16px for embedded/glass variants, 6px for buttons/inputs.

3. **Button padding is always 20px** (1.25rem). This is tighter than it appears because of the 6px radius. Never reduce below 16px or the buttons will feel cramped.

4. **Shadows follow the dual-layer formula:** `0 2px 16px rgba(0,0,0,0.02), 0 16px 64px rgba(0,0,0,0.5)`. The first layer is the sharp edge (2px blur); the second is the soft diffusion (16px blur). Never use a single shadow or colored shadows.

5. **Body text is dark gray (#222525), not black.** This softens the interface and maintains the premium, approachable tone. Black (#000000) is harsh and breaks the aesthetic.

6. **Spacing between major sections is 48px minimum.** Tablets reduce to 32px, mobile to 24px. Never allow sections to feel cramped; whitespace is intentional and brand-building.

7. **Border radius for interactive elements scales with size:** buttons (6px) < glass cards (16px) < primary cards (24px) < badges (100rem, fully rounded). Never invert this scale.

8. **Hover states for cards add translateY(-2px) and opacity .92.** This is a subtle lift and dim, not a color shift. No background color changes on hover; motion and opacity are the feedback signals.

9. **Links and secondary CTAs use bright blue (#4285f4), never teal.** Teal is reserved for primary actions ("Talk to an expert"). Bright blue is for secondary engagement (links, "Learn more", secondary CTAs).

10. **Typography hierarchy is weight-based, not style-based.** Use weight progression (300 → 400 → 500 → 600 → 700) to signal importance. Avoid italic, all-caps, or underlining for hierarchy; these are reserved for semantic emphasis (quotes, code, definitions).