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

## Validação operacional pendente

Em homologação, configurar a mesma `SSR_AUTH_ROLLOUT_ACCOUNTS` no runtime Next
e no runtime das Edge Functions, usando somente a conta administrativa de
teste. Registrar, sem PII:

1. login SSR bem-sucedido (incluindo AAL2 se a conta possuir MFA);
2. operação real em `admin-resources` autorizada;
3. logout seguido da mesma operação retornando `401`;
4. novo login, rebaixamento do papel na fonte e requisição seguinte retornando
   `403`;
5. restauração roll-forward do papel da conta de teste.

A ativação deve ser tratada como mudança atômica de configuração. A allowlist
divergente entre Next e Edge invalida o gate: antes do teste, confirmar a
presença do mesmo identificador sanitizado nos dois runtimes; depois, provar
por chamada direta que o HMAC antigo da conta allowlisted recebe `401` no Edge.

Até essa evidência existir, a Fase A não está validada operacionalmente e o
gate humano da Fase B não é elegível.
