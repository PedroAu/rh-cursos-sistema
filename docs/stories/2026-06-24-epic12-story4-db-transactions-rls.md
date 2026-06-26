# Story EP-12.4: Testes transacionais de banco e RLS

## Status
Approved

> Validação PO concluída em 2026-06-25: **GO (8.5/10)** após refinamento.
> Foram corrigidas as referências de banco, separadas as estratégias pgTAP e
> concorrência multi-conexão, e definidos cenários negativos de RLS.

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

- [ ] **AC1** — Casos de inscrição duplicada/concorrente têm teste automatizado
- [ ] **AC2** — Falhas transacionais relevantes demonstram rollback correto
- [ ] **AC3** — Políticas RLS críticas têm role emulation mínima automatizada
- [ ] **AC4** — Achados relevantes ficam ligados à documentação/auditoria de banco

## Scope

### In Scope
- Testes de transação
- Role emulation/RLS
- Integração com RPCs/operations críticas

### Out of Scope
- Otimização de performance ampla
- Novos índices ou redesign de schema

## Tasks / Subtasks

- [ ] Preparar a suíte de banco no Supabase local (AC: 1, 2, 3, 4)
  - [ ] Criar specs SQL em `supabase/tests/database/`.
  - [ ] Usar `begin`, `plan`, `finish` e `rollback` para isolamento pgTAP.
  - [ ] Confirmar execução com `npx supabase test db --local`.
- [ ] Validar duplicidade e concorrência de inscrição (AC: 1)
  - [ ] Confirmar a proteção do índice parcial `inscricao_aluno_turma_active_idx`.
  - [ ] Testar rejeição de segunda inscrição ativa para o mesmo aluno/turma.
  - [ ] Executar o cenário concorrente com duas conexões/clientes independentes; chamadas sequenciais não satisfazem o requisito de concorrência.
  - [ ] Confirmar uma única inscrição ativa e incremento consistente de vagas.
- [ ] Validar rollback da RPC de inscrição (AC: 2)
  - [ ] Forçar falha após alteração intermediária possível e confirmar que aluno, inscrição e vagas permanecem no estado anterior.
  - [ ] Cobrir ao menos o erro de duplicidade da `registrar_inscricao_publica`, verificando que updates anteriores da mesma transação não persistem.
- [ ] Validar RLS por role emulation (AC: 3)
  - [ ] Usar `set local role authenticated` e claims JWT locais para representar usuários distintos.
  - [ ] Confirmar que student lê somente os próprios registros.
  - [ ] Confirmar que usuário comum não lê leads/inscrições alheias nem executa mutações administrativas.
  - [ ] Confirmar que admin acessa os recursos previstos e que anon permanece bloqueado fora das operações públicas.
- [ ] Reconciliar evidência com auditorias e CI (AC: 4)
  - [ ] Atualizar `docs/database/DB-AUDIT.md` somente com resultados executados.
  - [ ] Adicionar comando de banco ao fluxo de qualidade sem substituir lint/typecheck/test.
  - [ ] Atualizar Dev Agent Record e File List.

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

- `supabase/tests/database/` (novas specs pgTAP)
- spec multi-conexão em `tests/` ou script dedicado, conforme implementação
- `package.json`, se for criado script `test:db`
- `.github/workflows/ci.yml`, se o gate de banco for incorporado ao CI
- `docs/database/DB-AUDIT.md`
- `docs/stories/2026-06-24-epic12-story4-db-transactions-rls.md`

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
