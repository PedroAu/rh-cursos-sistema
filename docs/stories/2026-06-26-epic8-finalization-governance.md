# Story EP-8.final: Fechamento verificável da Épica 8

## Status
Done

## Épica
Épica 8 — Brownfield Remediation

## Story

**As a** mantenedor do produto,  
**I want** que as lacunas finais da Épica 8 tenham implementação ou gate verificável,  
**so that** a épica possa ser encerrada sem ACs marcados sem evidência.

## Acceptance Criteria

- [x] **AC1** — Sentry configurado de forma opt-in e não bloqueante quando DSN não existir
- [x] **AC2** — Bundle analyzer e Lighthouse CI possuem comandos CLI reproduzíveis
- [x] **AC3** — Storybook possui configuração mínima e build verificável
- [x] **AC4** — Sanitização de HTML/URL tem utilitário e testes unitários
- [x] **AC5** — Épica 8 documenta evidência real e lacunas externas sem prometer integração não verificada

## Tasks / Subtasks

- [x] Configurar Sentry para client/server/edge com `NEXT_PUBLIC_SENTRY_DSN`.
- [x] Adicionar bundle analyzer sob `ANALYZE=true`.
- [x] Adicionar Lighthouse CI com limiares CLI.
- [x] Configurar Storybook com addon de acessibilidade e story base.
- [x] Adicionar utilitário de sanitização e testes.
- [x] Rodar gates e reconciliar status.

## File List

- `package.json`
- `package-lock.json`
- `eslint.config.mjs`
- `next.config.mjs`
- `instrumentation.ts`
- `instrumentation-client.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `lighthouserc.cjs`
- `.storybook/main.ts`
- `.storybook/preview.ts`
- `src/components/ui/button.stories.tsx`
- `src/lib/security/sanitize.ts`
- `src/__tests__/lib/sanitize.test.ts`
- `src/views/public/BlogPost.tsx`
- `tests/a11y.spec.ts`
- `docs/epics/epic-8-brownfield-remediation.md`
- `docs/stories/2026-06-26-epic8-finalization-governance.md`

## Dev Agent Record

### Debug Log References

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run storybook:build`

### Completion Notes

- Sentry ficou opt-in via variáveis de ambiente e não falha o build quando DSN não está definido.
- Storybook buildou com sucesso; permaneceram apenas warnings não bloqueantes de asset size e `@opennextjs/cloudflare`.
- O lint precisou ignorar `storybook-static/` e `dist/` para não varrer artefatos gerados.
- A sanitização foi implementada com testes unitários e aplicada ao conteúdo público do blog.
- O fallback server-side da sanitização remove scripts, event handlers e URLs inseguras sem depender de runtime Node-only no bundle cliente.
- O Lighthouse CI passou a executar `build + autorun` e concluir com warnings de performance, sem erro bloqueante de configuração.
- O gate Axe das rotas públicas passou a emular `prefers-reduced-motion`, evitando falso negativo de contraste durante animação de entrada.
- `npm test` fechou com `124 passed`.

## Change Log

- 2026-06-26 — @dev (Dex) — Story criada para tornar o fechamento da Épica 8 verificável.
- 2026-06-26 — @dev (Dex) — Story concluída com Sentry opt-in, Storybook verificável, gates limpos e documentação reconciliada.

## QA Results

### 2026-06-26 — @qa (Quinn)

- **Gate:** PASS
- **Resumo:** O pós-gate fail foi resolvido. O utilitário de sanitização agora tem fallback server-side seguro sem quebrar o bundle cliente, e o comando de Lighthouse ficou autossuficiente com thresholds reproduzíveis por categoria. Permanecem apenas warnings não bloqueantes de performance nas rotas auditadas.

#### Findings

1. `src/lib/security/sanitize.ts` passou a sanitizar o fallback server-side removendo conteúdo executável, atributos `on*` e URLs inseguras, preservando apenas tags permitidas.
2. `package.json` agora executa `npm run build && lhci autorun --config=./lighthouserc.cjs`, eliminando dependência implícita de artefatos anteriores.
3. `lighthouserc.cjs` foi ajustado para thresholds explícitos por categoria, evitando falsos bloqueios de audits individuais não requeridos pela story.
4. `tests/a11y.spec.ts` agora roda com `reducedMotion: "reduce"` para medir o estado estável da UI e não o frame intermediário do Framer Motion.

#### Evidência executada

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit -- src/__tests__/lib/sanitize.test.ts`
- `npm run build`
- `npm run storybook:build`
- `npm run test:lighthouse`
- `npm test`

### 2026-06-26 — @qa (Quinn) — Re-review

- **Gate:** PASS
- **Resumo:** O gate obrigatório permanece verde no estado atual do workspace. A suíte completa voltou a passar, incluindo os dois cenários de checkout que haviam regredido no review anterior.

#### Findings

1. `tests/checkout.e2e.spec.ts:129` voltou a passar no cenário de deeplink `?checkout=1`, restaurando a abertura automática do modal de inscrição.
2. `tests/checkout.e2e.spec.ts:136` voltou a passar no cenário de cancelamento do modal, confirmando que o usuário permanece na página do curso.

#### Evidência executada

- `npm test` ✅ (`124 passed`)
