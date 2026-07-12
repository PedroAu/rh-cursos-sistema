# Story LOGIN-RD.1: Redesign da página de login para card centralizado (design system Trust Keith)

## Status
Done

> Rascunho gerado por @qa (Quinn) a partir do veredito visual comparando o login atual (`src/views/public/Login.tsx`, split-screen) com o novo design (`docs/design-system/RH Cursos Login.dc.html`, card centralizado). Validado por @po (Pax) em 2026-07-12 — Decisões D1 e D2 travadas (ver **Decisões Travadas**). GO para implementação.

## Complexidade

**M/L (5–8 pontos).** Reescrita completa de layout + isolamento do shell + mudança no contrato de `/api/auth/session` (D1=A) + persistência real de sessão (D2) + atualização de baselines de visual regression. Risco principal: regressão no fluxo de auth (mitigado por AC7 e testes `login-errors`/`route-auth`).

## Executor Assignment

executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- Visual regression das baselines (`tests/baseline/login-baseline-desktop.png`, `-mobile.png`)
- `visual-verdict` contra `docs/design-system/RH Cursos Login.dc.html`

## Épica
EP-11 — Auth Enhancement
Spec de design: `docs/design-system/RH Cursos Login.dc.html` + `docs/design-system/DESIGN.md`

## Story

**As a** usuário que acessa a área restrita da RH Cursos,
**I want** uma tela de login enxuta e centralizada, alinhada ao design system Trust Keith,
**so that** a entrada seja focada, com branding consistente e menor carga cognitiva.

## Contexto

O login atual (`src/views/public/Login.tsx`) usa um layout **split-screen** full-bleed: painel teal à esquerda com wordmark "RH Cursos", headline de capacitação e card "Certificado Reconhecido"; à direita um card de 560px com **3 cards-aba de papel** (Administração/Aluno/Instrutor), formulário e ações. A rota ainda renderiza o shell público (header de navegação + footer).

O novo design (`RH Cursos Login.dc.html`) troca isso por um **card único de 400px centralizado** sobre fundo radial claro, com logo em imagem + badge de portal, título "Bem-vindo de volta" com subtítulo dinâmico por portal, checkbox "Manter conectado", alerta de erro inline padronizado e uma linha de rodapé "Voltar ao site · Fale com a coordenação". Não há header/footer do site nem seletor de papel visível.

O maior descasamento é arquitetural (D1): o novo design resolve o **portal por prop/rota** (badge), enquanto o atual expõe **seleção de papel na UI** que alimenta `role` no `POST /api/auth/session`.

## Decisões Travadas (@po — 2026-07-12)

- **D1 — Seleção de papel → Opção A (resolver no backend).** A seleção manual de papel é **removida** da UI. O papel passa a ser resolvido no backend a partir de `app_metadata.role` da conta autenticada; o badge do portal é apenas informativo, derivado da rota quando presente (`/login`, `/login/aluno`, `/login/instrutor`), com fallback genérico. O `POST /api/auth/session` **deixa de receber `role` da UI** e passa a derivar o papel do usuário — `route.ts` será modificado (ver AC3). AC3 está travada na variante A; a variante B foi descartada.
- **D2 — Checkbox "Manter conectado" → Persistência real.** O checkbox controla a duração/persistência da sessão (sessão longa vs. curta). Implica ajuste em `setSessionToken`/`setSupabaseSession` e no `route.ts` (ver AC5/AC7). Não é apenas visual.

## Acceptance Criteria

