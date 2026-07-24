# Sessão SSR — RH Cursos

## Autoridade

Supabase Auth é a única autoridade de identidade, papel e revogação. A sessão
é mantida pelo `@supabase/ssr` em cookies `httpOnly`, `secure` em produção,
`SameSite=Lax` e `path=/`. Tokens Supabase nunca são devolvidos ao browser nem
persistidos em `localStorage`.

## Endpoint canônico

`/api/auth/session` é o único contrato de sessão da aplicação:

- `POST` autentica por e-mail e senha; quando existe fator MFA, exige AAL2.
- `GET` valida a sessão atual e retorna apenas identidade, papel e AAL.
- `DELETE` encerra a sessão e tenta revogação global no Supabase; mesmo em
  falha remota, limpa os cookies locais e retorna `mode: local-only`.

Todos os retornos usam `Cache-Control: no-store` e falham fechado quando a
configuração, sessão ou autorização não é válida.

## Renovação

O middleware chama o cliente SSR do Supabase no limite de navegação protegida e
propaga os cookies renovados via `Set-Cookie`. Os guards server-side continuam
responsáveis por autorização; o middleware não decide papéis.

## Logout

O cliente chama `DELETE /api/auth/session` sem enviar tokens. O refresh token
permanece somente no cookie SSR e é usado pelo servidor para solicitar logout
global. A revogação de JWTs de acesso já emitidos continua limitada à semântica
do Supabase; operações sensíveis revalidam a sessão e o papel no servidor.

## Segurança

- Não aceitar `x-rh-session`, HMAC ou tokens legados.
- Não registrar credenciais, tokens ou cookies.
- Rate limit aplicado ao login e às operações sensíveis.
- `401` deve limpar o estado local e redirecionar para `/login`.

## Rotas removidas

`/api/auth/ssr-session` foi removida para evitar dois contratos concorrentes.
Consumidores devem usar `/api/auth/session`.
