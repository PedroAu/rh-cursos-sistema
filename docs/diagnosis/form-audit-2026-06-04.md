# Diagnóstico de Formulários de Admin — 2026-06-04

## Sumário Executivo

Os formulários de admin possuem **13 problemas críticos** de UX/usabilidade distribuídos entre 7 módulos. Os principais eixos são:

1. **Campos JSON em textarea** (3 formulários) — impossível validar estrutura
2. **Campos select sem escopo visual** (4 formulários) — dropdowns truncados/inacessíveis
3. **Campos omitidos ou incompletos** (5 formulários) — dados não editáveis
4. **Validação inadequada** — nenhuma verificação de tipo ou formato
5. **Modal overflow** — altura fixa com scroll quebra UX em telas pequenas

---

## Problemas Detalhados por Módulo

### 1. CURSOS — 4 Problemas Críticos

**Arquivo:** `app/admin/cursos/page.tsx` → `AdminResourcePage` (linhas 49-125)

#### ❌ Problema 1.1: JSON em TextArea para Objetivos
```typescript
{ key: "objectives", label: "Objetivos (JSON)", type: "textarea" as const }
```

**Impacto:** Admin deve inserir JSON válido manualmente. Erros de sintaxe causam falha silenciosa ao salvar.

**Tipo:** `string[]` (array de strings)

**Dados esperados:**
```json
["Objetivo 1", "Objetivo 2", "Objetivo 3"]
```

**Recomendação:** Criar componente `ArrayInput` com adicionar/remover campos individuais.

---

#### ❌ Problema 1.2: JSON em TextArea para Benefícios
```typescript
{ key: "benefits", label: "Benefícios (JSON)", type: "textarea" as const }
```

**Impacto:** Mesmo problema dos objetivos.

**Tipo:** `string[]`

**Recomendação:** Usar `ArrayInput` reutilizável.

---

#### ❌ Problema 1.3: JSON em TextArea para Módulos
```typescript
{ key: "modules", label: "Módulos (JSON)", type: "textarea" as const }
```

**Impacto:** Admin deve estruturar manualmente objetos complexos com `title`, `description`, `topics`, `duration`.

**Tipo:** `CourseModule[]` (estrutura complexa):
```typescript
{
  title: string;
  description: string;
  topics: string[];
  duration: string;
}
```

**Recomendação:** Criar componente `ModulesBuilder` com card expansível para cada módulo + array aninhado para tópicos.

---

#### ❌ Problema 1.4: Campo "Trilha" sem Select
```typescript
{ key: "pathId", label: "Trilha", type: "text" as const }
```

**Impacto:** Admin digita ID da trilha manualmente (opaco). Sem list de opções disponíveis.

**Tipo Esperado:** `string` (mas deveria ser select)

**Dados disponíveis:** `store.trainPaths` ou similar contém trilhas cadastradas.

**Recomendação:** Converter para select com `options` do `store.trainPaths`.

---

#### ❌ Bônus 1.5: Validação de Preço
Campo price é `text`, aceitando qualquer string. Sem máscara ou validação.

**Recomendação:** Type="number" ou Input com mask numérica (versionado com Decimal).

---

### 2. TURMAS — 2 Problemas Críticos

**Arquivo:** `app/admin/turmas/page.tsx` → `AdminResourcePage` (linhas 127-164)

#### ❌ Problema 2.1: Campo "Curso" sem Select
```typescript
{ key: "courseId", label: "Curso", type: "text" as const }
```

**Impacto:** Admin digita ID do curso. Sem autocomplete ou busca.

**Recomendação:** Converter para `select` com options de `store.courses`.

---

#### ❌ Problema 2.2: Campo "Modalidade" sem Type Select
```typescript
{ key: "modality", label: "Modalidade", type: "text" as const }
```

**Valores esperados:** `"Ao vivo online" | "Presencial" | "In company" | "Híbrido" | "Gravado"`

**Impacto:** Admin digita manualmente, sem autocomplete.

**Recomendação:** Converter para select com opções pré-definidas.

---

#### ❌ Problema 2.3: Campo "Status" sem Type Select
```typescript
{ key: "status", label: "Status", type: "text" as const }
```

