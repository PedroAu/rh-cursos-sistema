# EPIC 14 — Redesign Trust Keith: Fidelidade Total + Remoção do Mantine

**Status:** Draft
**Owner:** @aiox-master (Orion) — orquestração
**Executor de implementação:** Codex (stories de @dev serão prompts autossuficientes)
**Branch alvo:** `main` (via PR de branch de entrega)
**Data:** 2026-07-02

---

## 1. Contexto

As páginas de referência do novo design foram mantidas temporariamente em `public/` como canvases de design (`*.dc.html`) que consumiam o design system **Trust Keith** (`_ds/trust-keith-design-system-e3aaece8-.../styles.css` + `_ds_bundle.js`). Esses artefatos foram removidos do repositório nesta limpeza.

### Mapeamento canvas → rota

| Canvas de referência | Rota Next.js | View atual |
|---|---|---|
| `RH Cursos Home.dc.html` | `/` | `src/views/public/Home.tsx` |
| `RH Home Sections.dc.html` | `/` (seções adicionais) | idem |
| `RH Cursos Catálogo.dc.html` | `/cursos` | `src/views/public/Courses.tsx` |
| `RH Cursos Agenda.dc.html` | `/agenda` | `src/views/public/Agenda.tsx` |
| `RH Cursos In-company.dc.html` | `/in-company` | `src/views/public/InCompany.tsx` |
| `RH Cursos Quem Somos.dc.html` | `/sobre` | `src/views/public/About.tsx` |
| `RH Cursos Blog.dc.html` | `/blog` | `src/views/public/Blog.tsx` |

Observação: os canvases acima são agora referências históricas removidas do `public/`; o mapeamento permanece apenas para rastreabilidade documental.

### Fonte do design system (RESOLVIDO em 2026-07-02)

O pacote completo do Trust Keith foi obtido da pasta `~/Downloads/Site RH Cursos V2` e copiado para o repo:

- `docs/design-system/trust-keith/ds-package/` — `_ds_manifest.json` (todos os tokens `--tk-*` com valores), `tokens/{colors,typography,spacing,effects,fonts}.css`, `_ds_bundle.js` (componentes JSX: Avatar, Badge, Button, Card, Checkbox, Input, Logo, Switch, FeatureListItem, ProgressBar, StatBlock, Testimonial, NavBar), `readme.md`
- `docs/design-system/trust-keith/DESIGN.md` — spec completa (cores, tipografia Quincy CF / Merriweather / Inter / Caveat, espaçamento, raios, sombras)
- `docs/design/redesign/reference/screenshots/` — screenshots de referência (agenda, overview)
- `docs/design/redesign/reference/canvases/`, `docs/design/redesign/wireframes/*.dc.html`, `public/uploads/logoHorizontal_800X600.png` — artefatos históricos de renderização dos canvases preservados fora do deploy; `_ds/`, `support.js` e os HTMLs finais já foram removidos de `public/` na 14.3.3
- `public/images/brand/logo-horizontal.png` — logo horizontal oficial (asset definitivo do site)

**⚠️ Nota crítica de tokens:** o DS base usa `--tk-brand: #235875` (azul Trust Keith original). Os canvases aplicam o remap de marca RH via classe `.rh2`, sobrescrevendo `--tk-brand/--tk-cta → #0c6a83`, `--tk-accent → #1791a9`, `--tk-accent-soft → #e0f2f6`. **Os tokens finais do site = tokens do ds-package + remap `.rh2` dos canvases.**

### Nova identidade (extraída dos canvases)

