# Spec de Fidelidade — Agenda (`/agenda`)
**Canvas:** `public/RH Cursos Agenda.dc.html` · **View atual:** `src/views/public/Agenda.tsx` · **Story de implementação:** 14.2.3
**Ver também:** `docs/design/redesign/reference/screenshots/agenda-cal.png`, `agenda-cal2.png`, `agenda-cal3.png` (renders do modo calendário).

## Seções (na ordem do canvas)

### 1. Navegação (`.rh-nav`)
- Padrão idêntico às demais páginas internas (ver `spec-catalogo.md` §1). Item ativo: "Agenda" (`data-cur="1"`).

### 2. Header
- **Estrutura/grid:** `background: radial-gradient(circle at 50% -10%, #f7f9fc 30%, #ebf3ff 130%)`, `border-bottom:1px solid --tk-border`, `padding:64px 0 48px`; wrapper `.rh-wrap`.
- **Tokens/conteúdo:** `Badge` tone="accent" dot="true" — "Agenda"; H1 `--tk-font-display` 700 `--tk-text-display-large` `line-height:1.08` `letter-spacing:-0.02em` `margin:18px 0 14px` `max-width:20ch` `text-wrap:balance` — "Próximas turmas, em *ordem* de data" ("ordem" em itálico); parágrafo `--tk-font-serif` 300 `--tk-text-subhead` `line-height:1.45` cor `--tk-ink-muted` `max-width:58ch` margin-bottom `32px` — "Todas as turmas presenciais e online ao vivo confirmadas no calendário. Busque pelo nome do curso ou refine por modalidade, área e local."

#### 2.1 Barra de filtros
- **Estrutura:** `display:flex; flex-direction:column; gap:16px`. Linha principal: `display:flex; gap:12px; align-items:center; flex-wrap:wrap`, contendo (em ordem):
  1. `Input` (componente DS, via `dc-props`) — tipo `search`, placeholder "Buscar por curso, tema ou instrutor…", `leadingIcon` SVG de lupa, `flex:1 1 320px; min-width:240px`, hint 320×44px. **Nota:** diferente do Catálogo/Blog, aqui o componente `Input` do DS é usado diretamente (não markup customizado).
  2. Segmented control de modalidade (`.rh-seg`): `background: --tk-surface`, `border:1px solid --tk-border`, `border-radius: --tk-radius-button` (6px), `padding:4px`, `height:44px`. Botões `.rh-segbtn` (`--tk-text-body-sm` weight 500, cor `--tk-ink-muted`, `padding:0 16px`, `border-radius: --tk-radius-input` (4px)); ativo `[data-on="1"]` → `background: --tk-brand`, `color:#fff`, `font-weight:600`. Opções: "Todas" / "Online" / "Presencial".
  3. Select de área (`.rh-fsel`) — `--tk-radius-input`, altura 44px, seta custom SVG embutida via `background-image`; estado com filtro ativo (`[data-on="1"]`) → `border-color: --tk-brand`, `color: --tk-brand`, weight 600, `background-color: --tk-accent-soft`. Opções: "Todas as áreas", "Licitações e Contratos", "LGPD e Privacidade", "Gestão Pública", "Compliance".
  4. Select de local/cidade (`.rh-fsel`, mesmo estilo). Opções: "Todos os locais", "Online ao vivo", "Brasília · DF", "São Paulo · SP".
  5. Spacer `flex:1`.
  6. Select de ordenação (`.rh-sort`, mesmo estilo visual do `.rh-fsel` mas sem estado "ativo" destacado). Opções: "Data · mais próxima" (padrão), "Preço · menor primeiro", "Preço · maior primeiro".
  7. Toggle de visualização (`.rh-viewtoggle`): mesmo padrão visual do `.rh-seg` (`padding:4px`, `height:44px`); botões `.rh-vbtn` com ícone SVG + label "Lista" / "Calendário"; ativo `[data-on="1"]` → `background: --tk-brand`, `color:#fff` (sem negrito, diferente do `.rh-segbtn`).
