# Story REC-004: Sanear configuração versionada

## Status

Done

## Executor Assignment

executor: "@devops"
quality_gate: "@qa"
quality_gate_tools:
- scan de padrões de segredo (`sbp_`, `sb_publishable_`, `eyJ`, hex-64, senha em texto plano) em `.claude/settings.json` no HEAD
- diff completo do arquivo para confirmar que apenas valores de segredo foram substituídos, sem alterar a função/intenção das entradas de permissão
- confirmação de que as credenciais residuais já estavam rotacionadas/mortas por REC-002 antes desta sanitização

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 1 — Fechar ataques e comportamentos enganosos
- **Prioridade:** P0 / SEV-0
- **Estimativa:** S
- **Findings:** FND-01
- **Requisitos:** NFR-01, NFR-08, NFR-09
- **Gate relacionado:** G0 — Incidente contido (fecha o item pendente de HEAD saneado)

## Story

**As a** coordenador do incidente da RH Cursos,
**I want** remover todo valor de credencial real do conteúdo versionado do HEAD,
**so that** o histórico ativo do repositório pare de expor segredos, mesmo já rotacionados, e o secret scan encontre zero segredo real no branch atual.

## Contexto e valor

REC-001 identificou `.claude/settings.json` como a evidência primária de FND-01 (segredos operacionais versionados). REC-002 rotacionou todas as credenciais correspondentes (tokens Supabase, `AUTH_SESSION_SECRET`, senha administrativa). Esta story fecha a lacuna remanescente: os valores antigos — já mortos, mas ainda legíveis em texto puro no HEAD — permaneciam versionados em `.claude/settings.json`, em entradas de permissão (`allow`) usadas historicamente para autorizar comandos específicos com valores embutidos.

Como os valores expostos já estão rotacionados e mortos (confirmado por REC-002: `SUPABASE_ACCESS_TOKEN` sbp_628948... e sbp_fa9d93... retornam `Unauthorized`; `AUTH_SESSION_SECRET` antigo é rejeitado pelos dois verificadores HMAC; a senha administrativa exposta em uma das entradas já foi trocada), esta story trata exclusivamente da sanitização do HEAD — não há rotação adicional a fazer.

## Escopo

### Incluído

- Substituir todo valor de credencial real em `.claude/settings.json` (`SUPABASE_ACCESS_TOKEN` no padrão `sbp_...`, `AUTH_SESSION_SECRET` no valor hex antigo, chave publicável `sb_publishable_...` reproduzida em headers de teste, e a senha administrativa em texto plano) pelo placeholder `__TRACKED_VAR__`, já usado nesse mesmo arquivo para o mesmo propósito em entradas anteriores.
- Preservar a estrutura, a intenção funcional e a ordem das entradas de permissão — apenas os valores de segredo são substituídos, nenhuma entrada é removida ou tem seu comando alterado além do valor sanitizado.
- Confirmar, por varredura de padrão, que nenhuma ocorrência real de segredo permanece no arquivo (a única ocorrência residual aceitável é o padrão de regex do próprio scanner na linha 38, que é uma definição de busca, não um valor).
- Produzir evidência sanitizada para `@qa`.

### Fora do escopo

- Sanitizar o histórico Git (branches/tags antigas): REC-005.
- Rotacionar qualquer credencial nova: já concluído por REC-002; nenhum valor novo é gerado aqui.
- Alterar `.github/workflows/*.yml` ou qualquer outro arquivo fora de `.claude/settings.json`.
- Adicionar scanner automatizado de segredo no CI (tratado em stories de qualidade/CI da Onda 3/5, se aplicável).

## Acceptance Criteria

1. **Zero segredo real no HEAD**
   **Given** `.claude/settings.json` após esta story,
   **when** um scan por padrão de segredo (`sbp_`, `sb_publishable_[A-Za-z0-9_-]+` como valor literal, `eyJ`, hex de 64 caracteres, senha em texto plano) é executado no arquivo,
   **then** nenhuma ocorrência de valor real é encontrada; a única ocorrência aceitável é a definição do próprio padrão de regex do scanner (linha do `grep -oE` usado como entrada de permissão histórica).

2. **Nenhuma função de permissão alterada indevidamente**
   O número de entradas em `permissions.allow`, sua ordem e o comando base de cada entrada (fora do valor sanitizado) permanecem idênticos ao estado anterior a esta story.

3. **Credenciais residuais confirmadas mortas antes da sanitização**
   O relatório desta story referencia a confirmação já produzida por REC-002 de que os valores substituídos (`SUPABASE_ACCESS_TOKEN`, `AUTH_SESSION_SECRET`, senha administrativa) já estavam rotacionados e inválidos no momento da sanitização — nenhuma sanitização acontece antes da rotação correspondente (Security Notes da Épica 17).

