# Trust Keith — Design System

**Trust Keith** is an intelligent privacy-management platform: a dedicated human privacy expert (a Registered DPO) embedded alongside an intelligent software platform ("Privacy OS") that runs privacy operations at scale for data-centric SMBs. Positioning: *"Your always-on privacy partner"* — take privacy off your plate, confidently. Core jobs: continuous data discovery, human-verified audits, intelligent workflows (DSARs, vendor risk, incidents, assessments), proportional policies, staff training, and monitoring/reporting across global regulations (GDPR, CCPA, LGPD, EU AI Act, and more).

Two product surfaces are represented:
1. **Marketing site** (trustkeith.co) — premium, trust-building B2B marketing.
2. **Privacy OS** — the product dashboard (audit score, risks & actions, data register, policies, processes).

## Sources
This system was built from a structured design extraction of the Trust Keith homepage, mounted at `trustkeith/` (read-only). Key inputs read: `trustkeith/DESIGN.md` (full design spec), `trustkeith/inputs/page.md` (product copy), `font-faces.json`, `shadows.json`, `gradients.json`, `motion.json`, and `trustkeith/portable/` (normalized tokens + a sample HeroCard component). Live site: https://trustkeith.co. Logo source (not retrievable into the project): `https://cdn.prod.website-files.com/5f462e8160aa877216f7d4b7/642bcbad7735490755580d8d_trust-keith-logo.svg`.

---

## CONTENT FUNDAMENTALS

**Voice:** warm, reassuring, confident — a calm expert who has your back. Privacy is framed as a weight *lifted*, never as fear/FUD. Recurring promise verbs: *hold your hand, take it off your plate, keep you on track, done properly*.

- **Person:** second person "you / your" for the reader; "we / our experts" for Trust Keith. The product is personified ("Keith").
- **Casing:** sentence case everywhere — headlines, buttons, nav. **No all-caps** except tiny uppercase eyebrows/labels.
- **Emphasis:** italics on a single word for warmth/wit — *"done properly"*, *"properly"*. Used sparingly inside otherwise plain headlines.
- **Tone markers:** em-dashes for asides ("— without the pressure to expand your team"); British spelling ("Operationalise", "personalisation"); plain-language over jargon ("jargon-free training").
- **Emoji:** none. The only recurring glyph is a trailing arrow "→" on links/CTAs.
- **CTA copy:** "Talk to an expert →", "See how it works →", "Explore →", "Read full story →". Primary CTA is always *talk to a human*.
- **Headline examples:** "Your always-on privacy partner" · "Pain-free global privacy management, *done properly*" · "Ready to do privacy properly?" · "Trust Keith in numbers".
- **Proof style:** named customer quotes with full name, role, company (Ocean Bottle, Codat, Thortful, BBC Maestro); concrete metrics ("28 hrs saved per deal", "30% off cyber insurance", "92% recommend").

---

## VISUAL FOUNDATIONS

**Atmosphere:** professional, premium, calm — an "apple-glass" archetype. Roomy, breathing layouts signal confidence; complexity is orchestrated, never crammed.

