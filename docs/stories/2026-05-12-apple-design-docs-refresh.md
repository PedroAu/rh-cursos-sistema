# Story: Aplicar diretrizes de design da Apple

## Status
Ready for Review

## Contexto
O usuário solicitou análise ampla da documentação oficial Apple Developer e aplicação no projeto. A pesquisa cobriu a documentação Apple Developer e Human Interface Guidelines em design fundamentals, layout, tipografia, cor, materiais, acessibilidade, botões e busca.

## Acceptance Criteria
- [x] Sintetizar princípios Apple relevantes: hierarquia, harmonia, consistência, layout adaptável, materiais, tipografia, cor, busca, botões e acessibilidade.
- [x] Aplicar tokens globais mais legíveis, com contraste, superfícies de sistema e hierarquia visual consistente.
- [x] Ajustar controles compartilhados para alvos confortáveis, foco visível e estados previsíveis.
- [x] Atualizar header, busca, cards e painéis recorrentes para usar materiais/translucidez com legibilidade.
- [x] Preservar rotas e fluxos existentes de busca, filtros, inscrição simulada, atendimento e portal.
- [x] Rodar quality gates disponíveis: lint/typecheck/test/build conforme scripts do projeto.

## Dev Notes
- A aplicação ativa neste repositório é Vite/React em `src/`.
- A pasta `app/` é uma árvore Next paralela, não coberta pelos scripts atuais do `package.json`.
- `npm run lint` executa `tsc --noEmit` e passou.
- `npm run build` passou com o aviso existente de chunk grande do Vite.
- `npm test` e `npm run typecheck` não existem no `package.json`; ambos retornaram "Missing script".
- Atualizacao de planejamento em 26/05/2026: depois desta implementacao, o runtime ativo foi migrado para Next.js pela story de hardening. A releitura da fonte oficial atual inclui a direcao Liquid Glass e foi consolidada em `docs/design/apple-hig-application-plan-2026-05-26.md`, sem alteracoes de interface nesta etapa.
- Validacao do plano no runtime Next em 26/05/2026: `npm run lint` passou com 7 warnings existentes de `<img>` registrados no plano; `npm run typecheck` passou; `npm test` passou com build e 18 testes Playwright.

## File List
- `src/styles/globals.css`
- `tailwind.config.ts`
- `src/components/layout/public-layout.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/card.tsx`
- `src/components/common/section-title.tsx`
- `src/components/common/search-input.tsx`
- `src/components/courses/course-card.tsx`
- `src/components/courses/training-path-card.tsx`
- `src/components/agenda/calendar-view.tsx`
- `src/components/agenda/class-card.tsx`
- `src/pages/public/Home.tsx`
- `src/pages/public/Courses.tsx`
- `src/pages/public/Agenda.tsx`
- `src/pages/public/CourseDetail.tsx`
- `src/pages/public/InCompany.tsx`
- `src/pages/public/Contact.tsx`
- `docs/design/apple-hig-application-plan-2026-05-26.md`
- `docs/stories/2026-05-12-apple-design-docs-refresh.md`
