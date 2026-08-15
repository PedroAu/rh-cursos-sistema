# Spec de fidelidade — /

**ID:** FIDELITY-PUBLIC-HOME
**Rota:** `/`
**Viewport de referência:** 1180 × 2400
**Canvas fonte:** `docs/design-system/RH Cursos Home.dc.html`
**Referência autocontida:** `docs/design-system/reference/home.html`

## Intenção

Conteúdo institucional, trilhas e próximas turmas públicas.

## Contrato de dados

- Renderizar dados do catálogo/SSR/API do ambiente de execução; nenhum dado de `src/lib/mock-public-data.ts` pode ser usado como evidência de fidelidade.
- Para esta rota estática, a captura não depende das fixtures dinâmicas de curso ou checkout; a fidelidade de dados deve vir do contrato real da própria rota.
- A referência visual é estática e autocontida; a rota de produção continua sendo validada contra o contrato SSR/API real, não contra os dados do canvas.
- Estados de carregamento, vazio e erro permanecem cobertos pelos testes funcionais existentes.

## Adaptações deliberadas

- O canvas é uma referência visual estática e não define navegação, autenticação, validação ou integração.
- Componentes interativos da aplicação podem ter semântica, foco, responsividade e mensagens de erro diferentes quando isso é exigido por acessibilidade ou pelo contrato funcional.
- O viewport de comparação é fixo; a responsividade é validada separadamente pelos testes Playwright de UI e acessibilidade.

## Divergências herdadas

- A referência foi gerada a partir do export versionado e hidratada com dados determinísticos de apresentação.
- O export não contém o runtime do design-tool; a versão em `reference/` remove essa dependência, mantém o conteúdo visual e registra a origem acima.

## Critérios de aceite

- [x] Rota responde HTTP 200 no ambiente de captura.
- [x] Referência não contém `{{ ... }}`, `support.js`, ativos hashados ou requests de ativo ausente.
- [x] Screenshot da rota e do canvas é produzido pelo harness no mesmo viewport.
- [x] Revisão visual manual registrada em `docs/qa/fidelity-signoff.md`.
