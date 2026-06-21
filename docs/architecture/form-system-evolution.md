# Form System Evolution — Arquitetura

> **Status:** ✅ APPROVED pelo arquiteto — liberado para Fase 0 (aguardando go do usuário nas 3 decisões de produto da §12)
> **Autor:** Design Squad (Design Chief, sintetizando Brad Frost · design-system-architect · ux-designer)
> **Revisão arquitetural:** Aria (architect) — 2026-06-21 — NEEDS_REVISION → 5 ajustes incorporados → **APPROVED** na revisão final
> **Escopo aprovado:** A — Consolidação estrutural + acessibilidade + validação por campo
> **Data:** 2026-06-21

> **Changelog de revisão (arquiteto):**
> 1. Corrigida a alegação "FormState aditivo = não-quebra" — ~3 action tests mudarão (§5.1, §10).
> 2. Reescrito o risco de parsing — armadilha real é a tipagem de checkbox no zod, não `Object.fromEntries` (§5.2, §9).
> 3. Fixada fronteira server-only dos schemas zod p/ não inflar bundle client (§5.2).
> 4. Severidade do schema de enrollment travada na atual; sem endurecer CPF/email (§9).
> 5. Resolvida redundância `role="alert"` + `aria-live` → só `role="alert"` (§4.1, §6).
> Extra: slot de adorno (`rightIcon`) na variante TextField (§4.3); piloto da Fase 2 trocado p/ `public-enrollment-form` (caso difícil, §8).

---

## 1. Objetivo e não-objetivos

### Objetivo

Convergir os forms públicos e de admin em **um único sistema de campo atômico**, com:

1. Um conjunto único de primitivos de form (hoje há dois: inline nos públicos + `Shadcn*Field` no admin).
2. Validação **por campo** com erro inline acessível (`aria-describedby` + `aria-invalid`).
3. `zod` como autoridade de validação determinística, compartilhada entre dica de cliente e checagem de servidor.
4. Acessibilidade WCAG 2.1 AA em todos os campos.

### Não-objetivos

- **Não** introduzir `react-hook-form`. Server Actions + `useActionState` já são o padrão do projeto; adicionar uma lib de form client-side seria over-engineering.
- **Não** redesenhar o layout das páginas — só o sistema de campo dentro dos forms existentes.
- **Não** alterar contratos de banco (RPCs, colunas). A validação acontece na borda (action), não no schema.

---

## 2. Estado atual (recap do audit)

| # | Débito | Arquivo de referência |
|---|--------|----------------------|
| 1 | Duas abstrações de campo divergentes | `public-lead-form.tsx` (inline `Field`) vs `shadcn/admin/form-field.tsx` (`ShadcnTextField`) |
| 2 | `error`/`aria-invalid` existem mas nunca são passados | `form-field.tsx:31` |
| 3 | Forms públicos sem feedback por campo (só `Alert` no topo) | `public-lead-form.tsx:136` |
| 4 | Sem `aria-describedby` ligando descrição/erro ao input | ambos |
| 5 | Ritmo de espaçamento inconsistente (`gap-5` vs `space-y-4`) | ambos |

**Padrão de validação atual:** `formData.get()` + checagem `typeof` manual, retornando `{ error, success }` form-level. Ex.: `submitLeadAction` em `public.ts:109`.

**Inventário de forms (13):**

| Form | LOC | Lado | Abstração atual |
|------|-----|------|-----------------|
| `public-enrollment-form.tsx` | 354 | público | inline |
| `public-lead-form.tsx` | 247 | público | inline |
| `admin-settings-form.tsx` | 370 | admin | `Shadcn*Field` |
| `admin-aluno-form.tsx` | 119 | admin | `Shadcn*Field` |
| `admin-edit-course-form.tsx` | 117 | admin | `Shadcn*Field` |
| `admin-lead-form.tsx` | 103 | admin | `Shadcn*Field` |
| `admin-user-form.tsx` | 95 | admin | `Shadcn*Field` |
| `admin-create-turma-form.tsx` | 87 | admin | `Shadcn*Field` |
| `admin-edit-turma-form.tsx` | 85 | admin | `Shadcn*Field` |
| `admin-create-course-form.tsx` | 85 | admin | `Shadcn*Field` |
| `admin-edit-instructor-form.tsx` | 76 | admin | `Shadcn*Field` |
| `admin-create-instructor-form.tsx` | 64 | admin | `Shadcn*Field` |

