# Auditoria de Design System — Estado Atual (Fase 1)

> **Status:** FASE 1 concluída (READ-ONLY). Relatório de evidência para embasar a Fase 2 (definição da escala oficial) e a Fase 3 (aplicação).
> **Projeto:** rh-cursos — Next.js + Tailwind v4 (config em CSS via `@theme`, sem `tailwind.config.js`) + shadcn/ui "new-york".
> **Escopo:** padronização de ESCALA e RITMO de espaçamento, tipografia e grid. NÃO é redesign, cor, marca, conteúdo ou lógica.
> **Cobertura:** 113 `.tsx`, 19 rotas, 3 áreas (marketing/admin/auth), 18 componentes shadcn `ui/`.

---

## 0. Tokens-fonte (`src/app/globals.css`)

`@theme inline` (linhas 6-59) define:
- `--spacing: 0.25rem` → base 4px da escala de espaçamento.
- Breakpoints **em `em`**: `xs:36 sm:48 md:62 lg:75 xl:88`.
- Radius: `xs .125rem / sm .25rem / md .5rem / lg .75rem / xl 1rem`.
- Fonts: `--font-sans` (Inter), `--font-heading` (Montserrat).
- Cores brand navy/gold + tokens shadcn (background/foreground/primary/...).
- `@custom-variant dark` declarado (linha 4) — **mas 0 classes `dark:` usadas em todo o código.**

**Lacuna estrutural:** NÃO há tokens de container/max-width, de medida de prosa, de ritmo vertical de seção, nem de tamanho de ícone/avatar. Por isso autores recorrem ao escape-hatch `max-w-[..px]` / `size-[..px]` / `py-[..px]`.

---

## 1. Resumo executivo (todos os eixos)

| Eixo | Distintos | Arbitrários | Status |
|---|---|---|---|
| Espaçamento (p/m/gap/space) | 23 steps | 4 (`py-[72/88/120px]` + `py-18`) | ⚠️ Ritmo vertical sem regra |
| Tipografia — tamanho | 10 (xs→6xl) + `clamp()` | 3 (`text-[9/10px]`) | ⚠️ Hierarquia semântica quebrada |
| Tipografia — peso | 5 (medium→black) | 0 | ⚠️ Pula níveis (sem normal/light) |
| Tipografia — leading | 8 | 1 (`leading-[0.82]`, display) | ⚠️ Disperso |
| Tipografia — tracking | 7 | 5 (`[0.04–0.12em]`) | ⚠️ 4 residuais soltos vs `[0.08em]` |
| Ícone/avatar `size-*` | 16 | 5 (`[52/76/88/104/220px]`) | 🆕 ⚠️ Eixo não-documentado |
| Grid — containers / `w-/max-w` | escala + **18 larguras px** | 18 (13 usadas 1×) | ⚠️ Caos (sem `Container`) |
| Grid — `min-h` de card | 6 | 6 | 🆕 Sem token de altura |
| Grid — colunas | 14 combinações | — | ⚠️ até `grid-cols-12`/`7` |
| Grid — breakpoints | md(102) xl(97) sm(65) lg(42) | — | ⚠️ `lg` quase abandonado; gaps divergem |
| Gutter horizontal `px-*` | dominante `px-6` (40×) | 0 | ✅ Saudável |
| Radius `rounded-*` | 5 | 0 | ✅ Saudável (1× `rounded-2xl` fora dos tokens) |
| Elevação `shadow-*` | 6 | 1 (`shadow-[0_14px_32px...]`) | ➖ Baixa prioridade (embute cor) |
| Estados hover/focus | — | 0 (escala) | ✅ `focus-visible:ring-2` consistente |
| Dark mode | — | — | ➖ Não implementado (0 uso) |
| Inline `style={{}}` | 3 | 0 spacing/font/grid | ✅ Legítimos (dinâmicos) |

**Eixos SAUDÁVEIS (não precisam correção, servem de referência):** gutter `px-6`, radius, casca de container `max-w-[1320px]`/`[1200px]` (unificada por área), estados de foco, inline styles. **A escala "de fato" dos componentes `ui/` shadcn é consistente e deve ancorar a escala oficial.**