- **Teal profundo** `#0c6a83` (brand/CTA), **teal** `#1791a9`, **teal claro** `#37b7cc`
- **Cinza** `#7f8c94`, **papel** `#f4f1e9` / `#e9e4d8` / linha `#ded8c9`, fundo hero `#F3F0E8`
- Tokens `--tk-*`: `--tk-font-display`, `--tk-font-body`, `--tk-font-serif`, `--tk-radius-pill`, `--tk-radius-glass`, `--tk-radius-card`, `--tk-shadow-glass`, `--tk-shadow-card`, `--tk-ink`, `--tk-ink-muted`, `--tk-surface`, `--tk-border`, escala tipográfica (`--tk-text-display-hero`, `--tk-text-subhead-lg`, `--tk-text-body-sm`, …)
- Componentes DS usados nos canvases (via `x-import`): `Button` (primary/secondary, sm/lg), `Badge` (tone/dot), chips (`rh-chip`, `rh-jchip`), `rh-coursecard`, `rh-paper`, nav `rh-nav`

### Estado atual do código

- **Stack já presente e a manter:** Next.js 16 (App Router em `app/`), Tailwind 3, Radix UI, `class-variance-authority`, `lucide-react`, `framer-motion`, `sonner`, `zod`, Storybook, Playwright, Vitest.
- **Mantine (a remover 100%):** `@mantine/core`, `@mantine/form`, `@mantine/hooks`, `@mantine/notifications`, `@emotion/react` — **22 arquivos** importam Mantine:
  - Provider/tema: `src/components/providers/mantine-provider.tsx`, `src/theme/mantine-theme.ts`, `src/design-tokens/mantine-tokens.css`
  - Admin shell: `dashboard-shell.tsx` (AppShell), `admin-sidebar.tsx`, `admin-topbar.tsx`, `admin-bottom-navigation.tsx`
  - Admin views: `AdminResourcePage.tsx` (Table/Modal/inputs), `AdminSettingsPage.tsx`, `admin-dashboard-page.tsx`
  - Forms: `src/components/ui/form-field.tsx`, `src/components/admin/form-fields.tsx` (`useForm`/`isEmail` de `@mantine/form`)
  - Public: `About`, `Agenda`, `Contact`, `Courses`, `InCompany`, `Login` (1–2 imports cada), `public-mobile-navigation.tsx` (Burger/Drawer), `whatsapp-support.tsx`
  - Portais: `StudentPortal.tsx`, `InstructorPortal.tsx`
  - Infra: `error-boundary.tsx`
- **Tokens atuais desatualizados:** `src/design-tokens/tokens.css` usa paleta antiga (azul `#0066CC` + dourado). Deve ser substituída pela paleta Trust Keith.

### Restrições críticas

1. **Cloudflare Workers Free:** worker < 3 MiB gzip (usuário recusou upgrade). Remover Mantine + Emotion **ajuda** o bundle — validar com `npm run bundle:check` a cada fase.
2. **Go-live 02/07/2026 já executado** — todo trabalho ocorre em branch de redesign, sem quebrar produção. Deploy só via @devops.
3. ~~Asset ausente~~ **RESOLVIDO:** logo horizontal oficial em `public/images/brand/logo-horizontal.png` (e cópia em `public/uploads/` para os canvases renderizarem em dev).

---

### Dependência cruzada — Épico 1 (Consultoria + Portais)

> **Registrado em 2026-07-03.** O Épico 1 (`docs/prd/epic-1-...activation.md`) ativa portais de aluno/instrutor e cria a página pública de consultoria — todos sobre arquivos que este épico reescreve. Contrato entre os dois:

- **Gates F0 + F1 deste épico precedem** as stories 1.2 (consultoria), 1.4 (portal aluno) e 1.5 (portal instrutor) do Épico 1. Implementar aquelas telas antes da purga do Mantine gera retrabalho.
- A **página de consultoria (story 1.2)** entra na story 14.2.7 acima (recebe spec de fidelidade do @ux-design-expert como as demais páginas sem canvas).
- A story 1.3 (leads/admin do Épico 1) **pode rodar em paralelo** — não depende do redesign, apenas segue o re-skin admin mínimo (D9 do ADR-014).
- A **NFR5 do PRD foi corrigida por errata** (`docs/prd/requirements.md`): a referência a "Mantine/Tailwind transition constraints" está superada por este épico.

