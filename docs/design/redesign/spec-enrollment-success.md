# Spec de Fidelidade — Sucesso de Inscrição (`/inscricao/sucesso`)
**Canvas:** `pendente` · **View atual:** `src/views/public/EnrollmentSuccess.tsx` · **Story de implementação:** `pendente`

## Objetivo da página

Confirmar a inscrição, reduzir ansiedade pós-envio e orientar os próximos passos do atendimento.

## Seções

### 1. Card central de confirmação
- Layout centralizado.
- Eyebrow `Inscrição recebida com sucesso`.
- H1 `Tudo pronto para a próxima etapa.`
- Texto de apoio sobre acompanhamento por e-mail.

### 2. Resumo da inscrição
- Grid em 2 colunas com:
  - curso
  - turma
  - aluno
  - forma de pagamento
- Fundo suave destacado.

### 3. Próximos passos
- Grid de 3 cards sequenciais:
  - confirmação
  - operação
  - atendimento

### 4. Ações finais
- CTA secundário `Ver outros cursos`
- CTA ghost `Falar com atendimento`

## Estados

- usa prioridade de origem de estado:
  1. query string
  2. state de navegação
  3. session storage
  4. último enrollment do store
- sem dados suficientes:
  - mantém layout genérico com labels fallback

## Contrato de dados

### Estado de entrada
- `courseId`
- `classId`
- `studentName`
- `paymentMethod`

### Dados derivados
- `course.title`
- `class.startDate`

## Notas de UX

- Fidelidade `mid-fi` é suficiente, mas a página precisa parecer definitiva e confiável.
- O CTA `Falar com atendimento` aponta hoje para `/falar-com-especialista`; validar a rota final no handoff.
