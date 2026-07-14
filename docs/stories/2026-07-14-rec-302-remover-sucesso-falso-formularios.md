# Story REC-302: Remover sucesso falso dos formulários de lead

## Status

Done

## Executor Assignment

executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- testes Vitest direcionados do AppStore e de todos os consumidores de `createLead`
- Playwright direcionado às jornadas públicas e criação administrativa de lead
- `npm test`
- `npm run build`

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 1 — Fechar comportamentos enganosos
- **Prioridade:** P0
- **Estimativa:** M, entre um e dois dias de esforço focado, devido aos sete consumidores reais
- **Finding:** FND-06
- **Requisitos:** FR-06, NFR-04, NFR-05, NFR-09 e CON-01
- **Critérios da épica:** AC-17.10 parcialmente quanto à persistência confirmada; AC-17.11 integralmente para leads
- **Gate relacionado:** G2 — Leads e pré-inscrição

## Story

**As a** pessoa que envia um formulário de contato, orçamento, newsletter ou atendimento da RH Cursos,
**I want** receber confirmação somente quando o servidor confirmar a persistência do meu lead,
**so that** meus dados não sejam apagados nem apresentados como registrados quando a rede, a configuração ou a API falhar.

## Contexto e diagnóstico confirmado

O contrato atual de `createLead` em `src/lib/app-store.tsx` viola a verdade funcional em dois caminhos:

1. Quando `invokeFunction("leads")` rejeita ou retorna non-2xx, a implementação converte a falha em `null`, mostra um toast interno e retorna `Promise<void>` resolvida. O caller continua no bloco de sucesso, limpa/fecha o formulário e mostra uma segunda confirmação.
2. Quando Supabase Functions não está configurado, o lead é criado apenas no estado local e um sucesso de “sessão de desenvolvimento” é emitido. Esse comportamento não pode existir em produção; produção sem Functions deve falhar fechado.

Além disso, o store emite toasts e os componentes consumidores também emitem toasts, gerando notificações duplicadas e autoridade de UX dividida. O contrato correto é: `createLead` persiste ou rejeita; o caller é o único dono do feedback visual e só limpa/fecha após resolução bem-sucedida.

## Inventário obrigatório de consumidores

| Consumidor real | Jornada | Estado que deve ser preservado em falha | Ação exclusiva de sucesso |
|---|---|---|---|
| `src/views/public/Contact.tsx` | `/contato` | todos os campos e mensagem | reset + mensagem de sucesso |
| `src/views/public/InCompany.tsx` | `/in-company` | formulário completo | reset + confirmação consultiva |
| `src/views/public/Blog.tsx` | newsletter do blog | nome e e-mail | limpar campos |
| `src/views/public/SpecialistContact.tsx` | `/falar-com-especialista` e `/consultoria` | objeto `form` completo | limpar formulário + confirmação |
| `src/features/public-shell/components/whatsapp-support.tsx` | atendimento rápido | mensagem e diálogo aberto | tracking, fechar diálogo e limpar mensagem |
| `src/components/in-company/quote-modal.tsx` | orçamento In Company | formulário e modal aberto | confirmação + fechar modal |
| `src/lib/admin-resource-configs.tsx` | criação manual de lead no admin | formulário/modal e erros | fechar modal e confirmar criação |

Busca final por `createLead` deve confirmar que não existe consumidor adicional fora de testes. Se um novo consumidor real for encontrado, ele entra no escopo antes de a story mudar para Ready/Done.

## Escopo

### Incluído

- Corrigir o contrato assíncrono de `createLead` para rejeitar network errors e respostas non-2xx.
- Impedir mutação de `state.leads` antes da confirmação server-side.
- Fazer produção sem Supabase Functions falhar fechado.
- Manter, se necessário, o modo local somente em `development/test`, explicitamente isolado e testado.
- Remover toasts de `createLead`; cada caller emite no máximo um toast por tentativa.
- Preservar os campos e manter modal/dialog aberto em qualquer falha.
- Garantir que sucesso/reset/close/tracking só ocorram depois da persistência confirmada.
- Cobrir todos os consumidores listados e o contrato do store.

### Fora do escopo

