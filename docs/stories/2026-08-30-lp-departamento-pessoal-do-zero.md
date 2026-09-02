# Story: Construir landing page de venda — Departamento Pessoal do Zero

## Status

InProgress

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools:
  - architecture_review
  - code_review
  - pattern_validation
  - lint
  - typecheck
  - test:unit
  - build
  - axe
```

## Origem e rastreabilidade

- **Solicitação:** construir uma landing page de venda para o curso “Departamento Pessoal do Zero”.
- **Fonte comercial e editorial:** `/Users/pedroaugusto/Documents/Squad RH Cursos/squads/produto-squad/output/2026-08-28-121533/04-copy/v2/product-assets-package.md`.
- **Conversão única:** iniciar matrícula pelo checkout existente.
- **Projeto:** `/Users/pedroaugusto/Documents/RH Cursos/site_1.0/rh-cursos-site-recovery`.
- **Dependência operacional:** deve existir no catálogo público um curso publicado com o slug `departamento-pessoal-do-zero`, compatível com o checkout atual. A construção local não depende de mutação no catálogo, mas a story não pode ser marcada como `Done` com CTA quebrado.
- **Parent epic:** N/A — solicitação direta baseada no pacote de produto.

## Story

**Como** pessoa sem experiência em Departamento Pessoal ou em transição de carreira,
**quero** conhecer a formação “Departamento Pessoal do Zero” e seguir para a matrícula,
**para** desenvolver prática demonstrável e me preparar melhor para disputar vagas de auxiliar ou assistente de DP.

## Contexto e valor

Pessoas interessadas em vagas de entrada em Departamento Pessoal encontram exigências relacionadas a admissão, jornada, folha, férias, eSocial e rescisão, mas frequentemente não conseguem explicar como executariam essas rotinas nem possuem evidências práticas de aprendizado.

A landing page deve apresentar uma jornada clara entre problema, formação, prática, miniportfólio, preparação para candidatura e oferta. A promessa aprovada é de preparo técnico e prática demonstrável, nunca de contratação, salário, indicação automática ou prazo de colocação.

A página trabalha uma única conversão primária: levar ao checkout do curso. Repetições do CTA são permitidas quando mantêm intenção, destino e linguagem.

## Acceptance Criteria

1. Existe uma rota pública e indexável em `/lp/departamento-pessoal-do-zero`, implementada com Next.js App Router. O arquivo de rota limita-se a composição, metadados e dados estruturados; a apresentação fica em `src/features/public/`.

2. A página possui uma única conversão primária. Todas as ocorrências do CTA principal usam **“Quero me preparar para vagas de DP”** e apontam para `/cursos/departamento-pessoal-do-zero/checkout`, sem `classId` inventado e sem CTA comercial concorrente no corpo da LP.

3. Antes de marcar a story como `Done`, o executor confirma que o slug está publicado e que a rota de checkout responde corretamente. Se o produto ou uma opção elegível não existir, registra a dependência sem simular curso, turma, disponibilidade ou sucesso de compra.

4. A primeira dobra comunica:
   - headline **“As vagas pedem experiência. Você pode começar criando prática demonstrável.”**;
   - produto **“Departamento Pessoal do Zero”**;
   - formação prática para disputar a primeira vaga;
   - modalidade gravada/online e carga total de 40 horas;
   - CTA aprovado;
   - aviso visível de que a formação aumenta o preparo, mas não garante contratação.

5. A LP contém, em sequência persuasiva e escaneável:
   - problema e novo ponto de partida;
   - “Aprenda. Pratique. Demonstre.”;
   - para quem é e para quem não é;
   - resultados de aprendizagem;
   - oito módulos da Rota Essencial;
   - projeto final com sete entregas de miniportfólio;
   - apresentação factual da instrutora Ester Lima;
   - itens incluídos;
   - investimento, condições e garantia;
   - FAQs com as objeções aprovadas;
   - CTA final idêntico ao principal.

6. O conteúdo apresenta exclusivamente os fatos aprovados:
   - curso avulso, gravado e online;
   - 40 horas totais;
   - oito módulos e projeto final com sete entregas;
   - plano de estudo de 30 dias;
   - kit de modelos editáveis de DP;
   - Kit Primeira Candidatura e checklist final;
   - instrutora Ester Lima;
   - R$ 297 por participante;
   - parcelamento conforme o meio de pagamento disponível;
   - garantia de satisfação de 7 dias para compras online, dentro das condições aplicáveis.

7. A página não inventa depoimentos, avaliações, quantidade de alunos, percentuais, vagas, bônus, certificados, escassez, salários ou resultados profissionais. Não afirma nem sugere contratação, indicação automática, salário garantido ou prazo de colocação. Sem evidência real aprovada, não renderiza depoimentos.

8. A implementação reutiliza tokens, tipografia, cores, botões, cards, accordion, foco e primitivas existentes, sem nova biblioteca, fonte ou framework visual.

9. A LP é responsiva em mobile, tablet e desktop, sem overflow horizontal, sobreposição ou CTA cortado. Controles possuem área mínima de 44×44 px, foco visível e teclado. Há um único `h1`, headings coerentes, landmarks semânticos e accordion acessível.

10. A rota possui title, meta description, canonical próprio, Open Graph coerente, dados estruturados `Course` e `FAQPage` sem prova inexistente e inclusão no sitemap público.

11. Cada clique no CTA registra o evento existente `inscricao_cta`, sem PII:

    ```ts
    {
      course: "departamento-pessoal-do-zero",
      origin: "lp_departamento_pessoal_do_zero"
    }
    ```

    Sem `NEXT_PUBLIC_GA_MEASUREMENT_ID`, o clique continua funcional e o tracking é no-op.

12. Testes automatizados comprovam conteúdo factual, uniformidade dos CTAs e `href`, ausência de claims/prova fabricados, evento sem PII, SEO/JSON-LD/sitemap, acessibilidade e responsividade. Enquanto o slug não estiver comprovado no catálogo, o teste local valida apenas o endereço de destino; a resposta real do checkout pertence à evidência da AC3, permanece pendente e bloqueia `Done`, mas não a construção local.

13. `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, Playwright/Axe direcionado à rota e o gate final vigente passam antes da conclusão.

