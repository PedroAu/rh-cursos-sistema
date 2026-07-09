# Design Docs Map

Este diretório mistura artefatos ativos, histórico e material de transição. Para evitar ambiguidade, a ordem oficial é esta:

## 1. Fonte de verdade de implementação

- `src/design-tokens/`
- `src/components/`
- `src/views/`

Se a dúvida é "o que o projeto realmente entrega hoje", esses caminhos vencem qualquer documento.

## 2. Fonte operacional de redesign

- `docs/design/redesign/HANDOFF.md`
- `docs/design/redesign/spec-*.md`
- `docs/design/redesign/wireframes/`

Esses arquivos definem intenção ativa de produto, UI e handoff.

## 3. Material histórico e referência visual

- `docs/design/redesign/reference/`

Essa pasta preserva canvases antigos, screenshots e apoio visual. Ela não é contrato de implementação.

## 4. Material legado e contexto

- `docs/design/DESIGN.md`
- `docs/design/DESIGN_REFACTOR_PLAN.md`
- `docs/design/TOKENS-TO-COMPONENTS.md`
- `docs/design/A11Y-FINDINGS.md`
- `docs/design/QUALITY-ENHANCEMENTS-REPORT.md`

Esses arquivos continuam úteis como contexto, auditoria e compatibilidade, mas não devem competir com o redesign ativo.

### Snapshots arquivados

- `docs/design/history/legacy-token-snapshots/`

Os snapshots antigos de tokens foram arquivados porque os artefatos ativos e serializados já vivem em `src/design-tokens/`.

## Regra prática

Quando houver conflito entre documentos:

1. `src/` vence
2. `docs/design/redesign/` vence material legado
3. `docs/design/redesign/reference/` nunca vence fonte operacional
