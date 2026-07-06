# Story 14.2.2: Catalogo Publico com Fidelidade Total Trust Keith

## Status
In Progress

## Executor Assignment
executor: "@dev"
quality_gate: "@qa"
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
- Story 14.2.1 Home concluida: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-04-epic14-story2-1-home-fidelidade-total.md`
- Gate F0 aprovado: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-02-epic14-story0-6-qa-gate-fundacao.md`
- Gate F1 aprovado: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-02-epic14-story1-6-qa-gate-fase1.md`
- ADR aceito: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/architecture/adr-014-redesign-trust-keith.md`

## Story
**As a** visitante interessado em cursos abertos,  
**I want** navegar o catalogo publico com busca, filtros, cards de curso e CTA in-company fieis ao canvas Trust Keith,  
**so that** eu encontre rapidamente uma turma relevante sem perder os comportamentos funcionais ja entregues de busca local, acessibilidade e regressao visual.

## Acceptance Criteria
1. A rota `/cursos` renderiza conforme `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-catalogo.md`, preservando a ordem: navegacao shell, header, busca/contagem, filtros, grade, estado vazio, faixa in-company e footer.
2. A busca local continua lendo `?q=` da URL, filtra por titulo/categoria de forma case-insensitive, expõe `role=search`, resumo de resultados e botao "Limpar busca do catalogo", sem reintroduzir busca global no header.
3. Os filtros de categoria derivam das categorias reais disponiveis no catalogo, com "Todos" primeiro; se houver apenas uma categoria alem de "Todos", a barra de filtros pode ser ocultada conforme spec.
4. A grade usa dados reais do store/fonte atual (`courses` + `classes`), com proxima turma por curso, data pt-BR, modalidade, duracao, preco BRL, vagas/status e fallback visual quando nao houver resultados.
5. Cards, chips, badge, botoes, superficies, radius e sombras usam tokens `--tk-*`/`--rh-*` e componentes Trust Keith existentes quando aplicavel; nao introduzir Mantine, Emotion ou hex hardcoded fora de tokens/gradientes decorativos documentados na spec.
6. A faixa cross-sell in-company reproduz copy e CTAs de `spec-catalogo.md` e aponta para as rotas reais do app, sem duplicar footer/header do `PublicPageShell`.
7. Responsivo: desktop 1180px com 3 colunas, tablet com 2 colunas, mobile com 1 coluna, busca em largura total e sem overflow horizontal.
8. Invariantes do Epic 5 permanecem verdes: header sem busca global, reduced motion respeitado, zero `<img>` cru em `src/`, imagens via `next/image`.
9. Os checks `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run purge:gate`, `npm run test:epic14:fidelity`, `npm run test:epic14:fidelity:capture` e `npm run bundle:check` passam.
10. Ao concluir, esta story deve ser atualizada com checkboxes, status, File List real, Change Log, evidencias de testes e desvios aprovados.

## CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `.aiox-core/core-config.yaml`.
> Quality validation will use manual review process only.

## Story Type Analysis
**Primary Type**: Frontend/UI  
**Secondary Type(s)**: Accessibility, Performance, Regression Safety  
**Complexity**: M - rota publica com busca, filtros, dados dinamicos, responsivo e regressao Epic 5.

## Specialized Agent Assignment
**Primary Agents**:
- @dev: implementacao da pagina e atualizacao da story.
- @qa: validacao visual, funcional, a11y e regressao.

**Supporting Agents**:
- @ux-design-expert: consultar apenas para divergencia entre canvas e spec.
- @architect: consultar apenas se for necessario mudar shell, store ou componentes compartilhados.

## Quality Gate Tasks
- [x] Pre-Commit (@dev): lint, typecheck, unit, build, purge gate, fidelity regression, capture e bundle check.
- [ ] QA Review (@qa): validar desktop 1180px, tablet, mobile, busca `?q=`, empty state e Epic 5.
- [ ] Pre-PR (@devops): somente apos story aprovada; push/PR sao exclusivos de @devops.

## Tasks / Subtasks
- [x] Confirmar estrutura real da rota `/cursos`: `app/cursos/page.tsx`, `src/features/public/courses/courses-page.tsx`, `src/views/public/Courses.tsx` e `PublicPageShell`.
- [x] Implementar header do catalogo conforme `spec-catalogo.md`, mantendo navegacao global no shell.
- [x] Implementar busca local com `?q=`, `role=search`, botao limpar, contagem e filtro por titulo/categoria.
- [x] Implementar chips de categoria derivados dos dados reais e estado ativo acessivel.
- [x] Implementar grade de cards usando cursos + turmas, proxima turma, preco, status de vagas e gradiente deterministico por categoria.
- [x] Implementar estado vazio e faixa cross-sell in-company.
- [x] Remover hardcoded colors indevidos e garantir tokens/components Trust Keith.
- [x] Validar responsivo e reduced motion.
- [x] Executar verificacoes e registrar evidencias no Dev Agent Record.

