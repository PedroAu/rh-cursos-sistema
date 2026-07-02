# Spec de Fidelidade — Blog (`/blog`)
**Canvas:** `public/RH Cursos Blog.dc.html` · **View atual:** `src/views/public/Blog.tsx` (+ `src/views/public/BlogPost.tsx` para `/blog/[slug]` na 14.2.6) · **Story de implementação:** 14.2.6

## Seções (na ordem do canvas)

### 1. Navegação (`.rh-nav`)
- Padrão idêntico às demais páginas internas. Item ativo: "Blog" (`data-cur="1"`).

### 2. Header
- **Estrutura/grid:** `background: radial-gradient(circle at 50% -10%, #f7f9fc 30%, #ebf3ff 130%)`, `border-bottom:1px solid --tk-border`, `padding:60px 0 46px`; wrapper `.rh-wrap`.
- **Conteúdo:** `Badge` tone="accent" dot="true" — "Conteúdo · Análises · Prática"; H1 `--tk-font-display` 700 `--tk-text-display-large` `line-height:1.08` `letter-spacing:-0.02em` `margin:18px 0 14px` `max-width:22ch` `text-wrap:balance` — "A norma explicada de um jeito que você *usa*" ("usa" em itálico); parágrafo `--tk-font-serif` 300 `--tk-text-subhead` `line-height:1.45` cor `--tk-ink-muted` `max-width:60ch` — "Análises práticas de licitações, LGPD, compliance e gestão pública — escritas por quem aplica essas normas no dia a dia de organizações públicas e privadas."

### 3. Destaque + em alta
- **Estrutura/grid:** `padding:52px 0 8px`; `.rh-featgrid` = grid `1.35fr 1fr`, `gap:36px`, `align-items:stretch`. **Breakpoint já definido no canvas:** `@media(max-width:860px){ .rh-featgrid{grid-template-columns:1fr} }`.
- **Post em destaque (`article.rh-card`, coluna esquerda):**
  - `.rh-cardtop` com `height:300px` (override do padrão 158px), `background: linear-gradient(135deg,#235875,#2f7599)` (gradiente decorativo fixo — mesma observação de `spec-quem-somos.md` sobre cores base do DS usadas decorativamente, não como marca), `align-items:flex-start`.
  - Tag de categoria `.rh-cattag` (`background: rgba(255,255,255,0.22)`, ponto branco 6×6px) — "Em destaque · Licitações".
  - `.rh-kicker` (número gigante decorativo, `font-family: --tk-font-display` 700, aqui override `font-size:96px` `color:rgba(255,255,255,0.22)`, posicionado `absolute right:16px bottom:6px`) — "14.133" (referência à Lei 14.133/21).
  - Corpo (`padding:26px 28px 28px`, `display:flex; flex-direction:column; gap:14px`): meta row (`.rh-meta` com separadores `.rh-dot`) — "Ana Ribeiro · 28 Jun 2026 · 8 min de leitura"; H2 `--tk-font-display` 700 `font-size: var(--tk-text-display)` `line-height:1.14` `letter-spacing:-0.02em` cor `--tk-ink` `text-wrap:balance` — "Nova Lei de Licitações: os 7 erros que ainda travam pregões em 2026" (**mesmo gap de token `--tk-text-display` já sinalizado em `spec-quem-somos.md`**); parágrafo `--tk-font-serif` 300 `--tk-text-subhead` `line-height:1.5` cor `--tk-ink-muted` `text-wrap:pretty` — "Depois da transição definitiva para a Lei 14.133/21, os mesmos deslizes se repetem nas comissões. Mapeamos os mais comuns — e o que fazer antes de publicar o edital."; link `.rh-jlink` `margin-top:auto` — "Ler artigo completo →".
- **Em alta esta semana (`aside`, coluna direita):** `background: --tk-surface`, `border:1px solid --tk-border`, `border-radius: --tk-radius-card`, `box-shadow: --tk-shadow-card`, `padding:26px 28px`, `display:flex; flex-direction:column`. Cabeçalho: ponto vermelho 8×8px (`background: --tk-error`) + eyebrow "Em alta esta semana" (`--tk-text-caption`, weight 600, `letter-spacing: --tk-tracking-eyebrow`, uppercase, cor `--tk-ink-muted`). `sc-for list="{{ trending }}"` (placeholder 4) → `.rh-trend` (`display:flex; gap:14px; padding:16px 0; border-bottom:1px solid --tk-line; cursor:pointer`, sem borda no último item; hover → título muda para `--tk-accent`):
  - Número `.rh-trend-num` (`--tk-font-display` 700 `24px` cor `--tk-border` `width:30px`).
  - Categoria (`11px` weight 600 cor `--tk-accent` uppercase `letter-spacing:0.04em`).
  - Título `.rh-trend-title` (`--tk-font-display` 700 `--tk-text-body` (1rem) `line-height:1.28` cor `--tk-ink` `letter-spacing:-0.01em`).
  - Tempo de leitura (`--tk-text-caption`, cor `--tk-ink-muted`).
  - **4 itens do mock:** "Lei 14.133: o que muda no rito de contratação direta" (Licitações, 5 min); "Compartilhamento de dados entre órgãos: o que a lei permite" (LGPD, 7 min); "Conflito de interesses: como declarar e como fiscalizar" (Compliance, 4 min); "Indicadores que a alta gestão realmente acompanha" (Gestão Pública, 6 min).

