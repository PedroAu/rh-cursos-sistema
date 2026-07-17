# Relatório de Evidência — REC-307: Corrigir exportação CSV (neutralizar fórmulas)

**Data:** 2026-07-17
**Story:** [docs/stories/2026-07-17-rec-307-corrigir-exportacao-csv.md](../../stories/2026-07-17-rec-307-corrigir-exportacao-csv.md)
**Épica:** Épica 17 — Recuperação SEV-0
**Executor:** @dev (Dex)
**Achado:** FND-13 — "Exportação CSV não neutraliza fórmulas" → CWE-1236 (Improper Neutralization of Formula Elements in a CSV File)

## Nota de processo

Este relatório foi redigido por mim (agente de coordenação da épica), não pelo executor original, porque o agent que implementou REC-307 atingiu o limite de sessão da API (`session limit · resets 1:50pm America/Sao_Paulo`) exatamente ao começar a escrever este documento — código, testes e a própria story já estavam completos e corretos no working tree quando isso ocorreu. Segui o mesmo protocolo de recuperação já usado em REC-104/REC-107/REC-405: inspecionei `git status --short`, li o diff completo, e revalidei toda a evidência de forma independente antes de fechar a story.

## O que foi implementado

Duas implementações de exportação CSV existiam no código — `src/lib/utils/csv-export.ts` (genérica, referenciada só por testes) e `src/views/admin/AdminResourcePage.tsx` (a efetivamente usada para exportar leads/alunos/inscrições/catálogo na área administrativa). Nenhuma neutralizava fórmulas, apesar de ambas já fazerem o quoting RFC 4180 correto (aspas duplas dobradas).

Foi adicionado um único primitivo, `neutralizeCsvFormula(value: string): string`, em `src/lib/utils/csv-export.ts`:

```ts
const CSV_FORMULA_TRIGGER = /^[=+\-@\t\r]/;

export function neutralizeCsvFormula(value: string): string {
  return CSV_FORMULA_TRIGGER.test(value) ? `'${value}` : value;
}
```

Reutilizado em **ambos** os caminhos de serialização (`exportToCSV` em `csv-export.ts` e em `AdminResourcePage.tsx`), aplicado à string bruta antes do escape de aspas — os dois controles coexistem sem conflito.

## Decisão de segurança

Segue o padrão OWASP CSV Injection Prevention: **qualquer** string iniciando com `=`, `+`, `-`, `@`, tab ou carriage return é neutralizada com apóstrofo, sem exceção — incluindo casos-limite legítimos como número negativo (`-5`) ou telefone internacional (`+5511...`). Over-neutralizar esses casos-limite é preferível a deixar um vetor de injeção aberto. Nenhum dado armazenado no banco é alterado — a neutralização atua apenas na camada de serialização/exportação.

## Verificação independente (revalidada por mim, 2026-07-17)

```
npx vitest run  → Test Files 63 passed (63) | Tests 684 passed (684)
npm run lint    → 0 erros
npm run typecheck → 0 erros
git status --short src/lib/auth.ts supabase/functions/_shared/auth.ts \
  app/api/auth/session/route.ts src/lib/supabase/session.ts \
  src/lib/supabase/authorize.ts
  → session.ts e authorize.ts aparecem como untracked (artefatos pré-existentes
    de REC-202/REC-203, não modificados por esta story); auth.ts,
    _shared/auth.ts e session/route.ts sem qualquer alteração.
```

Baseline: 672 → 684 (+12 testes novos), sem regressão.

## Escopo

### Incluído
- `neutralizeCsvFormula` em `src/lib/utils/csv-export.ts`, aplicado em header e dados de `exportToCSV`.
- Reuso do mesmo primitivo em `src/views/admin/AdminResourcePage.tsx` (caminho real de exportação de dados de usuário).
- Testes cobrindo cada caractere gatilho, payloads clássicos de injeção, valores seguros (sem over-quoting indevido) e round-trip do conteúdo CSV gerado.

### Fora do escopo
- Qualquer alteração de autenticação/autorização (HMAC ou sessão SSR) — intocados.
- Alteração do dado armazenado no banco.
- Consolidação das duas implementações de exportação CSV numa só (refactor de UI/store, fora deste bugfix isolado).

## Conclusão

FND-13 fechado: fórmulas são neutralizadas em Excel, LibreOffice Calc e Google Sheets tanto no primitivo genérico quanto no caminho real de exportação administrativa, sem regressão de quoting CSV e sem qualquer alteração em superfície de autenticação.
