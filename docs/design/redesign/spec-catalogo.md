# Spec de Fidelidade — Catálogo (`/cursos`)
**Canvas:** `public/RH Cursos Catálogo.dc.html` · **View atual:** `src/views/public/Courses.tsx` · **Story de implementação:** 14.2.2

## Seções (na ordem do canvas)

### 1. Navegação (`.rh-nav`)
- **Estrutura/grid:** idêntica ao padrão de nav das demais páginas internas: flex `justify-content:space-between`, `gap:32px`, padding `16px 40px`.
- **Tokens:** background `#ffffff` (`.rh-page.rh2 .rh-nav`); border-bottom `1px solid --tk-black-8`.
- **Conteúdo/copy:** logo (`logoHorizontal_800X600.png`, alt "RH Cursos e Treinamento Empresarial", 42px altura) · links "Cursos" (**ativo**, `data-cur="1"`), "Agenda", "In-company", "Consultoria", "Blog" · "Entrar" + `Button` primary sm "Fale com um especialista →".
- **Estados:** link ativo `.rh-nav a.link[data-cur="1"]` — opacidade `1`, cor `--tk-brand`, `font-weight:600`. Hover em links não ativos: opacidade `1` + `background: rgba(0,0,0,.04)`.

### 2. Header
- **Estrutura/grid:** `background: radial-gradient(circle at 50% -10%, #f7f9fc 30%, #ebf3ff 130%)` (gradiente hardcoded, não token — equivalente conceitual a `--tk-gradient-soft` mas com stops distintos), `border-bottom:1px solid --tk-border`, `padding:64px 0 52px`; wrapper `.rh-wrap` (max-width 1100px, padding 0 40px).
- **Tokens/conteúdo:** `Badge` tone="accent" dot="true" — "Cursos abertos · Agenda 2026"; H1 `--tk-font-display` 700 `--tk-text-display-large` (2.75rem) `line-height:1.08` `letter-spacing:-0.02em` cor `--tk-ink` margin `18px 0 14px` `max-width:20ch` `text-wrap:balance` — "Cursos para aplicar a norma *na prática*" (trecho "na prática" em itálico); parágrafo `--tk-font-serif` 300 `--tk-text-subhead` `line-height:1.45` cor `--tk-ink-muted` `max-width:58ch` margin-bottom `32px` — "Turmas presenciais e online ao vivo, com certificação e conteúdo atualizado às exigências legais e regulatórias — para profissionais de organizações públicas e privadas."
- **Barra de busca + contagem:** flex `gap:16px align-items:center flex-wrap:wrap`. Campo de busca: `<input class="rh-search">` **customizado** (não é o componente `Input` do DS) — `width:100%`, `padding:12px 16px 12px 42px` (espaço para ícone de lupa SVG posicionado `absolute left:15px`), `border:1px solid --tk-border`, `border-radius: --tk-radius-button` (6px), placeholder "Buscar por tema, área ou palavra-chave"; foco: `border-color: --tk-accent` + `box-shadow: 0 0 0 3px var(--tk-accent-soft)`. Contagem: `<strong>{{ count }}</strong>&nbsp;turmas na agenda`, `--tk-text-body-sm`.

