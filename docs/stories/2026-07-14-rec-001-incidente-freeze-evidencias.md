# Story REC-001: Declarar incidente, congelar mudanças e preservar evidências

## Status

Ready

## Executor Assignment

executor: "@devops"
quality_gate: "@qa"
quality_gate_tools:
- inspeção de branch protection e workflows no GitHub
- inventário sanitizado de serviços, credenciais e sessões potencialmente afetados
- exportação controlada dos audit logs do GitHub, Supabase e Cloudflare
- verificação de hashes/checksums dos artefatos preservados
- revisão do registro de incidente sem segredo ou PII

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 0 — Contenção SEV-0
- **Prioridade:** P0 / SEV-0
- **Estimativa:** S, até um dia de esforço focado; a contenção inicial deve ser concluída em T+0 a T+2h
- **Findings:** FND-01 e FND-14
- **Requisitos:** NFR-01, NFR-08, NFR-09, CON-03, CON-06 e CON-08
- **Gate relacionado:** G0 — Incidente contido

## Story

**As a** coordenador do incidente da RH Cursos,
**I want** declarar formalmente o SEV-0, congelar merges/deploys e preservar evidências verificáveis,
**so that** a recuperação comece sem propagação adicional do risco e sem destruir os dados necessários à investigação e às decisões de segurança.

## Contexto e valor

A configuração versionada [`.claude/settings.json`](../../.claude/settings.json) foi identificada pela auditoria como evidência de credenciais operacionais e administrativas expostas. O primeiro incremento não rotaciona credenciais, não saneia o histórico e não altera código: ele cria o perímetro operacional para que REC-002 a REC-005 possam executar com rastreabilidade e sem novos deploys concorrentes.

Esta story pode começar antes de REC-403 porque suas ações são remotas e documentais, sem merge de código. Nenhuma migration, hotfix ou alteração de aplicação é autorizada por ela.

## Escopo

### Incluído

- Declarar o incidente com identificador, severidade, início, ambientes e serviços em escopo.
- Nomear incident commander e registrar responsáveis por produto, plataforma, banco, aplicação, qualidade e decisão humana.
- Suspender deploys automáticos e manuais dos ambientes afetados.
- Bloquear merges em `main` enquanto a contenção não tiver gate explícito.
- Preservar audit logs e metadados de GitHub, Supabase, Cloudflare e CI/CD.
- Registrar inventário sanitizado dos tipos de credencial e sessão potencialmente comprometidos, sem copiar seus valores.
- Registrar a decisão de indisponibilidade fail-closed caso o freeze não possa ser comprovado.
- Produzir evidência sanitizada e verificável para revisão de `@qa`.

### Fora do escopo

- Revogar ou gerar credenciais, senhas, PATs e secrets: REC-002.
- Bloquear rotas ou writes por mudança de aplicação: REC-003.
- Remover segredos do HEAD: REC-004.
- Reescrever histórico, branches ou tags: REC-005.
- Emitir conclusão jurídica sobre incidente de dados.
- Alterar código, migration, workflow versionado ou configuração L1/L2 do AIOX.
- Executar `git push`, criar PR, release ou tag fora da autoridade de `@devops`.

## Acceptance Criteria

1. **Incidente declarado e identificável**
   **Given** que FND-01 foi aceito como incidente SEV-0,
   **when** a contenção começa,
   **then** existe um registro sanitizado com ID único, severidade, horário de início, ambientes, serviços afetados, estado atual e próximo checkpoint, sem senha, token, e-mail pessoal ou telefone.

2. **Comando e responsabilidades definidos**
   O registro identifica incident commander, `@devops`, `@data-engineer`, `@dev`, `@qa`, `@po` e os responsáveis humanos por senha/MFA, indisponibilidade comercial e avaliação legal/DPO. Ausência de uma pessoa deve aparecer como bloqueio, nunca ser preenchida por suposição.

