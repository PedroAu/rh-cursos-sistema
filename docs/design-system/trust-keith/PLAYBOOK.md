# PLAYBOOK: End-to-End Workflow

Recommended way to use Claude Design Premium in Claude Design Web projects (dual-mode).

## Host modes

| Mode | When | DS location |
|---|---|---|
| **Builder** | DS project with **compiled** manifest + bundle at root | `_ds_manifest.json` + `_ds_bundle.js` at `./` |
| **Consumer** | App consuming an exported DS bundle | `./_ds/<bundle>/` with the same two files |

Builder mode requires both files. A tokens-only project without `_ds_bundle.js` is not bindable yet;
compile or export the bundle first, then bootstrap.

The harness auto-detects mode. Override with `node scripts/bootstrap-harness.mjs --mode builder|consumer`.

## 1. Initial setup (one time)

### Consumer

1. Download the harness ZIP from the repo and upload to Claude Design Web.
2. Copy the harness files to the project root.
3. Place your exported DS under `_ds/<bundle>/`.
4. Open a new tab and send `GO` (or let `harness-auto-setup` run on first message).
5. Confirm `BOUND_DS.json` shows `hostMode: consumer` and `configured: true`.
6. Run the canary in [`docs/validation-method.md`](docs/validation-method.md) once.

### Builder

1. Start a Claude Design Web project with `_ds_manifest.json` and `_ds_bundle.js` already at root.
2. Add harness files (`CLAUDE.md`, `skills/`, `scripts/`). Intro DC is created on bootstrap.
3. Send `GO` or run `node scripts/bootstrap-harness.mjs --mode builder`.
4. Confirm `BOUND_DS.json` shows `hostMode: builder`, `root: "."`.
5. Run the canary in [`docs/validation-method.md`](docs/validation-method.md).

### Maintainer checks (outside canvas)

```bash
node scripts/context-signals.mjs
node scripts/bootstrap-harness.mjs --check
node scripts/test-builder-bootstrap.mjs
node scripts/detect-canvas-antipatterns.mjs *.dc.html
node scripts/detect-text-antipatterns.mjs CLAUDE.md DESIGN.md skills
```

Scripts are dependency-free (Node built-ins only). See [`docs/script-pipeline.md`](docs/script-pipeline.md).

## 2. Daily workflow

### New screen or major feature

1. Describe the task in Claude Design Web.
2. If product, audience, surface, or references are unclear, run `brief-framing` first.
3. Ask for one screen or one flow slice at a time.
4. The protocol should run `design-system-guardian`, `visual-originality-audit` (when visual),
   `ui-audit`, and `polish-phase` (when direction exists).
5. Review the `SKILLS APPLIED` block on deliverables. For tiny tweaks, a shorter note is fine.
6. Iterate with inline comments for targeted fixes and chat for structural changes.

### Modularization / framework handoff

1. After visual direction is approved, extract reusable pieces: shell, nav, cards, buttons, sections.
2. Run `framework-handoff` and read the per-target adapters:
   - [`docs/adapters/astro.md`](docs/adapters/astro.md)
   - [`docs/adapters/vite.md`](docs/adapters/vite.md)
   - [`docs/adapters/next.md`](docs/adapters/next.md)
3. Map components by role using `BOUND_DS.json` -> `namespace` / `components`, not reinvented names.
4. Keep canvas work static. Framework migration is a repo step, not a canvas runtime step.
5. Choose target by product surface:
   - **Astro** for marketing/content
   - **Vite** for interactive apps/dashboards
   - **Next** when SSR/SEO/team conventions require it

### Polish and final review

1. Explicitly ask for `polish-phase`.
2. Run `visual-originality-audit` if the screen still feels templated.
3. Run `text-integrity-audit` for visible copy, docs, or deck text.
4. Follow with `mobile-first-audit` + `accessibility-audit`.
5. Do not mark a screen done until these have passed.

## 3. Maintaining the system

- When manifest, tokens, or components change, re-run `node scripts/bootstrap-harness.mjs`.
  Bootstrap compares the live DS against `BOUND_DS.json` and refreshes when drift is detected.
- When protocol docs change, run `node scripts/context-signals.mjs`.
- When adding repeatable processes, consider a new skill or a `DESIGN.md` section.
- Review `NEXT RECOMMENDED` suggestions from the protocol for missing skills.

## 4. Team usage

- One project-governing `CLAUDE.md`, one `DESIGN.md`, one bound DS (`BOUND_DS.json`).
- Submit new skills via PR when processes become repeatable.
- Use the reporting block in reviews: "Did accessibility-audit actually run?"

## 5. Legacy exports

Older Claude Design export shapes (preview cards, no native components):
[`docs/legacy-claude-design-exports.md`](docs/legacy-claude-design-exports.md)

The protocol works best as **shared infrastructure**, not a personal prompting trick.