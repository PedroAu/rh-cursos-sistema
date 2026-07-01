# Monitoring Feature Scope

## Overview

**Epic 8** introduces comprehensive error tracking and query performance monitoring to the RH Cursos platform.

- **Status**: Complete (Tasks #7, #5)
- **Implemented by**: @dara (Data Engineer)
- **Deployment**: Ready for staging/production (requires Sentry project DSN)

## In Scope

### Error Tracking

✅ **Client-side errors**
- React component render errors
- Browser JavaScript errors
- Unhandled promise rejections
- Network errors

✅ **Server-side errors**
- Next.js API route errors
- Node.js runtime errors
- Server-side rendering errors

✅ **Performance monitoring**
- Transaction tracing (API calls, page loads)
- Timing analysis (100% dev, 10% prod)
- Route-level performance insights

✅ **Session replay**
- Video context for errors (50% dev, 10% prod)
- User interaction playback
- DOM mutation tracking

✅ **Error boundary**
- React component error isolation
- User-friendly fallback UI
- Development error details

### Query Monitoring

✅ **Slow query detection**
- Automatic interception of Supabase operations
- 200ms threshold for "slow" queries
- Logged to Sentry as breadcrumbs

✅ **Query types tracked**
- SELECT operations
- INSERT operations
- UPDATE operations
- DELETE operations

✅ **Performance metrics**
- Execution time (milliseconds)
- Affected table name
- Operation type
- Timestamp

✅ **Developer experience**
- Console logging with visual indicators (⚡ fast, 🐌 slow)
- In-memory metrics storage (last 100 queries)
- Browser dev tools integration

### Configuration & Deployment

✅ **Environment-based sampling**
- Development: Full sampling (100% errors, 100% performance, 50% replay)
- Production: Managed sampling (100% errors, 10% performance, 10% replay)

✅ **Graceful degradation**
- Works without Sentry DSN (no-op mode)
- All monitoring optional
- No performance impact if disabled

✅ **CI/CD integration**
- Optional source map upload for production
- Configurable via environment variables
- No impact on build time if disabled

## Out of Scope

❌ **Custom events/metrics** (not included)
- Application-specific business metrics
- Custom event tracking
- Third-party analytics integration

❌ **Alert configuration** (manual setup required)
- Sentry alert rules
- Slack/email notifications
- Severity-based escalation

❌ **Advanced profiling** (available in Sentry but not configured)
- CPU profiling
- Memory profiling
- Custom instrumentation

❌ **Team/organization management**
- User invitations
- Permission management
- Project organization

## Configuration Checklist

**For Development**
```bash
□ Create Sentry project at https://sentry.io
□ Get DSN from project settings
□ Set NEXT_PUBLIC_SENTRY_DSN in .env.local
□ Run npm run dev
□ Test with __testSentry() in console
```

**For Production**
```bash
□ Create Sentry project for production
□ Get production DSN
□ Set NEXT_PUBLIC_SENTRY_DSN in production environment
□ (Optional) Set SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN for source maps
□ Deploy normally
□ Verify events arrive in Sentry dashboard
```

## Key Files

**Configuration**
- `/sentry.client.config.ts` — Client-side Sentry setup
- `/sentry.server.config.ts` — Server-side Sentry setup
- `/sentry.edge.config.ts` — Edge runtime Sentry setup
- `/.env.example` — Environment variable documentation

**Components**
- `/src/components/error-boundary.tsx` — React error boundary

**Libraries**
- `/src/lib/monitoring.ts` — Monitoring utilities
- `/src/lib/supabase/query-logging-middleware.ts` — Query logging core
- `/src/lib/supabase/with-query-logging.ts` — Initialization helper
- `/src/lib/supabase/client.ts` — Supabase client with logging

**Documentation**
- `/docs/guides/MONITORING.md` — Complete setup and troubleshooting guide
- `/docs/MONITORING-FEATURE-SCOPE.md` — This file

## Sampling Rationale

### Error Tracking (100% all environments)
**Rationale**: Errors are rare and critical. Missing even one error in production could indicate a missed regression. No cost to capturing all errors.

### Performance Monitoring
- **Dev (100%)**: Catch performance issues early during development
- **Prod (10%)**: Statistical significance with 10% sampling sufficient to detect trends and regressions

### Session Replay
- **Dev (50%)**: Replay valuable for debugging; 50% balances detail vs. storage
- **Prod (10% on errors)**: Only replay when errors occur to provide context

### Query Logging
- **Dev (100%)**: Optimize queries aggressively during development
- **Prod (10%)**: Prevent log volume; still capture enough to spot patterns

## Performance Impact

**Minimal overhead**
- Query logging: ~1ms per database operation
- Error tracking: Negligible (async)
- Session replay: Background recording, minimal CPU impact

**Network impact**
- Development: ~5-10 events/minute to Sentry
- Production: ~1-2 events/minute (10% sampling)

## Security & Privacy

**Data sent to Sentry**
- JavaScript errors with stack traces
- API response status codes and URLs
- User actions (clicks, navigation)
- Browser version and OS
- Custom tags and breadcrumbs

**NOT sent**
- Sensitive form data (passwords, tokens)
- User personally identifiable information (email, name)
- Database records or query results
- Request/response bodies (truncated by default)

**Sentry data handling**
- GDPR compliant
- SOC 2 certified
- Source maps stay in Sentry (not public)
- 90-day retention (customizable)

## Integration Points

**Automatically integrated**
- React component errors (via error boundary in `app/layout.tsx`)
- Supabase queries (via middleware in `supabase/client.ts`)
- JavaScript runtime errors (via Sentry SDK)
- API route errors (via server config)

**Manual integration optional**
- Custom business events: `Sentry.captureMessage()`
- Custom context: `Sentry.setContext()`
- Custom tags: `Sentry.setTag()`

## Related Documentation

- **Setup Guide**: `docs/guides/MONITORING.md`
- **Sentry Docs**: https://docs.sentry.io/
- **Next.js Integration**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Session Replay**: https://docs.sentry.io/product/session-replay/

## Completion Status

- ✅ Sentry integration (client, server, edge)
- ✅ Error boundary component
- ✅ Query performance logging
- ✅ Monitoring utilities
- ✅ Environment configuration
- ✅ Documentation
- ⏳ Live verification (pending Sentry project setup)

## Next Epic Goals

Future monitoring enhancements (beyond Epic 8):
- Custom metrics for business KPIs
- Real-time alerting (Slack/email)
- Performance budgets and SLAs
- User feedback integration
- APM integration with infrastructure monitoring
