# Story 14.3.3: Limpeza de Canvases e Bundles Fora do Deploy

## Status
Done

## Executor Assignment
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools:
  - npm run lint
  - npm run typecheck
  - npm run test:unit
  - npm run build
  - npm run purge:gate
  - npm run test:epic14:fidelity
  - npm run test:epic14:fidelity:capture
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

Source: `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`

## Prerequisites
- Story 14.3.1 concluida: captura visual final realizada antes de remover referencias do deploy.
- Story 14.3.2 concluida: regressao funcional final aprovada ou com waiver documentado.
- Nao iniciar antes de preservar evidencia visual final em `artifacts/epic14-fidelity/`.

## Story
**As a** mantenedor tecnico do redesign,  
**I want** remover canvases e bundles de design do `public/`, preservando-os apenas como referencia documental fora do worker,  
**so that** o deploy final nao carregue artefatos temporarios do design system e continue dentro do budget Cloudflare.

## Acceptance Criteria
1. Remover do deploy publico os artefatos temporarios de canvas/design encontrados em `public/`: `RH Cursos Home.html`, `RH Cursos Agenda.html`, `support.js` e `_ds/`.
2. Preservar as referencias historicas fora do worker em `docs/design/redesign/reference/`, preferencialmente em subpasta dedicada para canvases/bundles, ou documentar que o conteudo ja existe em `docs/design-system/trust-keith/ds-package/`.
3. `public/api-docs.html`, `_headers`, `_redirects`, favicons, imagens de marca e assets operacionais permanecem intactos.
4. Atualizar `scripts/capture-epic14-fidelity.mjs` se necessario para que `npm run test:epic14:fidelity:capture` continue passando depois da limpeza, sem depender de HTML removido de `public/`.
5. O manifest de captura deve continuar registrando route captures 200; se canvas nao estiver mais em `public/`, declarar canvas indisponivel de forma explicita, como ja ocorre para rotas sem canvas dedicado.
6. `npm run purge:gate` passa e nao reporta reintroducao de `@mantine/*` ou `@emotion/*`.
7. `npm run build` e `npm run bundle:check` passam, confirmando que os artefatos removidos nao sao necessarios ao runtime.
8. `npm run test:epic14:fidelity` passa para proteger invariantes S7/S8/S9 e smoke Mantine.
9. QA cria ou atualiza `docs/qa/gates/14.3.3-limpeza-canvases-bundles-fora-do-deploy.yml` com resultado do cleanup e riscos residuais.
10. A story registra File List real com arquivos movidos/removidos/modificados e evidencia dos comandos executados.
11. Nenhum push, PR, release ou tag e executado nesta story.

## CodeRabbit Integration
> **CodeRabbit Integration**: Disabled
>
> CodeRabbit CLI is not enabled in `.aiox-core/core-config.yaml`.
> Quality validation will use manual review process only.

## Story Type Analysis
**Primary Type**: Maintenance/Cleanup  
**Secondary Type(s)**: Build Safety, Performance Budget, Regression Safety  
**Complexity**: M - remove assets publicos grandes e pode exigir ajuste no capture script.

## Specialized Agent Assignment
**Primary Agents**:
- @dev: executa limpeza local, preserva referencias e atualiza script se necessario.
- @qa: valida que build, captura, regressao e bundle continuam verdes.

**Supporting Agents**:
- @architect: consultar apenas se houver duvida sobre preservar referencias em `docs/design-system` vs `docs/design/redesign/reference`.
- @devops: recebe handoff somente na 14.3.4.

## Quality Gate Tasks
- [x] Pre-Commit (@dev): executar lint, typecheck, unit, build, purge, fidelity, capture e bundle.
- [ ] QA Review (@qa): validar que cleanup nao quebrou runtime nem evidencias finais.
- [ ] Pre-PR (@devops): nao aplicavel nesta story; push/PR ficam para 14.3.4.

