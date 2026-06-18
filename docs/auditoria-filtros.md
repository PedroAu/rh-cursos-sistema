# Auditoria das Barras de Filtro - RH Cursos

Data: 2026-06-17  
Escopo: páginas públicas, admin, portal do aluno e qualquer tela com busca/filtro em `src/`.  
Modo: read-only; auditoria por código real e schema versionado em `supabase/migrations`.

## Resumo Executivo

Foram encontradas 15 superfícies de filtro/busca relevantes:

- 1 barra pública de catálogo de cursos.
- 1 barra pública de agenda/turmas.
- 6 barras server-side de listas admin via `AdminListFilters`.
- 6 buscas client-side internas de tabelas admin via `AdminDataTable` compartilhado.
- 1 busca global no `AdminShell`, visualmente presente mas sem comportamento implementado.

Contagem de achados:

| Severidade | Total | Síntese |
|---|---:|---|
| ALTA | 2 | Busca global admin inoperante; schema Supabase versionado incompleto para validar tabelas legadas usadas pelos filtros. |
| MÉDIA | 11 | Filtros relevantes ausentes por entidade, filtros ativos pouco visíveis no admin, duplicidade de busca server/client, inconsistência visual público/admin. |
| BAIXA | 8 | Polimento de labels, microcopy, limpeza individual, padronização de densidade/ações e refinamentos de responsividade. |

Recomendação central: adotar um componente único `FilterBar` para público/admin, com variações por densidade, baseado em shadcn (`Card`, `Input`, `Select`, `Button`, `Badge/Chip`) e contrato explícito de campos. Esse padrão deve suportar busca debounced opcional, submit server-side opcional, chips de filtros ativos, limpar individual, limpar tudo, contagem de resultado e estado vazio padronizado.

## Implementação Aplicada

Status em 2026-06-17: correções aplicadas no código, mantendo Tailwind + shadcn/ui e sem alterar schema ou regras de negócio.

| Item | Status | Evidência |
|---|---|---|
| Busca global inoperante do admin | Implementado | Campo removido do header em `src/components/layout/admin-shell.tsx`. |
| `AdminListFilters` com padrão único | Implementado | Componente agora aceita filtros configuráveis, datas, chips ativos e remoção individual em `src/components/admin/admin-list-filters.tsx`. |
| Duplicidade busca server/client | Implementado parcialmente | Busca local da tabela foi mantida, mas com escopo de refinamento, botão limpar e `useId()` em `src/components/shadcn/admin/data-table.tsx`. |
| Agenda pública com shadcn | Implementado | `<select>` nativo substituído por `Select` shadcn e filtros de modalidade, local e mês em `src/components/shared/agenda-browser.tsx`. |
| Catálogo com nível real | Implementado | `curso.nivel` passou a ser selecionado em `src/lib/public-data.ts`; heurística permanece apenas como fallback em `src/app/(marketing)/cursos/page.tsx`. |
| Chips completos no catálogo | Implementado | Todos os filtros ativos aparecem no resumo com link de remoção em `src/components/shared/course-catalog-filters.tsx`. |
| Leads: curso, origem, período | Implementado | Filtros adicionados em `/admin/leads` e export CSV em `src/app/(admin)/admin/leads/page.tsx` e `src/app/(admin)/admin/leads/export/route.ts`. |
| Turmas: curso, professor, período | Implementado | Filtros adicionados em `/admin/agenda` e aplicados em `src/lib/admin-data.ts`. |
| Cursos: status/modalidade separados | Implementado | Filtros de status do curso, status da turma, modalidade do curso, modalidade da turma e categoria em `/admin/cursos`. |
| Professores: área e alocação | Implementado | Filtros adicionados em `/admin/professores` e aplicados em `src/lib/admin-data.ts`. |
| Alunos: acesso e cadastro incompleto | Implementado | Filtros adicionados em `/admin/alunos` e aplicados em `src/lib/admin-data.ts`. |
| Schema legado versionado | Parcial | Não foi criada migration porque o schema real do Supabase não está disponível localmente. O código agora centraliza o cruzamento por queries reais; a ação segura pendente é gerar types/snapshot direto do Supabase conectado. |