## 2. Decisões arquiteturais (para ratificação por @architect)

| # | Decisão | Racional |
|---|---|---|
| D1 | Substituir Mantine por **Radix + Tailwind + cva** (padrão shadcn já iniciado em `src/components/ui/`) | Zero dependência nova de UI; reduz bundle |
| D2 | `@mantine/form` → **react-hook-form + @hookform/resolvers (zod)** | Única dependência nova; zod já presente; padrão maduro |
| D3 | `@mantine/notifications` → **sonner** (já instalado) | Sem custo adicional |
| D4 | `@mantine/hooks` (`useDisclosure`) → hook próprio `src/hooks/use-disclosure.ts` (~10 linhas) | Trivial |
| D5 | Tokens Trust Keith entram como fonte única em `src/design-tokens/tokens.css` (namespace `--tk-*`) + mapeamento no `tailwind.config.ts` | Fidelidade total exige os mesmos tokens dos canvases |
| D6 | Fidelidade validada por **comparação lado a lado** (screenshot Playwright da rota vs canvas renderizado) | Critério objetivo de "nível total de fidelidade" |

---

## 3. Fases, stories, agentes e modelos

> **Gestão de tokens/custo:** modelos atribuídos por complexidade — `haiku` para tarefas mecânicas/validação leve, `sonnet` para trabalho padrão, `opus` só para arquitetura e gate final. Implementação de código é do **Codex** (as stories de @dev são escritas como prompts autossuficientes com File List, ACs e comandos de verificação — o Codex não tem contexto da conversa).

### FASE 0 — Fundação do Design System

| Story | Tarefa | Agente | Modelo | Entregável |
|---|---|---|---|---|
| 14.0.1 | ~~Extrair o DS dos bundles~~ **RESOLVIDO**: pacote completo copiado para `docs/design-system/trust-keith/ds-package/`. Resta apenas gerar `INVENTORY.md` (variantes de componentes + mapa de tokens finais com remap `.rh2`) | @analyst | **haiku** (tarefa reduzida) | `docs/design-system/trust-keith/INVENTORY.md` |
| 14.0.2 | **Spec de fidelidade por página**: para cada `.dc.html`, documentar seções, grids, espaçamentos, tipografia, estados hover/interações e dados dinâmicos (`sc-for`, placeholders) | @ux-design-expert | sonnet | `docs/design/redesign/spec-{pagina}.md` (7 arquivos) |
| 14.0.3 | **Ratificar decisões D1–D6** e definir estrutura de componentes (`src/components/ui/` vs `src/features/`) | @architect | opus | ADR em `docs/architecture/` |
| 14.0.4 | **Migrar tokens**: reescrever `src/design-tokens/tokens.css` com tokens `--tk-*` extraídos; atualizar `tokens.tailwind.js`, `tailwind.config.ts`, `globals.css`; deletar paleta antiga | @dev (Codex) | — | tokens novos + Storybook `design-tokens.stories.tsx` atualizado |
| 14.0.5 | **Biblioteca base Trust Keith**: `Button`, `Badge`, `Chip`, `Card` (course card, paper card), `SectionHeading`, `Nav`/`Footer` públicos — com stories | @dev (Codex) | — | `src/components/ui/*` + stories |
| 14.0.6 | Validar stories 14.0.4–14.0.5 (visual no Storybook + a11y addon) | @qa | sonnet | QA gate PASS |

**Gate F0:** tokens e componentes base aprovados. (Logo ✅ já em `public/images/brand/logo-horizontal.png`.)

### FASE 1 — Remoção total do Mantine

