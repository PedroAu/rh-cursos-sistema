# REC-204 — Relatório sanitizado da Fase A

## Estado

Implementação local concluída; validação operacional com conta de teste em
homologação ainda pendente. Nenhum e-mail, identificador, token ou segredo real
é registrado neste documento.

## Evidência automatizada

- allowlist vazia preserva integralmente o caminho HMAC;
- conta fora da allowlist mantém `Authorization`, `apikey` e `x-rh-session`;
- conta na allowlist exige usuário SSR fresco e papel `admin` resolvido por
  `requireServerRole` no BFF;
- login da conta na allowlist usa somente cookies SSR, exige MFA/AAL2 quando
  aplicável e não emite token HMAC nem tokens Supabase no corpo;
- testes unitários confirmam que leitura da sessão, proteção do layout
  administrativo e logout da conta em rollout usam a autoridade SSR, inclusive
  quando existe cookie HMAC antigo;
- o BFF descarta headers internos enviados pelo browser e os reconstrói;
- conta allowlisted sem SSR retorna `401`, sem fallback HMAC;
- rebaixamento simulado na fonte retorna `403` na requisição seguinte;
- canal BFF → Edge usa a service role existente e identidade interna mínima;
- Edge rejeita o HMAC de uma conta presente na allowlist, impedindo bypass
  direto do BFF.
- testes importam diretamente o módulo Deno de autenticação e comprovam:
  service role dupla obrigatória, identidade interna incompleta rejeitada,
  HMAC allowlisted rejeitado e HMAC fora da allowlist preservado;
- testes de `getServerSession` comprovam prioridade SSR sobre cookie HMAC
  antigo e negação sem sessão SSR; logout comprova chamada a `signOutSSR`.

Gates locais em 2026-07-17:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test:unit`: PASS — 74 arquivos, 742 testes;
- `npm run build`: PASS com valores efêmeros de build para as variáveis
  obrigatórias, sem gravar credenciais.

## Validação operacional concluída (2026-07-18)

Ambiente: projeto Supabase de TESTE isolado ("site-teste"), criado
especificamente para esta validação — schema completo (32 migrations),
Edge Functions deployadas, sem qualquer relação com o banco de produção.
Conta administrativa de teste dedicada (e-mail não reproduzido aqui;
identificador de sessão único, sem MFA configurado no projeto de teste).

Procedimento executado na ordem exigida (anti-bypass):

1. Allowlist (`SSR_AUTH_ROLLOUT_ACCOUNTS`) configurada primeiro no runtime
   Edge (Supabase secrets).
2. Provado por chamada HTTP direta ao Edge: um token HMAC recém-assinado
   (mesma chave, payload válido) para a conta allowlisted recebeu `401` —
   o Edge nunca aceita HMAC para conta em rollout, mesmo com assinatura
   válida.
3. Confirmado, no mesmo passo, que uma conta **fora** da allowlist com HMAC
   válido continua recebendo `200` — comportamento pré-existente preservado
   (anti-lockout, AC 1).
4. Allowlist então configurada no runtime Next (`.env.local` de
   desenvolvimento local, apontando para o projeto de teste).
5. Login SSR da conta de teste: sucesso, `authMode: "ssr"`, sem token HMAC
   emitido, sessão apenas em cookie `httpOnly` do Supabase.
6. Operação real via BFF (`/api/functions/admin-resources`) com a sessão
   SSR: autorizada (`200`), passando por `requireServerRole` e pelo canal
   confiável BFF→Edge (service role), exatamente o caminho de produção.
7. Logout (`DELETE /api/auth/session`) seguido da mesma operação: `401`,
   sem fallback para HMAC.
8. Novo login, rebaixamento do papel **na fonte** (Supabase Auth
   `app_metadata.role` e `public.profiles.role`, ambas as camadas de
   autorização), requisição seguinte na **mesma sessão já autenticada**
   (sem novo login): `403` — confirma bloqueio imediato, não apenas em
   mecanismo testado como em REC-203, mas em rota HTTP real (AC 2).
9. Papel da conta de teste restaurado (`admin`) por roll-forward; nova
   requisição na mesma sessão voltou a `200`, confirmando que a restauração
   é efetiva e que nenhum estado inconsistente ficou para trás.

Todas as verificações (1)-(9) correspondem às ACs 1, 2 e 3 da Fase A da
story REC-204. Nenhuma credencial, token completo ou identificador real de
produção foi registrado neste relatório.

A Fase A está **validada operacionalmente**. O gate humano da Fase B
(cutover total + remoção do HMAC) passa a ser elegível para solicitação —
ainda pendente de confirmação humana explícita, conforme Task 4 da story.
