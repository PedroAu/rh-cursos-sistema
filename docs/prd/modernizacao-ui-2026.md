# PRD — Modernização de UI/UX do Site RH Cursos (2026)

**Tipo:** Brownfield PRD
**Autor:** @pm (Morgan) + @po (Pax)
**Data:** 2026-06-09
**Status:** Aprovado para sharding em épicos
**Escopo de publicação:** Site público + Admin (portal de aluno/instrutor **fora** do escopo atual)

---

## 1. Contexto e Driver

### 1.1 Por que agora

Quatro dores simultâneas justificam o investimento (confirmadas pelo solicitante):

1. **Admin ineficiente** — edição opaca, risco de erro humano operacional.
2. **Conversão pública baixa** — inscrição no catálogo/checkout abaixo do esperado.
3. **Abandono em formulários** — atrito nos fluxos de captura (contato, in-company, checkout).
4. **Inconsistência visual** — impacta brand e confiabilidade percebida.

### 1.2 Dependência de produto

Features de produto bloqueadas (**certificados**, **portal do aluno/instrutor**) dependem desta modernização como pré-requisito: precisam de tokens e de uma camada `FormField` consistentes para não nascerem inconsistentes. A fundação desta modernização **destrava** essas features.

### 1.3 Fontes (Article IV — No Invention)

Todo requisito deste PRD traça a um destes artefatos verificados:

- `docs/diagnosis/form-audit-2026-06-04.md` — diagnóstico de formulários admin (13 problemas).
- `docs/diagnosis/implementation-summary-2026-06-04.md` — registro de correções já aplicadas no admin.
- `docs/design/apple-hig-application-plan-2026-05-26.md` — auditoria do runtime + plano P0→P5.
- `docs/stories/2026-06-04-publication-readiness-portal-scope.md` — recorte de escopo de publicação.
- Verificação direta do código (2026-06-09) — ver §2.

---

## 2. Estado Real Verificado (baseline factual)

Auditoria de código em 2026-06-09 corrigiu uma premissa do plano original: **o admin já está ~80% modernizado.**

### 2.1 Já implementado e ligado (NÃO recriar)

Evidência: `src/views/admin/AdminResourcePage.tsx`, `src/components/admin/form-fields.tsx`, `src/lib/admin-form-validation.ts`, `src/lib/admin-resource-configs.tsx`.

| Item | Estado |
|------|--------|
| `ArrayInput` (objetivos, benefícios, tags) | ✅ Implementado e ligado |
| `ModulesBuilder` (módulos de curso) | ✅ Implementado e ligado |
| `SelectField` (enums e relações) | ✅ Implementado e ligado |
| `MultiSelectField` | ✅ Implementado e ligado |
| Validação por resource + erro inline por campo | ✅ Implementado |
| Modal responsivo (sem `max-h-96` quebrado) | ✅ Corrigido |
| Upload de imagem (type `file` + FileReader) | ✅ Implementado |
| Campos faltantes (leads B2B, blog completo) | ✅ Migrados via `buildResourceConfig` |
| Export CSV | ✅ Implementado |

**Implicação:** a "Fase 2/3 — admin" do plano original vira uma épica **enxuta de polish**, não de construção.

### 2.2 Fundações aproveitáveis (evoluir, não substituir)

| Item | Evidência |
|------|-----------|
| Tokens básicos | `src/styles/globals.css`, `tailwind.config.ts` |
| Alvo tocável 44px | `src/components/ui/button.tsx` |
| `:focus-visible` + `.skip-link` | `src/styles/globals.css` |
| `prefers-reduced-motion` (CSS global) | `src/styles/globals.css` |
| Skeleton de carregamento | `src/components/common/loading-blocks.tsx` |

### 2.3 Lacunas reais (o que este PRD endereça)

| Prioridade | Lacuna | Arquivos | Diretriz |
|-----------|--------|----------|----------|
| Alta | Placeholder usado como label persistente | `Contact.tsx`, `InCompany.tsx`, `Login.tsx`, `checkout-modal.tsx` | Text fields, Writing |
| Alta | Icon buttons sem nome acessível | `data-table.tsx` | Accessibility, Buttons |
| Alta | Texto funcional em 10-12px | `badge.tsx`, cards, agenda | Typography |
| Alta | Sem matriz de contraste WCAG AA; só `color-scheme: light` | `globals.css`, `tailwind.config.ts` | Color |
| Média | `apple-material` em conteúdo promocional (deveria ser só camada funcional) | `InCompany.tsx`, `Home.tsx`, `public-layout.tsx` | Materials |
| Média | Framer Motion sem `prefers-reduced-motion` em JS | `section-title.tsx`, `course-card.tsx`, `Home.tsx` | Motion |
| Média | Busca header visual sem fluxo real; busca local repetida | `public-layout.tsx`, `search-input.tsx` | Searching |
| Média | Erros em toast sem associação ao campo | forms públicos, checkout | Writing |
| Média | 7 `<img>` no runtime Next (warnings) | cards, detalhe, login | Loading, Layout |
| Média | Gráficos admin diferenciados só por cor | `AdminDashboard.tsx` | Charts |

