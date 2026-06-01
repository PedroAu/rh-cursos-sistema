# Story: Cronograma de construcao ate 20/05/2026

## Status
Draft

## Contexto
O usuario solicitou que a equipe de Scrum analisasse o projeto e criasse o cronograma completo de construcao ate 20/05/2026.

Analise realizada em 14/05/2026:
- Runtime oficial: Next.js App Router, conforme `package.json` e story `2026-05-13-next-migration-hardening.md`.
- App ativo: rotas em `app/` renderizando a experiencia aprovada em `src/views` e componentes compartilhados em `src/components`.
- Dados e integracao: Supabase preparado com migrations versionadas e fallback local por mocks/localStorage.
- Testes: Playwright cobre rotas publicas e autenticacao por papel.
- Stories existentes: layout Stitch, diretrizes Apple, Supabase e migracao/hardening estao em `Ready for Review`.
- Risco de repositorio: `git status` mostra grande volume de arquivos adicionados/nao rastreados, incluindo framework AIOX, app, docs, legacy, tests e configuracoes. Ha necessidade de higiene antes do corte final.

## Objetivo do Sprint
Entregar uma versao release candidate do site RH Cursos ate 20/05/2026, com Next.js como runtime oficial, fluxos publicos e dashboards protegidos validados, Supabase preparado, documentacao de entrega atualizada e quality gates verdes.

## Escopo Derivado dos Artefatos Existentes
- Fechar revisao das stories ja implementadas em `Ready for Review`.
- Validar experiencia publica: Home, Cursos, Detalhe do curso, Agenda, Blog, In-Company, Sobre, Contato, Login e confirmacao de inscricao.
- Validar dashboards protegidos: Admin, Aluno e Instrutor.
- Validar APIs server-side: autenticacao, leads e inscricoes.
- Validar banco Supabase e migrations existentes.
- Resolver ou documentar riscos restantes: audit moderado em `next/postcss`, avisos de `<img>`, fallback demo/local e higiene do repositorio.
- Preparar release checklist e pacote de handoff.

## Fora de Escopo
- Criar funcionalidades novas sem story especifica.
- Trocar visual aprovado apenas para eliminar warnings de `<img>`.
- Aplicar `npm audit fix --force`, pois a saida atual sugere downgrade quebrador para `next@9.3.3`.
- Fazer `git push`, PR ou release fora da autoridade de `@devops`.

## Time Scrum / AIOX
- `@pm` Morgan: priorizacao, aceite de escopo e trade-offs.
- `@po` Pax: validacao de stories, criterios de aceite e decisao GO/NO-GO.
- `@sm` River: cronograma, impedimentos, daily checks e fechamento da sprint.
- `@architect` Aria: revisao de arquitetura Next/Supabase e riscos tecnicos.
- `@data-engineer` Dara: validacao de schema, migrations, RLS e variaveis Supabase.
- `@ux-design-expert` Uma: revisao visual e responsiva das telas aprovadas.
- `@dev` Dex: correcoes pontuais autorizadas por story.
- `@qa` Quinn: plano de testes, regressao, verdict de qualidade.
- `@devops` Gage: higiene de repositorio, release checklist, push/PR/deploy quando autorizado.

## Cronograma

### 14/05/2026 - Diagnostico e planejamento
- Responsavel principal: `@sm`.
- Apoio: `@po`, `@qa`, `@architect`, `@devops`.
- Atividades:
  - Consolidar analise do estado atual do projeto.
  - Rodar gates: `npm run lint`, `npm run typecheck`, `npm test`, `npm audit --omit=dev`.
  - Criar este cronograma como story rastreavel.
  - Classificar riscos bloqueantes e nao bloqueantes.
- Saida esperada:
  - Cronograma aprovado para execucao.
  - Baseline tecnico documentado.

### 15/05/2026 - Revisao funcional e visual
- Responsavel principal: `@qa`.
- Apoio: `@ux-design-expert`, `@po`.
- Atividades:
  - Revisar rotas publicas principais em desktop e mobile.
  - Validar catalogo, filtros, detalhe do curso, checkout/inscricao, contato e In-Company.
  - Validar dashboards Admin, Aluno e Instrutor com papel correto e papel incorreto.
  - Abrir findings como checklist nesta story ou novas stories, sem alterar escopo sem aprovacao.
- Saida esperada:
  - Lista de ajustes finais classificados como Blocker, Must Fix ou Advisory.
  - Decisao `@po`: GO condicionado ou NO-GO para hardening.

