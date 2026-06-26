# Story: Atualizar layout com base nos artefatos Stitch

## Status
Done

## Contexto
O site deve refletir os documentos e prototipos anexados em `/Users/pedroaugusto/Downloads/stitch_plataforma_de_cursos_e_gest_o`, principalmente `DESIGN.md`, `plano_do_projeto_site_de_cursos.md` e os HTMLs de Home, catalogo, pagina de vendas/checkout, area do aluno e in-company.

## Acceptance Criteria
- [x] Aplicar tokens visuais principais: azul profundo, dourado de prestigio, verde de sucesso, superficies claras e tipografia moderna.
- [x] Atualizar layout publico para parecer uma plataforma executiva de cursos, com header, hero, cards, filtros e CTAs consistentes.
- [x] Atualizar catalogo, detalhe do curso, checkout, login e area do aluno para seguir a mesma linguagem visual.
- [x] Preservar fluxos existentes de busca, filtros, inscricao simulada e acesso aos dashboards.
- [x] Rodar quality gates disponiveis: lint/typecheck/test conforme scripts do projeto.

## Dev Notes
- `npm run lint` executa `tsc --noEmit` neste projeto e passou apos cada bloco corrigido.
- `npm run build` passou apos o fechamento dos blocos.
- Smoke HTTP local passou para `/`, `/cursos`, `/in-company` e `/aluno`.
- `npm test` nao existe no `package.json`.
- `npm run typecheck` nao existe no `package.json`; a checagem de tipos esta coberta por `npm run lint`.
- Auditoria e plano de correcoes registrados em `docs/stories/2026-04-27-layout-template-audit.md`.

## File List
- `tailwind.config.ts`
- `src/styles/globals.css`
- `src/components/layout/public-layout.tsx`
- `src/components/layout/dashboard-shell.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/common/section-title.tsx`
- `src/components/courses/course-card.tsx`
- `src/views/public/Home.tsx`
- `src/views/public/Courses.tsx`
- `src/views/public/CourseDetail.tsx`
- `src/views/public/InCompany.tsx`
- `src/views/public/Login.tsx`
- `src/components/next-page-shell.tsx`
- `src/components/checkout/checkout-modal.tsx`
- `docs/stories/2026-04-27-layout-template-audit.md`

## QA Results

Pass — encerramento documental em 2026-06-24. Story mantida como concluída com evidência histórica de build/smoke e sem gap funcional identificado na auditoria atual.
