# Brainstorm — Descoberta, Conversão & Visibilidade (RH Cursos 2026)

**Tipo:** Brainstorming Output (Discovery)
**Facilitador:** @analyst (Atlas)
**Data:** 2026-06-27
**Solicitante:** Negócio + Produto
**Horizonte:** Evolução completa (3-6 meses)
**Próximo passo:** Handoff para @pm (Morgan) → PRD formal

---

## 1. Objetivo da Sessão

Gerar a base de um novo PRD para o site RH Cursos pensando no projeto **hoje** e nas **melhorias**, focado em três dores levantadas pelo solicitante:

1. **Descoberta** — navegação fluida para encontrar cursos.
2. **Conversão** — converter mais nos cursos (inscrição/lead).
3. **Visibilidade** — posicionamento em buscadores **e em IAs** (GEO/AEO).

**Métrica-norte declarada:** conversão.

---

## 2. Estado Atual Verificado (baseline factual — auditoria de código 2026-06-27)

Plataforma SaaS de cursos corporativos + consultoria. Stack: Next.js 16, React 19, TypeScript, Supabase, Tailwind + Mantine + Radix, Cloudflare Workers.

**Rotas existentes:**
- **Público:** `/cursos` (catálogo) + `/cursos/[slug]` (detalhe), `/in-company`, `/sobre`, `/blog` + `/blog/[slug]`, `/contato`, `/agenda`, `/falar-com-especialista`, `/inscricao-confirmada`.
- **Admin:** alunos, instrutores, turmas, cursos, leads, blog, inscrições, configurações (~80% modernizado).
- **Auth:** login, RBAC, sessões.

**Componentes-chave:** `src/views/public/Courses.tsx`, `src/views/public/CourseDetail.tsx`, `/api/enrollments`.

**PRD pré-existente:** `docs/prd/modernizacao-ui-2026.md` — foca em modernização de UI/UX (admin, formulários, consistência visual). **NÃO cobre** descoberta, conversão otimizada nem SEO/GEO. Este brainstorm é complementar.

### 2.1 Achados críticos da auditoria

| Achado | Severidade | Impacto |
|--------|-----------|---------|
| ❌ Sem `sitemap.xml` | Alta | Buscadores sem mapa do site |
| ❌ Sem `robots.txt` | Alta | Sem controle de crawl, não aponta sitemap |
| ⚠️ Metadata só em `layout`, `cursos/[slug]`, `blog/[slug]` | Média | Demais rotas sem otimização de CTR orgânico |
| ❓ Sem JSON-LD / structured data confirmado | Alta | Sem rich snippets Google e sem leitura estruturada por IAs |
| ⚠️ Funil não instrumentado (GA4 existe mas opcional) | **Crítica** | Impossível saber onde a conversão é perdida |
| ✅ Lighthouse CI presente | — | Base para Core Web Vitals já existe |
| ✅ Squad de email-marketing no workspace | — | Habilita recuperação de abandono |

---

## 3. Decisões de Negócio Capturadas na Sessão

| Tema | Decisão |
|------|---------|
| **Tamanho do catálogo** | 80+ cursos e **crescendo rápido** → busca + filtros + categorias são *essenciais* |
| **Eixos de organização** | 4 eixos simultâneos: **área/tema, modalidade, público-alvo, data/agenda** |
| **Modelo de venda** | **B2B/B2G.** Cursos abertos = checkout online; in-company/turmas = lead comercial |
| **Gargalos percebidos** | (a) visitante nem chega na página; (b) vê o curso e não clica; (c) **falta medição** |
| **Ambição GEO** | SEO técnico + GEO avançado **em ondas** (fundamento primeiro) |
| **Ferramentas atuais** | Apenas **GA4** (no código, opcional). Sem Google Search Console. Sem CRM integrado declarado |

---

## 4. Ideias Geradas (por pilar)

### 🔎 P1 — Descoberta

| # | Ideia | Status |
|---|-------|--------|
| 1.1 | Busca instantânea com autocomplete (título, tema, instrutor) | **Must-have** |
| 1.2 | Filtros facetados (modalidade, área, público, duração, preço, data) | **Must-have** |
| 1.3 | Categorias/trilhas como landing pages (`/cursos/categoria/[area]`) | **Must-have** (também serve P3) |
| 1.4 | Ordenação inteligente (mais procurados, próximas turmas, avaliados) | Evolução |
| 1.5 | "Cursos relacionados" + cross-sell no detalhe | Evolução |
| 1.6 | Quiz/recomendador "qual curso é pra você?" | Evolução |
| 1.7 | Badges de urgência/escassez (vagas, próxima data) | Evolução (ponte para P2) |

### 💰 P2 — Conversão

| # | Ideia | Status |
|---|-------|--------|
| 2.1 | Página de curso como landing de conversão (prova social, CTA fixo, FAQ) | **Must-have** |
| 2.2 | Checkout sem fricção (apenas cursos abertos B2C) | Selecionado |
| 2.3 | Depoimentos + logos de empresas/órgãos (prova social institucional) | **Must-have** (B2B/B2G) |
| 2.4 | Prova de resultado (nº alunos, avaliações, certificações) | **Must-have** |
| 2.5 | CTA dual: "Inscrever agora" (B2C) vs "Falar com especialista" (B2B/in-company) | **Crítico** (dupla jornada) |
| 2.6 | Recuperação de abandono via squad de email-marketing | Evolução |
| 2.7 | Sticky bar de preço/próxima turma | Selecionado |
| 2.8 | Parcelamento/preço visível + objeções | Selecionado |