## Tasks / Subtasks
- [ ] Confirmar que 14.3.1 e 14.3.2 foram aprovadas ou possuem waiver documentado.
- [x] Inventariar artefatos temporarios atuais em `public/`.
- [x] Mover ou preservar fora do worker `public/RH Cursos Home.html` e `public/RH Cursos Agenda.html`.
- [x] Mover ou preservar fora do worker `public/support.js`.
- [x] Remover ou mover `public/_ds/` sem afetar `docs/design-system/trust-keith/ds-package/`.
- [x] Atualizar `scripts/capture-epic14-fidelity.mjs` para nao depender de assets removidos do `public/`, se necessario.
- [x] Executar comandos obrigatorios.
- [x] Atualizar esta story com File List real, evidencias e Change Log.
- [ ] Solicitar QA review.
- [ ] QA cria ou atualiza `docs/qa/gates/14.3.3-limpeza-canvases-bundles-fora-do-deploy.yml`.

## Dev Notes

### Sources
- Epic Fase 3 cleanup: `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md#fase-3-verificacao-final-e-entrega`
- ADR D6: `docs/architecture/adr-014-redesign-trust-keith.md`
- Capture script: `scripts/capture-epic14-fidelity.mjs`
- Bundle check: `scripts/check-bundle-size.mjs`
- Public assets directory: `public/`

### Current State Observed by @sm
- `public/RH Cursos Home.html`, `public/RH Cursos Agenda.html`, `public/support.js` e `public/_ds/` ja foram removidos do deploy durante a execucao desta story e preservados em `docs/design/redesign/reference/canvases/`.
- Nao foram encontrados arquivos `*.dc.html` no `public/`; os wireframes permanecem em `docs/design/redesign/wireframes/`.
- O capture script foi ajustado para nao depender mais de `/RH%20Cursos%20Home.html` ou `/RH%20Cursos%20Agenda.html` em `public/`.
- Code intelligence foi pulado porque `.aiox-core/core/code-intel.isCodeIntelAvailable()` retornou `false`.
- ClickUp sync foi pulado porque nenhum MCP ClickUp ficou exposto nesta sessao.

### Technical Constraints
- Nao remover `public/api-docs.html`, `_headers`, `_redirects`, favicon, logo ou imagens operacionais.
- Nao modificar `.aiox-core/`.
- Nao adicionar dependencias.
- Nao executar `git push`, criar PR, release ou tag; essas operacoes sao exclusivas de @devops.
- Se a referencia historica for movida para docs, manter caminhos claros para futuras auditorias.

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

Manual checks:
- `find public -maxdepth 2 -name '_ds' -o -name 'support.js' -o -name '*.dc.html' -o -name 'RH Cursos *.html'` nao deve retornar artefatos temporarios do redesign.
- Conferir que referencias preservadas estao em `docs/design/redesign/reference/` ou ja cobertas por `docs/design-system/trust-keith/ds-package/`.
- Conferir `artifacts/epic14-fidelity/manifest.json` apos cleanup.

## File List
- `docs/stories/2026-07-06-epic14-story3-3-limpeza-canvases-bundles-public.md`
- `eslint.config.mjs`
- `docs/design-system/trust-keith/INVENTORY.md`
- `docs/design/redesign/reference/canvases/`
- `public/RH Cursos Home.html` (movido para `docs/design/redesign/reference/canvases/`)
- `public/RH Cursos Agenda.html` (movido para `docs/design/redesign/reference/canvases/`)
- `public/support.js` (movido para `docs/design/redesign/reference/canvases/`)
- `public/_ds/` (movido para `docs/design/redesign/reference/canvases/_ds/`)
- `scripts/capture-epic14-fidelity.mjs`
- `artifacts/epic14-fidelity/manifest.json`

