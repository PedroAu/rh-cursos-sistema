# Story 14.2.1: Home Publica com Fidelidade Total Trust Keith

## Status
Ready for Review

## Executor Assignment
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - npm run test:epic14:fidelity
  - npm run test:epic14:fidelity:capture
  - npm run lint
  - npm run typecheck
  - npm run test:unit
  - npm run build
  - npm run purge:gate
  - npm run bundle:check

## ClickUp Sync
clickup:
  task_id: ""
  epic_task_id: ""
  list: "Backlog"
  url: ""
  last_sync: ""
  status: "pending - ClickUp tool unavailable in current Codex session"

## Epic
EPIC 14 - Redesign Trust Keith: Fidelidade Total + Remocao do Mantine

Source: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`

## Prerequisites
- Gate F0 aprovado: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-02-epic14-story0-6-qa-gate-fundacao.md`
- Gate F1 aprovado: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-02-epic14-story1-6-qa-gate-fase1.md`
- ADR aceito: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/architecture/adr-014-redesign-trust-keith.md`

## Story
**As a** visitante publico da RH Cursos,  
**I want** a Home fiel ao canvas Trust Keith, com hero, proximas turmas, jornadas, consultoria, estatisticas, depoimento, CTA e footer coerentes com o novo design,  
**so that** eu entenda rapidamente as ofertas da RH Cursos e avance para agenda, in-company ou consultoria sem regressao funcional.

## Acceptance Criteria
1. A rota `/` renderiza a Home conforme `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-home.md` e `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-home-sections.md`, preservando a ordem: Hero, Journeys, Consultoria, Estatisticas, Depoimento, CTA final e Footer.
2. O hero usa dados reais das proximas 3 turmas vindos do store/fonte atual do app, ordenados por `startDate` ascendente, com dia, mes, titulo do curso e modalidade formatados em pt-BR; lista vazia deve ter tratamento visual definido na implementacao, sem quebrar layout.
3. A implementacao usa exclusivamente tokens `--tk-*`/`--rh-*` e componentes/padroes Trust Keith ja existentes; nao deve introduzir hex hardcoded fora de `src/design-tokens/tokens.css` e nao deve recriar Mantine ou Emotion.
4. As secoes estaticas da Home reproduzem a copy do canvas documentada nas specs, exceto adaptacoes deliberadas ja listadas nos documentos de spec.
5. A Home permanece responsiva: desktop 1180px fiel ao canvas, tablet empilhando hero/consultoria quando necessario, mobile sem overflow horizontal, textos sem colisao e CTAs acessiveis.
6. Invariantes do Epic 5 continuam preservados: sem busca global no header, `prefers-reduced-motion` respeitado para animacoes JS/CSS, zero `<img>` cru em `src/`, e imagens via `next/image`.
7. A pagina continua dentro do shell publico real do app: `app/page.tsx` compoe `PublicPageShell` + `HomePage`; a story nao deve duplicar header/footer global se isso gerar footer duplo ou navegacao inconsistente.
8. A captura visual de fidelidade e gerada por `npm run test:epic14:fidelity:capture`; divergencias permitidas devem estar rastreadas nas adaptacoes das specs.
9. Os checks `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run test:epic14:fidelity`, `npm run purge:gate` e `npm run bundle:check` passam.
10. Ao concluir, esta story deve ser atualizada com checkboxes, status, File List real, Change Log e notas de qualquer desvio aprovado.

## CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `.aiox-core/core-config.yaml`.
> Quality validation will use manual review process only.
> To enable, set `coderabbit_integration.enabled: true` in `.aiox-core/core-config.yaml`.

## Story Type Analysis
**Primary Type**: Frontend/UI  
**Secondary Type(s)**: Accessibility, Performance, Regression Safety  
**Complexity**: M - public landing route with existing implementation, visual fidelity constraints, dynamic data and smoke/regression tests.

## Specialized Agent Assignment
**Primary Agents**:
- @dev: implementacao da Home e atualizacao da story.
- @qa: validacao visual, funcional, a11y e regressao.

**Supporting Agents**:
- @ux-design-expert: consultar apenas se houver conflito entre spec, canvas e view real.
- @architect: consultar apenas se for necessario alterar estrutura de shell/componentes ou adicionar variante nova ao design system.

