# Phase 1 Execution Plan — Ready-to-Execute
## Token Deployment with Zero Visual Changes

> **Status:** READY FOR TEAM EXECUTION  
> **Generated:** 2026-06-22  
> **Effort:** 2-3 hours  
> **Risk:** 🟢 LOW  

---

## ⚠️ Important: Existing Token System Detection

**Your project already has a mature token system in place:**

| Prefix | Status | Notes |
|--------|--------|-------|
| `--ea-*` | Active | Executive Precision system (global colors, buttons, cards) |
| `--m3-*` | Active | Material Design 3 tokens |
| `--color-*` | New | Design System tokens (to be added, non-conflicting) |
| `--spacing-*` | New | Spacing scale (to be added) |

✅ **Good news:** The new tokens won't conflict with existing ones because they use different prefixes.

**Strategy for Phase 1:** 
- Import new tokens alongside existing system
- Existing components continue using `--ea-*` tokens
- New components (Phase 2+) will use `--color-*` tokens
- Gradual migration in Phases 2-4

---

## 🚀 Quickstart: Copy-Paste Commands

### Step 1: Copy Token Files (2 min)

```bash
# From project root
mkdir -p src/design-tokens

cp outputs/design-system/site-rh-cursos/tokens/tokens.css src/design-tokens/
cp outputs/design-system/site-rh-cursos/tokens/tokens.json src/design-tokens/
cp outputs/design-system/site-rh-cursos/tokens/tokens.tailwind.js src/design-tokens/
cp outputs/design-system/site-rh-cursos/tokens/tokens.yaml src/design-tokens/
cp outputs/design-system/site-rh-cursos/tokens/tokens.dtcg.json src/design-tokens/

# Verify
ls -la src/design-tokens/
```

Expected output: 5 files (tokens.css, tokens.json, tokens.js, tokens.yaml, tokens.dtcg.json)

---

### Step 2: Import CSS Tokens in Global Styles (5 min)

Open `src/styles/globals.css`:

Find this line at the very top:
```css
@tailwind base;
```

**BEFORE:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**AFTER:**
```css
/* Design System Tokens (Phase 1 — Foundation) */
@import '../design-tokens/tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

✅ This imports the new token variables **before** Tailwind, making them available globally.

---

### Step 3: Extend Tailwind Config (10 min)

Open `tailwind.config.ts`:

Add this import at the top:
```typescript
import { tokens } from './src/design-tokens/tokens.tailwind.js'
```

Then update the `extend` section in `theme`:

**BEFORE (current):**
```typescript
theme: {
  extend: {
    colors: {
      // existing colors...
    },
    // ... other properties
  }
}
```

**AFTER (with tokens):**
```typescript
theme: {
  extend: {
    colors: {
      // KEEP existing colors ↓
      background: "var(--ea-color-background)",
      // ... all existing colors ...
      
      // ADD new design system colors ↓
      ...tokens.colors,
    },
    spacing: tokens.spacing,
    borderRadius: tokens.borderRadius,
    boxShadow: tokens.boxShadow,
    fontFamily: {
      ...fontFamily, // keep existing
      ...tokens.fontFamily,
    },
    fontSize: {
      // KEEP existing Material Design 3 sizes
      // ...
      // ADD new token sizes
      ...tokens.fontSize,
    },
    fontWeight: tokens.fontWeight,
    lineHeight: tokens.lineHeight,
  }
}
```

**Full example after changes:**

```typescript
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
          DEFAULT: "var(--ea-color-primary)",
          foreground: "var(--ea-color-on-primary)"
        },
        // ... all other existing colors ...
        
        // New design system tokens (add)
        ...tokens.colors,
      },
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
      fontFamily: {
        sans: ["var(--ea-font-sans)"],
        display: ["var(--ea-font-display)"],
        ...tokens.fontFamily,
      },
      fontSize: {
        // Keep existing Material Design 3 sizes
        micro: ["var(--ea-font-size-micro)", { lineHeight: "1.4" }],
        badge: ["var(--ea-font-size-badge)", { lineHeight: "1.4" }],
        // ... all existing sizes ...
        
        // Add new design tokens sizes
        ...tokens.fontSize,
      },
      fontWeight: tokens.fontWeight,
      lineHeight: tokens.lineHeight,
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
```

---

## ✅ Validation Checklist

After completing Steps 1-3:

### Build & Type Check
```bash
# Build
npm run build

# Type check
npm run typecheck

# Lint
npm run lint

