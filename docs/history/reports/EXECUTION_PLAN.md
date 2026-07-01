# Plano de Execução: Diagnóstico de Design - Páginas de Cursos

## Resumo Executivo

**Objetivo:** Implementar 13 correções de UX/design identificadas no diagnóstico de hierarquia visual, disposição de informações e usabilidade das páginas `/cursos` e `/cursos/[slug]`.

**Escopo:** Arquivos alvo
- [src/views/public/Courses.tsx](app/cursos/page.tsx)
- [src/views/public/CourseDetail.tsx](app/cursos/[slug]/page.tsx)
- [src/components/courses/course-card.tsx](app/cursos/page.tsx)

**Priorização:** 13 tarefas em 3 sprints (alta → média → baixa)

**Data:** 2026-06-05

---

## Sprint 1: Alta Prioridade (Impacto em Conversão)

### Task 1.1: Adicionar preço ao hero do detalhe
- **Arquivo:** [CourseDetail.tsx:85-98](app/cursos/[slug]/page.tsx)
- **O que fazer:** Adicionar um `<div>` para exibir `{currency(course.price)}` ao lado de "Carga" e "Modalidade"
- **Por quê:** Preço é o dado crítico mais ausente da página
- **Teste:** Verificar que o preço aparece no hero e está alinhado com os outros campos
- **Tempo:** 5 min

### Task 1.2: Adicionar preço no CourseCard
- **Arquivo:** [course-card.tsx:50-69](app/cursos/page.tsx)
- **O que fazer:** Adicionar linha com `{currency(course.price)}` junto aos dados de duração/avaliação
- **Por quê:** Permite triagem sem navegação ao detalhe
- **Teste:** Verificar que preço aparece em todos os cards da listagem
- **Tempo:** 5 min

### Task 1.3: Exibir `targetAudience` no detalhe
- **Arquivo:** [CourseDetail.tsx](app/cursos/[slug]/page.tsx)
- **O que fazer:** Adicionar nova seção "Para quem é este curso?" com lista de públicos-alvo
- **Localização:** Antes ou logo após a seção de Objetivos
- **Por quê:** Aumenta auto-qualificação e conversão
- **Teste:** Verificar que `targetAudience` aparece com estilo consistente
- **Tempo:** 10 min

### Task 1.4: Traduzir "Secure Enrollment" para português
- **Arquivo:** [CourseDetail.tsx:162](app/cursos/[slug]/page.tsx)
- **O que fazer:** Substituir por "Matrícula garantida" ou "Inscrição segura"
- **Por quê:** Único elemento em inglês em página portuguesa
- **Teste:** Verificar que não há mais strings em inglês
- **Tempo:** 1 min

### Task 1.5: Reordenar card sticky - CTA antes de benefícios
- **Arquivo:** [CourseDetail.tsx:159-189](app/cursos/[slug]/page.tsx)
- **O que fazer:** Mover botão "Inscrever-se agora" para posição 2 (logo após preço)
- **Ordem correta:**
  1. Badge "Matrícula garantida"
  2. Preço
  3. **Botão "Inscrever-se agora"** ← MOVE AQUI
  4. Próxima turma
  5. Benefícios
  6. Botão "Falar com atendimento"
  7. Nota de rodapé
- **Por quê:** Segue padrão de product pages validado (Hotmart, Coursera)
- **Teste:** Verificar que CTA está logo após preço
- **Tempo:** 5 min

---

## Sprint 2: Média Prioridade (Consistência Visual)

### Task 2.1: Resolver seção Objetivos com full-bleed falso
- **Arquivo:** [CourseDetail.tsx:115-132](app/cursos/[slug]/page.tsx)
- **O que fazer:** Mover a `<section className="bg-surface-muted">` para FORA do grid de duas colunas
- **Como:** 
  - A seção deve estar em nível de página (fora do div space-y-8)
  - Seu background deve preencher a largura inteira da tela
  - O conteúdo interno permanece em grid centrado
- **Por quê:** Sinal visual correto de mudança de seção
- **Teste:** Verificar que fundo cinza preenche a tela de borda a borda
- **Tempo:** 10 min

### Task 2.2: Corrigir breakpoint do grid de cursos
- **Arquivo:** [Courses.tsx:284](app/cursos/page.tsx)
- **O que fazer:** Alterar `xl:grid-cols-2` para `md:grid-cols-2`
- **Localização:** Linha 284 do grid de cards
- **Por quê:** Entre 1024-1279px há coluna única desnecessária
- **Teste:** Verificar que cards em 2 colunas quando sidebar visível
- **Tempo:** 1 min

### Task 2.3: Remover cabeçalho duplicado do FAQAccordion
- **Arquivo:** [faq-accordion.tsx](app/cursos/[slug]/page.tsx) + [CourseDetail.tsx:218](app/cursos/[slug]/page.tsx)
- **O que fazer:** 
  - Remover `<h2>` interno do `FAQAccordion` ou aceitar prop `headingVisible?: boolean`
  - Deixar `SectionTitle` da página ser responsável pelo cabeçalho
