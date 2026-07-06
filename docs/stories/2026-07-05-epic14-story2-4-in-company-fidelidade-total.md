# Story 14.2.4: In-company Publica com Fidelidade Total Trust Keith

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
- Gates F0/F1 aprovados.
- Stories 14.2.1-14.2.3 nao precisam estar implementadas para iniciar, mas componentes e shell devem permanecer consistentes.

## Story
**As a** decisor que precisa treinar uma equipe fechada,  
**I want** uma pagina in-company fiel ao canvas com narrativa, beneficios, temas, prova social e formulario de lead,  
**so that** eu consiga solicitar uma proposta contextualizada com baixa friccao e confianca visual.

## Acceptance Criteria
1. A rota `/in-company` renderiza conforme `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-in-company.md`, preservando a ordem: navegacao shell, hero, confianca/logos, beneficios, passos, temas/depoimento, estatisticas, formulario e footer.
2. Hero, card "Por que in-company", chips e CTAs usam copy e hierarquia visual da spec, com CTA principal apontando para o formulario/proposta e CTA secundario para catalogo quando houver rota/asset definido.
3. A faixa de confianca usa wordmarks tipograficos placeholder conforme spec, sem introduzir logos de terceiros nao aprovados.
4. Beneficios, passos, temas, depoimento e estatisticas reproduzem a copy documentada e usam componentes Trust Keith quando aplicavel.
5. O formulario de lead renderiza campos, validacoes, estado enviado e consentimento conforme spec; submit cria lead via fonte atual (`createLead`) preservando origem/tipo de in-company.
6. Erros de validacao sao visiveis, associados aos campos e nao apagam dados preenchidos; sucesso exibe confirmacao inline.
7. Responsivo: hero 2 colunas no desktop, colapso adequado em tablet/mobile, formulario 2 colunas no desktop e 1 coluna no mobile, sem overflow.
8. Tokens `--tk-*`/`--rh-*`, componentes Trust Keith, anti-Mantine e reduced motion sao respeitados.
9. Os checks obrigatorios passam: lint, typecheck, unit, build, purge gate, fidelity, capture e bundle check.
10. Ao concluir, story atualizada com checkboxes, File List real, Change Log, evidencias de testes e desvios aprovados.

## CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `.aiox-core/core-config.yaml`.
> Quality validation will use manual review process only.

## Story Type Analysis
**Primary Type**: Frontend/UI  
**Secondary Type(s)**: Forms, Accessibility, Lead Capture, Regression Safety  
**Complexity**: H - pagina longa com formulario, estados, validação e varias secoes.

## Specialized Agent Assignment
**Primary Agents**:
- @dev: implementacao da pagina e atualizacao da story.
- @qa: validacao visual, formulario, a11y e regressao.

**Supporting Agents**:
- @ux-design-expert: consultar para divergencia de wordmarks/logos ou copy.
- @architect: consultar se fluxo de lead exigir mudanca em store/API.

## Quality Gate Tasks
- [x] Pre-Commit (@dev): lint, typecheck, unit, build, purge gate, fidelity regression, capture e bundle check.
- [ ] QA Review (@qa): validar formulario, sucesso/erro, responsivo, visual 1180px e smoke.
- [ ] Pre-PR (@devops): somente apos story aprovada; push/PR sao exclusivos de @devops.

## Tasks / Subtasks
- [x] Confirmar rota `/in-company`: `app/in-company/page.tsx`, `src/features/public/in-company/in-company-page.tsx`, `src/views/public/InCompany.tsx`.
- [x] Implementar hero, chips e card "Por que in-company".
- [x] Implementar faixa de confianca, beneficios, passos, temas, depoimento e estatisticas.
- [x] Implementar formulario com validacao, submit via `createLead`, estado enviado e mensagens acessiveis.
- [x] Ajustar copy/labels para manter compatibilidade com testes existentes ou atualizar testes conforme a nova spec.
- [x] Garantir tokens, componentes, a11y, reduced motion e responsivo.
- [x] Executar verificacoes e registrar evidencias.

