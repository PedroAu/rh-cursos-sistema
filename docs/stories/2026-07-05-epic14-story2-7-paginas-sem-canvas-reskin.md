# Story 14.2.7: Paginas Sem Canvas com Coerencia Trust Keith

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
- Stories 14.2.1-14.2.6 devem estar concluidas ou seus padroes visuais devem estar estaveis.
- Gates F0/F1 aprovados.
- Esta story cobre paginas sem canvas principal ou com spec mid/hi-fi complementar.

## Story
**As a** visitante ou usuario em fluxos publicos auxiliares,  
**I want** Login, Contato, Detalhe do Curso, Sucesso de Inscricao, Consultoria e Falar com Especialista coerentes com Trust Keith,  
**so that** os fluxos de autenticacao, contato, conversao e pos-inscricao nao parecam fora do redesign da Fase 2.

## Acceptance Criteria
1. `/login` renderiza conforme `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-login.md`, preservando painel visual desktop, card de login, seletor de perfil, status `required`, erros e redirect seguro.
2. `/contato` renderiza conforme `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-contato.md`, com hero, canais diretos, mapa ilustrativo, formulario validado, sucesso/erro inline e lead `type/origin` corretos.
3. `/cursos/[slug]` renderiza conforme `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-course-detail.md`, com breadcrumb, hero comercial, objetivos, decisao rapida, publico-alvo, conteudo programatico, sidebar, proximas turmas, instrutor/FAQ, depoimentos e checkout modal.
4. `/inscricao-confirmada` renderiza conforme `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-enrollment-success.md`, usando prioridade de estado query string -> navigation state -> session storage -> ultimo enrollment do store e fallback generico.
5. `/consultoria` e `/falar-com-especialista` renderizam conforme `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-consultoria-especialista.md`, preservando variacao `leadOrigin = "Consultoria"` vs `"Especialista"` sem duplicar estrutura visual.
6. Todos os formularios mantem validacao, mensagens acessiveis, submit sem perda indevida de dados, feedback inline/toast quando ja existente e criacao de leads/sessao conforme contratos atuais.
7. Todas as paginas usam tokens `--tk-*`/`--rh-*`, componentes Trust Keith e shell publico real; nao reintroduzir Mantine/Emotion nem criar footer/header duplicado.
8. Responsivo e a11y: desktop/tablet/mobile sem overflow; login oculta painel lateral em mobile; course detail/consultoria colapsam grids; foco e teclado funcionam nos formularios/modais.
9. Os checks obrigatorios passam: lint, typecheck, unit, build, purge gate, fidelity, capture, e2e smoke publico aplicavel e bundle check.
10. Ao concluir, story atualizada com checkboxes, File List real, Change Log, evidencias de testes e qualquer decisao pendente como `Programa PDF` ou rota final de atendimento.

## CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `.aiox-core/core-config.yaml`.
> Quality validation will use manual review process only.

## Story Type Analysis
**Primary Type**: Frontend/UI  
**Secondary Type(s)**: Forms, Auth, Checkout, Routing, Accessibility, Regression Safety  
**Complexity**: H - multiplas rotas auxiliares, formularios, auth, checkout modal e estados de fallback.

## Specialized Agent Assignment
**Primary Agents**:
- @dev: implementacao das paginas e atualizacao da story.
- @qa: validacao funcional, a11y, auth/form/checkout, responsivo e regressao.

**Supporting Agents**:
- @ux-design-expert: consultar quando uma pagina mid-fi precisar decisao visual.
- @architect: consultar para auth, checkout modal, data loading ou rotas.

## Quality Gate Tasks
- [x] Pre-Commit (@dev): lint, typecheck, unit, build, purge gate, fidelity regression, capture e bundle check.
- [ ] QA Review (@qa): validar rotas, formularios, auth, checkout, empty states, mobile e e2e smoke aplicavel.
- [ ] Pre-PR (@devops): somente apos story aprovada; push/PR sao exclusivos de @devops.

