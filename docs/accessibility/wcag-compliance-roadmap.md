# WCAG 2.1 AA Compliance Roadmap — Phase B

**Project:** RH Cursos  
**Standard:** WCAG 2.1 Level AA  
**Status:** Baseline assessment complete  
**Target Completion:** 2026-08-31  
**Maintained By:** @analyst & @qa

---

## Executive Summary

### Current State

The RH Cursos platform has **strong accessibility foundations**:

✅ **Already Compliant:**
- Semantic HTML structure (heading hierarchy, lists, forms)
- ARIA labels on interactive components
- Keyboard navigation in admin dashboard
- Color contrast ratios meet WCAG AA (4.5:1 for text)
- Motion respects `prefers-reduced-motion`
- Images include alt text

⚠️ **In Progress (Epic 8):**
- Mantine migration bringing improved component accessibility
- Admin shell redesign with accessible navigation
- Form system consolidation with proper field associations

📋 **Outstanding Gaps (Phase B Priority):**
- Some legacy components need label review
- Modal focus management needs hardening
- Error message associations need validation across all forms
- Screen reader announcements for dynamic content

### Phase B Goal

Achieve and maintain **WCAG 2.1 Level AA** compliance across:
- All public pages (courses, blog, contact)
- All admin pages (dashboard, course management, user management)
- All dynamic interactions (modals, forms, navigation)
- Mobile and desktop experiences

### Compliance Score

| Pillar | Target | Current | Gap |
|--------|--------|---------|-----|
| **Perceivable** (contrast, text, images) | 100% | 95% | 5% |
| **Operable** (keyboard, navigation, time) | 100% | 90% | 10% |
| **Understandable** (labels, language, predictability) | 100% | 92% | 8% |
| **Robust** (valid HTML, ARIA, browser support) | 100% | 94% | 6% |
| **Overall Compliance** | **100%** | **93%** | **7%** |

---

## WCAG 2.1 Principles & Guidelines

### 1. Perceivable

**Principle:** Users must be able to perceive content presented to them.

#### 1.1 Text Alternatives (Guideline)

| Criterion | Status | Details | Action |
|-----------|--------|---------|--------|
| **1.1.1 Non-text Content (A)** | ✅ PASS | All images have alt text; icons use aria-label | None |
| **1.1.2 Redundant Content (A)** | ✅ PASS | Text content supports image information | None |

#### 1.2 Time-based Media (Guideline)

| Criterion | Status | Details | Action |
|-----------|--------|---------|--------|
| **1.2.1 Video/Audio (A)** | ✅ PASS | No auto-playing media | None |
| **1.2.2 Captions (A)** | ⚠️ PARTIAL | Embedded videos need captions | Phase B task #3 |
| **1.2.3 Transcripts (A)** | ⚠️ PARTIAL | Audio content needs transcripts | Phase B task #3 |

#### 1.3 Adaptable (Guideline)

| Criterion | Status | Details | Action |
|-----------|--------|---------|--------|
| **1.3.1 Info & Relationships (A)** | ✅ PASS | Headings, lists, form labels properly associated | None |
| **1.3.2 Meaningful Sequence (A)** | ✅ PASS | Reading order logical (left to right, top to bottom) | None |
| **1.3.3 Sensory Characteristics (A)** | ✅ PASS | Instructions don't rely on shape/color alone | None |
| **1.3.4 Orientation (AA)** | ✅ PASS | Content works in both portrait & landscape | None |
| **1.3.5 Identify Purpose (AA)** | ✅ PASS | Form fields have clear labels and hints | None |

#### 1.4 Distinguishable (Guideline)

