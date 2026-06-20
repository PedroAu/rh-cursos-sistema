# Design System — Escala Oficial (Proposta Fase 2)

> **Status:** PROPOSTA para aprovação humana. Nenhum `.tsx`, `globals.css` ou config foi alterado.
> **Base:** `docs/design-system-audit.md` (Fase 1). Toda decisão abaixo referencia um achado específico do relatório.
> **Projeto:** rh-cursos — Next.js + Tailwind v4 (`@theme` em CSS, sem `tailwind.config.js`) + shadcn/ui "new-york".
> **Responsivo alvo de validação:** 375 / 768 / 1440 px.
> **Próximo passo após aprovação:** Fase 3 — aplicação mecânica-mas-cuidadosa, com `@qa` usando a tabela-resumo (seção 9) como régua.

---

## 1. Princípios

1. **Base 4px.** `--spacing: 0.25rem` já é a fonte do projeto (`globals.css:14`). Toda nova decisão de espaçamento é múltiplo de 4px — sem exceção, sem "quase 4px".
2. **Fonte única de verdade.** Todo valor repetido ≥2× e todo eixo de design (espaçamento, tipografia, container, ícone, altura de card) vira token em `@theme`. Se não está no `@theme`, não deveria estar em classe arbitrária — deveria estar em PR de proposta de novo token.
3. **Ancorar nos componentes shadcn existentes.** `button.tsx`, `input.tsx`, `badge.tsx`, `card.tsx` já formam uma escala consistente (`h-10/9/11`, `px-4/3/6`, `text-sm`, `gap-2`, `rounded-sm/md`). A escala oficial **deriva** dessa base, não a substitui. Onde a auditoria achou divergência, a regra é "shadcn ganha".
4. **Zero arbitrários fora da escala.** `max-w-[..px]`, `size-[..px]`, `py-[..px]`, `text-[..px]`, `min-h-[..px]` deixam de ser aceitáveis como prática corrente. Exceções legítimas (display fluido com `clamp()`, `style={{}}` dinâmico) ficam documentadas e isoladas — não viram precedente.
5. **Semântica antes de número.** Componentes consomem `<Section size="lg">`, `<Container variant="page">`, `<CardTitle>` — não `py-[88px]` ou `max-w-[1320px]` espalhados. O número mora em um único lugar (`@theme`); o resto do código fala a língua do design, não de pixels.
6. **Progressão prevista, não "no olho".** Qualquer escala (espaçamento, tipografia, ícone) cresce em razão previsível entre passos — evita o efeito "pulou peso/tamanho sem nível intermediário" relatado na auditoria (peso tipográfico, ícones ímpares).

---

## 2. Espaçamento

### 2.1 Escala permitida (steps Tailwind, base 4px)

Conjunto oficial — os 9 steps já saudáveis (alta frequência, auditoria §2) **mais** os steps estruturais que faltam para cobrir os outliers, sem inflar a escala:

```
0  1  2  3  4  6  8  12  16  24  32
```

(`1`=4px `2`=8px `3`=12px `4`=16px `6`=24px `8`=32px `12`=48px `16`=64px `24`=96px `32`=128px — todos steps nativos do Tailwind, nenhum custom novo necessário para este eixo).

Fracionários `0.5` e `1.5` (micro-spacing de ícone/badge, auditoria §2: 16× e 10× respectivamente) **permanecem permitidos** como exceção documentada — uso legítimo e já consistente, não tokenizar como algo "oficial" separado.

### 2.2 Outliers → step oficial

| Valor atual fora da escala | Ocorrências | Step oficial | Justificativa |
|---|---|---|---|
| `9` (36px) | 3 | `8` (32px) | Não há razão de negócio para 36px; mais próximo de `8`, reforça ritmo de seção em múltiplos de 32. |
| `28` (112px) | 1 | `24` (96px) ou `32` (128px) — avaliar caso a caso na Fase 3 | Outlier isolado (1×); decidir pelo contexto visual real, mas nunca manter `28` solto. |
| `36` (144px) | 1 | `32` (128px) | Mesmo raciocínio — `36` não é step nativo do Tailwind (era resultado de `xl:py-36`, que **é** nativo na verdade — ver nota abaixo). |
| `2.5` (10px) | 2 | `2` (8px) ou `3` (12px) por contexto | `2.5` não está na escala oficial; avaliar se é padding de badge (→ manter `0.5`/`px-2.5`, ver nota) ou espaçamento estrutural (→ arredondar). |
| `32` (128px) | 2 | `32` — **já oficial** | Mantém-se; é o teto da escala de espaçamento estrutural. |

> **Nota sobre `py-2.5` e `px-2.5`:** o componente `badge.tsx` usa `px-2.5 py-0.5` como padding interno fixo de um componente shadcn — isso é escala de **componente**, não de **layout/seção**, e fica fora do escopo de "outlier a corrigir". A tabela acima trata apenas usos de `2.5` em contexto de layout de página, se houver.
>
> **Nota sobre `py-36`:** `36` (144px) **é** step nativo do Tailwind (`9rem`). O outlier real reportado pela auditoria é o padrão `md:py-[120px] → xl:py-36` — o problema não é o step `36`, é o `[120px]` arbitrário que o antecede na progressão. Resolvido pelo token de ritmo de seção (§2.3), não por substituição 1:1.

### 2.3 Ritmo vertical de seção — `section-y` (resolve o caos `py-[72/88/120px]`)

**Causa raiz (auditoria §2):** 4 famílias de padding de seção coexistindo em `(marketing)/page.tsx` sem progressão coerente entre breakpoints, mais `py-18`/`py-22` fora de steps nativos.

