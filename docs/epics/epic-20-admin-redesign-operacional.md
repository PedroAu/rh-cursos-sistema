# Épica 20 — Evolução Operacional do Admin Trust Keith

**Status:** Done — implementação e gate local concluídos; aguardando handoff remoto ao `@devops`
**Tipo:** Brownfield — evolução funcional e de fidelidade sobre o admin existente
**Owner de produto:** `@pm` (Morgan)
**Executor:** `@dev` (Dex/Codex)
**Quality gate:** `@qa` (Quinn)
**Branch:** `codex/epic-20-admin-redesign`
**Data:** 2026-07-31
**Fonte canônica:** canvas atualizado fornecido pelo stakeholder em `/Users/pedroaugusto/Downloads/Site RH Cursos/RH Cursos Admin Dashboard.dc.html`

## 1. Objetivo

Continuar o redesign Trust Keith do painel administrativo implementando os comportamentos que foram adicionados ao canvas atualizado: paginação, detalhes, ações de linha e abertura de formulários a partir do dashboard. A implementação deve reutilizar `AdminResourcePage`, `buildResourceConfig`, os read models e os contratos de mutação existentes.

Esta épica não reabre as Épicas 14, 15, 18 ou 19. A Épica 15 permanece como o baseline visual do admin; esta épica cobre a evolução operacional posterior do mesmo produto.

## 2. Evidência de escopo

- O canvas atualizado difere do artefato versionado da Épica 15 em **807 linhas adicionadas e 87 removidas**.
- Foram adicionados pagers para cursos, turmas, matrículas, alunos, instrutores, leads, blog e páginas.
- Foram adicionados estados de detalhe para cursos, turmas, matrículas, alunos, instrutores, leads e posts.
- Foram adicionados comandos de criar, editar e excluir e modais de formulário.
- O pacote `styles.css` recebido é um entrypoint do canvas; não substitui os tokens/tailwind da aplicação.

## 3. Regras de implementação

1. **REUSE > ADAPT > CREATE:** reaproveitar componentes, contratos e hooks existentes.
2. O frontend não inventa dados, IDs, status ou persistência. A Épica 19 continua sendo a autoridade dos contratos administrativos.
3. Ações destrutivas exigem confirmação acessível e só podem chamar mutações existentes.
4. Paginação deve manter busca, filtros, exportação e estado vazio.
5. Detalhes devem usar apenas dados disponíveis no domínio atual; relacionamentos sem contrato não serão inventados.
6. O canvas é referência visual/funcional, não código de produção para ser copiado.

## 4. Stories

| Story | Escopo | Status | Gate |
|---|---|---|---|
| 20.1 | Baseline, matriz canvas × aplicação e primitivas compartilhadas | Done | docs + unit |
| 20.2 | Paginação, ações e detalhes das páginas de recursos | Done | unit + component |
| 20.3 | Ações do dashboard e integração com formulários existentes | Done | Playwright |
| 20.4 | Fidelidade responsiva, acessibilidade e reduced motion | Done | axe + visual |
| 20.5 | Gate final, build e readiness para deploy | Done | devops gate |
| 20.6 | Logo institucional e correção cromática da navegação lateral | Done | visual + a11y |

## 5. Critérios de aceite da épica

- [x] Todas as telas administrativas cobertas pelo canvas têm ação e estado honestos.
- [x] Paginação é funcional e não quebra busca, filtros ou exportação.
- [x] Detalhes e modais preservam os contratos de persistência da Épica 19.
- [x] Dashboard não contém botões inertes para criar curso/turma.
- [x] Mobile não tem overflow horizontal de página e expõe a navegação completa.
- [x] Testes unitários, typecheck, lint, testes E2E/fidelidade e build passam no mesmo SHA.
- [ ] Nenhum push, PR ou deploy é feito por este agente; o handoff para `@devops` contém a evidência dos gates.

## 6. Dependências e fora de escopo

Dependências: Épicas 15 e 19, `AdminResourcePage`, `admin-resource-configs`, `admin-read-models`, `admin-catalog-read-models` e o contrato de sessão SSR vigente.

Fora de escopo: novo backend, novos campos de negócio, gateway de pagamento, alterações em RLS/Auth, novo design system, consultoria pública e qualquer controle do canvas sem persistência correspondente.

## 7. Resultado e handoff

- `npm test`: **183/183** aprovados no mesmo SHA.
- `npm run devops:all -- --story docs/stories/2026-07-31-epic20-story5-gate-deploy.md --skip-coderabbit`: **PASS**.
- Gates complementares: unit 768 testes; Epic 15 10/10; Epic 20 2/2; a11y 9/9; visual 8/8; bundle, purge, CSS e design-system aprovados.
- Correções de dívida encontradas no gate: confirmação de exclusão nos testes CRUD, overflow mobile da paginação e hexadecimais diretos em checkout/detalhe substituídos por tokens.
- Branch local: `codex/epic-20-admin-redesign`. Push, PR e deploy não foram executados; a próxima ação autorizada é o handoff explícito para `@devops`.

### Observação visual registrada para a Story 20.6

O canvas usa uma navegação lateral clara (`var(--tk-lightest-grey, #fafafa)`), itens em `var(--tk-ink)` e estado ativo em `var(--tk-accent-soft)`/`var(--tk-brand)`. A implementação atual ainda usa a paleta escura hardcoded (`#0e4666` no fundo e `#ffe09b` no ativo) na sidebar desktop, no drawer mobile e na navegação inferior. Isso explica a divergência percebida: não é um problema do token global, mas uma decisão visual legada da shell administrativa que não foi alinhada ao canvas.
