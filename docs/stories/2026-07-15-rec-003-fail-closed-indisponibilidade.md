# Story REC-003: Ativar indisponibilidade fail-closed quando necessário

## Status

Ready

## Executor Assignment

executor: "@devops" (controle operacional) + "@dev" (guarda mínima de código quando necessária)
quality_gate: "@qa"
quality_gate_tools:
- teste negativo de rota administrativa e de write público durante lockdown simulado
- inspeção da configuração de ambiente por ambiente (frontend implantado, Edge Functions)
- verificação de que o kill-switch é reversível e auditável
- revisão do relatório de decisão fail-closed sem segredo ou PII

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 0 — Contenção SEV-0
- **Prioridade:** P0 / SEV-0
- **Estimativa:** S–M
- **Findings:** FND-03, FND-04, FND-09 (fail-closed geral da contenção)
- **Requisitos:** NFR-04 (fail-closed)
- **Gate relacionado:** G0 — Incidente contido

## Story

**As a** coordenador do incidente da RH Cursos,
**I want** um mecanismo verificável para bloquear rotas administrativas e writes públicos sensíveis quando a rotação de REC-002 não puder ser comprovada em algum ambiente,
**so that** a aplicação nunca opere em estado misto (credencial parcialmente rotacionada) sem que isso seja uma decisão explícita e reversível.

## Contexto e valor

REC-002 rotaciona credenciais e o `AUTH_SESSION_SECRET` em todos os ambientes consumidores simultaneamente. Quando isso não for possível — por exemplo, um ambiente não puder ser atualizado no mesmo checkpoint — a Épica 17 exige que o incident commander registre `NO-GO` e bloqueie o ambiente afetado em vez de aceitar operação parcial. Hoje, `getSessionSecret()` (`src/lib/auth.ts`) e a verificação equivalente em `supabase/functions/_shared/auth.ts` já falham (lançam exceção) quando `AUTH_SESSION_SECRET` está ausente ou tem menos de 32 caracteres em produção — um fail-closed parcial que esta story formaliza e estende para o cenário operacional do incidente: rotação não propagada, não apenas segredo ausente.

Esta story adiciona um controle operacional simples (kill-switch por ambiente) que o coordenador do incidente pode acionar deliberadamente, sem depender apenas do comportamento acidental de uma exceção de configuração.

## Escopo

### Incluído

- Definir e documentar um sinal de lockdown por ambiente (ex.: variável de ambiente dedicada, lida pelo backend/Edge Functions) que bloqueia rotas administrativas autenticadas e endpoints públicos de escrita (`enrollments`, `leads`) enquanto ativo.
- Implementar a guarda mínima de leitura desse sinal nos pontos de entrada server-side já existentes, sem introduzir nova superfície de autenticação.
- Definir o critério objetivo de ativação: rotação de REC-002 não comprovada em um ambiente até o checkpoint definido.
- Definir o critério objetivo e a autoridade de desativação: `@qa` + incident commander confirmam rotação propagada.
- Registrar cada ativação/desativação com timestamp, ambiente, motivo e responsável.
- Produzir evidência sanitizada para `@qa`.

### Fora do escopo

- Rotacionar credenciais: REC-002.
- Sanear configuração versionada ou histórico: REC-004, REC-005.
- Corrigir a autoridade de identidade (Supabase Auth) ou revogação confiável de sessão: REC-201 a REC-204.
- Endurecimento definitivo de endpoints públicos (schema estrito, idempotência, CAPTCHA): REC-107.
- Qualquer mudança de UI pública além do retorno de indisponibilidade.

## Acceptance Criteria

1. **Sinal de lockdown definido e documentado**
   Existe uma variável de ambiente (ou controle equivalente) por ambiente, com nome, escopo e efeito documentados, que quando ativa bloqueia rotas administrativas autenticadas e os endpoints públicos de escrita.

2. **Bloqueio efetivo quando ativo**
   **Given** o sinal de lockdown ativo em um ambiente,
   **when** uma requisição chega a uma rota administrativa autenticada ou a um endpoint público de escrita nesse ambiente,
   **then** a requisição é rejeitada com um código de erro claro (não um erro genérico de servidor), sem expor detalhe interno.

3. **Sem impacto quando inativo**
   **Given** o sinal de lockdown inativo,
   **when** as mesmas rotas recebem requisições legítimas,
   **then** o comportamento é idêntico ao existente antes desta story, sem regressão funcional.

