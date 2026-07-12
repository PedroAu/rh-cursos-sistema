import { AdminResourceError } from "./admin-resource-errors.ts";

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function resolveUniqueId<T extends { id: string }>(
  rows: T[] | null | undefined,
  reference: string,
  label: string,
  exactMatchers: Array<(row: T, rawReference: string, normalizedReference: string) => boolean>,
  fuzzyHaystack: (row: T) => string
): string {
  const rawReference = reference.trim();
  if (!rawReference) {
    throw new AdminResourceError(`${label} não informado.`, 422);
  }

  const normalizedReference = normalizeSearchText(
    rawReference.replace(/^course-/, "").replace(/^instructor-/, "")
  );
  const referenceTokens = normalizedReference.split(/\s+/).filter(Boolean);
  const safeRows = rows ?? [];

  const exactMatches = safeRows.filter((row) =>
    exactMatchers.some((matcher) => matcher(row, rawReference, normalizedReference))
  );
  if (exactMatches.length === 1) {
    return exactMatches[0].id;
  }
  if (exactMatches.length > 1) {
    throw new AdminResourceError(`${label} ambíguo para "${reference}". Use o ID exato.`, 422);
  }

  if (referenceTokens.length === 0) {
    throw new AdminResourceError(`${label} não encontrado para "${reference}".`, 422);
  }

  const fuzzyMatches = safeRows.filter((row) =>
    referenceTokens.every((token) => fuzzyHaystack(row).includes(token))
  );
  if (fuzzyMatches.length === 1) {
    return fuzzyMatches[0].id;
  }
  if (fuzzyMatches.length > 1) {
    throw new AdminResourceError(`${label} ambíguo para "${reference}". Use o ID exato.`, 422);
  }

  throw new AdminResourceError(`${label} não encontrado para "${reference}".`, 422);
}
