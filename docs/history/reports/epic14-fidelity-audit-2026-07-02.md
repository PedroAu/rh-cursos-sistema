# Epic 14 Fidelity Audit — 2026-07-02

## Status

Epic 14 is **formally closed by this report** as of **2026-07-03**.

What is now proven:

- `npm run build` passes
- `npm run test:e2e:smoke` passes with `82 passed` on 2026-07-03
- `tests/ui-governance.spec.ts` passes with `8 passed`
- Public a11y gates pass for `/`, `/cursos`, `/agenda`, `/blog`, `/in-company`, `/contato`, `/login`
- Fresh route-vs-canvas captures were regenerated on 2026-07-03 after the final public header and `/in-company` copy adjustments
- Final human review of the refreshed captures confirms no remaining material fidelity delta for `/`, `/cursos`, `/agenda`, `/in-company`, `/sobre`, or `/blog`

## Audit Harness

Repeatable capture command:

```bash
npm run test:epic14:fidelity:capture
```

Files:

- [scripts/capture-epic14-fidelity.mjs](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/scripts/capture-epic14-fidelity.mjs)
- [artifacts/epic14-fidelity/manifest.json](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/manifest.json)

Notes:

- Captures run against the production server at `http://127.0.0.1:3100`
- Canvas references require `bypassCSP: true` because their bootstrap uses remote `unpkg` React

## Refreshed Evidence

Artifacts were regenerated for:

- `/` vs `RH Cursos Home.dc.html` + `RH Home Sections.dc.html`
- `/cursos` vs `RH Cursos Catálogo.dc.html`
- `/agenda` vs `RH Cursos Agenda.dc.html`
- `/in-company` vs `RH Cursos In-company.dc.html`
- `/sobre` vs `RH Cursos Quem Somos.dc.html`
- `/blog` vs `RH Cursos Blog.dc.html`

Directory:

- [artifacts/epic14-fidelity](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity)

Key captures:

- Home: [route](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/home-route.png), [canvas 1](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/home-canvas-1.png), [canvas 2](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/home-canvas-2.png)
- Courses: [route](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/courses-route.png), [canvas](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/courses-canvas.png)
- Agenda: [route](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/agenda-route.png), [canvas](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/agenda-canvas.png)

## Findings

### 1. `/cursos` is no longer on the old IA

Spec:

- [docs/design/redesign/spec-catalogo.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-catalogo.md)

Current state:

- The route now follows the session-card model from the canvas instead of the old course-card grid
- Hero, count/search bar, category chips, session cards, and cross-sell band were rebuilt
- Functional regression for the global quote modal was restored with the `Orçamento In Company` CTA

Remaining caveat:

- The live/mock catalog still has fewer sessions than the canvas, so literal density is lower than the reference

### 2. `/agenda` now follows the Trust Keith structure

Spec:

- [docs/design/redesign/spec-agenda.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-agenda.md)

Current state:

- The route now leads with the correct hero and horizontal filter bar
- The default view is list-first with month grouping, matching the intended IA
- Calendar mode, active chips, top-level CTA, and cross-sell band were rebuilt

Remaining caveat:

- The real dataset is much smaller than the canvas dataset, so the page still reads as a sparse implementation of the same structure rather than a pixel-for-pixel clone

### 3. `/` was rebuilt to match the Home + Home Sections canvases

Specs:

- [spec-home.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-home.md)
- [spec-home-sections.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-home-sections.md)

Current state:

- The page now follows the intended section sequence: hero, journeys, consultoria, números, depoimento, CTA final, footer
- Home visual baselines were regenerated to the new implementation
- Contrast issues introduced by the Trust Keith color system were corrected to satisfy WCAG gates

Remaining caveat:

- This report does not assert that the refreshed captures are indistinguishable from the canvases, only that the structure and governed slices are now aligned enough to move from “obviously wrong IA” to “human acceptance pass required”

### 4. `/in-company` now follows the canvas structure instead of the legacy consultive landing

Spec:

- [docs/design/redesign/spec-in-company.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-in-company.md)

Current state:

- The route now uses the same high-level section order as the canvas: hero, client trust band, benefits, process steps, themes plus testimonial, stats, and lead form
- The hero changed from the previous dark split-panel consultoria layout to the light Trust Keith in-company hero with the right-side rationale card
- The lead form still preserves the tested real submission flow and inline confirmation while now living inside the same two-panel card structure as the reference
- Build and the route-specific regression tests still pass after the rewrite

Remaining caveat:

- Some field semantics in the live form remain implementation-led rather than literal canvas copy because they preserve current lead handling and existing regression coverage

### 5. `/blog` and `/sobre` now meet the same acceptance bar as the other redesigned public routes

Specs:

- [docs/design/redesign/spec-blog.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-blog.md)
- [docs/design/redesign/spec-quem-somos.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-quem-somos.md)

Current state:

- Both routes are stable and covered by the current public regression suite
- `/blog` now follows the correct canvas family: hero, featured article, trending rail, category filters, editorial card grid, and newsletter CTA band
- `/sobre` now follows the “Quem Somos” section model: institutional hero, stats bar, institutional history, mission/vision/philosophy, solutions, tracks, methodology, and CTA
- The final regenerated captures show `/blog` and `/sobre` in the same visual family, section order, navigation treatment, and CTA composition as their Trust Keith references
- The last `/in-company` copy delta was resolved while preserving the tested accessible-name contracts used by the Playwright suite

## Proven Complete vs Open

### Proven

- Mantine removal from the runtime public surface
- Build stability
- Full smoke regression suite
- Accessibility governance gate
- Visual governance baselines for Home, Catalog filters, Agenda filters, Contact, and Login
- Refreshed fidelity capture workflow
- In-company page structure moved to the correct canvas family without regressing tested lead flows
- Final human acceptance pass over refreshed captures for `/blog`, `/sobre`, and `/in-company`
- Public header navigation alignment with the redesigned canvases

## Acceptance Result

1. The refreshed captures in [artifacts/epic14-fidelity](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity) were regenerated on 2026-07-03.
2. Home, Courses, Agenda, In-company, Sobre, and Blog were compared against their Trust Keith canvas references.
3. No remaining delta was judged material enough to block the epic under the stated fidelity criterion.
4. Epic 14 can be treated as complete unless a future review raises a new fidelity defect outside this audited set.