**Proposta: 3 tokens de ritmo vertical, cada um com 3 valores (mobile/tablet/desktop)**, ancorados na escala oficial (§2.1):

| Token | Mobile (375) | Tablet (768) | Desktop (1440) | Uso |
|---|---|---|---|---|
| `section-y-sm` | `py-8` (32px) | `py-12` (48px) | `py-16` (64px) | Seções compactas, blocos secundários, CTAs curtos |
| `section-y-md` | `py-12` (48px) | `py-16` (64px) | `py-24` (96px) | Seção padrão de página (default) |
| `section-y-lg` | `py-16` (64px) | `py-24` (96px) | `py-32` (128px) | Hero, seções de abertura, blocos de alto impacto |

**Mapeamento dos valores atuais para os tokens novos:**

| Valor atual | Ocorrências/evidência | Token oficial |
|---|---|---|
| `py-12 → xl:py-[72px]` | `page.tsx:140` | `section-y-sm` (72px arredonda para 64px desktop — diff visual mínimo, validar na Fase 3) |
| `py-16 → xl:py-[88px]` | `page.tsx:198,253` (4×) | `section-y-md` (88px → 96px desktop) |
| `md:py-[120px] → xl:py-36` | `page.tsx:220` | `section-y-lg` (120px/144px → 96/128px — maior ajuste, revisar visualmente) |
| `py-16 → xl:py-24` | `page.tsx:290,318,332,340` | `section-y-md` (já bate exatamente — zero diff) |
| `py-22` (auth/hero) | `page-hero.tsx:47` | `section-y-lg` no mobile-first (88px ≈ entre sm/md — usar `section-y-md` mobile + `section-y-lg` desktop conforme contexto) |
| `py-18` | `(auth)/login/page.tsx:72` | `section-y-sm` (72px → 64px, diff de 8px aceitável) |
| `cursos/[slug]/page.tsx:122,208,428` | `py-[88/72px]` | `section-y-md` / `section-y-sm` conforme peso visual da seção |

**Como expressar:**

1. **Tokens `@theme`** — não dá para tokenizar "padding responsivo" diretamente em uma única custom property (CSS var não muda por media query sem container queries ou `clamp`). Duas opções, recomendação abaixo:
   - **(A) Recomendado:** tokens fixos por breakpoint, expressos como *utilitário composto* via componente `<Section>` (ver §8) que aplica as 3 classes Tailwind (`py-X md:py-Y xl:py-Z`) internamente. O `@theme` não guarda o "ritmo" — guarda só os números de espaçamento que já existem nativamente (`12/16/24/32` etc.), e o componente é a fonte da combinação.
   - **(B) Alternativa:** usar `clamp()` via `@theme` (`--section-y-md: clamp(3rem, 2rem + 4vw, 6rem)`) para ritmo fluido sem steps fixos por breakpoint. Mais elegante matematicamente, mas diverge do padrão mobile-first em steps discretos já usado no resto do projeto (tipografia também usa breakpoint discreto, não fluido, exceto o display). **Não recomendado** por inconsistência de padrão dentro do mesmo design system.
2. **Decisão:** opção (A) — componente `Section` com prop `size: "sm" | "md" | "lg"` que mapeia para as classes Tailwind fixas da tabela acima.

---

## 3. Tipografia

### 3.1 Escala semântica h1–h6 + body + utilitários

Estratégia confirmada pela auditoria: **adotar `CardTitle` como referência de proporção** (`font-heading text-2xl font-bold leading-tight`, `card.tsx:14`) e estender o mesmo raciocínio (família heading, peso único por nível, leading consistente) para toda a hierarquia.

| Nível | Tamanho responsivo (mobile→desktop) | Line-height | Peso | Família | Tracking |
|---|---|---|---|---|---|
| `display` | `clamp(3.5rem, 7vw, 5.5rem)` (mantém token fluido já existente, `in-company/page.tsx:157`) | `leading-[0.82]` | `font-black` | `font-heading` | `normal` (tracking apertado já correto p/ display) |
| `h1` | `text-4xl md:text-5xl xl:text-6xl` | `leading-tight` | `font-extrabold` | `font-heading` | `normal` |
| `h2` | `text-3xl md:text-4xl` | `leading-tight` | `font-bold` | `font-heading` | `normal` |
| `h3` | `text-2xl` | `leading-tight` | `font-bold` | `font-heading` | `normal` |
| `h4` | `text-xl` | `leading-snug` | `font-semibold` | `font-heading` | `normal` |
| `h5` | `text-lg` | `leading-snug` | `font-semibold` | `font-sans` | `normal` |
| `h6` / `eyebrow` | `text-sm` | `leading-none` | `font-bold` | `font-sans` | `tracking-[0.08em] uppercase` |
| `body` | `text-base` | `leading-7` | `font-normal` | `font-sans` | `normal` |
| `body-sm` | `text-sm` | `leading-7` | `font-normal` | `font-sans` | `normal` |
| `small` | `text-xs` | `leading-5` | `font-medium` | `font-sans` | `normal` |

**Decisões de consolidação:**

