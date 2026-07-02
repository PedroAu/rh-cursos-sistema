# Spec de Fidelidade — Quem Somos (`/sobre`)
**Canvas:** `public/RH Cursos Quem Somos.dc.html` · **View atual:** `src/views/public/About.tsx` · **Story de implementação:** 14.2.5

## Seções (na ordem do canvas)

### 1. Navegação (`.rh-nav`)
- Padrão idêntico às demais páginas internas, com um link a mais na lista (6 itens em vez de 5): "Cursos", "Agenda", "In-company", "Consultoria", **"Quem Somos"** (ativo, `data-cur="1"`), "Blog". **Nota:** este é o único canvas em que "Consultoria" e "Quem Somos" aparecem juntos como itens de nav distintos — confirmar com IA (arquitetura de informação) se "Consultoria" é de fato uma rota própria ou se é apenas âncora/seção dentro de outra página, já que não há canvas dedicado a "Consultoria" entre os 7 arquivos desta story.

### 2. Hero
- **Estrutura/grid:** `background: radial-gradient(circle at 50% -10%, #f7f9fc 30%, #ebf3ff 130%)`, `border-bottom:1px solid --tk-border`, `padding:64px 0 56px`; wrapper `.rh-wrap` (sem grid, conteúdo em coluna única, sem imagem lateral — diferente das outras heroes).
- **Conteúdo:** `Badge` tone="accent" dot="true" — "Documento institucional · Desde 2007"; H1 `--tk-font-display` 700 `--tk-text-display-large` (2.75rem) `line-height:1.08` `letter-spacing:-0.02em` `margin:18px 0 16px` `max-width:20ch` `text-wrap:balance` — "Transformando vidas por meio do *conhecimento*" ("conhecimento" em itálico); parágrafo `--tk-font-serif` 300 `--tk-text-subhead` `line-height:1.45` cor `--tk-ink-muted` `max-width:62ch` — "A RH Cursos & Soluções é uma empresa brasileira de educação corporativa, consultoria e treinamento empresarial, sediada em Brasília – DF, especializada na capacitação de servidores públicos e profissionais do setor privado."

### 3. Barra de estatísticas institucionais
- **Estrutura/grid:** `background: --tk-surface`, grid `repeat(4,1fr)`, `gap:0`, `border-bottom:1px solid --tk-border`. Cada célula: `padding:36px 0` (primeira) ou `padding:36px 0 36px 28px` (demais), `border-right:1px solid --tk-line` (exceto última).
- **Conteúdo (4 células, markup direto — NÃO usa o componente `StatBlock`):** valor `--tk-font-display` 700 `font-size: var(--tk-text-display)` cor `--tk-brand` `letter-spacing:-0.02em` + label `--tk-text-body-sm` cor `--tk-ink-muted` `margin-top:4px`:
  1. "2007" / "Ano de fundação"
  2. "~80" / "Cursos no portfólio"
  3. "6" / "Trilhas de conhecimento"
  4. "Nacional" / "Alcance de atuação"
- **Gap de token:** `var(--tk-text-display)` é usado no canvas mas **não está listado explicitamente** no mapa de tipografia do INVENTORY §2.2 (que lista `display-hero`/`display-large`/`section` etc., sem uma variante solta "display"). Tratar como pendência a confirmar em `ds-package/tokens/typography.css` na story 14.0.3/14.0.4 — valor provável entre `--tk-text-section` (2rem) e `--tk-text-display-large` (2.75rem).

