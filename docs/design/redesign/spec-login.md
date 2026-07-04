# Spec de Fidelidade — Login (`/login`)
**Canvas:** `RH Cursos Login.dc.html` · **View atual:** `src/views/public/Login.tsx` · **Story de implementação:** `pendente`

## Objetivo da página

Autenticar usuários por perfil e encaminhá-los à área correta com clareza de contexto.

## Seções

### 1. Painel visual lateral
- Visível apenas em desktop.
- Imagem full-height com overlay escuro.
- Marca RH Cursos em grande escala.
- Headline institucional.
- Card de prova de valor com `ShieldCheck`.

### 2. Card de login
- Cabeçalho:
  - H1 `Acesse sua conta`
  - texto de apoio
- Banner opcional quando `status=required`
- Seletor de perfil em 3 cards:
  - Administração
  - Aluno
  - Instrutor
- Alert de erro com ícone
- Formulário:
  - e-mail
  - senha
- Rodapé com:
  - `Esqueci minha senha`
  - `Voltar ao site`

## Comportamento

- Validação via `zod` + `react-hook-form`.
- Login chama `POST /api/auth/session`.
- Em sucesso:
  - grava token
  - sincroniza sessão Supabase se disponível
  - salva sessão no store
  - redireciona para `next` permitido ou rota default por papel
- Em erro:
  - credencial inválida
  - indisponibilidade de servidor

## Contrato de dados

### Entrada
- `email`
- `password`
- `selectedRole: admin | student | instructor`

### Saída esperada da API
- `session { role, email, name }`
- `token`
- `supabaseSession`

## Notas de UX

- Apesar de estar classificada como `mid-fi`, a página precisa ter acabamento visual alto porque define confiança de acesso.
- O seletor de papel é parte central da arquitetura de navegação e não pode ser rebaixado a controle secundário.
