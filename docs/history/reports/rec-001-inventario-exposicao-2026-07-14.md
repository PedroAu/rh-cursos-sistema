# Inventário sanitizado de exposição — REC-001

> Nenhum valor de senha, PAT, JWT, refresh token, private key ou `AUTH_SESSION_SECRET` é reproduzido neste documento. Apenas identificadores não secretos, tipo, consumidor, ambiente, owner e estado.

Item relacionado a FND-01 (`.claude/settings.json` versionado). Rotação real é escopo de REC-002; aqui todo item é marcado `pending` sem antecipar conclusão.

| Identificador (não secreto) | Tipo | Serviço consumidor | Ambiente | Owner de rotação | Estado | Próxima ação |
|---|---|---|---|---|---|---|
| CRED-01 | Credencial/token operacional referenciada em `.claude/settings.json` | Ferramentas MCP/CLI locais do agente (ex.: GitHub CLI, Docker MCP gateway) | Desenvolvimento local / produção (a confirmar em REC-002) | Pedro Augusto | `pending` | Rotacionar em REC-002; validar escopo mínimo necessário |
| CRED-02 | Token de acesso GitHub (`gho_...`, escopos `repo`, `workflow`, `read:org`, `gist`, `admin:public_key`) usado pelo `@devops` nesta contenção | GitHub CLI / Actions | Produção (repositório) | Pedro Augusto | `pending` | Avaliar em REC-002 se este token específico está entre os potencialmente expostos; se sim, revogar e reemitir com escopo mínimo |
| CRED-03 | Credenciais/API keys de Supabase (Management API, Auth, service role) potencialmente referenciadas na configuração exposta | Supabase (projeto produção `site`) | Produção | Pedro Augusto | `pending` | Rotacionar em REC-002; auditar uso recente via dashboard |
| CRED-04 | Credenciais/API tokens de Cloudflare (Workers/API) potencialmente referenciadas na configuração exposta | Cloudflare Workers (produção) | Produção | Pedro Augusto | `pending` | Rotacionar em REC-002; revisar tokens ativos via dashboard |
| SESS-01 | Sessões de usuário ativas emitidas com `AUTH_SESSION_SECRET` potencialmente exposto | Aplicação (autenticação de usuários finais) | Produção | Pedro Augusto | `pending` | Revogação/invalidação em REC-002 (rotação do secret força reautenticação) |

## Observações

- Este inventário **não afirma** que cada item foi de fato exposto ou usado maliciosamente — trata, por precaução (Security Notes da story), todo valor referenciado por FND-01 como comprometido até prova em contrário.
- Nenhum item foi validado copiando-o para CLI, issue ou log, conforme vedado pela story.
- A lista será atualizada por REC-002 conforme cada credencial for rotacionada.
