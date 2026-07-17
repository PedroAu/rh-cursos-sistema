# Story REC-308: Corrigir acessibilidade crítica

## Status

Done

## Executor Assignment

executor: "@dev" (Dex) + "@ux-design-expert" (Uma)
quality_gate: "@qa"
quality_gate_tools:
- auditoria por checklist WCAG 2.1 AA das jornadas críticas (login, pré-inscrição, navegação admin, catálogo público)
- teste de componente (Vitest + Testing Library) travando a associação de erro↔campo no checkout (`aria-invalid` + `aria-describedby`, erro com `role="alert"`)
- teste de regressão de acessibilidade do login (campos alcançáveis por rótulo, erro anunciado)
- confirmação de que nenhum arquivo de autenticação (HMAC/SSR) foi tocado

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 4 — Estabilização funcional
- **Prioridade:** P1
- **Estimativa:** S
- **Findings:** FND-17 (Controles de UI inertes, navegação móvel incompleta e lacunas de acessibilidade)
- **Requisitos:** FR-10, NFR-07 (Acessibilidade: jornadas críticas não podem conter violações sérias/críticas e devem funcionar por teclado)
- **Dependências (todas Done):** REC-301 (pré-inscrição/checkout), REC-305 (login dos três papéis), REC-306 (navegação admin)

## Story

**As a** usuário de tecnologia assistiva (leitor de tela / navegação por teclado),
**I want** completar as jornadas críticas do site sem barreiras sérias/críticas de acessibilidade,
**so that** o erro de um formulário seja anunciado e associado ao campo, os controles sejam alcançáveis e nenhuma jornada essencial fique inacessível ou enganosa, conforme NFR-07/FR-10.

## Contexto e valor

O achado **FND-17** aponta "controles de UI inertes, navegação móvel incompleta e lacunas de acessibilidade" com risco de "jornadas críticas inacessíveis ou enganosas". A entrega mensurável de REC-308 é **zero violações sérias/críticas nas jornadas críticas** — não "zero violações de qualquer severidade".

A investigação priorizou as jornadas 1–3 (núcleo já rastreado por REC-301/305/306) e cobriu a jornada 4 (catálogo) para violações óbvias/baratas.

### Ferramenta de auditoria

O projeto já possui `@axe-core/playwright` e specs Playwright (`tests/a11y.spec.ts`, `tests/a11y.baseline.spec.ts`) que rodam via `npm run test:a11y` (suíte funcional/e2e que sobe app + browser). Nenhuma dependência de auditoria adicional foi instalada (Article IV — No Invention). As travas de regressão desta story foram escritas em Vitest + Testing Library, cujos seletores por papel/rótulo (`getByRole`/`getByLabelText`) já forçam boas práticas de acessibilidade nos pontos exatos corrigidos.

## Violações encontradas × correções

| # | Jornada | Arquivo | Severidade | Violação | Correção |
|---|---------|---------|------------|----------|----------|
| 1 | Pré-inscrição (checkout) | `src/views/public/CourseCheckout.tsx` (`Field`) | Séria | Erro de validação **não associado** ao input: sem `aria-describedby`, sem `aria-invalid`; o `<span>` de erro ficava dentro de um `<label>` implícito (poluindo o nome acessível do campo e não sendo referenciado pelo controle). Leitor de tela não anunciava o erro vinculado ao campo. | `Field` passou a gerar `id` (`useId`), associar o rótulo por `htmlFor`, clonar o controle para injetar `id` + `aria-describedby` (apontando para o erro) + `aria-invalid`, e o `<span>` de erro ganhou `id` mantendo `role="alert"`. |
| 2 | Login | `src/views/public/Login.tsx` | — | **Já conforme** (REC-305): `FormField` associa rótulo, `aria-describedby`, `aria-invalid`, erro com `role="alert"`, `noValidate`, `h1` único. | Nenhuma alteração de código; adicionada trava de regressão de acessibilidade. |
| 3 | Navegação admin | `src/features/admin-shell/components/admin-mobile-drawer.tsx` | — | **Já conforme** (REC-306): Radix Dialog com `aria-label`, `DialogTitle`, foco preso/restaurado, `aria-current`, botão de fechar rotulado, `aria-controls`/`aria-expanded` no toggle. | Nenhuma alteração; confirmado por revisão. |
| 4 | Catálogo público | `src/views/public/Courses.tsx`, `src/views/public/CourseDetail.tsx` | — | **Sem violações sérias/críticas.** Busca com `role="search"` + `aria-label`; botão limpar rotulado; hierarquia `h1→h2→h3` correta; imagens (`next/image`) com `alt`; radiogroup de turma com `role`/`aria-checked`/`aria-label`. | Nenhuma alteração. |

