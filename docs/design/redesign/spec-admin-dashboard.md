# Spec de Fidelidade — Admin Dashboard (`/admin`)
**Canvas:** `RH Cursos Admin Dashboard.dc.html` · **View atual:** `src/features/admin/dashboard/admin-dashboard-page.tsx` · **Story de implementação:** `pendente`

## Objetivo da página

Dar visão operacional rápida do negócio e concentrar ações de gestão sobre cursos, leads, alunos e receita.

## Seções

### 1. Cabeçalho
- Título único `Visão Geral`.

### 2. KPIs principais
- Grid de 4 cards:
  - total de alunos
  - cursos ativos
  - vendas do mês
  - novos leads
- Cada card usa ícone, valor, helper e linha de acento.

### 3. Gestão de cursos
- Bloco com:
  - título `Gerenciar Cursos`
  - botões `Exportar CSV` e `Novo Cadastro`
  - busca por título ou categoria
  - tabela com título, categoria, status e ações
  - paginação visual

### 4. Atividades recentes
- Lista vertical com ícone contextual:
  - lead
  - pagamento
  - curso
- CTA `Ver todo o histórico`

### 5. Relatório de performance
- Faixa escura de destaque com:
  - título
  - texto de apoio
  - botões `Gerar Relatório PDF` e `Configurar Alertas`
  - grid de métricas de performance

## Contrato de dados

### Fontes
- `courses`, `classes`, `students`, `leads`, `enrollments`
- métricas derivadas por `buildDashboardMetrics`
- atividades por `buildRecentActivities`
- performance por `buildPerformanceStats`

## Notas de UX

- Página `hi-fi` porque é o principal cockpit administrativo.
- A busca e o export precisam ser tratados como ações primárias de operação, não acessórios visuais.