### 16/05/2026 - Hardening tecnico
- Responsavel principal: `@dev`.
- Apoio: `@architect`, `@data-engineer`.
- Atividades:
  - Corrigir apenas findings Blocker/Must Fix aprovados.
  - Validar APIs `/api/auth/session`, `/api/leads` e `/api/enrollments`.
  - Revisar variaveis `.env.example` e comportamento com/sem Supabase configurado.
  - Confirmar migrations Supabase existentes e ordem de aplicacao.
- Saida esperada:
  - Correcoes implementadas com File List atualizada.
  - `npm run lint` e `npm run typecheck` verdes apos mudancas.

### 17/05/2026 - Regressao automatizada e manual
- Responsavel principal: `@qa`.
- Apoio: `@dev`.
- Atividades:
  - Rodar `npm test`.
  - Fazer regressao manual nos fluxos criticos:
    - navegar catalogo e detalhe;
    - enviar lead;
    - iniciar inscricao;
    - login demo por papel;
    - bloqueio de acesso por papel incorreto.
  - Conferir responsividade das paginas principais.
- Saida esperada:
  - Relatorio QA com verdict PASS/FAIL.
  - Se FAIL, iniciar QA Loop `@qa` <-> `@dev` limitado aos achados criticos.

### 18/05/2026 - Preparacao de release candidate
- Responsavel principal: `@devops`.
- Apoio: `@sm`, `@qa`.
- Atividades:
  - Limpar/organizar arquivos gerados, respeitando alteracoes existentes.
  - Revisar `.gitignore`, artefatos `test-results/`, `legacy/` e docs.
  - Conferir que stories implementadas possuem status, checklists e File List coerentes.
  - Rodar gates finais: `npm run lint`, `npm run typecheck`, `npm test`, `npm audit --omit=dev`.
- Saida esperada:
  - Release candidate local pronto.
  - Riscos residuais documentados.

### 19/05/2026 - UAT e aceite
- Responsavel principal: `@po`.
- Apoio: `@pm`, `@qa`, `@ux-design-expert`.
- Atividades:
  - Executar roteiro de aceite com foco em jornada do usuario.
  - Conferir conteudo, CTAs, formularios e dashboards.
  - Confirmar que nao ha requisito inventado fora dos artefatos existentes.
  - Decidir GO/NO-GO para entrega em 20/05.
- Saida esperada:
  - Aceite do produto ou lista curta de ajustes finais.

### 20/05/2026 - Entrega final
- Responsavel principal: `@devops`.
- Apoio: `@sm`, `@qa`, `@po`.
- Atividades:
  - Rodar quality gates finais.
  - Atualizar status das stories aprovadas.
  - Preparar changelog/handoff.
  - Fazer push/PR/deploy somente por `@devops`, se autorizado.
- Saida esperada:
  - Entrega final ate 20/05/2026.
  - Evidencias dos gates anexadas nas stories.
  - Riscos residuais explicitamente aceitos ou bloqueio formal registrado.

## Baseline de Qualidade em 14/05/2026
- `npm run lint`: passou com 7 warnings de `<img>` preservados para nao alterar visual aprovado.
- `npm run typecheck`: passou.
- `npm test`: passou; executou typecheck, `next build` e 17 testes Playwright.
- `npm audit --omit=dev`: falhou com 2 vulnerabilidades moderadas em `next/node_modules/postcss`; fix automatico sugere `npm audit fix --force` com downgrade quebrador para `next@9.3.3`, portanto deve ser tratado como risco residual ou aguardando upgrade seguro de Next/PostCSS.

## Riscos e Mitigacoes
- Repositorio com muitos arquivos adicionados/nao rastreados.
  - Mitigacao: `@devops` deve revisar escopo de commit, ignorar artefatos temporarios e separar mudancas de framework/projeto se necessario.
- Vulnerabilidade moderada transitiva em PostCSS dentro de Next.
  - Mitigacao: nao usar `--force`; monitorar versao segura de Next e documentar aceite temporario.
- Supabase pode nao estar configurado em ambiente real.
  - Mitigacao: validar `.env.example`, migrations e fallback local; UAT deve testar com variaveis reais quando disponiveis.
- Avisos de `<img>`.
  - Mitigacao: manter como Advisory enquanto o visual aprovado for prioridade; converter para `next/image` apenas em story propria.
- Stories antigas mencionam scripts Vite ausentes.
  - Mitigacao: considerar a story de migracao Next como fonte mais recente; atualizar notas antigas apenas se necessario no fechamento.

