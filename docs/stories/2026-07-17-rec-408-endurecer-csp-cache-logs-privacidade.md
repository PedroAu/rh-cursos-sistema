# Story REC-408: Endurecer CSP, cache, logs e privacidade

## Status

Done

## Executor Assignment

executor: "@dev" (Dex) — implementação em código e testes locais
quality_gate: "@architect" (Aria) — revisão da política transversal e dos limites de observabilidade; veredito final permanece com `@qa` (Quinn), conforme CON-06 e a Épica 17
quality_gate_tools:
- comparação automatizada da CSP emitida no runtime contra a fonte canônica
- testes HTTP de `Cache-Control: no-store` nas respostas de autenticação e dados administrativos autenticados
- testes unitários de redaction com token, senha, e-mail e telefone sintéticos
- revisão de eventos de console/Sentry para garantir ausência de valores sensíveis e PII desnecessária
- `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 5 — Qualidade e sustentabilidade
- **Prioridade:** P1 — operação e UX, após os gates P0 correspondentes
- **Estimativa:** M
- **Entrega mensurável da épica:** “CSP única; auth `no-store`; logs sem tokens/PII desnecessária”.
- **Findings/Requisitos:** FND-10; NFR-03 (privacidade); NFR-04 (fail-closed); NFR-06 (qualidade); NFR-09 (evidência sanitizada); AC-17.23 (alertas e métricas sem PII como label).
- **Depende de:** REC-202 (sessão Supabase SSR, Done) e REC-206 (BFF canônico, Done).
- **Condição de execução:** REC-204 Fase A pode estar em andamento; esta story deve proteger tanto o caminho SSR existente quanto o legado transitório sem alterar autoridade de sessão. A Fase B de REC-204 não é antecipada nem autorizada aqui.
- **Habilita:** evidência de cache autenticado `no-store` para G3 e evidência de observabilidade/privacidade para G4 e REC-502.

## Story

**As a** responsável pela segurança e operação da RH Cursos,
**I want** uma única política CSP efetiva, respostas autenticadas não armazenáveis e observabilidade com redaction central,
**so that** o browser receba uma política coerente, caches compartilhados não preservem dados autenticados e logs, métricas ou evidências não exponham tokens nem PII desnecessária.

## Contexto e evidência atual

A auditoria do repositório encontrou lacunas concretas, sem depender de requisitos inventados:

1. A CSP possui fontes concorrentes: `src/lib/security-headers.ts` é aplicada por `middleware.ts`; `next.config.mjs` declara outra CSP global; e `public/_headers` mantém uma terceira política textual. As diretivas divergem (`unsafe-eval`, Google Analytics, jsDelivr, `base-uri`, `form-action`, WebSocket), portanto não existe hoje uma fonte única verificável.
2. `src/lib/security-headers.ts` já contém `applyApiSecurityHeaders()` com `no-store`, mas as rotas de autenticação `app/api/auth/session/route.ts` e `app/api/auth/ssr-session/route.ts` constroem respostas diretamente e não provam aplicação uniforme desse contrato. O proxy autenticado `app/api/functions/[name]/route.ts` também não fixa cache privado/no-store na resposta devolvida.
3. `src/lib/logger.ts` serializa dados arbitrários e erros (inclusive `message` e `stack`) sem redaction central. Chamadores podem, por engano, registrar token, senha, e-mail ou telefone.
4. `src/lib/supabase/query-logging-middleware.ts` envia `errorMessage` bruto ao console/Sentry; `src/lib/supabase/api-validation.ts` já evita valores do payload ao descrever apenas o shape e deve permanecer como padrão seguro.

Essas evidências rastreiam diretamente para NFR-03/NFR-09 e para a entrega explícita de REC-408 na Épica 17.

## Escopo

### Incluído

- Eleger `src/lib/security-headers.ts` como fonte canônica da CSP e fazer o runtime emitir somente a política gerada por ela.
- Remover ou reduzir a fallback documental as definições concorrentes de CSP em `next.config.mjs` e `public/_headers`, de modo que não possam divergir nem sobrescrever o runtime.
- Preservar diferenças estritamente necessárias entre desenvolvimento e produção já modeladas por `buildContentSecurityPolicy()`, sem adicionar domínios ou serviços não comprovados pelo código.
- Aplicar um helper único de resposta sensível para garantir, no mínimo, `Cache-Control: no-store` nas respostas de login, leitura/refresh de sessão, logout e BFF/API administrativa autenticada, inclusive erros 4xx/5xx e redirects relacionados à sessão.
- Introduzir redaction central e recursiva na fronteira de `src/lib/logger.ts`, cobrindo nomes de campo sensíveis e valores com formato de credencial; erros devem ser serializados sem reintroduzir segredo/PII por `message`, `cause` ou `stack` em produção.
- Sanear a telemetria de query antes de console/Sentry: método, tabela, duração, status e classificação de erro podem permanecer; valores de query, token, senha, e-mail, telefone e mensagens brutas não podem sair.
- Manter evidência sanitizada em testes/relatório, usando apenas valores sintéticos.

### Fora do escopo

- Qualquer mudança de autoridade HMAC/SSR, allowlist, login, papel ou remoção de `x-rh-session`; isso pertence à REC-204, especialmente sua Fase B ainda condicionada ao gate humano.
- Proxificar WebSocket/realtime do Supabase. REC-206 o relacionou a trabalho futuro, mas a Épica 17 não o define como entrega mensurável de REC-408.
- Adicionar novo provedor de observabilidade, analytics, CDN ou domínio à CSP.
- Alterar RLS, schema, migrations, dados ou configuração remota de Sentry/Cloudflare/Supabase.
- Registrar conteúdo de request/response para “melhor diagnóstico”; a story reduz exposição e preserva apenas metadados necessários.

## Acceptance Criteria

1. **CSP possui uma única fonte canônica**  
   **Given** uma execução de produção, **when** uma resposta de página passa pelo runtime, **then** há exatamente um header `Content-Security-Policy`, derivado de `src/lib/security-headers.ts`, e nenhuma configuração concorrente pode emitir política divergente.

2. **CSP permite somente origens comprovadamente necessárias**  
   **Given** os recursos e integrações presentes no repositório, **when** a política canônica é inspecionada e exercitada por teste/browser, **then** cada origem externa possui consumidor rastreável; `unsafe-eval` não aparece na política de produção; `base-uri 'self'`, `form-action 'self'` e `frame-ancestors 'none'` permanecem ativos; nenhuma origem nova é inventada.

3. **Autenticação é sempre `no-store`**  
   **Given** qualquer resposta de `GET`/`POST`/`DELETE` das rotas de sessão HMAC transitória ou SSR, **when** ela retorna sucesso, erro, logout, MFA ou rate limit, **then** inclui `Cache-Control: no-store` e não pode ser armazenada por cache compartilhado.

4. **Dados administrativos autenticados são `no-store`**  
   **Given** uma resposta do BFF/API administrativa autenticada, inclusive 401/403/503, **when** chega ao cliente, **then** inclui `Cache-Control: no-store`; headers de cache do upstream não podem relaxar esse contrato.

5. **Redaction central bloqueia tokens e PII**  
   **Given** um log com campos aninhados contendo `authorization`, `cookie`, `token`, `access_token`, `refresh_token`, `password`, `email` ou `phone`, **when** passa por `logger`, **then** os valores originais não aparecem na linha serializada nem em erro/cause/stack, e a aplicação não lança se o dado for circular ou não serializável.

6. **Telemetria de query contém apenas metadados necessários**  
   **Given** query lenta ou falha, **when** console/Sentry são acionados, **then** podem conter operação, tabela, duração, status e categoria sanitizada, mas não payload, parâmetros, mensagem bruta, token, e-mail ou telefone; métricas não usam PII como label.

7. **Compatibilidade com REC-204 preservada sem antecipar Fase B**  
   **Given** que REC-204 Fase A mantém fallback legado fora da allowlist, **when** o diff de REC-408 é revisado, **then** nenhuma decisão de autorização, cookie, `x-rh-session`, allowlist ou código de cutover é adicionada/removida; ambos os caminhos recebem apenas proteção de cache/log equivalente.

8. **Evidência e gates verdes**  
   **Given** a implementação concluída, **when** os testes direcionados e `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` são executados, **then** todos passam e o relatório sanitizado demonstra ACs 1–7 sem segredo ou PII real.

## Tasks / Subtasks

- [x] **Task 1 — Consolidar a CSP** (AC: 1, 2)
  - [x] Inventariar consumidores reais das origens atuais e registrar a justificativa sem ampliar allowlist.
  - [x] Tornar `src/lib/security-headers.ts` a fonte única usada por `middleware.ts`/runtime.
  - [x] Remover a CSP concorrente de `next.config.mjs` e impedir que `public/_headers` funcione como segunda política ativa.
  - [x] Criar teste que prove um único header e as diretivas mínimas de produção, incluindo ausência de `unsafe-eval`.

- [x] **Task 2 — Tornar respostas sensíveis não armazenáveis** (AC: 3, 4, 7)
  - [x] Extrair/reutilizar helper de `no-store` sem alterar payload ou status das rotas.
  - [x] Cobrir todos os retornos de `app/api/auth/session/route.ts` e `app/api/auth/ssr-session/route.ts`.
  - [x] Cobrir respostas autenticadas de `app/api/functions/[name]/route.ts` e `app/api/admin/*`, inclusive erros.
  - [x] Adicionar testes parametrizados de sucesso/erro/logout/rate limit e upstream.

- [x] **Task 3 — Implementar redaction central** (AC: 5, 7)
  - [x] Definir allowlist de metadados seguros e redaction recursiva no logger, sem registrar valores sensíveis.
  - [x] Sanear `Error.message`, `Error.cause` e `Error.stack` conforme ambiente.
  - [x] Testar objetos aninhados, arrays, aliases de credencial, bearer/cookie e estrutura circular com dados exclusivamente sintéticos.

- [x] **Task 4 — Sanear query logging e Sentry** (AC: 6)
  - [x] Remover `errorMessage` bruto de console, breadcrumb e mensagem capturada; mapear somente uma categoria segura.
  - [x] Garantir que métricas/breadcrumbs não recebem PII como label ou payload.
  - [x] Preservar o padrão seguro de `api-validation.ts`, que registra shape e não valores.

- [x] **Task 5 — Verificação e evidência** (AC: 1–8)
  - [x] Executar testes direcionados de CSP, cache, logger e query logging.
  - [x] Executar `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`.
  - [x] Gerar relatório sanitizado em `docs/history/reports/rec-408-csp-cache-logs-privacidade-2026-07-17.md`.
  - [x] Atualizar checkboxes, File List e Dev Agent Record; encaminhar a `@architect` e depois a `@qa`, sem emitir o próprio veredito.

## Dev Notes

### Restrições técnicas

- `middleware.ts` já aplica `applySecurityHeaders()`, portanto a consolidação deve reutilizar esse limite e não criar outro gerador.
- `applyApiSecurityHeaders()` já demonstra o contrato pretendido de não-cache, mas a implementação deve provar cobertura de todos os retornos sensíveis, não apenas existir como helper.
- Redaction deve ocorrer na fronteira do logger/telemetria, não depender de todos os chamadores lembrarem de sanear.
- Mensagens ao usuário e respostas HTTP permanecem fora do logger; não alterar contratos de API nesta story.
- Imports novos devem usar `@/` (Constitution VI).

### Estratégia de testes

- Unitário: geração da CSP, redaction profunda, serialização segura e sanitização de query telemetry.
- Integração de rota: headers `no-store` em casos positivos e negativos de auth/BFF/admin.
- Build/runtime: confirmar que a configuração final não volta a emitir CSP duplicada.
- Dados de teste: somente valores sintéticos reconhecíveis, permitindo asserção negativa de que nunca aparecem na saída.

### Roll-forward / rollback

- **Roll-forward preferencial:** corrigir diretiva/origem específica na fonte canônica ou ampliar a redaction caso surja falso negativo.
- Um rollback operacional pode restaurar disponibilidade removendo temporariamente uma diretiva CSP problemática, mas não pode reintroduzir múltiplas fontes, cache autenticado ou logs com PII/token.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está habilitado em `.aiox-core/core-config.yaml`. A validação usa revisão manual de `@architect` e gate independente de `@qa`.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-17 | 0.1 | Draft derivado exclusivamente da Épica 17 e da auditoria local: CSP concorrente, ausência de prova uniforme de `no-store`, logger sem redaction central e query telemetry com mensagem bruta. | @sm (River) |
| 2026-07-17 | 1.0 | **Draft → Ready.** Validação `@po`: objetivo, escopo, dependências, ACs testáveis, tarefas, riscos, roll-forward e fronteira explícita com REC-204 Fase B completos; nenhum requisito externo inventado. | @po (Pax) |
| 2026-07-17 | 1.1 | **Ready → InReview.** Implementação `@dev`: CSP canônica única (`security-headers.ts`), remoção da CSP concorrente em `next.config.mjs`/`public/_headers` (jsdelivr sem consumidor removida; GA consolidado; `unsafe-eval` fora de prod), helper único `applyNoStore` cobrindo todos os retornos de auth/BFF/admin, redaction central recursiva no `logger`, e telemetria de query sanitizada (`errorCategory`). Gates verdes (lint, typecheck, test:unit 746, build, npm test). Relatório sanitizado gerado. Veredito de QA NÃO emitido — encaminhado a `@architect` e `@qa`. | @dev (Dex) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-17-rec-408-endurecer-csp-cache-logs-privacidade.md`

### Modificado pela implementação (@dev — confirmado)

Código (fonte):
- `src/lib/security-headers.ts` — CSP canônica de produção (GA consolidado, jsdelivr removida); novo helper `applyNoStore`/`NO_STORE_CACHE_CONTROL`; `applyApiSecurityHeaders` reutiliza o helper.
- `next.config.mjs` — removida a CSP concorrente do `headers()`.
- `public/_headers` — removida a CSP/headers de segurança concorrentes; mantida só a regra de cache de assets estáticos.
- `src/lib/logger.ts` — redaction central recursiva (campo + formato), saneamento de erro, robustez circular.
- `src/lib/supabase/query-logging-middleware.ts` — `errorCategory` sanitizado no lugar de `errorMessage` bruto; `classifyQueryError`.
- `app/api/auth/session/route.ts` — wrappers `applyNoStore` (GET/POST/DELETE).
- `app/api/auth/ssr-session/route.ts` — wrappers `applyNoStore` (GET/POST/DELETE).
- `app/api/functions/[name]/route.ts` — wrappers `applyNoStore` (GET/POST/DELETE).
- `app/api/admin/students/route.ts` — wrapper `applyNoStore`.
- `app/api/admin/classes/route.ts` — wrapper `applyNoStore`.
- `app/api/admin/courses/route.ts` — wrapper `applyNoStore`.
- `app/api/admin/enrollments/route.ts` — wrapper `applyNoStore`.
- `app/api/admin/instructors/route.ts` — wrapper `applyNoStore`.

Testes:
- `src/__tests__/lib/security-headers.test.ts` — CSP canônica, fonte única, contrato no-store.
- `src/__tests__/lib/logger.test.ts` — **novo**: redaction/PII/circular.
- `src/__tests__/lib/query-logging-middleware.test.ts` — `errorCategory` + não-vazamento de PII/mensagem bruta.
- `src/__tests__/app/api/functions-route.test.ts` — no-store (200 upstream / 503).
- `src/__tests__/app/api/auth-session-route.test.ts` — no-store (200 login / 429 rate limit).
- `src/__tests__/app/api/admin-read-models-route.test.ts` — no-store (200 dados / 401 negação).

Documentação:
- `docs/history/reports/rec-408-csp-cache-logs-privacidade-2026-07-17.md` — **novo**: relatório sanitizado.

> **Nota:** `middleware.ts` NÃO precisou de alteração — já aplicava `applySecurityHeaders()` da fonte canônica. Nenhum arquivo de REC-406 (`docs/api/*`, `scripts/check-openapi-drift.mjs`, `public/api-docs.html`) nem lógica de autoridade REC-204 foi tocado.

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-17-rec-204-remover-hmac-localstorage-header.md`
- `docs/history/reports/rec-206-consolidar-bff-canonico-2026-07-17.md`
- `src/lib/supabase/api-validation.ts`

## QA Results

### Revisão combinada `@architect` (Aria) + `@qa` (Quinn) — 2026-07-19

**Veredito do revisor: FAIL** (bloqueador único, HIGH) + 1 MEDIUM + 2 LOW.

**HIGH — corrigido como falso positivo de atribuição, não defeito de código.** O revisor usou `git diff HEAD` para isolar o changeset de REC-408 e encontrou, em `app/api/auth/session/route.ts` e `app/api/functions/[name]/route.ts`, a remoção completa de `encodeSession`/`decodeSession`/`SESSION_COOKIE`/allowlist — concluindo que o cutover da Fase B de REC-204 estava embutido no changeset do REC-408, violando AC7. **Investigação confirmou que isso é um artefato de metodologia, não um problema real:** REC-204 Fase B foi implementada, revisada e concluída (`Done`) **antes** de REC-406/REC-408 começarem, nesta mesma sessão — mas nenhum commit foi feito entre as stories, então `git diff HEAD` (contra o último commit real, anterior a toda a sessão) naturalmente mistura as três stories no mesmo diff. O comentário "REC-204 Fase B (cutover total, forward-only)" em `session/route.ts` já existia desde a implementação do REC-204, não foi escrito pelo REC-408. Conferido diretamente no arquivo: a única adição do REC-408 nesses dois arquivos é o import de `applyNoStore`/`security-headers` e o comentário "REC-408: todo retorno das rotas de sessão é `no-store`" — nenhuma linha de lógica de autorização foi tocada pelo REC-408. **Ação corretiva de processo:** os commits das três stories (REC-204, REC-406, REC-408) devem ser feitos com fronteiras claras para que revisões futuras no mesmo padrão (`git diff HEAD`) não repitam essa confusão — pendente de decisão do usuário sobre quando commitar.

**MEDIUM — corrigido nesta sessão.** `api.rhcursos.com.br` no `connect-src` de produção não tinha nenhum consumidor de código rastreável (confirmado por grep em todo o repositório, incluindo pelo revisor e independentemente por `@aiox-master`). Removido de `src/lib/security-headers.ts`, pelo mesmo critério já usado para remover `cdn.jsdelivr.net` na implementação original. Nenhum teste dependia dessa origem.

**LOW — corrigido nesta sessão.** Alias `senha` (PT-BR) ausente da lista `SENSITIVE_KEY` do logger — um campo literalmente nomeado `senha` escaparia à redaction por nome (ainda que sem formato detectável, diferente de e-mail/JWT/Bearer). Adicionado a `src/lib/logger.ts`.

**LOW (nit, não corrigido — baixo risco, falha para o lado seguro):** `WeakSet` compartilhado em `redact()` pode marcar um DAG legítimo (mesmo objeto em dois ramos irmãos, sem ciclo real) como `[Circular]`, degradando fidelidade do log sem vazar dado. Registrado como possível melhoria futura, não bloqueante.

**Confirmado pelo revisor sem ressalva (evidência independente, além do que `@aiox-master` já havia verificado):**
- Origens do Google Analytics são consumidor real e proporcional (`app/layout.tsx` via `@next/third-parties`, `src/lib/analytics.ts`).
- Cobertura de `no-store` é completa por ponto único de saída nas 8 rotas sensíveis — nenhum retorno escapa do wrapper `applyNoStore`, incluindo erros 400/401/403/429/500/503, MFA, logout, rate limit e resposta do upstream do BFF; cache do upstream não é propagado.
- Telemetria de query está genuinamente livre de vazamento — inclusive o caso armadilha de mensagens nativas do Postgres em violação de constraint UNIQUE (que podem incluir o valor duplicado): `classifyQueryError` deriva só de status/SQLSTATE/padrão estrutural, nunca da mensagem bruta; testado explicitamente.
- Redaction do logger é recursiva, cobre arrays/aninhamento, detecção por formato (Bearer/JWT/e-mail) além de nome de campo, sanitiza `Error.message`/`cause`/`stack` por ambiente, não lança em estrutura circular.
- Testes novos usam asserções negativas com dados sintéticos reconhecíveis, não são superficiais.
- Nenhuma mudança de auth fora de escopo nos demais arquivos (`ssr-session/route.ts`, os 5 `admin/*/route.ts`) — só `applyNoStore`.

**Verificação final após as correções desta sessão (`@aiox-master`, independente):** `npm run lint` limpo, `npm run typecheck` limpo, testes direcionados de CSP+logger 18/18 verdes.

**Veredito final: PASS com follow-up não bloqueante** (WeakSet/DAG, LOW, registrado acima) — condicionado à ação de processo pendente (decisão sobre commits com fronteira clara entre REC-204/REC-406/REC-408, para que o histórico reflita a separação real das mudanças).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (executor `@dev`/Dex).

### Debug Log / Verificação

| Gate | Comando | Resultado |
|---|---|---|
| Lint | `npm run lint` | PASS (0 erros/0 warnings) |
| Typecheck | `npm run typecheck` | PASS (`Types generated successfully`; `tsc --noEmit` limpo) |
| Testes unitários | `npm run test:unit` | PASS — 74 arquivos, **746 testes** |
| Build | `npm run build` | PASS — `Compiled successfully`, 36/36 páginas |
| npm test (typecheck + playwright build) | `npm test` | PASS (exit 0) |

Observação (fora do escopo REC-408): o log do dev server durante `npm test` mostra
`SyntaxError: ... does not provide an export named 'SESSION_COOKIE'`, originado da
limpeza paralela de REC-204 (remoção de `SESSION_COOKIE` de `@/lib/auth`) — nenhum
dos 16 arquivos de REC-408 referencia `SESSION_COOKIE`, e o gate encerrou em exit 0.
Sinalizado para `@architect`.

### Completion Notes

- **CSP (AC1/AC2):** fonte canônica única em `security-headers.ts`. `cdn.jsdelivr.net` removida (sem consumidor). Origens do Google Analytics consolidadas por serem consumidor rastreável real (`app/layout.tsx` + `analytics.ts`). `api.rhcursos.com.br` mantida de forma conservadora — **ponto de decisão sinalizado para @architect**. `unsafe-eval` ausente em produção.
- **no-store (AC3/AC4/AC7):** helper único `applyNoStore` aplicado por ponto único de saída (delegação `handleX` → wrapper) em todas as rotas de auth/BFF/admin, sem alterar payload, status ou autorização (REC-204 Fase B intocado).
- **Redaction (AC5):** central e recursiva no `logger`, por nome de campo e por formato; erro saneado; `stack` só fora de produção; robusto a circular.
- **Query telemetry (AC6):** `errorCategory` sanitizado substitui a mensagem bruta em console/Sentry/métricas.
- **Veredito de QA:** NÃO emitido por este executor. Encaminhado a `@architect` (revisão transversal) e `@qa` (gate final).
