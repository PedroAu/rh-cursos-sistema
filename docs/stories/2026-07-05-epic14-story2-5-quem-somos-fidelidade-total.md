# Story 14.2.5: Quem Somos com Fidelidade Total Trust Keith

## Status
In Progress

## Executor Assignment
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - npm run test:epic14:fidelity
  - npm run test:epic14:fidelity:capture
  - npm run lint
  - npm run typecheck
  - npm run test:unit
  - npm run build
  - npm run purge:gate
  - npm run bundle:check

## ClickUp Sync
clickup:
  task_id: ""
  epic_task_id: ""
  list: "Backlog"
  url: ""
  last_sync: ""
  status: "pending - ClickUp tool unavailable in current Codex session"

## Epic
EPIC 14 - Redesign Trust Keith: Fidelidade Total + Remocao do Mantine

Source: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`

## Prerequisites
- Gates F0/F1 aprovados.
- Shell publico e footer Trust Keith ja existem e devem ser reutilizados.

## Story
**As a** visitante avaliando autoridade institucional da RH Cursos,  
**I want** uma pagina Quem Somos fiel ao canvas Trust Keith com historia, proposito, solucoes, trilhas, metodologia e CTA,  
**so that** eu entenda a trajetoria e a credibilidade da empresa antes de avançar para cursos ou consultoria.

## Acceptance Criteria
1. A rota `/sobre` renderiza conforme `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-quem-somos.md`, preservando a ordem: navegacao shell, hero, stats, historia, missao/visao/filosofia, solucoes, trilhas, metodologia, CTA e footer.
2. Conteudo institucional estatico reproduz a copy da spec, incluindo fundacao 2007, Ester e Nilson, missao, visao, filosofia, valores, solucoes e metodologia.
3. A barra de stats institucionais segue o layout direto do canvas, nao necessariamente `StatBlock`, e trata o token `--tk-text-display` conforme tokens existentes ou adaptacao documentada.
4. A secao "Trilhas de conhecimento" usa contagem real de cursos por trilha/categoria quando disponivel, com fallback seguro; nao hardcodar contagens se o catalogo real permitir derivacao.
5. A navegacao indica "Quem Somos" ativo e preserva a decisao de IA sobre "Consultoria" como rota propria se ela ja existir em `/consultoria`.
6. Footer especifico desta pagina preserva copy institucional mais longa e copyright com "RH Cursos & Solucoes", sem quebrar o footer global do shell.
7. Responsivo: stats 4/2/1, grids 3/2/1 ou 2/1 conforme spec, sem overflow e com divisores ajustados.
8. Tokens/components Trust Keith, anti-Mantine, zero raw `<img>` e reduced motion sao respeitados.
9. Os checks obrigatorios passam: lint, typecheck, unit, build, purge gate, fidelity, capture e bundle check.
10. Ao concluir, story atualizada com checkboxes, File List real, Change Log, evidencias de testes e desvios aprovados.

## CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `.aiox-core/core-config.yaml`.
> Quality validation will use manual review process only.

## Story Type Analysis
**Primary Type**: Frontend/UI  
**Secondary Type(s)**: Content, Accessibility, Regression Safety  
**Complexity**: M - pagina institucional longa, predominantemente estatica, com uma secao derivada do catalogo.

## Specialized Agent Assignment
**Primary Agents**:
- @dev: implementacao da pagina e atualizacao da story.
- @qa: validacao visual, content parity, responsivo e regressao.

**Supporting Agents**:
- @ux-design-expert: consultar para divergencia de CTA/footer/token display.
- @architect: consultar apenas se a navegacao publica precisar mudar.

## Quality Gate Tasks
- [x] Pre-Commit (@dev): lint, typecheck, unit, build, purge gate, fidelity regression, capture e bundle check.
- [ ] QA Review (@qa): comparar visual 1180px, copy institucional, responsivo e footer especifico.
- [ ] Pre-PR (@devops): somente apos story aprovada; push/PR sao exclusivos de @devops.

## Tasks / Subtasks
- [x] Confirmar rota `/sobre`: `app/sobre/page.tsx`, `src/features/public/about/about-page.tsx`, `src/views/public/About.tsx`.
- [x] Implementar hero e stats institucionais.
- [x] Implementar historia, missao/visao/filosofia, valores e solucoes educacionais.
- [x] Implementar trilhas com dados reais/fallback e gradientes/glifos documentados.
- [x] Implementar metodologia, CTA final e footer especifico sem duplicacao do shell.
- [x] Validar responsivo, tokens, a11y e regression safety.
- [x] Executar verificacoes e registrar evidencias.

## Dev Notes

### Sources
- Spec Quem Somos: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-quem-somos.md`
- Epic: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md#fase-2-paginas-publicas-com-fidelidade-total`
- ADR: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/architecture/adr-014-redesign-trust-keith.md`
- Current page: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/About.tsx`
- Store/types: `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/lib/app-store.tsx`, `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/types/index.ts`

