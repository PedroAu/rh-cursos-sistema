# Relatório de auditoria — Fidelidade, responsividade e acessibilidade (Story 18.2)

**Story:** 18.2 — Auditar e restaurar a prova do redesign Trust Keith
**Executor:** `@ux-design-expert` · **Data:** 2026-07-19 · **SHA base:** `b86d07e`
**Escopo:** auditoria brownfield. **Nenhuma UI de produção foi alterada.** Toda divergência é
registrada como finding; remediação é escopo futuro do `@po`.

Artefatos relacionados:
- Decision log: `docs/history/decisions/decision-log-epic18-2-linha-visual-canonica.md`
- Matriz de cobertura: `docs/design/redesign/MATRIX-rota-canvas-spec.md`
- Manifesto de captura: `artifacts/epic14-fidelity/manifest.json`
- Screenshots rota×canvas: `artifacts/epic14-fidelity/*-route.png` + `*-canvas.png`

---

## 1. Resumo executivo

O redesign Trust Keith está implementado **estruturalmente** (tokens `--tk-*`, Radix/Tailwind/cva,
Mantine/Emotion purgados). A **prova reproduzível de fidelidade visual** foi restaurada: o harness
`scripts/capture-epic14-fidelity.mjs` voltou a gerar o par **rota × canvas** no mesmo viewport,
com status HTTP validado e verdict explícito por alvo. **Nenhum alvo é PASS automático** — o harness
nunca afirma fidelidade pixel-a-pixel sozinho, e `canvasAvailable:false` nunca é PASS.

Todos os gates técnicos passam, mas a auditoria expõe lacunas de **referência** (specs públicas
ausentes, telas admin sem canvas isolado) e de **captura** (auth SSR do admin, fixtures de slug)
que impedem elevar qualquer rota a PASS de fidelidade nesta story.

---

## 2. Resultado dos gates (AC 8)

| Gate | Comando | Resultado | Evidência |
|---|---|---|---|
| Captura rota×canvas | `npm run test:epic14:fidelity:capture` | **OK** — 10 alvos, 20 screenshots, manifesto com verdict | `artifacts/epic14-fidelity/manifest.json` |
| Contratos funcionais | `npm run test:epic14:fidelity` | **8 passed** (0 fail), > 0 testes, falha propagada | epic5-search-motion + epic14-mantine-removal.smoke |
| Acessibilidade axe | `npm run test:a11y` | **9 passed** (0 violações WCAG 2.1 A/AA) | 7 rotas públicas + sanity + relatório |
| Baseline a11y/teclado desktop | `node scripts/run-playwright.mjs a11y.baseline.spec.ts keyboard.baseline.spec.ts --project=baseline-desktop` | **14 passed** | 7 rotas públicas, guard admin não autenticado e navegação por teclado |
| Baseline a11y/teclado mobile | `node scripts/run-playwright.mjs a11y.baseline.spec.ts keyboard.baseline.spec.ts --project=baseline-mobile` | **14 passed** | Pixel 5; 7 rotas públicas, guard admin não autenticado e navegação por teclado |
| Purga Mantine/Emotion | `npm run purge:gate` | **PASS** — 337 arquivos, zero `@mantine`/`@emotion` | `scripts/purge-gate.mjs` |
| Budgets de bundle | `npm run bundle:check` | **PASS** — 625.3 KB / 1000 KB (maior chunk 79.0 KB / 175 KB) | `scripts/check-bundle-size.mjs` |
| Gate constitucional `@dev` | `npm run lint && npm run typecheck && npm run build` | **PASS** | ESLint, tipos e build de produção verdes |
| Regressão integral `@dev` | `npm test` | **BLOCKED** após build: imports de `SESSION_COOKIE` permanecem em `route-auth.spec.ts` e `smoke-crawl.spec.ts` | Bloqueio do contrato SSR rastreado por **F-AUTH-03 / Story 18.3**; a validação E2E da 18.3 também depende do Supabase local, indisponível nesta sessão; nenhuma restauração de HMAC/demo-auth autorizada |

