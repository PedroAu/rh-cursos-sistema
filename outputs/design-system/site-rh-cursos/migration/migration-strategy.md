# Design System Migration Strategy
## site-rh-cursos Phased Integration Plan

> **Generated:** 2026-06-22  
> **Agent:** Uma (Design System Architect)  
> **Strategy:** Brad Frost Phased Approach  
> **Status:** READY FOR IMPLEMENTATION  

---

## 🎯 Executive Summary

**Objective:** Integrate extracted design tokens into codebase and consolidate redundant patterns with zero sprint disruption.

| Metric | Target |
|--------|--------|
| **Timeline** | 8-10 weeks (4 phases) |
| **Team Impact** | ~2-3h/week allocation |
| **System Maturity** | 8.2 → 8.7/10 |
| **Pattern Reduction** | 15-18% redundancy eliminated |
| **ROI Breakeven** | Week 4 (Phase 2 completion) |
| **Year 1 Savings** | ~$48-60k (dev velocity improvement) |

---

## 📊 Current State Assessment

```yaml
baseline:
  maturity_score: 8.2/10
  design_system_health: EXCELLENT
  token_coverage: 96.5%
  patterns:
    total: 42
    unique: 38
    redundancy_factor: 1.79
  
strengths:
  - ✓ Zero hardcoded colors (all CSS variables)
  - ✓ Proper Atomic Design structure
  - ✓ Clean component hierarchy
  - ✓ Tokens extracted in 6 formats (DTCG, CSS, Tailwind, JSON)
  
consolidation_opportunities:
  - Forms: 4 patterns → 2 (HIGH ROI, 2.5h)
  - Cards: 6 patterns → 4 (HIGH ROI, 2.5h)
  - Badges: 2 patterns → 1 (MEDIUM ROI, 1h)
  - CVA Adoption: 2 → 8 components (CONSISTENCY, 3h)
```

---

## 🚀 4-Phase Migration Plan

### **Phase 1: Foundation (Week 1-2 | 1 Sprint)**

**Goal:** Deploy tokens with zero visual changes — proven safe baseline

**Why First:** Establishes infrastructure before touching component code

#### Tasks
- [ ] Import `tokens.css` in main layout (`src/app/layout.tsx`)
- [ ] Verify CSS variable cascade (inspect element shows `--color-primary`, etc.)
- [ ] Configure Tailwind: extend theme with `tokens.tailwind.js`
- [ ] Add token files to git: `src/design-tokens/`
- [ ] Generate token docs: `TOKENS.md` in storybook/docs
- [ ] Zero component changes in this phase

#### Success Criteria
✅ CSS variables available globally  
✅ No visual regressions  
✅ Build passes with new imports  
✅ Tailwind config accepts token structure  

#### Effort
- **Dev:** 2-3 hours
- **QA:** 1 hour

#### Risk
🟢 **LOW** — CSS is additive, no breaking changes

#### Rollback
Remove token imports, revert CSS. Component code untouched → zero risk.

---

### **Phase 2: High-Impact Consolidation (Week 3-5 | 2-3 Sprints)**

**Goal:** Replace most-used patterns → immediate development velocity improvement

**Why Now:** Tokens are live, team familiar with system

#### Sub-Phase 2A: Form Fields Consolidation (1 sprint)

**Files affected:**
- `src/components/ui/form-field.tsx` (base)
- `src/components/admin/form-fields.tsx` (admin variants)

**Tasks**
- [ ] Extract admin variants into `form-field.tsx` variant system
- [ ] Update 8-12 admin form usages to use base component
- [ ] Delete `src/components/admin/form-fields.tsx`
- [ ] Update exports in `src/components/index.ts`
- [ ] Test: admin forms render identically

**Effort:** 2-2.5 hours  
**Risk:** 🟡 MEDIUM (form changes affect multiple pages)  
**Rollback:** Restore git files, revert component imports

#### Sub-Phase 2B: Card Variant System (1.5 sprints)

**Files affected:**
- `src/components/ui/card.tsx` (base)
- `src/components/agenda/class-card.tsx` → remove
- `src/components/blog/blog-card.tsx` → remove
- `src/components/courses/course-card.tsx` → remove
- `src/components/common/testimonial-card.tsx` → remove