### 3. Filtros + grade de cursos
- **Filtros (`.rh-filters`):** flex `flex-wrap:wrap gap:9px`, `margin-bottom:32px`. `sc-for list="{{ categories }}"` (placeholder 5) → botões `.rh-fchip`: `padding:9px 16px`, `border-radius: --tk-radius-pill`, `border:1px solid --tk-border`, `background: --tk-surface`, `color: --tk-ink`, `font-size: --tk-text-body-sm` weight 500; hover `border-color: --tk-accent`; estado ativo `[data-on="1"]` → `background: --tk-brand`, `color:#fff`, `border-color: --tk-brand`.
- **Grade (`.rh-grid`):** `display:grid; grid-template-columns:repeat(3,1fr); gap:22px`. `sc-for list="{{ visible }}"` (placeholder 6) → `article.rh-card`:
  - Container: `background: --tk-surface`, `border:1px solid --tk-border`, `border-radius: --tk-radius-card` (24px), `box-shadow: --tk-shadow-card`, `overflow:hidden`, `display:flex; flex-direction:column`; transição `transform .25s cubic-bezier(.25,.46,.45,.94), opacity .25s`; hover `transform: translateY(-3px)`.
  - `.rh-cardtop` (altura 112px, padding `16px 18px`, background inline `{{ c.tint }}` — gradiente por categoria, ex. `linear-gradient(135deg,#235875,#2f7599)`): badge de categoria (pill branco-sobre-cor: `background: rgba(0,0,0,0.22)`, `color:#fff`, `font-size:11px` weight 600 `letter-spacing:0.04em` uppercase, `padding:5px 10px`, `border-radius: --tk-radius-pill`) + badge de vagas (`background:#fff`, `color: {{ c.spotColor }}`, mesmo padding/radius).
  - Corpo (`padding:20px 22px 24px`, `display:flex; flex-direction:column; gap:14px`): H3 título `--tk-font-display` 700 `--tk-text-subhead` (1.25rem) `letter-spacing:-0.01em` `line-height:1.25` cor `--tk-ink` `text-wrap:pretty`; meta rows (`.rh-meta`, `--tk-text-caption`, cor `--tk-ink-muted`, ícone SVG 15×15 + texto): linha 1 ícone calendário + `{{ c.date }}`; linha 2 ícone relógio + `{{ c.mode }} · {{ c.duration }}`; rodapé do card (`display:flex; align-items:flex-end; justify-content:space-between; margin-top:auto; padding-top:14px; border-top:1px solid --tk-line`): preço ("a partir de" `--tk-text-caption` + valor `--tk-font-display` 700 `20px` cor `--tk-brand`) + link `.rh-jlink` "Ver turma →".
- **Estado vazio (`sc-if value="{{ empty }}"`):** `text-align:center; padding:64px 20px; color: --tk-ink-muted`; título `--tk-font-display` 700 `--tk-text-subhead-lg` cor `--tk-ink` — "Nenhuma turma encontrada"; parágrafo `--tk-font-serif` 300 — "Ajuste a busca ou fale com um especialista para uma turma sob medida."; `Button` variant="secondary" size="md" hint 200×44px "Falar com especialista →".

### 4. Faixa de cross-sell in-company
- **Estrutura/grid:** `background: --tk-cream`, `border-top/bottom:1px solid --tk-cream-dark`, `padding:56px 0`; wrapper flex `align-items:center justify-content:space-between gap:40px flex-wrap:wrap`.
- **Conteúdo:** `Badge` tone="brand" "Para equipes"; H2 `--tk-font-display` 700 `--tk-text-section` (2rem) `letter-spacing:-0.02em` `line-height:1.15` margin `14px 0 8px` `text-wrap:balance` — "Não achou a turma ideal para o seu time?"; parágrafo `--tk-font-serif` 300 `--tk-text-subhead` `line-height:1.45` cor `--tk-ink-muted` — "Levamos qualquer tema para dentro da sua organização, com o seu contexto e o seu calendário."; botões: `Button` primary lg hint 200×52px "Conhecer in-company →" + `Button` secondary lg hint 180×52px "Solicitar proposta".

### 5. Footer
- Idêntico ao padrão descrito em `spec-home-sections.md` §6, **exceto** que aqui a coluna 1 usa a **logo real** (`<img src="uploads/logoHorizontal_800X600.png" style="height:48px">`) em vez do wordmark customizado — este é o padrão a seguir nas demais páginas internas. Mesmas colunas "Ofertas"/"Empresa"/"Acesso" e barra de copyright.

## Contrato de dados

