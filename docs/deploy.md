# Deploy

Este projeto e um app Next.js com App Router, Supabase e Asaas. O deploy no Cloudflare deve usar Workers com OpenNext, porque o app tem Server Actions, rotas dinamicas, auth por cookies e API routes.

## Comandos

```bash
npm ci
npm run deploy:check
npm run preview:cloudflare
```

`npm run deploy:check` executa lint, typecheck, testes unitarios e build de producao para Cloudflare Workers.

## Guardrails de build

- `npm run build` executa apenas `next build`. Use para diagnostico/framework, nao como artefato de producao deste projeto.
- `npm run build:cloudflare` executa `opennextjs-cloudflare build` e gera `.open-next/worker.js`, que e o artefato usado pelo Worker.
- `npm run deploy:check` e o comando recomendado antes de qualquer deploy, porque encadeia lint, typecheck, testes unitarios e build Cloudflare.
- `npm run deploy:cloudflare` publica via OpenNext Cloudflare. Operacoes remotas devem ser feitas pelo agente/responsavel de DevOps.
- Nao use `next export`, Cloudflare Pages estatico ou Vercel como caminho de producao padrao para este app.

## Variaveis de ambiente

Configure as variaveis abaixo no provedor de deploy. Use `.env.example` como base e nao versione arquivos `.env*`.

| Variavel | Escopo | Observacao |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | build/runtime publico | URL do projeto Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | build/runtime publico | Chave publica do Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | runtime servidor | Chave de service role. Nao expor no cliente. |
| `ASAAS_BASE_URL` | runtime servidor | Use sandbox em homologacao e producao em deploy final. |
| `ASAAS_API_KEY` | runtime servidor | Token da API Asaas. |
| `ASAAS_USER_AGENT` | runtime servidor | Identificador exigido nas chamadas Asaas. |
| `ASAAS_WEBHOOK_AUTH_TOKEN` | runtime servidor | Token para validar webhooks Asaas quando habilitados. |

O codigo tambem aceita os fallbacks `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SECRET_KEY`, mas os nomes acima devem ser preferidos.

## Checklist de producao

- Criar o projeto Supabase de producao e aplicar as migrations em `supabase/migrations`.
- Configurar as URLs de autenticacao no Supabase para o dominio final.
- Definir todas as variaveis de ambiente no Cloudflare antes do primeiro build.
- Trocar `ASAAS_BASE_URL` para `https://api.asaas.com/v3` quando sair do sandbox.
- Rodar `npm run deploy:check` localmente ou via CI antes de promover o deploy.
- Validar login admin, formulario publico, inscricao e fluxo de pagamento no ambiente publicado.

## Cloudflare Workers

Configuracao sugerida:

- Install command: `npm ci`
- Build command: `npm run build:cloudflare`
- Deploy command: `npm run deploy:cloudflare` quando o painel pedir um comando de deploy.
- Worker config: `wrangler.jsonc`

Como ha rotas dinamicas e Server Actions, nao use Cloudflare Pages estatico nem `next export`.