Validação final:

- `npm run lint`: passou.
- `npm test`: passou, 26 arquivos e 62 testes.
- `npm run build`: passou.

## Fontes e Limitações

| Fonte | Evidência | Observação |
|---|---|---|
| Schema inicial | `supabase/migrations/20260612202319_init_schema.sql:20`, `:64`, `:77`, `:97`, `:111`, `:129` | Define `profiles`, `instructors`, `courses`, `turmas`, `enrollments`, `leads`, `settings`. |
| Schema legado versionado | `supabase/migrations/20260613030000_legacy_support_tables.sql:1`, `:7` | Só adiciona `admin_settings` e `course_enrollments`; não cria `curso`, `turma`, `instrutor`, `lead`, `aluno`. |
| Queries operacionais | `src/lib/admin-data.ts:221`, `:309`, `:359`, `:489`, `:535`; `src/lib/public-data.ts:172`, `:180`, `:187` | O app usa tabelas legadas com colunas específicas. Como o schema completo dessas tabelas não está versionado, o cruzamento foi feito pelas queries reais do app. |

Achado ALTA: o versionamento Supabase não contém o schema completo das tabelas legadas efetivamente filtradas (`curso`, `turma`, `instrutor`, `lead`, `aluno`). Isso impede uma validação 100% confiável de coluna existente apenas por migrations locais. Proposta: versionar uma migration declarativa ou snapshot de schema dessas tabelas antes de evoluir filtros por coluna.

## Inventário Completo

