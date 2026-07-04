# Spec de Fidelidade — Portal do Instrutor (`/instrutor`)
**Canvas:** `pendente` · **View atual:** `src/views/portal/InstructorPortal.tsx` · **Story de implementação:** `pendente`

## Objetivo da página

Permitir ao instrutor visualizar turmas atribuídas e alunos vinculados às suas aulas.

## Seções

### 1. Cabeçalho
- título `Portal do instrutor`
- descrição curta

### 2. Cards de perfil
- grid de 3 cards:
  - instrutor
  - especialidade
  - turmas atribuídas

### 3. Bloco `Turmas atribuídas`
- empty state quando não houver turmas
- lista de cards por turma com:
  - título do curso
  - data, modalidade e local
  - badge de status
  - vagas preenchidas
  - tabela de alunos

## Estados

- loading: texto simples
- erro: alert com ícone
- vazio: card de empty state

## Contrato de dados

### `InstructorPortalData`
- `profile`
- `classes[]`
  - `course`
  - `students[]`

## Notas de UX

- Página `mid-fi`.
- A ausência de ações operacionais explícitas faz parte do escopo MVP e deve ficar clara no texto de apoio.