---

## 3. Objetivos e Métricas de Sucesso

### 3.1 Objetivos

- **O1** — Consolidar linguagem visual institucional (tokens, tipografia, superfícies).
- **O2** — Reduzir atrito nos fluxos de conversão pública.
- **O3** — Tornar o admin produtivo, legível e seguro (concluir os 20% restantes).
- **O4** — Criar base de design system que previne regressão.

### 3.2 Critérios de sucesso (mensuráveis)

| ID | Critério | Verificação |
|----|----------|-------------|
| S1 | Nenhum campo crítico editado via JSON cru | ✅ já atendido — manter (regressão-guard) |
| S2 | Nenhuma relação importante digitada por ID manual quando há entidade | ✅ já atendido — manter |
| S3 | Todos os formulários com label persistente, erro inline e navegação por teclado | Playwright a11y + revisão |
| S4 | Nenhum texto funcional abaixo do mínimo tipográfico definido | Auditoria de tipografia |
| S5 | Combinações textuais principais passam WCAG AA | Matriz de contraste automatizada |
| S6 | Linguagem visual consistente entre público e admin | Revisão visual + tokens compartilhados |
| S7 | Busca sempre inicia operação real e informa resultado | Teste de fluxo |
| S8 | Nenhum movimento essencial ativo sob `prefers-reduced-motion` | Teste de motion |
| S9 | Warnings de `<img>` eliminados | Lint |

---

## 4. Decisões de Escopo (travadas pelo solicitante)

| # | Decisão | Escolha |
|---|---------|---------|
| D1 | Rollout | **Fundação Big Bang** (Épicas 1+2) + resto incremental |
| D2 | Primeira dor pós-fundação | **Admin** (mas barata, pois 80% pronto) |
| D3 | Artefato | **Brownfield PRD + épicos por fase** (este documento) |
| D4 | Tema | **Só modo claro**, tokens estruturados para dark futuro |
| D5 | Busca header | **Conectar ao catálogo** com termo aplicado (Épica 5) |

### 4.1 Fora de escopo

- Portal de aluno/instrutor (recorte de publicação — `2026-06-04-publication-readiness-portal-scope.md`).
- Dark mode / alto contraste **completos** (só estrutura de tokens agora).
- Conversão para app nativo Apple; cópia literal de iOS.
- Alteração de regras de negócio, integração Supabase ou conteúdo editorial.

---

## 5. Roadmap de Épicos

Sequência respeitando dependência técnica (fundação destrava o resto) + impacto:

```
Épica 1 — Fundação Visual & Baseline A11y        [Big Bang, sem dependência]
   ↓
Épica 2 — Form System & Acessibilidade Compartilhada   [P0 do plano]
   ↓
Épica 3 — Admin Polish                            [enxuta — 80% já pronto]
   ↓
Épica 4 — Jornadas Públicas                       [estanca conversão]
   ↓
Épica 5 — Busca, Loading, Motion & Imagens
   ↓
Épica 6 — Governança de Design
```

Detalhamento de cada épica em `docs/epics/epic-{N}-*.md`.

### 5.1 Mapa épica → prioridade original do solicitante

| Épica | Plano original | Apple HIG plan | Prioridade resultante |
|-------|----------------|----------------|----------------------|
| 1 | Fase 1 (Fundamentos) | Fase 0+1 | **P0** (pré-requisito) |
| 2 | Fase 2 (Formulários) | Fase 2 | **P0** |
| 3 | Fase 3 (Admin) | — | **P1** (barata) |
| 4 | Fase 4 (Jornadas) | Fase 4 | **P2** |
| 5 | Fase 5 (Busca/Motion) | Fase 3 | **P3** |
| 6 | Fase 6 (Governança) | Fase 5 | **P4** |

---

## 6. Gates de Qualidade (todos os épicos)

Cada story só fecha com:

- `npm run lint` — verde
- `npm run typecheck` — verde
- `npm test` — verde (encadeia typecheck + build + playwright)
- Revisão visual desktop/mobile
- Checklist a11y nos fluxos alterados (a partir da Épica 1)

Workflow AIOX: SDC (`@sm *draft → @po *validate → @dev *develop → @qa *qa-gate → @devops *push`).

---

## 7. Riscos

| Risco | Mitigação |
|-------|-----------|
| Mudança visual sem prova de melhoria | Baseline visual + a11y capturado na Épica 1 antes de alterar tokens |
| Regressão de fluxo durante migração | Componentes compartilhados primeiro, páginas depois (Épica 4) |
| Fundação pela metade piora inconsistência | Épicas 1+2 entram como bloco atômico (Big Bang) |
| Recriar o que já existe (admin) | Baseline §2.1 documenta o que NÃO recriar |
