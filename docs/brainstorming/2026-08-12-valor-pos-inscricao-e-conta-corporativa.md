# Brainstorm — Valor ao Cliente/Lead: Pós-Inscrição & Conta Corporativa

**Tipo:** Brainstorming Output (Ideation + Convergência com scoring)
**Facilitador:** @analyst (Atlas)
**Data:** 2026-08-12
**Solicitante:** Negócio + Produto
**Sessão anterior relacionada:** [`2026-06-27-descoberta-conversao-visibilidade.md`](2026-06-27-descoberta-conversao-visibilidade.md)
**Próximo passo sugerido:** Handoff para @pm (Morgan)

---

## 1. Objetivo da Sessão

Gerar e priorizar funcionalidades do site que entreguem **mais valor ao cliente e ao lead**.

Diferente da sessão de 2026-06-27 — que tratou do funil **até** a conversão (Descoberta → Conversão → Visibilidade) — esta sessão parte de uma constatação da auditoria de código: **o produto termina na inscrição**. Tudo que acontece depois está declaradamente fora do MVP. O eixo central aqui é, portanto, o **pós-inscrição** e a **conta corporativa**, com uma varredura complementar no pré-venda.

---

## 2. Estado Atual Verificado (auditoria de código 2026-08-12)

### 2.1 O que a sessão de junho pediu e já foi entregue

| Item da sessão 2026-06-27 | Status | Evidência |
|---------------------------|--------|-----------|
| 3.1 `sitemap.xml` + `robots.txt` | ✅ Entregue | `app/sitemap.ts`, `app/robots.txt/route.ts` |
| 3.2 JSON-LD `Course` + `Organization` + `FAQPage` | ✅ Entregue | `src/lib/seo.ts` — `organizationJsonLd`, `buildCourseJsonLd`, `getCourseFaqItems` |
| 3.5 (parcial) JSON-LD de eventos na agenda | ✅ Entregue | `src/lib/seo.ts` — `buildAgendaEventJsonLd` |
| T1 Medição de funil (GA4) | ✅ Entregue | `src/lib/analytics.ts` — `trackEvent`, eventos `inscricao_cta`, `lead_enviado`, `checkout_iniciado` |
| 1.1 Busca no catálogo | ✅ Entregue | `src/views/public/Courses.tsx` — campo `role="search"` |
| 1.2 Filtros facetados | ⚠️ Parcial | Só chips de **categoria**; faltam modalidade, público, duração, preço e data |
| 1.7 Badges de escassez | ⚠️ Parcial | `CourseDetail.tsx:126` exibe "Últimas N vagas"; **ausente** na agenda e no catálogo |
| 2.3 / 2.4 Prova social | ❌ Pendente | `Course.rating` e `Course.studentsCount` existem no tipo, mas não há coleta nem exibição |

### 2.2 A lacuna que originou esta sessão

`src/views/portal/StudentPortal.tsx` tem **149 linhas**: perfil do aluno e uma tabela de inscrições. O próprio código declara o escopo:

- Linha 101: *"Sem certificados, materiais ou histórico financeiro neste MVP."*
- Linha 140: coluna Certificado renderiza `"Fora do MVP"` quando `certificateIssued` é falso.

### 2.3 Ativos de dados já existentes (reduzem esforço de várias ideias)

| Campo | Onde | Consequência |
|-------|------|--------------|
| `TrainingClass.totalSeats`, `availableSeats`, `filledSeats` | `src/types/index.ts` | Escassez e lotação são **exibição**, não modelagem |
| `Course.rating`, `Course.studentsCount` | `src/types/index.ts` | Prova social precisa de **pipeline de coleta**, o campo já existe |
| `Student.certificateIssued` | `src/types/index.ts` | Certificado tem a flag; falta emissão e validação pública |
| `TrainingClass.startDate`, `time`, `location`, `modality` | `src/types/index.ts` | Lembretes e `.ics` têm todos os dados necessários |
| Squad de e-mail marketing | Workspace (`squads/email-marketing-squad`) | Habilita nutrição e lembretes sem construir infraestrutura nova |

### 2.4 Confirmadamente ausentes

Sem lista de espera (`waitlist`), sem exportação de calendário (`.ics` / `VCALENDAR`), sem inscrição multi-participante (o checkout em `CourseCheckout.tsx` é individual), sem portal para o gestor corporativo.

---

## 3. Modelo Mental — o funil completo

A sessão de junho mapeou o funil até a conversão. Esta sessão estende a mesma linha:

```
VISIBILIDADE → DESCOBERTA → CONVERSÃO → ENTREGA → RETENÇÃO
  (jun/2026)    (jun/2026)   (jun/2026)   ↑ esta sessão ↑
                                  │              │
                                  └──── prova social retroalimenta ────┘
```

