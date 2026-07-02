# Spec de Fidelidade — In-company (`/in-company`)
**Canvas:** `public/RH Cursos In-company.dc.html` · **View atual:** `src/views/public/InCompany.tsx` · **Story de implementação:** 14.2.4

## Seções (na ordem do canvas)

### 1. Navegação (`.rh-nav`)
- Padrão idêntico às demais páginas internas. Item ativo: "In-company" (`data-cur="1"`).

### 2. Hero
- **Estrutura/grid:** `header` com `background: radial-gradient(circle at 50% -10%, #f7f9fc 30%, #ebf3ff 130%)`, `border-bottom:1px solid --tk-border`; `.rh-hero` = grid `1.05fr 0.95fr`, `gap:56px`, `align-items:center`, padding vertical `64px 0 60px` (herdado do wrapper).
- **Coluna esquerda:** `Badge` tone="accent" dot="true" — "Treinamento in-company · Para organizações"; H1 `--tk-font-display` 700 `--tk-text-display-hero` (3.75rem) `line-height:1.06` `letter-spacing:-0.02em` `margin:20px 0 18px` `text-wrap:balance` — "A capacitação vai até a *sua* equipe" ("sua" em itálico); parágrafo `--tk-font-serif` 300 `--tk-text-subhead-lg` (1.5rem) `line-height:1.45` cor `--tk-ink-muted` `max-width:48ch` margin-bottom `30px` — "Programas sob medida, no seu contexto operacional, com o seu calendário e os seus casos reais — do curso pontual à trilha de formação contínua para o time inteiro."; botões (`gap:12px`, margin-bottom `26px`): `Button` primary lg hint 220×52px "Solicitar proposta →" + `Button` secondary lg hint 190×52px "Baixar catálogo de temas"; chips (`gap:10px flex-wrap`): `.rh-chip` com ponto verde (`background: --tk-success`, 7×7px círculo) "Conteúdo aplicado à sua realidade"; `.rh-chip` "Presencial ou online ao vivo"; `.rh-chip` "Certificação para toda a turma".
- **Coluna direita — card "Por que in-company":** `background: --tk-surface`, `border:1px solid --tk-border`, `border-radius: --tk-radius-card`, `box-shadow: --tk-shadow-card`, `padding: --tk-space-8` (32px). Eyebrow "Por que in-company" (`--tk-text-caption`, weight 600, `letter-spacing: --tk-tracking-eyebrow`, uppercase, cor `--tk-ink-muted`, margin-bottom `20px`). 3 itens separados por divisor `1px background: --tk-line`, cada um com ícone `.rh-bicon` 40×40px `border-radius:10px` `background: --tk-accent-soft` `color: --tk-brand`:
  1. "Conteúdo com o seu caso" / "Exercícios e exemplos partem dos processos e normas da sua organização."
  2. "No seu calendário" / "Datas e formato definidos com você, sem parar a operação."
  3. "Time todo alinhado" / "Uma linguagem comum entre áreas, do gestor ao operacional."

### 3. Faixa de confiança / logos de clientes
- **Estrutura/grid:** `padding:36px 0`, `border-bottom:1px solid --tk-border`; wrapper flex `align-items:center gap:40px flex-wrap:wrap justify-content:space-between`.
- **Conteúdo:** label "Organizações que já treinaram com a RH Cursos" (`--tk-text-body-sm`, cor `--tk-ink-muted`) + 4 wordmarks `.rh-logo` (`--tk-font-display` 700 `19px` cor `--tk-ink-muted` `opacity:.6` `letter-spacing:-0.01em`): "Prefeitura Municipal", "Tribunal de Contas", "Secretaria de Saúde", "Grupo Andrade". **Nota:** são textos placeholder estilizados como wordmark, não logos de imagem reais — ver Adaptações.

