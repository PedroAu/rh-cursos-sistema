# Story 19.5: Alinhar catálogo, instrutores, leads e turmas

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
- **Tipo:** brownfield full-stack de catálogo, relacionamento, validação e leads
- **Dependência:** Story 19.2; pode executar em paralelo com 19.3 e 19.4.
- **Preserva:** schema existente, `total_alunos` derivado, jornadas públicas de lead e padrões Trust Keith.

## Story

**As a** administrador de catálogo,
**I want** que cursos, turmas, leads e instrutores persistam somente campos editáveis válidos,
**so that** relacionamentos e valores operacionais sobrevivam ao reload sem sobrescrever projeções derivadas.

## Contexto e valor

A Epic 19 identificou vínculo `instrutor.courseIds` sem write N:N, leads que descartam `type`/`trainingTheme`, carga horária ambígua, `total_alunos` reenviado pelo formulário, preço sem validação server-side, capacidade confiada ao browser, upload de foto Data URL e observação simulada. Esta story fecha FR-19.13–FR-19.19 e mantém `featuredCourseIds` removido.

## Acceptance Criteria

1. Alterar `instrutor.courseIds` sincroniza `curso_instrutor` atomicamente, preserva vínculos corretos e sobrevive ao reload.
2. Edição de lead persiste `type` e `trainingTheme`; criação não oferece seletor editável de status e assume `Novo`.
3. Curso captura e envia carga horária como inteiro não negativo (`durationHours`); `durationLabel` é apresentação derivada e parsing com múltiplos números não ocorre.
4. Formulários não enviam nem alteram `total_alunos`, `studentsCount`, `rating`, `filledSeats`, `availableSeats`, slug ou timestamps derivados.
5. Preço de turma é rejeitado no cliente e no contrato server-side quando inválido/negativo; capacidade final é calculada pela autoridade server-side, sem confiar nos campos derivados do browser.
6. `featuredCourseIds` não aparece na UI nem em DTO administrativo; não é criada relação alternativa nesta story.
7. Foto de instrutor aceita apenas URL HTTP(S) ou caminho permitido e rejeita Data URL; não há Supabase Storage.
8. Observação simulada/controle enganoso deixa de ser criado; jornadas públicas de lead permanecem sem regressão.
9. Testes cobrem persistência N:N, leads, carga horária, campos derivados, preço/capacidade, URL e reload; lint/typecheck passam.

## Tasks / Subtasks

- [x] Implementar diff transacional de `curso_instrutor` no create/update de instrutor (AC: 1).
- [x] Completar DTO/mapper de lead e conter status apenas na criação (AC: 2).
- [x] Migrar duração para inteiro não negativo e retirar campos derivados do payload (AC: 3, 4).
- [x] Adicionar validação server-side de preço e cálculo autoritativo de capacidade (AC: 5).
- [x] Validar URL textual de foto e remover caminho Data URL/Storage (AC: 7).
- [x] Remover observação simulada e confirmar ausência de `featuredCourseIds` (AC: 6, 8).
- [x] Criar testes unitários, de contrato/banco e E2E de reload para todos os campos (AC: 9).

## Dev Notes

### Fontes verificadas

- Epic 19, FR-19.13–FR-19.19, FR-19.20 e NFR-19.04–NFR-19.07.
- `src/lib/admin-resource-configs.tsx`, `src/views/admin/AdminResourcePage.tsx`, `src/lib/app-store.tsx`.
- `supabase/functions/admin-resources/index.ts`, `_shared/admin-validation.ts`, `_shared/admin-mappers.ts` e tabelas `curso`, `turma`, `lead`, `instrutor`, `curso_instrutor`.

### Proibições

- Não criar relação de cursos relacionados, Supabase Storage, gateway de pagamento ou redesign amplo.
- Não permitir que o browser seja autoridade para capacidade/contadores.
- Não alterar jornadas públicas sem correção explicitamente coberta por outra story.

## Testing

- Unitários em `src/__tests__/lib/admin-resource-configs.test.ts`, `src/__tests__/lib/admin-mappers.test.ts` e testes de views/admin existentes.
- Testes SQL/contratuais para `curso_instrutor`, preço/capacidade e validação de URL.
- E2E administrativo campo → payload → banco → reload para instrutor, lead, curso e turma.
- Regressão de leads públicos e `npm run lint`/`npm run typecheck`.

## Dependências, riscos e rollback

- **Dependências:** 19.2; schema e constraints existentes; pode rodar em paralelo a 19.3/19.4 com ownership explícito.
- **Riscos:** remover vínculos N:N incorretos, parsing de duração, bypass de validação ou conflito em arquivos centrais; mitigar com diff transacional, allowlist e sequência de merge.
- **Rollback:** reverter mudanças de contrato/mapper sem apagar dados; restaurar snapshot de vínculos somente em transação de homologação.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está habilitado em `.aiox-core/core-config.yaml`; revisão manual pelo `@architect`.

### Story Type Analysis

- **Primary Type:** API/Full-stack
- **Secondary Type(s):** Database N:N, Validação, Frontend
- **Complexity:** Alta

### Manual review focus

- Sincronização N:N atômica e proteção dos campos derivados.
- Validações server-side de preço/capacidade/URL e ausência de funcionalidades fora do escopo.

## Story Draft Checklist — @sm

| Categoria                         | Resultado | Evidência                                                         |
| --------------------------------- | --------- | ----------------------------------------------------------------- |
| Goal & Context Clarity            | PASS      | Cada divergência de catálogo/lead/instrutor/turma tem valor e AC. |
| Technical Implementation Guidance | PASS      | Arquivos, tabelas e contratos envolvidos identificados.           |
| Reference Effectiveness           | PASS      | FRs/NFRs e fontes concretas resumidos.                            |
| Self-Containment                  | PASS      | Proibições, riscos, rollback e edge cases explícitos.             |
| Testing Guidance                  | PASS      | Unitário, SQL, contrato, E2E e regressão pública definidos.       |
| CodeRabbit Integration            | N/A       | Integração desabilitada no core config.                           |

## Change Log

### Validação PO — 2026-07-24

**GO — 10/10.** Story fecha os campos de catálogo, leads, instrutores e turmas sem inventar Storage ou relações novas; ACs cobrem N:N, validação server-side, derivados, URL e regressão pública. Quality gate arquitetural permanece obrigatório.

| Date       | Version | Description                                                                               | Author        |
| ---------- | ------: | ----------------------------------------------------------------------------------------- | ------------- |
| 2026-07-24 |     0.1 | Draft criado a partir do diagnóstico de catálogo, leads, instrutores e turmas da Epic 19. | `@sm` (River) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-24-epic19-story5-catalogo-leads-instrutores-turmas.md`

### Arquivos previstos para implementação (a confirmar pelo executor)

- `src/lib/admin-resource-configs.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- `src/lib/app-store.tsx`
- `supabase/functions/admin-resources/index.ts`
- `supabase/functions/_shared/admin-validation.ts`
- `supabase/functions/_shared/admin-mappers.ts`
- Migrations/testes SQL somente se necessários ao uso do schema vigente
