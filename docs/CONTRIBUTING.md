# Contributing Guide — RH Cursos Development

Welcome to the RH Cursos development community! This guide covers coding standards, development workflow, and PR best practices.

---

## Getting Started

### Prerequisites

- **Node.js >= 24** (check with `node --version`)
- **npm >= 11** (included with Node.js)
- **Git** configured with your name and email
- **VS Code** (recommended) or your preferred code editor

### Initial Setup

1. **Clone and install** (see [`docs/guides/QUICK-START.md`](guides/QUICK-START.md))
   ```bash
   git clone https://github.com/rhcursos/site-rh-cursos.git
   cd site-rh-cursos
   npm install
   ```

2. **Configure environment** (`.env.local`)
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Run locally**
   ```bash
   npm run dev
   # App available at http://localhost:3000
   ```

---

## Coding Standards

### TypeScript

- **Strict mode:** `tsconfig.json` has `strict: true` — all code must pass `npm run typecheck`
- **No `any`:** Use `unknown` with type guards instead
- **Explicit types:** Function parameters and return types should be typed
- **Type organization:** Shared types live in `src/types/`

Example:
```typescript
// ✅ Good
function getUserById(id: string): Promise<User | null> {
  return db.query<User>('SELECT * FROM users WHERE id = ?', [id]);
}

// ❌ Bad
function getUserById(id) {
  return db.query('SELECT * FROM users WHERE id = ?', [id]);
}
```

### React & Components

- **Functional components only:** No class components
- **Hooks:** Use React hooks (useState, useEffect, useCallback)
- **Naming:** Components are PascalCase; hooks are camelCase
- **Props:** Define explicit interfaces/types for component props
- **Keys:** Always use stable, unique keys in lists (not array indices)

Example:
```typescript
// ✅ Good
interface CourseCardProps {
  title: string;
  description: string;
  rating: number;
  onSelect: (id: string) => void;
}

export function CourseCard({ title, description, rating, onSelect }: CourseCardProps) {
  return (
    <div onClick={() => onSelect(title)}>
      <h3>{title}</h3>
      <p>{description}</p>
      <span>{rating}/5.0</span>
    </div>
  );
}
```

### Styling

- **Use design tokens:** Reference tokens defined in `src/design-tokens/`
- **Tailwind + Mantine:** New components use Mantine; legacy Tailwind classes allowed during migration
- **CSS custom properties:** For runtime theme switching
- **No inline styles:** Use className or Mantine `sx` prop
- **Responsive:** Mobile-first approach with Tailwind breakpoints

Example:
```typescript
// ✅ Good
<Button
  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
  aria-label="Submit form"
>
  Submit
</Button>

// ❌ Bad
<button style={{ backgroundColor: '#2563eb', padding: '8px 16px' }}>
  Submit
</button>
```

### File Organization

```
src/
├── components/          # Shared UI components (design system)
├── features/            # Feature-first modules
│   ├── public/
│   ├── admin/
│   └── [feature]/
│       ├── components/  # Feature-specific components
│       ├── hooks/       # Feature-specific hooks
│       ├── lib/         # Feature utilities
│       ├── types/       # Feature types
│       └── [feature]-page.tsx  # Main feature export
├── hooks/               # Global custom hooks
├── lib/                 # Shared utilities
├── types/               # Global types
└── __tests__/           # Unit tests
```

**Feature Module Layout:**
```
src/features/admin/courses/
├── components/
│   ├── course-form.tsx
│   ├── course-list.tsx
│   └── course-card.tsx
├── hooks/
│   ├── use-courses.ts
│   └── use-course-form.ts
├── lib/
│   └── course-validation.ts
├── types/
│   └── course.ts
└── courses-page.tsx
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `CourseCard.tsx` |
| Files | kebab-case | `course-form.tsx` |
| Hooks | camelCase, prefix `use` | `useCourses.ts` |
| Types | PascalCase | `type Course = { ... }` |
| Constants | UPPER_SNAKE_CASE | `const MAX_UPLOAD_SIZE = ...` |
| Functions | camelCase | `fetchCourses()` |
| Folders | kebab-case | `src/features/admin-shell/` |

### Error Handling

```typescript
// ✅ Good: Explicit error handling
try {
  const data = await fetchData();
  return { ok: true, data };
} catch (error) {
  console.error('Failed to fetch:', error);
  return { ok: false, error: 'Unable to load data' };
}

