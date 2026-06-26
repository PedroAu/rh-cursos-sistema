# Épico 7 — Redesign "Executive Precision"

**Tipo:** Brownfield — reskin governado sobre app funcional
**Autores:** @pm (Morgan) · @architect (Aria) · validado por @po (Pax)
**Data:** 2026-06-10
**Status:** COMPLETE — fases/stories do redesign entregues (`Done`). 9 decisões do stakeholder tomadas em 2026-06-10 (§8). Spec Pipeline enxuto concluído: `docs/specs/epic-7-executive-precision/spec.md` **APPROVED 4.6/5** pelo @qa (critique + re-critique em `critique.md`)
**Fontes (Article IV):** `docs/design/executive-precision/DESIGN.md` (canônico) + 15 telas HTML em `docs/design/executive-precision/screens/` · `docs/prd/modernizacao-ui-2026.md` · `docs/epics/epic-1..6` · verificação direta de código 2026-06-10

---

## 1. Visão

Aplicar a identidade visual "Executive Precision" (Material 3 navy `#004364` + gold `#ffc641`, Montserrat + Inter, grid 8px, cards com top-accent) de forma uniforme sobre páginas já funcionais. É um **reskin governado**, não reconstrução: reentona os tokens `--ea-*` (épicos 1–6) e adapta componentes via IDS (REUSE > ADAPT > CREATE).

### Objetivos
- **EP-O1** — Migrar tokens para a paleta/tipografia/shape nova sem quebrar contraste WCAG AA.
- **EP-O2** — Reskinar componentes base uma única vez, herdando para todas as páginas.
- **EP-O3** — Aplicar o visual página a página sem regressão de comportamento/conversão.
- **EP-O4** — Manter a governança do Épico 6 (gates de UI + a11y) válida após o reskin.

