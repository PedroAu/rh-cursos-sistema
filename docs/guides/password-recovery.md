# Configuração do e-mail de recuperação

No projeto Supabase usado pela aplicação, configure `Authentication → URL Configuration` com:

- **Site URL:** `https://www.rhcursos.com.br`
- **Redirect URLs:** `https://www.rhcursos.com.br/auth/confirm`

O template de e-mail **Reset Password** deve apontar para `{{ .ConfirmationURL }}`. O callback `/auth/confirm` aceita o link padrão com fragmento (`access_token`/`refresh_token`), o link PKCE (`code`) e links customizados com `token_hash` e `type=recovery`; em todos os casos a sessão é convertida para cookies SSR antes da tela de nova senha.

Após a confirmação, o usuário é encaminhado para `/recuperar-senha?mode=update`. A página chama `/api/auth/password-update`, que exige a sessão SSR do Supabase e encerra a sessão local depois da troca.

Em ambiente local, use a URL pública do ambiente correspondente em `NEXT_PUBLIC_APP_URL`; nunca deixe o template de produção apontando para `localhost`.
