# Análise — Débito de Prova de Fidelidade (specs, canvas, fixtures)

**Tipo:** Análise de débito técnico (trilha derivada de brainstorming)
**Autor:** @analyst (Atlas)
**Data:** 2026-08-12
**Branch:** `codex/hotfixes-no-payments`
**Fontes:** `AUDIT-epic18-story2-fidelity.md` (SHA `b86d07e`, 2026-07-19), Story 18.3 (`docs/stories/2026-07-19-epic18-story3-restaurar-gates.md`), `npm run test:epic15:fidelity`, `MATRIX-rota-canvas-spec.md`, `artifacts/epic14-fidelity/manifest.json`, `scripts/capture-epic14-fidelity.mjs`, `docs/qa/fidelity-signoff.md`, `docs/qa/fidelity-signoff.json`, `docs/design-system/*.dc.html`

---

## 1. Pergunta desta análise

A auditoria da Story 18.2 fechou com **0 PASS em 26 rotas**. Esta análise responde: *o que exatamente impede uma rota de chegar a PASS, em que ordem esses bloqueios precisam cair, e quanto custa cada um?*

---

## 2. Baseline de cobertura

| Grupo | Rotas | COBERTO\* (CONCERNS) | NOT_ASSESSABLE | EXCEÇÃO | PASS |
|---|---:|---:|---:|---:|---:|
| Público (Épica 14) | 16 | 9 | 0 | 7 | **0** |
| Admin (Épica 15) | 10 | 1 | 9 | 0 | **0** |
| **Total** | **26** | **10** | **9** | **7** | **0** |

O manifesto atual (`generatedAt` 2026-07-19) registra `{ PASS: 0, CONCERNS: 10, FAIL: 0, NOT_ASSESSABLE: 0 }` para os 10 alvos capturados. **Esse manifesto tem 24 dias e foi gerado em outro SHA** — a branch avançou desde então, incluindo mudanças em `app/agenda/page.tsx`. Qualquer decisão baseada nele precisa de recaptura antes.

---

## 3. Os seis findings, reagrupados por natureza

A auditoria listou os findings em ordem de descoberta. Reagrupados por **o que cada um bloqueia**, o quadro fica mais claro:

| Finding | Natureza | Bloqueia | Severidade declarada | Owner |
|---|---|---|---|---|
| **F-CANVAS-05** | Referência degradada | **Todas as 10 comparações** | Média | `@po` |
| **F-SPEC-01** | Intenção não registrada | Elevação a PASS nas 9 rotas públicas | Média | `@po` |
| **F-SPEC-04** | Referência inexistente | 9 telas admin (NOT_ASSESSABLE) | Média | `@po` |
| **F-AUTH-03** | Captura impossível | 10 rotas admin | Média | Story 18.3 |
| **F-CAP-02** | Captura por proxy | `/cursos/[slug]` e checkout | Baixa | `@po` |
| **F-TK-01** | Drift de token | Risco difuso | Baixa | `@po` |

---

## 4. Achado principal — a prioridade está invertida

**F-CANVAS-05 está classificado como severidade Média, mas é pré-requisito de todos os outros.**

O finding registra que os canvases renderizam sem `support.js`, sem o logo em `uploads/logoHorizontal_800X600.png` e com placeholders `{{ c.* }}` não hidratados. A verificação de hoje confirma e quantifica:

| Canvas | Placeholders | Únicos | Refs a `uploads/` |
|---|---:|---:|---:|
| `RH Cursos Admin Dashboard.dc.html` | **192** | 129 | 1 |
| `RH Cursos Checkout.dc.html` | **101** | 78 | 2 |
| `Agenda export.dc.html` | **77** | 69 | 2 |
| `RH Cursos Curso.dc.html` | **52** | 46 | 2 |
| `RH Cursos Blog.dc.html` | 25 | 24 | 2 |
| `RH Cursos Catálogo.dc.html` | 21 | 20 | 2 |
| `RH Cursos Login.dc.html` | 11 | 10 | 1 |
| `RH Cursos In-company.dc.html` | 7 | 7 | 2 |
| `RH Cursos Quem Somos.dc.html` | 7 | 7 | 2 |
| `RH Cursos Home.dc.html` | 5 | 5 | 2 |
| `RH Home Sections.dc.html` | 0 | 0 | 0 |
| **Total** | **498** | — | — |

Confirmado por inspeção direta em `docs/design-system/`: **não existe `support.js`** e **não existe o diretório `uploads/`**. Todos os canvases exceto `RH Home Sections` referenciam ativos ausentes.

Três consequências:

**Primeira: a referência não representa o design.** O canvas da Home renderiza literalmente `{{ c.title }}`, `{{ c.day }}`, `{{ c.month }}` e `{{ c.mode }}` onde deveriam aparecer cards de curso, e sem logo no cabeçalho. O screenshot de rota mostra a página real com dados reais. Um sign-off visual comparando os dois não está avaliando fidelidade — está comparando uma página funcional contra um template quebrado.

