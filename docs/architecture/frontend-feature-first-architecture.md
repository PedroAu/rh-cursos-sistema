# Frontend Architecture Target

## Objective

Consolidate the active Next.js application around:

- `app/` as the only routing layer
- `src/features/` as the primary organization model
- Tailwind CSS as styling runtime
- Material-inspired interaction patterns as the UI baseline
- A lightweight clean architecture split between route, presentation, domain logic, and infrastructure

## Decisions

### 1. Routing

- `app/` owns route entrypoints only
- Route files should compose shells and feature pages
- Route files must not contain business logic

### 2. Feature-first organization

- New code should default to `src/features/<feature-name>/`
- Existing `src/views/` files remain as compatibility shims during migration
- Shared primitives stay in `src/components/ui/`

### 3. Lightweight clean architecture

Within each feature, prefer this split when justified by complexity:

- `components/` for presentation
- `model/` for selectors, view models, pure derivations
- `services/` for orchestration or data access tied to the feature
- `types.ts` for feature-local contracts

Not every feature needs every layer. Avoid empty folders.

### 4. Material-inspired baseline

- Use app bars, elevated surfaces, drawers, and bottom navigation patterns
- Keep the existing Tailwind and Radix foundation
- Do not introduce `@mui/material` as a runtime dependency in this phase
- Do not implement dark mode in this phase

### 5. Shared infrastructure

- `src/lib/` remains the home for cross-cutting infrastructure such as auth, Supabase, validation, and generic utilities
- `src/components/ui/` remains the design-system primitive layer

## Target Structure

```txt
app/
  page.tsx
  cursos/page.tsx
  admin/page.tsx

src/
  components/
    ui/
    shared/

  features/
    admin/
      dashboard/
      resources/
    admin-shell/
      components/
      config/
    public/
      home/
      courses/
      contact/
    public-shell/
      components/
      config/

  hooks/
  lib/
  styles/
  types/
```

## Migration Notes

- Route imports should move from `src/views/*` to `src/features/*`
- Legacy `src/views/*` files can re-export migrated feature modules until all references are updated
- Favor incremental migration by feature, not broad folder renames without ownership changes
