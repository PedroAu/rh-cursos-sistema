# Relatório de Evidência — REC-206: Consolidar BFF canônico

- **Story:** [REC-206](../../stories/2026-07-17-rec-206-consolidar-bff-canonico.md)
- **Épica:** [Épica 17 — Recuperação SEV-0](../../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Findings/Requisitos:** FND-08, FR-08
- **Data:** 2026-07-17
- **Executor:** @dev (Dex) — claude-opus-4-8
- **Status:** InReview → Done (gate PASS 93/100)

---

## 1. Objetivo e fronteira

REC-206 = **consolidar o roteamento** de leitura administrativa (o browser parar de chamar o Supabase diretamente e passar a usar exclusivamente contratos same-origin/BFF) e **remover contratos duplicados** (duas formas de obter o mesmo dado). **NÃO** é construir os read models administrativos completos (REC-303/304) nem trocar a autoridade de autorização.

A entrega mensurável da épica ("Browser chama apenas same-origin; contratos duplicados removidos") é ampla. Conforme a diretriz de escolher um subconjunto coerente e testável quando o escopo total excede o que uma story cobre com segurança, o alvo implementado é o **contrato de leitura de leads administrativos** — o contrato duplicado concreto e diretamente ligado a FND-08 que pode ser consolidado **sem** construir read model novo.

## 2. Mapeamento da investigação (read-only)

`invokeFunction` (`src/lib/supabase/functions-client.ts`) já implementa BFF same-origin: no browser chama `/api/functions/[name]` (rota Next.js) que proxia para a Edge Function server-side. Logo, mutações admin (`persistAdminMutation`) e criação de lead já eram same-origin.

O contrato **duplicado** de leitura de leads administrativos:

| Caminho | Origem | Autoridade | Transporte | Onde |
|---|---|---|---|---|
| A — canônico | `fetchAdminLeads()` → `invokeFunction("admin-resources", {resource:"leads", action:"list"})` | HMAC (`requireAdmin`) | same-origin `/api/functions/admin-resources` | bootstrap (reload) |
| B — duplicado (removido) | `fetchLeadsFromSupabase()` → `supabase.from("lead").select("*")` | Supabase Auth + RLS | **direto** `*.supabase.co` | bloco `supabase.auth.setSession(...)` + refetch realtime |

Mesmo dado (lista de leads), duas autoridades e dois transportes. A Edge Function `admin-resources` já suporta `{resource:"leads", action:"list"}` sob `requireAdmin` (`supabase/functions/admin-resources/index.ts`) — **nenhuma rota BFF nova é necessária**.

`students`/`enrollments` **não têm leitura server-side hoje** (populados apenas por mutações otimistas). Construir esses read models é REC-303/304 — fora do escopo.

## 3. O que foi consolidado (diff)

### `src/lib/app-store.tsx`
- Removido o import e todos os usos de `fetchLeadsFromSupabase`.
- `scheduleLeadRefetch` repontado: o refetch de leads disparado por realtime passa a usar `fetchAdminLeads(getAdminSessionTokenValue())` (same-origin/HMAC), com short-circuit quando não há token HMAC.
- Bloco `supabase.auth.setSession(...)`: deixou de ler leads pelo cliente Supabase direto. A sessão Supabase Auth ali passou a habilitar **apenas** as subscriptions realtime sob RLS (transporte inalterado). A hidratação de leads no reload continua servida por `fetchAdminLeads` (BFF), que já ocorre no bootstrap.

### `src/lib/supabase/rh-cursos-api.ts`
- Removido o wrapper `fetchLeadsFromSupabase()` (contrato duplicado de leitura direta no browser).
- **Mantido** `fetchLeadsWithClient(client)` — helper genérico que recebe o cliente por parâmetro; reutilizável server-side por REC-303. (Confirmado por `rh-cursos-api.test.ts`, que exercita esse helper com um cliente injetado.)

### `src/__tests__/lib/app-store.test.ts`
- Novo teste: "hydrates admin leads on bootstrap exclusively through the same-origin BFF (REC-206)" — com token HMAC ativo, prova que o bootstrap hidrata leads via `invokeFunction("admin-resources", {body:{resource:"leads", action:"list"}, sessionToken})`.
- `beforeEach` endurecido: restaura os defaults (`null`) dos mocks de sessão (`getSessionToken`/`decodeSessionToken`/`getSupabaseSession`) porque `mockClear()` preserva return values — evita vazamento entre casos exposto pelo novo teste.
- Mock do módulo `rh-cursos-api` atualizado para não referenciar mais o export removido.

## 4. Restrições respeitadas (proibições da story)

- **Nenhuma nova autoridade de autorização.** As rotas admin seguem sob o HMAC real de produção (`requireAdmin` em `supabase/functions/_shared/auth.ts`). `resolveServerRole`/`requireServerRole` (REC-203) **não** foram importados, chamados nem ativados.
- **HMAC não removido/substituído.** `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts` **não** foram modificados.
- **Read models completos NÃO implementados.** Nenhum contrato novo de leitura server-side com paginação/filtros ricos de alunos/inscrições foi adicionado — apenas o roteamento do contrato existente (leads) foi consolidado.
- **REC-202/203 intocados.** Módulos apenas referenciados/lidos; nenhum modificado.

## 5. Fora do escopo (deferido, documentado)

- **Transporte realtime (WebSocket direto ao Supabase):** as subscriptions `lead_changes`/`inscricao_changes`/`aluno_changes` seguem conectando diretamente ao Supabase. Proxificar WebSocket é mudança arquitetural maior (relacionada a REC-408). O refetch de dados disparado por realtime já trafega same-origin.
- **Leituras públicas de catálogo do browser** (`fetchPublicCatalogFromSupabase`, `fetchPublicBlogPostsFromSupabase`): dados públicos (anon key, RLS público), fora do foco administrativo de FND-08; consolidação mais ampla fica para trabalho separado.
- **Read models de alunos/inscrições:** REC-303/304, habilitados por esta consolidação.

## 6. Verificação (saída fresca)

| Verificação | Comando | Resultado |
|---|---|---|
| Lint | `npm run lint` | 0 erros |
| Typecheck | `npm run typecheck` | `Types generated successfully`; `tsc --noEmit` sem erros |
| Testes afetados | `npx vitest run src/__tests__/lib/app-store.test.ts src/__tests__/lib/rh-cursos-api.test.ts` | 50 passed |
| Suíte completa | `npx vitest run` | **639 passed (639), 59 files** — +1 sobre baseline 638, 0 regressão |

Verificações independentes:
- `grep -rn "fetchLeadsFromSupabase" src app` → nenhum consumidor restante (export removido).
- `grep -rn "resolveServerRole|requireServerRole" src/lib/app-store.tsx src/lib/supabase/rh-cursos-api.ts` → 0 (REC-203 não consumida).
- `git status --short` nos arquivos de auth HMAC → sem saída (não modificados).

## 7. Resumo

O browser passou a ler leads administrativos por um único contrato same-origin (`admin-resources` `leads/list`, HMAC), com o contrato duplicado de leitura direta ao cliente Supabase removido e o refetch realtime também repontado para o BFF. Nenhuma autoridade de autorização foi introduzida (HMAC intocado; REC-203 não consumida/ativada); os read models completos de alunos/inscrições ficaram para REC-303/304, agora habilitados pelo roteamento canônico. Suíte 638 → 639 (+1), lint/typecheck limpos.
