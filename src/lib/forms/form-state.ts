/**
 * Estado de form compartilhado entre Server Actions e useActionState.
 *
 * `fieldErrors` é opcional e DEVE ser omitido no caminho de sucesso
 * (nunca `{}`) — ver docs/architecture/form-system-evolution.md §5.1.
 * No caminho de erro de validação, populado com { campo: 1ª mensagem }.
 */
export type FormState = {
  error: string | null;
  success: string | null;
  fieldErrors?: Record<string, string>;
};
