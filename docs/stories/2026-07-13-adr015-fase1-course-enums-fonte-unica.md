# Story ADR015-F1: Fonte única de verdade para enums de curso (modalidade, nível, status)

## Status
Done

## Executor Assignment
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - npm run typecheck
  - npm run lint
  - npm run test:unit
  - npm run build
  - npm run test:e2e:smoke

## Story
**As a** operador de admin da RH Cursos,
**I want** que o formulário de cursos ofereça exatamente os enums definidos no banco (modalidade, nível e status) a partir de uma fonte única no front,
**so that** eu consiga salvar/editar cursos — inclusive Rascunho e Arquivado — sem que o status seja alterado silenciosamente, e sem que cursos não publicados vazem para o site público.

## Acceptance Criteria
1. Existe um módulo central `src/lib/domain/course-enums.ts` que exporta os pares `{ dbValue, label }` de **modalidade**, **nível** e **status**, espelhando exatamente os enums Postgres (`modalidade_curso`, `nivel_curso`, `status_curso`).
2. **No front:** `admin-resource-configs.tsx` (options do formulário de cursos), `mappers.ts` (tradução DB→UI de leitura) e `admin-form-validation.ts` (validação do formulário de curso) derivam seus valores do módulo central — sem literais de enum duplicados nesses três arquivos para modalidade/nível/status de curso.
3. O formulário de cursos oferece os **6 status** (`Ativo`, `Inativo`, `Destaque`, `EmBreve`/"Em breve", `Rascunho`, `Arquivado`), não mais apenas 4.
4. O colapso lossy `Rascunho → "Inativo"` e `Arquivado → "Inativo"` em `fromDbCourseStatus` (`mappers.ts:220-221`) é eliminado: carregar, editar e salvar um curso Rascunho ou Arquivado **preserva** seu status original (round-trip DB→UI→DB idempotente, ponta a ponta pelo servidor).
5. `src/types/index.ts` passa a incluir os labels de `Rascunho` e `Arquivado` no tipo `CourseStatus` (hoje `"Ativo" | "Inativo" | "Destaque" | "Em breve"`).
6. Cursos com status `Rascunho` ou `Arquivado` **não vazam** para o site público: as views/filtros públicos e a view/policies de `curso_public_content` continuam expondo apenas os status publicáveis (`Ativo`/`Destaque`, e `EmBreve` conforme comportamento atual). Comprovado por verificação explícita.
7. O helper de classificação de badge/status (`admin-resource-configs.tsx:158-177`, `renderStatusBadge`) trata os novos status `Rascunho` e `Arquivado` sem cair em fallback incorreto.
8. `npm run typecheck`, `npm run lint`, `npm run test:unit` e `npm run build` passam; o round-trip dos 6 status tem cobertura de teste unitário em `mappers.test.ts`.
9. **Path servidor (obrigatório para o save funcionar):** a Edge Function `admin-resources` aceita e persiste os 6 status. O zod enum `admin-validation.ts:49` (hoje `["Ativo","Inativo","Destaque","Em breve"]`) passa a incluir `Rascunho` e `Arquivado`, e `toDbCourseStatus` (`admin-mappers.ts:34-36`) traduz corretamente os 6 valores (label "Em breve" → dbValue `EmBreve`; demais 1:1). Sem isso, salvar Rascunho/Arquivado é rejeitado no servidor.

## 🤖 CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação de qualidade usará o processo de revisão manual (@qa QA Gate) apenas.
> Para habilitar, defina `coderabbit_integration.enabled: true` em `core-config.yaml`.

## Tasks / Subtasks
- [x] Criar módulo central de enums (AC: 1)
  - [x] Criar `src/lib/domain/course-enums.ts` exportando arrays tipados de `{ dbValue, label }` para `COURSE_MODALITIES`, `COURSE_LEVELS`, `COURSE_STATUSES`, espelhando os enums do banco.
  - [x] Espelhar exatamente: `status_curso` = Ativo, Inativo, Destaque, EmBreve, Rascunho, Arquivado; `modalidade_curso` = Presencial, Online, Hibrido, InCompany, Gravado; `nivel_curso` = Basico, Intermediario, Avancado, Misto.
  - [x] Exportar helpers de tradução `dbToLabel(kind, dbValue)` / `labelToDb(kind, label)` (ou options prontos) para reuso pelos consumidores.