| Story | Tarefa | Agente | Modelo | Entregável |
|---|---|---|---|---|
| 14.1.1 | Provider e infraestrutura: remover `MantineProvider`, `mantine-theme.ts`, `mantine-tokens.css`; `error-boundary.tsx` e `whatsapp-support.tsx` sem Mantine | @dev (Codex) | — | app renderiza sem provider Mantine |
| 14.1.2 | **Sistema de forms**: instalar `react-hook-form` + resolver zod; reescrever `form-field.tsx` e `form-fields.tsx` (TextInput, Select, Textarea, MultiSelect) com Radix/Tailwind; migrar consumidores (`Contact`, `Login`, `InCompany`, admin) | @dev (Codex) | — | forms funcionais com validação zod |
| 14.1.3 | **Admin shell**: `dashboard-shell.tsx` (AppShell→layout CSS grid), `admin-sidebar/topbar/bottom-navigation`, Burger/Drawer→Radix Dialog; `public-mobile-navigation.tsx` | @dev (Codex) | — | shells sem Mantine |
| 14.1.4 | **Admin views + portais**: `AdminResourcePage` (Table/Modal), `AdminSettingsPage`, `admin-dashboard-page`, `StudentPortal`, `InstructorPortal`; notifications→sonner; `useDisclosure` próprio | @dev (Codex) | — | zero import `@mantine` em `src/` |
| 14.1.5 | **Purge final**: remover `@mantine/*` e `@emotion/react` do `package.json`; `npm run bundle:check` (< 3 MiB gzip); `npm run epic8:verify` | @dev (Codex) | — | lockfile limpo, bundle validado |
| 14.1.6 | QA gate fase 1: **`npm run purge:gate`** (zero import/pacote `@mantine`+`@emotion`, exit≠0 bloqueia), typecheck, testes unitários, e2e smoke, a11y | @qa | sonnet | QA gate PASS |

**Gate F1:** app 100% sem Mantine, bundle abaixo do limite, testes verdes. *(Fase 1 pode rodar em paralelo com 14.0.2, pois a remoção no admin não depende das specs das páginas públicas.)*

> **⚠️ Estado real verificado (2026-07-03):** a purga de **dependência** já está concluída — `npm run purge:gate` retorna **PASS**: zero `@mantine/*`/`@emotion/*` no `package.json`, em `node_modules` e nos imports de `app/`+`src/`; `mantine-theme.ts` e `mantine-tokens.css` já removidos; `form-field.tsx` não importa mais `@mantine/form`. **Resta apenas resíduo de nomenclatura** (não bloqueia o gate): o stub morto `src/components/providers/mantine-provider.tsx` (`AppMantineProvider`, um pass-through no-op) ainda referenciado em `app/layout.tsx`. As tarefas 14.1.1–14.1.5 devem tratar isso como **limpeza cosmética + verificação**, não como purga de 22 arquivos. O `purge:gate` é agora o invariante que impede **reintrodução** do Mantine.

### FASE 2 — Páginas públicas com fidelidade total (1 story por canvas)

Cada story segue o mesmo template: implementar a rota conforme `spec-{pagina}.md` + canvas de referência, usando exclusivamente tokens `--tk-*` e componentes da fase 0; dados dinâmicos vindos das fontes atuais (Supabase); responsividade (canvases são desktop 1180px — mobile definido na spec da 14.0.2).

| Story | Página | Agente impl. | Verificação |
|---|---|---|---|
| 14.2.1 | Home (`/`) — hero, próximas turmas, seções de `RH Home Sections` | @dev (Codex) | @qa sonnet |
| 14.2.2 | Catálogo (`/cursos`) | @dev (Codex) | @qa sonnet |
| 14.2.3 | Agenda (`/agenda`) | @dev (Codex) | @qa sonnet |
| 14.2.4 | In-company (`/in-company`) | @dev (Codex) | @qa sonnet |
| 14.2.5 | Quem Somos (`/sobre`) | @dev (Codex) | @qa sonnet |
| 14.2.6 | Blog (`/blog` + `/blog/[slug]`) | @dev (Codex) | @qa sonnet |
| 14.2.7 | Páginas sem canvas (Login, Contato, CourseDetail, EnrollmentSuccess, SpecialistContact, **Consultoria** — página nova do Épico 1 / story 1.2): re-skin com tokens/componentes novos, coerência com o DS | @ux-design-expert (spec) → @dev (Codex) | @qa sonnet |