O ponto não trivial: **entrega e retenção não são só pós-venda, são insumo de conversão**. Avaliação de aluno vira prova social na página do curso; certificado publicado no LinkedIn vira tráfego de topo de funil. O que hoje está "fora do MVP" é justamente o que alimentaria a métrica-norte declarada em junho (conversão).

---

## 4. Ideias Geradas (23)

### 4.1 Descoberta — atrair e qualificar

| # | Ideia | Observação |
|---|-------|------------|
| 1 | **Diagnóstico de maturidade em RH** — quiz que gera relatório personalizado e recomenda trilha | Estende a ideia 1.6 (recomendador) da sessão de junho, agregando lead magnet |
| 2 | **Calculadoras trabalhistas** (rescisão, férias, adicional noturno, INSS) | Termos de alto volume de busca; complementa 3.6 (blog como motor de SEO) |
| 3 | **Glossário de RH e legislação** — páginas curtas indexáveis linkando para cursos | Mesma família de 3.4/3.6 |
| 4 | **Perfil público do instrutor** — bio, cursos, artigos, LinkedIn | Novo. Hoje instrutor é seção interna de `CourseDetail.tsx` |

### 4.2 Consideração — reduzir risco percebido

| # | Ideia | Observação |
|---|-------|------------|
| 5 | **Ementa completa em PDF** como isca de captura de e-mail | Novo. Crítico em B2B/B2G: o comprador precisa do documento para aprovação interna |
| 6 | **Aula ou módulo demonstrativo gratuito** (10 min por curso) | Novo. Depende de produção de vídeo |
| 7 | **Prova social estruturada por curso** — nota, alunos formados, depoimentos, logos | = 2.3/2.4 de junho, ainda pendente. Campos `rating`/`studentsCount` já existem |
| 8 | **Comparador de cursos lado a lado** | Adjacente a 1.4/1.5 de junho |

### 4.3 Decisão — converter

| # | Ideia | Observação |
|---|-------|------------|
| 9 | **Lista de espera** ("avise-me quando abrir turma") para cursos sem data | Novo. Captura demanda reprimida e informa o planejamento da agenda |
| 10 | **Escassez na agenda e no catálogo** — vagas restantes, prazo de encerramento | Extensão: já existe em `CourseDetail.tsx:126`, falta replicar. Dados já no modelo |
| 11 | **Inscrição de múltiplos participantes** — o RH inscreve a equipe | Novo. `CourseCheckout.tsx` é estritamente individual hoje |
| 12 | **Proposta comercial automática para in-company** — PDF com escopo e faixa de preço | Evolui o `quote-modal.tsx` existente |

### 4.4 Pós-inscrição — a maior lacuna

| # | Ideia | Observação |
|---|-------|------------|
| 13 | **Certificado digital com validação pública** (código/QR + página de verificação) | Flag `certificateIssued` já existe; falta emissão e verificação |
| 14 | **Materiais para download** — slides, apostilas, modelos de documentos e planilhas de RH | Novo |
| 15 | **`.ics` / Google Calendar + lembretes automáticos** antes da turma | Novo. Todos os dados de turma já existem; squad de e-mail já existe |
| 16 | **Área "minha turma"** — link da sala virtual, instruções, endereço, suporte | Novo |
| 17 | **Pesquisa de satisfação pós-curso (NPS)** alimentando as avaliações da ideia 7 | Novo. É o pipeline que falta para `Course.rating` |
| 18 | **Trilha de continuidade** — "concluiu X, próximo passo é Y" | Novo no pós-venda; parente de 1.5 (cross-sell) |

### 4.5 Conta corporativa — diferencial B2B/B2G

| # | Ideia | Observação |
|---|-------|------------|
| 19 | **Portal do cliente corporativo** — gestor vê colaboradores inscritos, presença, certificados e baixa relatório consolidado | Novo. Muda a categoria do produto |
| 20 | **Newsletter de atualizações legais** (CLT, eSocial, NRs) | Estende 2.6 de junho para nutrição recorrente, não só recuperação de abandono |

### 4.6 Wild cards

| # | Ideia | Observação |
|---|-------|------------|
| 21 | **Assistente de IA sobre o catálogo** — responde "qual curso serve para folha de pagamento?" | Novo |
| 22 | **Credencial verificável com badge para LinkedIn** | Depende da ideia 13 |
| 23 | **Webinars gratuitos mensais** como topo de funil recorrente | Novo; alimenta a ideia 9 |

---

## 5. Convergência — Scoring Formal

### 5.1 Critérios

| Critério | Escala | Definição |
|----------|--------|-----------|
| **Valor** | 1–10 | Impacto em receita, ticket médio, retenção ou qualidade de lead |
| **Esforço** | 1–10 | Complexidade de implementação (1 = horas; 5 = uma sprint; 10 = múltiplos meses) |
| **Alinhamento** | 1–10 | Aderência ao modelo B2B/B2G e aproveitamento do que já existe no código |
| **ROI** | calculado | `(Valor × Alinhamento ÷ 10) ÷ Esforço` |

