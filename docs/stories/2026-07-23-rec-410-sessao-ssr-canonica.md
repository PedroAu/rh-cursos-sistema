# Story REC-410 — Sessão SSR canônica, renovação e logout

## Status

Done

## Objetivo

Consolidar o ciclo de sessão da aplicação em um único contrato Supabase SSR,
garantindo renovação de cookies durante navegação SSR, expiração previsível,
logout consistente e ausência de endpoints/documentação concorrentes.

## Contexto

A aplicação já usa Supabase Auth como autoridade de identidade e cookies SSR
`httpOnly`, conforme ADR-016 e REC-204. Ainda existem dois endpoints de sessão,
o middleware não executa a renovação SSR e o controle “Manter conectado” da UI
não altera o comportamento do servidor. O logout também informa `local-only`
mesmo quando o cliente SSR pode encerrar a sessão Supabase.

## Critérios de aceitação

- [x] Existe um único endpoint público de sessão para login, leitura, renovação e logout.
- [x] O middleware atualiza a sessão Supabase quando necessário e propaga todos os cookies de resposta.
- [x] A renovação nunca expõe `access_token` ou `refresh_token` ao corpo da resposta ou ao storage do navegador.
- [x] Sessão ausente, expirada, inválida ou sem papel autorizado falha fechado com `401`/redirect para login.
- [x] O comportamento de duração da sessão é explícito; “Manter conectado” não pode ser aceito pela UI sem efeito real no servidor.
- [x] Logout local sempre remove os cookies SSR mesmo se a revogação remota falhar.
- [x] Logout global usa a sessão Supabase disponível no servidor e retorna um estado coerente com a operação realizada.
- [x] Rebaixamento ou bloqueio de papel é refletido na próxima leitura/autorização da sessão.
- [x] `/api/auth/ssr-session` é removido ou convertido em compatibilidade interna sem contrato público duplicado.
- [x] Documentação/OpenAPI deixam de descrever HMAC, tokens no corpo e o endpoint obsoleto.
- [x] Testes unitários, integração e E2E cobrem login, renovação, expiração, logout e falhas de configuração.

## Escopo

### Incluído

- `middleware.ts` e helper de atualização SSR.
- Consolidação das rotas de sessão Next.
- Cookies, renovação e logout.
- Estado de sessão no AppStore.
- Testes, documentação e contrato OpenAPI afetados.

### Fora do escopo

- Configuração de SMTP e convites.
- Cadastro/remoção de fatores MFA.
- Painel de gerenciamento de usuários.
- Alteração de schema ou policies RLS.

## Arquivos candidatos

- `middleware.ts`
- `src/lib/supabase/session.ts`
- `app/api/auth/session/route.ts`
- `app/api/auth/ssr-session/route.ts`
- `src/lib/app-store.tsx`
- `src/views/public/Login.tsx`
- `src/__tests__/app/api/auth-session-route.test.ts`
- `src/__tests__/lib/supabase-ssr-session.test.ts`
- `src/__tests__/lib/app-store.test.ts`
- `tests/route-auth.spec.ts`
- `docs/api/auth-session.md`
- `docs/api/openapi.yaml`

## Tarefas / Subtarefas

- [x] Mapear consumidores de `/api/auth/ssr-session` e definir o endpoint canônico.
- [x] Implementar helper de atualização Supabase SSR no middleware com propagação segura de cookies.
- [x] Consolidar GET/POST/DELETE de sessão e remover o contrato duplicado.
- [x] Corrigir semântica de duração de sessão removendo o checkbox sem efeito.
- [x] Corrigir logout local/global para tentar revogação global via sessão SSR.
- [x] Ajustar sincronização do AppStore para renovação e expiração sem estado otimista persistido.
- [x] Atualizar testes de rota e sessão para o contrato de logout global.
- [x] Atualizar testes do AppStore e E2E.
- [x] Atualizar documentação e OpenAPI.

## Dependências

- REC-202 — sessão Supabase SSR.
- REC-203 — autorização server-side.
- REC-204 — remoção do HMAC/localStorage/header legado.

## Riscos e mitigação

- **Lockout:** validar primeiro no projeto Supabase de teste e manter uma conta administrativa reserva.
- **Cookie perdido no Worker:** testar headers `Set-Cookie` em navegação SSR e em respostas de API.
- **Regressão de portais:** manter testes de `/admin`, `/aluno` e `/instrutor`.
- **Revogação Supabase não imediata para JWT já emitido:** manter autorização server-side e TTL documentado.

