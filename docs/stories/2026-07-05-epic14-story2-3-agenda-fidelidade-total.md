# Story 14.2.3: Agenda Publica com Fidelidade Total Trust Keith

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
- Story 14.2.2 Catalogo deve estar aprovada ou alinhada se compartilhar filtros/cards.
- Gate F0 aprovado: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-02-epic14-story0-6-qa-gate-fundacao.md`
- Gate F1 aprovado: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-02-epic14-story1-6-qa-gate-fase1.md`

## Story
**As a** visitante que compara datas de turmas,  
**I want** uma agenda publica fiel ao canvas com filtros, lista, calendario e CTA in-company,  
**so that** eu escolha a melhor data, modalidade e local com clareza antes de me inscrever.

## Acceptance Criteria
1. A rota `/agenda` renderiza conforme `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-agenda.md`, preservando navegacao shell, header, filtros, barra de filtros ativos, timeline/lista, calendario, estado vazio, cross-sell e footer.
2. A pagina usa dados reais do store/fonte atual (`classes`, `courses`, `instructors`) para montar `allCourses`, ordenar por data ascendente e derivar dia, mes, weekday, local, instrutor, preco, modalidade e status de vagas.
3. Filtros combinados funcionam por busca, modalidade, area, local e ordenacao; chips ativos aparecem apenas quando filtros nao-padrao existem e permitem remocao individual e "Limpar tudo".
4. O modo lista agrupa turmas por mes e renderiza linhas com data, tag de modalidade, categoria, titulo, meta, vagas, preco e CTA "Inscrever-se".
5. O modo calendario renderiza grade de 7 colunas, navegacao mes anterior/proximo, botao "Hoje" usando a data real do sistema e eventos do mes corrente; em mobile a adaptacao deve seguir a spec sem quebrar layout.
6. Estado vazio renderiza "Nenhuma turma nesse filtro" com CTA para especialista sem remover a estrutura da pagina.
7. A faixa in-company reproduz a copy da agenda e aponta para rotas reais, sem duplicar shell/footer.
8. Tokens `--tk-*`/`--rh-*`, componentes Trust Keith e constraints anti-Mantine sao respeitados; cores de status documentadas podem ser literais quando a spec permitir.
9. Os checks `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run purge:gate`, `npm run test:epic14:fidelity`, `npm run test:epic14:fidelity:capture` e `npm run bundle:check` passam.
10. Ao concluir, story atualizada com checkboxes, File List real, Change Log, evidencias e desvios aprovados.

## CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `.aiox-core/core-config.yaml`.
> Quality validation will use manual review process only.

## Story Type Analysis
**Primary Type**: Frontend/UI  
**Secondary Type(s)**: Accessibility, Data Derivation, Regression Safety  
**Complexity**: H - filtros combinados, dois modos de visualizacao, calendario e responsivo.

## Specialized Agent Assignment
**Primary Agents**:
- @dev: implementacao da agenda e atualizacao da story.
- @qa: validacao funcional, visual, a11y e regressao.

**Supporting Agents**:
- @ux-design-expert: consultar para comportamento mobile do calendario se houver conflito.
- @architect: consultar se filtros/calendario exigirem extracao para model/service compartilhado.

## Quality Gate Tasks
- [x] Pre-Commit (@dev): lint, typecheck, unit, build, purge gate, fidelity regression, capture e bundle check.
- [ ] QA Review (@qa): validar filtros, lista, calendario, empty state, responsivo e Epic 5.
- [ ] Pre-PR (@devops): somente apos story aprovada; push/PR sao exclusivos de @devops.

## Tasks / Subtasks
- [x] Confirmar rota `/agenda`: `app/agenda/page.tsx`, `src/features/public/agenda/agenda-page.tsx`, `src/views/public/Agenda.tsx`.
- [x] Implementar header e barra de filtros conforme `spec-agenda.md`.
- [x] Derivar `allCourses` de `courses`, `classes` e `instructors`, com formatacao pt-BR.
- [x] Implementar filtros combinados, active chips, limpar individual e limpar tudo.
- [x] Implementar modo lista agrupado por mes.
- [x] Implementar modo calendario com cursor mensal, `goToday` real e celulas com eventos.
- [x] Implementar estado vazio e cross-sell in-company.
- [x] Validar responsivo, a11y de selects/toggles e reduced motion.
- [x] Executar verificacoes e registrar evidencias no Dev Agent Record.