- **H1:** dois padrões divergentes (`text-4xl md:text-5xl xl:text-6xl` vs `text-4xl md:text-6xl` pulando `5xl`) → oficial é o **primeiro**, com progressão completa pelos 3 breakpoints (`page.tsx:145` deve ganhar o `xl:text-5xl` intermediário... na verdade o oficial mantém `5xl` no meio para não pular nível). `page-hero.tsx:66` já está correto — é a referência.
- **H2:** 4 tamanhos/3 pesos → oficial **`text-3xl md:text-4xl font-bold`**. Os usos identificados como "H2 que na verdade é título de card" (`page.tsx:210,267,272` em `black`, `page.tsx:184,240,306` em `extrabold`) devem ser reclassificados: se é título de Card → usar `CardTitle`/token `h3`, não `h2`. Isso resolve a "hierarquia semântica incorreta" apontada na causa raiz (auditoria §3).
- **H3:** `text-xl` (`course-article-card.tsx:102`) vs `text-2xl` (`cursos/page.tsx:189`) → oficial **`text-2xl font-bold`** (bate exatamente com `CardTitle` já existente). `course-article-card.tsx` deve subir para `text-2xl` ou, melhor, consumir `<CardTitle>` diretamente.
- **`section-heading.tsx`** (componente atual que gera H2 com 4 variações de largura/tamanho) deve internamente fixar-se no token `h2` oficial, eliminando a variação por "humor do dev".

### 3.2 Pesos permitidos

Problema identificado: `bold/extrabold/black/semibold/medium` sem `normal`, pulando hierarquia. **Conjunto oficial fechado:**

```
font-normal   → body, small, texto corrido
font-medium   → small/legendas com leve destaque
font-semibold → h4/h5, labels de UI, botões (já usado em button.tsx)
font-bold     → h2/h3, eyebrow, badge (já usado em card.tsx/badge.tsx)
font-extrabold→ h1 apenas
font-black    → display apenas (display fluido em in-company)
```

Regra de aplicação: **um peso por nível semântico, sempre o mesmo**. `extrabold`/`black` deixam de ser escolha estética livre em H2 — ficam reservados para h1/display. Isso resolve a "pulo bold→extrabold→black sem normal/medium" reportado na auditoria (§3), preenchendo os vazios (`normal`/`medium`) com uso real (body/small) em vez de deixá-los noms apenas teóricos.

### 3.3 Tracking — consolidação

Dominante `tracking-[0.08em]` (17×, eyebrows uppercase) vira o **único token de tracking expandido** do projeto: `tracking-[0.08em]` (mapeado para classe Tailwind nativa `tracking-widest`, que no Tailwind v4 default é `0.1em` — **não é exatamente igual**, então a recomendação é manter `[0.08em]` como exceção arbitrária documentada *única* permitida, em vez de forçar para `tracking-widest` e mudar o visual em 17 lugares).

Os 4 residuais (`[0.04em]`, `[0.12em]`, `[0.06em]`, `[0.05em]`, 1× cada) → todos migram para `[0.08em]` ou `tracking-normal` (default, sem tracking) dependendo do contexto — nenhum tem massa de uso suficiente para justificar token próprio.

### 3.4 Tamanhos arbitrários residuais

`text-[10px]`/`text-[9px]` (badges de contador, `agenda-browser.tsx:306,240`, `admin-agenda-calendar.tsx:124`) → não cabem na escala semântica h1-h6/body (são micro-UI, não conteúdo). Proposta: token `text-2xs` via `@theme` (`--text-2xs: 0.625rem` = 10px), cobrindo os 3 usos com um único valor — elimina o `9px` (arredonda para 10px, diferença de 1px imperceptível em contador numérico).

### 3.5 Mapeamento "uso atual → token semântico"

| Uso atual (exemplo) | Token oficial |
|---|---|
| `text-4xl md:text-6xl` (H1, pula 5xl) — `page.tsx:145` | `h1` (`text-4xl md:text-5xl xl:text-6xl`) |
| `text-4xl md:text-5xl xl:text-6xl` — `page-hero.tsx:66` | `h1` (já correto, referência) |
| `text-base font-bold` (H2 atípico) — `section-heading.tsx:37` | `h2` se for título de seção real; `eyebrow` se for rótulo curto |
| `text-2xl font-black` / `font-extrabold` (H2 "card") — `page.tsx:184,210,240,267,272,306` | `h3` (reclassificar como título de card, não de seção) + `CardTitle` |
| `text-3xl xl:text-4xl` (H2 correto) | `h2` (já bate, manter) |
| `text-xl font-bold` (H3) — `course-article-card.tsx:102` | `h3` (subir para `text-2xl` ou consumir `CardTitle`) |
| `text-2xl font-bold` (H3) — `cursos/page.tsx:189` | `h3` (já correto, referência) |
| `text-[10px]`/`text-[9px]` (contadores) | `text-2xs` (novo token, §3.4) |
| `text-[clamp(3.5rem,7vw,5.5rem)]` + `leading-[0.82]` — `in-company/page.tsx:157` | `display` (token isolado, mantém-se como está — já é o padrão correto) |

---

## 4. Grid / Container

### 4.1 Tokens de container

| Token | Valor | Substitui | Ocorrências |
|---|---|---|---|
| `--container-page` | `1320px` | `max-w-[1320px]` | 25× |
| `--container-admin` | `1200px` | `max-w-[1200px]` | 13× |
| `--container-content-lg` | `840px` | `840/820px` | 4× |
| `--container-content` | `760px` | `760/780px` | 12× |
| `--container-content-sm` | `680px` | `680/660/620px` | 5× |

### 4.2 Mapeamento das 18 larguras px → token

