import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

/**
 * Validação de respostas + resiliência para chamadas Supabase.
 *
 * - `validateResponse` valida payloads contra um schema Zod na borda de dados.
 * - `withRetry` reexecuta operações em falhas transitórias (rede/timeout/5xx).
 * - Erros de validação são logados de forma estruturada e enviados ao Sentry.
 */

export interface ValidationContext {
  /** Função/endpoint de origem (ex.: "fetchPublicCatalog"). */
  endpoint: string;
  /** Tabela ou recurso consultado (ex.: "curso"). */
  resource: string;
  /** Nome do schema esperado, para diagnóstico. */
  schema: string;
}

/** Erro lançado quando uma resposta não corresponde ao schema esperado. */
export class ApiValidationError extends Error {
  readonly endpoint: string;
  readonly resource: string;
  readonly issues: z.ZodError["issues"];

  constructor(context: ValidationContext, issues: z.ZodError["issues"]) {
    super(`Resposta inválida de ${context.endpoint} (${context.resource}): formato inesperado.`);
    this.name = "ApiValidationError";
    this.endpoint = context.endpoint;
    this.resource = context.resource;
    this.issues = issues;
  }
}

/** Descreve o formato recebido sem expor valores (evita vazar PII nos logs). */
function describeShape(data: unknown, depth = 0): unknown {
  if (data === null) return "null";
  if (Array.isArray(data)) {
    return [data.length > 0 ? describeShape(data[0], depth + 1) : "empty"];
  }
  const type = typeof data;
  if (type !== "object") return type;
  if (depth >= 2) return "object";
  return Object.fromEntries(
    Object.entries(data as Record<string, unknown>).map(([key, value]) => [key, describeShape(value, depth + 1)])
  );
}

/** Log estruturado de erro de validação para console + Sentry. */
function logValidationError(context: ValidationContext, error: z.ZodError, data: unknown): void {
  const payload = {
    level: "error" as const,
    event: "supabase.validation_error",
    endpoint: context.endpoint,
    resource: context.resource,
    expectedSchema: context.schema,
    receivedShape: describeShape(data),
    issues: error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code, message: issue.message }))
  };

  console.error(JSON.stringify(payload));

  Sentry.captureException(error, {
    level: "error",
    tags: { area: "supabase", endpoint: context.endpoint, resource: context.resource },
    extra: {
      expectedSchema: context.schema,
      receivedShape: payload.receivedShape,
      issues: payload.issues
    }
  });
}

/**
 * Valida `data` contra `schema`. Em caso de falha, registra o erro de forma
 * estruturada (console + Sentry) e lança `ApiValidationError`.
 */
export function validateResponse<T>(data: unknown, schema: z.ZodType<T>, context: ValidationContext): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    logValidationError(context, result.error, data);
    throw new ApiValidationError(context, result.error.issues);
  }
  return result.data;
}

const NON_TRANSIENT_STATUS = new Set([400, 401, 403, 404, 409, 422]);

function extractStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const candidate = (error as { status?: unknown; statusCode?: unknown }).status ?? (error as { statusCode?: unknown }).statusCode;
  return typeof candidate === "number" ? candidate : undefined;
}

/**
 * Determina se um erro é transitório e elegível para retry.
 *
 * - Transitório: erro de rede (fetch failed/timeout/ECONN) ou HTTP 5xx.
 * - Não transitório: 400/401/403/404/409/422 ou erro PostgREST com `code`
 *   (o servidor respondeu com uma falha de query — repetir não ajuda).
 */
export function isTransientError(error: unknown): boolean {
  const status = extractStatus(error);
  if (status !== undefined) {
    if (NON_TRANSIENT_STATUS.has(status)) return false;
    return status >= 500;
  }

  // PostgREST devolve um `code` (SQLSTATE) quando a query falha no servidor.
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code?: unknown }).code ?? "");
    // Códigos de conexão/indisponibilidade do Postgres são transitórios.
    return /^(08|53|57P0|XX)/.test(code);
  }

  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return /fetch failed|network|timeout|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN|socket hang up/i.test(message);
}

/** Resposta padrão do supabase-js: `{ data, error }`. */
type MaybeSupabaseResult = { error?: unknown } | unknown;

function resultError(value: MaybeSupabaseResult): unknown {
  if (typeof value === "object" && value !== null && "error" in value) {
    return (value as { error?: unknown }).error;
  }
  return null;
}

export interface RetryOptions {
  /** Máximo de tentativas adicionais após a primeira (padrão: 3). */
  maxRetries?: number;
  /** Base do backoff exponencial em ms (padrão: 100 → 100/200/400). */
  baseDelayMs?: number;
  /** Injetável para testes; padrão usa `setTimeout`. */
  sleep?: (ms: number) => Promise<void>;
  /** Rótulo para logs de retry. */
  label?: string;
}

const defaultSleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executa `fn` com retry e backoff exponencial em falhas transitórias.
 * Funciona tanto com funções que lançam (erros de rede) quanto com thunks que
 * retornam o resultado `{ data, error }` do supabase-js.
 */
export async function withRetry<T extends MaybeSupabaseResult>(
  fn: () => PromiseLike<T> | T,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 100, sleep = defaultSleep, label = "supabase" } = options;

  let attempt = 0;
  // Loop: tentativa inicial + até `maxRetries` re-execuções.
  for (;;) {
    try {
      const result = await fn();
      const error = resultError(result);
      if (error && isTransientError(error) && attempt < maxRetries) {
        await backoff(attempt, baseDelayMs, sleep, label);
        attempt += 1;
        continue;
      }
      return result;
    } catch (error) {
      if (isTransientError(error) && attempt < maxRetries) {
        await backoff(attempt, baseDelayMs, sleep, label);
        attempt += 1;
        continue;
      }
      throw error;
    }
  }
}

async function backoff(attempt: number, baseDelayMs: number, sleep: (ms: number) => Promise<void>, label: string): Promise<void> {
  const delay = baseDelayMs * 2 ** attempt;
  console.warn(
    JSON.stringify({
      level: "warn",
      event: "supabase.retry",
      label,
      attempt: attempt + 1,
      delayMs: delay
    })
  );
  await sleep(delay);
}
