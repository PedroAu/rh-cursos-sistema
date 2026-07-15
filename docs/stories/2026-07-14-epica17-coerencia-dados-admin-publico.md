# Épica 17 — Coerência de dados: Banco → Admin → Páginas Públicas

**Status:** Draft (revisado por QA — ressalvas incorporadas). Fase 1 parcialmente implementada em 2026-07-15: 17.1/17.2/17.3/17.4/17.5 `Done` (commits `92f6a8b`, `a992597`, `7768972`, `fd9be06` — nenhuma ação remota/produção executada). 17.12 pendente (requer autorização humana para tocar produção). Fase 2/3/4 permanecem bloqueadas pelas decisões D1–D4 ou fora do escopo desta sessão.
**Origem:** Auditoria de 2026-07-14 (análise completa schema/migrations × `admin-resource-configs.tsx` × páginas públicas)
**Objetivo:** Eliminar copy hardcoded que contradiz os dados reais, dar ao admin controle sobre todo conteúdo exibido ao público e remover campos de formulário sem efeito.

---

## Decisões de produto pendentes (elicitação prévia — bloqueiam as stories indicadas)

> Constitution Art. IV (No Invention): estas decisões devem ser tomadas por @po/@architect **antes** do sprint, não pelo @dev durante a implementação.

| # | Decisão | Responsável | Bloqueia |
|---|---|---|---|
| D1 | `featuredCourseIds`: remover do form ou persistir + exibir "Cursos relacionados"? | @po | 17.8 |
| D2 | Categorias múltiplas: banco vira jsonb ou form vira select único? (acoplado ao ADR015-F2) | @po + @architect | 17.8 |
| D3 | Depoimentos: alterar `avaliacao` ou criar tabela `depoimento` dedicada? | @architect + @data-engineer | 17.7 |
| D4 | Imagem do blog: usar nos cards públicos ou remover do form? | @po + @ux-design-expert | 17.9 |

---

## Fase 1 — Correções de coerência (o que engana o usuário hoje)

> Prioridade máxima. Site em produção desde 02/07 — **1 PR por story**, com regeneração de baseline isolada por PR (nunca em lote).

### Story 17.1 — ✅ Done (2026-07-15, commit `92f6a8b`) — Blog: "Em alta" com títulos trocados
- **Problema:** `trendingEditorial` em `src/views/public/Blog.tsx:35-60` exibe títulos hardcoded que não correspondem aos posts dos slugs linkados (usuário clica num título e abre outro artigo).
- **Solução:** manter apenas a lista de slugs curados e derivar título/categoria/tempo de leitura do post real em `blogPosts`; slugs sem post publicado somem da lista.
- **AC:** cada item de "Em alta" mostra o título real do post de destino; nenhum item aponta para post inexistente ou não publicado.

### Story 17.2 — ✅ Done (2026-07-15, commit `a992597`) — CourseDetail: depoimento fabricado e métricas inventadas
- **Problema:** fallback "Mariana Ferreira / Prefeitura de Campinas" (`CourseDetail.tsx:162-170`) é depoimento inventado exibido como real; `rating: 4.8` hardcoded para curso novo (`app-store.tsx:1179`); chip "Avaliação média X/5" e "N alunos" exibem 0/valores fictícios; "N turmas ministradas" conta turmas abertas.
- **Solução:**
  - Ocultar a seção de depoimento quando não houver depoimento real (override ou `avaliacao` do curso).
  - Remover o default `4.8`; ocultar chips de rating/alunos quando `rating === 0` ou `studentsCount === 0`.
  - Corrigir copy do chip para "N turmas abertas" (ou trocar o dado).
- **Dependência de decisão (R1 do gate QA):** definir o schema alvo de 17.7 **antes** de mergear esta story, ou aceitar formalmente no PR a janela de inconsistência (seção de depoimento some no detalhe e retorna na Fase 2, enquanto a Home mantém os hardcoded).
- **AC:** nenhuma métrica ou depoimento exibido sem dado real por trás; sem regressão visual não intencional nos baselines de curso-detalhe.