- [x] Atualizar tipos (AC: 5)
  - [x] Adicionar `"Rascunho"` e `"Arquivado"` a `CourseStatus` em `src/types/index.ts:5`.
- [x] Refatorar mappers de leitura (DB→UI) sem perda (AC: 2, 4, 8)
  - [x] `fromDbCourseStatus` (`mappers.ts:214-221`): remover `Rascunho → "Inativo"` e `Arquivado → "Inativo"`; mapear 1:1 para os labels novos, derivando de `course-enums.ts`.
  - [x] Fazer `fromDbModality` (`mappers.ts:191`) e `fromDbLevel` (`mappers.ts:203`) derivarem os pares do módulo central (sem alterar comportamento — modalidade única permanece escopo da Fase 3).
- [x] Corrigir o path servidor da escrita (Edge Function `admin-resources`) (AC: 9)
  - [x] `supabase/functions/_shared/admin-validation.ts:49`: expandir `z.enum(["Ativo","Inativo","Destaque","Em breve"])` para incluir `"Rascunho"` e `"Arquivado"`.
  - [x] `supabase/functions/_shared/admin-mappers.ts:34-36` (`toDbCourseStatus`): garantir tradução dos 6 valores — tradução explícita para os 6 valores (Rascunho/Arquivado batiam com dbValue, agora validados via map explícito).
  - [x] **Nota de deploy:** a Edge Function precisa ser redeployada no projeto Supabase `hwpsrujkxjhmmwphqdlz` (mesmo padrão da story CRUD de 2026-07-11). Handoff para @devops.
- [x] Refatorar options do formulário (AC: 2, 3, 7)
  - [x] `admin-resource-configs.tsx`: `statusOptions` passa a listar os 6 status a partir de `COURSE_STATUS_OPTIONS`; `modalityOptions` e options de nível derivam do módulo central (`COURSE_MODALITY_OPTIONS`, `COURSE_LEVEL_OPTIONS`).
  - [x] Ajustar o helper de badge/status (`admin-resource-configs.tsx:159-191`, `getBadgeVariant`) — `Arquivado` já cai em "danger" (herdado do BlogStatus, nunca "ativo"); `Rascunho` cai corretamente no fallback "muted" (nunca "ativo").
- [x] Refatorar validação (AC: 2)
  - [x] `admin-form-validation.ts`: validação de status/modalidade/nível de curso agora checa contra whitelist de labels válidos derivados de `course-enums.ts` (`COURSE_STATUS_OPTIONS`/`COURSE_MODALITY_OPTIONS`/`COURSE_LEVEL_OPTIONS`), não apenas "não-vazio".
- [x] Verificar vazamento no site público (AC: 6)
  - [x] Conferido: `fetchPublicCatalog` (`rh-cursos-api.ts:52-56`) consulta `curso` sem filtro explícito de status — depende inteiramente da RLS `catalogo_publico_curso_select` (`20260512193000_initial_rh_cursos_schema.sql:291-295`), que já restringe `status in ('Ativo','Destaque','EmBreve')` para `anon`/`authenticated`. Rascunho/Arquivado nunca chegam ao client público. `Courses.tsx`/`Agenda.tsx` só filtram `ClassStatus` (turma), não `CourseStatus` — não há vazamento adicional nesses arquivos. Nenhuma migration necessária (confirma Dev Notes).
- [x] Testes (AC: 4, 8)
  - [x] Estendido `src/__tests__/lib/mappers.test.ts` com round-trip dos 6 status (DB→UI→DB idempotente via `it.each(COURSE_STATUSES)`), cobrindo especificamente Rascunho e Arquivado.
  - [ ] Smoke E2E: não executado nesta fase (dev) — é gate do @qa (`test:e2e:smoke` listado em `quality_gate_tools`), a rodar na Fase 4.

## Dev Notes

### Contexto (origem: ADR-015 — `docs/architecture/adr-015-course-form-dynamic-fields.md`)
Esta é a **Fase 1 de 3** da ADR-015. Fases 1 e 2 são independentes; a **Fase 3 depende desta** (usa o módulo central de enums). Escopo desta story = **apenas enums centralizados + status completo, sem migration**. Multiselect real de modalidades (Fase 3) e categorias dinâmicas (Fase 2) **estão fora de escopo**.

### Fonte de verdade — enums Postgres
De `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`:

