import type { Config } from "tailwindcss";
import { tokens } from './src/design-tokens/tokens.tailwind.js'

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        md: "2rem",
        xl: "2.5rem"
      },
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      colors: {
        // Existing EA tokens (keep as-is)
        background: "var(--ea-color-background)",
        foreground: "var(--ea-color-on-surface)",
        primary: {
          DEFAULT: "var(--color-primary)",
          0: "var(--m3-primary-fixed)",
          1: "var(--m3-primary-fixed-dim)",
          2: "var(--m3-on-primary-fixed-variant)",
          3: "var(--tk-accent-soft)",
          4: "var(--tk-accent)",
          5: "var(--m3-primary-container)",
          6: "var(--m3-primary)",
          7: "var(--color-primary)",
          8: "var(--color-primary-hover)",
          9: "var(--m3-on-primary-fixed)",
          foreground: "var(--ea-color-on-primary)"
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          0: "var(--m3-secondary-fixed)",
          1: "var(--m3-secondary-fixed-dim)",
          2: "var(--m3-secondary-container)",
          3: "var(--m3-on-secondary-container)",
          4: "var(--m3-secondary)",
          5: "var(--color-secondary)",
          6: "var(--color-secondary-hover)",
          7: "var(--ea-color-warning)",
          8: "var(--m3-on-secondary-fixed-variant)",
          9: "var(--m3-on-secondary-fixed)",
          foreground: "var(--ea-color-on-secondary-container)"
        },
        tertiary: {
          DEFAULT: "var(--color-tertiary)",
          0: "var(--m3-tertiary-fixed)",
          1: "var(--m3-tertiary-fixed-dim)",
          2: "var(--m3-tertiary-container)",
          3: "var(--color-tertiary)",
          4: "var(--m3-tertiary)",
          5: "var(--tk-ink-muted)",
          6: "var(--m3-on-tertiary-fixed-variant)",
          7: "var(--m3-on-tertiary-container)",
          8: "var(--m3-on-tertiary-fixed)",
          9: "var(--tk-ink)",
        },
        accent: {
          DEFAULT: "var(--ea-color-accent)",
          foreground: "var(--ea-color-primary)"
        },
        muted: {
          DEFAULT: "var(--ea-color-surface-container-low)",
          foreground: "var(--ea-color-text-muted)"
        },
        card: {
          DEFAULT: "var(--ea-color-surface-container-lowest)",
          foreground: "var(--ea-color-on-surface)"
        },
        border: "var(--ea-color-outline-variant)",
        input: "var(--ea-color-outline-variant)",
        ring: "var(--ea-color-prestige-gold)",
        warning: "var(--ea-color-warning)",
        success: "var(--ea-color-success)",
        danger: "var(--ea-color-danger)",
        "deep-navy": "var(--ea-color-deep-navy)",
        "prestige-gold": "var(--ea-color-prestige-gold)",
        surface: "var(--ea-color-surface)",
        "surface-muted": "var(--ea-color-surface-muted)",
        "surface-container": "var(--ea-color-surface-container)",
        "text-main": "var(--ea-color-text-main)",
        "text-muted": "var(--ea-color-text-muted)",
        "outline-variant": "var(--ea-color-outline-variant)",
        "label-primary": "var(--ea-color-label)",
        "label-secondary": "var(--ea-color-secondary-label)",
        separator: "var(--ea-color-separator)",
        "surface-raised": "var(--ea-color-surface-raised)",
        control: "var(--ea-color-control)",
        // New design system tokens (Phase 1 — Foundation)
        ...tokens.colors,
      },
      spacing: tokens.spacing,
      borderRadius: {
        DEFAULT: "var(--ea-radius-default)",
        lg: "var(--ea-radius-lg)",
        xl: "var(--ea-radius-xl)",
        "2xl": "var(--ea-radius-2xl)",
        "3xl": "var(--ea-radius-2xl)",
        ...tokens.borderRadius,
      },
      boxShadow: {
        soft: "var(--ea-shadow-soft)",
        card: "var(--ea-shadow-card)",
        ...tokens.boxShadow,
      },
      fontFamily: {
        sans: ["var(--ea-font-sans)"],
        display: ["var(--ea-font-display)"],
        ...tokens.fontFamily,
      },
      fontSize: {
        micro: ["var(--ea-font-size-micro)", { lineHeight: "1.4" }],
        badge: ["var(--ea-font-size-badge)", { lineHeight: "1.4" }],
        label: ["var(--ea-font-size-label)", { lineHeight: "1.4" }],
        caption: ["var(--m3-type-caption-size)", { lineHeight: "var(--m3-type-caption-line-height)" }],
        "label-bold": ["var(--m3-type-label-bold-size)", { lineHeight: "var(--m3-type-label-bold-line-height)" }],
        "body-md": ["var(--m3-type-body-md-size)", { lineHeight: "var(--m3-type-body-md-line-height)" }],
        "body-lg": ["var(--m3-type-body-lg-size)", { lineHeight: "var(--m3-type-body-lg-line-height)" }],
        "headline-md": ["var(--m3-type-headline-md-size)", { lineHeight: "var(--m3-type-headline-md-line-height)" }],
        "headline-lg-mobile": [
          "var(--m3-type-headline-lg-mobile-size)",
          { lineHeight: "var(--m3-type-headline-lg-mobile-line-height)" }
        ],
        "headline-lg": ["var(--m3-type-headline-lg-size)", { lineHeight: "var(--m3-type-headline-lg-line-height)" }],
        "display-lg": ["var(--m3-type-display-lg-size)", { lineHeight: "var(--m3-type-display-lg-line-height)" }],
        lead: ["var(--ea-font-size-lead)", { lineHeight: "1.6" }],
        card: ["var(--ea-font-size-card)", { lineHeight: "1.2" }],
        feature: ["var(--ea-font-size-feature)", { lineHeight: "1.2" }],
        article: ["var(--ea-font-size-article)", { lineHeight: "1.4" }],
        stat: ["var(--ea-font-size-stat)", { lineHeight: "1" }],
        quote: ["var(--ea-font-size-quote)", { lineHeight: "1.25" }],
        "h2-compact": ["var(--ea-font-size-h2-compact)", { lineHeight: "1.2" }],
        "h1-mobile": ["var(--ea-font-size-h1-mobile)", { lineHeight: "1.12" }],
        section: ["var(--ea-font-size-section)", { lineHeight: "1.2" }],
        "h1-alt": ["var(--ea-font-size-h1-alt)", { lineHeight: "1.08" }],
        display: ["var(--ea-font-size-display)", { lineHeight: "1.12" }],
        hero: ["var(--ea-font-size-hero)", { lineHeight: "1.08" }],
        ...tokens.fontSize,
      },
      fontWeight: tokens.fontWeight,
      lineHeight: tokens.lineHeight,
      maxWidth: tokens.maxWidth,
      backgroundImage: {
        "hero-radial":
          "linear-gradient(90deg, rgba(0,23,54,0.96), rgba(0,23,54,0.86) 48%, rgba(0,23,54,0.24))",
        "ocean-panel":
          "linear-gradient(145deg, rgba(0,23,54,0.98), rgba(0,43,91,0.96) 58%, rgba(47,12,0,0.86) 100%)"
      }
    }
  },
  plugins: []
};

export default config;