### 4. Filtros + busca
- **Estrutura/grid:** `padding:44px 0 0`; cabeçalho flex `align-items:flex-end justify-content:space-between gap:24px flex-wrap:wrap margin-bottom:26px`: H2 "Últimos artigos" (`--tk-font-display` 700 `--tk-text-section` `letter-spacing:-0.02em` `margin:0 0 4px`) + "{{ count }} publicações · atualizado toda semana" (`--tk-text-body-sm`, cor `--tk-ink-muted`) à esquerda; campo de busca à direita (`width:300px`, `.rh-search` **customizado**, mesmo padrão visual do Catálogo — não é o componente `Input` do DS — ícone lupa absoluto, placeholder "Buscar por tema ou palavra-chave").
- **Chips de categoria (`.rh-fchip`):** `sc-for list="{{ categories }}"` (placeholder 5), mesmo padrão visual do Catálogo (`data-on="1"` → fundo `--tk-brand`).

### 5. Grade de posts
- **Estrutura/grid:** `.rh-grid` = `repeat(3,1fr)`, `gap:22px`. `sc-for list="{{ visible }}"` (placeholder 6) → `article.rh-card` (`cursor:pointer`, hover `translateY(-3px)`):
  - `.rh-cardtop` (altura padrão 158px, background `{{ p.tint }}`): tag de categoria `.rh-cattag` + `.rh-kicker` (glifo decorativo, tamanho padrão `56px`, cor `rgba(255,255,255,0.28)`, posição `absolute right:16px bottom:6px`).
  - Corpo (`padding:20px 22px 22px`, `gap:11px`): H3 `--tk-font-display` 700 `--tk-text-subhead-lg` (1.5rem) `line-height:1.22` `letter-spacing:-0.01em` cor `--tk-ink` `text-wrap:balance`; excerpt `--tk-font-body` `--tk-text-body-sm` `line-height:1.55` cor `--tk-ink-muted`; meta row `margin-top:auto padding-top:6px` — autor · data · tempo de leitura.
- **Estado vazio (`sc-if value="{{ empty }}"`, `.rh-empty`, `grid-column:1/-1`):** título `--tk-font-display` 700 `--tk-text-subhead-lg` — "Nenhum artigo encontrado"; subtítulo `--tk-text-body-sm` — "Tente outra palavra-chave ou categoria."

### 6. CTA de newsletter
- **Estrutura/grid:** `background: --tk-cream`, `border-top/bottom:1px solid --tk-cream-dark`, `padding:64px 0`; grid `1.1fr 0.9fr`, `gap:48px`, `align-items:center`.
- **Coluna esquerda:** `Badge` tone="brand" "Newsletter quinzenal"; H2 `--tk-font-display` 700 `--tk-text-display-large` `letter-spacing:-0.02em` `line-height:1.1` `margin:16px 0 12px` `text-wrap:balance` — "Receba a leitura certa antes da *próxima* mudança" ("próxima" em itálico); parágrafo `--tk-font-serif` 300 `--tk-text-subhead` `line-height:1.5` cor `--tk-ink-muted` `text-wrap:pretty` — "Uma edição a cada duas semanas com o que mudou nas normas, o que fazer a respeito e os artigos que valem o seu tempo. Sem spam."
- **Coluna direita — card de inscrição:** `background: --tk-surface`, `border:1px solid --tk-border`, `border-radius: --tk-radius-card`, `box-shadow: --tk-shadow-card`, `padding: --tk-space-8`, `display:flex; flex-direction:column; gap:14px`. 2 inputs `.rh-search` (reaproveitado, `padding-left:16px` — sem ícone de lupa aqui, apenas o estilo base): placeholder "Seu nome" e "Seu melhor e-mail"; `Button` variant="primary" size="lg" hint 100%×52px "Quero receber →"; texto legal centralizado `--tk-text-caption` cor `--tk-ink-muted` — "+4.200 profissionais já recebem. Cancele quando quiser."

### 7. Footer
- Padrão idêntico ao das demais páginas internas (logo real), com a coluna "Empresa" destacando "Blog" em cor `--tk-brand` weight 600 (página atual).

## Contrato de dados