**Valores esperados:** `"Inscrições abertas" | "Poucas vagas" | "Encerrada" | "Em breve"`

**Recomendação:** Converter para select.

---

#### ⚠️ Problema 2.4: Campo "Instrutor" Ausente
`TrainingClass.instructorId` não aparece no formulário. Admin não consegue atribuir instrutor ao criar/editar turma.

**Recomendação:** Adicionar field `instructorId` como select com options de `store.instructors`.

---

### 3. ALUNOS — 0 Problemas Críticos (Status OK)

**Arquivo:** `app/admin/alunos/page.tsx` → `AdminResourcePage` (linhas 166-195)

✅ Campos simples (text/select), sem JSON complexo.

⚠️ **Nota:** Campo `enrollmentStatus` deveria ser select, não text. Revisar tipo no formulário.

---

### 4. LEADS — 1 Problema Crítico

**Arquivo:** `app/admin/leads/page.tsx` → `AdminResourcePage` (linhas 197-237)

#### ❌ Problema 4.1: Campo "Origem" sem Select
```typescript
{ key: "origin", label: "Origem", type: "text" as const }
```

**Valores esperados:** `"Site" | "WhatsApp" | "Blog" | "Indicação" | "LinkedIn"`

**Recomendação:** Converter para select.

---

#### ❌ Problema 4.2: Campo "Status" sem Select
```typescript
{ key: "status", label: "Status", type: "text" as const }
```

**Valores esperados:** `"Novo" | "Em atendimento" | "Proposta enviada" | "Convertido" | "Perdido"`

**Recomendação:** Converter para select.

---

#### ⚠️ Problema 4.3: Campos Ausentes
- `phone` — não editável
- `organization`, `teamSize`, `preferredModality`, `trainingObjective`, `trainingTheme`, `mainChallenges` — não aparecem no formulário

**Impacto:** Admin cria lead com dados mínimos. Campos de contexto B2B são perdidos.

---

### 5. INSCRIÇÕES — 0 Problemas Críticos (Status OK)

**Arquivo:** `app/admin/inscricoes/page.tsx` → `AdminResourcePage` (linhas 239-263)

✅ Apenas status editável (OK para fluxo simples).

⚠️ **Melhoria:** Adicionar campos read-only para contexto (aluno, curso, turma, data).

---

### 6. INSTRUTORES — 0 Problemas Críticos (Status OK)

**Arquivo:** `app/admin/instrutores/page.tsx` → `AdminResourcePage` (linhas 265-299)

✅ Campos simples (text/select), sem JSON.

⚠️ **Melhoria:** Adicionar campos `phone`, `bio` (textarea), `courseIds` (multi-select).

---

### 7. BLOG — 1 Problema Crítico

**Arquivo:** `app/admin/blog/page.tsx` → `AdminResourcePage` (linhas 301-335)

#### ❌ Problema 7.1: Campo "Categoria" sem Select
```typescript
{ key: "category", label: "Categoria", type: "text" as const }
```

**Valores esperados:**
```typescript
"Departamento Pessoal" | "eSocial" | "Gestão Pública" | 
"Liderança" | "Tecnologia" | "Assédio e Compliance"
```

**Recomendação:** Converter para select com opções fixas.

---

#### ❌ Problema 7.2: Campos Ausentes
- `summary` — não editável (resumo é crítico para SEO/preview)
- `content` — não editável (corpo do artigo)
- `tags` — não editável (JSON array)
- `date` — não editável (data de publicação)
- `readingTime` — não editável
- `slug` — não editável
- `image` — não editável (URL da imagem)
- `relatedCourseId` — não editável

**Impacto:** Blog é apenas um stub. Admin não consegue criar posts reais.

---

---

## Matriz de Impacto

| Módulo | Selects Pendentes | JSON/TextArea | Campos Faltantes | Severidade |
|--------|------------------|---------------|------------------|-----------|
| Cursos | 1 (Trilha) | 3 (Objetivos, Benefícios, Módulos) | — | 🔴 CRÍTICA |
| Turmas | 3 (Curso, Modalidade, Status) | — | 1 (Instrutor) | 🔴 CRÍTICA |
| Alunos | — | — | — | 🟢 OK |
| Leads | 2 (Origem, Status) | — | 6 (Phone, Org, TeamSize, etc) | 🔴 CRÍTICA |
| Inscrições | — | — | — | 🟢 OK |
| Instrutores | — | — | 3 (Phone, Bio, CourseIds) | 🟡 MENOR |
| Blog | 1 (Categoria) | 1 (Tags) | 7 (Summary, Content, Slug, etc) | 🔴 CRÍTICA |