- [x] **AC1 — Layout centralizado.** Dado o acesso a `/login`, a tela renderiza um card único centralizado (largura 400px, `max-width:100%`) sobre fundo radial claro, sem painel split-screen. O shell público (header de navegação + footer) **não** é renderizado nessa rota.
- [x] **AC2 — Branding e tokens.** O topo exibe o logo em imagem (`/uploads/logoHorizontal_800X600.png`, altura ~52px) + badge pill do portal. Card usa `radius 24px`, `--tk-shadow-card`, H1 em Fraunces (`Bem-vindo de volta`) e subtítulo dinâmico por portal em Inter; CTA usa `--tk-cta` (#0c6a83).
- [x] **AC3 — Portal/papel (D1 = A, resolvido no backend).** A seleção manual de papel é **removida** da UI (sem as 3 abas). O `POST /api/auth/session` **não recebe mais `role`** da UI: o papel é derivado de `app_metadata.role` da conta no backend (`route.ts` ajustado, mantendo a validação de credenciais). O badge do portal é informativo, derivado da rota quando presente (fallback genérico em `/login`). O redirecionamento pós-login por `getDefaultDashboardPath`/`isRolePathAllowed` usa o papel resolvido pelo backend e permanece funcional.
- [x] **AC4 — Formulário e estados.** E-mail e senha mantêm validação Zod/react-hook-form atual. Erro de credenciais e falha de conexão aparecem no **alerta inline `role="alert"`** padronizado do design (não como toast). O botão "Entrar" mostra estado `loading`.
- [x] **AC5 — Ações secundárias e "Manter conectado".** "Esqueci minha senha" e "Voltar ao site" preservam o comportamento atual; a linha de rodapé inclui "Precisa de acesso? Fale com a coordenação". Checkbox "Manter conectado" presente e **funcional (D2 = persistência real)**: quando marcado, a sessão é persistida com duração longa; quando desmarcado, sessão curta. O estado alimenta `setSessionToken`/`setSupabaseSession` e o `route.ts`.
- [x] **AC6 — Responsivo e acessível.** Em mobile o card ocupa a largura disponível com padding adequado; foco visível (`:focus-visible`), labels associados e `aria-invalid`/`aria-describedby` preservados. Sem scroll horizontal.
- [x] **AC7 — Sem regressão de auth.** Fluxo de autenticação e roteamento pós-login permanecem funcionais após as mudanças de D1 (remoção do `role` da UI) e D2 (persistência configurável). A duração da sessão reflete o "Manter conectado"; `tests/login-errors.spec.ts` e `tests/route-auth.spec.ts` passam (atualizados para o novo contrato sem `role` na request).

## Scope

### In Scope
- Reescrita de layout de `src/views/public/Login.tsx` (split-screen → card centralizado), removendo as 3 abas de papel (D1=A)
- Remoção do shell público (header/footer) na rota de login (ajuste em `app/login/page.tsx` / `PublicPageShell`)
- Ajuste no `app/api/auth/session/route.ts` para derivar o papel de `app_metadata.role` (parar de exigir `role` da UI) — D1=A
- Persistência real de sessão controlada pelo "Manter conectado" (`setSessionToken`/`setSupabaseSession` + `route.ts`) — D2
- Aplicação dos tokens Trust Keith (cores teal do login, radius, sombra, tipografia)
- Alerta de erro inline padronizado, badge de portal (derivado da rota), checkbox "Manter conectado"
- Atualização dos testes de auth impactados pelo novo contrato e das baselines de visual regression do login

### Out of Scope
- Mudanças de segurança de `/api/auth/session` além do necessário para D1 (A) e D2 (ex.: novos escopos, MFA)
- Fluxo real de recuperação de senha (permanece stub/toast atual)
- Criação de novas rotas de portal (`/login/aluno`, `/login/instrutor`) — o badge deriva da rota quando presente, com fallback; criar as rotas em si fica fora
- RBAC novo além do papel já derivado de `app_metadata.role`
- Redesign de outras telas de auth (logout, callback)

## Tasks / Subtasks

- [x] Confirmar D1 e D2 com @po/@pm e travar a variante de AC3/AC5 — **D1=A, D2=persistência real** (@po, 2026-07-12)
- [x] Reescrever markup/estilo de `Login.tsx` para o card centralizado (tokens Trust Keith), removendo as 3 abas de papel
- [x] Isolar a rota `/login` do shell público (header/footer) via `app/login/page.tsx` / `PublicPageShell`
- [x] Migrar erro para alerta inline `role="alert"`; adicionar badge de portal (derivado da rota) e checkbox "Manter conectado"
- [x] Ajustar `route.ts` para derivar o papel de `app_metadata.role` (D1=A) e parar de exigir `role` na request
- [x] Implementar persistência configurável da sessão pelo "Manter conectado" (D2) em `setSessionToken`/`setSupabaseSession` + `route.ts`
- [x] Ajustar/gerar baselines de visual regression (desktop + mobile)
- [x] Rodar `visual-verdict` contra o `.dc.html` até score ≥ 90 — score 92/100, verdict PASS (ver Dev Agent Record)
- [x] Atualizar testes de UI/auth impactados pelo novo contrato (sem `role` na request)

## Dependencies

- `src/views/public/Login.tsx`
- `docs/design-system/RH Cursos Login.dc.html` (spec visual)
- `docs/design-system/tokens/*.css` (tokens Trust Keith)
- `app/login/page.tsx` e o layout que injeta header/footer público
- `src/lib/session-routing.ts`, `src/lib/supabase/session-token.ts`
- `app/api/auth/session/route.ts` (contrato de `role`, caso D1 = A)

## Testing

- `tests/login-errors.spec.ts`
- `tests/route-auth.spec.ts`
- `tests/ui-governance.spec.ts` (snapshot `login-card-governance-functional`)
- Baselines: `tests/baseline/login-baseline-desktop.png`, `tests/baseline/login-baseline-mobile.png`
- `visual-verdict` vs `docs/design-system/RH Cursos Login.dc.html`

## File List

- `src/views/public/Login.tsx` — reescrito: card centralizado 400px, remoção das 3 abas de papel, badge de portal (derivado da rota), checkbox "Manter conectado", alerta inline padronizado, rodapé "Voltar ao site · Fale com a coordenação"
- `src/components/next-page-shell.tsx` — novo `BarePageShell` (AppStoreProvider + AppToaster, sem header/footer público)
- `app/login/page.tsx` — troca de `PublicPageShell` por `BarePageShell` (AC1)
- `app/api/auth/session/route.ts` — POST não exige mais `role` da UI (deriva de `app_metadata.role`); aceita `remember` e emite TTL longo/curto (D1=A, D2); GET preserva `remember` na rotação
- `src/lib/auth.ts` — `DemoSession`/`decodeSession` propagam `remember`
- `src/lib/auth-session.ts` — nova constante `REMEMBER_SESSION_TTL_MS` (30 dias)
- `tests/route-auth.spec.ts` — remove `role` do payload de login no teste de integração real (contrato sem `role`)
- `tests/public-journeys.spec.ts` — teste de seleção de papel substituído por verificação do card centralizado sem header
- `tests/epic14-mantine-removal.smoke.spec.ts` — smoke de login atualizado para o novo heading/checkbox
- `tests/ui-governance.spec.ts-snapshots/login-card-governance-functional-darwin.png` — baseline visual regenerado
- `tests/baseline/login-baseline-desktop.png`, `tests/baseline/login-baseline-mobile.png` — baselines regenerados

## Change Log

- 2026-07-12 — @qa (Quinn) — Rascunho inicial criado a partir do veredito visual (score 32/100 atual→alvo). Registradas decisões em aberto D1 (seleção de papel) e D2 (manter conectado) como bloqueadores de `Ready`.
- 2026-07-12 — @po (Pax) — `*validate-story-draft`: GO (score 9/10). Verificação anti-alucinação OK (todos os arquivos/funções referenciados existem no código). Travadas D1=A (papel resolvido no backend, `role` removido da request) e D2=persistência real de sessão; AC3/AC5/AC7 e Scope atualizados; adicionada estimativa de complexidade (M/L). Status **Draft → Ready**.
- 2026-07-12 — @dev (Dex) — Implementação completa (AC1-AC7). Login.tsx reescrito para card centralizado; shell público isolado via `BarePageShell`; `route.ts` ajustado para D1=A (papel via `app_metadata.role`, sem `role` na request) e D2 (sessão longa/curta via `remember`); baselines visuais regenerados; testes de UI/auth atualizados ao novo contrato. Status **Ready → InReview**.
- 2026-07-12 — @dev (Dex) — Fix `DOC-001` (achado de @qa, severidade low): subtítulo fallback do card não repete mais o H1 ("Entre com suas credenciais para acessar o portal."). Lint/typecheck seguem em 0 erros.
- 2026-07-12 — @dev (Dex) — Fix de layout (achado em revisão manual, não catalogado pelo @qa): no formulário do card, o `<form>` usava `grid` sem `grid-template-columns` explícito. Sem coluna fixa (`minmax(0,1fr)`), o item de grid (wrapper do campo) ignorava a largura do container e "vazava" para fora do card no mobile (input de e-mail ultrapassava a borda direita do card em ~5px em viewport 375px). Corrigido com `grid-cols-1` em `Login.tsx`. Baselines visuais regenerados novamente; suíte completa (lint, typecheck, vitest, playwright login/auth/a11y/keyboard) revalidada — 68/68 nos specs afetados.
- 2026-07-12 — @qa (Quinn) — Re-review pós-fix: DOC-001 resolvido, baselines verificadas contra build de produção fresco. Gate **PASS**, todos os 7 AC atendidos, sem regressão.
- 2026-07-12 — @devops (Gage) — Quality gate completo (lint/typecheck/vitest 426/426/build) PASSOU. Push para `origin/main` executado. Status **InReview → Done**.

## Dev Agent Record

- **Contexto adicional descoberto:** `app/login/page.tsx` não usava `src/views/public/Login.tsx` diretamente, mas sim `src/features/public/login/login-page.tsx` (um re-export). O shell público vinha de `PublicPageShell` → `PublicLayout` (`src/features/public-shell/public-layout.tsx`), que renderiza `PublicHeader`/`PublicFooter` incondicionalmente. Para atender AC1, foi criado `BarePageShell` em `next-page-shell.tsx` (mantém `AppStoreProvider` + `AppToaster`, sem header/footer), usado apenas na rota `/login`.
- **D1 (papel resolvido no backend):** `POST /api/auth/session` agora ignora qualquer `role` enviado pela UI (aceita silenciosamente por compatibilidade com o teste de integração real ainda não migrado, mas não é mais requerido) e deriva o papel exclusivamente de `app_metadata.role` da conta autenticada. Retorna 403 "Acesso não autorizado" quando a conta não tem papel válido em `app_metadata`.
- **D2 (persistência real):** Adicionada `REMEMBER_SESSION_TTL_MS` (30 dias) em `auth-session.ts`. O campo `remember` viaja no corpo do POST, é persistido dentro do próprio token assinado (`DemoSession.remember`) e determina o TTL do cookie/JWT tanto na emissão quanto na rotação (`GET` com sessão próxima da expiração).
- **Badge de portal:** como as rotas `/login/aluno` e `/login/instrutor` estão fora de escopo (não criadas), o badge usa fallback genérico "Portal RH Cursos" em `/login`; o mapeamento por `pathname` já está pronto para quando essas rotas existirem.
- **Ajuste de teste:** `epic14-mantine-removal.smoke.spec.ts` precisou clicar no texto do label (`getByText("Manter conectado")`) em vez de `.click()` direto no input (`sr-only`) do componente `Checkbox` compartilhado — o span visível sobrepõe o input oculto e bloqueia a checagem de actionability estrita do Playwright; usuários reais não são afetados (ativação nativa via `<label>`).
- **Verificação:** `npm run lint` (0 erros), `npx tsc --noEmit` (0 erros), `npx vitest run` (426/426), `npx playwright test` para `login-errors`, `route-auth`, `ui-governance`, `visual.baseline` (login), `a11y.baseline`, `keyboard.baseline`, `contrast-report.baseline`, `epic14-mantine-removal.smoke`, `public-journeys` — todos verdes. `visual-verdict` contra `RH Cursos Login.dc.html`: **92/100, PASS** (a mockup `.dc.html` não renderiza os componentes `x-import` fora da ferramenta DC, então a comparação foi estrutural: layout, textos e hierarquia batem com a spec).
- **Pendências para @qa:** revisar screenshot final do baseline (`tests/baseline/login-baseline-desktop.png`) e o snapshot `login-card-governance-functional-darwin.png`; considerar rodar `visual-verdict` novamente quando a ferramenta DC estiver disponível para comparação pixel-a-pixel.
- **2026-07-12 — Fix DOC-001:** subtítulo fallback do card (`defaultPortalCopy.subtitle` em `Login.tsx`) alterado de "Bem-vindo de volta. Entre com suas credenciais." (repetia o H1) para **"Entre com suas credenciais para acessar o portal."**. `npx tsc --noEmit` e `npm run lint` seguem em 0 erros após o ajuste.

## QA Results

### Review Date: 2026-07-12

### Reviewed By: Quinn (Test Architect)

**Verificação executada (evidência):**

- `npm run lint` — **0 erros** (19 warnings pré-existentes, nenhum nos arquivos do login)
- `npx tsc --noEmit` — **0 erros**
- `npx vitest run` — **426/426** (35 arquivos)
- `npx playwright test route-auth + login-errors + epic14 smoke` — **34/34** (o `error` de "Falha ao revogar sessoes globais" no log é o fallback tratado do logout global; o teste correspondente passou)
- Baselines visuais (desktop/mobile) + snapshot `login-card-governance-functional-darwin.png` confirmam card centralizado, badge de portal, H1 Fraunces e CTA teal; `visual-verdict` 92/100 (dev)

**Cobertura dos AC:**

| AC | Verdict | Evidência |
|----|---------|-----------|
| AC1 — Layout centralizado | ✅ PASS | `BarePageShell` isola `/login` do header/footer; card único sobre fundo radial (baseline) |
| AC2 — Branding e tokens | ✅ PASS | logo horizontal + badge, radius/sombra, H1 Fraunces, CTA `--tk-cta` |
| AC3 — Papel no backend (D1=A) | ✅ PASS | `route.ts` deriva de `app_metadata.role` via `normalizeDashboardRole`; `role` da UI sequer é lido no corpo do POST; 403 sem papel válido |
| AC4 — Formulário e estados | ✅ PASS | validação Zod, alerta inline `role="alert"`, botão em `loading` |
| AC5 — Ações + Manter conectado (D2) | ✅ PASS | `remember` → TTL 30d vs 30min, persistido no token e preservado na rotação do GET |
| AC6 — Responsivo e acessível | ✅ PASS | baseline mobile ok; foco/labels/aria preservados |
| AC7 — Sem regressão de auth | ✅ PASS | `route-auth`/`login-errors` verdes com o novo contrato sem `role` |

**Segurança:** cookie de sessão com `httpOnly` + `sameSite=lax` + `secure` em produção. Nota informativa (fora de escopo): garantir `AUTH_SESSION_SECRET` setado em produção antes do go-live.

**Achados:**

- `DOC-001` (low): o subtítulo genérico do card repete o texto do H1 ("Bem-vindo de volta. Entre com suas credenciais." sob o H1 "Bem-vindo de volta"). Sugestão: ajustar a cópia do fallback. Não bloqueante.

### Re-Review Date: 2026-07-12 (pós-fix DOC-001)

**Contexto:** @dev aplicou o fix de `DOC-001`. Como a mudança altera o texto renderizado, a verificação exigiu **rebuild de produção** — o harness de teste (`harnessMode: production-build + local webServer`) serve o bundle `.next` pré-gerado, então testes contra um build antigo dariam falso-verde. Verificação refeita contra build fresco:

- `Login.tsx:50` — subtítulo fallback agora é "Entre com suas credenciais para acessar o portal." (não repete mais o H1) ✅
- `npm run build` (exit 0) — bundle de produção contém o texto novo (confirmado em `.next/server/chunks` e `.next/static/chunks`) ✅
- Baseline `login-card-governance-functional-darwin.png` regenerada com o texto novo, batendo com o render (tolerância zero de pixel) ✅
- `npx playwright test` (ui-governance card de login + epic14 smoke + a11y) contra build fresco — **verde** ✅
- `npm run lint` (0 erros) · `npx tsc --noEmit` (0 erros) · `npx vitest run` (426/426) ✅

**Resultado:** `DOC-001` **resolvido e verificado**. Nenhum issue em aberto. Código, baselines e build de produção consistentes.

### Gate Status

Gate: PASS (re-review) → docs/qa/gates/LOGIN-RD.1-login-redesign-card-centralizado.yml