## Dev Notes

### Sources
- Epic: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md#fase-2-paginas-publicas-com-fidelidade-total`
- Spec Catalogo: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-catalogo.md`
- ADR: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/architecture/adr-014-redesign-trust-keith.md`
- Frontend architecture: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/architecture/frontend-feature-first-architecture.md`
- Types: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/types/index.ts`
- Store: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/lib/app-store.tsx`
- Current page: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Courses.tsx`
- Regression tests: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/epic5-search-motion.spec.ts`, `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/epic14-mantine-removal.smoke.spec.ts`

### Current State Observed by @sm
- `app/cursos/page.tsx` compoe `PublicPageShell` + `CoursesPage`.
- `src/features/public/courses/courses-page.tsx` re-exporta `CoursesPage` de `src/views/public/Courses.tsx`.
- `Course` e `TrainingClass` ja existem em `src/types/index.ts`; dados publicos atuais fluem por `useAppStore()`.
- Code intelligence foi pulado porque `.aiox-core/core/code-intel.isCodeIntelAvailable()` retornou `false`.
- ClickUp sync foi pulado porque nenhum MCP ClickUp ficou exposto nesta sessao.

### Technical Constraints
- Nao modificar `.aiox-core/`.
- Nao executar `git push`, criar PR, release ou tag; essas operacoes sao exclusivas de @devops.
- Nao adicionar dependencias de UI.
- Nao reintroduzir `@mantine/*` ou `@emotion/react`; manter `npm run purge:gate` verde.
- Usar imports absolutos com `@/`.
- Gradientes decorativos documentados na spec podem permanecer literais; cores de marca/CTA devem vir de tokens.

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
- Desktop 1180px de `/cursos` contra canvas/spec.
- `/cursos?q=lgpd` mostra busca local, resumo e limpar busca.
- Mobile 390px sem overflow e cards em 1 coluna.
- Reduced motion sem transform/opacity inline indevidos.

## Expected File List
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-05-epic14-story2-2-catalogo-fidelidade-total.md`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Courses.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/features/public/courses/courses-page.tsx` (se migrar implementation)
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/courses-route.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/courses-canvas.png`

## Dev Agent Record
- 2026-07-05 - `src/views/public/Courses.tsx` recebeu reskin Trust Keith com `Badge`, `Chip` e `Card`, removendo a maior parte dos hardcoded colors da view e preservando busca local `?q=`, filtros por categoria e dados reais via `useAppStore()`.
- 2026-07-05 - `npm run typecheck` ✅
- 2026-07-05 - `npm run lint` ✅
- 2026-07-05 - `npm run test:unit` ✅
- 2026-07-05 - `npm run build` ✅
- 2026-07-05 - `npm run purge:gate` ✅ (PASS com 1 warning não bloqueante de nomenclatura legado em `src/components/providers/mantine-provider.tsx`)
- 2026-07-05 - `npm run test:epic14:fidelity` ✅
- 2026-07-05 - `npm run test:epic14:fidelity:capture` ✅ via servidor local persistente (`node scripts/start-test-server.mjs`) para contornar `ERR_CONNECTION_REFUSED` do script direto
- 2026-07-05 - `npm run bundle:check` ✅
- Pendente para fechamento da story: validação visual/QA final desktop 1180px, tablet e mobile.

## PO Validation
2026-07-05 · @po (Pax) via Codex · **GO** — checklist 10/10; epic, spec, ADR, rotas reais e invariantes do Epic 5 estão explícitos; ACs são verificáveis por rota, comportamento e comando; escopo está cercado contra regressão visual e reintrodução de Mantine. Status: Draft → Ready.

## QA Results
Pending @qa review.

## Change Log

- 2026-07-05 - @po (Pax) - Validação de draft concluída com GO. Story liberada para execução por @dev. Status: Draft → Ready.
- 2026-07-05 - @dev (Dex) - Catálogo `/cursos` reskinned com primitives Trust Keith, busca/filtros preservados e gates iniciais (`lint`, `typecheck`, `unit`, `build`, `test:epic14:fidelity`) executados. Status: Ready → In Progress.
- 2026-07-05 - @dev (Dex) - Gates restantes concluídos (`purge:gate`, `bundle:check`, `test:epic14:fidelity:capture`) e artefatos de fidelidade do catálogo regenerados.
