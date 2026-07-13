# Spec de Fidelidade — Admin · Dashboard (Visão geral)

## Origem
- **Canvas:** `docs/design-system/RH Cursos Admin Dashboard.dc.html`, tela `data-screen-label="Admin — Dashboard"` (`show.dashboard`)
- **Tokens:** `src/design-tokens/tokens.css` (Trust Keith)
- **Implementação atual:** `src/features/admin/dashboard/admin-dashboard-page.tsx` + shell (`src/features/admin-shell/components/admin-sidebar.tsx`, `admin-topbar.tsx`)
- **Escopo:** cobre apenas a tela **Dashboard** do canvas (`.adm`, largura de referência 1360px). As demais 9 telas do mesmo arquivo (Cursos, Turmas, Matrículas, Alunos, Instrutores, Leads, Blog, Páginas, Configurações) não fazem parte desta spec e exigem specs próprias se entrarem em escopo de redesign.
- **Motivo:** auditoria de fidelidade (ver conversa) encontrou ~22% de aderência entre o dashboard em produção e este canvas — a página atual é herdeira da Épica 10 (otimização de performance) e nunca foi migrada para este desenho. Esta spec formaliza o alvo de implementação para a story de redesign correspondente.

---

## 1. Sidebar (`.adm-side`)

**Estrutura/grid:** coluna fixa 248px à esquerda do grid `248px 1fr`; `min-height:940px`; borda direita `1px solid var(--tk-border)`.

**Tokens:**
- Fundo: `var(--tk-lightest-grey, #fafafa)` — **não** `var(--tk-surface)`
- Item ativo: fundo `var(--tk-accent-soft)` (`#e0f2f6`), texto `var(--tk-brand)` (`#0c6a83`), `font-weight:600`
- Item inativo: `color: var(--tk-ink)`, `opacity:.82`, `font-size: var(--tk-text-body-sm)`, `font-weight:500`
- Hover: `opacity:1`, `background: rgba(0,0,0,0.045)`
- Rótulo de grupo: 11px, `font-weight:600`, `letter-spacing:0.08em`, uppercase, `color: var(--tk-ink-muted)`
- Badge de contagem (`.adm-count`): fundo `var(--tk-brand)`, texto branco, `border-radius: var(--tk-radius-pill)`, `padding: 2px 8px`

**Conteúdo/copy:**
- Header: logo `uploads/logoHorizontal_800X600.png` (imagem, não texto) + badge "Admin" (fundo `--tk-accent-soft`, texto `--tk-brand`)
- 5 grupos rotulados, nesta ordem:
  1. **Visão geral** — Dashboard
  2. **Operação** — Cursos, Turmas, Matrículas, Alunos, Instrutores
  3. **Comercial** — Leads (com badge de contagem, ex. `12`)
  4. **Conteúdo do site** — Blog, Páginas
  5. *(sem rótulo, ancorado ao fim via `flex:1`)* — Configurações
- Rodapé: avatar (32px) + nome "Márcia Ribeiro" + cargo "Administradora" + link "Sair" alinhado à direita

**Estados interativos:** item ativo via `data-cur="1"` / `aria-current`; hover em todos os itens; foco visível `outline:2px solid #4d65ff`.

**Componentes do DS:** `Avatar` (TrustKeithDesignSystem, size `sm`).

---

## 2. Cabeçalho da página (dentro de `<main>`)

**Estrutura/grid:** `display:flex; justify-content:space-between` entre bloco de título e bloco de ações; `margin-bottom:28px`.

**Tokens:** `h1` classe `.adm-h1` — `font-family: var(--tk-font-display)`, `font-weight:700`, `font-size:30px`, `letter-spacing:-0.02em`. Subtítulo `.adm-sub` — `font-size: var(--tk-text-body-sm)`, `color: var(--tk-ink-muted)`.

**Conteúdo/copy:**
- H1: **"Visão geral"** (minúsculo em "geral" — atenção à capitalização exata)
- Subtítulo dinâmico: `"{{ diaSemanaExtenso }}, {{ dataExtensa }} · últimos 30 dias"` (ex.: "Sexta-feira, 3 de julho de 2026 · últimos 30 dias")
- Ações à direita, nesta ordem: link `"Ver site →"` · Button `secondary` "Novo curso" · Button `primary` "Nova turma"

**Estados interativos:** link com hover `color: var(--tk-brand-hover)`.