## Tasks / Subtasks
- [x] Confirmar rotas: `/login`, `/contato`, `/cursos/[slug]`, `/inscricao-confirmada`, `/consultoria`, `/falar-com-especialista`.
- [x] Re-skin `/login` preservando `POST /api/auth/session`, perfil selecionado, `next` permitido e store session.
- [x] Re-skin `/contato` preservando validacao zod/react-hook-form, lead `Contato`, toast e feedback inline.
- [x] Re-skin `/cursos/[slug]` preservando dados server/client, checkout modal, turmas, instrutor e depoimentos.
- [x] Re-skin `/inscricao-confirmada` preservando prioridade de origem de estado e fallbacks.
- [x] Re-skin `/consultoria` e `/falar-com-especialista` preservando `leadOrigin`, copy variavel e lead `Consultoria`.
- [x] Atualizar testes quando labels/copy mudarem, sem enfraquecer cobertura.
- [x] Validar tokens, a11y, reduced motion, raw image gate e responsivo.
- [x] Executar verificacoes e registrar evidencias.

## Dev Notes

### Sources
- Spec Login: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-login.md`
- Spec Contato: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-contato.md`
- Spec Course Detail: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-course-detail.md`
- Spec Enrollment Success: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-enrollment-success.md`
- Spec Consultoria/Especialista: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-consultoria-especialista.md`
- Epic: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md#fase-2-paginas-publicas-com-fidelidade-total`
- Route files: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/app/login/page.tsx`, `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/app/contato/page.tsx`, `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/app/cursos/[slug]/page.tsx`, `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/app/inscricao-confirmada/page.tsx`, `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/app/consultoria/page.tsx`, `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/app/falar-com-especialista/page.tsx`
- Current views: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Login.tsx`, `Contact.tsx`, `CourseDetail.tsx`, `EnrollmentSuccess.tsx`, `SpecialistContact.tsx`
- Tests: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/login-errors.spec.ts`, `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/checkout.e2e.spec.ts`, `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/public-journeys.spec.ts`, `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/quote-modal.e2e.spec.ts`, `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/epic14-mantine-removal.smoke.spec.ts`

### Current State Observed by @sm
- `/login`, `/contato`, `/inscricao-confirmada`, `/consultoria` e `/falar-com-especialista` usam `PublicPageShell`.
- `/cursos/[slug]` e rota server que carrega catalogo e injeta dados em `CourseDetailClient`.
- `src/features/public/*` ainda sao shims que re-exportam `src/views/public/*`.
- `Login.tsx` usa `setSession`; `Contact.tsx`, `InCompany.tsx`, `Blog.tsx` e `SpecialistContact.tsx` usam `createLead`; `CourseDetail.tsx` usa courses/classes/instructors/testimonials; `EnrollmentSuccess.tsx` usa courses/classes/enrollments.
- Code intelligence e ClickUp indisponiveis nesta sessao.

### Technical Constraints
- Nao adicionar dependencias de UI, auth ou checkout.
- Nao modificar `.aiox-core/`.
- Nao reintroduzir Mantine/Emotion.
- Nao enfraquecer seguranca de `next` redirect no login.
- `Programa PDF` em course detail ainda esta sem fluxo operacional explicito; implementar fallback/documentar decisao em Completion Notes.
- `Falar com atendimento` em enrollment success aponta hoje para rota a validar; documentar rota final usada.

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
npm run test:e2e:smoke
npm run bundle:check
```

Manual/visual checks:
- `/login?next=/admin`, troca de perfil e erro de credencial.
- `/contato`, validacao de email/mensagem, sucesso e erro.
- `/cursos/[slug]`, modal checkout via CTA e `?checkout=1`.
- `/inscricao-confirmada` com e sem dados suficientes.
- `/consultoria` e `/falar-com-especialista` com copy variavel por origem.

## Expected File List
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-05-epic14-story2-7-paginas-sem-canvas-reskin.md`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/CourseDetail.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Courses.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Agenda.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/InCompany.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/lib/rate-limit.ts`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/agenda-runtime.spec.ts`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/public-journeys.spec.ts`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/tests/ui-governance.spec.ts-snapshots/courses-filters-governance-functional-darwin.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/`

## Dev Agent Record
- 2026-07-06 - Rotas auxiliares da Fase 2 foram validadas contra as specs de `/login`, `/contato`, `/cursos/[slug]`, `/inscricao-confirmada`, `/consultoria` e `/falar-com-especialista`; a shell publica e os contratos de auth/lead/checkout permaneceram intactos.
- 2026-07-06 - `src/views/public/CourseDetail.tsx` recebeu fechamento operacional do CTA `Programa PDF` com fallback explícito para atendimento especializado, ordenação estável de turmas e empty state consultivo quando não houver agenda aberta.
- 2026-07-06 - O gate agregado da Fase 2 exigiu correções complementares fora da view principal da story: contraste acessível em `/cursos` e `/agenda`, rotulagem do consentimento em `/in-company`, estabilização do teste de navegação para `/agenda`, contrato de rate limit em `src/lib/rate-limit.ts` e atualização do snapshot do painel de filtros do catálogo.
- 2026-07-06 - `npm run lint` ✅
- 2026-07-06 - `npm run typecheck` ✅
- 2026-07-06 - `npm run test:unit` ✅
- 2026-07-06 - `npm run build` ✅
- 2026-07-06 - `npm run purge:gate` ✅ (PASS com 1 warning não bloqueante de nomenclatura legado em `src/components/providers/mantine-provider.tsx`)
- 2026-07-06 - `npm run bundle:check` ✅
- 2026-07-06 - `npm run test:e2e:smoke` ✅
- 2026-07-06 - `npm run test:epic14:fidelity` ✅
- 2026-07-06 - `npm run test:epic14:fidelity:capture` ✅ via servidor local persistente (`node scripts/start-test-server.mjs`)
- Completion Notes:
- `Programa PDF`: o CTA do detalhe do curso agora registra analytics e encaminha explicitamente para `/falar-com-especialista` quando o material precisa ser solicitado ao atendimento.
- `Falar com atendimento` no sucesso da inscrição: a rota final mantida é `/falar-com-especialista`, coerente com a jornada consultiva já usada no shell público.
- Pendente para fechamento da story: validação visual/QA final das rotas auxiliares e aceite formal do @qa.

## PO Validation
2026-07-05 · @po (Pax) via Codex · **GO com observações** — checklist 10/10; story cobre adequadamente o pacote de rotas auxiliares, contratos atuais de auth/lead/checkout e comandos de verificação. Observações não bloqueantes já estão embutidas na própria story: decisão final de `Programa PDF` e rota de atendimento em enrollment success devem ser registradas em completion notes ao implementar. Status: Draft → Ready.

## QA Results
2026-07-06 - O blocker de evidência visual foi corrigido em `scripts/capture-epic14-fidelity.mjs`: o script agora usa apenas assets reais em `public/`, falha em HTTP 4xx/5xx e declara explicitamente quando uma rota não possui canvas de referência. Gate individual técnico criado em `docs/qa/gates/14.2.7-paginas-sem-canvas-com-coerencia-trust-keith.yml`. Revisão formal de @qa ainda pendente.

## Change Log

- 2026-07-05 - @po (Pax) - Validação de draft concluída com GO. Story liberada para execução por @dev. Status: Draft → Ready.
- 2026-07-06 - @dev (Dex) - Story 14.2.7 entrou em implementação documental com fechamento do detalhe de curso, fallback operacional de `Programa PDF`, smoke agregado da Fase 2 restabelecido e artefatos de fidelity regenerados. Status: Ready → In Progress.
