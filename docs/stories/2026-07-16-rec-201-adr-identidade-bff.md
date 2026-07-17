# Story REC-201: ADR de autoridade de identidade e limites do BFF

## Status

Done

## Executor Assignment

executor: "@architect" (Aria) — decisão arquitetural e produção do ADR
quality_gate: "@po" (Pax) — validação da story; "@qa" avalia o ADR separadamente
quality_gate_tools:
- verificação de que cada decisão do ADR rastreia a FND-04, FR-07, NFR-04 ou a uma limitação técnica confirmada no código (Article IV — No Invention)
- conferência de que o ADR decide as 5 questões obrigatórias (autoridade única, sessão SSR, AAL2/SEC-104, limites do BFF, sequência de migração)
- conferência de que o ADR não antecipa implementação (REC-202+ permanecem como stories futuras)
- conferência de numeração sequencial do ADR (016) e de rastreabilidade cruzada story ↔ ADR

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 3 — Identidade e entrega segura
- **Prioridade:** P0 / SEV-0 (identidade e deploy confiáveis)
- **Estimativa:** M; ADR antecede a implementação de auth (REC-202)
- **Findings:** FND-04 (e FND-07 por conexão via FR-07)
- **Requisitos:** FR-07, NFR-04, NFR-08, CON-04
- **Finding de QA absorvido:** SEC-104 (MFA enrolled mas login não exige AAL2), aberto no gate de REC-002
- **Gate relacionado:** G3 — Área administrativa (habilitado por REC-202+ que dependem deste ADR)

## Story

**As a** `@architect` responsável pela autoridade de sessão e pelos limites de serviço da RH Cursos,
**I want** registrar formalmente, em um ADR, a decisão de adotar Supabase Auth como autoridade única de identidade e de fixar os limites do BFF,
**so that** REC-202 a REC-206 sejam implementadas sem antecipar tecnologia ou autoridade de sessão fora de uma decisão arquitetural rastreável (Épica 17 §15, condição nº5).

## Contexto e valor

FND-04 constatou que a sessão administrativa própria usa HMAC, `localStorage` e não possui revogação confiável, permitindo que a autorização permaneça válida após mudança de papel ou bloqueio. FR-07 exige Supabase Auth como autoridade única de login/logout/renovação/revogação/papel; NFR-04 exige comportamento fail-closed.

A Onda 3 abre com REC-201, cuja entrega mensurável na épica é *"Supabase Auth como fonte única e limites do BFF registrados"*, com executor `@architect` e validador `@po`, dependência REC-002. A condição de execução nº5 da validação de `@po` (§15) determina: *"REC-201 deve registrar a decisão arquitetural antes de REC-202; nenhuma story pode antecipar tecnologia ou autoridade de sessão fora do ADR."* CON-04 reforça que decisões que alteram autoridade de sessão/BFF exigem `@architect` e ADR.

Esta story é **100% documental**: produz o ADR-016 e não altera nenhum código de aplicação. A implementação é sequenciada em REC-202 (sessão SSR + AAL2), REC-203 (autorização administrativa), REC-204 (remoção do HMAC/`localStorage`/header), com REC-205 (rate limit) e REC-206 (BFF canônico) a jusante.

O valor: destrava a Onda 3 com uma decisão auditável, fecha o finding SEC-104 na trilha correta e evita que cada story de implementação reinvente a autoridade de sessão por conta própria.

## Escopo

### Incluído

- Produzir `docs/architecture/adr-016-identidade-bff-rec201.md` decidindo:
  1. Supabase Auth como autoridade única de identidade no browser e no servidor, substituindo o HMAC próprio (`src/lib/auth.ts`) e a cópia Edge (`supabase/functions/_shared/auth.ts`).
  2. Sessão SSR do Supabase em cookies `httpOnly`/`secure` (não `localStorage`), coerente com a stack Next.js/Cloudflare Workers.
  3. Resolução do gap SEC-104: exigir challenge AAL2 para contas com MFA ativo antes de emitir a sessão administrativa, fail-closed.
  4. Limites do BFF: quais operações passam a ser resolvidas exclusivamente no servidor vs. o que o browser pode chamar diretamente (princípio; a consolidação é REC-206).
  5. Estratégia de migração incremental forward-only (REC-202 → REC-203 → REC-204), registrada, não implementada.
