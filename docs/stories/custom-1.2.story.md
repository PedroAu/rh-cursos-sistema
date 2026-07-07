---
epicNum: custom
storyNum: "1.2"
storyId: "custom-1.2"
title: "Aplicar Design System Trust Keith em Páginas e Quality Gates"
status: ReadyForReview
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
    - "CSS file size < 30KB (medido)"
    - "Build time < 2.5s (medido)"

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
- [ ] Alinhamento, spacing, tipografia OK
- [ ] Reflow em tablets
- [ ] Touch targets 44px+ em mobile

#### 4.5 Accessibility Audit
- [ ] WCAG AA contrast em todas as combinações
- [ ] Keyboard navigation: Tab order lógico
- [ ] Focus ring visível
- [ ] Modais fecham com ESC

#### 4.6 Performance Check
- [ ] CSS file size < 30KB
- [ ] Build time < 2.5s
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
9. ✅ CSS file size < 30KB
10. ✅ Build time < 2.5s
11. ✅ PR merge to main

---

## 📅 Timeline & Story Points

| Fase | Duração | Pontos |
|------|---------|--------|
| Fase 3 (Páginas) | 7 dias | 8pt |
| Fase 4 (QA) | 3 dias | 6pt |
| **Total** | **10 dias** | **14pt** |

---

## File List
- `docs/stories/custom-1.2.story.md`
- `src/views/public/Home.tsx`
- `src/views/public/Courses.tsx`
- `src/views/public/Agenda.tsx`
- `src/views/public/Blog.tsx`
- `src/views/public/InCompany.tsx`
- `src/views/public/Contact.tsx`
- `src/views/public/Login.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- `src/views/admin/AdminDashboard.tsx`

## Change Log
- 2026-07-07 - Story atualizada para refletir o estado atual da implementação Trust Keith na Fase 3.

**Story Status:** ReadyForReview  
**Created:** 2026-06-28  
**Blocked By:** custom-1.1 (Phase 1-2)  
**Author:** @dev (Dex)

## QA Results

### Review Date: 2026-07-07

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

Gate FAIL. The implementation has useful evidence for accessibility, visual baseline, keyboard navigation, unit tests, lint, and typecheck, but the story cannot be approved because explicit acceptance criteria are not met: `npm test` is failing, production build compilation time was measured at 4.0s against the 2.5s limit, and the production CSS chunk is 92,762 bytes raw against the 30KB limit. CodeRabbit also reported major findings in the moved canvas runtime reference artifact and a stale `.aiox/project-status.yaml` snapshot.

### Refactoring Performed

No refactoring performed during QA. The review identified blockers that should return to @dev for targeted fixes before another gate attempt.

### Compliance Check

- Coding Standards: CONCERNS - configured standards docs from `core-config.yaml` were not present at `docs/framework/*`; lint passed.
- Project Structure: CONCERNS - story File List is incomplete versus the branch diff and omits files materially changed by this delivery.
- Testing Strategy: FAIL - `npm test` failed 1/136 Playwright tests, despite unit tests passing 394/394.
- All ACs Met: FAIL - ACs for `npm run test`, CSS size, and build time are not met.

### Improvements Checklist

- [x] Ran `npm run lint` - passed.
- [x] Ran `npm run typecheck` - passed.
- [x] Ran `npm run test:unit` - 28 files, 394 tests passed.
- [x] Ran `npm test` - build completed and 135/136 Playwright tests passed, but one contract test failed.
- [x] Ran CodeRabbit review against `main` - 14 findings, including major findings.
- [ ] Fix `/api/auth/session` rate-limit contract so `tests/api-contract.spec.ts:131` receives 429 instead of 401 after repeated invalid attempts.
- [ ] Bring measured build time under 2.5s or update the story with an agreed metric if this target is no longer realistic for Next 16/Turbopack production builds.
- [ ] Bring production CSS raw size under 30KB or clarify that the intended budget is gzip size; measured raw 92,762 bytes and gzip 17,244 bytes.
- [ ] Resolve CodeRabbit major findings in `docs/design/redesign/reference/canvases/support.js` or document why the reference canvas runtime is non-executable/non-shipping.
- [ ] Update `.aiox/project-status.yaml` and the story File List so project automation and QA evidence reflect the actual branch diff.

### Security Review

CONCERNS. Application auth/session security was not approved because the aggregate test suite failed in the auth-session rate-limit contract. CodeRabbit also flagged the reference canvas `support.js` external import path as needing an allowlist before external module load/execution; this may be lower runtime risk if the artifact is documentation-only, but it needs explicit disposition.

### Performance Considerations

FAIL. `next build` reported compilation in 4.0s, above the story target of 2.5s. The production CSS chunk measured 92,762 bytes raw; gzip is 17,244 bytes, but the story criterion does not specify gzip.

### Files Modified During Review

- `docs/stories/custom-1.2.story.md`
- `docs/qa/gates/custom-1.2-aplicar-design-system-trust-keith-em-paginas-e-quality-gates.yml`

### Gate Status

Gate: FAIL -> docs/qa/gates/custom-1.2-aplicar-design-system-trust-keith-em-paginas-e-quality-gates.yml

### Recommended Status

Changes Required. Return to @dev for fixes, then rerun `npm run lint`, `npm run typecheck`, `npm test`, CSS-size measurement, and CodeRabbit review.
