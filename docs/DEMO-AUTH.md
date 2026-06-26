# Demo Auth — Estado Atual

## Resumo

O fluxo de autenticação publicado pela aplicação é **Supabase-only**.

- `POST /api/auth/session` autentica exclusivamente contra o Supabase Auth
- `GET /api/auth/session` sincroniza/renova a sessão HMAC do admin
- `DELETE /api/auth/session` encerra a sessão local e tenta revogação global quando possível

Não existe mais nenhum login simulado ativo no cliente.

## Onde ainda existem artefatos de demo

Os artefatos abaixo permanecem apenas como referência histórica e configuração defensiva:

| Arquivo | Papel atual | Participa do fluxo publicado? |
|---|---|---|
| `src/lib/auth.ts` | Apenas helpers de sessão HMAC do admin | Sim |
| `src/lib/env-validation.ts` | Validação geral de ambiente | Sim |

O `AppStore` não importa mais artefatos demo e não expõe login simulado.

## Feature flag

As variáveis `NEXT_PUBLIC_ENABLE_DEMO_AUTH` e `DEMO_ADMIN_PASSWORD` podem ainda aparecer em documentação histórica ou `.env.example`, mas não ativam mais nenhum caminho real de autenticação publicado.

## Fluxo real de login/logout

### Login

1. Usuário envia credenciais para `POST /api/auth/session`
2. O handler autentica com Supabase Auth
3. Apenas `app_metadata.role = "admin"` é aceito na publicação atual
4. O servidor emite cookie HttpOnly + token HMAC para o cliente admin

### Logout

1. O cliente limpa a sessão local imediatamente
2. `DELETE /api/auth/session` tenta `global signout` apenas quando há `accessToken` e `SUPABASE_SERVICE_ROLE_KEY`
3. Se a revogação global falhar ou não estiver configurada, o comportamento cai explicitamente para `local-only`

## Contrato de segurança

- Nunca considerar demo auth como caminho suportado de produção
- Nunca ativar `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true` em produção
- Nunca depender de variáveis demo para autenticação operacional
- Qualquer uso de demo auth deve ser tratado como exceção local de desenvolvimento

## Referências reais

- `app/api/auth/session/route.ts`
- `supabase/functions/auth-session/index.ts`
- `src/lib/auth.ts`
- `src/lib/env-validation.ts`
