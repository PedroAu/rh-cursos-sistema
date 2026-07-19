# Story REC-406: Sincronizar OpenAPI com a superfície HTTP publicada

## Status

InReview

## Executor Assignment

executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
- `npm run docs:api:lint`
- `npm run docs:api:check-drift`
- testes automatizados do contrato OpenAPI
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 5 — Qualidade e sustentabilidade
- **Prioridade:** P1
- **Estimativa:** M, entre um e dois dias de esforço focado
- **Finding:** FND-16 (OpenAPI diverge das rotas)
- **Requisito:** NFR-06 (contratos e gates devem representar o comportamento real)
- **Entrega mensurável da épica:** “Todas as rotas publicadas possuem contrato testado.”
- **Dependência de entrada:** REC-206 (`Done`) — BFF same-origin consolidado

## Story

**As a** pessoa desenvolvedora ou consumidora da API RH Cursos,
**I want** que o OpenAPI versionado represente todas as rotas e métodos HTTP realmente publicados,
**so that** integrações e gates de entrega detectem divergências de contrato antes de produção.

## Contexto e diagnóstico confirmado

A infraestrutura criada pela Épica 13 já existe parcialmente: `docs/api/openapi.yaml`, ReDoc estático, lint estrutural e `scripts/check-openapi-drift.mjs`. Entretanto, o gate executado no HEAD em 2026-07-17 falha e identifica sete Route Handlers sem contrato:

- `GET /api/admin/classes`
- `GET /api/admin/courses`
- `GET /api/admin/enrollments`
- `GET /api/admin/instructors`
- `GET /api/admin/students`
- `GET|POST|DELETE /api/auth/ssr-session`
- `GET|POST|DELETE /api/functions/[name]` no source tree do Next.js

A spec atual contém seis paths e o código publica treze paths (nove Route Handlers Next.js e quatro Edge Functions). Portanto, existe trabalho parcial reutilizável, mas REC-406 não está implementada: `npm run docs:api:check-drift` retorna exit code 1.

O segmento dinâmico do Next.js deve ser documentado em sintaxe OpenAPI (`/api/functions/{name}`), nunca como literal `[name]`. O checker deve normalizar as duas representações antes da comparação. O parâmetro `name` deve refletir somente as funções realmente suportadas pelo contrato/código; esta story não autoriza criar endpoints, alterar autenticação nem redesenhar o BFF.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está habilitado em `.aiox-core/core-config.yaml`.
> A validação usa revisão manual e os quality gates declarados nesta story.

## Acceptance Criteria

1. **Inventário completo de rota e método**
   **Given** o HEAD com `app/api/**/route.ts` e `supabase/functions/*/index.ts`,
   **when** o inventário OpenAPI é comparado ao código,
   **then** todos os 13 paths publicados e seus métodos detectáveis possuem operação correspondente na spec, sem path órfão ou método excedente.

2. **Contratos administrativos documentados**
   **Given** as cinco rotas `GET /api/admin/*`,
   **when** seus contratos são adicionados à spec,
   **then** ficam documentados autenticação SSR administrativa, query params existentes (`page`, `pageSize`, `search` e, onde aplicável, `classId`/`status`), respostas paginadas e erros reais `401`, `403`, `500` e `503`, sem inventar filtros ou campos.

3. **Sessão SSR documentada sem exposição de token**
   **Given** `GET|POST|DELETE /api/auth/ssr-session`,
   **when** o contrato é publicado,
   **then** request, respostas e códigos reais (`200`, `400`, `401`, `403`, `429`, `503`, conforme o método) refletem o handler e nenhum access token/refresh token aparece no schema ou exemplo.

4. **BFF dinâmico representado corretamente**
   **Given** `app/api/functions/[name]/route.ts`,
   **when** o path é registrado na OpenAPI e verificado pelo gate,
   **then** a spec usa `/api/functions/{name}` com path parameter, o checker normaliza `[name]` para `{name}`, e os métodos `GET`, `POST` e `DELETE` permanecem reconciliados.

5. **Gate anti-drift testado**
   **Given** a spec sincronizada,
   **when** uma fixture adiciona/remove path ou método, inclusive rota dinâmica,
   **then** o teste automatizado prova que `check-openapi-drift.mjs` falha; com a superfície real intacta, `npm run docs:api:check-drift` passa e reporta 13 rotas reconciliadas.

