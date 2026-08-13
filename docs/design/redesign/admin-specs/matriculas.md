# Spec de fidelidade — /admin/inscricoes

**ID:** FIDELITY-ADMIN-MATRICULAS
**Tela:** Matrículas
**Rota:** `/admin/inscricoes`
**Viewport de referência:** 1360 × 2400
**Canvas isolado:** `docs/design-system/reference/admin-matriculas.html`
**Fonte:** `docs/design-system/RH Cursos Admin Dashboard.dc.html`

## Intenção

Operação de matrículas e situação de pagamento.

## Regiões visuais e componentes

- Cabeçalho operacional; tabela de matrículas; status de pagamento; contexto read-only da turma e do aluno.
- O shell compartilhado mantém sidebar, logo, navegação ativa, contexto do usuário e área principal.
- Os loops de dados da tela devem renderizar linhas/cards reais no estado de referência; estados vazios só aparecem quando a consulta correspondente não retorna registros.

## Contrato de dados e auth

- A captura deve autenticar pelo contrato SSR `POST /api/auth/session` com a fixture admin do ambiente E2E.
- A rota precisa responder HTTP 200 depois da sessão; redirect para `/login` é falha de captura, não estado aceitável.
- O conteúdo visual do canvas é determinístico e não substitui a validação dos CRUDs reais.

## Adaptações deliberadas

- O canvas isolado expõe somente a tela `matriculas`; navegação lateral e chrome compartilhado permanecem visíveis para preservar contexto.
- Ações, tabelas e formulários da aplicação devem manter semântica, foco, feedback e autorização próprios do produto.
- Em viewport menor que 1024px, a navegação inferior substitui a sidebar e nenhum conteúdo pode gerar overflow horizontal.

## Divergências herdadas

- O export original agrupava dez telas sob condicionais do design-tool. A referência estática transforma cada condição em um canvas isolado versionado.
- Dados exibidos no canvas são fixtures de apresentação; a aplicação é comparada contra o estado real retornado pelo backend.

## Critérios de aceite

- [ ] Sessão admin confirmada por `/api/auth/session`.
- [ ] Rota responde HTTP 200 e não redireciona.
- [ ] Canvas isolado não contém placeholders ou requests de ativo ausente.
- [ ] Screenshot pareado e revisão visual registrados em `docs/qa/fidelity-signoff.md`.