14. A story não publica a aplicação, cria gateway, envia dados reais, altera credenciais, integra serviço externo nem modifica banco, catálogo ou turma sem autorização específica.

## Escopo

### Incluído

- Rota dedicada, copy aprovada e composição responsiva.
- CTA integrado ao endereço do checkout existente.
- Tracking com evento já existente.
- SEO on-page, Open Graph, JSON-LD e sitemap.
- Testes unitários, acessibilidade e smoke local.

### Fora do escopo

- Criação/alteração do produto, turma, preço ou instrutora no banco.
- Novo checkout, gateway, CRM, automação, pixel, deploy ou experimento A/B.
- Depoimentos, métricas, escassez ou promessa de emprego.
- Alteração ampla do header, footer ou design system.

## Tasks / Subtasks

- [ ] **Task 1 — Validar pré-requisito do checkout** (AC: 2, 3, 14)
  - [ ] Confirmar o slug exato e a resposta do checkout quando houver ambiente preparado.
  - [x] Não criar `classId`, disponibilidade ou pagamento fictício.
  - [x] Se o catálogo ainda não estiver preparado, registrar a dependência e continuar a implementação local, sem alegar integração verificada.

- [x] **Task 2 — Consolidar conteúdo aprovado em modelo local tipado** (AC: 4-7)
  - [x] Estruturar hero, público, resultados, módulos, miniportfólio, oferta e FAQ.
  - [x] Distinguir Rota Essencial (36 h) do Projeto Final (4 h), totalizando 40 h.
  - [x] Incluir somente fatos do pacote e regra de integridade editorial.

- [x] **Task 3 — Criar rota, metadados e dados estruturados** (AC: 1, 10)
  - [x] Criar a rota dedicada e manter a composição no App Router.
  - [x] Criar metadata, canonical, Open Graph, `Course` e `FAQPage` factuais.
  - [x] Adicionar a rota ao sitemap.

- [x] **Task 4 — Implementar experiência da LP** (AC: 4-9)
  - [x] Implementar hero, público, programa, miniportfólio, instrutora, oferta, garantia, FAQ e disclaimer.
  - [x] Reutilizar logo, imagem de curso, design system e componentes atuais.
  - [x] Garantir semântica, foco e layout mobile-first.

- [x] **Task 5 — Integrar CTA e analytics** (AC: 2, 3, 11)
  - [x] Criar componente client-side mínimo.
  - [x] Manter texto/destino uniformes e registrar `inscricao_cta` sem PII.

- [x] **Task 6 — Implementar testes proporcionais** (AC: 7, 9-12)
  - [x] Testar copy, CTAs, tracking e integridade editorial.
  - [x] Testar metadata, JSON-LD e sitemap.
  - [x] Incluir a rota nos gates Axe e smoke sem submeter dados reais; o teste local do CTA valida somente o `href` enquanto a AC3 estiver pendente.

