# Story 20.3 — Ações do dashboard operacional

## Status

Done

## Epic

Épica 20 — Evolução Operacional do Admin Trust Keith

## História

**Como** administradora, **quero** iniciar cadastros a partir do dashboard e operar leads recentes, **para** reduzir navegação desnecessária.

## Acceptance Criteria

- [x] “Novo curso” e “Nova turma” levam ao formulário real e não são controles inertes.
- [x] Leads recentes mantêm filtro por origem e oferecem detalhe/edição/exclusão confirmada.
- [x] Métricas e realtime continuam usando as fontes atuais.
- [x] Playwright cobre as ações e falha em caso de erro de runtime.

## Evidência

- `tests/epic15-admin-dashboard-fidelity.spec.ts` — ações Novo curso/Nova turma e filtro de leads.
- `npm run test:epic15:fidelity` — 10/10 aprovados.