**Componentes do DS:** `Button` (variant `secondary` e `primary`, size `sm`, `hint-size 120px,36px`).

---

## 3. KPIs (grid de 4 cards, `.adm-kpi`)

**Estrutura/grid:** `display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px`.

**Tokens:** `background: var(--tk-surface)`, `border:1px solid var(--tk-border)`, `border-radius: var(--tk-radius-card)`, `box-shadow: var(--tk-shadow-glass)`, `padding:22px 24px`; hover → `translateY(-2px)` + `box-shadow: var(--tk-shadow-card)`. Label `.adm-kpilabel` 12px uppercase `color: var(--tk-ink-muted)`. Número `.adm-kpinum` 33px `font-weight:700` `font-variant-numeric:tabular-nums`.

**Conteúdo/copy (ordem exata):**
| # | Label | Número | Complemento |
|---|---|---|---|
| 1 | Matrículas no mês | 86 | "▲ 12% vs. junho" (verde `#05654e` + muted) |
| 2 | Leads novos | 42 | "▲ 8 aguardando contato" |
| 3 | Turmas abertas | 9 | "2 iniciam em até 45 dias" (sem seta/cor) |
| 4 | Ocupação média | 74% | barra `.adm-obar` preenchida a 74%, `role="img"` com `aria-label` |

**Divergência crítica:** nenhuma das 4 métricas do canvas corresponde às métricas hoje exibidas em produção (Total de alunos / Cursos ativos / Vendas do mês / Novos leads). O card do canvas **não tem ícone**; a implementação atual tem um bloco de ícone colorido à direita do label que não existe aqui.

**Componentes do DS:** nenhum (markup próprio `.adm-kpi`).

---

## 4. Bloco principal esquerdo — Card "Leads recentes" (`.adm-card`)

**Estrutura/grid:** grid `1fr 340px` com o bloco direito, `gap:16px; align-items:start`.

**Tokens:** header do card `.adm-cardhead` — `padding:20px 26px`, borda inferior `var(--tk-line)`; título `.adm-cardtitle` — `font-family: var(--tk-font-display)`, `19px`, `font-weight:700`.

**Conteúdo/copy:**
- Header: "Leads recentes" + link "Ver todos os leads →" (`data-nav="leads"`)
- Filtro por chips de origem (`.adm-chip`), `role="group" aria-label="Filtrar leads por origem"`; chip ativo `data-on="1"` — fundo `var(--tk-brand)`, texto branco
- Tabela colunas: **Lead** (nome + org) · **Origem** (badge `.adm-otag` colorido por tipo) · **Interesse** · **Recebido** · **Status** (`.adm-status` com dot colorido) · ação "Abrir →" (coluna sem header visível, apenas `sr-only` "Ações")
- Estado vazio: `"Nenhum lead com essa origem nos últimos 30 dias."` (`.adm-empty`) quando `noLeads`

**Estados interativos:** hover em `.adm-trow` — `background: var(--tk-lightest-grey)`; chip com hover de borda; `aria-pressed` nos chips.

**Divergência crítica:** produção não tem esse card — tem "Gerenciar Cursos" (busca + tabela de cursos + exportar CSV), que é conteúdo de outra tela do canvas (Cursos), não do Dashboard.

**Componentes do DS:** `Input` não é usado aqui no canvas (chips são markup próprio `.adm-chip`).

---

## 5. Bloco lateral direito

### 5a. Card "Próximas turmas"
**Estrutura:** `padding:4px 24px 12px`; cada item `.adm-turma` em grid `52px 1fr`, borda inferior entre itens.

**Conteúdo/copy:** data em destaque (`.adm-tnum` dia + `.adm-tmon` mês abreviado uppercase) · título da turma · linha `"{{ mode }} · {{ vagasLabel }}"` + percentual colorido (`{{ pctColor }}`) · barra de ocupação `.adm-bar` (vermelho `#c0293b` quando `data-hot="1"`, senão `var(--tk-accent)`). Header com link "Turmas →".

### 5b. Card "Leads por origem" (`sc-if value="{{ showBreakdown }}"`, condicional)
**Estrutura:** `padding:18px 24px 22px`, lista vertical `gap:14px`.

**Conteúdo/copy:** por origem — label + contagem `{{ o.n }}` + barra `.adm-bar` proporcional. Header com selo fixo "30 dias" (não é link).

