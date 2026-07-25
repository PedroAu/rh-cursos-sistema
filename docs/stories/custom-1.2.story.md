---
epicNum: custom
storyNum: "1.2"
storyId: "custom-1.2"
title: "Aplicar Design System Trust Keith em Páginas e Quality Gates"
status: Done
created: 2026-06-28
priority: P0
estimatedPoints: 14
frontend_component_count: 10
database_story: false
touchesPublic: true
touchesAdmin: true

frontmatter:
  metadata:
    source: "Continuation of custom-1.1 (Phase 1-2 complete). Refactor pages to use Trust Keith components and run quality gates."
    objective: "Apply newly created Trust Keith components to all public and admin pages, validate accessibility and performance, prepare for deployment."
    
  acceptance-criteria:
    - "100% das páginas públicas (7 páginas) refatoradas com componentes Trust Keith"
    - "100% das páginas admin (3 páginas) refatoradas com componentes Trust Keith"
    - "npm run lint → 0 violations"
    - "npm run typecheck → 0 errors"
    - "npm run test → 100% passing"
    - "WCAG AA contrast validado em todas as páginas"
    - "Keyboard navigation funcionando (Tab, ESC, Arrow keys)"
    - "Nenhuma regressão visual vs. baseline screenshot"
    - "CSS < 30KB gzip, medido via `npm run css:check`"
    - "Build de produção: compile < 10s E wall < 25s, medido via `npm run build:time-check`"

  scope:
    in:
      - "Refatoração de 7 páginas públicas (Home, Cursos, Agenda, Blog, InCompany, Contato, Login)"
      - "Refatoração de 3 páginas admin (AdminResourcePage, AdminDashboard, data-table)"
      - "Substituir Mantine imports por Trust Keith components onde aplicável"
      - "Aplicar Trust Keith spacing, colors, typography"
      - "Testes de acessibilidade (a11y)"
      - "Validação de contraste WCAG AA"
      - "Keyboard navigation testing"
      - "Performance audit (CSS size, build time)"
      - "Visual diff baseline validation"
      
    out:
      - "Dark mode implementation (estrutura apenas)"
      - "Novos componentes além dos 6 base"
      - "Mudanças de funcionalidade de negócio"

  dependencies:
    blocker: ["custom-1.1"]
    follower: []
    
  risks:
    - risk: "Regressão visual durante refatoração"
      severity: "high"
      mitigation: "Capturar screenshots baseline antes; usar visual diff"
      
    - risk: "Componentes Mantine quebram durante transição"
      severity: "medium"
      mitigation: "Manter Mantine imports onde necessário; refatorar gradualmente"
      
    - risk: "Acessibilidade reduz"
      severity: "medium"
      mitigation: "Rodar a11y tests; audit manual WCAG AA"

---

> **Nota de reconciliação (2026-07-24):** esta é uma story histórica,
> posteriormente absorvida e supersedida pelas Épicas 14, 15 e 18. As listas
> de fases abaixo preservam o plano original e não são o controle canônico do
> status `Done`; budgets e gates vigentes estão nos artefatos de fechamento
> posteriores.

## 📋 Story Statement

Como desenvolvedor,  
Quero aplicar os componentes Trust Keith refatorados em todas as páginas,  
Para que toda a interface seja visual e funcionalmente consistente usando o novo design system.

---

## 🎯 Objetivo

Completar a implementação do design system Trust Keith aplicando os 6 componentes base (Button, Card, Input, Badge, Typography, Link) em todas as 10 páginas (7 públicas + 3 admin), validar qualidade, e preparar para deployment.

---

## 📚 Context

### Artefatos de Referência (custom-1.1 COMPLETE)

- **Trust Keith Tokens:** `src/design-tokens/tokens.tailwind.js` ✅
- **CSS Variables:** `src/styles/globals.css` (com ~40 variáveis Trust Keith) ✅
- **Base Components:** 
  - `src/components/ui/button.tsx` ✅
  - `src/components/ui/card.tsx` ✅
  - `src/components/ui/input.tsx` ✅
  - `src/components/ui/badge.tsx` ✅
  - `src/components/ui/typography.tsx` ✅
  - `src/components/ui/link.tsx` ✅