6. **Documentação navegável sincronizada**
   **Given** `docs/api/openapi.yaml` atualizado,
   **when** a documentação é regenerada,
   **then** `public/api-docs.html` deriva da nova spec e `docs/api/README.md` não mantém inventário ou orientação de autenticação contraditórios.

7. **Qualidade constitucional**
   **Given** a implementação concluída,
   **when** os gates da story são executados,
   **then** lint OpenAPI, anti-drift, testes de contrato, lint, typecheck, suíte agregada e build passam sem regressão.

## Escopo

### Incluído

- Sincronizar `docs/api/openapi.yaml` com a superfície HTTP existente.
- Reutilizar componentes/schemas quando equivalentes e criar schemas apenas a partir dos tipos e respostas atuais.
- Corrigir a normalização de rotas dinâmicas no gate anti-drift.
- Adicionar testes automatizados positivos e negativos do inventário método/path.
- Atualizar o catálogo manual e regenerar o ReDoc.

### Fora do escopo

- Criar, remover ou mudar comportamento de endpoints.
- Migrar autenticação, remover HMAC ou concluir REC-204.
- Implementar REC-304b, REC-408 ou novos read models.
- Gerar SDK, portal externo ou editor interativo.
- Emitir gate/veredito QA nesta story de preparação.

## Tasks / Subtasks

- [x] **Task 1 — Materializar o inventário canônico** (AC: 1, 4)
  - [x] Registrar os 13 paths e métodos atuais a partir do código.
  - [x] Normalizar segmentos Next `[param]` para OpenAPI `{param}` no checker.
  - [x] Impedir falso positivo/negativo de métodos e paths dinâmicos com teste.

- [x] **Task 2 — Documentar read models administrativos** (AC: 2)
  - [x] Adicionar as cinco operações `GET /api/admin/*`.
  - [x] Derivar query params de `normalizeListParams` e `normalizeCatalogListParams`.
  - [x] Derivar schemas paginados dos tipos/mappers existentes e respostas de erro dos handlers/guard.

- [x] **Task 3 — Documentar auth SSR e BFF** (AC: 3, 4)
  - [x] Adicionar `GET|POST|DELETE /api/auth/ssr-session`, incluindo rate limit e MFA observáveis no handler.
  - [x] Adicionar `GET|POST|DELETE /api/functions/{name}` e seu path parameter.
  - [x] Modelar cookies SSR/httpOnly sem expor tokens em body ou exemplos.

- [x] **Task 4 — Fortalecer e executar testes de contrato** (AC: 1, 5, 7)
  - [x] Cobrir sucesso com todas as rotas atuais.
  - [x] Cobrir falha por path ausente/excedente e método ausente/excedente.
  - [x] Cobrir equivalência `[name]` ↔ `{name}`.
  - [x] Executar `npm run docs:api:lint` e `npm run docs:api:check-drift`.

- [x] **Task 5 — Sincronizar documentação e validar gates** (AC: 6, 7)
  - [x] Atualizar `docs/api/README.md` e, somente quando contraditórios, os documentos manuais relacionados.
  - [x] Regenerar `public/api-docs.html` via `npm run docs:api:build`.
  - [x] Executar `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`.
  - [x] Atualizar checkboxes, File List, Dev Agent Record e Change Log.

## Dev Notes

### Fonte da verdade e limites

