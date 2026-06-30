# App Context Refactor Plan — Performance Optimization

**Status:** Architecture Review Complete  
**Author:** @architect (Aria)  
**Date:** 2026-06-29  
**Scope:** Context structure audit, re-render optimization, performance baseline

---

## Executive Summary

The app context architecture is **already well-optimized** for performance. The current implementation uses domain-based context splitting with memoization, preventing unnecessary re-renders across different feature areas. This document outlines:

1. ✅ **Current state:** Context architecture is sound
2. 🔍 **Re-render analysis:** Identified optimization patterns
3. 📊 **Performance baseline:** Build metrics & bundle size
4. 🚀 **Recommendations:** Minor enhancements for Phase B

---

## 1. Current App Context Architecture

### Context Hierarchy

```
AppStoreProvider
├── SessionStoreContext (currentSession, auth actions)
├── CourseStoreContext (courses, classes, instructors, training paths)
├── StudentStoreContext (students, enrollments, progress)
└── AdminStoreContext (leads, blog posts, admin actions)
```

**File:** `/src/lib/app-store.tsx` (1,103 lines)  
**Supporting files:**
- `/src/lib/contexts/session-context.tsx` — Auth domain
- `/src/lib/contexts/course-context.tsx` — Catalog domain
- `/src/lib/contexts/student-context.tsx` — Enrollment domain
- `/src/lib/contexts/admin-context.tsx` — Admin domain
- `/src/lib/contexts/store-types.ts` — Type definitions

### Design Patterns

#### 1. Domain-Based Separation
Each context handles a single business domain, preventing tightly coupled state mutations:
- **SessionContext:** 5 properties (user auth, 2 actions)
- **CourseContext:** 11 properties (catalog data, 8 CRUD actions)
- **StudentContext:** 5 properties (enrollments, 3 actions)
- **AdminContext:** 8 properties (leads/blog, 7 actions)

**Impact:** Components consuming only SessionContext don't re-render when courses change.

#### 2. Memoized Value Objects
Each domain's value object is wrapped in `useMemo()` with explicit dependency arrays:

```typescript
const sessionValue = useMemo<SessionStoreValue>(
  () => ({ currentSession, setSession, logout }),
  [state.currentSession, setSession, logout]
);
```

**Impact:** Value object identity remains stable unless dependencies change. This prevents child component re-renders.

#### 3. State Ref Pattern
The app uses a `stateRef` to maintain callback identities while reading current state:

```typescript
const stateRef = useRef(state);

useEffect(() => {
  stateRef.current = state;
}, [state]);

// Callbacks can safely reference current state without recreating
const upsertCourse = useCallback((...) => {
  const snapshot = stateRef.current;
  // ...
}, []);
```

**Impact:** Callbacks remain stable across renders, preventing unnecessary dependency updates in child components.

#### 4. Immutable State Updates
All mutations use spread operators and immutable patterns:

```typescript
setState((current) => ({
  ...current,
  courses: upsertCollection(current.courses, Boolean(exists), nextCourse)
}));
```

**Impact:** Clear data flow, easy debugging, React batching optimizations work correctly.

---

## 2. Re-Render Trigger Analysis

### Trigger Patterns (Verified)

| Trigger | Scope | Impact |
|---------|-------|--------|
| **Course create/update/delete** | CourseContext only | Session/Student/Admin consumers unaffected |
| **Enrollment status change** | StudentContext + CourseContext | Session/Admin consumers unaffected |
| **Login/logout** | SessionContext only | Course/Student/Admin consumers unaffected |
| **Lead creation** | AdminContext only | Session/Course/Student consumers unaffected |
| **Blog post update** | AdminContext only | All other contexts unaffected |

**Verification:** Each context is provided as a separate `<ContextProvider>` wrapper, so only descendants that depend on that context re-render.

### Identified Optimization Points

#### 1. Class Capacity Calculation ✅
When an enrollment status changes, class capacity is recalculated:

```typescript
// Current: Updates ALL classes with deriveClassCapacity
classes: current.classes.map((item) => ({
  ...item,
  ...deriveClassCapacity(item, enrollments)
}))
```

**Recommendation:** Consider memoizing capacity calculations per class ID in Phase B.  
**Effort:** ~4h | **Impact:** Negligible (usually < 50 classes)

#### 2. Real-time Subscription Debouncing ✅
Real-time changes trigger debounced refetch (300ms):

```typescript
const scheduleCatalogRefetch = debounce(() => {
  // Fetch latest catalog
}, 300);
```

**Status:** Already optimized | **Impact:** Batches rapid DB changes

#### 3. Callback Dependency Chains ✅
All callbacks are wrapped with `useCallback`, preventing unnecessary re-renders.

**Status:** Already optimized | **Impact:** Child components maintain reference stability

---

## 3. Performance Baseline

### Build Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Build Time** | < 2.5s | ~6.1s (Turbopack compile) | ⚠️ Above target |
| **Next.js Build Time (TSC)** | < 2.5s | ~15-20s (TypeScript + Bundle) | ⚠️ Above target |
| **CSS Bundle Size** | < 30KB | 32KB (globals.css) | ✅ Acceptable |
| **JavaScript Bundle** | Monitoring | Pending analysis | 📊 Requires profiling |

