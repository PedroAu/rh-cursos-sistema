# Story ADR015-F3: Múltiplas modalidades reais por curso

## Status
In Progress

## Executor Assignment
executor: "@data-engineer"
quality_gate: "@dev"
quality_gate_tools:
  - supabase db push
  - npm run typecheck
  - npm run lint
  - npm run test:unit
  - npm run build
  - npm run test:e2e:smoke

## Story
**As a** operador de admin da RH Cursos,
**I want** cadastrar, salvar e publicar cursos com múltiplas modalidades reais, com o banco e as telas públicas refletindo esse contrato sem truncar dados,
**so that** o sistema pare de tratar a modalidade do curso como um valor único e passe a mostrar e persistir exatamente o que foi definido no catálogo e no formulário de turmas.

## Acceptance Criteria
1. **Pré-requisito operacional explícito:** esta story só começa após a Fase 1 estar efetivamente integrada no branch de trabalho, porque depende do módulo central `src/lib/domain/course-enums.ts` e dos labels/whitelists introduzidos em `2026-07-13-adr015-fase1-course-enums-fonte-unica.md`.
2. O pacote de migration da Fase 3 fica consistente e completo considerando os dois arquivos já presentes no repositório: `supabase/migrations/20260713100000_curso_modalidades_array.sql` e `supabase/migrations/20260713160000_fix_modalidades_check_and_e2e_slug_pattern.sql`. Em conjunto, eles deixam `public.curso.modalidades` como `modalidade_curso[]`, fazem backfill a partir de `public.curso.modalidade`, mantêm `not null`, garantem não-vazio via `cardinality(modalidades) > 0`, preservam a constraint `modalidade = any(modalidades)` e mantêm writes legados coerentes via trigger.
3. `src/lib/supabase/mappers.ts` passa a ler a lista completa de modalidades do banco para `Course.modalities` sem truncar o valor em uma única modalidade; `Course.modality` permanece apenas como modalidade principal/compatibilidade para consumidores legados.
4. O caminho de escrita de curso preserva todas as modalidades selecionadas: o formulário de cursos continua enviando a lista completa, `supabase/functions/_shared/admin-mappers.ts` deixa de colapsar em `p.modalities?.[0]`, e a validação server-side permanece alinhada ao payload multi-valor sem reintroduzir dependência em um valor singular como fonte de verdade.
5. Um curso salvo com duas ou mais modalidades volta ao editor com as mesmas modalidades após reabrir o registro, sem perda silenciosa no round-trip UI → Edge Function → banco → UI.
6. As páginas e filtros públicos que consomem o catálogo de cursos e a agenda (`src/views/public/Courses.tsx` e `src/views/public/Agenda.tsx`) deixam de assumir que um curso tem apenas uma modalidade, mantendo labels, chips e filtros coerentes com o novo contrato multi-valor.
7. O caminho público de conteúdo editorial do curso continua válido após a mudança de schema: `mapCoursePublicContent` e a estrutura baseada em `supabase/migrations/20260710000000_course_public_content.sql` seguem publicando apenas conteúdo aprovado, sem quebra de renderização ou resolução de curso por causa da mudança de modalidades.
8. O formulário de turmas em `src/lib/admin-resource-configs.tsx` passa a oferecer somente as modalidades realmente disponíveis no curso selecionado, usando `course.modalities` como fonte de verdade e mantendo fallback legado seguro enquanto existirem registros antigos ainda não reconciliados.
9. `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run build` e `npm run test:e2e:smoke` passam; os testes cobrem round-trip de múltiplas modalidades, escrita sem truncamento, filtros públicos e o narrowing do formulário de turmas.

## 🤖 CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação de qualidade usará o processo de revisão manual (@qa QA Gate) apenas.
> Para habilitar, defina `coderabbit_integration.enabled: true` em `core-config.yaml`.