// ❌ Bad: Silent failures
const data = await fetchData();
return { ok: true, data };
```

---

## Development Workflow

### Creating a Feature Branch

```bash
# Sync with main
git fetch origin main
git checkout main
git pull origin main

# Create feature branch (follow naming convention)
git checkout -b feature/course-management
# OR
git checkout -b fix/login-redirect
# OR
git checkout -b docs/update-api-guide
```

**Branch naming:**
- `feature/name` — new features
- `fix/name` — bug fixes
- `docs/name` — documentation
- `refactor/name` — code refactoring
- `test/name` — test additions

### Commit Messages

Use **conventional commits** for clarity:

```
feat: add course filtering by category
fix: resolve keyboard navigation in admin sidebar
docs: update SETUP.md with troubleshooting section
refactor: consolidate form validation logic
test: add E2E tests for checkout flow
```

**Guidelines:**
- Start with type: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Keep subject line under 50 characters
- Use imperative mood ("add", not "adds" or "added")
- Reference GitHub issues if applicable: `fix: login bug (#123)`

Example of a good commit message:
```
feat: implement WCAG AA keyboard navigation (closes #42)

- Add tabindex management for modal dialogs
- Implement focus trap in form modals
- Update test suite with keyboard navigation tests
- Tested on Chrome, Firefox, Safari
```

### Pre-Commit Checks

Before pushing, run the local validation gate:

```bash
# Full validation (recommended)
npm run devops:all

# Or individual checks
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run test:unit    # Unit tests
npm run build        # Production build
npm test             # Full E2E + a11y suite
```

**What happens if checks fail:**
1. Fix the issue (ESLint offers auto-fix with `npm run lint -- --fix`)
2. Re-run the check to verify
3. Don't force-push or skip hooks

### Creating a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature
   ```

2. **Create PR on GitHub**
   - Clear title: `feat: add course filtering by category`
   - Link related issues: `Closes #42`
   - Describe what changed and why
   - Include screenshots for UI changes

3. **PR template**
   ```markdown
   ## Summary
   Brief description of changes.

   ## Related Issues
   Closes #42

   ## Testing
   - [ ] Manual tested on desktop
   - [ ] Manual tested on mobile
   - [ ] All tests passing (`npm test`)
   - [ ] No TypeScript errors (`npm run typecheck`)

   ## Screenshots (if applicable)
   [Add screenshots or GIFs]

   ## Checklist
   - [ ] Code follows style guide
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

4. **Address review feedback**
   - Make requested changes
   - Re-run checks: `npm run devops:all`
   - Push updates (don't rebase unless requested)

5. **Merge & cleanup**
   - Squash commits if requested
   - Delete feature branch after merging

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test:unit        # Run once
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

**Writing tests:**
```typescript
// src/__tests__/lib/course-validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateCourse } from '../../lib/course-validation';

describe('validateCourse', () => {
  it('accepts valid course data', () => {
    const valid = { title: 'Excel 101', cargaHoraria: 8 };
    expect(validateCourse(valid)).toEqual({ ok: true });
  });

  it('rejects missing title', () => {
    const invalid = { cargaHoraria: 8 };
    expect(validateCourse(invalid)).toEqual({
      ok: false,
      error: 'Title is required',
    });
  });
});
```

### E2E Tests (Playwright)

```bash
npm test             # Full suite (E2E + visual + a11y)
npm run test:e2e:smoke  # Quick smoke tests
npm run test:a11y    # Accessibility audit
```

**Writing E2E tests:**
```typescript
// tests/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('user can complete checkout flow', async ({ page }) => {
  // Navigate to courses
  await page.goto('/cursos');
  
  // Find and click a course
  await page.click('text=Excel Intermediário');
  
  // Verify course details page
  await expect(page).toHaveTitle(/Excel/);
  
  // Add to cart and checkout
  await page.click('button:has-text("Inscrever")');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.click('button:has-text("Confirmar")');
  
  // Verify success
  await expect(page).toHaveURL(/\/sucesso/);
});
```

### Accessibility Testing

All new UI changes must pass:
- **Manual:** Keyboard navigation (Tab, Enter, Escape)
- **Automated:** Axe-core (part of `npm test`)
- **Visual:** Contrast checker (built into E2E suite)

---

## Database Changes

### Migrations

Use Supabase migrations for schema changes:

```bash
# Create migration
supabase migration new add_course_status_column