4. **Sem novo segredo introduzido**
   O placeholder usado (`__TRACKED_VAR__`) não é um segredo nem um valor funcional; é o mesmo marcador já usado em outras entradas do arquivo antes desta story.

5. **JSON válido**
   `.claude/settings.json` permanece um JSON válido e sintaticamente correto após a edição.

6. **Gate independente**
   `@qa` revisa a evidência e emite PASS/CONCERNS/FAIL para REC-004.

## Tasks / Subtasks

- [x] **Task 1 — Inventariar ocorrências de segredo real no HEAD** (AC: 1)
  - [x] `grep` por padrões `sbp_`, `sb_publishable_`, `eyJ`, hex-64 e senha em texto plano em `.claude/settings.json`.
  - [x] Identificadas 6 linhas com valor real: linha com `Authorization`/`apikey`/senha em `curl` de `auth-session` (×2 ocorrências, uma com `Origin: http://localhost:3000`), 5 linhas com `SUPABASE_ACCESS_TOKEN=sbp_...` (2 tokens distintos), 5 linhas com `apikey`/`Authorization: Bearer sb_publishable_...` em chamadas REST/Functions, 1 linha com `AUTH_SESSION_SECRET`/chave publicável em comando de build.

- [x] **Task 2 — Substituir valores por placeholder** (AC: 1, 2, 4, 5)
  - [x] Cada valor de segredo substituído por `__TRACKED_VAR__`, preservando o restante do comando/entrada inalterado.
  - [x] JSON validado sintaticamente após a edição.

- [x] **Task 3 — Confirmar rotação prévia (AC: 3)**
  - [x] Confirmado via `docs/history/reports/rec-002-rotacao-credenciais-2026-07-15.md` e o gate `docs/qa/gates/rec-002-revogar-credenciais-sessoes.yml`: `SUPABASE_ACCESS_TOKEN`, `AUTH_SESSION_SECRET` e a senha administrativa já estavam rotacionados/mortos antes desta sanitização.

- [x] **Task 4 — Consolidar evidência e gate** (AC: 1–6)
  - [x] Produzir relatório sanitizado em `docs/history/reports/rec-004-sanear-configuracao-2026-07-16.md`.
  - [ ] Gate QA (`docs/qa/gates/rec-004-sanear-configuracao-versionada.yml`) fica para criação por `@qa` na revisão independente.
  - [x] Solicitar veredito de `@qa`.

## Dev Notes

### Fontes verificadas