- A entrega de REC-406 deriva de FND-16 e da Onda 5 da Épica 17; não autoriza mudanças funcionais. [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#onda-5--qualidade-e-sustentabilidade-semana-2`]
- REC-206 tornou o BFF same-origin o contrato canônico do browser; a documentação deve incluir esse caminho sem ressuscitar consumo browser direto. [Fonte: `docs/stories/2026-07-17-rec-206-consolidar-bff-canonico.md`]
- A spec OpenAPI 3.1, os scripts de lint/build/drift e o ReDoc são infraestrutura existente da Épica 13; evoluí-los, não criar uma segunda ferramenta. [Fonte: `docs/stories/2026-06-24-epic13-story3-swagger-ui-drift-gate.md`]
- `scripts/check-openapi-drift.mjs` hoje compara paths literalmente; por isso `/api/functions/[name]` precisa ser convertido para `/api/functions/{name}` antes da comparação.
- O contrato das rotas administrativas deriva de `src/lib/supabase/admin-read-models.ts`, `src/lib/supabase/admin-catalog-read-models.ts`, `src/lib/supabase/admin-api-auth.ts` e dos respectivos Route Handlers.
- O contrato SSR deriva de `app/api/auth/ssr-session/route.ts`; a própria rota declara que tokens Supabase não são devolvidos no corpo.

### Estado parcial reutilizável

- `docs/api/openapi.yaml`: existe, OpenAPI 3.1, mas cobre apenas 6 dos 13 paths atuais.
- `scripts/lint-openapi.mjs`: existe e valida estrutura mínima.
- `scripts/check-openapi-drift.mjs`: existe e detectou corretamente sete paths faltantes, mas ainda não normaliza rota dinâmica.
- `scripts/build-api-docs.mjs`, `public/api-docs.html` e `tests/api-docs.spec.ts`: existem como base de geração/smoke.
- Comando auditado: `npm run docs:api:check-drift` falha no HEAD com exit code 1 e lista exatamente os sete paths do diagnóstico.

### Testing

- Preferir teste unitário do inventário/normalização do checker, além do smoke existente de documentação.
- O teste negativo deve usar fixture/entrada isolada; não editar rotas reais apenas para provar falha.
- Validar que schemas e exemplos não contêm `access_token`, `refresh_token`, senha, HMAC ou PII além dos campos já retornados pelo contrato real.
- Gates obrigatórios: `npm run docs:api:lint`, `npm run docs:api:check-drift`, testes específicos, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Dependências

- **REC-206:** Done — habilita esta story e define o BFF same-origin canônico.
- **Épica 13 / EP-13.3:** Done — fornece spec, ReDoc e gate anti-drift reutilizáveis.
- **REC-303/REC-304:** Done — fornecem as cinco rotas administrativas que hoje faltam na spec.
- **REC-202:** Done — fornece `/api/auth/ssr-session`.
- **REC-204 Fase A:** trabalho parcial já presente no BFF; a documentação deve refletir o HEAD, mas REC-406 não altera sua autorização nem conclui seu cutover.

## Roll-forward / Rollback

- **Roll-forward:** corrigir a spec e o checker na mesma mudança sempre que uma rota/método mudar.
- **Rollback:** reverter spec, checker, testes, README e ReDoc como um conjunto; nunca manter o gate verde removendo uma rota real do inventário.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-17 | 0.1 | Draft criado a partir de FND-16/NFR-06, com auditoria real mostrando 7 paths ausentes e gate anti-drift vermelho. | @sm (River) |
| 2026-07-17 | 0.2 | Validação PO concluída: GO 9/10; status promovido para Ready, sem gate QA. | @po (Pax) |
| 2026-07-19 | 0.3 | Implementação: 7 rotas documentadas (5 `GET /api/admin/*`, `ssr-session`, `functions/{name}`), inventário reconciliado em 13 rotas; checker normaliza `[name]`↔`{name}` com funções puras + guard CLI; teste de contrato positivo/negativo adicionado; README e ReDoc sincronizados. Gates: docs:api:lint PASS, docs:api:check-drift PASS (13 reconciliadas), contrato 15/15, lint PASS, typecheck PASS, `npm test` exit 0, build compiled. Status → InReview. | @dev (Dex) |

## Validação PO

- **Decisão:** GO
- **Implementation Readiness Score:** 9/10
- **Confiança:** Alta
- **Template/completude:** PASS — seções operacionais e reservadas ao Dev presentes, sem placeholders.
- **Rastreabilidade:** PASS — cada requisito deriva de FND-16/NFR-06, REC-206 ou comportamento auditado no código.
- **Testabilidade:** PASS — o comando atual falha de forma reproduzível e os ACs definem evidência positiva e negativa.
- **No Invention:** PASS — nenhuma rota ou comportamento novo foi solicitado; schemas devem derivar dos handlers/tipos existentes.
- **Ressalva não bloqueante:** a lista exata de valores aceitos por `{name}` deve ser derivada do proxy/chamadores e Edge Functions atuais durante a implementação, sem abrir suporte genérico novo.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (@dev / Dex), execução YOLO com verificação de gates.

### Debug Log References

- `npm run docs:api:lint` → PASS.
- `npm run docs:api:check-drift` → `✅ OpenAPI drift gate passou: 13 rotas reconciliadas.`
- Falha inicial de parse YAML no schema `SsrSessionResponse.aal`: descrição com `: ` inline (`(ex.: ...)`) quebrava o scalar; resolvida com aspas simples.
- `npx vitest run src/__tests__/api/openapi-drift.test.ts` → 15/15 PASS.
- `npm run lint` → PASS. `npm run typecheck` → PASS. `npm test` → exit 0. `npm run build` → `✓ Compiled successfully`.
- Import `.mjs` sem tipos exigiu declaração sibling `scripts/check-openapi-drift.d.mts` para o `tsc` do gate `typecheck`/`npm test`.
- Ruído concorrente observado (REC-408, fora do escopo): `src/lib/logger.ts`, `src/lib/supabase/query-logging-middleware.ts` e `src/__tests__/lib/security-headers.test.ts` estavam em edição por outro agente durante a execução; a suíte `test:unit` reporta 1 suite de load falhando (`security-headers.test.ts`, arquivo REC-408) — não é gate desta story e não deriva de REC-406.

### Completion Notes List

- Inventário reconciliado: 13 rotas (9 Route Handlers + 4 Edge Functions). As 7 rotas ausentes foram documentadas: 5 `GET /api/admin/*`, `GET|POST|DELETE /api/auth/ssr-session` e `GET|POST|DELETE /api/functions/{name}`.
- Checker `check-openapi-drift.mjs` refatorado: normaliza segmento dinâmico Next `[name]`→`{name}` (e catch-all `[...x]`→`{x}`) em ambos os lados da comparação; funções puras (`normalizeDynamicSegments`, `detectMethods`, `buildSpecEndpoints`, `diffEndpoints`, `listCodeEndpoints`) exportadas e execução CLI protegida por guard `import.meta.url`. Comportamento do gate preservado.
- Schemas derivados dos tipos/mappers reais (`src/types`, `mapCourse/mapClass/mapInstructor/mapDbStudent/mapDbEnrollment`); query params derivados de `normalizeListParams` (page/pageSize/search/classId/status) e `normalizeCatalogListParams` (page/pageSize/search). Erros `401/403/500/503` derivados de `requireAdminApi`/handlers, incluindo variante 503 de lockdown (`service_unavailable`/`lockdown`).
- SSR sem exposição de token: `SsrSessionResponse` devolve apenas `session`+`aal`; MFA fail-closed modelado (`MfaChallengeResponse`, 401). Nenhum `access_token`/`refresh_token`/senha/HMAC nos novos schemas ou exemplos (verificado por grep). O schema legado `SupabaseSession` (fluxo HMAC/Edge, fora do escopo) permanece intocado.
- `{name}` restrito às Edge Functions realmente existentes (`admin-resources`, `auth-session`, `enrollments`, `leads`) — derivado de `supabase/functions/*` e dos chamadores de `invokeFunction`; nenhum suporte genérico novo aberto.
- Teste de contrato `src/__tests__/api/openapi-drift.test.ts`: positivo (13 rotas reais reconciliadas via script real) + negativos com fixtures isoladas (path ausente/excedente, método ausente/excedente) + equivalência `[name]`↔`{name}`. Nenhuma rota real editada para provar falha.
- Documentação sincronizada: `docs/api/README.md` (índice + notas de autenticação) e `public/api-docs.html` regenerado via `npm run docs:api:build`.
- Story de preparação: nenhum veredito de QA emitido; status deixado em `InReview` para avaliação de @qa (não `Done`).

### File List

#### Criado nesta preparação

- `docs/stories/2026-07-17-rec-406-sincronizar-openapi.md`

#### Modificado / criado na implementação

- `docs/api/openapi.yaml` (modificado — 7 paths, tags, securityScheme SSR, parâmetros e schemas)
- `scripts/check-openapi-drift.mjs` (modificado — normalização dinâmica + exports + guard CLI)
- `scripts/check-openapi-drift.d.mts` (criado — tipos das funções puras do checker)
- `src/__tests__/api/openapi-drift.test.ts` (criado — teste de contrato positivo/negativo)
- `docs/api/README.md` (modificado — índice e notas de autenticação)
- `public/api-docs.html` (regenerado a partir da spec)
