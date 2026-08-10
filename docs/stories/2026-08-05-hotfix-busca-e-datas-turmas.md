# Hotfix — busca pública e datas de turmas

**Status:** Ready for Review  
**Tipo:** Bugfix de produção  
**Prioridade:** Alta

## Contexto

Usuários relatam dois defeitos no site público: a busca mostra um carregamento artificial a cada tecla, prejudicando a digitação; e uma turma cadastrada em 10/08 pode aparecer como 09/08. A coluna `turma.data_inicio` é do tipo `date`, portanto a data da turma deve ser tratada como data civil, sem conversão de fuso horário.

## Critérios de aceite

- [x] A busca aceita digitação contínua sem substituir a lista por uma tela de carregamento a cada tecla.
- [x] A filtragem e a sincronização da URL ocorrem após uma pausa curta na digitação, mantendo os controles de categoria/filtros funcionais.
- [x] Datas de turma `YYYY-MM-DD` são exibidas com o mesmo dia em catálogo, agenda, home, página do curso, checkout e cartões públicos, inclusive em `America/Sao_Paulo`.
- [x] O formulário administrativo envia datas de turma como `YYYY-MM-DD`, sem adicionar horário UTC a uma coluna `date`.
- [x] Existem testes unitários para debounce e data civil, além de regressão dos gates do projeto.

## Tasks / Subtasks

- [x] Criar hook de debounce reutilizável e aplicá-lo às buscas públicas.
- [x] Remover o carregamento simulado das buscas locais.
- [x] Criar parser/formatador de data civil e substituir conversões diretas de datas de turma.
- [x] Persistir datas administrativas sem sufixo UTC.
- [x] Adicionar testes e executar lint, typecheck e testes.

## Dev Agent Record

### Debug Log

- Diagnóstico: `useSimulatedLoading` reinicia 350–450 ms a cada alteração da pesquisa.
- Diagnóstico: `new Date("YYYY-MM-DD")` interpreta meia-noite UTC e pode exibir o dia anterior em Brasília.

### Completion Notes

- Busca pública: debounce de 300 ms, URL sincronizada somente após a pausa e loading preservado apenas no bootstrap inicial do blog.
- Datas: `parseDate` trata valores `YYYY-MM-DD` como datas civis locais; o formulário administrativo persiste somente a parte da data.
- Revisão pré-push: timestamps completos preservam o instante original; filtros futuros usam o início do dia civil; o fim da turma é inclusivo até 23:59:59.999; e histórico/deep links do blog sincronizam sem sobrescrever a URL nem divergir na hidratação.
- Snapshot da hero da Home atualizado para refletir as datas corretas (20/08 e 27/08, em vez de 19/08 e 26/08).
- Validações finais: `npm run lint`, `npm run typecheck`, `npm run test:unit` (79 arquivos/791 testes) e `npm test` (184/184 testes).

### File List

- `src/hooks/use-debounced-value.ts`
- `src/lib/utils.ts`
- `src/lib/admin-resource-configs.tsx`
- `src/lib/enrollment-class-resolution.ts`
- `src/features/admin/dashboard/model/dashboard-overview.ts`
- `src/views/public/Courses.tsx`
- `src/views/public/Agenda.tsx`
- `src/views/public/Blog.tsx`
- `src/views/public/Home.tsx`
- `src/views/public/CourseDetail.tsx`
- `src/views/public/CourseCheckout.tsx`
- `src/components/agenda/calendar-view.tsx`
- `src/components/agenda/class-card.tsx`
- `src/components/courses/course-card.tsx`
- `src/__tests__/hooks/use-debounced-value.test.tsx`
- `src/__tests__/lib/admin-resource-configs.test.ts`
- `src/__tests__/lib/dashboard-overview.test.ts`
- `src/__tests__/lib/utils.test.ts`
- `src/__tests__/views/public/blog.test.tsx`
- `src/__tests__/views/public/course-detail.test.tsx`
- `tests/ui-governance.spec.ts-snapshots/home-hero-governance-functional-darwin.png`

### Change Log

- 2026-08-05: Story criada para os dois hotfixes de produção.
- 2026-08-05: Implementados hotfixes, testes e atualização do snapshot de datas.
- 2026-08-10: Incorporados ajustes da revisão pré-push e revalidados unitários, build e E2E completos.
