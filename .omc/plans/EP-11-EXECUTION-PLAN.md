# EP-11 Execution Plan — Authentication Enhancement

**Epic:** EP-11 — Authentication Enhancement  
**Deliverable:** D-1.4  
**Duration:** 2-3 days  
**Mode:** 5-Agent Parallel Execution  
**Goal:** Strengthen auth system for multi-tenant future (session rotation, RBAC, rate limiting, security hardening)

---

## 📋 Executive Summary

EP-11 hardens the authentication system by implementing:
1. **Session Token Rotation** — Rotate JWT on every activity
2. **RBAC Enforcement** — Enforce Admin/Instructor/Student roles
3. **Rate Limiting** — Protect login endpoint (5 attempts/15min)
4. **Session Cleanup** — Clear all sessions on logout
5. **Demo Auth Isolation** — Sandbox demo user from real data
6. **Security Hardening** — OWASP compliance, JWT best practices

---

## 🎯 Acceptance Criteria (7 total)

| ID | Criterion | Owner | Status |
|----|-----------|-------|--------|
| AC1 | Session tokens rotated on activity | @dev | TODO |
| AC2 | RBAC (Admin/Instructor/Student) enforced | @dev + @security | TODO |
| AC3 | Logout clears all sessions | @dev | TODO |
| AC4 | Rate limiting on login (5 attempts) | @dev + @qa | TODO |
| AC5 | Demo auth properly isolated | @dev + @security | TODO |
| AC6 | All auth flows tested | @qa | TODO |
| AC7 | Security audit passed | @security | TODO |

---

## 👥 5-Agent Team & Responsibilities

### 1. **@pm (Morgan)** — Project Coordination & Planning
**Persona:** Product Manager  
**Focus:** Requirements validation, stakeholder alignment, delivery tracking

**Responsibilities:**
- Validate AC completeness against D-1.4 spec
- Coordinate handoffs between agents
- Track blockers + escalation
- Prepare acceptance checklist
- Communication with stakeholders

**Deliverables:**
- AC validation checklist (pre-dev)
- Acceptance sign-off (post-dev)
- Risk log + mitigation

**Dependencies:** None (start immediately)  
**Effort:** 4 hours (1 hour per agent coordination + 2 hours admin)

---

### 2. **@architect (Aria)** — Auth Architecture & Design
**Persona:** Technical Architect  
**Focus:** System design, technology selection, security patterns

**Responsibilities:**
- Design session token rotation strategy (timing, algorithm)
- Design RBAC model (admin > instructor > student hierarchy)
- Design rate limiting architecture (in-memory vs Redis)
- Design demo auth sandbox (separate context, RLS rules)
- Document auth flow diagrams (ASCII)
- Identify security risks + mitigations

**Deliverables:**
- `AUTH-ARCHITECTURE.md` (auth flows, RBAC model, session design)
- `RATE-LIMITING-DESIGN.md` (algorithm, storage, edge cases)
- `DEMO-AUTH-ISOLATION.md` (RLS rules, context separation)
- ASCII diagrams (session lifecycle, RBAC tree)

**Dependencies:** @pm AC validation ✅  
**Effort:** 6 hours (design + documentation)  
**Blocker Prevention:** Design done before @dev starts

---

### 3. **@dev (Dex)** — Implementation
**Persona:** Full Stack Developer  
**Focus:** Code implementation of all auth features

**Responsibilities:**
- Implement session token rotation (JWT refresh logic)
- Implement RBAC enforcement (middleware, authorization checks)
- Implement session cleanup on logout (clear all device sessions)
- Implement rate limiting (login endpoint protection)
- Implement demo auth isolation (RLS + context guards)
- Add proper error handling + logging
- Update auth tests as needed

**Deliverables:**
- Session rotation implementation (`src/lib/auth/session-rotation.ts`)
- RBAC middleware (`src/lib/auth/rbac-middleware.ts`)
- Rate limiter (`src/lib/auth/rate-limiter.ts`)
- Demo auth guards (`src/lib/auth/demo-auth-isolation.ts`)
- Session cleanup (`src/lib/auth/session-cleanup.ts`)
- All files pass lint + typecheck

**Dependencies:**
- @architect design ✅ (AUTH-ARCHITECTURE.md)
- @pm AC validation ✅