| Página / área | Barra / componente | Campos | Componente | Aplicação | Evidência | Status |
|---|---|---|---|---|---|---|
| `/cursos` público | Catálogo de cursos | `trilha`, `modalidade`, `duracao`, `publico`, `turma`, `nivel`, `busca` | `CourseCatalogFilters`, `Input`, `Select`, `Badge`, `Button` | Client + URL query; filtragem em `CoursesPage` sobre dados já carregados | `src/components/shared/course-catalog-filters.tsx:34`; `src/app/(marketing)/cursos/page.tsx:88` | OK com melhorias médias |
| `/agenda` público | Agenda/turmas | `busca`, `status`, `visualizacao` | `AgendaBrowser`, `Input`, `<select>` nativo, botões segmentados | Client + URL query; filtragem em memória | `src/components/shared/agenda-browser.tsx:48`; `:65`; `:390` | Parcial |
| `/admin/leads` | Filtro server-side | `query`, `status`, `type` | `AdminListFilters`, `Input`, `ShadcnSelectField` | Server-side via `getAdminLeads(filters)` | `src/app/(admin)/admin/leads/page.tsx:15`; `src/lib/admin-data.ts:486` | Parcial |
| `/admin/leads` | Busca/lista client-side | `globalFilter`, sort, paginação, seleção | `AdminDataTable` -> `ShadcnAdminDataTable` | Client-side sobre rows já filtrados pelo server | `src/components/admin/entities/admin-leads-crud.tsx:73`; `src/components/shadcn/admin/data-table.tsx:102` | OK com risco de duplicidade |
| `/admin/usuarios` | Filtro server-side | `query`, `status`, `role` | `AdminListFilters` | Server-side sobre Auth + `profiles` | `src/app/(admin)/admin/usuarios/page.tsx:15`; `src/lib/admin-data.ts:439` | Parcial |
| `/admin/usuarios` | Busca/lista client-side | `globalFilter`, sort, paginação | `AdminDataTable` | Client-side | `src/components/admin/entities/admin-users-crud.tsx:63`; `src/components/shadcn/admin/data-table.tsx:108` | OK com risco de duplicidade |
| `/admin/professores` | Filtro server-side | `query`, `status` | `AdminListFilters` | Server-side via `getAdminInstructors(filters)` | `src/app/(admin)/admin/professores/page.tsx:16`; `src/lib/admin-data.ts:304` | Parcial |
| `/admin/professores` | Busca/lista client-side | `globalFilter`, sort, paginação | `AdminDataTable` | Client-side | `src/components/admin/entities/admin-instructors-crud.tsx:58`; `src/components/shadcn/admin/data-table.tsx:108` | OK com melhorias |
| `/admin/cursos` | Filtro server-side | `query`, `status`, `format` | `AdminListFilters` | Server-side via `getAdminCourses(filters)` | `src/app/(admin)/admin/cursos/page.tsx:16`; `src/lib/admin-data.ts:216` | Parcial |
| `/admin/cursos` | Busca/lista client-side | `globalFilter`, sort, paginação | `AdminDataTable` | Client-side | `src/components/admin/entities/admin-courses-crud.tsx:59`; `src/components/shadcn/admin/data-table.tsx:108` | OK com melhorias |
| `/admin/agenda` | Filtro server-side | `query`, `status`, `format`; `month` usado pelo calendário | `AdminListFilters` + `AdminAgendaCalendar` | Server-side em lista; `month` via calendário lateral | `src/app/(admin)/admin/agenda/page.tsx:22`; `src/components/admin/admin-agenda-calendar.tsx:25` | Parcial |
| `/admin/agenda` | Busca/lista client-side | `globalFilter`, sort, paginação | `AdminDataTable` | Client-side | `src/components/admin/entities/admin-turmas-crud.tsx:63`; `src/components/shadcn/admin/data-table.tsx:108` | OK com melhorias |
| `/admin/alunos` | Filtro server-side | `query`, `type` | `AdminListFilters` | Server-side via `getAdminAlunos(filters)` | `src/app/(admin)/admin/alunos/page.tsx:16`; `src/lib/admin-data.ts:532` | Parcial |
| `/admin/alunos` | Busca/lista client-side | `globalFilter`, sort, paginação | `AdminDataTable` | Client-side | `src/components/admin/entities/admin-alunos-crud.tsx:49`; `src/components/shadcn/admin/data-table.tsx:108` | OK com melhorias |
| Admin global | Busca no header | texto livre | `Input` no `AdminShell` | Sem estado, sem submit, sem navegação, sem filtro | `src/components/layout/admin-shell.tsx:78` | Problema ALTA |
| Portal do aluno | Não encontrado | N/A | N/A | Não há página/lista filtrável no código atual; portal aparece como navegação para login | `src/components/layout/public-header.tsx:69`; `src/app/(auth)/login/page.tsx:12` | OK sem filtro auditável |

## Cruzamento Campo x Schema / Dados