- Revogar insert anônimo ou mudar RLS: REC-102.
- Criar o endpoint server-side definitivo com schema, idempotência, body limit, CAPTCHA e rate limit: REC-107.
- Definir/implementar o recibo opaco definitivo exigido por AC-17.10: REC-107. Esta story garante somente que nenhuma confirmação anteceda persistência.
- Redesenhar os formulários.
- Decompor o AppStore: REC-501.
- Alterar auth administrativa/HMAC: REC-201 a REC-204.
- Modificar checkout/inscrição: REC-301 e REC-105 a REC-107.

## Acceptance Criteria

1. **Network error rejeita o caller**
   **Given** qualquer consumidor de `createLead`,
   **when** `invokeFunction` rejeita por rede/timeout,
   **then** `createLead` rejeita com `Error` compreensível, não altera `state.leads` e não emite toast.

2. **Non-2xx rejeita o caller**
   **Given** que a Function retorna `400`, `403`, `409`, `429` ou `500`,
   **when** `createLead` processa a resposta,
   **then** ele extrai mensagem segura quando disponível, usa fallback quando o body é inválido e rejeita; não retorna sucesso resolvido.

3. **Persistência antecede qualquer mutação local**
   **Given** uma tentativa de criação,
   **when** a API ainda está pendente ou falha,
   **then** nenhum lead é mesclado em `state.leads`; a atualização local ocorre somente depois de response `ok` do endpoint apropriado.

4. **Produção sem Functions falha fechado**
   **Given** `process.env.NODE_ENV === "production"` e `isFunctionsConfigured === false`,
   **when** qualquer caller executa `createLead`,
   **then** a Promise rejeita, o estado permanece intacto e nenhuma mensagem de “registrado apenas nesta sessão” aparece.

5. **Modo local não vaza para produção**
   Se o fallback local for preservado para desenvolvimento/testes, ele deve estar condicionado explicitamente a ambiente não produtivo, possuir teste positivo/negativo e não ser a base de um E2E de persistência real.

6. **Campos e contexto preservados em falha**
   **Given** qualquer um dos sete consumidores,
   **when** `createLead` rejeita,
   **then** todos os valores digitados continuam presentes; modal/dialog continua aberto quando aplicável; success state não é definido; tracking de sucesso não é enviado.

7. **Limpeza e fechamento somente após sucesso**
   **Given** response `ok` confirmando a escrita,
   **when** `createLead` resolve,
   **then** o caller pode limpar/fechar e mostrar sua confirmação específica. Nenhum caller antecipa essas ações antes do await resolvido.

8. **Uma autoridade de toast**
   Para cada tentativa há no máximo um `toast.success` ou um `toast.error` emitido pelo caller. `createLead` não emite toast de sucesso/erro. Mensagem inline de campo/formulário pode coexistir, desde que não exista segundo toast duplicado.

9. **Admin permanece verdadeiro**
   A criação manual do admin continua usando `admin-resources` quando existe sessão administrativa, fecha o modal apenas após `response.ok` e mantém modal/dados em qualquer network/non-2xx.

10. **Cobertura de regressão completa**
    Testes cobrem store e os sete consumidores, incluindo ao menos network error, non-2xx, pending, sucesso, produção sem Functions, preservação de campos e ausência de toast duplicado.

11. **Gates verdes e dependência respeitada**
    `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm test` e `npm run build` passam. A story não pode ser mergeada enquanto REC-403 estiver vermelha nem publicada ignorando REC-401/REC-402.

## Tasks / Subtasks

- [x] **Task 1 — Congelar o contrato atual com testes que reproduzem o bug** (AC: 1–5, 8, 10)
  - [x] Adicionar caso de network rejection em `src/__tests__/lib/app-store.test.ts`.
  - [x] Ajustar o caso non-2xx atual para esperar rejection, estado intacto e zero toast do store.
  - [x] Adicionar teste de request pending provando ausência de mutação otimista.
  - [x] Adicionar produção sem Functions, esperando fail-closed.
  - [x] Isolar e documentar o comportamento permitido em development/test.

- [x] **Task 2 — Corrigir `createLead`** (AC: 1–5, 8, 9)
  - [x] Remover `.catch(() => null)` e retorno silencioso do caminho público.
  - [x] Reutilizar `getFunctionErrorMessage` ou equivalente para respostas non-2xx.
  - [x] Lançar erro normalizado em falha de rede/configuração/resposta.
  - [x] Mover `setState/mergeLeads` para depois de response `ok`.
  - [x] Remover todos os `toast.*` internos de `createLead`.
  - [x] Preservar a distinção entre endpoint público e `admin-resources` sem confiar em sucesso local em produção.

