# Story: Corrigir divergências entre formulários de curso/turma e a página pública do curso

## Status
Ready

## Executor Assignment
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - npm run typecheck
  - npm run lint
  - npm run test:unit
  - npm run build
  - npm run test:e2e:smoke

## Story
**As a** operador do admin da RH Cursos,
**I want** que tudo o que eu cadastro nos formulários de curso e turma apareça de forma fiel na página pública do curso,
**so that** o que o cliente vê corresponda ao que foi configurado, sem turmas somindo, instrutor genérico ou dados fantasma antes do go-live de 02/07/2026.

## Estimativa
**M** — entre um e dois dias de esforço focado (7 ACs tocando elegibilidade de turma, mapper de instrutor, formulário de curso e página pública).

## Dependências
- **Sobreposição de arquivo com Épica 17 (`Done`):** a Story 17.2 (commit `a992597`, fechada em 2026-07-15) já alterou `CourseDetail.tsx` nesta mesma área (chips de rating/turmas, `buildTestimonial`). Esta story foi escrita em 2026-07-14, antes da 17.2 — dois itens precisam de reconciliação, já aplicada nesta validação:
  - AC3 item 6 (chip "turmas ministradas"): **já resolvido pela 17.2**, que relabelou para "turmas abertas" pelo mesmo motivo descrito aqui. Task removida desta story para não duplicar trabalho.
  - AC6 (remover chip de rating): a 17.2 decidiu manter o chip condicional a `rating > 0`. **Decisão @po nesta validação: esta story sobrescreve a 17.2 e remove o chip incondicionalmente**, mesmo quando `rating > 0` — ver AC6 atualizado abaixo.
- **Não depende de nenhuma story REC-* em aberto.** Não bloqueia nem é bloqueada pela ADR015-F3 (arquivos distintos: esta story não toca `categoria`/`categorias`).

## 🤖 CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação de qualidade usará revisão manual (@architect quality gate) e os quality gates declarados nesta story.

## Acceptance Criteria

### AC1 — Turmas "Em breve" aparecem na página (Decisão de produto: exibir)
1. `getOpenEnrollmentClasses`/`isEnrollmentClassOpen` (`src/lib/enrollment-class-resolution.ts`) passam a incluir o status `"Em breve"` como turma elegível para exibição na página do curso.
2. Turmas `"Em breve"` são exibidas no card lateral com o badge "Turma nova" (lógica já existente em `getSpotMeta`, `CourseDetail.tsx:83-102`) e **não** habilitam checkout: o CTA principal vira "Manifestar interesse" quando a turma selecionada não está de fato aberta para inscrição.

### AC2 — Turma elegível com 0 vagas não some silenciosamente
3. A condição de "status elegível" é separada da condição "tem vaga": uma turma com status `"Inscrições abertas"`/`"Poucas vagas"` e `availableSeats === 0` continua aparecendo na página, sinalizada como **"Esgotada"** (novo estado visual em `getSpotMeta`), em vez de desaparecer.
4. Turma "Esgotada" não habilita checkout (mesmo tratamento de CTA do AC2/AC1.2).

### AC3 — Instrutor do curso é inferido de forma determinística (Decisão de produto: inferido das turmas)
5. `mapCourse` (`src/lib/supabase/mappers.ts:324`) define `instructorId` de forma determinística: instrutor da `nextClass` do curso; na ausência dela, o instrutor vinculado mais recente. A regra fica documentada em comentário no mapper.
6. O chip "{courseClasses.length} turmas ministradas" (`CourseDetail.tsx:564`) deixa de usar a contagem de turmas abertas como histórico do instrutor: usa um dado correto ou o chip é removido.
7. Quando o curso não tem instrutor resolvido, o form de turma sinaliza (hint/aviso) que a turma está sem instrutor, para o operador não publicar curso com "Instrutor" genérico.

### AC4 — Nível do curso é exibido
8. `course.level` passa a ser exibido na página do curso (chip no hero, `CourseDetail.tsx:400-417`).
9. O texto fixo "Não é necessário conhecimento prévio da temática do curso" (`CourseDetail.tsx:468-471`) é removido ou condicionado, para não contradizer cursos de nível Intermediário/Avançado.

### AC5 — Carga horária com fonte única de verdade
10. O formulário de curso passa a ter um campo numérico `durationHours` como fonte de verdade; `durationLabel` é derivado para exibição, invertendo a heurística atual `Number(str(form.durationLabel).replace(/\D/g,""))` (`admin-resource-configs.tsx:366`).
11. Validação (`src/lib/admin-form-validation.ts` e `supabase/functions/_shared/admin-validation.ts`) garante `durationHours > 0`. "Certificado de {durationHours}h" (`CourseDetail.tsx:411`) passa a refletir o valor cadastrado sem ambiguidade.

