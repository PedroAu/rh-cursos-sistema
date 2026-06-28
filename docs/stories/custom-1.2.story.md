---
epicNum: custom
storyNum: "1.2"
storyId: "custom-1.2"
title: "Aplicar Design System Trust Keith em Páginas e Quality Gates"
status: Draft
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

**Story Status:** Draft  
**Created:** 2026-06-28  
**Blocked By:** custom-1.1 (Phase 1-2)  
**Author:** @dev (Dex)
