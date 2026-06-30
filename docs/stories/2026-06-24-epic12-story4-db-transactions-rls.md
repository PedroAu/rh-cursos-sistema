# Story EP-12.4: Testes transacionais de banco e RLS

## Status
Done

> Validação PO concluída em 2026-06-25: **GO (8.5/10)**. QA gate realizado em 2026-06-30: **PASS**.
> pgTAP suite e race tests implementados, DB-AUDIT reconciliado, todos os ACs cobertos, ready para merge.

## Executor Assignment

executor: "@data-engineer"  
quality_gate: "@dev"  
quality_gate_tools:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- targeted DB/RLS tests

## Épica
EP-12 — Integration Test Suite  
Spec: `docs/epics/epic-12-integration-test-suite.md`

## Story

**As a** responsável pela integridade de dados,  
**I want** testes para duplicidade, concorrência, rollback e RLS,  
**so that** a camada de banco prove os casos críticos que a UI não consegue garantir sozinha.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: N/A por configuração do projeto
>
> `.aiox-core/core-config.yaml` não define `coderabbit_integration.enabled`.
> Aplicam-se revisão manual e os quality gates declarados nesta story.

## Contexto

Hoje não há evidência automatizada para concorrência de inscrição, rollback em falha parcial, nem role emulation de RLS, apesar de esses riscos já aparecerem em auditorias de banco.

## Acceptance Criteria

- [x] **AC1** — Casos de inscrição duplicada/concorrente têm teste automatizado
- [x] **AC2** — Falhas transacionais relevantes demonstram rollback correto
- [x] **AC3** — Políticas RLS críticas têm role emulation mínima automatizada
- [x] **AC4** — Achados relevantes ficam ligados à documentação/auditoria de banco

## Scope

### In Scope
- Testes de transação
- Role emulation/RLS
- Integração com RPCs/operations críticas

### Out of Scope
- Otimização de performance ampla
- Novos índices ou redesign de schema

## Tasks / Subtasks

- [x] Preparar a suíte de banco no Supabase local (AC: 1, 2, 3, 4)
  - [x] Criar specs SQL em `supabase/tests/database/`.
  - [x] Usar `begin`, `plan`, `finish` e `rollback` para isolamento pgTAP.
  - [x] Confirmar execução com `npx supabase test db --local`.
- [x] Validar duplicidade e concorrência de inscrição (AC: 1)
  - [x] Confirmar a proteção do índice parcial `inscricao_aluno_turma_active_idx`.
  - [x] Testar rejeição de segunda inscrição ativa para o mesmo aluno/turma.
  - [x] Executar o cenário concorrente com duas conexões/clientes independentes; chamadas sequenciais não satisfazem o requisito de concorrência.
  - [x] Confirmar uma única inscrição ativa e incremento consistente de vagas.
- [x] Validar rollback da RPC de inscrição (AC: 2)
  - [x] Forçar falha após alteração intermediária possível e confirmar que aluno, inscrição e vagas permanecem no estado anterior.
  - [x] Cobrir ao menos o erro de duplicidade da `registrar_inscricao_publica`, verificando que updates anteriores da mesma transação não persistem.
- [x] Validar RLS por role emulation (AC: 3)
  - [x] Usar `set local role authenticated` e claims JWT locais para representar usuários distintos.
  - [x] Confirmar que student lê somente os próprios registros.
  - [x] Confirmar que usuário comum não lê leads/inscrições alheias nem executa mutações administrativas.
  - [x] Confirmar que admin acessa os recursos previstos e que anon permanece bloqueado fora das operações públicas.
- [x] Reconciliar evidência com auditorias e CI (AC: 4)
  - [x] Atualizar `docs/database/DB-AUDIT.md` somente com resultados executados.
  - [x] Adicionar comando de banco ao fluxo de qualidade sem substituir lint/typecheck/test.
  - [x] Atualizar Dev Agent Record e File List.

## Dependencies