- [x] **Task 3 — Corrigir formulário de contato** (AC: 6–8, 10)
  - [x] Manter valores, success state vazio e um único erro quando `createLead` rejeitar.
  - [x] Resetar somente em sucesso.
  - [x] Atualizar `src/__tests__/views/public/contact.test.tsx` com failure e ausência de duplicidade.

- [x] **Task 4 — Corrigir In Company e orçamento modal** (AC: 6–8, 10)
  - [x] Validar `src/views/public/InCompany.tsx` em network/non-2xx.
  - [x] Validar `src/components/in-company/quote-modal.tsx`: modal e todos os campos permanecem em falha.
  - [x] Garantir um toast por tentativa.
  - [x] Criar testes direcionados para ambas as jornadas.

- [x] **Task 5 — Corrigir newsletter e especialista/consultoria** (AC: 6–8, 10)
  - [x] Manter nome/e-mail da newsletter em falha.
  - [x] Manter formulário completo de especialista/consultoria em falha.
  - [x] Limpar somente depois do await confirmado.
  - [x] Criar testes direcionados para os dois modos de `SpecialistContactPage` quando houver diferença de origem.

- [x] **Task 6 — Corrigir atendimento rápido** (AC: 6–8, 10)
  - [x] Manter diálogo aberto e mensagem em falha.
  - [x] Não disparar `trackEvent("lead_enviado")` em falha.
  - [x] Fechar, limpar e enviar tracking somente em sucesso.
  - [x] Criar teste direcionado.

- [x] **Task 7 — Corrigir criação manual do admin** (AC: 6–10)
  - [x] Manter modal e dados em network/non-2xx.
  - [x] Fechar somente após confirmação.
  - [x] Garantir exatamente um toast de sucesso/erro no caller.
  - [x] Atualizar teste unitário de `admin-resource-configs`.
  - [x] Atualizar e executar Playwright de lead admin em ambiente de teste isolado.

- [x] **Task 8 — Revalidar inventário e gates** (AC: 10, 11)
  - [x] Reexecutar busca por `createLead` e reconciliar todos os consumidores reais.
  - [x] Executar testes direcionados de store/componentes.
  - [x] Executar gates constitucionais no mesmo commit após REC-403 estar verde.
  - [x] Atualizar File List e solicitar veredito de `@qa`.

## Dev Notes

### Contrato atual verificado

- `src/lib/app-store.tsx:1059-1100` implementa `createLead`.
- `src/lib/app-store.tsx:1082-1086` converte network error em `null`, emite `toast.error` e retorna sem rejeitar; esse é o mecanismo direto do falso sucesso nos callers.
- `src/lib/app-store.tsx:1089-1099` mescla um registro local construído por `buildLeadRecord` e emite toast do store.
- `src/lib/supabase/functions-client.ts` expõe `isFunctionsConfigured` e `invokeFunction`; em browser, a chamada usa `/api/functions/{name}`.
- `supabase/functions/leads/index.ts` retorna `201 { ok: true }` em sucesso e respostas 4xx/5xx em erro. A segurança definitiva desse endpoint pertence a REC-102/REC-107.
- `src/lib/contexts/admin-context.tsx` declara hoje `createLead: (payload) => Promise<void>`; esta story pode manter o retorno `void` desde que a Promise rejeite toda falha e resolva somente após confirmação.

### Consumidores e comportamento atual

- `Contact.tsx`, `InCompany.tsx`, `Blog.tsx`, `SpecialistContact.tsx`, `whatsapp-support.tsx` e `quote-modal.tsx` já possuem `try/catch`, mas interpretam o retorno silencioso do store como sucesso.
- `src/lib/admin-resource-configs.tsx` fecha o modal depois de `await store.createLead`; ele também depende de rejection verdadeira para permanecer aberto.
- `SpecialistContactPage` serve `/falar-com-especialista` e `/consultoria` por meio do shim `src/features/public/specialist/specialist-page.tsx`.
- O store e vários callers emitem toast, produzindo duplicidade. A fronteira desta story define store sem UI side effects; caller possui feedback.

### Referências arquiteturais