### Story 17.3 — ✅ Done (2026-07-15, commit `92f6a8b`, landed together with 17.1) — Preço da turma: "R$ 0,00" no catálogo
- **Problema:** form de turma não tem campo preço → `preco_turma = 0`; `Courses.tsx:107` usa `trainingClass?.price ?? course.price` (`??` não trata 0) e pode exibir "a partir de R$ 0,00". Agenda usa `||` — tratamento divergente.
- **Solução:** adicionar campo "Preço da turma (R$)" (opcional, hint "vazio = preço do curso") no form de turmas; unificar resolução de preço num helper (`price > 0 ? price : course.price`) usado por Courses e Agenda.
- **AC:**
  - Catálogo e agenda nunca exibem R$ 0,00 quando o curso tem preço; admin consegue definir preço por turma.
  - **Quando `preco_turma` e `preco_base` forem ambos 0** (curso "sob consulta"), exibir "Sob consulta" — nunca valor monetário zero.

### Story 17.4 — ✅ Done (2026-07-15, commit `7768972`) — Trilha desatualizada ao editar curso
- **Problema:** edição de curso faz spread do curso antigo e o form só envia `pathId`; `trilha_nome` antigo é re-persistido (`app-store.tsx:1141-1147` + `admin-mappers.ts:128`). Breadcrumb/badge públicos mostram trilha errada.
- **Solução (obrigatória, não alternativa):** derivar `trilha_nome` a partir de `trilha_id` **no edge function** (`admin-resources` / `admin-mappers.ts`) e parar de confiar no payload do cliente — qualquer outro caminho de escrita (seeds, scripts, clients futuros) reintroduziria o bug. Avaliar com @architect a eliminação da coluna `trilha_nome` em favor de join com `trilha` (follow-up aceitável).
- **AC:** trocar a trilha no admin reflete imediatamente no breadcrumb e badge do curso público; nenhum caminho de escrita consegue persistir `trilha_nome` inconsistente com `trilha_id`.

### Story 17.5 — ✅ Done (2026-07-15, commit `fd9be06`) — Lead: telefone falso "(61) 90000-0000"
- **Problema:** `admin-resource-configs.tsx:903,920` grava número inventado quando o campo fica vazio.
- **Solução:** permitir telefone vazio (coluna `lead.telefone` é nullable); exibir "—" nas listagens.
- **AC:** nenhum dado fabricado gravado no CRM.

### Story 17.12 — ⏸ Pendente (fora do escopo desta sessão) — Remediação de dados já gravados em produção *(nova — gate QA C1)*

> Não executada nesta sessão: depende de rodar contra o banco de **produção** (RLS/service role em `hwpsrujkxjhmmwphqdlz`), uma ação com efeito direto em dados reais que requer autorização humana explícita antes de qualquer migration de limpeza. Além disso, o gate QA exige que 17.2/17.3/17.5 estejam mergeadas primeiro — pré-condição agora satisfeita (todas `Done` acima).
- **Problema:** corrigir o código não conserta o que já foi persistido desde o go-live: leads com telefone `(61) 90000-0000`, cursos com `rating = 4.8` fabricado sem nenhuma avaliação real, turmas com `preco_turma = 0` sem intenção.
- **Solução:** migração de limpeza idempotente, com critérios **conservadores**:
  - `lead.telefone = '(61) 90000-0000'` → `null`;
  - `curso.rating = 4.8` → `0` **somente** se o curso não tiver nenhuma linha em `avaliacao`;
  - `preco_turma = 0`: **não alterar automaticamente** — gerar relatório para revisão manual do admin (pode ser intencional após 17.3).