---

## 2. ESPAÇAMENTO

- **23 steps distintos.** Núcleo saudável (alta frequência): `4`(177), `6`(170), `2`(118), `8`(95), `3`(82), `5`(47), `1`(41), `16`(20), `12`(18).
- **Outliers (1-3×):** `9`(3), `28`(1), `36`(1), `2.5`(2), `32`(2). Fracionários relevantes: `0.5`(16), `1.5`(10) — micro-spacing de ícone/badge, aceitável mas não tokenizado.
- **Arbitrários px:** `py-[88px]`×4, `py-[72px]`×3, `py-[120px]`×1. + step `py-18` (auth) e `py-22` (page-hero) que não são steps nativos do Tailwind padrão.

### Problema central — ritmo vertical de seção sem regra
Em `src/app/(marketing)/page.tsx` coexistem **4 famílias de padding de seção** sem lógica de progressão por breakpoint:
- `py-12 → xl:py-[72px]` (48px → 72px)
- `py-16 → xl:py-[88px]` (64px → 88px)
- `md:py-[120px] → xl:py-36` (arbitrário no breakpoint MENOR, escala no maior)
- `py-16 → xl:py-24` (única 100% na escala)

**Causa raiz:** não há componente `Section` que possua o ritmo vertical; cada seção foi ajustada "no olho" e travada em px.

**Evidência:** `(marketing)/page.tsx:140,198,220,253,290,318,332,340`; `cursos/[slug]/page.tsx:122,208,428`; `page-hero.tsx:47` (`py-22`); `(auth)/login/page.tsx:72` (`py-18`).

---

## 3. TIPOGRAFIA

### Tamanho
- `text-sm`(120) `text-xs`(43) `text-2xl`(39) `text-3xl`(32) `text-lg`(24) `text-4xl`(18) `text-xl`(13) `text-base`(6) `text-6xl`(5) `text-5xl`(3).
- Arbitrários: `text-[10px]`×2, `text-[9px]`×1 (badges de contador) → `agenda-browser.tsx:306`, `admin-agenda-calendar.tsx:124`, `agenda-browser.tsx:240`.
- Tipografia fluida isolada: `text-[clamp(3.5rem,7vw,5.5rem)]` em `in-company/page.tsx:157` (número display) — padrão à parte, candidato a token de *display*.

### Hierarquia semântica QUEBRADA (problema central)
A mesma tag recebe combinações diferentes conforme contexto:
- **H1:** `text-4xl md:text-5xl xl:text-6xl` (`page-hero.tsx:66`) vs `text-4xl md:text-6xl` — pula o `5xl` (`page.tsx:145`).
- **H2:** 4 tamanhos (`base`/`2xl`/`2xl`/`3xl→4xl`) e 3 pesos (`bold`/`extrabold`/`black`). Alguns "H2" são títulos de card (uso semântico incorreto). `section-heading.tsx:37` (bold) vs `page.tsx:210,267,272` (black) vs `page.tsx:184,240,306` (extrabold).
- **H3:** `text-xl font-bold` (`course-article-card.tsx:102`) vs `text-2xl font-bold` (`cursos/page.tsx:189`).

**Causa raiz:** o componente `CardTitle` (shadcn, `card.tsx:14` = `font-heading text-2xl font-bold leading-tight`) **existe mas é ignorado** — toda página redeclara heading inline.

### Peso — pula níveis
`bold`(106) `extrabold`(61) `black`(21) `semibold`(22) `medium`(6). **Zero `normal`/`light`.** Sem nível intermediário; mesmo nível hierárquico usa pesos diferentes ("peso por humor do dev").

### Line-height — disperso
`leading-7`(34) `leading-tight`(24) `leading-8`(18) `leading-6`(17) `leading-none`(8) `leading-snug`(3) `leading-5`(1) `leading-[0.82]`(1). Há semi-padrão (texto grande=8, padrão=7) não formalizado. `leading-[0.82]` é intencional (display gigante com clamp), não erro.

### Tracking — converge mas com resíduos
`[0.08em]`(17, dominante, eyebrows uppercase) + 4 residuais soltos: `[0.04em]`(3) `[0.12em]`(1) `[0.06em]`(1) `[0.05em]`(1). Consolidar nos 1-2 valores reais.

