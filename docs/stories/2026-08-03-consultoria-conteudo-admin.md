# Story: Gerenciar conteúdo público de consultoria no admin

## Status

Draft

## Origem e rastreabilidade

- **Requisito:** FR9 — conteúdo público relacionado à consultoria gerenciável no administrativo.
- **Backlog de origem:** `docs/STORY-BACKLOG.md` — item `1.2-F1`.
- **Dependências:** design system Trust Keith, autenticação SSR administrativa e read/write model de recursos administrativos.

## Story

**As a** administradora de conteúdo,
**I want** editar e publicar o conteúdo da página de consultoria,
**so that** a comunicação comercial não dependa de alteração de código.

## Escopo inicial

1. Persistir uma única configuração editorial de consultoria, com título, subtítulo, blocos de destaque e CTAs.
2. Exibir o conteúdo publicado em `/consultoria`; conteúdo não publicado não pode vazar para a rota pública.
3. Expor CRUD administrativo autorizado por sessão SSR, com preview e validação de campos obrigatórios.
4. Preservar o conteúdo estático atual como fallback apenas durante a migração de dados; após haver registro publicado, a fonte é o banco.

## Critérios de aceite

1. Um administrador autenticado consegue criar, editar, publicar e despublicar o conteúdo de consultoria.
2. A rota pública usa somente a versão publicada e mantém CTAs válidos para contato especializado.
3. Usuários anônimos, alunos e instrutores não podem criar, editar ou ler versões não publicadas.
4. Validação cliente e servidor rejeita payload desconhecido ou incompleto.
5. Há testes unitários, de rota e de RLS para leitura pública e mutação administrativa.
6. OpenAPI/documentação administrativa é atualizada se uma rota nova for introduzida.

## Decisões pendentes antes da implementação

- Definir a taxonomia final dos blocos editoriais e os papéis responsáveis por publicação.
- Confirmar se deve existir histórico/versionamento ou apenas a versão publicada atual.

## Quality gate

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:db`
- `npm run build`
- `npm run test:e2e:smoke`