- **Dependências:** executar **depois** de 17.2/17.3/17.5 mergeadas (senão o código regrava os valores).
- **AC:** migração idempotente (re-execução não altera nada); relatório de linhas afetadas anexado ao PR; nenhum dado legítimo alterado (amostragem validada por @data-engineer).

---

## Fase 2 — Admin para conteúdo público hoje inacessível

### Story 17.6 — ⏸ Bloqueada (fora do escopo desta sessão) — CRUD de `curso_public_content`

> Requer migration + Edge Function + gate de segurança dedicado (payload jsonb, allowlist de hrefs, audit log) — trabalho de `@data-engineer`/`@architect`, não uma correção pontual.
- **Problema:** hero subtitle, highlights, FAQ, sidebar, CTA corporativo e depoimento override do detalhe do curso não têm tela — só editáveis via SQL (seed da migration `20260710`).
- **Solução:** novo `ResourceKey: "coursePublicContent"` em `admin-resource-configs.tsx` + rota no `admin-resources` edge function + mappers (`admin-mappers.ts`; `mappers.ts` já cobre leitura). Form com seções: Hero, Destaques (array de título/descrição), FAQ (array pergunta/resposta), Sidebar (labels), CTA corporativo, Depoimento override, Publicado.
- **Segurança (gate QA C3 — obrigatório):**
  - Validação de shape e tamanho dos payloads jsonb **no servidor** (não confiar no form): limites de itens e de comprimento por campo;
  - `primaryHref`/`secondaryHref` restritos a paths relativos ou allowlist de domínios — conteúdo é renderizado no site público;
  - Novo resource coberto pelo `admin_audit_log`;
  - Cobertura em `tests/route-auth.spec.ts` (anon/authenticated/admin).
- **AC:**
  - Admin edita a copy do detalhe de qualquer curso sem SQL;
  - Conteúdo com `published = false` reproduz **exatamente** o comportamento atual de fallback (teste de regressão explícito comparando com snapshot pré-mudança);
  - Payload jsonb malformado ou href externo fora da allowlist é rejeitado com 400 (teste de integração);
  - Testes em `admin-resource-configs.test.ts` e `admin-mappers.test.ts` atualizados.

### Story 17.7 — 🔒 Bloqueada por D3 (decisão de produto pendente) — Depoimentos gerenciáveis
- **Problema:** `avaliacao` não guarda nome/cargo/órgão (`mapAssessmentToTestimonial` anonimiza tudo para "Aluno RH Cursos"); Home usa 3 depoimentos hardcoded; matching por título de curso é frágil.
- **Solução:**
  - Migração conforme decisão D3 (alterar `avaliacao` ou tabela `depoimento`), incluindo `nome_publico`, `cargo`, `organizacao`;
  - **LGPD (gate QA C2 — obrigatório):** campos `consentimento_publicacao boolean not null default false` + `consentimento_em timestamptz`; o público **só** exibe registros com consentimento registrado;
  - CRUD no admin (novo ResourceKey "testimonials");
  - Home consome depoimentos marcados como públicos; CourseDetail faz matching por `curso_id`, não por título.
- **Pré-requisito editorial:** verificar se os 3 depoimentos hardcoded da Home (CIAMA, TRF1, CBTU) têm **autorização real documentada** — se sim, viram seed com consentimento registrado; se não, são removidos (não migrados).
- **Riscos de migração:** tabela com histórico de recursão RLS (`20260707144500_fix_aluno_rls_recursion.sql`) — rodar `*validate-migrations` + teste de RLS para anon/authenticated/admin antes do merge.
- **AC:** depoimentos da Home e do detalhe vêm do banco; nenhum depoimento sem consentimento aparece publicamente (teste de RLS/filtro); zero depoimentos fabricados no código.

---

## Fase 3 — Campos mortos ou enganosos no admin

### Story 17.8 — Curso: campos sem efeito *(bloqueada por D1 e D2)*
Tabela de decisão por campo (AC = cada linha verificada por teste indicado):