### 4. Nossa história
- **Estrutura/grid:** `padding:64px 0`; grid `0.85fr 1.15fr`, `gap:52px`, `align-items:start`.
- **Coluna esquerda:** eyebrow `.rh-eyebrow` ("Nossa história" — `--tk-text-caption`, weight 600, `letter-spacing: --tk-tracking-eyebrow`, uppercase, cor `--tk-accent`); H2 `.rh-h2` (`--tk-font-display` 700 `--tk-text-section` `letter-spacing:-0.02em` cor `--tk-ink` `margin:8px 0 0` `text-wrap:balance`, aqui com `max-width:14ch`) — "Nascida do sonho de compartilhar conhecimento".
- **Coluna direita — 3 parágrafos (`.rh-body`, `--tk-font-body`, `--tk-text-body`, `line-height:1.65`, cor `--tk-ink-muted`, `text-wrap:pretty`):**
  1. "Fundada em 2007, a RH Cursos & Soluções nasceu da união do casal **Ester e Nilson**, que combinaram suas experiências em advocacia, consultoria e ensino para construir uma instituição voltada a transformar vidas por meio do conhecimento." (nomes em `<strong>` cor `--tk-ink` weight 600)
  2. "Originalmente constituída no Distrito Federal e sediada em Taguatinga, a empresa estruturou-se para oferecer cursos abertos e treinamentos in company em todo o território nacional — consolidando um histórico robusto em temas técnicos de alta relevância para o setor público, como GFIP/SEFIP, SIAFI/CPR, escrituração fiscal digital, cálculos trabalhistas, fiscalização de contratos e legislação previdenciária."
  3. "Hoje, a empresa organiza seu portfólio em trilhas de conhecimento, com progressão lógica do nível básico ao avançado dentro de cada área de especialização."

### 5. Missão, visão e filosofia
- **Estrutura/grid:** `background: --tk-cream`, `border-top/bottom:1px solid --tk-cream-dark`, `padding:64px 0`.
- **Cabeçalho:** eyebrow "Propósito" (cor `--tk-brand`); H2 "Missão, visão e filosofia" (`margin-bottom:32px`).
- **3 cards (`.rh-card`):** `background: --tk-surface`, `border:1px solid --tk-border`, `border-radius: --tk-radius-card`, `box-shadow: --tk-shadow-card`, `padding:28px 30px`. Título do card `--tk-font-display` 700 `--tk-text-subhead-lg` cor `--tk-brand` `margin-bottom:10px`; corpo `.rh-body` `--tk-text-body-sm`:
  1. "Missão" — "Subsidiar, por meio do conhecimento, a formação do indivíduo para desempenhar suas funções no mercado de trabalho, de forma que as instituições potencializem seus negócios e maximizem seus resultados."
  2. "Visão" — "Buscar a excelência para ser a melhor empresa de cursos e treinamentos no circuito nacional."
  3. "Filosofia" — "Ética, transparência e metodologias participativas — aulas expositivas, dinâmicas de grupo e trabalho em equipe, com aplicação de conhecimento técnico-científico."
- **Valores (abaixo dos cards, `margin-top:36px`):** eyebrow "Valores que nos orientam" (cor `--tk-brand`, `margin-bottom:16px`); lista `.rh-vlist` em grid `1fr 1fr` `gap:14px 40px` (4 itens `.rh-vitem`, cada um com check `.rh-check` — círculo 22×22px `background: --tk-accent-soft` `color: --tk-accent-strong` `font-size:12px` weight 700 — símbolo "✓"):
  1. "Ética e transparência em todas as relações."
  2. "Responsabilidade, comprometimento e honestidade em cada treinamento."
  3. "Busca constante por resultados, multiplicação da tecnologia e expansão do conhecimento."
  4. "Estímulo à iniciativa, motivação, criatividade e comunicação."