## Dev Agent Record
- 2026-07-06 - `public/RH Cursos Home.html`, `public/RH Cursos Agenda.html`, `public/support.js` e `public/_ds/` foram removidos do deploy e preservados em `docs/design/redesign/reference/canvases/`.
- 2026-07-06 - `scripts/capture-epic14-fidelity.mjs` passou a registrar Home e Agenda como `canvas unavailable` com nota explícita apontando para a referência documental fora do `public/`.
- 2026-07-06 - `eslint.config.mjs` passou a ignorar `docs/design/redesign/reference/canvases/**`, já que os assets históricos deixaram de ser públicos mas continuam não sendo código de produção.
- 2026-07-06 - `find public -maxdepth 2 \( -name '_ds' -o -name 'support.js' -o -name '*.dc.html' -o -name 'RH Cursos *.html' \)` → sem resultados.
- 2026-07-06 - `npm run purge:gate` ✅
- 2026-07-06 - `npm run bundle:check` ✅
- 2026-07-06 - `npm run typecheck` ✅
- 2026-07-06 - `npm run lint` ✅
- 2026-07-06 - `npm run test:unit` ✅
- 2026-07-06 - `npm run build` ✅
- 2026-07-06 - `npm run test:epic14:fidelity` ✅
- 2026-07-06 - `npm run test:epic14:fidelity:capture` ✅
- Pendencia original encerrada: 14.3.1 e 14.3.2 ficaram aprovadas e o gate de QA 14.3.3 foi publicado.

## PO Validation
2026-07-06 · @po (Pax) via Codex · **GO** — checklist 10/10; o cleanup está bem cercado, com inventário factual dos artefatos atuais em `public/`, proteção explícita aos assets operacionais e critério claro para manter a captura de fidelidade funcional após a remoção. Status: Draft → Ready.

## QA Results
2026-07-06 - Gate formal @qa: PASS em `docs/qa/gates/14.3.3-limpeza-canvases-bundles-fora-do-deploy.yml`. Os artefatos históricos saíram de `public/`, foram preservados em `docs/design/redesign/reference/canvases/` e os gates técnicos seguiram verdes após a limpeza.

2026-07-06 - Re-review formal @qa: FAIL em `docs/qa/gates/14.3.3-limpeza-canvases-bundles-fora-do-deploy.yml`. A limpeza de assets continua tecnicamente válida, mas o pré-requisito de regressão funcional final não está atendido: `14.3.2` voltou a FAIL porque `test:e2e:smoke` falha no contrato de rate limit de `/api/auth/session`. Recomendação QA: não seguir para `14.3.4`/@devops até a regressão ser corrigida e revalidada.

2026-07-07 - Re-review formal @qa Fase 3: PASS em `docs/qa/gates/14.3.3-limpeza-canvases-bundles-fora-do-deploy.yml`. O pre-requisito `14.3.2` voltou a PASS, a limpeza segue valida com canvases fora de `public/`, referencias preservadas em `docs/design/redesign/reference/canvases/`, manifest de fidelidade regenerado e `test:e2e:smoke` 84/84 verde. Handoff para `14.3.4`/@devops fica liberado pela perspectiva de QA.

2026-07-07 - Follow-up formal @qa pós-ajuste: PASS mantido em `docs/qa/gates/14.3.3-limpeza-canvases-bundles-fora-do-deploy.yml`. `purge:gate` agora passa sem resíduos nominais, `bundle:check` passou com 568.8 KB / 1000 KB e os canvases permanecem fora de `public/`.

## Change Log

- 2026-07-06 - @sm (River) - Draft criada para cleanup final de canvases e bundles fora do deploy.
- 2026-07-06 - @po (Pax) - Validação de draft concluída com GO. Story liberada para execução por @dev. Status: Draft → Ready.
- 2026-07-06 - @dev (Dex) - Limpeza iniciada: canvases HTML, runtime `support.js` e bundle consumidor `_ds/` saíram de `public/` e foram preservados em `docs/design/redesign/reference/canvases/`. Status: Ready → In Progress.
- 2026-07-06 - @dev (Dex) - Gates locais de cleanup concluídos (`lint`, `typecheck`, `unit`, `build`, `purge:gate`, `test:epic14:fidelity`, `test:epic14:fidelity:capture`, `bundle:check`) e manifesto de fidelidade regenerado sem dependência de canvases no deploy.
- 2026-07-06 - @dev (Dex) - Story atualizada após PASS formal de QA e resolução da regressão funcional transitória durante a 14.3.2. Status: In Progress → Done.
- 2026-07-07 - @dev (Dex) - Follow-up de cleanup final: `purge:gate` revalidado sem resíduos nominais e `bundle:check` revalidado em 568.8 KB / 1000 KB.
