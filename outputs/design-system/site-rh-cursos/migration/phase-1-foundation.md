# Phase 1: Foundation — Token Deployment
## Zero Visual Changes, Maximum Safety

> **Duration:** 1-2 weeks (1 sprint)  
> **Effort:** 2-3 developer hours  
> **Risk:** 🟢 LOW  
> **Lead:** Frontend team  

---

## 🎯 Objective

Deploy design token infrastructure into the codebase with **zero visual changes** to create a proven, safe foundation before any component refactoring in Phases 2-3.

### Success Criteria
✅ CSS variables available globally (`--color-primary`, `--spacing-md`, etc.)  
✅ Tailwind config accepts token structure  
✅ Zero visual regressions (site looks identical)  
✅ Token files committed to `src/design-tokens/`  
✅ Build pipeline passes without errors  

---

## 📋 Pre-Flight Checklist

Before starting Phase 1:

- [ ] Team reviewed token formats: `tokens.yaml`, `tokens.css`, `tokens.json`, `tokens.tailwind.js`
- [ ] Design tokens already extracted (see `outputs/design-system/site-rh-cursos/tokens/`)
- [ ] 96.5% token coverage validated
- [ ] Rollback plan understood (revert imports = zero risk)
- [ ] QA environment available for testing

---

## 🚀 Implementation Tasks

### Task 1.1: Organize Token Files
**Time: 10 min**

1. Create directory structure:
```bash
mkdir -p src/design-tokens
```

2. Copy token files from audit outputs:
```bash
cp outputs/design-system/site-rh-cursos/tokens/tokens.css src/design-tokens/
cp outputs/design-system/site-rh-cursos/tokens/tokens.json src/design-tokens/
cp outputs/design-system/site-rh-cursos/tokens/tokens.tailwind.js src/design-tokens/
cp outputs/design-system/site-rh-cursos/tokens/tokens.dtcg.json src/design-tokens/
cp outputs/design-system/site-rh-cursos/tokens/tokens.yaml src/design-tokens/
```

3. Verify files exist:
```bash
ls -la src/design-tokens/
```

✅ **Checkpoint:** All 5 token files in `src/design-tokens/`

---

### Task 1.2: Import CSS Tokens in Layout
**Time: 15 min**

1. Open `src/app/layout.tsx` (or your main layout component)

2. Add CSS import at the very top:
```typescript
import '../design-tokens/tokens.css'
// ... existing imports
```

3. Example (your actual structure may vary):
```typescript
// src/app/layout.tsx
import '../design-tokens/tokens.css'  // ← Add this line
import type { Metadata } from 'next'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'site-rh-cursos',
  // ...
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

✅ **Checkpoint:** CSS tokens imported in main layout

---

### Task 1.3: Configure Tailwind with Token Helper
**Time: 20 min**

1. Open `tailwind.config.ts` (or `.js`)

2. Import token helper:
```typescript
import { tokens } from './src/design-tokens/tokens.tailwind.js'
```

3. Extend theme with tokens:
```typescript
import type { Config } from 'tailwindcss'
import { tokens } from './src/design-tokens/tokens.tailwind.js'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: tokens.colors,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,
      fontWeight: tokens.fontWeight,
      lineHeight: tokens.lineHeight,
    },
  },
  plugins: [],
}

export default config
```

✅ **Checkpoint:** Tailwind config extended with all token categories

---

### Task 1.4: Verify CSS Variables Globally
**Time: 10 min**

1. Start dev server:
```bash
npm run dev
# or yarn dev
```

2. Open browser DevTools (F12)

3. Go to Inspector tab, select `<html>` element

4. In Styles panel, look for `:root` section

5. Verify CSS variables are present:
```css
:root {
  --color-neutral-0: #ffffff;
  --color-primary: #0066CC;
  --spacing-md: 16px;
  --radius-lg: 12px;
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --font-family-sans: -apple-system, BlinkMacSystemFont, ...
  /* ... 50+ more variables ... */
}
```

✅ **Checkpoint:** CSS variables globally available

---

### Task 1.5: Verify Tailwind Can Use Tokens
**Time: 10 min**

1. Add a test component to verify Tailwind integration:
```typescript
// src/components/token-test.tsx (temporary)
export function TokenTest() {
  return (
    <div className="bg-primary p-lg text-foreground rounded-lg shadow-card">
      <h2 className="text-2xl font-bold">Token System Live</h2>
      <p className="text-sm text-foreground-muted">
        If you see this styled card with token colors, tokens are working!
      </p>
    </div>
  )
}
```

2. Add to a page temporarily to test

3. Verify styling works (background should be primary blue, padding matches `--spacing-lg`, text colors correct)

✅ **Checkpoint:** Tailwind tokens working in components

---

### Task 1.6: Run Tests & Build
**Time: 15 min**

1. Run unit tests:
```bash
npm run test
# Ensure existing tests still pass
```

2. Run type checking:
```bash
npm run typecheck
# Should pass with no new errors
```

3. Run linting:
```bash
npm run lint
# Should pass with no new errors
```

4. Build project:
```bash
npm run build
# Should complete successfully
```

✅ **Checkpoint:** Build pipeline passes, no regressions

---

### Task 1.7: Visual Regression Testing
**Time: 20 min**

1. Take screenshots of key pages (before already done in audit):
   - Homepage
   - Course listing page
   - User dashboard
   - Blog page
   - Any page with components

2. Compare before/after screenshots

3. **Expected result:** Pixel-perfect identical (no visual changes)

4. If any differences found:
   - Check CSS variable colors match previous hardcoded values
   - Compare computed styles in DevTools
   - Document differences (should be none)

✅ **Checkpoint:** Zero visual regressions detected

---

### Task 1.8: Create Token Documentation
**Time: 15 min**

Create `TOKENS.md` in your docs or storybook:

```markdown
# Design Tokens