## Tasks / Subtasks
- [ ] Finalizar e validar a migration de Fase 3 para `public.curso.modalidades` com backfill, trigger, constraints e índice GIN (AC: 1)
  - [x] Considerar explicitamente o par `20260713100000_curso_modalidades_array.sql` + `20260713160000_fix_modalidades_check_and_e2e_slug_pattern.sql` como o pacote real da migration desta fase.
  - [x] Confirmar que o schema mantém `modalidade` como campo principal legado durante a transição.
  - [x] Garantir que writes legados e novos permanecem coerentes no banco.
- [x] Validar o pré-requisito da Fase 1 no branch de trabalho antes da implementação (AC: 1)
  - [x] Confirmar presença e uso do módulo `src/lib/domain/course-enums.ts` e das whitelists/labels já centralizadas.
- [x] Atualizar leitura e escrita de curso para preservar arrays completos de modalidades (AC: 3, 4, 5)
  - [x] `src/lib/supabase/mappers.ts`: mapear `modalidades` para `Course.modalities` sem truncar.
  - [x] `supabase/functions/_shared/admin-mappers.ts`: persistir a lista completa em `modalidades` e manter `modalidade` apenas como principal/legado coerente com a constraint do banco.
  - [x] Revisar `supabase/functions/_shared/admin-validation.ts` para manter a validação alinhada ao payload multi-valor.
- [x] Ajustar o formulário de cursos para salvar e reabrir o mesmo conjunto de modalidades (AC: 4, 5)
  - [x] Verificar que o `onSave` continua enviando a lista completa selecionada.
  - [x] Garantir que abrir/editar/salvar não remove modalidades já marcadas.
- [x] Revisar os fluxos públicos de catálogo e agenda para não assumir modalidade única (AC: 6)
  - [x] `src/views/public/Courses.tsx`: revisar labels, chips e derivação de filtros.
  - [x] `src/views/public/Agenda.tsx`: revisar filtros e badges ligados à modalidade.
- [x] Validar o caminho de `course_public_content` após a mudança de schema (AC: 7)
  - [x] Confirmar que `mapCoursePublicContent` segue consumindo apenas conteúdo publicado.
  - [x] Garantir que a página pública do curso permanece funcional com curso multi-modality.
- [x] Ajustar o formulário de turmas para usar as modalidades permitidas do curso selecionado (AC: 8)
  - [x] `src/lib/admin-resource-configs.tsx`: derivar as opções de `modality` a partir de `course.modalities`.
  - [x] Manter fallback legado seguro para registros antigos enquanto a base é migrada.
- [ ] Cobrir a fase com testes e gates locais (AC: 9)
  - [x] Teste de round-trip do mapper com múltiplas modalidades.
  - [x] Teste de regressão do save admin sem truncamento.
  - [x] Teste de filtro/render público e do narrowing do formulário de turmas.

## Dev Notes

### Contexto
Esta é a **Fase 3 de 3** da ADR-015. A Fase 3 depende da Fase 1 (enums centralizados) e é a mudança que corrige a modalidade como contrato multi-valor. A Fase 2 é independente e não precisa ser retomada aqui.

Pela própria ADR, esta story exige coordenação **@data-engineer → @dev → @qa**. O executor principal é `@data-engineer` porque há mudança de schema/migration; a implementação de app/front decorrente da migration continua dentro da mesma story, com handoff para `@dev` após o DDL ficar estável.

Direção arquitetural confirmada na ADR:
- usar `public.curso.modalidades modalidade_curso[]`;
- manter `public.curso.modalidade` como modalidade principal/legado durante a transição;
- fazer backfill a partir do valor singular;
- evitar criar tabela associativa nesta fase.