| Barra | Campo | Fonte real | Coluna/dado relacionado | Avaliação |
|---|---|---|---|---|
| Catálogo público | `trilha` | `courses.map(course.category)` | `curso.categoria` via `public-data.ts:145`, query em `:174` | OK funcional, mas nome UX mistura trilha e categoria. |
| Catálogo público | `modalidade` | `course.format` | `turma.modalidade` ou `curso.modalidade`, `public-data.ts:149` | OK. |
| Catálogo público | `duracao` | `course.duration` derivado | `curso.carga_horaria`, `public-data.ts:148` | OK como agrupamento derivado. |
| Catálogo público | `publico` | `course.audience` | `curso.publico_alvo`, `public-data.ts:151` | OK. |
| Catálogo público | `turma` | existência de próxima turma | `turma.data_inicio`, `CoursesPage:77` | OK como derivado. |
| Catálogo público | `nivel` | heurística textual | Não há coluna selecionada no público; derivado de título/summary/description/outcomes | MÉDIA: tipo existe como filtro, mas não reflete schema público carregado. No admin há `curso.nivel` em `admin-data.ts:223`. |
| Agenda pública | `busca` | `AgendaItem` | curso, formato, local, status, datas, horário | OK. |
| Agenda pública | `status` | `items.map(item.status)` | `turma.status`, `public-data.ts:232` | OK. |
| Agenda pública | `visualizacao` | estado UI | Não depende de schema | OK. |
| Admin Leads | `query` | `matchesQuery` | nome, email, telefone, tema_interesse, origem | OK. |
| Admin Leads | `status` | `matchesExactFilter(row.crmStatus)` | `lead.status_crm`, `admin-data.ts:491` | OK. |
| Admin Leads | `type` | `matchesExactFilter(row.type)` | `lead.tipo`, `admin-data.ts:491` | OK. |
| Admin Usuários | `query` | `matchesQuery` | Auth user metadata/email + `profiles.role` | OK. |
| Admin Usuários | `status` | derivado de Auth | `banned_until`, `email_confirmed_at`, `admin-data.ts:471` | OK. |
| Admin Usuários | `role` | `profiles.role` + metadata fallback | `profiles.role`, `admin-data.ts:447` | OK; options incompletas. |
| Admin Professores | `query` | `matchesQuery` | nome, email, especialidade | OK. |
| Admin Professores | `status` | `matchesExactFilter` | `instrutor.status`, `admin-data.ts:310` | OK. |
| Admin Cursos | `query` | `matchesQuery` | título, slug, categoria, formato | OK. |
| Admin Cursos | `status` | `row.status` | status da primeira turma ou curso, `admin-data.ts:284` | MÉDIA: rótulo “Status” mistura status do curso e status da turma. |
| Admin Cursos | `format` | `row.format` | modalidade da primeira turma ou curso, `admin-data.ts:276` | MÉDIA: filtra formato efetivo da primeira turma, não necessariamente formato cadastrado do curso. |
| Admin Turmas | `query` | `matchesQuery` | curso, local, horário, id | OK. |
| Admin Turmas | `status` | `row.status` | `turma.status`, `admin-data.ts:389` | OK. |
| Admin Turmas | `format` | `row.format` | `turma.modalidade`, `admin-data.ts:386` | OK. |
| Admin Alunos | `query` | `matchesQuery` | nome, email, cpf, telefone, cargo, órgão | OK. |
| Admin Alunos | `type` | `row.studentType` | `aluno.tipo_aluno`, `admin-data.ts:537` | OK. |

## Achados Priorizados

### ALTA

| Barra | Eixo | Achado | Evidência | Proposta |
|---|---|---|---|---|
| Admin global | CAMPOS / UX | Campo “Buscar aluno ou curso” aparece no header mas não tem `name`, estado, handler, submit, rota ou integração com listas. É um filtro inoperante por teclado e mouse. | `src/components/layout/admin-shell.tsx:78` a `:84` | Remover até existir busca global real ou implementar busca global com rota `/admin/search?query=...`, submit acessível e resultados. |
| Todas as barras que filtram tabelas legadas | CAMPOS | Schema versionado não contém criação completa de `curso`, `turma`, `instrutor`, `lead`, `aluno`, embora os filtros dependam dessas colunas. | `supabase/migrations/20260613030000_legacy_support_tables.sql:1`; uso em `src/lib/admin-data.ts:221`, `:359`, `:489`, `:535` | Criar snapshot/migration de schema legado ou types gerados do Supabase para validar filtros contra colunas reais antes de ampliar filtros. |

### MÉDIA