### 5.2 Tabela completa (23 ideias, ordenadas por ROI)

| Rank | # | Ideia | Valor | Esforço | Alinh. | ROI |
|------|---|-------|:-----:|:-------:|:------:|:---:|
| 1 | 10 | Escassez na agenda e catálogo | 6 | 1 | 8 | **4,80** |
| 2 | 15 | `.ics` + lembretes automáticos | 8 | 2 | 9 | **3,60** |
| 3 | 5 | Ementa em PDF com captura | 9 | 3 | 10 | **3,00** |
| 4 | 9 | Lista de espera | 8 | 3 | 9 | **2,40** |
| 5 | 17 | NPS pós-curso | 8 | 4 | 10 | **2,00** |
| 6 | 22 | Badge verificável para LinkedIn | 7 | 3 | 8 | **1,87** |
| 7 | 7 | Prova social estruturada | 9 | 5 | 10 | **1,80** |
| 8 | 4 | Perfil público do instrutor | 6 | 3 | 8 | **1,60** |
| 9 | 2 | Calculadoras trabalhistas | 8 | 4 | 7 | **1,40** |
| 9 | 3 | Glossário de RH | 6 | 3 | 7 | **1,40** |
| 9 | 14 | Materiais para download | 7 | 4 | 8 | **1,40** |
| 9 | 16 | Área "minha turma" | 7 | 4 | 8 | **1,40** |
| 9 | 18 | Trilha de continuidade | 6 | 3 | 7 | **1,40** |
| 9 | 20 | Newsletter de atualizações legais | 7 | 4 | 8 | **1,40** |
| 15 | 13 | Certificado com validação pública | 9 | 6 | 9 | **1,35** |
| 16 | 1 | Diagnóstico de maturidade em RH | 8 | 5 | 8 | **1,28** |
| 17 | 11 | Inscrição de múltiplos participantes | 10 | 8 | 10 | **1,25** |
| 18 | 12 | Proposta automática in-company | 8 | 6 | 9 | **1,20** |
| 19 | 19 | Portal do cliente corporativo | 10 | 9 | 10 | **1,11** |
| 20 | 23 | Webinars mensais | 7 | 5 | 7 | **0,98** |
| 21 | 8 | Comparador de cursos | 5 | 4 | 6 | **0,75** |
| 22 | 6 | Aula demonstrativa gratuita | 7 | 6 | 6 | **0,70** |
| 23 | 21 | Assistente de IA no catálogo | 6 | 7 | 6 | **0,51** |

### 5.3 Ressalvas do modelo — ler antes de priorizar por ROI puro

O ranking acima **não deve ser lido como ordem de execução**, por três razões:

**Primeira: ROI penaliza apostas estruturais.** As duas ideias de maior valor absoluto — inscrição multi-participante (10) e portal corporativo (10) — aparecem em 17º e 19º lugar apenas porque o denominador é grande. Elas são as únicas da lista que mudam o **modelo de negócio**, não a taxa de conversão. Devem ser decididas por estratégia, não por ROI.

**Segunda: há dependências que o score isolado esconde.**

- A ideia 22 (badge LinkedIn) tem ROI 1,87, mas é **inexequível** sem a 13 (certificado validável, ROI 1,35). O par 13+22 deve ser avaliado em conjunto: ROI combinado ≈ (16 × 8,5 ÷ 10) ÷ 9 ≈ 1,51.
- A ideia 7 (prova social) depende da 17 (NPS) para ter o que exibir. O par 17→7 forma um pipeline único.
- A ideia 23 (webinars) só se paga se a 9 (lista de espera) existir para capturar o público.

**Terceira: existe um ciclo composto que vale mais do que a soma das partes.** As ideias **17 → 7 → 13 → 22** formam um circuito fechado: a pesquisa de satisfação gera nota, a nota vira prova social na página do curso, o certificado emitido vira badge no LinkedIn, o badge traz o próximo lead. Somadas, custam esforço 18 e valor 33 — mas o efeito composto sobre a métrica-norte (conversão) supera qualquer item isolado da lista.

### 5.4 Duas listas de leitura

**Quick wins (ROI ≥ 2,0 — cabem em uma sprint cada):** ideias 10, 15, 5, 9, 17.
Esforço somado ≈ 13 pontos. Todas aproveitam dados ou infraestrutura que já existem.

**Apostas estruturais (valor ≥ 9, decisão de estratégia):** ideias 11, 19, 13, 7.
Exigem modelagem nova de dados e mudam o que o produto é. Nenhuma cabe em uma sprint.

---