---

## Problemas Estruturais (Afetam todos os Formulários)

### ❌ Modal com Scroll Quebrado
```typescript
<div className="grid gap-4 max-h-96 overflow-y-auto">
```

**Problema:** Altura fixa `max-h-96` causa scroll interno que estraga UX em telas mobile/pequenas.

**Recomendação:** 
- Remover max-height em mobile
- Usar `DialogContent` scrollable em vez de div interna
- Considerar 2-step form para formulários muito grandes

---

### ❌ Validação Inexistente
```typescript
if (config.fields.some((field: FieldConfig) => !form[field.key] && field.key !== "status")) {
```

Apenas verifica se campo está preenchido (string vazia). Nenhuma validação de:
- Formato JSON
- Tipos de dados
- Regras de negócio (ex.: preço > 0)
- Email válido
- CPF válido

**Recomendação:** Integrar biblioteca de validação (zod/yup) com esquemas por resource.

---

### ⚠️ Sem Feedback de Erro Estruturado
```typescript
catch {
  toast.error("Erro ao salvar. Verifique os dados JSON dos campos de lista.");
}
```

Erro genérico. Admin não sabe qual campo ou qual é a sintaxe esperada.

**Recomendação:** Parse JSON com mensagem específica por campo.

---

## Checklist de Correções Recomendadas

### Priority 1 (Imediato)

- [ ] **Cursos:** Converter `pathId` para select
- [ ] **Turmas:** Converter `courseId`, `modality`, `status` para select + adicionar `instructorId`
- [ ] **Leads:** Converter `origin`, `status` para select
- [ ] **Blog:** Converter `category` para select

### Priority 2 (Sprint 1)

- [ ] **Cursos:** Criar `ArrayInput` para objetivos + benefícios
- [ ] **Cursos:** Criar `ModulesBuilder` para módulos
- [ ] **Leads:** Adicionar campos `phone`, `organization`, `teamSize`, `preferredModality`
- [ ] **Blog:** Adicionar campos `summary`, `content`, `tags`, `date`, `image`, `slug`
- [ ] **Instrutores:** Adicionar campos `phone`, `bio`, `courseIds` (multi-select)

### Priority 3 (Sprint 2)

- [ ] Integrar validação schema (zod/yup) em todos os resources
- [ ] Criar componente reutilizável `MultiSelect` para arrays/enums
- [ ] Melhorar UX do modal (remover scroll interno, considerar 2-step form)
- [ ] Adicionar help text/tooltip para campos complexos

---

## Exemplos de Implementação Recomendados

### ArrayInput Component (Objetivos/Benefícios)
```typescript
export function ArrayInput({
  label,
  value = [],
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => {
              const copy = [...value];
              copy[i] = e.target.value;
              onChange(copy);
            }}
            className="flex-1 rounded-md border border-input px-3 py-2"
          />
          <button
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="px-2 py-2"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...value, ""])}
        className="text-sm text-blue-600"
      >
        + Adicionar
      </button>
    </div>
  );
}
```

### SelectField Component (Enums)
```typescript
export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2"
      >
        <option value="">Selecione...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

## Conclusão

Os formulários de admin têm um design fundamentalmente correto (CRUD local funciona), mas faltam **componentes especializados** para dados complexos (arrays, enums, objetos aninhados).

A solução é **criar uma biblioteca de componentes reutilizáveis** (ArrayInput, SelectField, ModulesBuilder, MultiSelect) em vez de forçar dados complexos em campos genéricos (text/textarea).

**Estimativa de esforço:**
- Priority 1: 2-3 horas (Selects)
- Priority 2: 1-2 dias (Componentes + Campos)
- Priority 3: 1-2 dias (Validação + UX)

---

**Assinado:** Diagnóstico automático | **Data:** 2026-06-04
