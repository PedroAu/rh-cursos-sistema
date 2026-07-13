# ADR-015 — Campos dinâmicos no formulário admin de cursos

- **Status:** Aprovado (decisões do PO em 2026-07-13)
- **Autor:** @architect (Aria)
- **Contexto de origem:** formulário admin de cursos (`src/lib/admin-resource-configs.tsx`, case `"courses"`) usa opções hardcoded que divergem do schema Supabase.

## Contexto

O formulário de cadastro/edição de curso é gerado por configuração declarativa em
`src/lib/admin-resource-configs.tsx` (função `buildResourceConfig()`, case `"courses"`),
renderizado por `src/views/admin/AdminResourcePage.tsx`, com dados vindos do app-store
(`src/lib/app-store.tsx`), que carrega do Supabase via `src/lib/supabase/rh-cursos-api.ts`
e `src/lib/supabase/mappers.ts`.

O banco define enums Postgres como fonte de verdade
(`supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`):

| Enum | Valores |
|---|---|
| `modalidade_curso` | Presencial, Online, Hibrido, InCompany, Gravado |
| `nivel_curso` | Basico, Intermediario, Avancado, Misto |
| `status_curso` | Ativo, Inativo, Destaque, EmBreve, Rascunho, Arquivado |
| `curso.categoria` | `varchar(120)` texto livre (sem tabela; índice parcial `curso_categoria_idx`) |

### Problemas identificados

1. **Status incompleto e lossy** — o formulário oferece só 4 dos 6 status; o mapper
   (`src/lib/supabase/mappers.ts:220`) colapsa `Rascunho → "Inativo"`. Editar e salvar um
   curso rascunho muda seu status silenciosamente.
2. **Multiselect de modalidades ilusório** — o campo é multiselect, mas `curso.modalidade`
   é coluna única; `onSave` persiste apenas `modalities[0]`
   (`admin-resource-configs.tsx:352`) e o mapper reconstrói `modalities: [única]`
   (`mappers.ts:326`). A UI aparenta salvar N modalidades; o banco guarda 1.
3. **Categorias sem reuso** — campo array de texto livre; `onSave` persiste só
   `categories[0]`; sem autocomplete das categorias existentes → duplicação
   ("RH" vs "rh" vs "Recursos Humanos").
4. **Tripla duplicação de enums no front** — valores repetidos em `src/types/index.ts`
   (tipos literais), `admin-resource-configs.tsx` (options) e
   `src/lib/admin-form-validation.ts` (validação), além dos mappers de tradução.

## Decisão

Três fases, **uma story por fase** (decisão do PO). Fases 1 e 2 são independentes entre si;
a Fase 3 depende da 1 (usa o módulo central de enums).

### Fase 1 — Fonte única de verdade para enums (sem migration)

Enums Postgres só mudam via migration, portanto **centralizar** no front é preferível a
buscá-los em runtime (sem latência extra, sem RPC).

- Criar `src/lib/domain/course-enums.ts` com os pares `{ dbValue, label }` de
  modalidade, nível e status, espelhando exatamente os enums do banco.
- `admin-resource-configs.tsx` (options), `mappers.ts` (tradução bidirecional) e
  `admin-form-validation.ts` (validação) derivam desse módulo.
- Formulário passa a oferecer os 6 status; eliminar o colapso `Rascunho → Inativo`
  (adicionar labels "Rascunho" e "Arquivado" a `Course["status"]` em `src/types/index.ts`).
- Verificar impactos de exibição: `renderStatusBadge`, filtros públicos que assumem
  status "Ativo"/"Destaque" (cursos Rascunho/Arquivado não podem vazar para o site público —
  conferir views públicas e `curso_public_content`).

### Fase 2 — Categorias dinâmicas do banco

- Trocar o campo `categories` de texto livre para **combobox com opções do banco +
  "criar nova"**, mesmo padrão de `pathOptions` (trilhas).
- Fonte: `select distinct categoria from curso where deleted_at is null and categoria is not null`
  (barato — coberto pelo índice parcial `curso_categoria_idx` da migration sprint3).
- Expor em `rh-cursos-api.ts`, carregar no app-store junto com cursos.
- **Não** criar tabela `categoria` agora; evolução futura possível sem retrabalho.

### Fase 3 — Múltiplas modalidades reais (com migration)

Decisão de negócio confirmada: **um curso pode ter múltiplas modalidades** (Opção B).

- **DDL delegado ao @data-engineer** (autoridade de schema). Direção arquitetural:
  preferir coluna `modalidades modalidade_curso[]` (array de enum) em `public.curso`,
  mantendo `modalidade` como principal durante a transição (backfill
  `modalidades = array[modalidade]`), a menos que o @data-engineer identifique
  razão para tabela associativa.
- Atualizar `mappers.ts` (ida/volta do array), `onSave` do formulário (persistir todas),
  filtros públicos que consomem modalidade (`src/views/public/Courses.tsx`,
  `src/views/public/Agenda.tsx`, cards) e a view/políticas de `curso_public_content`.
- Atenção: `turma.modalidade` continua única (uma turma acontece em uma modalidade);
  o formulário de turmas já restringe às modalidades do curso selecionado
  (`admin-resource-configs.tsx:423`) — passa a usar o array.

## Consequências

- Enum novo no banco exige atualizar apenas `course-enums.ts` + migration (2 pontos, antes 4+).
- Status Rascunho/Arquivado tornam-se utilizáveis; requer verificação de vazamento no site público.
- Fase 3 exige migration com backfill e coordenação @data-engineer → @dev.

## Sequência de execução

| Ordem | Story | Depende de | Agentes |
|---|---|---|---|
| 1 | Fase 1 — enums centralizados | — | @sm → @po → @dev → @qa |
| 2 | Fase 2 — categorias dinâmicas | — | @sm → @po → @dev → @qa |
| 3 | Fase 3 — múltiplas modalidades | Fase 1 | @data-engineer (DDL) → @sm → @po → @dev → @qa |
