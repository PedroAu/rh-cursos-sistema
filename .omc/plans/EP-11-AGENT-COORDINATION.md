# EP-11 Agent Coordination Guide

**Mode:** 5-Agent Parallel Execution  
**Epic:** EP-11 — Authentication Enhancement  
**Duration:** 2-3 days  
**Status:** Ready for Kickoff

---

## 🎯 Quick Reference: Who Does What

### 1. **@pm (Morgan)** — Project Orchestration
**Hours:** 4 hours over 2 days  
**Timeline:** Start Day 1 (9:00 AM) → End Day 3 (5:00 PM)

**Day 1 Tasks:**
1. Review PHASE-B-PLAN.md D-1.4 section
2. Validate ACs against implementation spec
3. Create AC-VALIDATION-CHECKLIST.md
4. Kickoff meeting with team (15 min sync)

**Day 2-3 Tasks:**
1. Track @dev progress (2x daily check-ins)
2. Monitor @security audit findings
3. Coordinate blocker resolution
4. Prepare final acceptance checklist

**Output:**
```
- AC-VALIDATION-CHECKLIST.md
- EP-11-STATUS-LOG.md
- ACCEPTANCE-SIGN-OFF.md (Day 3)
```

**Success Metric:** All handoffs on-time, zero unresolved blockers

---

### 2. **@architect (Aria)** — Auth Architecture
**Hours:** 6-8 hours over 1 day  
**Timeline:** Start Day 1 (10:00 AM) → End Day 1 (5:00 PM)

**Day 1 Tasks:**
1. Read EP-11-IMPLEMENTATION-SPEC.md + current auth codebase
2. Design session token rotation:
   - Activity tracking strategy
   - Token rotation timing (15min? 30min?)
   - Refresh token vs access token approach
3. Design RBAC model:
   - Role hierarchy (Admin > Instructor > Student)
   - Permission matrix
   - RLS policy strategy
4. Design rate limiting:
   - Algorithm (sliding window? leaky bucket?)
   - Storage (in-memory vs Redis)
   - Key strategy (IP + endpoint)
5. Design demo auth isolation:
   - Separate demo context
   - RLS policies for demo
   - Data tagging strategy

**Deliverables:**
```
AUTH-ARCHITECTURE.md
  ├── Session Rotation Design
  ├── Token Flow Diagrams (ASCII)
  ├── JWT Refresh Algorithm
  ├── RBAC Model & Hierarchy
  ├── Permission Matrix
  ├── Rate Limit Algorithm
  └── Demo Auth RLS Policies
```

**Success Metric:** Design reviewed by @security, no ambiguities

**Handoff to @dev:**
```yaml
- File: AUTH-ARCHITECTURE.md
- Decision: Design approved, proceed with implementation
- Blockers: None
```

---

### 3. **@dev (Dex)** — Implementation
**Hours:** 12-14 hours over 2 days  
**Timeline:** Start Day 1 (10:00 AM) → End Day 2 (5:00 PM)

**Day 1 Tasks (6 hours):**
1. Read AUTH-ARCHITECTURE.md
2. Implement session token rotation:
   - `src/lib/auth/session-rotation.ts`
   - Activity tracking (client + server)
   - Token refresh endpoint
3. Implement RBAC middleware:
   - `src/lib/auth/rbac-middleware.ts`
   - Role definitions + permission checks
   - API route protection

**Day 2 Tasks (8 hours):**
4. Implement rate limiting:
   - `src/lib/auth/rate-limiter.ts`
   - Login endpoint protection
5. Implement session cleanup:
   - `src/lib/auth/session-cleanup.ts`
   - Logout all devices logic
6. Implement demo auth isolation:
   - `src/lib/auth/demo-auth-isolation.ts`
   - RLS context guards
7. Update existing files:
   - Integrate into `src/lib/auth.ts`
   - Update auth endpoints
8. Pass all checks:
   - `npm run typecheck` ✅
   - `npm run lint` ✅
   - `npm run build` ✅

**Files to Create:**
```
src/lib/auth/
├── session-rotation.ts
├── token-refresh.ts
├── rbac-middleware.ts
├── rbac-roles.ts
├── permission-matrix.ts
├── rate-limiter.ts
├── rate-limit-store.ts
├── session-cleanup.ts
├── demo-auth-isolation.ts
└── __tests__/
    ├── session-rotation.spec.ts
    ├── rbac-middleware.spec.ts
    ├── rate-limiter.spec.ts
    ├── session-cleanup.spec.ts
    └── demo-auth-isolation.spec.ts
```

