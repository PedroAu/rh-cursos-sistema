# Critique — Épico 7 "Executive Precision" (Spec Pipeline, Fase 5)

**Revisor:** Quinn (@qa) · **Data:** 2026-06-10 · **Objeto:** `docs/specs/epic-7-executive-precision/spec.md`
**Modo de revisão:** THOROUGH, escalado para ADVERSARIAL.

## Tabela de notas

| Dimensão | Nota (1-5) | Síntese |
|---|---|---|
| **Completude** | 4 | Cobre as 15 telas (IDs `S-*`) e as 9 decisões. Lacunas em persistência (EP-5.4/lead origin). |
| **Rastreabilidade (Article IV)** | 4 | Maioria rastreia fonte verificável. Exceção crítica: FR-20 "gráficos" sem fonte no protótipo. |
| **Testabilidade** | 3 | ACs do épico mensuráveis; mas "checkout E2E" citado não existe; FRs qualitativos sem limiar. |
| **Consistência** | 4 | Forte alinhamento spec↔épico↔código. Paleta dupla no DESIGN.md (frontmatter vs prosa) e comentário dark-mode vivo em `globals.css:56`. |
| **Riscos** | 4 | Riscos principais mitigados. Falta rollback intra-fase e observabilidade de origem de leads. |
| **MÉDIA** | **3.8** | **NEEDS_REVISION** |

## Correções obrigatórias (bloqueiam APPROVED)

1. **[Rastreabilidade]** Remover ou rastrear a fonte do requisito de "gráficos" em FR-20 e §7-fase5 — `admin-dashboard.html` não tem gráfico algum (Article IV: invenção).
2. **[Testabilidade]** Explicitar que o "checkout E2E" (NFR-3 / §7-fase3) **não existe** e adicionar requisito de criá-lo como baseline antes da EP-3.2.
3. **[Consistência]** Declarar que o **frontmatter do DESIGN.md é a fonte canônica** de cor; a prosa §Colors (`#0D5B85`/`#D4A017`) está desatualizada; fixar gold/navy oficiais para o gate de contraste (NFR-1).
4. **[Consistência/Completude]** FR-25 deve cobrir a remoção do **comentário/estrutura dark-mode em `globals.css:54-68`** — não há classes `dark:` em `src/` (0 ocorrências).
5. **[Completude]** Fixar o **contrato mínimo de persistência da EP-5.4** (storage de branding, leitura de admins, prefs UI-only), única exceção ao backend intocado (CON-5).

## Correções sugeridas (não bloqueiam)

- `origin`/evento distinto por tipo de lead (contato/especialista/orçamento) para o funil GA4 (FR-8).
- Definir como as 5 telas novas entram na governança de snapshot (FR-5 só re-baseline as existentes).
- AC verificável para o redirect 301 `/curso → /cursos`.
- Padronizar ACs qualitativos (FR-11, FR-20, NFR-4) em Given-When-Then.
- Documentar alternativa rejeitada de coexistência (branch longo vs scope `data-theme`).

## Achados notáveis (evidência)

- `docs/design/executive-precision/DESIGN.md` — frontmatter `primary #004364`/`secondary-container #ffc641` vs prosa §Colors `#0D5B85`/`#D4A017`; `home.html` usa ambos os navies.
- `src/styles/globals.css:56` — comentário "Dark mode futuro (D4)" contradiz decisão #9.
- `docs/design/executive-precision/screens/admin-dashboard.html` — zero svg/canvas/chart (FR-20).
- `tests/` — existe `public-journeys.spec.ts`; **não existe** spec E2E de checkout.
- Referências precisas confirmadas: `checkout-modal.tsx:287/423-430`, `globals.css:54-68`, `calendar-view.tsx` (216 linhas), `ui-governance.spec.ts` (5 snapshots), `Contact.tsx:102` (`createLead`).

## Open Questions

- Existe doc de token-mapping Stitch→`--ea-*` que reconcilie os dois navies?
- A persistência da EP-5.4 reutiliza tabela de admins existente ou cria nova?
- Haverá staging para validar os 3 eventos GA4 antes de produção (AC §5.3)?

## VEREDICTO (Critique 1): NEEDS_REVISION (3.8 < 4.0)

Base verificável sólida (todas as referências arquivo:linha conferem; 15 telas e 9 decisões mapeadas). Nenhuma correção é estrutural — todas por edição de texto.

---

# Re-Critique (Fase 5b) — 2026-06-10

Escopo estrito: verificação das 5 correções obrigatórias aplicadas na spec.

| # | Correção | Status |
|---|---|---|
| 1 | FR-20 sem gráficos inventados (S-ADM confirmado sem svg/canvas/chart) | **RESOLVIDO** |
| 2 | Checkout E2E declarado inexistente + criação como baseline em FR-13/NFR-3 | **RESOLVIDO** |
| 3 | Precedência do frontmatter do DESIGN.md sobre a prosa §Colors | **RESOLVIDO** |
| 4 | FR-25 remove comentário/estrutura dark em `globals.css:54-68` (0 classes `dark:` em src/) | **RESOLVIDO** |
| 5 | Contrato mínimo de persistência EP-5.4 fechado em FR-23 | **RESOLVIDO** |

**Notas recalculadas:** Completude 5 · Rastreabilidade 5 · Testabilidade 4 · Consistência 5 · Riscos 4 → **MÉDIA 4.6**

## VEREDICTO FINAL: APPROVED (4.6 ≥ 4.0)

Observações não-bloqueantes (backlog/EP-1.3): enum `Lead.origin` (`src/types/index.ts:122`) é fechado e precisa ser estendido para os novos tipos de lead; ACs qualitativos (FR-11, FR-20, NFR-4) seguem sem Given-When-Then (opcional).

**Próximo passo:** `@sm *draft` da EP-0.1.

— Quinn, guardiã da qualidade 🛡️