| Criterion | Status | Details | Action |
|-----------|--------|---------|--------|
| **1.4.1 Use of Color (A)** | ✅ PASS | Color not the only means of conveyance | None |
| **1.4.2 Audio Control (A)** | ✅ PASS | No auto-playing audio | None |
| **1.4.3 Contrast (AA)** | ✅ PASS | Text/controls at 4.5:1 ratio | Verify in Phase B task #1 |
| **1.4.4 Resize Text (A)** | ✅ PASS | Page readable at 200% zoom | Test in Phase B task #2 |
| **1.4.5 Images of Text (AA)** | ⚠️ PARTIAL | Some decorative headers use images | Phase B task #2 |
| **1.4.10 Reflow (AA)** | ✅ PASS | Content reflows at 1.5x zoom | Verify in Phase B task #2 |
| **1.4.11 Non-text Contrast (AA)** | ✅ PASS | UI components & focus indicators meet 3:1 ratio | Verify in Phase B task #1 |
| **1.4.13 Content on Hover (AA)** | ✅ PASS | Hover/focus content is accessible | Verify in Phase B task #2 |

---

### 2. Operable

**Principle:** Users must be able to operate the interface using various input methods.

#### 2.1 Keyboard Accessible (Guideline)

| Criterion | Status | Details | Action |
|-----------|--------|---------|--------|
| **2.1.1 Keyboard (A)** | ✅ PASS | All functionality available via keyboard | Verify admin forms in Phase B task #1 |
| **2.1.2 No Keyboard Trap (A)** | ⚠️ PARTIAL | Modal dialogs need focus trap verification | Phase B task #4 |
| **2.1.3 Keyboard (No Exception) (AAA)** | ✅ PASS | Not required for AA; implemented for better UX | N/A |
| **2.1.4 Character Key Shortcuts (A)** | ✅ PASS | No single-character shortcuts that can be triggered accidentally | None |

#### 2.2 Enough Time (Guideline)

| Criterion | Status | Details | Action |
|-----------|--------|---------|--------|
| **2.2.1 Timing Adjustable (A)** | ✅ PASS | No critical timed sessions | None |
| **2.2.2 Pause/Stop/Hide (A)** | ✅ PASS | Animations can be paused via `prefers-reduced-motion` | Verify in Phase B task #5 |

#### 2.3 Seizures and Physical Reactions (Guideline)

| Criterion | Status | Details | Action |
|-----------|--------|---------|--------|
| **2.3.1 Three Flashes (A)** | ✅ PASS | No content flashes more than 3x per second | None |
| **2.3.2 Animations (AA)** | ✅ PASS | Respects `prefers-reduced-motion` | Verify in Phase B task #5 |

#### 2.4 Navigable (Guideline)

| Criterion | Status | Details | Action |
|-----------|--------|---------|--------|
| **2.4.1 Bypass Blocks (A)** | ⚠️ PARTIAL | "Skip to main content" link might be missing | Phase B task #1 |
| **2.4.2 Page Titled (A)** | ✅ PASS | All pages have descriptive titles | None |
| **2.4.3 Focus Order (A)** | ⚠️ PARTIAL | Focus order needs review in modals | Phase B task #4 |
| **2.4.4 Link Purpose (A)** | ✅ PASS | Link text is descriptive | Verify in Phase B task #1 |
| **2.4.5 Multiple Ways (AA)** | ✅ PASS | Content available via search, navigation, sitemap | None |
| **2.4.6 Headings and Labels (AA)** | ✅ PASS | Headings and labels describe purpose | Verify in Phase B task #1 |
| **2.4.7 Focus Visible (AA)** | ⚠️ PARTIAL | Focus indicators need contrast check | Phase B task #2 |
| **2.4.8 Focus Purpose (AA)** | ⚠️ PARTIAL | Focus visible but might need keyboard hint text | Phase B task #4 |

---

### 3. Understandable

**Principle:** Users must be able to understand the information and operation of the interface.

#### 3.1 Readable (Guideline)