### Estado atual observado
- `src/lib/supabase/mappers.ts:284-303` ainda monta `Course.modalities` como um array de um único item a partir de `row.modalidade`.
- `supabase/functions/_shared/admin-mappers.ts:103` ainda persiste `p.modality ?? p.modalities?.[0]`, então o caminho server-side continua truncando para o primeiro valor.
- `src/lib/admin-resource-configs.tsx:323-385` já envia `modalities` no payload do formulário de curso, mas isso ainda não garante persistência real se o mapper do Supabase continuar colapsando o array.
- `src/lib/admin-resource-configs.tsx:408-560` ainda restringe o formulário de turmas a `selectedCourse.modality`, ou a um fallback derivado da lista de cursos, então o narrowing precisa passar a usar `course.modalities`.
- `src/views/public/Courses.tsx` e `src/views/public/Agenda.tsx` hoje assumem labels e filtros derivados de uma modalidade única em vários pontos; qualquer nova lógica deve evitar regressão visual ou de filtragem quando um curso tiver mais de uma opção.
- `supabase/migrations/20260710000000_course_public_content.sql` e `src/lib/supabase/mappers.ts:326-343` já sustentam o conteúdo editorial público por curso; a mudança de schema de modalidade não deve quebrar esse caminho nem publicar conteúdo fora de `published = true`.
- A migration-base `supabase/migrations/20260713100000_curso_modalidades_array.sql` já existe no worktree, mas **não é mais suficiente sozinha**: o repositório também contém `supabase/migrations/20260713160000_fix_modalidades_check_and_e2e_slug_pattern.sql`, que corrige a check de não-vazio para `cardinality(modalidades) > 0`. A story precisa tratar as duas juntas como o pacote real da Fase 3.

### Pré-requisito explícito
Antes de começar a implementação, confirmar que a Fase 1 está presente no branch de trabalho:
- `src/lib/domain/course-enums.ts` existe e é a fonte central de labels/dbValues.
- `src/lib/admin-form-validation.ts` e `supabase/functions/_shared/admin-validation.ts` já aceitam o conjunto de modalidades/status definidos na Fase 1.
- `src/types/index.ts` já contém `Course.modality`/`Course.modalities` e `CourseStatus` alinhados ao estado pós-Fase 1.

### Referências relevantes
```
supabase/migrations/20260713100000_curso_modalidades_array.sql
supabase/migrations/20260713160000_fix_modalidades_check_and_e2e_slug_pattern.sql
supabase/functions/_shared/admin-mappers.ts
supabase/functions/_shared/admin-validation.ts
src/lib/supabase/mappers.ts
src/lib/admin-resource-configs.tsx
src/views/public/Courses.tsx
src/views/public/Agenda.tsx
supabase/migrations/20260710000000_course_public_content.sql
```

### Testing
- **Localização:** testes unitários em `src/__tests__/lib/` e smoke em `tests/`.
- **Frameworks/padrões:** Vitest para unit (`npm run test:unit`), Playwright para smoke (`npm run test:e2e:smoke`).
- **Requisitos específicos desta story:**
  - round-trip de curso com múltiplas modalidades sem truncar;
  - save admin persistindo a lista completa;
  - class form mostrando apenas modalidades válidas do curso;
  - páginas públicas mantendo comportamento coerente com o novo contrato.
- **Gate de qualidade (@qa):** `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run build`, `npm run test:e2e:smoke`.

