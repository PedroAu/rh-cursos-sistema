# STORY-FILTERS-001 - Consolidacao das barras de filtro para deploy

Status: Done

## Objetivo

Preparar para deploy o pacote de consolidacao das barras de filtro do RH Cursos, cobrindo catalogo publico, agenda publica e listas administrativas com foco em consistencia visual, clareza operacional e reducao de friccao na filtragem.

## Fonte de verdade

- Artefato principal: `docs/auditoria-filtros.md`
- Branch de trabalho: `design/fase-a-tokens`
- Escopo validado por codigo real em `src/` e schema versionado em `supabase/migrations`

## Escopo aprovado

- Remover a busca global inoperante do shell admin.
- Evoluir `AdminListFilters` para suportar filtros configuraveis, datas e exibicao de filtros ativos.
- Refinar a busca local do `AdminDataTable` para reduzir ambiguidade operacional.
- Padronizar filtros publicos de agenda com componentes consistentes ao design system.
- Expandir filtros reais por entidade no admin:
  - Leads: curso, origem e periodo, incluindo exportacao.
  - Cursos: status e modalidade separados por contexto.
  - Turmas/agenda: curso, professor e periodo.
  - Professores: area e alocacao.
  - Alunos: acesso e cadastro incompleto.
- Completar exibicao de filtros ativos no catalogo publico.
- Garantir que o catalogo publico use `nivel` real quando disponivel e mantenha fallback seguro.

## Evidencias implementadas

- Auditoria consolidada criada em `docs/auditoria-filtros.md`.
- Ajustes aplicados em paginas admin e publicas relacionadas a filtros.
- Queries e agregacoes atualizadas em `src/lib/admin-data.ts` e `src/lib/public-data.ts`.
- Componentes compartilhados de filtro e tabela refinados para o pacote de deploy.

## Subtasks

- [x] Corrigir shell admin para remover busca sem comportamento.
- [x] Atualizar `AdminListFilters` com estrutura reutilizavel para o pacote.
- [x] Ajustar `AdminDataTable` para refinamento local mais claro.
- [x] Aplicar filtros adicionais nas superficies admin impactadas.
- [x] Padronizar filtros da agenda publica e do catalogo.
- [x] Registrar auditoria tecnica do pacote.
- [x] Reexecutar gates finais de deploy no repositório atual.

## Gates

- F0 Escopo: PASS - derivado do artefato `docs/auditoria-filtros.md`.
- F1 Story: PASS - escopo rastreado a artefato existente e arquivos modificados.
- F2 Implementacao: PASS - mudancas presentes no working tree.
- F3 QA Loop: PASS - `npm run lint`, `npm test` e `npx tsc --noEmit` reexecutados localmente.
- F4 Final: PASS - `npm run build` executado com sucesso no repositório atual.

## Validacao final

- `npm run lint`: PASS
- `npm test`: PASS - 27 arquivos, 81 testes
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS

## File List

- `docs/auditoria-filtros.md`
- `docs/stories/STORY-FILTERS-001.md`
- `src/app/(admin)/admin/agenda/page.tsx`
- `src/app/(admin)/admin/alunos/page.tsx`
- `src/app/(admin)/admin/cursos/page.tsx`
- `src/app/(admin)/admin/leads/export/route.ts`
- `src/app/(admin)/admin/leads/page.tsx`
- `src/app/(admin)/admin/page.tsx`
- `src/app/(admin)/admin/professores/page.tsx`
- `src/app/(admin)/admin/usuarios/page.tsx`
- `src/app/(marketing)/agenda/page.tsx`
- `src/app/(marketing)/cursos/page.tsx`
- `src/components/admin/admin-list-filters.tsx`
- `src/components/layout/admin-shell.tsx`
- `src/components/shadcn/admin/data-table.tsx`
- `src/components/shared/agenda-browser.tsx`
- `src/components/shared/course-catalog-filters.tsx`
- `src/lib/admin-data.ts`
- `src/lib/public-data.ts`