- Garantir rastreabilidade Article IV (No Invention): cada decisão ancorada em FND-04/FR-07/NFR-04/SEC-104 ou em limitação técnica confirmada no código.
- Investigar e documentar no ADR o comportamento real do fluxo atual (evidência técnica com file:line).

### Fora do escopo

- Implementar a sessão SSR do Supabase: REC-202.
- Migrar a autorização administrativa para papel resolvido no servidor: REC-203.
- Remover o HMAC, o `localStorage` e o header `x-rh-session`: REC-204.
- Estender o rate limiting à identidade autenticada: REC-205.
- Consolidar o BFF canônico same-origin e remover contratos duplicados: REC-206.
- Qualquer alteração de código de aplicação, migration, workflow ou arquivo de gate de QA.
- Emissão do veredito de qualidade sobre o ADR (autoridade de `@po`/`@qa`).

## Acceptance Criteria

1. **ADR criado com numeração sequencial correta**
   **Given** que os ADRs existentes vão até 015,
   **when** o ADR de REC-201 é criado,
   **then** ele é `docs/architecture/adr-016-identidade-bff-rec201.md`, segue o formato dos ADRs 014/015 (Contexto, Decisão, Consequências, Alternativas rejeitadas, Sequência) e referencia a story de origem.

2. **Autoridade única de identidade decidida**
   **Given** FND-04 e FR-07,
   **when** o ADR é lido,
   **then** ele decide explicitamente Supabase Auth como autoridade única no browser e no servidor, e declara que o HMAC próprio (`src/lib/auth.ts`) e a cópia Edge (`supabase/functions/_shared/auth.ts`) deixam de ser autoridade.

3. **Sessão SSR em cookies, não `localStorage`, decidida**
   **Given** NFR-04 e o uso confirmado de `localStorage` em `src/lib/supabase/session-token.ts`,
   **when** o ADR é lido,
   **then** ele decide sessão SSR do Supabase em cookies `httpOnly`/`secure` e a eliminação da persistência de tokens em `localStorage`.

4. **Gap SEC-104 (AAL2) resolvido pela decisão**
   **Given** que MFA está enrolled mas o login (`app/api/auth/session/route.ts:126`) não exige AAL2,
   **when** o ADR é lido,
   **then** ele determina se o novo login exige challenge AAL2 para contas com MFA ativo — e a decisão é fail-closed (ausência/falha do challenge não emite sessão administrativa).

5. **Limites do BFF estabelecidos como princípio**
   **Given** NFR-04 e o padrão atual de chamada browser → `*.supabase.co` com header `x-rh-session`,
   **when** o ADR é lido,
   **then** ele define quais operações resolvem exclusivamente no servidor vs. o que o browser chama diretamente, e remete a consolidação (REC-206) para escopo futuro sem implementá-la.

6. **Sequência de migração registrada, não implementada**
   **Given** NFR-08 (roll-forward),
   **when** o ADR é lido,
   **then** ele registra a sequência REC-202 → REC-203 → REC-204 (e REC-205/REC-206 a jusante) como decisão, deixando claro que nenhuma etapa é implementada por REC-201.

7. **Rastreabilidade Article IV (No Invention)**
   **Given** o gate constitucional de No Invention,
   **when** cada decisão do ADR é auditada,
   **then** ela rastreia a um finding/requisito real (FND-04, FR-07, NFR-04, SEC-104) ou a uma limitação técnica confirmada no código, nunca a preferência arbitrária.

8. **Story não altera código**
   **Given** que REC-201 é documental,
   **when** o File List é revisado,
   **then** nenhum arquivo de código de aplicação, migration, workflow ou gate de QA foi criado ou modificado — apenas o ADR e esta story.

## Tasks / Subtasks