### `trending` (em alta esta semana)
| Campo | Tipo | Origem sugerida | Regra | Fallback |
|---|---|---|---|---|
| `n` | string (posição) | Calculado (índice + 1) | Top 4 por algum critério de popularidade | — |
| `category` | string | `post.categoria` | — | — |
| `title` | string | `post.titulo` | — | — |
| `read` | string | `post.tempo_leitura` (calculado por contagem de palavras ou campo manual) | — | — |
| **Ranking/critério** | — | Não definido no canvas (mock estático) | Propor: mais visualizados nos últimos 7 dias (analytics) ou curadoria manual (campo `destaque_trending`) | Se não houver dados suficientes, ocultar o card "Em alta esta semana" ou preencher com os posts mais recentes |
| **Lista vazia** | — | — | — | Ocultar aside inteiro se não houver ao menos 1 item |

### `visible` (grade de posts) e post em destaque
| Campo | Tipo | Origem sugerida | Regra | Fallback |
|---|---|---|---|---|
| `category` | string | `post.categoria` | — | — |
| `tint` | string (gradiente) | Mapeamento fixo categoria→gradiente (mesmo mecanismo do Catálogo) | — | gradiente neutro |
| `glyph` | string (1 caractere) | Mapeamento fixo categoria→glifo | — | glifo genérico |
| `title` | string | `post.titulo` | — | — |
| `excerpt` | string | `post.resumo` | truncar para caber em ~2-3 linhas | — |
| `author` | string | `post.autor.nome` | — | — |
| `date` | string | `post.publicado_em` formatada "DD Mês AAAA" | — | — |
| `read` | string | `post.tempo_leitura` | — | — |
| Post em destaque | objeto | `post` com flag `destaque=true` (o mais recente marcado como destaque, ou o mais recente por padrão) | Apenas 1 post em destaque por vez | Se nenhum marcado, usar o post mais recente |
| **Lista vazia** | — | — | — | `sc-if empty` cobre a grade; página deve continuar funcional mesmo sem posts (ex.: recém-lançada) |

### `categories` (chips de filtro)
| Campo | Tipo | Origem | Regra |
|---|---|---|---|
| `name`/`on` | string/boolean | Categorias distintas dos posts publicados, + "Todos" | Estado local de seleção |

### Newsletter (formulário)
| Campo | Tipo | Destino sugerido | Validação |
|---|---|---|---|
| Nome | string | Tabela de assinantes de newsletter (Supabase) ou provedor externo (ex. Mailchimp/Resend) | opcional ou obrigatório conforme decisão de produto |
| E-mail | email | idem | obrigatório, formato e-mail, duplicidade tratada (idempotente) |

## Responsivo

- **Destaque + em alta (`.rh-featgrid`):** breakpoint já definido no canvas — `@media(max-width:860px){ grid-template-columns:1fr }`. Usar como referência; abaixo de 860px o post em destaque fica acima do card "Em alta".
- **Filtros + busca:** ≥1024 como no canvas (flex space-between). <1024: empilhar cabeçalho (H2+contagem) acima da busca, busca em largura total.
- **Grade de posts (`.rh-grid`):** ≥1024: 3 colunas. 768–1023: 2 colunas. <768: 1 coluna.
- **Newsletter CTA (`grid 1.1fr 0.9fr`):** ≥1024 como no canvas. <1024 (sem breakpoint explícito, mas consistente com padrões de outras páginas): colapsar para 1 coluna (texto acima, card de inscrição abaixo).
- **Footer:** mesmo padrão das demais páginas.

## Adaptações deliberadas

1. **Critério de "em alta esta semana":** o canvas não define a regra de negócio (dados mock estáticos) — propor ranking por visualizações recentes ou curadoria manual; validar com produto.
2. **Post em destaque:** definir mecanismo real de seleção (flag manual vs. "mais recente automaticamente").
3. **Campo de busca customizado (`.rh-search`):** mesma observação do Catálogo — avaliar padronização para o componente `Input` do DS.
4. **Token `--tk-text-display`** usado no H2 do post em destaque — mesmo gap already sinalizado em `spec-quem-somos.md`, confirmar valor exato na story 14.0.3/14.0.4.
5. **Gradiente do post em destaque (`#235875,#2f7599`)** é decorativo fixo, não remapeado para `.rh2` — mesma observação de `spec-quem-somos.md` (não é cor de marca/CTA, é aceitável manter literal).
6. **Newsletter → provedor de envio:** integração real de e-mail marketing (dupla confirmação, unsubscribe, etc.) é adaptação de implementação não coberta pelo canvas.
7. **Rota `/blog/[slug]` (página de post individual):** não há canvas dedicado entre os 7 arquivos desta story para o artigo individual — a story 14.2.6 (que também cobre `BlogPost.tsx`) precisará de uma spec própria ou reaproveitar os padrões tipográficos documentados aqui (H1/H2 display, parágrafos serif/body) — **gap a resolver antes da 14.2.6**, fora do escopo desta spec de listagem.
8. **Responsivo:** breakpoint de 860px para `.rh-featgrid` já vem do canvas; demais definidos nesta spec.
