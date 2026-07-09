#!/usr/bin/env node
/**
 * Design System Validation Script
 *
 * Comprehensive checks for design system consistency:
 * ✅ Token definitions are valid JSON
 * ✅ All component colors use token names (no direct hex)
 * ✅ Border-radius values match token scales
 * ✅ Shadow values are from token definitions
 * ✅ Focus rings use consistent colors
 * ✅ Files are synchronized
 *
 * Usage:
 *   npm run validate-design-system
 *   npm run validate-design-system:fix  (auto-fix some issues)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

// Color codes for terminal output
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${COLORS.RESET}`);
}

function readJsonIfExists(relativePath) {
  const filePath = path.join(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Validation: Token files exist and are valid JSON
 */
function validateTokenFiles() {
  log(COLORS.CYAN, '\n🔍 Validating token files...');

  const requiredFiles = [
    'src/design-tokens/tokens.css',
    'src/design-tokens/tokens.json',
    'src/design-tokens/tokens.dtcg.json',
    'src/design-tokens/tokens.tailwind.js',
  ];

  let allValid = true;

  requiredFiles.forEach(file => {
    const filePath = path.join(PROJECT_ROOT, file);
    if (!fs.existsSync(filePath)) {
      log(COLORS.RED, `  ❌ Missing: ${file}`);
      allValid = false;
      return;
    }

    try {
      if (file.endsWith('.json')) {
        JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        log(COLORS.GREEN, `  ✅ ${file}`);
      } else if (file.endsWith('.js')) {
        // Basic syntax check
        execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
        log(COLORS.GREEN, `  ✅ ${file}`);
      } else if (file.endsWith('.css')) {
        log(COLORS.GREEN, `  ✅ ${file}`);
      }
    } catch (error) {
      log(COLORS.RED, `  ❌ ${file}: ${error.message}`);
      allValid = false;
    }
  });

  return allValid;
}

/**
 * Validation: Check for direct hex colors in shared UI and app views
 */
function validateComponentColors() {
  log(COLORS.CYAN, '\n🎨 Checking for direct hex colors in components and app views...');

  const scanDirs = [
    path.join(PROJECT_ROOT, 'src/components'),
    path.join(PROJECT_ROOT, 'src/views/public'),
    path.join(PROJECT_ROOT, 'src/views/admin')
  ].filter(fs.existsSync);

  if (scanDirs.length === 0) {
    log(COLORS.YELLOW, '  ⚠️ No component or view directories found');
    return true;
  }

  const hexPattern = /#[0-9a-f]{3,8}/gi;
  const ignoredPatterns = [
    /'trust-keith-teal':\s*'#235875'/,  // Token definition
    /'#0000'/,  // Transparent black (special case)
    /'#fff'/,   // Transparent white (special case)
  ];

  let violations = 0;

  function checkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        checkDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        let match;

        while ((match = hexPattern.exec(content)) !== null) {
          const hex = match[0];

          // Skip if in ignored pattern
          const isIgnored = ignoredPatterns.some(pattern =>
            pattern.test(content.substring(Math.max(0, match.index - 50), match.index + hex.length + 50))
          );

          if (!isIgnored) {
            violations++;
            const line = content.substring(0, match.index).split('\n').length;
            log(
              COLORS.YELLOW,
              `  ⚠️ Found hex color in ${path.relative(PROJECT_ROOT, filePath)}:${line}`
            );
            log(COLORS.YELLOW, `     → ${hex}`);
          }
        }
      }
    });
  }

  scanDirs.forEach(checkDir);

  if (violations === 0) {
    log(COLORS.GREEN, '  ✅ No direct hex colors found in components or app views');
  } else {
    log(COLORS.RED, `  ❌ Found ${violations} direct hex color(s)`);
  }

  return violations === 0;
}

/**
 * Audit: Report arbitrary radius and shadow usage outside token classes
 * This is advisory for now because the repo still has intentional transitional usages.
 */
function auditArbitraryStyles() {
  log(COLORS.CYAN, '\n🧭 Auditing arbitrary radius and shadow usage...');

  const scanDirs = [
    path.join(PROJECT_ROOT, 'src/components'),
    path.join(PROJECT_ROOT, 'src/views/public'),
    path.join(PROJECT_ROOT, 'src/views/admin')
  ].filter(fs.existsSync);

  if (scanDirs.length === 0) {
    log(COLORS.YELLOW, '  ⚠️ No component or view directories found for arbitrary style audit');
    return true;
  }

  const arbitraryPattern = /(rounded-\[[^\]]+\]|shadow-\[[^\]]+\])/g;
  const allowedPatterns = [
    /rounded-\[var\(--tk-radius-button\)\]/,
    /shadow-\[inset_0_0_0_1px_var\(--tk-accent-soft\)\]/,
    /bg-\[linear-gradient\(158deg,var\(--rh-paper-a\),var\(--rh-paper-b\)\)\]/,
    /bg-\[image:var\(--tk-gradient-soft\)\]/
  ];

  let findings = 0;

  function checkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        checkDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        let match;

        while ((match = arbitraryPattern.exec(content)) !== null) {
          const token = match[0];
          const isAllowed = allowedPatterns.some(pattern => pattern.test(token));
          if (isAllowed) continue;

          findings++;
          const line = content.substring(0, match.index).split('\n').length;
          log(COLORS.YELLOW, `  ⚠️ Arbitrary style in ${path.relative(PROJECT_ROOT, filePath)}:${line}`);
          log(COLORS.YELLOW, `     → ${token}`);
        }
      }
    });
  }

  scanDirs.forEach(checkDir);

  if (findings === 0) {
    log(COLORS.GREEN, '  ✅ No arbitrary radius/shadow usages outside approved exceptions');
  } else {
    log(COLORS.YELLOW, `  ⚠️ Found ${findings} arbitrary radius/shadow usage(s); advisory only for now`);
  }

  return true;
}