- `src/lib/` é o local de infraestrutura compartilhada; views legadas permanecem compatibility shims durante a migração incremental. [Fonte: `docs/architecture/frontend-feature-first-architecture.md#2-feature-first-organization`; `docs/architecture/frontend-feature-first-architecture.md#5-shared-infrastructure`]
- Rotas devem apenas compor shells/features; a correção permanece nos serviços/store e componentes já existentes, sem mover roteamento. [Fonte: `docs/architecture/frontend-feature-first-architecture.md#1-routing`]
- A stack de testes ativa usa Vitest/React Testing Library e Playwright; a aplicação usa Zod nas fronteiras, mas endurecimento de schema do endpoint é REC-107. [Fonte: `docs/architecture/system-architecture.md#1-stack-tecnológico`]

### Project Structure Notes

- Reutilizar os paths existentes; não criar nova arquitetura ou novo store nesta story.
- Novos testes unitários devem ficar em `src/__tests__/` seguindo os domínios existentes.
- Jornadas agregadas permanecem em `tests/`; adicionar somente o mínimo necessário para provar os fluxos reais.
- Não editar migrations nesta story.

### Decisões de erro

- `createLead` deve lançar `Error` com mensagem segura; não devolver boolean ambíguo.
- Body non-JSON usa mensagem fallback.
- Erro de rede não deve expor URL interna, stack, token ou payload.
- O caller pode combinar erro inline e um toast, mas nunca receber/emitir um segundo toast do store.

## Testing

### Store contract

- Network rejection → Promise rejeitada, estado intacto, zero toast do store.
- `400/403/409/429/500` → Promise rejeitada com mensagem segura.
- Body non-JSON → fallback seguro.
- Promise pendente → estado ainda intacto.
- `201/ok` público → estado atualizado depois da confirmação.
- `200/ok` admin → estado atualizado depois da confirmação.
- Produção sem Functions → rejeita e não muta.
- Development/test sem Functions, se mantido → local-only explicitamente testado e impossível em produção.

### Caller contract

Para cada consumidor:

- Preencher valores identificáveis de teste.
- Fazer `createLead` rejeitar.
- Confirmar valores preservados.
- Confirmar success state ausente.
- Confirmar modal/dialog aberto quando aplicável.
- Confirmar exatamente um toast de erro.
- Confirmar zero `toast.success` e zero tracking de sucesso.
- Resolver em nova tentativa e confirmar limpeza/fechamento e exatamente um toast de sucesso.

### Gates finais

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- Playwright público/admin direcionado
- `npm test`
- `npm run build`

## Observabilidade

- Registrar failure por categoria (`network`, `validation`, `authorization`, `rate_limit`, `server`, `configuration`) sem payload ou PII.
- Usar correlation/request ID somente quando fornecido pelo endpoint; não inventar confirmação local.
- Métrica de sucesso é emitida somente após response `ok`.
- `trackEvent("lead_enviado")` não pode ocorrer em falha.
- Não usar e-mail, telefone, nome ou mensagem como label de log/métrica.

## Security Notes

- Fail-closed em produção é obrigatório; a ausência de Functions não pode cair em store local.
- Não registrar o payload do lead em console/test artifacts.
- Esta story não torna o endpoint atual seguro contra insert anônimo; REC-102/REC-107 permanecem bloqueadores para reabertura completa de G2.
- Não alterar `x-rh-session`, rate limit ou RLS aqui; manter blast radius no contrato de verdade do lead.
- Testes usam dados sintéticos e não devem incluir credenciais ou PII real.

## Dependências

- **Entrada:** REC-001 com freeze/evidência ativa.
- **Bloqueador de merge:** REC-403 deve estar Done/verde.
- **Bloqueador de publicação:** controles aplicáveis de REC-401/REC-402.
- **Bloqueadores de reabertura G2:** REC-102 e REC-107, além desta story.
- **Não depende para implementação local:** REC-102/REC-107; o contrato de rejeição pode ser corrigido antes do endpoint definitivo.

## Roll-forward / Rollback

- **Roll-forward preferido:** corrigir o contrato e os callers mantendo fail-closed.
- **Rollback permitido:** voltar temporariamente a indisponibilizar o formulário, preservando campos e mensagem de erro.
- **Rollback proibido:** restaurar retorno silencioso, mutação local em produção, sucesso de “sessão de desenvolvimento”, limpeza antecipada ou toast duplicado.
- Se a Function definitiva ainda não estiver pronta, a alternativa segura em produção é erro/indisponibilidade, nunca confirmação local.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usa revisão manual, testes direcionados, gates constitucionais e veredito independente de `@qa`.

