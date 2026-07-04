# Spec de Fidelidade — Admin Configurações (`/admin/configuracoes`)
**Canvas:** `pendente` · **View atual:** `src/views/admin/AdminSettingsPage.tsx` · **Story de implementação:** `pendente`

## Objetivo da página

Gerenciar identidade, notificações, integrações e administradores da plataforma.

## Seções

### 1. Cabeçalho
- título `Painel de Configurações`
- descrição sobre identidade, comunicações e acessos

### 2. Navegação por tabs
- `Configurações Gerais`
- `Notificações`
- `Integrações`
- `Gerenciamento de Usuários`

### 3. Tab `Configurações Gerais`
- grid em 2 colunas:
  - card `Identidade do Site`
  - card lateral de resumo e CTA de salvar
- seção `Logotipo e Favicon` com 2 uploads

### 4. Tab `Notificações`
- lista de toggles para:
  - novas inscrições
  - pagamentos confirmados
  - relatórios mensais
- CTA de salvar

### 5. Tab `Integrações`
- card de WhatsApp Business com status conectado
- card de e-mail marketing com providers conectáveis

### 6. Tab `Gerenciamento de Usuários`
- lista/tabular de administradores
- CTA `Novo Admin`
- badges de status ativo/inativo

## Contrato de dados

### `AdminSettings`
- `identity`
- `notifications`
- `admins`

### Persistência
- `loadAdminSettings()`
- `saveAdminSettings()`

## Notas de UX

- Fidelidade `mid-fi` é suficiente, mas a página precisa parecer institucionalmente estável e segura.
- O card lateral de `Resumo das Alterações` é o principal componente de decisão na aba geral.
