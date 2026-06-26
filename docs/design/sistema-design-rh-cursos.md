# Sistema de Design RH Cursos

## Objetivo

Este documento consolida os contratos visuais e de acessibilidade que passaram a reger a UI após as Épicas 1-6 e a Fundação "Executive Precision" (Épico 7, FASE 0). Toda alteração de interface deve partir destes tokens, componentes e padrões antes de criar variações locais.

## Identidade Executive Precision (Épico 7)

A Fundação Executive Precision (EP-0.1 a EP-0.4) reentona a camada semântica das Épicas 1-6 sem recriar componentes. A identidade foi promovida para a base global na auditoria final do Épico 7, e o antigo scope `[data-theme="executive"]` ficou apenas como referência histórica nas stories. Base de referência: `src/styles/globals.css`, `docs/design/executive-precision/DESIGN.md` e `docs/design/tokens-cor-superficie.md`.

### Paleta (Material 3)

| Cor | Valor | Papel |
|-----|-------|-------|
| Navy primário | `#004364` | superfícies institucionais, header/footer, sidebar admin, CTA navy |
| Navy escuro | `#083b56` | sidebar admin e blocos de maior profundidade |
| Gold | `#ffc641` | ação primária e destaques premium (CTA gold) |
| Texto sobre gold | navy escuro dedicado | **obrigatório** — o par gold/`#715300` reprova AA; texto sobre gold usa o navy escuro validado na matriz |

> O par gold + texto navy é o único contrato textual aprovado sobre fundo gold. Validado em AA pela matriz (`scripts/contrast-matrix.mjs` → `docs/design/tokens-cor-superficie.md`). Nenhum gate de contraste afrouxa para acomodar o gold.

### Tipografia

| Família | Fonte | Uso |
|---------|-------|-----|
| Display/heading | Montserrat (self-hosted via `next/font/google`, `subsets: ["latin"]`) | headings, eyebrow, números de destaque |
| Corpo | Inter (self-hosted via `next/font/google`) | texto corrido, labels, controles |

Fontes são self-hosted (sem `@import` de CDN) — requisito do Cloudflare Workers/OpenNext. Pesos limitados aos efetivamente usados.

### Shape e componentes

- Cards com top-accent navy e elevação Level 1 (borda 1px + `0 4px 12px rgba(0,0,0,0.05)`).
- Botões: primário gold/navy, secundário ghost navy, terciário text-button — todas as variantes legadas preservadas.
- Chips/badges em formato pill com tint de baixa saturação.
- Inputs outlined com label `label-bold` acima e foco azul com glow.

## Tokens

Base de referência: `src/styles/globals.css`, `tailwind.config.ts` e `docs/design/tokens-cor-superficie.md`.

| Token | Classe principal | Usar para | Evitar |
|-------|------------------|-----------|--------|
| `surface` | `bg-surface` | fundo base de página e blocos neutros | banners promocionais ou cards elevados |
| `surface-raised` | `bg-surface-raised` | cards, painéis, shells elevados | cromados translúcidos ou fundos da página inteira |
| `control` | `bg-control` | inputs, chips, selects e controles | superfícies de conteúdo longo |
| `label-primary` | `text-label-primary` | texto principal | metadata secundária |
| `label-secondary` | `text-label-secondary` | apoio, hint, resumo e metadata | CTA primário ou heading |
| `accent` | `bg-accent` / `text-accent` | destaque institucional e ação secundária premium | texto longo sobre fundos claros sem contraste verificado |
| `success` | `bg-success` / `text-success` | confirmações e status positivos | ação primária global |
| `warning` | `bg-warning` / `text-warning` | alertas e chamada de atenção | cor padrão de botão |
| `danger` | `bg-danger` / `text-danger` | erro, risco e ação destrutiva | feedback neutro |

## Camadas de material

| Camada | Característica | Exemplos aprovados |
|--------|----------------|--------------------|
| Conteúdo | sólido, legível, com contraste direto | cards de curso, formulários, agenda, tabelas |
| Funcional | translúcido apenas quando é chrome/navegação | header público, overlays e shells de navegação |
| Destaque | contraste alto e foco institucional | hero principal, CTA de campanha, badges importantes |

