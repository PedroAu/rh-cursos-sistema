# Relatório de baseline real de cobertura — REC-404

> Nenhum segredo, credencial, token, PII ou dado de cliente é reproduzido neste documento. Apenas métricas de cobertura de código-fonte já público no repositório, comandos executados e decisões de configuração.

Story: [`docs/stories/2026-07-16-rec-404-medir-cobertura-real.md`](../../stories/2026-07-16-rec-404-medir-cobertura-real.md) · Épica 17, Onda 5 · Executor: `@dev` (Dex) · Finding: FND-15 · Requisito: NFR-06.

## 1. Problema (FND-15)

`vitest.config.ts` media cobertura sobre uma allowlist manual de 12 arquivos escolhidos a dedo, com threshold fixo de 70% aplicado apenas a esse subconjunto já bem testado. Qualquer outro arquivo do projeto — componentes, features, views, rotas — era invisível ao relatório de cobertura, mesmo quando exercitado (ou não) por testes existentes. O sinal reportado (70%+) não representava o sistema real.

REC-403 (Done) já havia identificado esse problema e encaminhado explicitamente sua correção para esta story, sem tocar na allowlist.

## 2. Mudança aplicada

Arquivo alterado: `vitest.config.ts`, bloco `test.coverage`.

**Antes:**
```
include: [
  'src/lib/validation.ts', 'src/lib/auth.ts', 'src/lib/utils.ts',
  'src/lib/company.ts', 'src/lib/get-initials.ts', 'src/lib/debounce.ts',
  'src/lib/admin-form-validation.ts', 'src/lib/analytics.ts',
  'src/lib/utils/csv-export.ts', 'src/hooks/use-hotkey.ts',
  'src/hooks/use-simulated-loading.ts', 'src/lib/hooks/useAdminSearch.ts',
]
thresholds: { statements: 70, branches: 70, functions: 70, lines: 70 }
```

**Depois:**
```
include: ['src/**/*.{ts,tsx}']
exclude: [
  'node_modules/', 'src/__tests__/', '**/*.test.ts', '**/*.test.tsx',
  '**/*.spec.ts', '**/*.spec.tsx', '**/*.stories.tsx',
  'src/lib/supabase/database.types.ts', 'src/design-tokens/**',
  'src/types/**', 'src/graphify-out/**', '**/*.d.ts',
]
thresholds: { statements: 47, branches: 39, functions: 44, lines: 48 }
```

As únicas exclusões mantidas são artefatos gerados (`database.types.ts`, `tokens.tailwind.d.ts`), tipos puros (`src/types/**`), cache de ferramenta interna (`src/graphify-out/**`, apenas JSON), e os próprios arquivos de teste/stories. Nenhum arquivo de lógica de aplicação foi excluído por conveniência.

`@vitest/coverage-v8` (v4.1.9) tem `coverage.all` com default `true` desde a série 3.x do Vitest, então ampliar `include` já é suficiente para reportar arquivos nunca importados por nenhum teste (0% de cobertura) — não apenas os arquivos que os testes tocam. Isso é o que garante que o número final é real, e não inflado por "só medir o que já é testado".

## 3. Baseline real medido (2026-07-16)

Comando: `npx vitest run --coverage`.

Resultado: 56 arquivos de teste, 601 testes, todos PASS. Nenhuma regressão em relação ao baseline de 601/601 estabelecido por REC-403.

| Métrica | Total elegível | Coberto | % |
|---|---:|---:|---:|
| Statements | 4512 | 2143 | **47.49%** |
| Branches | 3714 | 1461 | **39.33%** |
| Functions | 1462 | 648 | **44.32%** |
| Lines | 4039 | 1973 | **48.84%** |

Áreas com cobertura visivelmente baixa/zero identificadas no relatório detalhado (não corrigidas nesta story, apenas medidas): rotas administrativas do App Router (`app/admin/dashboard`, `app/admin/resources`, `app/admin/settings` — texto de rota puro, 0%), views de portal (`views/portal/*`, 0%), páginas públicas de conteúdo estático (`Home.tsx`, `About.tsx`, `Agenda.tsx`, `Login.tsx`, `BlogPost.tsx`, 0%), e módulos de infraestrutura pouco exercitados (`monitoring.ts`, `query-logging.ts`, `portal-data.ts`, `functions-client.ts`, 0%).

## 4. Decisão sobre threshold / ratchet

Não foi definida uma meta de 80%/90% — isso seria uma meta arbitrária inventada, sem base em evidência, o que a story explicitamente proíbe.

Em vez disso, `coverage.thresholds` foi fixado como **piso de não regressão** (ratchet), com uma margem conservadora abaixo do número medido para absorver variação mínima entre execuções sem gerar falso-negativo:

| Métrica | Medido | Threshold (piso) |
|---|---:|---:|
| Statements | 47.49% | 47% |
| Branches | 39.33% | 39% |
| Functions | 44.32% | 44% |
| Lines | 48.84% | 48% |

Com esses valores, `npx vitest run --coverage` passa hoje (exit code 0) e falhará automaticamente se um PR futuro reduzir a cobertura real abaixo desse piso — sem exigir que o projeto já esteja em um patamar alto de cobertura.

### Mecanismo de ratchet implementado

Usa exclusivamente `@vitest/coverage-v8` + `coverage.thresholds` nativo do Vitest, já presentes no projeto (Article IV — No Invention: nenhuma dependência nova foi adicionada). O ratchet funciona **localmente** — qualquer desenvolvedor rodando `npx vitest run --coverage` (ou o script `npm run test:coverage`, já existente) recebe falha imediata se a cobertura cair abaixo do piso.

### Recomendação de follow-up (não implementada nesta story)

Encadear `npm run test:coverage` como gate obrigatório no pipeline de CI/CD pertence ao escopo de REC-401/REC-402 (integração e ordenação do pipeline), não a esta story. Recomenda-se que essa integração seja adicionada como etapa explícita em um desses REC-* ou em uma story de follow-up dedicada, garantindo que o ratchet bloqueie merges no GitHub Actions e não apenas execuções locais.

## 5. Verificação de não regressão

| Comando | Resultado |
|---|---|
| `npm run lint` | PASS, sem warnings/erros |
| `npm run typecheck` (`next typegen && tsc --noEmit`) | PASS |
| `npx vitest run` (sem coverage) | 56 arquivos / 601 testes PASS |
| `npx vitest run --coverage` | 601 testes PASS; thresholds do ratchet OK |

Nenhuma lógica de aplicação, migration ou endpoint foi alterada. O único arquivo de produção tocado é `vitest.config.ts`.

## 6. Conclusão

FND-15 está endereçado no que compete a esta story: a allowlist artificial foi removida, a cobertura agora mede o código elegível real do projeto (`src/**`), o número real (47.49% statements / 39.33% branches / 44.32% functions / 48.84% lines) está documentado como baseline, e um ratchet local impede regressão abaixo desse piso usando apenas ferramentas já presentes no projeto. O encadeamento desse gate no CI fica como recomendação de follow-up explícita, fora do escopo desta story.
