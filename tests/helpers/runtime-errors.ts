import type { Page } from "@playwright/test";

const IGNORED_CONSOLE_ERRORS = [
  "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
];

function shouldIgnoreConsoleError(message: string) {
  return IGNORED_CONSOLE_ERRORS.some((knownMessage) => message.includes(knownMessage));
}

export function attachRuntimeErrorProbe(page: Page) {
  const runtimeErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }

    const text = message.text();
    if (shouldIgnoreConsoleError(text)) {
      return;
    }

    runtimeErrors.push(text);
  });

  page.on("pageerror", (error) => {
    runtimeErrors.push(error.stack ?? error.message);
  });

  return runtimeErrors;
}
