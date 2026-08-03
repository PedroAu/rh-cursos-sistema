# Story REC-409: Isolar E2E com escrita no CI

## Status

InProgress

## Contexto

O job E2E do GitHub Actions executava cenários com escrita usando o Environment
`production`, mas sem as guardas e credenciais do projeto Supabase isolado. A
recusa de `assertSafeWritableIntegrationEnv` é o comportamento correto e não
uma regressão da Epic 20.

## Acceptance Criteria

1. **Given** um PR ou push comum, **when** o CI executa browser checks,
   **then** ele roda apenas build e acessibilidade sem segredos de produção
   nem flags de escrita.
2. **Given** um PR interno ou push autorizado, **when** a suíte completa é
   executada, **then** ela usa apenas o Environment GitHub `e2e`, com URL,
   refs e credenciais do projeto Supabase isolado.
3. **Given** um PR de fork, **when** o CI é disparado, **then** nenhum segredo
   de E2E é exposto e `pull_request_target` não é usado.
4. **Given** o pipeline de produção, **when** o smoke é executado,
   **then** ele permanece no Environment `production`, limita-se a rotas
   públicas e não habilita escritas no banco.
5. **Given** duas execuções de E2E de integração, **when** ambas usarem o
   mesmo projeto isolado, **then** elas são serializadas.

## Tasks

- [x] Separar checks públicos, E2E de integração e smoke de produção no CI.
- [x] Mapear secrets/variables do Environment `e2e` para o job de integração.
- [x] Executar checks públicos de acessibilidade com baseline determinístico,
  sem rede Supabase.
- [x] Documentar a configuração e os limites de segurança.
- [ ] Criar o Environment `e2e` no GitHub e cadastrar secrets/variables.
- [ ] Sincronizar migrations e Edge Functions no projeto Supabase de teste.
- [ ] Confirmar a primeira execução remota verde e encaminhar para gate QA.

## Escopo e segurança

- Não altera regra de negócio, schema, RLS ou a proteção fail-closed dos testes.
- É explicitamente independente da Epic 20.
- Produção nunca pode ser declarada como `E2E_SUPABASE_PROJECT_REF`.
- Não usar `pull_request_target` para contornar a ausência de secrets em forks.

## Arquivos alterados

- `.github/workflows/ci.yml`
- `package.json`
- `docs/CONTRIBUTING.md`
- `docs/guides/e2e-isolated-supabase-ci.md`