**Divergência crítica:** produção tem só "Atividades Recentes" (feed genérico ícone + texto + timestamp relativo) — nenhum dos dois cards do canvas existe hoje.

---

## 6. Contrato de dados (seções dinâmicas `sc-for` / `{{ }}`)

| Placeholder | Campo(s) | Origem proposta | Fallback lista vazia |
|---|---|---|---|
| `{{ chips }}` | `name`, `label`, `on`, `pressed` | Enum de origem de lead (derivar de `leads.origem` distintos) | Chip "Todas" sempre presente; sem chips extras se não houver leads |
| `{{ leads }}` | `name`, `org`, `origem`, `tagStyle`, `interesse`, `quando`, `status`, `dotStyle` | Supabase `leads` (últimos 30 dias, filtrado por chip ativo) | `noLeads = true` → renderiza `.adm-empty` |
| `{{ turmas }}` | `day`, `mon`, `title`, `mode`, `vagasLabel`, `pct`, `pctColor`, `hot`, `barStyle` | Supabase `classes`/`turmas` com `data_inicio` futura, ordenado por proximidade | Card permanece, lista vazia sem item (sem empty-state dedicado no canvas — **adaptação necessária**, ver §8) |
| `{{ origens }}` | `label`, `n`, `barStyle` | Agregação de `leads.origem` nos últimos 30 dias | Se não houver leads no período, ocultar card (`showBreakdown=false`) |
| KPI "Matrículas no mês" | contagem de `enrollments` no mês corrente | Supabase `enrollments` | `0` |
| KPI "Leads novos" | contagem de `leads` últimos 30 dias + aguardando contato | Supabase `leads` | `0` |
| KPI "Turmas abertas" | contagem de `classes` com status aberto + próximas a iniciar (≤45 dias) | Supabase `classes` | `0` |
| KPI "Ocupação média" | média de `inscritos/vagas` das turmas abertas | Derivado de `classes` + `enrollments` | `0%` |
| Subtítulo do cabeçalho | data corrente formatada em pt-BR | `new Date()` client-side | — |

---

## 7. Responsivo

O canvas é desktop-only (1360px, sem breakpoints definidos). Estratégia de adaptação (fora do canvas, decisão de implementação):

- **≥1280px:** layout do canvas 1:1 (`248px 1fr` shell; `1fr 340px` no conteúdo).
- **1024–1279px:** sidebar mantém 248px; bloco direito (`340px`) passa a 100% de largura abaixo do card de leads (empilha verticalmente).
- **<1024px (mobile/tablet):** sidebar recolhe para navegação inferior/drawer (padrão já existente em `admin-bottom-navigation.tsx` — reaproveitar, não recriar); KPIs em grid `2×2`; tabela de leads com scroll horizontal (`overflow-x:auto`), mantendo as 6 colunas.

---

## 8. Adaptações (divergências deliberadas do canvas)

1. **Empty state de "Próximas turmas":** o canvas não define um `sc-if` para lista vazia deste bloco (diferente de leads/cursos/alunos, que têm `.adm-empty`). Adaptação: adicionar mensagem `"Nenhuma turma programada."` por consistência com os demais blocos.
2. **Contraste do chip ativo:** chip ativo usa `var(--tk-brand)` como fundo com texto branco — validar contraste ≥4.5:1 (AA) na implementação; mesmo ponto já levantado como ambiguidade #5 na story 14.0.2 para outros componentes Trust Keith.
3. **Fonte de dados em tempo real:** produção já possui `useRealTimeMetrics` (Supabase subscriptions, Épica 10). Ao reimplementar fiel ao canvas, **reaproveitar** esse hook para popular KPIs/leads/turmas em vez de recriar polling — reduz risco e é consistente com IDS (REUSE > CREATE).
4. **Navegação mobile:** o canvas não cobre mobile; adaptação de §7 reaproveita `admin-bottom-navigation.tsx` já existente no shell, não um novo componente.
5. **Badge de contagem "Leads":** o valor fixo `12` no canvas é placeholder de design; na implementação deve refletir `leads` com `status = "Novo"` (contagem dinâmica).

---

## 9. Divergências herdadas (não corrigir sem validação de produto)

- Seção "Relatório de Performance" (banner CTA navy no fim da página atual) **não existe no canvas**. Se for mantida, é uma decisão de produto adicional ao redesign — não assumir remoção automática sem confirmação do usuário.
