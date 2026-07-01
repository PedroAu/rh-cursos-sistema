# Trust Keith Refactoring Guide — Phase 3

## Context

Phase 1-2 (custom-1.1) are complete:
- ✅ `tokens.tailwind.js` — 80 Trust Keith tokens
- ✅ `globals.css` — ~40 CSS variables
- ✅ 6 Base Components refactored (Button, Card, Input, Badge, Typography, Link)

Phase 3 (custom-1.2) refactors 10 pages to use these components.

---

## Refactoring Pattern

Each page follows this pattern:

### Step 1: Update Imports

**Remove from Mantine:**
```javascript
// REMOVE:
import { Button, Card, Badge, Title, Text, ... } from "@mantine/core";
```

**Add Trust Keith components:**
```javascript
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { H1, H2, H3, H4, P, Typography } from "@/components/ui/typography";
import { Link } from "@/components/ui/link";
```

**Keep Mantine for layout/utility:**
```javascript
// KEEP (layout still uses Mantine):
import { Box, Container, Grid, Stack, Group, SimpleGrid } from "@mantine/core";
```

### Step 2: Replace Typography

**Before:**
```jsx
<Title order={1} c="white">Heading</Title>
<Text fz="lg" c="...">Body text</Text>
```

**After:**
```jsx
<H1 className="text-white">Heading</H1>
<P className="text-lg">Body text</P>
```

### Step 3: Replace Components

**Button:**
```jsx
// Before:
<Button color="rhGold" size="lg">Click</Button>

// After:
<Button variant="default" size="lg">Click</Button>
```

**Card:**
```jsx
// Before:
<Card radius="lg" shadow="sm" withBorder padding="lg">...</Card>

// After:
<Card variant="base" size="md">...</Card>
```

**Badge:**
```jsx
// Before:
<Badge variant="light" color="rhGold">Status</Badge>

// After:
<Badge variant="default">Status</Badge>
```

**Input:**
```jsx
// Before:
<TextInput placeholder="Email" {...form.getInputProps('email')} />

// After:
<Input type="email" placeholder="Email" {...form.getInputProps('email')} />
```

### Step 4: Validate

```bash
npm run typecheck   # Should be 0 errors
npm run lint        # Should be 0 violations
npm run build       # Should complete < 6s
```

---

## Files to Refactor (Priority Order)

### Public Pages (5 pages — 1685 lines total)

| File | Lines | Complexity | Components Used | Status |
|------|-------|-----------|-----------------|--------|
| `Login.tsx` | 263 | Low | Button, Input, Text, Title | ⏳ Ready |
| `Blog.tsx` | 210 | Low | Card, Badge, Typography | ⏳ Ready |
| `Agenda.tsx` | 298 | Medium | Card, Grid, Typography | ⏳ Ready |
| `InCompany.tsx` | 474 | High | Card, Input, Button, Typography | ⏳ Ready |
| `Home.tsx` | 440 | High | Card, Button, Badge, Typography | ⏳ Ready |

### Admin Pages (3 pages)

| File | Complexity | Components | Status |
|------|-----------|-----------|--------|
| `AdminDashboard.tsx` | Medium | Card, Typography | ⏳ Ready |
| `AdminResourcePage.tsx` | Medium | Card, Table, Button | ⏳ Ready |
| `data-table.tsx` | Medium | Table, Badge | ⏳ Ready |

---

## Refactoring Checklist (per page)

- [ ] Update imports (remove Mantine components, add Trust Keith)
- [ ] Replace all `Title` → `H1`/`H2`/`H3`/`H4`
- [ ] Replace all `Text` → `P`/`Typography`
- [ ] Replace all `Button` → Trust Keith Button
- [ ] Replace all `Card` → Trust Keith Card
- [ ] Replace all `Badge` → Trust Keith Badge
- [ ] Replace all `TextInput` → `Input`
- [ ] Replace all `PasswordInput` → `Input type="password"`
- [ ] Run `npm run typecheck`
- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Visual check (desktop, tablet, mobile)
- [ ] Update File List in story

---

## Known Incompatibilities

| Mantine | Trust Keith | Solution |
|---------|------------|----------|
| `Badge variant="light"` | `Badge variant="default"` | Use default variant |
| `Button color="rhGold"` | `Button variant="primary"` | Use primary variant |
| `Title order={1}` | `H1` | Use semantic heading components |
| `Text component="span"` | `Span` | Use Span component |
| `TextInput` | `Input` | Import from ui/input |
| `PasswordInput` | `Input type="password"` | Use Input with type prop |

---

## Build Validation

After each page refactoring:

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Full build (should be < 6s)
npm run build

# Optional: check component rendering
npm run dev
# Visit the refactored page in browser
```

---

## Rollback Strategy

If a refactoring breaks something:

```bash
# Revert specific file:
git checkout -- src/views/public/Home.tsx

# Start over with smaller chunks
```

---

## Metrics to Track

After all pages are refactored:

| Metric | Target | Command |
|--------|--------|---------|
| Type Errors | 0 | `npm run typecheck` |
| Lint Violations | 0 | `npm run lint` |
| Build Time | < 2.5s | `npm run build` |
| CSS File Size | < 30KB | Measure in .next/static/css/ |
| Test Passing | 100% | `npm run test` |

---

## Next Steps

1. Pick a page from the table above
2. Follow the Refactoring Pattern section
3. Validate with npm commands
4. Update custom-1.2.story.md with progress
5. Commit with message format: `refactor(pages): apply Trust Keith to {PageName}.tsx`
6. Repeat for next page

---

**Reference:** This guide accompanies custom-1.2 story (Phase 3: Page Refactoring).
