# Spec de Fidelidade — Home Sections (complemento da Home, `/`)
**Canvas:** `public/RH Home Sections.dc.html` · **View atual:** `src/views/public/Home.tsx` · **Story de implementação:** 14.2.1

## Integração com a Home

Este canvas é importado pela Home via `<dc-import name="RH Home Sections">` logo após o Hero (ver `spec-home.md`, seção 2). Na story 14.2.1, as seções abaixo devem ser renderizadas **nesta ordem**, imediatamente após o Hero e antes de qualquer conteúdo adicional:

1. Journeys ("Escolha como quer avançar")
2. Consultoria — conversão
3. Estatísticas ("A RH Cursos em números")
4. Depoimento
5. CTA de fechamento
6. Footer

O wrapper externo usa `background: var(--tk-surface); color: var(--tk-text); font-family: var(--tk-font-body)` e um container `.rh-wrap { max-width:1120px; margin:0 auto; padding:0 40px }` — diferente do `.rh-wrap` de 1100px usado nas demais páginas (Catálogo/Agenda/etc. usam `max-width:1100px`). Ao integrar na Home, usar o container padrão do projeto (a diferença de 20px entre 1120/1100 não é significativa e não deve gerar dois containers distintos).

## Seções (na ordem do canvas)

### 1. Journeys — "Escolha como quer avançar"
- **Estrutura/grid:** section padding `88px 0 72px`; cabeçalho com `max-width:640px; margin-bottom:44px`; grid `.rh-journeys` = `repeat(auto-fit, minmax(272px,1fr))`, `gap:24px` (3 cards).
- **Tokens (cabeçalho):** `Badge` tone="accent" "Três caminhos, um só objetivo"; H2 `--tk-font-display` 700 `--tk-text-display-large` (2.75rem) `letter-spacing:-0.02em` `line-height:1.1` cor `--tk-ink` margin `18px 0 14px` — "Escolha como quer avançar"; parágrafo `--tk-font-serif` 300 `--tk-text-subhead` (1.25rem) `line-height:1.45` cor `--tk-ink-muted` — "Conteúdo aplicável à legislação vigente e à realidade de organizações públicas e privadas."
- **Cards (3, mesma estrutura base):** `background: --tk-surface`, `border:1px solid --tk-border`, `border-radius: --tk-radius-card` (24px), `box-shadow: --tk-shadow-card`, `padding: --tk-space-8` (32px), `display:flex; flex-direction:column; gap:16px; min-height:288px`.
  1. **Cursos abertos** — ícone 48×48px `border-radius:12px` `background:--tk-accent-soft` `color:--tk-brand` (SVG livros); `Badge` tone="muted" "Para profissionais"; H3 `--tk-font-display` 700 `--tk-text-subhead-lg` (1.5rem) `letter-spacing:-0.01em` — "Cursos abertos"; parágrafo `--tk-text-body` `line-height:1.55` cor `--tk-ink-muted` — "Turmas com agenda pública, presenciais e online ao vivo, com certificação e conteúdo atualizado."; link `.rh-jlink` (cor `--tk-accent`, `--tk-text-body-sm`, weight 600, hover `--tk-accent-strong`) "Ver agenda de cursos →" (`margin-top:auto`).
  2. **Cursos in-company** — mesmo ícone/estilo; `Badge` tone="muted" "Para organizações"; H3 "Cursos in-company"; parágrafo "Programas sob medida para a sua equipe, no seu contexto operacional, com o seu calendário e os seus casos reais."; link "Levar para minha equipe →".
  3. **Consultoria** — card com `border:1px solid var(--tk-brand)` (diferencia visualmente); ícone 48×48px `background:--tk-brand` `color:#fff` (SVG estrela); `Badge` tone="accent" "Novo"; H3 "Consultoria"; parágrafo "Apoio especializado para aplicar normas e requisitos regulatórios à realidade do seu órgão ou empresa do diagnóstico à execução."; link "Solicitar proposta →".
- **Componentes/padrões:** `Badge`, cards compostos (variante de `.rh-paper`/`card` genérica — usar `Card`/padrão `rh-card` com borda customizada no card 3).
- **Estados:** nenhum hover explícito nos cards (apenas no link, cor muda para `--tk-accent-strong`).

