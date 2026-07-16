# Relatório de Incidente SEV-0 — REC-001

## 1. Identificação do incidente

| Campo | Valor |
|---|---|
| ID do incidente | `INC-2026-07-15-SEV0-001` |
| Severidade | SEV-0 |
| Origem | FND-01 (credenciais operacionais/administrativas potencialmente expostas em `.claude/settings.json` versionado) e FND-14 |
| Épica | [Épica 17 — Recuperação SEV-0](../../epics/epic-17-recuperacao-sev0-seguranca-integridade.md) |
| Story | `docs/stories/2026-07-14-rec-001-incidente-freeze-evidencias.md` |
| Início do incidente (T0) | 2026-07-15T18:00:08 -03:00 (America/Sao_Paulo) = 2026-07-15T21:00:08Z |
| Ambientes afetados | GitHub (repo `PedroAu/rh-cursos-sistema`), Supabase (projeto de produção `site` / ref `hwpsrujkxjhmmwphqdlz`), Cloudflare Workers (produção) |
| Serviços afetados | Deploy de frontend (Cloudflare Workers), Deploy de Edge Functions (Supabase), Deploy de site estático (Locaweb), pipeline de Release |
| Estado atual | Contido parcialmente — GitHub congelado; Supabase e Cloudflare em NO-GO fail-closed (ver seção 4) |
| Próximo checkpoint | T+30 = 18:30 -03 · T+120 = 20:00 -03 · T+240 = 22:00 -03 |

## 2. Comando do incidente e responsáveis

| Papel | Responsável |
|---|---|
| Incident Commander | Pedro Augusto |
| `@devops` (execução técnica do freeze) | Gage (agente AIOX) |
| `@data-engineer` | Pedro Augusto (acumulado — ver bloqueio abaixo) |
| `@dev` | Pedro Augusto (acumulado — ver bloqueio abaixo) |
| `@qa` (gate independente) | Pendente de execução (ver seção 6) |
| `@po` | Pedro Augusto (acumulado — ver bloqueio abaixo) |
| Owner: rotação de senha/MFA | Pedro Augusto |
| Owner: decisão de indisponibilidade comercial | Pedro Augusto |
| Owner: avaliação legal/DPO | Pedro Augusto |

**Bloqueio registrado (AC2):** os papéis técnicos `@data-engineer`, `@dev` e `@po` foram acumulados pelo mesmo responsável humano (Pedro Augusto) por decisão explícita do Incident Commander nesta conversa, e não por inferência do executor. Isso é registrado como uma condição de risco operacional (falta de segregação de funções), não resolvido nesta story, e deve ser considerado pelo `@qa` no gate.

## 3. Freeze aplicado (GitHub)

Ação executada por `@devops` via `gh` CLI autenticado (escopos `repo`, `workflow`), após confirmação explícita do Incident Commander.

| Controle | Estado antes | Estado depois | Horário (UTC) | Evidência |
|---|---|---|---|---|
| `lock_branch` em `main` | `false` | **`true`** (branch bloqueada para leitura/escrita, inclusive merges) | executado e verificado entre 2026-07-15T21:00:08Z e 2026-07-15T21:02:53Z | `github-branch-protection-post-freeze-2026-07-15T21-00-08Z.json` |
| Workflow `Deploy Frontend to Cloudflare Workers` | `active` | **`disabled_manually`** | idem | `github-workflows-post-freeze-2026-07-15T21-00-08Z.json` |
| Workflow `Deploy Supabase Edge Functions` | `active` | **`disabled_manually`** | idem | idem |
| Workflow `Deploy Static Site to Locaweb` | `active` | **`disabled_manually`** | idem | idem |
| Workflow `Release` | `active` | **`disabled_manually`** | idem | idem |
| Workflow `CI Pipeline` | `active` | `active` (mantido — apenas valida, não publica) | — | idem |
| Workflow `pr-automation.yml` | `active` | `active` (mantido — apenas valida PRs, que não podem ser mergeados com `main` locked) | — | idem |