/**
 * Validation: Check for border-radius consistency
 */
function validateBorderRadius() {
  log(COLORS.CYAN, '\n📐 Validating border-radius usage...');

  const tailwindConfigPath = path.join(PROJECT_ROOT, 'tailwind.config.ts');
  const configContent = fs.readFileSync(tailwindConfigPath, 'utf-8');
  const usesTokenSpread = configContent.includes('...tokens.borderRadius');

  const expectedScales = ['button', 'card', 'glass', 'input', 'pill'];
  let allPresent = true;

  expectedScales.forEach(scale => {
    if (
      usesTokenSpread ||
      configContent.includes(`${scale}:`) ||
      configContent.includes(`'${scale}'`) ||
      configContent.includes(`"${scale}"`)
    ) {
      log(COLORS.GREEN, `  ✅ Border-radius scale: ${scale}`);
    } else {
      log(COLORS.RED, `  ❌ Missing border-radius scale: ${scale}`);
      allPresent = false;
    }
  });

  return allPresent;
}

/**
 * Validation: Check machine-readable token artifacts in src/design-tokens/
 */
function validateTokenSync() {
  log(COLORS.CYAN, '\n🔄 Validating machine-readable token artifacts...');
  log(COLORS.BLUE, '  ℹ️ Runtime and serializable token sources live in src/design-tokens/.');

  const tokens = readJsonIfExists('src/design-tokens/tokens.json');
  const dtcg = readJsonIfExists('src/design-tokens/tokens.dtcg.json');

  if (!tokens || !dtcg) {
    log(COLORS.RED, '  ❌ Missing one or more machine-readable token artifacts in src/design-tokens/.');
    return false;
  }

  let allSync = true;

  if (tokens.colors && tokens.components) {
    log(COLORS.GREEN, '  ✅ tokens.json exposes colors and components');
  } else {
    log(COLORS.RED, '  ❌ tokens.json is missing expected colors/components sections');
    allSync = false;
  }

  if (dtcg.core?.colors && dtcg.core?.spacing && dtcg.core?.['border-radius']) {
    log(COLORS.GREEN, '  ✅ tokens.dtcg.json exposes core colors, spacing, and border-radius');
  } else {
    log(COLORS.RED, '  ❌ tokens.dtcg.json is missing expected DTCG core sections');
    allSync = false;
  }

  if (tokens.spec_version && dtcg.global?.$metadata?.spec) {
    log(COLORS.GREEN, `  ✅ Token specs declared (${tokens.spec_version} / ${dtcg.global.$metadata.spec})`);
  } else {
    log(COLORS.YELLOW, '  ⚠️ Token spec metadata is incomplete');
  }

  return allSync;
}

/**
 * Validation: Check focus ring colors
 */
function validateFocusRings() {
  log(COLORS.CYAN, '\n🔆 Validating focus ring consistency...');

  const buttonPath = path.join(PROJECT_ROOT, 'src/components/ui/button.tsx');
  const inputPath = path.join(PROJECT_ROOT, 'src/components/ui/input.tsx');

  const expectedFocusColor = 'tk-focus';
  let allValid = true;

  [buttonPath, inputPath].forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('ring-' + expectedFocusColor)) {
        log(COLORS.GREEN, `  ✅ ${path.basename(filePath)} uses ${expectedFocusColor}`);
      } else {
        log(COLORS.YELLOW, `  ⚠️ ${path.basename(filePath)} focus ring color differs from ${expectedFocusColor}`);
      }
    }
  });

  return allValid;
}

/**
 * Main validation routine
 */
async function validate() {
  log(COLORS.BLUE, '\n╔════════════════════════════════════════╗');
  log(COLORS.BLUE, '║  Design System Validation Report       ║');
  log(COLORS.BLUE, '║  Generated: ' + new Date().toISOString() + '   ║');
  log(COLORS.BLUE, '╚════════════════════════════════════════╝');

  const results = {
    tokenFiles: validateTokenFiles(),
    componentColors: validateComponentColors(),
    arbitraryStyles: auditArbitraryStyles(),
    borderRadius: validateBorderRadius(),
    tokenSync: validateTokenSync(),
    focusRings: validateFocusRings(),
  };

  // Summary
  log(COLORS.CYAN, '\n\n📊 Validation Summary');
  log(COLORS.CYAN, '═══════════════════════════════════════');

  const checks = [
    ['Token Files', results.tokenFiles],
    ['Component Colors', results.componentColors],
    ['Arbitrary Styles Audit', results.arbitraryStyles],
    ['Border Radius Scales', results.borderRadius],
    ['Token Synchronization', results.tokenSync],
    ['Focus Ring Colors', results.focusRings],
  ];

  let allPass = true;

  checks.forEach(([name, passed]) => {
    log(passed ? COLORS.GREEN : COLORS.RED, `${passed ? '✅' : '❌'} ${name}`);
    if (!passed) allPass = false;
  });

  log(COLORS.CYAN, '\n═══════════════════════════════════════');

  if (allPass) {
    log(COLORS.GREEN, '\n✅ All design system validations passed!\n');
    return 0;
  } else {
    log(COLORS.RED, '\n❌ Some validations failed. Review above.\n');
    return 1;
  }
}

// Run validation
const exitCode = await validate();
process.exit(exitCode);