## 6. Sequenciamento Recomendado

### 🌊 Onda A — Quick wins de baixo risco (1 sprint)

1. **Ideia 10** — replicar o badge de vagas de `CourseDetail.tsx:126` na agenda e no catálogo. Zero modelagem, dados já disponíveis.
2. **Ideia 15** — `.ics` e lembretes por e-mail antes da turma. Ataca no-show, a dor operacional clássica de treinamento, com todos os dados já no modelo `TrainingClass`.
3. **Ideia 5** — ementa em PDF com captura de e-mail. Maior alavanca de lead qualificado em B2B/B2G, onde o comprador precisa do documento para aprovação interna.

### 🌊 Onda B — Ciclo de reputação (2 sprints)

4. **Ideia 17** → **7** → **13** → **22**, nesta ordem de dependência. Fecha o circuito NPS → prova social → certificado → badge, e finalmente entrega o item 2.3/2.4 que ficou pendente desde junho.
5. **Ideia 9** — lista de espera, que além de capturar demanda gera o dado para decidir quais turmas abrir.

### 🌊 Onda C — Reposicionamento B2B (decisão estratégica, 1+ trimestre)

6. **Ideia 11** — inscrição de múltiplos participantes.
7. **Ideia 19** — portal do cliente corporativo.
8. **Ideia 12** — proposta automática de in-company.

O restante das ideias (1, 2, 3, 4, 6, 8, 14, 16, 18, 20, 21, 23) fica em backlog, reavaliado após a Onda A com os dados de funil que o `trackEvent` já coleta.

---

## 7. Insights da Sessão

**O produto está desequilibrado entre pré e pós-venda.** O funil público amadureceu bastante desde junho — sitemap, JSON-LD, busca, medição de funil, todos entregues. Mas tudo depois da inscrição continua marcado como fora do MVP no próprio código. É onde está o valor não capturado, e é tipicamente onde se perde a renovação e a indicação.

**Quem compra não é quem estuda.** No modelo B2B/B2G declarado na sessão de junho, o comprador é o gestor de RH adquirindo para a equipe. Ainda assim, o checkout é individual e o portal é individual. As ideias 11, 12 e 19 corrigem esse desalinhamento estrutural — e são as três de maior valor absoluto da lista, o que não parece coincidência.

**Vários itens são exibição, não construção.** Vagas, nota e contagem de alunos já existem como campos no modelo de dados. A distância entre "o dado existe" e "o cliente vê o dado" é a fatia mais barata de valor disponível hoje.

---

## 8. Questões em Aberto (para o @pm)

1. **Dados de funil já coletados:** o `trackEvent` está instrumentado desde junho. Há volume suficiente no GA4 para priorizar por dado em vez de hipótese?
2. **Certificação:** existe requisito legal ou de credenciamento (MEC, conselhos de classe) que condicione o formato do certificado da ideia 13?
3. **Pagamento corporativo:** a inscrição múltipla (ideia 11) exige nota fiscal por CNPJ, empenho ou faturamento? O tipo `Student.paymentMethod` já prevê `"Empenho"`, o que sugere venda pública.
4. **Prova social:** há depoimentos, logos ou casos disponíveis hoje? A pergunta ficou aberta desde a sessão de junho (§8.4) e continua bloqueando a ideia 7.
5. **Materiais de curso:** os instrutores possuem material padronizado que possa ser distribuído (ideia 14), e há definição sobre direitos autorais?
6. **Squad de e-mail marketing:** qual ferramenta integra, e ela suporta gatilhos transacionais (lembrete de turma, NPS pós-curso)?

---

## 9. Handoff para @pm (Morgan)

**De:** @analyst (Atlas)
**Para:** @pm (Morgan)
**Objetivo:** Avaliar a Onda A para stories imediatas e submeter a Onda C a decisão estratégica.

**Contexto resumido:**
- Projeto: site-rh-cursos, branch `codex/hotfixes-no-payments`
- Complementa a sessão de 2026-06-27, cujo eixo era pré-conversão; este documento cobre entrega e retenção
- 23 ideias com scoring formal (§5.2), agrupadas em 3 ondas (§6)
- Onda A (ideias 10, 15, 5) é executável imediatamente sem modelagem nova de dados

**Restrição constitucional (Article IV — No Invention):** todo requisito derivado deste documento deve traçar a uma ideia numerada aqui ou a evidência de código citada em §2.

**Recomendação primária:** iniciar pela Onda A, cujas três ideias somam esforço 6 e valor 23, e cuja implementação não depende de nenhuma das questões em aberto de §8.

**Alerta de dependência:** as ideias 22, 7 e 23 não devem ser planejadas isoladamente — ver §5.3.

---

*Documento gerado em sessão de brainstorming facilitada por @analyst (Atlas) — 2026-08-12.*