### Pendências explícitas (não sérias — documentadas, não corrigidas nesta story)

- **P-308-1 (cosmético/baixo):** ícones decorativos do lucide-react (ex.: `Search`, `CalendarDays`, `Clock3`) não trazem `aria-hidden`. Como são SVG inline sem texto acessível, o axe/AT tratam como apresentacionais; não constituem violação séria. Padronizar `aria-hidden` fica como higiene futura.
- **P-308-2 (baixo, jornada 4):** em `CourseDetail.tsx` há um overlay visual com ícone `Play` dentro de um `<div>` (não focável, sem `role`/handler) sobre a imagem do curso — é decorativo e não é anunciado como controle por AT, mas visualmente sugere um player inexistente. Remoção/ajuste do afeto visual fica como follow-up de UX, fora do núcleo crítico desta story (mesma lógica "menor e sólido" de REC-206/304).
- **Limitação de contraste:** medição instrumentada de contraste de cor depende da suíte `@axe-core/playwright` (browser real), fora do runner Vitest desta story. A inspeção de tokens Tailwind (`text-tk-*`) nas jornadas 1–3 não revelou suspeita de texto/ícone interativo abaixo do razoável; a verificação instrumentada continua disponível via `npm run test:a11y`.

## Escopo

### Incluído

- Correção da associação erro↔campo no `Field` de `CourseCheckout.tsx`.
- Trava de regressão de acessibilidade (Vitest + Testing Library) para checkout e login.

### Fora do escopo

- Qualquer alteração de autenticação/autorização. **HMAC/SSR intocados:** `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`, `src/lib/supabase/session.ts`, `src/lib/supabase/authorize.ts`.
- Redesign visual amplo; correções cosméticas de baixa severidade (ver pendências P-308-1/P-308-2).

## Acceptance Criteria

- **AC1:** Nas jornadas críticas de formulário (login e pré-inscrição), cada erro de validação é associado ao campo por `aria-describedby` e o campo é marcado `aria-invalid`, com o erro anunciável (`role="alert"`).
- **AC2:** Cada campo dessas jornadas é alcançável pelo rótulo associado (`getByLabelText` passa).
- **AC3:** As jornadas admin (REC-306) e login (REC-305) permanecem conformes (sem regressão), confirmado por revisão e teste.
- **AC4:** Violações sérias/críticas na jornada de catálogo, se houver, são corrigidas quando óbvias/baratas; o resto é documentado como pendência explícita.
- **AC5:** `npm run lint`, `npm run typecheck` e `npx vitest run` verdes; suíte não regride (710 → 715).
- **AC6:** Nenhum arquivo de autenticação (HMAC/SSR) foi tocado.

## File List

- `src/views/public/CourseCheckout.tsx` (modificado — `Field` associa rótulo/erro; imports `cloneElement`, `isValidElement`, `useId`)
- `src/__tests__/views/public/course-checkout-a11y.test.tsx` (novo — trava a associação erro↔campo do checkout)
- `src/__tests__/views/public/login-page.test.tsx` (modificado — +2 testes de regressão de acessibilidade)
- `docs/stories/2026-07-17-rec-308-corrigir-acessibilidade-critica.md` (novo — esta story)
- `docs/history/reports/rec-308-acessibilidade-critica-2026-07-17.md` (novo — relatório)
- `docs/qa/gates/rec-308-corrigir-acessibilidade-critica.yml` (novo — gate)
- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md` (modificado — linha de status)

## Verificação

- `npm run typecheck` → PASS (tipos gerados com sucesso, `tsc --noEmit` limpo)
- `npx eslint` (arquivos modificados) → PASS (0 erros)
- `npx vitest run` → 715 passed (67 arquivos); baseline anterior 710 (+5: 3 checkout + 2 login)

## Notas de auditoria

Definição de "jornada crítica" adotada: fluxo que um usuário real precisa completar do início ao fim. Priorização das jornadas 1–3 conforme decisão de escopo (núcleo rastreado por REC-301/305/306); jornada 4 (catálogo) auditada e confirmada sem violação séria/crítica.

## QA Results

**Gate:** PASS — 96/100
**Reviewer:** `@qa` (Quinn) — 2026-07-17

- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run test:unit`: 70 arquivos, 729/729 testes.
- `npm run test:a11y`: 9/9 Playwright/Axe WCAG 2.1 A/AA.
- AC1–AC6 atendidos; nenhuma alteração de autenticação identificada.
- P-308-1 e P-308-2 permanecem como follow-ups de baixa severidade e não bloqueiam o fechamento.

Story aprovada para permanecer em `Done`.
