import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Helper canônico de className do projeto. É o único padrão aprovado para
 * compor classes Tailwind condicionais — evite template literals com `${...}`
 * ou concatenação manual em `className`.
 *
 * - `clsx` resolve entradas condicionais (strings, objetos `{ classe: bool }`,
 *   arrays, valores falsy ignorados).
 * - `twMerge` deduplica classes Tailwind conflitantes, vencendo a última
 *   declarada (ex.: `cn("px-2", "px-4")` → `"px-4"`).
 *
 * @example cn("rounded border", isActive && "border-tk-brand", { "opacity-50": disabled })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

/**
 * Parses a business date without allowing the browser timezone to move it to
 * the previous/next calendar day. Database `date` columns are represented as
 * YYYY-MM-DD, not as instants in time.
 */
export function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return new Date(value);
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), 12);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parseDate(date));
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