- **Color:** brand teal-navy `#235875` carries authority and is reserved for primary CTAs/logo only. Bright blue `#4285f4` is the high-frequency UI accent (links, secondary CTAs, highlights). Neutrals run white → `#fafafa` → `#ebebeb` (lines) → `#4f5057` (muted) → `#222525` (ink — **never true black**). Warm creams (`#fffaf4`, `#c3b6aa`) humanize technical content. Semantic: success `#068466`, error `#ea384c`.
- **Type:** three families used as a hierarchy by *weight*, not styling. **Quincy CF 700** (display serif) for all headlines — the brand's typographic DNA, tracked tight at -0.02em. **Merriweather 300/400** (serif) for elegant subheadings that slow the reader down. **Inter 400/500/600** for body & UI. Caveat (handwriting) is an accent-only reserve. No all-caps headings.
- **Spacing:** 4px base, deliberately roomy. Cards pad at 32px, buttons 20px, sections 48–64px apart. Nothing is ever trapped at <16px.
- **Backgrounds:** mostly clean white. Subtle light radial/linear gradients on hero areas (`radial-gradient(circle,#f7f9fc 35%,#ebf3ff)`); warm cream blocks for testimonial/featured sections; teal block for the closing CTA band. No photographic full-bleed textures, no busy patterns.
- **Corner radii (scales with element size):** input 4px < button 6px < glass card 16px < **standard card 24px (the visual signature)** < pill 100rem (badges, switches).
- **Cards:** white, 1px `#ebebeb` border, 24px radius, 32px padding, signature **dual-layer dark shadow** (a crisp 2px edge + a soft diffuse layer) for a glass-pane lift. (Source spec lists a very heavy second layer; toned to a tasteful `rgba(0,0,0,0.12)` here — see Caveats.)
- **Shadows:** **always dark-tinted, never colored.** Hairline (`inset 0 0 0 1px #ebebeb`) for flat surfaces; ambient `0 4px 16px rgba(0,0,0,0.08)` for glass; dual-layer for standard cards. **No glassmorphism** — "glass" = radius + shadow, never `backdrop-filter: blur()`.
- **Borders & dividers:** 1px `#ebebeb`, no shadow.
- **Hover states:** cards lift `translateY(-2px)` + dim to opacity .92 (motion/opacity, not color). Buttons darken (primary teal → `#194359`; secondary fill 5% → 8% black). Links shift to bright blue.
- **Press states:** buttons nudge down ~0.5px; no scale-shrink.
- **Focus:** bright-blue ring `0.125rem solid #4d65ff` with 0.125rem offset — a strong, deliberate signal.
- **Motion:** a single easing curve `cubic-bezier(.25,.46,.45,.94)`. Transitions are calm fades/slides (200–500ms). The one keyframe in the source is a slow `spin`. No bounces.
- **Transparency/blur:** transparency used only for subtle fills (`rgba(0,0,0,0.05)` secondary buttons, soft tint badges). Blur is avoided by design.
- **Imagery vibe:** warm, bright, human — smiling people on light backgrounds, friendly product screenshots with rounded corners; never cold or grainy.

---

## ICONOGRAPHY

The source is a Webflow marketing site with a **minimal, restrained icon approach** — there is no rich custom icon set in the brand. Observed usage:

- **Trailing arrow "→"** is the dominant glyph, on virtually every link and CTA. Recreated here as a thin inline SVG chevron-arrow (1.6px stroke) inside `Button`/links.
- **Checkmarks** in soft circular tints for feature/inclusion lists (`FeatureListItem`).
- **Small status dots** (colored circles) for activity feeds, badges, and audit categories.
- A `webflow-icons` icon font ships in the source CSS but only covers Webflow UI chrome (nav/dropdown carets) — not a brand asset, so it is not reproduced.
- **No emoji.** No decorative illustration system beyond product-screenshot imagery.

**Substitution flag:** because the brand has no public icon library, components use a handful of hand-built inline SVGs (arrow, check) at the brand's thin stroke weight. For richer product UI, **Lucide** (CDN, 1.5–2px stroke, rounded line style) is the recommended closest match — adopt it if the Privacy OS surfaces grow. No icon binaries were available to copy from the source.

---

## INDEX / MANIFEST

**Root**
- `styles.css` — global entry point (imports only). Consumers link this one file.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css` (all `--tk-*` custom properties).
- `readme.md` — this guide. `SKILL.md` — Agent-Skill manifest.

**Components** (`window.TrustKeithDesignSystem_e3aaec`)
- `components/core/` — `Button`, `Badge`, `Card`, `Input`, `Avatar`, `Logo`, `Switch`, `Checkbox`.
- `components/data/` — `StatBlock`, `ProgressBar`, `FeatureListItem`, `Testimonial`.
- `components/navigation/` — `NavBar`.

**UI kits**
- `ui_kits/marketing/` — interactive marketing homepage (hero + product dashboard mock, feature sections, stats, testimonial, product grid, CTA, footer; contact modal).
- `ui_kits/privacy-os/` — Privacy OS product dashboard (sidebar, audit score, activity, risk-summary table).

**Foundation cards** (`guidelines/`) — Colors (brand, neutral, semantic), Type (display, serif, body), Spacing (scale, radius), Brand (elevation, wordmark).

---

## CAVEATS
- **Quincy CF** (brand display serif) is commercial and not on Google Fonts. It is loaded from the brand's own Webflow CDN via `@font-face` in `tokens/fonts.css` — real and accurate, but dependent on that CDN. **Self-host the `.woff` files for production.** Inter, Merriweather, Caveat load from Google Fonts (1:1 with source).
- **Logo:** the official SVG could not be retrieved; `Logo` is a faithful typographic wordmark stand-in. Drop the real SVG into `assets/` and update `Logo.jsx` when available.
- **Card shadow** was softened from the source spec's extreme second layer (`rgba(0,0,0,0.5)` at 64px) to a tasteful `0.12` — flag if you want the heavier original.
- Customer logos and product imagery from the source are remote AVIF/SVG assets (not copied); UI kits recreate them as styled text/placeholders.
