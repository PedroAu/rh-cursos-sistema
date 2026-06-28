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
 * @example cn("rounded border", isActive && "border-primary", { "opacity-50": disabled })
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

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
