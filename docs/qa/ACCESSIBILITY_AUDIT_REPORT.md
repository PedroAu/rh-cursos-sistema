# Accessibility Audit Report — WCAG 2.1 A/AA Compliance
**Date:** 2026-06-29
**Agent:** Quinn (QA)
**Scope:** 7 public routes (automatic Axe-core scan via Playwright)
**Level:** WCAG 2.1 Level A/AA
**Framework:** @axe-core/playwright v4.11.3

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Routes Tested** | 7 public routes |
| **Routes Passing** | 6/7 (86%) |
| **Routes with Violations** | 1/7 (14%) |
| **Total Violations Found** | 1 critical (serious impact) |
| **Violation Type** | Color contrast (WCAG 2.1 Level AA) |

**Current Status:** ✅ **MOSTLY COMPLIANT** — 1 critical color contrast issue blocking full compliance
**Blocking Issue:** `/agenda` route has color contrast violation

---

## Detailed Findings

### Routes Passing ✅

| Route | Status | Test Time |
|-------|--------|-----------|
| `/` (Home) | ✅ PASS | 1.2s |
| `/cursos` (Courses) | ✅ PASS | 1.0s |
| `/blog` (Blog) | ✅ PASS | 1.0s |
| `/in-company` (In-Company) | ✅ PASS | 0.99s |
| `/contato` (Contact) | ✅ PASS | 1.0s |
| `/login` (Login) | ✅ PASS | 0.98s |

**Summary:** No WCAG violations found on these routes.

---

### Routes with Violations ⚠️

#### Route: `/agenda` (Agenda/Schedule Page)

**Status:** ❌ **FAILING**
**Violation Count:** 1 critical

##### Violation Details

**ID:** `color-contrast` _(WCAG 2.1 4.11.3 — Color Contrast)_

| Property | Value |
|----------|-------|
| **Impact Level** | Serious |
| **WCAG Criteria** | WCAG 2.1 Level AA (4.5:1 minimum contrast) |
| **Actual Contrast Ratio** | 3.56:1 |
| **Required Contrast Ratio** | 4.5:1 |
| **Contrast Shortfall** | 0.94 points (21% below requirement) |

**Element Details:**
- **Selector:** `.h-12` button (height 12)
- **Component:** Mantine `<Button variant="outline" color="rhBlue.9" />` — "Limpar Filtros" (Clear Filters)
- **Location:** Agenda filters sidebar (right side)
- **Colors:**
  - Foreground (text): `#4285f4` (bright blue — --bright-blue CSS var)
  - Background: `#ffffff` (white)
  - Font Size: 10.5pt (14px)
  - Font Weight: normal

**Component Path:**
`src/views/public/Agenda.tsx` (lines 244-255)

```jsx
<Button
  fullWidth
  variant="outline"
  color="rhBlue.9"
  leftSection={<X size={16} />}      // ← Icon present, check aria-label
  disabled={!activeFiltersCount}
  onClick={clearFilters}
>
  Limpar Filtros                     // ← Text label present
</Button>
```