| Largura atual (px) | Ocorrências | Token oficial |
|---|---|---|
| `1320` | 25 | `container-page` |
| `1200` | 13 | `container-admin` |
| `920` | 1 | `container-content-lg` (arredondar p/ 840, diff -80px) ou manter como exceção pontual se visual quebrar |
| `900` | 1 | `container-content-lg` (840) |
| `860` | 1 | `container-content-lg` (840) |
| `840` | 2 | `container-content-lg` (já é o valor — vira oficial) |
| `820` | 2 | `container-content-lg` (840, diff -20px aceitável) |
| `780` | 3 | `container-content` (760) |
| `760` | 9 | `container-content` (já é o valor dominante — vira oficial) |
| `720` | 2 | `container-content` (760, diff +40px aceitável) |
| `680` | 3 | `container-content-sm` (680 — vira oficial) |
| `660` | 1 | `container-content-sm` (680) |
| `620` | 1 | `container-content-sm` (680, diff +60px — revisar visualmente) |
| `560` | 2 | nenhum token de prosa cabe bem — propor `--container-narrow: 560px` SE houver ≥2 usos estruturais (cards de formulário/login); senão tratar como `max-w-md` nativo (448px, diff -112px) ou manter pontual |
| `460` | 1 | `max-w-md` nativo (448px) — sem token novo |
| `340` | 1 | `max-w-sm` nativo (384px) ou `max-w-xs` (320px) conforme contexto |
| `330` | 1 | `max-w-xs` nativo (320px) |
| `280` | 1 | `max-w-xs` nativo (320px, diff -40px) ou `max-w-[280px]` mantido como exceção pontual (caso isolado, ex.: card de filtro estreito) |

> **Decisão:** os 5 tokens de container (§4.1) cobrem 90% dos casos (≥2 ocorrências cada). Os 8 valores de ocorrência única abaixo de 760px (`660/620/560/460/340/330/280`) **não justificam token próprio** — mapeiam para a escala nativa do Tailwind (`max-w-xs/sm/md`) ou ficam como exceção pontual documentada. Evita criar 18 tokens para 18 números — o objetivo é consolidar, não apenas renomear o caos.

### 4.3 Sistema de colunas e gutters por breakpoint

| Breakpoint alvo | Colunas recomendadas | Gutter (`px-*`) | Gap de grid |
|---|---|---|---|
| 375 (mobile) | 1 coluna (stack) | `px-4` (16px) — **nota:** auditoria mostra `px-6` dominante mesmo em mobile; ver §4.4 | `gap-4` (16px) |
| 768 (tablet) | 2 colunas (`md:grid-cols-2`) | `px-6` (24px) | `gap-6` (24px) |
| 1440 (desktop) | 3–4 colunas (`xl:grid-cols-3/4`) | `px-6` (24px), contido por `container-page` | `gap-6` (24px) |

**Resolver divergência de gap:** home usa `gap-4`, catálogo usa `gap-6` para grids estruturalmente equivalentes (auditoria §4). Oficial: **`gap-6`** em todo grid de cards de conteúdo (catálogo é a referência, mais espaço = melhor legibilidade em cards densos); `gap-4` reservado para grids de ícones/elementos compactos (não cards).

**`lg` quase abandonado (42 usos vs 102 de `md` e 97 de `xl`):** não eliminar o breakpoint (ele existe no `@theme` e pode ser necessário para ajustes finos de 992-1200px), mas **não é unidade primária de decisão** — o projeto pensa em 2 estados reais (`md`/`xl`). Não propor remoção, apenas reconhecer no código de novos componentes: preferir `md:`/`xl:` como os dois saltos principais, usar `lg:` só para correção pontual.

### 4.4 Decisão crítica de breakpoints — em vs px, 375/768/1440

**O problema:** breakpoints atuais em `em` não coincidem com os alvos de validação 375/768/1440:

| Token atual | Valor em `em` | Equivalente em px (16px base) | Alvo do briefing |
|---|---|---|---|
| `xs` | `36em` | 576px | — |
| `sm` | `48em` | 768px | **768 ✓ coincide** |
| `md` | `62em` | 992px | 768 ✗ (diferença de 224px) |
| `lg` | `75em` | 1200px | — |
| `xl` | `88em` | 1408px | 1440 ✗ (diferença de 32px) |

Isso significa: o "tablet" de design (768px) na verdade já é coberto pelo token `sm` (que bate exato), não pelo `md` como o nome sugeriria. E o "desktop" de design (1440px) cai **dentro** do range `xl` (que só liga em 1408px) — ou seja, qualquer viewport entre 1200px (`lg`) e 1408px (`xl`) usa o layout de tablet largo, e 1440px já está no território "desktop" mas com 32px de margem de erro perto do limite.

**Recomendação (escolhida): manter breakpoints em `em`, SEM realinhar para px exatos.**

Justificativa:
1. **`em` em media queries é tecnicamente superior a `px`** — escala corretamente quando o usuário aumenta o zoom/font-size do navegador (acessibilidade), o que `px` fixo não faz. Trocar para px puro seria regressão de acessibilidade para "casar" com números de design.
2. Os nomes dos breakpoints (`sm/md/lg/xl`) são **rótulos de intenção de layout** ("este é o salto para tablet", "este é o salto para desktop"), não medidas exatas de dispositivo. 375/768/1440 são os **viewports de teste do QA**, não obrigatoriamente os pontos exatos de quebra do CSS.
3. Realinhar `md` para exatamente 768px (`48em`) colidiria com o `sm` atual (que já é 48em) — exigiria renomear toda a escala (`xs/sm/md/lg/xl` deslocam um nível), o que é uma mudança estrutural maior e mais arriscada do que o problema que resolve.
4. O que realmente importa para a validação 375/768/1440 não é "o breakpoint liga exatamente nesse pixel", é "o layout parece certo nesses 3 viewports" — isso é validável visualmente independente de onde o breakpoint dispara, **desde que o QA saiba mapear**: 375px usa o estilo base (mobile, sem media query), 768px cai exatamente no `sm` (48em), 1440px cai depois do `xl` (88em=1408px), então herda o layout `xl`.