---

## 3. Arquitetura atômica (Brad Frost)

```
ÁTOMOS (existentes, mantidos)
  Input · Textarea · Label · Select · Checkbox    → src/components/ui/

MOLÉCULA (nova, única)
  Field (FieldShell)                              → src/components/forms/field/
    ├─ label + indicador de obrigatório
    ├─ control (children)
    ├─ description (id estável)
    └─ error (id estável, role="alert")

  Variantes tipadas (consomem Field):
    TextField · TextareaField · SelectField · CheckboxField · NumberField

ORGANISMOS (os 13 forms)
  Migram de "inline" / "Shadcn*Field" → variantes únicas
```

**Decisão:** o novo `Field` vive em `src/components/forms/field/` (não em `shadcn/admin/`), porque deixa de ser exclusivo do admin. O `shadcn/admin/form-field.tsx` vira um **re-export fino** durante a migração e é removido ao final (evita big-bang).

---

## 4. API dos componentes

### 4.1 `FieldShell` — molécula base

```ts
type FieldShellProps = {
  id: string;                 // obrigatório: ancora label/description/error
  label: string;
  description?: string;
  error?: string;             // string única por campo (1ª mensagem do zod)
  required?: boolean;         // renderiza indicador + aria-required no control
  children: ReactNode;        // o control (Input/Select/...)
  className?: string;
};
```

Responsabilidades do shell (centraliza o que hoje está duplicado):