## Change Log
| Date | Version | Description | Author |
|---|---|---|---|
| 2026-07-13 | 0.1 | Story criada a partir da ADR-015 Fase 3 (múltiplas modalidades reais por curso), cobrindo mappers, escrita, filtros públicos, `course_public_content` e formulário de turmas. Draft aguardando validação @po. | @sm (River) |
| 2026-07-14 | 0.2 | Validação @po concluída com **NO-GO**. Bloqueios: executor/quality gate desalinhados com a ADR e com a regra de assignment para story com migration; dependência da Fase 1 não está explicitada como pré-requisito operacional; AC1/Dev Notes tratam `20260713100000_curso_modalidades_array.sql` como migration “completa”, mas o repositório já contém correção posterior obrigatória em `20260713160000_fix_modalidades_check_and_e2e_slug_pattern.sql`. Status permanece Draft até refinamento pelo @sm. | @po (Pax) |
| 2026-07-14 | 0.3 | Refinamento @sm pós-NO-GO: executor alterado para `@data-engineer` e quality gate para `@dev`, pré-requisito da Fase 1 explicitado na story, e a migration da Fase 3 redefinida como pacote `20260713100000` + `20260713160000` para refletir o estado real do repositório. Status permanece Draft aguardando revalidação @po. | @sm (River) |
| 2026-07-14 | 0.4 | Revalidação @po concluída com **GO**. Os bloqueios anteriores foram resolvidos: assignment alinhado à ADR (`@data-engineer` com handoff para `@dev`), dependência da Fase 1 explicitada como pré-requisito operacional, e o pacote real de migrations da Fase 3 agora contempla `20260713100000` + `20260713160000`. Ajuste residual não bloqueante: promover `Testing` para seção de topo na próxima edição estrutural. Status Draft → Ready. | @po (Pax) |
| 2026-07-14 | 0.5 | Implementação @dev concluída para o contrato multi-modalidade: migration base alinhada ao pacote final, leitura/escrita admin sem truncamento, catálogo/agenda/detail públicos ajustados e testes unitários expandidos. Gates locais `typecheck`, `lint`, `test:unit` e `build` passaram; `test:e2e:smoke` permaneceu pendente no ambiente functional atual porque `tests/admin-crud.spec.ts` falha antes do save ao encontrar o select `Trilha` sem opções. | @dev (Dex) |

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npx vitest run src/__tests__/lib/mappers.test.ts src/__tests__/lib/admin-resource-configs.test.ts src/__tests__/lib/admin-mappers.test.ts src/__tests__/lib/app-store.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit`
- `npm run build`
- `node scripts/run-playwright.mjs --project=functional tests/admin-crud.spec.ts --grep "cursos: cria com todos os campos obrigatórios preenchidos e exclui"`

### Completion Notes List
- Pré-requisito da Fase 1 validado localmente: `src/lib/domain/course-enums.ts`, validações admin e tipos de curso já estavam presentes no branch.
- `src/lib/supabase/mappers.ts` passou a ler `curso.modalidades` completo; `Course.modality` agora permanece como campo principal legado derivado do primeiro item efetivo.
- `supabase/functions/_shared/admin-mappers.ts` e `src/lib/app-store.tsx` passaram a preservar o array completo de modalidades no round-trip de criação/edição de curso.
- `src/lib/admin-resource-configs.tsx` agora restringe o campo `Modalidade` de turmas às modalidades válidas do curso selecionado, com fallback legado seguro.
- `src/views/public/Courses.tsx`, `src/views/public/Agenda.tsx` e `src/views/public/CourseDetail.tsx` deixaram de depender implicitamente de uma modalidade única para busca e exibição.
- A migration base `20260713100000_curso_modalidades_array.sql` foi alinhada à regra final de não-vazio com `cardinality(modalidades) > 0`, consistente com a migration corretiva `20260713160000`.
- Gates executados com sucesso: `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run build`.
- `npm run test:e2e:smoke` não fechou neste ambiente porque o fluxo functional de admin CRUD não encontra opções no select `Trilha` (`tests/admin-crud.spec.ts:159`), falhando antes de exercitar o save multi-modalidade.

### File List
- `docs/stories/2026-07-13-adr015-fase3-multiplas-modalidades.md`
- `src/lib/supabase/database.types.ts`
- `supabase/migrations/20260713100000_curso_modalidades_array.sql`
- `src/lib/supabase/mappers.ts`
- `supabase/functions/_shared/admin-mappers.ts`
- `src/lib/app-store.tsx`
- `src/lib/admin-resource-configs.tsx`
- `src/views/public/Courses.tsx`
- `src/views/public/Agenda.tsx`
- `src/views/public/CourseDetail.tsx`
- `src/__tests__/lib/mappers.test.ts`
- `src/__tests__/lib/admin-resource-configs.test.ts`
- `src/__tests__/lib/app-store.test.ts`
- `src/__tests__/lib/admin-mappers.test.ts`