### 6. O que fazemos
- **Estrutura/grid:** `padding:64px 0`; eyebrow "O que fazemos"; H2 "Soluções educacionais integradas" (`margin-bottom:8px`); parágrafo `max-width:60ch margin-bottom:32px` — "Um conjunto de soluções educacionais e de consultoria adaptadas à realidade de cada cliente."; grid `repeat(3,1fr)` `gap:22px`.
- **3 cards (`.rh-card`):** ícone-glifo 44×44px `border-radius:12px` fundo gradiente (distinto por card), `color:#fff`, `--tk-font-display` 700 `20px`, `margin-bottom:16px`; H3 `--tk-font-display` 700 `--tk-text-subhead-lg` `letter-spacing:-0.01em` `margin:0 0 8px`; corpo `.rh-body` `--tk-text-body-sm`:
  1. glifo "§", gradiente `linear-gradient(135deg,#235875,#2f7599)` — "Cursos abertos" / "Presenciais e online, com temas atualizados para as áreas pública e privada, focados em qualificação técnica e atualização profissional."
  2. glifo "◆", gradiente `linear-gradient(135deg,#4285f4,#6aa2ff)` — "Treinamentos in company" / "Programas personalizados conforme as necessidades de cada instituição, com adequação de horário, agenda e conteúdo — e redução de custos para o cliente."
  3. glifo "◈", gradiente `linear-gradient(135deg,#7a4fd6,#9a74e6)` — "Consultoria empresarial" / "Apoio especializado a órgãos públicos e empresas na estruturação de processos, conformidade legal e desenvolvimento de pessoas."
- **Nota de cor:** os gradientes `#235875` (azul-navy base) e `#4285f4`/`#7a4fd6` (azuis/roxo do DS base) aparecem aqui **sem remap `.rh2`** — são cores decorativas fixas nos glifos, não tokens de marca/CTA. Conforme regra crítica do INVENTORY (§1), isso é aceitável pois não são usados como cor de marca/CTA; manter literal.

### 7. Trilhas de conhecimento
- **Estrutura/grid:** `background: --tk-surface-2`, `border-top:1px solid --tk-border`, `padding:64px 0`. Cabeçalho flex `align-items:flex-end justify-content:space-between gap:24px flex-wrap:wrap margin-bottom:32px`: eyebrow "Áreas de conhecimento" + H2 "6 trilhas, aproximadamente 80 cursos" à esquerda; parágrafo `max-width:38ch` à direita — "Cada trilha oferece progressão lógica do básico ao avançado, agrupando cursos correlacionados por especialização."
- **Grade:** `display:grid; grid-template-columns:1fr 1fr; gap:18px`. `sc-for list="{{ trilhas }}"` (placeholder 6) → `.rh-card` (`display:flex; gap:18px; align-items:flex-start; padding:24px 26px`):
  - Ícone-glifo 52×52px `border-radius:14px` `background: {{ t.tint }}` `color:#fff` `--tk-font-display` 700 `22px`.
  - Conteúdo: linha de título (`display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin-bottom:6px`) — H3 `--tk-font-display` 700 `--tk-text-body` (1rem) cor `--tk-ink` `letter-spacing:-0.01em` `line-height:1.25` + "{{ t.count }} cursos" (`11px` weight 600 cor `--tk-accent`); descrição `.rh-body` `--tk-text-body-sm` `margin-bottom:8px`; linha "**Público:** {{ t.audience }}" (`--tk-text-caption`, cor `--tk-ink-muted`, "Público:" em `<strong>` cor `--tk-ink`).
