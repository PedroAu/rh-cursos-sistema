# Story EP-13.3: Swagger UI/ReDoc e gate anti-drift

## Status
Approved

## Executor Assignment

executor: "@devops"  
quality_gate: "@architect"  
quality_gate_tools:
- `npm run lint`
- docs/smoke validation
- manual UI check

## Épica
EP-13 — API Documentation  
Spec: `docs/epics/epic-13-api-documentation.md`

## Story

**As a** desenvolvedora integrando com a plataforma,  
**I want** uma UI navegável de documentação e um gate mínimo contra drift,  
**so that** o contrato publicado continue utilizável ao longo do tempo.

## Contexto

Mesmo com a spec pronta, a épica só fecha quando a documentação é navegável e o time tem um mecanismo mínimo para perceber divergência entre código e contrato.

## Acceptance Criteria

- [ ] **AC1** — Swagger UI ou ReDoc roda a partir da spec versionada
- [ ] **AC2** — O README/docs apontam para a UI de documentação
- [ ] **AC3** — Existe validação mínima para detectar drift óbvio entre código e spec
- [ ] **AC4** — A estratégia de manutenção da doc fica registrada

## Scope

### In Scope
- Swagger UI/ReDoc
- Links a partir do README/docs
- Gate mínimo anti-drift

### Out of Scope
- Portal externo completo
- SDK client

## Tasks / Subtasks

- [ ] Publicar a UI da spec
- [ ] Referenciar no README/docs
- [ ] Definir verificação mínima no fluxo local/CI

## Dependencies

- Story EP-13.2
- `README.md`
- `docs/api/README.md`

## Testing

- smoke da UI de docs
- validação do gate definido

## File List

- `README.md`
- `docs/api/README.md`
- `docs/api/` (assets/UI da spec)
- `docs/stories/2026-06-24-epic13-story3-swagger-ui-drift-gate.md`

## Change Log

- 2026-06-24 — @po (Pax) — Story refinada para fechar o último AC de D-4.2: documentação navegável e governada.