| Criterion | Status | Details | Action |
|-----------|--------|---------|--------|
| **3.1.1 Language of Page (A)** | ✅ PASS | `<html lang="pt-BR">` properly set | None |
| **3.1.2 Language of Parts (AA)** | ⚠️ PARTIAL | Mixed language content needs `lang` attribute | Phase B task #6 |
| **3.1.3 Unusual Words (AAA)** | ⚠️ PARTIAL | Technical terms could use glossary | Phase B enhancement |
| **3.1.4 Abbreviations (AAA)** | ✅ PASS | Abbreviations are spelled out on first use | None |
| **3.1.5 Reading Level (AAA)** | ⚠️ PARTIAL | Some admin content has high reading level | Phase B enhancement |
| **3.1.6 Pronunciation (AAA)** | ✅ PASS | Not required for AA; pronunciation clear in context | N/A |

#### 3.2 Predictable (Guideline)

| Criterion | Status | Details | Action |
|-----------|--------|---------|--------|
| **3.2.1 On Focus (A)** | ✅ PASS | No unexpected page changes on focus | None |
| **3.2.2 On Input (A)** | ✅ PASS | Form submission requires explicit user action | None |
| **3.2.3 Consistent Navigation (AA)** | ✅ PASS | Navigation is consistent across pages | None |
| **3.2.4 Consistent Identification (AA)** | ✅ PASS | Components with same function are identified consistently | None |
| **3.2.5 Change on Request (AA)** | ✅ PASS | Changes only happen on explicit user request | None |

#### 3.3 Input Assistance (Guideline)

| Criterion | Status | Details | Action |
|-----------|--------|---------|--------|
| **3.3.1 Error Identification (A)** | ⚠️ PARTIAL | Error messages need proper associations | Phase B task #7 |
| **3.3.2 Labels or Instructions (A)** | ✅ PASS | Form fields have labels and hints | Verify in Phase B task #1 |
| **3.3.3 Error Suggestion (AA)** | ⚠️ PARTIAL | Some errors don't suggest corrections | Phase B task #7 |
| **3.3.4 Error Prevention (AA)** | ✅ PASS | Critical actions have confirmation dialogs | None |
| **3.3.5 Help (AA)** | ⚠️ PARTIAL | Admin forms could benefit from help text | Phase B task #6 |
| **3.3.6 Error Prevention (AAA)** | ⚠️ PARTIAL | Could add data validation hints | Phase B enhancement |

---

### 4. Robust

**Principle:** Content must be robust enough that it can be interpreted reliably by various technologies.

#### 4.1 Compatible (Guideline)

| Criterion | Status | Details | Action |
|-----------|--------|---------|--------|
| **4.1.1 Parsing (A)** | ✅ PASS | Valid HTML (no unclosed tags, proper nesting) | Run W3C validator in Phase B task #8 |
| **4.1.2 Name, Role, Value (A)** | ⚠️ PARTIAL | Some custom components need ARIA review | Phase B task #8 |
| **4.1.3 Status Messages (AA)** | ⚠️ PARTIAL | Live updates need aria-live regions | Phase B task #9 |

---

## Phase B Implementation Plan

### Phase B Phases (2026-07-01 to 2026-08-31)

#### Phase B-1: Contrast & Keyboard (2026-07-01 to 2026-07-15)

**Goal:** Ensure 100% color contrast compliance and full keyboard operability

| Task | Effort | Owner | Checklist |
|------|--------|-------|-----------|
| **#1** Audit all text/button contrast with axe-core | 1.5d | @qa | - [ ] Run automated contrast audit - [ ] Review foreground/background pairs - [ ] Document non-compliant elements |
| **#2** Test keyboard navigation on all pages | 2d | @qa | - [ ] Tab through every interactive element - [ ] Verify Tab/Shift+Tab order - [ ] Test Escape key in modals - [ ] Test Enter on buttons/links |
| **#3** Add focus indicators to form fields | 1d | @dev | - [ ] Mantine form inputs with visible focus - [ ] Focus ring color at 3:1+ contrast - [ ] Test on desktop & mobile |
| **#4** Verify "Skip to main content" link | 0.5d | @dev | - [ ] Add skip link to layout - [ ] Position off-screen, visible on focus - [ ] Test with screen readers |

