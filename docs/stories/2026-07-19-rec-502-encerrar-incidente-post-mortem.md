# Story REC-502: Encerrar incidente e executar post-mortem

## Status

Done

## Executor Assignment

executor: "@po" (Pax) + coordenador do incidente — consolidação de evidência e post-mortem
quality_gate: "@qa" (Quinn) — autoridade para declarar PASS/CONCERNS/FAIL e bloquear o gate G5
quality_gate_tools:
- verificação cruzada de G0–G4 contra evidência já produzida pelas stories da épica
- confirmação de que toda ação preventiva tem owner e prazo (ou está explicitamente em backlog sem prazo, por severidade baixa)
- confirmação de que o waiver de REC-005 está registrado com decisão humana explícita, não como omissão silenciosa

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 5 — Qualidade e sustentabilidade (fechamento)
- **Prioridade:** P1 — fechamento obrigatório (não bloqueia contenção, mas bloqueia encerrar a épica)
- **Depende de:** G0–G4 (ver seção 3 abaixo)
- **Produz:** G5 — Encerramento

## Story

**As a** coordenador do incidente SEV-0 e responsável pela Épica 17,
**I want** consolidar a evidência de G0–G4, documentar o impacto real, e registrar ações preventivas com owner e prazo,
**so that** o incidente possa ser formalmente encerrado com rastreabilidade completa, sem pendência silenciosa.

## Escopo

### Incluído

- Consolidar evidência de G0–G4 a partir das stories já `Done` da épica (sem reexecutar o que já foi verificado, apenas citar).
- Rodar localmente os itens de G4 ainda não verificados nesta sessão (lint/typecheck/test/build/build:workers/test:db/docs:api:check-drift/contrato).
- Documentar o impacto real do incidente (o que foi exposto, por quanto tempo, o que foi corrigido).
- Listar toda pendência aberta da épica como ação preventiva, com owner e prazo (ou backlog explícito para baixa severidade).
- Registrar a decisão de waiver para REC-005 (histórico Git) com data e justificativa.
- Declarar G5 com o veredito de `@qa`.

### Fora do escopo

- Executar REC-005 (saneamento de histórico Git) — permanece pausada por decisão humana (waiver).
- Executar REC-501 (decomposição do AppStore) — vira ação preventiva de backlog, não é feita aqui.
- Smoke pós-deploy real — exige deploy em produção, fora do alcance desta sessão; registrado como gap de G4 não coberto.
- Corrigir qualquer uma das pendências listadas — esta story documenta e atribui, não implementa.

## Acceptance Criteria

1. **G0–G3 rastreados com evidência**
   **Given** as stories já `Done` da épica,
   **when** G0–G3 são avaliados,
   **then** cada gate cita a(s) story(ies) que o satisfaz, sem reinvenção de critério.

2. **G4 verificado com evidência local fresca**
   **Given** o HEAD atual (pós-commits de REC-204/REC-406/REC-408),
   **when** os itens de G4 executáveis localmente rodam,
   **then** todos passam ou o gap é documentado explicitamente (não omitido).

3. **Impacto documentado sem invenção**
   **Given** o histórico real da épica,
   **when** o impacto é descrito,
   **then** reflete apenas o que está registrado nas stories/relatórios, sem estimativa não rastreável.

4. **Toda ação preventiva tem owner e prazo, ou backlog explícito**
   **Given** as pendências abertas da épica,
   **when** listadas nesta story,
   **then** cada uma tem responsável e prazo (definido por decisão humana registrada) ou está marcada como backlog sem prazo fixo, por severidade.

5. **Waiver de REC-005 registrado como decisão explícita**
   **Given** que REC-005 não será executada agora,
   **then** a decisão está registrada com data, autor e justificativa — não é uma omissão silenciosa.

6. **G5 declarado com veredito de `@qa`**
   **Given** os itens 1–5 completos,
   **then** `@qa` declara PASS/CONCERNS/FAIL para o encerramento formal da épica.

## 1. Linha do tempo do incidente e da recuperação

