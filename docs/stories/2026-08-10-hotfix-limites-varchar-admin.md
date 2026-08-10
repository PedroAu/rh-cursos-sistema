# Hotfix: validar limites de texto nas mutações administrativas

## Status

Done

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: [vitest, lint, typecheck, build, playwright]
assignment_basis: "executor-assignment: code_general"
```

## Story

**As a** administrador do catálogo,
**I want** que textos administrativos respeitem os limites do banco antes da persistência,
**so that** mutações válidas não retornem erro HTTP 500 por truncamento de coluna.

## Contexto

Os logs da Edge Function `admin-resources` registraram SQLSTATE `22001` (`value too long for type character varying(240)`) durante mutações. Os campos afetados são títulos de curso/blog e textos de interesse/tema de lead, todos armazenados em colunas `varchar(240)`.

## Acceptance Criteria

1. Títulos de curso e blog aceitam até 240 caracteres e rejeitam 241 ou mais no cliente e no contrato server-side.
2. `courseInterest` e `trainingTheme` de lead aceitam até 240 caracteres e rejeitam 241 ou mais no cliente e no contrato server-side.
3. Os inputs administrativos aplicam `maxLength={240}` nos campos correspondentes.
4. A rejeição server-side acontece antes da persistência e retorna erro de validação (422), evitando o 500 de truncamento.
5. Testes de limite cobrem os valores 240 e 241; gates de qualidade permanecem verdes.

## Tasks / Subtasks

- [x] Adicionar validação client-side para os quatro campos (AC: 1, 2, 5).
- [x] Adicionar limites equivalentes aos schemas Zod da Edge Function (AC: 1, 2, 4).
- [x] Aplicar `maxLength` nos campos administrativos (AC: 3).
- [x] Executar testes unitários, lint, typecheck, build e suíte E2E (AC: 5).

## Dev Agent Record

### Debug Log

- Logs de produção identificaram SQLSTATE `22001` em três POSTs para `admin-resources`.
- A causa foi a ausência de limite de 240 caracteres nos contratos client-side e server-side.
- O erro de listener assíncrono não é emitido pelo código da aplicação; não há listeners `chrome.runtime`/`browser.runtime` no repositório.
- A suíte E2E teve uma execução com 183/184 aprovados e o cenário intermitente passou isoladamente; a segunda execução foi bloqueada por indisponibilidade externa do Supabase (Cloudflare 521/DNS `ENOTFOUND`), não por falha do código alterado.

### File List

- `docs/stories/2026-08-10-hotfix-limites-varchar-admin.md`
- `src/lib/admin-form-validation.ts`
- `src/lib/admin-resource-configs.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- `supabase/functions/_shared/admin-validation.ts`
- `src/__tests__/lib/admin-form-validation.test.ts`

### Completion Notes

- Valores com 241 caracteres são rejeitados antes da chamada de persistência; valores com 240 permanecem válidos.
- Validação server-side usa Zod e preserva a resposta 422 de payload inválido da Edge Function.
- Testes unitários (43/43), lint, typecheck e build passaram. O E2E funcional depende do Supabase externo, que apresentou indisponibilidade durante a segunda execução.
