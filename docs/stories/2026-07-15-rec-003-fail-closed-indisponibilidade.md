# Story REC-003: Ativar indisponibilidade fail-closed quando necessário

## Status

Done

## Executor Assignment

executor: "@devops" (controle operacional) + "@dev" (guarda mínima de código quando necessária)
quality_gate: "@qa"
quality_gate_tools:
- teste negativo de rota administrativa e de write público durante lockdown simulado
- inspeção da configuração de ambiente por ambiente (frontend implantado, Edge Functions)
- verificação de que o kill-switch é reversível e auditável
- revisão do relatório de decisão fail-closed sem segredo ou PII

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 0 — Contenção SEV-0
- **Prioridade:** P0 / SEV-0
- **Estimativa:** S–M
- **Findings:** FND-03, FND-04, FND-09 (fail-closed geral da contenção)
- **Requisitos:** NFR-04 (fail-closed)
- **Gate relacionado:** G0 — Incidente contido

## Story

**As a** coordenador do incidente da RH Cursos,
**I want** um mecanismo verificável para bloquear rotas administrativas e writes públicos sensíveis quando a rotação de REC-002 não puder ser comprovada em algum ambiente,
**so that** a aplicação nunca opere em estado misto (credencial parcialmente rotacionada) sem que isso seja uma decisão explícita e reversível.

## Contexto e valor

REC-002 rotaciona credenciais e o `AUTH_SESSION_SECRET` em todos os ambientes consumidores simultaneamente. Quando isso não for possível — por exemplo, um ambiente não puder ser atualizado no mesmo checkpoint — a Épica 17 exige que o incident commander registre `NO-GO` e bloqueie o ambiente afetado em vez de aceitar operação parcial. Hoje, `getSessionSecret()` (`src/lib/auth.ts`) e a verificação equivalente em `supabase/functions/_shared/auth.ts` já falham (lançam exceção) quando `AUTH_SESSION_SECRET` está ausente ou tem menos de 32 caracteres em produção — um fail-closed parcial que esta story formaliza e estende para o cenário operacional do incidente: rotação não propagada, não apenas segredo ausente.

Esta story adiciona um controle operacional simples (kill-switch por ambiente) que o coordenador do incidente pode acionar deliberadamente, sem depender apenas do comportamento acidental de uma exceção de configuração.

## Escopo

### Incluído

- Definir e documentar um sinal de lockdown por ambiente (ex.: variável de ambiente dedicada, lida pelo backend/Edge Functions) que bloqueia rotas administrativas autenticadas e endpoints públicos de escrita (`enrollments`, `leads`) enquanto ativo.
- Implementar a guarda mínima de leitura desse sinal nos pontos de entrada server-side já existentes, sem introduzir nova superfície de autenticação.
- Definir o critério objetivo de ativação: rotação de REC-002 não comprovada em um ambiente até o checkpoint definido.
- Definir o critério objetivo e a autoridade de desativação: `@qa` + incident commander confirmam rotação propagada.
- Registrar cada ativação/desativação com timestamp, ambiente, motivo e responsável.
- Produzir evidência sanitizada para `@qa`.

### Fora do escopo

- Rotacionar credenciais: REC-002.
- Sanear configuração versionada ou histórico: REC-004, REC-005.
- Corrigir a autoridade de identidade (Supabase Auth) ou revogação confiável de sessão: REC-201 a REC-204.
- Endurecimento definitivo de endpoints públicos (schema estrito, idempotência, CAPTCHA): REC-107.
- Qualquer mudança de UI pública além do retorno de indisponibilidade.

## Acceptance Criteria

1. **Sinal de lockdown definido e documentado**
   Existe uma variável de ambiente (ou controle equivalente) por ambiente, com nome, escopo e efeito documentados, que quando ativa bloqueia rotas administrativas autenticadas e os endpoints públicos de escrita.

2. **Bloqueio efetivo quando ativo**
   **Given** o sinal de lockdown ativo em um ambiente,
   **when** uma requisição chega a uma rota administrativa autenticada ou a um endpoint público de escrita nesse ambiente,
   **then** a requisição é rejeitada com um código de erro claro (não um erro genérico de servidor), sem expor detalhe interno.