3. **Freeze comprovado**
   **Given** os repositórios e ambientes afetados,
   **when** o freeze é aplicado por `@devops`,
   **then** merges em `main`, deploys automáticos, deploys manuais e jobs de publicação ficam suspensos ou protegidos por controle equivalente, com evidência de configuração e horário.

4. **Nenhuma publicação concorrente**
   A linha do tempo comprova que nenhum novo deploy foi iniciado depois do freeze. Execução já em andamento deve ser cancelada ou registrada com resultado e decisão explícita.

5. **Evidências preservadas com cadeia mínima de custódia**
   Audit logs disponíveis de GitHub/Actions, Supabase Auth/Edge/Management e Cloudflare são exportados ou referenciados com fonte, intervalo temporal, horário de coleta, coletor, localização restrita, tamanho e hash/checksum quando o provedor permitir exportação.

6. **Inventário sem material secreto**
   O inventário lista cada item por identificador não secreto, tipo, serviço consumidor, ambiente, owner, estado de rotação e próxima ação. Nenhum valor de senha, PAT, JWT, refresh token, private key ou `AUTH_SESSION_SECRET` é copiado.

7. **Fail-closed quando o freeze não puder ser provado**
   **Given** qualquer ambiente onde merge ou deploy não possa ser bloqueado/verificado,
   **when** a contenção chega ao checkpoint,
   **then** o incident commander registra `NO-GO` para o ambiente e solicita bloqueio de acesso administrativo/publicação pelo owner autorizado; a story não pode receber PASS com evidência incompleta.

8. **Preservação do worktree e do histórico**
   Nenhuma evidência é obtida apagando, resetando ou reescrevendo o worktree/histórico atual. Clones, branches e artefatos potencialmente relevantes permanecem preservados até REC-005 e a orientação do incident commander.

9. **Gate independente**
   `@qa` revisa a evidência e emite PASS/CONCERNS/FAIL para REC-001. O executor `@devops` não autoaprova o freeze que executou.

## Tasks / Subtasks

- [ ] **Task 1 — Abrir o registro do incidente** (AC: 1, 2)
  - [ ] Criar ID do incidente e registrar severidade SEV-0, data/hora absoluta e timezone.
  - [ ] Relacionar FND-01/FND-14 e a Épica 17 sem reproduzir segredos.
  - [ ] Nomear incident commander e responsáveis técnicos/humanos.
  - [ ] Definir checkpoints T+30, T+120 e T+240 minutos.

- [ ] **Task 2 — Aplicar freeze remoto** (AC: 3, 4, 7)
  - [ ] Suspender ou proteger workflows de deploy do frontend e das Edge Functions.
  - [ ] Bloquear merge em `main` e registrar exceções técnicas existentes.
  - [ ] Cancelar ou acompanhar execuções já iniciadas.
  - [ ] Verificar separadamente GitHub, Cloudflare e Supabase.
  - [ ] Se algum controle falhar, registrar NO-GO e escalar fail-closed ao owner autorizado.

- [ ] **Task 3 — Preservar evidências** (AC: 5, 8)
  - [ ] Definir janela temporal inicial da coleta.
  - [ ] Exportar ou referenciar GitHub audit log e execuções de Actions.
  - [ ] Exportar ou referenciar logs do Supabase Auth, Edge Functions e Management disponíveis.
  - [ ] Exportar ou referenciar logs da Cloudflare disponíveis.
  - [ ] Gerar hash/checksum dos artefatos exportados quando tecnicamente possível.
  - [ ] Armazenar artefatos brutos em local restrito; versionar somente o índice sanitizado.

- [ ] **Task 4 — Inventariar exposição sem copiar valores** (AC: 6)
  - [ ] Listar classes de credencial/sessão comprometidas por consumidor e ambiente.
  - [ ] Identificar owner de rotação e dependência humana.
  - [ ] Marcar todos os itens como `pending`, sem antecipar conclusão de REC-002.