| Data | Evento |
|---|---|
| 2026-07-14 | Incidente SEV-0 declarado; freeze de deploys/merges; REC-001 a REC-003 iniciadas (contenção) |
| 2026-07-14 a 07-15 | Ondas 0–1: revogação de credenciais, RPC pública de inscrição e insert anônimo de leads revogados |
| 2026-07-16 | Onda 2: projeções públicas seguras, cliente anon, inscrição atômica, proteção de PII, endurecimento de endpoints públicos |
| 2026-07-16 a 07-17 | Onda 3 (identidade): ADR-016, sessão SSR (REC-202), autorização servidor (REC-203), rate limit estendido (REC-205) |
| 2026-07-17 | Onda 4 (estabilização funcional): read models admin (REC-303/304), navegação/acessibilidade (REC-306/308), login (REC-305), BFF canônico (REC-206) |
| 2026-07-17 a 07-18 | REC-204 Fase A: rollout SSR em conta de teste isolada, validado operacionalmente (não apenas em mock) |
| 2026-07-18 | REC-204 Fase B: cutover total, HMAC removido por completo, forward-only (NFR-08) |
| 2026-07-19 | REC-406 (sincronização OpenAPI) e REC-408 (CSP única, `no-store`, redaction) concluídas; REC-502 (este documento) fecha a épica |

## 2. Impacto real (rastreável às stories, sem estimativa inventada)

- **Superfície pública exposta e corrigida:** RPC de inscrição e insert de leads eram acessíveis por `anon` sem controle adequado (REC-101/REC-102, `Done`); projeções públicas vazavam campos privados de instrutor/turma antes de REC-103.
- **Checkout simulava pagamento** sem arquitetura real por trás (falso sucesso, antipadrão fechado por REC-301/REC-302).
- **Autoridade de sessão administrativa** dependia de HMAC próprio sem revogação confiável (FND-04) até o cutover completo de REC-204 em 2026-07-18.
- **Nenhuma evidência de exploração ativa foi documentada** nas stories da épica — o programa tratou os achados como exposição de risco a fechar, não como comprometimento confirmado. Esta afirmação reflete o que está registrado; não foi produzida investigação forense adicional nesta story.

## 3. G0–G4 — evidência consolidada

### G0 — Incidente contido
Satisfeito por REC-001 (freeze, evidências preservadas), REC-002 (credenciais/sessões revogadas), REC-003 (fail-closed), todas `Done`.

### G1 — Catálogo público
Satisfeito por REC-101, REC-103, REC-104, todas `Done` (cliente anon, projeções sem PII, sem service role público).

### G2 — Leads e pré-inscrição
Satisfeito por REC-102, REC-105, REC-106, REC-107, todas `Done` (idempotência, atomicidade, proteção de PII, rate limit).

### G3 — Área administrativa
Satisfeito por REC-303, REC-304, REC-408, todas `Done` (`no-store` em todas as respostas autenticadas, RBAC via `requireServerRole`/`requireTrustedSsrAdmin`, sem papel confiado ao browser).

### G4 — Deploy normal

Verificado nesta sessão (2026-07-19), no HEAD pós-commits de REC-204/REC-406/REC-408:

| Item exigido | Resultado |
|---|---|
| `npm run lint` | ✅ limpo |
| `npm run typecheck` | ✅ limpo |
| `npm run test:unit` | ✅ 746/746 (74 arquivos) |
| `npm test` | ✅ |
| `npm run build` | ✅ |
| `npm run build:workers` | ✅ bundle Cloudflare gerado sem erro |
| Testes de banco/RLS (`npm run test:db`) | ✅ 113/113 pgTAP + teste de concorrência REC-105, Docker local isolado |
| Testes de contrato (OpenAPI) | ✅ 15/15 |
| `npm run docs:api:check-drift` | ✅ 13 rotas reconciliadas |
| E2E smoke / acessibilidade das jornadas críticas | ⚠️ **Não executado nesta sessão** — Playwright precisa de dados de fixture reais; `.env.local` local aponta para o projeto de teste `site-teste` (schema baseline mínimo, sem fixtures de demo), o que produziria falso sinal. Requer execução em ambiente com fixtures completas antes do próximo deploy real. |
| Migration validada em homologação | ⚠️ **Parcial** — as 32 migrations foram aplicadas e validadas no projeto `site-teste` durante REC-204, mas esse não é o ambiente formal de homologação da equipe. |
| Secret scan limpo | ⚠️ **Gap de ferramenta, não de achado** — não existe gitleaks/trufflehog no CI; o único mecanismo é o hook de pre-commit local, que é aviso, não bloqueio. Nenhum segredo real foi encontrado nas verificações desta sessão, mas a ausência de ferramenta automatizada é uma lacuna real. Vira ação preventiva (item 4 abaixo). |
| CodeRabbit sem issue CRITICAL | N/A — desabilitado em `core-config.yaml` (decisão já registrada do projeto, não desta story) |
| Smoke pós-deploy aprovado | ⚠️ **Não executável nesta sessão** — exige deploy real em produção. |