**Effort:** 12 hours (implementation + unit testing)  
**Success Metric:** All new code compiles, 90%+ unit test coverage

---

### 4. **@security-reviewer (Security Specialist)** — Security Audit & Hardening
**Persona:** Security Engineer  
**Focus:** Vulnerability detection, OWASP compliance, hardening

**Responsibilities:**
- Review JWT implementation (algorithm, expiry, signature)
- Review rate limiting logic (timing attacks, bypass prevention)
- Review RBAC enforcement (privilege escalation vectors)
- Review demo auth isolation (data leakage risks)
- Check OWASP Top 10 compliance:
  - A01:2021 Broken Access Control (RBAC)
  - A02:2021 Cryptographic Failures (JWT)
  - A07:2021 Identification & Authentication (session mgmt)
- Run static security scan (npm audit, SonarQube)
- Document security findings + mitigations

**Deliverables:**
- `SECURITY-AUDIT.md` (findings, severity, mitigations)
- `OWASP-CHECKLIST.md` (compliance status)
- `SECURITY-HARDENING-RECOMMENDATIONS.md` (fixes + PRs)
- All HIGH/CRITICAL findings remediated
- Static scan report (zero critical issues)

**Dependencies:**
- @dev implementation ✅ (code ready for review)
- @architect design ✅ (for validation)

**Effort:** 8 hours (audit + remediation)  
**Success Metric:** All CRITICAL findings fixed, OWASP checklist 100%

---

### 5. **@qa (Quinn)** — Testing & Validation
**Persona:** QA/Test Engineer  
**Focus:** Test coverage, E2E validation, security testing

**Responsibilities:**
- Write E2E tests for auth flows:
  - Login (success, invalid creds, locked account)
  - Logout (single device, all devices)
  - Token rotation (activity triggers)
  - RBAC (admin-only endpoints, instructor features, student limitations)
  - Rate limiting (5 attempts, lockout, bypass attempts)
  - Demo auth (data isolation, real user prohibition)
- Validate test coverage ≥70%
- Run security tests:
  - Brute force attempts (rate limiting)
  - Privilege escalation (RBAC enforcement)
  - Session fixation attacks
  - JWT manipulation (signature verification)
- Document test results + coverage report
- Verify no regression in existing flows

**Deliverables:**
- `tests/auth-flows.spec.ts` (E2E auth tests)
- `tests/rbac-enforcement.spec.ts` (RBAC tests)
- `tests/rate-limiting.spec.ts` (rate limiter tests)
- `tests/demo-auth-isolation.spec.ts` (demo auth tests)
- Coverage report (≥70%)
- Security test report
- Regression validation (existing flows intact)

**Dependencies:**
- @dev implementation ✅ (code ready for testing)
- @security audit ✅ (test cases for findings)

**Effort:** 10 hours (test development + execution)  
**Success Metric:** All 7 ACs tested, coverage ≥70%, zero HIGH findings

---

## 📅 Execution Timeline

### Phase 1: Planning & Design (Day 1, Morning)
- **@pm:** Validate ACs (1 hour)
- **@architect:** Design session/RBAC/rate-limit (6 hours)
- **Parallel:** @dev reviews architecture, @security plans audit

**Milestone:** Architecture docs + AC validation ✅

### Phase 2: Implementation (Day 1-2, Full Day)
- **@dev:** Implement all features (12 hours, can overlap Phase 1)
- **@qa:** Prepare test cases (2 hours, during @dev)
- **@security:** Security threat modeling (2 hours, during @dev)

**Milestone:** All code compiles, no lint/typecheck errors

### Phase 3: Security Audit (Day 2, Afternoon)
- **@security:** Review implementation + audit (6 hours)
- **@dev:** Remediate findings (4 hours)
- **@pm:** Track blockers

**Milestone:** All CRITICAL findings fixed

### Phase 4: Testing & Validation (Day 2-3, Full)
- **@qa:** Run full test suite (8 hours)
- **@dev:** Fix failing tests (2 hours)
- **@security:** Security test execution (2 hours)
- **@pm:** Final acceptance checklist

**Milestone:** All ACs passing ✅, tests green ✅

---

## 🔄 Handoff Protocol