| Enum | Valores (dbValue) |
|---|---|
| `modalidade_curso` | Presencial, Online, Hibrido, InCompany, Gravado |
| `nivel_curso` | Basico, Intermediario, Avancado, Misto |
| `status_curso` | Ativo, Inativo, Destaque, EmBreve, Rascunho, Arquivado |

> Enums Postgres só mudam via migration → **centralizar no front** é preferível a buscar em runtime (sem latência/RPC).

### Estado atual (grounding confirmado no código)
- **`src/types/index.ts:5`** — `export type CourseStatus = "Ativo" | "Inativo" | "Destaque" | "Em breve";` (só 4 labels; faltam Rascunho/Arquivado).
- **`src/types/index.ts:108-112`** — labels de UI de modalidade (`"Ao vivo online" | "Presencial" | "In company" | "Híbrido" | "Gravado"`) e nível divergem dos dbValues; a tradução vive nos mappers.
- **`src/lib/supabase/mappers.ts:214-221`** — `fromDbCourseStatus` mapeia DB→UI; **L220 `Rascunho: "Inativo"`, L221 `Arquivado: "Inativo"`** (colapso lossy a remover). `EmBreve → "Em breve"` (L219).
- **`src/lib/supabase/mappers.ts:191`** — `fromDbModality`; **L203** — `fromDbLevel` (mantêm comportamento; só passam a derivar do módulo central).
- **`src/lib/admin-resource-configs.tsx:249-252`** — `statusOptions` com apenas 4 valores. **L240** — `modalityOptions`. **L158-177** — helper de classificação de status (badge) que hoje reconhece Ativo/Destaque/Em breve/Inativo.
- **`src/lib/admin-form-validation.ts:85-86`** — validação de status de curso só checa não-vazio (sem whitelist de enum).

### Atenção: label "Em breve" ↔ dbValue `EmBreve`
O banco usa `EmBreve` (sem espaço); a UI usa `"Em breve"`. O módulo central deve manter esse par explicitamente para não quebrar a tradução bidirecional.

### ⚠️ Path de escrita é SERVER-SIDE (correção de gap da ADR)
A ADR-015 listou apenas arquivos do front, mas **a tradução reversa (UI→DB) e a validação de escrita de curso vivem na Edge Function `admin-resources`**, não em `mappers.ts`. O front (`onSave` em `admin-resource-configs.tsx:326-365`) só monta o payload e chama `store.upsertCourse` → a Edge Function faz a validação e a persistência:
- `supabase/functions/_shared/admin-validation.ts:49` — zod `status: z.enum(["Ativo","Inativo","Destaque","Em breve"])` → **rejeita** Rascunho/Arquivado antes de chegar ao banco. Este é o bloqueador real: sem expandir aqui, o AC3/AC4 não funcionam ponta a ponta.
- `supabase/functions/_shared/admin-mappers.ts:34-36` — `toDbCourseStatus(value) = value === "Em breve" ? "EmBreve" : value` → Rascunho/Arquivado já passam corretos (dbValue == label), mas confirme explicitamente.

### Fronteira da "fonte única de verdade" (No Invention)
A Edge Function roda em **Deno no Supabase** e importa de `supabase/functions/_shared/`, **não** de `src/`. Portanto não é possível importar `src/lib/domain/course-enums.ts` do servidor por causa do limite de deploy. A "fonte única" desta story cobre o **cliente** (`course-enums.ts` unifica os 3 arquivos do front); o servidor permanece um **espelho manual** dos mesmos enums do banco. Manter ambos alinhados ao enum Postgres é a regra — não inventar um mecanismo de import cross-boundary nesta story.

### Vazamento público (AC 6) — regra crítica de negócio
Rascunho e Arquivado **não podem** aparecer no site público. Hoje os filtros públicos assumem status "Ativo"/"Destaque". Ao tornar esses status utilizáveis, é obrigatório reconfirmar `curso_public_content` (view + policies) e os filtros de `Courses.tsx`/`Agenda.tsx`. Consequência listada na ADR: "Status Rascunho/Arquivado tornam-se utilizáveis; requer verificação de vazamento no site público."

### Princípio No Invention
Não introduzir novos status/modalidades/níveis além dos enums do banco. O módulo central deve ser um espelho fiel — qualquer divergência é bug.