- `.claude/settings.json` é a âncora local de FND-01. [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#2-rastreamento-dos-achados-aprovados`]
- REC-002 confirma a rotação/morte de `SUPABASE_ACCESS_TOKEN`, `AUTH_SESSION_SECRET` e senha administrativa. [Fonte: `docs/stories/2026-07-15-rec-002-revogar-credenciais-sessoes.md`, gate `docs/qa/gates/rec-002-revogar-credenciais-sessoes.yml`]
- O padrão de placeholder `__TRACKED_VAR__` já existia no arquivo antes desta story (ex.: linhas 21-23 originais), usado para o mesmo propósito de sanitizar valor de teste sensível em entradas de permissão — esta story estende o mesmo padrão às entradas que ainda tinham valor real.
- Security Notes da Épica 17/REC-002: "Rotacionar antes de sanear o HEAD (REC-004) ou o histórico (REC-005); nunca na ordem inversa." Esta ordem foi respeitada — REC-002 (Done) antecede esta story.

### Project Structure Notes

- Único arquivo tocado: `.claude/settings.json` (camada L3, mutável conforme a tabela de fronteiras do AIOX).
- Nenhum path L1/L2 (`.aiox-core/core/`, `.aiox-core/constitution.md`, `bin/aiox.js`, `bin/aiox-init.js`, `.aiox-core/development/tasks|templates|checklists|workflows`, `.aiox-core/infrastructure/`) foi tocado.

## Testing e evidências

- Scan de padrão de segredo antes e depois da edição, com diff do resultado.
- Validação de JSON (`python3 -m json.tool` ou equivalente) confirmando sintaxe válida após a edição.
- Contagem de entradas em `permissions.allow` antes/depois, confirmando que nenhuma entrada foi removida ou adicionada.

## Observabilidade

- Nenhuma observabilidade de runtime aplicável; esta story é puramente de sanitização de conteúdo versionado.

## Security Notes

- Nenhum valor de segredo real aparece neste arquivo de story nem no relatório de evidência — apenas identificação por padrão/linha.
- Sanitização executada após confirmação de rotação prévia (REC-002), conforme a ordem exigida pela Épica 17.
- Este saneamento cobre apenas o HEAD atual; o histórico Git (commits anteriores que ainda contêm os valores antigos) permanece exposto até REC-005.

## Dependências

- **Entrada:** REC-002 concluída (credenciais correspondentes já rotacionadas/mortas).
- **Bloqueia:** REC-005 (sanear histórico Git), que depende do HEAD já estar limpo antes de reescrever o histórico.
- **Não depende de:** REC-403, por não alterar código de aplicação nem exigir merge de migration.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** qualquer necessidade futura de nova entrada de permissão com valor sensível deve usar o mesmo padrão de placeholder desde a criação.
- **Rollback proibido:** reverter esta sanitização para restaurar valor de segredo real no HEAD, mesmo que já morto.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> A validação usa revisão manual do diff e do scan de padrão por `@qa`.

### Story Type Analysis

- **Primary Type:** Security (sanitização de configuração versionada)
- **Secondary Type:** Governance (fecha item pendente de G0)
- **Complexity:** Baixa — edição textual isolada a um arquivo, sem lógica de aplicação.
- **Agentes:** executor `@devops`; quality gate independente `@qa`.

### Manual review focus

- Nenhum valor real de segredo remanescente.
- Nenhuma entrada de permissão perdeu sua função original além do valor sanitizado.
- Ordem de execução respeitada (rotação antes de sanitização).

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-16 | 1.0 | **Draft → InReview.** Story criada e implementada na mesma sessão: sanitização aplicada a `.claude/settings.json`, substituindo 6 linhas com valor real de credencial (tokens Supabase, `AUTH_SESSION_SECRET` antigo, chave publicável reproduzida em headers, senha administrativa em texto plano) pelo placeholder `__TRACKED_VAR__`, já usado no mesmo arquivo para o mesmo propósito. Todos os valores substituídos já estavam rotacionados/mortos por REC-002 antes desta edição. JSON validado sintaticamente. Nenhuma entrada de permissão removida ou com comando alterado além do valor sanitizado. | @devops (Gage) |
| 2026-07-16 | 1.1 | **InReview → Done.** Gate PASS (95/100) emitido por `@qa` após scan independente confirmando zero valor real remanescente. Residual `low` (SEC-106, histórico Git) encaminhado para REC-005. | @qa (Quinn) |

## File List

### Modificado nesta execução

- `.claude/settings.json`

### Criado nesta execução

- `docs/stories/2026-07-16-rec-004-sanear-configuracao-versionada.md`
- `docs/history/reports/rec-004-sanear-configuracao-2026-07-16.md`

### Pendente (criação por `@qa`)

- `docs/qa/gates/rec-004-sanear-configuracao-versionada.yml`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `docs/stories/2026-07-15-rec-002-revogar-credenciais-sessoes.md`
- `docs/history/reports/rec-002-rotacao-credenciais-2026-07-15.md`
- `docs/qa/gates/rec-002-revogar-credenciais-sessoes.yml`

## Dev Agent Record

### Agent Model Used

Claude (persona @devops para esta story, executado por `aiox-master`/Orion em modo de orquestração direta).

### Debug Log References

`grep` de padrões de segredo antes/depois da edição — resultado consolidado em `docs/history/reports/rec-004-sanear-configuracao-2026-07-16.md`, sem reprodução de valor real.

### Completion Notes

Sanitização aplicada com sucesso. Todos os ACs atendidos exceto AC6 (gate independente), que fica para `@qa`.

## QA Results

### Gate: PASS ✅ — @qa (Quinn), 2026-07-16

**Gate file:** [`docs/qa/gates/rec-004-sanear-configuracao-versionada.yml`](../qa/gates/rec-004-sanear-configuracao-versionada.yml) · **Quality score:** 95/100

Scan independente pós-edição de `.claude/settings.json` confirma zero valor real de segredo — a única ocorrência da string `sb_publishable_` é a definição do próprio padrão de regex do scanner (linha do `grep -oE`), não um valor. Diff revisado linha a linha: nenhuma entrada de `permissions.allow` perdeu função além do valor sanitizado. Rotação prévia de todos os valores substituídos confirmada via gate `docs/qa/gates/rec-002-revogar-credenciais-sessoes.yml` (Done).

Todos os ACs (1-5) PASS.

Residual `low`: SEC-106 (histórico Git anterior ainda expõe os valores — tratado por REC-005, dependência já declarada).

**Veredito:** PASS. Nenhuma ação bloqueante. Prosseguir para REC-005.

— Quinn, guardião da qualidade 🛡️
