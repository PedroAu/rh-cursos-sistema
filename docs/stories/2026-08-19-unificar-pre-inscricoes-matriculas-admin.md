# Story: Unificar pré-inscrições e matrículas na área administrativa

## Status

Ready for Review

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - vitest
  - playwright
  - lint
  - typecheck
  - build
  - accessibility-review
  - api-contract-diff
assignment_basis: "executor-assignment: frontend_ui_without_api_or_data_changes"
```

## Tracking

> ⚠️ **ClickUp não sincronizado:** a integração ClickUp não está disponível nesta sessão. Conforme a regra do workflow, esta story foi criada localmente sem bloquear a preparação.

## Story

**As a** pessoa responsável pela operação administrativa da RH Cursos,
**I want** consultar pré-inscrições e matrículas em uma única experiência na rota `/admin/inscricoes`,
**so that** eu entenda imediatamente o estágio e o tipo de cada registro sem alternar entre nomes ou áreas ambíguas.

## Contexto

- O merge `9c9d924` consolidou o estado recente do admin, mas a experiência ainda apresenta nomenclaturas diferentes para o mesmo fluxo: a navegação usa “Inscrições” e a configuração da página usa “Matrículas”.
- O fluxo deve permanecer na rota canônica existente `/admin/inscricoes`; esta story não cria uma segunda rota e não migra registros.
- A REC-303 (`Done`) fornece o read model server-side de inscrições, com hidratação após reload, paginação/filtros e autorização administrativa. A UI deve continuar consumindo esse contrato sem duplicá-lo ou contorná-lo.
- O run de produção `32285049727` teve o deploy de frontend pulado. A publicação desta mudança não deve ser presumida a partir do merge: após a integração, `@devops` deve avaliar o run automático e, se o workflow não promover o frontend, executar o `workflow_dispatch` posterior do pipeline canônico antes da validação em produção.
- A correção é de apresentação e organização visual. API, read model, banco, dados existentes, permissões, autenticação e regras de negócio estão fora do escopo.

## Acceptance Criteria

1. **Rótulo único e rota preservada:** ao abrir `/admin/inscricoes`, o título principal da página, o item correspondente da navegação administrativa e o título usado em mobile exibem exatamente `Pré-inscrições e matrículas`; não existe uma nova entrada de navegação ou rota paralela para “Matrículas”.
2. **Distinção por status:** cada registro exibido na lista mantém um status textual visível e acessível, não dependendo apenas de cor ou ícone, com suporte aos valores de domínio existentes: `Pendente`, `Aguardando pagamento`, `Confirmada`, `Cancelada` e `Concluída`. O status não é renomeado nem convertido para um valor inventado.
3. **Distinção por tipo:** cada registro permite identificar visualmente o tipo de inscrição (`Pessoa física`, `Empresa` ou `Órgão público`) na tabela ou no detalhe acessível a partir da própria linha, sem exigir abertura de uma área administrativa diferente.
4. **Leitura após reload:** com a resposta atual do read model da REC-303, um reload completo de `/admin/inscricoes` renderiza os registros retornados pela API e mantém as distinções de status e tipo; a UI não depende apenas de estado otimista, mock local ou dados persistidos no browser.
5. **Unificação sem perda operacional:** as ações já disponíveis na rota — visualizar/editar, atualizar status, criar quando permitido, excluir quando permitido e exportar — continuam apontando para os mesmos handlers e contratos, sem mudança de semântica ou de permissões.
6. **Sem alteração de contrato ou segurança:** o diff da story não modifica rotas em `app/api/admin/**`, `src/lib/supabase/admin-read-models.ts`, migrations, RLS, tabelas, seeds, dados de produção, guards de autorização ou configuração de sessão. Testes de contrato confirmam que a requisição e a resposta do endpoint administrativo permanecem compatíveis.
7. **Consistência visual e acessível:** badges, filtros/legenda (se usados) e campos de detalhe usam texto em português consistente, contraste adequado e nome acessível que inclui o valor do status/tipo; a distinção permanece compreensível em viewport móvel e desktop.
8. **Regressão administrativa controlada:** testes unitários/componentes e E2E cobrem a rota, o rótulo único, todos os status e tipos representativos, reload e preservação das ações existentes; `npm run lint`, `npm run typecheck`, `npm run build` e a suíte de testes aplicável passam sem regressão.
9. **Handoff de produção explícito:** a story registra no handoff para `@devops` o SHA final e o resultado do run automático. Se a detecção de escopo deixar `frontend=false` ou pular `deploy-frontend`, a promoção posterior deve usar `workflow_dispatch` de `.github/workflows/production-pipeline.yml`, preservando a ordem CI → migrations convergentes → functions → frontend; nenhuma validação de produção é considerada concluída apenas pelo merge.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI não está habilitado em `.aiox-core/core-config.yaml`.
> A validação de qualidade será feita pelo gate independente de `@architect`, pelos testes e pelos checks técnicos listados nesta story.

## Tasks / Subtasks

- [x] Mapear os pontos de apresentação da rota e da navegação administrativa (AC: 1)
  - [x] Localizar o label de `/admin/inscricoes` na configuração de navegação.
  - [x] Localizar o título/descrição da configuração do recurso `enrollments`.
  - [x] Confirmar que `/admin/inscricoes` continua sendo a única rota pública do recurso no admin.
- [x] Unificar os rótulos da experiência (AC: 1, 7)
  - [x] Aplicar o texto exato `Pré-inscrições e matrículas` no título, navegação desktop e navegação mobile.
  - [x] Ajustar descrição e textos auxiliares para explicar que a mesma lista acompanha o ciclo completo, sem chamar o usuário para outra área.
- [x] Tornar status e tipo claramente distinguíveis (AC: 2, 3, 7)
  - [x] Manter o status textual em coluna/badge acessível para todos os valores existentes.
  - [x] Exibir o tipo de inscrição no contexto principal da linha ou no detalhe acessível pela linha.
  - [x] Preservar os valores provenientes do read model, sem alterar enum, mapper ou API.
- [x] Preservar contratos, ações e autorização (AC: 4, 5, 6)
  - [x] Confirmar que a hidratação continua usando o endpoint same-origin da REC-303 após reload.
  - [x] Não tocar em API, banco, RLS, guards, permissões, dados ou regras de negócio.
  - [x] Verificar que editar, atualizar status, excluir, criar e exportar continuam funcionando com os mesmos handlers.
- [x] Cobrir a mudança com testes (AC: 4, 7, 8)
  - [x] Adicionar/ajustar testes de renderização para título, navegação, status e tipo.
  - [x] Adicionar/ajustar teste E2E da rota, incluindo reload e viewport móvel.
  - [x] Executar lint, typecheck, build e suíte de testes aplicável; registrar evidências no Dev Agent Record.
- [ ] Preparar handoff operacional (AC: 9)
  - [ ] Entregar a story e o SHA candidato ao `@devops` sem executar push, merge ou deploy neste escopo.
  - [x] Registrar que o run `32285049727` teve deploy pulado e que o `workflow_dispatch` posterior é obrigatório quando o run automático não promover frontend.

## Dev Notes

### Decisões e limites

- A unidade de experiência é a lista existente de inscrições na rota `/admin/inscricoes`; “pré-inscrição” descreve o início do ciclo e “matrícula” descreve seus estados posteriores. O rótulo único não deve criar dois conceitos de armazenamento.
- O conjunto de status deve ser tratado como domínio existente: `Pendente`, `Aguardando pagamento`, `Confirmada`, `Cancelada` e `Concluída`. A UI pode ajustar apresentação, ordem ou acessibilidade, mas não pode inventar status, apagar registros ou reinterpretar transições.
- O conjunto de tipos de inscrição existente é `Pessoa física`, `Empresa` e `Órgão público`. A UI deve apresentar o valor retornado pelo read model e lidar com ausência de valor sem quebrar a tabela.
- A REC-303 é a fonte do contrato de leitura administrativa: a correção deve continuar usando a hidratação same-origin e permanecer protegida pela autorização server-side já existente.
- Não alterar `app/api/admin/**`, `src/lib/supabase/admin-read-models.ts`, `src/lib/supabase/admin-api-auth.ts`, migrations, políticas RLS, dados, schema ou permissões. Se a implementação parecer exigir qualquer uma dessas mudanças, parar e devolver a decisão ao `@aiox-master` para uma story separada.
- O run `32285049727` e o merge `9c9d924` são contexto de rastreabilidade da publicação; não são autorização para contornar CI, escopo do workflow ou gates.

### Arquivos prováveis

- `app/admin/inscricoes/page.tsx`: mantém o entrypoint da rota e não deve ser duplicado.
- `src/features/admin-shell/config/admin-navigation.ts`: label desktop/mobile da navegação administrativa.
- `src/lib/admin-resource-configs.tsx`: título, descrição, colunas, status/tipo e campos do recurso `enrollments`.
- `src/views/admin/AdminResourcePage.tsx` e/ou `src/features/admin/resources/admin-resource-page.tsx`: estrutura compartilhada, tabela, detalhe, exportação e acessibilidade da página.
- `src/lib/app-store.tsx`: somente para confirmar o consumo do read model; não alterar contrato ou fonte de dados sem nova aprovação.
- `docs/stories/2026-07-17-rec-303-read-models-alunos-inscricoes.md`: referência do read model e dos limites de autorização.
- `.github/workflows/production-pipeline.yml`: referência do handoff de publicação; esta story não altera o workflow.

### Fora do escopo

- Criar, renomear ou remover endpoints.
- Alterar schema, migrations, RLS, seeds, dados de produção ou status armazenados.
- Alterar autenticação, autorização, permissões ou integração da sessão.
- Migrar registros de “inscrição” para uma tabela de “matrícula”.
- Criar nova rota, novo menu independente ou nova área para matrículas.
- Executar push, merge, `workflow_dispatch`, deploy ou rollback; essas operações pertencem ao `@devops` após os gates.

## Testing

### Cenários obrigatórios

1. Admin autorizado abre `/admin/inscricoes` e encontra o título e a navegação `Pré-inscrições e matrículas`.
2. Uma resposta contendo cada status existente renderiza o texto correto, com acessibilidade que não depende só da cor.
3. Uma resposta contendo `Pessoa física`, `Empresa` e `Órgão público` permite identificar cada tipo na lista ou no detalhe da própria linha.
4. Reload completo mantém os registros e suas distinções, comprovando que a UI consome o read model da REC-303.
5. Ações existentes de visualização/edição, atualização de status, criação, exclusão e exportação não sofrem regressão nem mudam autorização.
6. A rota permanece adequada em desktop e mobile, sem overflow que oculte status/tipo.
7. Teste de contrato confirma que nenhum endpoint ou payload administrativo foi alterado.
8. `npm run lint`, `npm run typecheck`, `npm run build` e a suíte de testes aplicável passam.
9. O handoff documenta o run automático, o deploy pulado `32285049727` e a necessidade de `workflow_dispatch` posterior quando aplicável.

## Story Draft Checklist Result

**Readiness:** READY
**Clarity score:** 10/10
**Major gaps:** nenhum bloqueador conhecido; sincronização ClickUp indisponível e publicação ficam explicitamente no handoff de `@devops`.

| Category | Status | Issues |
|---|---|---|
| 1. Goal & Context Clarity | PASS | Objetivo de unificação, valor operacional, merge `9c9d924`, run `32285049727` e dependência da REC-303 estão explícitos. |
| 2. Technical Implementation Guidance | PASS | Pontos prováveis de UI, status/tipos existentes, limites de API/dados/permissões e workflow de publicação estão delimitados. |
| 3. Reference Effectiveness | PASS | REC-303, entrypoint, navegação, config do recurso e workflow são citados com a finalidade de cada referência. |
| 4. Self-Containment Assessment | PASS | A story define rótulo exato, status, tipos, rota canônica, ações preservadas e fora de escopo. |
| 5. Testing Guidance | PASS | Renderização, acessibilidade, reload, ações, contrato, gates técnicos e handoff têm cenários verificáveis. |
| 6. CodeRabbit Integration (conditional) | N/A | CodeRabbit está desabilitado; gate independente de `@architect` atribuído. |

### Developer/Executor Perspective

- `@dev` consegue implementar a mudança sem decidir novos contratos: deve ajustar apenas a apresentação administrativa existente, preservar os dados/handlers atuais e adicionar os testes descritos.
- A principal prevenção contra retrabalho é não transformar a unificação visual em migração de dados, mudança de API ou nova área de navegação.
- O resultado precisa ser entregue ao `@devops` com o SHA e os gates locais; produção só será considerada atualizada após o pipeline apropriado e, se necessário, o `workflow_dispatch` posterior.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-08-19 | 0.1 | Story Draft criada para unificar pré-inscrições e matrículas na rota administrativa existente, com distinção por status/tipo e limites explícitos de API, dados e permissões. | River (@sm) |
| 2026-08-19 | 0.2 | Validação PO concluída com GO: story pronta para implementação; rota, contratos REC-303, permissões, ações existentes e handoff do merge `9c9d924`/run `32285049727` conferidos. | Pax (@po) |
| 2026-08-19 | 0.3 | Implementação de UI e testes focados concluída; E2E autorizado e handoff de publicação permanecem pendentes antes de promover a story. | Dex (@dev) |
| 2026-08-19 | 0.4 | Revisão arquitetural concluída: diff restrito à UI/testes, contratos e read model preservados; E2E administrativo permanece pendente por falta de ambiente autorizado. | Aria (@architect) |

## Dev Agent Record

### Agent Model Used

GPT-5 Codex (Dex/@dev)

### Debug Log References

 - `npm run test:unit -- src/__tests__/lib/admin-resource-configs.test.ts src/__tests__/features/admin-shell/admin-mobile-navigation.test.tsx` — 2 arquivos, 23 testes aprovados.
 - `npm run lint` — aprovado.
 - `npm run typecheck` — aprovado; route types gerados com sucesso.
 - `npm run build` — aprovado; rota `/admin/inscricoes` compilada.
 - @architect: PASS WITH CONCERNS, sem bloqueadores; testes de contrato/read model 18/18 e validação de limites do diff aprovados.
 - E2E `tests/admin-crud.spec.ts` atualizado, mas não executado nesta sessão: exige ambiente Supabase isolado com sessão administrativa e escrita autorizada.

### Completion Notes List

 - A navegação desktop/mobile e o título do recurso agora usam exatamente `Pré-inscrições e matrículas` na rota canônica `/admin/inscricoes`.
 - A descrição contextualiza o ciclo completo; a tabela exibe `Tipo de inscrição` com badge textual, fallback para ausência e valor preservado no CSV.
 - Status permanece textual, com os cinco valores de domínio preservados e nome acessível `Status: <valor>`; handlers de CRUD, exportação, hidratação e contratos não foram alterados.
 - Nenhum arquivo de API, read model, banco, RLS, auth/permissões ou workflow foi modificado.
 - A story está `Ready for Review`; o concern não bloqueante é a execução do E2E administrativo, que depende de ambiente Supabase isolado com sessão administrativa e escrita autorizada.
 - O SHA candidato e o handoff final de publicação permanecem para `@devops`; não foram executados push, merge ou deploy neste escopo.

### File List

 - `src/features/admin-shell/config/admin-navigation.ts`
 - `src/lib/admin-resource-configs.tsx`
 - `src/__tests__/features/admin-shell/admin-mobile-navigation.test.tsx`
 - `src/__tests__/lib/admin-resource-configs.test.ts`
 - `tests/admin-crud.spec.ts`

Não foram incluídos arquivos de API, banco, permissões ou `.aiox/project-status.yaml`.

## QA Results

### @architect (Aria) — 2026-08-19

**Veredito arquitetural: PASS WITH CONCERNS (não bloqueante).**

- **PASS — unificação e rota:** `Pré-inscrições e matrículas` é o valor exato no título da página, na navegação desktop e no item de navegação mobile; `/admin/inscricoes` continua sendo a única rota do recurso.
- **PASS — acessibilidade e domínio:** status permanece textual e acessível (`aria-label="Status: <valor>"`) para os cinco valores existentes; tipo de inscrição permanece textual e acessível (`aria-label="Tipo de inscrição: <valor>"`) com fallback explícito.
- **PASS — operação:** busca inclui tipo/status e a exportação inclui o tipo retornado; handlers de visualizar/editar, status, criação, exclusão e exportação não foram alterados.
- **PASS — limites e contratos:** o diff da implementação fica restrito a `src/features/admin-shell/config/admin-navigation.ts`, `src/lib/admin-resource-configs.tsx` e testes; não há alteração em `app/api/admin/**`, `src/lib/supabase/admin-read-models.ts`, `src/lib/app-store.tsx`, migrations, RLS, auth/guards ou workflow. Testes de read model/rota de contrato passaram (18/18).
- **PASS — validação local:** testes focados de UI/configuração passaram (23/23); lint, typecheck e build constam aprovados no Dev Agent Record.
- **CONCERN — evidência E2E:** `tests/admin-crud.spec.ts` inclui rota, rótulo, reload, viewport móvel e tipo, mas não foi executado nesta sessão por ausência de ambiente Supabase com sessão administrativa e escrita autorizada. A hidratação REC-303 foi preservada no código e coberta pelos testes de contrato, porém a renderização pós-reload em produção permanece pendente de validação autorizada.

**Bloqueadores arquiteturais:** nenhum. O concern E2E deve ser resolvido no handoff operacional antes de declarar a validação de produção concluída.