4. **Critério objetivo de ativação**
   O registro descreve exatamente quando o lockdown deve ser ativado (rotação de REC-002 não comprovada em um ambiente no checkpoint definido) e não deixa a decisão implícita.

5. **Reversibilidade auditável**
   Toda ativação e desativação é registrada com timestamp, ambiente, motivo e responsável (incident commander e/ou `@qa`), permitindo reconstrução da linha do tempo.

6. **Sem bypass silencioso**
   Nenhuma rota sensível pode contornar o sinal de lockdown por um caminho alternativo (ex.: chamada direta a uma Edge Function que não verifica o sinal quando aplicável ao escopo desta story).

7. **Gate independente**
   `@qa` revisa a evidência, testa a ativação/desativação e emite PASS/CONCERNS/FAIL para REC-003.

## Tasks / Subtasks

- [ ] **Task 1 — Definir o contrato do sinal de lockdown** (AC: 1, 4)
  - [ ] Nomear a variável de ambiente e documentar onde é lida (frontend implantado, Edge Functions).
  - [ ] Documentar o critério objetivo de ativação a partir de REC-002.

- [ ] **Task 2 — Implementar a guarda mínima** (AC: 2, 3, 6)
  - [ ] Adicionar verificação do sinal nos pontos de entrada server-side de rotas administrativas autenticadas.
  - [ ] Adicionar verificação do sinal nos endpoints públicos de escrita (`supabase/functions/enrollments/index.ts`, `supabase/functions/leads/index.ts`).
  - [ ] Confirmar que o comportamento sem o sinal ativo permanece inalterado.

- [ ] **Task 3 — Definir autoridade de ativação/desativação** (AC: 4, 5)
  - [ ] Registrar quem pode ativar (incident commander/`@devops`) e quem confirma a desativação (`@qa` + incident commander).

- [ ] **Task 4 — Testar o ciclo completo** (AC: 2, 3, 5, 6)
  - [ ] Simular ativação e validar bloqueio nas rotas em escopo.
  - [ ] Simular desativação e validar retorno ao comportamento normal.
  - [ ] Verificar ausência de bypass nos caminhos testados.

- [ ] **Task 5 — Consolidar evidência e gate** (AC: 1–7)
  - [ ] Produzir relatório sanitizado em `docs/history/reports/rec-003-fail-closed-2026-07-15.md`.
  - [ ] Criar/atualizar `docs/qa/gates/rec-003-fail-closed-indisponibilidade.yml`.
  - [ ] Solicitar veredito de `@qa`.

## Dev Notes

### Fontes verificadas