Evitar:
- `apple-material` ou `apple-surface` dentro de conteúdo.
- misturar transparência promocional com formulário ou card de leitura.
- usar fundo branco puro sem borda/sombra quando já existe `surface-card`.

## Tipografia e hierarquia

Base de referência: Épica 1 Story 1.3.

| Papel | Classe recorrente | Uso aprovado |
|-------|-------------------|--------------|
| Hero | `text-hero` / `text-display` | headline principal de páginas de descoberta |
| Seção | `text-section` / `text-h1-alt` / `text-h2-compact` | abertura de seção e blocos institucionais |
| Label | `text-label` + uppercase quando necessário | eyebrow, legenda operacional, badges |
| Corpo | `text-base` / `text-sm` com `leading-6` ou `leading-7` | conteúdo corrido, hints e descrições |

Evitar:
- headings usando `text-muted-*`.
- labels críticas sem `font-bold` ou sem espaçamento consistente.
- tamanho de fonte arbitrário quando já existe escala semântica.

## Componentes compartilhados

| Componente | Arquivo | Contrato de uso |
|------------|---------|-----------------|
| `Button` | `src/components/ui/button.tsx` | usar `loading` para submissão; `variant="default"` para CTA principal; `outline` para ações secundárias |
| `FormField` | `src/components/ui/form-field.tsx` | toda entrada textual nova deve sair com label, hint opcional, erro e `aria-describedby` |
| `SearchInput` | `src/components/common/search-input.tsx` | busca com `resultsLabel`, `onClear` e `loading` quando houver filtro local/global |
| `LoadingBlocks` | `src/components/common/loading-blocks.tsx` | placeholder padrão com `summary` acessível; não criar skeleton novo por página sem motivo |
| `Dialog` / `Sheet` | `src/components/ui/dialog.tsx`, `src/components/ui/sheet.tsx` | respeitar foco, fechamento previsível e título/descrição |
| `Badge` / `StatusBadge` | `src/components/ui/badge.tsx`, `src/components/common/status-badge.tsx` | usar semântica de estado existente antes de criar nova paleta |

## Padrões de formulário

### Aprovado

- `FormField` envolvendo `Input`, `Textarea`, `Select` e controles equivalentes.
- erro textual próximo ao campo com `role="alert"` quando aplicável.
- botão de envio com `loading` e estado desabilitado durante a submissão.
- mensagem de sucesso/erro com `aria-live` em fluxos inline.

### Evitar

- placeholder como substituto de label.
- ícone sozinho como única affordance de ação sem `aria-label`.
- spinner isolado sem texto ou resumo de loading.
- limpar busca manualmente no teclado quando o componente já prevê `onClear`.

## Busca, loading e motion

| Tema | Regra |
|------|-------|
| Busca global | deve redirecionar para `/cursos?q=...` com feedback textual |
| Busca local | deve sincronizar com estado/URL quando a página já opera por filtros |
| Loading | precisa expor estado textual (`summary` ou botão `loading`) além do indicador visual |
| Motion | deve respeitar `prefers-reduced-motion`; nenhuma animação essencial pode bloquear leitura ou ação |

## Imagens

- usar `next/image` em vez de `<img>` cru.
- `priority` apenas em hero/largest contentful paint intencional.
- conteúdo editorial precisa de `alt` específico e não decorativo por padrão.

## Fluxo de governança

1. Reutilize token/componente existente.
2. Se houver variação nova, documente antes o motivo no story.
3. Atualize `docs/checklists/ui-a11y-review.md` se a regra de review mudar.
4. Passe pelos gates de UI automatizados em `tests/ui-governance.spec.ts`.

## Exemplos de decisão rápida

| Situação | Decisão |
|----------|---------|
| Novo formulário público | usar `FormField` + `Button loading` + mensagens inline |
| Nova busca por termo | usar `SearchInput` com `resultsLabel` e botão limpar |
| Nova área administrativa | começar de `surface-card`, `table`, `empty-state` e tokens semânticos |
| Novo placeholder de carregamento | reutilizar `LoadingBlocks` antes de criar outro skeleton |
