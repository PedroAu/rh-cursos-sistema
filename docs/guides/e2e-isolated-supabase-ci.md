# E2E com Supabase isolado no GitHub Actions

## Propósito

Os testes Playwright que criam, alteram ou removem dados nunca usam produção.
O workflow [CI](../../.github/workflows/ci.yml) separa os cenários em três
lanes:

| Lane | Ambiente | Permissão de escrita | Gatilho |
| --- | --- | --- | --- |
| `Build & A11y` | sem Environment | não | PR e push usuais |
| `E2E Integration (isolated Supabase)` | `e2e` | somente projeto isolado | PR interno e push em `develop`/`feature/**` |
| `Production-safe smoke` | `production` | não | pipeline de produção |

PRs oriundos de forks não executam a lane de integração. Nunca substitua essa
proteção por `pull_request_target`, pois ele disponibilizaria credenciais para
código não confiável.

A lane pública usa o bundle Playwright determinístico e o comando
`test:a11y:baseline`. Ela não usa a URL do Supabase. O crawler de rotas é
mantido na lane de integração porque sua asserção de ausência de erros de
console também valida as assinaturas Realtime do Supabase — uma credencial
placeholder produziria um falso erro de infraestrutura.

## Configuração única no GitHub

1. Em **Settings → Environments**, crie o Environment `e2e`.
2. Crie ou escolha um projeto Supabase exclusivo para testes. Ele não pode ter
   o mesmo project ref da produção.
3. No Environment `e2e`, cadastre estes **secrets**:

   | Secret | Valor |
   | --- | --- |
   | `E2E_SUPABASE_URL` | URL do projeto Supabase isolado |
   | `E2E_SUPABASE_FUNCTIONS_URL` | URL das Edge Functions do mesmo projeto (`…/functions/v1`) |
   | `E2E_SUPABASE_PUBLISHABLE_KEY` | chave publishable/anon do projeto isolado |
   | `E2E_SUPABASE_SERVICE_ROLE_KEY` | service role do projeto isolado |
   | `E2E_AUTH_SESSION_SECRET` | segredo de sessão exclusivo do E2E |

4. No mesmo Environment, cadastre estas **variables** (não secretas):

   | Variable | Valor |
   | --- | --- |
   | `E2E_SUPABASE_PROJECT_REF` | project ref do projeto isolado |
   | `PRODUCTION_SUPABASE_PROJECT_REF` | project ref da produção |

5. Aplique migrations e publique as Edge Functions no projeto de teste antes
   da primeira execução. O schema e as Functions precisam ser compatíveis com
   o commit que será testado.
6. Opcionalmente, proteja o Environment `e2e` com aprovadores. Não configure
   esse Environment com segredos ou URL de produção.

O job configura internamente `E2E_ALLOW_DATABASE_WRITES=1` e
`E2E_TARGET_KIND=isolated-test`; não cadastre esses dois valores como segredos.
As guardas em `tests/helpers/safe-writable-env.ts` também conferem que URL,
refs e origem das Functions pertencem ao alvo isolado, falhando fechadas em
qualquer divergência.

## Operação e diagnóstico

- A execução com escrita é serializada por `e2e-supabase-isolated`, evitando
  colisões entre branches no mesmo banco de teste.
- Se o job falhar antes dos testes com mensagem de ambiente incompleto, confira
  primeiro os cinco secrets e as duas variables acima.
- Se a guarda informar refs iguais, interrompa a execução: o projeto de teste
  foi configurado como produção e não deve receber permissão de escrita.
- O arquivo local `.env.e2e.local` continua sendo a alternativa de
  desenvolvimento local e é ignorado pelo Git.