**Conclusão de G4:** os itens executáveis localmente estão todos verdes. Os itens que exigem infraestrutura viva (E2E com fixtures reais, homologação formal, smoke pós-deploy) não foram executados por não haver acesso a esse ambiente nesta sessão — viram ação preventiva/checklist obrigatório antes do próximo deploy real de produção, não uma lacuna silenciosa.

## 4. Ações preventivas (owner e prazo)

Coordenador geral: **Pedro Augusto** (proprietário da conta administrativa e do projeto). Prazos propostos por severidade, sujeitos a ajuste pelo coordenador.

| # | Ação | Origem | Severidade | Owner | Prazo |
|---|---|---|---|---|---|
| 1 | ~~Exigir AAL2 (MFA) no login do app~~ — **RESOLVIDO em 2026-07-19**: verificado que `signInSSR()` já exige AAL2 fail-closed (D3/ADR-016) e, desde o cutover REC-204 Fase B, é o único caminho de login (`signInWithPassword` direto sem checagem de AAL foi removido). Confirmado por 24/24 testes + leitura de código, sem necessidade de código novo. | SEC-104 (follow-up REC-002) | Alta | Pedro Augusto | ~~2026-08-16~~ Fechado 2026-07-19 |
| 2 | Tratar follow-up de REC-101 (revogação RPC pública) | SEC-107 | Alta | Pedro Augusto | 2026-08-16 |
| 3 | ~~Decidir status da Edge Function `auth-session` (decomissionar ou aplicar MFA)~~ — **RESOLVIDO em 2026-07-19**: Edge Function `auth-session` DECOMISSIONADA (diretório `supabase/functions/auth-session/`, seção `[functions.auth-session]` do `config.toml`, referência de deploy em `deploy-functions.yml` e o emissor HMAC `encodeSession`/helpers em `_shared/auth.ts` removidos). Confirmado por grep que nenhum caminho de produção real consumia o endpoint (só `admin-resources` via `requireTrustedSsrAdmin`). `AUTH_SESSION_SECRET` fica órfão (remoção do cofre/env é ação de @devops). | SEC-204a (REC-204 revisão de segurança) | Alta | Pedro Augusto | ~~2026-08-16~~ Fechado 2026-07-19 |
| 4 | Renovar ou resolver definitivamente as dependências vulneráveis cobertas pelo waiver de REC-407 | REC-407 waiver | Alta | Pedro Augusto | **2026-08-16 (data já comprometida no waiver original)** |
| 5 | Adicionar ferramenta de secret-scan real ao CI (gitleaks ou trufflehog), substituindo o hook local não-bloqueante | Gap de G4 identificado nesta story | Alta | Pedro Augusto | 2026-08-16 |
| 6 | Resolver a regressão de realtime do dashboard admin (subscriptions sem autenticação, RLS bloqueia cliente anon) — junto da consolidação do transporte realtime | REC-204 follow-up, ligado a REC-206 | Média | Pedro Augusto | 2026-08-30 |
| 7 | Decidir definitivamente sobre REC-005 (saneamento de histórico Git) — executar ou manter waiver permanente | REC-005 | Média (decisão), Alta (se executada, por ser destrutiva) | Pedro Augusto | 2026-08-30 (reavaliação, não necessariamente execução) |
| 8 | Executar REC-501 (decompor AppStore incrementalmente, via strangler stories) | REC-501 (P2 sustentabilidade) | Média | Pedro Augusto | 2026-08-30 |
| 9 | Corrigir P-308-1/P-308-2 (ícones decorativos sem `aria-hidden`, overlay `Play`) | REC-308 follow-up | Baixa | — | Backlog, sem prazo fixo |
| 10 | Atualizar `env-validation.ts` para não marcar `AUTH_SESSION_SECRET` como crítico no caminho Next/BFF (órfão desde REC-204) | REC-408 revisão | Baixa | — | Backlog, sem prazo fixo |
| 11 | Ajustar `WeakSet` compartilhado em `logger.ts` `redact()` para não marcar DAG legítimo como `[Circular]` | REC-408 revisão | Baixa | — | Backlog, sem prazo fixo |
| 12 | Decidir commit ou descarte dos 16 baselines PNG regenerados em `tests/baseline/` | REC-301 | Baixa | — | Backlog, sem prazo fixo |
| 13 | Executar E2E smoke e acessibilidade contra ambiente com fixtures reais, e validar migration em homologação formal, antes do próximo deploy de produção | Gap de G4 identificado nesta story | Alta (bloqueia próximo deploy real) | Pedro Augusto | Antes do próximo deploy de produção |
| 14 | Reescrever ou remover `tests/admin-crud.spec.ts` e `tests/api-contract.spec.ts` — ambos testam um fluxo de login com cookie HMAC forjado manualmente (`SESSION_COOKIE`/`buildAdminSessionToken` locais via `node:crypto`) que a app não aceita mais desde REC-204 Fase B; obsoletos e só não falham no CI por estarem gated atrás de `hasRealIntegrationEnv()`. Devem passar a exercitar autenticação SSR real ou ser removidos se o cenário não fizer mais sentido | Descoberta durante SEC-204a (decomissionamento auth-session) | Média | Pedro Augusto | 2026-08-30 |