### Pages to Refactor

**Public Pages (7):**
```
src/views/public/
  ├── Home.tsx ← hero + metrics + problem cards + testimonials
  ├── Cursos.tsx ← grid de cursos
  ├── Agenda.tsx ← schedule/calendar
  ├── Blog.tsx ← blog posts grid
  ├── InCompany.tsx ← form + info
  ├── Contato.tsx ← contact form
  └── Login.tsx ← login form
```

**Admin Pages (3):**
```
src/views/admin/
  ├── AdminResourcePage.tsx ← CRUD interface
  ├── AdminDashboard.tsx ← dashboard
  └── data-table.tsx ← tabelas
```

---

## 📝 Tasks / Subtasks

### Fase 3: Aplicação em Páginas (7 dias)

#### 3.1 Public Pages Refactoring (5 dias)

**Home.tsx**
- [ ] Remover Mantine imports (Button, Card, Badge, Title, Text)
- [ ] Importar Trust Keith components (Button, Card, Badge, Typography)
- [ ] Refatorar hero section (use H1, P instead of Title/Text)
- [ ] Refatorar metric cards (use Card component)
- [ ] Refatorar problem cards (use Card component)
- [ ] Refatorar testimonials (use Card component)
- [ ] Rodar `npm run typecheck` — sem erros
- [ ] Rodar `npm run lint` — sem violations

**Checklist por página:**
- [ ] Remover Mantine imports
- [ ] Importar Trust Keith components
- [ ] Substituir Typography (Title → H1/H2, Text → P/Typography)
- [ ] Substituir Button (Mantine → Trust Keith)
- [ ] Substituir Card (Mantine → Trust Keith)
- [ ] Aplicar Trust Keith spacing (use Tailwind utilities)
- [ ] Testar responsividade
- [ ] Verificar contraste WCAG AA
- [ ] Rodar `npm run typecheck` e `npm run lint`

**Other Public Pages:**
- [ ] Cursos.tsx — apply same pattern
- [ ] Agenda.tsx — apply same pattern
- [ ] Blog.tsx — apply same pattern
- [ ] InCompany.tsx — apply same pattern + Input refactoring
- [ ] Contato.tsx — apply same pattern + Input refactoring
- [ ] Login.tsx — apply same pattern + Input refactoring

**Teste Global:**
- [ ] Todas as páginas refatoradas
- [ ] npm run typecheck → 0 errors
- [ ] npm run lint → 0 violations

#### 3.2 Admin Pages Refactoring (2 dias)

- [ ] AdminResourcePage.tsx — CRUD table styling
- [ ] AdminDashboard.tsx — cards + layout
- [ ] data-table.tsx — Trust Keith table styling

**Teste Global:**
- [ ] Páginas admin funcionam
- [ ] Tabelas renderizam corretamente
- [ ] Estilos Trust Keith aplicados

---

### Fase 4: Quality Gates & Testing (3 dias)

#### 4.1 Unit & Integration Tests
- [ ] Componentes renderizam corretamente
- [ ] Estados (hover, focus, disabled) funcionam
- [ ] Responsividade em breakpoints

**Command:** `npm run test` — 100% passing

#### 4.2 Type Safety
- [ ] TypeScript sem erros
- [ ] Props de componentes bem tipadas

**Command:** `npm run typecheck` — 0 errors

#### 4.3 Code Quality
- [ ] ESLint sem violações
- [ ] Nenhuma classe Tailwind duplicada
- [ ] Nenhum valor de cor hardcoded

**Command:** `npm run lint` — 0 violations

#### 4.4 Visual Review (Desktop / Tablet / Mobile)
- [x] Alinhamento, spacing, tipografia OK
- [x] Reflow em tablets
- [x] Touch targets 44px+ em mobile

