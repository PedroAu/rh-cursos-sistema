# Análise de Formulários e Views - RH Cursos

## Resumo Executivo

Existem **4 formulários principais** no projeto:
1. **Contact.tsx** - Formulário de contato (leads simples)
2. **CheckoutModal.tsx** - Inscrição em cursos (5 etapas)
3. **InCompany.tsx** - Solicitação de proposta corporativa
4. **AdminResourcePage.tsx** - Gestão de recursos (admin)

**Problema principal**: Falta de separação clara entre dados de **captura** (forms) e **apresentação** (views). Alguns campos estão no lugar errado.

---

## 1. CONTACT.tsx - Formulário de Contato

### Análise Atual
```
Form (o que deve estar):
✓ Nome
✓ Email
✓ Telefone (opcional)
✓ Mensagem

View (apresentação):
✓ Cards com canais diretos (WhatsApp, Email, Localização)
✓ Contexto da página (hero, títulos)
```

### Problemas Identificados
- ❌ Falta **validação forte** no nome (aceita espaços vazios)
- ❌ Falta **tipo de input correto** para email (`type="email"`)
- ❌ Falta **máscara de telefone** para melhor UX

### Melhorias Recomendadas

#### 1.1 Adicionar Validações e Máscaras
```typescript
// Contact.tsx improvements
const validations = {
  name: (v: string) => v.trim().length >= 3 ? null : "Mínimo 3 caracteres",
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Email inválido",
  phone: (v: string) => v.replace(/\D/g, "").length >= 10 ? null : "Telefone inválido",
  message: (v: string) => v.trim().length >= 10 ? null : "Mínimo 10 caracteres"
};

// Input elements
<Input type="email" placeholder="E-mail" ... />
<Input type="tel" placeholder="Telefone" ... />
```

#### 1.2 Separação Clara Form/View
| Local | O que Colocar |
|------|--|
| **FORM** | Inputs, validações, estado do form |
| **VIEW** | Cards de contato, hero, descrição |

**Status**: ✅ **Bem separado** - não precisa refatoração

---

## 2. CHECKOUT-MODAL.tsx - Inscrição em Cursos

### Análise Atual

Estrutura de **5 etapas**:
1. **Dados pessoais**: Nome, Email, Telefone, CPF
2. **Profissional**: Empresa, Cargo, Tipo de inscrição
3. **Turma**: Seleção de turma
4. **Pagamento**: Forma de pagamento
5. **Confirmação**: Resumo

### Problemas Identificados

#### ❌ Problema 1: Campos Redundantes
- Nome, Email, Telefone aparecem tanto aqui quanto no Student que será criado
- **Solução**: Consolidar em um único lugar

#### ❌ Problema 2: Validações Frágeis
```typescript
// Atual (fraco):
if (!form.studentName || !form.email || !form.phone || !form.cpf) {
  toast.error("Preencha os dados pessoais obrigatórios.");
}

// Melhor:
const errors = validatePersonalData(form);
if (errors.length > 0) {
  toast.error(errors[0]); // Mensagem específica
}
```

#### ❌ Problema 3: Sem Máscaras de Input
- CPF sem formatação
- Telefone sem formatação
- Torna difícil ler e corrigir

#### ❌ Problema 4: Etapa 5 (Confirmação) é Redundante
- Apenas mostra resumo
- Poderia ser integrado ao botão final
- Reduz de 5 para 4 etapas

#### ❌ Problema 5: Falta Estrutura de Componentes
- Todo o formulário em um arquivo monolítico
- Difícil manter e reutilizar

### Melhorias Recomendadas

#### 2.1 Extrair Componentes por Etapa
```
src/components/checkout/
  ├── PersonalDataStep.tsx
  ├── ProfessionalDataStep.tsx
  ├── ClassSelectionStep.tsx
  ├── PaymentStep.tsx
  └── CheckoutModal.tsx (orquestrador)
```

#### 2.2 Adicionar Máscaras e Validações
```typescript
// Novo arquivo: src/lib/checkout-validators.ts
export const checkoutValidators = {
  cpf: (value: string) => {
    const clean = value.replace(/\D/g, "");
    return clean.length === 11 ? null : "CPF inválido";
  },
  phone: (value: string) => {
    const clean = value.replace(/\D/g, "");
    return clean.length >= 10 ? null : "Telefone inválido";
  }
};

// Uso em PersonalDataStep.tsx
<Input
  type="tel"
  placeholder="Telefone / WhatsApp"
  value={form.phone}
  onChange={(e) => update("phone", formatPhone(e.target.value))}
/>
```

#### 2.3 Consolidar Etapas (5 → 4)
| Antes | Depois |
|-------|--------|
| 1. Dados | 1. Dados pessoais |
| 2. Profissional | 2. Profissional |
| 3. Turma | 3. Turma |
| 4. Pagamento | 4. Pagamento |
| 5. Confirmação ❌ | (sem etapa redundante) |