**SHA/data de execução:** `b86d07e` · 2026-07-19. Nenhum check é declarado PASS sem execução.
Os checks específicos desta auditoria passam, mas o quality gate global permanece bloqueado. Após
a execução da Story 18.3, `npm test` ainda para antes da suíte Playwright porque
`route-auth.spec.ts` e `smoke-crawl.spec.ts` importam `SESSION_COOKIE`; a própria 18.3 não pôde
fechar seu gate E2E porque o Supabase local não iniciou. A 18.2 não altera esses testes nem
reintroduz o contrato legado.

### Verdicts do harness (AC 3/AC 4)

Resumo do manifesto: `{ PASS: 0, CONCERNS: 10, FAIL: 0, NOT_ASSESSABLE: 0 }`.
Verificação automatizada: **0** alvos com `canvasAvailable:false && verdict==PASS`.

| Alvo | Rota | Canvas | Status rota | Verdict | Motivo resumido |
|---|---|---|---:|---|---|
| home | `/` | Home | 200 | CONCERNS | par disponível; revisão visual manual pendente |
| courses | `/cursos` | Catálogo | 200 | CONCERNS | idem |
| agenda | `/agenda` | Agenda | 200 | CONCERNS | idem |
| in-company | `/in-company` | In-company | 200 | CONCERNS | idem |
| about | `/sobre` | Quem Somos | 200 | CONCERNS | idem |
| blog | `/blog` | Blog | 200 | CONCERNS | idem |
| login | `/login` | Login | 200 | CONCERNS | idem |
| course-detail | `/cursos` (proxy) | Curso | 200 | CONCERNS | slug dinâmico sem fixture (F-CAP-02) |
| checkout | `/cursos` (proxy) | Checkout | 200 | CONCERNS | slug dinâmico sem fixture (F-CAP-02) |
| admin-dashboard | `/admin` | Admin Dashboard | 200 (redir `/login`) | CONCERNS | auth SSR bloqueia rota (F-AUTH-03) |

Todas as capturas de canvas registram 2 warnings não fatais (`support.js`, `logoHorizontal_800X600.png`)
e **0 críticos** (styles.css/tokens/_ds_bundle.js resolveram) — ver F-CANVAS-05.

---

## 3. Amostra de auditoria de risco (AC 5)

| Dimensão | Cobertura executada | Fixture/viewport | Resultado |
|---|---|---|---|
| Fidelidade desktop | Harness rota×canvas | público 1180px / admin 1360px, `colorScheme: light`, `document.fonts.ready` + 1200ms | 10 pares gerados; CONCERNS |
| Axe WCAG 2.1 A/AA | `a11y.spec.ts` | 7 rotas públicas (`/`, `/cursos`, `/agenda`, `/blog`, `/in-company`, `/contato`, `/login`), projeto functional (desktop), tags `wcag2a/2aa/21a/21aa` | 0 violações |
| Teclado / foco | `keyboard.baseline.spec.ts` + `scripts/a11y-audit-focus-rings.js` | desktop functional | baseline vigente (sem regressão nova) |
| `prefers-reduced-motion` | `epic5-search-motion.spec.ts` ("reduced motion elimina animacao essencial no JS") | emulação reduce | PASS |
| Responsividade mobile | `a11y.baseline.spec.ts` + `keyboard.baseline.spec.ts`, projeto `baseline-mobile` | Pixel 5; 7 rotas públicas + estado do guard `/admin` | **14 passed**; medição executada, mas ainda não é gate bloqueante → **F-A11Y-06** |

Determinismo: viewport fixo, `colorScheme:light` (dark mode excluído do produto per Épica 7 §dec.9),
espera de fontes + timeout fixo; diff de dados separado de diff visual (dados dinâmicos não bloqueiam a captura).

---

## 4. Contratos funcionais preservados (AC 7)

`npm run test:epic14:fidelity` (8 testes, todos verdes, falha propagada) cobre os invariantes das Épicas 5 e 14:

| Invariante | Teste |
|---|---|
| Busca local (catálogo/blog) | `epic5-search-motion.spec.ts` — "buscas locais expõem limpar e resumo" |
| Sem busca global no header | `epic5-search-motion.spec.ts` — "header publico nao exibe barra global" |
| `prefers-reduced-motion` | `epic5-search-motion.spec.ts` — "reduced motion elimina animacao" |
| Imagens (sem `<img>` cru / apple-material) | `epic5-search-motion.spec.ts` — "nao reintroduz apple-material nem raw img" |
| Forms (zod: contato, in-company, login) | `epic14-mantine-removal.smoke.spec.ts` |
| Rotas renderizam sem erro de runtime | `epic14-mantine-removal.smoke.spec.ts` |
| Ausência de Mantine/Emotion | `purge:gate` (337 arquivos, zero) |

---

## 5. Findings (AC 6) — nenhuma remediação executada

| ID | Severidade | Rota/Área | Referência | Evidência | Impacto | Recomendação | Owner |
|---|---|---|---|---|---|---|---|
| **F-SPEC-01** | Média | Todas as 9 rotas públicas com canvas | Specs prometidas pela story 14.0.2, ausentes em `docs/design/redesign/` | `MATRIX` §1; só `spec-admin-dashboard.md` existe | Sem spec, "adaptações permitidas" não são rastreáveis; fidelidade não elevável a PASS | Criar specs de página públicas (escopo futuro) | `@po` |
| **F-CAP-02** | Baixa | `/cursos/[slug]`, `/cursos/[slug]/checkout` | Canvases Curso/Checkout | manifesto `course-detail`/`checkout` (rota proxy `/cursos`) | Detalhe e checkout não capturados na rota real | Prover fixture de slug (`EPIC14_FIDELITY_COURSE_PATH`/`_CHECKOUT_PATH`) | `@po` |
| **F-AUTH-03** | Média | `/admin` (e demais admin) | Canvas Admin Dashboard + `spec-admin-dashboard.md` | manifesto `admin-dashboard` (redir `/login?status=required`) | Rota admin não avaliável sem sessão SSR; captura só documenta o redirect | Fornecer contrato de auth SSR ao harness | **Story 18.3** |
| **F-SPEC-04** | Média | 9 telas admin (Cursos…Configurações) | `RH Cursos Admin Dashboard.dc.html` (não isolado) | `MATRIX` §2 | Sem canvas isolado nem spec, telas ficam NOT_ASSESSABLE | Exportar canvases por tela + specs próprias | `@po` |
| **F-CANVAS-05** | Média | Todos os canvases | `docs/design-system/*.dc.html` | warnings do manifesto: `support.js`, `uploads/logoHorizontal_800X600.png`, placeholders `{{ c.* }}` não hidratados | Referência renderiza sem logo e sem hidratação de templates do design-tool → fidelidade da referência degradada | Versionar `support.js`/`uploads/` ou exportar canvas estático auto-contido | `@po` |
| **F-TK-01** | Baixa | Tokens legados | `src/styles/globals.css` (`--ea-*` com hex literal) | decision log §2 | Superfícies legadas em hex fora da fonte `--tk-*`; risco de drift | Consolidar aliases ou remover camada legada (com story dedicada) | `@po` |
| **F-A11Y-06** | Baixa | Governança a11y mobile | `playwright.config.ts` projeto `baseline-mobile` | Execução ad hoc: 14/14; `test:a11y` permanece só functional/desktop e o baseline não bloqueia violações | A amostra mobile desta auditoria foi medida, mas regressões futuras específicas de mobile não são bloqueadas pelo gate padrão | Promover a varredura axe mobile a gate bloqueante em escopo futuro | `@po` |

Severidades: **Média** = bloqueia elevar fidelidade a PASS / lacuna de cobertura relevante; **Baixa** = melhoria de robustez sem impacto imediato de segurança/conversão. **Nenhum finding é Alta/Crítica.**

---

## 6. Conformidade com as proibições da story

- ✅ Nenhum novo redesign iniciado; Trust Keith permanece baseline.
- ✅ Nenhuma UI de produção (`app/`, `src/` visual) alterada — apenas harness + docs + artefatos.
- ✅ Nenhuma referência ausente tratada como PASS (NOT_ASSESSABLE/CONCERNS com owner).
- ✅ Mantine/Emotion não reintroduzidos (purge:gate PASS).
- ✅ HMAC/demo-auth não reintroduzidos; auth admin tratada como finding para a Story 18.3.