**Ação proposta (não é mudança de breakpoint, é documentação + 1 ajuste pontual):**
- **Documentar o mapeamento real** (tabela acima) para uso do `@qa` na Fase 3 — para que não testem "1440px deveria ser o `xl` que liga em 1440" (falso) e sim "1440px está no range `xl` porque 88em=1408px < 1440px".
- **Adicionar um token de container por breakpoint** (`--container-page`/`--container-admin`, §4.1) que já resolve o efetivamente importante: a partir de qual largura de **viewport** o conteúdo para de crescer e centraliza. Isso desacopla a pergunta "onde o grid muda de coluna" (breakpoint, em `em`, ok como está) da pergunta "qual a largura máxima do conteúdo" (container, em `px`, fixo) — são preocupações diferentes que a auditoria está correta em separar.
- Caso o time prefira certeza absoluta de pixel em 768/1440 (ex.: para QA automatizado por screenshot em viewport exato), a **alternativa** é: renomear a escala adicionando um nível (`xs:36em sm:42em(672px) md:48em(768px) lg:62em(992px) xl:75em(1200px) 2xl:90em(1440px)`) — mas isso é refactor de nomenclatura que toca os ~102+97+65+42 usos de `md/xl/sm/lg` no código. **Não recomendado nesta fase**; registrar como débito técnico se o QA achar bloqueante.

> **DECISÃO HUMANA NECESSÁRIA:** confirmar se a recomendação (manter `em`, documentar mapeamento, validar visualmente em 375/768/1440 sem exigir breakpoint exato) é aceitável, ou se o time prefere a alternativa de realinhamento de nomenclatura (maior risco/esforço, mas elimina ambiguidade de pixel).

### 4.5 Expressão via `@theme` + componentes

Ver diff completo na §7. Resumo: `--container-page`, `--container-admin`, `--container-content-lg/prose/prose-sm` novos; breakpoints **inalterados**.

### 4.6 Reconciliar `public-header.tsx` (`max-w-7xl`)

`max-w-7xl` nativo do Tailwind = 1280px. O corpo da página usa `1320px` (`container-page`). Divergência de 40px causa desalinhamento entre header e conteúdo (auditoria §4).

**Proposta:** `public-header.tsx:25` migra de `max-w-7xl` para `container-page` (1320px) — o header deve compartilhar exatamente o mesmo container do corpo da página, não uma aproximação nativa do Tailwind. Isso é correção direta, não ambiguidade — marcar para aplicação prioritária na Fase 3 (afeta toda página pública).

---

## 5. Eixo ícone/avatar (`size-*`)

### 5.1 Tokens propostos

> **Mecanismo (corrigido p/ engine 4.3.1):** `size-*` não é nomeável por token `@theme`. Logo, `icon-*` e `avatar-sm/md/lg` são **convenção de nomenclatura sobre steps nativos** `size-N` (sem CSS novo); só `avatar-xl`(88px) e `avatar-2xl`(220px), que ficam fora da escala nativa, são `@utility` (ver §7).

| Token (convenção) | Implementação real | Uso |
|---|---|---|
| `icon-xs` | `size-3` nativo (12px) | micro-ícones inline em texto |
| `icon-sm` | `size-4` nativo (16px) | ícone padrão em botão/badge (já dominante, 51×) |
| `icon-md` | `size-5` nativo (20px) | ícone padrão em lista/nav (22×) |
| `icon-lg` | `size-6` nativo (24px) | ícone de destaque em card (10×) |
| `icon-xl` | `size-10` nativo (40px) | ícone dentro de container circular pequeno |
| `avatar-xs` | `size-13` nativo (52px) | avatar compacto (absorve `size-[52px]`×5 + `size-13`×2) |
| `avatar-sm` | `size-12` nativo (48px) | avatar em lista (14×, já dominante) |
| `avatar-md` | `size-14` nativo (56px) | avatar em destaque (9×) |
| `avatar-lg` | `size-16` nativo (64px) | avatar/medalhão grande |
| `avatar-xl` | **`@utility size-avatar-xl`** (88px) | medalhão de depoimento/equipe (absorve `size-[88px]`) |
| `avatar-2xl` | **`@utility size-avatar-2xl`** (220px) | foto de destaque hero/perfil grande (absorve `size-[220px]`) |

### 5.2 Mapeamento dos 16 steps + 5 arbitrários

| Valor atual | Ocorrências | Token oficial |
|---|---|---|
| `size-4` | 51 | `icon-sm` |
| `size-5` | 22 | `icon-md` |
| `size-12` | 14 | `avatar-sm` |
| `size-6` | 10 | `icon-lg` |
| `size-11` | 10 | **fora de escala** → `icon-xl`(size-10) ou `avatar-sm`(size-12) por contexto — `11` não vira token próprio (apenas 1px de diferença de `10`/`12`, ruído) |
| `size-14` | 9 | `avatar-md` |
| `size-10` | 6 | `icon-xl` |
| `size-9` | 4 | **fora de escala** → `icon-md`(size-5, se for ícone) ou `icon-lg`(size-6) — avaliar; `9` não vira token |
| `size-8` | 4 | novo nível intermediário aceitável: `icon-lg` cobre, ou manter `size-8` nativo como "icon-lg alternativo" se uso for de botão quadrado (não ícone solto) |
| `size-3.5` | 4 | `icon-xs` (arredonda 14px→12px) ou manter fracionário como exceção de micro-UI (mesmo raciocínio do §2.1 para `0.5`/`1.5`) |
| `size-2` | 3 | mantém nativo (8px), abaixo de `icon-xs`, uso de bullet/dot — não precisa de token nomeado |
| `size-7` | 2 | **fora de escala** → `icon-lg`(size-6) ou `icon-xl`(size-10) por contexto |
| `size-3` | 2 | `icon-xs` |
| `size-16` | 2 | `avatar-lg` |
| `size-13` | 2 | **fora de escala** → `avatar-sm`(size-12) — diff de 4px imperceptível |
| `size-[52px]` | 5 | `size-13` **nativo** (= 52px exato). `avatar-xs` é a convenção de nome p/ `size-13`, absorvendo também os 2× `size-13` já existentes (7 usos no total). Sem CSS novo. |
| `size-[88px]` | 1 | `avatar-xl` (definir como 88px exato — ver nota nativa abaixo) |
| `size-[76px]` | 1 | entre `avatar-sm`(48)/`avatar-md`(56) e `avatar-xl`(88) — sem massa para token próprio; arredondar para `avatar-md`(64, usando size-16) ou `avatar-xl` conforme contexto visual |
| `size-[104px]` | 1 | entre `avatar-lg`(64) e `avatar-xl`(88) — sem massa para token próprio; arredondar para `avatar-xl` |
| `size-[220px]` | 1 | `avatar-2xl` (token novo, único caso de "foto grande") |