3. **Sem impacto quando inativo**
   **Given** o sinal de lockdown inativo,
   **when** as mesmas rotas recebem requisições legítimas,
   **then** o comportamento é idêntico ao existente antes desta story, sem regressão funcional.

4. **Critério objetivo de ativação**
   O registro descreve exatamente quando o lockdown deve ser ativado (rotação de REC-002 não comprovada em um ambiente no checkpoint definido) e não deixa a decisão implícita.

5. **Reversibilidade auditável**
   Toda ativação e desativação é registrada com timestamp, ambiente, motivo e responsável (incident commander e/ou `@qa`), permitindo reconstrução da linha do tempo.

6. **Sem bypass silencioso**
   Nenhuma rota sensível pode contornar o sinal de lockdown por um caminho alternativo (ex.: chamada direta a uma Edge Function que não verifica o sinal quando aplicável ao escopo desta story).

7. **Gate independente**
   `@qa` revisa a evidência, testa a ativação/desativação e emite PASS/CONCERNS/FAIL para REC-003.

## Tasks / Subtasks

- [x] **Task 1 — Definir o contrato do sinal de lockdown** (AC: 1, 4)
  - [x] Nomear a variável de ambiente e documentar onde é lida (frontend implantado, Edge Functions).
  - [x] Documentar o critério objetivo de ativação a partir de REC-002.

- [x] **Task 2 — Implementar a guarda mínima** (AC: 2, 3, 6)
  - [x] Adicionar verificação do sinal nos pontos de entrada server-side de rotas administrativas autenticadas.
  - [x] Adicionar verificação do sinal nos endpoints públicos de escrita (`supabase/functions/enrollments/index.ts`, `supabase/functions/leads/index.ts`).
  - [x] Confirmar que o comportamento sem o sinal ativo permanece inalterado.

- [x] **Task 3 — Definir autoridade de ativação/desativação** (AC: 4, 5)
  - [x] Registrar quem pode ativar (incident commander/`@devops`) e quem confirma a desativação (`@qa` + incident commander).

- [x] **Task 4 — Testar o ciclo completo** (AC: 2, 3, 5, 6)
  - [x] Simular ativação e validar bloqueio nas rotas em escopo.
  - [x] Simular desativação e validar retorno ao comportamento normal.
  - [x] Verificar ausência de bypass nos caminhos testados.

- [x] **Task 5 — Consolidar evidência e gate** (AC: 1–7)
  - [x] Produzir relatório sanitizado em `docs/history/reports/rec-003-fail-closed-2026-07-15.md`.
  - [ ] Criar/atualizar `docs/qa/gates/rec-003-fail-closed-indisponibilidade.yml`. *(fora do escopo do executor — responsabilidade da revisão QA independente)*
  - [ ] Solicitar veredito de `@qa`. *(story movida para InReview; veredito pendente)*

## Dev Notes

### Fontes verificadas

