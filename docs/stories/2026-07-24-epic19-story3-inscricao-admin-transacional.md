# Story 19.3: Implementar inscrição administrativa transacional

## Status

Draft

## Executor Assignment

```yaml
executor: "@data-engineer"
quality_gate: "@dev"
quality_gate_tools: [schema_validation, migration_review, rls_test]
assignment_basis: "executor-assignment: database"
```

## Épica e rastreabilidade

- **Épica:** [Épica 19 — Integridade dos Contratos dos Formulários Administrativos](../epics/epic-19-integridade-contratos-formularios-admin.md)
- **Prioridade:** P1
- **Tipo:** brownfield de banco, RPC e integração full-stack
- **Dependência:** Story 19.2; pode executar em paralelo com 19.4 e 19.5 após a fundação.
- **Bloqueia:** Story 19.6; restauração do pagamento no frontend só ocorre no mesmo release desta operação.

## Story

**As a** administrador,
**I want** criar uma inscrição por uma operação administrativa própria, atômica e canônica,
**so that** aluno, vaga, pagamento, status e identidade da inscrição não divirjam depois do reload.

## Contexto e valor

A inscrição admin reutiliza a RPC de pré-inscrição pública, cuja semântica é `Pendente` e sem pagamento, enquanto o AppStore mostra `Confirmada` antes do reload e confunde `codigo_confirmacao` com `inscricao.id`. REC-105 e REC-106 devem ser preservados. D19-05 exige uma operação/RPC administrativa transacional isolada, sem gateway ou confirmação automática.

## Acceptance Criteria

1. Existe operação/migration/RPC administrativa própria, idempotente e transacional; a RPC pública `registrar_inscricao_publica` permanece semanticamente inalterada.
2. A operação persiste `forma_pagamento`, `tipo_inscricao`, `observacoes`, `turma_id` e status permitido pelo contrato administrativo; pagamento não é tratado como confirmado automaticamente.
3. O retorno expõe `inscricao.id` e `codigo_confirmacao` como propriedades distintas e o consumidor usa cada uma para sua finalidade.
4. Reserva de vaga, criação/reuso de aluno e criação de inscrição acontecem atomicamente; concorrência na última vaga não produz overbooking ou estado parcial.
5. Aluno existente localizado por e-mail é reutilizado sem sobrescrever CPF, telefone, cargo, tipo ou outro PII ausente do payload.
6. O formulário só volta a exibir/enviar pagamento quando a operação admin e seu consumidor canônico estiverem disponíveis no mesmo release; antes disso permanece oculto/desabilitado.
7. Testes de banco cobrem idempotência, capacidade concorrente, rollback, PII e regressão da pré-inscrição pública; lint/typecheck e testes afetados passam.

## Tasks / Subtasks

- [ ] Modelar o contrato administrativo e revisar a migration/schema vigente (AC: 1, 2, 3).
- [ ] Criar operação transacional aditiva, com reserva de vaga e rollback completo (AC: 1, 4).
- [ ] Implementar retorno canônico distinto para ID e código de confirmação (AC: 3).
- [ ] Reusar aluno por e-mail com update parcial seguro e sem apagar PII (AC: 5).
- [ ] Integrar dispatcher/AppStore e liberar o campo de pagamento apenas no mesmo cutover (AC: 6).
- [ ] Criar testes pgTAP/concorrência e regressão da RPC pública (AC: 4, 7).

## Dev Notes

### Fontes verificadas

- Epic 19, FR-19.06–FR-19.12, FR-19.21 e NFR-19.02–NFR-19.05.
- Migrations REC-105/REC-106 e schema Supabase vigente; a Epic 19 determina que a pré-inscrição pública permaneça inalterada.
- `supabase/functions/admin-resources/index.ts`, `_shared/admin-validation.ts`, `_shared/admin-mappers.ts`, `src/lib/app-store.tsx` e `src/views/admin/AdminResourcePage.tsx` são consumidores a integrar.

### Proibições

- Não reutilizar a semântica pública, não alterar a RPC pública e não criar gateway, conciliação ou status `Pago` automático.
- Não apagar aluno, inscrição, auditoria ou PII em rollback.
- Respeitar sessão SSR, autorização fail-closed, rate limit e RLS/grants.

## Testing

- Testes SQL em `supabase/tests/database/` para persistência, rollback, duplicidade e concorrência de última vaga.
- Testes de contrato do dispatcher e AppStore para ID/código/status/pagamento.
- Regressão de `src/__tests__/views/public/pre-enrollment.test.tsx` e testes de lead/inscrição públicos.
- Executar `npm run test:db`, lint e typecheck no mesmo SHA.

## Dependências, riscos e rollback

- **Dependências:** 19.2; REC-105/REC-106 e grants/RLS vigentes.
- **Riscos:** alterar semântica pública, overbooking ou dupla confirmação visual; mitigar com RPC aditiva, testes concorrentes e resposta canônica.
- **Rollback:** revogar/remover apenas a nova operação e repontar consumidor, sem tocar na RPC pública ou apagar dados.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está habilitado em `.aiox-core/core-config.yaml`; revisão manual pelo `@dev`.

### Story Type Analysis

- **Primary Type:** Database/Transação
- **Secondary Type(s):** API, Segurança, Concorrência
- **Complexity:** Alta

### Manual review focus

- Atomicidade real e comportamento sob última vaga/duplicidade.
- Separação inequívoca da RPC pública e proteção de PII.

## Story Draft Checklist — @sm

| Categoria                         | Resultado | Evidência                                                           |
| --------------------------------- | --------- | ------------------------------------------------------------------- |
| Goal & Context Clarity            | PASS      | Problema de inscrição, valor e dependências REC-105/106 explícitos. |
| Technical Implementation Guidance | PASS      | Migrations, RPC, dispatcher, AppStore e fontes indicados.           |
| Reference Effectiveness           | PASS      | FRs, NFRs e decisões D19-02/D19-05 resumidas.                       |
| Self-Containment                  | PASS      | Proibições, rollback e cenários transacionais incluídos.            |
| Testing Guidance                  | PASS      | Banco, concorrência, PII, regressão pública e gates definidos.      |
| CodeRabbit Integration            | N/A       | Integração desabilitada no core config.                             |

## Change Log

| Date       | Version | Description                                                            | Author        |
| ---------- | ------: | ---------------------------------------------------------------------- | ------------- |
| 2026-07-24 |     0.1 | Draft criado a partir do diagnóstico de inscrição e FR-19.09–FR-19.12. | `@sm` (River) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-24-epic19-story3-inscricao-admin-transacional.md`

### Arquivos previstos para implementação (a confirmar pelo executor)

- `supabase/migrations/{timestamp}_admin_enrollment.sql`
- `supabase/functions/admin-resources/index.ts`
- `supabase/functions/_shared/admin-validation.ts`
- `supabase/functions/_shared/admin-mappers.ts`
- `src/lib/app-store.tsx`
- `src/views/admin/AdminResourcePage.tsx`
- `supabase/tests/database/` e testes de contrato correspondentes