> **Correção de nota:** Tailwind v4 nativo já tem `size-13` = `3.25rem` = 52px (steps ímpares 9/11/13 **são** nativos do framework, contrariando a suposição inicial de que seriam arbitrários — a auditoria os lista como "steps distintos", não como arbitrários, o que está correto). A revisão proposta aqui é de **consolidação de uso** (reduzir de 16 steps soltos para ~8 tokens nomeados com significado), não de "correção" de valores inválidos.

**Resultado:** de 16 steps + 5 arbitrários (21 valores) para **9 tokens nomeados** (`icon-xs/sm/md/lg/xl`, `avatar-xs/sm/md/lg/2xl`), com 2-3 casos residuais de baixa massa absorvidos por arredondamento ao token mais próximo.

---

## 6. `min-h` de card

6 valores: `320/260/420/360/310/276/220px`.

> **Mecanismo (engine 4.3.1):** `min-h-*` resolve de `--min-height`/`--spacing`/`--container` — **não** de `--height`. Como os valores-alvo já batem com steps nativos, **nenhum token custom é necessário**: usa-se `min-h-N` direto. `card-min-h-sm/md/lg` é apenas convenção de nome.

| Convenção | Implementação real | Mapeia de |
| --- | --- | --- |
| `card-min-h-sm` | `min-h-64` nativo (256px) | `260`, `276`, `220` (diff ≤36px) |
| `card-min-h-md` | `min-h-80` nativo (320px) | `320`, `310` (diff ≤10px) |
| `card-min-h-lg` | `min-h-96` nativo (384px) | `420`, `360` (diff ≤36px) |

**Recomendação final:** 3 níveis mapeando steps **nativos** `min-h-64/80/96` (256/320/384px), **zero `@theme`/`@utility` custom** neste eixo, cobrindo os 6 valores com arredondamento ≤36px — aceitável para `min-h` (altura mínima, não é medida de pixel crítica). O caso `min-h-[220px]` isolado fica marcado para inspeção visual na Fase 3 (ver §10.4).

---

## 7. Diff proposto do `@theme` (`globals.css`)

> **⚠️ Correção técnica (validada contra a engine `tailwindcss@4.3.1` — `node_modules/tailwindcss/dist/lib.js`):** o namespace `--size-*` **não é populável por token** — `size-*` só resolve de `--spacing`/`--size` interno. E `min-h-*` resolve de `--min-height`/`--spacing`/`--container`, **não** de `--height`. Portanto os tokens `--size-icon-*`/`--size-avatar-*`/`--height-card-*` da versão anterior gerariam **utilitários mortos**. O diff abaixo foi corrigido: ícone/avatar via `@utility` (nome semântico) ou via escala nativa `size-N`; altura de card via escala nativa `min-h-N` (sem token custom). Evidência: binding `["max-w",["--max-width","--spacing","--container"]]`, `["size",["--size","--spacing"]]`, `["min-h",["--min-height","--spacing","--container"]]`.

**Apenas ADIÇÃO. Nada do bloco atual (linhas 6-59) é removido ou alterado.**

```css
@theme inline {
  /* ...tokens existentes inalterados... */

  /* ---- NOVO: containers (geram max-w-page/admin/content-* — e também w-*/min-w-*) ----
     NOTA: namespace `content`, NÃO `prose` — Tailwind v4 já reserva --max-width-prose:65ch
     nativo, que sobrescreveria max-w-prose. Confirmado na engine 4.3.1. ---- */
  --container-page: 82.5rem;        /* 1320px — marketing/corpo de página */
  --container-admin: 75rem;         /* 1200px — área admin */
  --container-content-lg: 52.5rem;    /* 840px — título+descrição largos (hero) */
  --container-content: 47.5rem;       /* 760px — prosa padrão */
  --container-content-sm: 42.5rem;    /* 680px — prosa estreita */

  /* ---- NOVO: tipografia micro (badges/contadores) ---- */
  --text-2xs: 0.625rem;             /* 10px — gera text-2xs; substitui text-[10px]/text-[9px] */
}

/* ---- NOVO: ícone/avatar via @utility (size-* NÃO é nomeável por token) ---- */
/* Ícones mapeiam para steps nativos size-N — não precisam de @utility (ver §5).
   Apenas os avatares fora da escala nativa ganham utilitário semântico: */
@utility size-avatar-xl {   /* 88px — absorve size-[88px] */
  width: 5.5rem;
  height: 5.5rem;
}
@utility size-avatar-2xl {  /* 220px — absorve size-[220px] */
  width: 13.75rem;
  height: 13.75rem;
}
```

