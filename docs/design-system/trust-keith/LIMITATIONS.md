# LIMITATIONS: Honest Assessment

Transparency builds trust faster than over-promising.

## What This Protocol Actually Does

The Claude Design Premium Protocol is a **context engineering pattern**. It works by:

- Using root `CLAUDE.md` as the lightweight Claude Design Web bootstrap.
- Loading relevant `.skill.md` documents into the model's context as document-backed procedures.
- Using clear routing rules and checkpoint reporting for deliverables, audits, final approval, and handoff.
- Anchoring generation in `DESIGN.md` plus the bound DS token CSS:
  - **Builder mode:** token files at project root (`BOUND_DS.json` -> `globalCssPaths`)
  - **Consumer mode:** token files under `_ds/<bundle>/` (same fields)

It **influences** model behavior through high-signal instructions and selective loading. It does **not** compile, sandbox, or runtime-enforce anything.

## What It Does NOT Do

- It does not guarantee that every output will perfectly follow your design system.
- It does not replace proper design system governance, component libraries, or design tokens in code.
- It does not run git, package installs, package scripts, lint, tests, builds, Vite, Next, Astro, or any dev server inside Claude Design Web.
- It does not run ESM imports/exports, npm package imports, or bundler-dependent modules inside the canvas. Those are handoff assets for a real repo.
- It can load self-contained UMD/IIFE global scripts via `<script src>` when they expose API on `window`, but it cannot build them.
- It does not provide a Node/bundler React environment. React/JSX only works through in-browser UMD +
  Babel standalone patterns in the canvas (not a real bundler toolchain).
- It does not certify accessibility or legal compliance. The accessibility skill is a **review checklist**, not a compliance engine.
- It does not prevent the model from hallucinating tokens or ignoring instructions when context pressure is high.
- It does not work equally well with every model or every prompt style. Results vary.
- It does not install new native Skills inside Claude Design Web. `.skill.md` files are document-backed procedures, not product Skills.
- Its deterministic `scripts/*.mjs` run **inside the canvas** when Claude reads and executes their JavaScript logic against project files (paired with skills per `docs/script-pipeline.md`). Local `node scripts/...` mirrors the same checks for maintainers. Scripts must remain dependency-free (Node built-ins only).

## Known Weaknesses

1. **Context Window Pressure**
   Loading too many skills plus a large `DESIGN.md` can cause the model to ignore parts of the instructions. The protocol is selective precisely because of this.

2. **"Enforce" Is Procedural, Not Deterministic**
   "Enforce" means **procedural enforcement**: Claude is instructed to check against `CLAUDE.md`, `DESIGN.md`, bound DS token CSS, and relevant skills, then report what it applied or skipped. This is reviewable guidance, not deterministic policy enforcement. Human review is still required.

3. **Depends on Model Cooperation**
   If the underlying model is in a bad state (high temperature, poor reasoning, or very long conversation), effectiveness decreases.

4. **Mobile and Accessibility Still Require Human Judgment**
   Audits are rigorous checklists performed by an LLM. Real devices, keyboards, and assistive technology testing remain necessary.

5. **Canvas Runtime Is Static**
   Claude Design Web is an HTML/CSS/browser-JS preview surface. Framework migration is a later repo step (see `docs/adapters/`).

6. **Stale Binding Cache**
   `BOUND_DS.json` can drift if the DS changes without re-running bootstrap. Run
   `node scripts/bootstrap-harness.mjs` after token or manifest updates; bootstrap compares live DS
   against the cache and refreshes when drift or stale binding metadata is detected.

7. **Native Bundle Contamination**
   Claude Design's native compiler can bundle all project JavaScript into `_ds_bundle.js`, not only registered components. Keep the DS project clean (tokens, components, templates, small helpers). Mixing site/app runtime into the DS project makes every consumer load that code.

8. **Legacy Export Shape**
   Older exports may lack native components and use `preview/*.html` cards instead. See `docs/legacy-claude-design-exports.md` for migration rules.

## When Not to Use This

- When you need guaranteed, machine-enforceable design system compliance (use a component library + linting instead).
- When you're doing rapid exploratory UI work and routing overhead feels counterproductive.
- When working with models that have very small context windows.

## Our Stance

We prefer fewer users who understand exactly what they're getting over many users who feel misled. The protocol is a powerful pattern for teams that want **repeatable taste** and participate in the process (reviewing the reporting block, maintaining `DESIGN.md`, curating skills).

If this doesn't match your expectations, that's okay. There are other approaches.

We document these limitations with the same energy we document the features because long-term credibility matters more than short-term stars.