# Edit supabase/migrations/[timestamp]_add_course_status_column.sql
# Then push to database
supabase db push
```

**Migration rules:**
- Always make migrations idempotent (safe to run multiple times)
- Never drop columns without deprecation period
- Use `IF NOT EXISTS` / `IF EXISTS` clauses
- Document breaking changes in PR

### Seeds & Demo Data

- **Demo data:** `supabase/sql/seed_rh_cursos_demo.sql`
- **Admin seed:** `scripts/seed-admin.js` (use for testing)
- **Never hardcode:** Credentials in seed files — use environment variables

```bash
# Seed admin user (requires .env.local)
ADMIN_EMAIL=test@example.com ADMIN_PASSWORD='SecurePass#2026' \
  node scripts/seed-admin.js
```

---

## Accessibility (WCAG 2.1 AA)

All UI changes must meet WCAG 2.1 AA standards:

### Checklist

- [ ] **Contrast:** Text/controls meet 4.5:1 (normal) or 3:1 (large)
- [ ] **Keyboard:** All interactive elements are keyboard-accessible
- [ ] **Focus:** Visible focus indicators on interactive elements
- [ ] **Labels:** Form inputs have associated `<label>` elements
- [ ] **ARIA:** Use `aria-label`, `aria-describedby`, `role` where semantic HTML isn't enough
- [ ] **Motion:** Respect `prefers-reduced-motion` media query
- [ ] **Images:** All images have descriptive `alt` text

Example:
```typescript
// ✅ Accessible form
<form>
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    type="email"
    placeholder="your@email.com"
    aria-describedby="email-hint"
    required
  />
  <small id="email-hint">We'll never share your email.</small>
  
  <button type="submit" aria-label="Subscribe to newsletter">
    Subscribe
  </button>
</form>
```

---

## Performance Guidelines

### Bundle Size

- Keep individual component bundles < 50KB
- Use dynamic imports for large features: `const Admin = dynamic(() => import('...'))`
- Monitor bundle size: `npm run bundle:check`

### Images

- Use Next.js `Image` component (automatic optimization)
- Provide `alt` text for all images
- Lazy-load images below the fold

### API Calls

- Use React Query or SWR for caching/deduplication
- Debounce search inputs (300-500ms)
- Implement pagination for large lists

---

## Documentation

### Code Comments

```typescript
// ✅ Good: Explains WHY, not WHAT
// We retry auth twice because Supabase can have transient failures
// during connection pool exhaustion in high-load scenarios.
const MAX_AUTH_RETRIES = 2;

// ❌ Bad: States obvious facts
// Get the user ID from the request
const userId = req.query.id;
```

### README & Docs

- Update documentation when adding features
- Keep API documentation in `docs/api/`
- Maintain architecture docs when making structural changes
- Add examples for complex features

---

## Debugging & Troubleshooting

### Common Issues

**"npm run dev" fails to start**
- Check if port 3000 is in use: `lsof -i :3000`
- Use different port: `npm run dev -- -p 3001`

**TypeScript errors after npm install**
- Clear cache: `rm -rf .next node_modules && npm install`
- Regenerate types: `npm run typecheck`

**Build fails with Supabase errors**
- Verify `.env.local` has all required variables
- Check Supabase project is accessible
- Regenerate types: `npm run cf:typegen`

**Tests are flaky**
- Run serially (already configured): tests use `--workers=1`
- Check for race conditions in test cleanup
- See [`docs/guides/TROUBLESHOOTING.md`](guides/TROUBLESHOOTING.md) for detailed help

---

## Review & Merge Criteria

A PR is ready to merge when:

1. ✅ **All tests pass** (`npm run devops:all`)
2. ✅ **Code review approved** by maintainer
3. ✅ **No merge conflicts** with main branch
4. ✅ **Documentation updated** (if applicable)
5. ✅ **No breaking changes** (or documented)
6. ✅ **Accessibility checklist** completed (if UI changes)

---

## Getting Help

### Resources

- **Setup issues?** → [`docs/guides/QUICK-START.md`](guides/QUICK-START.md)
- **Troubleshooting?** → [`docs/guides/TROUBLESHOOTING.md`](guides/TROUBLESHOOTING.md)
- **Architecture questions?** → [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
- **API documentation?** → [`docs/api/README.md`](api/README.md)
- **Design system?** → [`docs/design-system/`](design-system/)

### Communication

- **Bugs:** Open a GitHub issue with reproduction steps
- **Questions:** Ask in the project's Slack/Discord channel
- **Security issues:** Email security@rhcursos.com (don't open public issues)

---

**Happy coding! 🚀**