**Success Metric:** All code compiles, 90%+ unit test coverage, zero lint/typecheck errors

**Handoff to @security:**
```yaml
- Files: All src/lib/auth/* files
- Status: Code ready for audit
- Blockers: None
```

---

### 4. **@security-reviewer** — Security Audit
**Hours:** 8-10 hours over 2 days  
**Timeline:** Start Day 2 (9:00 AM) → End Day 2 (5:00 PM)

**Day 2 Tasks (4 hours):**
1. Read AUTH-ARCHITECTURE.md + IMPLEMENTATION-SPEC.md
2. Review @dev implementation:
   - JWT algorithm + expiry validation
   - Token signature verification
   - Session rotation logic
   - RBAC enforcement
3. Threat modeling:
   - Session fixation attacks
   - Token manipulation
   - Privilege escalation vectors
   - Brute force bypass
4. Static analysis:
   - `npm audit` for dependencies
   - SonarQube scan (if available)
5. OWASP checklist:
   - A01:2021 Broken Access Control
   - A02:2021 Cryptographic Failures
   - A07:2021 Identification & Authentication

**Day 2 Afternoon Tasks (6 hours):**
6. Security testing:
   - Brute force rate limit test
   - Privilege escalation attempts
   - Session fixation test
   - Token forgery test
7. Document findings:
   - SECURITY-AUDIT.md (all findings)
   - Severity classification
   - Remediation steps
8. Report to @dev:
   - CRITICAL findings → must fix before merge
   - HIGH findings → must fix, can merge after remediation
   - MEDIUM findings → document as future work

**Deliverables:**
```
SECURITY-AUDIT.md
  ├── JWT Implementation Review
  ├── RBAC Enforcement Review
  ├── Rate Limiting Review
  ├── Demo Auth Isolation Review
  ├── Threat Model
  ├── OWASP Compliance Checklist
  ├── Static Analysis Results
  ├── Findings (CRITICAL/HIGH/MEDIUM/LOW)
  └── Remediation Steps

OWASP-CHECKLIST.md
  ├── A01:2021 — Access Control Status
  ├── A02:2021 — Cryptographic Status
  ├── A07:2021 — Auth Status
  └── Overall Compliance Score (%)
```

**Success Metric:** All CRITICAL fixed, OWASP checklist 100%, zero HIGH findings remain

**Handoff to @dev (if findings):**
```yaml
- File: SECURITY-AUDIT.md
- Status: CRITICAL findings identified, awaiting remediation
- Deadline: Day 3 9:00 AM
- Blockers: [list of critical issues]
```

---

### 5. **@qa (Quinn)** — Testing & Validation
**Hours:** 10-12 hours over 2 days  
**Timeline:** Start Day 1 (3:00 PM) → End Day 3 (2:00 PM)

**Day 1 Tasks (2 hours):**
1. Read AUTH-ARCHITECTURE.md
2. Plan test cases:
   - Login E2E (success, invalid, locked)
   - Logout E2E (single, all devices)
   - Token rotation E2E
   - RBAC E2E (all roles)
   - Rate limiting E2E
   - Demo auth isolation E2E
3. Review test template

**Day 2 Tasks (6 hours):**
4. Implement test suite:
   - `tests/auth-flows.spec.ts` (login, logout, token rotation)
   - `tests/rbac-enforcement.spec.ts` (role-based access)
   - `tests/rate-limiting.spec.ts` (brute force protection)
   - `tests/demo-auth-isolation.spec.ts` (data isolation)
5. Run tests against @dev code (parallel to @security)
6. Document coverage report

**Day 3 Tasks (4 hours):**
7. Run full regression suite:
   - Existing auth flows still work
   - No regressions in other modules
8. Run security tests:
   - Brute force attempts (bypass rate limit)
   - Privilege escalation (RBAC bypass)
   - Session fixation
   - JWT manipulation
9. Final validation:
   - All 7 ACs passing
   - Coverage ≥70%
   - No critical failures

**Test Coverage Target:**
```
AC1 — Session rotation: 3 test scenarios
AC2 — RBAC enforcement: 9 test scenarios (3 roles × 3 actions)
AC3 — Session cleanup: 2 test scenarios
AC4 — Rate limiting: 5 test scenarios
AC5 — Demo auth isolation: 3 test scenarios
AC6 — Auth flows tested: All above + 4 integration tests
AC7 — Security audit: 8 security test scenarios
```