**Na etapa 4**, mostrar resumo + botão "Finalizar" em um único passo.

#### 2.4 Melhorar UX da Seleção de Turma
```typescript
// Atual: Só mostra data, horário, modalidade e local
// Melhor: Adicionar preço e disponibilidade
<ClassCard>
  <div>Data: {date}</div>
  <div>Preço: {price}</div>
  <div>Vagas disponíveis: {spots}/20</div>
  <Badge>{status}</Badge>
</ClassCard>
```

#### 2.5 Retirar Dados Desnecessários do Form
```typescript
// ❌ ATUAL: Está tudo em um formulário monolítico
const form = {
  studentName, email, phone, cpf,        // Pessoal
  organization, jobTitle, enrollmentType, // Profissional
  classId,                                // Turma
  paymentMethod                           // Pagamento
};

// ✅ RECOMENDADO: Separar em sub-formulários
const personalData = { studentName, email, phone, cpf };
const professionalData = { organization, jobTitle, enrollmentType };
const enrollmentData = { classId, paymentMethod };
```

---

## 3. INCOMPANY.tsx - Solicitação de Proposta

### Análise Atual
```
Form (coleta):
✓ Nome
✓ Email corporativo
✓ Empresa
✓ Telefone/WhatsApp
✓ Tamanho da equipe
✓ Modalidade (select)
✓ Objetivo/tema/desafios (textarea)

View (apresentação):
✓ Hero section com valor (98% satisfação)
✓ Cards de benefícios
✓ Contexto corporativo
```

### Problemas Identificados

#### ✅ Pontos Positivos
- Formatação de telefone e tamanho de equipe funcionam bem
- Validações razoáveis
- Separação form/view clara

#### ❌ Problema 1: Campo Muito Grande e Vago
```
"Objetivo, tema e desafios principais"
```
- É um campo único para 3 informações diferentes
- Difícil analisar dados depois
- Usuário não sabe bem o que preencher

#### ❌ Problema 2: Falta Campos de Contexto
- Não captura: "Qual sua função?"
- Não captura: "Já têm experiência com treinamentos?"
- Informações úteis para o atendimento

#### ❌ Problema 3: Validação de Email Fraca
```typescript
// Atual:
isValidEmail() // aceita qualquer coisa com @ e .

// Melhor: Validar domínio corporativo
if (!value.includes("@") || value.endsWith("@gmail.com")) {
  toast.error("Use um email corporativo válido");
}
```

### Melhorias Recomendadas

#### 3.1 Desdobrar Campo Grande em Campos Específicos
```typescript
// Antes:
objectiveThemeChallenges: string

// Depois:
trainingObjective: string      // "Melhorar liderança"
trainingTheme: string         // "Gestão de equipes"
mainChallenges: string        // "Retenção de talentos"
```

#### 3.2 Adicionar Campos Contextuais
```html
<!-- Função do solicitante -->
<Select placeholder="Sua função">
  <SelectItem value="RH">RH</SelectItem>
  <SelectItem value="Gerência">Gerência</SelectItem>
  <SelectItem value="Executivo">Executivo</SelectItem>
  <SelectItem value="Outro">Outro</SelectItem>
</Select>

<!-- Experiência anterior -->
<Select placeholder="Experiência com treinamentos corporativos">
  <SelectItem value="Sim">Sim</SelectItem>
  <SelectItem value="Não">Não</SelectItem>
</Select>

<!-- Urgência -->
<Select placeholder="Quando precisa começar?">
  <SelectItem value="Urgente">Urgente (próximo mês)</SelectItem>
  <SelectItem value="Próximos 3 meses">Próximos 3 meses</SelectItem>
  <SelectItem value="Próximos 6 meses">Próximos 6 meses</SelectItem>
</Select>
```

#### 3.3 Melhorar Apresentação (View)
- Adicionar testimonial de empresa parceira
- Mostrar portfolio de setores atendidos
- Adicionar CTA com WhatsApp direto para atendimento

---

## 4. ADMIN-RESOURCE-PAGE.tsx - Gestão de Cursos

### Análise Atual

Tipo de formulário: **Modal de Edição**

#### Para Cursos, captura:
```
✓ Título
✓ Trilha (pathId)
✓ Modalidade
✓ Carga horária
✓ Preço
✓ Nível
✓ Status
✓ Descrição curta/completa
✓ Imagem (URL)
✓ Objetivos (JSON)
✓ Benefícios (JSON)
✓ Módulos (JSON)
```

### Problemas Identificados

