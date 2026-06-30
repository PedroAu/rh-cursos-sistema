# Error Tracking & Query Monitoring Setup Guide

## Overview

This application integrates **Sentry** for error tracking and **Supabase query logging** for performance monitoring. Both services operate with graceful degradation—without configuration, the app runs normally without sending any telemetry.

## Features

### Error Tracking (Sentry)

- **Client-side errors**: React component crashes, browser errors, network failures
- **Server-side errors**: Node.js runtime errors, API failures
- **Performance monitoring**: Transaction tracing (100% in dev, 10% in prod)
- **Session replay**: Video context for errors (50% in dev, 10% in prod)
- **Breadcrumb tracking**: User actions, console logs, network calls
- **Source map support**: Optional source map upload for better stack traces

### Query Monitoring

- **Slow query detection**: Queries exceeding 200ms threshold logged to Sentry
- **Supabase integration**: Automatic tracing of select/insert/update/delete operations
- **Performance metrics**: Execution time, affected tables, query type
- **Console logging**: Dev-friendly output with emoji indicators (⚡ fast, 🐌 slow)
- **Sampling**: 100% in dev, 10% in production

## Quick Start

### 1. Create Sentry Project

1. Go to https://sentry.io and sign up for a free account
2. Create a new project:
   - Select **Next.js** as platform
   - Choose appropriate team
3. Copy the **DSN** from project settings

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and add:

```bash
# Required for error tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-public-key@o0.ingest.sentry.io/project-id
NEXT_PUBLIC_APP_ENV=development

# Optional: For CI/CD source map upload
# SENTRY_ORG=your-org-slug
# SENTRY_PROJECT=site-rh-cursos
# SENTRY_AUTH_TOKEN=your-api-token
```

### 3. Test Integration

Start the dev server:

```bash
npm run dev
```

Open browser console and run:

```javascript
__testSentry()
```

You should see:
- Console log: `[Sentry] Test message sent successfully`
- Dashboard event within 30 seconds at your Sentry project

### 4. Monitor in Sentry Dashboard

Visit your project dashboard: https://sentry.io/organizations/YOUR-ORG/issues/

You'll see:
- Real-time error events
- Performance metrics
- Query performance data
- Session replay video

## Configuration Details

### Sentry Sampling Rates

| Environment | Metric | Rate | Rationale |
|-------------|--------|------|-----------|
| **Development** | Error tracking | 100% | Catch all errors early |
| **Development** | Performance | 100% | Understand performance during dev |
| **Development** | Session replay | 50% | Balance detail vs. storage |
| **Production** | Error tracking | 100% | Don't miss errors |
| **Production** | Performance | 10% | Manage quota and costs |
| **Production** | Session replay | 10% | Context for critical errors only |

### Query Logging Configuration

Located in `/src/lib/supabase/client.ts`:

```typescript
wrapSupabaseWithQueryLogging(supabase, {
  slowQueryThreshold: 200,        // ms
  enableConsoleLogging: true,     // dev: true, prod: false
  enableSentryLogging: true,      // if DSN configured
  logAllQueries: false,           // only slow queries
  samplingRate: 0.1               // prod: 10%, dev: 100%
});
```

### Error Boundary

The root layout includes an error boundary that:
- Catches React component crashes
- Shows user-friendly error message
- Reports to Sentry automatically
- Displays error details in development

## Monitoring in Development

### Console Indicators

Query logging outputs to console with emoji indicators:

```
⚡ [QUERY] SELECT "courses" - 45.23ms  (fast)
🐌 [QUERY] SELECT "enrollments" - 245.67ms  (slow)
```

### Monitoring Status

In development, run in browser console:

```javascript
// Check monitoring configuration
console.log(window.__monitoring?.status)

// Get collected query metrics
console.log(window.__queryMetrics)

// Test Sentry connection
__testSentry()
```

### Development Tools

**Query Metrics Inspector** (in browser console):

```javascript
// Get last 100 queries
const metrics = window.__queryMetrics || [];

// Filter slow queries
const slowQueries = metrics.filter(m => m.isSlow);

// Analyze by table
const byTable = {};
metrics.forEach(m => {
  byTable[m.table] = (byTable[m.table] || 0) + 1;
});
console.table(byTable);
```

## Production Deployment

### Environment Setup

Configure these secrets in your production hosting:

**Vercel/Netlify/Cloudflare:**
- `NEXT_PUBLIC_SENTRY_DSN` — Production Sentry DSN
- `NEXT_PUBLIC_APP_ENV` — Set to `production`