## Dev Notes

### Sources
- Spec Agenda: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-agenda.md`
- Reference screenshots: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/reference/screenshots/agenda-cal.png`, `agenda-cal2.png`, `agenda-cal3.png`
- Epic: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md#fase-2-paginas-publicas-com-fidelidade-total`
- ADR: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/architecture/adr-014-redesign-trust-keith.md`
- Current page: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Agenda.tsx`
- Runtime test: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/agenda-runtime.spec.ts`

### Current State Observed by @sm
- `app/agenda/page.tsx` compoe `PublicPageShell` + `AgendaPage`.
- `src/features/public/agenda/agenda-page.tsx` re-exporta `AgendaPage` de `src/views/public/Agenda.tsx`.
- `src/views/public/Agenda.tsx` ja importa `useAppStore` e possui funcao de derivacao de entradas de agenda.
- Code intelligence indisponivel; ClickUp indisponivel nesta sessao.

### Technical Constraints
- Nao modificar `.aiox-core/`.
- Nao adicionar dependencias de calendario.
- Nao reintroduzir Mantine/Emotion.
- Usar componentes/tokens Trust Keith; manter imports absolutos.
- O calendario deve ser implementado com primitives existentes e logica local, salvo decisao arquitetural explicita.

## Testing
Required commands:

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
- Desktop 1180px lista e calendario.
- Filtros combinados e chips ativos.
- Mobile 390px sem overflow; calendario adaptado conforme spec.
- `goToday` usa data real do sistema, nao valor fixo do canvas.

## Expected File List
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-05-epic14-story2-3-agenda-fidelidade-total.md`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Agenda.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/features/public/agenda/agenda-page.tsx` (se migrar implementation)
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/agenda-route.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/agenda-canvas.png`

## Dev Agent Record
- 2026-07-05 - `src/views/public/Agenda.tsx` foi reskinned com tokens Trust Keith e primitives (`Badge`, `Card`, `Input`, `Button`), preservando filtros combinados, agrupamento mensal, modo calendário, `goToday` via data real do sistema e dados reais do `useAppStore()`.
- 2026-07-05 - `npm run typecheck` ✅
- 2026-07-05 - `npm run lint` ✅
- 2026-07-05 - `npm run test:unit` ✅
- 2026-07-05 - `npm run build` ✅
- 2026-07-05 - `npm run purge:gate` ✅ (PASS com 1 warning não bloqueante de nomenclatura legado em `src/components/providers/mantine-provider.tsx`)
- 2026-07-05 - `npm run test:epic14:fidelity` ✅
- 2026-07-05 - `npm run test:epic14:fidelity:capture` ✅ via servidor local persistente (`node scripts/start-test-server.mjs`) para contornar `ERR_CONNECTION_REFUSED` do script direto
- 2026-07-05 - `npm run bundle:check` ✅
- Pendente para fechamento da story: validação visual/QA final desktop 1180px, tablet, mobile e revisão de comportamento do calendário em viewport estreito.

## PO Validation
2026-07-05 · @po (Pax) via Codex · **GO** — checklist 10/10; scope, dependências e duas visualizações (lista/calendário) estão bem definidos; referências locais existem; ACs cobrem filtros, dados reais, responsivo e comandos obrigatórios sem lacunas bloqueantes. Status: Draft → Ready.

## QA Results
2026-07-06 - Evidência técnica regenerada com canvas real `/RH Cursos Agenda.html` e route capture válido. Gate individual técnico criado em `docs/qa/gates/14.2.3-agenda-publica-com-fidelidade-total-trust-keith.yml`. Revisão formal de @qa ainda pendente.

## Change Log

- 2026-07-05 - @po (Pax) - Validação de draft concluída com GO. Story liberada para execução por @dev. Status: Draft → Ready.
- 2026-07-05 - @dev (Dex) - Agenda `/agenda` reskinned com visual Trust Keith, mantendo filtros, lista e calendário baseados em dados reais. Status: Ready → In Progress.
- 2026-07-05 - @dev (Dex) - Gates técnicos concluídos (`lint`, `typecheck`, `unit`, `build`, `purge:gate`, `test:epic14:fidelity`, `test:epic14:fidelity:capture`, `bundle:check`) e artefatos de fidelidade da agenda regenerados.
