# Technical Debt Assessment — DRAFT

**Project:** site-rh-cursos  
**Phase:** Brownfield Discovery (Phase 4)  
**Status:** DRAFT (awaiting specialist reviews)  
**Generated:** 2026-06-22  
**Author:** @architect (Aria)

---

## Executive Summary

This document catalogs identified technical debt from Phase 1 (System Architecture) analysis. Final assessment after specialist reviews (Phases 5-7) will be in `technical-debt-assessment.md`.

**Debt Score:** 4.2/10 (LOW)  
**Severity Distribution:**
- 🔴 CRITICAL: 1 item
- 🟠 HIGH: 4 items  
- 🟡 MEDIUM: 8 items
- 🟢 LOW: 4 items

**Total Estimated Remediation:** 15-20 days

---

## Debt Categories

### 1. DATA LAYER DEBT

#### D-1.1 CRITICAL: Dual Data Sources (Mock + Real API)
- **Location:** `src/data/mock*.ts` + `src/lib/app-store.tsx`
- **Impact:** Data consistency, developer confusion, production risk
- **Debt:** 
  - 8 mock data files (~2KB each) duplicate Supabase entities
  - AppStore fallback logic masks missing real data
  - No sync mechanism between mock and real data
- **Remediation:**
  1. Migrate all mock data to Supabase seed script
  2. Remove all `src/data/mock*.ts` files
  3. Update AppStore to use Supabase exclusively
  4. Add data freshness validation
- **Effort:** 2 days
- **Priority:** P0 (blocks future feature development)

#### D-1.2 HIGH: Demo Auth in Production Code
- **Location:** `src/lib/auth.ts` lines 37-61
- **Impact:** Security, unintended access if credentials leak
- **Debt:**
  - `demoUsers` array with hardcoded credentials
  - Demo auth check based on environment variable
  - Risk: if DEMO_ADMIN_PASSWORD leaks, unauthorized access possible
- **Remediation:**
  1. Extract demo auth to separate module
  2. Feature-flag demo auth (disabled by default)
  3. Use separate build target for demo
  4. Add security warning in docs
- **Effort:** 1 day
- **Priority:** P1 (security debt)

#### D-1.3 HIGH: AppStore Context Too Large
- **Location:** `src/lib/app-store.tsx`
- **Impact:** Performance (re-renders), maintainability
- **Debt:**
  - Single context manages 8+ data types
  - All subscribers re-render on any state change
  - ~500+ lines likely, hard to understand
- **Remediation:**
  1. Split into 4 domain contexts:
     - CourseContext (courses, classes)
     - StudentContext (students, enrollments, ratings)
     - AdministrationContext (instructors, leads)
     - SessionContext (current user, auth)
  2. Use composition to wrap multiple contexts
  3. Memoize context values to prevent re-renders
- **Effort:** 3 days
- **Priority:** P1 (performance/scalability)

#### D-1.4 MEDIUM: No Data Validation at Boundaries
- **Location:** `src/lib/supabase/rh-cursos-api.ts`
- **Impact:** Data integrity, runtime errors
- **Debt:**
  - API responses not validated against schema
  - Silent failures if Supabase returns unexpected data
  - No error recovery for malformed responses
- **Remediation:**
  1. Wrap all API calls with Zod schema validation
  2. Add retry logic for transient failures
  3. Log validation errors for debugging
- **Effort:** 1.5 days
- **Priority:** P2 (quality improvement)

---

### 2. FRONTEND ARCHITECTURE DEBT

#### D-2.1 HIGH: No Error Boundaries
- **Location:** Missing from `app/layout.tsx`, feature roots
- **Impact:** UI crashes instead of graceful fallback
- **Debt:**
  - No error.tsx or global.error.tsx
  - Unhandled component errors crash page
  - Poor user experience on failures
- **Remediation:**
  1. Implement `app/error.tsx` (catch client errors)
  2. Implement `app/global-error.tsx` (catch root errors)
  3. Create error fallback UI component
  4. Log errors to monitoring service
- **Effort:** 1 day
- **Priority:** P1 (user experience)

#### D-2.2 MEDIUM: Oversized AppStore Context
- **Location:** `src/lib/app-store.tsx` (related to D-1.3)
- **Impact:** Performance, makes context splitting urgent
- **Debt:** (see D-1.3 for details)

