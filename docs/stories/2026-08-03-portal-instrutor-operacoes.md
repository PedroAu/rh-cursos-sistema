# Story: Operações autorizadas do portal do instrutor

## Status

Draft

## Origem e rastreabilidade

- **Requisito:** FR14 — presença, conclusão, materiais e comunicação são expansões pós-MVP.
- **Dependências:** FR13 entregue; vínculos instrutor/turma, inscrição e RLS vigentes.

## Story

**As an** instrutor autenticado,
**I want** executar operações somente nas turmas que me foram atribuídas,
**so that** eu acompanhe presença, conclusão, materiais e comunicação sem acessar dados de outras turmas.

## Escopo inicial

1. Registrar presença dos alunos vinculados à turma do instrutor.
2. Registrar conclusão de turma com autorização e trilha de auditoria.
3. Publicar materiais autorizados para a própria turma.
4. Criar comunicação interna vinculada à turma, sem expor contatos fora da relação autorizada.

## Critérios de aceite

1. Instrutor só lê e altera turmas cujo `instrutor_id` corresponde ao seu perfil autenticado.
2. Presença e conclusão possuem schema, RLS e auditoria de autor/data.
3. Materiais publicados respeitam o mesmo vínculo turma–instrutor–aluno.
4. Comunicação não permite envio para usuários fora da turma e não depende de provedor externo sem contrato explícito.
5. Admin mantém capacidade de correção operacional sem burlar auditoria.
6. Testes de banco provam isolamento entre instrutores, alunos e administradores; E2E cobre o fluxo principal.

## Decisões pendentes antes da implementação

- Modelo de presença por dia/aula e mínimo para conclusão.
- Política de mensagens, retenção e canal de entrega.
- Relação entre conclusão de turma, presença e emissão de certificado.

## Quality gate

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:db`
- `npm run build`
- `npm run test:e2e:smoke`