**Optional (for source maps):**
- `SENTRY_ORG` — Organization slug
- `SENTRY_PROJECT` — Project slug
- `SENTRY_AUTH_TOKEN` — CI/CD API token

### Source Map Upload (Optional)

For better stack traces with original source code:

1. Generate API token in Sentry: Settings > Developer Settings > Auth Tokens
   - Grant: `project:releases` and `org:read` scopes
2. Add to CI/CD pipeline:
   ```bash
   SENTRY_ORG=your-org SENTRY_PROJECT=site-rh-cursos npm run build
   ```

### Monitoring Production

- **Error trends**: Dashboard shows error spike detection
- **Performance**: Transaction graphs with real user data
- **Alerts**: Configure thresholds for critical issues
- **Performance budgets**: Set max transaction duration

## Troubleshooting

### Sentry Not Receiving Events

1. **Check DSN is set:**
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Verify in browser console:**
   ```javascript
   console.log(process.env.NEXT_PUBLIC_SENTRY_DSN)
   ```

3. **Test connection:**
   ```javascript
   __testSentry()
   ```

4. **Check Sentry settings:**
   - Ensure project is active (not archived)
   - Check rate limits in Settings > Rate Limits
   - Verify client key is not revoked

### Query Logging Not Working

1. **Check Supabase is configured:**
   ```javascript
   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```

2. **Verify in console:**
   ```javascript
   // Should show query logs
   // ⚡ [QUERY] SELECT ... or 🐌 [QUERY] ...
   ```

3. **Check threshold:**
   - Queries under 200ms won't log (intentional)
   - Slow queries (>200ms) should appear

### Performance Issues

1. **High event volume:**
   - Reduce `samplingRate` in production
   - Filter noisy errors in `beforeSend` hook

2. **Storage quota exceeded:**
   - Reduce `replaysSessionSampleRate`
   - Disable session replay for non-error events
   - Set retention policy in Sentry settings

## API Reference

### Monitoring Module

```typescript
import { 
  isSentryConfigured,
  isQueryLoggingConfigured,
  getMonitoringStatus,
  printMonitoringStatus,
  testSentryConnection,
  initializeMonitoringDiagnostics
} from "@/lib/monitoring";

// Check if configured
if (isSentryConfigured()) {
  console.log("Sentry is active");
}

// Get status object
const status = getMonitoringStatus();
// => { sentry: {...}, queryLogging: {...}, environment: "development" }

// Print to console (dev only)
printMonitoringStatus();

// Test connection (dev only)
await testSentryConnection();
```

### Query Logging Module

```typescript
import {
  getQueryMetrics,
  clearQueryMetrics
} from "@/lib/supabase/query-logging-middleware";

// Get collected metrics
const metrics = getQueryMetrics();
// => [{ method, table, duration, isSlow, timestamp }, ...]

// Clear metrics
clearQueryMetrics();
```

### Error Boundary Component

```typescript
import { ErrorBoundary, withErrorBoundary } from "@/components/error-boundary";

// Wrap component tree
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Wrap individual component
const SafeComponent = withErrorBoundary(MyComponent, (error, reset) => (
  <ErrorFallback error={error} reset={reset} />
));
```

## Related Files

- **Sentry configs:** `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- **Query logging:** `src/lib/supabase/query-logging-middleware.ts`
- **Error boundary:** `src/components/error-boundary.tsx`
- **Monitoring utils:** `src/lib/monitoring.ts`
- **Environment config:** `.env.example`
- **Next.js config:** `next.config.mjs` (Sentry wrapper)

## Pricing & Quotas

### Sentry (Free Plan Includes)

- 50K error events/month
- 10 hours of session replay/month
- 1 project
- 3 team members

**Upgrade for:** Higher volume, additional projects, team members

### Tracking Your Usage

- Sentry Dashboard > Stats > Event Summary
- Shows remaining quota for current month
- Configure rate limiting before hitting quota

## Best Practices

1. **Error Boundaries**: Wrap critical sections with error boundaries
2. **Slow Queries**: Investigate queries > 200ms regularly
3. **Session Replay**: Enable for production errors (not all sessions)
4. **Breadcrumbs**: Use Sentry.addBreadcrumb() for custom tracking
5. **Tags**: Add context with `Sentry.setTag()`
6. **Performance**: Monitor transaction performance trends weekly

## Next Steps

1. ✅ Set up Sentry project
2. ✅ Configure environment variables
3. ✅ Test integration locally
4. ✅ Deploy to production
5. ✅ Monitor dashboard regularly
6. ⏭️ Set up alerts (https://docs.sentry.io/alerts/)
7. ⏭️ Configure rate limiting policies
8. ⏭️ Create performance budgets

## References

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Sentry Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