**Como o Tailwind v4 (4.3.1) gera utilitários a partir disso:**
- `--container-*` → gera `max-w-page`, `max-w-admin`, `max-w-content-lg`, `max-w-prose`, `max-w-prose-sm` (e, como efeito colateral da cascata `["--max-width","--spacing","--container"]`, também `w-page`/`min-w-page` etc. — inofensivo). Mesmo mecanismo dos `--container-*` default que geram `max-w-7xl`.
- `--text-2xs` → gera `text-2xs` (namespace `--text-*` correto, mesmo padrão de `text-xs`).
- **Ícone (`icon-xs..xl`):** NÃO viram token nem `@utility` — mapeiam direto para steps **nativos** `size-3/4/5/6/10` (todos já existem). O "token" é convenção de nomenclatura na documentação/revisão, não CSS. Isso evita 5 utilitários redundantes.
- **Avatar:** `size-12/13/14/16` são **nativos** (48/52/56/64px) — usados direto. Só `size-avatar-xl`(88px) e `size-avatar-2xl`(220px) precisam de `@utility` por estarem fora da escala nativa.
- **`min-h` de card:** NENHUM token — usa `min-h-64/80/96` **nativos** (256/320/384px). Ver §6.

> **Nota de colisão (architect):** nomes de container são semânticos (`-page`/`-prose`), nunca numéricos (`-md`/`-lg`), justamente para **não** sobrescrever os defaults `max-w-md`(28rem)/`max-w-lg` da engine (`theme.css:337`). `--max-width-prose` já existe no default (65ch) — por isso usamos `--container-content` (nome distinto), não redefinimos `prose`.

**Nenhuma alteração em breakpoints, radius, fontes ou cores** — eixos já saudáveis (auditoria §6) permanecem intocados.

---

## 8. Plano de componentes

### 8.1 `<Container>`

```tsx
type ContainerProps = {
  variant?: "page" | "admin" | "prose-lg" | "prose" | "prose-sm";
  as?: React.ElementType; // default "div"
  className?: string;
  children: React.ReactNode;
};

// Default: variant="page"
// Aplica: mx-auto w-full px-6 max-w-{variant}
```

Elimina as ~38 ocorrências de `mx-auto w-full max-w-[1320px] px-6` / `[1200px]` repetidas verbatim (auditoria §8, ponto 1). `public-header.tsx` adota `variant="page"` no lugar de `max-w-7xl` (§4.6).

### 8.2 `<Section>`

```tsx
type SectionProps = {
  size?: "sm" | "md" | "lg"; // default "md" — mapeia para section-y-sm/md/lg (§2.3)
  as?: React.ElementType; // default "section"
  className?: string;
  children: React.ReactNode;
};

// size="sm" → py-8 md:py-12 xl:py-16
// size="md" → py-12 md:py-16 xl:py-24  (default)
// size="lg" → py-16 md:py-24 xl:py-32
```

Absorve os 4 `py-[..px]`/`py-18`/`py-22` arbitrários e normaliza as repetições de `py-16`/`py-24` já na escala (auditoria §8, ponto 2).

### 8.3 Regra de adoção do `CardTitle`

- **Toda** ocorrência de heading dentro de um `<Card>` (ou estrutura visualmente equivalente a card) deve usar `<CardTitle>`, nunca `<h2>`/`<h3>` inline com classes redeclaradas.
- `<CardTitle>` em si não muda (`font-heading text-2xl font-bold leading-tight` já é o token `h3` oficial, §3.1) — a mudança é de **disciplina de uso**, não do componente.
- `course-article-card.tsx` (H3 `text-xl`, divergente do catálogo `text-2xl`) é o primeiro candidato de migração na Fase 3: trocar `<h3 className="text-xl font-bold">` por `<CardTitle>`.
- Headings de seção (não-card) usam os tokens `h1`/`h2` (via `section-heading.tsx` consolidado, §3.1) — `CardTitle` é exclusivo de contexto de card.

---

## 9. Tabela-resumo "Outlier → Token oficial" (régua para `@qa`, Fase 3)

| Eixo | Outlier atual | Token oficial | Severidade se não corrigido |
|---|---|---|---|
| Espaçamento | `py-[72px]` | `section-y-sm` (componente `Section`) | MÉDIA |
| Espaçamento | `py-[88px]` | `section-y-md` | MÉDIA |
| Espaçamento | `py-[120px]` / `xl:py-36` | `section-y-lg` | MÉDIA |
| Espaçamento | `py-18` | `section-y-sm` | MÉDIA |
| Espaçamento | `py-22` | `section-y-md`/`lg` (por contexto) | MÉDIA |
| Espaçamento | `9` (gap/p/m) | `8` | BAIXA |
| Espaçamento | `28`/`36` soltos | `24`/`32` | BAIXA |
| Tipografia | H1 pulando `5xl` | `h1` (`text-4xl md:text-5xl xl:text-6xl`) | MÉDIA |
| Tipografia | H2 em `black`/`extrabold` (na verdade título de card) | `h3` + `CardTitle` | ALTA (hierarquia semântica trocada) |
| Tipografia | H3 `text-xl` (`course-article-card.tsx`) | `h3` (`text-2xl`) / `CardTitle` | MÉDIA |
| Tipografia | `text-[10px]`/`text-[9px]` | `text-2xs` | BAIXA |
| Tipografia | `tracking-[0.04/0.05/0.06/0.12em]` | `tracking-[0.08em]` ou `tracking-normal` | BAIXA |
| Tipografia | peso fora do nível (ex.: `black` em h2) | peso fixo por nível (§3.2) | ALTA se trocar leitura hierárquica |
| Container | `max-w-[1320px]` | `max-w-page` (`<Container variant="page">`) | MÉDIA (mecânico) |
| Container | `max-w-[1200px]` | `max-w-admin` | MÉDIA |
| Container | `max-w-7xl` (header) | `max-w-page` | ALTA (desalinhamento visual direto) |
| Container | `840/900/920/860px` | `max-w-content-lg` | BAIXA |
| Container | `760/780px` | `max-w-prose` | BAIXA |
| Container | `680/660/620px` | `max-w-prose-sm` | BAIXA |
| Container | `560/460/340/330/280px` | `max-w-sm`/`md`/`xs` nativo ou exceção pontual | BAIXA |
| Grid | `gap-4` em grid de cards de conteúdo | `gap-6` | BAIXA |
| Grid | uso de `lg:` como salto primário | `md:`/`xl:` como saltos primários | BAIXA |
| Ícone | `size-9/11/13/7` soltos | `icon-md/xl`, `avatar-xs` (por contexto, §5.2) | BAIXA |
| Avatar | `size-[52/76/88/104/220px]` | `avatar-xs/md/xl/xl/2xl` (§5.2) | MÉDIA (5 ocorrências concentradas em `52px`) |
| Card | `min-h-[220...420px]` | `min-h-card-sm/md/lg` (`min-h-64/80/96`) | BAIXA |