### 2. Consultoria — conversão
- **Estrutura/grid:** section `background: --tk-cream`, `border-top/bottom: 1px solid --tk-cream-dark`, `padding:80px 0`; `.rh-consult` = grid `1.05fr 0.95fr`, `gap:56px`, `align-items:center` (em `≤820px` colapsa para `1fr`, `gap:36px` — **breakpoint já definido no canvas**, ver seção Responsivo).
- **Coluna esquerda:** `Badge` tone="brand" "Consultoria"; H2 `--tk-font-display` 700 `--tk-text-display-large` `letter-spacing:-0.02em` `line-height:1.1` margin `18px 0 16px` `text-wrap:balance` — "A norma aplicada ao *seu* contexto" (palavra "seu" em itálico via `<span style="font-style:italic">`); parágrafo `--tk-font-serif` 300 `--tk-text-subhead` `line-height:1.5` cor `--tk-ink-muted` margin-bottom `28px` — "Cada norma pesa de um jeito na sua operação. Nossa consultoria traduz requisitos legais em processos claros, que a sua equipe aplica no dia a dia."; lista `FeatureListItem` tone="brand" ×3 ("Diagnóstico do seu contexto normativo e operacional"; "Plano de adequação aplicável, com passos priorizados"; "Acompanhamento por especialistas com experiência de campo"), `gap:14px`; `Button` variant="primary" size="lg" hint 220×52px "Solicitar proposta →".
- **Coluna direita — card "Como funciona":** `background: --tk-surface`, `border:1px solid --tk-border`, `border-radius: --tk-radius-card`, `box-shadow: --tk-shadow-card`, `padding: --tk-space-8`. Eyebrow "Como funciona" (`font-size: --tk-text-caption`, `font-weight:600`, `letter-spacing: --tk-tracking-eyebrow`, `text-transform:uppercase`, cor `--tk-ink-muted`, margin-bottom `20px`). 3 passos numerados separados por divisor `1px background: --tk-line`:
  1. Círculo 34×34px `background: --tk-accent-soft` `color: --tk-brand` num "1" — "Conversa de diagnóstico" / "Entendemos o seu cenário, as normas aplicáveis e as prioridades."
  2. Círculo mesmo estilo, num "2" — "Plano sob medida" / "Uma proposta com escopo, etapas e resultados esperados."
  3. Círculo **preenchido** `background: --tk-brand` `color:#fff` num "3" — "Execução acompanhada" / "Aplicamos junto com a sua equipe, ajustando ao longo do caminho." (último passo destacado com fundo sólido, diferente dos dois primeiros).
- **Componentes/padrões:** `Badge`, `FeatureListItem`, `Button`.

### 3. Estatísticas — "A RH Cursos em números"
- **Estrutura/grid:** section `padding:80px 0`; H2 centralizado `--tk-font-display` 700 `--tk-text-section` (2rem) `letter-spacing:-0.02em` cor `--tk-ink` `margin:0 0 44px`; grid `.rh-stats` = `repeat(auto-fit, minmax(200px,1fr))`, `gap:32px 24px`.
- **Componentes:** 4× `StatBlock` `align="center" accent="true"`, hint 200×130px:
  - `+15 anos` — "formando servidores e profissionais de organizações públicas e privadas"
  - `+320` — "turmas realizadas entre cursos abertos e programas in-company"
  - `96%` — "de recomendação média nas avaliações de turmas concluídas"
  - `+80` — "organizações atendidas em treinamento e consultoria"

### 4. Depoimento
- **Estrutura/grid:** section `padding:0 0 88px`; wrapper `max-width:840px`.
- **Componente:** `Testimonial` `featured="true"`, hint 100%×240px — quote: "A RH Cursos traduziu exigências legais complexas em processos que a nossa equipe realmente consegue executar no dia a dia." — nome "Mariana Alves", cargo "Coordenadora de Compras", empresa "Prefeitura Municipal".

### 5. CTA de fechamento
- **Estrutura/grid:** section `background: --tk-brand`, `padding:80px 0`; wrapper `text-align:center; max-width:760px`.
- **Tokens:** H2 `--tk-font-display` 700 `--tk-text-display-large` `letter-spacing:-0.02em` `line-height:1.12` cor `#fff` margin `0 0 16px` `text-wrap:balance` — "Pronto para capacitar a sua equipe?"; parágrafo `--tk-font-serif` 300 `--tk-text-subhead` `line-height:1.5` `color:rgba(255,255,255,0.86)` margin-bottom `32px` — "Converse com um especialista e monte a trilha certa — curso aberto, in-company ou consultoria."
- **CTA:** link estilizado como botão — `background:#fff`, `color: --tk-brand`, `font-family: --tk-font-body`, `font-weight:500`, `font-size: --tk-text-body`, `padding:1rem 1.6rem`, `border-radius: --tk-radius-button` (6px), sem `text-decoration` — "Fale com um especialista →". **Nota:** este CTA não usa `x-import Button` (é um `<a>` estilizado manualmente); ao implementar, mapear para `Button` variant que produza exatamente fundo branco / texto brand (pode exigir uma variante "invertida"/"on-brand" do componente Button, ou uso do variant secondary com override de cor).