### Relevant Source Tree
```
src/lib/domain/course-enums.ts                     (NOVO — fonte única do cliente)
src/types/index.ts                                 (CourseStatus + labels Rascunho/Arquivado)
src/lib/supabase/mappers.ts                        (fromDb* de leitura; fim do colapso lossy)
src/lib/admin-resource-configs.tsx                 (options + badge helper L158-177)
src/lib/admin-form-validation.ts                   (validação por whitelist de enum)
supabase/functions/_shared/admin-validation.ts     (zod enum L49 → +Rascunho +Arquivado)
supabase/functions/_shared/admin-mappers.ts        (toDbCourseStatus L34-36 → 6 valores)
src/views/public/Courses.tsx                       (verificação de filtro público)
src/views/public/Agenda.tsx                        (verificação de filtro público)
supabase/migrations/20260710000000_course_public_content.sql (view/policies)
src/__tests__/lib/mappers.test.ts                  (round-trip 6 status)
```
> Redeploy da Edge Function `admin-resources` (Supabase `hwpsrujkxjhmmwphqdlz`) após alterar `_shared/*` — via @devops.

### Testing
- **Localização:** testes unitários em `src/__tests__/lib/` (Vitest). E2E em `tests/` (Playwright via `node scripts/run-playwright.mjs`).
- **Frameworks/padrões:** Vitest para unit (`npm run test:unit`), Playwright para E2E (`npm run test:e2e:smoke`).
- **Requisitos específicos desta story:**
  - Teste de round-trip idempotente para os 6 `status_curso` em `mappers.test.ts`, com casos explícitos de Rascunho e Arquivado (regressão do colapso lossy).
  - Smoke E2E confirmando ausência de cursos Rascunho/Arquivado nas listagens públicas.
- **Gate de qualidade (@qa):** `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run build`, `npm run test:e2e:smoke`.

## Change Log
| Date | Version | Description | Author |
|---|---|---|---|
| 2026-07-13 | 0.1 | Story criada a partir da ADR-015 Fase 1 (enums centralizados, status completo, fim do colapso lossy). Draft aguardando validação @po. | @sm (River) |
| 2026-07-13 | 0.2 | Refinamentos pós-checklist: fixado path da migration `curso_public_content`. Descoberto no grounding que a tradução/validação de escrita de status vive na Edge Function (não em `mappers.ts`); adicionado AC9 + task para expandir zod enum (`admin-validation.ts:49`) e `toDbCourseStatus`, com nota de redeploy. Documentada a fronteira Deno↔`src/` da "fonte única". | @sm (River) |
| 2026-07-13 | 0.3 | Validação @po: 9/10 no checklist de 10 pontos. Grounding técnico reconfirmado linha a linha (mappers.ts, types/index.ts, admin-validation.ts, admin-mappers.ts, admin-resource-configs.tsx, admin-form-validation.ts) — todas as referências batem exatamente com o código atual. Único gap: falta estimativa de complexidade (não-bloqueante). **Verdict: GO.** Status Draft → Ready. | @po (Pax) |
| 2026-07-13 | 0.4 | Implementação completa via `*develop-yolo`: módulo central de enums, fim do colapso lossy, path servidor corrigido (Edge Function), options/validação/badge derivados do módulo central, AC6 verificado via RLS existente (sem migration), testes de round-trip dos 6 status. Quality gate @dev (typecheck/lint/test:unit/build) passou. Status Ready → Ready for Review. | @dev (Dex) |

## Dev Agent Record

### Agent Model Used
Sonnet 5 (@dev — Dex), modo `*develop-yolo` (autônomo)