### AC6 — Rating removido da página (Decisão de produto: remover incondicionalmente — sobrescreve Story 17.2)
12. O chip "Avaliação média {rating}/5" (atualmente em `CourseDetail.tsx:567-571`, renderizado condicionalmente a `rating > 0` desde a Story 17.2) é removido **por completo, independente do valor de `rating`**. Nenhum campo de rating é adicionado ao formulário. `studentsCount` permanece derivado (real) e continua exibido. **Esta decisão sobrescreve a Story 17.2** (que optou por manter o chip condicional); a 17.2 não precisa ser reaberta, mas o código dela nesta área é substituído por esta story.

### AC7 — Qualidade
13. `npm run typecheck`, `npm run lint`, `npm run test:unit` e `npm run build` passam. `npm run test:e2e:smoke` executado ou risco aceito explicitamente no gate.
14. Testes cobrem: elegibilidade de turma (`enrollment-class-resolution` incluindo "Em breve" e 0 vagas), instrutor primário determinístico (`mappers`), e `durationHours > 0` na validação. Baselines de UI governance do CourseDetail atualizados para nível exibido e rating removido.

## Tasks / Subtasks
- [x] Turmas "Em breve" e esgotadas na página (AC1, AC2)
  - [x] Ajustar `OPEN_CLASS_STATUSES`/`isEnrollmentClassOpen` em `enrollment-class-resolution.ts`.
  - [x] Novo estado "Esgotada" em `getSpotMeta` e tratamento de CTA em `CourseDetail.tsx`.
  - [x] Testes de `getOpenEnrollmentClasses` cobrindo os dois casos.
- [x] Instrutor determinístico + chip correto (AC3)
  - [x] Tornar `primaryInstructor` determinístico em `mappers.ts` (nextClass → mais recente).
  - [x] ~~Corrigir/remover chip "turmas ministradas"~~ — já resolvido pela Story 17.2 (relabelado para "turmas abertas").
  - [x] Aviso de turma sem instrutor no form.
- [x] Exibir nível (AC4)
  - [x] Chip de `course.level` no hero; remover/condicionar texto fixo.
- [x] Carga horária fonte única (AC5)
  - [x] Campo `durationHours` no form; derivar `durationLabel`.
  - [x] Validação `> 0` client + server.
- [x] Remover rating da página (AC6)
- [ ] Testes e baselines (AC7)

## Dev Notes

### Contexto observado (grounding no código)
- **`src/lib/enrollment-class-resolution.ts:3-9`** — `OPEN_CLASS_STATUSES` só tem `"Inscrições abertas"`/`"Poucas vagas"`; `isEnrollmentClassOpen` exige `availableSeats > 0`. É a causa raiz de turmas somindo (Em breve e lotadas).
- **`src/views/public/CourseDetail.tsx:83-118`** — `getSpotMeta`/`getUrgencyLabel` já têm ramos para `"Em breve"` que hoje são código morto (nunca alcançados por causa do filtro acima).
- **`src/views/public/CourseDetail.tsx:254`** — instrutor vem de `course.instructorId`, que **não** tem campo no form de curso; é derivado em `mappers.ts:324` (`primaryInstructor`). Decisão de produto: manter inferido, mas determinístico.
- **`src/views/public/CourseDetail.tsx:564`** — "{courseClasses.length} turmas ministradas" usa contagem de turmas abertas (enganoso).
- **`src/views/public/CourseDetail.tsx:411,468-471`** — nível nunca exibido; texto fixo contradiz nível.
- **`src/lib/admin-resource-configs.tsx:366`** — `durationHours` derivado por regex do `durationLabel` (texto livre); `mappers.ts:313` faz o inverso — duas fontes de verdade.
- **`src/views/public/CourseDetail.tsx:572`** — chip de rating a remover.

### Fronteira (No Invention)
- Esta story **não** altera schema do banco. `rating`/`studentsCount`/`categoria` continuam como estão no banco; apenas a exibição de rating é removida. Mudança de cardinalidade de categorias é a story separada de ADR-015 Fase 3.

## Riscos e Roll-forward / Rollback

### Riscos
- **Conflito de merge com Épica 17:** `CourseDetail.tsx` foi tocado pela Story 17.2 na sessão anterior a esta validação; qualquer branch aberta antes dessa story precisa rebasear antes de editar os mesmos trechos (chips do hero/sidebar).
- **Mudança de comportamento de `courseClasses`:** ao incluir "Em breve" e "Esgotada" em `getOpenEnrollmentClasses`, qualquer código que assuma que todo item da lista tem `availableSeats > 0` (ex.: cálculo de urgência) precisa ser revisado — `getUrgencyLabel` já tem branch para "Em breve" mas não para "Esgotada"; adicionar tratamento explícito para evitar mensagem de urgência incorreta em turma esgotada.
- **Instrutor determinístico pode mudar o instrutor exibido em cursos já publicados:** cursos onde `principal` não está setado corretamente podem trocar de instrutor exibido ao mudar a regra de fallback (array-order → nextClass). Mitigação: `@dev` roda uma amostragem antes/depois da mudança para cursos publicados, sem alterar dados.