### Story Type Analysis

- **Primary Type:** Frontend / Error Handling
- **Secondary Type:** API Contract / Security Fail-closed
- **Complexity:** Média, por alterar um contrato compartilhado e sete consumidores
- **Primary Agent:** `@dev`
- **Quality Gate:** `@qa`

### Manual review focus

- Rejection real para network/non-2xx/configuração.
- Estado mutado somente após persistência.
- Todos os consumidores preservam campos.
- Store sem toast; um toast por caller/tentativa.
- Nenhum fallback local em produção.
- Sem expansão indevida para RLS/auth/rate limit.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-14 | 0.1 | Draft criado com diagnóstico do retorno silencioso de `createLead`, inventário completo dos sete consumidores reais, fail-closed em produção e testes de preservação/toast único. | @sm (River) |
| 2026-07-14 | 1.0 | **GO — 10/10; Draft → Ready.** PASS em objetivo/valor, rastreabilidade FND-06 → FR-06/NFR-04/05/09 → AC-17.10/11, inventário dos sete consumidores confirmado por busca no código, escopo IN/OUT, contrato de erro testável, preservação de estado, autoridade única de toast, fail-closed produtivo, tarefas por consumidor, estratégia de testes, segurança e rollback. O recibo opaco definitivo permanece corretamente em REC-107 e não foi inventado nesta story. `@qa` foi mantido como quality gate constitucional, distinto de `@dev`. Bloqueadores documentais: 0. Condições de execução: REC-001 com freeze ativo; implementação local pode começar, mas merge exige REC-403 Done/verde e publicação exige os controles aplicáveis de REC-401/402. | @po (Pax) |
| 2026-07-14 | 1.1 | Implementação local corrigiu rejection, fail-closed, autoridade de toast e identidade canônica do lead administrativo. Revisão independente encontrou que o primeiro patch descartava `data.id`; o contrato passou a validar `id`, `created_at` e `status_crm`, rejeitar envelope inválido e reutilizar o ID real em update/delete. Story permanece In Progress por bloqueio Playwright/REC-403. | @dev (Dex) + @qa (Quinn) |
| 2026-07-14 | 1.2 | Revalidação após a estabilização local da REC-403: 51/51 testes direcionados, 511/511 unitários, lint, typecheck e build de produção verdes. O Playwright administrativo e o `npm test` agregado continuam bloqueados até existir um Supabase de teste isolado com autorização explícita de escrita. | @dev (Dex) |
| 2026-07-14 | 1.3 | Ambiente Supabase local isolado reativado com guarda fail-closed; Playwright de lead admin passou 1/1 com persistência e cleanup. Flakes de preenchimento dos consumidores foram removidos sem ampliar timeout. Gates finais: lint, typecheck, 527/527 unitários, build e Playwright agregado 174/174 verdes. Tasks 7–8 concluídas; story movida para Ready for Review. | @dev (Dex) |
| 2026-07-14 | 1.4 | **Ready for Review → Done.** Gate QA versionado em `docs/qa/gates/rec-302-remover-sucesso-falso-formularios.yml` permanece PASS, com 11/11 ACs cobertos, zero finding bloqueante e dependências locais REC-403/REC-401 satisfeitas. Publicação continua condicionada à conclusão operacional aplicável de REC-402/REC-001, sem impedir o fechamento da implementação local. | @po (Pax) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-14-rec-302-remover-sucesso-falso-formularios.md`

### Modificado nesta implementação parcial

- `src/lib/app-store.tsx`
- `src/lib/admin-resource-configs.tsx`
- `src/__tests__/lib/app-store.test.ts`
- `src/__tests__/lib/admin-resource-configs.test.ts`
- `src/__tests__/views/public/contact.test.tsx`
- `src/__tests__/views/public/lead-consumers.test.tsx`
- `src/__tests__/components/lead-dialog-consumers.test.tsx`

### Criado nesta implementação parcial

- Nenhum arquivo adicional nesta etapa final.

### Referências somente leitura

- `src/lib/supabase/functions-client.ts`
- `supabase/functions/leads/index.ts`
- `src/lib/contexts/admin-context.tsx`
- `src/features/public/specialist/specialist-page.tsx`
- `app/consultoria/page.tsx`
- `app/falar-com-especialista/page.tsx`

> O executor deve substituir itens genéricos pelos paths exatos dos testes criados e reconciliar a File List antes de Review.

## Dev Agent Record

### Agent Model Used

GPT-5 (Codex)

### Debug Log References

- Test-first: `npm run test:unit -- src/__tests__/lib/app-store.test.ts` reproduziu 11 falhas antes da correção.
- Contrato corrigido e identidade administrativa canônica validada: `src/__tests__/lib/app-store.test.ts` passou com 35/35 testes.
- Consumidores direcionados: 5 arquivos e 51 testes passaram.
- Suíte unitária completa: 45 arquivos e 511 testes passaram.
- `npm run lint` passou.
- `npm run typecheck` passou.
- `npm run build` passou após a correção.
- Playwright direcionado do lead administrativo passou 1/1 no Supabase local isolado, com confirmação de persistência e cleanup.
- O gate final passou com lint, typecheck, 527/527 testes unitários, build de produção e `npm test` agregado com 174/174 cenários Playwright.
- O baseline agregado anterior à correção concluiu typecheck/build e terminou Playwright com 168 PASS/6 FAIL. Ele não foi reexecutado porque a triagem REC-403 confirmou dependência de dados externos mutáveis, escrita de snapshots versionados e risco de escrita administrativa no ambiente apontado por `.env.local`.

### Completion Notes

- `createLead` agora rejeita falhas de rede, configuração produtiva e respostas non-2xx sem mutar `state.leads` nem emitir toast.
- Fallback local permanece permitido somente fora de `production`; produção sem Functions falha fechado.
- A criação administrativa exige `ok === true`, valida `data.id`/`created_at`/`status_crm`, usa a identidade canônica no estado e rejeita resposta 2xx incompleta ou contraditória; update/delete subsequentes foram testados com o ID real.
- Os sete consumidores foram reconciliados. Os callers já preservavam estado e aguardavam `createLead`; a rejection verdadeira ativa esses caminhos sem necessidade de alterar os seis componentes públicos.
- O admin passou a emitir sua confirmação específica depois de `createLead` resolver; todos os callers possuem uma única autoridade de toast.
- A implementação está validada por lint, typecheck, 527 testes unitários, build de produção e 174 cenários Playwright agregados.
- O Playwright público/admin foi executado no Supabase local isolado e determinístico; o cenário de lead confirmou persistência antes do sucesso e executou cleanup.
- Os testes dos consumidores usam preenchimento determinístico, preservando as mesmas asserções sem depender de timeout ampliado.
- Story movida para `Ready for Review`; publicação continua condicionada aos controles REC-401/REC-402.

## QA Results

### 2026-07-14 — Revisão independente do patch local

- **Patch local REC-302:** PASS.
- **Gate completo da story:** FAIL exclusivamente por AC11/REC-403.
- Nenhum finding de código permanece no escopo revisado.
- Confirmado: `ok === true`, identidade/data/status canônicos, rejeição de envelope inválido sem mutação e ID real reutilizado em update/delete.
- Confirmado: preservação dos campos preenchidos nos sete consumidores, uma autoridade de toast e ausência de tracking de sucesso em falha.
- Evidências: 49/49 testes direcionados, 497/497 unitários, lint, typecheck, build e `git diff --check` verdes.
- A story permanece `In Progress` até Playwright isolado e `npm test` agregado passarem após REC-403.

### 2026-07-14 — Re-gate final após ambiente isolado

- **Veredito:** PASS.
- Os 11 acceptance criteria estão cobertos por testes de contrato do store, testes dos sete consumidores e Playwright administrativo contra Supabase local isolado.
- Evidências finais: lint PASS; typecheck PASS; 527/527 testes unitários PASS; build de produção PASS; lead admin 1/1 PASS; agregado Playwright 174/174 PASS.
- O CodeRabbit revisou a estabilização não commitada dos testes e retornou `No findings`.
- Revisão de segurança: fail-closed produtivo preservado; nenhum payload/PII logado; nenhum padrão novo de segredo hardcoded, execução dinâmica, DOM XSS ou CORS permissivo.
- Verificação de falso positivo: confiança alta (0,95). O comportamento antigo foi reproduzido test-first; network/non-2xx/pending/configuração provam os caminhos negativos e o E2E confirma persistência real antes do sucesso.
- Gate versionado em `docs/qa/gates/rec-302-remover-sucesso-falso-formularios.yml`; zero findings bloqueantes.
