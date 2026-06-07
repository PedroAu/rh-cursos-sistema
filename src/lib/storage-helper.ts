// Storage helper to safely manage client-side data without localStorage for sensitive information
// Use only for non-sensitive data, or prefer HttpOnly cookies for sessions

/**
 * Session data should be stored in HttpOnly cookies, not localStorage
 * This helper ensures we don't expose sensitive information
 */

// Types of data that can be safely stored in client-side storage
export type SafeStorageKeys = "theme" | "language" | "ui_preferences";

// Data that should NEVER be stored on client
export const SENSITIVE_KEYS = [
  "sessionToken",
  "authToken",
  "refreshToken",
  "csrfToken",
  "password",
  "secret",
  "apiKey",
  "credentials",
];

/**
 * Safely set data in sessionStorage (cleared when tab closes)
 * Only use for non-sensitive, temporary data
 */
export function setSessionData(key: SafeStorageKeys, value: unknown): void {
  if (typeof window === "undefined") return;

  if (SENSITIVE_KEYS.some((k) => key.includes(k.toLowerCase()))) {
    console.warn(`⚠️ Attempted to store sensitive key "${key}" in sessionStorage - blocked`);
    return;
  }

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set session data for key "${key}":`, error);
  }
}

/**
 * Safely get data from sessionStorage
 */
export function getSessionData<T>(key: SafeStorageKeys): T | null {
  if (typeof window === "undefined") return null;

  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Failed to get session data for key "${key}":`, error);
    return null;
  }
}

/**
 * Remove data from sessionStorage
 */
export function removeSessionData(key: SafeStorageKeys): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove session data for key "${key}":`, error);
  }
}

/**
 * Clear all data from sessionStorage
 */
export function clearSessionData(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.clear();
  } catch (error) {
    console.error("Failed to clear session data:", error);
  }
}

/**
 * Security audit: Check for sensitive data in localStorage
 * Call this on app startup to detect misconfigured storage
 */
export function auditStorageForSensitiveData(): void {
  if (typeof window === "undefined") return;

  console.log("🔍 Auditing storage for sensitive data...");

  for (const storage of [localStorage, sessionStorage]) {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) continue;

      const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey));

      if (isSensitive) {
        console.warn(`⚠️  SECURITY: Found sensitive data in ${storage === localStorage ? "localStorage" : "sessionStorage"}: "${key}"`);
        console.warn("   This should be stored in HttpOnly cookies instead");
      }
    }
  }

  console.log("✅ Storage audit complete");
}

/**
 * Safe way to manage theme/language preferences
 * Only use for non-sensitive user preferences
 */
export const UserPreferences = {
  setTheme(theme: "light" | "dark" | "system") {
    setSessionData("theme" as SafeStorageKeys, theme);
  },

  getTheme(): "light" | "dark" | "system" | null {
    return getSessionData<"light" | "dark" | "system">("theme" as SafeStorageKeys);
  },

  setLanguage(language: string) {
    setSessionData("language" as SafeStorageKeys, language);
  },

  getLanguage(): string | null {
    return getSessionData<string>("language" as SafeStorageKeys);
  },
};