## Quality Gate Tasks
- [x] Pre-Commit (@dev): lint, typecheck, unit, build, purge gate, fidelity regression, bundle check.
- [ ] QA Review (@qa): comparar captura 1180px contra referencia, validar responsivo e ler resultado de `npm run test:epic14:fidelity`.
- [ ] Pre-PR (@devops): somente apos story aprovada; push/PR sao exclusivos de @devops.

## Tasks / Subtasks
- [x] Confirmar estrutura real da rota `/`: `app/page.tsx`, `src/features/public/home/home-page.tsx`, `src/views/public/Home.tsx` e `PublicPageShell`.
- [x] Refatorar a Home para usar tokens/classes Trust Keith e componentes/padroes existentes (`Button`, `Badge`, `Chip`, `Card`, `PaperCard`, `FeatureListItem`, `StatBlock`, `Testimonial`, `SectionHeading`) quando eles atenderem a spec sem desvio visual.
- [x] Implementar Hero conforme `spec-home.md`: badge, H1, copy, CTAs, chips e card "Proximas turmas" com `next/image` para `public/images/brand/logo-horizontal.png`.
- [x] Implementar contrato de dados das proximas turmas usando a fonte atual (`useAppStore` enquanto a pagina permanecer client-side), ordenacao por data e fallback para lista vazia.
- [x] Implementar Home Sections conforme `spec-home-sections.md`: journeys, bloco consultoria, estatisticas, depoimento, CTA final e footer/rodape sem duplicacao com o shell global.
- [x] Substituir hex hardcoded em `src/views/public/Home.tsx` por tokens `--tk-*`/`--rh-*` ou classes Tailwind mapeadas para tokens.
- [x] Garantir reduced motion: nao usar `transition: transform` ou hover com translate sem protecao por media query/guard; se usar framer-motion, respeitar `MotionProvider`/`useReducedMotion`.
- [x] Garantir zero `<img>` cru em `src/`; usar `next/image` com `alt`, dimensoes e `priority` somente no logo/hero quando justificado.
- [x] Validar responsivo em mobile/tablet/desktop e corrigir overflow, colisao de texto ou CTA quebrado.
- [x] Executar verificacoes e registrar evidencias no Dev Agent Record.

## Dev Notes

### Sources
- Epic: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md#fase-2-paginas-publicas-com-fidelidade-total`
- Home spec: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-home.md`
- Home sections spec: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-home-sections.md`
- ADR: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/architecture/adr-014-redesign-trust-keith.md`
- Frontend architecture: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/architecture/frontend-feature-first-architecture.md`
- Tokens: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/design-tokens/tokens.css`
- Current page: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Home.tsx`
- Route shim: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/features/public/home/home-page.tsx`
- Route entry: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/app/page.tsx`
- Public shell: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/features/public-shell/`
- Regression tests: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/epic5-search-motion.spec.ts`, `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/epic14-mantine-removal.smoke.spec.ts`

### Current State Observed by @sm
- `src/features/public/home/home-page.tsx` currently re-exports `HomePage` from `src/views/public/Home.tsx`.
- `src/views/public/Home.tsx` already contains the rough Home structure from the specs, but relies heavily on hardcoded hex values and custom markup instead of consistently using the Trust Keith token/component layer.
- `PublicHeader` and `PublicFooter` already exist in `src/features/public-shell/components/`; avoid producing duplicate global navigation or duplicate footer unless the shell architecture requires it.
- Code intelligence duplicate detection was skipped because `.aiox-core/core/code-intel.isCodeIntelAvailable()` returned `false`.
- ClickUp sync was skipped because no ClickUp MCP tool was exposed in this Codex session.

### Technical Constraints
- Do not modify `.aiox-core/`.
- Do not run `git push`, create PRs, releases or tags; these are exclusive to @devops.
- Do not add UI dependencies. Existing stack: Next.js 16, Tailwind 3, Radix UI, cva, lucide-react, framer-motion, sonner, zod, Storybook, Playwright, Vitest.
- Do not reintroduce `@mantine/*` or `@emotion/react`; keep `npm run purge:gate` green.
- Keep Cloudflare Worker bundle under the Free plan limit validated by `npm run bundle:check`.
- Use absolute imports with `@/` for new imports.