### 4. Benefícios
- **Estrutura/grid:** `padding:80px 0 40px`; cabeçalho `max-width:620px margin-bottom:40px`; grid `.rh-benefits` = `repeat(3,1fr)`, `gap:22px`.
- **Cabeçalho:** `Badge` tone="accent" "Feito para a sua operação"; H2 `--tk-font-display` 700 `--tk-text-display-large` `letter-spacing:-0.02em` `line-height:1.1` `margin:18px 0 14px` — "Mais do que um curso — uma formação com contexto"; parágrafo `--tk-font-serif` 300 `--tk-text-subhead` `line-height:1.45` cor `--tk-ink-muted` `text-wrap:pretty` — "Desenhamos cada programa a partir das exigências legais que se aplicam ao seu órgão ou empresa e da forma como a sua equipe trabalha."
- **Cards (`.rh-bcard`):** `background: --tk-surface`, `border:1px solid --tk-border`, `border-radius: --tk-radius-card`, `box-shadow: --tk-shadow-card`, `padding: --tk-space-8`, `display:flex; flex-direction:column; gap:14px`. Ícone `.rh-bicon` 48×48px (default). 3 cards:
  1. "Diagnóstico prévio" / "Mapeamos o nível da equipe e os pontos críticos antes de montar o conteúdo."
  2. "Material personalizado" / "Apostilas, modelos e checklists prontos para usar na rotina depois do curso."
  3. "Certificação e relatório" / "Certificado para cada participante e um relatório de evolução para a gestão."

### 5. Como montamos o seu programa
- **Estrutura/grid:** `padding:56px 0 72px`; H2 `--tk-font-display` 700 `--tk-text-section` (2rem) `letter-spacing:-0.02em` `margin:0 0 44px` — "Como montamos o seu programa"; grid `.rh-steps` = `repeat(4,1fr)`, `gap:20px`.
- **Passos (`.rh-step`, `padding-top:14px`):** número `.rh-stepnum` (círculo 40×40px `background: --tk-brand` `color:#fff` `--tk-font-display` 700 `18px`, `margin-bottom:16px`) + H3 (`--tk-font-display` 700 `--tk-text-subhead` `letter-spacing:-0.01em` `margin:0 0 6px`) + parágrafo (`--tk-text-body-sm` `line-height:1.5` cor `--tk-ink-muted`):
  1. "Conversa inicial" / "Entendemos o objetivo, o perfil da equipe e as normas aplicáveis."
  2. "Proposta sob medida" / "Escopo, carga horária, formato e investimento em uma proposta clara."
  3. "Realização" / "Turma conduzida por especialista, presencial ou online ao vivo."
  4. "Acompanhamento" / "Relatório de resultados e suporte para aplicar o aprendizado."

### 6. Temas mais pedidos + depoimento
- **Estrutura/grid:** `background: --tk-cream`, `border-top/bottom:1px solid --tk-cream-dark`, `padding:76px 0`; grid `1.15fr 0.85fr`, `gap:56px`, `align-items:start`.
- **Coluna esquerda:** `Badge` tone="brand" "Temas mais pedidos"; H2 `--tk-font-display` 700 `--tk-text-display-large` `letter-spacing:-0.02em` `line-height:1.1` `margin:18px 0 22px` `text-wrap:balance` — "Qualquer tema, levado para dentro da sua organização"; grid `.rh-themes` = `repeat(2,1fr)`, `gap:12px` — `sc-for list="{{ themes }}"` (8 itens) → `.rh-theme` (`background: --tk-surface`, `border:1px solid --tk-border`, `border-radius: --tk-radius-glass` (16px), `padding:14px 18px`, `display:flex; gap:12px; align-items:center`, `--tk-text-body`, cor `--tk-ink`) com ponto 8×8px `background: --tk-brand`; abaixo, texto "Não encontrou o seu tema? " + link `.rh-jlink` "Fale com um especialista →".
- **Coluna direita:** `Testimonial` `featured="true"` hint 100%×260px — quote "Treinaram nossa equipe de compras no nosso próprio fluxo de licitação. Saímos com processos prontos, não só teoria.", nome "Ricardo Menezes", cargo "Diretor Administrativo", empresa "Secretaria de Saúde".