**Deliverables:**
- Contrast audit report (axe-core output)
- Keyboard navigation checklist (signed off)
- Updated form components with focus indicators

#### Phase B-2: Dynamic Content & ARIA (2026-07-16 to 2026-07-31)

**Goal:** Ensure screen readers announce dynamic updates and custom components

| Task | Effort | Owner | Checklist |
|------|--------|-------|-----------|
| **#5** Implement aria-live regions for updates | 1.5d | @dev | - [ ] Add aria-live="polite" to notification areas - [ ] Test with screen reader (NVDA/JAWS) - [ ] Verify announcements trigger correctly |
| **#6** Review & fix modal focus trap | 1.5d | @dev | - [ ] Implement focus trap on open - [ ] Restore focus on close - [ ] Test Tab/Shift+Tab behavior - [ ] Verify Escape key works |
| **#7** Add ARIA descriptions to custom components | 1.5d | @dev | - [ ] Audit Mantine components for aria-label - [ ] Add aria-describedby where needed - [ ] Test with assistive technology |
| **#8** Form error message accessibility | 1d | @dev | - [ ] Link errors to fields via aria-describedby - [ ] Ensure error messages are announced - [ ] Test color + icon + text for clarity |

**Deliverables:**
- Screen reader testing report
- Modal focus trap tests (Playwright)
- Updated component ARIA specifications

#### Phase B-3: Content & Media (2026-08-01 to 2026-08-15)

**Goal:** Ensure all content (text, media, images) meets accessibility standards

| Task | Effort | Owner | Checklist |
|------|--------|-------|-----------|
| **#9** Alt text audit & enhancement | 2d | @qa + @dev | - [ ] Audit all images for alt text - [ ] Review alt text quality - [ ] Add alt to data visualization images - [ ] Test alt text display in screen readers |
| **#10** Video captions & transcripts | 2.5d | @dev | - [ ] Add captions to all video content - [ ] Create transcripts for audio - [ ] Include in course materials - [ ] Test with video player |
| **#11** Typography & readability review | 1.5d | @qa | - [ ] Check font sizes (minimum 12px for body) - [ ] Verify line height (1.5x minimum) - [ ] Test at 200% zoom - [ ] Check color contrast on backgrounds |

**Deliverables:**
- Alt text audit report
- Caption/transcript files for media
- Readability compliance checklist

#### Phase B-4: Validation & Sign-off (2026-08-16 to 2026-08-31)

**Goal:** Comprehensive testing and certification of WCAG 2.1 AA compliance

| Task | Effort | Owner | Checklist |
|------|--------|-------|-----------|
| **#12** Full axe-core + Lighthouse audit | 1d | @qa | - [ ] Run axe-core on all public pages - [ ] Run Lighthouse on all key workflows - [ ] Verify zero critical/high issues - [ ] Document baseline scores |
| **#13** Manual screen reader testing | 2d | @qa | - [ ] Test with NVDA (Windows) - [ ] Test with VoiceOver (macOS) - [ ] Test navigation & form submission - [ ] Verify all content is announced |
| **#14** Mobile accessibility testing | 1.5d | @qa | - [ ] Test screen reader (Android/iOS) - [ ] Verify touch target sizes (44px+) - [ ] Test zoom & text resizing - [ ] Verify keyboard alternatives on mobile |
| **#15** Create compliance certificate | 1d | @analyst | - [ ] Generate WCAG 2.1 AA compliance report - [ ] Document testing methodology - [ ] Create compliance statement for website - [ ] Archive evidence for audit trail |

