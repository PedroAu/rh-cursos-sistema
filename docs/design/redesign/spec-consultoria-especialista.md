# Spec de Fidelidade — Consultoria / Especialista (`/consultoria` ou rota equivalente)
**Canvas:** `pendente` · **View atual:** `src/views/public/SpecialistContact.tsx` · **Story de implementação:** `pendente`

## Objetivo da página

Captar lead qualificado para atendimento consultivo, com ênfase em diagnóstico antes de proposta.

## Variações da jornada

### `leadOrigin = "Consultoria"`
- headline orientada a clareza operacional
- hero com chips de highlights consultivos

### `leadOrigin = "Especialista"`
- headline orientada a contato humano e triagem do desafio
- sem chips adicionais

## Seções

### 1. Hero escuro
- Fundo navy.
- Badge/label contextual da jornada.
- H1 e parágrafo variáveis conforme origem.
- Chips de highlights somente na jornada de consultoria.

### 2. Coluna de diagnóstico
- Bloco textual com eyebrow `Diagnóstico personalizado`.
- H2 sobre entender o caminho antes da solução.
- Texto explicativo contextualizado por jornada.
- Grid de 2 cards de garantia:
  - diagnóstico personalizado
  - expertise em setor público
- Card de atendimento com avatar, nome e citação da coordenadora.

### 3. Formulário de solicitação
- Card elevado com:
  - eyebrow `Formulário`
  - H2 `Solicite o contato`
  - texto de apoio
- Estados inline:
  - erro
  - sucesso
- Campos:
  - nome completo
  - e-mail corporativo
  - WhatsApp
  - empresa ou órgão
  - área de interesse
  - mensagem
- CTA `Solicitar contato`

## Comportamento

- Validação manual client-side.
- Telefone obrigatório com máscara.
- Select obrigatório com 5 opções:
  - Recursos Humanos
  - Licitações e Contratos
  - Gestão Pública
  - Treinamento In Company
  - Outros Assuntos
- Sucesso:
  - cria lead `type: "Consultoria"`
  - `origin` usa `leadOrigin`
  - feedback inline e reset

## Contrato de dados

### Entrada
- `name`, `email`, `phone`, `organization`, `interestArea`, `message`

### Saída
- `type: "Consultoria"`
- `organization`
- `courseInterest = interestArea`
- `trainingTheme = interestArea`
- `origin = "Consultoria" | "Especialista"`

## Notas de UX

- Esta página é `hi-fi` e deve funcionar como ponte entre marketing e triagem comercial.
- A diferenciação entre `Consultoria` e `Especialista` precisa ser preservada no copy, sem duplicar a estrutura visual.