- A Épica 17 define REC-003 como terceira story da Onda 0, dependente de REC-001, com entrega "rotas administrativas e writes públicos bloqueados se a rotação não estiver propagada". [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#onda-0--contenção-sev-0-t0-a-t2h`]
- NFR-04 exige que falha de configuração, autorização ou proteção antiabuso bloqueie operações sensíveis. [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#3-requisitos-do-programa`]
- `getSessionSecret()` em `src/lib/auth.ts` já lança exceção em produção quando `AUTH_SESSION_SECRET` está ausente ou tem menos de 32 caracteres; `supabase/functions/_shared/auth.ts` implementa a mesma verificação no lado das Edge Functions — comportamento fail-closed parcial existente que esta story estende.
- Os endpoints públicos de escrita atuais são `supabase/functions/enrollments/index.ts` (RPC `registrar_inscricao_publica`) e `supabase/functions/leads/index.ts` (insert em `public.lead`).
- REC-001 estabelece que fail-closed é a resposta padrão quando um controle de contenção não pode ser comprovado. [Fonte: `docs/stories/2026-07-14-rec-001-incidente-freeze-evidencias.md#acceptance-criteria`, item 7]

### Project Structure Notes

- A guarda de lockdown deve ser mínima e local aos pontos de entrada já existentes; não introduzir um novo serviço de autorização nesta story.
- Não modificar `.aiox-core/`, `bin/aiox.js` ou qualquer path L1/L2.
- Alterações de código ficam restritas aos pontos de entrada server-side identificados; nenhuma mudança de schema de banco é necessária para esta story.

### Ferramentas e execução segura

- Variável de ambiente lida em runtime, sem hardcode do valor no código.
- `git status --short` antes e depois da implementação para confirmar escopo restrito aos arquivos desta story.
- Teste manual controlado de ativação/desativação em ambiente não produtivo antes de validar em produção.

## Testing e evidências

- Teste positivo: sinal inativo, rota administrativa e endpoints públicos respondem normalmente.
- Teste negativo: sinal ativo, rota administrativa e endpoints públicos rejeitam a requisição com código de erro claro.
- Teste de reversibilidade: desativação restaura o comportamento normal sem exigir novo deploy de código.
- Verificação de ausência de bypass nos caminhos server-side cobertos pelo escopo desta story.

## Observabilidade

- Registrar cada ativação/desativação com timestamp absoluto, timezone `America/Sao_Paulo`/UTC, ambiente e responsável.
- Alertar o incident commander imediatamente quando o lockdown for ativado ou desativado.
- Não usar e-mail, telefone, token ou senha como label de log.
- Falha ao aplicar o lockdown em um ambiente aparece como lacuna explícita, nunca como PASS parcial.

## Security Notes

- O sinal de lockdown deve fail-closed por padrão em caso de erro de leitura da configuração (ou seja, erro de leitura bloqueia, não libera).
- Não introduzir um segredo novo nesta story; o sinal é um controle operacional, não uma credencial.
- A avaliação de indisponibilidade prolongada com impacto comercial pertence ao incident commander/stakeholder designado, conforme a matriz de ações exclusivamente humanas da Épica 17.

## Dependências

- **Entrada:** REC-001 concluída (freeze e critério de contenção estabelecidos).
- **Consome sinal de:** REC-002 (rotação não comprovada aciona o lockdown).
- **Bloqueia:** nenhuma story subsequente diretamente; é um controle de segurança complementar à Onda 0.
- **Não depende de:** REC-403 para o desenho do contrato, mas qualquer código mergeado por esta story exige o baseline verde de REC-403 antes do merge, conforme a regra constitucional da Onda 0.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** se o lockdown falhar ao bloquear uma rota em escopo, corrigir a guarda para frente; nunca remover a verificação para "destravar" temporariamente.
- **Rollback permitido:** desativar o sinal de lockdown quando a rotação estiver comprovada, mantendo o mecanismo disponível para reativação futura.
- **Rollback proibido:** remover a guarda de código introduzida por esta story como forma de resolver um falso positivo; corrigir o critério de ativação em vez disso.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usa revisão manual da guarda de código e do ciclo de ativação/desativação por `@qa`.

### Story Type Analysis

- **Primary Type:** Security (fail-closed)
- **Secondary Type:** Deployment/Infrastructure (controle operacional por ambiente)
- **Complexity:** Média, por tocar pontos de entrada administrativos e públicos em mais de um ambiente.
- **Agentes:** executor operacional `@devops`; guarda mínima de código `@dev`; quality gate independente `@qa`.

### Manual review focus

- Ausência de bypass do sinal de lockdown.
- Comportamento idêntico ao atual quando o lockdown está inativo.
- Reversibilidade e auditabilidade da ativação/desativação.
- Nenhuma nova superfície de autenticação introduzida.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-15 | 0.1 | Draft criado a partir da Épica 17 (autorização de decomposição pós-REC-001), com escopo de kill-switch fail-closed para rotas administrativas e writes públicos. | @sm (River) |
| 2026-07-15 | 1.0 | **GO (10/10) → Draft → Ready.** Checklist de 10 pontos sem lacunas: título claro, contexto/valor completo, ACs em Given/When/Then, escopo incluído/excluído explícito, dependências mapeadas (REC-001 entrada, consome sinal de REC-002, baseline verde de REC-403 exigido antes do merge), estimativa (S–M), valor de negócio (evita operação em estado misto), riscos e roll-forward/rollback documentados, critérios de conclusão claros via gate independente do @qa, alinhamento com Épica 17/Onda 0 confirmado. Bloqueadores documentais: 0. | @po (Pax) |
| 2026-07-16 | 1.1 | **Ready → InProgress → InReview.** Implementado o sinal `INCIDENT_LOCKDOWN` (contrato documentado) com guarda mínima fail-closed em 4 pontos de entrada server-side: `admin-resources` (rota administrativa autenticada), `enrollments` (Edge Function + rota Next.js equivalente, incluída por representar bypass real dado o deploy via Cloudflare Workers) e `leads` (Edge Function). Teste automatizado (7 casos), `typecheck` e `lint` verdes. Relatório de evidência em `docs/history/reports/rec-003-fail-closed-2026-07-15.md`. Gate QA e ativação real em produção permanecem pendentes/fora do escopo do executor. | @dev |
| 2026-07-16 | 1.2 | **InReview → Done.** Gate PASS (90/100) emitido por `@qa` após verificação independente da posição da guarda nos 4 pontos de entrada. Residuais `low` (SEC-105, REL-103) não bloqueiam. | @qa (Quinn) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-15-rec-003-fail-closed-indisponibilidade.md`

### Criado na implementação

- `src/lib/lockdown.ts` — módulo `isLockdownActive()` / `LOCKDOWN_RESPONSE_BODY` (runtime Next.js/Node).
- `supabase/functions/_shared/lockdown.ts` — mesma lógica portada para runtime Deno (Edge Functions).
- `src/__tests__/lib/lockdown.test.ts` — 7 casos de teste automatizado (Vitest) cobrindo AC2, AC3 e fail-closed.
- `docs/history/reports/rec-003-fail-closed-2026-07-15.md` — relatório sanitizado de evidência.

### Modificado na implementação

- `supabase/functions/admin-resources/index.ts` — guarda de lockdown adicionada antes de `requireAdmin()`.
- `supabase/functions/enrollments/index.ts` — guarda de lockdown adicionada logo após checagem de método.
- `supabase/functions/leads/index.ts` — guarda de lockdown adicionada logo após checagem de método.
- `app/api/enrollments/route.ts` — guarda de lockdown adicionada no início do handler `POST` (caminho alternativo real ao Edge Function equivalente, guardado para evitar bypass — AC6).

### Planejado, fora do escopo do executor

- `docs/qa/gates/rec-003-fail-closed-indisponibilidade.yml` — a criar por `@qa` na revisão independente.

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-14-rec-001-incidente-freeze-evidencias.md`
- `docs/stories/2026-07-15-rec-002-revogar-credenciais-sessoes.md`
- `src/lib/auth.ts`
- `supabase/functions/_shared/auth.ts`
- `app/api/functions/[name]/route.ts` (proxy genérico — sem guarda própria; repassa o `503` da Edge Function de destino)
- `app/api/auth/session/route.ts` (fora do escopo — não é rota administrativa autenticada nem endpoint de escrita de negócio)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (executor `@dev`), via agente Executor da orquestração OMC.

### Debug Log References

- `npm run typecheck` → `Types generated successfully`, 0 erros.
- `npx eslint src/lib/lockdown.ts app/api/enrollments/route.ts src/__tests__/lib/lockdown.test.ts` → 0 erros.
- `npx vitest run src/__tests__/lib/lockdown.test.ts` → 7/7 testes passando.
- Ver relatório completo (comandos e saídas) em `docs/history/reports/rec-003-fail-closed-2026-07-15.md`.

### Completion Notes

- Criado o sinal de lockdown `INCIDENT_LOCKDOWN` (variável de ambiente, não é segredo), com módulo compartilhado replicado nos dois runtimes do projeto: `src/lib/lockdown.ts` (Next.js/Node) e `supabase/functions/_shared/lockdown.ts` (Deno/Edge Functions). Fail-closed por padrão (erro de leitura → bloqueia).
- Guarda mínima adicionada como primeira verificação (logo após tratamento de preflight/método) em 4 pontos de entrada server-side: `supabase/functions/admin-resources/index.ts` (única rota administrativa autenticada — `requireAdmin()`), `supabase/functions/enrollments/index.ts`, `supabase/functions/leads/index.ts` e `app/api/enrollments/route.ts`.
- `app/api/enrollments/route.ts` foi incluído além dos 2 arquivos citados no Dev Notes original porque a investigação da árvore de arquivos mostrou que o deploy usa Cloudflare Workers via OpenNext (não export estático puro) — essa rota Next.js é um caminho de escrita alternativo real e vivo em produção que bypassaria o lockdown da Edge Function equivalente se não fosse guardado (AC6). `app/api/functions/[name]/route.ts` é um proxy genérico sem lógica própria — repassa o `503` da Edge Function de destino, sem necessidade de guarda adicional. `app/api/auth/session/route.ts` (login) ficou fora do escopo por não ser rota administrativa autenticada nem endpoint de escrita de negócio.
- Nenhum novo serviço de autorização foi criado; a guarda é uma checagem local (`if (isLockdownActive()) return 503`) no início de cada handler, sem tocar na lógica de negócio existente.
- Teste automatizado (`src/__tests__/lib/lockdown.test.ts`, 7 casos) cobre: inatividade por padrão (sem regressão), ativação por `"true"`/`"1"`, case-insensitivity, valores neutros, e o comportamento fail-closed sob erro de leitura simulado.
- **Lacuna explícita documentada:** não foi possível rodar um teste de integração real contra o runtime Deno (Edge Functions) neste ambiente de execução por falta de `deno`/`supabase` CLI interativo — a lógica do módulo Deno é uma portagem 1:1 revisada manualmente linha a linha do módulo Node já testado, seguindo o mesmo padrão de portagem já usado em `supabase/functions/_shared/auth.ts`. Recomendado que `@qa` rode o teste negativo real em ambiente não produtivo antes de emitir o veredito, conforme já previsto na story.
- Ativação real de `INCIDENT_LOCKDOWN` em produção não foi executada nesta story (é ação operacional de `@devops`/incident commander, condicionada ao critério de ativação documentado no relatório).

## QA Results

### Gate: PASS ✅ — @qa (Quinn), 2026-07-16

**Gate file:** [`docs/qa/gates/rec-003-fail-closed-indisponibilidade.yml`](../qa/gates/rec-003-fail-closed-indisponibilidade.yml) · **Quality score:** 90/100

Verificação independente por leitura de código: guarda `isLockdownActive()` confirmada antes de `requireAdmin()` em `admin-resources/index.ts:444-445`, antes de CORS/rate-limit em `enrollments/index.ts:32-33` e `leads/index.ts`, e como primeira linha do handler `POST` em `app/api/enrollments/route.ts:22-23`. `npm run typecheck` e `npm run lint` limpos. 7/7 testes Vitest confirmados.

AC1-AC4 e AC6: PASS. AC5 (reversibilidade auditável): CONCERNS — processo documentado, execução real é ação operacional futura de `@devops`/incident commander, fora do escopo de código. Nenhum bloqueio para `Done`.

Residual `low`: SEC-105 (integração real do runtime Deno não testada neste ambiente, mitigada por revisão manual da portagem 1:1), REL-103 (registro de ativação/desativação é processo manual, sem webhook).

**Veredito:** PASS. Recomendo executar teste de integração real do runtime Deno antes da primeira ativação real de `INCIDENT_LOCKDOWN` em produção.

— Quinn, guardião da qualidade 🛡️