- **Barra de filtros ativos (`sc-if value="{{ hasActive }}"`, `.rh-activebar`):** aparece somente quando há ao menos 1 filtro não-padrão aplicado. `display:flex; align-items:center; gap:10px; flex-wrap:wrap`. Label "Filtrando por:" (`--tk-text-caption`, cor `--tk-ink-muted`) + `sc-for activeChips` → pills `.rh-apill` (`background: --tk-line`, `border:1px solid --tk-border`, `border-radius: --tk-radius-pill`, `padding:6px 8px 6px 14px`) com botão de remoção "×" (círculo 18×18px `background: rgba(0,0,0,0.06)`; hover `background: --tk-brand color:#fff`) + botão "Limpar tudo" (`.rh-clearbtn`, cor `--tk-accent`, hover `--tk-accent-strong`).

### 3. Timeline da agenda
- **Cabeçalho da seção:** `display:flex; align-items:center; justify-content:space-between; margin-bottom:28px` — contagem "**{{ count }}** turmas encontradas" (`--tk-text-body-sm`) à esquerda, link `.rh-jlink` "Ver catálogo completo →" à direita.

#### 3.1 Modo Calendário (`sc-if value="{{ isCal }}"`)
- **Cabeçalho do mês:** `display:flex; align-items:center; justify-content:space-between; margin-bottom:20px`. Esquerda: label do mês (`--tk-font-display` 700 `--tk-text-subhead-lg` cor `--tk-ink`) + contagem "{{ calCount }} turmas" (`--tk-text-caption`). Direita: botões de navegação — `.rh-navbtn` (38×38px, `border:1px solid --tk-border`, `border-radius: --tk-radius-button`, ícone chevron; hover `border-color: --tk-accent`, `color: --tk-accent`) para mês anterior/próximo, e `.rh-todaybtn` ("Hoje", mesmo padrão de borda) entre eles.
- **Cabeçalho de dias da semana (`.rh-caldow`):** grid `repeat(7,1fr)`, `gap:8px`, `margin-bottom:8px`; labels "Dom, Seg, Ter, Qua, Qui, Sex, Sáb" — `font-size:11px` weight 600 `letter-spacing:0.06em` uppercase, cor `--tk-ink-muted`, centralizado.
- **Grade do mês (`.rh-calweek`/`.rh-cell`):** `sc-for calWeeks` (semanas) → `sc-for` (7 células/semana). Cada `.rh-cell`: `min-height:104px`, `border:1px solid --tk-line`, `border-radius:12px`, `padding:9px 10px`, `display:flex; flex-direction:column; gap:6px`.
  - Vazia fora do mês: `.rh-cell-empty` — `background: --tk-surface-2`, `border-style:dashed`, `border-color: --tk-line`.
  - Dia sem turma: apenas número do dia (`--tk-font-body` 13px weight 600 cor `--tk-ink-muted`).
  - Dia **com** turma: `.rh-cell-has` — `border-color: --tk-accent`, `box-shadow: 0 0 0 1px var(--tk-accent-soft) inset`; número do dia em cor `--tk-brand`; tag de modalidade (`.rh-modetag`, ver variantes abaixo) + título curto da turma (`.rh-celltitle`, `font-size:11.5px` weight 600 `line-height:1.25` cor `--tk-ink`, cursor pointer, hover `color: --tk-accent`).
  - **Tags de modalidade** (`.rh-modetag`): `display:inline-flex; gap:6px; font-size:11px; font-weight:600; padding:4px 10px; border-radius: --tk-radius-pill`. `.rh-mode-online` → `background: --tk-accent-soft`, `color: --tk-accent-strong`. `.rh-mode-presencial` → `background:#fdeef0`, `color:#c0293b` (hardcoded — não são tokens `--tk-*`, cores próprias do sistema de status "vermelho").

