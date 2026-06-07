# Diagnóstico de Segurança - RH Cursos

**Data:** 6 de junho de 2026  
**Versão do Projeto:** 0.2.0  
**Stack:** Next.js 16.2.2 + React 18.3.1 + Supabase + TypeScript

---

## 📋 Resumo Executivo

O site apresenta **vulnerabilidades críticas e altas** que precisam ser endereçadas imediatamente antes de qualquer operação em produção. Os principais riscos estão relacionados a:

1. **Segurança da Autenticação** - Credenciais hardcoded e fallback inseguro
2. **Exposição de Secrets** - Chaves sensíveis em arquivo de configuração
3. **Proteção de Rotas** - Falta de HTTPS enforcement e validação robusta
4. **CORS e Validação** - Ausência de proteção contra requisições não-autorizadas
5. **Armazenamento de Dados Sensíveis** - localStorage acessível ao JavaScript

---

## 🔴 Crítico (BLOQUEADOR PARA PRODUÇÃO)

### 1. Credenciais Hardcoded no Código Fonte

**Localização:** `src/lib/auth.ts`  
**Severidade:** CRÍTICO

```typescript
const SESSION_SECRET = process.env.AUTH_SESSION_SECRET ?? "rh-cursos-local-session-secret";

export const demoUsers: Array<DemoSession & { password: string }> = [
  {
    role: "admin",
    email: "admin@rhcursos.demo",
    password: "admin123",  // ⚠️ HARDCODED NO CÓDIGO
    name: "Admin RH Cursos"
  }
];
```

**Risco:** Qualquer pessoa com acesso ao repositório pode fazer login como admin.

**Ações Necessárias:**
- [ ] Remover todas as credenciais do código
- [ ] Usar apenas variáveis de ambiente com validação obrigatória
- [ ] Implementar rotação de credenciais em produção
- [ ] Revisar git history para remover credenciais vazadas

---

### 2. AUTH_SESSION_SECRET com Fallback Inseguro

**Localização:** `src/lib/auth.ts:10`  
**Severidade:** CRÍTICO

```typescript
const SESSION_SECRET = process.env.AUTH_SESSION_SECRET ?? "rh-cursos-local-session-secret";
```

**Risco:** 
- Se a variável de ambiente não estiver configurada, usa string padrão
- Qualquer um que conheça "rh-cursos-local-session-secret" pode forjar tokens de sessão
- Sessões não são criptografadas adequadamente sem um secret robusto

**Ações Necessárias:**
```typescript
// ❌ ANTES (INSEGURO)
const SESSION_SECRET = process.env.AUTH_SESSION_SECRET ?? "default-secret";

// ✅ DEPOIS (SEGURO)
const SESSION_SECRET = process.env.AUTH_SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("AUTH_SESSION_SECRET environment variable is required");
}
```

---

### 3. Banco de Dados com Credenciais Expostas

**Localização:** `.env.example:12`  
**Severidade:** CRÍTICO

```
SUPABASE_DB_URL=postgresql://postgres:#Sucessodatabse0001@db.hwpsrujkxjhmmwphqdlz.supabase.co:5432/postgres
```

**Risco:**
- Exemplo mostra URL de conexão **com senha real**
- Senha "Sucessodatabse0001" está exposta em arquivo de exemplo
- Qualquer pessoa com este arquivo pode acessar o banco de dados de produção

**Ações Necessárias:**
- [ ] Mudar imediatamente a senha deste usuário no Supabase
- [ ] Usar apenas placeholders no `.env.example`
- [ ] Revogar acesso se o repositório foi exposto publicamente
- [ ] Implementar environment-specific credentials

---

### 4. Ausência de HTTPS Enforcement

**Localização:** `app/api/auth/session/route.ts:71`  
**Severidade:** ALTO

```typescript
response.cookies.set({
  // ...
  secure: request.nextUrl.protocol === "https:",  // ⚠️ Fallback para HTTP
  // ...
});
```

**Risco:**
- Em desenvolvimento, cookies são enviados sem proteção SSL
- Cookies de sessão podem ser interceptados via man-in-the-middle
- Nenhuma validação de que estamos em HTTPS em produção

**Ações Necessárias:**
```typescript
// ✅ FORÇAR HTTPS em produção
const isProduction = process.env.NODE_ENV === "production";
response.cookies.set({
  secure: isProduction ? true : request.nextUrl.protocol === "https:",
  sameSite: "strict",  // Mais restritivo que "lax"
  httpOnly: true,
  // ...
});
```

---

## 🟠 Alto

### 5. Validação Insuficiente em Rotas de API

**Localização:** `app/api/enrollments/route.ts`  
**Severidade:** ALTO

