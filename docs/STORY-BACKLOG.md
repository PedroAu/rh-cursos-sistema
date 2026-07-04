---
title: Story Backlog
owner: "@po (Pax)"
created: 2026-07-03
last_updated: 2026-07-03
---


# 📋 Story Backlog

Centralized tracking of follow-up tasks, technical debt, and optimization opportunities identified during story validation, development, and QA.

## Statistics

| Metric | Count |
| --- | --- |
| Total items | 2 |
| 🔴 HIGH | 0 |
| 🟡 MEDIUM | 0 |
| 🟢 LOW | 1 |
| 📋 TODO | 1 |
| ✅ DONE | 1 |

---

## 🔴 HIGH Priority

_None._

---

## 🟡 MEDIUM Priority

_None._

---

## 🟢 LOW Priority

#### [1.2-F1] Admin CRUD para conteúdo da página de consultoria (FR9 diferido)
- **Source**: PRD gap analysis (@aiox-master, 2026-07-03)
- **Priority**: 🟢 LOW
- **Effort**: TBD (nova superfície admin)
- **Status**: 📋 TODO
- **Assignee**: —
- **Description**: FR9 lista "consulting-related public content" como gerenciável no admin. Decisão de escopo (2026-07-03): conteúdo da página de consultoria é **estático no código** no MVP (Story 1.2 AC5). A gestão editorial via admin fica diferida para story futura explícita, para evitar acoplar nova superfície admin ao re-skin do Épico 14 (ADR-014 D9).
- **Dependência**: modelo de dados de conteúdo + re-skin admin (Épico 14) concluídos.

---

## ✅ DONE

#### [1.1-F1] Registrar estimativa de complexidade (sizing) da Story 1.1
- **Source**: PO Validation (`*validate-story-draft 1.1`)
- **Priority**: 🟡 MEDIUM
- **Effort**: 15 min
- **Status**: ✅ DONE (2026-07-03)
- **Assignee**: @po (Pax)
- **Description**: Story 1.1 aprovada com GO (9/10) sem sizing explícito. Escopo (auditoria + gap-closing + verificação) → sizing **S**.
- **Completion Notes**: `sizing: S` registrado no frontmatter de `docs/stories/1.1.story.md` (Change Log v0.3).

---
