# Story REC-409 — Recuperação segura de senha

## Objetivo

Permitir que usuários solicitem um link de recuperação por e-mail, validem o callback do Supabase e definam uma nova senha sem depender de localhost.

## Critérios de aceitação

- [x] Solicitação responde de forma genérica, com rate limit e sem enumeração de usuários.
- [x] Callback aceita o fluxo PKCE (`code`) e o fluxo por `token_hash` de recuperação.
- [x] Callback também aceita o link padrão com fragmento (`access_token`/`refresh_token`) e converte-o para sessão SSR.
- [x] Nova senha exige 12 caracteres, maiúscula, minúscula, número e caractere especial.
- [x] Atualização exige sessão Supabase válida e encerra a sessão local após a troca.
- [x] Login oferece acesso à recuperação e as telas têm estados de sucesso/erro acessíveis.
- [x] Testes, typecheck e lint cobrem a jornada.

## Arquivos

- `app/api/auth/password-recovery/route.ts`
- `app/api/auth/password-update/route.ts`
- `app/auth/confirm/page.tsx`
- `app/api/auth/password-recovery/confirm/route.ts`
- `app/api/auth/password-recovery/session/route.ts`
- `app/recuperar-senha/page.tsx`
- `src/views/public/PasswordRecovery.tsx`
- `src/lib/password-recovery.ts`
- `src/__tests__/lib/password-recovery.test.ts`
- `src/__tests__/views/public/password-recovery.test.tsx`
- `tests/password-recovery.e2e.spec.ts`
- `src/views/public/Login.tsx`
