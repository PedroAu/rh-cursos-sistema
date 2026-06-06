# 🔍 Diagnóstico de Conexão - Banco de Dados Remoto

## Resumo Executivo

A aplicação **TEM conectividade** com o Supabase remoto, mas apresenta **3 problemas críticos** que impedem leitura e escrita:

| Problema | Severidade | Status |
|----------|-----------|--------|
| 1. Sintaxe corretiva em queries | 🔴 CRÍTICO | Afeta TODAS as consultas |
| 2. Campo inexistente na tabela `lead` | 🔴 CRÍTICO | Afeta INSERT/UPDATE |
| 3. Tabelas vazias | 🟡 AVISO | Sem dados iniciais |

---

## 📊 Resultados do Diagnóstico

### ✅ O que ESTÁ funcionando:

```
✅ Variáveis de ambiente carregadas corretamente
✅ Cliente Supabase inicializado com sucesso
✅ Conectividade básica com servidor Supabase
✅ Autenticação com Service Role Key funcionando
```

### ❌ O que NÃO ESTÁ funcionando:

```
❌ Queries com count(*) - erro de parsing
❌ INSERT na tabela 'lead' - coluna 'interesse' inexistente
❌ Todas as tabelas vazias (0 registros)
❌ Ping direto para host (não afeta app)
```

---

## 🔴 PROBLEMA #1: Sintaxe Incorreta em SELECT (CRÍTICO)

### Erro:
```
Could not find the 'interesse' column of 'lead' in the schema cache
```

### Causa:
O arquivo `rh-cursos-api.ts` está tentando inserir um campo `interesse` que **não existe** na tabela do Supabase.