**Critério de fidelidade (cada story 2.x):** screenshot Playwright 1180px da rota vs render do canvas — layout, cores, tipografia, espaçamentos e raios idênticos; divergências só onde a spec 14.0.2 documentar adaptação (dados reais, responsivo).

**⚠️ Invariantes preservados do Épico 5 (regressão — NÃO reintroduzir):** o Épico 5 (`docs/epics/epic-5-busca-loading-motion-imagens.md`, status `Done`) já entregou os critérios abaixo. Os canvases são estáticos e **não os descrevem**, então cada story 2.x que reescreva os arquivos correspondentes deve **conservar** o comportamento existente, tratando-o como parte do contrato de fidelidade funcional (não visual):

| Critério | Comportamento a preservar | Guardado hoje por (teste vivo) |
|---|---|---|
| **S7 — busca real** | Busca é **local por página**, não global no header. O header público **não tem** barra de busca global (foi removida de propósito). O catálogo (`/cursos?q=`) e o blog (`/blog?q=`) leem/aplicam o termo da URL e expõem botão "Limpar busca" + resumo de resultados. `role=search` presente e rotulado. | `tests/epic5-search-motion.spec.ts` (asserts header sem busca global + busca local em catálogo/blog); `src/views/public/Courses.tsx`, `src/components/common/command-palette.tsx` (⌘K, não é barra de header) |
| **S8 — reduced-motion (JS)** | Todo hover/transição de entrada (`translateY`, `transform .25s` das specs) respeita `prefers-reduced-motion`. Implementar via `framer-motion` sob o `MotionProvider` (guard global) ou `useReducedMotion()` — **nunca** CSS `transition: transform` cru sem media query. | `tests/epic5-search-motion.spec.ts` (contexto `reducedMotion: "reduce"` → `animatedInlineStyles === 0`); `app/layout.tsx` (`MotionProvider`), `section-title.tsx`, `course-card.tsx` |
| **S9 — sem `<img>` cru** | Imagens via `next/image` (dimensões, `priority` só no hero, `alt` correto); zero warning de lint; sem `apple-material` em conteúdo. | `tests/epic5-search-motion.spec.ts` (`rawImgOffenders === []` + `materialOffenders === []`) |

**Diretriz para o @sm ao gerar as stories 2.x:** esses invariantes **já têm testes determinísticos** — não reescrever verificação nova. Cada story que tocar os arquivos correspondentes referencia `npm run test:epic14:fidelity` como AC (roda `epic5-search-motion` + `epic14-mantine-removal.smoke`). Ex.: Catálogo 14.2.2 → confirmar `?q=` aplicado + hover de cards sob reduced-motion; Home 14.2.1 → hover de cards/section-title sob reduced-motion. O @qa executa o comando e lê o verdict (tarefa de **haiku**, não sonnet).

### FASE 3 — Verificação final e entrega

| Story | Tarefa | Agente | Modelo |
|---|---|---|---|
| 14.3.1 | Auditoria visual: `npm run test:epic14:fidelity:capture` gera route vs canvas em `artifacts/epic14-fidelity/` para comparação lado a lado; a11y (`npm run test:a11y`), Lighthouse. Diff visual é revisão humana/opus (a captura não emite verdict automático). | @qa | **opus** (gate final) |
| 14.3.2 | Regressão funcional: `npm run test:epic14:fidelity` (invariantes S7/S8/S9 + smoke Mantine) + `npm run test:e2e:smoke` (inscrição/login/admin). S7 = busca **local** aplica `?q=` em catálogo/blog; header sem busca global. | @qa | sonnet |
| 14.3.3 | Limpeza: remover canvases/bundles de `public/` (mover para `docs/design/redesign/reference/` — não devem ir ao deploy), `.dc.html` fora do worker | @dev (Codex) | — |
| 14.3.4 | Commit/PR para `main`, CI verde, `bundle:check` final | @devops | haiku |