**Root Cause:**
The Mantine `Button` component with `variant="outline"` and `color="rhBlue.9"` produces light blue text (#4285f4) on white background, which creates insufficient contrast for WCAG 2.1 AA compliance.

**Affected Users:**
- Users with color vision deficiency (CVD)
- Low vision users
- Users in high-glare environments
- Mobile/small screen users

**Test Evidence:**
```json
{
  "id": "color-contrast",
  "impact": "serious",
  "nodes": 1,
  "help": "Elements must meet minimum color contrast ratio thresholds",
  "failureSummary": "Fix any of the following: Element has insufficient color contrast of 3.56 (foreground color: #4285f4, background color: #ffffff, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1"
}
```

---

## Secondary Findings (Informational)

### Aria-Label Coverage

**Icon Buttons Audit:** Spot check of icon-only buttons across tested routes.

| Component | Location | Aria-Label Status | Status |
|-----------|----------|-------------------|--------|
| Chevron Left (Previous Month) | Calendar navigation | ✅ Present: "Mês anterior" | OK |
| Chevron Right (Next Month) | Calendar navigation | ✅ Present: "Próximo mês" | OK |
| Calendar Date Buttons | Calendar grid | ✅ Dynamic labels with date + class count | OK |
| Search Clear Button | Agenda filters | ✅ Present: "Limpar busca da agenda" | OK |

**Conclusion:** Icon buttons tested have adequate aria-labels. No secondary violations found.

---

## Recommendations & Remediation Priority

### Critical (Blocks Deployment) — Must Fix

**1. Color Contrast on "Limpar Filtros" Button**

**Severity:** HIGH
**Effort:** Low (1 line change)
**Assignee:** @dev

**Options:**

**Option A (Recommended):** Darken text color
- Change Mantine Button color from `rhBlue.9` (#4285f4) to a darker shade
- Required contrast: 4.5:1 minimum
- Suggested: Use `rhBlue.10` or similar (darker blue from Mantine theme)
- File: `src/views/public/Agenda.tsx` (line 248)

**Option B:** Change variant to `filled` with white text
- Use `variant="filled"` with default Mantine theme (solid background)
- Provides better contrast
- File: `src/views/public/Agenda.tsx` (line 247)
- Note: Will change visual appearance

**Option C:** Use custom color token
- Add a dark blue color to theme that meets 4.5:1 contrast on white
- More sustainable long-term
- Requires theme update in Mantine config

**Recommended Fix:**
```jsx
<Button
  fullWidth
  variant="outline"
  color="rhBlue.10"  // ← Change from rhBlue.9 to darker shade
  leftSection={<X size={16} />}
  disabled={!activeFiltersCount}
  onClick={clearFilters}
>
  Limpar Filtros
</Button>
```

---

## Compliance Summary

### WCAG 2.1 Level A Compliance
✅ **PASS** — No Level A violations found

### WCAG 2.1 Level AA Compliance
⚠️ **FAIL** — 1 color contrast violation

### Accessibility Standards
| Standard | Status |
|----------|--------|
| WCAG 2.1 Level A | ✅ PASS |
| WCAG 2.1 Level AA | ⚠️ FAIL (1 violation) |
| WCAG 2.1 Level AAA | ⚠️ FAIL (subset of AA violations) |
| ADA Compliance | ⚠️ FAIL (due to AA violations) |
| EN 301 549 (EU Standard) | ⚠️ FAIL |
| Section 508 (US) | ⚠️ FAIL |

---

## Testing Methodology

**Tool:** Axe DevTools by Deque
**Library:** @axe-core/playwright v4.11.3
**Test Framework:** Playwright v1.60.0
**Browser:** Chromium
**Screen Reader Emulation:** Reduced motion enabled

**Test Parameters:**
- **WCAG Tags:** `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`
- **Pages Tested:** 7 public routes (no authentication required)
- **Wait Strategy:** `domcontentloaded` + 500ms delay for async content
- **Reduced Motion:** Enabled to test accessibility features

**Scanned Pages:**
```
GET / → 200 OK
GET /cursos → 200 OK
GET /agenda → 200 OK (violations found)
GET /blog → 200 OK
GET /in-company → 200 OK
GET /contato → 200 OK
GET /login → 200 OK
```

---

## CI/CD Integration Status

**Current Setup:** ✅ **ACTIVE**
- Axe-core runs as pre-deploy gate in `.github/workflows/ci.yml` (Lane 3: Build & A11y & E2E)
- Fails build if WCAG violations found
- Axe violations halt CI/CD pipeline

**Test Command:**
```bash
npm run test:a11y
```

**Expected Behavior After Fix:**
- All 7 routes pass WCAG 2.1 Level AA
- CI/CD pipeline proceeds to E2E tests
- Pre-deployment gate: ✅ PASSED

---

## Action Items

### For @dev (Implementation)

- [ ] **CRITICAL:** Fix color contrast on `/agenda` "Limpar Filtros" button
  - File: `src/views/public/Agenda.tsx:248`
  - Recommendation: Change `color="rhBlue.9"` to `color="rhBlue.10"` or similar darker shade
  - Verify contrast ratio ≥ 4.5:1 using Axe-core

### For @qa (Verification)

- [ ] Re-run `npm run test:a11y` after fix
- [ ] Confirm all 7 routes pass (0 violations)
- [ ] Generate updated a11y report
- [ ] Sign off on WCAG 2.1 Level AA compliance

### For Roadmap (Wave 3 QA Gate)

- [ ] Run full QA gate after @dev fixes
- [ ] Include accessibility verification as part of custom-1.2 acceptance criteria
- [ ] Update deployment checklist with "WCAG 2.1 AA compliance verified" box

---

## Performance & Coverage

**Test Suite Performance:**
- Full a11y suite: ~10.5 seconds
- Average per route: ~1.5 seconds
- Bottleneck: Browser startup and page load (500ms wait per page)

**Coverage:**
- Public routes: 7/7 tested ✅
- Authenticated routes: Not tested (requires session management)
- Dynamic content: Limited (no user-generated content tested)
- Third-party widgets: Inline (forms, calendar, search)

**Future Improvements:**
- Add authenticated routes (requires session setup)
- Add E2E a11y tests (user workflows, keyboard navigation)
- Add focus management tests
- Add screen reader specific tests (VO, NVDA, JAWS)

---

## Appendix: Full Test Output

### Console Log (Key Violations)

```
A11y violations found on /agenda:
[
  {
    "id": "color-contrast",
    "impact": "serious",
    "nodes": 1,
    "help": "Elements must meet minimum color contrast ratio thresholds"
  }
]
```

### Axe Report (Raw JSON)

```json
{
  "timestamp": "2026-06-29T14:30:00Z",
  "route": "/agenda",
  "wcagLevel": "WCAG 2.1 A/AA",
  "violations": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "nodes": 1,
      "help": "Elements must meet minimum color contrast ratio thresholds",
      "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright",
      "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
      "nodes": [
        {
          "html": "<button class=\"inline-flex min-h-11...\">Limpar Filtros</button>",
          "target": [".h-12"],
          "data": {
            "contrastRatio": 3.56,
            "expectedContrastRatio": "4.5:1",
            "fgColor": "#4285f4",
            "bgColor": "#ffffff",
            "fontSize": "10.5pt (14px)",
            "fontWeight": "normal"
          }
        }
      ]
    }
  ],
  "passes": 34,
  "passes_count": 34
}
```

---

## References

- [WCAG 2.1 4.11.3 - Color Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Axe-core Documentation](https://www.deque.com/axe/core-documentation/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Mantine Theme Documentation](https://mantine.dev/theming/theme-object/)

---

*Report generated by Quinn (QA Agent) — 2026-06-29*
*Classification: QA Assessment (Non-Confidential)*
*Next Review:** After remediation (Target: 2026-06-30)