**Segunda: a degradação é inversamente proporcional ao valor da tela.** Os quatro canvases mais degradados são exatamente Admin Dashboard (192), Checkout (101), Agenda (77) e Curso (52) — as telas de maior valor operacional e comercial. O canvas mais limpo é a Home, com 5 placeholders, que é justamente o que dá a impressão de que a referência está saudável.

**Terceira: há risco de correção na direção errada.** Enquanto a referência estiver degradada, existe a possibilidade concreta de alguém "corrigir" a aplicação para se aproximar de um canvas quebrado. Esse é o risco que justifica tratar F-CANVAS-05 como bloqueio, e não como item de mesma prioridade dos demais.

**Recomendação:** reclassificar F-CANVAS-05 para severidade **Alta** e tratá-lo como estágio 0 obrigatório.

### 4.1 Evidência reproduzível da contagem

Os números acima foram calculados sobre o estado `HEAD` `0ae818a` da branch
`codex/hotfixes-no-payments`, antes da geração das referências autocontidas. A análise
pode ser repetida com os mesmos artefatos e comandos:

```bash
git rev-parse HEAD
rg -o '\{\{[^}]+\}\}' docs/design-system/*.dc.html | sort | uniq -c
rg -o '\{\{[^}]+\}\}' docs/design-system/*.dc.html | sort -u | wc -l
rg -o 'support\.js|_ds/|uploads/' docs/design-system/*.dc.html | sort | uniq -c
test ! -e docs/design-system/support.js
test ! -e docs/design-system/uploads
npm run fidelity:references
```

As contagens da tabela são calculadas por arquivo: placeholders por ocorrência de
`{{ ... }}`, expressões únicas pela saída deduplicada (`sort -u`) e ativos ausentes pela
ocorrência de `uploads/`. O comando agregado acima reproduz os totais e preserva a
evidência dos tokens `support.js`, `_ds/` e `uploads/`; o gerador então hidrata os
placeholders, incorpora a logo como data URI, remove o runtime do design-tool e falha
se restarem placeholders, ativos relativos, handlers inline, CSS malformado ou estados
semânticos inválidos. A recaptura produz o manifesto em
`artifacts/epic14-fidelity/manifest.json`, que é a evidência corrente.

---

## 5. Achados novos desta análise

### 5.1 F-CAP-02 já tem a ferramenta pronta — falta só o dado

A remediação sugerida na auditoria é "prover fixture de slug (`EPIC14_FIDELITY_COURSE_PATH` / `_CHECKOUT_PATH`)". A leitura de `scripts/capture-epic14-fidelity.mjs` mostra que **essas variáveis já estão implementadas**:

```
linha 133:  routePath: process.env.EPIC14_FIDELITY_COURSE_PATH ?? "/cursos"
linha 144:  routePath: process.env.EPIC14_FIDELITY_CHECKOUT_PATH ?? "/cursos"
```

O harness também já aceita `EPIC14_FIDELITY_BASE_URL` e `EPIC14_FIDELITY_OUT_DIR`. Ou seja, F-CAP-02 não exige desenvolvimento: exige **definir duas variáveis apontando para um slug válido** e recapturar.

**Ressalva crítica:** o slug escolhido **não pode vir de `src/lib/mock-public-data.ts`**. Aquele arquivo contém 9 cursos fictícios e é o centro de um débito já diagnosticado — o fallback silencioso para dados mock em caminho de produção (ver `.aiox/handoffs/2026-07-13-architect-to-sm-mock-fallback-story.yaml`). Usar um slug mock como fixture produziria uma captura de página renderizada a partir de dados fictícios, o que transforma a prova de fidelidade em prova de nada. A fixture precisa ser um slug real do catálogo, com verificação explícita de que a rota não caiu em fallback.

### 5.2 F-AUTH-03 foi resolvido na suíte de testes, não no harness de captura

A Story 18.3 migrou os harnesses da Épica 15 para Supabase SSR e fechou com `test:epic15:fidelity` PASS 9/9. Isso pode dar a impressão de que F-AUTH-03 está encerrado.

Não está, para o propósito desta trilha. O `capture-epic14-fidelity.mjs` declara `auth: "admin"` no alvo `admin-dashboard`, mas **não implementa nenhum mecanismo de sessão** — não há `storageState`, cookie ou fluxo de login no script. O manifesto confirma: o alvo `admin-dashboard` capturou `/admin` com redirect para `/login?status=required`, e a captura documenta a tela de login, não o dashboard.

Ou seja, F-AUTH-03 continua bloqueando as 10 rotas admin **no harness de captura**, ainda que a suíte funcional já esteja verde. São dois artefatos diferentes com o mesmo nome de finding.

### 5.3 A única spec existente é um template pronto

`spec-admin-dashboard.md` tem 151 linhas e nove seções bem definidas: Origem, componentes por região, contrato de dados (`sc-for` / `{{ }}`), Responsivo, **Adaptações (divergências deliberadas do canvas)** e **Divergências herdadas (não corrigir sem validação de produto)**.

As duas últimas seções são o que efetivamente destrava PASS: elas registram, por escrito, quais diferenças entre rota e canvas são intencionais. Sem esse registro, toda diferença parece defeito, e é por isso que o finding F-SPEC-01 afirma que a fidelidade não é elevável a PASS sem spec.

