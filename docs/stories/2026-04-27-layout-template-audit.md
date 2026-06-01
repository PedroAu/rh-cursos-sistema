# Auditoria do Layout vs. Template Stitch

## Passo 1: Analise pagina por pagina

### Layout global
- Header ainda nao segue completamente o modelo: falta busca desktop no padrao do template, link In-Company e nome mais enxuto.
- Tokens existem no Tailwind, mas ainda nao estao expostos como variaveis globais simples para todo o projeto.
- Componentes compartilham estilos proximos, mas ainda ha muito uso direto de classes, o que dificulta manter o padrao.
- A linguagem visual precisa ser mais plana, executiva e funcional: menos paineis soltos e mais estrutura de plataforma.

### Home
- O hero esta mais proximo, mas ainda tem um card de proxima oportunidade que nao existe no modelo de Home principal.
- Falta uma faixa de filtros/chips de curriculo logo apos o hero, como no template.
- Secoes intermediarias estao mais genericas do que o modelo: o Stitch usa catalogo com imagem, categoria, duracao e CTA direto.
- Prova social e agenda devem ser mais compactas e alinhadas ao grid executivo.

### Catalogo de cursos
- A pagina atual usa filtros horizontais; o modelo usa sidebar fixa/coluna com filtros por categoria, nivel e faixa de preco.
- Falta widget lateral de proximas turmas.
- O topo do catalogo deve ter alternancia visual Grade/Calendario.
- Cards precisam ficar mais densos, com imagem, tag superior, metadados em grade e CTA textual.

### Pagina de vendas / checkout
- A pagina atual tem o video abaixo do texto; o template usa hero em duas colunas com video/imagem no primeiro viewport.
- Falta bento grid de objetivos de aprendizagem.
- O checkout atual esta em modal multi-step; o modelo possui bloco de inscricao mais premium/seguro. Como o fluxo existente funciona, manteremos modal, mas vamos padronizar visual e linguagem.
- Sidebar de preco precisa parecer mais com painel de enrollment: total, beneficios, seguranca e CTA.

### Login / area do aluno
- Login esta aceitavel, mas nao segue o visual do portal do aluno; precisa ser mais direto e institucional.
- Dashboard do aluno nao segue o modelo: falta sidebar compacta com CTA de acesso, cards de curso com imagem, progresso e acoes.
- Cards de metricas devem usar icones e dimensoes mais proximas do Stitch.

### In-Company & Leads
- O projeto nao tem rota publica In-Company, embora o template e o planejamento peçam essa pagina.
- Falta hero corporativo, bento de beneficios, bloco CRM e formulario detalhado de proposta.

### Blog / Sobre / Agenda
- Nao havia HTML especifico para todas estas paginas, mas devem herdar tokens, header, cards e formularios globais.
- Agenda ja tem calendario/lista, mas precisa ficar mais conectada ao padrao do catalogo.

## Passo 2: Lista de correcoes

1. Centralizar tokens globais em CSS variables e classes utilitarias simples.
2. Ajustar header/footer para o padrao Executive Academy com busca, In-Company e CTA de aluno.
3. Reestruturar Home: hero sem card lateral, estatisticas no hero, chips de curriculo e catalogo mais proximo do modelo.
4. Reestruturar Catalogo: sidebar de filtros, widget de turmas e grid de cards densos.
5. Reestruturar detalhe do curso e checkout: hero duas colunas, bento de objetivos e sidebar de enrollment.
6. Criar pagina In-Company com formulario de leads.
7. Ajustar portal do aluno para cards com imagem/progresso e sidebar mais fiel.
8. Rodar `npm run lint` apos cada bloco de alteracao e `npm run build` no fechamento.
