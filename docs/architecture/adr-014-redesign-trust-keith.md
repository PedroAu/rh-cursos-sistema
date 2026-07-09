# ADR-014 — Arquitetura do Redesign Trust Keith (Epic 14)

**Status:** Aceito · **Data:** 2026-07-02 · **Autor:** @architect (via @aiox-master, modo YOLO)
**Story:** 14.0.3 · **Insumos:** `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md` (seção 2), `docs/design-system/trust-keith/INVENTORY.md`

## Contexto

O Epic 14 implementa o design Trust Keith (adaptado à marca RH via remap `.rh2`) com fidelidade total aos canvases em `public/*.dc.html` e remove o Mantine do projeto. Restrições: worker Cloudflare < 3 MiB gzip (plano Free), implementação executada por Codex a partir de stories autossuficientes.

## Decisões

### D1 — UI: Radix + Tailwind + cva (RATIFICADA)
Substituir Mantine pelo padrão shadcn já iniciado em `src/components/ui/`. Nenhuma biblioteca de UI nova. Remove `@mantine/*` e `@emotion/react` (runtime CSS-in-JS sai do bundle — ganho direto no limite de 3 MiB).

### D2 — Forms: react-hook-form + zod (RATIFICADA)
`@mantine/form` → `react-hook-form` + `@hookform/resolvers` (resolver zod; zod já presente). **Únicas dependências novas do épico.** Validações existentes (`isEmail` etc.) migram para schemas zod colocalizados com os forms.

### D3 — Notificações: sonner (RATIFICADA)
`@mantine/notifications` → `sonner` (já instalado). API: `toast.success/error/info`.

### D4 — Hooks: useDisclosure local (RATIFICADA)
Criar `src/hooks/use-disclosure.ts` (open/close/toggle, ~10 linhas). Demais usos de `@mantine/hooks` avaliados caso a caso na 14.1.x — preferir remoção a substituição.

### D5 — Tokens: valores finais RH no `:root` (RATIFICADA, detalhada)
- `src/design-tokens/tokens.css` é a **fonte única**: tokens `--tk-*` com **valores finais RH já aplicados** (base + remap — a classe `.rh2` dos canvases NÃO é recriada) + variáveis `--rh-*` (INVENTORY seção 1).
- `tailwind.config.ts` estende o theme referenciando as CSS vars (`colors: { brand: 'var(--tk-brand)' , ...}`) — nunca duplicando hex.
- Paleta antiga (`#0066CC`, `#d4af37`, `#001736`) e `mantine-tokens.css` são removidas (14.0.4 e 14.1.x).

### D6 — Fidelidade: comparação Playwright vs canvas (RATIFICADA)
Cada story 14.2.x valida com screenshot Playwright a 1180px comparado ao canvas renderizado. Divergências permitidas apenas se listadas na seção "Adaptações" da spec da página (story 14.0.2).

### D7 — Estratégia de fontes (NOVA — resolve G1 e G4)

| Família | Fonte | Implementação |
|---|---|---|
| Inter (body/UI) | Google Fonts | `next/font/google` — self-host no build, zero CDN em runtime |
| Merriweather (serif) | Google Fonts | `next/font/google` |
| Caveat (hand, uso raro) | Google Fonts | `next/font/google`, carregar só onde usada |
| **Fraunces (display)** | **Comercial** (Connary Fagen) | Ver abaixo |

**Fraunces — decisão em duas trilhas (não bloqueia implementação):**
1. **Trilha padrão (imediata):** implementar com a stack de fallback já embutida no token `--tk-font-display` (`Iowan Old Style, Palatino Linotype, Georgia, serif`). Todas as stories 14.x prosseguem.
2. **⚠️ DECISÃO DO USUÁRIO (antes do Gate final 14.3.1):** (a) comprar licença webfont da Fraunces e servir via `next/font/local` — fidelidade máxima; ou (b) adotar alternativa gratuita de anatomia próxima (candidata: **Fraunces**, Google Fonts, serif display com peso 700 e tracking apertado) — exige aprovação visual do usuário; ou (c) manter fallback do sistema.

A troca é um ajuste de 1 ponto (`next/font` + token), sem retrabalho nas páginas.

### D8 — Estrutura de componentes (NOVA)

| Camada | Local | Conteúdo |
|---|---|---|
| Primitivas | `src/components/ui/` | button, badge, chip, card, input, checkbox, switch, avatar (reescritos com tokens tk/rh) |
| Padrões compostos | `src/components/patterns/` | course-card, paper-card, stat-block, testimonial, feature-list-item, progress-bar |
| Shell público | `src/features/public-shell/` | header (`rh-nav` com logo `public/images/brand/logo-horizontal.png`), footer, mobile-nav |
| Shell admin | `src/features/admin-shell/` | layout CSS grid substituindo AppShell (14.1.3) |

Componente `Logo` do DS **não é portado** (logo RH próprio). Todos os componentes consomem exclusivamente tokens CSS — hex hardcoded é proibido fora de `tokens.css`.

### D9 — Admin re-skin mínimo (NOVA — controle de escopo)
O admin (14.1.3/14.1.4) recebe **paridade funcional** com tokens novos, sem redesign visual próprio — não há canvas de admin. Redesign estético do admin fica fora do Epic 14.

## Consequências

- **Positivas:** bundle menor (Mantine+Emotion fora), 1 sistema de estilo único, tokens idênticos aos canvases (pré-requisito de fidelidade), stories Codex sem ambiguidade de estrutura.
- **Negativas/riscos:** migração de forms toca fluxos críticos (inscrição, login) — coberta por e2e existentes (14.1.6); Fraunces pendente de decisão do usuário (mitigada pela trilha de fallback); admin fica visualmente "básico" até epic futuro.

## Alternativas rejeitadas

- **Manter Mantine só no admin:** dois sistemas de UI, bundle maior, viola requisito explícito do usuário.
- **Formik / TanStack Form:** react-hook-form tem melhor integração zod/RSC e menor superfície.
- **Copiar `_ds_bundle.js` como fonte dos componentes:** o bundle é artefato de canvas (x-import), não código de produção; primitivas são reescritas em TSX com Radix/cva usando o bundle apenas como referência de anatomia.
