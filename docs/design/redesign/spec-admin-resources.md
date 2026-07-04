# Spec de Fidelidade — Admin Recursos (`/admin/*`)
**Canvas:** `pendente` · **View atual:** `src/views/admin/AdminResourcePage.tsx` · **Story de implementação:** `pendente`

## Objetivo da página

Operar CRUDs administrativos com clareza de contexto, busca, estatísticas e edição estruturada.

## Recursos cobertos

- cursos
- turmas
- alunos
- leads
- inscrições
- instrutores
- blog

## Estrutura base

### 1. Cabeçalho
- título e descrição variam por recurso
- CTA `Novo Cadastro` quando `canCreate = true`

### 2. Cards de resumo
- quando há `config.stats`, mostrar grid com métricas do recurso
- caso contrário, mostrar fallback com:
  - registros visíveis
  - modo de operação
  - atalho `N`

### 3. Barra operacional
- painel com busca contextual
- ações de import/export quando o recurso suportar

### 4. Tabela principal
- colunas definidas por `buildResourceConfig`
- linhas filtradas pela busca
- ações por linha: editar, excluir e variações contextuais

### 5. Modal de criação/edição
- `Dialog` com:
  - título e descrição
  - seções agrupadas por tipo de campo
  - feedback de validação por campo
  - footer com ações de salvar/cancelar

## Tipos de campo relevantes

- `readonly`
- `textarea`
- `array`
- `modules`
- `multiselect`
- campos simples de dados principais

## Comportamento

- atalho `N` abre criação rápida em contexto admin
- `config.onSave()` centraliza persistência
- erros de validação mapeados por campo

## Notas de UX

- Esta é uma spec `hi-fi` obrigatória porque o admin concentra o maior débito operacional do projeto.
- O modal precisa parecer ferramenta de gestão real, não formulário genérico.
