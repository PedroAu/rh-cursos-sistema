/**
 * Structured logging — compatível com edge runtime (Cloudflare Workers).
 *
 * Workers não possui filesystem, então não há rotação de arquivos nem
 * transports (pino/winston file rotation são impossíveis). Esta é uma fina
 * camada sobre `console.*` que emite uma linha de JSON estruturado por log.
 * O Cloudflare Workers Logs (habilitado via `observability.enabled` no
 * `wrangler.jsonc`) captura automaticamente as saídas de `console.*`.
 *
 * Graceful degradation: logging nunca deve quebrar a aplicação. Qualquer
 * falha na serialização é engolida silenciosamente.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type LogData = Record<string, unknown>;

function serializeError(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function emit(level: LogLevel, msg: string, data?: LogData): void {
  try {
    const entry: Record<string, unknown> = {
      level,
      timestamp: new Date().toISOString(),
      msg
    };

    if (data) {
      for (const [key, value] of Object.entries(data)) {
        entry[key] = key === "err" || key === "error" ? serializeError(value) : value;
      }
    }

    const line = JSON.stringify(entry);

    if (level === "error") {
      console.error(line);
    } else if (level === "warn") {
      console.warn(line);
    } else {
      console.log(line);
    }
  } catch {
    // Logging nunca deve lançar — degrade silenciosamente.
  }
}

export const logger = {
  debug: (msg: string, data?: LogData) => emit("debug", msg, data),
  info: (msg: string, data?: LogData) => emit("info", msg, data),
  warn: (msg: string, data?: LogData) => emit("warn", msg, data),
  error: (msg: string, data?: LogData) => emit("error", msg, data)
};
