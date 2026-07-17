# Story REC-305: Corrigir login dos três papéis e recovery

## Status

Done

## Executor Assignment

executor: "@dev" (Dex)
quality_gate: "@qa"
quality_gate_tools:
- teste de componente do `LoginPage` provando que o destino pós-login deriva do papel devolvido pela resposta server-side (HMAC), não do pathname do portal
- teste dos três papéis (student → /aluno, instructor → /instrutor, admin → /admin)
- teste do caso cruzado (portal do aluno + resposta server-side admin → /admin) provando autoridade do servidor sobre o pathname
- teste de que `?next` só é respeitado dentro do namespace do papel (sem open redirect)
- teste unitário de `session-routing.ts` (`getDefaultDashboardPath`, `isRolePathAllowed`) — antes sem cobertura
- teste de que o controle enganoso "Esqueci minha senha" foi removido e o toast de falso sucesso nunca dispara
- confirmação de que nenhum arquivo de autenticação (HMAC/SSR) foi tocado

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 4 — Estabilização funcional
- **Prioridade:** P1
- **Estimativa:** S
- **Findings:** FND-07 (Login de aluno/instrutor e recuperação estão incompletos ou quebrados → jornadas de acesso indisponíveis ou inconsistentes)
- **Requisitos:** FR-07 (login/logout/renovação/revogação/papel). **Nota de escopo:** FR-07 descreve o estado-alvo com Supabase Auth como autoridade única; o *cutover* dessa autoridade é EXCLUSIVAMENTE REC-204 e permanece PROIBIDO/pausado. Esta story é um **bugfix restrito** que mantém o HMAC como o único mecanismo de sessão exatamente como hoje.
- **Dependência:** REC-202 (Done) — apenas ordenação de onda. Nenhuma sessão SSR (`signInSSR`/`readSSRSession`/`createSupabaseSSRClient`) nem resolução de papel de REC-203 é consumida pelo fluxo de login real.

## Story

**As a** aluno, instrutor ou administrador acessando o portal,
**I want** ser levado ao meu painel correto de acordo com o papel que o servidor confirma, e não ver um "Esqueci minha senha" que finge enviar um e-mail sem fazer nada,
**so that** as jornadas de acesso fiquem consistentes e nenhum controle exibido seja enganoso, conforme FND-07 e Article IV (No Invention).

## Contexto e valor

FND-07 aponta que "login de aluno/instrutor e recuperação estão incompletos ou quebrados". A investigação dos três pontos de entrada (`app/login/page.tsx` → `src/features/public/login/login-page.tsx` → `src/views/public/Login.tsx`) e do endpoint de sessão HMAC (`app/api/auth/session/route.ts`, **lido, não modificado**) encontrou:

### 1. Destino pós-login — JÁ deriva do papel server-side (verificado, sem alteração de código)

O redirecionamento em `Login.tsx` já usa `data.session.role`, ou seja, o papel devolvido pela **resposta do servidor**, não o pathname do portal. E o servidor é autoritativo:

- `route.ts:132` deriva o papel de `result.data.user.app_metadata?.role` (metadado do usuário no Supabase Auth, emitido/verificado via HMAC), não do que o cliente pede;
- `route.ts:137-139` retorna **403** quando o papel pedido pelo portal diverge do papel real do usuário (impede que ir a `/login/aluno` conceda papel de aluno a quem não é);
- `Login.tsx` valida `?next` com `isRolePathAllowed(data.session.role, next)` antes de redirecionar, caindo em `getDefaultDashboardPath(role)` caso o `next` não pertença ao namespace do papel (sem open redirect / escalada).

**Conclusão honesta (Article IV — não inventar bug):** a "entrega mensurável" da épica ("destino deriva do papel server-side") **já é satisfeita** pelo código atual. O que faltava era **trava de regressão**: `session-routing.ts` não tinha nenhum teste e não havia teste de componente provando a derivação. Esta story fecha essa lacuna, garantindo que a propriedade não regrida silenciosamente (por exemplo, alguém trocar `data.session.role` por `loginRole` derivado do pathname).

### 2. Recovery — controle enganoso (falso sucesso), corrigido por remoção

O botão **"Esqueci minha senha"** (`Login.tsx`) chamava, sem qualquer chamada de rede:

```tsx
onClick={() => toast.success("Link de recuperação enviado para o seu e-mail.")}
```

Ou seja, exibia um **falso sucesso** — exatamente o antipadrão que REC-302 corrigiu — dizendo ao usuário que um e-mail foi enviado quando **nada acontece**. Não existe fluxo de recuperação por trás: nenhuma rota de reset, nenhuma página de nova senha, nenhuma chamada a `resetPasswordForEmail`.

## Decisão sobre recovery (No Invention — Article IV / FR-10)

Uma recuperação **de verdade** de autosserviço exigiria infraestrutura NET-NEW: uma página/rota de reset (`reset-password`) para consumir o link do e-mail, configuração de redirect no Supabase e UI de definição de nova senha com tratamento do token `type=recovery`. Isso é uma **feature nova, arquitetural**, fora do escopo de um bugfix restrito — e implementar apenas `resetPasswordForEmail` (que dispara o e-mail) sem a página de destino deixaria o link levando a lugar nenhum, ou seja, **outro** controle pela metade / enganoso.

