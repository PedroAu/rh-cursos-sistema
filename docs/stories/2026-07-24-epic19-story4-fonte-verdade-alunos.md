# Story 19.4: Corrigir fonte de verdade e integridade de alunos

## Status

Done

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: [architecture_review, code_review, pattern_validation]
assignment_basis: "executor-assignment: code_general"
```

## Épica e rastreabilidade

- **Épica:** [Épica 19 — Integridade dos Contratos dos Formulários Administrativos](../epics/epic-19-integridade-contratos-formularios-admin.md)
- **Prioridade:** P1
- **Tipo:** brownfield de read model, PII e formulário
- **Dependência:** Story 19.2; pode executar em paralelo com 19.3 e 19.5.
- **Preserva:** read models REC-303/REC-304, proteção REC-106, paginação, busca e autorização fail-closed.

## Story

**As a** administrador que consulta alunos,
**I want** que a entidade `aluno` seja a fonte de listagem e que status/matrículas sejam agregados,
**so that** alunos sem inscrição não desapareçam e um update parcial nunca apague PII.

## Contexto e valor

O read model parte de `inscricao INNER JOIN aluno`, fazendo alunos sem inscrição desaparecerem após reload; o formulário trata `enrollmentStatus` como atributo de aluno embora o status pertença às inscrições. Criar aluno com e-mail existente pode enviar campos ausentes como `NULL` e redefinir `tipo_aluno`. Esta story fecha FR-19.06–FR-19.08 sem apagar dados ou reabrir o incidente da Epic 17.

## Acceptance Criteria

1. A listagem administrativa parte diretamente de `aluno`; aluno sem inscrição permanece visível após reload.
2. Cada aluno aparece uma única vez, com contagem, última atividade e status derivados das inscrições quando existirem.
3. `enrollmentStatus` não é editável nem aceito no DTO de aluno; permanece apenas como informação derivada/readonly.
4. Create/update parcial preserva CPF, telefone, cargo, tipo e demais campos ausentes; ausência não vira `NULL` nem default destrutivo.
5. Aluno existente localizado por e-mail é reutilizado sem sobrescrita silenciosa de PII, incluindo fluxo combinado da Story 19.3.
6. Busca, paginação, autorização fail-closed, soft-delete e agregados existentes continuam funcionando.
7. Testes cobrem aluno sem inscrição, deduplicação, e-mail existente com sentinelas de PII, status derivado e reload; lint/typecheck passam.

## Tasks / Subtasks

- [x] Auditar read model e query base de alunos, identificando joins e agregados atuais (AC: 1, 2, 6).
- [x] Alterar leitura para `aluno` com agregados de inscrição sem N+1 (AC: 1, 2, 6).
- [x] Remover `enrollmentStatus` do formulário/DTO de aluno e exibir derivação readonly (AC: 3).
- [x] Implementar create/update parcial e proteção contra `undefined → null`/defaults destrutivos (AC: 4, 5).
- [x] Integrar resposta canônica da Story 19.2 e atualizar testes de reload/PII (AC: 5, 7).

## Dev Notes

### Fontes verificadas

- Epic 19, FR-19.06–FR-19.08, FR-19.12 e NFR-19.03/NFR-19.07.
- Read models REC-303/REC-304 e proteção de PII REC-106 são padrões a preservar.
- Fontes de leitura/mutação: `src/lib/supabase/admin-read-models.ts`, `src/lib/app-store.tsx`, `src/lib/admin-resource-configs.tsx`, `supabase/functions/admin-resources/index.ts` e validação/mappers compartilhados.

### Proibições

- Não apagar alunos sem inscrição, não alterar RLS/grants e não transformar status de inscrição em coluna de aluno.
- Não fazer reescrita integral do AppStore nem introduzir query N+1.

## Testing

- Unitários em `src/__tests__/lib/admin-read-models.test.ts`, `src/__tests__/lib/app-store.test.ts`, `src/__tests__/lib/admin-form-validation.test.ts` e testes de views admin.
- Testes de banco/contrato para aluno sem inscrição, e-mail existente e preservação de PII.
- Cenário E2E: criar → consultar banco/read model → reload → editar parcialmente → consultar novamente.

## Dependências, riscos e rollback

- **Dependências:** 19.2; REC-303/304/106 e autorização vigente.
- **Riscos:** duplicar alunos, perder PII ou quebrar filtros/paginação; mitigar com sentinelas, agregação limitada e regressão.
- **Rollback:** manter rota/read model anterior disponível durante validação; repontar leitura sem apagar dados.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está habilitado em `.aiox-core/core-config.yaml`; revisão manual pelo `@architect`.

### Story Type Analysis

- **Primary Type:** API/Read Model
- **Secondary Type(s):** PII, Frontend
- **Complexity:** Alta

### Manual review focus

- Fonte direta em `aluno`, agregações sem N+1 e deduplicação.
- Semântica PATCH e preservação de PII ausente.

## Story Draft Checklist — @sm

| Categoria                         | Resultado | Evidência                                                  |
| --------------------------------- | --------- | ---------------------------------------------------------- |
| Goal & Context Clarity            | PASS      | Desaparecimento de alunos e risco de PII estão explícitos. |
| Technical Implementation Guidance | PASS      | Read model, AppStore, configs e backend identificados.     |
| Reference Effectiveness           | PASS      | REC-303/304/106 e FRs resumidos.                           |
| Self-Containment                  | PASS      | Proibições, agregados, edge cases e rollback definidos.    |
| Testing Guidance                  | PASS      | Banco, unitário e E2E de reload/PII definidos.             |
| CodeRabbit Integration            | N/A       | Integração desabilitada no core config.                    |

## Change Log

### Validação PO — 2026-07-24

**GO — 10/10.** Story define fonte `aluno`, agregações derivadas, semântica parcial sem apagar PII, autorização/paginação e testes de reload. A revisão do `@data-engineer` permanece gate obrigatório para read model, queries e proteção de dados.

| Date       | Version | Description                                                         | Author        |
| ---------- | ------: | ------------------------------------------------------------------- | ------------- |
| 2026-07-24 |     0.1 | Draft criado a partir do diagnóstico de alunos e FR-19.06–FR-19.08. | `@sm` (River) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-24-epic19-story4-fonte-verdade-alunos.md`

### Arquivos previstos para implementação (a confirmar pelo executor)

- `src/lib/supabase/admin-read-models.ts`
- `src/lib/app-store.tsx`
- `src/lib/admin-resource-configs.tsx`
- `supabase/functions/admin-resources/index.ts`
- `supabase/functions/_shared/admin-validation.ts`
- Testes de read model, formulário, banco e E2E admin
