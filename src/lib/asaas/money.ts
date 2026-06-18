/**
 * Money rule (CRITICAL — off-by-100 risk).
 * Storage (cents): amount_cents = Math.round(courses.preco * 100).
 * Wire value (REAIS, not cents): Asaas value = amount_cents / 100.
 * Example: preco 199.90 -> amount_cents 19990 -> value 199.90.
 * Sending 19990 as the wire value over-charges 100x.
 */

export function toAmountCents(preco: number): number {
  return Math.round(preco * 100);
}

export function toAsaasValue(amountCents: number): number {
  return Math.round(amountCents) / 100;
}