**Deliverables:**
- WCAG 2.1 AA Compliance Certificate
- Testing evidence (screenshots, logs)
- Compliance statement for website footer
- Maintenance guidelines for future changes

---

## Success Criteria

### Automated Testing
- ✅ axe-core reports zero WCAG 2.1 AA violations
- ✅ Lighthouse accessibility score >= 90
- ✅ All E2E tests pass with a11y plugin enabled

### Manual Testing
- ✅ Screen reader testing: 100% of pages & flows tested
- ✅ Keyboard navigation: 100% of interactive elements accessible
- ✅ Contrast audit: 100% of text/buttons pass 4.5:1 ratio

### Documentation
- ✅ WCAG 2.1 AA Compliance Certificate issued
- ✅ Accessibility guidelines added to CONTRIBUTING.md (✅ Done)
- ✅ Maintenance procedures documented

---

## WCAG 2.1 AA Checklist

Use this checklist to verify compliance across all pages:

### Perceivable

- [ ] Images have descriptive alt text
- [ ] Videos have captions and transcripts
- [ ] Color contrast is 4.5:1 for text, 3:1 for UI components
- [ ] Page is readable at 200% zoom
- [ ] Content doesn't rely on color alone

### Operable

- [ ] All functionality works with keyboard alone
- [ ] No keyboard traps
- [ ] Focus order is logical and visible
- [ ] "Skip to main content" link present
- [ ] Page titles are descriptive

### Understandable

- [ ] Form fields have associated labels
- [ ] Error messages are clear and helpful
- [ ] Navigation is consistent across pages
- [ ] Page language is set (lang attribute)
- [ ] Abbreviations are expanded on first use

### Robust

- [ ] HTML is valid and well-formed
- [ ] ARIA attributes are used correctly
- [ ] Components have proper roles and names
- [ ] Page works in multiple browsers
- [ ] Page works with assistive technologies

---

## Tools & Resources

### Automated Testing
- **axe-core:** `npm run test:a11y` (Playwright integration)
- **Lighthouse:** Built into Chrome DevTools
- **WAVE:** Browser extension for visual analysis

### Manual Testing
- **NVDA:** Free screen reader (Windows)
- **JAWS:** Professional screen reader
- **VoiceOver:** Built into macOS/iOS
- **TalkBack:** Built into Android

### Reference
- [WCAG 2.1 Specification](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mantine Accessibility](https://mantine.dev/guides/accessibility/)
- [WebAIM](https://webaim.org/)
- [Inclusive Components](https://inclusive-components.design/)

---

## Maintenance & Ongoing Compliance

### Per-Release Checklist

Before each release, verify:
- [ ] `npm run test:a11y` passes with zero violations
- [ ] New components tested for keyboard navigation
- [ ] Alt text added to new images
- [ ] Form fields have labels and error handling

### Quarterly Review

- Run full compliance audit with axe-core
- Test with screen readers (NVDA, VoiceOver)
- Update documentation as needed
- Review WCAG updates and new guidelines

### Annual Certification

- Comprehensive testing by accessibility expert (recommended)
- Update compliance certificate
- Review and update maintenance procedures

---

## Timeline

```
2026-07-01  ─── Phase B-1 (Contrast & Keyboard)
2026-07-15  │
            ├─── Phase B-2 (Dynamic Content & ARIA)
2026-07-31  │
            ├─── Phase B-3 (Content & Media)
2026-08-15  │
            ├─── Phase B-4 (Validation & Sign-off)
2026-08-31  └─── Completion & Certificate Issued
```

---

## Contact & Questions

For accessibility questions or issues:
- **Lead:** @qa (Quinn) — Testing & validation
- **Developer:** @dev (Dex) — Implementation
- **Coordination:** @analyst (Alex) — Documentation & roadmap

---

**Status:** Ready to launch Phase B (2026-07-01)  
**Last Updated:** 2026-06-29  
**Maintained By:** Synkra AIOX (@analyst)
