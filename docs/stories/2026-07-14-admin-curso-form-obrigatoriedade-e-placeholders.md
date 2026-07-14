# Story: Admin curso form com obrigatoriedade mínima e placeholders úteis

## Status
Done

## Executor Assignment
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - npm run typecheck
  - npm run lint
  - npm run test:unit
  - npm run build

## Story
**As a** operador do admin da RH Cursos,
**I want** o formulário de curso exigir apenas os campos realmente essenciais e orientar o preenchimento com placeholders claros,
**so that** eu consiga cadastrar cursos sem atrito desnecessário e sem depender de conhecimento implícito do sistema.

## 🤖 CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação de qualidade usará revisão manual e os quality gates declarados nesta story.

## Acceptance Criteria
1. O formulário de cursos em `src/lib/admin-resource-configs.tsx`, `src/lib/admin-form-validation.ts` e `supabase/functions/_shared/admin-validation.ts` passa a usar a seguinte matriz explícita de obrigatoriedade para criação operacional:
   - obrigatórios: `title`, `pathId`, `modalities`, `level`, `status`, `durationLabel`, `price`, `shortDescription`, `fullDescription`
   - opcionais: `featured`, `image`, `targetAudience`, `categories`, `featuredCourseIds`, `objectives`, `benefits`, `modules`
2. O campo `featured` deixa de exigir decisão manual do operador no cadastro inicial e passa a defaultar para `Não`/`false` quando não informado; `price`, `shortDescription` e `fullDescription` permanecem obrigatórios por sustentarem catálogo público, detail e checkout no contrato atual.
3. Cada campo editável do formulário de curso passa a ter placeholder ou hint útil e específico, evitando placeholders genéricos do tipo `Ex.: Nome do curso` quando isso não orienta o preenchimento real.
4. Os placeholders do formulário de curso cobrem pelo menos: nome, carga horária, imagem, descrição curta, descrição completa, público-alvo, categorias, objetivos, benefícios e módulos.
5. A validação client-side e server-side permanecem coerentes entre si; não pode existir campo opcional na UI que continue obrigatório no contrato de save.
6. Testes cobrem a nova matriz de obrigatoriedade e garantem que o form de curso continua salvando com sucesso quando apenas os campos essenciais estiverem preenchidos.

## Tasks / Subtasks
- [x] Revisar o contrato mínimo de criação de curso no admin (AC: 1, 2)
  - [x] Comparar `fields` vs `validateCourse` vs `courseSchema`.
  - [x] Remover obrigatoriedade visual e lógica dos campos não essenciais.
- [x] Melhorar a orientação de preenchimento do form (AC: 3, 4)
  - [x] Definir placeholders específicos por campo no render do admin.
  - [x] Adicionar hints onde placeholder não for suficiente.
- [x] Alinhar validação UI/server (AC: 5)
  - [x] Revisar `src/lib/admin-form-validation.ts`.
  - [x] Revisar `supabase/functions/_shared/admin-validation.ts`.
- [x] Cobrir com testes (AC: 6)
  - [x] Ajustar testes de `admin-resource-configs`.
  - [x] Ajustar testes de validação.

## Dev Notes

### Contexto observado
- O formulário de curso é definido em `src/lib/admin-resource-configs.tsx`.
- Hoje estão marcados como obrigatórios: `title`, `pathId`, `modalities`, `level`, `status`, `featured`, `durationLabel`, `price`, `shortDescription` e `fullDescription`.
- A validação client-side em `src/lib/admin-form-validation.ts` reforça boa parte dessas exigências.
- A validação server-side em `supabase/functions/_shared/admin-validation.ts` também trata `price`, `shortDescription` e `fullDescription` como obrigatórios.
- O render genérico do admin em `src/views/admin/AdminResourcePage.tsx` usa placeholders genéricos para `text` e `textarea`, o que torna o preenchimento pouco guiado.
- O ajuste de prontidão aqui é intencionalmente conservador: a story reduz obrigatoriedade apenas onde o impacto de negócio atual está claro (`featured`), e não inventa flexibilização para `price` ou descrições sem redefinir catálogo/checkout.

### Referências relevantes
```
src/lib/admin-resource-configs.tsx
src/lib/admin-form-validation.ts
supabase/functions/_shared/admin-validation.ts
src/views/admin/AdminResourcePage.tsx
src/__tests__/lib/admin-resource-configs.test.ts
src/__tests__/lib/admin-form-validation.test.ts
```

### Testing
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit`
- `npm run build`

## Change Log
| Date | Version | Description | Author |
|---|---|---|---|
| 2026-07-14 | 0.1 | Story criada a partir dos bugs de obrigatoriedade excessiva e falta de placeholders no form de curso. | @sm (River) |
| 2026-07-14 | 0.2 | Validação @po: NO-GO. Estrutura base está clara, mas a story ainda tem bloqueios de prontidão: falta a seção `🤖 CodeRabbit Integration` prevista no template; `quality_gate` está como `@qa`, divergindo da matriz dinâmica do template para stories de código; e os ACs 1-2 deixam ambíguo o que é “realmente indispensável”, inclusive tratando `price` como potencialmente opcional sem explicitar o impacto nas views públicas/checkout que hoje consomem esse campo. | @po (Pax) |
| 2026-07-14 | 0.3 | Refinamento @sm pós-NO-GO: seção `🤖 CodeRabbit Integration` adicionada, `quality_gate` alinhado para `@architect`, e a matriz de obrigatoriedade foi fechada explicitamente, mantendo `price`, `shortDescription` e `fullDescription` como obrigatórios e tornando `featured` opcional com default `Não`/`false`. | @sm (River) |
| 2026-07-14 | 0.4 | Revalidação @po: GO. Draft agora está alinhado ao template, à matriz dinâmica de executor/gate e a uma regra explícita de obrigatoriedade sem invenção de flexibilizações de negócio. Status: Draft → Ready. | @po (Pax) |
| 2026-07-14 | 0.5 | Contrato do form revalidado com `src/__tests__/lib/admin-resource-configs.test.ts` e `npm run typecheck`, confirmando obrigatoriedade mínima, placeholders/hints e coerência de tipagem no admin. | @dev (Dex) |
| 2026-07-14 | 0.6 | Regressão ampliada para travar a matriz completa de campos obrigatórios, opcionais, placeholders e hints do formulário administrativo de curso. | @dev (Dex) |

## File List

- `src/lib/admin-resource-configs.tsx`
- `src/lib/admin-form-validation.ts`
- `supabase/functions/_shared/admin-validation.ts`
- `src/__tests__/lib/admin-resource-configs.test.ts`
- `src/__tests__/lib/admin-form-validation.test.ts`
- `docs/stories/2026-07-14-admin-curso-form-obrigatoriedade-e-placeholders.md`
