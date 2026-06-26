# Épica 4 — Jornadas Públicas

**Status:** COMPLETE — stories 4.1 a 4.4 `Done`

**PRD:** `docs/prd/modernizacao-ui-2026.md`
**Prioridade:** P2 (estanca conversão — driver de receita)
**Depende de:** Épicas 1, 2 (tokens + FormField consolidados)
**Fonte:** Apple HIG plan Fase 4; plano original Fase 4

---

## Objetivo

Aplicar os componentes consolidados a jornadas completas, página a página, sem refatoração dispersa. Cada jornada passa por revisão desktop/mobile, teclado, leitor de tela básico, movimento reduzido e contraste **antes** da próxima.

## Por que depois da fundação

Migrar páginas antes de ter tokens/FormField gera retrabalho. Componentes compartilhados primeiro (Épicas 1-2), páginas depois — mitiga regressão de fluxo.

---

## Stories propostas (para @sm *draft) — ordem por jornada

### Story 4.1 — Descoberta
- Home: hero mais forte, blocos editoriais, coerência executiva.
- Catálogo/Agenda/Blog: filtros claros, cards densos, metadados úteis, CTA hierarquizado, empty states, loading.
- **Rotas:** `/`, `/cursos`, `/agenda`, `/blog`.

### Story 4.2 — Conversão
- Curso/checkout: hierarquia da decisão, resumo do curso, benefícios, formulário rotulado, loading, erro inline, confirmação.
- Contato e In Company: formulários mais consultivos, melhor coleta B2B.
- **Rotas:** `/cursos/[slug]`, checkout, `/inscricao-confirmada`, `/contato`, `/in-company`.

### Story 4.3 — Acesso
- Login: formulário autenticação rotulado, erros claros, escolha de papel previsível.
- **Rotas:** `/login`.

### Story 4.4 — Conteúdo institucional
- Sobre e artigos de blog: leitura confortável, preview, taxonomia, consistência com cursos.
- **Rotas:** `/sobre`, artigos do blog.

---

## Critérios de aceite da épica

- [x] Cada jornada revisada (desktop/mobile/teclado/leitor de tela/motion/contraste) antes da próxima.
- [x] S2 (conversão) — atrito reduzido nos fluxos de captura.
- [x] S3 — formulários públicos com label persistente e erro inline.
- [x] Sem regressão de fluxo durante migração.

## Gates

`npm run lint` · `npm run typecheck` · `npm test` · revisão visual por jornada · checklist a11y.
