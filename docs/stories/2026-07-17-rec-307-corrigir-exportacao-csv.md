# Story REC-307: Corrigir exportação CSV (neutralizar fórmulas)

## Status

Done

## Executor Assignment

executor: "@dev" (Dex)
quality_gate: "@qa"
quality_gate_tools:
- teste unitário do primitivo de neutralização (`neutralizeCsvFormula`) para cada caractere gatilho (`=`, `+`, `-`, `@`, `\t`, `\r`)
- teste de round-trip do conteúdo CSV gerado por `exportToCSV` (payload de injeção neutralizado, valor seguro intocado)
- confirmação de que o quoting RFC 4180 (aspas duplas dobradas) coexiste com a neutralização
- confirmação de que nenhum arquivo de autenticação (HMAC/SSR) foi tocado

## Épica e rastreabilidade

- **Épica:** [Épica 17 — Recuperação SEV-0: Segurança, Integridade e Confiabilidade Operacional](../epics/epic-17-recuperacao-sev0-seguranca-integridade.md)
- **Onda:** 3 — Operação e UX administrativa
- **Prioridade:** P1
- **Estimativa:** S
- **Findings:** FND-13
- **Requisitos:** FR-09
- **CWE:** CWE-1236 (Improper Neutralization of Formula Elements in a CSV File)
- **Dependência:** REC-303 (Done) — apenas ordenação de onda, sem relação funcional direta.

## Story

**As a** responsável por segurança de dados da RH Cursos,
**I want** que toda exportação CSV neutralize valores de célula interpretáveis como fórmula por Excel, LibreOffice Calc e Google Sheets,
**so that** um dado controlado por lead/aluno/usuário final (nome, observação, etc.) não seja executado como fórmula ao abrir o arquivo exportado por um administrador, sem alterar o dado original armazenado no banco nem regredir o quoting CSV existente.

## Contexto e valor

O achado FND-13 ("Exportação CSV não neutraliza fórmulas") aponta o risco de **CSV Formula Injection (CWE-1236)**: quando um valor de célula começa com `=`, `+`, `-`, `@`, tab (`\t`) ou carriage return (`\r`), aplicativos de planilha o interpretam como fórmula ao abrir o arquivo. Como o admin exporta dados que incluem campos de texto livre potencialmente controlados por leads/alunos (nome, e-mail, observações), um invasor pode plantar `=cmd|'/c calc'!A1` num campo público e ver a fórmula executada na máquina do administrador que abrir o CSV.

Havia **duas** implementações de exportação CSV no código:
1. `src/lib/utils/csv-export.ts` — a genérica apontada pela épica (referenciada apenas por testes).
2. `src/views/admin/AdminResourcePage.tsx` — a **efetivamente usada** para exportar leads/alunos/inscrições/catálogo na área administrativa.

Ambas envolviam cada valor em aspas e faziam o escape RFC 4180 (`"` → `""`), mas **nenhuma** neutralizava fórmulas. Esta story adiciona um único primitivo de neutralização (`neutralizeCsvFormula`) em `csv-export.ts`, exportado como fonte única da verdade, e o aplica em ambos os caminhos de serialização — corrigindo tanto o arquivo apontado pela épica quanto o caminho real de dados de usuário, sem duplicar a lógica de segurança.

## Escopo

### Incluído

- Adicionar `neutralizeCsvFormula(value: string): string` exportado em `src/lib/utils/csv-export.ts`, que prefixa com apóstrofo (`'`) qualquer string começando com `=`, `+`, `-`, `@`, `\t` ou `\r`.
- Aplicar a neutralização nas células (header e dados) de `exportToCSV` em `src/lib/utils/csv-export.ts`.
- Reutilizar o mesmo primitivo em `exportToCSV` de `src/views/admin/AdminResourcePage.tsx` (caminho real de exportação de leads/alunos/inscrições/catálogo).
- Testes unitários cobrindo cada caractere gatilho, payloads clássicos, valores seguros (sem over-neutralização) e round-trip do conteúdo CSV gerado, preservando o quoting RFC 4180.

### Fora do escopo

- Qualquer alteração de autenticação/autorização (HMAC em `src/lib/auth.ts` / `supabase/functions/_shared/auth.ts`; sessão SSR). **Intocados.**
- Alterar o dado armazenado no banco (a neutralização é só na camada de serialização/exportação).
- Refatorar as duas exportações numa só (consolidação de UI/store fica fora deste bugfix isolado).

## Decisão de segurança (No Invention — Article IV)

Segue-se o padrão OWASP (CSV Injection Prevention): **qualquer** string iniciando com um caractere gatilho é neutralizada com apóstrofo, **sem exceção**. Isso inclui casos-limite legítimos como número negativo (`-5` → `'-5`) e telefone internacional (`+5511...` → `'+5511...`). A decisão é deliberada: over-neutralizar um punhado de valores-limite é preferível a deixar um vetor de injeção aberto. A neutralização atua sobre a string bruta e **depois** vem o escape RFC 4180, de modo que os dois controles coexistem.

## Acceptance Criteria

- [x] **AC-307.01** — Existe `neutralizeCsvFormula` que prefixa `'` a qualquer valor começando com `=`, `+`, `-`, `@`, `\t` ou `\r`. Entrega mensurável da épica: "Fórmulas neutralizadas em Excel, LibreOffice e Sheets."
- [x] **AC-307.02** — `exportToCSV` de `src/lib/utils/csv-export.ts` aplica a neutralização a células de header e de dados antes do quoting.
- [x] **AC-307.03** — `exportToCSV` de `src/views/admin/AdminResourcePage.tsx` (caminho real de leads/alunos/inscrições) reutiliza o mesmo primitivo — a correção alcança o dado de usuário efetivamente exportado.
- [x] **AC-307.04** — Valores seguros (nome, curso, e-mail comum) não são alterados; não há over-quoting indevido.
- [x] **AC-307.05** — O quoting RFC 4180 (aspas duplas dobradas) coexiste com a neutralização, comprovado por teste de round-trip do conteúdo CSV gerado.
- [x] **AC-307.06** — Decisão OWASP de neutralizar casos-limite (`-5`, `+55...`) documentada e coberta por teste.
- [x] **AC-307.07** — Nenhum arquivo de autenticação (HMAC/SSR) foi tocado.
- [x] **AC-307.08** — Baseline constitucional verde: lint OK, typecheck OK, suíte agregada 672 → 684 (+12), sem regressão.

## File List

### Modificados
- `src/lib/utils/csv-export.ts` (adiciona `neutralizeCsvFormula`; aplica em header e dados)
- `src/views/admin/AdminResourcePage.tsx` (importa e aplica `neutralizeCsvFormula` na exportação real)
- `src/__tests__/lib/csv-export.test.ts` (+12 testes de neutralização e round-trip)
- `docs/epics/epic-17-recuperacao-sev0-seguranca-integridade.md` (linha de status)

### Criados
- `docs/stories/2026-07-17-rec-307-corrigir-exportacao-csv.md`
- `docs/history/reports/rec-307-corrigir-exportacao-csv-2026-07-17.md`
- `docs/qa/gates/rec-307-corrigir-exportacao-csv.yml`

## Verificação

- `npm run lint` → OK
- `npm run typecheck` → OK
- `npx vitest run` → 63 arquivos, **684/684** (baseline 672 + 12 novos), sem regressão
- `npx vitest run src/__tests__/lib/csv-export.test.ts` → **19/19**
