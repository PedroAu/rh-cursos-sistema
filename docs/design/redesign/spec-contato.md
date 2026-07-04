# Spec de Fidelidade — Contato (`/contato`)
**Canvas:** `pendente` · **View atual:** `src/views/public/Contact.tsx` · **Story de implementação:** `pendente`

## Objetivo da página

Captar contatos comerciais gerais com baixo atrito, oferecendo canais diretos e formulário estruturado.

## Seções

### 1. Hero institucional
- Fundo branco com borda inferior sutil.
- H1 `Entre em Contato`.
- Parágrafo explicando suporte para treinamentos corporativos e gestão pública.

### 2. Coluna de canais diretos
- Stack de cards com:
  - `Telefones`
  - `Localização`
- Cada card tem ícone, título em caps, headline e texto de apoio.
- Mapa ilustrativo em bloco estático com imagem de fundo.
- Faixa de ações com:
  - botão `WhatsApp`
  - botão `E-mail`

### 3. Formulário principal
- Card elevado com cabeçalho `Atendimento / Envie uma mensagem`.
- Estados de feedback inline:
  - erro
  - sucesso
- Formulário em grid:
  - nome completo
  - e-mail
  - telefone / WhatsApp
  - empresa / órgão
  - curso ou tema de interesse
  - mensagem
- CTA primário `Enviar mensagem`.

## Comportamento

- Validação via `zod` + `react-hook-form`.
- Telefone aceita campo opcional, mas quando preenchido exige ao menos 10 dígitos.
- Sucesso:
  - cria lead com origem `Contato`
  - reseta o formulário
  - mostra toast + feedback inline
- Erro:
  - mantém dados preenchidos
  - mostra toast + feedback inline

## Contrato de dados

### Entrada do formulário
- `name` obrigatório, min 3
- `email` obrigatório, regex
- `phone` opcional com validação mínima
- `organization` opcional
- `courseInterest` opcional
- `message` obrigatória, min 10

### Saída para lead
- `type: "Contato"`
- `origin: "Contato"`
- `courseInterest`: fallback `Contato pelo site`
- `organization`: opcional

## Notas de UX

- É uma página `hi-fi` porque o contato é uma jornada de captura direta.
- A coluna esquerda precisa parecer operacional e confiável, não apenas institucional.
- O mapa atual é ilustrativo, não interativo; isso deve ficar explícito no handoff.