### @pm → @architect (Day 1, 9:00 AM)
```yaml
handoff:
  from_agent: "@pm"
  to_agent: "@architect"
  blockers: []
  decision: AC validation complete, proceed with design
  files_created:
    - AC-VALIDATION-CHECKLIST.md
```

### @architect → @dev (Day 1, 3:00 PM)
```yaml
handoff:
  from_agent: "@architect"
  to_agent: "@dev"
  files_created:
    - AUTH-ARCHITECTURE.md
    - RATE-LIMITING-DESIGN.md
    - DEMO-AUTH-ISOLATION.md
  decision: Design approved, implementation can start
  blockers: []
```

### @dev → @security (Day 2, 3:00 PM)
```yaml
handoff:
  from_agent: "@dev"
  to_agent: "@security-reviewer"
  files_modified:
    - src/lib/auth/session-rotation.ts
    - src/lib/auth/rbac-middleware.ts
    - src/lib/auth/rate-limiter.ts
    - src/lib/auth/demo-auth-isolation.ts
    - src/lib/auth/session-cleanup.ts
  status: Code ready for security audit
  blockers: []
```

### @dev → @qa (Day 1, 3:00 PM)
```yaml
handoff:
  from_agent: "@dev"
  to_agent: "@qa"
  files: [AUTH-ARCHITECTURE.md, test template]
  decision: Begin test planning, coding starts in parallel
  blockers: []
```

### @security → @dev (Day 2, 5:00 PM)
```yaml
handoff:
  from_agent: "@security-reviewer"
  to_agent: "@dev"
  files_created:
    - SECURITY-AUDIT.md
  findings: [list of CRITICAL/HIGH]
  status: Awaiting remediation
  deadline: Day 3, 9:00 AM
```

### @qa → @pm (Day 3, 3:00 PM)
```yaml
handoff:
  from_agent: "@qa"
  to_agent: "@pm"
  files_created:
    - test results, coverage report
  verdict: ALL ACs PASSING
  status: Ready for acceptance
```

---

## ⚠️ Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Rate limiter complexity | Medium | High | Use proven library (express-rate-limit), reference examples |
| RBAC bypass vulnerabilities | Medium | Critical | Security review mandatory before merge, pentest specific vectors |
| Session token collisions | Low | Critical | Use cryptographically secure RNG (crypto.randomBytes) |
| Demo auth data leak | Low | High | RLS policies + separate Supabase role, test data isolation |
| Integration issues with existing auth | Medium | High | Comprehensive regression tests, test on staging branch |

**Escalation:** If CRITICAL findings remain after 2 iterations, escalate to @aiox-master

---

## ✅ Done Criteria

**All 7 ACs implemented & tested:**
- [ ] AC1: Session tokens rotate on activity
- [ ] AC2: RBAC enforced (Admin/Instructor/Student)
- [ ] AC3: Logout clears all sessions
- [ ] AC4: Rate limiting enforced (5 attempts)
- [ ] AC5: Demo auth isolated
- [ ] AC6: All auth flows tested (E2E coverage ≥70%)
- [ ] AC7: Security audit passed (zero CRITICAL, HIGH findings remediated)

**Quality gates passed:**
- [ ] npm run typecheck — 0 errors
- [ ] npm run lint — 0 errors
- [ ] npm run build — 0 warnings
- [ ] npm test — all passing (109+ tests)
- [ ] Security audit — PASSED

**Deliverables completed:**
- [ ] Story file (EP-11.1) marked Done
- [ ] Decision log + architecture docs
- [ ] Git commits with conventional messages
- [ ] PR ready for staging review

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Delivery time | 2-3 days | Timeline adherence |
| Test coverage | ≥70% | npm test coverage report |
| Security findings | 0 CRITICAL | SECURITY-AUDIT.md |
| Code quality | 0 warnings | npm run lint + build |
| OWASP compliance | 100% | OWASP-CHECKLIST.md |
| Team coordination | Zero blockers | Decision log + handoffs |

---

## 🚀 Post-Completion

**Staging Review:**
- @devops cherry-picks commits to staging
- Team tests auth in QA environment
- Collects feedback for adjustments

**Production Deployment:**
- Database migration (if needed)
- Session invalidation strategy
- Monitoring setup
- Runbook documentation

**Phase B Handoff:**
- EP-11 ✅ → Ready for EP-12 (Integration Tests)
- Authentication system hardened
- RBAC foundation ready for multi-tenant
