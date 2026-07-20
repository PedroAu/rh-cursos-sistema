/**
 * Structured logging — compatível com edge runtime (Cloudflare Workers).
 *
 * Workers não possui filesystem, então não há rotação de arquivos nem
 * transports (pino/winston file rotation são impossíveis). Esta é uma fina
 * camada sobre `console.*` que emite uma linha de JSON estruturado por log.
 * O Cloudflare Workers Logs (habilitado via `observability.enabled` no
 * `wrangler.jsonc`) captura automaticamente as saídas de `console.*`.
 *
 * REC-408: redaction central e recursiva na fronteira do logger. Nenhum chamador
 * precisa lembrar de sanear — token, cookie, senha, e-mail e telefone são
 * redigidos aqui, por nome de campo sensível e por formato de credencial, antes
 * da serialização. Erros são serializados sem reintroduzir segredo/PII via
 * `message`, `cause` ou `stack` (stack só é emitido fora de produção).
 *
 * Graceful degradation: logging nunca deve quebrar a aplicação. Qualquer falha
 * na serialização (inclusive estruturas circulares/não serializáveis) é
 * engolida silenciosamente e substituída por um marcador seguro.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type LogData = Record<string, unknown>;

const REDACTED = "[REDACTED]";
const CIRCULAR = "[Circular]";
const MAX_DEPTH = 8;

/**
 * Nomes de campo cujo valor é sempre redigido, independentemente do formato.
 * Cobre os campos exigidos pela AC5 e aliases usuais de credencial. Comparação
 * case-insensitive; hífens e underscores são normalizados.
 */
const SENSITIVE_KEY = new Set([
  "authorization",
  "cookie",
  "setcookie",
  "token",
  "accesstoken",
  "refreshtoken",
  "idtoken",
  "password",
  "passwd",
  "pwd",
  "senha",
  "secret",
  "apikey",
  "email",
  "phone",
  "telefone",
  "mfacode",
  "otp",
  "bearer",
  "credential",
  "credentials",
  "xrhsession",
  "servicerolekey",
]);

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY.has(key.toLowerCase().replace(/[_-]/g, ""));
}

/** Padrões de valor com formato de credencial/PII, redigidos em qualquer campo. */
const BEARER_RE = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT_RE = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/** Redige substrings com formato de credencial/PII dentro de um valor string. */
function scrubString(value: string): string {
  return value
    .replace(BEARER_RE, "Bearer " + REDACTED)
    .replace(JWT_RE, REDACTED)
    .replace(EMAIL_RE, REDACTED);
}

function serializeError(value: Error, seen: WeakSet<object>, depth: number): Record<string, unknown> {
  const out: Record<string, unknown> = {
    name: value.name,
    message: scrubString(String(value.message ?? "")),
  };
  // Stack pode conter caminhos/dados sensíveis — só fora de produção, e ainda saneado.
  if (process.env.NODE_ENV !== "production" && typeof value.stack === "string") {
    out.stack = scrubString(value.stack);
  }
  const cause = (value as { cause?: unknown }).cause;
  if (cause !== undefined) {
    out.cause = redact(cause, seen, depth + 1);
  }
  return out;
}

/**
 * Redaction recursiva e defensiva. Nunca lança: estruturas circulares viram
 * `[Circular]`, profundidade excessiva vira `[Truncated]` e valores exóticos
 * caem para um marcador seguro.
 */
function redact(value: unknown, seen: WeakSet<object>, depth = 0): unknown {
  if (value === null || value === undefined) return value;

  const type = typeof value;
  if (type === "string") return scrubString(value as string);
  if (type === "number" || type === "boolean" || type === "bigint") return value;
  if (type === "function" || type === "symbol") return `[${type}]`;

  if (value instanceof Error) {
    if (seen.has(value)) return CIRCULAR;
    // `seen` rastreia o caminho de recursão atual, não todos os nós já vistos:
    // remove-se o nó ao sair do ramo para não marcar um DAG legítimo (mesmo
    // objeto em ramos irmãos) como [Circular]. Ciclo real (nó que referencia
    // a si mesmo ou um ancestral) continua barrado.
    seen.add(value);
    try {
      return serializeError(value, seen, depth);
    } finally {
      seen.delete(value);
    }
  }

  if (type === "object") {
    if (seen.has(value as object)) return CIRCULAR;
    if (depth >= MAX_DEPTH) return "[Truncated]";
    seen.add(value as object);
    try {
      if (Array.isArray(value)) {
        return value.map((item) => redact(item, seen, depth + 1));
      }

      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        out[key] = isSensitiveKey(key) ? REDACTED : redact(val, seen, depth + 1);
      }
      return out;
    } finally {
      seen.delete(value as object);
    }
  }

  return REDACTED;
}

function emit(level: LogLevel, msg: string, data?: LogData): void {
  try {
    const entry: Record<string, unknown> = {
      level,
      timestamp: new Date().toISOString(),
      msg: scrubString(String(msg ?? "")),
    };

    if (data) {
      const seen = new WeakSet<object>();
      for (const [key, value] of Object.entries(data)) {
        entry[key] = isSensitiveKey(key) ? REDACTED : redact(value, seen, 0);
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