### Fidelity Details to Preserve
- Hero background uses `--rh-hero-bg`/`#F3F0E8` token equivalent, not a raw hardcoded page color.
- Hero H1 copy: "Conhecimento tecnico que sua equipe aplica no mesmo dia." with "aplica no mesmo dia" italic and brand color.
- Hero CTAs: "Ver agenda de cursos ->" and "Solicitar proposta in company".
- Hero chips: "80 cursos · 6 trilhas" and "Presencial e online".
- Hero card label: "Proximas turmas"; logo uses official horizontal asset.
- Journeys cards: Cursos abertos, Cursos in-company, Consultoria.
- Consultoria block: "A norma aplicada ao seu contexto", feature list and "Como funciona" 3-step card.
- Stats: `+15 anos`, `+320`, `96%`, `+80`.
- Testimonial: Mariana Alves, Coordenadora de Compras, Prefeitura Municipal.
- Final CTA: "Pronto para capacitar a sua equipe?" and "Fale com um especialista ->".

### Project Structure Notes
- Architecture target says route files stay in `app/` and feature pages live under `src/features/`; existing Home currently uses a feature shim that re-exports the legacy view. This story may either keep the shim and update `src/views/public/Home.tsx`, or move implementation into `src/features/public/home/` with a compatibility re-export, as long as imports remain stable.
- `docs/design/redesign/spec-home-sections.md` includes a Footer section from the canvas, while the real app uses `PublicPageShell`. Resolve this without duplicating footer UI; document the chosen adaptation in the story completion notes.

## Testing
Required commands before moving out of Draft/InProgress:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run purge:gate
npm run test:epic14:fidelity
npm run test:epic14:fidelity:capture
npm run bundle:check
```

Manual/visual checks:
- Desktop 1180px screenshot of `/` compared with Home + Home Sections reference.
- Mobile viewport around 390px: no horizontal overflow, CTA/button text fits, hero card remains readable.
- Tablet viewport around 768-820px: hero and consultoria grids stack correctly.
- Reduced motion context: no inline transform/opacity animation offenders.

## File List
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-04-epic14-story2-1-home-fidelidade-total.md`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Home.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/features/public-shell/components/public-footer.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/home-route.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/home-canvas-1.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/home-canvas-2.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/courses-canvas.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/agenda-canvas.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/in-company-canvas.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/about-canvas.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/blog-canvas.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/manifest.json`

## Dev Agent Record

### Debug Log References
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test:unit` ✅
- `npm run build` ✅
- `npm run purge:gate` ✅
- `npm run bundle:check` ✅
- `npm run test:epic14:fidelity` ✅
- `npm run test:epic14:fidelity:capture` ✅ via servidor local persistente (`node scripts/start-test-server.mjs`) devido `ERR_CONNECTION_REFUSED` no fluxo direto do script.

### Completion Notes
- Home `/` refatorada para usar `Badge`, `Button`, `Card`, `Chip`, `SectionHeading`, `FeatureListItem`, `StatBlock` e `Testimonial`, reduzindo markup bespoke e removendo cores hardcoded da view.
- Card de "Próximas turmas" continua usando dados reais do `useAppStore`, ordenados por `startDate`, com fallback explícito para lista vazia.
- Footer do canvas foi adaptado no `PublicFooter` do shell para evitar duplicação de rodapé dentro da Home, preservando a arquitetura `PublicPageShell + HomePage`.
- Os artefatos em `artifacts/epic14-fidelity/` foram atualizados para comparação visual desktop 1180px.

### Change Log
- 2026-07-04 - @sm (River) - Story criada como Draft para iniciar Fase 2 com Home (`/`) conforme Epic 14 e specs de fidelidade.
- 2026-07-04 - @dev (Dex) - Home pública refatorada para fidelidade Trust Keith com footer adaptado no shell, gates locais executados e artefatos de fidelidade regenerados.

## PO Validation
Pending @po validation.

## QA Results

### Review Date: 2026-07-04

### Reviewed By: Quinn (Test Architect)

### Documentation Alignment

- Operational quality gate risk is resolved by the approved upstream QA gate for `custom-1.1` (PASS).
- `quality_gate_tools` now includes `npm run purge:gate`, matching Acceptance Criterion 9 and the Testing command list.
- Remaining status for this story remains Draft/Pending implementation; this note resolves the tooling-list inconsistency only.

### Gate Status

Gate: GO for documentation alignment. Execution gate for this story remains pending until implementation evidence is produced.