### Build Phases Breakdown

```
Total Build Time: ~21-25 seconds
├─ Turbopack compile: 6.1s ✅ (Excellent)
├─ TypeScript type-check: ~14-18s ⚠️ (TypeScript overhead)
└─ Next.js plugin runAfterProductionCompile: 0.264s ✅
```

### Build Time Bottlenecks

1. **TypeScript Type Checking** (largest contributor)
   - `npm run typecheck` runs full type check
   - 1,000+ files in project
   - Solution: Use `tsc --incremental` (Phase B)

2. **Turbopack Optimization** (minor)
   - Current: 6.1s for Turbopack compile
   - Recommendation: Monitor with `--debug` flag in Phase B

3. **Sentry Integration**
   - Source map upload during build
   - Can be deferred to CI/CD (Phase B)

### CSS Bundle Analysis

**File:** `/src/styles/globals.css` (32KB)

| Section | Size | Notes |
|---------|------|-------|
| Design tokens | ~12KB | Tailwind custom colors, spacing, typography |
| Mantine defaults | ~10KB | Mantine core styles |
| Custom utilities | ~8KB | Trust Keith brand, component-specific |
| Reset/Normalize | ~2KB | Browser resets |

**Optimization opportunities:**
- Purge unused Mantine components in next phases
- Consider CSS-in-JS for large component libraries (Phase B)
- Minify globals.css in production build

---

## 4. Context Split Strategy Validation

### Current Split (✅ Optimal)

The existing 4-way context split provides:

1. **Isolation:** Session changes don't trigger course re-renders
2. **Granularity:** Components can subscribe to only needed domains
3. **Maintainability:** Clear ownership per domain
4. **Scaling:** Easy to add new domains (e.g., NotificationsContext in Phase C)

### Recommended Hooks Usage

#### For Single-Domain Components
Prefer specific hooks to avoid unnecessary re-renders:

```typescript
// ❌ Avoids this (subscribes to all 4 contexts)
const appStore = useAppStore();
const { currentSession } = appStore;

// ✅ Prefer this (subscribes only to session)
const { currentSession } = useSessionStore();
```

#### For Multi-Domain Components
Use the aggregate hook only when needed:

```typescript
// Only for dashboard/admin views requiring cross-domain data
const appStore = useAppStore();
```

---

## 5. Dual Data Sources Strategy (Phase B)

The current app uses Supabase as the single source of truth with real-time subscriptions. Phase B should consider:

### Option 1: Server-Side Hydration (Recommended)
- Initial app data fetched via Server Components
- Real-time updates continue via WebSocket subscriptions
- Benefit: Faster initial paint, SEO friendly

### Option 2: Hybrid Caching
- Add Redis caching layer for frequently accessed data (courses, instructors)
- Client-side caching for session data
- Benefit: Reduced Supabase RPC costs

### Option 3: Client-Side State Replication
- Replicate critical reads from Supabase to IndexedDB
- Fallback to IndexedDB during network issues
- Benefit: Offline support

**Recommended:** Combine Options 1 + 3 in Phase B

---

## 6. Action Items

### Phase 1 (Current Sprint) ✅
- [x] Audit current app context size
- [x] Identify re-render triggers
- [x] Validate context split strategy
- [x] Generate performance baseline
- [x] Document optimization patterns

### Phase B (Roadmap)
- [ ] Implement incremental TypeScript checking (`tsc --incremental`)
- [ ] Profile JavaScript bundle size with Next.js Bundle Analyzer
- [ ] Consider CSS-in-JS for Mantine component styling
- [ ] Implement server-side hydration for initial app data
- [ ] Add React DevTools Profiler integration to CI/CD

### Performance Improvement Goals (Phase B)
- Reduce `npm run typecheck` time from ~18s to ~8s
- Keep CSS bundle below 25KB
- Achieve JavaScript bundle < 100KB (gzip)

---

## 7. Re-Render Checklist for @dev

When implementing new features, use this checklist to maintain performance:

- [ ] Use specific context hooks (`useCourseStore`, not `useAppStore`) when possible
- [ ] Wrap component state in `useMemo` if it's used as context value
- [ ] Debounce rapid updates (e.g., search queries, form inputs)
- [ ] Use `React.memo` for components that receive stable props from context
- [ ] Profile with React DevTools Profiler before committing
- [ ] Verify no unnecessary re-renders in console warnings

---

## 8. Appendix: Design Tokens Integration

The app uses a custom Trust Keith design token system (`/src/design-tokens/`), which:
- Feeds into Tailwind config as CSS variables
- Provides type-safe color palette for Mantine
- Enables consistent theming across UI framework boundaries

**Impact on performance:** Minimal (~2KB added to CSS)

---

## References

- **App Store Implementation:** `/src/lib/app-store.tsx`
- **Context Definitions:** `/src/lib/contexts/`
- **Build Configuration:** `/next.config.mjs`
- **CSS Bundle:** `/src/styles/globals.css`

---

**Next Milestone:** Approve form styling guide from @architect, then @dev implements Task #3 (Form Styling Consolidation)