- **Por quê:** Evita dois h2 consecutivos (acessibilidade)
- **Teste:** Verificar que há apenas um cabeçalho na seção FAQ
- **Tempo:** 10 min

### Task 2.4: Simplificar estrutura do hero da listagem
- **Arquivo:** [Courses.tsx:99-153](app/cursos/page.tsx)
- **O que fazer:** Remover uma camada de background desnecessária
  - Remover ou simplificar o wrapper branco `bg-white/90`
  - Deixar apenas `section` + `div.ea-container` com `bg-deep-navy`
- **Por quê:** Elimina moldura branca visível que quebra a imersão
- **Teste:** Verificar que não há linha branca separando hero do resto da página
- **Tempo:** 5 min

### Task 2.5: Exibir avatar do instrutor
- **Arquivo:** [CourseDetail.tsx:207-216](app/cursos/[slug]/page.tsx)
- **O que fazer:** Usar component `Avatar` (já existe em ui/avatar.tsx) para mostrar `instructor.avatar`
- **Localização:** Antes da especialidade na seção do instrutor
- **Padrão:** Já usado em TestimonialCard
- **Teste:** Verificar que avatar aparece com foto/iniciais
- **Tempo:** 10 min

---

## Sprint 3: Baixa Prioridade (Refinamento)

### Task 3.1: Melhorar CTA do hero da listagem
- **Arquivo:** [Courses.tsx:114-123](app/cursos/page.tsx)
- **O que fazer:** 
  - Adicionar scroll suave até o grid de cursos
  - Ou desabilitar no mobile se sidebar está abaixo do dobramento
  - Considerar mudar comportamento com âncora explícita
- **Teste:** Verificar que clique faz scroll para cursos ou tem efeito visível
- **Tempo:** 10 min

### Task 3.2: Remover ícone decorativo do CourseCard
- **Arquivo:** [course-card.tsx:38-40](app/cursos/page.tsx)
- **O que fazer:** 
  - Remover o `GraduationCap` com `aria-hidden="true"`
  - Ou usá-lo para comunicar tipo de curso (diferentes ícones por categoria)
- **Por quê:** Ocupa espaço sem informação
- **Tempo:** 5 min

### Task 3.3: Adicionar `font-display` explícito ao h1
- **Arquivo:** [CourseDetail.tsx:61](app/cursos/[slug]/page.tsx)
- **O que fazer:** Adicionar `font-display` explícito ao h1 para evitar regressões
- **Atual:** `<h1 className="text-primary">{course.title}</h1>`
- **Novo:** `<h1 className="font-display text-primary">{course.title}</h1>`
- **Teste:** Verificar que classe existe em Tailwind
- **Tempo:** 1 min

### Task 3.4: Melhorar contraste das estatísticas do hero
- **Arquivo:** [Courses.tsx:127-152](app/cursos/page.tsx)
- **O que fazer:** Aumentar contraste entre os painéis de estatísticas
  - Alterar `bg-white/[0.04]` para `bg-white/10` ou adicionar borda
  - Ou aumentar `text-white/68` para `text-white/85`
- **Teste:** Verificar que separação visual entre painéis é clara
- **Tempo:** 5 min

---

## Cronograma de Execução

| Sprint | Prioridade | Tasks | Tempo Total | Status |
|--------|-----------|-------|-------------|--------|
| 1 | Alta (Conversão) | 1.1-1.5 | ~26 min | ⏳ |
| 2 | Média (Consistência) | 2.1-2.5 | ~40 min | ⏳ |
| 3 | Baixa (Refinamento) | 3.1-3.4 | ~21 min | ⏳ |
| **TOTAL** | - | 13 tarefas | **~87 min** | - |

---

## Checklist de Qualidade

Após cada sprint:
- [ ] Código compila sem erros (TypeScript)
- [ ] Sem warnings de linting (`npm run lint`)
- [ ] Sem type errors (`npm run typecheck`)
- [ ] Página listagem carrega sem erros (F12 console)
- [ ] Página detalhe carrega sem erros (F12 console)
- [ ] Mudanças visuais verificadas em navegador (mobile + desktop)
- [ ] Links de navegação funcionam
- [ ] Filtros na listagem funcionam
- [ ] Modal de checkout abre/fecha

---

## Próximos Passos

1. **Executar Sprint 1** — 26 min (tarefas críticas de conversão)
2. **Testar** — Verificar funcionamento visual
3. **Executar Sprint 2** — 40 min (consistência visual)
4. **Testar** — Verificar responsividade e hierarquia
5. **Executar Sprint 3** — 21 min (refinamentos)
6. **QA Final** — Teste completo de ambas as páginas
7. **Commit** — Agrupar em 1 ou 2 commits bem documentados

**Tempo total estimado:** 2h (incluindo testes)
