# Relatório de Implementação — REC-305: Corrigir login dos três papéis e recovery

- **Data:** 2026-07-17
- **Story:** [REC-305](../../stories/2026-07-17-rec-305-corrigir-login-tres-papeis-recovery.md)
- **Épica:** [Épica 17 — Recuperação SEV-0](../../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Finding:** FND-07 — Login de aluno/instrutor e recuperação incompletos ou quebrados
- **Executor:** @dev (Dex)
- **Tipo:** Bugfix restrito (UX/frontend + travas de teste). Sem mudança arquitetural.

## 1. O que exatamente estava quebrado

### 1.1 Recovery: falso sucesso (o defeito real)

O botão "Esqueci minha senha" em `src/views/public/Login.tsx` executava:

```tsx
onClick={() => toast.success("Link de recuperação enviado para o seu e-mail.")}
```

Isto exibia um **toast de sucesso incondicional**, sem qualquer chamada de rede e **sem nenhum fluxo de recuperação por trás** — não há rota de reset, página de nova senha ou chamada a `resetPasswordForEmail`. O usuário era informado de que um e-mail foi enviado quando **nada acontecia**. É o mesmo antipadrão de "falso sucesso" que REC-302 corrigiu e uma violação direta do Article IV (No Invention) e de FR-10 (controles devem funcionar ou ser removidos/marcados indisponíveis).

### 1.2 Destino pós-login: já correto server-side (verificado, não era bug)

Investigando `Login.tsx` e o endpoint HMAC `app/api/auth/session/route.ts` (**lido, não modificado**):

- O redirect pós-login já usa `data.session.role` — o papel da **resposta do servidor**, não o pathname do portal.
- O servidor é autoritativo: `route.ts:132` deriva o papel de `app_metadata.role` (Supabase Auth, via HMAC), e `route.ts:137-139` responde **403** quando o papel pedido pelo portal diverge do papel real do usuário.
- `?next` é validado por `isRolePathAllowed(role, next)` antes do redirect; fora do namespace do papel, cai em `getDefaultDashboardPath(role)` — sem open redirect.

Ou seja, a "entrega mensurável" da épica ("destino deriva do papel server-side") **já estava satisfeita**. Inventar um bug aqui violaria o Article IV. O que faltava era **cobertura de regressão**: `src/lib/session-routing.ts` não tinha nenhum teste, e não havia teste de componente provando a derivação. A story fecha essa lacuna.

## 2. Correção aplicada

1. **Removido o controle enganoso** "Esqueci minha senha" e o import `toast` (`sonner`), agora sem uso, de `Login.tsx`. Layout da linha "Manter conectado" simplificado (de `justify-between` com o botão falso para apenas o checkbox).
2. **Mantido o canal de recuperação real** já presente na mesma tela: "Precisa de acesso? **Fale com a coordenação**" → `/contato` (atendimento humano — o caminho de recuperação real hoje).
3. **Travas de teste** para garantir que a derivação server-side do destino não regrida e que o falso sucesso não retorne.

### Decisão sobre recovery (real vs. removido)

Recuperação de autosserviço **de verdade** exigiria infraestrutura NET-NEW (página/rota `reset-password` + config de redirect no Supabase + UI de nova senha + tratamento do token `type=recovery`), uma feature arquitetural fora do escopo de bugfix. Implementar só `resetPasswordForEmail` sem a página de destino deixaria o link do e-mail levando a lugar nenhum — outro controle pela metade. Seguindo a diretriz da épica ("recovery é real **ou** removido") e o precedente de REC-306, optou-se pela **remoção** do controle enganoso, preservando o canal humano real que já existia. Follow-up de autosserviço fica sugerido (não formalizado).

## 3. Testes — antes/depois

| Momento | Suíte agregada |
|---|---|
| Baseline (pós REC-306) | 694/694 |
| Depois de REC-305 | **710/710** (+16) |

Novos testes:
- `src/__tests__/lib/session-routing.test.ts` — **7** testes: `getDefaultDashboardPath` (3 papéis), `isRolePathAllowed` (negação sem destino; namespaces admin/aluno/instrutor; anti-escalada por prefixo semelhante).
- `src/__tests__/views/public/login-page.test.tsx` — **9** testes: redirect por papel server-side (student/instructor/admin); caso cruzado (portal aluno + resposta admin → `/admin`, provando autoridade do servidor sobre o pathname); `?next` dentro do namespace; `?next` fora do namespace ignorado (sem open redirect); persistência do token HMAC; remoção do botão de falso sucesso; toast de sucesso nunca dispara; "Fale com a coordenação" navega para `/contato`.

Comandos:
- `npx vitest run src/__tests__/lib/session-routing.test.ts src/__tests__/views/public/login-page.test.tsx` → **16/16**
- `npx vitest run` → **710/710** (66 arquivos)
- `npm run lint` → OK
- `npm run typecheck` → OK

## 4. HMAC preservado

Esta story **não** altera o mecanismo de sessão. O HMAC continua sendo a **única** autoridade de login e a **única** forma de emissão/verificação de sessão em produção, exatamente como antes. Arquivos de autenticação confirmados **intocados** (verificados via `git status` — sem linha de modificação):

- `src/lib/auth.ts` — emissão/verificação do HMAC, `DashboardRole`, `encodeSession`/`decodeSession`, cookie. **Não modificado.**
- `supabase/functions/_shared/auth.ts` — auth/`requireAdmin` das Edge Functions. **Não modificado.**
- `app/api/auth/session/route.ts` — endpoint de login/logout HMAC (POST/GET/DELETE). **Lido para investigação; não modificado.**

**Nenhuma** chamada a `signInSSR`, `readSSRSession`, `createSupabaseSSRClient` (REC-202) ou `resolveServerRole`/`requireServerRole` (REC-203) foi adicionada ao fluxo de login real. A sessão SSR não foi populada nem consumida pelo login.

### Isto NÃO é REC-204

REC-204 é o **cutover** que troca a autoridade de produção do HMAC para a sessão SSR em rotas reais — o passo que a Épica 17 identifica como risco de lockout e que exige decisão humana explícita e específica, ainda **não** concedida. REC-305 é deliberadamente um bugfix de UX/frontend que **preserva** o HMAC intacto. Nenhuma autoridade de login foi migrada. O único arquivo de produção alterado é `src/views/public/Login.tsx` (remoção de um controle de UI enganoso).

## 5. Arquivos

### Criados
- `src/__tests__/lib/session-routing.test.ts`
- `src/__tests__/views/public/login-page.test.tsx`
- `docs/stories/2026-07-17-rec-305-corrigir-login-tres-papeis-recovery.md`
- `docs/history/reports/rec-305-corrigir-login-tres-papeis-recovery-2026-07-17.md`
- `docs/qa/gates/rec-305-corrigir-login-tres-papeis-recovery.yml`

### Modificados
- `src/views/public/Login.tsx`
- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md` (linha de status)

## 6. Pendências / follow-up
- Recuperação de senha por autosserviço (página `reset-password` + `resetPasswordForEmail` + token) — feature NET-NEW deferida; hoje a recuperação real é via "Fale com a coordenação".
- Gate deixado `PENDING` para revisão humana de @qa.