- [ ] **Task 5 — Consolidar evidência de contenção** (AC: 1–9)
  - [ ] Produzir relatório sanitizado em `docs/history/reports/rec-001-sev0-incident-2026-07-14.md`.
  - [ ] Criar/atualizar o gate `docs/qa/gates/rec-001-incidente-freeze-evidencias.yml` durante a validação.
  - [ ] Anexar somente IDs, timestamps, checksums e resultados; nunca material secreto/PII.
  - [ ] Solicitar veredito de `@qa`.

## Dev Notes

### Fontes verificadas

- A Épica 17 determina que REC-001 é a primeira story da Onda 0 e pode preceder merges de código. [Fonte: `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md#onda-0--contenção-sev-0-t0-a-t2h`]
- A Constitution reserva push, PR, release e tags para `@devops`, exige story antes de código e atribui o veredito de qualidade a `@qa`. [Fonte: `.aiox-core/constitution.md#ii-agent-authority-non-negotiable`; `.aiox-core/constitution.md#iii-story-driven-development-must`; `.aiox-core/constitution.md#v-quality-first-must`]
- Os workflows de publicação atualmente versionados estão em `.github/workflows/deploy-functions.yml` e `.github/workflows/deploy-frontend.yml`; o CI está em `.github/workflows/ci.yml`.
- A configuração `.claude/settings.json` é evidência do incidente, mas seu conteúdo secreto não deve ser transcrito para a story ou relatório.
- O repositório já usa `docs/history/reports/` para relatórios versionados e `docs/qa/gates/` para decisões de gate; os novos artefatos seguem essas estruturas reais.

### Project Structure Notes

- Esta story não cria código de aplicação.
- Artefatos brutos e potencialmente sensíveis não pertencem ao Git. Somente o índice/relatório sanitizado fica em `docs/history/reports/`.
- Alterações remotas de proteção e suspensão são estado operacional, não mudanças versionadas; devem ser referenciadas por ID/timestamp no relatório.
- Não modificar `.aiox-core/`, `bin/aiox.js` ou qualquer path L1/L2.

### Ferramentas e execução segura

- GitHub branch protection/Audit Log/Actions: leitura e mudança remota por `@devops`.
- Supabase dashboard/Management/Auth/Edge logs: coleta com acesso mínimo e sem expor token em terminal.
- Cloudflare audit/deployment logs: coleta com acesso mínimo.
- SHA-256 ou checksum fornecido pelo provedor para integridade do artefato.
- `git status --short` e inspeção read-only para provar que a contenção não alterou arquivos fora dos artefatos documentais autorizados.

## Testing e evidências

Esta story é operacional/documental; os gates constitucionais de código são N/A até existir alteração de código. A validação deve exercitar:

- Tentativa controlada de merge por usuário sem bypass, esperando bloqueio.
- Tentativa controlada ou inspeção equivalente de deploy, esperando bloqueio/aprovação obrigatória.
- Conferência de que workflows em execução após o horário do freeze foram cancelados ou concluídos antes dele.
- Recomputação de checksum de ao menos um artefato exportado.
- Busca no relatório por padrões de token/JWT/private key, esperando zero ocorrência real.
- Revisão de amostra dos logs para confirmar que o índice aponta à fonte correta sem versionar o conteúdo bruto.

## Observabilidade

- Registrar checkpoints com timestamp absoluto e timezone `America/Sao_Paulo`/UTC.
- Registrar somente IDs de workflow/deploy/evento, status e correlation IDs.
- Alertar imediatamente sobre publicação posterior ao freeze.
- Não usar e-mail, telefone, token ou senha como label.
- Falha de coleta deve aparecer como lacuna explícita com owner e próxima ação.

## Security Notes