```typescript
export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json().catch(() => null)) as
      | Omit<Enrollment, "id" | "createdAt" | "status">
      | null;

    // ⚠️ Validação MÍNIMA - não há verificação de tipos reais
    if (!payload?.studentName || !payload.email || !payload.courseId || !payload.classId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    // ... resto do código
  }
}
```

**Risco:**
- `email` não é validado como email válido
- `studentName` pode conter SQL injection
- Campos como `cpf`, `phone` não têm masks sanitizadas
- Sem limite de taxa (rate limiting)

**Ações Necessárias:**
- [ ] Implementar validação com Zod ou similar
- [ ] Sanitizar inputs de email, CPF, telefone
- [ ] Adicionar rate limiting nas rotas públicas
- [ ] Validar tipos em runtime, não apenas em TypeScript

---

### 6. Falta de CORS Configuration

**Localização:** Nenhuma configuração CORS encontrada  
**Severidade:** ALTO

**Risco:**
- Rotas de API aceitam requisições de qualquer origem
- Cross-origin POST sem proteção CSRF
- Possível exploitation via sites maliciosos

**Ações Necessárias:**
```typescript
// Adicionar em cada rota de API
export async function POST(request: NextRequest) {
  // Validar origin
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  // ...
}

function isAllowedOrigin(origin: string | null): boolean {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    "https://rhcursos.com.br",
    "https://www.rhcursos.com.br"
  ];
  return origin ? allowedOrigins.includes(origin) : false;
}
```

---

### 7. Proteção de Rota Admin Insuficiente

**Localização:** `app/api/admin/resources/route.ts`  
**Severidade:** ALTO

```typescript
async function requireAdmin(request: NextRequest) {
  const session = await decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  return session?.role === "admin";
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  // ⚠️ Sem CSRF protection, sem rate limiting
  // ...
}
```

**Risco:**
- Sem proteção CSRF: qualquer site pode fazer requisições administrativas
- Sem rate limiting: brute force possível
- Sem logging de operações administrativas
- Sem validação de payload detalhada

**Ações Necessárias:**
- [ ] Implementar CSRF tokens
- [ ] Adicionar rate limiting (mais restritivo para admin)
- [ ] Implementar audit logging
- [ ] Validar schemas com Zod

---

### 8. Armazenamento de Dados em localStorage

**Localização:** `src/lib/app-store.tsx`  
**Severidade:** ALTO

```typescript
const stored = window.localStorage.getItem(STORAGE_KEY);
window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
```

**Risco:**
- localStorage é acessível via JavaScript (vulnerável a XSS)
- Dados de sessão e usuario podem ser roubados
- Sem criptografia de dados em repouso no cliente

**Ações Necessárias:**
- [ ] Remover dados sensíveis de localStorage
- [ ] Usar apenas cookies HttpOnly para sessão
- [ ] Se precisar de storage cliente, usar encriptação
- [ ] Implementar CSP (Content Security Policy) contra XSS

---

### 9. Ausência de Content Security Policy (CSP)

**Localização:** `app/layout.tsx`  
**Severidade:** ALTO

**Risco:**
- Vulnerável a XSS attacks
- Scripts externos podem ser carregados sem validação
- Dados podem ser exfiltrados para domínios arbitrários

**Ações Necessárias:**
```typescript
// Adicionar em app/layout.tsx ou next.config.mjs
export const metadata = {
  // ...
  robots: {
    index: true,
    follow: true
  }
};

// Implementar CSP headers
// No middleware.ts:
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
  );
  
  return response;
}
```

---

## 🟡 Médio

### 10. Exposição de Informações Sensíveis em Erros

**Localização:** `app/api/leads/route.ts:26`  
**Severidade:** MÉDIO

```typescript
catch (error) {
  const message = error instanceof Error ? error.message : JSON.stringify(error);
  console.error("Error creating lead:", message);
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
  // ⚠️ Retorna mensagem de erro real ao cliente
}
```

**Risco:**
- Mensagens de erro podem expor estrutura do banco de dados
- Stack traces podem revelar caminhos internos
- Informações sobre implementação úteis para ataque

**Ações Necessárias:**
```typescript
catch (error) {
  console.error("Error creating lead:", error);
  // Retornar apenas mensagem genérica ao cliente
  return NextResponse.json(
    { ok: false, error: "Failed to process request" },
    { status: 500 }
  );
}
```

---

### 11. Falta de Rate Limiting

**Localização:** Todas as rotas de API públicas  
**Severidade:** MÉDIO

**Risco:**
- Brute force em login (/api/auth/session)
- DoS em enrollment (/api/enrollments)
- DoS em lead creation (/api/leads)

**Ações Necessárias:**
- [ ] Implementar rate limiting por IP
- [ ] Diferentes limites: 5/min para login, 10/min para leads/enrollments
- [ ] Usar biblioteca como `Ratelimit` (Upstash, Redis)

---

### 12. Ausência de Helmet / Security Headers