#### 3.2 Modo Lista (`sc-if value="{{ isList }}"`, padrão)
- **Agrupamento por mês:** `display:flex; flex-direction:column; gap:44px`. Cada grupo (`sc-for months`): `.rh-monthhead` (`display:flex; align-items:baseline; gap:14px; margin:0 0 18px; padding-bottom:12px; border-bottom:1px solid --tk-border`) — label do mês (`--tk-font-display` 700 `--tk-text-subhead-lg`) + "{{ mo.count }} turmas" (`--tk-text-caption`, cor `--tk-ink-muted`).
- **Linha de turma (`.rh-row`):** grid `96px 1fr auto`, `gap:26px`, `align-items:center`; `background: --tk-surface`, `border:1px solid --tk-border`, `border-radius: --tk-radius-card` (24px), `box-shadow: --tk-shadow-glass`, `padding:20px 26px`; hover → `transform: translateY(-2px)` + `box-shadow: --tk-shadow-card`.
  - **Coluna 1 — data (`.rh-datebox`):** `border-right:1px solid --tk-line`, `padding-right:22px`, `text-align:center`. Dia (`.rh-dnum`) `--tk-font-display` 700 `34px` `line-height:1` cor `--tk-brand` `letter-spacing:-0.02em`; mês abrev. (`.rh-dmon`) `12px` weight 600 `letter-spacing:0.08em` uppercase cor `--tk-ink-muted`; dia da semana (`.rh-dwk`) `11px` cor `--tk-ink-muted`.
  - **Coluna 2 — conteúdo:** tag de modalidade + categoria (`--tk-text-caption`, cor `--tk-ink-muted`), `margin-bottom:7px`; H3 título `--tk-font-display` 700 `--tk-text-subhead` (1.25rem) `letter-spacing:-0.01em` `line-height:1.25` cor `--tk-ink` `margin:0 0 8px` `text-wrap:pretty`; meta rows (`display:flex; gap:20px; flex-wrap:wrap`): ícone relógio + duração, ícone pin + local, ícone pessoas + instrutor (todos `.rh-meta`, `--tk-text-caption`, cor `--tk-ink-muted`).
  - **Coluna 3 — ação (`text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:12px; min-width:150px`):** badge de vagas (cor/fundo dinâmicos `{{ c.spotColor }}`/`{{ c.spotBg }}`, `font-size:11px` weight 600 `padding:4px 11px` `border-radius: --tk-radius-pill`); bloco de preço ("a partir de" + `.rh-price` `--tk-font-display` 700 `20px` cor `--tk-brand`); `Button` variant="primary" size="sm" hint 130×36px "Inscrever-se →".

#### 3.3 Estado vazio (`sc-if value="{{ empty }}"`)
- Mesmo padrão do Catálogo: título "Nenhuma turma nesse filtro" + parágrafo + `Button` secondary md "Falar com especialista →".

### 4. Faixa de cross-sell in-company
- Mesma estrutura de `spec-catalogo.md` §4, copy distinta: H2 "Nenhuma data serve para a sua equipe?"; parágrafo "Montamos uma turma fechada com o seu tema, no seu calendário e com o contexto da sua organização."; mesmos 2 botões ("Conhecer in-company →" / "Solicitar proposta").

### 5. Footer
- Idêntico ao padrão de `spec-catalogo.md` §5 (logo real na coluna 1).

## Contrato de dados

### `allCourses` (turmas — origem única para lista, calendário e filtros)
| Campo | Tipo | Origem sugerida | Regra | Fallback |
|---|---|---|---|---|
| `day`, `monShort`, `monKey`, `weekday` | string | `turma.data_inicio` (derivar dia/mês abrev./chave "Mês Ano"/dia da semana pt-BR) | — | — |
| `mode` | "Online"\|"Presencial" | `turma.modalidade` | — | — |
| `modeLabel`/`modeClass` | derivado | mapeamento fixo de `mode` | "Online"→"Online ao vivo"/`rh-mode-online`; "Presencial"→"Presencial"/`rh-mode-presencial` | — |
| `category` | string | `curso.categoria` | — | — |
| `title` | string | `curso.titulo` | — | — |
| `duration` | string | `turma.carga_horaria` + nº de encontros/dias | — | — |
| `place` | string | "Online ao vivo" ou "Cidade · UF" | — | — |
| `instructor` | string | `turma.instrutor.nome` | — | — |
| `price` | string (BRL) | `turma.preco` | — | — |
| `spots`/`spotColor`/`spotBg` | string | regra de negócio de vagas (ver `spec-catalogo.md`) | — | — |
| **Lista vazia** | — | — | — | `sc-if empty` cobre lista e calendário; calendário sem turmas no mês corrente ainda deve renderizar a grade vazia (dias sem eventos) |