**Item 5 — CONCLUÍDO em 2026-07-19:** job `secret-scan` (gitleaks, via `gitleaks/gitleaks-action@v3.0.0`) adicionado a `.github/workflows/ci.yml`, rodando nos mesmos triggers do restante do pipeline (push em `develop`/`feature/**`, pull request para `main`/`develop`). Diferente do hook local (`.git/hooks/pre-commit`), que apenas avisa, este job **bloqueia** o CI se um segredo for detectado. Escaneia o diff/branch relevante do evento, não o histórico completo do repositório (saneamento de histórico completo é escopo separado do item 7 / REC-005, que segue em waiver).

## 5. Waiver formal de REC-005

**Decisão:** REC-005 (saneamento de histórico Git — reescrita de branches/tags, substituição de clones antigos) permanece **pausada por waiver explícito**, não por omissão.

**Justificativa:** é uma operação destrutiva (reescrita de histórico, force-push), com risco de perda de trabalho ou quebra de referências para colaboradores com clones existentes. O item 7 da tabela de ações preventivas agenda uma reavaliação em 2026-08-30 para decidir entre executar com o devido cuidado operacional (coordenado por `@devops`) ou manter o waiver permanentemente, aceitando o risco residual de segredo histórico em commits antigos (já rotacionados/invalidados por REC-002, portanto sem valor de exploração direta, mesmo que ainda visíveis no histórico).

**Autor da decisão:** Pedro Augusto, 2026-07-19, coletada via `@aiox-master`.

## 6. Veredito G5

**Declarado por:** `@qa` (Quinn), via `@aiox-master`, 2026-07-19.

**Veredito: CONCERNS — encerramento formal aprovado com pendências rastreadas.**

Justificativa: G0–G3 satisfeitos com evidência completa das stories `Done`. G4 tem todos os itens executáveis localmente verdes; os três itens que exigem infraestrutura viva (E2E com fixtures reais, homologação formal, smoke pós-deploy) estão documentados como gap explícito, não omissão, e viram ação preventiva obrigatória (item 13) antes do próximo deploy real — isso é consistente com o padrão `CONCERNS` já usado por outras stories da épica (aprovação com pendência registrada, não bloqueio). REC-005 tem waiver explícito e datado (não é omissão). Toda ação preventiva tem owner e prazo, ou backlog explícito por severidade baixa, satisfazendo AC4.

**Não é PASS puro** porque três itens de G4 não puderam ser executados nesta sessão por falta de ambiente adequado — isso é uma limitação de execução, não um defeito encontrado, mas impede o veredito mais forte.

## Change Log

| Date | Version | Description | Author |
|---|---:|---|---|
| 2026-07-19 | 0.1 | Story criada e executada na mesma sessão: G0–G4 consolidados com evidência fresca, impacto documentado, 13 ações preventivas registradas com owner/prazo por decisão do coordenador, waiver de REC-005 formalizado, G5 declarado CONCERNS por `@qa`. | @aiox-master (Orion), consolidando @po + @qa, coordenador Pedro Augusto |
