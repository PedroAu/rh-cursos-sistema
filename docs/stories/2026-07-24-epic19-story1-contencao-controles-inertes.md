# Story 19.1: Conter controles administrativos sem persistência

## Status

Done

## Executor Assignment

```yaml
executor: "@ux-design-expert"
quality_gate: "@dev"
quality_gate_tools: [accessibility_check, design_review, component_validation]
assignment_basis: "executor-assignment: ui_ux"
```

## Épica e rastreabilidade

- **Épica:** [Épica 19 — Integridade dos Contratos dos Formulários Administrativos](../epics/epic-19-integridade-contratos-formularios-admin.md)
- **Prioridade:** P1
- **Tipo:** brownfield de UI, acessibilidade e contenção de contrato
- **Dependência:** aprovação do `@po` da Epic 19; é a primeira entrega do sequenciamento.
- **Habilita:** Story 19.2, que passa a receber uma superfície de campos honesta.

## Story

**As a** administrador da RH Cursos,
**I want** que somente controles com efeito persistente permaneçam editáveis,
**so that** a interface não prometa salvamento que o backend ou o banco não executam.

## Contexto e valor

A auditoria da Epic 19 encontrou `featuredCourseIds`, `enrollmentStatus`, status de lead na criação, pagamento de inscrição, `courseIds` de instrutor, upload Data URL e ações de configurações em `localStorage` sem persistência sistêmica. A decisão D19-01 exige classificar cada controle como persistido, derivado/readonly ou deliberadamente local. Esta story faz apenas a contenção visual e de estado; não cria schema, Storage ou novas funcionalidades.

## Acceptance Criteria

1. A matriz de disposição da Epic 19 é aplicada: `featuredCourseIds` é removido; `enrollmentStatus` sai do formulário de aluno; status de lead na criação assume `Novo` sem seletor; pagamento de inscrição fica oculto/desabilitado; `courseIds` de instrutor fica readonly/oculto; upload Data URL deixa de ser oferecido; Configurações sai da navegação produtiva ou fica informativa sem ação de salvar.
2. Nenhum controle removido ou desabilitado consegue chegar ao payload por estado residual, valor default ou serialização do formulário.
3. Estados somente leitura exibem nome/contexto acessível, não recebem foco de edição e continuam navegáveis por teclado e leitores de tela.
4. A página de Configurações não declara persistência institucional ou de notificações; não há botão `Salvar alterações` que grave apenas em `localStorage`.
5. Campos contextuais readonly de inscrição continuam identificados como não editáveis e não são reenviados em mutações.
6. Testes de componente cobrem presença/ausência dos controles e pelo menos um cenário de payload sem estado residual para cada contenção.
7. A jornada pública de lead e pré-inscrição permanece sem alteração semântica; `npm run lint` e `npm run typecheck` passam.

## Tasks / Subtasks

- [x] Mapear cada controle afetado na configuração de recursos e nas páginas administrativas (AC: 1, 2).
  - [ ] Atualizar `FieldConfig`/renderização sem duplicar regras no componente.
  - [ ] Remover estados, defaults e serialização associados aos campos contidos.
- [x] Ajustar inscrições, alunos, leads e instrutores para os estados readonly/ocultos definidos pela matriz (AC: 1, 3, 5).
- [x] Retirar a ação produtiva de Configurações e revisar sua navegação/estado informativo (AC: 1, 4).
- [x] Criar/ajustar testes de componente e acessibilidade para controles removidos, readonly e payload (AC: 2, 3, 6).
- [x] Executar regressão pública e gates de lint/typecheck (AC: 7).

## Dev Notes

### Fontes verificadas

- Epic 19, decisões D19-01 e D19-06, matriz da seção 9 e FR-19.20–FR-19.24.
- Superfícies identificadas: `src/lib/admin-resource-configs.tsx`, `src/views/admin/AdminResourcePage.tsx`, `src/views/admin/AdminSettingsPage.tsx` e `src/lib/app-store.tsx`.
- Componentes e padrões Trust Keith da Epic 15 devem ser preservados; não há redesign amplo.

### Limites

- Não alterar schema, RPC, dispatcher ou comportamento público.
- Não reintroduzir `featuredCourseIds`, Storage, configurações globais ou notificações reais.
- O campo textual de foto e a edição de `courseIds` só serão restaurados quando a Story 19.5 entregar persistência real.

## Testing

- Testes unitários/componentes em `src/__tests__/views/`, `src/__tests__/lib/admin-resource-configs.test.ts` e/ou `src/__tests__/views/admin-resource-instructors-leads.test.tsx`, conforme os padrões existentes.
- Validar foco, nome acessível, teclado e ausência do campo no payload.
- Rodar `npm run lint`, `npm run typecheck` e regressão pública afetada.

## Dependências, riscos e rollback

- **Dependências:** aprovação PO; componentes atuais de admin e contratos vigentes.
- **Riscos:** remover um controle legítimo ou deixar estado residual; mitigar com matriz explícita e testes negativos.
- **Rollback:** reversão isolada de UI, sem migration ou exclusão de dados; não restaurar controle inerte sem contrato aprovado.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está habilitado em `.aiox-core/core-config.yaml`; a revisão será manual pelo `@dev`.

### Story Type Analysis

- **Primary Type:** Frontend/UI
- **Secondary Type(s):** Acessibilidade, contratos de formulário
- **Complexity:** Média

### Manual review focus

- Ausência de estado residual no payload; sem sucesso visual enganoso.
- Compatibilidade com Trust Keith e navegação por teclado.

## Story Draft Checklist — @sm

| Categoria                         | Resultado | Evidência                                                      |
| --------------------------------- | --------- | -------------------------------------------------------------- |
| Goal & Context Clarity            | PASS      | Contenções e valor estão ligados à D19-01 e FR-19.20–FR-19.24. |
| Technical Implementation Guidance | PASS      | Arquivos de configuração/páginas e limites estão indicados.    |
| Reference Effectiveness           | PASS      | Epic 19 e fontes concretas resumidas.                          |
| Self-Containment                  | PASS      | Matriz, proibições, riscos e rollback estão nesta story.       |
| Testing Guidance                  | PASS      | Componentes, acessibilidade, payload e gates definidos.        |
| CodeRabbit Integration            | N/A       | Integração desabilitada no core config.                        |

## Change Log

### Validação PO — 2026-07-24

**GO — 10/10.** Story autocontida, rastreável à matriz D19-01/D19-06, com ACs testáveis, contenção sem alteração de schema e cobertura de acessibilidade/payload. Quality gate do `@dev` permanece obrigatório.

| Date       | Version | Description                                                              | Author        |
| ---------- | ------: | ------------------------------------------------------------------------ | ------------- |
| 2026-07-24 |     0.1 | Draft criado a partir da seção 10.1 e decisões D19-01/D19-06 da Epic 19. | `@sm` (River) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-24-epic19-story1-contencao-controles-inertes.md`

### Arquivos previstos para implementação (a confirmar pelo executor)

- `src/lib/admin-resource-configs.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- `src/views/admin/AdminSettingsPage.tsx`
- `src/lib/app-store.tsx`
- Testes existentes sob `src/__tests__/views/` e `src/__tests__/lib/`