| Barra | Eixo | Achado | Evidência | Proposta |
|---|---|---|---|---|
| AdminListFilters geral | UX | Filtros ativos não ficam visíveis como chips; usuário só vê valores dentro dos selects/campo. | `src/components/admin/admin-list-filters.tsx:43` a `:104` | Adicionar chips abaixo da barra: `Status: X`, `Tipo: Y`, `Busca: termo`, com remoção individual. |
| AdminListFilters + AdminDataTable | UX / Consistência | Há duas buscas por lista: uma server-side (`query`) e outra client-side dentro da tabela (`globalFilter`). Isso pode confundir: a contagem e o universo filtrado mudam em dois níveis. | `src/components/admin/admin-list-filters.tsx:49`; `src/components/shadcn/admin/data-table.tsx:201` | Definir padrão: busca principal server-side para universo de dados; busca interna renomeada para “Refinar resultados visíveis” ou removida quando `AdminListFilters` existir. |
| Agenda pública | DESIGN | Usa `<select>` nativo enquanto catálogo/admin usam Select shadcn. | `src/components/shared/agenda-browser.tsx:115`; `src/components/shared/course-catalog-filters.tsx:71`; `src/components/admin/admin-list-filters.tsx:59` | Trocar por `Select` shadcn para consistência visual, foco e comportamento. |
| Catálogo público | CAMPOS | `nivel` é inferido por heurística textual e não por coluna pública carregada, apesar de existir `curso.nivel` no admin. | `src/app/(marketing)/cursos/page.tsx:38`; `src/lib/admin-data.ts:223` | Incluir `nivel` na query pública de `curso` e mapear como dado real, não heurístico. |
| Catálogo público | UX | Só alguns filtros ativos viram badge: trilha, busca e modalidade. Duração, público, turma e nível não aparecem no resumo. | `src/components/shared/course-catalog-filters.tsx:194` a `:201` | Exibir chip para todo filtro ativo e permitir remover individualmente. |
| Admin Cursos | CAMPOS | Filtro `status` usa `row.status`, que pode vir da primeira turma ou do curso. Isso mistura “status de publicação” com “status operacional de turma”. | `src/lib/admin-data.ts:284`; `src/app/(admin)/admin/cursos/page.tsx:58` | Separar `statusCurso` e `statusTurma`, ou renomear filtro para “Status da turma vinculada” se mantiver o comportamento atual. |
| Admin Cursos | CAMPOS | Filtro `format` usa modalidade da primeira turma antes da modalidade do curso. Pode ocultar cursos com múltiplas modalidades. | `src/lib/admin-data.ts:276`; `src/app/(admin)/admin/cursos/page.tsx:50` | Filtrar por modalidade do curso (`courseFormat`) ou oferecer “Modalidade do curso” e “Modalidade da turma”. |
| Admin Turmas | CAMPOS | Falta filtro relevante por `curso_id` e por `instrutor_id`, embora a página carregue `courseOptions` e `instructorOptions`. | `src/app/(admin)/admin/agenda/page.tsx:30`; `src/components/admin/entities/admin-turmas-crud.tsx:22` | Adicionar selects “Curso” e “Professor” na barra de turmas. |
| Admin Professores | CAMPOS | Falta filtro por área de atuação e por “com turma/sem turma”, dados já disponíveis no row. | `src/lib/admin-data.ts:341`; `src/lib/admin-data.ts:345`; `src/app/(admin)/admin/professores/page.tsx:45` | Adicionar filtros: área de atuação e alocação (`com_turma`, `sem_turma`). |
| Admin Leads | CAMPOS | Falta filtro por curso de interesse, origem e período, todos relevantes para operação comercial e exportação. | `src/lib/admin-data.ts:510`, `:511`, `:523`; `src/app/(admin)/admin/leads/page.tsx:51` | Adicionar `curso_id`, `origem`, intervalo `created_at` e refletir no CSV. |
| Admin Alunos | CAMPOS | Falta filtro por vínculo Auth e cadastro incompleto, métricas já aparecem no dashboard da página. | `src/app/(admin)/admin/alunos/page.tsx:26` a `:27`; `src/app/(admin)/admin/alunos/page.tsx:43` | Adicionar filtros “Com acesso”, “Sem acesso”, “Cadastro incompleto”. |

### BAIXA