### 🌐 P3 — Visibilidade

| # | Ideia | Status |
|---|-------|--------|
| 3.1 | `sitemap.xml` dinâmico (gerado de Supabase) + `robots.txt` | **Must-have / P0** |
| 3.2 | JSON-LD `Course` + `Organization` + `FAQPage` | **Must-have** |
| 3.3 | Metadata completa (title, description, OG, Twitter) em todas as rotas | **Must-have** |
| 3.4 | Landing pages por categoria otimizadas para keywords | **Must-have** (= 1.3) |
| 3.5 | GEO/AEO: `llms.txt`, FAQ semântico, conteúdo citável por IAs | Onda 3 |
| 3.6 | Blog como motor de SEO (estratégia de pauta/keywords) | Evolução |
| 3.7 | Performance / Core Web Vitals (Lighthouse CI existe) | Transversal |
| 3.8 | `AggregateRating` no JSON-LD (estrelas no Google) | Onda 3 |

---

## 5. Requisitos Transversais (emergentes)

Não estavam nos 3 pilares originais, mas são **pré-requisitos**:

| # | Transversal | Justificativa |
|---|-------------|---------------|
| **T1** | **Medição de funil** — instrumentar GA4 (eventos) + configurar Google Search Console | Sem isto, otimizar conversão é chute. **Bloqueia priorização baseada em dados.** |
| **T2** | **Taxonomia multidimensional** (área/modalidade/público/agenda) no schema Supabase | Base de P1 (filtros) e P3 (landing pages de categoria) |
| **T3** | **Performance / Core Web Vitals** | Fator de ranking Google + UX de descoberta |

---

## 6. Modelo Mental — Funil Único

```
VISIBILIDADE (P3) → DESCOBERTA (P1) → CONVERSÃO (P2)
   IAs / Google        busca/filtros     checkout / lead
        ↑__________ MEDIÇÃO (T1, transversal) __________↑
```

Os três pilares não são independentes: são estágios do mesmo funil. Os gargalos relatados ("não chega na página" + "vê e não clica") confirmam que P3→P1→P2 precisam evoluir juntos, com T1 medindo cada transição.

---

## 7. Roadmap Proposto — 3 Ondas (3-6 meses)

### 🌊 Onda 1 — Fundação & Medição (mês 1-2)
- T1: GA4 com eventos de funil + Google Search Console configurado
- T2: Taxonomia de cursos no schema (4 eixos)
- 3.1: sitemap.xml dinâmico + robots.txt
- 3.3: metadata completa em todas as rotas
- 3.2: JSON-LD (`Course`, `Organization`)

### 🌊 Onda 2 — Descoberta & Conversão (mês 3-4)
- 1.1 / 1.2 / 1.3: busca instantânea + filtros facetados + landing pages de categoria
- 2.1 / 2.3 / 2.4: página de curso como landing (prova social institucional B2B/B2G)
- 2.5: CTA dual (checkout B2C vs lead comercial in-company)
- 2.7 / 2.8: sticky bar + preço/objeções

### 🌊 Onda 3 — Otimização & GEO Avançado (mês 5-6)
- 3.5: GEO/AEO (llms.txt, FAQ semântico, `FAQPage`)
- 2.6: recuperação de abandono (integra squad de email-marketing)
- 1.4 / 1.6: ordenação inteligente + recomendador
- 3.8: AggregateRating + otimização contínua via dados da Onda 1

---

## 8. Questões em Aberto (para o @pm endereçar no PRD)

1. **Metas quantitativas:** qual a taxa de conversão atual e a meta? (depende de T1 — medir primeiro)
2. **Definição de "conversão"** por jornada: B2C (inscrição paga) vs B2B/B2G (lead qualificado). KPIs distintos.
3. **Gateway de pagamento** dos cursos abertos: qual provedor? (impacta 2.2)
4. **Fonte da prova social:** há depoimentos/logos/casos disponíveis hoje? (impacta 2.3/2.4)
5. **Estratégia de keywords:** há pesquisa de palavras-chave do setor? (impacta 3.4/3.6)
6. **CRM/marketing:** o squad de email-marketing integra com qual ferramenta? (impacta 2.6)

---

## 9. Handoff para @pm (Morgan)

**De:** @analyst (Atlas)
**Para:** @pm (Morgan)
**Objetivo:** Transformar este brainstorm em PRD formal (brownfield), respeitando Article IV (No Invention) — cada requisito deve traçar a este documento ou a evidência de código.

**Contexto resumido:**
- Projeto: site-rh-cursos (branch `main`)
- 3 pilares (Descoberta, Conversão, Visibilidade) + 3 transversais (Medição, Taxonomia, Performance)
- Modelo de negócio: B2B/B2G, conversão dupla (checkout B2C + lead comercial)
- Catálogo 80+ cursos, crescendo, 4 eixos de taxonomia
- Roadmap em 3 ondas já esboçado (§7)

**Decisões já travadas:** ver §3.
**Questões a resolver no PRD:** ver §8.
**Primeira recomendação:** PRD deve estabelecer T1 (medição) como Onda 1 / pré-requisito, pois metas e priorização dependem de dados de funil.

**Comando sugerido:** `@pm` → criar PRD a partir deste brainstorm, ou rodar Spec Pipeline se o escopo exigir avaliação de complexidade.

---

*Documento gerado em sessão de brainstorming facilitada por @analyst (Atlas) — 2026-06-27.*
