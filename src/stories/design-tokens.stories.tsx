import type { Meta, StoryObj } from '@storybook/react';
import { tokens } from '@/design-tokens/tokens.tailwind.js';

/**
 * Design System Tokens
 *
 * This story documents all design tokens and their usage.
 * Reference this when building components to ensure consistency.
 *
 * Token layers:
 * - L1: Colors, Typography, Spacing, Shadows
 * - L2: Components (Button, Card, Input)
 * - L3: Generated Tailwind classes
 * - L4: React components
 */

// Color showcase
export const Colors: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Brand Colors</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(tokens.colors)
            .filter(([k]) =>
              ['trust-keith-teal', 'keith-dark-blue', 'bright-blue', 'bright-blue-dark', 'bright-blue-light'].includes(k)
            )
            .map(([name, hex]) => (
              <div key={name}>
                <div
                  className="w-full h-24 rounded-lg mb-2 border border-gray-200"
                  style={{ backgroundColor: hex }}
                />
                <p className="font-mono text-sm">{name}</p>
                <p className="font-mono text-xs text-gray-600">{hex}</p>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Neutral Scale</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(tokens.colors)
            .filter(([k]) =>
              ['text-primary', 'text-secondary', 'surface-light', 'surface-neutral', 'surface-white'].includes(k)
            )
            .map(([name, hex]) => (
              <div key={name}>
                <div
                  className="w-full h-24 rounded-lg mb-2 border border-gray-200"
                  style={{ backgroundColor: hex }}
                />
                <p className="font-mono text-sm">{name}</p>
                <p className="font-mono text-xs text-gray-600">{hex}</p>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Semantic Colors</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(tokens.colors)
            .filter(([k]) => ['success', 'danger', 'error', 'cream-light', 'cream-dark'].includes(k))
            .map(([name, hex]) => (
              <div key={name}>
                <div
                  className="w-full h-24 rounded-lg mb-2 border border-gray-200"
                  style={{ backgroundColor: hex }}
                />
                <p className="font-mono text-sm">{name}</p>
                <p className="font-mono text-xs text-gray-600">{hex}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  ),
};

// Typography showcase
export const Typography: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Display Hierarchy (Quincy CF)</h2>
        <div className="space-y-4">
          <div>
            <p className="text-display-hero">Display Hero</p>
            <p className="text-xs text-gray-600 mt-1">3.75rem • weight 700 • -0.02em spacing</p>
          </div>
          <div>
            <p className="text-display-large">Display Large</p>
            <p className="text-xs text-gray-600 mt-1">2.75rem • weight 700</p>
          </div>
          <div>
            <p className="text-section-heading">Section Heading</p>
            <p className="text-xs text-gray-600 mt-1">2rem • weight 700</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Body Text (Inter)</h2>
        <div className="space-y-4">
          <div>
            <p className="text-body-large">Body Large Text</p>
            <p className="text-xs text-gray-600 mt-1">1.0625rem • weight 400 • line-height 1.45</p>
          </div>
          <div>
            <p className="text-body">Body Text (default)</p>
            <p className="text-xs text-gray-600 mt-1">1rem • weight 400 • line-height 1.5</p>
          </div>
          <div>
            <p className="text-body-small">Body Small Text</p>
            <p className="text-xs text-gray-600 mt-1">0.875rem • weight 400 • line-height 1.4</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">UI Text (Inter 500)</h2>
        <div className="space-y-4">
          <div>
            <p className="text-button">Button Text</p>
            <p className="text-xs text-gray-600 mt-1">0.875rem • weight 500 • line-height 1.2</p>
          </div>
          <div>
            <p className="text-link">Link Text</p>
            <p className="text-xs text-gray-600 mt-1">0.875rem • weight 500 • line-height 1.2</p>
          </div>
          <div>
            <p className="text-button-small">Button Small</p>
            <p className="text-xs text-gray-600 mt-1">0.75rem • weight 500 • line-height 1.1</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Spacing showcase
export const Spacing: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Spacing Scale (4px base)</h2>
      <div className="space-y-4">
        {Object.entries(tokens.spacing).map(([name, value]) => (
          <div key={name} className="flex items-center gap-4">
            <div className="w-32">
              <p className="font-mono text-sm font-semibold">{name}</p>
              <p className="font-mono text-xs text-gray-600">{value}</p>
            </div>
            <div
              className="bg-bright-blue h-8 rounded"
              style={{ width: `calc(${value} * 10)` }}
            />
          </div>
        ))}
      </div>
    </div>
  ),
};

// Border radius showcase
export const BorderRadius: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Border Radius Scale</h2>
      <div className="grid grid-cols-2 gap-8">
        {Object.entries(tokens.borderRadius).map(([name, value]) => (
          <div key={name}>
            <div
              className="w-full h-32 bg-trust-keith-teal border-2 border-gray-300 mb-2"
              style={{ borderRadius: value }}
            />
            <p className="font-mono text-sm font-semibold">{name}</p>
            <p className="font-mono text-xs text-gray-600">{value}</p>
            {name === 'button' && (
              <p className="text-xs text-blue-600 mt-1">Used in: Button</p>
            )}
            {name === 'card' && (
              <p className="text-xs text-blue-600 mt-1">Used in: Card</p>
            )}
            {name === 'glass' && (
              <p className="text-xs text-blue-600 mt-1">Used in: Card (glass variant)</p>
            )}
            {name === 'input' && (
              <p className="text-xs text-blue-600 mt-1">Used in: Input</p>
            )}
            {name === 'pill' && (
              <p className="text-xs text-blue-600 mt-1">Used in: Badge</p>
            )}
          </div>
        ))}
      </div>
    </div>
  ),
};