## Definition of Done
- [ ] Todas as stories relevantes estao em `Ready for Review` ou `Done`, com checklists e File List atualizados.
- [ ] `npm run lint` passa sem erros.
- [ ] `npm run typecheck` passa.
- [ ] `npm test` passa.
- [ ] `npm run build` passa implicitamente dentro de `npm test` ou explicitamente no fechamento.
- [ ] Riscos residuais aceitos por `@po`/`@pm`.
- [ ] Handoff de release documentado.
- [ ] `@devops` executa push/PR/deploy somente se autorizado.

## File List
- `docs/stories/2026-05-14-cronograma-construcao-ate-2026-05-20.md`

## QA Results

### Review Date: 14/05/2026

### Reviewed By: Quinn (Test Architect & Quality Advisor)

### Gate Decision
CONCERNS - O site renderiza e as rotas principais passam, mas ha falha de persistencia Supabase no ambiente atualmente configurado.

### Evidencias Executadas
- `npm run lint`: passou com 7 warnings `@next/next/no-img-element`.
- `npm run typecheck`: passou.
- `npm test`: passou; executou `next build` e 17 testes Playwright de rotas publicas e autenticacao por papel.
- Varredura HTTP complementar:
  - 9 rotas publicas estaticas: sem falhas inesperadas.
  - 10 rotas protegidas sem sessao: redirecionaram corretamente para `/login?status=required`.
  - 8 rotas admin com sessao admin: status 200.
  - `/aluno` com sessao student e `/instrutor` com sessao instructor: status 200.
  - 80 rotas dinamicas de cursos e 8 rotas dinamicas de blog: status 200, sem falhas.
- Browser smoke desktop/mobile:
  - Paginas renderizaram com status 200 e conteudo nao vazio.
  - Console registrou 404s repetidos de chamadas Supabase.

### Findings

1. MUST FIX - Ambiente Supabase configurado nao possui schema esperado.
   - Evidencia: chamadas browser retornam 404 para `public.curso`, `public.turma`, `public.instrutor`, `public.curso_instrutor` e `public.lead`.
   - Evidencia server-side: `POST /api/leads` com payload valido retorna 500 com `PGRST205: Could not find the table 'public.lead' in the schema cache`.
   - Evidencia server-side: `POST /api/enrollments` com payload valido retorna 500 com `PGRST202: Could not find the function public.registrar_inscricao_publica(...) in the schema cache`.
   - Impacto: leads e inscricoes parecem salvar localmente na UI, mas nao persistem no Supabase quando o ambiente esta configurado. Isso bloqueia release produtivo com Supabase real.
   - Recomendacao: `@data-engineer` deve aplicar/verificar migrations no projeto Supabase configurado e validar schema cache antes do hardening de `@dev`.

2. ADVISORY - Warnings de imagem continuam no lint.
   - Evidencia: 7 warnings `@next/next/no-img-element` em componentes/telas aprovadas.
   - Impacto: performance/LCP pode ser inferior ao ideal, mas nao quebra fluxo funcional.
   - Recomendacao: manter fora do caminho critico ou criar story propria para migrar imagens para `next/image`.

3. ADVISORY - `npm audit --omit=dev` ainda acusa vulnerabilidade moderada transitiva em PostCSS via Next.
   - Evidencia: fix automatico sugere `npm audit fix --force` com downgrade quebrador para `next@9.3.3`.
   - Impacto: risco residual conhecido.
   - Recomendacao: nao aplicar `--force`; monitorar upgrade seguro de Next/PostCSS e documentar aceite temporario se necessario.

### Impacto no Cronograma
- Alteracao recomendada sem mudar a data final de 20/05/2026:
  - Antecipar para 15/05/2026 uma frente obrigatoria de `@data-engineer` + `@dev`: aplicar migrations no Supabase configurado, confirmar tabelas/funcoes via API e repetir smoke de lead/inscricao.
  - Manter 16/05/2026 para hardening tecnico, agora priorizando persistencia Supabase antes de ajustes visuais advisory.
  - Manter 17/05/2026 para regressao completa somente apos `POST /api/leads` e `POST /api/enrollments` retornarem sucesso ou fallback server-side explicitamente aprovado por `@po`.

### QA Verdict
Nao recomendo avancar para release candidate enquanto o ambiente Supabase configurado retornar 404/500 para catalogo, leads e inscricoes. O cronograma ainda comporta correcao ate 20/05/2026 se a frente de banco for tratada como prioridade em 15/05 e 16/05.