### Completion Notes
- Módulo central `src/lib/domain/course-enums.ts` criado com `COURSE_MODALITIES`/`COURSE_LEVELS`/`COURSE_STATUSES` (pares `{dbValue,label}`), helpers `*DbToLabel`/`*LabelToDb` e options prontos (`COURSE_*_OPTIONS`) — espelha 1:1 os enums Postgres de `20260512193000_initial_rh_cursos_schema.sql`.
- `course-enums.ts` importa `CourseRow` de `mappers.ts` via `import type` (type-only, sem ciclo em runtime) para derivar os dbValues dos enums Postgres diretamente do tipo gerado do Supabase.
- Colapso lossy `Rascunho/Arquivado → "Inativo"` removido de `fromDbCourseStatus`; `fromDbModality`/`fromDbLevel` agora delegam ao módulo central sem alterar o mapeamento existente.
- Path servidor (Edge Function `admin-resources`) corrigido: `admin-validation.ts` zod enum e `admin-mappers.ts` `toDbCourseStatus` agora cobrem os 6 status — sem isso o AC3/AC4 não funcionariam ponta a ponta (save seria rejeitado pelo servidor). **Requer redeploy da Edge Function no Supabase `hwpsrujkxjhmmwphqdlz` — handoff para @devops.**
- `admin-resource-configs.tsx`: `statusOptions`/`modalityOptions`/options de nível agora derivam do módulo central (zero literais duplicados). `getBadgeVariant` já classificava `Arquivado` como "danger" (compartilhado com `BlogStatus`) e `Rascunho` cai no fallback "muted" — nenhum dos dois cai em "success"/ativo.
- `admin-form-validation.ts`: `validateCourse` passou a validar `status`/`modalities`/`level` contra whitelists de labels derivadas do módulo central (antes só checava não-vazio). Corrigido um bug pré-existente na fixture de teste (`status: 'published'`, valor que nunca existiu no enum) que só passava porque a validação antiga não checava a whitelist.
- AC6 (vazamento público) verificado **sem alteração de código**: a RLS `catalogo_publico_curso_select` já restringe `status in ('Ativo','Destaque','EmBreve')` para o client público, e `fetchPublicCatalog` não sobrepõe filtro de status — depende inteiramente da RLS. `Courses.tsx`/`Agenda.tsx` só filtram `ClassStatus` (turma), campo diferente de `CourseStatus`.
- Testes: `mappers.test.ts` ganhou round-trip parametrizado (`it.each(COURSE_STATUSES)`) cobrindo DB→UI→DB idempotente para os 6 status, mais um teste explícito confirmando que Rascunho/Arquivado não colapsam mais para Inativo.
- Quality gate do @dev (AC8): `typecheck` ✅, `lint` ✅ (só warnings pré-existentes não relacionados), `test:unit` ✅ (433/433), `build` ✅. `test:e2e:smoke` fica para o QA Gate (@qa), conforme `quality_gate_tools` da story.
- Nenhuma migration criada nesta story (fora de escopo — ver Dev Notes/"No Invention").

### Debug Log References
Nenhuma ocorrência de bloqueio. Único ajuste fora do escopo estrito: fixture `admin-form-validation.test.ts` (`status: 'published'` → `'Ativo'`) para refletir um valor real de enum, exposto pela nova validação de whitelist.

### File List
- `src/lib/domain/course-enums.ts` (novo)
- `src/types/index.ts`
- `src/lib/supabase/mappers.ts`
- `supabase/functions/_shared/admin-validation.ts`
- `supabase/functions/_shared/admin-mappers.ts`
- `src/lib/admin-resource-configs.tsx`
- `src/lib/admin-form-validation.ts`
- `src/__tests__/lib/mappers.test.ts`
- `src/__tests__/lib/admin-form-validation.test.ts`

## QA Results

### Revisão por Quinn (@qa) — 2026-07-13

**Verdict: CONCERNS** (aprovado com observações — nenhum defeito de código HIGH/CRITICAL; ressalvas são de escopo/deploy)

#### Gates de qualidade executados
| Gate | Resultado |
|---|---|
| `npm run typecheck` | ✅ PASS |
| `npm run lint` | ✅ PASS (0 errors; 19 warnings pré-existentes, não relacionados) |
| `npm run test:unit` | ✅ PASS (433/433, 35 arquivos) |
| `npm run build` | ✅ PASS (exit 0) |
| `npm run test:e2e:smoke` | ⚠️ NÃO EXECUTADO — ver Concern #3 |