### `categories` (chips de filtro)
| Campo | Tipo | Origem | Regra | Fallback |
|---|---|---|---|---|
| `name` | string | Lista fixa de categorias do catálogo (derivada das categorias distintas em `cursos`/turmas, ou config estática) | Primeira opção sempre "Todos"; demais = categorias distintas presentes no catálogo | Se só houver 1 categoria além de "Todos", ocultar a barra de filtros |
| `on` | boolean/"1"/"0" | Estado local (categoria selecionada) | — | — |

### `visible` (grade de cursos)
| Campo | Tipo | Origem | Regra | Fallback |
|---|---|---|---|---|
| `category` | string | `curso.categoria` (Supabase) | — | — |
| `tint` | string (gradiente CSS) | Mapeamento fixo categoria→gradiente (paleta institucional, ver exemplos no script do canvas) | Definir mapa determinístico por categoria para manter consistência visual | Gradiente padrão neutro se categoria não mapeada |
| `title` | string | `curso.titulo` | — | — |
| `date` | string | `turma.data_inicio` formatada "DD Mês AAAA" | próxima turma daquele curso | — |
| `mode` | string | `turma.modalidade` | — | — |
| `duration` | string | `turma.carga_horaria` | — | — |
| `price` | string (BRL) | `turma.preco` | — | — |
| `spots` | string | `turma.vagas_status` ("Poucas vagas"/"Inscrições abertas"/"Turma nova") | regra de negócio: vagas ≤ N → "Poucas vagas"; turma criada há < 7 dias → "Turma nova"; caso contrário "Inscrições abertas" | — |
| `spotColor` | string (hex) | Derivado de `spots` (mapeamento fixo: vermelho/verde/azul) | — | — |
| **Lista vazia** | — | — | — | `sc-if empty` já cobre este caso no canvas — usar estado vazio documentado acima |

### `query` / `count`
- `query`: string de busca (estado local, filtra por título/categoria).
- `count`: total de turmas no catálogo (não filtradas) — `all.length` no canvas.

## Responsivo

- **Header:** ≥1024 como no canvas. 768–1023: reduzir `padding` vertical para ~48px, manter H1 em `--tk-text-display-large` ou reduzir 1 passo. <768: H1 reduz mais (ex. `--tk-text-section`), busca ocupa 100% da largura, contagem de turmas quebra para linha abaixo da busca.
- **Filtros (`.rh-filters`):** já é `flex-wrap`, portanto reflow automático em qualquer largura — sem alteração necessária.
- **Grade (`.rh-grid`):** ≥1024: 3 colunas. 768–1023: 2 colunas. <768: 1 coluna, cards em largura total.
- **Cross-sell band:** ≥1024 como no canvas (flex space-between). <1024: empilhar texto e botões (coluna), botões em largura total ou lado a lado conforme espaço.
- **Footer:** mesmo padrão de `spec-home-sections.md` (4→2→1 colunas).

## Adaptações deliberadas

1. **Campo de busca customizado (`.rh-search`) em vez do componente `Input`:** o canvas usa markup próprio, não o `x-import Input` do DS (diferente do header da Agenda, que usa `Input` com `leadingIcon`). Decisão recomendada: padronizar para o componente `Input` primitivo em todas as páginas por consistência — se adotada, este é um desvio documentado do canvas.
2. **Mapeamento `tint`→categoria:** o canvas usa gradientes específicos por instância de curso no mock, não uma regra category→gradiente explícita. Definir um mapa fixo determinístico por categoria para a implementação real (ver Contrato de dados).
3. **Regra de "vagas" (`spots`/`spotColor`):** o canvas não define a regra de negócio por trás dos rótulos "Poucas vagas"/"Turma nova"/"Inscrições abertas" — proposta de regra incluída no Contrato de dados; validar com produto antes de implementar.
4. **Responsivo:** integralmente definido nesta spec (canvas fixo em 1180px).
5. **A11y:** garantir `aria-label` no campo de busca e foco visível (`--tk-focus-ring`) em chips de filtro, não explicitados no canvas estático.