### 7. Estatísticas
- **Estrutura/grid:** `padding:72px 0`; grid `repeat(4,1fr)`, `gap:32px 24px`.
- **Componentes:** 4× `StatBlock` `align="center" accent="true"` hint 200×130px: `+80` — "organizações públicas e privadas capacitadas in-company"; `+320` — "turmas realizadas dentro das organizações"; `96%` — "de recomendação média das equipes formadas"; `15 dias` — "prazo médio para montar e iniciar um programa".

### 8. Formulário de captação de lead
- **Estrutura/grid:** `padding:0 0 88px`; card `background: --tk-surface`, `border:1px solid --tk-border`, `border-radius: --tk-radius-card`, `box-shadow: --tk-shadow-card`, `overflow:hidden`, `display:grid; grid-template-columns:0.9fr 1.1fr`.
- **Painel esquerdo (informativo):** `background: --tk-brand`, `padding: --tk-space-8`, `display:flex; flex-direction:column; justify-content:center; gap:20px`. H2 `--tk-font-display` 700 `--tk-text-section` `letter-spacing:-0.02em` `line-height:1.14` cor `#fff` `text-wrap:balance` — "Vamos montar o programa da sua equipe"; parágrafo `--tk-font-serif` 300 `--tk-text-subhead` `line-height:1.5` `color:rgba(255,255,255,0.86)` — "Conte um pouco sobre a sua organização. Um especialista retorna com uma proposta em até 2 dias úteis."; 3 itens de checklist (círculo 30×30px `background: rgba(255,255,255,0.16)` + ícone check branco + texto `#fff` `--tk-text-body-sm`): "Sem compromisso", "Proposta em até 2 dias úteis", "Atendimento por especialista".
- **Painel direito (formulário), `padding: --tk-space-8`:**
  - **Estado enviado (`sc-if value="{{ sent }}"`):** círculo verde 52×52px `background: --tk-success` com check branco; H3 `--tk-font-display` 700 `--tk-text-subhead-lg` — "Solicitação enviada!"; parágrafo `--tk-font-serif` 300 cor `--tk-ink-muted` — "Recebemos os seus dados. Um especialista da RH Cursos entrará em contato em breve."
  - **Estado formulário (`sc-if value="{{ notSent }}"`, padrão), `.rh-form` grid `1fr 1fr` gap `16px`:**
    - Campo "Nome" (`.rh-field`) — input texto, placeholder "Seu nome", `required`.
    - Campo "E-mail corporativo" — input email, placeholder "voce@organizacao.gov.br", `required`.
    - Campo "Organização" — input texto, placeholder "Nome da organização", `required`.
    - Campo "Telefone" — input tel, placeholder "(00) 00000-0000" (opcional).
    - Campo "Área de interesse" — select: "Licitações e contratos", "LGPD e privacidade", "Compliance e integridade", "Gestão pública", "Outro tema".
    - Campo "Tamanho da equipe" — select: "Até 15 pessoas", "16 a 40 pessoas", "41 a 100 pessoas", "Mais de 100 pessoas".
    - Campo "Mensagem" (`.rh-field.full`, ocupa as 2 colunas) — textarea, placeholder "Conte o objetivo do treinamento e o contexto da sua equipe", `min-height:96px`, `resize:vertical`.
    - Rodapé (`.rh-field.full`, `margin-top:4px`): `Button` variant="primary" size="lg" type="submit" hint 100%×52px "Solicitar proposta →" + texto de consentimento `--tk-text-caption` cor `--tk-ink-muted` — "Ao enviar, você concorda em ser contatado pela equipe da RH Cursos."
    - **Inputs/textarea (`.rh-input`/`.rh-textarea`):** `padding:12px 14px`, `border:1px solid --tk-border`, `border-radius: --tk-radius-button` (6px), foco `border-color: --tk-accent` + `box-shadow:0 0 0 3px var(--tk-accent-soft)`. **Nota:** markup customizado, não usa o componente `Input` do DS.
    - **Labels (`.rh-label`):** `--tk-text-body-sm` weight 600 cor `--tk-ink`.

### 9. Footer
- Padrão idêntico a `spec-catalogo.md` §5 (logo real).

## Contrato de dados