#### ❌ Problema 1: **Campos JSON no Form**
```typescript
// ❌ RUIM: Pedir JSON em um textarea
{ key: "objectives", label: "Objetivos (JSON)", type: "textarea" }

// ✅ BOM: Array builder visual
<ArrayBuilder
  items={objectives}
  onAdd={(item) => setObjectives([...objectives, item])}
  onRemove={(index) => setObjectives(objectives.filter((_, i) => i !== index))}
/>
```

#### ❌ Problema 2: Sem Separação Form/View para Admin
Não há **visualização prévia** do curso enquanto edita.

#### ❌ Problema 3: Muitos Campos no Modal
- Modal fica muito grande
- Não cabe tudo na tela
- Usuário precisa scroll infinito

#### ❌ Problema 4: Falta Campos Importantes
- Não tem duração em horas (só label)
- Não tem instructor ID
- Não tem categoria

#### ❌ Problema 5: Upload de Imagem
Pede URL em vez de upload real.

### Melhorias Recomendadas

#### 4.1 Criar Página Dedicada para Edição de Cursos
```
/admin/cursos/[id]/edit
  ├── Sidebar com navegação (Básico, Conteúdo, Preço)
  ├── Preview lado a lado
  └── Salvar em abas, não em modal
```

#### 4.2 Substituir JSON por UI Components

**Array Builder para Objetivos:**
```typescript
<ArrayBuilder
  label="Objetivos"
  placeholder="Digite um objetivo"
  items={form.objectives}
  onAdd={(item) => update("objectives", [...form.objectives, item])}
/>
```

**Array Builder para Módulos:**
```typescript
<ModuleBuilder
  modules={form.modules}
  onAdd={(module) => addModule(module)}
  onEdit={(index, module) => editModule(index, module)}
  onRemove={(index) => removeModule(index)}
/>
```

#### 4.3 Adicionar Preview em Tempo Real
```
┌─ Lado A (Form) ──────┬─ Lado B (Preview) ─────┐
│ Título               │ [Curso como aparece]   │
│ Descrição            │ [na página pública]    │
│ Objetivos (array)    │                        │
│ Benefícios (array)   │                        │
│ Módulos (array)      │                        │
└──────────────────────┴────────────────────────┘
```

#### 4.4 Estruturar Admin como Abas
```
Tab 1: Informações Básicas
  - Título
  - Trilha
  - Modalidade
  - Nível
  - Status

Tab 2: Descrição
  - Descrição curta
  - Descrição completa
  - Imagem

Tab 3: Conteúdo
  - Objetivos
  - Benefícios
  - Módulos

Tab 4: Preço
  - Valor
  - Desconto (opcional)
  - Cupons (opcional)
```

---

## 📊 Matriz de Recomendações por Formulário

| Formulário | Prioridade | Ação Imediata | Componentes | Validação |
|-----------|-----------|---------------|-------------|-----------|
| **Contact** | 🔵 Baixa | Adicionar type="email", tel | Nenhum | Melhorar mensagens |
| **Checkout** | 🔴 Alta | Refatorar etapas | PersonalDataStep, ProfessionalStep, ClassStep, PaymentStep | Adicionar máscaras CPF/tel |
| **InCompany** | 🟡 Média | Desdobrar campos | TrainingObjectiveStep | Remover campo genérico |
| **AdminCourses** | 🔴 Alta | Criar página /admin/cursos/[id]/edit | ArrayBuilder, ModuleBuilder | JSON → UI |

---

## 🎯 Plano de Ação Recomendado

### Fase 1: Quick Wins (Esta semana)
- [ ] Adicionar máscaras em Checkout (CPF, telefone)
- [ ] Remover etapa 5 do Checkout (consolidar com etapa 4)
- [ ] Desdobrar campo genérico de InCompany em 3 campos específicos
- [ ] Adicionar `type="email"` e `type="tel"` em Contact

### Fase 2: Refatoração (Próxima semana)
- [ ] Extrair componentes de Checkout (PersonalDataStep, etc)
- [ ] Criar ArrayBuilder para admin
- [ ] Adicionar preview em tempo real no admin

### Fase 3: Polish (Semana seguinte)
- [ ] Criar página dedicada /admin/cursos/[id]/edit
- [ ] Adicionar upload real de imagens
- [ ] Criar ModuleBuilder com drag-and-drop
- [ ] Adicionar campos contextuais em InCompany

---

## 📋 Checklist de Manutenção

- [ ] **Contact**: Validação robusta para todos os campos
- [ ] **Checkout**: 4 etapas bem separadas com componentes reutilizáveis
- [ ] **InCompany**: Campos desdobrados e contextuais capturados
- [ ] **Admin**: Sem JSON em textareas, tudo com componentes UI
- [ ] **Todos**: Máscaras de input (CPF, telefone, data)
- [ ] **Todos**: Erro específico por campo, não genérico