- `docs/database/DB-AUDIT.md`
- `docs/database/SCHEMA.md`
- `supabase/config.toml`
- `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`
- `supabase/migrations/20260513100000_sprint1_security.sql`
- `supabase/migrations/20260513200000_sprint2_integrity.sql`
- `supabase/migrations/20260608100000_admin_audit_log.sql`
- `supabase/migrations/20260623144035_rbac_authorization_helpers.sql`
- `supabase/functions/enrollments/index.ts`
- `supabase/functions/admin-resources/index.ts`

## Dev Notes

- O banco local configurado em `supabase/config.toml` usa PostgreSQL 17 e
  migrations/seed habilitados.
- A CLI verificada durante a validação foi `2.108.0`; descobrir flags por
  `npx supabase test db --help` e não depender de sintaxe memorizada.
- O teste SQL oficial do Supabase usa pgTAP em
  `supabase/tests/database/*.test.sql`, com role emulation por
  `set local role authenticated` e claim `request.jwt.claim.sub`.
- A garantia de duplicidade deriva do índice parcial
  `inscricao_aluno_turma_active_idx` e da RPC
  `registrar_inscricao_publica` definida/refinada nas migrations listadas.
- A concorrência requer duas sessões reais. O pgTAP cobre integridade,
  rollback e RLS; o race test pode usar uma spec Node dedicada desde que abra
  duas conexões/clientes independentes contra o Supabase local.
- Não executar testes destrutivos contra produção. Dados de teste devem ser
  isolados e toda chave privilegiada deve permanecer fora do browser/logs.
- Testar casos negativos é obrigatório: RLS não está validada apenas porque o
  caso autorizado funciona.

## Testing

- Local stack:
  - `npx supabase start`
  - `npx supabase db reset --local`
- Banco/RLS:
  - `npx supabase test db --local supabase/tests/database`
- Concorrência:
  - executar a spec multi-conexão definida pela implementação contra o Supabase local
- Quality gates:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`

## File List

- `supabase/tests/database/ep12-transactions-rls.test.sql`
- `scripts/test-db-concurrency.mjs`
- `scripts/test-db.mjs`
- `package.json`
- `.github/workflows/ci.yml`
- `docs/database/DB-AUDIT.md`
- `docs/stories/2026-06-24-epic12-story4-db-transactions-rls.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm run test:db` — passed
- `npm run lint` — passed
- `npm run typecheck` — passed
- `npm run test:unit` — passed
- `npm test` — passed

### Completion Notes List

- Added a pgTAP suite for duplicate enrollment rejection, transactional rollback evidence, and RLS role emulation.
- Added a multi-connection race test that proves only one active enrollment survives under concurrent calls.
- Added a reproducible `npm run test:db` wrapper and CI job that start only the local Postgres service required for database verification.
- Reconciled `docs/database/DB-AUDIT.md` with the executed evidence produced in this story.

## Validação PO

### Resultado

- **Decisão:** GO
- **Implementation Readiness Score:** 8.5/10
- **Confiança:** Média-alta

### Evidências e ressalvas

- Executor `@data-engineer` e quality gate `@dev` são válidos e distintos.
- As referências anteriores de rate limit não sustentavam os ACs
  transacionais; foram substituídas pelas migrations de schema, RLS,
  integridade e auditoria relevantes.
- pgTAP é adequado para RLS/rollback, mas não substitui o teste concorrente
  com duas sessões.
- O relatório `DB-AUDIT.md` contém afirmações históricas não automatizadas;
  esta story deve produzir evidência executável antes de atualizá-las.

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para fechar a lacuna mais fraca da evidência atual: transações e RLS reais.
- 2026-06-25 — @po (Pax) — Validação GO 8.5/10; corrigidas dependências, definidos pgTAP, role emulation, rollback e concorrência multi-conexão.
- 2026-06-26 — @dev (Codex/Orion) — Suite pgTAP e teste concorrente implementados; `test:db`, `lint`, `typecheck`, `test:unit` e `npm test` verdes; status promovido para `Ready for Review`.
