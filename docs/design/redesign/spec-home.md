# Spec de Fidelidade — Home (`/`)
**Canvas:** `public/RH Cursos Home.dc.html` · **View atual:** `src/views/public/Home.tsx` · **Story de implementação:** 14.2.1

## Nota sobre variantes do canvas

O canvas Home contém **um único bloco de conteúdo**, com `id="2a"` e classe `.rh2` (remap de marca aplicado, com logo real via `<img src="uploads/logoHorizontal_800X600.png">`). Não há outros ids irmãos (`2b`, `2c`, ...) no arquivo — ou seja, **não existem variantes alternativas a descartar** nesta versão do canvas. `2a` é tratada como a variante principal (e única) documentada abaixo. Caso uma versão anterior do canvas tivesse alternativas, elas já não estão presentes no arquivo lido em 2026-07-02.

O canvas termina com `<dc-import name="RH Home Sections" hint-size="1180px,2400px">`, ou seja, a Home é composta por **Nav + Hero** (deste canvas) seguidos das seções do canvas `RH Home Sections.dc.html` (documentadas em `spec-home-sections.md`), na ordem em que aparecem naquele arquivo.

## Seções (na ordem do canvas)

### 1. Navegação (`.rh-nav`)
- **Estrutura/grid:** flex `justify-content:space-between`, `align-items:center`, `gap:32px`; padding `16px 40px`.
- **Tokens:** background `#ffffff` (override `.rh2 .rh-nav`, base seria `--tk-line`); border-bottom `1px solid var(--tk-black-8)`; fonte `--tk-font-body`.
- **Conteúdo/copy:** logo (`<img>` `uploads/logoHorizontal_800X600.png`, alt "RH Cursos e Treinamentos Empresariais", altura 42px) · links "Cursos", "Agenda", "In-company", "Consultoria", "Blog" · à direita: "Entrar" (link) + botão primário.
- **Componentes/padrões:** links `.rh-nav a.link` (cor `--tk-ink`, `font-size: --tk-text-body-sm`, `font-weight:500`, opacidade `.82`; hover opacidade `1` + `background: rgba(0,0,0,.04)`); `Button` variant="primary" size="sm" hint 180×32px, texto "Fale com um especialista →".
- **Estados:** hover em links (`.rh-nav a.link:hover`). Nenhum link tem `data-cur="1"` neste canvas (diferente de Catálogo/Agenda/etc., que marcam a página atual) — **gap**: Home não indica item de nav ativo no canvas; ao implementar, ativar "Cursos abertos"/Home conforme padrão das outras páginas é uma decisão de adaptação, não fidelidade literal.

### 2. Hero (`.rh-heroA`)
- **Estrutura/grid:** grid `1.05fr 0.95fr`, `gap:52px`, `align-items:center`, padding `72px 40px 80px`; background-color inline `#F3F0E8` (hardcoded, não é um token — ver INVENTORY §1 "Fundo hero (hardcoded)").
- **Coluna esquerda:**
  - `Badge` tone="accent" dot="true", hint 26px altura — texto "Educação corporativa · Desde 2007".
  - H1: `font-family: --tk-font-display`, `font-weight:700`, `font-size: --tk-text-display-hero` (3.75rem/60px), `line-height:1.06`, `letter-spacing:-0.02em`, cor `--tk-ink`, margin `20px 0 20px`, `text-wrap:balance`. Texto: "Conhecimento técnico que sua equipe *aplica no mesmo dia*." — trecho "aplica no mesmo dia" em `<span style="font-style:italic;color:var(--rh-teal-deep)">`.
  - Parágrafo: `font-family: --tk-font-serif`, `font-weight:300`, `font-size: --tk-text-subhead-lg` (1.5rem/24px), `line-height:1.45`, cor `--tk-ink-muted`, `max-width:48ch`, `text-wrap:pretty`. Texto: "Cursos abertos, treinamentos in company e consultoria para o setor público e privado. São quase 80 cursos em 6 trilhas de conhecimento, do básico ao avançado, presenciais ou online."
  - Botões (flex, `gap:12px`, `flex-wrap:wrap`, `margin-bottom:28px`): `Button` variant="primary" size="lg" hint 220×52px "Ver agenda de cursos →"; `Button` variant="secondary" size="lg" hint 180×52px "Solicitar proposta in company" — **com override inline** `style="color: var(--tk-cta-hover); text-transform: none"` (desvio pontual do variant padrão secundário — transcrever literalmente).
  - Chips (flex, `gap:10px`, `flex-wrap:wrap`): dois `.rh-chip` — "80 cursos · 6 trilhas" e "Presencial e online".