| Barra | Eixo | Achado | Evidência | Proposta |
|---|---|---|---|---|
| AdminListFilters geral | DESIGN | Layout usa 12 colunas fixas, mas quando há poucos selects sobra área vazia e botões podem ficar longe do campo. | `src/components/admin/admin-list-filters.tsx:44`; `:94` | Ajustar grid responsivo por quantidade de filtros ou usar `flex` com largura mínima por campo. |
| AdminListFilters geral | UX | Não há limpeza individual por filtro; só botão “Limpar” total. | `src/components/admin/admin-list-filters.tsx:98` | Adicionar `x` em cada chip ativo. |
| AdminListFilters geral | UX | Submit manual “Aplicar” é consistente, mas diverge do catálogo/agenda que atualizam automaticamente. | `src/components/admin/admin-list-filters.tsx:95`; `src/components/shared/course-catalog-filters.tsx:157` | Manter submit no admin por previsibilidade, mas padronizar microcopy: “Aplicar filtros”. |
| Admin DataTable | UX | Busca interna não possui botão de limpar rápido. | `src/components/shadcn/admin/data-table.tsx:205` a `:214` | Adicionar botão `X` no input quando `globalFilter` estiver preenchido. |
| Admin DataTable | A11Y | Todas as instâncias usam o mesmo `id="shadcn-admin-table-search"`; se houver mais de uma tabela na mesma página, IDs duplicam. Hoje arquivados podem coexistir visualmente, ainda que sem DataTable. | `src/components/shadcn/admin/data-table.tsx:201`; `src/app/(admin)/admin/professores/page.tsx:59` | Aceitar `searchId` opcional ou gerar `useId()`. |
| Catálogo público | DESIGN | Barra é mais editorial/promocional que operacional; ocupa muito espaço vertical para uso recorrente. | `src/components/shared/course-catalog-filters.tsx:181` a `:239` | Criar versão compacta sticky ou colapsável após o primeiro scroll. |
| Agenda pública | UX | Botão “Limpar filtros” fica disabled quando só a visualização está em calendário, mas “visualização” também é estado de filtro na URL. | `src/components/shared/agenda-browser.tsx:146`; `:48` a `:54` | Considerar ativo quando `view !== calendario` e limpar também visualização. |
| Portal do aluno | Inventário | Não há filtro auditável no portal porque não há rota própria encontrada; se o portal evoluir para “Meus cursos”, deve herdar `FilterBar`. | `src/components/layout/public-header.tsx:69`; `src/app/(auth)/login/page.tsx:12` | Registrar requisito futuro para portal: busca por curso, status de matrícula/certificado e período. |

## Avaliação por Barra

### Catálogo Público de Cursos

Resultado: bom ponto de partida, com filtros educacionais relevantes e URL compartilhável.

Pontos fortes:

- Busca debounced sem botão extra: `src/components/shared/course-catalog-filters.tsx:157` a `:178`.
- Filtros por modalidade, carga horária, público, próxima turma e nível: `src/components/shared/course-catalog-filters.tsx:239` a `:275`.
- Estado vazio com sugestão de trilhas e ações claras: `src/app/(marketing)/cursos/page.tsx:186` a `:212`.

Problemas:

- `nivel` é heurístico e pode divergir do dado real: `src/app/(marketing)/cursos/page.tsx:38` a `:50`.
- Filtros ativos incompletos nos badges: `src/components/shared/course-catalog-filters.tsx:194` a `:201`.
- Não há limpar individual.

### Agenda Pública

Resultado: funcional, mas inconsistente com o restante do design system.

Pontos fortes:

- Busca + status + visualização funcionam juntos e persistem na URL: `src/components/shared/agenda-browser.tsx:48` a `:57`, `:419` a `:424`.
- Estado vazio tratado na lista e no calendário: `src/components/shared/agenda-browser.tsx:258` a `:260`, `:277` a `:282`.

Problemas:

- `<select>` nativo destoa de shadcn: `src/components/shared/agenda-browser.tsx:115`.
- Não mostra contagem total filtrada nem chips completos.
- Não possui filtro por modalidade, local ou mês diretamente na barra, apesar de esses dados existirem no item (`format`, `location`, `startDate`).

### AdminListFilters

Resultado: componente compartilhado correto, mas ainda básico para operação administrativa.

Pontos fortes:

- Reuso em Leads, Usuários, Professores, Cursos, Turmas e Alunos.
- Usa shadcn/admin `ShadcnSelectField`: `src/components/admin/admin-list-filters.tsx:4`, `:59`.
- Limpar total existe em todas as instâncias: `src/components/admin/admin-list-filters.tsx:98`.

