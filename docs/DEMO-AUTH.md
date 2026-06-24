# Demo Authentication — Security Implications & Usage Guide

## Overview

Demo authentication is a **LOCAL DEVELOPMENT ONLY** feature that provides hardcoded demo credentials for testing the admin dashboard without setting up full Supabase authentication.

**CRITICAL**: Demo auth is **DISABLED BY DEFAULT** via the feature flag `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false`.

---

## Security Architecture

### Feature Flag: `NEXT_PUBLIC_ENABLE_DEMO_AUTH`

| Setting | Environment | Behavior | Risk |
|---------|-------------|----------|------|
| `false` (default) | Development | Demo auth disabled | ✅ SAFE |
| `false` | Production | Demo auth disabled | ✅ SAFE |
| `true` | Development | Demo auth enabled | ✅ ACCEPTABLE (local dev only) |
| `true` | Production | Demo auth enabled | 🔴 **CRITICAL SECURITY BREACH** |

### Why Feature Flag is Critical

1. **Code is visible in source**: Demo credentials/logic live in `/src/lib/auth.ts`
2. **Public builds include NEXT_PUBLIC_* variables**: Any `NEXT_PUBLIC_` variable is embedded in the client-side bundle
3. **Visible to users**: If enabled, credentials appear in browser devtools, Network tab, etc.
4. **Default disabled**: Mitigates risk by requiring explicit opt-in during development

### Validation & Warnings

When the app starts, environment validation checks:

```
✅ SAFE:   NODE_ENV=production   + NEXT_PUBLIC_ENABLE_DEMO_AUTH=false
✅ SAFE:   NODE_ENV=development  + NEXT_PUBLIC_ENABLE_DEMO_AUTH=false
✅ OK:     NODE_ENV=development  + NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
🔴 BREACH: NODE_ENV=production   + NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
```

If a breach is detected, the app logs a **CRITICAL** security warning.

---

## How to Enable Demo Auth (Development Only)

### Step 1: Copy `.env.example` to `.env.local`

```bash
cp .env.example .env.local
```

### Step 2: Set the Feature Flag

```bash
NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
```

### Step 3: (Optional) Override Demo Password

The default demo password is `admin123`. You can override it:

```bash
DEMO_ADMIN_PASSWORD=my-custom-password
```

### Step 4: Run the App

```bash
npm run dev
```

Open http://localhost:3000/admin/login and login with:

| Field | Value |
|-------|-------|
| Email | `admin@rhcursos.demo` |
| Password | `admin123` (or your custom password) |

---

## Demo Credentials

### Default Admin Account

```
Email:    admin@rhcursos.demo
Password: admin123
Role:     admin
Name:     Admin RH Cursos
```

**Location**: `/src/lib/auth.ts`

---

## How Demo Auth Works

### Module: `src/lib/auth.ts`

This module centralizes all demo auth logic:

```typescript
isDemoAuthEnabled()      // Check if feature flag is true AND development
getDemoUsers()          // Get list of demo users (empty if disabled)
findDemoUser()          // Find a user by email/password
listDemoCredentials()   // List all demo credentials (for reference)
validateDemoAuthConfig()// Validate production safety
```

### Diagram: Demo Auth Flow

```
User navigates to /admin/login
           ↓
   Submits login form
           ↓
   POST /api/auth/session (email, password)
           ↓
   Currently: Supabase auth only
   (Demo auth code not integrated into session handler)
           ↓
   Success: Set session cookie
```

**Note**: The current API endpoint (`app/api/auth/session/route.ts`) uses Supabase auth only. Demo credentials in `/src/lib/auth.ts` and demo-access artifacts are legacy from development and are not actively used in the current auth flow.

---

## Legacy Demo Code (Deprecated)

The following files contain legacy demo auth code that is **NOT** currently integrated:

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/auth.ts` | Session helpers + demo credential fallback | Active (legacy/demo-only) |
| `src/lib/demo-access.ts` | Demo access artifacts | Deprecated |
| `src/lib/app-store.tsx` | Legacy references for demo access | Deprecated |

**These are kept for reference and may be removed in a future refactor.**

---

## Security Best Practices

### In Development ✅

1. **Enable only when needed**: Leave `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false` by default
2. **Use custom passwords**: Override `admin123` with a unique password
3. **Disable before committing**: Never commit `.env.local` with `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true`
4. **Test Supabase auth**: Use real Supabase users when possible

### In Production 🔴

**NEVER** set `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true` in production:

- The app validates this during startup
- Will trigger a **CRITICAL** security warning
- Exposes hardcoded credentials in client-side bundle
- Violates security best practices

### Deployment Checklist

Before deploying to production:

- [ ] `NEXT_PUBLIC_ENABLE_DEMO_AUTH` is `false`
- [ ] `DEMO_ADMIN_PASSWORD` is empty or unset
- [ ] All sensitive credentials are stored in secrets manager
- [ ] Environment validation shows ✅ in logs

---

## Validation Messages

### During Development

```
✅ Environment validation passed (development)
ℹ️ INFO: Demo auth is disabled. Set NEXT_PUBLIC_ENABLE_DEMO_AUTH=true to enable it.
```

### When Demo Auth is Enabled

```
✅ Environment validation passed (development)
```

### If Mistakenly Enabled in Production

```
❌ ENVIRONMENT VALIDATION FAILED:
🔴 CRITICAL: NEXT_PUBLIC_ENABLE_DEMO_AUTH is true in production - this is a SECURITY BREACH
```

---

## Troubleshooting

### "Demo auth is disabled"

**Cause**: `NEXT_PUBLIC_ENABLE_DEMO_AUTH` is not `true`

**Solution**:
```bash
# Edit .env.local
NEXT_PUBLIC_ENABLE_DEMO_AUTH=true

# Then restart:
npm run dev
```

### "Incorrect credentials"

**Cause**: Wrong password or email

**Solution**:
- Default email: `admin@rhcursos.demo` (exact match required)
- Default password: `admin123` (or your custom `DEMO_ADMIN_PASSWORD`)
- Check `.env.local` for `DEMO_ADMIN_PASSWORD` override

### "CRITICAL: NEXT_PUBLIC_ENABLE_DEMO_AUTH is true in production"

**Cause**: Feature flag was enabled in production build

**Solution**:
1. Immediately disable in your deployment platform
2. Redeploy with `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false`
3. Review git history to ensure no `.env` files with `true` were committed
4. Rotate any credentials that may have been exposed

---

## References

| File | Purpose |
|------|---------|
| `src/lib/demo-auth.ts` | Demo auth module & implementation |
| `src/lib/env-validation.ts` | Environment validation & warnings |
| `.env.example` | Environment variable documentation |
| `app/api/auth/session/route.ts` | Login endpoint (Supabase-only) |

---

## Related Stories & Issues

- **Story 8.1 (D-1.2)**: Extract demo auth to feature flag, disable by default
- **AC12**: Demo auth extracted, feature flag disabled by default ✅

---

## Acceptance Criteria

- [x] Demo auth extracted to `src/lib/demo-auth.ts` module
- [x] Feature flag `NEXT_PUBLIC_ENABLE_DEMO_AUTH` implemented
- [x] Default: disabled (`false`)
- [x] Security validation in `env-validation.ts`
- [x] Documentation in `docs/DEMO-AUTH.md`
- [x] `.env.example` updated with flag & instructions
- [x] Production safety warnings in place

---

**Last Updated**: 2026-06-22
**Status**: ✅ SECURITY ENHANCEMENT COMPLETE