- **Coluna direita — cartão "Próximas turmas" (`.rh-paper` com override de gradiente):**
  - Base `.rh-paper`: `background: linear-gradient(158deg, var(--rh-paper-a), var(--rh-paper-b))`, `border: 1px solid var(--rh-paper-line)`, `border-radius: --tk-radius-card` (24px), `box-shadow: --tk-shadow-card`. **Override inline** neste card: `padding: 38px 32px`, `display:flex; flex-direction:column; gap:22px; align-items:center`, `background: linear-gradient(158deg, #FFFFFF, #EBEBEB)` (gradiente branco→cinza claro, diferente do gradiente "paper" padrão `--rh-paper-a/b`).
  - Logo (`<img>` mesma logo horizontal, `max-width:320px`, `margin:6px 0`).
  - Divisor `1px` `background: var(--rh-paper-line)`.
  - Label "Próximas turmas": `font-family: --tk-font-display`, `font-weight:700`, `font-size:15px`, cor `--tk-ink`, `margin-bottom:12px`.
  - Lista (`display:grid; gap:10px`) de `sc-for list="{{ courses }}" as="c"` (placeholder count 3) — cada item:
    - Container: flex `gap:14px`, `align-items:center`, `background: rgba(255,255,255,0.7)`, `border:1px solid var(--rh-paper-line)`, `border-radius: --tk-radius-glass` (16px), `padding:11px 13px`.
    - Bloco de data (`width:48px`, `text-align:center`): dia — `font-family: --tk-font-display`, `font-weight:700`, `font-size:20px`, cor `--rh-teal-deep`, `line-height:1`; mês — `font-size:10px`, `text-transform:uppercase`, `letter-spacing:0.06em`, cor `--rh-gray`, `margin-top:1px`.
    - Bloco de título: título — `font-family: --tk-font-body`, `font-weight:600`, `font-size: --tk-text-body-sm`, cor `--tk-ink`, `line-height:1.3`; modalidade — `font-size: --tk-text-caption`, cor `--tk-ink-muted`, `margin-top:2px`.
- **Estados:** nenhum hover documentado no card "Próximas turmas" (lista estática, sem link/click no canvas).

## Contrato de dados

### `courses` (sc-for na coluna direita do hero)
| Campo | Tipo | Origem sugerida | Regra | Fallback |
|---|---|---|---|---|
| `day` | string (2 díg.) | Supabase — tabela de turmas (`turmas`/`class_sessions`), campo data de início | Próximas 3 turmas por `data_inicio` ascendente, a partir de hoje | — |
| `month` | string (abrev. 3 letras, pt-BR) | derivado de `data_inicio` | formatação `MMM` capitalizado | — |
| `title` | string | `turmas.curso.titulo` ou `turmas.titulo` | truncar se necessário para caber em 2 linhas | — |
| `mode` | string ("Online ao vivo" / "Presencial · Cidade") | `turmas.modalidade` + `turmas.local` quando presencial | — | — |
| `spots` (presente nos dados do script, não renderizado no markup atual) | string | `turmas.vagas_status` | usado apenas se o card evoluir para exibir vagas | — |
| **Lista vazia** | — | — | — | Ocultar o bloco "Próximas turmas" ou exibir mensagem "Nenhuma turma agendada no momento" + CTA para agenda completa (decisão de adaptação, canvas não cobre este caso) |

Nota: o script do canvas (`renderVals`) inclui campo `spots` no objeto `courses`, mas o markup não o exibe — é dado morto no canvas atual. Ao implementar, decidir se `spots` deve ser exibido (ex.: como badge) ou descartado; se descartado, não trazer o campo para o contrato de dados real.

## Responsivo

Canvas é desktop 1180px (`.rh-page`). Adaptação proposta:

- **Nav (≥1024):** como no canvas. **768–1023:** manter logo + botão CTA, links colapsam em menu mobile existente do projeto (hambúrguer). **<768:** logo + hambúrguer, "Entrar" e botão primário movem para dentro do menu ou ficam compactos.
- **Hero (≥1024):** grid 1.05fr/0.95fr como no canvas, padding lateral reduzido de 40px para o gutter padrão do container do projeto. **768–1023:** grid empilha em 1 coluna (texto acima, cartão "Próximas turmas" abaixo), padding vertical reduzido (~56px), `max-width` do parágrafo mantido. **<768:** 1 coluna, H1 reduz para `--tk-text-display-large` (2.75rem) ou menor conforme escala do projeto, botões em coluna cheia largura, chips quebram em múltiplas linhas, padding lateral 16–20px.
- **Cartão "Próximas turmas":** em mobile, largura 100%, padding reduz para 24px.

## Adaptações deliberadas

1. **Dados reais via Supabase:** `courses` do hero substituído por consulta real às próximas 3 turmas (ver Contrato de dados).
2. **Item de nav ativo:** o canvas Home não marca nenhum link como atual (`data-cur`); adicionar destaque de página ativa é adaptação (não fidelidade), alinhada ao padrão usado nas demais páginas.
3. **Campo `spots` não renderizado:** decidir se será exibido ou removido do contrato de dados (ver nota acima).
4. **Responsivo:** todos os breakpoints (tablet/mobile) são definição desta spec — o canvas é fixo em 1180px e não define comportamento abaixo disso.
5. **Acessibilidade:** adicionar `alt` descritivo já presente nas imagens do canvas (mantido); garantir contraste e foco visível (`--tk-focus-ring`) em links e botões nos estados interativos não cobertos visualmente pelo canvas estático.
6. **Sem variantes descartadas:** diferente do que a Epic 14 supunha, não há variantes alternativas de seção no canvas Home atual (`2a` é o único bloco) — não há "seções b/c" a excluir.
