# Accessibility Remediation Checklist
**Created:** 2026-06-29
**Assignee:** @dev (Dex)
**Priority:** CRITICAL (Blocks Wave 3 QA Gate)
**Deadline:** 2026-06-30 (before Custom-1.2 QA gate)
**Status:** Ready for Implementation

---

## Overview

This checklist contains all identified accessibility issues found during Wave 1 a11y audit. All items are **critical** and must be fixed before Custom-1.2 QA gate can pass.

**Total Issues:** 1 critical
**Time Estimate:** ~15 minutes

---

## Critical Issues (Must Fix)

### Issue #1: Color Contrast Violation on Agenda Filter Button

**Severity:** CRITICAL (Serious Impact)
**Impact:** Blocks WCAG 2.1 AA compliance
**Affected Component:** Mantine Button ("Limpar Filtros")
**File:** `src/views/public/Agenda.tsx`
**Lines:** 244-255

#### Description

The "Limpar Filtros" (Clear Filters) button on the `/agenda` route has insufficient color contrast:
- **Current:** Bright blue text (#4285f4) on white background
- **Actual Ratio:** 3.56:1
- **Required Ratio:** 4.5:1 (WCAG 2.1 AA minimum)
- **Shortfall:** 0.94 points (21% below requirement)

#### Current Code

```jsx
<Button
  fullWidth
  variant="outline"
  color="rhBlue.9"
  leftSection={<X size={16} />}
  disabled={!activeFiltersCount}
  onClick={clearFilters}
>
  Limpar Filtros
</Button>
```

#### Fix Option A (Recommended): Darken Text Color

**Change line 248 from:**
```jsx
color="rhBlue.9"
```

**To:**
```jsx
color="rhBlue.10"
```

**Verification:**
- Test in browser: Check that contrast appears darker
- Run test: `npm run test:a11y`
- Confirm output: All 7 routes pass ✅

**Visual Impact:** Minimal — button text becomes slightly darker (imperceptible to most users)

**Risk Level:** LOW

#### Fix Option B: Use Filled Variant Instead

**Replace lines 247-255 with:**
```jsx
<Button
  fullWidth
  variant="filled"
  color="rhBlue.9"
  leftSection={<X size={16} />}
  disabled={!activeFiltersCount}
  onClick={clearFilters}
>
  Limpar Filtros
</Button>
```

**Verification:**
- Run test: `npm run test:a11y`
- Confirm all routes pass ✅
- Visual QA: Review button appearance (solid background instead of outline)

**Visual Impact:** MODERATE — button appearance changes significantly (solid fill vs outline)

**Risk Level:** MEDIUM (may need UI review from @architect)

#### Fix Option C: Create Theme Variant

**Add to Mantine theme config:**
```javascript
// In theme/mantine.config.ts or similar
colors: {
  rhBlueContrast: {
    9: "#1a5a99"  // Darker blue that meets 4.5:1 on white
  }
}
```

**Update component:**
```jsx
<Button
  fullWidth
  variant="outline"
  color="rhBlueContrast.9"
  leftSection={<X size={16} />}
  disabled={!activeFiltersCount}
  onClick={clearFilters}
>
  Limpar Filtros
</Button>
```

**Verification:**
- Run test: `npm run test:a11y`
- Confirm all routes pass ✅

**Visual Impact:** Minimal — consistent with existing design

**Risk Level:** LOW

---

## Implementation Checklist

### Step 1: Apply Fix

**Choose one of the options above (A recommended):**

- [ ] Option A: Change `rhBlue.9` to `rhBlue.10` on line 248
  - [ ] Edit `src/views/public/Agenda.tsx` line 248
  - [ ] Save file

OR

- [ ] Option B: Change `variant="outline"` to `variant="filled"`
  - [ ] Edit `src/views/public/Agenda.tsx` line 247
  - [ ] Save file
  - [ ] Notify @qa for UI review (optional)

OR

- [ ] Option C: Create theme variant
  - [ ] Update Mantine theme configuration
  - [ ] Update component to use new color
  - [ ] Save files

### Step 2: Local Verification

**Run accessibility test:**

```bash
npm run test:a11y
```

**Expected Output:**
```
✓ rota / passa no Axe-core WCAG 2.1 A/AA
✓ rota /cursos passa no Axe-core WCAG 2.1 A/AA
✓ rota /agenda passa no Axe-core WCAG 2.1 A/AA  ← Was failing, now passes
✓ rota /blog passa no Axe-core WCAG 2.1 A/AA
✓ rota /in-company passa no Axe-core WCAG 2.1 A/AA
✓ rota /contato passa no Axe-core WCAG 2.1 A/AA
✓ rota /login passa no Axe-core WCAG 2.1 A/AA

9 passed
```

- [ ] Test passes (all 7 routes)
- [ ] No violations reported
- [ ] Build succeeds with no warnings

### Step 3: Visual QA

**Open `/agenda` in browser:**

```bash
npm run dev
# Navigate to http://localhost:3000/agenda
```

**Check:**

- [ ] Filter panel visible on right side
- [ ] "Limpar Filtros" button visible and clickable
- [ ] Button appearance acceptable (matches design intent)
- [ ] No visual regressions in surrounding components
- [ ] Button still responds to hover/focus states

### Step 4: Full Test Suite

**Run complete test suite:**

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run test:e2e:smoke
```

**All should pass:**

- [ ] Lint: ✅ 0 warnings/errors
- [ ] Type check: ✅ 0 errors
- [ ] Unit tests: ✅ All passing
- [ ] E2E smoke: ✅ All passing

### Step 5: Commit & Create Handoff

**Stage changes:**

```bash
git add src/views/public/Agenda.tsx
```

**Commit:**

```bash
git commit -m "fix(a11y): increase button contrast on /agenda filter [WCAG 2.1 AA]"
```

**Example message:**
```
fix(a11y): increase color contrast on 'Limpar Filtros' button

The 'Limpar Filtros' (clear filters) button on /agenda had insufficient
color contrast (3.56:1) for WCAG 2.1 Level AA compliance. Changed button
color from rhBlue.9 (#4285f4) to rhBlue.10 for improved contrast ratio.

Fixes: docs/qa/ACCESSIBILITY_AUDIT_REPORT.md Issue #1
WCAG 2.1: 4.11.3 (Color Contrast)
Test: npm run test:a11y ✅ All 7 routes pass
```

- [ ] Commit created
- [ ] Tests passing in CI
- [ ] Ready for QA gate

### Step 6: QA Handoff

**Create/update handoff artifact:**

```yaml
handoff:
  from_agent: @dev
  to_agent: @qa
  task: "Accessibility remediation (Task #2)"
  files_modified:
    - src/views/public/Agenda.tsx
  verification:
    - "npm run test:a11y: All 7 routes PASS ✅"
    - "npm run lint: 0 errors ✅"
    - "npm run typecheck: 0 errors ✅"
  issue_fixed:
    - "Color contrast on /agenda button"
  status: "Ready for Wave 3 QA gate"
```

- [ ] Handoff note created
- [ ] @qa notified
- [ ] Ready for Custom-1.2 QA gate

---

## Additional Guidance

### Color Contrast Quick Reference

**To verify fix works:**

1. Use Axe DevTools browser extension
2. Or use online tool: https://webaim.org/resources/contrastchecker/
3. Or run: `npm run test:a11y`

**Color Options to Try:**

| Color | Hex Code | Contrast vs White |
|-------|----------|------------------|
| rhBlue.9 | #4285f4 | 3.56:1 ❌ (CURRENT) |
| rhBlue.10 | ~#2c5aa0 | ~4.8:1 ✅ |
| rhBlue.11 | ~#1a4d7a | ~6.5:1 ✅ |

### Testing Tips

**Local test before push:**
```bash
npm run test:a11y -- --headed
```
This runs tests with browser visible so you can see what Axe is checking.

**CI test after push:**
Axe-core automatically runs in `.github/workflows/ci.yml` Lane 3.
If fix is correct, CI passes. If not, CI fails with violation details.

---

## Rollback Instructions (If Needed)

**If fix doesn't work:**

1. Revert change:
   ```bash
   git revert HEAD
   ```

2. Try different option (A → B → C)

3. Check if theme config needs adjustment

4. Notify @qa with new issue details

---

## Dependencies & Prerequisites

- [x] Node.js 24+ installed
- [x] `npm install` already run
- [x] Code editor (VS Code recommended)
- [x] Terminal/command line access

---

## Success Criteria

**All items must be checked before moving to Custom-1.2 QA gate:**

- [ ] **Issue Fixed:** Color contrast ≥ 4.5:1
- [ ] **Tests Pass:** `npm run test:a11y` reports 0 violations
- [ ] **Build Succeeds:** `npm run build` completes without errors
- [ ] **Lint Passes:** `npm run lint` reports 0 CRITICAL/HIGH
- [ ] **Commit Created:** Git history shows fix
- [ ] **Handoff Documented:** Ready for @qa verification

**Estimated Time:** 15 minutes
**Complexity:** LOW
**Risk:** LOW (change only affects button color, isolated component)

---

## Next Steps

1. **Implement fix** (Steps 1-3 above) — ~5 minutes
2. **Run test suite** (Step 4) — ~3 minutes
3. **Commit & push** (Step 5) — ~2 minutes
4. **Notify QA** (Step 6) — ~1 minute
5. **Proceed to Custom-1.2 QA gate** — @qa handles

---

## Questions or Blockers?

If fix doesn't work:
1. Check Axe report: `npm run test:a11y`
2. Verify Mantine theme colors: Check `theme/` or `mantine.config`
3. Try darker color option (rhBlue.10, rhBlue.11)
4. Notify @architect if theme adjustment needed

---

*Checklist created by Quinn (QA Agent) — 2026-06-29*
**Reference:** `docs/qa/ACCESSIBILITY_AUDIT_REPORT.md`
**Status:** Ready for Implementation