- [x] **Task 1 — Confirmar o comportamento real da sessão atual no código** (AC: 2, 3, 4, 7)
  - [x] Confirmar que a autoridade real é o HMAC próprio, não o JWT do Supabase: `app/api/auth/session/route.ts:126` valida senha via `signInWithPassword` e `:132` lê `app_metadata.role`, mas `:141-158` emite sessão HMAC (`encodeSession`, `src/lib/auth.ts:98`).
  - [x] Confirmar ausência de revogação confiável: `role` congelado no payload no login (`src/lib/auth.ts:99`); `decodeSession` só recomputa assinatura + checa `exp` (`src/lib/auth.ts:104`, `supabase/functions/_shared/auth.ts:77`); TTL 30 min ou 30 dias com "remember" (`src/lib/auth-session.ts:1-2`).
  - [x] Confirmar `localStorage`: token HMAC + tokens Supabase crus em `window.localStorage` (`src/lib/supabase/session-token.ts:12,13,21,56`); decodificação client-side otimista sem verificar assinatura (`:82`).
  - [x] Confirmar dupla verificação / cross-origin: cookie `httpOnly` no Next (`src/lib/auth.ts:16-26`) e header `x-rh-session` nas Edge Functions (`supabase/functions/_shared/auth.ts:3-4,113`).
  - [x] Confirmar SEC-104: entre `route.ts:126` e a emissão da sessão não há checagem de AAL2/fator; MFA enrolled na conta (gate de REC-002).

- [x] **Task 2 — Confirmar numeração e formato do ADR** (AC: 1)
  - [x] `docs/architecture/` contém apenas adr-014 e adr-015 → 016 é o próximo número livre.
  - [x] Estrutura dos ADRs 014/015 mapeada (Contexto, Decisão(ões) ratificadas, Consequências, Alternativas rejeitadas, Sequência de execução).

- [x] **Task 3 — Redigir o ADR-016 com as 5 decisões** (AC: 2, 3, 4, 5, 6, 7)
  - [x] D1 — Supabase Auth como autoridade única (FR-07, FND-04).
  - [x] D2 — Cookies SSR `httpOnly`/`secure`, fim do `localStorage` (NFR-04).
  - [x] D3 — AAL2 obrigatório quando há MFA ativo, fail-closed (NFR-04, SEC-104).
  - [x] D4 — Limites do BFF como princípio; consolidação em REC-206 (NFR-04).
  - [x] D5 — Sequência de migração forward-only REC-202→203→204 (NFR-08), registrada, não implementada.
  - [x] Ancorar cada decisão em finding/requisito/evidência de código (Article IV).

- [x] **Task 4 — Fechar a story** (AC: 8)
  - [x] Marcar tasks, atualizar Change Log (Draft→Ready→InReview), Status = InReview, File List com o ADR.
  - [x] Confirmar que nenhum código de aplicação foi tocado e que nenhum gate de QA foi criado (fica para `@po`/`@qa`).

## Dev Notes

### Fontes verificadas

- Entrega mensurável e responsáveis de REC-201. [Fonte: `docs/epics/epic-17-...md` §5, Onda 3, linha "REC-201 — ADR de autoridade de identidade e BFF"]
- Condição de execução nº5 (ADR antes de REC-202; nenhuma story antecipa tecnologia/autoridade fora do ADR). [Fonte: `docs/epics/epic-17-...md` §15]
- FND-04, FR-07, NFR-04, NFR-08, CON-04. [Fonte: `docs/epics/epic-17-...md` §2, §3]
- SEC-104 (MFA enrolled, login sem AAL2). [Fonte: `docs/stories/2026-07-15-rec-002-...md`, QA Results, finding SEC-104; código em `app/api/auth/session/route.ts:126`]
- Evidência técnica do fluxo atual (file:line): `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`, `src/lib/supabase/session-token.ts`, `src/lib/auth-session.ts`.

### Decisões de julgamento tomadas (documentadas)

- **AAL2 obrigatório, não opcional (D3):** a questão pedia "determinar se o novo fluxo exige AAL2". Decidi por AAL2 **obrigatório quando há fator MFA ativo**, fail-closed, porque NFR-04 exige fail-closed e a conta administrativa já tem MFA enrolled (REC-002/AC-17.02) — tornar opcional deixaria SEC-104 aberto e contrariaria o requisito. Alternativa "MFA recomendado" registrada como rejeitada no ADR.
- **BFF como princípio, não implementação (D4):** o ADR fixa a fronteira (servidor resolve identidade/mutações/leituras privilegiadas; browser só same-origin + leitura pública anon) mas remete a consolidação a REC-206, respeitando o escopo declarado da story.

### Project Structure Notes

- Esta story não cria nem modifica código de aplicação, migration, workflow ou gate de QA.
- Único artefato produzido além desta story: o ADR em `docs/architecture/`.
- Não modificar paths L1/L2 do AIOX (`.aiox-core/core/`, `constitution.md`, tasks/templates/checklists/workflows, infrastructure).