---

## 4. Protocolo de handoff para o Codex

Toda story de @dev deve ser gerada por @sm (`sonnet`) e validada por @po (`haiku`) contendo:

1. **Contexto mínimo autossuficiente** (o Codex não vê esta conversa): paths absolutos dos arquivos, spec da página, tokens relevantes.
2. **File List** explícita (criar/modificar/deletar).
3. **Acceptance Criteria verificáveis por comando**: `npm run lint && npm run typecheck && npm run test:unit`, `npm run purge:gate` (fases 1+ — invariante anti-reintrodução Mantine/Emotion), `npm run bundle:check`.
4. **Proibições**: não tocar em `.aiox-core/`, não fazer `git push` (exclusivo @devops), não adicionar dependências além das listadas na story.
5. Atualização do story file (checkboxes + File List) ao concluir.

## 5. Resumo de alocação de modelos (gestão de tokens)

| Agente | Modelo | Justificativa |
|---|---|---|
| @analyst (extração DS) | sonnet | parsing técnico pontual |
| @ux-design-expert (specs) | sonnet | trabalho visual detalhado, 8 specs |
| @architect (ADR) | opus | decisões estruturais, 1 sessão curta |
| @sm (stories) | sonnet | redação de prompts Codex |
| @po (validação) | haiku | checklist mecânico de 10 pontos |
| @dev | **Codex** (externo) | implementação — não consome tokens Claude |
| @qa (gates intermediários) | sonnet | verificação padrão |
| @qa (gate final 14.3.1) | opus | auditoria de fidelidade crítica |
| @devops (push/PR) | haiku | operações mecânicas de git/CI |

## 6. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| ~~DS não extraível~~ | ✅ Resolvido — pacote completo em `docs/design-system/trust-keith/ds-package/` |
| ~~Logo horizontal ausente~~ | ✅ Resolvido — `public/images/brand/logo-horizontal.png` |
| Fonte **Quincy CF** é comercial (carregada via remote no DS) | @architect decide na 14.0.3: licenciar/self-host ou fallback `Iowan Old Style/Georgia` já previsto no token `--tk-font-display` |
| Aplicar tokens base sem o remap `.rh2` (site sairia azul `#235875` em vez do teal RH) | Story 14.0.4 usa explicitamente tokens finais = base + remap; QA 14.0.6 valida cor de CTA |
| Bundle > 3 MiB no meio da migração (Mantine + componentes novos coexistindo) | Ordenar: fase 1 (remoção) antes da fase 2; `bundle:check` em todo QA gate |
| Canvases são desktop-only (1180px) | Spec 14.0.2 define breakpoints mobile por página antes da implementação |
| Divergência dado real × placeholder do canvas (`sc-for`) | Spec documenta contrato de dados por seção |

## 7. Sequência de execução

```
14.0.1 (extração DS) ──► 14.0.3 (ADR) ──► 14.0.4 (tokens) ──► 14.0.5 (componentes) ──► 14.0.6 (QA)
14.0.2 (specs UX, paralelo)                                          │
14.1.1 → 14.1.2 → 14.1.3 → 14.1.4 → 14.1.5 → 14.1.6 (paralelo à 14.0.2)
                                                                     ▼
                              14.2.1 … 14.2.7 (sequencial ou 2 em paralelo, após Gates F0+F1)
                                                                     ▼
                                          14.3.1 → 14.3.2 → 14.3.3 → 14.3.4 (PR)
```