**Critério de severidade (herdado da auditoria §10):** ALTA = quebra hierarquia/layout/fluxo crítico; MÉDIA = token errado mas escala existe; BAIXA = polimento fino.

---

## ✅ DECISÕES HUMANAS (FINALIZADAS — Fase 3)

> **Aprovadas e em execução:**
> 1. ✅ **Breakpoints:** MANTER em `em` (acessibilidade preservada). Documentação: 375px=base (mobile), 768px=`sm` (48em), 1440px=range `xl` (88em=1408px, 32px de margem). Validação visual nos 3 viewports, não pixel-perfeito.
> 2. 🔄 **Header:** `public-header.tsx` migra `max-w-7xl` → `max-w-page` (1320px) — EM EXECUÇÃO.
> 3. ✅ **Avatares:** `size-[88px]`/`size-[220px]` → `@utility size-avatar-xl`/`size-avatar-2xl` (IMPLEMENTADO).
> 4. 🔄 **`min-h-[220px]`:** Inspeção visual em progresso — arredondar para 256px se diff aceitável.
> 5. 📋 **Larguras outlier** (560/280px): caso-a-caso durante migração; manter pontual se uso isolado.
>
> **Sequência em execução:** (A) tokens ✅ + utilities ✅; (B) header alignment 🔄; (C) card review 🔄; (D) escalar migração → admin + público.

---

## 10. Pontos que exigem decisão humana antes da Fase 3

1. **§4.4 — Breakpoints em `em` vs realinhamento para px exato.** Recomendação: manter `em`, documentar mapeamento. Alternativa: renomear escala completa (`2xl` novo nível). **Decisão necessária.**
2. **§4.6 — `public-header.tsx` `max-w-7xl` → `max-w-page`.** Correção direta recomendada, mas afeta toda página pública — confirmar prioridade na sequência da Fase 3 (auditoria recomenda fluxos críticos primeiro; header é transversal a todos eles).
3. **§5.2/§7 — `size-[88px]` e `size-[220px]` via `@utility` vs step nativo.** Como `--size-*` não é nomeável por token (confirmado na engine 4.3.1), a opção é: (a) `@utility size-avatar-xl/2xl` (nome semântico — recomendado) **ou** (b) usar `size-22`(88px) nativo e manter `size-[220px]` como exceção arbitrária documentada (220px não tem step nativo). Decidir entre nome semântico (a) ou minimalismo (b).
4. **§6 — `min-h-[220px]` isolado.** Pode ficar mal absorvido por `card-min-h-sm`(256px, diff 36px); decisão de revisar visualmente esse card específico na Fase 3 antes de aplicar o token, ou criar uma 4ª variante `card-min-h-xs`(224px) — manter em aberto até inspeção visual.
5. **§4.2 — `560px`/`280px`/outros valores de ocorrência única.** Proposta é não tokenizar (usar escala nativa Tailwind ou manter exceção pontual). Confirmar que o time aceita esses casos como "exceção documentada" e não exige token formal para cada um.

---

## ✅ FASE 3 — Status Atual (2026-06-20)

**Execução em andamento:**
- ✅ Tokens CSS implementados: `--container-page/admin/content-*`, `--text-2xs`, `@utility size-avatar-xl/2xl`
- ✅ Componentes `Container` e `Section` em uso em 30 arquivos (marcadores: 8 Container, 22 Section)
- ✅ Arbitrários `max-w-[1320px]` e `py-[..px]` limpos (0 restantes)
- ✅ Quality gates: lint ✓, typecheck ✓, tests 114/114 ✓, build ✓

**Decisões finalizadas (Seção 10):**
1. ✅ Breakpoints: MANTER em `em` (acessibilidade), documentar mapeamento 375/768/1440
2. ✅ Header: Já usando `max-w-page` (resolvido)
3. ✅ Avatares: Implementados via `@utility`
4. ⏸️ Card min-h: Nenhum outlier encontrado (não é bloqueador)
5. 📋 Outlier widths: Avaliar caso-a-caso conforme necessário

**Próximo:** Escalar migração para admin + público (14 páginas restantes). Use `*status-brownfield` semanalmente para rastreamento.

_Documento: Fase 3 em execução. Bloqueadores críticos resolvidos. Build validado. Sistema pronto para escala._