// Shadows showcase
export const Shadows: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Shadow Variants</h2>
      <div className="grid grid-cols-2 gap-8">
        {Object.entries(tokens.boxShadow).map(([name, shadowCSS]) => (
          <div key={name}>
            <div
              className="w-full h-32 bg-white rounded-card mb-2"
              style={{ boxShadow: shadowCSS }}
            />
            <p className="font-mono text-sm font-semibold">{name}</p>
            <p className="font-mono text-xs text-gray-600 break-all">{shadowCSS}</p>
            {name === 'standard' && (
              <p className="text-xs text-blue-600 mt-1">Used in: Card (default)</p>
            )}
            {name === 'ambient' && (
              <p className="text-xs text-blue-600 mt-1">Used in: Card (glass variant)</p>
            )}
          </div>
        ))}
      </div>
    </div>
  ),
};

// Focus ring showcase
export const FocusRings: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Focus Ring Indicators</h2>

      <div>
        <h3 className="text-lg font-semibold mb-4">Button with Focus Ring</h3>
        <button
          className="px-6 py-3 bg-trust-keith-teal text-white rounded-button font-semibold
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-2"
        >
          Focus me (Tab)
        </button>
        <p className="text-sm text-gray-600 mt-4">
          Classes: <code className="bg-gray-100 px-2 py-1 rounded">focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-2</code>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Color: <code className="bg-gray-100 px-2 py-1 rounded">#4d65ff (bright-blue)</code> • Offset: <code className="bg-gray-100 px-2 py-1 rounded">2px</code>
        </p>
        <p className="text-sm text-amber-600 mt-2">
          ⚠️ Contrast: 4.54:1 (WCAG AA ✅, not AAA)
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Input with Focus Ring</h3>
        <input
          type="text"
          placeholder="Focus me (Tab)"
          aria-label="Input field demo"
          className="w-full px-4 py-3 rounded-input border border-surface-neutral bg-surface-white
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-1"
        />
        <p className="text-sm text-gray-600 mt-4">
          Classes: <code className="bg-gray-100 px-2 py-1 rounded">focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-1</code>
        </p>
        <p className="text-sm text-amber-600 mt-2">
          ⚠️ See A11Y-FINDINGS.md for contrast audit results
        </p>
      </div>
    </div>
  ),
};

// Component examples
export const ComponentExamples: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Button Examples</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="px-6 py-3 bg-trust-keith-teal text-white rounded-button font-semibold
           hover:bg-keith-dark-blue hover:-translate-y-0.5 transition-all">
            Primary
          </button>
          <button className="px-6 py-3 border border-surface-neutral bg-surface-light text-text-primary rounded-button font-semibold
           hover:bg-surface-neutral transition-all">
            Secondary
          </button>
          <button className="px-6 py-3 border border-surface-neutral bg-surface-white text-bright-blue rounded-button font-semibold
           hover:border-bright-blue transition-all">
            Outline
          </button>
          <button className="px-6 py-3 text-text-primary rounded-button font-semibold
           hover:bg-surface-light transition-all">
            Ghost
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Card Examples</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-white border border-surface-neutral rounded-card shadow-standard p-6">
            <p className="font-semibold mb-2">Card Base</p>
            <p className="text-sm text-text-secondary">rounded-card • shadow-standard</p>
          </div>
          <div className="bg-surface-white border border-surface-neutral rounded-glass shadow-ambient p-6">
            <p className="font-semibold mb-2">Card Glass</p>
            <p className="text-sm text-text-secondary">rounded-glass • shadow-ambient</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

const meta: Meta = {
  title: 'Design System / Tokens',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Design system tokens documentation.

**Structure:**
- Colors: Brand, Neutral, Semantic
- Typography: Display, Body, UI
- Spacing: 4px-based scale
- Border Radius: Component-specific scales
- Shadows: Dual-layer glass effect
- Focus Rings: WCAG AA compliant

**Token Layers:**
1. \`docs/design/tokens.json\` — Source of truth
2. \`src/design-tokens/tokens.tailwind.js\` — Tailwind config
3. \`tailwind.config.ts\` — Extended theme
4. React components — Usage

**Usage Guide:**
\`\`\`tsx
// Import tokens (not usually needed)
import { tokens } from '@/design-tokens/tokens.tailwind.js';

// Use Tailwind classes (preferred)
<button className="bg-trust-keith-teal text-white rounded-button">
  Click me
</button>

// Use CVA for components
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'rounded-button font-semibold transition-all',
  {
    variants: {
      variant: {
        primary: 'bg-trust-keith-teal text-white hover:bg-keith-dark-blue',
        secondary: 'bg-surface-light text-text-primary border border-surface-neutral'
      }
    }
  }
);
\`\`\`

**Documentation:**
- [Tokens → Components Mapping](../../docs/design/TOKENS-TO-COMPONENTS.md)
- [Accessibility Findings](../../docs/design/A11Y-FINDINGS.md)
        `,
      },
    },
  },
};

export default meta;