### Referência saudável (escala "de fato" dos componentes shadcn)
- `button.tsx`: `text-sm font-semibold` / `gap-2` / `rounded-sm` / sizes `h-10 px-4 py-2` (default), `h-9 px-3` (sm), `h-11 px-6` (lg), `size-10` (icon).
- `input.tsx`: `h-10 px-3 py-2 text-sm rounded-sm`.
- `badge.tsx`: `px-2.5 py-0.5 text-xs font-bold rounded-sm`.
- Fonts (Montserrat/Inter via `font-heading`) — único eixo tipográfico disciplinado.

---

## 4. GRID / CONTAINER

### Casca externa — SAUDÁVEL mas repetida
Padrão de página: `mx-auto w-full max-w-[1320px] px-6` (marketing) / `max-w-[1200px]` (admin). Unificado por área, **mas repetido verbatim em 23 arquivos** — não há componente `Container`.
- Divergência: `public-header.tsx:25` usa `max-w-7xl` (~1280px) ≠ corpo `1320px` → header desalinhado.

### Caos um nível abaixo — larguras de bloco de texto
**18 larguras px arbitrárias distintas** (13 usadas 1× só): `1320`(25), `1200`(13), `760`(9), `780`(3), `680`(3), `840`(2), `820`(2), `720`(2), `560`(2), `920/900/860/660/620/460/340/330/280`(1× cada). Convivem com escala Tailwind (`max-w-3xl`×7, `sm`×3, `2xl`×2...). O eixo `w-[..px]` espelha exatamente esses valores (mesmo problema visto por outro utilitário).
- Concentração: `section-heading.tsx:24,39,49` (4 larguras só p/ título+descrição, variando por `align`); `page-hero.tsx:58,67,74` (`840/760/920/900`).

### `min-h` de card — sem token (novo)
6 valores distintos: `320/260/420/360/310/276/220px` em `page.tsx`, `sobre/page.tsx`, `contato/page.tsx`, `course-article-card.tsx`.

### Colunas e breakpoints
- Colunas: `md:grid-cols-2`(22) `sm:grid-cols-2`(19) `lg:grid-cols-4`(7) `xl:grid-cols-3`(4) ... até `grid-cols-12` e `grid-cols-7`.
- Breakpoints: `md`(102) `xl`(97) `sm`(65) **`lg`(42)** — `lg` quase abandonado; projeto pensa em 2 estados (md/xl). Grids equivalentes divergem no gap: home `gap-4` vs catálogo `gap-6` (mesma estrutura).

---

## 5. EIXO ÍCONE / AVATAR (`size-*`) — não-documentado 🆕

- **16 steps distintos:** `size-4`(51) `size-5`(22) `size-12`(14) `size-6`(10) `size-11`(10) `size-14`(9) `size-10`(6) `size-9`(4) `size-8`(4) `size-3.5`(4) `size-2`(3) `size-7`(2) `size-3`(2) `size-16`(2) `size-13`(2).
- **5 arbitrários:** `size-[52px]`×5, `size-[88px]`, `size-[76px]`, `size-[220px]`, `size-[104px]` — avatares/medallions.
- Steps ímpares (`9/11/13`) e os 5 px deveriam ser tokens nomeados (icon-sm/md/lg, avatar-*).

---

## 6. EIXOS SAUDÁVEIS / FORA DE ESCOPO

- **Radius:** 0 arbitrários. `rounded-full`(57) `rounded-md`(31) `rounded-xl`(25) `rounded-sm`(12) `rounded-lg`(12). Ruído mínimo: `rounded-2xl`(1, fora dos tokens xs→xl), `rounded`(1).
- **Gutter `px-*`:** `px-6` dominante (40×), 0 arbitrários — eixo mais disciplinado.
- **Estados:** `focus-visible:ring-2 ring-ring ring-offset-2` consistente; hover só muda cor (fora de escopo).
- **Shadow:** 1 arbitrário (`shadow-[0_14px_32px_rgba(212,160,23,0.24)]`) — embute cor; baixa prioridade. `shadow-sky`(1) parece typo/custom.
- **Dark mode:** declarado mas não usado (0 classes `dark:`).
- **Inline `style`:** 3, todos dinâmicos legítimos — `progress.tsx:19` (transform), `data-table.tsx:260` (min-width via CSS var), `course-article-card.tsx:69` (gradiente de imagem). **Fora do escopo.**

