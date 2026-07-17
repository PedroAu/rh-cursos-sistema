# Relatório REC-308 — Corrigir acessibilidade crítica

- **Data:** 2026-07-17
- **Épica:** 17 — Recuperação SEV-0
- **Story:** [REC-308](../../stories/2026-07-17-rec-308-corrigir-acessibilidade-critica.md)
- **Finding:** FND-17 · **Requisitos:** FR-10, NFR-07
- **Escopo:** puramente frontend/acessibilidade. Sem relação com autenticação/autorização.

## 1. Objetivo

Garantir **zero violações sérias/críticas** de acessibilidade (WCAG 2.1 AA) nas jornadas críticas, com operação por teclado e anúncio de erros a leitores de tela (NFR-07).

## 2. Método

Ferramenta de auditoria existente no projeto: `@axe-core/playwright` + `tests/a11y.spec.ts` / `tests/a11y.baseline.spec.ts` (via `npm run test:a11y`, suíte funcional que sobe app + browser). **Nenhuma dependência de auditoria nova foi instalada** (Article IV — No Invention). As travas de regressão foram escritas em Vitest + Testing Library, cujos seletores `getByRole`/`getByLabelText` forçam boas práticas de acessibilidade exatamente nos pontos corrigidos.

Auditoria manual sistemática por checklist WCAG 2.1 AA (imagens sem `alt`; formulários sem rótulo associado; foco/alcance por teclado; erro de formulário associado ao campo; hierarquia de headings) nas jornadas 1–3 (núcleo crítico) e varredura da jornada 4.

## 3. Resultado por jornada

### Jornada 1 — Login (`src/views/public/Login.tsx`)
**Já conforme (REC-305).** `FormField` associa rótulo (`htmlFor`), `aria-describedby`, `aria-invalid`; erro com `role="alert"`; `<form noValidate>`; um único `h1`. Nenhuma correção necessária — nenhuma foi inventada. Adicionada trava de regressão.

### Jornada 2 — Pré-inscrição / checkout (`src/views/public/CourseCheckout.tsx`)
**1 violação SÉRIA corrigida.** O componente local `Field` renderizava o rótulo como `<label>` envolvendo o input (associação implícita) e o `<span>` de erro **dentro** desse label, **sem** `aria-describedby` e **sem** `aria-invalid`. Efeitos:
- o texto de erro passava a integrar o *accessible name* do campo (nome poluído);
- o input não era marcado inválido nem referenciava a mensagem — leitores de tela não vinculavam o erro ao campo.

**Correção (menor diff correto):** `Field` passou a gerar `id` via `useId`, associar o rótulo por `htmlFor`, clonar o controle (`cloneElement`) para injetar `id` + `aria-describedby` (apontando o erro) + `aria-invalid`, e o `<span>` de erro ganhou `id` mantendo `role="alert"`. O componente `Input` já reencaminha `id`/`aria-*`, então a mudança flui sem novos props.

### Jornada 3 — Navegação administrativa (`src/features/admin-shell/components/admin-mobile-drawer.tsx`)
**Já conforme (REC-306).** Radix Dialog com `aria-label`, `DialogTitle`, foco preso/restaurado, `Escape` fecha, `aria-current` nos itens, botão de fechar rotulado; toggle com `aria-controls`/`aria-expanded`. Confirmado por revisão; nenhuma pendência.

### Jornada 4 — Catálogo público (`Courses.tsx`, `CourseDetail.tsx`)
**Sem violação séria/crítica.** Busca com `role="search"` + `aria-label`; botão limpar rotulado; hierarquia `h1→h2→h3` correta; imagens (`next/image`) com `alt`; radiogroup de turma com `role`/`aria-checked`/`aria-label`. Duas pendências de baixa severidade documentadas (P-308-1 ícones decorativos sem `aria-hidden`; P-308-2 overlay `Play` decorativo) — não corrigidas por decisão de escopo ("menor e sólido").

## 4. Alterações de código

| Arquivo | Mudança |
|---------|---------|
| `src/views/public/CourseCheckout.tsx` | `Field` associa rótulo/erro (`useId` + `htmlFor` + `cloneElement` injetando `aria-describedby`/`aria-invalid`); imports `cloneElement`, `isValidElement`, `useId`. |
| `src/__tests__/views/public/course-checkout-a11y.test.tsx` | Novo — trava rótulo alcançável + associação erro↔campo + radiogroup de turma. |
| `src/__tests__/views/public/login-page.test.tsx` | +2 testes de regressão de acessibilidade (rótulos, erro anunciado/inválido). |

## 5. Verificação

| Gate | Comando | Resultado |
|------|---------|-----------|
| Lint | `npx eslint` (arquivos modificados) | PASS (0 erros) |
| Typecheck | `npm run typecheck` | PASS (`tsc --noEmit` limpo) |
| Testes | `npx vitest run` | 715 passed / 67 arquivos |

Baseline anterior: **710**. Após REC-308: **715** (+5 — 3 checkout, 2 login). Sem regressão.

## 6. Confirmação de escopo (auth intocado)

Não modificados: `src/lib/auth.ts`, `supabase/functions/_shared/auth.ts`, `app/api/auth/session/route.ts`, `src/lib/supabase/session.ts`, `src/lib/supabase/authorize.ts`.

## 7. Pendências / limitações

- **P-308-1 (low):** ícones decorativos lucide sem `aria-hidden` — higiene futura.
- **P-308-2 (low):** overlay `Play` decorativo em `CourseDetail.tsx` — follow-up de UX.
- **Contraste:** medição instrumentada depende de `@axe-core/playwright` (browser real, `npm run test:a11y`), fora do runner Vitest desta trava; inspeção de tokens não revelou suspeita séria nas jornadas 1–3.