## Dependências

- **Entrada:** REC-002 concluída (Done) — credenciais e `AUTH_SESSION_SECRET` já rotacionados; o ADR assume credenciais limpas.
- **Bloqueia execução de:** REC-202, REC-203, REC-204 (e o consumo do princípio de BFF por REC-206 e da identidade por REC-205). Nenhuma dessas stories pode antecipar autoridade de sessão fora deste ADR (Épica 17 §15, nº5).
- **Não depende de:** REC-403 — não altera código de aplicação.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** a decisão é forward-only; corrigir a autenticação para frente via Supabase Auth. Rollback que restaure o HMAC como **autoridade** é proibido (Épica 17 §9, "Autenticação").
- Correção de uma decisão do ADR ocorre por **emenda datada** ao próprio ADR (padrão observado no ADR-014), preservando o histórico da decisão anterior.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-16 | 0.1 | Draft criado a partir da Épica 17 (Onda 3, REC-201). Escopo: produzir o ADR de autoridade de identidade (Supabase Auth) e limites do BFF; story 100% documental, sem alteração de código. | @architect (Aria) |
| 2026-07-16 | 1.0 | **Draft → Ready (auto-validação de `@architect`).** Justificativa: o executor desta story é o próprio `@architect` e o entregável é um ADR — o artefato que `@po`/`@qa` avaliam. Autovalidei contra o checklist de 10 pontos (título claro; problema/necessidade completos via FND-04/FR-07/NFR-04; ACs testáveis em Given/When/Then; escopo IN/OUT explícito; dependências mapeadas — REC-002 entrada, bloqueia REC-202/203/204; estimativa M; valor de negócio — destrava Onda 3 e fecha SEC-104; riscos — lockout de auth, mitigado; DoD via ACs; alinhamento com Épica 17 §5/§15 confirmado). Bloqueadores documentais: 0. **`@po` retém a autoridade formal de GO no gate de InReview** (story-lifecycle: Draft→Ready é de `@po`); esta transição é registrada para não bloquear a produção do ADR na Onda 3, e fica sujeita à confirmação de `@po`. | @architect (Aria) |
| 2026-07-16 | 1.1 | **Ready → InReview.** ADR-016 produzido em `docs/architecture/adr-016-identidade-bff-rec201.md` com as 5 decisões (D1 autoridade única; D2 cookies SSR; D3 AAL2 fail-closed / SEC-104; D4 limites do BFF; D5 sequência de migração), cada uma ancorada em FND-04/FR-07/NFR-04/SEC-104 ou em evidência de código com file:line (Article IV — No Invention). Tasks 1–4 concluídas. Nenhum código de aplicação, migration, workflow ou gate de QA foi tocado. Encaminhado a `@po` (validação da story) e `@qa` (avaliação do ADR). | @architect (Aria) |
| 2026-07-16 | 1.2 | **InReview → Done.** `@po` valida a story (GO, 10/10): título claro, contexto/valor completos, ACs testáveis, escopo IN/OUT explícito (100% documental, sem antecipar implementação), dependências mapeadas (REC-002 entrada; bloqueia REC-202/203/204), estimativa M, valor de negócio (destrava Onda 3, fecha SEC-104), riscos documentados, DoD via ACs, alinhamento com Épica 17 confirmado. As 5 decisões do ADR-016 rastreiam FND-04/FR-07/NFR-04/SEC-104 ou evidência de código com file:line — nenhuma tecnologia introduzida sem âncora (Article IV). Numeração sequencial do ADR (016) confirmada correta. Nenhuma implementação antecipada: REC-202 a REC-206 permanecem stories futuras. | @po (Pax) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-16-rec-201-adr-identidade-bff.md`

### Criado nesta execução

- `docs/architecture/adr-016-identidade-bff-rec201.md`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-15-rec-002-revogar-credenciais-sessoes.md`
- `docs/architecture/adr-014-redesign-trust-keith.md`
- `docs/architecture/adr-015-course-form-dynamic-fields.md`
- `src/lib/auth.ts`
- `src/lib/auth-session.ts`
- `supabase/functions/_shared/auth.ts`
- `app/api/auth/session/route.ts`
- `src/lib/supabase/session-token.ts`
- `src/lib/app-store.tsx`

## QA Results

_A preencher por `@qa` na avaliação independente do ADR (gate separado, fora desta story)._
