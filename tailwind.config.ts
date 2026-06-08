import type { Config } from "tailwindcss";

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
        background: "var(--ea-color-background)",
        foreground: "var(--ea-color-on-surface)",
        primary: {
          DEFAULT: "var(--ea-color-primary)",
          foreground: "var(--ea-color-on-primary)"
        },
        secondary: {
          DEFAULT: "var(--ea-color-secondary-container)",
          foreground: "var(--ea-color-on-secondary-container)"
        },
        accent: {
          DEFAULT: "var(--ea-color-prestige-gold)",
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
        warning: "var(--ea-color-secondary-fixed-dim)",
        success: "var(--ea-color-success-green)",
        danger: "var(--ea-color-error)",
        "deep-navy": "var(--ea-color-deep-navy)",
        "prestige-gold": "var(--ea-color-prestige-gold)",
        surface: "var(--ea-color-surface)",
        "surface-muted": "var(--ea-color-surface-muted)",
        "surface-container": "var(--ea-color-surface-container)",
        "text-main": "var(--ea-color-text-main)",
        "text-muted": "var(--ea-color-text-muted)",
        "outline-variant": "var(--ea-color-outline-variant)"
      },
      borderRadius: {
        DEFAULT: "var(--ea-radius-default)",
        lg: "var(--ea-radius-lg)",
        xl: "var(--ea-radius-xl)",
        "2xl": "var(--ea-radius-2xl)",
        "3xl": "var(--ea-radius-2xl)"
      },
      boxShadow: {
        soft: "var(--ea-shadow-soft)",
        card: "var(--ea-shadow-card)"
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Inter", "system-ui", "sans-serif"],
        display: ["-apple-system", "BlinkMacSystemFont", "Manrope", "Inter", "system-ui", "sans-serif"]
      },
      fontSize: {
        micro: ["var(--ea-font-size-micro)", { lineHeight: "1.4" }],
        badge: ["var(--ea-font-size-badge)", { lineHeight: "1.4" }],
        label: ["var(--ea-font-size-label)", { lineHeight: "1.4" }],
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
        hero: ["var(--ea-font-size-hero)", { lineHeight: "1.08" }]
      },
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