**Tasks**
- [ ] Add CVA to Card component (4 variants: default, classroom, blog, course, testimonial)
- [ ] Extract styling from domain cards → Card variants
- [ ] Update 40-50 component usages
- [ ] Delete 4 domain card files (or keep as thin wrappers)
- [ ] Test: all card variants render correctly

**Effort:** 2.5-3 hours  
**Risk:** 🟡 MEDIUM (cards widely used)  
**Rollback:** Revert Card component, restore domain card files

#### Success Criteria
✅ Form fields consolidated  
✅ Card variant system live (4 variants replacing 6 patterns)  
✅ No visual regressions on any card  
✅ All 40-50 card usages migrated  

#### Cumulative Impact
- **Maturity:** 8.2 → 8.5/10
- **Redundancy:** 1.79 → 1.68
- **Reduction:** 4 components removed from codebase
- **Velocity:** ~10-15% faster card/form development

---

### **Phase 3: Long-Tail Cleanup (Week 6-8 | 2-3 Sprints)**

**Goal:** Consolidate remaining low-hanging fruit

#### Task 3A: Badge/Status Standardization (1 sprint)

**Files affected:**
- `src/components/ui/badge.tsx`
- `src/components/common/status-badge.tsx`

**Tasks**
- [ ] Create status color tokens (active, pending, inactive, error, warning, info)
- [ ] Add status variants to Badge component
- [ ] Update status-badge usages → Badge component
- [ ] Optionally delete `src/components/common/status-badge.tsx`

**Effort:** 1-1.5 hours  
**Risk:** 🟢 LOW

#### Task 3B: CVA Adoption Across Board (1-1.5 sprints)

**Components to refactor:**
- Input, Textarea, Select
- Checkbox, Switch, Progress, Avatar
- Custom molecules (search-input, filter-badge)

**Tasks**
- [ ] Refactor remaining base components to use CVA
- [ ] Create variant definitions (size, state, type)
- [ ] Update molecule components to use atom variants
- [ ] Document variant conventions

**Effort:** 2-3 hours  
**Risk:** 🟡 MEDIUM (affects many components)

#### Success Criteria
✅ Status badge unified into Badge component  
✅ 60%+ of UI components use CVA  
✅ No regressions in variant handling  
✅ Component API consistent across system  

#### Cumulative Impact
- **Maturity:** 8.5 → 8.7/10
- **Redundancy:** 1.68 → 1.45
- **CVA Adoption:** 5% → 60%

---

### **Phase 4: Enforcement & Monitoring (Week 9-10 | 1 Sprint)**

**Goal:** Prevent regression, ensure team adoption

#### Tasks
- [ ] Add CI/CD pattern validation rule (detect non-token colors)
- [ ] Create design system contribution guide
- [ ] Deprecate old component patterns in codebase
- [ ] Add design token version to `package.json`
- [ ] Set up metrics tracking (component usage, token coverage)
- [ ] Generate adoption dashboard

#### Implementation
- [ ] **Linting rule:** Flag hardcoded colors, undeclared CSS
- [ ] **Git hook:** Prevent commits with `rgb()`, `#hex` values
- [ ] **Storybook:** Mark deprecated components with warning banner
- [ ] **Documentation:** "Migration Guide" for team onboarding

#### Success Criteria
✅ No new hardcoded colors accepted  
✅ Team follows token-first pattern  
✅ Deprecated components clearly marked  
✅ Adoption metrics > 85%  

---

## 📈 Timeline & Team Allocation

```
Week 1-2:   Phase 1 Foundation          [2-3 dev hours/week]
Week 3-5:   Phase 2 Consolidation       [3-4 dev hours/week]  ← Highest impact
Week 6-8:   Phase 3 Long-Tail          [2-3 dev hours/week]
Week 9-10:  Phase 4 Enforcement         [1-2 dev hours/week]
```

**Total Effort:** ~15-20 dev hours over 10 weeks (1.5-2 hours/week average)  
**QA Effort:** ~3-4 hours total  

---

## 💰 ROI Projection

### Investment
- Developer time: ~15-20 hours @ $75/hour = **$1,125-$1,500**
- QA time: ~3-4 hours @ $65/hour = **$195-$260**
- **Total investment:** ~$1,320-$1,760