- Gera `descriptionId = \`${id}-description\`` e `errorId = \`${id}-error\``.
- Passa `aria-describedby` ao control via prop explícita (ver 4.2).
- Renderiza erro com **`role="alert"` apenas** (já implica `aria-live="assertive"`; não somar `aria-live="polite"` — redundante e conflitante). _[revisão arquiteto #5]_
- Renderiza indicador de obrigatório `<span aria-hidden>*</span>` + texto oculto "obrigatório".

### 4.2 Wiring de `aria-describedby`

O control precisa receber os ids de description/error. Duas opções:

- **Opção 1 (recomendada):** o shell calcula `aria-describedby` e o passa explicitamente como prop nas variantes (`TextField` etc.), que repassam ao `Input`. Determinístico, sem mágica.
- Opção 2: `cloneElement` no `children`. Rejeitada — frágil e implícita.

### 4.3 Variantes

```ts
// Todas estendem os props nativos do átomo + label/description/error/required
type TextFieldProps     = InputProps     & FieldMeta & FieldAdornments;
type TextareaFieldProps = TextareaProps  & FieldMeta;
type NumberFieldProps   = InputProps     & FieldMeta;   // type="number", min default
type SelectFieldProps   = { options: Option[] } & FieldMeta & { name: string };
type CheckboxFieldProps = CheckboxProps  & Pick<FieldMeta, "label" | "description">;

type FieldMeta = {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
};

// [revisão arquiteto] public-enrollment-form.tsx:87-102 envolve o Input em
// <div relative> com rightIcon. A variante TextField PRECISA de slot de adorno,
// senão esse form não migra limpo na Fase 3.
type FieldAdornments = {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};
```

Isso substitui **tanto** o `Field`/`TextareaField` inline dos públicos **quanto** os `Shadcn*Field`. Uma fonte da verdade.

---

## 5. Arquitetura de validação (escopo A)

### 5.1 Estado de form estendido

Hoje: `{ error, success }`. Novo tipo compartilhado:

```ts
// src/lib/forms/form-state.ts
export type FormState = {
  error: string | null;                    // erro geral (mantido p/ retrocompat)
  success: string | null;
  fieldErrors?: Record<string, string>;    // { email: "E-mail inválido", ... }
};
```

`AdminFormState` e `PublicFormState` passam a **estender** `FormState`. O *tipo* opcional é aditivo, **mas a migração não é não-quebra em runtime** _[revisão arquiteto #4]_:

- Os action tests usam `toEqual` **estrito** (32 ocorrências: 25 em `admin.test.ts`, 7 em `public.test.ts`). `toEqual({error, success})` falha com qualquer chave extra.
- **Regra de implementação obrigatória:** no caminho de **sucesso**, *nunca* incluir `fieldErrors` (nem como `{}`). No caminho de **erro de validação**, incluir `fieldErrors` populado. Assim os 25+ testes de sucesso seguem verdes (Vitest trata `{a:1}` == `{a:1, b:undefined}`) e a quebra fica isolada.
- **Quebra previsível e planejada:** ~3 testes de erro de validação **serão atualizados** na migração — `public.test.ts:121`, `admin.test.ts:164`, `admin.test.ts:302`. Não é "não-quebra"; é "quebra contida".
- **Distinção crítica:** os `*.test.tsx` (render dos forms) sobrevivem; os `*.test.ts` (actions) precisam de atualização. A seção 10 trata os dois separadamente.

### 5.2 zod como autoridade

> **Fronteira server-only obrigatória** _[revisão arquiteto #3]_: os schemas em `src/lib/forms/schemas/*.ts` só podem ser importados em arquivos `"use server"` (as actions). Os 13 forms são `"use client"` — importar um schema neles arrasta o `zod` para o bundle de cada página pública. A autoridade de validação vive no servidor; o cliente confia em `required` nativo + retorno da action.

> **Tipagem de checkbox Radix** _[revisão arquiteto #2]_: o `Checkbox` é Radix (`button[role=checkbox]` + hidden input com value default `"on"`). Checkboxes desmarcados **somem** do `FormData` (key ausente) — comportamento desejado. O schema deve modelar isso como `z.literal("on").optional()`, **nunca** `z.boolean()` (o parse falharia: `"on"` é string). As actions já dependem disso: `admin.ts:435`, `admin.ts:1160-1161`, `public.ts:210`.

```ts
// src/lib/forms/schemas/lead.ts  — server-only
export const leadSchema = z.object({
  nome: z.string().min(1, "Informe o nome."),
  email: z.string().email("E-mail inválido."),
  telefone: z.string().optional(),
  // checkbox Radix: "on" | ausente, nunca boolean
  aceite_lgpd: z.literal("on", { message: "Aceite obrigatório." }),
  // ...
});
```

Na action:

```ts
const parsed = leadSchema.safeParse(Object.fromEntries(formData));
if (!parsed.success) {
  return {
    error: "Revise os campos destacados.",
    success: null,
    fieldErrors: flattenZodErrors(parsed.error),  // { campo: 1ª mensagem }
  };
}
// parsed.data é tipado e validado
```

`flattenZodErrors` (helper único) converte `z.flatten().fieldErrors` em `Record<string,string>` pegando a 1ª mensagem por campo. Substitui as checagens `typeof` manuais.

### 5.3 Progressive enhancement

- `required` nativo do HTML permanece (validação client gratuita, funciona sem JS).
- `zod` no servidor é a **autoridade** — nunca confiar só no cliente.
- O form passa `error={state.fieldErrors?.[name]}` para cada variante.

---

## 6. Acessibilidade (WCAG 2.1 AA)

| Critério | Implementação |
|----------|---------------|
| 1.3.1 / 3.3.2 Rótulos | `Label htmlFor={id}` em 100% dos campos |
| 3.3.1 Identificação de erro | erro inline com `role="alert"`, ligado por `aria-describedby` |
| 4.1.2 aria-invalid | `aria-invalid={Boolean(error)}` no control |
| 3.3.2 Obrigatório | `aria-required` + indicador visual + texto oculto "obrigatório" |
| 2.4.3 Foco | ao submeter com erro, foco vai ao 1º campo inválido (`useEffect` no form) |
| 1.4.3 Contraste | `--destructive: #c92a2a` sobre `--background` — validar ≥ 4.5:1 |

---

## 7. Tokens visuais e estados

Reusar tokens existentes (`globals.css`) — **não criar novos** sem necessidade:

| Estado | Token / classe |
|--------|----------------|
| Radius do campo | `rounded-sm` (`--radius-sm: 0.25rem`) — já no `Input` |
| Borda default | `border-input` (`--input: #ced4da`) |
| Foco | `ring-ring` (`--ring: #0d5b85`) — já no `Input` |
| Erro (borda) | `aria-invalid:border-destructive` (novo seletor no `Input`) |
| Erro (texto) | `text-destructive text-xs font-semibold` |
| Ritmo do form | **novo token único**: `gap-5` (públicos) vs `space-y-4` (admin) → padronizar em `space-y-5` |

Única adição de token: padronizar o rhythm de form. Tudo o mais é reuso.

---

## 8. Plano de migração (faseado, sem big-bang)

| Fase | Entrega | Risco |
|------|---------|-------|
| 0 | Criar `Field` + variantes + `FormState` + helper zod | baixo (aditivo) |
| 1 | `shadcn/admin/form-field.tsx` re-exporta os novos `Field` (admin funciona sem mudança) | baixo |
| 2 | Migrar `public-enrollment-form` (caso difícil: `rightIcon`, radios, Radix Checkbox, fallback RPC) + `admin-aluno-form` (admin simples) com validação zod → **checkpoint de aprovação visual** | médio |
| 3 | Propagar para os 11 forms restantes, action por action | médio |
| 4 | Remover `shadcn/admin/form-field.tsx` e os `Field` inline duplicados | baixo |

Cada fase é commitável e testável isoladamente.

---

## 9. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Reescrita das actions quebra fluxos (ex.: enrollment RPC fallback) | Migrar action por action; manter `*.test.tsx` verdes; atualizar os ~3 `*.test.ts` de erro planejadamente (ver 5.1) |
| **Schema zod mais estrito que a validação atual quebra testes de fallback** _[arq #4]_ | O schema de enrollment deve replicar a **severidade atual** de `public.ts:191-211` (presença + não-vazio). **Não** endurecer CPF/email/regras nesta migração — isso é escopo separado e quebraria `public.test.ts:165-303` |
| **Tipagem errada de checkbox no zod** _[arq #2]_ | Checkbox Radix chega como `"on" \| undefined` (string). Modelar com `z.literal("on").optional()`, nunca `z.boolean()`. `Object.fromEntries` já lida com o parsing — a armadilha é o tipo no schema, não o parsing |
| **`z.coerce.number()` muda comportamento de `num_participantes`** _[arq]_ | Hoje `Number("abc")` → `NaN` passa silencioso; `z.coerce.number()` **rejeita** `"abc"`. Validar que `public.test.ts:56` (`num_participantes: "12"`) segue verde e decidir conscientemente sobre strings inválidas |
| **`zod` no bundle client** _[arq #3]_ | Schemas importados só em `"use server"` (ver 5.2) |
| Divergência de naming de campos (PT-BR) entre form e schema | Schema usa os mesmos `name` dos inputs atuais; sem renomear |
| Indicador de obrigatório inconsistente | Centralizado no `FieldShell`, removido de todos os call-sites |

---

## 10. Estratégia de testes

- **Unit:** `FieldShell` renderiza `aria-describedby`/`aria-invalid`/`role="alert"` corretos.
- **Schema:** cada `zod` schema testa caso válido + cada caminho de erro.
- **Action:** `safeParse` falho retorna `fieldErrors` com as chaves certas.
- **Integração (existentes):** os `*.test.tsx` (render dos forms) devem continuar **verdes** — rede de segurança. Já os `*.test.ts` (actions, 32 `toEqual` estritos) **mudarão de forma planejada** nos ~3 casos de erro de validação — ver 5.1. Distinguir os dois é obrigatório.
- **A11y:** foco vai ao 1º campo inválido ao submeter.

---

## 11. Arquivos previstos

```
NOVOS
  src/components/forms/field/field-shell.tsx
  src/components/forms/field/text-field.tsx
  src/components/forms/field/textarea-field.tsx
  src/components/forms/field/select-field.tsx
  src/components/forms/field/checkbox-field.tsx
  src/components/forms/field/index.ts
  src/lib/forms/form-state.ts
  src/lib/forms/flatten-zod-errors.ts
  src/lib/forms/schemas/*.ts            (1 por form com validação)

MODIFICADOS
  src/components/ui/input.tsx           (+ aria-invalid:border-destructive)
  src/components/ui/textarea.tsx        (idem)
  src/app/actions/public.ts             (zod + fieldErrors)
  src/app/actions/admin.ts              (zod + fieldErrors)
  os 13 forms                            (consumir variantes únicas)

REMOVIDOS (fase 4)
  src/components/shadcn/admin/form-field.tsx
  Field/TextareaField inline nos forms públicos

DEPENDÊNCIA
  + zod (única adição ao package.json)
```

---

## 12. Decisão pendente de aprovação

1. Confirmar a adição de **`zod`** como dependência (≈ única lib nova).
2. Confirmar o local dos novos primitivos: `src/components/forms/field/`.
3. Aprovar o **checkpoint da Fase 2** (1 público + 1 admin) antes de propagar.

Após aprovação destes três pontos, inicio a **Fase 0**.