**Files to Create:**
```
tests/auth-flows.spec.ts
tests/rbac-enforcement.spec.ts
tests/rate-limiting.spec.ts
tests/demo-auth-isolation.spec.ts
tests/auth-security.spec.ts (security tests)

coverage/
└── auth-coverage-report.html
```

**Success Metric:** All tests passing, coverage ≥70%, no CRITICAL failures

**Handoff to @pm:**
```yaml
- Files: Test results + coverage report
- Status: ALL ACs PASSING ✅
- Verdict: Ready for acceptance
- Blockers: None
```

---

## 📅 Critical Milestones

| Time | Event | Owner | Status |
|------|-------|-------|--------|
| Day 1, 9:00 AM | Kickoff meeting | @pm | START |
| Day 1, 10:00 AM | @architect design start | @architect | START |
| Day 1, 10:00 AM | @dev implementation start | @dev | START |
| Day 1, 3:00 PM | @qa test planning start | @qa | START |
| Day 1, 5:00 PM | Architecture design done | @architect | HANDOFF → @dev |
| Day 2, 9:00 AM | @security audit start | @security | START |
| Day 2, 5:00 PM | @dev implementation done | @dev | HANDOFF → @security |
| Day 3, 9:00 AM | Security findings remediated | @dev | COMPLETE |
| Day 3, 2:00 PM | All tests passing | @qa | HANDOFF → @pm |
| Day 3, 3:00 PM | Final acceptance | @pm | DONE ✅ |

---

## 🚨 Communication Protocol

### Daily Sync (15 min)
- **When:** 10:00 AM + 3:00 PM each day
- **Who:** All 5 agents (async status updates via Slack/chat)
- **Format:** 1-liner per agent (status, blockers)

### Blocker Escalation
- **Rule:** Any CRITICAL blocker → immediate slack to @pm
- **Resolution:** @pm facilitates resolution within 30 min
- **Fallback:** Escalate to @aiox-master if unresolved

### Handoff Checklist
- Before each handoff:
  - [ ] Deliverables complete + documented
  - [ ] No unresolved blockers
  - [ ] Owner confirms "ready to handoff"
  - [ ] Next agent confirms "ready to receive"

---

## 📋 Pre-Kickoff Checklist

Before @pm starts (validate these):
- [ ] PHASE-B-PLAN.md accessible
- [ ] Current auth codebase reviewed
- [ ] Supabase auth working
- [ ] All tools available (npm, git, supabase-cli)
- [ ] All agents available during timeline
- [ ] Staging branch ready
- [ ] No conflicting urgent work

---

## ✅ Success Definition

**Day 3, 3:00 PM:**
- ✅ All 7 ACs implemented & tested
- ✅ 0 lint errors, 0 typecheck errors
- ✅ 109+ tests passing (including new auth tests)
- ✅ Coverage ≥70%
- ✅ Security audit passed (0 CRITICAL/HIGH unresolved)
- ✅ OWASP checklist 100%
- ✅ Team sign-off
- ✅ Story file marked Done
- ✅ Git commits ready for staging

**Outcome:** EP-11 ready for staging review + production deployment

---

## 📞 Escalation Paths

**Blocker:** Contact @pm immediately  
**Design ambiguity:** @architect clarifies + @dev proceeds  
**Security concern:** @security stops work, brief @dev + @pm  
**Test failure:** @qa + @dev pair debug (max 1 hour)  
**Major issue:** @aiox-master override authority

---

## 🎁 Resources Provided

1. **EP-11-EXECUTION-PLAN.md** — Full 5-agent plan with timeline
2. **EP-11-IMPLEMENTATION-SPEC.md** — Detailed technical spec
3. **This file** — Agent coordination guide
4. **Story file** — EP-11.1 (ready for work)
5. **PHASE-B-PLAN.md** — Epic definition (D-1.4)

**Start Here:**
1. Read this file
2. Read EP-11-EXECUTION-PLAN.md
3. Read EP-11-IMPLEMENTATION-SPEC.md
4. Review own section above
5. Kickoff at 9:00 AM Day 1

---

**Ready to execute? →** Confirm team availability, then kick off @pm first.