#### D-2.3 MEDIUM: No Component Documentation
- **Location:** 42 UI components in `src/components/`
- **Impact:** Onboarding, consistency enforcement
- **Debt:**
  - No Storybook or component catalog
  - Developers unsure how to use components
  - Copy-paste patterns instead of reuse
- **Remediation:**
  1. Create Storybook or Nextra component docs
  2. Document all 42 components with examples
  3. Add accessibility info for each component
  4. Create component usage guidelines
- **Effort:** 3 days
- **Priority:** P2 (developer experience)

#### D-2.4 MEDIUM: Legacy Font Loading
- **Location:** `app/layout.tsx` lines 30-35
- **Impact:** Bundle size, page load performance
- **Debt:**
  - `legacy-manrope` font loaded but possibly unused
  - Three font families loaded (Inter, Montserrat, Manrope)
  - Unnecessary font requests
- **Remediation:**
  1. Audit actual font usage in codebase
  2. Remove unused font (likely Manrope)
  3. Consider subsetting/optimizing remaining fonts
  4. Verify all design tokens use current fonts
- **Effort:** 0.5 days
- **Priority:** P3 (performance optimization)

#### D-2.5 LOW: Inconsistent Class Naming
- **Location:** Throughout components
- **Impact:** Maintainability, styling conflicts
- **Debt:**
  - Mix of tailwind + mantine class naming
  - No clear pattern for conditional classes
  - clsx/classnames used inconsistently
- **Remediation:**
  1. Standardize on clsx + tailwind-merge
  2. Create className utility helper
  3. Update all components to use consistent pattern
- **Effort:** 2 days
- **Priority:** P3 (code quality)

---

### 3. TESTING DEBT

#### D-3.1 HIGH: No Unit Tests
- **Location:** `tests/` (Playwright E2E only)
- **Impact:** Component logic not validated, regression risk
- **Debt:**
  - 0 unit tests for utilities, hooks, components
  - E2E tests only (brittle, slow)
  - No coverage metrics
  - Difficult to debug failures
- **Remediation:**
  1. Set up Vitest + React Testing Library
  2. Add unit tests for all `src/lib/` utilities
  3. Add tests for custom hooks
  4. Aim for 70%+ coverage
  5. Integrate with CI/CD
- **Effort:** 5 days
- **Priority:** P1 (quality assurance)

#### D-3.2 MEDIUM: Incomplete E2E Test Coverage
- **Location:** `tests/`
- **Impact:** Unknown failure modes, regression risk
- **Debt:**
  - E2E tests likely cover happy path only
  - Admin workflows not fully tested
  - Edge cases missing
  - Performance tests absent
- **Remediation:**
  1. Expand E2E suite (admin flows, error cases)
  2. Add performance tests (Lighthouse)
  3. Add visual regression tests
  4. Increase coverage to 80%+
- **Effort:** 3 days
- **Priority:** P2 (quality)

---

### 4. DOCUMENTATION DEBT

#### D-4.1 HIGH: Missing README
- **Location:** `README.md` (single blank line)
- **Impact:** Onboarding, team friction
- **Debt:**
  - No project description
  - No setup instructions
  - No testing guide
  - No deployment guide
  - No contribution guidelines
- **Remediation:**
  1. Create comprehensive README with:
     - Project overview
     - Quick start (setup, dev, test)
     - Architecture overview
     - Deployment guide
     - Troubleshooting
     - Contributing guidelines
- **Effort:** 1.5 days
- **Priority:** P1 (developer experience)

#### D-4.2 MEDIUM: No API Documentation
- **Location:** N/A (not implemented)
- **Impact:** Unclear data contracts, API misuse
- **Debt:**
  - No OpenAPI/Swagger docs
  - No endpoint documentation
  - No schema documentation
  - Unclear RLS policies
- **Remediation:**
  1. Generate OpenAPI schema from Supabase
  2. Create Swagger UI for API exploration
  3. Document all query parameters, response formats
  4. Create API client examples
- **Effort:** 2 days
- **Priority:** P2 (documentation)

#### D-4.3 MEDIUM: Incomplete Architecture Docs
- **Location:** `docs/architecture/`
- **Impact:** Decisions not documented, unclear rationale
- **Debt:**
  - No design decision records (ADRs)
  - No deployment architecture docs
  - No security architecture docs
  - No performance optimization strategy
- **Remediation:**
  1. Create ADR template and document key decisions
  2. Write deployment architecture guide
  3. Document security implementation
  4. Create performance tuning guide
- **Effort:** 2 days
- **Priority:** P2 (knowledge management)

