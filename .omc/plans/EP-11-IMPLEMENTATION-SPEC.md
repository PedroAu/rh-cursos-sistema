# EP-11 Implementation Specification

**Epic:** EP-11 — Authentication Enhancement  
**Status:** Planning Phase  
**Last Updated:** 2026-06-23

---

## 🏗️ Architecture Overview

### Current State
- Basic JWT auth in place (Supabase auth)
- Single user role system
- No session rotation
- No rate limiting
- No RBAC enforcement
- Demo user mixed with real data

### Target State
- **Session rotation:** JWT refreshes every activity
- **RBAC enforcement:** Role-based access control (Admin > Instructor > Student)
- **Rate limiting:** Brute force protection (5 attempts/15min)
- **Session cleanup:** All devices log out on user logout
- **Demo auth isolation:** Separate demo context, RLS rules
- **Security hardening:** OWASP A01/A02/A07 compliance

---

## 📂 File Structure & Implementation Plan

### New Files to Create

#### 1. **Session Token Rotation** (AC1)
```
src/lib/auth/
├── session-rotation.ts          # Session rotation logic
├── token-refresh.ts              # JWT refresh endpoint
└── __tests__/
    └── session-rotation.spec.ts  # Unit tests
```

**Responsibilities:**
- Monitor user activity (mouse, keyboard, clicks)
- Rotate JWT on activity (configurable timeout, default 15min)
- Maintain token expiry (short-lived access token + long-lived refresh token)
- Clear expired tokens

**Key Functions:**
```typescript
// Track activity
function trackUserActivity(sessionId: string): void

// Rotate token
async function rotateSessionToken(sessionId: string): Promise<string>

// Validate token freshness
function isTokenFresh(token: string): boolean
```

---

#### 2. **RBAC Middleware** (AC2)
```
src/lib/auth/
├── rbac-middleware.ts            # RBAC enforcement
├── rbac-roles.ts                 # Role definitions
├── permission-matrix.ts          # Permission mappings
└── __tests__/
    ├── rbac-middleware.spec.ts
    └── permission-matrix.spec.ts
```

**Role Hierarchy:**
```
ADMIN
├── Can: create/edit/delete courses, manage users, view reports
├── Permissions: [courses:create, users:manage, reports:view, ...]
└── Inherits from: INSTRUCTOR, STUDENT

INSTRUCTOR
├── Can: teach assigned courses, view enrollment, submit materials
├── Permissions: [courses:view, materials:upload, enrollments:view]
└── Inherits from: STUDENT

STUDENT
├── Can: enroll, view course content, submit work
├── Permissions: [courses:view, enrollments:create, submissions:create]
└── No inheritance
```

**Key Functions:**
```typescript
// Check authorization
function authorize(role: Role, action: string, resource?: string): boolean

// Enforce middleware
export function rbacMiddleware(req: Request, res: Response, next: NextFunction)

// Get user role
async function getUserRole(userId: string): Promise<Role>

// Check permission
function hasPermission(role: Role, action: string): boolean
```

---

#### 3. **Rate Limiter** (AC4)
```
src/lib/auth/
├── rate-limiter.ts               # Rate limiting logic
├── rate-limit-store.ts           # In-memory store (Phase 1) / Redis (Phase 2)
└── __tests__/
    └── rate-limiter.spec.ts
```

**Strategy:**
- **Endpoint:** POST /api/auth/login
- **Limit:** 5 attempts per 15 minutes per IP
- **Storage:** In-memory (Map) with TTL, or Redis for production
- **Response:** 429 Too Many Requests after limit exceeded

**Key Functions:**
```typescript
// Check if request allowed
async function checkRateLimit(key: string, limit: number, window: number): Promise<boolean>

// Track request
async function recordRequest(key: string, weight?: number): Promise<void>

// Reset limit
async function resetRateLimit(key: string): Promise<void>
```

---

#### 4. **Session Cleanup** (AC3)
```
src/lib/auth/
├── session-cleanup.ts            # Logout all devices
└── __tests__/
    └── session-cleanup.spec.ts
```

**Responsibilities:**
- On logout: invalidate ALL sessions for user
- Revoke all refresh tokens
- Clear all device entries
- Notify user of mass logout (optional alert)

**Key Functions:**
```typescript
// Logout all sessions
async function logoutAllSessions(userId: string): Promise<void>

// Revoke all tokens
async function revokeAllTokens(userId: string): Promise<void>

// Clear sessions
async function clearUserSessions(userId: string): Promise<void>
```

---

#### 5. **Demo Auth Isolation** (AC5)
```
src/lib/auth/
├── demo-auth-isolation.ts        # Demo context guard
├── demo-auth-rls.sql             # RLS policies for demo
└── __tests__/
    └── demo-auth-isolation.spec.ts
```

**Strategy:**
- Separate Supabase role for demo user (`demo_user_role`)
- RLS policies restrict demo access to demo-only data
- Prevent demo users from accessing real student/admin data
- Mark all demo data with `is_demo = true` flag

**RLS Rules:**
```sql
-- Demo users can only see demo data
CREATE POLICY "demo_users_see_only_demo" ON public.cursos
  FOR SELECT USING (
    auth.jwt() -> 'app_metadata' ->> 'is_demo' = 'true' AND is_demo = true
  );

-- Real users never see demo data
CREATE POLICY "real_users_exclude_demo" ON public.cursos
  FOR SELECT USING (
    auth.jwt() -> 'app_metadata' ->> 'is_demo' IS NULL AND is_demo = false
  );
```

