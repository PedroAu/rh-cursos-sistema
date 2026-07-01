# Quick Start — Primeiros 30 minutos

Seu guia de setup para rodar o site-rh-cursos localmente.

## Pré-requisitos

Antes de começar, certifique-se de ter:

- **Node.js >= 24** — [Baixar aqui](https://nodejs.org/)
- **npm >= 11** (vem com Node.js)
- **Git**
- **Um editor de código** (VS Code recomendado)
- Uma conta **Supabase** (gratuita em [supabase.com](https://supabase.com))

Valide sua instalação:

```bash
node --version    # deve retornar v24.x.x ou superior
npm --version     # deve retornar 11.x.x ou superior
git --version     # qualquer versão recente
```

## 1. Clone e instale dependências (5 min)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/site-rh-cursos.git
cd site-rh-cursos

# Instale dependências
npm install
```

Isso download e instala todas as dependências listadas em `package.json`.

## 2. Configure variáveis de ambiente (10 min)

Crie um arquivo `.env.local` na raiz do projeto com suas credenciais Supabase:

```bash
# Copie o template
cp .env.example .env.local
```

Abra `.env.local` em seu editor e preencha os valores:

### Obrigatórias

```bash
# Supabase — obtenha no dashboard (Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...

# Chave de sessão (segurança do cookie de auth)
# Gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SESSION_SECRET=seu-segredo-de-32-caracteres-aleatorio-aqui

# URL pública da aplicação (CORS, redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Opcionais (você pode ignorar por enquanto)

```bash
# Habilita demo auth (segurança: padrão é false)
NEXT_PUBLIC_ENABLE_DEMO_AUTH=false

# Google Analytics 4 (inativo se não definido)
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Dica:** Para obter as credenciais Supabase:
1. Faça login em [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto ou crie um novo
3. Vá em **Settings** → **API**
4. Copie as chaves e URLs necessárias

## 3. Rodar em desenvolvimento (5 min)

```bash
npm run dev
```

Você verá:

```
  ▲ Next.js 16.2
  - Local:        http://localhost:3000
  - Environments: .env.local
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador. Pronto!

## Próximos passos

### Explorar o código

```bash
# Testes unitários
npm run test:unit

# Linting (verificação de estilo)
npm run lint

# Type checking (TypeScript)
npm run typecheck
```

### Build de produção

```bash
# Compilar para produção
npm run build

# Visualizar a build localmente
npm run preview
```

### Rodar testes completos

```bash
# Gate completo (typecheck + build + E2E + acessibilidade)
npm test
```

Isso levará alguns minutos. Valida que tudo está funcionando.

## Estrutura do projeto

```
app/              # Next.js App Router (rotas e páginas)
src/
├── components/   # Componentes reutilizáveis (design system)
├── features/     # Lógica de features
├── lib/          # Utilitários e clientes (Supabase, auth, etc)
├── types/        # Tipos TypeScript
└── __tests__/    # Testes unitários

docs/             # Documentação (aqui está!)
supabase/
├── functions/    # Edge Functions
└── migrations/   # Mudanças de schema do banco
```

Leia [`docs/architecture/system-architecture.md`](architecture/system-architecture.md) para um mapa mais detalhado.

## Atalhos úteis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Servidor local (http://localhost:3000) |
| `npm run lint` | Verifica estilo do código (ESLint) |
| `npm run typecheck` | Verifica tipos TypeScript |
| `npm run test:unit` | Testes unitários rápidos |
| `npm test` | Suite completa de testes |
| `npm run build` | Build de produção |
| `npm run storybook` | Design system explorer (port 6006) |

## Dúvidas?

- **Erro com Supabase?** Veja [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
- **Documentação da API?** Leia [`api/README.md`](api/README.md)
- **Deploy para produção?** Veja [`DEPLOYMENT.md`](DEPLOYMENT.md)
- **Arquitetura do sistema?** Leia [`architecture/system-architecture.md`](architecture/system-architecture.md)

---

## Resumo dos 30 minutos

✓ Node/npm instalado e validado (5 min)  
✓ Código clonado e dependências instaladas (5 min)  
✓ `.env.local` configurado com credenciais Supabase (10 min)  
✓ `npm run dev` rodando em http://localhost:3000 (5 min)

Você está pronto para começar a desenvolver!