### `themes` (temas mais pedidos)
| Campo | Tipo | Origem | Regra | Fallback |
|---|---|---|---|---|
| lista de 8 strings | string | Estático (config de conteúdo institucional) ou tabela de "temas in-company" no Supabase se o produto quiser gerenciar dinamicamente | Exibir sempre 8 (ou os N mais relevantes) — grid 2 colunas comporta qualquer quantidade par | Se lista vazia, ocultar a grade e manter apenas o CTA "Fale com um especialista" |

### Formulário de lead
| Campo | Tipo | Destino sugerido | Validação |
|---|---|---|---|
| Nome | string | Tabela de leads in-company (Supabase) | obrigatório |
| E-mail corporativo | email | idem | obrigatório, formato e-mail |
| Organização | string | idem | obrigatório |
| Telefone | string | idem | opcional |
| Área de interesse | enum (5 opções) | idem | obrigatório (select sempre tem valor padrão) |
| Tamanho da equipe | enum (4 opções) | idem | obrigatório |
| Mensagem | text | idem | opcional |
| **Estado `sent`** | boolean | — | Controla troca entre formulário e mensagem de confirmação; no submit real, disparar envio (Supabase insert + notificação/e-mail) antes de setar `sent=true` |

## Responsivo

- **Hero (`.rh-hero`):** ≥1024: grid `1.05fr 0.95fr` como no canvas. 768–1023: colapsa para 1 coluna (texto acima, card "Por que in-company" abaixo), padding vertical reduzido. <768: 1 coluna, H1 reduz de `--tk-text-display-hero` para `--tk-text-display-large`, botões em largura total.
- **Faixa de confiança:** ≥1024 como no canvas (flex space-between). <1024: empilhar label acima dos wordmarks, ou permitir wrap (`flex-wrap` já presente).
- **Benefícios (`.rh-benefits`):** ≥1024: 3 colunas. 768–1023: 2 colunas (última linha com 1 item). <768: 1 coluna.
- **Como montamos (`.rh-steps`):** ≥1024: 4 colunas. 768–1023: 2 colunas (2×2). <768: 1 coluna.
- **Temas + depoimento:** ≥1024: grid `1.15fr 0.85fr`. <1024 (sem breakpoint explícito no canvas, mas consistente com `.rh-consult` em Home Sections): colapsar para 1 coluna, `.rh-themes` mantém `repeat(2,1fr)` até `<600px`, onde deve virar 1 coluna.
- **Estatísticas:** ≥1024: 4 colunas. 768–1023: 2 colunas. <768: 1 coluna ou 2 colunas compactas.
- **Formulário de lead (card grid `0.9fr 1.1fr`):** ≥1024 como no canvas. <1024: colapsar para 1 coluna (painel informativo acima, formulário abaixo). `.rh-form` grid `1fr 1fr` → 1 coluna em mobile (<768), campos `full` já ocupam ambas.
- **Footer:** mesmo padrão de `spec-home-sections.md`.

## Adaptações deliberadas

1. **Logos de clientes são texto estilizado, não imagens:** o canvas usa `.rh-logo` (wordmark tipográfico) para "Prefeitura Municipal", "Tribunal de Contas", etc. — são placeholders. Ao implementar com clientes reais, decidir se mantém o padrão tipográfico (fiel ao canvas) ou substitui por logos de imagem reais (desvio deliberado, sujeito a aprovação/autorização de uso de marca de cada cliente).
2. **Formulário com markup customizado (`.rh-input`/`.rh-textarea`):** mesma observação do Catálogo — avaliar padronização para o componente `Input`/`Textarea` do DS.
3. **Regra de validação e envio do formulário:** o canvas só define a UI dos 2 estados (formulário/confirmação); a lógica real de envio (Supabase insert, e-mail de notificação, rate limiting/anti-spam) é adaptação de implementação não coberta pelo canvas.
4. **Responsivo:** integralmente definido nesta spec.
5. **A11y:** garantir `label` associado a cada campo via `for`/`id` (o canvas usa `<label>` solto, sem `for`), mensagens de erro de validação visíveis e anunciadas, e foco no primeiro campo inválido no submit.
