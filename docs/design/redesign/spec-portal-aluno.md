# Spec de Fidelidade — Portal do Aluno (`/aluno`)
**Canvas:** `pendente` · **View atual:** `src/views/portal/StudentPortal.tsx` · **Story de implementação:** `pendente`

## Objetivo da página

Permitir ao aluno acompanhar inscrições ativas e seu contexto básico de conta.

## Seções

### 1. Cabeçalho
- título `Portal do aluno`
- descrição curta

### 2. Cards de perfil
- grid de 3 cards:
  - aluno
  - organização
  - inscrições

### 3. Tabela `Minhas inscrições`
- cabeçalho e subtítulo explicitando limites do MVP
- empty state quando não houver inscrições
- tabela com:
  - curso
  - turma
  - status
  - pagamento
  - certificado

## Estados

- loading: texto simples
- erro: alert com ícone
- vazio: card de empty state

## Contrato de dados

### `StudentPortalData`
- `profile`
- `enrollments[]`

## Notas de UX

- Página `mid-fi`.
- O texto sobre limites do MVP faz parte da experiência e não deve sumir no handoff.