| Campo | Situação atual | Decisão | Efeito observável | Teste |
|---|---|---|---|---|
| `featuredCourseIds` | Form salva, nada persiste (`admin-mappers.ts` ignora; `mappers.ts:330` devolve `[]`) | D1: remover **ou** persistir + seção "Cursos relacionados" | Form sem o campo, ou seção no detalhe | `admin-resource-configs.test.ts` + `course-detail.test.tsx` |
| `categories` (array) | Só a 1ª persiste (`categoria` varchar); demais descartadas em silêncio | D2 (ADR015-F2) | Categorias salvas = categorias exibidas/filtráveis no catálogo | `admin-mappers.test.ts` + e2e catálogo |
| `featured`/`destaque` | Persiste; nenhuma página pública lê | Usar (ordenação/destaque no catálogo ou Home) ou remover | Curso destacado aparece com tratamento distinto, ou campo some | e2e catálogo |
| Carga horária | `durationHours` = dígitos concatenados do label ("16h às 18h" → 1618h) | Separar `durationHours` (number) do `durationLabel` (texto) no form | "Certificado de Xh" correto no detalhe | `admin-mappers.test.ts` + `course-detail.test.tsx` |

### Story 17.9 — Blog: categorias e imagem *(imagem bloqueada por D4)*
- Alinhar filtro público (4 categorias) com as 9 do admin — gerar chips dinamicamente das categorias com post publicado.
- Remover fallback silencioso `fromDbBlogCategory → "Tecnologia"` (preservar/exibir categoria original; logar valor desconhecido).
- Imagem do post: aplicar decisão D4.
- **AC:** categoria escolhida no admin é a exibida e filtrável no blog; categoria desconhecida nunca é reclassificada silenciosamente.

---

## Fase 4 — Copy dinâmica nas páginas institucionais

### Story 17.10 — ⏸ Pendente (fora do escopo desta sessão) — Home: números e curadoria reais
- Stats "+18 anos / +320 turmas / 96%" e "Quase 80 cursos em 6 trilhas": derivar do banco o que for derivável e centralizar o restante em `src/lib/company.ts`.
- **Fonte de verdade por número (AC reescrito — gate QA):**

| Número exibido | Fonte de verdade | Verificação |
|---|---|---|
| Anos de atuação | Derivado de `company.foundedYear` (2007) vs ano corrente | Teste unitário: badge "desde 2007" e stat de anos nunca divergem |
| Nº de cursos / trilhas | Contagem de cursos com status público / trilhas ativas no store | Teste unitário comparando stat renderizado × contagem do store |
| Turmas realizadas, % recomendação | Constante revisada em `company.ts` (não derivável hoje) | Valor único referenciado; sem literal duplicado em views |

- **AC:** cada número da Home tem fonte de verdade única; teste falha se algum literal divergir da fonte.

### Story 17.11 — ⏸ Pendente (fora do escopo desta sessão) — Blog: curadoria via dados
- Substituir `curatedFeaturedSlug`/`curatedGridSlugs` fixos por flag `destaque`/`ordem_curadoria` em `post_blog` (migração + campo no form) com fallback para "mais recentes".
- Remover o "14.133" decorativo fixo do card de destaque (ou derivar da categoria).
- **AC:** post novo publicado no admin aparece no blog sem deploy.

---

## Sequência e dependências

```
Elicitação D1–D4 (@po/@architect) ─── antes do sprint
Fase 1: 17.1–17.5 independentes (1 PR cada) → 17.12 por último (após 17.2/17.3/17.5)
        17.2 requer decisão sobre R1 (schema de 17.7 definido OU janela aceita no PR)
Fase 2: 17.6 → sem dependências | 17.7 → decisão D3 + migração antes do CRUD; Home depende de 17.7
Fase 3: 17.8 bloqueada por D1/D2 (+ ADR015-F2) | 17.9 parcialmente bloqueada por D4
Fase 4: 17.10 independente | 17.11 precisa de migração própria
```