## Gates obrigatórios

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:coverage`
- `npm run build`
- `npm run test:e2e -- --grep "auth|session|logout"`
- `npm run docs:api:check-drift`
- Revisão de segurança sem achados CRITICAL/HIGH não tratados.

## Registro do agente

### File List

- `docs/stories/2026-07-23-rec-410-sessao-ssr-canonica.md`
- `src/lib/supabase/middleware.ts`
- `middleware.ts`
- `src/lib/supabase/session.ts`
- `app/api/auth/session/route.ts`
- `src/views/public/Login.tsx`
- `src/lib/app-store.tsx`
- `src/lib/supabase/rh-cursos-api.ts`
- `src/__tests__/lib/supabase-ssr-session.test.ts`
- `src/__tests__/app/api/auth-session-route.test.ts`
- `src/__tests__/api/openapi-drift.test.ts`
- `tests/helpers/integration-env.ts`
- `tests/route-auth.spec.ts`
- `tests/epic14-mantine-removal.smoke.spec.ts`
- `tests/public-journeys.spec.ts`
- `tests/epic15-admin-dashboard-fidelity.spec.ts`
- `src/views/public/Blog.tsx`
- `docs/api/auth-session.md`
- `docs/api/README.md`
- `docs/api/edge-functions.md`
- `docs/api/openapi.yaml`
- `docs/qa/gates/rec-410-sessao-ssr-canonica.yml`

### Change Log

- 2026-07-23 — Story criada a partir do plano de autenticação e do ADR-016.
- 2026-07-23 — Middleware SSR, logout global server-side e remoção do controle “Manter conectado” implementados; gates locais parciais verdes.
- 2026-07-23 — Endpoint SSR duplicado removido e consumidores/documentação/OpenAPI reconciliados; unit, lint, typecheck, build e drift verdes. Fixtures E2E do login foram atualizadas para o contrato canônico e para a remoção do checkbox sem efeito. E2E com mutações ainda depende de configuração Supabase isolada.
- 2026-07-23 — Tipo de sessão legado deixou de expor a opção `remember`, mantendo duração controlada exclusivamente pela configuração SSR/Supabase.
- 2026-07-24 — Gates finais executados com o Supabase de teste isolado (`hwpsrujkxjhmmwphqdlz`), mantendo o projeto de produção (`rajjoakjkmmzcwtabuxx`) separado: `test:coverage` (766 testes), `docs:api:check-drift` (16 rotas) e E2E auth/session/logout (26/26) verdes. Story encaminhada de `InProgress` para `InReview`, aguardando validação independente de QA.

### CodeRabbit Integration

- Tipo primário: Security / Architecture.
- Agentes: `@dev`, `@architect`, `@qa`.
- Focos: cookies SSR, renovação, revogação, fail-closed, ausência de tokens no cliente e compatibilidade de rotas.

## QA Results

### Review Date: 2026-07-24

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Implementação coerente com o contrato SSR canônico. A revisão confirmou o
fluxo único de sessão, autorização server-side, propagação de cookies e
logout global/local sem tokens no cliente.

### Refactoring Performed

- `src/lib/supabase/session.ts`: `signOutSSR` agora trata rejeições de rede e
  retorna `false`, garantindo que a limpeza local continue.
- `src/lib/supabase/middleware.ts`: falhas de refresh não geram erro 500; os
  guards server-side continuam aplicando o fail-closed.
- `src/lib/supabase/rh-cursos-api.ts`, `src/lib/app-store.tsx` e
  `src/views/public/Blog.tsx`: baseline de teste só é habilitado em build de
  teste e com cookie de nome/valor exatos.
- `src/__tests__/lib/supabase-ssr-session.test.ts`: adicionada cobertura para
  rejeição da revogação global.

### Compliance Check

- Coding Standards: ✓
- Project Structure: ✓
- Testing Strategy: ✓
- All ACs Met: ✓

### Security Review

PASS. Não foram encontrados achados CRITICAL/HIGH válidos no escopo da REC-410.
O achado de rejeição no logout foi corrigido durante a revisão. Achados do
scanner sobre artefatos históricos fora do escopo foram registrados como não
bloqueantes.

### Performance Considerations

PASS. Renovação SSR ocorre no middleware sem expor tokens; não foram
identificados novos round-trips desnecessários no contrato de sessão.

### Evidence

- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run test:unit` — 766/766 PASS
- `npm run test:coverage` — PASS
- `npm run build` — PASS
- `npm run docs:api:check-drift` — 16 rotas reconciliadas, PASS
- E2E auth/session/logout em Supabase isolado — 26/26 PASS

### Files Modified During Review

`src/lib/supabase/session.ts`, `src/lib/supabase/middleware.ts`,
`src/lib/supabase/rh-cursos-api.ts`, `src/lib/app-store.tsx`,
`src/views/public/Blog.tsx` e
`src/__tests__/lib/supabase-ssr-session.test.ts`. Solicita-se ao @dev
reconciliar esses caminhos no File List antes do fechamento final.

### Gate Status

Gate: PASS → `docs/qa/gates/rec-410-sessao-ssr-canonica.yml`

### Recommended Status

✓ Ready for Done após atualização do File List; a promoção final para `Done`
depende do fluxo de @devops conforme a constituição AIOX.

### QA Follow-up: 2026-07-24

File List reconciliado com os arquivos alterados na implementação e na
revisão QA. A pendência documental foi encerrada; a story está pronta para o
fechamento por @devops.