**Localização:** `next.config.mjs`  
**Severidade:** MÉDIO

**Risco:**
- Sem X-Frame-Options: vulnerável a clickjacking
- Sem X-Content-Type-Options: MIME type sniffing
- Sem Strict-Transport-Security: downgrade attacks

**Ações Necessárias:**
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }
        ]
      }
    ];
  }
};
```

---

### 13. Configuração de Imagens Remota Ampla

**Localização:** `next.config.mjs:8-13`  
**Severidade:** MÉDIO

```javascript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "images.unsplash.com"  // ✅ OK - restritivo
    }
  ]
}
```

**Status:** ✅ BOAS PRÁTICAS - Está restritivo ao Unsplash

---

### 14. Supabase Client sem Validação

**Localização:** `src/lib/supabase/client.ts`  
**Severidade:** MÉDIO

**Risco:**
- Sem validação se Supabase está configurado em todas operações
- Fallback silencioso pode mask erros de produção

---

### 15. Falta de Logging de Segurança

**Localização:** Todo o código  
**Severidade:** MÉDIO

**Risco:**
- Sem auditoria de login/logout
- Sem rastreamento de operações admin
- Impossível investigar incidentes de segurança

---

## 🟢 Baixo

### 16. TypeScript Strict Mode ✅

**Status:** ✅ IMPLEMENTADO CORRETAMENTE  
`tsconfig.json` com `"strict": true`

---

### 17. Validação de Tipos ✅

**Status:** ✅ PARCIALMENTE IMPLEMENTADO  
- TypeScript valida em compile-time
- Runtime validation é fraco (sem Zod)

---

## 📊 Matriz de Risco

| Severidade | Qtd | Status |
|-----------|-----|--------|
| 🔴 Crítico | 4 | BLOQUEADOR |
| 🟠 Alto | 5 | URGENTE |
| 🟡 Médio | 7 | IMPORTANTE |
| 🟢 Baixo | 2 | OK |

**Score Total:** 18/18 problemas identificados

---

## 🔧 Plano de Ação Recomendado

### Fase 1: Bloqueadores Críticos (24-48 horas)
- [ ] Remover credenciais hardcoded
- [ ] Forçar AUTH_SESSION_SECRET obrigatório
- [ ] Mudar credenciais DB expostas
- [ ] Remover fallback de SESSION_SECRET

### Fase 2: Segurança Alta (1 semana)
- [ ] Implementar validação com Zod
- [ ] Adicionar rate limiting
- [ ] Implementar CSRF protection
- [ ] Configurar CORS
- [ ] Remover dados sensíveis de localStorage

### Fase 3: Hardening (2 semanas)
- [ ] Implementar CSP
- [ ] Adicionar security headers
- [ ] Configurar logging/auditoria
- [ ] Remover exposição de erros
- [ ] Validação de HTTPS obrigatória

### Fase 4: Monitoramento (Contínuo)
- [ ] Implementar alertas de segurança
- [ ] WAF (Web Application Firewall)
- [ ] Regular security audits
- [ ] Dependency scanning
- [ ] SAST (Static Application Security Testing)

---

## 🛡️ Checklist de Segurança para Deploy

- [ ] Todos os bloqueadores críticos resolvidos
- [ ] Variáveis de ambiente configuradas em produção
- [ ] HTTPS obrigatório
- [ ] Rate limiting ativo
- [ ] Logs de auditoria funcionando
- [ ] CSP headers configurados
- [ ] CORS validado
- [ ] Dependency audit passou (npm audit)
- [ ] Código review de segurança completado
- [ ] Teste de penetração realizado

---

## 📚 Referências OWASP Top 10 2021

| OWASP Top 10 | Aplicável? | Status |
|---|---|---|
| A01:2021 - Broken Access Control | ✅ SIM | ⚠️ Alto |
| A02:2021 - Cryptographic Failures | ✅ SIM | 🔴 Crítico |
| A03:2021 - Injection | ✅ SIM | 🟠 Alto |
| A04:2021 - Insecure Design | ✅ SIM | 🟠 Alto |
| A05:2021 - Security Misconfiguration | ✅ SIM | 🔴 Crítico |
| A06:2021 - Vulnerable & Outdated Components | ⚠️ PARCIAL | 🟢 OK |
| A07:2021 - Identification & Authentication Failures | ✅ SIM | 🔴 Crítico |
| A08:2021 - Software & Data Integrity Failures | ⚠️ PARCIAL | 🟡 Médio |
| A09:2021 - Logging & Monitoring Failures | ✅ SIM | 🟡 Médio |
| A10:2021 - SSRF | ❌ NÃO | 🟢 OK |

---

**Documento Preparado Por:** Claude Code Security Audit  
**Data:** 6 de junho de 2026  
**Próxima Revisão Recomendada:** Após implementação das correções críticas
