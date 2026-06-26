/**
 * Design Tokens - Tailwind CSS v4 Configuration
 * Source: tokens.yaml (DTCG 2025.10)
 * Generated: 2026-06-22
 *
 * Usage:
 * import tokens from './tokens.tailwind.js'
 *
 * In tailwind.config.ts:
 * theme: {
 *   extend: {
 *     colors: tokens.colors,
 *     spacing: tokens.spacing,
 *     borderRadius: tokens.borderRadius,
 *     boxShadow: tokens.shadows,
 *     ...
 *   }
 * }
 */

export const tokens = {
  // Color System
  colors: {
    // Neutral Scale
    neutral: {
      0: "#ffffff",
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },

    // Brand Colors
    primary: {
      DEFAULT: "#0066CC",
      hover: "#0052A3",
      light: "#003d99",
      foreground: "#ffffff",
    },

    accent: {
      DEFAULT: "#d4af37",
      gold: "#d4af37",
    },

    navy: {
      deep: "#001736",
    },

    // Status Colors
    success: "#22c55e",
    warning: "#eab308",
    error: "#dc2626",
    danger: "#dc2626",

    // Semantic Colors
    background: "#ffffff",
    surface: "#f9fafb",
    "surface-raised": "#ffffff",
    foreground: "#111827",
    "foreground-muted": "#4b5563",
    "foreground-subtle": "#6b7280",
    border: "#e5e7eb",
    "border-subtle": "#f3f4f6",
    "border-strong": "#d1d5db",
    ring: "#d4af37",
  },

  // Spacing (Tailwind base 4px)
  spacing: {
    0: "0",
    px: "1px",
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px",
  },

  // Border Radius
  borderRadius: {
    none: "0",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },

  // Shadows
  boxShadow: {
    none: "0 0 0 0 rgba(0, 0, 0, 0)",
    soft: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    card: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },

  // Typography
  fontFamily: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    display: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },

  fontSize: {
    xs: ["12px", { lineHeight: "1.1" }],
    sm: ["14px", { lineHeight: "1.2" }],
    base: ["16px", { lineHeight: "1.5" }],
    lg: ["18px", { lineHeight: "1.6" }],
    xl: ["20px", { lineHeight: "1.6" }],
    "2xl": ["24px", { lineHeight: "1.2" }],
    "3xl": ["30px", { lineHeight: "1.2" }],
    "4xl": ["36px", { lineHeight: "1.1" }],
    "5xl": ["48px", { lineHeight: "1.1" }],
    "6xl": ["60px", { lineHeight: "1.1" }],
  },

  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  lineHeight: {
    tight: "1.1",
    snug: "1.2",
    normal: "1.5",
    relaxed: "1.6",
    loose: "1.75",
  },

  // Component-Specific Values
  components: {
    button: {
      primary: {
        backgroundColor: "#0066CC",
        color: "#ffffff",
        paddingInline: "16px",
        paddingBlock: "8px",
        borderRadius: "8px",
        fontWeight: "600",
      },
      secondary: {
        backgroundColor: "#f9fafb",
        color: "#111827",
        border: "1px solid #e5e7eb",
        paddingInline: "16px",
        paddingBlock: "8px",
      },
      danger: {
        backgroundColor: "#dc2626",
        color: "#ffffff",
        paddingInline: "16px",
        paddingBlock: "8px",
      },
    },
  },
};

/**
 * Tailwind v4 Usage Example:
 *
 * import { tokens } from './tokens.tailwind'
 *
 * export default {
 *   theme: {
 *     extend: {
 *       colors: tokens.colors,
 *       spacing: tokens.spacing,
 *       borderRadius: tokens.borderRadius,
 *       boxShadow: tokens.boxShadow,
 *       fontFamily: tokens.fontFamily,
 *       fontSize: tokens.fontSize,
 *       fontWeight: tokens.fontWeight,
 *       lineHeight: tokens.lineHeight,
 *     }
 *   }
 * }
 */

export default tokens;
