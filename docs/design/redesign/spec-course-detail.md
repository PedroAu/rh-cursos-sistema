# Spec de Fidelidade — Detalhe do Curso (`/cursos/[slug]`)
**Canvas:** `pendente` · **View atual:** `src/views/public/CourseDetail.tsx` · **Story de implementação:** `pendente`

## Objetivo da página

Converter interesse em matrícula com combinação de conteúdo consultivo, prova de valor, agenda e CTA de inscrição.

## Seções

### 1. Breadcrumb + hero comercial
- Breadcrumb textual: `Home / Cursos / {curso}`.
- Grid principal em 2 colunas no desktop.
- Coluna esquerda:
  - badges de trilha, modalidade e carga horária
  - H1 com título do curso
  - descrição longa
  - meta com avaliação e número de alunos
  - CTAs: `Inscrever-se agora` e `Programa PDF`
  - faixa de atributos: investimento, carga, modalidade, certificação
  - 3 cards-resumo: próxima janela, turmas abertas, benefícios-chave
- Coluna direita:
  - mídia hero em `aspect-video`
  - overlay escuro com botão play central

### 2. Objetivos centrais
- Fundo destacado.
- `SectionTitle` com eyebrow `Objetivos centrais`.
- Grid de 4 cards derivado de `objectives + benefits`.
- Um dos cards assume inversão visual escura para criar contraste editorial.

### 3. Decisão rápida
- Card informativo com 3 blocos:
  - perfil ideal
  - agenda
  - investimento
- Serve como camada de pré-check antes da inscrição.

### 4. Público-alvo
- Card com grid de itens do `targetAudience`.
- Cada item usa ícone `ShieldCheck`.
- Fallback textual quando o curso não possui público-alvo especificado.

### 5. Conteúdo programático
- Card com acordeão multi-expansível.
- Cada módulo mostra:
  - título
  - descrição
  - duração
  - lista de tópicos

### 6. Sidebar de conversão
- Card sticky escuro com:
  - selo `Inscrição garantida`
  - preço em destaque
  - CTA primário de inscrição
  - bloco com próxima turma
  - mini-grade com formato, carga e vagas abertas
  - lista de benefícios
  - CTA secundário `Falar com atendimento`
  - nota operacional sobre material, confirmação e atendimento

### 7. Próximas turmas
- `SectionTitle` com eyebrow `Próximas turmas`.
- Grid com `ClassCard` para cada turma vinculada ao curso.

### 8. Atendimento e autoridade
- Grid em 2 colunas:
  - coluna 1: card do instrutor com avatar, bio, especialidade, avaliação e quantidade de cursos
  - coluna 2: FAQ + card de CTA consultivo para contato/in-company

### 9. Depoimentos
- `SectionTitle` com eyebrow `Depoimentos`.
- Grid de até 3 `TestimonialCard`.
- Empty state quando não houver depoimentos relacionados.

### 10. Modal de checkout
- `CheckoutModal` acionado por:
  - CTA hero
  - CTA sidebar
  - deeplink `?checkout=1`

## Estados

- `curso inexistente`: `EmptyState` com CTA de retorno ao catálogo
- `sem turma`: hero continua, cards mostram fallback `Em breve` ou `Sob consulta`
- `sem público-alvo`: texto neutro
- `sem depoimentos`: empty state específico

## Contrato de dados

### `course`
- `id`, `slug`, `title`, `fullDescription`
- `pathName`, `modality`, `durationLabel`
- `rating`, `studentsCount`, `price`
- `image`
- `benefits[]`, `objectives[]`
- `targetAudience[]`
- `modules[]` com `title`, `description`, `duration`, `topics[]`
- `instructorId`

### `courseClasses`
- origem: classes filtradas por `courseId`
- usados para contagem, próxima turma e grid de agenda

### `instructor`
- `name`, `bio`, `specialty`, `rating`, `avatar`, `courseIds[]`

### `relatedTestimonials`
- até 3 depoimentos filtrados por nome do curso

## Notas de UX

- Esta é uma página `hi-fi` obrigatória para implementação porque carrega a maior pressão de conversão do catálogo.
- O CTA `Programa PDF` ainda está sem fluxo operacional explícito na view; precisa ser definido antes do handoff final.
- O link `#atendimento` integra a narrativa comercial com a validação humana antes da matrícula.