- A Épica 17 define REC-003 como terceira story da Onda 0, dependente de REC-001, com entrega "rotas administrativas e writes públicos bloqueados se a rotação não estiver propagada". [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#onda-0--contenção-sev-0-t0-a-t2h`]
- NFR-04 exige que falha de configuração, autorização ou proteção antiabuso bloqueie operações sensíveis. [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#3-requisitos-do-programa`]
- `getSessionSecret()` em `src/lib/auth.ts` já lança exceção em produção quando `AUTH_SESSION_SECRET` está ausente ou tem menos de 32 caracteres; `supabase/functions/_shared/auth.ts` implementa a mesma verificação no lado das Edge Functions — comportamento fail-closed parcial existente que esta story estende.
- Os endpoints públicos de escrita atuais são `supabase/functions/enrollments/index.ts` (RPC `registrar_inscricao_publica`) e `supabase/functions/leads/index.ts` (insert em `public.lead`).
- REC-001 estabelece que fail-closed é a resposta padrão quando um controle de contenção não pode ser comprovado. [Fonte: `docs/stories/2026-07-14-rec-001-incidente-freeze-evidencias.md#acceptance-criteria`, item 7]

### Project Structure Notes

- A guarda de lockdown deve ser mínima e local aos pontos de entrada já existentes; não introduzir um novo serviço de autorização nesta story.
- Não modificar `.aiox-core/`, `bin/aiox.js` ou qualquer path L1/L2.
- Alterações de código ficam restritas aos pontos de entrada server-side identificados; nenhuma mudança de schema de banco é necessária para esta story.

### Ferramentas e execução segura

- Variável de ambiente lida em runtime, sem hardcode do valor no código.
- `git status --short` antes e depois da implementação para confirmar escopo restrito aos arquivos desta story.
- Teste manual controlado de ativação/desativação em ambiente não produtivo antes de validar em produção.

## Testing e evidências

- Teste positivo: sinal inativo, rota administrativa e endpoints públicos respondem normalmente.
- Teste negativo: sinal ativo, rota administrativa e endpoints públicos rejeitam a requisição com código de erro claro.
- Teste de reversibilidade: desativação restaura o comportamento normal sem exigir novo deploy de código.
- Verificação de ausência de bypass nos caminhos server-side cobertos pelo escopo desta story.

## Observabilidade

- Registrar cada ativação/desativação com timestamp absoluto, timezone `America/Sao_Paulo`/UTC, ambiente e responsável.
- Alertar o incident commander imediatamente quando o lockdown for ativado ou desativado.
- Não usar e-mail, telefone, token ou senha como label de log.
- Falha ao aplicar o lockdown em um ambiente aparece como lacuna explícita, nunca como PASS parcial.

## Security Notes

- O sinal de lockdown deve fail-closed por padrão em caso de erro de leitura da configuração (ou seja, erro de leitura bloqueia, não libera).
- Não introduzir um segredo novo nesta story; o sinal é um controle operacional, não uma credencial.
- A avaliação de indisponibilidade prolongada com impacto comercial pertence ao incident commander/stakeholder designado, conforme a matriz de ações exclusivamente humanas da Épica 17.

## Dependências

- **Entrada:** REC-001 concluída (freeze e critério de contenção estabelecidos).
- **Consome sinal de:** REC-002 (rotação não comprovada aciona o lockdown).
- **Bloqueia:** nenhuma story subsequente diretamente; é um controle de segurança complementar à Onda 0.
- **Não depende de:** REC-403 para o desenho do contrato, mas qualquer código mergeado por esta story exige o baseline verde de REC-403 antes do merge, conforme a regra constitucional da Onda 0.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** se o lockdown falhar ao bloquear uma rota em escopo, corrigir a guarda para frente; nunca remover a verificação para "destravar" temporariamente.
- **Rollback permitido:** desativar o sinal de lockdown quando a rotação estiver comprovada, mantendo o mecanismo disponível para reativação futura.
- **Rollback proibido:** remover a guarda de código introduzida por esta story como forma de resolver um falso positivo; corrigir o critério de ativação em vez disso.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usa revisão manual da guarda de código e do ciclo de ativação/desativação por `@qa`.

### Story Type Analysis

- **Primary Type:** Security (fail-closed)
- **Secondary Type:** Deployment/Infrastructure (controle operacional por ambiente)
- **Complexity:** Média, por tocar pontos de entrada administrativos e públicos em mais de um ambiente.
- **Agentes:** executor operacional `@devops`; guarda mínima de código `@dev`; quality gate independente `@qa`.

### Manual review focus

- Ausência de bypass do sinal de lockdown.
- Comportamento idêntico ao atual quando o lockdown está inativo.
- Reversibilidade e auditabilidade da ativação/desativação.
- Nenhuma nova superfície de autenticação introduzida.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-15 | 0.1 | Draft criado a partir da Épica 17 (autorização de decomposição pós-REC-001), com escopo de kill-switch fail-closed para rotas administrativas e writes públicos. | @sm (River) |
| 2026-07-15 | 1.0 | **GO (10/10) → Draft → Ready.** Checklist de 10 pontos sem lacunas: título claro, contexto/valor completo, ACs em Given/When/Then, escopo incluído/excluído explícito, dependências mapeadas (REC-001 entrada, consome sinal de REC-002, baseline verde de REC-403 exigido antes do merge), estimativa (S–M), valor de negócio (evita operação em estado misto), riscos e roll-forward/rollback documentados, critérios de conclusão claros via gate independente do @qa, alinhamento com Épica 17/Onda 0 confirmado. Bloqueadores documentais: 0. | @po (Pax) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-15-rec-003-fail-closed-indisponibilidade.md`

### Planejado para implementação/validação

- `docs/history/reports/rec-003-fail-closed-2026-07-15.md`
- `docs/qa/gates/rec-003-fail-closed-indisponibilidade.yml`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-14-rec-001-incidente-freeze-evidencias.md`
- `docs/stories/2026-07-15-rec-002-revogar-credenciais-sessoes.md`
- `src/lib/auth.ts`
- `supabase/functions/_shared/auth.ts`
- `supabase/functions/enrollments/index.ts`
- `supabase/functions/leads/index.ts`

## Dev Agent Record

### Agent Model Used

A preencher pelo executor.

### Debug Log References

A preencher pelo executor, somente com referências sanitizadas.

### Completion Notes

A preencher pelo executor.

## QA Results

A preencher por `@qa` após validação independente.