### Filtros e estado de UI (não vem do backend, é estado de página)
| Campo | Tipo | Regra |
|---|---|---|
| `mode`, `area`, `city`, `search`, `sort` | string | Filtros combinados (AND) sobre `allCourses`; busca por título+categoria+instrutor (case-insensitive, `includes`) |
| `sort` | enum | "data" (padrão, ordena por `dateKey` ascendente), "preco-asc", "preco-desc" |
| `view` | "lista"\|"calendario" | Alterna entre §3.1 e §3.2 |
| `calY`/`calM` | number | Cursor do mês exibido no calendário; navegação `prevMonth`/`nextMonth`/`goToday` (hoje = valor inicial hardcoded no canvas: `calY:2026, calM:7` — **na implementação real, `goToday` deve usar a data atual do sistema**, não um valor fixo) |
| `months` | derivado | Agrupamento de `visible` (já filtrado/ordenado) por `monKey`, preservando ordem de primeira ocorrência |
| `calWeeks` | derivado | Grade de semanas do mês corrente (`calY`/`calM`) construída a partir de `visible` filtrado pelo mês |
| `activeChips` | derivado | Lista de filtros não-padrão ativos, cada um com label e função de remoção |

## Responsivo

- **Header + barra de filtros:** ≥1024 como no canvas (linha única com 7 controles). 768–1023: quebrar em 2 linhas — linha 1: busca (100% largura); linha 2: segmented control + selects + ordenação + toggle de visualização, com `flex-wrap`. <768: cada controle em largura total ou em par, empilhados verticalmente; toggle Lista/Calendário permanece visível no topo da timeline.
- **Modo Lista (`.rh-row`):** ≥1024: grid `96px 1fr auto` como no canvas. 768–1023: manter grid mas reduzir gaps. <768: empilhar em coluna (data no topo, conteúdo, ação por último), `border-right` do datebox vira `border-bottom`.
- **Modo Calendário (`.rh-calweek`):** ≥1024 e provavelmente ≥768: grade 7 colunas mantida (calendário tradicional não costuma quebrar para menos de 7 colunas). <768: considerar `min-height` menor por célula e ocultar título da turma se não couber (mostrar apenas indicador de tag/ponto), ou oferecer scroll horizontal — decisão de adaptação, canvas não cobre mobile do calendário.
- **Cross-sell band e footer:** mesmo padrão de `spec-catalogo.md`.

## Adaptações deliberadas

1. **`goToday` com data fixa no canvas (`calY:2026, calM:7`):** na implementação, usar a data atual real do sistema (`new Date()`), não o valor hardcoded do mock.
2. **Regra de vagas (`spots`/`spotColor`/`spotBg`):** mesma observação de `spec-catalogo.md` — regra de negócio não explicitada no canvas, propor confirmação com produto.
3. **Calendário em mobile:** o canvas não define comportamento abaixo de 1180px para a grade de 7 colunas — comportamento proposto nesta spec é adaptação, não fidelidade literal.
4. **Componente `Input` usado aqui, markup customizado no Catálogo/Blog:** inconsistência entre canvases — ao padronizar, decidir uma abordagem única (recomenda-se `Input` do DS em todas as páginas).
5. **A11y:** os `<select>` de área/local/ordenação já têm `aria-label` no canvas (mantido); garantir navegação por teclado nos botões de calendário e no toggle de visualização (não explicitado visualmente, mas exigido por padrão).