### Complexidade (avaliação @architect)
Scope 5 · Integration 2 · Infrastructure 3 · Knowledge 2 · Risk 4 = **16 → COMPLEX** (exige Spec Pipeline enxuto ou waiver formal — ver decisão pendente #2).

---

## 2. Decisões arquiteturais (Aria)

| Tema | Decisão |
|------|---------|
| **Tokens** | NÃO re-skin in-place. Adicionar paleta M3 nova como fonte (`--m3-*`) em `globals.css` e **re-apontar a camada semântica existente** (`src/styles/globals.css:54-68`). Coexistência de identidades durante fases via scope `[data-theme="executive"]` por rota — removido na Fase 6 (story dedicada). |
| **Fontes** | Substituir `@import` CDN (Inter+Manrope) por `next/font/google` (Montserrat + Inter) self-hosted — crítico no Cloudflare Workers/OpenNext. Validar `.woff2` nos assets, `subsets: ["latin"]`, pesos limitados. |
| **Shell** | Opção A — **Fase 1 atômica**: header + footer público + sidebar admin trocam de uma vez (shell é global; coexistir dois headers gera divergência). Conteúdo das páginas faseia depois. |
| **Contraste** | Gold `#ffc641` com texto `#715300` **reprova AA**. Texto sobre gold usa navy escuro dedicado. Gate axe (`tests/ui-governance.spec.ts:22-30`) nunca afrouxa. |
| **Dark mode** | **EXCLUÍDO do produto** (decisão #9, 2026-06-10). Classes `dark:` dos protótipos = ruído; resquícios `dark:`/`[data-theme="dark"]` no código são removidos na EP-6.3. |
| **Snapshots** | Re-baseline por fase (`--update-snapshots` só no spec afetado), em commit separado `chore: re-baseline snapshots fase N`. |

### Inventário de componentes
- **Só token (baixo risco):** `input`, `form-field` (label acima já existe), `select`, `textarea`, `separator`, `accordion`, `badge`/chips, `table`.
- **Variante/refactor:** `button` (variante gold `#ffc641`/texto navy + text-button), `card` (variante top-accent), `tabs` (existe sem uso), `admin-sidebar` (cinza → navy `#083B56`), `checkout-modal` (Select → seletor visual de pagamento), `calendar-view` (refactor visual — **já existe**, 216 linhas).
- **Novo (confirmado em 2026-06-10):** rota `admin/configuracoes` (decisão #7), rota `/falar-com-especialista` (decisão #5), **modal de Orçamento In Company** com contexto do curso clicado (decisão #6 — reutiliza padrão do `checkout-modal`), Login split-screen (estrutura), **Google Analytics 4** (decisão #4 — story EP-1.3).

### Detalhes recorrentes das telas (fonte: `screens/*.html`)

- **FAB WhatsApp** fixo presente em 13 das 15 telas (públicas e admin) — componente global no shell (EP-1.1/EP-1.2).
- **Newsletter no footer** (agenda, curso-detalhe, orçamento) — parte do footer navy (EP-1.1).
- **Stepper de inscrição** + seções "Dados do Aluno"/"Dados da Empresa"/"Opções de Pagamento" no checkout (EP-3.2).
- **Breadcrumb** no orçamento in-company; **mapa embed** no contato; **vídeo/play** no detalhe de curso e sobre; **timeline "Nossa Trajetória"** no sobre.
- **Admin:** paginação e avatares (alunos), switches de status, upload de logotipo/favicon e tabs (configurações), tabela de turmas com modal (cursos/turmas).

---

## 3. Mapeamento tela → rota → fase

| Tela (`screens/`) | Rota/arquivo | Fase | Observação |
|---|---|---|---|
| `home.html` | `app/page.tsx` / `Home.tsx` | 2 | |
| `cursos-catalogo.html` | `app/cursos/page.tsx` | 2 | **prioridade da fase (PO)** |
| `agenda.html` | `app/agenda/page.tsx` + `calendar-view.tsx` | 2→paralela | fora do caminho crítico (PO) |
| `curso-detalhe.html` | `app/cursos/[slug]/page.tsx` | 3 | |
| `checkout-inscricao.html` | `src/components/checkout/checkout-modal.tsx` | 3 | é modal, não rota |
| `contato.html` | `app/contato/page.tsx` | 4 | |
| `in-company.html` | `app/in-company/page.tsx` | 4 | |
| `sobre.html` | `app/sobre/page.tsx` | 4 | |
| `login.html` | `app/login/page.tsx` | 4 | antecipar antes da F5 (PO) |
| `falar-com-especialista.html` | `app/falar-com-especialista/page.tsx` (**criar**) | 4 | decisão #5: página nova — hoje o CTA aponta p/ atendimento inexistente |
| `orcamento-in-company.html` | modal global de orçamento (**criar**) | 4 | decisão #6: modal com dados do curso clicado |
| `admin-dashboard.html` | `app/admin/page.tsx` | 5 | |
| `admin-cursos-turmas.html` | `app/admin/cursos`, `app/admin/turmas` | 5 | |
| `admin-cadastros-alunos.html` | `app/admin/alunos` | 5 | |
| `admin-configuracoes.html` | `app/admin/configuracoes/page.tsx` (**criar**) | 5 | decisão #7: construir agora |
| — (sem tela) | blog, blog/[slug], inscricao-confirmada | 6 | herança de tokens |
| — (sem tela) | admin/leads, admin/blog, admin/instrutores, admin/inscricoes | 6 | herança de tokens |
| — (legado) | `app/curso` | 6 | decisão #8 — PO recomenda redirect 301 |

---

## 4. Fases e stories

Sequência ajustada pelo @po (valor de conversão antecipado):
`F0+F1 (release único) → EP-2.2 → EP-2.1 → EP-3.1 → EP-3.2 → [paralelo: EP-2.3, EP-4.1–4.4] → F5 → F6`

### FASE 0 — Fundação Executive Precision (bloqueante)
| Story | Escopo | Aceite resumido |
|---|---|---|
| EP-0.1 Tokens de cor/superfície | Paleta M3 como fonte + re-apontar camada semântica + scope `data-theme` | Matriz de contraste AA verde; par gold/texto definido e validado |
| EP-0.2 Tipografia & shape | Montserrat+Inter via `next/font` (mapear pesos Manrope→Montserrat); escala nova como tokens; radius/grid | Sem texto funcional abaixo do mínimo; sem tamanho hardcoded; fontes self-hosted nos assets do Worker |
| EP-0.3 Reskin componentes base | Botão gold/navy, ghost navy, text-button; card top-accent; chips; footer navy | Componentes adaptados (não recriados); APIs preservadas |
| EP-0.4 Gates & doc | Re-baseline snapshots; atualizar checklist a11y e `docs/design/sistema-design-rh-cursos.md` | Gates verdes com novo baseline; doc fonte única |

### FASE 1 — Shell & Navegação (entra junto com F0 em produção)
| Story | Escopo |
|---|---|
| EP-1.1 Header/footer públicos + FAB WhatsApp | `public-header.tsx`, `public-footer.tsx` (navy + newsletter); FAB global; teclado/landmarks preservados; busca do Épico 5 intacta |
| EP-1.2 Sidebar admin navy | `admin-sidebar.tsx` + `dashboard-shell.tsx`; item ativo gold; contraste AA |
| EP-1.3 Google Analytics 4 | Decisão #4: GA4 via `@next/third-parties` (compatível Cloudflare Workers); page views + eventos de funil (CTA inscrição, envio de lead, checkout); ID via env; documentar no deploy |

### FASE 2 — Descoberta pública
| Story | Escopo |
|---|---|
| EP-2.2 Catálogo `/cursos` | Hero navy, filter chips pill, busca, grid cards top-accent; filtros/busca reais preservados |
| EP-2.1 Home | Hero gradient, trust bar, trilhas, depoimentos, processo, FAQ, CTA; reduced-motion; `next/image` |
| EP-2.3 Agenda | Refactor visual do calendário + destaques + filtros; teclado acessível (paralelizável) |

### FASE 3 — Conversão pública (maior risco de receita)
| Story | Escopo |
|---|---|
| EP-3.1 Detalhe de curso | Hero badges, accordions, sidebar sticky de investimento, CTA gold, relacionados |
| EP-3.2 Checkout/Inscrição | Reskin modal + Select→seletor visual de pagamento (cartão/PIX/boleto/empenho); erro inline; sem regressão de submissão |

### FASE 4 — B2B & Acesso (paralelizável após F0+F1)
| Story | Escopo |
|---|---|
| EP-4.4 Login split-screen | Antecipar — porta de entrada do admin |
| EP-4.1 Contato | Cards telefone/localização + mapa + form com FormField |
| EP-4.2 In Company | Hero, bento benefícios, processo + form orçamento embutido, CTA gold |
| EP-4.3 Sobre | Bento missão/visão/valores, timeline, liderança |
| EP-4.5 Falar c/ Especialista | **Confirmada** (decisão #5): criar `app/falar-com-especialista/page.tsx` conforme `screens/falar-com-especialista.html`; ligar CTAs hoje quebrados/inexistentes; lead cai no mesmo backend de contato |
| EP-4.6 Modal Orçamento In Company | **Confirmada** (decisão #6): modal global (padrão `checkout-modal`) com form de `screens/orcamento-in-company.html` (Dados da Organização / Data e Formato / Responsável), **pré-preenchido com o curso clicado** (ex.: botão de orçamento no card do curso); acionável de `/in-company` e dos cards |

### FASE 5 — Admin
| Story | Escopo |
|---|---|
| EP-5.1 Dashboard | KPI cards, tabela CRUD, atividades, performance; gráficos não só por cor |
| EP-5.2 Cursos/Turmas | Stats bento, tabela com progresso, modal; reutiliza `AdminResourcePage`/`form-fields` |
| EP-5.3 Alunos/Cadastros | KPIs, filtros, tabela com avatares, modal |
| EP-5.4 Configurações | **Confirmada** (decisão #7): criar `app/admin/configuracoes/page.tsx` conforme `screens/admin-configuracoes.html` — Identidade do Site, upload logotipo/favicon, preferências de notificação (switches), administradores (tabela); persistência Supabase a definir na story |

### FASE 6 — Consistência & Fechamento
| Story | Escopo |
|---|---|
| EP-6.1 Rotas públicas órfãs | blog (template, não conteúdo), inscricao-confirmada |
| EP-6.2 Rotas admin órfãs | leads, blog, instrutores, inscrições |
| EP-6.3 Auditoria final | Remoção do scope `data-theme` e tokens `--ea-*` legados; **redirect 301 `/curso` → `/cursos` (decisão #8)**; **remoção de resquícios dark mode (`dark:`, `[data-theme="dark"]`) — decisão #9**; gates globais verdes |

---

## 5. Fora de escopo (explícito)

Portal aluno/instrutor e certificados · backend/Supabase/regras de negócio (exceto persistência mínima da EP-5.4) · **dark mode (excluído do produto — decisão #9)** · conteúdo editorial.

---

## 6. Rollout

- **Branch por fase** (`redesign/ep-N-*`), PR único por fase, gates do Épico 6 verdes antes do merge.
- **Sem feature flag de runtime** — o scope `data-theme` é mecanismo de coexistência em build, não flag. Exposição controlada pelo merge por fase.
- **F0+F1 entram juntas** como primeiro incremento visível (evita "tokens novos, páginas velhas").
- **Rollback** = revert do merge da fase (sem migração de dados).
- Validação visual obrigatória desktop+mobile+teclado por fase antes do `@devops *push`.

## 7. Métricas por fase

| Fase | Métrica | Verificação |
|---|---|---|
| 0 | 100% pares textuais AA; gold/navy validado | `contrast-report` + `ui-governance.spec.ts` |
| 1 | Navegação teclado/landmarks preservada | Playwright a11y |
| 2–4 | Sem regressão de jornada (journeys Playwright verdes + smoke de envio de lead) + **funil GA4 ativo a partir da F1 (EP-1.3)** | `public-journeys.spec.ts` + relatórios GA4 |
| 3 | Fluxo de checkout completo sem regressão | Teste de fluxo E2E |
| 5 | CRUD sem regressão; gráficos legíveis sem cor | Revisão + a11y |
| 6 | Zero estilo avulso; gates globais verdes | Auditoria + governança |

---

## 8. Decisões do stakeholder — RESOLVIDAS em 2026-06-10

| # | Decisão | Resolução do stakeholder |
|---|---|---|
| 1 | Fonte canônica de design | ✅ Aprovada com ressalva: o plano deve cobrir **todos** os detalhes dos protótipos — telas versionadas em `screens/` e detalhes incorporados (§2 e §4) |
| 2 | Spec Pipeline COMPLEX | ✅ Executar **versão enxuta** (spec.md + critique @qa) |
| 3 | Rollout sem flag + `data-theme` | ✅ Aprovado, F0+F1 juntas |
| 4 | Métricas | ✅ **Criar story de Google Analytics** (EP-1.3) — GA4 real, não só proxies |
| 5 | Falar c/ Especialista | ✅ **Criar a página** `/falar-com-especialista` (hoje o CTA leva a atendimento inexistente); não reaproveitar `/contato` (EP-4.5) |
| 6 | Orçamento In Company | ✅ **Modal** com o formulário, carregando as informações do curso clicado (EP-4.6) |
| 7 | Configurações admin | ✅ **Construir agora** (EP-5.4, Fase 5) |
| 8 | Rota legada `/curso` | ✅ Redirect 301 (EP-6.3) |
| 9 | Dark mode | ✅ **Excluir do projeto** — remover resquícios do código (EP-6.3) |

---

## 9. Validação @po (Pax) — 2026-06-10

**GO CONDICIONAL — 8.5/10.** Condições: (B1) versionar fonte de design com mapeamento tela→rota ✅ *(este documento + DESIGN.md)*; (B2) resolver gate COMPLEX do Spec Pipeline (decisão #2); decisões #1–#4 tomadas antes do `@sm *draft`. Importantes: métricas F2–F4 por proxy verificável; condicionais (EP-4.5/4.6/5.4) fora do caminho crítico; tensão flag×data-theme explicitada em EP-0.1 com story de remoção na F6; contraste do gold como AC formal.

**Próximo passo após decisões:** Spec Pipeline enxuto (decisão #2) → `@sm *draft` da EP-0.1.