#### Rastreabilidade das Acceptance Criteria
| AC | Status | Evidência |
|---|---|---|
| AC1 — módulo central `course-enums.ts` | ✅ | `src/lib/domain/course-enums.ts` com `COURSE_MODALITIES/LEVELS/STATUSES` `{dbValue,label}` + helpers + options; dbValues derivados de `CourseRow` (type-only, sem ciclo runtime) |
| AC2 — 3 consumidores derivam do módulo | ✅ | `admin-resource-configs.tsx:245,247,377` (options), `mappers.ts:192-202` (`fromDbModality/Level/CourseStatus` delegam), `admin-form-validation.ts:1-5,59,76,104` (whitelist via Sets) |
| AC3 — 6 status no form | ✅ | `statusOptions = COURSE_STATUS_OPTIONS` (6 pares) em `admin-resource-configs.tsx:247` |
| AC4 — fim do colapso lossy | ✅ | `fromDbCourseStatus` agora = `statusDbToLabel` 1:1; teste `mappers.test.ts:121-137` (round-trip `it.each` dos 6 status + caso explícito Rascunho/Arquivado) |
| AC5 — `CourseStatus` + Rascunho/Arquivado | ✅ | `src/types/index.ts:5-11` |
| AC6 — sem vazamento público | ✅ | RLS `catalogo_publico_curso_select` (`20260512193000_initial_rh_cursos_schema.sql:295`) restringe `status in ('Ativo','Destaque','EmBreve')`; `fetchPublicCatalog` não sobrepõe filtro. Rascunho/Arquivado nunca chegam ao client anon. Sem migration (correto) |
| AC7 — badge para novos status | ✅ | `getBadgeVariant` (`admin-resource-configs.tsx:159-191`): `Arquivado`→"danger", `Rascunho`→fallback "muted"; nenhum cai em "success" |
| AC8 — gates + cobertura round-trip | ✅ | ver tabela de gates + teste round-trip |
| AC9 — path servidor (Edge Function) | ✅ (código) | zod enum `admin-validation.ts:49` com os 6 status; `toDbCourseStatus` (`admin-mappers.ts:34-44`) mapa explícito dos 6 (`"Em breve"→EmBreve`). **Persistência real depende de redeploy — Concern #2** |

#### Concerns (não bloqueiam o código; exigem ação antes/no push)
1. **[MÉDIA — escopo/higiene de commit]** A working tree contém artefatos da **Fase 3** (fora do escopo desta story e ausentes do File List): novo `supabase/migrations/20260713100000_curso_modalidades_array.sql` e alterações em `supabase/sql/create_all_rh_cursos_schema.sql` (coluna `modalidades`, trigger `curso_sync_modalidades`, constraints). **Risco:** serem incluídos no commit da F1, contaminando o escopo. **Recomendação:** `git stash`/segregar esses arquivos antes de commitar a F1 e movê-los para a story da Fase 3.
2. **[MÉDIA — dependência de deploy]** O código do AC9 está correto, mas salvar/editar cursos `Rascunho`/`Arquivado` **falhará em produção até** a Edge Function `admin-resources` ser redeployada no Supabase `hwpsrujkxjhmmwphqdlz`. Handoff obrigatório para **@devops** (já documentado nas Dev Notes/Change Log). Sem isso, AC3/AC4 não funcionam ponta a ponta.
3. **[BAIXA — gate residual]** `test:e2e:smoke` não rodado neste gate. Como o path de escrita depende do redeploy (Concern #2), um smoke de save falharia até o deploy. **Recomendação:** executar `test:e2e:smoke` **após** o redeploy da Edge Function.

#### Observação (não-bloqueante)
- `levelLabelToDb` retorna `undefined` para labels de `Course["level"]` fora de `COURSE_LEVELS` (`"Básico / Avançado"`, `"Intermediário / Avançado"`). Lacuna pré-existente do enum de nível, fora do escopo desta story, sem regressão (o path servidor usa `toDbLevel` próprio com fallback). Registrar como dívida técnica se esses níveis forem usados.

#### Conclusão
Implementação da Fase 1 correta e completa; espelha fielmente os enums Postgres (princípio No Invention respeitado). Aprovado como **CONCERNS**. **Antes do push (@devops):** (a) segregar os artefatos da Fase 3 da working tree; (b) redeployar a Edge Function `admin-resources`; (c) rodar `test:e2e:smoke` pós-deploy.

— Quinn, guardião da qualidade 🛡️

### Fechamento dos concerns residuais — 2026-07-15

(a) Confirmado: commit `870b5dc` só contém os arquivos da Fase 1 (`git show --stat`), nenhum artefato da Fase 3 misturado. (b) Confirmado: `deploy-functions.yml` redeploya as 4 Edge Functions (`leads`, `enrollments`, `auth-session`, `admin-resources`) a cada push; o run `29253180458` (no próprio commit `870b5dc`) falhou por infra ("Set up job"), mas o run seguinte `29301341243` (2026-07-14, commit `e3714b3`, descendente de `870b5dc`) teve `conclusion: success` — `admin-resources` já foi redeployado em produção com o contrato dos 6 status. (c) `npm test` (Playwright, 174/174 PASS) local cobre o path de salvar/reabrir Rascunho/Arquivado via `tests/admin-crud.spec.ts`. Status: Ready for Review → Done.