**Key Functions:**
```typescript
// Check if user is demo
function isDemoUser(user: User): boolean

// Enforce demo isolation
async function enforceDemo AuthContext(userId: string): Promise<DemoContext>

// Mark data as demo
function markAsDemo(data: any): any
```

---

### Modified Files

#### `src/lib/auth.ts` (existing auth file)
- Import new RBAC middleware
- Add session rotation hook
- Integrate rate limiter
- Update logout to use `logoutAllSessions`

#### `src/app/api/auth/login/route.ts` (auth endpoint)
- Add rate limiter check
- Integrate demo auth isolation
- Track login attempts

#### `src/app/api/auth/logout/route.ts` (logout endpoint)
- Call `logoutAllSessions()` instead of single session logout

#### `src/app/api/auth/refresh/route.ts` (token refresh)
- Create new endpoint for token rotation
- Validate refresh token
- Issue new access token

#### Middleware chain
- Add RBAC middleware to API routes
- Add session rotation handler
- Add demo auth context provider

---

## 🔒 Security Considerations

### JWT Implementation
- **Algorithm:** HS256 (HMAC) or RS256 (RSA)
- **Expiry:** Access token 15-30 min, refresh token 7 days
- **Signature verification:** Always validate before use
- **Token storage:** HttpOnly cookie (not localStorage)

### Rate Limiting
- **Key strategy:** IP + endpoint (not user ID, prevents account enumeration)
- **Timing attacks:** Use constant-time comparison
- **Bypass prevention:** 
  - Can't reset by logging out
  - Can't bypass by changing IP (if enforced)
  - Monitor for distributed attacks

### RBAC Enforcement
- **Principle of least privilege:** Default DENY
- **Role inheritance:** Clear, documented hierarchy
- **Permission matrix:** Centralized, testable
- **Audit logging:** Log all authorization failures

### Demo Auth
- **Data isolation:** RLS + application-level checks
- **Session separation:** Demo sessions never upgrade to real
- **No data leakage:** Demo user can't access real student data

---

## 🧪 Testing Strategy

### Unit Tests (by @dev)
- Token rotation logic
- RBAC permission matrix
- Rate limiter algorithm
- Demo auth isolation checks

### Integration Tests (by @qa)
- Full login flow with rate limiting
- Token refresh endpoint
- RBAC enforcement on protected endpoints
- Session cleanup on logout
- Demo vs real user separation

### Security Tests (by @security)
- Brute force attacks (rate limit bypass)
- Privilege escalation (RBAC bypass)
- Token manipulation (JWT signature verification)
- Session fixation
- OWASP A01/A02/A07 checklist

---

## 📊 Metrics & Monitoring

### Performance Metrics
- Login response time: <500ms
- Token rotation overhead: <100ms
- RBAC check latency: <50ms
- Rate limit lookup: <10ms (in-memory)

### Security Metrics
- Failed login attempts: tracked + alerted
- Rate limit violations: logged
- RBAC violations: logged + alerted
- Session duration: monitored

### System Metrics
- Active sessions: tracked
- Token refresh rate: monitored
- Database transaction failures: alerted

---

## 🚨 Known Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Token compromise | HIGH | HttpOnly cookie, short expiry, signature validation |
| Rate limit bypass | MEDIUM | Use request IP + endpoint key, monitor patterns |
| RBAC bypass via token forgery | HIGH | Verify JWT signature every request, rotate keys |
| Demo data leakage | MEDIUM | RLS policies + app-level checks, data marked `is_demo` |
| Session collision | LOW | Use cryptographic RNG, collision detection |

---

## 📋 Implementation Checklist

### Pre-Development
- [ ] @architect designs finalized
- [ ] @pm AC validation complete
- [ ] @security threat model documented
- [ ] Team aligns on approach

### Development Phase
- [ ] Session rotation implemented
- [ ] RBAC middleware implemented
- [ ] Rate limiter implemented
- [ ] Session cleanup implemented
- [ ] Demo auth isolation implemented
- [ ] All files pass lint + typecheck
- [ ] Unit tests ≥90% coverage

### Security Phase
- [ ] Code review complete
- [ ] OWASP checklist passed
- [ ] Static analysis (npm audit) passed
- [ ] Penetration testing (CRITICAL vectors)
- [ ] Security findings remediated

### Testing Phase
- [ ] E2E tests all auth flows
- [ ] RBAC tests all roles
- [ ] Rate limiting tests all scenarios
- [ ] Demo auth isolation verified
- [ ] Regression tests passing
- [ ] Coverage ≥70%

### Acceptance
- [ ] All 7 ACs passing
- [ ] Security audit approved
- [ ] QA sign-off
- [ ] PM acceptance
- [ ] Ready for staging

---

## 🔗 Dependencies & Prerequisites

**Required:**
- Supabase auth configured ✅
- JWT library (supabase-js includes Jose)
- Node.js crypto module (built-in)
- Database access (Supabase)

**Optional (Phase 2):**
- Redis for distributed rate limiting
- Message queue for async logout notifications
- Email service for security alerts

---

## 📚 References & Resources

- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- Express Rate Limit: https://www.npmjs.com/package/express-rate-limit
- Supabase Auth: https://supabase.com/docs/guides/auth
- Next.js Middleware: https://nextjs.org/docs/advanced-features/middleware
