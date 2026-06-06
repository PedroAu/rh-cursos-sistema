# 📋 FASE 4 - Plano de Ação (Dados + Correções Restantes)

**Data:** 2026-06-05  
**Status:** 🔄 EM EXECUÇÃO

---

## 🔴 Erros Identificados no TypeCheck

Depois de resolver RLS, encontramos 9 erros de TypeScript que precisam ser corrigidos:

### 1. BlogPost Type Issues (3 erros)
**Arquivos afetados:**
- [app/blog/[slug]/page.tsx:20](app/blog/[slug]/page.tsx#L20)
- [app/blog/[slug]/page.tsx:25](app/blog/[slug]/page.tsx#L25)
- [app/blog/[slug]/page.tsx:34](app/blog/[slug]/page.tsx#L34)

**Problema:** Tipo `post` e `item` são `unknown`

**Solução:**
```typescript
// Antes
const post = await fetchBlogPostsFromSupabase();

// Depois
const post: BlogPost = await fetchBlogPostsFromSupabase();
```

---

### 2. BlogPostRow Não Exportado (1 erro)
**Arquivo afetado:**
- [src/lib/supabase/rh-cursos-api.ts:4](src/lib/supabase/rh-cursos-api.ts#L4)
- [src/lib/supabase/rh-cursos-api.ts:13](src/lib/supabase/rh-cursos-api.ts#L13)

**Problema:**
```
Module '"@/lib/supabase/mappers"' has no exported member 'mapBlogPost'
Module '"@/lib/supabase/mappers"' has no exported member 'BlogPostRow'
```

**Solução:**
Adicionar ao [src/lib/supabase/mappers.ts](src/lib/supabase/mappers.ts):
```typescript
export type BlogPostRow = Tables["post_blog"]["Row"];

export function mapBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    title: row.titulo,
    slug: row.slug,
    summary: row.resumo ?? "",
    content: row.conteudo ?? "",
    category: (row.categoria as BlogPost["category"]) ?? "Tecnologia",
    tags: Array.isArray(row.tags) ? row.tags : [],
    author: row.autor ?? "",
    date: row.publicado_em ?? "",
    readingTime: row.tempo_leitura ?? "",
    status: "Publicado",
    image: row.imagem_url ?? "",
    relatedCourseId: row.curso_id ?? ""
  };
}
```

---

### 3. Lead Type Issues (3 erros)
**Arquivos afetados:**
- [src/views/admin/AdminResourcePage.tsx:364](src/views/admin/AdminResourcePage.tsx#L364)
- [src/views/admin/AdminResourcePage.tsx:365](src/views/admin/AdminResourcePage.tsx#L365)
- [src/views/admin/AdminResourcePage.tsx:392](src/views/admin/AdminResourcePage.tsx#L392)

**Problema:**
```
Property 'preferredModality' does not exist on type 'Lead'
Property 'trainingObjective' does not exist on type 'Lead'
Property 'mainChallenges' does not exist on type 'Lead'
```

**Causa:** Essas propriedades foram removidas na Fase 1 porque não existem na tabela `lead`

**Solução:**
Remover as referências a essas propriedades:

Arquivo: [src/views/admin/AdminResourcePage.tsx](src/views/admin/AdminResourcePage.tsx)

```typescript
// Linha 364-366: REMOVER
- preferredModality: lead.preferredModality,
- trainingObjective: lead.trainingObjective,
- mainChallenges: lead.mainChallenges,

// Linha 392: REMOVER
- preferredModality: values.preferredModality,
```

---

### 4. InCompany.tsx (1 erro)
**Arquivo afetado:**
- [src/views/public/InCompany.tsx:129](src/views/public/InCompany.tsx#L129)

**Problema:** Mesma coisa - propriedade `preferredModality` não existe

**Solução:**
Remover a propriedade do objeto Lead:

```typescript
// Linha 129: REMOVER
- preferredModality: formData.preferredModality,
```

---

### 5. AppStore BlogPosts Type (1 erro)
**Arquivo afetado:**
- [src/lib/app-store.tsx:176](src/lib/app-store.tsx#L176)

**Problema:**
```
blogPosts: unknown[] is not assignable to BlogPost[]
```

**Solução:**
Tipificar corretamente:

```typescript
// Antes
blogPosts: posts.map(mapBlogPost) ?? []

// Depois
blogPosts: (posts ?? []).map((p: BlogPostRow) => mapBlogPost(p))
```

---

## 📋 Checklist de Correção

### Passo 1: Adicionar mappers de Blog
- [ ] Adicionar `BlogPostRow` type em [mappers.ts](src/lib/supabase/mappers.ts)
- [ ] Adicionar `mapBlogPost()` function em [mappers.ts](src/lib/supabase/mappers.ts)
- [ ] Validar que nenhum import quebra

### Passo 2: Remover propriedades antigas de Lead
- [ ] Remover `preferredModality` de [AdminResourcePage.tsx:364](src/views/admin/AdminResourcePage.tsx#L364)
- [ ] Remover `trainingObjective` de [AdminResourcePage.tsx:365](src/views/admin/AdminResourcePage.tsx#L365)
- [ ] Remover `mainChallenges` de [AdminResourcePage.tsx:366](src/views/admin/AdminResourcePage.tsx#L366)
- [ ] Remover `preferredModality` de [AdminResourcePage.tsx:392](src/views/admin/AdminResourcePage.tsx#L392)
- [ ] Remover `preferredModality` de [InCompany.tsx:129](src/views/public/InCompany.tsx#L129)

### Passo 3: Corrigir tipos de BlogPost
- [ ] Tipificar `post` em [app/blog/[slug]/page.tsx](app/blog/[slug]/page.tsx)
- [ ] Tipificar `item` em [app/blog/[slug]/page.tsx](app/blog/[slug]/page.tsx)
- [ ] Corrigir `blogPosts` em [app-store.tsx:176](src/lib/app-store.tsx#L176)

### Passo 4: Validar
- [ ] Executar `npm run typecheck` → 0 erros
- [ ] Executar `npm run lint` → 0 erros
- [ ] Executar `npm run build` → sem erros

---

## 🎯 Ordem de Execução Recomendada

1. **Adicionar Blog Mappers** (1 arquivo editado)
2. **Remover Lead Properties** (3 arquivos editados)
3. **Corrigir Types** (2 arquivos editados)
4. **Validar com TypeCheck** (1 comando)
5. **Testar no Navegador** (dev server)

---

## ⏱️ Tempo Estimado

- Correção de código: ~30 minutos
- Testes TypeCheck/Lint: ~5 minutos
- Teste no navegador: ~10 minutos
- **Total: ~45 minutos**

---

## 🚀 Depois de Fase 4

Após as correções acima:

1. ✅ Banco de dados remoto funcionando
2. ✅ RLS ativado em 7 tabelas
3. ✅ TypeScript sem erros
4. ✅ Aplicação compilando

**Próximo:** Carregar dados iniciais no banco

---

**Status:** 🔄 EM EXECUÇÃO  
**Blocker:** Nenhum - todos os problemas têm solução clara  
**Data Esperada:** Mesma data (2026-06-05)