- [ ] **Task 7 — Executar gates e concluir documentação** (AC: 13, 14)
  - [ ] Executar lint, typecheck, unit, build, Playwright/Axe e gate final.
  - [x] Atualizar checkboxes, Completion Notes e File List.
  - [x] Não executar deploy nem integração externa.

## Dev Notes

### Arquitetura

- O App Router compõe a página; a UI vive em `src/features/public/landing-pages/departamento-pessoal-do-zero/`.
- Analytics e SEO compartilhados permanecem em `src/lib/`; primitivas ficam em `src/components/ui/`.
- Seguir o runtime atual Tailwind + Radix/primitivas próprias. Não adicionar Mantine ou MUI.
- Usar shell público com bootstrap de catálogo desativado, pois a LP é estática; não criar um segundo design system.

### Checkout

- O destino é `/cursos/departamento-pessoal-do-zero/checkout`, sem `classId`.
- A rota atual representa pré-inscrição e depende do catálogo público.
- Não alterar o contrato do checkout nem representar compra como confirmada.
- A ausência do produto é dependência explícita, não autorização para mutação de dados.

### Integridade de conteúdo

- A promessa é conhecimento, prática e materiais concretos para melhorar o preparo.
- Não garantir emprego, salário, indicação ou prazo de colocação.
- eSocial, FGTS Digital e DCTFWeb ficam sujeitos à validação técnica final da instrutora antes do relançamento.
- Não exibir certificado, prova social ou benefício ausente do pacote.

### SEO, design e acessibilidade

- Reutilizar o design system atual e a imagem existente de Departamento Pessoal.
- Não adicionar `aggregateRating`, alunos ou urgência ao JSON-LD.
- Alvos interativos mínimos de 44 px; zero violações WCAG 2.1 A/AA no gate Axe.
- Usar `inscricao_cta`; analytics ausente não bloqueia navegação.

## Testing

- Vitest + Testing Library para conteúdo, CTAs, evento e integridade.
- Contrato para metadata, canonical, Open Graph, `Course`, `FAQPage` e sitemap.
- Playwright/Axe para a rota da LP; smoke local em mobile e desktop quando coberto pelo projeto.
- Confirmar o destino do checkout sem submeter dados reais.
- Não atualizar baseline visual sem revisão explícita.

## CodeRabbit Integration

> Disabled: `coderabbit_integration.enabled` não está ativo em `.aiox-core/core-config.yaml`.

## Change Log

| Data | Versão | Descrição | Autor |
| --- | ---: | --- | --- |
| 2026-08-30 | 0.1 | Draft inicial da LP de venda, com conversão única, integridade, SEO, acessibilidade e checkout existente. | River (@sm) |
| 2026-08-30 | 0.2 | PO validou com GO após alinhar gate arquitetural, lifecycle Approved e separar o contrato local do CTA da integração real pendente. | Pax (@po) |
| 2026-08-30 | 0.3 | LP local implementada e validada nos gates direcionados; lifecycle mantido em InProgress por checkout não comprovado e regressão completa sem Supabase local. | Dex (@dev) |

## Dev Agent Record

### Agent Model Used

GPT-5.6, persona Dex (`@dev`).

### Debug Log References

- `npm run lint` → PASS.
- `npm run typecheck` → PASS.
- `npm run test:unit` → PASS, 82 arquivos e 815 testes.
- `npm run build` → PASS; rota estática `/lp/departamento-pessoal-do-zero` gerada.
- Axe direcionado à LP → PASS, zero violações WCAG 2.1 A/AA.
- Smoke direcionado à LP → PASS, resposta 2xx e sem error boundary/erros de console.
- Responsividade direcionada → PASS em 390×844 e 1440×900, sem overflow horizontal.
- Preview local → HTTP 200 com headline, produto e preço presentes.
- `npm test` → BLOCKED pelo ambiente: Supabase local indisponível em `127.0.0.1:54321`; a CLI confirmou que o Docker daemon não está ativo. A execução foi interrompida após 17 falhas de infraestrutura, 1 teste interrompido e 22 passes.
- `git diff --check` → PASS.
- Revisão de contraste — `npm run lint`, `npm run typecheck`, teste unitário da LP e Playwright direcionado → PASS.
- Axe direcionado a `/lp/departamento-pessoal-do-zero` após a correção de contraste → PASS, zero violações WCAG 2.1 A/AA.

