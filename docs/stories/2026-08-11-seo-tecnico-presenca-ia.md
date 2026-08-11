# Story: Corrigir SEO técnico e presença digital do site público

## Status
Done

## Story
**Como** pessoa que busca capacitação para órgãos públicos e empresas,
**quero** encontrar páginas com títulos, conteúdo e dados estruturados claros,
**para** localizar os cursos da RH Cursos em buscadores tradicionais e de IA.

## Acceptance Criteria

1. As rotas públicas principais possuem title, meta description e canonical próprios.
2. A home e as páginas institucionais exibem H1 e texto orientado às palavras-chave do relatório.
3. `/robots.txt`, `/sitemap.xml` e `/llms.txt` existem e não bloqueiam crawlers de busca por IA.
4. A organização possui JSON-LD global e as páginas de curso possuem `Course` e `FAQPage`.
5. Os nomes públicos de cursos expandem “DP” para “Departamento Pessoal” e usam “Curso de …” sem alterar slugs.

## Tasks / Subtasks

- [x] Ler auditoria e mapear rotas públicas.
- [x] Criar utilitários de nomes, metadados e JSON-LD.
- [x] Aplicar metadata/canonical e conteúdo SEO nas rotas principais.
- [x] Criar robots, sitemap e llms.txt.
- [x] Executar lint, typecheck e testes unitários.
- [x] Atualizar a lista de arquivos e concluir a story após os gates.

## File List

- `src/lib/seo.ts`
- `app/layout.tsx`
- `app/page.tsx`
- `app/cursos/page.tsx`
- `app/cursos/[slug]/page.tsx`
- `app/cursos/[slug]/checkout/page.tsx`
- `app/sobre/page.tsx`
- `app/in-company/page.tsx`
- `app/consultoria/page.tsx`
- `app/agenda/page.tsx`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/contato/page.tsx`
- `app/falar-com-especialista/page.tsx`
- `app/inscricao-confirmada/page.tsx`
- `app/robots.txt/route.ts`
- `app/sitemap.ts`
- `public/llms.txt`
- `next.config.mjs`
- `src/views/public/Home.tsx`
- `src/views/public/Courses.tsx`
- `src/views/public/CourseDetail.tsx`
- `src/views/public/Agenda.tsx`
- `src/views/public/About.tsx`
- `src/views/public/InCompany.tsx`
- `src/views/public/Blog.tsx`
- `src/features/public-shell/components/public-header.tsx`
- `src/features/public-shell/components/public-footer.tsx`
- `src/lib/router-compat.tsx`
- `src/__tests__/lib/seo.test.ts`
- `src/__tests__/lib/public-pre-enrollment-contract.test.ts`
- `src/__tests__/views/public/courses.test.tsx`
