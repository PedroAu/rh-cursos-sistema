# Seed Data - RH Cursos & Soluções

## Visão Geral

Este documento descreve como carregar dados iniciais (seed data) no Supabase para a aplicação RH Cursos.

## Arquivos

- **Migration:** `supabase/migrations/20260605000000_seed_initial_data.sql`
- **Script SQL:** `supabase/sql/seed_rh_cursos_demo.sql`
- **Script Node.js:** `scripts/load-seed-data.js`

## Dados Incluídos

### Trilhas (6)
- Departamento Pessoal, Folha de Pagamento & eSocial
- Licitações, Compras Públicas & Contratos Administrativos
- Gestão de Pessoas, Liderança & Desenvolvimento Humano
- Comunicação Institucional, Redação & Atendimento ao Cidadão
- Auditoria, Contabilidade Pública & Gestão Tributária
- Tecnologia, Dados, Processos & Inovação

### Instrutores (8)
- Mariana Teles (Folha de pagamento)
- Gustavo Ribeiro (eSocial)
- Lívia Cardoso (Licitações e contratos)
- Ricardo Braga (Gestão pública)
- Patrícia Nogueira (Liderança)
- Felipe Azevedo (Comunicação)
- Bianca Salles (Power BI)
- Henrique Monteiro (Indicadores e relatórios)

### Cursos (12)
- 2 cursos por trilha (mínimo)
- Dados completos: título, slug, descrição, objetivos, benefícios, nível, modalidade

### Turmas (12)
- 1 turma por curso
- Datas variadas entre maio e junho de 2026
- Modalidades: Online, Presencial, Híbrido, Gravado
- Status: Aberta, PoucasVagas, Encerrada

### Posts de Blog (8)
- Artigos relacionados aos cursos
- Autores: instrutores da plataforma
- Status variado: Publicado, Rascunho, Arquivado

## Como Usar

### Opção 1: Via Supabase CLI (Recomendado)

```bash
cd site-rh-cursos
supabase db push
```

A migration será aplicada automaticamente.

### Opção 2: Via SQL Direto

Execute o arquivo SQL manualmente no Supabase SQL Editor:

```bash
cat supabase/sql/seed_rh_cursos_demo.sql | supabase sql
```

### Opção 3: Via Script Node.js

```bash
npm run seed
```

(Configure este script em `package.json` se necessário)

## Validação

Após carregar os dados:

1. **Verificar no Dashboard Supabase:**
   - Abra a tabela `trilha` → deve ter 6 registros
   - Abra a tabela `instrutor` → deve ter 8 registros
   - Abra a tabela `curso` → deve ter 12 registros
   - Abra a tabela `turma` → deve ter 12 registros

2. **Testar na Aplicação:**
   ```bash
   npm run dev
   ```
   - Visite `http://localhost:3000/cursos` → deve mostrar cursos
   - Visite `http://localhost:3000/agenda` → deve mostrar turmas

3. **Verificar Console do Navegador:**
   - Não deve haver erros de API ou permission denied

## RLS (Row Level Security)

Os dados foram carregados com permissões públicas de leitura:

- **Trilhas:** Visíveis para usuários anônimos e autenticados (status `ativa = true`)
- **Cursos:** Visíveis para usuários autenticados
- **Turmas:** Visíveis para usuários anônimos (com filtros de curso e instrutor ativo)
- **Instrutores:** Visíveis para usuários autenticados
- **Posts de Blog:** Visíveis para usuários anônimos (status `Publicado`)

Para inserir/atualizar dados, use o **Service Role Key** (servidor).

## Limpeza (Rollback)

Para limpar os dados:

```sql
DELETE FROM public.post_blog;
DELETE FROM public.curso_instrutor;
DELETE FROM public.turma;
DELETE FROM public.curso;
DELETE FROM public.instrutor;
DELETE FROM public.trilha;
```

## Notas Técnicas

- **Idempotente:** O script usa `ON CONFLICT ... DO UPDATE` para permitir re-execução sem erros
- **Constraints:** Todas as foreign keys e unique constraints são respeitadas
- **Triggers:** Os triggers `*_set_updated_at` são executados automaticamente
- **Cache PostgREST:** Após carregar dados, o cache pode levar até 60 segundos para sincronizar

## Próximos Passos

1. Considerar seed para ambiente de staging/produção
2. Implementar UI de administração para adicionar/editar cursos
3. Configurar atualização periódica de dados (se necessário)
4. Documentar processo de importação de dados em lote

---

*Última atualização: 2026-06-05*
