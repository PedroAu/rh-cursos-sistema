/**
 * Design Tokens - Trust Keith System
 * Tailwind CSS v4 Configuration
 *
 * Usage:
 * import { tokens } from './tokens.tailwind.js'
 *
 * In tailwind.config.ts:
 * theme: {
 *   extend: {
 *     colors: tokens.colors,
 *     spacing: tokens.spacing,
 *     borderRadius: tokens.borderRadius,
 *     boxShadow: tokens.boxShadow,
 *     fontFamily: tokens.fontFamily,
 *     fontSize: tokens.fontSize,
 *     fontWeight: tokens.fontWeight,
 *     lineHeight: tokens.lineHeight,
 *   }
 * }
 */

export const tokens = {
  // COLORS — Trust Keith Palette
  colors: {
    // Brand Colors
    'trust-keith-teal': '#235875',
    'keith-dark-blue': '#194359',
    'bright-blue': '#4285f4',
    'bright-blue-dark': '#2459b3',
    'bright-blue-light': '#e0eeff',

    // Neutral Scale (7-step)
    'text-primary': '#222525',
    'text-secondary': '#4f5057',
    'surface-light': '#fafafa',
    'surface-neutral': '#ebebeb',
    'surface-white': '#ffffff',

    // Semantic
    'success': '#068466',
    'danger': '#ea384c',
    'error': '#ea384c',

    // Warm Accents
    'cream-light': '#fffaf4',
    'cream-dark': '#c3b6aa',
  },

  // TYPOGRAPHY — Trust Keith Hierarchy
  fontSize: {
    // Display (Quincy CF 700)
    'display-hero': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    'display-large': ['2.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
    'section-heading': ['2rem', { lineHeight: '1.25' }],

    // Subheading (Merriweather 300/400)
    'subheading-large': ['1.5rem', { lineHeight: '1.35' }],
    'subheading': ['1.25rem', { lineHeight: '1.4' }],

    // Body (Inter 400)
    'body-large': ['1.0625rem', { lineHeight: '1.45' }],
    'body': ['1rem', { lineHeight: '1.5' }],
    'body-small': ['0.875rem', { lineHeight: '1.4' }],

    // UI (Inter 500)
    'button': ['0.875rem', { lineHeight: '1.2', fontWeight: '500' }],
    'button-small': ['0.75rem', { lineHeight: '1.1', fontWeight: '500' }],
    'link': ['0.875rem', { lineHeight: '1.2', fontWeight: '500' }],

    // Captions (Inter 400)
    'caption': ['0.75rem', { lineHeight: '1.2' }],
    'caption-small': ['0.6875rem', { lineHeight: '1.1' }],
  },

  fontFamily: {
    'sans': 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    'serif': 'Merriweather, Georgia, serif',
    'display': 'Quincy CF, serif',
  },

  fontWeight: {
    'light': '300',
    'normal': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700',
  },

  // SPACING — 4px base unit
  spacing: {
    'xs': '0.25rem',   // 4px
    'sm': '0.5rem',    // 8px
    'md': '1rem',      // 16px
    'lg': '1.5rem',    // 24px
    'xl': '2rem',      // 32px
    '2xl': '3rem',     // 48px
    '3xl': '4rem',     // 64px
  },

  // BORDER RADIUS — Trust Keith Scale
  borderRadius: {
    'none': '0px',
    'input': '0px',        // Utilitarian inputs
    'button': '6px',       // Functional buttons
    'glass': '16px',       // Glass card variant
    'card': '24px',        // Primary cards
    'pill': '100rem',      // Badges, fully rounded
  },

  // SHADOWS — Dual-layer glass effect
  boxShadow: {
    'none': 'none',
    'ambient': '0 4px 16px rgba(0, 0, 0, 0.08)',  // Glass variant
    'standard': '0 2px 16px rgba(0, 0, 0, 0.02), 0 16px 64px rgba(0, 0, 0, 0.5)',  // Primary cards
    'focus': '0.125rem solid #4d65ff',  // Focus ring (bright blue)
  },

  // LINE HEIGHT
  lineHeight: {
    'tight': '1.1',
    'snug': '1.2',
    'normal': '1.4',
    'relaxed': '1.5',
    'loose': '1.6',
  },
};

export default tokens;
