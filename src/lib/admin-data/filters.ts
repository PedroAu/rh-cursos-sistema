export function normalizeValue(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function matchesQuery(fields: Array<string | null | undefined>, query?: string) {
  if (!query) {
    return true;
  }

  const normalizedQuery = normalizeValue(query).trim();

  if (normalizedQuery.length === 0) {
    return true;
  }

  return fields.some((field) => normalizeValue(field).includes(normalizedQuery));
}

export function matchesExactFilter(value: string | null | undefined, filter?: string) {
  if (!filter || filter === "todos") {
    return true;
  }

  return normalizeValue(value) === normalizeValue(filter);
}

export function matchesDateRange(
  value: string | null | undefined,
  dateFrom?: string,
  dateTo?: string,
) {
  if (!value) {
    return !dateFrom && !dateTo;
  }

  const date = value.slice(0, 10);

  if (dateFrom && date < dateFrom) {
    return false;
  }

  if (dateTo && date > dateTo) {
    return false;
  }

  return true;
}

export function formatPrice(value: number | null | undefined) {
  if (!value || value <= 0) {
    return "Sob consulta";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const text = record.title ?? record.label ?? record.name ?? record.description;
        return typeof text === "string" ? text : null;
      }

      return null;
    })
    .filter((item): item is string => Boolean(item && item.trim().length > 0));
}
