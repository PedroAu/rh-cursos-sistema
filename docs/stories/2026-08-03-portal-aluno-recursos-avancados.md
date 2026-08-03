# Story: Recursos avançados do portal do aluno

## Status

Draft

## Origem e rastreabilidade

- **Requisito:** FR12 — certificados, materiais, pagamentos e suporte são expansões pós-MVP.
- **Dependências:** FR11 entregue; sessão Supabase SSR, políticas RLS e modelo de inscrição existentes.

## Story

**As an** estudante autenticada,
**I want** acessar artefatos vinculados às minhas inscrições,
**so that** eu possa acompanhar certificados, materiais, pagamentos e solicitações de suporte de forma segura.

## Escopo inicial

1. Exibir certificado existente e seu arquivo somente ao aluno da inscrição correspondente.
2. Exibir histórico de pagamentos associado à inscrição, em modo somente leitura.
3. Publicar materiais por turma com acesso restrito a alunos com inscrição autorizada e ao instrutor responsável.
4. Permitir abertura e acompanhamento de solicitações de suporte por inscrição.

## Critérios de aceite

1. Nenhum aluno visualiza certificado, pagamento, material ou solicitação de outro aluno.
2. Certificados e pagamentos existentes são apresentados sem criar alegação de pagamento confirmado quando o dado estiver pendente.
3. Materiais e suporte têm schema, políticas RLS, validação server-side e estados vazios acessíveis.
4. Admin e instrutor possuem somente as permissões necessárias para os artefatos sob sua responsabilidade.
5. Testes de banco validam RLS e testes de integração validam os fluxos autenticados.
6. Não há fallback mock ou exposição de URL privada no browser.

## Decisões pendentes antes da implementação

- Regra de emissão de certificado e seu fluxo administrativo.
- Origem/armazenamento de arquivos de materiais e política de download.
- Semântica e SLA de suporte; esta story não pode integrar um provedor externo sem decisão explícita.

## Quality gate

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:db`
- `npm run build`
- `npm run test:e2e:smoke`
