/**
 * Input sanitization utilities
 * Defense against XSS, injection attacks
 */

/**
 * Sanitize HTML to prevent XSS
 * Removes potentially dangerous characters but preserves safe content
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input
    .replace(/[<>]/g, (char) => (char === "<" ? "&lt;" : "&gt;"))
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize text input (for name, email, etc)
 * Removes special characters that could be used in injection
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input
    .trim()
    .replace(/[<>{}[\]`]/g, "") // Remove HTML-like chars
    .slice(0, 1000); // Limit length
}

/**
 * Sanitize email
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input.toLowerCase().trim().slice(0, 254); // RFC 5321
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  try {
    const url = new URL(input);
    // Only allow http/https
    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

/**
 * Sanitize phone number - keep only digits and common formatting
 */
export function sanitizePhone(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Keep only numbers and common formatting characters
  return input.replace(/[^\d\s\-()]/g, "").slice(0, 20);
}

/**
 * Sanitize JSON object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key
    const sanitizedKey = sanitizeText(key);

    if (typeof value === "string") {
      sanitized[sanitizedKey] = sanitizeText(value);
    } else if (typeof value === "number" || typeof value === "boolean") {
      sanitized[sanitizedKey] = value;
    } else if (value === null) {
      sanitized[sanitizedKey] = null;
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.map((item) =>
        typeof item === "string" ? sanitizeText(item) : item
      );
    } else if (typeof value === "object") {
      sanitized[sanitizedKey] = sanitizeObject(value as Record<string, unknown>);
    }
  }

  return sanitized as T;
}

/**
 * Check if string contains SQL keywords (simple check)
 */
export function hasSqlKeywords(input: string): boolean {
  const sqlKeywords = [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "CREATE",
    "ALTER",
    "EXEC",
    "EXECUTE",
    "UNION",
    "SCRIPT",
    "<script",
  ];

  const upperInput = input.toUpperCase();
  return sqlKeywords.some((keyword) => upperInput.includes(keyword));
}

/**
 * Validate and sanitize user input
 */
export interface SanitizationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  type?: "text" | "email" | "url" | "phone";
}

export function sanitizeInput(
  input: string,
  options: SanitizationOptions = {}
): string {
  if (!input) {
    return "";
  }

  const { maxLength = 1000, type = "text" } = options;

  // Check for SQL injection attempts
  if (hasSqlKeywords(input)) {
    console.warn("⚠️ SQL injection attempt detected");
    return "";
  }

  let sanitized = input;

  // Type-specific sanitization
  switch (type) {
    case "email":
      sanitized = sanitizeEmail(input);
      break;
    case "url":
      sanitized = sanitizeUrl(input);
      break;
    case "phone":
      sanitized = sanitizePhone(input);
      break;
    default:
      sanitized = sanitizeText(input);
  }

  // Limit length
  return sanitized.slice(0, maxLength);
}
