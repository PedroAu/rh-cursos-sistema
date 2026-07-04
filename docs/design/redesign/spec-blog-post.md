# Spec de Fidelidade — Post do Blog (`/blog/[slug]`)
**Canvas:** `pendente` · **View atual:** `src/views/public/BlogPost.tsx` · **Story de implementação:** `pendente`

## Objetivo da página

Sustentar leitura editorial e conectar o conteúdo a uma ação comercial relacionada.

## Seções

### 1. Conteúdo principal do artigo
- Grid em 2 colunas no desktop.
- Coluna principal:
  - categoria em eyebrow
  - H1
  - resumo
  - meta com data e tempo de leitura
  - tags
  - card do corpo do artigo com parágrafos sanitizados

### 2. Sidebar editorial
- Card `Leitura guiada` com os 3 primeiros parágrafos como resumo numerado.
- Card de CTA relacionado:
  - título do curso vinculado
  - texto de conexão editorial-comercial
  - botão `Ver curso relacionado` quando existir curso associado
- Card `Taxonomia` com categoria, autor e tempo de leitura.
- Lista de posts relacionados da mesma categoria.

## Estados

- `post inexistente`: `EmptyState`
- `sem curso relacionado`: card CTA continua sem botão
- `sem relacionados`: área permanece com grid vazio

## Contrato de dados

### `post`
- `title`, `summary`, `content`
- `category`, `date`, `readingTime`
- `tags[]`
- `author`
- `relatedCourseId`

### Derivados
- `leadParagraphs`: 3 primeiros blocos de conteúdo
- `relatedPosts`: até 3 da mesma categoria

## Notas de UX

- É uma página `mid-fi`, mas o CTA relacionado precisa ser explícito para manter ligação com a jornada comercial.
- O conteúdo é sanitizado antes da renderização textual; a spec precisa assumir texto puro, não rich text arbitrário.
