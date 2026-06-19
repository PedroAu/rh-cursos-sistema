# Admin data decomposition plan

## Current exports

`src/lib/admin-data.ts` currently exports:

- Types: `AdminCourseRow`, `AdminInstructorRow`, `AdminAgendaRow`,
  `AdminSelectOption`, `AdminUserRow`, `AdminLeadRow`, `AdminAlunoRow`,
  `AdminArchivedRow`, `AdminDashboardSnapshot`.
- Data loaders: `getAdminCourses`, `getAdminInstructors`, `getAdminAgenda`,
  `getAdminCourseOptions`, `getAdminInstructorOptions`, `getAdminUsers`,
  `getAdminLeads`, `getAdminAlunos`, `getAdminDashboardSnapshot`,
  `getArchivedAdminEntities`.

## Current consumers

- Admin pages under `src/app/(admin)/admin/*`.
- Admin form/entity components under `src/components/forms/*` and
  `src/components/admin/*`.
- Leads export route under `src/app/(admin)/admin/leads/export/route.ts`.
- Existing page/route tests mock `@/lib/admin-data` directly.

## First safe slice

Extracted pure filter/format helpers into `src/lib/admin-data/filters.ts`:

- `normalizeValue`
- `matchesQuery`
- `matchesExactFilter`
- `matchesDateRange`
- `formatPrice`
- `normalizeStringList`

This slice has no database access, no public export contract change, and no query
behavior change. `src/lib/admin-data.ts` remains the facade for existing
consumers.

## Next decomposition steps

Recommended follow-up slices:

1. Move option loaders (`getAdminCourseOptions`, `getAdminInstructorOptions`) into
   `src/lib/admin-data/options.ts`.
2. Move entity loaders by domain: `courses.ts`, `instructors.ts`, `agenda.ts`,
   `users.ts`, `leads.ts`, `alunos.ts`.
3. Move dashboard aggregation into `dashboard.ts` after entity loaders are split.
4. Move archived entity aggregation into `archived.ts`.
5. Keep `src/lib/admin-data.ts` as a compatibility barrel until imports are
   migrated deliberately.

Remaining debt:

- `src/lib/admin-data.ts` still owns multiple Supabase queries and cross-entity
  aggregation.
- Type definitions and data loaders are still colocated.
- Existing consumers import a single broad facade, so future changes should move
  imports gradually by domain rather than using a large mechanical rewrite.