- **6 trilhas (dados do mock, prováveis categorias reais do catálogo):**
  1. "§" `linear-gradient(135deg,#235875,#2f7599)` · 14 cursos · "Departamento Pessoal, Folha & eSocial" · "Da legislação trabalhista à conformidade digital com eSocial, FGTS Digital e LGPD." · Público: "Servidores do DP, RH, gestores de contratos e contadores da Administração Pública."
  2. "⚖" `linear-gradient(135deg,#2f7599,#068466)` · 12 cursos · "Licitações, Compras & Contratos" · "Da legislação básica à fiscalização avançada, com cobertura completa da Lei nº 14.133/2021." · Público: "Pregoeiros, gestores e fiscais de contratos, equipes de licitação e procurement público."
  3. "◈" `linear-gradient(135deg,#235875,#3a7d5f)` · 14 cursos · "Gestão de Pessoas & Liderança" · "Formação humanizada para líderes e equipes: inteligência emocional, cultura e gestão por resultados." · Público: "Gestores, líderes de equipe, servidores e profissionais de RH dos setores público e privado."
  4. "✎" `linear-gradient(135deg,#c98a3a,#e0a94f)` · 10 cursos · "Comunicação, Redação & Atendimento" · "Do atendimento ao cidadão à redação oficial, oratória, mídias digitais e conformidade com LAI/LGPD." · Público: "Servidores, ouvidores, assessores de comunicação, profissionais jurídicos e atendentes."
  5. "◆" `linear-gradient(135deg,#4285f4,#235875)` · 19 cursos · "Auditoria, Contabilidade & Tributos" · "Domínio técnico em contabilidade pública, obrigações acessórias, Tesouro Gerencial, SIAFI e auditoria." · Público: "Contadores, auditores, controllers, analistas financeiros e servidores das áreas de controle."
  6. "◇" `linear-gradient(135deg,#7a4fd6,#9a74e6)` · 11 cursos · "Tecnologia, Dados & Inovação" · "Ferramentas digitais, análise de dados, modelagem de processos, IA e governança." · Público: "Servidores, analistas de TI, gestores de processos e inovação, e todos que usam tecnologia no trabalho."

### 8. Metodologia
- **Estrutura/grid:** `padding:64px 0`; grid `0.85fr 1.15fr` `gap:52px` `align-items:start` (mesmo padrão de §4).
- **Coluna esquerda:** eyebrow "Metodologia"; H2 `max-width:14ch` — "Aprender fazendo, aplicar no mesmo dia".
- **Coluna direita — 2 parágrafos:**
  1. "Adotamos uma abordagem participativa e prática, valorizando a aplicação imediata do conhecimento. As capacitações combinam aulas expositivas, dinâmicas de grupo, trabalho em equipe e exercícios práticos — muitas vezes com uso de computador para temas que envolvem sistemas e ferramentas digitais como SIAFI, Tesouro Gerencial, eSocial, Excel e Power BI."
  2. "Os cursos são oferecidos nas modalidades presencial e online, com turmas em diferentes horários. Cada curso é estruturado por nível — básico, intermediário ou avançado — para que o participante avance de forma consistente dentro de sua trilha de interesse."

### 9. Faixa de CTA
- **Estrutura/grid:** `background: --tk-brand`, `padding:64px 0`; wrapper `text-align:center`.
- **Conteúdo:** H2 `--tk-font-display` 700 `font-size: var(--tk-text-display)` `letter-spacing:-0.02em` cor `#fff` `margin:0 0 12px` `text-wrap:balance` — "Pronto para capacitar sua equipe?" (mesmo gap de token `--tk-text-display` da seção 3); parágrafo `--tk-font-serif` 300 `--tk-text-subhead` `color:rgba(255,255,255,0.82)` `max-width:52ch` `margin:0 auto 28px` `text-wrap:pretty` — "Fale com um especialista sobre cursos abertos, treinamentos in company e consultoria para o setor público e privado."; `Button` variant="secondary" size="lg" hint 200×52px "Fale com um especialista →" — **nota:** variant `secondary` usado sobre fundo `--tk-brand` (contraste precisa ser verificado; nas demais páginas o CTA sobre fundo brand costuma usar um botão branco customizado — ver `spec-home-sections.md` §5 — este canvas usa literalmente `variant="secondary"` do componente, que pode não ter contraste adequado sobre fundo escuro sem ajuste. Marcar para verificação visual na implementação).

