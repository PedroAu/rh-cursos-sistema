# Sign-off de fidelidade visual

**Data da revisão:** 2026-08-12
**Revisor técnico:** `@aiox-master` (Orion)
**Manifesto:** `artifacts/epic14-fidelity/manifest.json`
**Registro consumido pelo harness:** `docs/qa/fidelity-signoff.json`
**Comando:** `npm run fidelity:references && npm run fidelity:specs && E2E_ADMIN_EMAIL="$E2E_ADMIN_EMAIL" ADMIN_PASSWORD="$ADMIN_PASSWORD" NEXT_DIST_DIR=.next-playwright EPIC14_FIDELITY_COURSE_PATH=/cursos/introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico EPIC14_FIDELITY_CHECKOUT_PATH=/cursos/introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico/checkout node scripts/capture-epic14-fidelity.mjs` (credenciais carregadas de `.env.e2e.local`)

## Critério de aprovação

Uma rota recebe sign-off técnico quando: (1) responde HTTP 200; (2) não redireciona
fora da rota solicitada; (3) possui referência no mesmo viewport; (4) o canvas não
faz requests ausentes; (5) não contém placeholders do export; e (6) o screenshot
pareado foi revisado visualmente contra a intenção registrada na spec.

O harness injeta o sign-off explícito do JSON nos alvos correspondentes. Warnings de sub-recursos
não críticos são não-fatais; somente ausência de recurso crítico produz `NOT_ASSESSABLE`. Uma nova
captura sem sign-off volta a `CONCERNS`; sign-off inválido ou com digest divergente nunca é aplicado.

## Rotas com canvas — revisão técnica concluída

| Rota/canvas | Resultado | Evidência |
|---|---|---|
| `/` | Aprovado tecnicamente | `home-route.png` + `home-canvas.png` |
| `/cursos` | Aprovado tecnicamente | `courses-route.png` + `courses-canvas.png` |
| `/cursos/[slug]` | Aprovado tecnicamente com fixture real | `course-detail-route.png` + `course-detail-canvas.png` |
| `/cursos/[slug]/checkout` | Aprovado tecnicamente com fixture real | `checkout-route.png` + `checkout-canvas.png` |
| `/agenda` | Aprovado tecnicamente | `agenda-route.png` + `agenda-canvas.png` |
| `/in-company` | Aprovado tecnicamente | `in-company-route.png` + `in-company-canvas.png` |
| `/sobre` | Aprovado tecnicamente | `about-route.png` + `about-canvas.png` |
| `/blog` | Aprovado tecnicamente | `blog-route.png` + `blog-canvas.png` |
| `/login` | Aprovado tecnicamente | `login-route.png` + `login-canvas.png` |
| `/admin` | Aprovado tecnicamente com auth SSR | `admin-dashboard-route.png` + `admin-dashboard-canvas.png` |
| `/admin/cursos` | Aprovado tecnicamente com auth SSR | `admin-cursos-route.png` + `admin-cursos-canvas.png` |
| `/admin/turmas` | Aprovado tecnicamente com auth SSR | `admin-turmas-route.png` + `admin-turmas-canvas.png` |
| `/admin/inscricoes` | Aprovado tecnicamente com auth SSR | `admin-matriculas-route.png` + `admin-matriculas-canvas.png` |
| `/admin/alunos` | Aprovado tecnicamente com auth SSR | `admin-alunos-route.png` + `admin-alunos-canvas.png` |
| `/admin/instrutores` | Aprovado tecnicamente com auth SSR | `admin-instrutores-route.png` + `admin-instrutores-canvas.png` |
| `/admin/leads` | Aprovado tecnicamente com auth SSR | `admin-leads-route.png` + `admin-leads-canvas.png` |
| `/admin/blog` | Aprovado tecnicamente com auth SSR | `admin-blog-route.png` + `admin-blog-canvas.png` |
| `/admin/paginas` | Aprovado tecnicamente com auth SSR | `admin-paginas-route.png` + `admin-paginas-canvas.png` |
| `/admin/configuracoes` | Aprovado tecnicamente com auth SSR | `admin-configuracoes-route.png` + `admin-configuracoes-canvas.png` |

Manifesto final da captura: **19 PASS, 0 FAIL, 0 NOT_ASSESSABLE, 0 warnings de canvas**.

## Rotas sem canvas dedicado

As seguintes rotas continuam exceções documentadas, sem inventar uma referência visual
que não existe no material de origem: `/blog/[slug]`, `/consultoria`, `/contato`,
`/falar-com-especialista`, `/inscricao-confirmada`, `/aluno` e `/instrutor`. Elas são
cobertas por smoke, auth, acessibilidade e jornadas funcionais quando aplicável; não
entram na comparação canvas e não podem ser classificadas como PASS visual.