#### D-4.4 LOW: Incomplete Code Comments
- **Location:** Throughout codebase
- **Impact:** Code understanding, onboarding
- **Debt:**
  - Complex logic lacks explanatory comments
  - RLS policies not explained
  - Validation rules undocumented
- **Remediation:**
  1. Add inline comments for non-obvious logic
  2. Document RLS policies with examples
  3. Explain validation schema intent
- **Effort:** 1.5 days
- **Priority:** P3 (nice-to-have)

---

### 5. INFRASTRUCTURE DEBT

#### D-5.1 MEDIUM: No Monitoring/Logging
- **Location:** Codebase-wide
- **Impact:** Production issues difficult to diagnose
- **Debt:**
  - No error tracking (Sentry, etc.)
  - No structured logging
  - No performance monitoring
  - No real-time alerts
- **Remediation:**
  1. Integrate Sentry for error tracking
  2. Add structured logging (winston, pino)
  3. Add APM (Application Performance Monitoring)
  4. Create alerting rules
- **Effort:** 2 days
- **Priority:** P1 (observability)

#### D-5.2 MEDIUM: No Environment Management Best Practices
- **Location:** `.env.example`, `.env.local`
- **Impact:** Configuration errors, security risk
- **Debt:**
  - No secret rotation strategy
  - No environment variable validation at startup
  - No documentation of required vars
- **Remediation:**
  1. Complete `.env.example` with all required vars
  2. Add startup validation of env vars
  3. Document secret rotation process
  4. Create env setup guide
- **Effort:** 1 day
- **Priority:** P2 (ops)

#### D-5.3 LOW: Incomplete CI/CD Pipeline
- **Location:** `.github/workflows/`
- **Impact:** Manual deployment overhead
- **Debt:**
  - No automated testing in CI
  - No automated linting check
  - Manual deployment required
- **Remediation:**
  1. Add test step to CI pipeline
  2. Add lint check to CI
  3. Add type check to CI
  4. Consider automated deployment
- **Effort:** 1.5 days
- **Priority:** P2 (automation)

---

### 6. SECURITY DEBT

#### D-6.1 MEDIUM: No Security Headers
- **Location:** `src/lib/security-headers.ts` (exists but incomplete)
- **Impact:** XSS, clickjacking, other attacks
- **Debt:**
  - CSP policy incomplete or missing
  - CORS headers not configured
  - No HSTS (HTTP Strict-Transport-Security)
  - No rate limiting middleware
- **Remediation:**
  1. Implement comprehensive CSP policy
  2. Add CORS headers (restrict to known origins)
  3. Add HSTS header (production only)
  4. Implement rate limiting on API endpoints
- **Effort:** 1.5 days
- **Priority:** P1 (security)

#### D-6.2 MEDIUM: No Input Sanitization
- **Location:** Form handling throughout app
- **Impact:** XSS vulnerabilities
- **Debt:**
  - Zod validation present but no sanitization
  - Rich text fields not sanitized
  - URLs not validated for javascript:
- **Remediation:**
  1. Add DOMPurify for rich text
  2. Add URL validation utility
  3. Sanitize user inputs before rendering
- **Effort:** 1 day
- **Priority:** P1 (security)

#### D-6.3 LOW: No OWASP Top 10 Audit
- **Location:** Codebase-wide
- **Impact:** Unknown vulnerabilities
- **Debt:**
  - No systematic vulnerability scan
  - No security code review
  - No dependency vulnerability checks
- **Remediation:**
  1. Run npm audit regularly
  2. Integrate Snyk for continuous scanning
  3. Add security code review process
  4. Document security best practices
- **Effort:** 0.5 days + ongoing
- **Priority:** P2 (security audit)

---

### 7. PERFORMANCE DEBT

#### D-7.1 MEDIUM: No Bundle Analysis
- **Location:** N/A (not configured)
- **Impact:** Unknown bundle size growth, slow pages
- **Debt:**
  - No bundle size tracking
  - No performance regression detection
  - No lighthouse automation
- **Remediation:**
  1. Add @next/bundle-analyzer
  2. Integrate bundle size checks in CI
  3. Add lighthouse CI
  4. Set performance budgets
- **Effort:** 1 day
- **Priority:** P2 (performance)

#### D-7.2 LOW: No Database Query Optimization
- **Location:** Supabase queries in `src/lib/supabase/`
- **Impact:** Slow pages, N+1 queries possible
- **Debt:**
  - No query logging
  - No performance metrics
  - Pagination may be missing