## Gates de qualidade (todas as stories)

- `npm run lint` + `npm run typecheck` verdes
- Testes unitários atualizados (`admin-mappers.test.ts`, `admin-resource-configs.test.ts`, `course-detail.test.tsx`)
- E2E `public-journeys.spec.ts` verde; **`route-auth.spec.ts` obrigatório para novos recursos admin (17.6/17.7)**
- Baselines visuais regenerados **por story, em PR isolado, com revisão manual** — nunca em lote
- Migrações novas idempotentes (`if not exists`) e compatíveis com o seed baseline de 2026-07-13; `*validate-migrations` para 17.7 e 17.12
- **Gate de CI medindo tamanho gzip do Worker (< 3 MiB, plano Free Cloudflare)** — obrigatório nos PRs de 17.6/17.7, não verificação manual

## Riscos

| Risco | Prob × Impacto | Mitigação |
|---|---|---|
| Janela de inconsistência visual entre 17.2 e 17.7 (depoimentos somem e voltam) | Média × Médio | Decidir schema de 17.7 antes de mergear 17.2, ou aceitar formalmente no PR |
| Curso e turma ambos com preço 0 exibindo "R$ 0,00" | Baixa × Alto | AC "Sob consulta" na 17.3 |
| Migração em `avaliacao` conflitar com RLS existente | Média × Alto | `*validate-migrations` + testes RLS anon/authenticated/admin (17.7) |
| Invalidação em massa dos 13 baselines visuais | Alta × Médio | 1 PR por story; regeneração isolada com revisão manual |
| Worker > 3 MiB gzip com novas telas de admin | Média × Alto (deploy falha) | Gate de CI automatizado no pipeline |
| Limpeza de dados (17.12) alterar registro legítimo | Baixa × Alto | Critérios conservadores; relatório prévio; amostragem por @data-engineer |
| Publicação de dado pessoal sem base legal (17.7) | Média × Alto (reputacional/LGPD) | Consentimento obrigatório no schema + filtro público; auditoria dos 3 depoimentos hardcoded |
| Ocultar rating/depoimentos "emagrece" a página de curso | Média × Baixo | Fallbacks neutros de layout; priorizar 17.7 para repor conteúdo real |

---

## QA Results

### Gate — 2026-07-14 (Quinn / @qa)

**Decisão:** ⚠️ CONCERNS → ressalvas incorporadas nesta revisão do documento.

| Item | Ressalva | Tratamento |
|---|---|---|
| C1 | Faltava remediação de dados já persistidos em produção | Nova Story 17.12 (Fase 1) |
| C2 | LGPD ausente na publicação de depoimentos | Consentimento obrigatório no schema + filtro público + auditoria dos hardcoded (17.7) |
| C3 | Fase 2 sem ACs de segurança (jsonb público, hrefs, audit log, route-auth) | ACs de segurança adicionados à 17.6 |
| C4 | 17.4 permitia fix client-side | Derivação de `trilha_nome` no edge function tornada obrigatória |
| R1–R5 | Riscos subestimados (janela visual, preço 0×0, RLS, baselines em lote, 3 MiB) | Tabela de riscos ampliada; regras nos gates de qualidade |
| ACs vagos | 17.8 e 17.10 não falsificáveis | Reescritos como tabelas enumeradas com fonte de verdade e teste por linha |
| Decisões embutidas | D1–D4 misturadas às stories | Seção de elicitação prévia criada; stories marcam bloqueio explícito |

**Condição para promover Fase 1 a Ready:** decisões D1–D4 encaminhadas ao @po (não bloqueiam 17.1/17.3/17.4/17.5; 17.2 requer posição sobre R1). Re-gate não necessário para Fase 1; Fase 2 requer novo `*risk-profile` antes do sprint.
