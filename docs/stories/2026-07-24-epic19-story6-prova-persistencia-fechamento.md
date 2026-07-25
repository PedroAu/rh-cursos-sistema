# Story 19.6: Provar persistência campo a campo e fechar a Epic 19

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
- **Tipo:** brownfield de testes de contrato, E2E e documentação
- **Dependência:** Stories 19.3, 19.4 e 19.5 integradas; 19.1/19.2 são pré-requisitos indiretos.
- **Gate final:** `@qa` emite PASS/CONCERNS/FAIL antes de Done; `@po` aprova a transição da épica.

## Story

**As a** responsável pela qualidade do painel administrativo,
**I want** uma matriz executável UI → payload → banco → reload para todos os campos expostos,
**so that** a Epic 19 seja fechada com evidência reprodutível e sem divergência silenciosa.

## Contexto e valor

O objetivo da épica só é alcançado quando o estado após salvar é igual ao estado depois de recarregar e consultar o banco. Esta story consolida testes de todas as frentes, negativos para controles removidos e payloads parciais, regressão pública e documentação dos contratos efetivos. Não cria novo comportamento; prova e documenta o que 19.1–19.5 entregaram.

## Acceptance Criteria

1. Existe matriz executável cobrindo campos editáveis de Cursos, Turmas, Alunos, Leads, Inscrições, Instrutores e Blog, com origem UI, payload/DTO, destino de banco/read model e transformação documentada.
2. Cada cenário crítico executa criar → consultar banco/read model → reload → editar → consultar novamente, comparando valores canônicos antes/depois.
3. Testes negativos provam ausência de `featuredCourseIds`, `enrollmentStatus`, controles de Configurações e demais campos contidos; payload omitido não apaga PII.
4. Inscrição admin comprova ID/status/pagamento/código coerentes após reload, sem regressão da pré-inscrição pública e sem confirmação automática de pagamento.
5. Aluno sem inscrição, vínculos de instrutor, edição de lead, duração/preço/capacidade e campos derivados de curso/turma possuem evidência de persistência/recusa conforme as stories anteriores.
6. Contrato/documentação administrativa e OpenAPI/drift refletem os DTOs e respostas efetivos, sem inventar endpoints ou funcionalidades fora do escopo.
7. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run docs:api:check-drift` e testes de banco/E2E administrativos passam no mesmo SHA, ou qualquer exceção é um bloqueio explícito para o gate.
8. `@qa` revisa a matriz e evidências e emite verdict consolidado PASS/CONCERNS/FAIL; a story não é marcada Done sem PASS ou waiver formal do `@po`.

## Tasks / Subtasks

- [x] Inventariar campos efetivamente expostos após 19.1–19.5 e publicar matriz UI → payload → banco → reload (AC: 1).
- [x] Implementar/ajustar testes de contrato, banco e E2E por recurso, incluindo cenários negativos (AC: 2–5).
- [x] Executar regressão pública de lead/pré-inscrição e verificar segurança, RLS, audit log e ausência de PII nos erros (AC: 4, 7).
- [x] Atualizar documentação/API e executar anti-drift (AC: 6, 7).
- [x] Consolidar evidências, solicitar revisão arquitetural e handoff ao `@qa` (AC: 7, 8).
- [x] Registrar bloqueios, waivers e decisão final do `@po`; não inventar sucesso por teste não executado.

## Dev Notes

### Fontes verificadas

- Epic 19, FR-19.01–FR-19.24, NFR-19.01–NFR-19.09, seções 12, 16 e 17.
- Testes existentes: `tests/admin-crud.spec.ts`, `tests/api-contract.spec.ts`, `tests/public-journeys.spec.ts`, `src/__tests__/lib/admin-read-models.test.ts`, `src/__tests__/lib/app-store.test.ts` e `supabase/tests/database/`.
- Scripts de gates: `scripts/check-openapi-drift.mjs`, `scripts/test-db.mjs` e `scripts/run-playwright-test-build.mjs`.

### Critério de fechamento

- A matriz deve distinguir campo persistido, derivado/readonly e local deliberado.
- Erros, timeouts e cenários de rollback devem preservar valores do formulário e não alegar sucesso.
- Nenhum teste pode usar PII real ou alterar jornadas públicas por inferência.

## Testing

- Unitário/contrato para DTOs, transforms, mappers e resposta canônica.
- Banco/pgTAP e concorrência para inscrição, capacidade e N:N.
- E2E administrativo com reload e consulta ao banco/read model; regressão pública de lead/pré-inscrição.
- Gates completos no mesmo SHA: lint, typecheck, testes, build, anti-drift e `npm run devops:all` conforme autoridade do `@devops`.

## Dependências, riscos e rollback

- **Dependências:** 19.3, 19.4 e 19.5 concluídas logicamente e arquivos centrais reconciliados.
- **Riscos:** cobertura falsa, drift documental ou concorrência de ownership; mitigar com matriz rastreável, execução no mesmo SHA e verdict independente.
- **Rollback:** testes/documentação são reversíveis; não remover evidência, não apagar dados e não fechar a épica quando um gate estiver bloqueado.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está habilitado em `.aiox-core/core-config.yaml`; revisão manual por `@architect` e gate independente de `@qa`.

### Story Type Analysis

- **Primary Type:** Testes de integração/E2E
- **Secondary Type(s):** Contratos, Documentação, Qualidade
- **Complexity:** Alta

### Manual review focus

- Matriz cobre 100% dos campos expostos e consulta estado persistido, não apenas mocks.
- Evidências do mesmo SHA, regressão pública e ausência de PII/estado otimista falso.

## Story Draft Checklist — @sm

| Categoria                         | Resultado | Evidência                                              |
| --------------------------------- | --------- | ------------------------------------------------------ |
| Goal & Context Clarity            | PASS      | Objetivo de prova e gate final estão explícitos.       |
| Technical Implementation Guidance | PASS      | Suítes, scripts, matriz e outputs identificados.       |
| Reference Effectiveness           | PASS      | FR/NFR e paths de testes/documentação resumidos.       |
| Self-Containment                  | PASS      | Critérios, bloqueios, rollback e waiver definidos.     |
| Testing Guidance                  | PASS      | Fluxos campo→banco→reload e gates completos definidos. |
| CodeRabbit Integration            | N/A       | Integração desabilitada no core config.                |

## Change Log

### Validação PO — 2026-07-24

**GO — 10/10.** Story fornece o fechamento executável da épica: matriz campo→payload→banco→reload, testes positivos/negativos, regressão pública, drift e gates no mesmo SHA. Não pode ser iniciada antes das Stories 19.3–19.5 integradas e exige verdict final do `@qa`.

| Date       | Version | Description                                                    | Author        |
| ---------- | ------: | -------------------------------------------------------------- | ------------- |
| 2026-07-24 |     0.1 | Draft criado a partir das seções 12, 16, 17 e 19.6 da Epic 19. | `@sm` (River) |

## File List

## QA Results

- **Gate:** PASS 10/10 — [gate final Epic 19](../qa/gates/epic-19-integridade-contratos-formularios-admin.yml).
- **Evidências:** `npm test` 180/180; `npm run test:unit` 767/767; `npm run test:db` 113/113; OpenAPI drift 16/16; lint, typecheck, build e `git diff --check` aprovados.
- **Deploy de teste:** `admin-resources` e migrations Epic 19 aplicados em `hwpsrujkxjhmmwphqdlz` antes da execução E2E.
- **Resultado:** sem gaps de AC, sem waiver e sem issues abertas.

### Criado nesta preparação

- `docs/stories/2026-07-24-epic19-story6-prova-persistencia-fechamento.md`

### Arquivos previstos para implementação (a confirmar pelo executor)

- `tests/admin-crud.spec.ts`
- `tests/api-contract.spec.ts`
- `tests/public-journeys.spec.ts`
- `src/__tests__/lib/admin-read-models.test.ts`
- `src/__tests__/lib/app-store.test.ts`
- `supabase/tests/database/`
- `scripts/check-openapi-drift.mjs`
- Documentação/API administrativa afetada