- **Remediation:**
  1. Add query logging to identify slow queries
  2. Implement pagination for list views
  3. Add indexes for frequently queried columns
  4. Implement caching strategy
- **Effort:** 2 days
- **Priority:** P3 (optimization)

---

## Remediation Roadmap

### Phase A (Weeks 1-2) — Critical Path
**Priority:** P0-P1 items that block progress

1. **D-1.1** — Remove mock data (2 days)
2. **D-1.2** — Secure demo auth (1 day)
3. **D-2.1** — Implement error boundaries (1 day)
4. **D-3.1** — Add unit tests (5 days)
5. **D-4.1** — Create README (1.5 days)

**Estimated:** 10.5 days

### Phase B (Weeks 3-4) — High Impact
**Priority:** P1-P2 items that improve quality

1. **D-1.3** — Split AppStore context (3 days)
2. **D-5.1** — Add monitoring/logging (2 days)
3. **D-6.1** — Implement security headers (1.5 days)
4. **D-4.2** — Create API documentation (2 days)

**Estimated:** 8.5 days

### Phase C (Weeks 5-6) — Continuous Improvement
**Priority:** P2-P3 items that optimize

1. **D-3.2** — Expand E2E tests (3 days)
2. **D-2.3** — Create component docs (3 days)
3. **D-7.1** — Add bundle analysis (1 day)
4. **D-4.3** — Write architecture ADRs (2 days)

**Estimated:** 9 days

### Phase D (Ongoing) — Housekeeping
**Priority:** P3 items, technical debt management

1. **D-2.4** — Remove unused fonts (0.5 days)
2. **D-4.4** — Improve code comments (1.5 days)
3. **D-5.2** — Environment management (1 day)
4. **D-5.3** — Complete CI/CD (1.5 days)
5. **D-2.5** — Standardize class naming (2 days)

**Estimated:** 6.5 days

---

## Risk Assessment

### High-Risk Items (Must Address)

1. **Demo Auth in Production** (D-1.2)
   - Risk: Unauthorized access if credentials leak
   - Mitigation: Feature flag + separate build target

2. **No Error Boundaries** (D-2.1)
   - Risk: UI crashes, poor user experience
   - Mitigation: Implement error.tsx immediately

3. **No Unit Tests** (D-3.1)
   - Risk: Regressions, debugging difficulty
   - Mitigation: Establish testing culture + CI integration

4. **No Monitoring** (D-5.1)
   - Risk: Production issues go undetected
   - Mitigation: Integrate Sentry + structured logging

---

## Dependencies & Blockers

```
Phase A (Critical)
├── D-1.1 (mock data) — blocks: D-1.3, D-4.1
├── D-1.2 (demo auth) — blocks: none
├── D-2.1 (error boundaries) — blocks: D-3.2
├── D-3.1 (unit tests) — blocks: none, increases confidence
└── D-4.1 (README) — blocks: onboarding only

Phase B (High Impact)
├── D-1.3 (AppStore) — depends on: D-1.1
├── D-5.1 (monitoring) — blocks: D-4.1 (documentation)
├── D-6.1 (security) — blocks: none
└── D-4.2 (API docs) — depends on: D-1.1

Phase C (Improvement)
├── D-3.2 (E2E tests) — depends on: D-2.1
├── D-2.3 (component docs) — blocks: future UI work
├── D-7.1 (bundle analysis) — blocks: none
└── D-4.3 (ADRs) — blocks: none
```

---

## Success Metrics

After remediation, project should achieve:

| Metric | Current | Target |
|--------|---------|--------|
| Unit test coverage | 0% | 70%+ |
| E2E test coverage | ~30% | 80%+ |
| README completeness | 0% | 100% |
| Error boundary coverage | 0% | 100% |
| Security header coverage | ~40% | 100% |
| Documentation completeness | ~30% | 90% |
| Bundle analysis tracking | No | Yes |
| Monitoring/logging | No | Yes |

---

## Next Steps

1. **Wait for Phase 5-7 specialist reviews** (data-engineer, ux-designer, qa)
2. **Merge findings into technical-debt-assessment.md** (Phase 8)
3. **Create epic for remediation** (Phase 10)
4. **Prioritize Phase A items** for immediate implementation

---

*Document Version: 1.0 (DRAFT)*  
*Awaiting: Phase 5 (Data), Phase 6 (UX), Phase 7 (QA) reviews*  
*Next: Phase 8 (Final Assessment)*
