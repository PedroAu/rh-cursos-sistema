# Spec — Épico 7: Redesign "Executive Precision" (Pipeline enxuto)

**Classe de complexidade:** COMPLEX (16) — pipeline enxuto autorizado pelo stakeholder (decisão #2, 2026-06-10)
**Fases executadas:** Gather (consolidado no épico) → Spec (este doc) → Critique (@qa)
**Fontes (Article IV):** `docs/design/executive-precision/DESIGN.md` (tokens canônicos) · `docs/design/executive-precision/screens/*.html` (15 telas, IDs `S-*` abaixo) · `docs/epics/epic-7-redesign-executive-precision.md` (decisões §2/§8) · `docs/prd/modernizacao-ui-2026.md` · código verificado em 2026-06-10

> **Precedência de cor (correção critique #3):** a fonte canônica de cor é o **frontmatter YAML** do DESIGN.md (`primary: #004364`, `secondary-container: #ffc641`, `surface-dark: #083B56`). A prosa §Colors do mesmo documento (`#0D5B85`, `#D4A017`, `#F4F7F9`) é texto descritivo do Stitch e está **desatualizada — não usar**. `#0d5b85` permanece válido apenas como `primary-container`. O gate de contraste (NFR-1) valida contra o frontmatter.

## 1. Telas de referência (IDs)

| ID | Arquivo em `screens/` | Destino |
|----|---|---|
| S-HOME | `home.html` | `app/page.tsx` |
| S-CAT | `cursos-catalogo.html` | `app/cursos/page.tsx` |
| S-AGE | `agenda.html` | `app/agenda/page.tsx` |
| S-DET | `curso-detalhe.html` | `app/cursos/[slug]/page.tsx` |
| S-CHK | `checkout-inscricao.html` | `app/cursos/[slug]/checkout/page.tsx` |
| S-CON | `contato.html` | `app/contato/page.tsx` |
| S-INC | `in-company.html` | `app/in-company/page.tsx` |
| S-SOB | `sobre.html` | `app/sobre/page.tsx` |
| S-LOG | `login.html` | `app/login/page.tsx` |
| S-ESP | `falar-com-especialista.html` | `app/falar-com-especialista/page.tsx` (nova) |
| S-ORC | `orcamento-in-company.html` | modal global de orçamento (novo) |
| S-ADM | `admin-dashboard.html` | `app/admin/page.tsx` |
| S-ACT | `admin-cursos-turmas.html` | `app/admin/cursos`, `app/admin/turmas` |
| S-AAL | `admin-cadastros-alunos.html` | `app/admin/alunos` |
| S-ACF | `admin-configuracoes.html` | `app/admin/configuracoes/page.tsx` (nova) |

## 2. Requisitos funcionais

| ID | Requisito | Fonte | Story |
|----|---|---|---|
| FR-1 | Paleta M3 do DESIGN.md disponível como tokens fonte (`--m3-*`) e camada semântica re-apontada sob `[data-theme="executive"]`, por rota, sem alterar o visual das rotas não migradas | DESIGN.md frontmatter · decisão arq. Tokens | EP-0.1 |
| FR-2 | Tipografia Montserrat (headings) + Inter (body/UI) self-hosted via `next/font/google`, com a escala do DESIGN.md (display 48/56 … caption 12/16) exposta como tokens; remoção do `@import` CDN | DESIGN.md §Typography · decisão arq. Fontes | EP-0.2 |
| FR-3 | Shape: radius 4px (botões/inputs), 8px (cards), pill (chips); grid 8px; container 1200px/gutter 24px | DESIGN.md §Shapes/§Layout | EP-0.2 |
| FR-4 | Componentes base reskinados preservando API: botão primário gold com texto navy escuro, secundário ghost navy, terciário text+seta; card com top-accent bar navy e elevação Level 1 (borda 1px + sombra 0 4 12 / 5%); chips pill com tint de baixa saturação; inputs outlined com label `label-bold` acima e foco azul com glow | DESIGN.md §Components/§Elevation | EP-0.3 |
| FR-5 | Re-baseline dos 5 snapshots de governança por fase, em commit separado; doc do design system atualizado. Telas/elementos **novos** (especialista, configurações, modal orçamento, login split, seletor de pagamento) entram na governança com snapshot próprio na story que os cria | epic-7 §2 Snapshots · `tests/ui-governance.spec.ts:32-67` · critique sugerida | EP-0.4 |
| FR-6 | Shell público: header navy com navegação atual + CTA gold; footer navy `#083B56` com colunas, newsletter e contatos; FAB WhatsApp global (público e admin) | S-HOME/S-CAT/S-AGE (header/footer/FAB consistentes) | EP-1.1 |
| FR-7 | Sidebar admin navy `#083B56`, item ativo com marcação gold, contraste AA | S-ADM/S-ACT/S-AAL/S-ACF | EP-1.2 |
| FR-8 | GA4 instalado via `@next/third-parties`, com page views e eventos de funil (clique CTA inscrição, envio de lead, conclusão de checkout), ID por variável de ambiente. Leads com `origin` distinto por tipo (Contato / Especialista / Orçamento In Company) para o funil ser observável | decisão #4 · critique sugerida | EP-1.3 |
| FR-9 | Catálogo: hero navy, filter chips pill, grid de cards top-accent com badges; busca e filtros existentes preservados | S-CAT | EP-2.2 |
| FR-10 | Home: hero gradient navy, trust bar, trilhas de capacitação, depoimentos, processo em 3 passos, FAQ accordion, CTA final | S-HOME | EP-2.1 |
| FR-11 | Agenda: refactor visual do `calendar-view.tsx` (mês navegável), destaques e filtros; navegação por teclado | S-AGE | EP-2.3 |
| FR-12 | Detalhe de curso: hero com badges, bloco vídeo/play, accordions de conteúdo, card sticky de investimento com CTA gold, instrutor, cursos recomendados, newsletter | S-DET | EP-3.1 |
| FR-13 | Checkout: rota dedicada por curso (`/cursos/[slug]/checkout`), stepper de etapas, seções Dados do Aluno/Dados da Empresa/Opções de Pagamento com seletor visual (substitui `Select`), erros inline; submissão sem regressão. **Pré-requisito (correção critique #2):** criar teste E2E `tests/checkout.e2e.spec.ts` cobrindo a submissão completa **antes** do reskin, como baseline — esse teste **não existe hoje** | S-CHK · `app/cursos/[slug]/checkout/page.tsx` | EP-3.2 |
| FR-14 | Login split-screen (painel institucional navy + form), abas Acesse/Crie sua conta | S-LOG | EP-4.4 |
| FR-15 | Contato: cards de telefone/endereço, mapa embed, form com FormField | S-CON | EP-4.1 |
| FR-16 | In Company: hero, bento de vantagens, processo de implementação, CTA de orçamento (abre modal FR-18) | S-INC | EP-4.2 |
| FR-17 | Página nova `/falar-com-especialista` conforme S-ESP; CTAs "Falar com especialista" do site passam a apontar para ela; lead persiste no mesmo backend de contato | S-ESP · decisão #5 | EP-4.5 |
| FR-18 | Modal global de Orçamento In Company com o form de S-ORC (Dados da Organização / Expectativa de Data e Formato / Responsável pelo Contato), **pré-preenchido com o curso clicado**; acionável de `/in-company` e de botões de orçamento nos cursos | S-ORC · decisão #6 | EP-4.6 |
| FR-19 | Sobre: bento missão/visão/valores, timeline "Nossa Trajetória", liderança, CTA | S-SOB | EP-4.3 |
| FR-20 | Admin Dashboard: KPI cards (com deltas), tabela de gestão de cursos com switches de status, lista de atividades recentes, FAB. **Sem gráficos** — S-ADM não contém nenhum (correção critique #1); status/deltas não dependem só de cor (ícone/texto junto) | S-ADM | EP-5.1 |
| FR-21 | Admin Cursos/Turmas: stats, tabela de turmas com progresso e modal de edição (reutiliza `AdminResourcePage`/form-fields) | S-ACT | EP-5.2 |
| FR-22 | Admin Alunos: KPIs, filtros, tabela com avatares e paginação, modal Novo Cadastro, switches de status | S-AAL | EP-5.3 |
| FR-23 | Página nova `/admin/configuracoes` conforme S-ACF: identidade do site, upload logotipo/favicon, preferências de notificação, tabela de administradores. **Contrato mínimo de persistência (correção critique #5):** logotipo/favicon → Supabase Storage (bucket `branding`); administradores → **somente leitura** dos usuários existentes nesta fase; preferências de notificação → UI sem backend (persistência real vai ao backlog) | S-ACF · decisão #7 | EP-5.4 |
| FR-24 | Rotas órfãs (blog, inscricao-confirmada, admin/leads, admin/blog, admin/instrutores, admin/inscricoes) herdam tokens sem tela dedicada | epic-7 §3 | EP-6.1/6.2 |
| FR-25 | Redirect 301 `/curso` → `/cursos` (AC: teste em `route-auth.spec.ts` ou spec próprio verificando status 301 e destino); remoção do scope `data-theme` e tokens `--ea-*` legados; **remoção do comentário e da estrutura preparada para dark mode em `globals.css:54-68`** — não há classes `dark:` em `src/` (0 ocorrências, verificado na critique); o resquício real é o comentário "Dark mode futuro (D4)" e a previsão de `[data-theme="dark"]` (correção critique #4) | decisões #8/#9 | EP-6.3 |

## 3. Requisitos não-funcionais

| ID | Requisito | Fonte |
|----|---|---|
| NFR-1 | WCAG AA em todos os pares textuais; texto sobre gold `#ffc641` usa navy escuro dedicado (par Stitch `#715300` reprova); gate axe nunca afrouxa | DESIGN.md nota · `ui-governance.spec.ts:22-30` |
| NFR-2 | Fontes `.woff2` self-hosted nos assets do Worker (sem CDN em runtime) — compatibilidade Cloudflare Workers/OpenNext | decisão arq. Fontes |
| NFR-3 | Zero regressão funcional: `public-journeys.spec.ts` verde em toda fase; checkout coberto pelo E2E novo exigido em FR-13 (inexistente hoje — criado como baseline na EP-3.2) | epic-7 §7 · correção critique #2 |
| NFR-4 | `prefers-reduced-motion` respeitado nas animações novas; navegação por teclado e landmarks preservados no shell | epic-7 EP-2.1/EP-1.1 |
| NFR-5 | Imagens via `next/image`; sem tamanho de fonte/cor hardcoded fora de tokens | epic-7 EP-0.2/EP-2.1 |

## 4. Restrições

| ID | Restrição | Fonte |
|----|---|---|
| CON-1 | Reskin governado: REUSE > ADAPT > CREATE; proibido recriar componentes com API nova sem justificativa | IDS / epic-7 §1 |
| CON-2 | Branch por fase (`redesign/ep-N-*`), PR único por fase, gates verdes antes do merge; push/PR exclusivo @devops | epic-7 §6 · agent-authority |
| CON-3 | Sem feature flag de runtime; coexistência só via `[data-theme="executive"]`, removido na EP-6.3 | decisão #3 |
| CON-4 | Dark mode excluído do produto; nenhum código novo com variantes `dark:` | decisão #9 |
| CON-5 | Backend/Supabase intocado, exceto persistência mínima da EP-5.4 (escopo definido na story) | epic-7 §5 |
| CON-6 | F0+F1 (com EP-1.3) entram juntas como primeiro release visível | decisão #3 |

## 5. Critérios de aceite do épico (gate de saída)

1. Todas as rotas do §1 com visual Executive Precision, validação desktop+mobile+teclado.
2. Matriz de contraste AA 100% verde, incluindo o par gold/navy definido na EP-0.1.
3. GA4 reportando page views e os 3 eventos de funil em produção.
4. Zero referência a `--ea-*` legado, `data-theme="executive"` e `dark:` ao final da F6.
5. Snapshots e gates de governança (Épico 6) verdes no baseline final.

---

**Status:** Critique 1 (@qa Quinn): NEEDS_REVISION 3.8 → 5 correções obrigatórias aplicadas → **Re-critique (Fase 5b): APPROVED 4.6/5 em 2026-06-10** (detalhes em `critique.md`).
**Observação para EP-1.3:** o enum `Lead.origin` (`src/types/index.ts:122`) é fechado (`"Site" | "WhatsApp" | "Blog" | "Indicação" | "LinkedIn"`) — estender com `"Contato" | "Especialista" | "Orçamento In Company"` para cumprir FR-8.