Problemas:

- Sem chips de filtros ativos.
- Sem limpar individual.
- Sem tipo de filtro por data/range.
- Campos não variam o suficiente por entidade.
- IDs fixos (`admin-query`) podem duplicar se o componente for usado duas vezes na mesma página.

### AdminDataTable

Resultado: bom componente compartilhado para busca local, sort, paginação e seleção.

Pontos fortes:

- Busca local com label real: `src/components/shadcn/admin/data-table.tsx:201`.
- Sort acessível com `aria-sort`: `src/components/shadcn/admin/data-table.tsx:265` a `:274`.
- Paginação e page size: `src/components/shadcn/admin/data-table.tsx:237` a `:254`, `:334` a `:348`.
- Layout mobile alternativo: `src/components/shadcn/admin/data-table.tsx:304` a `:331`.

Problemas:

- Busca local duplica a busca server-side sem comunicar o escopo.
- Não há clear rápido da busca local.
- `selectedCount` usa `selection.selectedIds.length`, que depende do estado externo; se o usuário trocar página/filtro sem limpar seleção, pode exibir seleção fora do conjunto visível: `src/components/shadcn/admin/data-table.tsx:194`.

## Padrão Único Recomendado

Criar `FilterBar` com este contrato:

| Capacidade | Requisito |
|---|---|
| Estrutura | `Card` com `form` opcional, grid/flex responsivo, gap tokenizado. |
| Campos | `search`, `select`, `multiSelect` quando necessário, `dateRange`, `numberRange`, `segmentedControl`. |
| Estado ativo | Chips para todos os filtros ativos, com `aria-label` para remover cada filtro. |
| Limpeza | `Limpar tudo` sempre visível quando houver filtro ativo; limpar individual via chip. |
| Busca | Modo `debounced` para público; modo `submit` para admin. |
| Resultados | `N resultados` opcional, calculado no mesmo universo filtrado. |
| Acessibilidade | Labels visíveis ou `sr-only`, foco visível, `aria-live="polite"` para contagem se client-side. |
| Persistência | URL query como fonte de verdade para filtros server-side e públicos. |
| Estado vazio | Componente comum com ações: limpar filtros, sugestão contextual, falar com consultor/suporte. |

## Ordem Sugerida de Correção

1. Corrigir/remover busca global inoperante do admin (`AdminShell`).
2. Versionar ou gerar snapshot/types do schema real Supabase legado para validar filtros com segurança.
3. Evoluir `AdminListFilters` para `FilterBar` com chips ativos, limpar individual, `useId()` e suporte a `dateRange`/selects adicionais.
4. Resolver duplicidade entre busca server-side e busca local do `AdminDataTable`, renomeando a busca local para “Refinar lista visível” ou tornando-a opcional por página.
5. Ajustar filtros de Turmas: curso, professor, modalidade, status, período/mês.
6. Ajustar filtros de Leads: período, origem, curso de interesse, tipo, status.
7. Ajustar filtros de Cursos: separar status do curso e status da turma; separar modalidade do curso e modalidade da turma; adicionar categoria/trilha.
8. Ajustar filtros de Professores: área de atuação e alocação com/sem turma.
9. Ajustar filtros de Alunos: vínculo Auth e cadastro incompleto.
10. Padronizar agenda pública para `Select` shadcn e adicionar chips/limpeza individual.
11. Corrigir catálogo público para usar `nivel` real do Supabase e mostrar todos os filtros ativos.
12. Definir requisito futuro para portal do aluno quando existir rota/lista própria.

## Gate de Auditoria

Veredito: passou como auditoria read-only.

- Inventário completo de filtros encontrados em `src/`.
- Cruzamento realizado com migrations disponíveis e queries reais do app.
- Achados priorizados pela rubrica fixa.
- Nenhum código de aplicação alterado.
- Entrega consolidada em um único markdown.
