# Troubleshooting — Soluções para problemas comuns

Guia de diagnóstico para resolver problemas durante desenvolvimento e deploy.

## Índice rápido

- [Instalação & Setup](#instalação--setup)
- [Desenvolvimento local](#desenvolvimento-local)
- [Testes](#testes)
- [Build & Deploy](#build--deploy)
- [Autenticação](#autenticação)
- [Banco de dados](#banco-de-dados)
- [Performance](#performance)
- [Perguntas frequentes](#perguntas-frequentes)

---

## Instalação & Setup

### Node ou npm não encontrado

**Erro:**
```
command not found: node
command not found: npm
```

**Solução:**

1. Verifique se Node.js foi instalado:
   ```bash
   node --version
   npm --version
   ```

2. Se não tiver, [baixe Node.js](https://nodejs.org/) — v24 ou superior.

3. Reinicie seu terminal após instalação.

4. Se ainda não funcionar, limpe o cache npm:
   ```bash
   npm cache clean --force
   ```

### Erro ao rodar `npm install`

**Erro comum:**
```
ERR! 404 Not Found - GET https://registry.npmjs.org/...
ERR! 404 ... is not in this registry.
```

**Soluções:**

1. Verifique sua conexão internet:
   ```bash
   curl https://registry.npmjs.org/react
   ```

2. Limpe o cache:
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

3. Atualize npm:
   ```bash
   npm install -g npm@latest
   ```

### "Invalid or expired token" ao npm install

**Causa:** Token de autenticação npm expirou ou está inválido.

**Solução:**

```bash
# Logout
npm logout

# Login novamente
npm login

# Tente novamente
npm install
```

---

## Desenvolvimento local

### `npm run dev` trava ou não inicia

**Possíveis causas:**

1. **Porta 3000 em uso**
   ```bash
   # Verificar qual processo está usando a porta
   lsof -i :3000        # macOS/Linux
   netstat -ano | findstr :3000  # Windows

   # Liberar a porta ou mudar porta
   npm run dev -- -p 3001
   ```

2. **`.env.local` faltando ou inválido**
   ```bash
   cp .env.example .env.local
   # Edite e preencha os valores
   ```

3. **Dependências corrompidas**
   ```bash
   rm -rf node_modules .next
   npm install
   npm run dev
   ```

### "Cannot find module" ou erro de import

**Erro:**
```
Module not found: Can't resolve '@/components/Button'
```

**Solução:**

1. Verifique o caminho do alias em `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. Certifique-se que o arquivo existe:
   ```bash
   ls src/components/Button.tsx
   ```

3. Se acabou de criar o arquivo, reinicie o servidor dev:
   ```bash
   # Ctrl+C para parar
   npm run dev
   ```

### TypeScript erro: "Object is of type 'unknown'"

**Erro:**
```
Object is of type 'unknown' when using environment variables
```

**Solução:** Use `vi.stubEnv()` em testes:

```typescript
import { describe, it, beforeEach, vi } from 'vitest';

describe('my test', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
  });
  
  it('should work', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
```

### "EADDRINUSE: address already in use"

**Erro:**
```
Error: EADDRINUSE: address already in use :::3000
```

**Solução:**

```bash
# Opção 1: Matar o processo na porta
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows (copie o PID)
taskkill /PID <PID> /F        # Windows

# Opção 2: Usar porta diferente
npm run dev -- -p 3001
```

---

## Testes

### Playwright instável ou falha aleatória

**Causa:** Execução paralela de testes E2E (especialmente visual/a11y).

**Solução:** Testes já forçam `--workers=1` (sequencial), mas se ainda falhar:

```bash
# Execute um projeto específico
npm run test:e2e:smoke -- --project=functional

# Execute com verbose
npm test -- --reporter=verbose
```

### "Timeout de conexão" em testes

**Erro:**
```
Test timeout: page.goto() exceeded 30000ms
```

**Solução:**

1. Aumente timeout em `playwright.config.ts`:
   ```javascript
   {
     timeout: 60000,  // 60 segundos
     navigationTimeout: 30000
   }
   ```

2. Verifique se `npm run dev` está rodando durante testes locais

3. Limpe cache do navegador:
   ```bash
   rm -rf .playwright
   ```

### Testes falham com "module resolution error"

**Solução:**

```bash
# Recompile TypeScript
npm run typecheck

# Reinicie os testes
npm run test:unit
```

---

## Build & Deploy

### `npm run build` falha

**Erro genérico:**
```
Error: failed to build
```

**Passos para diagnosticar:**

1. Verifique erros de tipo TypeScript:
   ```bash
   npm run typecheck
   ```

2. Verifique linting:
   ```bash
   npm run lint
   ```

3. Se o erro é "Missing environment variable", configure `.env.local` ou `.env.production.local`:
   ```bash
   cp .env.example .env.local
   # Preencha os valores Supabase
   ```

4. Limpe e tente novamente:
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

### "Variável SUPABASE não encontrada"

**Erro durante build:**
```
Error: environment variable NEXT_PUBLIC_SUPABASE_URL is not set
```

**Solução:**

```bash
# Copie o template
cp .env.example .env.local

# Preencha com seus valores Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-aqui

# Tente novamente
npm run build
```

### Build para Workers falha com "Unknown field"

**Erro:**
```
error: Unknown field "opennextjs" in wrangler.jsonc
```

**Solução:** Atualize `@opennextjs/cloudflare`:

```bash
npm update @opennextjs/cloudflare
npm run build:workers
```

### Deploy para Cloudflare falha com "unauthorized"

**Causa:** Token API Cloudflare inválido.

**Solução:**

1. Gere um novo token em [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens):
   - Template: "Edit Cloudflare Workers"
   - Permissões: Account, All Zones

2. Atualize o secret no GitHub:
   ```bash
   gh secret set CLOUDFLARE_API_TOKEN
   # Cole o token quando pedido
   ```

3. Redeploye:
   ```bash
   git push
   ```

---

## Autenticação

### Login retorna "503 Auth indisponível"

**Causa:** Supabase não está acessível ou credenciais estão erradas.

**Solução:**

1. Verifique que Supabase está online:
   ```bash
   curl https://seu-projeto.supabase.co/auth/v1/verify
   ```

2. Confira as credenciais em `.env.local`:
   ```bash
   grep SUPABASE .env.local
   ```

3. Se usar Edge Functions, verifique que estão deployadas:
   ```bash
   # No painel Supabase → Edge Functions
   # Confirme que auth-session, enrollments, leads estão verdes
   ```

### Login retorna "429" (Too many requests)

**Causa:** Rate limiting por IP (proteção contra brute-force).

**Solução:** Aguarde o header `Retry-After`:

```bash
# Exemplo: aguarde 60 segundos
sleep 60

# Tente novamente
```

Limite é **por IP**:
- Se em dev local, apenas seu IP é afetado
- Se em produção, afeta o IP do usuário

### Demo auth não funciona

**Erro:**
```
login com admin@rhcursos.demo falha
```

**Solução:**

1. Verifique que a flag está ativada em `.env.local`:
   ```bash
   NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
   ```

2. Reinicie o servidor:
   ```bash
   npm run dev
   ```

3. Tente login:
   - Email: `admin@rhcursos.demo`
   - Senha: `admin123` (ou sua senha customizada em `DEMO_ADMIN_PASSWORD`)

4. Demo auth **NUNCA** deve ser ativado em produção.

### Sessão expira rapidamente

**Causa:** `AUTH_SESSION_SECRET` inválido ou cookie não é HttpOnly.

**Solução:**

1. Regenere o secret em `.env.local`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Copie o output e atualize AUTH_SESSION_SECRET
   ```

2. Limpe cookies:
   ```bash
   # No navegador: DevTools → Application → Cookies → Delete all
   ```

3. Faça logout e login novamente

---

## Banco de dados

### "Connection refused" ao conectar Supabase

**Erro:**
```
ECONNREFUSED 127.0.0.1:5432
```

**Solução:**

1. Verifique que está usando a URL do projeto, não localhost:
   ```bash
   # Certo:
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

   # Errado:
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:5432
   ```

2. Verifique que o projeto Supabase está ativo:
   ```bash
   curl https://seu-projeto.supabase.co/auth/v1/verify
   ```

### Migration falha com "table does not exist"

**Erro durante build:**
```
Error: relation "public.users" does not exist
```

**Solução:**

1. Verifique que as migrations foram rodadas:
   ```bash
   supabase migration list
   ```

2. Se usar dev local com Supabase CLI:
   ```bash
   supabase start
   supabase db push
   ```

3. Se em produção, migrations são aplicadas automaticamente durante deploy

### RLS policy bloqueia operações

**Erro:** "new row violates row security policy"

**Solução:**

1. Verifique a policy em `supabase/migrations/`:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'sua_tabela';
   ```

2. Confira que o usuário tem permissão:
   ```sql
   -- A policy deve permitir read/write para o user_id correto
   ```

3. Consulte [`docs/database/DB-AUDIT.md`](database/DB-AUDIT.md) para a estratégia de RLS

---

## Performance

### Build lento (> 2 min)

**Solução:**

1. Analyze o bundle:
   ```bash
   npm run analyze
   ```

2. Identifique grandes dependências:
   - Procure por yellow/red em "Packages"

3. Se possível, remova ou substitua:
   ```bash
   npm uninstall nome-pacote-pesado
   ```

### Servidor dev trava ao salvar arquivo

**Causa:** Arquivo grande ou compilação pesada.

**Solução:**

1. Reinicie o servidor:
   ```bash
   npm run dev
   ```

2. Se persistir, desabilite fast refresh temporariamente:
   ```bash
   # Ctrl+C para parar
   npm run dev -- --no-fast-refresh
   ```

### Testes E2E muito lentos

**Solução:**

```bash
# Execute apenas testes funcionais (rápido)
npm run test:e2e:smoke -- --project=functional

# Pule testes de acessibilidade
npm run test:e2e:smoke -- --grep "a11y" --invert
```

---

## Perguntas frequentes

### Posso rodar múltiplas instâncias em desenvolvimento?

**Sim.** Use portas diferentes:

```bash
# Terminal 1
npm run dev -- -p 3000

# Terminal 2
npm run dev -- -p 3001
```

### Como resetar tudo e começar do zero?

```bash
# Limpe tudo
rm -rf node_modules .next .playwright dist
rm .env.local

# Reinstale
npm install
cp .env.example .env.local

# Preencha .env.local com credenciais Supabase
# Rode
npm run dev
```

### Qual versão de Node devo usar?

**Node 24+** conforme `package.json`:

```bash
node --version  # deve ser v24.x.x ou superior
```

Use [nvm](https://github.com/nvm-sh/nvm) para gerenciar múltiplas versões:

```bash
nvm install 24
nvm use 24
```

### Posso rodar em Windows?

**Sim**, mas com cuidados:

1. Use **Git Bash** ou **WSL2** (recomendado)
2. Verifique paths com `\` vs `/`
3. Alguns scripts bash podem precisar ajustes

### Como debugar erro no Playwright?

```bash
# Modo debug interativo
npx playwright test --debug

# Ou com UI
npx playwright test --ui
```

### Onde estão os logs do servidor?

Logs aparecem no terminal onde você rodou `npm run dev`:

```
  ▲ Next.js 16.2
  - Local:        http://localhost:3000

  [GET] /
  [POST] /api/auth/session
  ...
```

Para salvar em arquivo:

```bash
npm run dev > server.log 2>&1
```

---

## Ainda não resolveu?

1. **Cheque a documentação:**
   - [`README.md`](../README.md) — Overview do projeto
   - [`QUICK-START.md`](QUICK-START.md) — Setup inicial
   - [`docs/architecture/`](architecture/) — Arquitetura

2. **Procure em issues no GitHub:**
   - [Issues do projeto](https://github.com/seu-usuario/site-rh-cursos/issues)

3. **Entre em contato:**
   - Email: admin@rhcursos.com.br
   - Slack: #dev-rh-cursos

---

*Última atualização: 2026-06-26*
