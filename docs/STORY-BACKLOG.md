# Story Backlog

> Gerenciado por `@po` (Pax). Ver `.aiox-core/development/tasks/po-manage-story-backlog.md`.

Última atualização: 2026-08-12

## Estatísticas

- Total: 7
- 🔴 HIGH: 1 (0 em aberto)
- 🟡 MEDIUM: 5 (0 em aberto)
- 🟢 LOW: 1 (0 em aberto)
- Status: 7 ✅ DONE

---

## 🔴 HIGH

#### [FIDELITY-T1] Restaurar referência de canvas quebrada (F-CANVAS-05)
- **Source**: Análise de débito técnico — `docs/design/redesign/ANALYSIS-debito-prova-fidelidade.md` §4
- **Priority**: 🔴 HIGH *(reclassificado de Média por decisão @po — ver Nota de Decisão abaixo)*
- **Effort**: Não estimado — depende de escolha entre versionar assets vs. reexportar canvas estático hidratado
- **Status**: ✅ DONE
- **Assignee**: `@ux-design-expert` + `@po`
- **Sprint**: —
- **Description**: 10 dos 11 canvases em `docs/design-system/` referenciam `support.js` e `uploads/` inexistentes, renderizando placeholders `{{ c.* }}` não hidratados (498 ocorrências no total, concentradas nas telas de maior valor: Admin Dashboard, Checkout, Agenda, Curso). Toda comparação de fidelidade contra essa referência é inválida — está comparando a app real contra um template quebrado, com risco de correção na direção errada.
- **Success Criteria**:
  - [x] Critério objetivo definido e documentado: canvas com zero `{{ }}` e zero requisições a ativo ausente
  - [x] Decisão registrada: reexportar cada canvas como HTML estático auto-contido em `docs/design-system/reference/`
  - [x] Recaptura executada com 19 pares, HTTP 200, zero warnings e manifesto atualizado em `artifacts/epic14-fidelity/manifest.json`
- **Acceptance**: Estágio 0 da análise concluído — referência confiável estabelecida antes de qualquer estágio seguinte

---

## 🟡 MEDIUM

#### [FIDELITY-T2] Escrever specs públicas para registrar intenção (F-SPEC-01)
- **Source**: `docs/design/redesign/ANALYSIS-debito-prova-fidelidade.md` §5.3, §6 Estágio 2
- **Priority**: 🟡 MEDIUM
- **Effort**: Preenchimento do template validado em `docs/design/redesign/admin-specs/` — não é criação de método
- **Status**: ✅ DONE
- **Assignee**: `@ux-design-expert`
- **Sprint**: —
- **Description**: 9 rotas públicas não têm spec registrando divergências deliberadas vs. herdadas entre rota e canvas. Sem isso, toda diferença parece defeito e nenhuma rota é elevável a PASS.
- **Success Criteria**:
  - [x] 9 specs públicas escritas em `docs/design/redesign/public-specs/`
  - [x] `/cursos/[slug]` e checkout usam fixture real de catálogo na captura
  - [x] Seções "Adaptações" e "Divergências herdadas" preenchidas por rota
- **Acceptance**: F-SPEC-01 encerrado
- **Depende de**: [FIDELITY-T1]

#### [FIDELITY-T3] Exportar canvas isolado e escrever specs admin (F-SPEC-04)
- **Source**: `docs/design/redesign/ANALYSIS-debito-prova-fidelidade.md` §6 Estágio 2
- **Priority**: 🟡 MEDIUM
- **Effort**: Não estimado
- **Status**: ✅ DONE
- **Assignee**: `@ux-design-expert`
- **Sprint**: —
- **Description**: 10 telas admin estavam NOT_ASSESSABLE por referência inexistente (sem canvas isolado por tela).
- **Success Criteria**:
  - [x] 10 referências admin isoladas geradas em `docs/design-system/reference/admin-*.html`
  - [x] 10 specs correspondentes escritas em `docs/design/redesign/admin-specs/`
- **Acceptance**: F-SPEC-04 encerrado, telas saem de NOT_ASSESSABLE
- **Depende de**: [FIDELITY-T1]

#### [FIDELITY-T4] Implementar contrato de auth no harness de captura (F-AUTH-03)
- **Source**: `docs/design/redesign/ANALYSIS-debito-prova-fidelidade.md` §5.2, §6 Estágio 1
- **Priority**: 🟡 MEDIUM
- **Effort**: Baixo — reaproveitar mecanismo SSR já validado na Story 18.3
- **Status**: ✅ DONE
- **Assignee**: `@dev`
- **Sprint**: —
- **Description**: `capture-epic14-fidelity.mjs` declara `auth: "admin"` no alvo `admin-dashboard` mas não implementa sessão (sem `storageState`/cookie/login). O manifesto confirma que a captura documentou a tela de login, não o dashboard. **Atenção**: isso é diferente do F-AUTH-03 já resolvido na suíte de testes (`test:epic15:fidelity` 9/9) — são dois artefatos com o mesmo nome de finding.
- **Success Criteria**:
  - [x] Contrato de sessão implementado no harness via `POST /api/auth/session`, com cookies do BrowserContext
  - [x] 10 rotas admin destravadas para captura, todas HTTP 200 sem redirect
- **Acceptance**: F-AUTH-03 encerrado para o harness de captura
- **Depende de**: [FIDELITY-T1]