# All should pass with NO new errors
```

✅ **Expected:** All pass, no errors

---

### Verify CSS Variables Exist (F12 DevTools)

1. Open browser: http://localhost:3000
2. Press F12 (DevTools)
3. Go to **Inspector** tab
4. Right-click on `<html>` element → Inspect
5. In **Styles** panel, look for `:root {` section
6. Scroll through and verify you see:

```css
:root {
  /* Existing EA tokens */
  --ea-color-primary: #002b5b;
  /* ... */
  
  /* NEW Design System tokens */
  --color-primary: #0066CC;
  --color-neutral-0: #ffffff;
  --spacing-md: 16px;
  --radius-lg: 12px;
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  /* ... 50+ more new tokens ... */
}
```

✅ **Expected:** Both old and new tokens visible

---

### Visual Regression Test (Critical)

Take screenshots of key pages **before and after** Step 3:

1. **Homepage** - Should look identical
2. **Course listing** - Should look identical  
3. **User dashboard** - Should look identical
4. **Blog page** - Should look identical

```bash
# Use your favorite screenshot tool
# Or: https://www.diffchecker.com for visual comparison
```

✅ **Expected:** Zero visual differences (pixels identical)

---

### Tailwind Classes Work

Create a temporary test file: `src/components/token-test.tsx`

```typescript
export function TokenTest() {
  return (
    <div className="bg-primary p-4 text-foreground rounded-lg shadow-card">
      <h2 className="text-2xl font-semibold">Token System Live</h2>
      <p className="text-sm text-neutral-500">
        If you see a styled card with token colors, tokens are working!
      </p>
    </div>
  )
}
```

Add to a page temporarily:

```typescript
// In a page or component
import { TokenTest } from '@/components/token-test'

export default function TestPage() {
  return (
    <div>
      <TokenTest />
      {/* rest of page */}
    </div>
  )
}
```

Visit that page in browser. You should see:
- ✅ Blue background (primary color)
- ✅ Dark text (foreground)
- ✅ Rounded corners (radius)
- ✅ Subtle shadow

Then **delete the test file** when done.

---

## 🔄 If Something Goes Wrong

### Problem: Build fails
```bash
# Solution 1: Clear cache
rm -rf .next node_modules/.cache
npm run build

# Solution 2: Check import path
grep -r "tokens.tailwind.js" src/
# Should show: ./src/design-tokens/tokens.tailwind.js
```

### Problem: CSS variables not showing
```bash
# Verify import in globals.css
grep "design-tokens/tokens.css" src/styles/globals.css

# Verify file exists
ls src/design-tokens/tokens.css
```

### Problem: Tailwind colors conflicting
**Solution:** The new tokens use `--color-*` and old uses `--ea-*`, so no conflict.
- Old components: use `bg-background` (from `--ea-color-background`)
- New components: use new token classes as added in Phase 2

### Problem: Type errors for tokens
```bash
# Regenerate types
npm run typecheck

# If still broken: delete node_modules/.cache
rm -rf node_modules/.cache
npm run typecheck
```

---

## 🚀 Quick Rollback (if needed)

**If Phase 1 causes unfixable issues:**

```bash
# 1. Revert CSS import
# Edit src/styles/globals.css, remove:
#   @import '../design-tokens/tokens.css';

# 2. Revert Tailwind config
git checkout -- tailwind.config.ts

# 3. Remove token files
rm -rf src/design-tokens/

# 4. Rebuild
npm run build

# Total time: 10 minutes
```

**Note:** No component code changed, only build configuration → zero risk.

---

## 📋 Phase 1 Sign-Off Checklist

Complete this as you finish Phase 1:

- [ ] Token files copied to `src/design-tokens/` (5 files exist)
- [ ] CSS import added to `src/styles/globals.css`
- [ ] Tailwind config extended with `tokens.*` (colors, spacing, etc.)
- [ ] `npm run build` succeeds with no new errors
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] CSS variables visible in DevTools `:root {}`
- [ ] Token test component renders with styles
- [ ] Visual regression test: zero differences
- [ ] Temporary test files deleted
- [ ] Changes committed to git

---

## 📍 Next Phase

After Phase 1 completes:

1. **Merge PR** to main
2. **Update .state.yaml:** Set `phase: "phase_1_complete"`
3. **Start Phase 2:** Form field consolidation

Command: `*build phase-2` (when ready)

---

## 💡 Pro Tips

**Tip 1: Git workflow for Phase 1**
```bash
# Create feature branch
git checkout -b feat/design-tokens-phase-1

# Make changes per steps 1-3

# Commit
git add src/design-tokens/ src/styles/globals.css tailwind.config.ts
git commit -m "feat: deploy design tokens — Phase 1 foundation (zero visual changes)"

# Push & create PR
git push origin feat/design-tokens-phase-1
```

**Tip 2: Keep existing tokens intact**

Your existing `--ea-*` tokens are production-proven. The new `--color-*` tokens **coexist**. Nothing breaks.

**Tip 3: Team communication**

Post in team chat:
```
🎨 Phase 1 Starting: Design tokens deployment
- Zero visual changes
- New CSS variables available
- Rollback takes 10 min if needed
- Timeline: ~3 hours

No component changes in this phase!
```

---

## Questions?

**CSS variables not working?**
→ Check `:root { --color-primary: ... }` in DevTools

**Tailwind classes not recognizing new tokens?**
→ Clear build cache: `rm -rf .next`

**Want to see what tokens are available?**
→ Read `src/design-tokens/tokens.json` (JavaScript/TypeScript)

**Need dark mode?**
→ That's Phase 4 — tokens.css has `@media (prefers-color-scheme: dark)` stub ready

---

**Phase 1 Execution Plan**  
Ready for team execution | Generated: 2026-06-22 | Effort: 2-3 hours
