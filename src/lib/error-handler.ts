import { NextResponse } from "next/server";

/**
 * Safe error response - never expose internal details in production
 */

export interface ErrorContext {
  context?: string;
  userId?: string;
  ipAddress?: string;
  requestId?: string;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public publicMessage: string,
    public internalMessage?: string
  ) {
    super(publicMessage);
    this.name = "AppError";
  }
}

/**
 * Log error safely (never log sensitive data)
 */
export function logError(error: unknown, context: ErrorContext = {}): void {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);

  // Log structure for external services
  const logEntry = {
    timestamp,
    level: "ERROR",
    message,
    context: context.context,
    requestId: context.requestId,
    // Never log user IDs or IP addresses in plain text
    ...(process.env.NODE_ENV === "development" && {
      stack: error instanceof Error ? error.stack : undefined,
    }),
  };

  console.error(JSON.stringify(logEntry));
}

/**
 * Handle API errors safely
 */
export function handleApiError(
  error: unknown,
  context: ErrorContext = {}
): NextResponse {
  // Log error for debugging
  logError(error, context);

  // Determine error response
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.publicMessage,
        ...(process.env.NODE_ENV === "development" && {
          internal: error.internalMessage,
        }),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid request format",
        ...(process.env.NODE_ENV === "development" && {
          internal: error.message,
        }),
      },
      { status: 400 }
    );
  }

  // Generic error - never expose details in production
  const isProduction = process.env.NODE_ENV === "production";
  const errorMessage = isProduction
    ? "An error occurred processing your request"
    : error instanceof Error
      ? error.message
      : "Unknown error";

  return NextResponse.json(
    {
      ok: false,
      error: errorMessage,
      ...(context.requestId && { requestId: context.requestId }),
    },
    { status: 500 }
  );
}

/**
 * Validate request exists and has content
 */
export async function validateRequest(request: Request): Promise<unknown> {
  try {
    if (!request.body) {
      throw new AppError(400, "Request body is required");
    }

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new AppError(400, "Content-Type must be application/json");
    }

    const data = await request.json();
    return data;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new AppError(400, "Invalid JSON in request body");
    }

    throw error;
  }
}

/**
 * Specific error types
 */
export class ValidationError extends AppError {
  constructor(message: string, public fieldErrors?: Record<string, string>) {
    super(400, message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(public retryAfterSeconds: number) {
    super(429, "Too many requests. Please try again later.");
    this.name = "RateLimitError";
  }
}

/**
 * Assert condition, throw if false
 */
export function assert(condition: boolean, message: string, statusCode = 400): void {
  if (!condition) {
    throw new AppError(statusCode, message);
  }
}
