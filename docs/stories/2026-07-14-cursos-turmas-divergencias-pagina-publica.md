# Story: Corrigir divergências entre formulários de curso/turma e a página pública do curso

## Status
Draft

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

### AC6 — Rating removido da página (Decisão de produto: remover)
12. O chip "Avaliação média {rating}/5" (`CourseDetail.tsx:572`) é removido. Nenhum campo de rating é adicionado ao formulário. `studentsCount` permanece derivado (real) e continua exibido.

### AC7 — Qualidade
13. `npm run typecheck`, `npm run lint`, `npm run test:unit` e `npm run build` passam. `npm run test:e2e:smoke` executado ou risco aceito explicitamente no gate.
14. Testes cobrem: elegibilidade de turma (`enrollment-class-resolution` incluindo "Em breve" e 0 vagas), instrutor primário determinístico (`mappers`), e `durationHours > 0` na validação. Baselines de UI governance do CourseDetail atualizados para nível exibido e rating removido.

## Tasks / Subtasks
- [ ] Turmas "Em breve" e esgotadas na página (AC1, AC2)
  - [ ] Ajustar `OPEN_CLASS_STATUSES`/`isEnrollmentClassOpen` em `enrollment-class-resolution.ts`.
  - [ ] Novo estado "Esgotada" em `getSpotMeta` e tratamento de CTA em `CourseDetail.tsx`.
  - [ ] Testes de `getOpenEnrollmentClasses` cobrindo os dois casos.
- [ ] Instrutor determinístico + chip correto (AC3)
  - [ ] Tornar `primaryInstructor` determinístico em `mappers.ts` (nextClass → mais recente).
  - [ ] Corrigir/remover chip "turmas ministradas".
  - [ ] Aviso de turma sem instrutor no form.
- [ ] Exibir nível (AC4)
  - [ ] Chip de `course.level` no hero; remover/condicionar texto fixo.
- [ ] Carga horária fonte única (AC5)
  - [ ] Campo `durationHours` no form; derivar `durationLabel`.
  - [ ] Validação `> 0` client + server.
- [ ] Remover rating da página (AC6)
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
