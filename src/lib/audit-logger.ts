/**
 * Audit Logger - Track security-relevant events
 * Logs are written to stdout/stderr and should be collected by logging service
 */

export type AuditEventType =
  | "auth.login"
  | "auth.logout"
  | "auth.failed"
  | "admin.create"
  | "admin.update"
  | "admin.delete"
  | "admin.access"
  | "enrollment.create"
  | "enrollment.update"
  | "enrollment.delete"
  | "security.csrf_failed"
  | "security.rate_limit_exceeded"
  | "security.suspicious_activity";

export interface AuditLogEntry {
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  status: "success" | "failure";
  details?: Record<string, unknown>;
  errorMessage?: string;
}

// In-memory audit log (in production, send to logging service)
const auditLogs: AuditLogEntry[] = [];
const MAX_MEMORY_LOGS = 1000;

/**
 * Log an audit event
 */
export function logAuditEvent(event: Omit<AuditLogEntry, "timestamp">): void {
  const entry: AuditLogEntry = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  // Add to memory
  auditLogs.push(entry);

  // Keep only last 1000 logs in memory
  if (auditLogs.length > MAX_MEMORY_LOGS) {
    auditLogs.shift();
  }

  // Log to console in structured format
  const logLevel = event.status === "failure" ? "WARN" : "INFO";
  const logMessage = {
    level: logLevel,
    timestamp: entry.timestamp,
    event: event.eventType,
    userId: entry.userId,
    ipAddress: entry.ipAddress,
    status: entry.status,
    ...(entry.details && { details: entry.details }),
    ...(entry.errorMessage && { error: entry.errorMessage }),
  };

  console.log(`[AUDIT] ${JSON.stringify(logMessage)}`);
}

/**
 * Log authentication event
 */
export function logAuthEvent(
  eventType: "auth.login" | "auth.logout" | "auth.failed",
  userEmail: string,
  ipAddress?: string,
  errorMessage?: string
): void {
  logAuditEvent({
    eventType,
    userEmail,
    ipAddress,
    status: eventType === "auth.failed" ? "failure" : "success",
    errorMessage,
  });
}

/**
 * Log admin operation
 */
export function logAdminEvent(
  action: "create" | "update" | "delete",
  resourceType: string,
  resourceId: string,
  userId: string,
  ipAddress?: string,
  details?: Record<string, unknown>
): void {
  logAuditEvent({
    eventType: `admin.${action}` as AuditEventType,
    userId,
    ipAddress,
    resourceType,
    resourceId,
    status: "success",
    details,
  });
}

/**
 * Log enrollment event
 */
export function logEnrollmentEvent(
  action: "create" | "update" | "delete",
  enrollmentId: string,
  studentEmail: string,
  ipAddress?: string,
  details?: Record<string, unknown>
): void {
  logAuditEvent({
    eventType: `enrollment.${action}` as AuditEventType,
    userEmail: studentEmail,
    ipAddress,
    resourceType: "enrollment",
    resourceId: enrollmentId,
    status: "success",
    details,
  });
}

/**
 * Log security event
 */
export function logSecurityEvent(
  eventType: "security.csrf_failed" | "security.rate_limit_exceeded" | "security.suspicious_activity",
  ipAddress?: string,
  userEmail?: string,
  details?: Record<string, unknown>
): void {
  logAuditEvent({
    eventType,
    ipAddress,
    userEmail,
    status: "failure",
    details,
  });
}

/**
 * Get audit logs (for debugging/monitoring)
 * In production, use external logging service
 */
export function getAuditLogs(
  filter?: {
    eventType?: AuditEventType;
    userId?: string;
    status?: "success" | "failure";
    startTime?: Date;
    endTime?: Date;
  }
): AuditLogEntry[] {
  if (!filter) {
    return [...auditLogs];
  }

  return auditLogs.filter((log) => {
    if (filter.eventType && log.eventType !== filter.eventType) return false;
    if (filter.userId && log.userId !== filter.userId) return false;
    if (filter.status && log.status !== filter.status) return false;

    const logTime = new Date(log.timestamp);
    if (filter.startTime && logTime < filter.startTime) return false;
    if (filter.endTime && logTime > filter.endTime) return false;

    return true;
  });
}

/**
 * Clear audit logs (use with caution)
 */
export function clearAuditLogs(): void {
  auditLogs.length = 0;
}

/**
 * Get security summary
 */
export function getSecuritySummary() {
  const failedAuth = auditLogs.filter((l) => l.eventType === "auth.failed").length;
  const rateLimitExceeded = auditLogs.filter((l) => l.eventType === "security.rate_limit_exceeded")
    .length;
  const csrfFailed = auditLogs.filter((l) => l.eventType === "security.csrf_failed").length;

  return {
    failedAuthAttempts: failedAuth,
    rateLimitExceeded,
    csrfFailures: csrfFailed,
    totalLogs: auditLogs.length,
  };
}