---

## 7. MAPA DE INCONSISTÊNCIA (concentração por arquivo)

| Arquivo | Outliers concentrados |
|---|---|
| `src/app/(marketing)/page.tsx` | **Maior:** 4 padrões de padding de seção; H2 com 4 tamanhos/3 pesos; `min-h` de card; gap divergente |
| `src/app/(marketing)/cursos/[slug]/page.tsx` | 2ª concentração `py-[88/72px]` |
| `src/components/shared/page-hero.tsx` | `py-22`; `[920px]`/`[900px]` quase-duplicados; H2 sem responsividade; 4 larguras de prosa |
| `src/components/shared/section-heading.tsx` | 4 larguras px só p/ título+descrição |
| `src/components/ui/card.tsx` (`CardTitle`) | Token de heading definido mas não adotado → causa raiz da fragmentação H2/H3 |
| `src/components/shared/course-article-card.tsx` | `min-h-[420px]`; H3 `text-xl` ≠ catálogo `text-2xl` |
| `src/app/(auth)/login/page.tsx` | `py-18`, `max-w-[560px]` |
| `src/components/shared/agenda-browser.tsx` / `admin-agenda-calendar.tsx` | `text-[9px]`/`text-[10px]` (badges de contador) |
| `src/app/(marketing)/in-company/page.tsx` | `text-[clamp()]` + `leading-[0.82]` (display fluido — intencional) |

---

## 8. PONTOS DE MAIOR ALAVANCAGEM (para Fase 2/3)

1. **Componente `Container`** → elimina ~38 ocorrências (`max-w-[1320px]`×25 + `[1200px]`×13) + os espelhos `w-[..]`.
2. **Componente `Section`** (ritmo vertical) → absorve os 4 `py-[..px]`/`py-18`/`py-22` + normaliza repetições de `py-16/24`.
3. **Tokens `@theme` de container/measure/section/icon** (Tailwind v4 gera `max-w-*`/`size-*` a partir de `--container-*` etc.) → fonte única, backing dos componentes.
4. **Adotar `CardTitle`** + definir escala semântica h1..h6 → resolve fragmentação tipográfica na raiz.
5. **Consolidar `section-heading` + `page-hero`** → mata ~8 das 18 larguras de prosa em 2-3 measure tokens.
6. **Ancorar a escala oficial na escala "de fato" dos componentes shadcn** (`h-10/9/11`, `px-4/3/6`, `text-sm`, `gap-2`) — já consistente.

---

## 9. ESTRATÉGIA DE RISCO (recomendação do architect, para Fase 3)

- Sequência de menor risco: **(A)** primeiro adicionar tokens `@theme` (camada de paridade não-quebrável, substituição arbitrário→utilitário nomeado); **(B)** depois migrar para componentes `Container`/`Section` arquivo-a-arquivo com diff visual.
- Os strings de container raramente são "puros" — frequentemente fundidos com `grid`/`bg`/`overflow-hidden`/gradiente. Migração **mecânica-mas-cuidadosa**, nunca `sed` cego.
- Ordem de aplicação (conforme briefing): fluxos críticos (inscrição/pagamento/login) → admin → portal → público.

---

## 10. RUBRICA DE SEVERIDADE (fixa, para Fase 3)

- **ALTA** = valor hard-coded fora da escala oficial após Fase 3; quebra de layout; regressão visual/responsiva; grid inconsistente em página de fluxo crítico.
- **MÉDIA** = token errado (existe na escala mas não é o certo); hierarquia tipográfica trocada; gutter/coluna divergente em página secundária.
- **BAIXA** = polimento fino de ritmo vertical.

---

_Relatório gerado na Fase 1 (auditoria, read-only). Próximo passo: Fase 2 — proposta da escala oficial em `docs/design-system.md` + diff de `@theme`, com GATE HUMANO antes de qualquer aplicação._