A épica dá a diretriz explícita: *"recovery é real **ou** removido"*. Aplicando a mesma disciplina de REC-306 (remover o controle inerte/enganoso quando o backing real não existe e já há um caminho real na mesma tela):

| Controle | Estado anterior | Decisão | Justificativa |
|---|---|---|---|
| "Esqueci minha senha" (`Login.tsx`) | `toast.success(...)` incondicional; nenhuma chamada de rede; nenhum fluxo de reset por trás | **Removido** | Falso sucesso (antipadrão de REC-302), viola Article IV. Reset de autosserviço real é feature NET-NEW arquitetural, fora do bugfix. O canal de recuperação real **já existe na mesma tela**: "Precisa de acesso? **Fale com a coordenação**" → `/contato`. Um botão falso é um duplicado enganoso do canal real. |
| "Fale com a coordenação" (`/contato`) | Já funcionava | **Mantido** | É o canal de recuperação/acesso real hoje (atendimento humano). Rota real e funcional. |

> **Follow-up sugerido (não criado formalmente):** uma story futura pode entregar recuperação de autosserviço completa (página `reset-password` + `resetPasswordForEmail` + tratamento de token). Não é feito aqui para respeitar o escopo restrito de bugfix.

## Escopo

### Incluído
- `src/views/public/Login.tsx`: remoção do botão de falso sucesso "Esqueci minha senha" e do import `toast` (`sonner`), agora sem uso; simplificação do layout da linha "Manter conectado".
- `src/__tests__/lib/session-routing.test.ts` (net-new): trava unitária de `getDefaultDashboardPath` e `isRolePathAllowed`.
- `src/__tests__/views/public/login-page.test.tsx` (net-new): trava de componente da derivação server-side do destino (3 papéis + caso cruzado + `?next`) e da remoção do recovery enganoso.

### Fora do escopo (intocado)
- **Mecanismo de sessão / autenticação (HMAC):** `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`. **Não modificados.** O HMAC continua sendo o único mecanismo de sessão, exatamente como antes.
- Sessão SSR de REC-202 (`signInSSR`/`readSSRSession`/`createSupabaseSSRClient`) e resolução de papel de REC-203 (`resolveServerRole`/`requireServerRole`) — **não consumidas** pelo fluxo de login real.
- **REC-204 (cutover HMAC → SSR):** PROIBIDO nesta story. Esta story **não** é REC-204; nenhuma autoridade de login foi migrada.
- Recuperação de senha por autosserviço (página de reset + token) — feature NET-NEW, deferida.

## Acceptance Criteria

- [x] **AC-305.01** — O destino pós-login deriva do papel devolvido pela resposta server-side (HMAC), não do pathname do portal. Provado por teste, inclusive o caso cruzado (portal `/login/aluno` + resposta `admin` → `/admin`).
- [x] **AC-305.02** — Os três papéis redirecionam corretamente: student → `/aluno`, instructor → `/instrutor`, admin → `/admin` (via `getDefaultDashboardPath`).
- [x] **AC-305.03** — `?next` só é honrado dentro do namespace do papel server-side (`isRolePathAllowed`); fora dele, cai no dashboard padrão do papel — sem open redirect.
- [x] **AC-305.04** — O controle enganoso "Esqueci minha senha" (falso sucesso via `toast`) foi **removido**; o toast de sucesso nunca dispara. Article IV respeitado.
- [x] **AC-305.05** — O canal de recuperação/acesso real ("Fale com a coordenação" → `/contato`) permanece funcional na tela.
- [x] **AC-305.06** — Nenhum arquivo de autenticação (HMAC/SSR) foi tocado; o HMAC segue como único mecanismo de sessão. Isto **não** é o cutover de REC-204.
- [x] **AC-305.07** — Baseline constitucional verde: lint OK, typecheck OK, suíte agregada 694 → 710 (+16), sem regressão.

## File List

### Criados
- `src/__tests__/lib/session-routing.test.ts` (+7 testes)
- `src/__tests__/views/public/login-page.test.tsx` (+9 testes)
- `docs/stories/2026-07-17-rec-305-corrigir-login-tres-papeis-recovery.md`
- `docs/history/reports/rec-305-corrigir-login-tres-papeis-recovery-2026-07-17.md`
- `docs/qa/gates/rec-305-corrigir-login-tres-papeis-recovery.yml`

### Modificados
- `src/views/public/Login.tsx` (remove botão de falso sucesso "Esqueci minha senha" e import `toast`; simplifica layout da linha "Manter conectado")
- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md` (linha de status)

## Verificação

- `npm run lint` → OK
- `npm run typecheck` → OK
- `npx vitest run` → 66 arquivos, **710/710** (baseline 694 + 16 novos), sem regressão
- `npx vitest run src/__tests__/lib/session-routing.test.ts src/__tests__/views/public/login-page.test.tsx` → **16/16**
- `git status` confirma HMAC intocado (`src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts` sem modificação).

## Change Log

- 2026-07-17 — @dev: verificada e travada por testes a derivação server-side do destino de login (3 papéis + caso cruzado + `?next`); removido o controle enganoso "Esqueci minha senha" (falso sucesso, Article IV), mantido o canal real "Fale com a coordenação"; +16 testes; story concluída (Done), gate deixado PENDING para revisão humana de @qa. HMAC intocado — não é o cutover de REC-204.