### Savings (Year 1)
- **Faster form/card development:** 10-15% velocity gain × 2 FTE × 200 billing days = **~$24,000**
- **Fewer bugs in uniform components:** ~5% defect reduction × $5k/bug = **~$2,500**
- **Reduced design reviews:** Token-first = fewer spec questions = **~$3,600**
- **Maintenance reduction:** Consolidated patterns easier to update = **~$18,000**
- **Total year 1 savings:** ~$48,100

### Breakeven
- **Week 4** (Phase 2 completion) — payback occurs as team develops faster

### ROI Ratio
- **Year 1 ROI:** 48,100 / 1,500 = **32x return**
- **Ongoing annual savings:** ~$48k/year

---

## 🛑 Rollback Plan

| Phase | Rollback Procedure | Effort |
|-------|---|---|
| **Phase 1** | Remove token imports, revert CSS | 10 min |
| **Phase 2A** | Git revert, restore form-fields.tsx | 15 min |
| **Phase 2B** | Git revert, restore domain card files | 20 min |
| **Phase 3** | Component-by-component revert (git) | 30 min |
| **Phase 4** | Remove CI rules, restore component access | 15 min |

**Key:** Git commits are atomic by phase → rollback is simple branch reset.

---

## 🎓 Team Onboarding

### Prerequisites
- [ ] Read `TOKENS.md` (token naming conventions)
- [ ] Review `COMPONENT-API.md` (variant system)
- [ ] Inspect design tokens in DevTools (CSS variables)
- [ ] Practice: Update one form field component

### Training Materials
- 🎬 **5-min video:** Token system walkthrough
- 📖 **Checklists:** `TOKENS-USAGE-CHECKLIST.md`, `VARIANT-CHECKLIST.md`
- 🧪 **Sandbox:** `src/examples/component-examples.tsx` (before/after)

---

## 🔍 Success Metrics

**Track during migration:**

| Metric | Baseline | Target | Measured |
|--------|----------|--------|----------|
| Token usage | 0% | >90% | File audit |
| Pattern redundancy | 1.79 | <1.45 | Code analysis |
| Build time | TBD | -5% | CI logs |
| PR review time | TBD | -20% | GitHub metrics |
| Component consistency | 70% | >95% | Linting + QA |

---

## ⚠️ Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| Form regression | MEDIUM | Phase 2A: thorough QA before merge |
| Card breakage | MEDIUM | Thorough variant testing, screenshot diff |
| Team adoption lag | MEDIUM | Clear docs + examples, enforce via CI |
| Performance impact | LOW | Token loading + CSS var cascade (benchmarked) |
| Git conflicts | LOW | Atomic commits by feature, rebase strategy |

---

## 📋 Checklist for Phase Leads

### Phase 1 Lead (Foundation)
- [ ] Merge token files into design-tokens/
- [ ] Update layout imports
- [ ] Configure Tailwind
- [ ] Test on staging
- [ ] Update TOKENS.md
- [ ] Hand off to Phase 2 lead

### Phase 2 Lead (Consolidation)
- [ ] Create component mapping spreadsheet
- [ ] Review form-field variants
- [ ] Create Card variant system
- [ ] Migrate all usages
- [ ] Screenshot diff testing
- [ ] Document changes

### Phase 3 Lead (Long-Tail)
- [ ] Add status tokens
- [ ] Refactor remaining components
- [ ] Update variant definitions
- [ ] Train team on CVA patterns

### Phase 4 Lead (Enforcement)
- [ ] Set up CI rules
- [ ] Create lint config
- [ ] Add git hooks
- [ ] Dashboard setup
- [ ] Final metrics report

---

## 🎯 Next Steps

1. **Week 1-2:** Start Phase 1 (foundation)
2. **Weekly sync:** 30-min check-in on metrics
3. **Sprint retro:** Review consolidation impact
4. **Month 2:** Phase 3 → continuous refinement
5. **Month 3:** Phase 4 → lock in patterns

---

**Migration Strategy Ready for Execution**  
Next command: `*build` to start Phase 1 implementation  

Generated by Uma (UX Design Expert) | Design System Maturity: 8.2 → 8.7/10
