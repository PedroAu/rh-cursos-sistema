# Story 19.2: Estabelecer contratos canônicos de mutação administrativa

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
- **Tipo:** brownfield de API, validação e estado full-stack
- **Dependência:** Story 19.1 concluída; preserva BFF same-origin, sessão SSR, autorização fail-closed e RLS existentes.
- **Habilita:** Stories 19.3, 19.4 e 19.5; é a fundação contratual obrigatória.

## Story

**As a** administrador e consumidor do AppStore,
**I want** DTOs allowlist e respostas canônicas para cada mutação administrativa,
**so that** o registro aplicado no banco seja exatamente o registro que a interface reconcilia após salvar.

## Contexto e valor

O dispatcher `admin-resources` recebe objetos genéricos, os schemas Zod fazem parse mas o handler continua usando o payload bruto, e o AppStore fabrica IDs/status/timestamps em alguns caminhos. D19-02 e D19-03 exigem que o backend seja a autoridade de mutação, com contratos separados de create/update e resposta do registro persistido.

## Acceptance Criteria

1. Cursos, turmas, alunos, inscrições, leads, instrutores e blog possuem contratos administrativos separados de create/update, com allowlist explícita e sem campos derivados/gerenciados por trigger.
2. O handler usa exclusivamente o objeto produzido por `schema.parse`/`safeParse`; nenhum payload bruto ou transformação descartada chega ao mapper/RPC.
3. Campos desconhecidos são rejeitados ou descartados conforme contrato documentado, com teste para cada comportamento; campos como `total_alunos`, ratings, capacidade derivada, slug e timestamps não podem ser alterados por DTO comum.
4. Create/update retorna a projeção canônica persistida, com ID real, status e timestamps retornados pela autoridade server-side.
5. O AppStore substitui/insere exatamente a resposta canônica e não fabrica `Date.now()`, ID, status ou timestamp de sucesso.
6. Falhas 4xx/5xx/timeout preservam formulário aberto, valores digitados e erros por campo; não há estado otimista que declare persistência.
7. Contratos e testes não alteram a semântica das jornadas públicas; lint, typecheck e testes unitários/contratuais afetados passam.

## Tasks / Subtasks

- [x] Inventariar schemas, mappers, dispatcher e consumidores atuais por recurso (AC: 1, 3).
- [x] Definir DTOs allowlist de create/update e respostas canônicas, excluindo campos derivados (AC: 1, 3, 4).
- [x] Encaminhar o objeto validado ao mapper/RPC e normalizar erros de validação (AC: 2, 6).
- [x] Ajustar AppStore e página genérica para reconciliar somente a resposta persistida (AC: 4, 5, 6).
- [x] Criar testes unitários/contratuais para transforms Zod, unknown fields, respostas e falhas (AC: 2–7).
- [x] Solicitar revisão arquitetural antes do handoff das stories dependentes.

## Dev Notes

### Fontes verificadas

- Epic 19, FR-19.01–FR-19.05 e FR-19.13; decisões D19-02 e D19-03.
- `supabase/functions/admin-resources/index.ts`, `supabase/functions/_shared/admin-validation.ts` e `supabase/functions/_shared/admin-mappers.ts` são a cadeia server-side observada.
- Consumidores centrais: `src/lib/app-store.tsx`, `src/lib/admin-resource-configs.tsx` e `src/views/admin/AdminResourcePage.tsx`.

### Regras de compatibilidade

- Preservar BFF same-origin, sessão SSR, autorização, RLS/grants e soft-delete vigentes.
- Não reescrever integralmente o AppStore/dispatcher; alterar os caminhos necessários para contratos canônicos.
- Não incluir `featuredCourseIds` ou `enrollmentStatus`; a contenção é definida na Story 19.1.

## Testing

- Unitários em `src/__tests__/lib/admin-mappers.test.ts`, `src/__tests__/lib/admin-resource-configs.test.ts`, `src/__tests__/lib/app-store.test.ts` e testes equivalentes sob `supabase/functions`.
- Testar parse transformado, unknown/derived fields, resposta com ID real, erro 4xx/5xx/timeout e preservação do formulário.
- Rodar lint, typecheck e suíte contratual existente sem regressão pública.

## Dependências, riscos e rollback

- **Dependências:** 19.1; contratos/read models e segurança das Épicas 10 e 17.
- **Riscos:** consumidores legados esperarem payload bruto ou ID fabricado; localizar consumidores antes da remoção e manter rollout aditivo até migração.
- **Rollback:** capability gate/compatibilidade aditiva pode repontar temporariamente ao handler anterior; não reintroduzir campos derivados como editáveis.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está habilitado em `.aiox-core/core-config.yaml`; revisão manual por `@architect`.

### Story Type Analysis

- **Primary Type:** API/Contratos
- **Secondary Type(s):** Frontend, Arquitetura
- **Complexity:** Alta

### Manual review focus

- DTOs realmente allowlist, parse aplicado e resposta canônica sem objetos fabricados.
- Compatibilidade aditiva e preservação de erros/formulário.

## Story Draft Checklist — @sm

| Categoria                         | Resultado | Evidência                                                    |
| --------------------------------- | --------- | ------------------------------------------------------------ |
| Goal & Context Clarity            | PASS      | Contratos, autoridade server-side e valor definidos.         |
| Technical Implementation Guidance | PASS      | Dispatcher, validação, mappers e AppStore identificados.     |
| Reference Effectiveness           | PASS      | FRs/D19 e caminhos de código resumidos.                      |
| Self-Containment                  | PASS      | Campos proibidos, compatibilidade e rollback explícitos.     |
| Testing Guidance                  | PASS      | Cenários de parse, contrato, erro e reconciliação definidos. |
| CodeRabbit Integration            | N/A       | Integração desabilitada no core config.                      |

## Change Log

### Validação PO — 2026-07-24

**GO — 10/10.** Story autocontida, com DTOs allowlist, parse efetivo, resposta canônica, reconciliação do AppStore e regressão pública explicitamente testáveis. A revisão técnica do `@architect` é gate obrigatório antes da implementação.

| Date       | Version | Description                                                             | Author        |
| ---------- | ------: | ----------------------------------------------------------------------- | ------------- |
| 2026-07-24 |     0.1 | Draft criado a partir das seções 4.2, 5 e FR-19.01–FR-19.05 da Epic 19. | `@sm` (River) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-24-epic19-story2-contratos-canonicos-admin.md`

### Arquivos previstos para implementação (a confirmar pelo executor)

- `supabase/functions/admin-resources/index.ts`
- `supabase/functions/_shared/admin-validation.ts`
- `supabase/functions/_shared/admin-mappers.ts`
- `src/lib/app-store.tsx`
- `src/lib/admin-resource-configs.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- Testes unitários/contratuais correspondentes
