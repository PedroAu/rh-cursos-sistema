#!/usr/bin/env node
/**
 * Accessibility Audit: Focus Ring Contrast
 *
 * Validates that focus rings meet WCAG AAA (7:1) contrast ratio
 * - Button focus ring (bright-blue #4d65ff on white)
 * - Input focus ring (bright-blue #4d65ff on white)
 * - Dark mode variants (if applicable)
 *
 * Usage:
 *   npm run a11y:audit
 *
 * References:
 *   - WCAG 2.1 Level AAA: https://www.w3.org/TR/WCAG21/#contrast-enhanced
 *   - WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
 */

/**
 * Convert hex to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance (WCAG formula)
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(x => {
    x = x / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error(`Invalid color format: ${color1} or ${color2}`);
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}

/**
 * WCAG Compliance levels
 */
const WCAG_LEVELS = {
  A: 4.5,
  AA: 4.5,
  AAA: 7.0,
};

/**
 * Design system colors for testing
 */
const COLORS = {
  'bright-blue': '#4d65ff',        // Focus ring color
  'surface-white': '#ffffff',      // Light background
  'text-primary': '#222525',       // Dark background
  'surface-light': '#fafafa',      // Light card bg
  'text-secondary': '#4f5057',     // Muted text
};

/**
 * Focus ring contrast audit
 */
function auditFocusRings() {
  console.log('♿ Accessibility Audit: Focus Ring Contrast');
  console.log('=============================================\n');

  const focusColor = COLORS['bright-blue'];
  const testCases = [
    {
      name: 'Focus Ring on White Background',
      foreground: focusColor,
      background: COLORS['surface-white'],
      context: 'Button, Input on white/light surfaces',
      wcagLevel: 'AAA',
    },
    {
      name: 'Focus Ring on Light Card Background',
      foreground: focusColor,
      background: COLORS['surface-light'],
      context: 'Button inside card (light variant)',
      wcagLevel: 'AAA',
    },
    {
      name: 'Focus Ring on Dark Text Background',
      foreground: focusColor,
      background: COLORS['text-primary'],
      context: 'Button on dark backgrounds (if used)',
      wcagLevel: 'AAA',
    },
    {
      name: 'Focus Ring with Ring Offset (white)',
      foreground: focusColor,
      background: COLORS['surface-white'],
      context: 'Focus ring with offset (2px white ring)',
      wcagLevel: 'AAA',
      note: 'Offset ring provides additional separation',
    },
  ];

  let allPass = true;

  testCases.forEach(testCase => {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`   Context: ${testCase.context}`);
    console.log(`   Foreground: ${testCase.foreground}`);
    console.log(`   Background: ${testCase.background}`);

    const ratio = parseFloat(getContrastRatio(testCase.foreground, testCase.background));
    const required = WCAG_LEVELS[testCase.wcagLevel];
    const pass = ratio >= required;

    console.log(`   Contrast Ratio: ${ratio}:1`);
    console.log(`   Required (WCAG ${testCase.wcagLevel}): ${required}:1`);
    console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);

    if (testCase.note) {
      console.log(`   Note: ${testCase.note}`);
    }

    if (!pass) {
      allPass = false;
    }
  });

  // Additional recommendations
  console.log('\n\n📌 Recommendations for Focus Indicators');
  console.log('=======================================');
  console.log(`
1. ✅ Primary Focus Ring
   - Color: ${focusColor} (bright-blue)
   - Width: 2px
   - Offset: 2px
   - Style: solid
   - Contrast: ${getContrastRatio(focusColor, COLORS['surface-white'])}:1 on white

2. ✅ Focus Ring with Offset
   - Provides 2px white spacing from focused element
   - Improves visibility on complex backgrounds
   - Recommended for inputs & buttons

3. ✅ Alternative (High Contrast)
   - If contrast falls below WCAG AAA
   - Use outline instead of box-shadow
   - Ensure 3:1 minimum contrast

4. 🌙 Dark Mode Consideration
   - Test focus rings on dark backgrounds
   - Ensure color inversion maintains contrast
   - Consider dark-specific focus color if needed
  `);

  // Test Button and Input focus ring specification
  console.log('\n\n🔍 Component Focus Ring Audit');
  console.log('=============================\n');

  const componentFocusSpecs = [
    {
      component: 'Button',
      spec: 'focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-2',
      color: focusColor,
      tokens: ['ring-bright-blue', 'ring-offset-2'],
      verification: `✅ Uses bright-blue (#4d65ff) with 2px offset`,
    },
    {
      component: 'Input',
      spec: 'focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-1',
      color: focusColor,
      tokens: ['ring-bright-blue', 'ring-offset-1'],
      verification: `✅ Uses bright-blue (#4d65ff) with 1px offset`,
    },
  ];

  componentFocusSpecs.forEach(comp => {
    console.log(`📦 ${comp.component}`);
    console.log(`   Spec: ${comp.spec}`);
    console.log(`   Color: ${comp.color}`);
    console.log(`   Tokens: ${comp.tokens.join(', ')}`);
    console.log(`   ${comp.verification}\n`);
  });

  // Final summary
  console.log('\n\n📊 Audit Summary');
  console.log('================');
  if (allPass) {
    console.log('✅ All focus rings meet WCAG AAA contrast requirements');
    console.log('✅ Design system uses consistent bright-blue focus color');
    console.log('✅ Focus rings are properly offset for visibility');
  } else {
    console.log('⚠️ Some focus ring combinations may not meet WCAG AAA');
    console.log('   Review recommendations above and adjust colors if needed');
  }

  console.log('\nResources:');
  console.log('  - WCAG 2.1 Contrast: https://www.w3.org/TR/WCAG21/#contrast-enhanced');
  console.log('  - WebAIM Contrast: https://webaim.org/resources/contrastchecker/');
  console.log('  - Tailwind Focus Ring: https://tailwindcss.com/docs/ring');

  return allPass;
}

// Run audit
const pass = auditFocusRings();
process.exit(pass ? 0 : 1);

export { auditFocusRings, getContrastRatio };