### Roll-forward / Rollback
- **Roll-forward preferido:** ajustar a lógica de elegibilidade/instrutor mantendo os testes de regressão; não reverter para o comportamento antigo de turmas sumindo.
- **Rollback seguro:** reverter isoladamente `CourseDetail.tsx`/`enrollment-class-resolution.ts` para o estado anterior a esta story, preservando as correções já shippadas pela Story 17.2 (testimonial/rating condicional) — não é um rollback total do arquivo.
- **Rollback proibido:** remover o teste de regressão de elegibilidade de turma sem substituir por outro equivalente.

### Relevant Source Tree
```
src/lib/enrollment-class-resolution.ts
src/views/public/CourseDetail.tsx
src/lib/supabase/mappers.ts
src/lib/admin-resource-configs.tsx
src/lib/admin-form-validation.ts
supabase/functions/_shared/admin-validation.ts
src/__tests__/lib/ (enrollment-class-resolution, mappers, admin-form-validation)
tests/ui-governance.spec.ts-snapshots/ (baselines CourseDetail)
```

### Testing
- Unit (Vitest): `npm run test:unit`. E2E (Playwright): `npm run test:e2e:smoke`.
- Gate (@architect): typecheck, lint, test:unit, build, test:e2e:smoke.

## Change Log
| Date | Version | Description | Author |
|---|---|---|---|
| 2026-07-14 | 0.1 | Story criada a partir da análise de divergências entre formulários de curso/turma e a página pública. Decisões de produto travadas: "Em breve" exibido, instrutor inferido determinístico, rating removido da página. Categorias multi-valor foram isoladas em story separada (ADR-015 Fase 3) por exigirem migration. Draft aguardando validação @po. | @architect (Aria) |
| 2026-07-15 | 1.0 | **NO-GO inicial (~5,5/10) → correções aplicadas → GO; Draft → Ready.** Grounding técnico verificado no código real; checklist de 10 pontos identificou ausência de Estimativa, Dependências e Riscos/Rollback — corrigidos nesta entrada. Dois achados de conteúdo, não só de forma: (1) AC3 item 6 ("chip turmas ministradas") já estava resolvido pela Story 17.2 (Épica 17, commit `a992597`), que relabelou o chip para "turmas abertas" antes desta validação — task marcada como já resolvida, sem duplicar trabalho; (2) AC6 (remover chip de rating) conflitava com a decisão já implementada pela 17.2 de manter o chip condicional a `rating > 0`. Decisão @po (usuário consultado): **esta story sobrescreve a 17.2 e remove o chip incondicionalmente** — AC6 atualizado para deixar isso explícito, e a Dependências documenta a sobreposição de arquivo para quem for implementar não reabrir a 17.2. Bloqueadores documentais: 0. | @po (Pax) |
| 2026-08-03 | 1.1 | Implementados AC1–AC6: visibilidade de turmas separada de elegibilidade de checkout; estados Em breve/Esgotada no detalhe público; CTA sem checkout sem vaga; assinatura Realtime de `turma`; instrutor da próxima turma com fallback determinístico; nível e duração canônica; rating removido. `npm run test:unit` (778), `npm run typecheck`, `npm run lint`, `npm run build` e gates OpenAPI passaram. `npm run test:e2e:smoke` executou, mas não pode validar os casos com escrita sem o Environment Supabase isolado da REC-409; AC7 permanece aberto. | @dev (Dex) |
| 2026-08-03 | 1.2 | Corrigida a descoberta de checkout no E2E: a navegação não usa mais `networkidle`, instável com polling e Realtime; ela espera o DOM e o CTA visível. A jornada pública também aguarda apenas os elementos necessários. Validação final depende da CI com Supabase isolado. | @dev (Dex) |
| 2026-08-03 | 1.3 | Corrigida a fonte da fixture E2E de checkout: usa `turma_publica` e os mesmos filtros públicos de curso, evitando selecionar turma soft-deleted que não produz CTA. Validação final depende da CI com Supabase isolado. | @dev (Dex) |
| 2026-08-03 | 1.4 | Os cenários de pré-inscrição agora iniciam pela rota canônica `/checkout?classId=` de uma turma pública elegível, em vez de duplicar o teste do CTA no detalhe. Isso mantém o E2E focado em persistência e preserva a cobertura do CTA nos testes unitários de `CourseDetail`. | @dev (Dex) |

## File List

- `src/lib/enrollment-class-resolution.ts`
- `src/views/public/CourseDetail.tsx`
- `src/lib/supabase/mappers.ts`
- `src/lib/admin-resource-configs.tsx`
- `src/lib/admin-form-validation.ts`
- `src/lib/app-store.tsx`
- `supabase/functions/_shared/admin-validation.ts`
- `src/__tests__/lib/checkout-class-resolution.test.ts`
- `src/__tests__/lib/mappers.test.ts`
- `src/__tests__/lib/admin-form-validation.test.ts`
- `src/__tests__/lib/admin-mappers.test.ts`
- `src/__tests__/lib/app-store.test.ts`
- `src/__tests__/views/public/course-detail.test.tsx`
- `tests/helpers/integration-env.ts`
- `tests/public-journeys.spec.ts`