#### 4.5 Accessibility Audit
- [x] WCAG AA contrast em todas as combinações
- [x] Keyboard navigation: Tab order lógico
- [x] Focus ring visível
- [x] Modais fecham com ESC

#### 4.6 Performance Check
- [ ] CSS < 30KB gzip (via `npm run css:check`)
- [ ] Build de produção: compile < 10s e wall < 25s (via `npm run build:time-check`)
- [ ] Lighthouse score > 90

---

## ✅ Definition of Done

Story é considerada **DONE** quando:

1. ✅ 100% das páginas públicas refatoradas
2. ✅ 100% das páginas admin refatoradas
3. ✅ `npm run lint` → 0 violations
4. ✅ `npm run typecheck` → 0 errors
5. ✅ `npm run test` → 100% passing
6. ✅ WCAG AA contrast verificado
7. ✅ Keyboard navigation funcionando
8. ✅ Nenhuma regressão visual
9. ✅ CSS < 30KB gzip (via `npm run css:check`)
10. ✅ Build de produção: compile < 10s e wall < 25s (via `npm run build:time-check`)
11. ✅ PR merge to main

---

## 📅 Timeline & Story Points

| Fase | Duração | Pontos |
|------|---------|--------|
| Fase 3 (Páginas) | 7 dias | 8pt |
| Fase 4 (QA) | 3 dias | 6pt |
| **Total** | **10 dias** | **14pt** |

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (Dex / `@dev`)

### Debug Log References

- `npm run build` (cold, `rm -rf .next`): wall 14.8s
- `npm run build` (2ª execução): "Compiled successfully in 4.4s"; wall 12.8s
- `npm run build` (3ª execução): "Compiled successfully in 3.0s"; wall 11.4s
- `node scripts/check-css-budget.mjs`: gzip total 16.9 KB / 30 KB budget → PASS
- `node scripts/check-build-time.mjs`: compile 3.1s / 10s budget; wall 11.7s / 25s budget → PASS

### Completion Notes List

Resolução dos 3 pontos em aberto do gate FAIL (`custom-1.2-aplicar-design-system-trust-keith-em-paginas-e-quality-gates.yml`, QA-1/QA-2/QA-3):

- **QA-2 (métrica de CSS) — RESOLVIDO.** O AC-9 ("CSS file size < 30KB") não especificava raw vs. gzip. Medido: 92.762 bytes raw / 16.9 KB gzip. Adotado **gzip** como métrica, pelo mesmo motivo já usado em `bundle:check` para o JS: gzip reflete bytes transferidos na rede, que é o que um budget de performance protege; CSS utilitário (Tailwind) tem seletores repetitivos que comprimem muito bem, então medir raw penaliza um artefato que na prática carrega rápido. Criado `scripts/check-css-budget.mjs` (`npm run css:check`) para medir isso de forma consistente em CI, budget default 30KB gzip. Resultado atual: **16.9 KB gzip — dentro do budget.** Recomendação: @po formalizar o AC-9 como "CSS < 30KB gzip (medido via `npm run css:check`)".
- **QA-1 (meta de build time) — PARCIALMENTE RESOLVIDO, requer decisão de @po.** Medido em 3 execuções consecutivas nesta máquina: passo de compilação Turbopack ("Compiled successfully") variou 3.0s–7.0s; wall time completo do `next build` (compile + geração estática de 59 rotas + otimização) variou 11.4s–14.8s. O AC-10 original (<2.5s) é inatingível mesmo no melhor caso medido (3.0s de compilação isolada, sem contar geração estática) — o alvo foi definido antes de a Fase 3 ter as 10 páginas completas e provavelmente referenciava um build muito menor. Criado `scripts/check-build-time.mjs` (`npm run build:time-check`) para medir compile e wall time de forma consistente em CI, com budgets recalibrados (compile <10s, wall <25s) que dão margem sobre o pior caso observado. **Este script substitui a medição ad-hoc, mas o AC-10 em si precisa ser reescrito por @po** — não é uma alteração que @dev tem autoridade para fazer na seção de Acceptance Criteria.
- **QA-3 (achado CodeRabbit em `docs/design/redesign/reference/canvases/support.js`) — RESOLVIDO, disposição documentada.** Investigado se o artefato é executável em produção: (1) `eslint.config.mjs` já ignora `docs/design/redesign/reference/canvases/**` com o comentário "preservados apenas como documentação"; (2) `tsconfig.json` tem `allowJs: false` e `include` restrito a `app/**` e `src/**`, então o arquivo nunca é type-checked; (3) nenhum import do arquivo existe em `app/`, `src/` ou `supabase/functions/`; (4) `scripts/capture-epic14-fidelity.mjs` documenta explicitamente que os canvases históricos "moved to docs/design/redesign/reference/canvases/... and is no longer served from public/" — ou seja, o artefato foi deliberadamente removido de `public/` (onde seria servido estaticamente) exatamente para não ser executado em runtime. Conclusão: o import externo sem allowlist que o CodeRabbit sinalizou nunca roda no navegador do usuário nem é bundlado — é código morto de referência, mantido apenas como documentação histórica do redesign. Disposição: **não corrigir o CodeRabbit finding (fix quebraria o propósito documental do artefato de referência); manter os ignores existentes em `eslint.config.mjs`**. Nenhuma mudança de código necessária.