O custo de escrever as 9 specs públicas é, portanto, um custo de preenchimento de template já validado — não de criação de método.

---

## 6. Sequenciamento proposto

### Estágio 0 — Restaurar a referência (bloqueante)

Sem isto, nenhum estágio seguinte produz prova confiável.

1. A decisão adotada foi reexportar cada canvas como HTML estático auto-contido com os dados já hidratados; não há dependência de `support.js` ou `uploads/` no artefato executável.
2. O critério objetivo é validado pelo gerador: zero ocorrências de `{{ }}`, zero requisições a ativo ausente e zero declarações HTML/CSS inválidas.
3. A recaptura corrente é registrada em `artifacts/epic14-fidelity/manifest.json`; o manifesto histórico de 2026-07-19 permanece apenas como baseline de comparação.

A segunda opção (export estático hidratado) é preferível: elimina a dependência do design-tool e torna o canvas um artefato reprodutível no CI.

### Estágio 1 — Corrigir a captura (esforço baixo, ganho imediato)

4. Definir `EPIC14_FIDELITY_COURSE_PATH` e `EPIC14_FIDELITY_CHECKOUT_PATH` com slug real do catálogo, com guarda que falhe se a rota renderizar dados de mock. Encerra F-CAP-02.
5. Implementar contrato de sessão no `capture-epic14-fidelity.mjs`, reaproveitando o mecanismo SSR que a Story 18.3 já validou na suíte. Encerra F-AUTH-03 para captura e destrava 10 rotas admin.

### Estágio 2 — Registrar a intenção

6. Escrever as 9 specs públicas usando o template gerado, priorizando `/cursos/[slug]` e checkout, que sustentam a receita. Encerra F-SPEC-01.
7. Exportar canvas isolado por tela admin e escrever as 10 specs correspondentes, incluindo `/admin`. Encerra F-SPEC-04 e tira as telas de NOT_ASSESSABLE.

### Estágio 3 — Definir e aplicar o critério de PASS

8. Critério encerrado por **FIDELITY-T7**: `docs/qa/fidelity-signoff.md` define sign-off manual documentado por rota como critério terminal; o harness só aplica o registro quando a evidência corresponde ao digest do canvas. Diff perceptual automatizado não faz parte do gate, porque exigiria calibração por região antes de ser confiável.
9. Cobrir as 7 rotas em EXCEÇÃO, priorizando as do funil comercial (`/contato`, `/falar-com-especialista`, `/inscricao-confirmada`).
10. Resolver F-TK-01 consolidando ou removendo os tokens legados `--ea-*` de `src/styles/globals.css`.

---

## 7. Dependências entre estágios

```
Estágio 0 (F-CANVAS-05)
   │  referência confiável
   ├──> Estágio 1 (F-CAP-02, F-AUTH-03) ──> captura completa de 26 rotas
   │
   └──> Estágio 2 (F-SPEC-01, F-SPEC-04) ──> intenção registrada
                    │
                    └──> Estágio 3 ──> PASS possível pela primeira vez
```

Os estágios 1 e 2 são paralelizáveis entre si. Nenhum dos dois produz prova válida antes do estágio 0.

---

## 8. Riscos

**Recapturar antes de restaurar a referência gasta esforço em uma comparação inválida.** É o risco mais provável, porque o estágio 1 é barato e tentador de fazer primeiro.

**A fixture de slug pode mascarar o débito de mock.** Detalhado em §5.1. Mitigação: guarda explícita no harness.

**O gate histórico do admin pode ser lido como conclusão.** `docs/qa/gates/epic15-complete-fidelity.yml` declarou 100/100 para o admin, e a Story 18.2 registra explicitamente que não apaga esse gate, mas que a reprodutibilidade atual é NOT_ASSESSABLE em 9 das 10 telas. Os dois documentos convivem e dizem coisas diferentes; quem consultar só o gate terá a impressão errada.

**O manifesto está defasado em 24 dias e em outro SHA.** Qualquer número citado a partir dele precisa de recaptura antes de virar decisão.

---

## 9. Encaminhamento

Cinco dos seis findings têm `@po` como owner declarado. As ações concretas sugeridas:

| Ação | Owner sugerido | Depende de |
|---|---|---|
| Reclassificar F-CANVAS-05 para Alta | `@po` | — |
| Restaurar/reexportar canvases (Estágio 0) | `@ux-design-expert` + `@po` | — |
| Fixture de slug com guarda anti-mock | `@dev` | Estágio 0 |
| Contrato de auth no harness de captura | `@dev` | Estágio 0 |
| Escrever 9 specs públicas | `@ux-design-expert` | Estágio 0 |
| Definir critério de PASS | `@po` (decisão de produto) | Estágios 1 e 2 |

**Nota constitucional (Article IV — No Invention):** toda afirmação factual desta análise traça a um arquivo citado no cabeçalho ou a verificação direta registrada em §4 e §5.

---

*Análise produzida por @analyst (Atlas) — 2026-08-12, derivada da sessão de brainstorming sobre evolução do design.*