**AC4 — nenhuma publicação concorrente:** verificado via `gh run list` (últimas 15 execuções). A execução mais recente de qualquer workflow foi em `2026-07-14T02:33:32Z`, mais de um dia antes de T0. Nenhuma execução em `in_progress`/`queued` no momento do freeze. Nada foi cancelado por não haver execução concorrente.

## 4. Fail-closed — ambientes sem freeze comprovado (AC7) — ATUALIZADO, ver seção 4.1

| Ambiente | Motivo do NO-GO original | Ação requerida (original) |
|---|---|---|
| **Supabase** (projeto `site`, ref `hwpsrujkxjhmmwphqdlz`) | O agente `@devops` não possui, neste ambiente de execução, um mecanismo de freeze granular (ex.: suspensão de deploy de Edge Functions) sem recorrer a pausar o projeto inteiro (ação desproporcional que derrubaria banco/API para todos os usuários). O Incident Commander optou explicitamente por **não** pausar o projeto agora. | Owner autorizado (Pedro Augusto) deve, via dashboard Supabase, revisar/restringir manualmente deploys de Edge Functions e acesso de Management API até o descongelamento formal. |
| **Cloudflare Workers** (produção) | `wrangler` não está instalado/autenticado neste ambiente de execução; nenhum token de API Cloudflare disponível para o agente. Não há mecanismo programático de freeze nem de exportação de audit log a partir daqui. | Owner autorizado deve, via dashboard Cloudflare, revisar acesso de API tokens e, se necessário, suspender deploys manualmente até o descongelamento formal. |

Ambos os itens foram registrados como **NO-GO fail-closed** por decisão do Incident Commander em 2026-07-15T21:0x, por não poderem receber PASS com evidência incompleta (AC7). **Ação corretiva aplicada — ver 4.1.**

### 4.1 Fechamento dos NO-GOs — ação manual do Incident Commander (2026-07-15, ~20:55 -03)

O Incident Commander (Pedro Augusto) executou manualmente, via dashboard, a exclusão de todos os tokens de deploy/API dos dois provedores:

| Ambiente | Ação executada | Executor | Verificação independente | Horário (UTC, aprox.) |
|---|---|---|---|---|
| Supabase (projeto `site`) | Exclusão de todos os Access Tokens da conta (`https://supabase.com/dashboard/account/tokens`) | Incident Commander (Pedro Augusto), manual | `@devops` re-executou `supabase projects list` após a ação e confirmou resposta `{"message":"Unauthorized"}` — o token previamente usado pela CLI (`SUPABASE_ACCESS_TOKEN`) deixou de ser válido, consistente com exclusão efetiva | 2026-07-15T23:55:02Z |
| Cloudflare Workers (produção) | Exclusão de todos os API Tokens (`https://dash.cloudflare.com/profile/api-tokens`) | Incident Commander (Pedro Augusto), manual | Sem verificação técnica independente possível neste ambiente (sem `wrangler`/token para checar via API); baseado em confirmação direta do Incident Commander | Declarado pelo IC em 2026-07-15 (horário exato não instrumentado) |

**Efeito:** qualquer deploy manual de Edge Functions (Supabase) ou de Workers (Cloudflare) que dependesse dos tokens excluídos deixa de ser possível até que novas credenciais sejam emitidas — o que só deve ocorrer sob controle de REC-002. Isso fecha o canal de publicação manual que o freeze do GitHub não cobria.

**Limitação registrada:** a verificação da exclusão em Cloudflare é apoiada em declaração do Incident Commander, não em checagem técnica independente do agente (ausência de `wrangler`/token neste ambiente). Isso é uma diferença de força de evidência em relação ao Supabase (onde houve confirmação técnica indireta via `Unauthorized`) e deve ser considerada pelo `@qa` no re-review.

## 5. Evidências preservadas (AC5, AC8)