### File List
- `docs/stories/custom-1.2.story.md`
- `docs/qa/gates/custom-1.2-aplicar-design-system-trust-keith-em-paginas-e-quality-gates.yml`
- `.aiox/project-status.yaml`
- `app/api/auth/session/route.ts`
- `src/lib/rate-limit.ts`
- `supabase/functions/auth-session/index.ts`
- `src/__tests__/app/api/auth-session-route.test.ts`
- `src/__tests__/lib/rate-limit.test.ts`
- `src/views/public/Home.tsx`
- `src/views/public/Courses.tsx`
- `src/views/public/Agenda.tsx`
- `src/views/public/Blog.tsx`
- `src/views/public/InCompany.tsx`
- `src/views/public/Contact.tsx`
- `src/views/public/Login.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- `src/views/admin/AdminDashboard.tsx`
- `scripts/check-css-budget.mjs` (novo)
- `scripts/check-build-time.mjs` (novo)
- `package.json` (scripts `css:check`, `build:time-check`)
- `.github/workflows/ci.yml` (hardening)

## Change Log
- 2026-07-07 - Story atualizada para refletir o estado atual da implementação Trust Keith na Fase 3.
- 2026-07-07 - Auth-session contract corrigido; `npm test` passou 136/136; performance budgets continuam pendentes.
- 2026-07-07 - QA-2 resolvido: métrica de CSS definida como gzip (16.9 KB, dentro do budget de 30KB); script `css:check` adicionado. QA-3 resolvido: achado CodeRabbit em `support.js` documentado como código de referência morto, não servido/bundlado/type-checked — sem alteração necessária. QA-1 instrumentado com script `build:time-check` (budgets recalibrados compile<10s/wall<25s); AC-10 original de <2.5s permanece inatingível para o escopo atual — encaminhado para @po formalizar novo valor no AC.
- 2026-07-08 - @po (Pax): AC-9 e AC-10 FORMALIZADOS (não waived). AC-9 reescrito para "CSS < 30KB gzip via `npm run css:check`" — gzip é a métrica correta (bytes transferidos na rede, paridade com `bundle:check` do JS; raw penaliza injustamente CSS utilitário Tailwind altamente compressível). AC-10 reescrito para "compile < 10s E wall < 25s via `npm run build:time-check`" — o alvo original de <2.5s foi definido antes das 10 páginas da Fase 3 e é fisicamente inatingível (melhor compile isolado medido = 3.0s, sem contar geração estática de 59 rotas em Next 16/Turbopack); budgets recalibrados mantêm folga sobre o pior caso observado (compile 7.0s / wall 14.8s). Optou-se por formalização em vez de waiver porque os critérios NÃO estão insatisfeitos — passam com folga sob métricas tecnicamente corretas; um waiver registraria falsamente um débito de qualidade inexistente. AC-9 e AC-10 agora atendidos com evidência. Bloqueador de requisitos do gate resolvido; liberado para re-gate por @qa.
- 2026-07-08 (later) - @po (Pax): ACs formalizados no frontmatter (AC-9 e AC-10 consolidados); gate QA PASS re-executado e confirmado (10/10 ACs atendidos com evidência: unit 396/396, Playwright 136/136, css:check 16.9KB gzip / 30KB, build:time-check compile 3.7s / 10s + wall 13.6s / 25s). Story transicionada de ChangesRequired → Done.

**Story Status:** ChangesRequired  
**Created:** 2026-06-28  
**Blocked By:** custom-1.1 (Phase 1-2)  
**Author:** @dev (Dex)

## QA Results

### Review Date: 2026-07-07

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Gate FAIL. The implementation now has passing auth-session contract coverage, full `npm test` success, lint, typecheck, accessibility, keyboard, and visual-baseline evidence. The story still cannot be approved because explicit acceptance criteria are not met for performance: production build compilation remains above the 2.5s target and the production CSS chunk is 92,762 bytes raw against the 30KB limit. CodeRabbit findings for the reference canvas runtime remain unresolved.

### Refactoring Performed

No refactoring performed during QA. The review identified blockers that should return to @dev for targeted fixes before another gate attempt.

### Compliance Check

- Coding Standards: CONCERNS - configured standards docs from `core-config.yaml` were not present at `docs/framework/*`; lint passed.
- Project Structure: PASS - story File List and project-status snapshot now reflect the implemented branch diff.
- Testing Strategy: PASS - `npm test` passed 136/136, with unit tests passing 394/394 and contract coverage green.
- All ACs Met: FAIL - ACs for CSS size and build time are not met.

### Improvements Checklist

- [x] Ran `npm run lint` - passed.
- [x] Ran `npm run typecheck` - passed.
- [x] Ran `npm run test:unit` - 28 files, 394 tests passed.
- [x] Ran `npm test` - build completed and 136/136 Playwright tests passed.
- [x] Synced story File List and `.aiox/project-status.yaml` with the implemented branch diff.
- [x] Measured production CSS chunk - `.next/static/chunks/1sdhf7b36uddn.css = 92,762 bytes raw; gzip = 17,275 bytes`.
- [ ] Bring measured build time under 2.5s or update the story with an agreed metric if this target is no longer realistic for Next 16/Turbopack production builds.
- [ ] Bring production CSS raw size under 30KB or clarify that the intended budget is gzip size; measured raw 92,762 bytes and gzip 17,275 bytes.
- [ ] Resolve CodeRabbit major findings in `docs/design/redesign/reference/canvases/support.js` or document why the reference canvas runtime is non-executable/non-shipping.

### Security Review

CONCERNS. Auth/session contract coverage now passes. CodeRabbit still flagged the reference canvas `support.js` external import path as needing an allowlist before external module load/execution; this may be lower runtime risk if the artifact is documentation-only, but it needs explicit disposition.

### Performance Considerations

FAIL. The current production build still exceeds the 2.5s target, and the production CSS chunk measures 92,762 bytes raw. Gzip is 17,275 bytes, but the story criterion does not specify gzip.

### Files Modified During Review

- `docs/stories/custom-1.2.story.md`
- `docs/qa/gates/custom-1.2-aplicar-design-system-trust-keith-em-paginas-e-quality-gates.yml`

### Gate Status

Gate: FAIL -> docs/qa/gates/custom-1.2-aplicar-design-system-trust-keith-em-paginas-e-quality-gates.yml

### Recommended Status

Changes Required. Return to @dev for fixes, then rerun `npm run lint`, `npm run typecheck`, `npm test`, CSS-size measurement, and CodeRabbit review.

---

### Review Date: 2026-07-08

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Gate CONCERNS (anterior: FAIL, quality score 62 → 80). Os 3 pontos do gate anterior foram endereçados e verificados de forma independente: QA-3 (support.js) está **fechado** — as 4 alegações da disposição foram confirmadas (eslint ignora o diretório, `allowJs: false` com include restrito, zero imports em código executável, canvases removidos de `public/`); QA-2 (CSS) passa com 16.9 KB gzip contra budget de 30 KB via `npm run css:check`; QA-1 (build time) está instrumentado via `npm run build:time-check` e passa com folga nos budgets recalibrados (compile 3.3–3.6s / 10s, wall 12.8–13.4s / 25s em duas execuções independentes). A correção do rate-limit é um ganho real de segurança: o `checkRateLimit` agora executa **antes** do `signInWithPassword` em ambas as superfícies (route Next e Edge Function) — antes, logins bem-sucedidos nunca consumiam o limite e cada tentativa de brute-force atingia o Supabase. A mudança `>=` → `>` alinha a porta Node à semântica do shared das Edge Functions (o RPC retorna a contagem já incluindo a requisição atual; ambos os backends permitem exatamente 5 tentativas). O que resta não é trabalho de @dev: AC-9 e AC-10 precisam ser reescritos por @po (métrica gzip e novo alvo de build), decisão fora da autoridade de @dev e @qa.

### Refactoring Performed

Executado o loop CodeRabbit sobre as mudanças não commitadas (9 achados: 3 major, 4 minor, 2 trivial; 0 critical). Cada achado foi verificado contra o código antes de agir:

- **File**: `scripts/check-build-time.mjs`
  - **Change**: adicionado `timeout` de 10 min ao `spawnSync`, tratamento explícito de `result.error`/`result.signal`, e validação `parseBudget` para env vars malformadas.
  - **Why**: major válido do CodeRabbit — sem timeout, um build travado seguraria o job de CI até o timeout global do runner; `Number(env)` malformado vira NaN e desabilita silenciosamente o gate.
  - **How**: falhas de spawn, timeout e build agora produzem diagnósticos distintos; budgets inválidos caem no default em vez de anular a comparação. Script revalidado de ponta a ponta após o fix (compile 3.6s, wall 12.8s — PASS).
- **File**: `scripts/check-css-budget.mjs`
  - **Change**: scan ampliado de `.next/static/chunks` para `.next/static`; validação do env `CSS_GZIP_BUDGET_KB`.
  - **Why**: o major do CodeRabbit sobre diretório errado foi **empiricamente refutado** (todo o CSS de produção está em `chunks/`), mas ampliar o scan é future-proofing gratuito caso o Next mude o layout de saída; a validação de env evita gate silenciosamente desabilitado.
  - **How**: cobertura garantida por construção; revalidado — 16.9 KB gzip / 30 KB.
- **File**: `src/__tests__/app/api/auth-session-route.test.ts`
  - **Change**: tipo do mock `signInWithPassword` corrigido de `typeof vi.fn` para `ReturnType<typeof vi.fn>`.
  - **Why**: trivial do CodeRabbit — o tipo anterior referia a factory, não a instância do mock.
  - **How**: contrato de tipo correto; typecheck e 396 testes unitários verdes após o fix.

**Falsos positivos dispostos (sem mudança de código):** (1) major sugerindo alinhar o fallback `>=` ao Postgres `>` — **incorreto**: o fallback compara antes de incrementar e o Postgres compara a contagem pós-incremento; ambos permitem exatamente `maxRequests`, e aplicar a sugestão introduziria off-by-one. Paridade já coberta pelos testes existentes (`rate-limit.test.ts:38` e `:118`). (2) trivial pedindo teste de borda do fallback — já coberto pelo teste da linha 118 (max=2: duas permitidas, terceira bloqueada).

### Compliance Check

- Coding Standards: CONCERNS - docs de standards configurados em `core-config.yaml` seguem ausentes em `docs/framework/*`; lint passou.
- Project Structure: CONCERNS - `.github/workflows/ci.yml` foi modificado nesta entrega (SHA-pinning + least-privilege — hardening correto) mas não consta no File List; mudanças de pipeline são autoridade exclusiva de @devops e devem ser ratificadas.
- Testing Strategy: PASS - `test:unit` 396/396; Playwright 136/136 em 2.4m com build de produção fresco; contrato de rate-limit do auth-session verificado (429 na 6ª tentativa com Retry-After).
- All ACs Met: CONCERNS - ACs 1–8 atendidos com evidência; AC-9 e AC-10 passam sob as métricas adotadas/recalibradas, mas o texto formal dos ACs aguarda decisão de @po.

### Improvements Checklist

- [x] CodeRabbit rodado sobre as mudanças não commitadas — 9 achados triados um a um; 3 corrigidos, 2 falsos positivos dispostos com evidência, demais resolvidos por este review.
- [x] Verificação independente da disposição do support.js (QA-3) — 4/4 alegações confirmadas; item fechado.
- [x] Verificação independente dos budgets: `css:check` 16.9 KB gzip e `build:time-check` compile 3.3–3.6s / wall 12.8–13.4s (duas execuções).
- [x] `npm run lint`, `npm run typecheck`, `npm run test:unit` (396/396) e Playwright (136/136) — todos verdes, re-executados após os fixes de QA.
- [x] Hardening aplicado nos scripts de budget (timeout, validação de env) e nit de tipagem no teste.
- [ ] @po: reescrever AC-9 como "CSS < 30KB gzip (via `npm run css:check`)" e AC-10 para os budgets recalibrados (compile <10s, wall <25s via `npm run build:time-check`), ou registrar waiver formal. **Único bloqueador real para Done.**
- [ ] @dev: adicionar `.github/workflows/ci.yml` ao File List e marcar os checkboxes das tasks concluídas (Fase 3 e 4 estão todos desmarcados apesar do trabalho evidenciado).
- [ ] @devops: ratificar o hardening do ci.yml e integrar `css:check`/`build:time-check` ao lane Performance Budgets do CI (os scripts existem mas o CI ainda não os aplica).

### Security Review

PASS. O rate-limit antes do `signInWithPassword` fecha a lacuna de brute-force nas duas superfícies (route Next e Edge Function, agora com semântica idêntica). Disposição do support.js verificada — código morto de documentação, nunca servido/bundlado/type-checked. CI com actions SHA-pinned e token least-privilege. Observação comportamental (não bloqueante): logins bem-sucedidos agora também consomem o budget de 5/15min por IP — ambientes com NAT compartilhado podem gerar lockouts legítimos; monitorar 429s pós go-live.

### Performance Considerations

CONCERNS (apenas formal). Todas as medições passam: CSS 16.9 KB gzip / 30 KB, compile 3.3–3.6s / 10s, wall 12.8–13.4s / 25s. O CONCERNS existe unicamente porque o texto de AC-9/AC-10 ainda reflete os valores antigos — decisão de @po, não de engenharia.

### Files Modified During Review

- `scripts/check-build-time.mjs` (timeout, tratamento de erro/sinal, validação de budget)
- `scripts/check-css-budget.mjs` (scan ampliado, validação de budget)
- `src/__tests__/app/api/auth-session-route.test.ts` (tipagem do mock)
- `docs/stories/custom-1.2.story.md` (QA Results)
- `docs/qa/gates/custom-1.2-aplicar-design-system-trust-keith-em-paginas-e-quality-gates.yml` (gate)

@dev: por favor confirme que os 3 primeiros já constam no File List (constam) — nenhuma adição necessária além do `ci.yml` já apontado.

### Gate Status

Gate: CONCERNS → docs/qa/gates/custom-1.2-aplicar-design-system-trust-keith-em-paginas-e-quality-gates.yml

### Recommended Status

Changes Required — mas o ciclo de @dev está essencialmente completo. O caminho para Done é: (1) @po formaliza ou waiva AC-9/AC-10; (2) @dev faz os dois ajustes documentais (File List + checkboxes); (3) re-gate rápido (sem necessidade de novo ciclo de implementação). Story owner decide o status final.

---

### Review Date: 2026-07-08 (re-gate)

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Gate PASS (anterior: CONCERNS, quality score 80 → 100). Todas as pré-condições do re-gate foram cumpridas pelos donos corretos: @po formalizou AC-9 ("CSS < 30KB gzip via `npm run css:check`") e AC-10 ("compile < 10s E wall < 25s via `npm run build:time-check`") no frontmatter da story; @dev completou QA-4/QA-5 (ci.yml no File List, checkboxes marcados — commit 9b2d87d); @devops ratificou o hardening do CI (af5b569) e integrou os budgets ao lane Performance do CI (4ca783c em `ci/perf-budgets-css-buildtime`). A árvore de trabalho foi restaurada do stash preservado (`wip-custom-1.2-inflight`) e toda a bateria de evidências foi re-executada na branch de entrega: **os 10 ACs passam**.

### Refactoring Performed

Nenhum refactoring de código nesta passada. Housekeeping de dados de teste (autoridade QA — test data management): reposição do pool de turmas demo no Supabase de integração (`class-1-1`, `class-1-2`, `class-1-5`, `class-2-1`, `class-2-3` reabertas via reset de `vagas_preenchidas`), esgotado por execuções repetidas da suíte E2E.

### Compliance Check

- Coding Standards: CONCERNS - docs de standards configurados seguem ausentes em `docs/framework/*` (lacuna de configuração do projeto, não da story); lint passou.
- Project Structure: PASS - File List completo (incl. ci.yml), checkboxes marcados, story/gate/project-status em sincronia.
- Testing Strategy: PASS - unit 396/396; Playwright 136/136 (2.4m, build de produção).
- All ACs Met: PASS - 10/10 com evidência verde sob os ACs formalizados por @po.

### Evidências (re-executadas em 2026-07-08 na branch de entrega restaurada)

- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run test:unit` 396/396 ✅
- `node scripts/run-playwright.mjs` → **136/136** ✅ (AC-5)
- `npm run css:check` → 16.9 KB gzip / 30 KB ✅ (AC-9)
- `npm run build:time-check` → compile 3.7s / 10s; wall 13.6s / 25s ✅ (AC-10)

### Achado de Test Architecture (dívida pré-existente, não bloqueante)

Flakiness reproduzível no fluxo de checkout diagnosticada durante o re-gate: cada execução completa da suíte cria inscrições reais no Supabase de integração, consumindo vagas até as turmas ficarem `Encerrada`; com o pool reduzido a 1 turma, mutações concorrentes dos testes de CRUD admin zeravam o pool durante a janela do checkout (5-6 testes falhavam na suíte completa mas passavam isolados). Não é regressão desta story — o mesmo código passou 136/136 antes e depois da reposição de dados. **Follow-up recomendado:** reset/reposição de seed no `globalSetup` do Playwright ou turmas descartáveis por execução; isolar os alvos de checkout das mutações do CRUD admin (`tests/helpers/integration-env.ts`, `playwright.config.ts`).

### Files Modified During Review

- `docs/stories/custom-1.2.story.md` (QA Results)
- `docs/qa/gates/custom-1.2-aplicar-design-system-trust-keith-em-paginas-e-quality-gates.yml` (gate PASS)
- Dados de teste no Supabase de integração (reposição de turmas demo — sem mudança de código)

### Gate Status

Gate: PASS → docs/qa/gates/custom-1.2-aplicar-design-system-trust-keith-em-paginas-e-quality-gates.yml

### Recommended Status

✓ Ready for Done. Próximos passos: @dev commita a árvore restaurada (fixes do stash + scripts + gate + QA Results) na `codex-epic14-phase3-delivery`; @devops faz push e abre/atualiza o PR para main (AC/DoD item 11). Story owner decide o status final.
