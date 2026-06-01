# Plano de Aplicacao: Apple Design/HIG no Site RH Cursos

## Objetivo

Planejar a aplicacao das orientacoes atuais da Apple Design e da Human
Interface Guidelines (HIG) no runtime Next.js ativo do site RH Cursos, sem
alterar a identidade institucional nem introduzir comportamentos sem requisito
de produto.

Este documento e um plano de trabalho. Nenhuma mudanca visual adicional foi
implementada como parte desta analise.

## Escopo da Leitura Oficial

Fontes oficiais consultadas em 26/05/2026:

- [Apple Design](https://developer.apple.com/design/): pagina integral indicada
  pelo solicitante; apresenta a direcao atual, Apple Design Resources, HIG,
  Liquid Glass, Icon Composer e SF Symbols 7.
- [Design Pathway](https://developer.apple.com/design/get-started/): estrutura
  o estudo em foundations, patterns, components, inputs e technologies.
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/):
  principios centrais atuais: hierarchy, harmony e consistency.
- [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility):
  contraste, texto ampliavel, rotulos, controles confortaveis, teclado e
  reducao de movimento.
- [Color](https://developer.apple.com/design/human-interface-guidelines/foundations/color/):
  cores semanticas, contraste, variacoes de aparencia e uso inclusivo.
- [Materials](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/materials/):
  separacao entre camada de conteudo e camada funcional; Liquid Glass deve ser
  usado de modo contido em controles e navegacao.
- [Typography](https://developer.apple.com/design/human-interface-guidelines/typography):
  legibilidade, hierarquia tipografica, poucos tipos e adaptacao de tamanho.
- [Layout](https://developer.apple.com/design/human-interface-guidelines/layout):
  composicao adaptavel, relacao previsivel entre navegacao e conteudo e
  respeito a areas seguras.
- [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons):
  alvo minimo confortavel, estado pressionado, acao primaria clara e rotulos
  compreensiveis.
- [Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields/):
  labels persistentes, validacao util e entrada adequada ao tipo de dado.
- [Searching](https://developer.apple.com/design/human-interface-guidelines/searching)
  e [Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields):
  ponto de busca identificavel, escopo claro e resultados responsivos.
- [Loading](https://developer.apple.com/design/human-interface-guidelines/loading)
  e [Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators/):
  retorno imediato, skeleton/progresso adequado e status compreensivel.
- [Writing](https://developer.apple.com/design/human-interface-guidelines/writing):
  rotulos acionaveis, campos identificados e erros proximos ao problema.
- [Charts](https://developer.apple.com/design/human-interface-guidelines/charts):
  dados nao diferenciados apenas por cor.

## Interpretacao para Este Produto Web

A HIG e direcionada a plataformas Apple, enquanto este projeto e um site
responsivo. A aplicacao correta aqui e adotar os principios verificaveis da HIG
em HTML/CSS/React, nao simular literalmente uma aplicacao iOS:

| Principio Apple | Aplicacao no site |
| --- | --- |
| Hierarchy | Navegacao e controles devem se distinguir do conteudo; uma acao primaria por bloco de decisao. |
| Harmony | Raios, espacamento, tipografia e icones consistentes em desktop e mobile, respeitando a marca existente. |
| Consistency | Componentes base e tokens devem reger todas as paginas publicas e portais. |
| Accessibility | WCAG AA como minimo verificavel, teclado completo, labels, estados e movimento reduzido. |
| Materials / Liquid Glass | Translucencia reservada para camada funcional, como header e superficies transitorias; cards de conteudo devem permanecer legiveis e estaveis. |
| Clear feedback | Busca, formularios, checkout e operacoes administrativas devem indicar carregamento, erro e conclusao sem depender apenas de toast ou cor. |

## Auditoria do Estado Atual

### Fundacoes ja aproveitaveis

| Item | Evidencia atual | Valor para o plano |
| --- | --- | --- |
| Tokens basicos | `src/styles/globals.css` e `tailwind.config.ts` definem cores, superficies, sombras, radius e fontes. | Evoluir os tokens existentes em vez de substituir a marca. |
| Controle tocavel | `src/components/ui/button.tsx` usa altura minima de 44 px. | Ja atende a referencia Apple para alvos principais em telas touch. |
| Foco e salto de conteudo | `:focus-visible` e `.skip-link` existem em `src/styles/globals.css` e no layout publico. | Base para auditoria completa por teclado. |
| Movimento reduzido CSS | Existe media query `prefers-reduced-motion` global. | Precisa ser estendida aos movimentos produzidos por JavaScript. |
| Carregamento | `LoadingBlocks` oferece skeleton no catalogo e agenda. | Padrao inicial consistente com retorno imediato recomendado. |

### Lacunas encontradas no runtime ativo

| Prioridade | Achado verificavel | Arquivos afetados | Diretriz relacionada |
| --- | --- | --- | --- |
| Alta | Formularios usam placeholder como identificacao persistente dos campos. | `src/views/public/Contact.tsx`, `InCompany.tsx`, `Login.tsx`, `src/components/checkout/checkout-modal.tsx`, `src/views/admin/AdminResourcePage.tsx` | Text fields, Writing, Accessibility |
| Alta | Icon buttons de editar/excluir e baixar material nao possuem nome acessivel explicito. | `src/components/admin/data-table.tsx`, `src/views/student/StudentDashboard.tsx` | Accessibility, Buttons |
| Alta | Ha texto funcional em `10px`, `11px` e `12px`, inclusive badges e metadados. | `src/components/ui/badge.tsx`, cards, agenda e paginas publicas | Typography, Accessibility |
| Alta | Contraste/dark/increase contrast ainda nao possuem matriz automatizada; o tema declara somente `color-scheme: light`. | `src/styles/globals.css`, `tailwind.config.ts` | Color, Accessibility |
| Media | A classe `apple-material` aparece em conteudo promocional, alem do header; o HIG atual recomenda material tipo glass principalmente na camada funcional. | `src/views/public/InCompany.tsx`, `Home.tsx`, `src/components/layout/public-layout.tsx` | Materials, Hierarchy |
| Media | Animacoes Framer Motion aplicam deslocamento/escala, sem uso explicito da preferencia de movimento reduzido do usuario. | `src/components/common/section-title.tsx`, `src/components/courses/course-card.tsx`, `src/views/public/Home.tsx` | Accessibility, Motion |
| Media | A busca do header parece visual, sem fluxo unico de resultado, enquanto catalogo, agenda, blog e admin repetem experiencias locais. | `src/components/layout/public-layout.tsx`, `src/components/common/search-input.tsx`, views de busca | Searching, Consistency |
| Media | Erros de formulario sao exibidos principalmente em toasts, sem mensagem associada ao campo invalidado. | formularios publicos, checkout e admin | Writing, Text fields, Accessibility |
| Media | Sete imagens usam `<img>` no runtime Next, gerando warnings e sem tratamento central de tamanho/carregamento. | cards, detalhe, In Company, login e dashboard aluno | Loading, Layout |
| Media | Graficos administrativos necessitam alternativa textual e diferenciais alem de cor. | `src/views/admin/AdminDashboard.tsx` | Charts, Accessibility |

## Plano de Aplicacao

### Fase 0 - Baseline e Gates de Acessibilidade

**Objetivo:** transformar principios em criterios mensuraveis antes de alterar
o visual.

**Acoes:**

1. Registrar screenshots de referencia das rotas `/`, `/cursos`, `/agenda`,
   `/blog`, `/in-company`, `/contato`, `/login`, `/aluno`, `/instrutor` e
   `/admin` em viewport mobile e desktop.
2. Incorporar verificacao automatizada de acessibilidade para rotas criticas,
   cobrindo nome acessivel, landmarks, dialogos e campos.
3. Criar verificacao de contraste WCAG AA para tokens e combinacoes usadas em
   texto, botoes, badges, header transluscido e paineis.
4. Acrescentar cenarios Playwright de teclado: skip link, menu mobile, busca,
   checkout, dialogo de atendimento e CRUD admin.
5. Definir criterio visual para `prefers-reduced-motion: reduce` e alto
   contraste antes de aprovar componentes.

**Arquivos-alvo:** `tests/`, `playwright.config.ts`, `src/styles/globals.css`,
`tailwind.config.ts`.

**Aceite:** rotas criticas sem falhas automatizadas de acessibilidade de alta
gravidade; navegacao essencial concluida apenas por teclado; relatorio de
contraste registrado.

### Fase 1 - Tokens, Tipografia, Cor e Superficies

**Objetivo:** consolidar fundacoes coerentes para que paginas nao precisem
resolver design individualmente.

**Acoes:**

1. Organizar tokens semanticos para `label`, `secondary-label`, `separator`,
   `surface`, `surface-raised`, `control`, `accent`, `success`, `warning` e
   `danger`, com combinacoes contrastadas documentadas.
2. Definir escala tipografica responsiva; elevar texto informativo atualmente
   em `10px` ou `11px`, preservando hierarquia com peso e espacamento em vez de
   miniaturizacao.
3. Reduzir tamanhos hardcoded nas views, migrando titulos, labels, metadata e
   badges para variantes de componente/tokens.
4. Formalizar a camada material: navegacao fixa, sheets, dialogs e menus podem
   usar translucencia controlada; conteudo e cards devem usar superficies
   solidas ou materiais padrao legiveis.
5. Preparar variantes opcionais de maior contraste e escura antes de declarar
   suporte visual alem do modo claro atual.

**Arquivos-alvo:** `src/styles/globals.css`, `tailwind.config.ts`,
`src/components/ui/badge.tsx`, `src/components/ui/card.tsx`,
`src/components/common/section-title.tsx`.

**Aceite:** nenhum texto funcional abaixo do minimo definido; todas as
combinacoes textuais principais passam WCAG AA; uso de material documentado
por camada.

### Fase 2 - Atomos e Moleculas Interativas

**Objetivo:** aplicar consistencia e acessibilidade uma vez nos componentes que
alimentam todas as telas.

**Acoes:**

1. Evoluir `Button` com estados padronizados de hover, pressed, focus,
   disabled e loading; limitar destaque proeminente a acao primaria do
   contexto.
2. Criar `FormField` reutilizavel com `label`, hint opcional, indicador de
   obrigatoriedade, erro inline e conexoes `id`, `aria-describedby` e
   `aria-invalid`.
3. Aplicar o campo composto a `Input`, `Textarea` e `Select`, preservando
   placeholders apenas como exemplo de preenchimento.
4. Completar nomes acessiveis para todos os icon buttons e assegurar alvo de
   44 px nos controles interativos customizados.
5. Padronizar `Dialog` e `Sheet`: descricao quando necessaria, foco inicial,
   fechamento por teclado, acao primaria e cancelamento claros.
6. Padronizar feedback: toast como confirmacao complementar, nunca como unico
   local de erro recuperavel.

**Arquivos-alvo:** `src/components/ui/button.tsx`, `input.tsx`,
`textarea.tsx`, `select.tsx`, `dialog.tsx`, `sheet.tsx`,
`src/components/admin/data-table.tsx`.

**Aceite:** controles compartilhados possuem estados e semantica documentados;
formularios reportam erros junto aos campos; botoes somente com icone possuem
nome acessivel.

### Fase 3 - Navegacao, Busca, Carregamento e Movimento

**Objetivo:** reduzir esforco cognitivo nos fluxos de descoberta e decisao.

**Acoes:**

1. Manter o header como camada funcional transluscida, validando contraste
   sobre fundos da Home e das paginas internas; simplificar ou remover
   `apple-material` de blocos de conteudo.
2. Definir comportamento da busca global do header: encaminhar para catalogo
   com termo aplicado ou removê-la ate existir uma acao real.
3. Unificar comportamento de busca local em Cursos, Agenda, Blog e Admin:
   placeholder especifico, botao limpar, contagem de resultados, empty state e
   filtro anunciado por tecnologias assistivas.
4. Usar skeleton para conteudo em carregamento e indicador no botao para
   submissao de formulario/inscricao; trocar por progresso determinado somente
   quando houver progresso real.
5. Substituir animacoes de deslocamento/escala por fade ou estado estatico
   quando `prefers-reduced-motion` estiver ativo, inclusive em Framer Motion.
6. Migrar imagens relevantes para `next/image`, definindo dimensoes,
   prioridade apenas no hero e alternativas textuais corretas.

**Arquivos-alvo:** `src/components/layout/public-layout.tsx`,
`src/components/common/search-input.tsx`, `loading-blocks.tsx`,
`src/components/courses/course-card.tsx`, `src/views/public/Home.tsx`,
`src/views/public/InCompany.tsx`, imagens apontadas pelo lint.

**Aceite:** busca sempre inicia uma operacao real e informa resultado; nenhum
movimento essencial permanece ativo na preferencia reduzida; warnings atuais
de `<img>` eliminados.

### Fase 4 - Aplicacao por Fluxo e Pagina

**Objetivo:** aplicar os componentes consolidados a jornadas completas, sem
refatoracao dispersa.

| Ordem | Jornada | Aplicacao principal | Rotas |
| --- | --- | --- | --- |
| 1 | Descoberta | hero, header, cards, filtros, busca, estados vazios e carregamento | `/`, `/cursos`, `/agenda`, `/blog` |
| 2 | Conversao | hierarquia da decisao, formulario rotulado, loading, erro inline e confirmacao | `/cursos/[slug]`, checkout, `/inscricao-confirmada`, `/contato`, `/in-company` |
| 3 | Acesso | formulario de autenticacao rotulado, erros claros e escolha de papel previsivel | `/login` |
| 4 | Portais | navegacao adaptavel, dados escaneaveis, acoes nomeadas e progressos acessiveis | `/aluno`, `/instrutor`, `/admin/*` |
| 5 | Conteudo institucional | leitura confortavel e consistencia visual com as demais superficies | `/sobre`, artigos do blog |

**Aceite:** cada jornada passa por revisao desktop/mobile, teclado, leitor de
tela basico, movimento reduzido e contraste antes da proxima jornada.

### Fase 5 - Qualidade Continua e Documentacao

**Objetivo:** evitar regressao para estilos avulsos ou acessibilidade parcial.

**Acoes:**

1. Documentar tokens e componentes com exemplos de uso aprovado e usos a
   evitar, especialmente materiais, acoes primarias, badges e erros.
2. Manter testes de rotas, adicionar checks a11y nos fluxos alterados e
   snapshots visuais de pontos criticos.
3. Auditar novos componentes quanto a texto minimo, contraste, labels, teclado,
   movimento reduzido, estados de carregamento e tema.
4. Executar a cada entrega `npm run lint`, `npm run typecheck`, `npm test` e
   build, mantendo a File List e os criterios de aceite da story atualizados.

**Aceite:** checklist de design/acessibilidade integra o fluxo de review e
nenhuma alteracao de UI e concluida sem gates automatizados e revisao visual.

## Ordem Recomendada de Execucao

| Incremento | Entrega | Dependencia | Risco mitigado |
| --- | --- | --- | --- |
| P0 | Baseline, contraste e testes de teclado/a11y | Nenhuma | Mudanca visual sem prova de melhoria |
| P1 | Tokens, tipografia e regras de material | P0 | Inconsistencia global e baixa legibilidade |
| P2 | Controles e formularios base | P1 | Erros de acessibilidade repetidos em varias paginas |
| P3 | Navegacao, busca, loading, motion e imagens | P1-P2 | Descoberta confusa e desconforto visual |
| P4 | Jornadas pagina a pagina | P2-P3 | Regressao de fluxo durante migracao |
| P5 | Documentacao e governanca continua | P0-P4 | Divergencia futura do sistema |

## Checklist de Pronto para Implementar

- [ ] Aprovar o escopo de aparencia: manter modo claro somente ou incluir
      variante escura/alto contraste no ciclo de implementacao.
- [ ] Definir se a busca do header sera conectada ao catalogo ou removida ate
      existir comportamento real.
- [ ] Separar as fases acima em stories executaveis, com aceite por jornada.
- [ ] Capturar baseline visual e de acessibilidade antes de alterar tokens.
- [ ] Executar primeiro os componentes compartilhados e depois migrar paginas.

## Fora de Escopo do Plano

- Converter o site em aplicacao nativa Apple.
- Copiar aparencia de iOS sem justificativa funcional para web.
- Usar SF Symbols ou fontes proprietarias sem confirmar licenca e contexto de
  distribuicao no produto web.
- Alterar regras de negocio, integracao Supabase ou conteudo editorial.