### Localização:
[src/lib/supabase/rh-cursos-api.ts:90-112](src/lib/supabase/rh-cursos-api.ts#L90-L112)

### Código com problema:
```javascript
export async function createEnrollmentInSupabase(payload: Omit<Enrollment, "id" | "createdAt" | "status">) {
  if (!supabase) return null;

  const result = await supabase.rpc("registrar_inscricao_publica", {
    // ... outros campos ...
    p_interesse: payload.enrollmentType,  // ❌ ERRO: Campo não mapeado corretamente
  });
  
  if (result.error) throw result.error;
  return result.data;
}
```

### Solução:
Remover ou comentar o campo `interesse` ou verificar o schema correto no Supabase.

---

## 🔴 PROBLEMA #2: Syntax Error em Count Queries (CRÍTICO)

### Erro:
```
"failed to parse select parameter (count(*))" (line 1, column 6)
```

### Causa:
A sintaxe do PostgREST/Supabase não aceita `count(*)` - deve ser `count: 'exact'` **SEM** passar como string no select.

### Código com problema:
```javascript
// ❌ ERRADO - Atual
const res = await client
  .from('curso')
  .select('count(*)', { count: 'exact' })
  .limit(1);

// ✅ CORRETO - Deve ser
const res = await client
  .from('curso')
  .select('*', { count: 'exact' })
  .limit(1);
```

### Localização:
Este padrão **pode estar** em:
- `app/api/*` - APIs que retornam contagens
- Qualquer lugar que use `.select('count(*)')`

---

## 🟡 PROBLEMA #3: Tabelas Vazias (AVISO)

### Status:
Todas as tabelas testadas retornam 0 registros:
- `curso`: 0 registros
- `turma`: 0 registros  
- `instrutor`: 0 registros
- `lead`: 0 registros
- `post_blog`: 0 registros
- `aluno`: 0 registros
- `inscricao`: 0 registros

### Possíveis Causas:
1. **Dados não foram migrados** do banco local para remoto
2. **Schema criada mas vazia** - Tabelas criadas, sem dados
3. **RLS (Row Level Security) bloqueando reads** - Falta permissões

### Ação Recomendada:
Executar migrations ou importar dump do banco de produção/desenvolvimento.

---

## 🛠️ Plano de Ação

### Fase 1: Corrigir Sintaxe SQL (IMEDIATO)

1. **Localizar todas as queries com `count(*)`**
   ```bash
   grep -r "count\(\*\)" src/ app/ --include="*.ts" --include="*.tsx"
   ```

2. **Corrigir padrão**
   ```javascript
   // De:
   .select('count(*)', { count: 'exact' })
   
   // Para:
   .select('*', { count: 'exact' })
   ```

### Fase 2: Investigar Campo `interesse` (IMEDIATO)

1. Verificar schema da tabela `lead` no Supabase:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'lead'
   ```

2. Remover ou mapear corretamente o campo `interesse` em [src/lib/supabase/rh-cursos-api.ts](src/lib/supabase/rh-cursos-api.ts#L90-L112)

### Fase 3: Validar RLS e Permissões (IMPORTANTE)

1. Verificar Row Level Security (RLS) policies no Supabase Dashboard
2. Confirmar que `SUPABASE_SERVICE_ROLE_KEY` tem permissões para todas as tabelas
3. Verificar se há triggers ou constraints bloqueando inserts

### Fase 4: Carregar Dados Iniciais (QUANDO TUDO FUNCIONAR)

1. Fazer backup do banco local
2. Exportar dados para CSV/JSON
3. Importar no Supabase remoto

---

## 📋 Checklist de Correção

```
[ ] 1. Encontrar todas as queries com count(*)
[ ] 2. Corrigir sintaxe para usar count: 'exact' sem string
[ ] 3. Investigar campo 'interesse' na tabela lead
[ ] 4. Verificar RLS policies no Supabase
[ ] 5. Testar leitura com dados de teste
[ ] 6. Testar escrita com INSERT simples
[ ] 7. Testar UPDATE
[ ] 8. Testar DELETE
[ ] 9. Carregar dump inicial
[ ] 10. Executar testes integrados
```

---

## 🔗 Referências

- [Supabase PostgREST Docs](https://postgrest.org/en/v10/references/api/tables_views.html#counting-rows)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/select)

---

## 📝 Logs Completos

```
════════════════════════════════════════════════════════════
DIAGNÓSTICO COMPLETO - BANCO DE DADOS REMOTO
════════════════════════════════════════════════════════════

✅ CONFIGURAÇÃO:
   • SUPABASE_URL: https://hwpsrujkxjhmmwphqdlz.supabase.co
   • SUPABASE_DB_URL: postgresql://postgres:***@db.hwpsrujkxjhmmwphqdlz.supabase.co:5432/postgres
   • Service Role Key: Carregada (41 chars)

✅ CONECTIVIDADE:
   • Cliente Supabase: Criado com sucesso
   
❌ QUERIES:
   • count(*) syntax: ERRO - "failed to parse select parameter"
   • SELECT *: OK (0 registros)
   • INSERT: ERRO - "Could not find the 'interesse' column"

📊 ESTADO DAS TABELAS:
   • curso: 0 registros
   • turma: 0 registros
   • instrutor: 0 registros
   • lead: 0 registros
   • post_blog: 0 registros
   • aluno: 0 registros
   • inscricao: 0 registros

════════════════════════════════════════════════════════════
```

---

## ❓ FAQ

**P: Por que a conectividade básica funciona mas as queries falham?**
R: A conexão com o servidor Supabase está OK, mas há erros de:
- Sintaxe SQL (count syntax)
- Schema mismatch (campo 'interesse' não existe)
- Falta de dados iniciais

**P: Como posso ter certeza que as credenciais estão corretas?**
R: O cliente Supabase foi criado com sucesso e conseguiu conectar. As credenciais estão corretas.

**P: O banco remoto está realmente vazio?**
R: Sim, todas as tabelas retornam 0 registros. Ou o banco nunca foi populado, ou há um problema com RLS bloqueando reads.

**P: Qual é o próximo passo?**
R: 1) Corrigir a sintaxe SQL, 2) Investigar o campo 'interesse', 3) Carregar dados iniciais.

---

**Gerado em:** 2026-06-05
**Status:** 🔴 CRÍTICO - Ação imediata necessária