### 10. Footer
- Estrutura igual ao padrão (logo real, colunas Ofertas/Empresa/Acesso, copyright), com duas diferenças pontuais deste canvas:
  - Parágrafo descritivo da coluna 1 é mais longo/específico: "Transformando vidas por meio do conhecimento desde 2007. Brasília – Distrito Federal · www.rhcursos.com.br" (diferente do texto genérico "Cursos, treinamento in-company e consultoria..." usado nas demais páginas).
  - Coluna "Empresa": link "Quem Somos" em destaque (cor `--tk-brand`, weight 600) indicando página atual — mesmo padrão de destaque de página ativa deve ser replicado nas demais páginas quando aplicável (mas cada canvas só destaca o próprio link, ex. Blog destaca "Blog").
  - Copyright: "© 2026 RH Cursos & Soluções. Todos os direitos reservados." (nome completo da empresa, diferente do "© 2026 RH Cursos." das demais páginas).

## Contrato de dados

### `trilhas` (trilhas de conhecimento)
| Campo | Tipo | Origem sugerida | Regra | Fallback |
|---|---|---|---|---|
| `glyph` | string (1 caractere) | Config estática por trilha (mapeamento fixo trilha→glifo) | — | glifo genérico se trilha sem mapeamento |
| `tint` | string (gradiente CSS) | Config estática por trilha | — | gradiente neutro padrão |
| `count` | number | Contagem real de cursos publicados na categoria/trilha (Supabase, `COUNT` agregado) | Atualizar dinamicamente conforme catálogo cresce, **não hardcode** como no mock | — |
| `title` | string | Nome da trilha (categoria de topo no catálogo) | — | — |
| `desc` | string | Config estática (texto institucional por trilha) | — | — |
| `audience` | string | Config estática | — | — |
| **Lista vazia** | — | — | — | Cenário improvável (institucional); se ocorrer, ocultar a seção inteira |

Demais seções (hero, stats institucionais, história, missão/visão/filosofia, o que fazemos, metodologia, CTA) são **100% estáticas** — conteúdo institucional fixo, sem `sc-for`/placeholders dinâmicos no canvas.

## Responsivo

- **Barra de estatísticas (§3):** ≥1024: 4 colunas com divisores verticais. 768–1023: 2×2, remover `border-right` das colunas que passam a ficar na borda direita do grid (2ª e 4ª), manter `border-bottom` entre linhas. <768: 1 coluna, sem divisores verticais, `border-bottom` entre cada.
- **Nossa história / Metodologia (grid `0.85fr 1.15fr`):** ≥1024 como no canvas. <1024: colapsar para 1 coluna (eyebrow+título acima, texto abaixo).
- **Missão/Visão/Filosofia (`repeat(3,1fr)`):** ≥1024: 3 colunas. 768–1023: coluna única ou 2+1. <768: 1 coluna. Valores (`grid 1fr 1fr`): <768 vira 1 coluna.
- **O que fazemos (`repeat(3,1fr)`):** mesmo padrão de reflow 3→2→1.
- **Trilhas (`grid 1fr 1fr`):** ≥1024: 2 colunas. <768: 1 coluna.
- **CTA e footer:** mesmo padrão das demais páginas.

## Adaptações deliberadas

1. **Contagem de cursos por trilha (`count`) deve ser dinâmica**, não hardcoded como no mock — calcular via query real ao catálogo.
2. **Token `--tk-text-display`** usado 2× no canvas (stats institucionais §3, H2 do CTA §9) não está documentado explicitamente no INVENTORY — confirmar valor exato junto ao @architect/@dev na story 14.0.3/14.0.4 antes de codificar.
3. **Botão CTA final (`variant="secondary"` sobre fundo `--tk-brand`):** verificar contraste/legibilidade na implementação; se insuficiente, considerar o mesmo padrão de "botão branco customizado" usado em `spec-home-sections.md` §5 — desvio a validar visualmente, não uma certeza de fidelidade.
4. **Item "Consultoria" na nav** sem canvas próprio entre os 7 arquivos — mapear a rota real (pode ser seção in-page ou rota futura) junto ao IA do projeto.
5. **Copy de footer distinta desta página** (parágrafo institucional mais longo, copyright com razão social completa "RH Cursos & Soluções") — manter como está, específica desta página, e não sincronizar com o texto genérico das demais.
6. **Responsivo:** integralmente definido nesta spec.
