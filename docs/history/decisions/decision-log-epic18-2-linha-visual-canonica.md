# Decision Log — Épica 18 / Story 18.2: Linha visual canônica e sucessão de identidade

**Story:** 18.2 — Auditar e restaurar a prova do redesign
**Executor:** `@ux-design-expert`
**Date:** 2026-07-19
**Mode:** Auditoria brownfield (sem alteração de UI de produção)
**Status:** Decisões registradas; nenhuma remoção de token executada nesta story

> Este log **consolida** a sucessão de identidade visual da RH Cursos e classifica os
> tokens legados ainda presentes. Ele **não** substitui os decision logs históricos
> (`decision-log-custom-1.1.md`, `decision-log-ep-10.md`) nem os supersede — apenas
> declara qual identidade é vigente. É a fonte canônica exigida como saída para a Story 18.3.

---

## 1. Sucessão de identidade visual (AC 1)

| Identidade | Épica / Fonte | Tokens | Status |
|---|---|---|---|
| **Executive Precision** | Épica 7 (`docs/epics/epic-7-redesign-executive-precision.md`), `docs/design/executive-precision/DESIGN.md` | `--ea-*`, `--m3-*` (Material 3 navy `#004364` + gold `#ffc641`, Montserrat + Inter) | **HISTÓRICO / SUPERSEDIDO** |
| **Trust Keith** | Épica 14 + ADR-014 (`docs/architecture/adr-014-redesign-trust-keith.md`), canvases `docs/design-system/*.dc.html` | `--tk-*` (fonte única em `src/design-tokens/tokens.css`) | **BASELINE CANÔNICO VIGENTE** |

### Decisão D1 — Trust Keith é o baseline canônico único

**Decisão:** Trust Keith (`--tk-*`) é a identidade visual vigente e única. Executive
Precision (`--ea-*`/`--m3-*`) passa a **histórico/supersedido**.

**Evidência objetiva:**
- ADR-014 (Status *Aceito*, 2026-07-02) ratifica Radix + Tailwind + cva, `react-hook-form` + Zod, Sonner e tokens finais `--tk-*` como fonte única (D1–D8).
- `src/design-tokens/tokens.css` contém **184 tokens `--tk-*` e ZERO tokens `--ea-*`/`--m3-*`** — a fonte única de tokens já não carrega a identidade Executive Precision.
- A Épica 7 está `COMPLETE` mas o ADR-014 §D5 declara explicitamente a remoção da paleta antiga (`#0066CC`, `#d4af37`, `#001736`) e de `mantine-tokens.css`.

**Não há duas identidades declaradas simultaneamente como vigentes.** Executive Precision
permanece documentado apenas como registro histórico da Épica 7.

### Decisão D2 — Executive Precision preservado como histórico, não apagado

**Decisão:** Não remover a documentação da Épica 7 nem os decision logs históricos.
Eles são o registro de auditoria da transição. A supersessão é declarada aqui, não por deleção.

---

## 2. Classificação dos tokens legados (AC 1)

Varredura em `src/` e `app/` (excluídos backups e `.stories.`):

| Token | Onde persiste | Natureza | Classificação | Ação nesta story |
|---|---|---|---|---|
| `--ea-*`, `--m3-*` | `src/styles/globals.css` (271 ocorrências) | Camada de **aliases de compatibilidade** — 36+ definições mapeiam explicitamente para `var(--tk-*)` (ex.: `--ea-color-primary: var(--tk-brand)`) | **COMPATIBILIDADE** (intencional, per `decision-log-custom-1.1.md` Decisão 2 — migração gradual) | Manter (nenhuma remoção) |
| `--ea-color-success-green: #007a36`, `--ea-color-error: #ba1a1a`, `--ea-color-surface: #f5f5f7` e demais superfícies | `src/styles/globals.css` (subconjunto dos `--ea-*`) | Valores **hex literais** que NÃO derivam de `var(--tk-*)` | **FINDING** (F-TK-01) — hex fora da fonte de tokens; risco de drift em relação ao canônico | Documentar como finding; **não** alterar |
| `--ea-*` (menção) | `src/components/common/error-fallback.tsx` (linha 19) | Apenas **comentário** documentando que o fallback herda tokens do root layout — sem uso ativo de token legado no estilo | **COMPATIBILIDADE** (comentário informativo) | Manter |

**Finding F-TK-01** está detalhado no relatório de auditoria
(`docs/design/redesign/AUDIT-epic18-story2-fidelity.md`), severidade **Baixa**,
owner `@po` para decidir escopo de consolidação futura. **Nenhum token é removido nesta story.**

---

## 3. Consequências

- **Positivas:** uma única identidade vigente documentada; a camada `--ea-*`/`--m3-*` é
  reconhecida formalmente como compatibilidade (aliases → `--tk-*`), não como identidade
  concorrente; drift de hex isolado como finding rastreável.
- **Riscos remanescentes:** a camada de compatibilidade em `globals.css` mantém superfícies
  legadas em hex literal; consolidá-las depende de story/escopo aprovado (`@po`), fora da 18.2.

---

## 4. Referências

- ADR-014 — `docs/architecture/adr-014-redesign-trust-keith.md`
- Épica 7 — `docs/epics/epic-7-redesign-executive-precision.md`
- Épica 14 — `docs/epics/epic-14-redesign-trust-keith-fidelidade-total.md`
- Épica 15 — `docs/epics/epic-15-admin-dashboard-fidelidade-total.md`
- Fonte única de tokens — `src/design-tokens/tokens.css`
- Camada de compatibilidade — `src/styles/globals.css`
- Matriz de cobertura — `docs/design/redesign/MATRIX-rota-canvas-spec.md`
- Relatório de auditoria — `docs/design/redesign/AUDIT-epic18-story2-fidelity.md`