Artefatos brutos **não são versionados** (contêm payloads extensos de eventos do GitHub); ficam em armazenamento local restrito do executor. Apenas este índice sanitizado é versionado.

| Fonte | Intervalo coletado | Coletor | Horário de coleta (UTC) | Localização (restrita) | Tamanho | SHA-256 |
|---|---|---|---|---|---|---|
| GitHub Actions — últimas 50 execuções (`gh run list`) | histórico disponível até T0 | `@devops` (Gage) | 2026-07-15T21:01:00Z (aprox., coleta em lote pós-freeze) | `rec-001-evidence/github-actions-runs-2026-07-15T21-00-08Z.json` | 231 B | `f8cd5e414b5d98b78a5af1593513da717011f9b6f5d3dade4b014e732f4b7aba` |
| GitHub Repo Events (`/repos/.../events`, fallback — sem Audit Log de organização, conta é pessoal) | janela retida pela API (~90 dias) | `@devops` (Gage) | 2026-07-15T21:01:00Z (aprox.) | `rec-001-evidence/github-repo-events-2026-07-15T21-00-08Z.json` | 933394 B | `9b5ef578ee7d359e534b3d96b226591010293641d3b9fa63ec55adfd93c90cfe` |
| GitHub Branch Protection (estado pós-freeze) | snapshot pós-freeze | `@devops` (Gage) | 2026-07-15T21:01:00Z (aprox.) | `rec-001-evidence/github-branch-protection-post-freeze-2026-07-15T21-00-08Z.json` | 1595 B | `86fad6e02c8edb4fe3b92acd1e4abaacf3a91a8946b5e12bfea95fb94479d01f` |
| GitHub Workflows (estado pós-freeze) | snapshot pós-freeze | `@devops` (Gage) | 2026-07-15T21:01:00Z (aprox.) | `rec-001-evidence/github-workflows-post-freeze-2026-07-15T21-00-08Z.json` | 459 B | `86b6cbb3468030b8ea9f5333862533fbb5e41afe641cc78f8143318dfc324d48` |
| GitHub Organization Audit Log | N/A | `@devops` (Gage) | 2026-07-15T21:00:20Z | Não disponível — endpoint retornou 404 (recurso exclusivo de organizações/Enterprise; este repositório está sob conta pessoal) | — | — |
| Supabase Auth/Edge/Management logs | N/A | — | — | **Não coletado** — ver seção 4 (NO-GO) | — | — |
| Cloudflare Audit/Deployment logs | N/A | — | — | **Não coletado** — ver seção 4 (NO-GO) | — | — |

**Verificação de integridade:** recomputação do checksum de `github-branch-protection-post-freeze-2026-07-15T21-00-08Z.json` confirmada localmente após a exportação (`shasum -a 256`), valor idêntico ao registrado acima.

**Preservação do worktree (AC8):** nenhuma evidência foi obtida apagando, resetando ou reescrevendo o worktree/histórico local. Nenhum comando destrutivo (`git reset --hard`, `git clean`, `git push --force`) foi executado durante esta contenção. `git status` local permanece consistente com o estado anterior ao incidente, exceto pelos artefatos documentais desta story.

## 6. Inventário sanitizado de exposição

Ver `docs/history/reports/rec-001-inventario-exposicao-2026-07-14.md` (Task 4). Nenhum valor de segredo é reproduzido neste relatório ou no inventário.

## 7. Roll-forward / Rollback aplicado

- Nenhuma falha de controle exigiu indisponibilidade fail-closed adicional além dos NO-GOs da seção 4.
- Nenhum rollback foi executado; branch protection e workflows permanecem congelados até decisão explícita de `@qa` + Incident Commander.
- O descongelamento **não** faz parte desta story.

## 8. Solicitação de gate

Gate correspondente: `docs/qa/gates/rec-001-incidente-freeze-evidencias.yml` — aguardando veredito independente de `@qa`. O executor `@devops` não autoaprova este freeze.
