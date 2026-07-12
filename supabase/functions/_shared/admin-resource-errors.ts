export class AdminResourceError extends Error {
  readonly status: number;

  constructor(message: string, status = 422) {
    super(message);
    this.name = "AdminResourceError";
    this.status = status;
  }
}

export function isAdminResourceError(error: unknown): error is AdminResourceError {
  return error instanceof AdminResourceError;
}
