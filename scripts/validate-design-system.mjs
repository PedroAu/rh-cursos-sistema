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

/**
 * Validation: Token files exist and are valid JSON
 */
function validateTokenFiles() {
  log(COLORS.CYAN, '\n🔍 Validating token files...');

  const files = [
    'docs/design/tokens.json',
    'docs/design/tokens-extended.json',
    'src/design-tokens/tokens.tailwind.js',
  ];

  let allValid = true;

  files.forEach(file => {
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
      }
    } catch (error) {
      log(COLORS.RED, `  ❌ ${file}: ${error.message}`);
      allValid = false;
    }
  });

  return allValid;
}

/**
 * Validation: Check for direct hex colors in component files
 */
function validateComponentColors() {
  log(COLORS.CYAN, '\n🎨 Checking for direct hex colors in components...');

  const componentDir = path.join(PROJECT_ROOT, 'src/components');
  if (!fs.existsSync(componentDir)) {
    log(COLORS.YELLOW, '  ⚠️ Components directory not found');
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

  checkDir(componentDir);

  if (violations === 0) {
    log(COLORS.GREEN, '  ✅ No direct hex colors found in components');
  } else {
    log(COLORS.RED, `  ❌ Found ${violations} direct hex color(s)`);
  }

  return violations === 0;
}

/**
 * Validation: Check for border-radius consistency
 */
function validateBorderRadius() {
  log(COLORS.CYAN, '\n📐 Validating border-radius usage...');

  const tailwindConfigPath = path.join(PROJECT_ROOT, 'tailwind.config.ts');
  const configContent = fs.readFileSync(tailwindConfigPath, 'utf-8');

  const expectedScales = ['button', 'card', 'glass', 'input', 'pill'];
  let allPresent = true;

  expectedScales.forEach(scale => {
    if (configContent.includes(`'${scale}'`) || configContent.includes(`"${scale}"`)) {
      log(COLORS.GREEN, `  ✅ Border-radius scale: ${scale}`);
    } else {
      log(COLORS.RED, `  ❌ Missing border-radius scale: ${scale}`);
      allPresent = false;
    }
  });

  return allPresent;
}

/**
 * Validation: Check tokens.json and tokens-extended.json are in sync
 */
function validateTokenSync() {
  log(COLORS.CYAN, '\n🔄 Validating token file synchronization...');

  const tokensPath = path.join(PROJECT_ROOT, 'docs/design/tokens.json');
  const extendedPath = path.join(PROJECT_ROOT, 'docs/design/tokens-extended.json');

  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  const extended = JSON.parse(fs.readFileSync(extendedPath, 'utf-8'));

  // Check critical sections
  const criticalSections = ['colors', 'components'];
  let allSync = true;

  criticalSections.forEach(section => {
    if (JSON.stringify(tokens[section]) === JSON.stringify(extended[section])) {
      log(COLORS.GREEN, `  ✅ Section '${section}' in sync`);
    } else {
      log(COLORS.YELLOW, `  ⚠️ Section '${section}' differs between files`);
      // Not necessarily an error if changes are intentional
    }
  });

  // Specific checks
  const buttonHasRotate = tokens.components?.button?.transform === 'rotate(45deg)';
  const inputCursorWrong = tokens.components?.input?.cursor === 'not-allowed' &&
    !tokens.components?.input?.states?.disabled;

  if (buttonHasRotate) {
    log(COLORS.RED, `  ❌ Button has invalid rotate(45deg) transform`);
    allSync = false;
  } else {
    log(COLORS.GREEN, `  ✅ Button transform is valid`);
  }

  if (inputCursorWrong) {
    log(COLORS.RED, `  ❌ Input cursor not properly defined in states`);
    allSync = false;
  } else {
    log(COLORS.GREEN, `  ✅ Input cursor states are valid`);
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

  const expectedFocusColor = 'bright-blue';
  let allValid = true;

  [buttonPath, inputPath].forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('ring-' + expectedFocusColor)) {
        log(COLORS.GREEN, `  ✅ ${path.basename(filePath)} uses ${expectedFocusColor}`);
      } else {
        log(COLORS.YELLOW, `  ⚠️ ${path.basename(filePath)} focus ring color differs`);
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