### 6. Footer
- **Estrutura/grid:** `background: --tk-surface-2`, `border-top:1px solid --tk-border`, `padding:56px 0 40px`; grid `1.4fr 1fr 1fr 1fr`, `gap:40px`.
- **Coluna 1 — marca:** **diferente das demais páginas**: aqui é um wordmark customizado (`<span>` com quadrado `26×26px border-radius:30% background:--tk-brand color:#fff` + texto "RH" + texto "RH Cursos" em `--tk-font-display` 700 20px `letter-spacing:-0.02em`), **não** a imagem `logo-horizontal.png` usada no footer de Catálogo/Agenda/In-company/Quem Somos/Blog. Abaixo, parágrafo descritivo `--tk-text-body-sm` cor `--tk-ink-muted` `line-height:1.55` `max-width:34ch` — "Cursos, treinamento in-company e consultoria para organizações públicas e privadas."
- **Colunas 2–4:** eyebrows (`--tk-text-caption`, weight 600, `letter-spacing: --tk-tracking-eyebrow`, uppercase, cor `--tk-ink-muted`) + listas de links (`--tk-text-body-sm`, cor `--tk-ink`, sem sublinhado):
  - "Ofertas": Cursos abertos, Agenda, In-company, Consultoria
  - "Empresa": Sobre, Blog, Instrutores, Contato
  - "Acesso": Área do aluno, Área do instrutor, Entrar
- **Barra inferior:** `border-top:1px solid --tk-border`, `margin-top:40px`, `padding-top:24px`, `--tk-text-caption`, cor `--tk-ink-muted` — "© 2026 RH Cursos. Todos os direitos reservados."

## Contrato de dados

Nenhuma seção deste canvas usa `sc-for`/placeholders dinâmicos — todo o conteúdo é estático (copy institucional fixa). Não há contrato de dados Supabase para esta página; todos os textos, números de estatística e depoimento são hardcoded no canvas e devem ser tratados como conteúdo estático no código (ou, opcionalmente, movidos para CMS/config se o projeto adotar um mecanismo de conteúdo editável — decisão fora do escopo desta spec).

## Responsivo

- **Consultoria (`.rh-consult`):** breakpoint já definido no canvas — `@media(max-width:820px){ grid-template-columns:1fr; gap:36px }`. Usar este breakpoint como referência para tablet/mobile.
- **Journeys (`.rh-journeys`):** `repeat(auto-fit, minmax(272px,1fr))` já é responsivo por natureza (reflow automático 3→2→1 colunas conforme largura disponível); confirmar que em mobile (<768px) o card mínimo de 272px não estoura a viewport com o padding do container — se necessário, reduzir `minmax` para `240px` abaixo de 480px.
- **Stats (`.rh-stats`):** mesma lógica `auto-fit, minmax(200px,1fr)` — reflow automático 4→2→1.
- **Footer:** grid `1.4fr 1fr 1fr 1fr` → **≥1024:** como no canvas. **768–1023:** 2 colunas (marca ocupa linha própria ou junto de uma coluna de links). **<768:** 1 coluna, empilhado, marca no topo.
- **CTA de fechamento:** já centralizado e de largura controlada (`max-width:760px`); em mobile reduzir padding lateral do wrapper.

## Adaptações deliberadas

1. **Conteúdo estático:** todos os textos desta página (journeys, consultoria, estatísticas, depoimento, CTA, footer) são copy fixa do canvas — nenhuma integração com Supabase necessária, exceto se o produto decidir tornar números de estatística editáveis futuramente (fora de escopo).
2. **Marca no footer:** recomenda-se **padronizar** para a logo real (`logo-horizontal.png`), igual às demais páginas, em vez do wordmark customizado do canvas — inconsistência do canvas entre Home Sections e as demais páginas. Esta é uma adaptação recomendada, não uma fidelidade literal; se a decisão for manter o wordmark customizado, remover este item da lista de adaptações.
3. **CTA "Fale com um especialista →" da seção de fechamento:** não usa o componente `Button` no canvas (é um `<a>` customizado). Ao implementar, avaliar se cria uma variante "on-brand"/inversa do `Button` ou mantém como link estilizado equivalente — decisão de arquitetura, documentar no ADR 14.0.3 se aplicável.
4. **Container `.rh-wrap` (1120px vs 1100px):** unificar com o container padrão de 1100px usado nas demais páginas ao integrar na Home; a diferença de 20px do canvas é desprezível e não deve gerar dois containers distintos no código.
5. **Responsivo:** breakpoint de 820px para `.rh-consult` já vem do canvas; demais breakpoints (grids auto-fit, footer) são definição desta spec.
