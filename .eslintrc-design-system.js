/**
 * ESLint Configuration: Design System Compliance
 *
 * Rules to enforce:
 * 1. No hex colors directly in components (use design tokens instead)
 * 2. No inline styles with colors (use Tailwind classes)
 * 3. Border-radius must use token scale (rounded-button, rounded-card, etc)
 * 4. Shadow values must use design tokens (shadow-standard, shadow-ambient, etc)
 *
 * Usage:
 *   npx eslint --config .eslintrc-design-system.js src/components/
 *   npm run lint:design-system
 */

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react'],
  rules: {
    /**
     * Rule 1: No hex colors in JSX className
     *
     * ❌ Bad:
     *   <div style={{ color: '#235875' }} />
     *   <div style={{ backgroundColor: '#fff' }} />
     *
     * ✅ Good:
     *   <div className="text-trust-keith-teal" />
     *   <div className="bg-surface-white" />
     */
    'no-restricted-syntax': [
      'error',
      {
        selector: "JSXAttribute[name='style'] > JSXExpressionContainer > ObjectExpression > Property",
        message: `
          ❌ Inline color styles violate design system.

          Use Tailwind classes instead:
            ❌ style={{ color: '#235875' }}
            ✅ className="text-trust-keith-teal"

          For complex styles, use CVA (class-variance-authority):
            ✅ className={cva('text-xs font-semibold', {
              variants: { variant: { primary: 'text-bright-blue' } }
            })}

          See: docs/design/TOKENS-TO-COMPONENTS.md
        `,
        test: (node) => {
          if (
            node.key.name === 'color' ||
            node.key.name === 'backgroundColor' ||
            node.key.name === 'borderColor' ||
            node.key.name === 'fill' ||
            node.key.name === 'stroke'
          ) {
            const value = node.value.value || node.value.raw || '';
            return typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value);
          }
          return false;
        },
      },
    ],

    /**
     * Rule 2: No hex in string literals
     *
     * ❌ Bad:
     *   className="text-[#235875]"
     *   className="bg-[#fff]"
     *
     * ✅ Good:
     *   className="text-trust-keith-teal"
     *   className="bg-surface-white"
     */
    'react/no-unknown-property': [
      'error',
      {
        ignore: ['className'],
      },
    ],
  },

  overrides: [
    {
      files: ['src/components/**/*.{tsx,ts}'],
      rules: {
        /**
         * For component files: Stricter rules
         */
        'no-restricted-patterns': [
          'warn',
          {
            selector: 'Literal[value=/^#[0-9a-f]{3,8}$/i]',
            message: `
              ⚠️ Hex color literal detected in component.
              Use Tailwind token names:
                ❌ '#235875'
                ✅ 'text-trust-keith-teal'

              Available colors:
                - trust-keith-teal (#235875)
                - bright-blue (#4d65ff)
                - keith-dark-blue (#194359)
                - surface-white (#ffffff)
                - surface-light (#fafafa)
                - text-primary (#222525)
                - success (#068466)
                - danger (#ea384c)

              See: src/design-tokens/tokens.tailwind.js
            `,
          },
        ],
      },
    },
  ],
};