## Dev Notes

### Sources
- Spec In-company: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-in-company.md`
- Epic: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md#fase-2-paginas-publicas-com-fidelidade-total`
- ADR: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/architecture/adr-014-redesign-trust-keith.md`
- Types: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/types/index.ts`
- Store: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/lib/app-store.tsx`
- Current page: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/InCompany.tsx`
- Smoke test: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/epic14-mantine-removal.smoke.spec.ts`

### Current State Observed by @sm
- `app/in-company/page.tsx` compoe `PublicPageShell` + `InCompanyPage`.
- `src/features/public/in-company/in-company-page.tsx` re-exporta `InCompanyPage` de `src/views/public/InCompany.tsx`.
- `src/views/public/InCompany.tsx` ja usa `useAppStore` e `createLead`.
- O smoke atual cobre submit in-company; se labels/copy forem ajustados para a spec, testes devem acompanhar o contrato atualizado.
- Code intelligence e ClickUp indisponiveis nesta sessao.

### Technical Constraints
- Nao adicionar dependencias.
- Nao usar logos reais de clientes sem aprovacao.
- Nao recriar Mantine/Emotion.
- Preservar `createLead` e tipos `LeadType`/`LeadOrigin` existentes.
- Inputs devem ter labels associados e estados de erro acessiveis.

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
- Desktop 1180px da pagina completa.
- Submit com dados validos exibe confirmacao inline.
- Email invalido/campos obrigatorios exibem erro sem perder dados.
- Mobile 390px com formulario em 1 coluna e CTAs acessiveis.

## Expected File List
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-05-epic14-story2-4-in-company-fidelidade-total.md`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/InCompany.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/epic14-mantine-removal.smoke.spec.ts` (se labels/copy mudarem)
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/in-company-route.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/in-company-canvas.png`

## Dev Agent Record
- 2026-07-05 - `src/views/public/InCompany.tsx` foi alinhado ao contrato da spec com área de interesse por select, tamanho da equipe por select, consentimento explícito e submit preservando `createLead`.
- 2026-07-05 - `tests/epic14-mantine-removal.smoke.spec.ts` foi atualizado para o novo contrato do formulário e para a mensagem de sucesso inline atual.
- 2026-07-05 - `npm run typecheck` ✅
- 2026-07-05 - `npm run lint` ✅
- 2026-07-05 - `npm run test:unit` ✅
- 2026-07-05 - `npm run build` ✅
- 2026-07-05 - `npm run purge:gate` ✅ (PASS com 1 warning não bloqueante de nomenclatura legado em `src/components/providers/mantine-provider.tsx`)
- 2026-07-05 - `npm run test:epic14:fidelity` ✅
- 2026-07-05 - `npm run test:epic14:fidelity:capture` ✅ via servidor local persistente (`node scripts/start-test-server.mjs`) para contornar a limitação operacional do script
- 2026-07-05 - `npm run bundle:check` ✅
- Pendente para fechamento da story: validação visual/QA final desktop 1180px e mobile com revisão do formulário e wordmarks placeholder.

## PO Validation
2026-07-05 · @po (Pax) via Codex · **GO** — checklist 10/10; story está autossuficiente para implementação, com paths reais, fonte de lead existente (`createLead`), ACs testáveis e restrições claras sobre logos, acessibilidade e anti-Mantine. Status: Draft → Ready.

## QA Results
Pending @qa review.

## Change Log

- 2026-07-05 - @po (Pax) - Validação de draft concluída com GO. Story liberada para execução por @dev. Status: Draft → Ready.
- 2026-07-05 - @dev (Dex) - In-company entrou em implementação com formulário atualizado para a spec Trust Keith, incluindo selects semânticos e consentimento explícito. Status: Ready → In Progress.
- 2026-07-05 - @dev (Dex) - Gates técnicos concluídos (`lint`, `typecheck`, `unit`, `build`, `purge:gate`, `test:epic14:fidelity`, `test:epic14:fidelity:capture`, `bundle:check`) e artefatos de fidelidade do in-company regenerados.