## Overview

This project uses W3C Design Tokens (DTCG 2025.10) for consistent styling.

## Token Categories

### Colors

**Neutral Scale:** `--color-neutral-0` through `--color-neutral-900`  
**Brand:** `--color-primary`, `--color-primary-hover`, `--color-primary-foreground`  
**Status:** `--color-status-success`, `--color-status-warning`, `--color-status-error`  
**Semantic:** `--color-background`, `--color-foreground`, `--color-border`  

### Spacing

`--spacing-xs` (4px) → `--spacing-3xl` (64px)

### Border Radius

`--radius-none` (0) → `--radius-full` (9999px)

### Shadows

`--shadow-soft`, `--shadow-sm`, `--shadow-card`, `--shadow-lg`

### Typography

**Families:** `--font-family-sans`, `--font-family-display`  
**Sizes:** `--font-size-xs` (12px) → `--font-size-6xl` (60px)  
**Weights:** `--font-weight-normal` (400) → `--font-weight-bold` (700)  
**Line Heights:** `--line-height-tight`, `--line-height-normal`, `--line-height-loose`

## Usage

### In CSS

\`\`\`css
.my-component {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}
\`\`\`

### In Tailwind

\`\`\`jsx
<div className="bg-primary p-md rounded-lg shadow-card">
  Content
</div>
\`\`\`

### In JavaScript

\`\`\`typescript
import tokens from '@/design-tokens/tokens.json'

const primaryColor = tokens.colors.primary.base // #0066CC
const spacing = tokens.spacing.md // "16px"
\`\`\`

## Token Locations

- **Source of truth:** \`src/design-tokens/tokens.yaml\`
- **CSS:** \`src/design-tokens/tokens.css\`
- **Tailwind:** \`src/design-tokens/tokens.tailwind.js\`
- **JavaScript:** \`src/design-tokens/tokens.json\`
- **W3C DTCG:** \`src/design-tokens/tokens.dtcg.json\`

## Next Steps

Phase 2 (Consolidation) will refactor components to use tokens systematically.
See \`migration-strategy.md\` for full timeline.
```

✅ **Checkpoint:** Token documentation created

---

## ✅ Phase 1 Completion Checklist

- [ ] Token files copied to `src/design-tokens/`
- [ ] CSS import added to main layout
- [ ] Tailwind config extended with tokens
- [ ] CSS variables verified in DevTools
- [ ] Tailwind token classes work (test component)
- [ ] All tests pass
- [ ] Build completes successfully
- [ ] Zero visual regressions detected
- [ ] Token documentation created
- [ ] Changes committed to git

---

## 🔄 Rollback Procedure (if needed)

**If Phase 1 causes issues:**

1. **Revert CSS import:**
```diff
// src/app/layout.tsx
- import '../design-tokens/tokens.css'
  import type { Metadata } from 'next'
```

2. **Revert Tailwind config:**
```bash
git checkout -- tailwind.config.ts
```

3. **Remove token files:**
```bash
rm -rf src/design-tokens/
```

4. **Rebuild & verify:**
```bash
npm run build
```

**Effort:** 10 minutes  
**Risk:** None — component code unchanged, only infrastructure

---

## 🎓 Phase 1 Lessons Learned (Post-Mortem)

After Phase 1 completion, document:

- [ ] Any unexpected token naming issues
- [ ] Tailwind integration challenges
- [ ] CSS variable cascade issues
- [ ] Build time impact
- [ ] Team feedback on token system
- [ ] Anything to adjust before Phase 2

---

## 📞 Support & Questions

**If tokens aren't showing:**

1. Verify import in layout:
```bash
grep "design-tokens/tokens.css" src/app/layout.tsx
```

2. Check file exists:
```bash
ls src/design-tokens/tokens.css
```

3. Check build output:
```bash
npm run build 2>&1 | grep -i token
```

4. Clear build cache:
```bash
rm -rf .next node_modules/.cache
npm run build
```

---

## 🎉 What's Next

✅ **Phase 1 Complete:** Token infrastructure deployed  
↓  
📍 **Phase 2:** Consolidate forms & cards (2-3 weeks)  
↓  
📍 **Phase 3:** CVA adoption & long-tail cleanup (2-3 weeks)  
↓  
📍 **Phase 4:** CI/CD enforcement (1 week)  

---

**Phase 1 Guide**  
Generated by Uma (UX Design Expert) | Design System Maturity: 8.2/10  
Next: `*build phase-2` after Phase 1 completes