### Current State Observed by @sm
- `app/sobre/page.tsx` compoe `PublicPageShell` + `AboutPage`.
- `src/features/public/about/about-page.tsx` re-exporta `AboutPage` de `src/views/public/About.tsx`.
- A spec sinaliza `--tk-text-display` como gap de token em duas secoes; dev deve resolver contra tokens reais e documentar adaptacao.
- Code intelligence e ClickUp indisponiveis nesta sessao.

### Technical Constraints
- Nao adicionar dependencias.
- Nao modificar `.aiox-core/`.
- Nao reintroduzir Mantine/Emotion.
- Gradientes decorativos documentados podem permanecer literais; marca/CTA deve usar tokens.
- Copy institucional deve ser preservada.

## Testing
Required commands:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run purge:gate
npm run test:epic14:fidelity
npm run test:epic14:fidelity:capture
npm run bundle:check
```

Manual/visual checks:
- Desktop 1180px contra spec.
- Mobile 390px para stats, trilhas e CTA.
- Footer especifico sem duplicacao.
- Contagens de trilhas coerentes com dados ou fallback documentado.

## Expected File List
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/stories/2026-07-05-epic14-story2-5-quem-somos-fidelidade-total.md`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/About.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/features/public/about/about-page.tsx` (se migrar implementation)
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/features/public-shell/components/public-footer.tsx` (somente se footer exigir suporte a variante)
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/about-route.png`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/artifacts/epic14-fidelity/manifest.json`

## Dev Agent Record
- 2026-07-06 - `src/views/public/About.tsx` recebeu reskin Trust Keith com `Badge`, `Card` e tokens do design system, preservando a copy institucional da spec.
- 2026-07-06 - As trilhas de conhecimento passaram a usar contagem derivada de `courses` quando há categoria real no catálogo; trilhas ainda não representadas no catálogo atual exibem fallback institucional documentado.
- 2026-07-06 - `src/features/public-shell/components/public-footer.tsx` ganhou variante específica para `/sobre`, com copy institucional longa, rótulo `Quem Somos` e copyright `RH Cursos & Soluções`.
- 2026-07-06 - `npm run typecheck` ✅
- 2026-07-06 - `npm run lint` ✅
- 2026-07-06 - `npm run test:unit` ✅
- 2026-07-06 - `npm run build` ✅
- 2026-07-06 - `npm run purge:gate` ✅ (PASS com 1 warning não bloqueante de nomenclatura legado em `src/components/providers/mantine-provider.tsx`)
- 2026-07-06 - `npm run test:epic14:fidelity` ✅
- 2026-07-06 - `npm run test:epic14:fidelity:capture` ✅ via servidor local persistente (`node scripts/start-test-server.mjs`)
- 2026-07-06 - `npm run bundle:check` ✅
- Pendente para fechamento da story: validação visual/QA final desktop 1180px e mobile, com revisão da adaptação de fallback nas trilhas sem representação completa no catálogo atual.

## PO Validation
2026-07-05 · @po (Pax) via Codex · **GO** — checklist 10/10; conteúdo institucional, dependências, rota real e adaptação do token `--tk-text-display` estão documentados; ACs delimitam claramente o que deve ser estático versus derivado do catálogo. Status: Draft → Ready.

## QA Results
2026-07-06 - Evidência técnica regenerada após correção do capture script: `/sobre` não possui asset canvas dedicado em `public/`, então a referência válida para esta story é o route capture + manifesto (`artifacts/epic14-fidelity/manifest.json`). Gate individual técnico criado em `docs/qa/gates/14.2.5-quem-somos-com-fidelidade-total-trust-keith.yml`. Revisão formal de @qa ainda pendente.

## Change Log

- 2026-07-05 - @po (Pax) - Validação de draft concluída com GO. Story liberada para execução por @dev. Status: Draft → Ready.
- 2026-07-06 - @dev (Dex) - Página `/sobre` entrou em implementação com trilhas dinâmicas/fallback institucional e footer específico da rota. Status: Ready → In Progress.
- 2026-07-06 - @dev (Dex) - Gates técnicos concluídos (`lint`, `typecheck`, `unit`, `build`, `purge:gate`, `test:epic14:fidelity`, `test:epic14:fidelity:capture`, `bundle:check`) e artefatos de fidelidade de `/sobre` regenerados.
