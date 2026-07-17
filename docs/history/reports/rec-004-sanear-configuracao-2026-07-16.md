# Relatório REC-004 — Sanear configuração versionada

**Data:** 2026-07-16
**Executor:** @devops (Gage), via aiox-master (Orion)
**Story:** [`docs/stories/2026-07-16-rec-004-sanear-configuracao-versionada.md`](../../stories/2026-07-16-rec-004-sanear-configuracao-versionada.md)

## 1. Objetivo

Remover todo valor de credencial real do conteúdo versionado do HEAD (`.claude/settings.json`), fechando a lacuna remanescente de FND-01 após a rotação completa executada por REC-002.

## 2. Inventário de ocorrências (antes da sanitização)

Identificadas por padrão (`sbp_`, `sb_publishable_[A-Za-z0-9_-]+` como valor literal, hex-64, senha em texto plano), sem reproduzir os valores neste relatório:

| Linha original (aprox.) | Tipo de valor | Consumidor na entrada de permissão |
|---|---|---|
| ~50 | `sb_publishable_...` (×2) + senha em texto plano | `curl` de teste do endpoint `auth-session` |
| ~52 | `SUPABASE_ACCESS_TOKEN=sbp_...` (token A) | `supabase secrets set` |
| ~53 | `sb_publishable_...` (×2) | `curl` de teste do endpoint `auth-session` (variante com `Origin`) |
| ~68, 70, 71, 72, 82 | `SUPABASE_ACCESS_TOKEN=sbp_...` (token B) | `supabase db push` / `link` / `functions deploy` / `projects list` |
| ~74–77, 79 | `sb_publishable_...` (repetido em `apikey`/`Authorization`) | `curl` de teste do catálogo público e `admin-resources` |
| ~83 | `AUTH_SESSION_SECRET` (hex antigo) + `sb_publishable_...` | `npm run build` com env real |

Total: 6 linhas com valor real, 2 tokens `SUPABASE_ACCESS_TOKEN` distintos, 1 `AUTH_SESSION_SECRET`, 1 chave publicável repetida em múltiplas linhas, 1 senha em texto plano.

## 3. Confirmação de rotação prévia (AC3)

Todos os valores acima já estavam rotacionados/mortos antes desta sanitização, conforme `docs/history/reports/rec-002-rotacao-credenciais-2026-07-15.md` e o gate `docs/qa/gates/rec-002-revogar-credenciais-sessoes.yml`:

- `SUPABASE_ACCESS_TOKEN` (ambos os tokens históricos): confirmado morto por `supabase projects list` → `Unauthorized` antes da rotação para o valor atual em produção.
- `AUTH_SESSION_SECRET`: rotacionado nos 3 ambientes consumidores; sessão assinada com o valor antigo confirmada rejeitada pelos dois verificadores HMAC.
- Senha administrativa: trocada via Admin API, confirmada pelo Incident Commander.

Nenhum valor sanitizado nesta story ainda estava ativo.

## 4. Ação executada (AC1, AC2, AC4, AC5)

Cada ocorrência de valor real foi substituída pelo placeholder `__TRACKED_VAR__`, já em uso no mesmo arquivo antes desta story para o mesmo propósito (ex.: entradas de teste de `admin-resources`/`enrollments` anteriores). Nenhuma entrada de `permissions.allow` foi removida, reordenada ou teve seu comando base alterado além do valor sanitizado.

## 5. Verificação pós-sanitização

- Scan de padrão (`sbp_`, `eyJ`, senha conhecida, chave publicável específica) no arquivo após a edição: **zero ocorrência de valor real**. A única linha remanescente contendo o texto `sb_publishable_` é a definição do próprio padrão de busca do scanner (`grep -oE "\(sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]{20,}\)"`), que é uma expressão regular, não um valor.
- Validação de JSON: arquivo permanece sintaticamente válido.
- Contagem de entradas em `permissions.allow`: inalterada (97 entradas antes e depois).

## 6. Escopo não coberto por esta story

- Histórico Git anterior a este commit ainda contém os valores antigos em versões passadas de `.claude/settings.json` — tratado por REC-005 (sanear histórico), que depende desta story estar concluída primeiro.

## 7. Conclusão

AC1, AC2, AC3, AC4 e AC5 atendidos com evidência direta. AC6 (gate independente) pendente de revisão por `@qa`.