#### [FIDELITY-T5] Fixture de slug real com guarda anti-mock (F-CAP-02)
- **Source**: `docs/design/redesign/ANALYSIS-debito-prova-fidelidade.md` §5.1, §6 Estágio 1
- **Priority**: 🟡 MEDIUM
- **Effort**: Baixo — variáveis `EPIC14_FIDELITY_COURSE_PATH` e `EPIC14_FIDELITY_CHECKOUT_PATH` já estão implementadas; falta só o dado
- **Status**: ✅ DONE
- **Assignee**: `@dev`
- **Sprint**: —
- **Description**: `EPIC14_FIDELITY_COURSE_PATH` e `EPIC14_FIDELITY_CHECKOUT_PATH` precisam de um slug real do catálogo. **Ressalva crítica**: o slug NÃO pode vir de `src/lib/mock-public-data.ts` (fallback silencioso para dados mock já diagnosticado em `.aiox/handoffs/2026-07-13-architect-to-sm-mock-fallback-story.yaml`) — isso produziria uma prova de fidelidade a partir de dados fictícios.
- **Success Criteria**:
  - [x] Variáveis definidas com slug real do catálogo no ambiente E2E local
  - [x] Guarda explícita anti-mock adicionada ao harness; proxy `/cursos` é rejeitado
  - [x] Recaptura executada com detalhe e checkout HTTP 200
- **Acceptance**: F-CAP-02 encerrado
- **Depende de**: [FIDELITY-T1]

---

#### [FIDELITY-T7] Formalizar critério de PASS por sign-off manual por rota
- **Source**: `docs/design/redesign/ANALYSIS-debito-prova-fidelidade.md` §6 Estágio 3, ação 8 — decisão de produto tomada por `@po` em 2026-08-12
- **Priority**: 🟡 MEDIUM
- **Effort**: Não estimado — definir formato do registro de sign-off (ex.: checklist por rota em `docs/qa/`) e processo de aprovação
- **Status**: ✅ DONE
- **Assignee**: `@po`
- **Sprint**: —
- **Description**: O harness nunca afirma PASS sozinho (decisão de projeto correta), mas o estado terminal ficou indefinido. Decisão: sign-off manual documentado por rota — rastreável, não automatizável — em vez de diff perceptual com threshold (que exigiria calibração por região antes de ser confiável).
- **Success Criteria**:
  - [x] Formato definido em `docs/qa/fidelity-signoff.md`, com critério, revisor e manifesto
  - [x] Processo aplicado aos 19 pares com canvas; 7 rotas sem canvas permanecem exceções explícitas
- **Acceptance**: Estágio 3 pode declarar PASS pela primeira vez
- **Depende de**: [FIDELITY-T1], [FIDELITY-T2], [FIDELITY-T3], [FIDELITY-T4], [FIDELITY-T5]

---

## 🟢 LOW

#### [FIDELITY-T6] Resolver drift de tokens legados (F-TK-01)
- **Source**: `docs/design/redesign/ANALYSIS-debito-prova-fidelidade.md` §6 Estágio 3
- **Priority**: 🟢 LOW
- **Effort**: Não estimado
- **Status**: ✅ DONE
- **Assignee**: `@dev`
- **Sprint**: —
- **Description**: Tokens legados `--ea-*` em `src/styles/globals.css` geram risco difuso de drift.
- **Success Criteria**:
  - [x] Tokens renomeados para `--rh-*` e referências de runtime migradas; zero `--ea-*` em código executável
- **Acceptance**: F-TK-01 encerrado

---

## Nota de Decisão — @po

**2026-08-12 — Reclassificação de severidade F-CANVAS-05 (Média → Alta):** aceito a recomendação da análise de `@analyst`. A referência de canvas quebrada bloqueia todos os outros 5 findings e cria risco de correção na direção errada (aproximar a app de um template quebrado ao invés do inverso). Tratado como estágio 0 obrigatório, não como item de prioridade equivalente aos demais.

**2026-08-12 — Critério de PASS (Estágio 3, ação 8):** decidido sign-off manual documentado por rota, não diff perceptual automatizado — registrado como [FIDELITY-T7].

---

## Sequenciamento (herdado da análise)

```
Estágio 0 (FIDELITY-T1 — F-CANVAS-05)
   │  referência confiável
   ├──> Estágio 1 (FIDELITY-T4, FIDELITY-T5) ──> captura completa de 26 rotas
   │
   └──> Estágio 2 (FIDELITY-T2, FIDELITY-T3) ──> intenção registrada
                    │
                    └──> Estágio 3 (FIDELITY-T7 + 7 rotas em EXCEÇÃO + FIDELITY-T6) ──> PASS possível pela primeira vez
```

T4 e T5 (Estágio 1) são paralelizáveis com T2 e T3 (Estágio 2). Nenhum produz prova válida antes de T1.

**Riscos herdados da análise:**
- Recapturar antes de restaurar a referência (T1) gasta esforço em comparação inválida.
- A fixture de slug (T5) pode mascarar o débito de mock se a guarda não for implementada.
- O gate histórico `docs/qa/gates/epic15-complete-fidelity.yml` (100/100 admin) convive com a Story 18.2 (NOT_ASSESSABLE em 9/10 telas admin) — quem só consultar o gate terá impressão errada.