- Tratar todos os valores identificados por FND-01 como comprometidos, mesmo que não haja evidência de uso malicioso.
- Não validar uma credencial antiga copiando-a para CLI, issue ou log; o teste negativo pertence à REC-002 e deve usar canal seguro.
- Não apagar histórico ou caches antes de preservar evidências e rotacionar credenciais.
- O relatório versionado deve poder ser compartilhado internamente sem revelar material autenticador ou PII.
- A avaliação de notificação legal pertence ao DPO/responsável legal; agentes fornecem apenas evidência sanitizada.

## Dependências

- **Entrada:** Épica 17 validada GO 10/10 por `@po`.
- **Bloqueia execução de:** REC-002, REC-003 e a contenção formal das ondas seguintes.
- **Pode executar em paralelo depois do freeze:** preparação de REC-403.
- **Não depende de:** REC-403, pois não altera código.

## Roll-forward / Rollback

- **Roll-forward obrigatório:** se um controle de freeze falhar, aplicar controle equivalente mais restritivo ou indisponibilidade fail-closed; não liberar deploy “temporariamente”.
- **Rollback permitido:** correção do registro sanitizado ou substituição de um artefato corrompido mantendo a versão anterior preservada.
- **Rollback proibido:** remover branch protection, reativar deploys, apagar evidência ou alterar timestamps para obter PASS.
- O descongelamento pertence aos gates posteriores e exige decisão explícita de `@qa` + incident commander; não faz parte desta story.

## 🤖 CodeRabbit Integration

> **CodeRabbit Integration**: Disabled
>
> `coderabbit_integration.enabled` não está definido em `.aiox-core/core-config.yaml`.
> Como REC-001 não altera código, a validação usa revisão manual do relatório, dos controles remotos e das evidências por `@qa`.

### Story Type Analysis

- **Primary Type:** Deployment / Incident Response
- **Secondary Type:** Security / Governance
- **Complexity:** Média, por envolver três provedores e autoridades humanas distintas
- **Agentes:** executor `@devops`; coordenação `@po`; quality gate independente `@qa`

### Manual review focus

- Nenhum segredo/PII em artefatos versionados.
- Freeze verificável e sem bypass não documentado.
- Cadeia mínima de custódia e timestamps coerentes.
- Autoridades AIOX respeitadas.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-14 | 0.1 | Draft criado a partir da Épica 17 validada, com escopo exclusivo de incidente, freeze e preservação sanitizada de evidências. | @sm (River) |
| 2026-07-14 | 1.0 | **GO — 9/10; Draft → Ready.** PASS em objetivo/contexto, rastreabilidade à Épica 17, escopo IN/OUT, autoridade do executor, critérios testáveis, sequência de tarefas, segurança/privacidade, evidências e roll-forward. PARTIAL não bloqueante em prontidão operacional porque incident commander, owners humanos e acessos aos três provedores só podem ser confirmados no início da execução; a story determina que ausências sejam registradas como bloqueio, sem inventar responsáveis. `@qa` foi mantido como quality gate por ser a autoridade constitucional exclusiva do veredito de qualidade, distinto de `@devops`. Bloqueadores documentais: 0. Condição para iniciar: executor autorizado com acesso aos controles remotos; nenhuma alteração de código, push ou reescrita de histórico é autorizada por esta story. | @po (Pax) |

## File List

### Criado nesta preparação

- `docs/stories/2026-07-14-rec-001-incidente-freeze-evidencias.md`

### Planejado para implementação/validação

- `docs/history/reports/rec-001-sev0-incident-2026-07-14.md`
- `docs/qa/gates/rec-001-incidente-freeze-evidencias.yml`

### Referências somente leitura

- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md`
- `.claude/settings.json`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-functions.yml`
- `.github/workflows/deploy-frontend.yml`

## Dev Agent Record

### Agent Model Used

A preencher pelo executor.

### Debug Log References

A preencher pelo executor, somente com referências sanitizadas.

### Completion Notes

A preencher pelo executor.

## QA Results

A preencher por `@qa` após validação independente.