### Completion Notes List

- Implementada LP completa de venda em rota dedicada, com copy fiel ao pacote aprovado e sem prova social ou promessa profissional fabricada.
- Criado modelo de conteúdo tipado com oito módulos, sete entregas, itens incluídos, público, resultados e FAQs.
- CTA único repetido em pontos estratégicos, sempre para o endereço previsto do checkout e com evento `inscricao_cta` sem PII.
- SEO próprio com metadata, canonical, Open Graph, `Course`, `FAQPage` e sitemap.
- Contraste corrigido após o primeiro gate Axe; reexecução passou com zero violações.
- Nenhuma dependência, variável de ambiente, dado, catálogo, turma, deploy ou integração externa foi alterada.
- Dependência pendente: o slug `departamento-pessoal-do-zero` não foi encontrado em código/seed e o checkout real não pôde ser comprovado. A LP local está pronta; a story não está pronta para `Done`/`Ready for Review` até essa evidência e o gate completo em ambiente preparado.
- DoD parcial: requisitos locais, estrutura, segurança, testes direcionados, build, lint e documentação passam; integração real e regressão completa permanecem pendentes pelos bloqueios acima.

### File List

- `docs/stories/2026-08-30-lp-departamento-pessoal-do-zero.md`
- `app/lp/departamento-pessoal-do-zero/page.tsx`
- `app/sitemap.ts`
- `src/features/public/landing-pages/departamento-pessoal-do-zero/content.ts`
- `src/features/public/landing-pages/departamento-pessoal-do-zero/department-personnel-zero-cta.tsx`
- `src/features/public/landing-pages/departamento-pessoal-do-zero/department-personnel-zero-landing-page.tsx`
- `src/__tests__/features/public/department-personnel-zero-landing-page.test.tsx`
- `tests/a11y.spec.ts`
- `tests/dp-zero-landing.spec.ts`
- `tests/smoke-crawl.spec.ts`

## QA Results

### Gate arquitetural — 2026-08-30

**Veredito:** CONCERNS. A implementação local e o delta do campaign shell estão aprovados arquiteturalmente; o lifecycle deve permanecer `InProgress` por duas lacunas de evidência externas.

#### Findings remanescentes

1. **P1 — Checkout/slug não comprovado.** O destino está centralizado e uniforme, mas não há evidência de produto publicado nem de resposta funcional de `/cursos/departamento-pessoal-do-zero/checkout`. Bloqueia `Ready for Review` e `Done`.
2. **P1 — Regressão completa não concluída.** Os gates direcionados passaram, mas `npm test` depende de Docker/Supabase local e foi bloqueado pela indisponibilidade de `127.0.0.1:54321`. É lacuna ambiental, não defeito identificado na LP.

#### Finding resolvido durante o gate

- **P2 — Conversão concorrente no shell público:** resolvido com shell de campanha feature-local, server-side e sem navegação/CTA comercial paralelo. O skip link, os landmarks, a marca e os tokens existentes foram preservados sem hidratação desnecessária.

#### Pontos aprovados

- Arquitetura feature-first, rota fina e client-side restrito ao CTA.
- Copy íntegra, sem prova ou promessa profissional fabricada.
- Analytics sem PII e navegação independente da disponibilidade do GA.
- Metadata, canonical, Open Graph e JSON-LD factuais.
- Design system existente, sem nova dependência.
- Lint, typecheck, unit, build, Axe, smoke e responsividade direcionados com PASS.

**Recomendação:** manter `InProgress`; comprovar checkout e reexecutar `npm test` em ambiente preparado antes do gate final.

## Story Draft Checklist Validation

| Categoria | Status | Observações |
| --- | --- | --- |
| Goal & Context Clarity | PASS | Objetivo, público, valor e conversão única explícitos. |
| Technical Implementation Guidance | PASS | Rota, feature, checkout, analytics, SEO e estrutura definidos. |
| Reference Effectiveness | PASS | Requisitos críticos resumidos com rastreabilidade. |
| Self-Containment Assessment | PASS | Oferta, restrições, dependência e conteúdo obrigatório presentes. |
| Testing Guidance | PASS | Unit, integração, SEO, smoke e WCAG especificados. |
| CodeRabbit Integration | N/A | Integração não habilitada. |

**Final Assessment:** READY para validação do PO e implementação local posterior. A existência do produto e de opção elegível no checkout é obrigatória para marcar `Done`.
