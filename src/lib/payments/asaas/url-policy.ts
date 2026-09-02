import type { AsaasEnvironment } from "@/lib/payments/asaas/config";

const CHECKOUT_HOST_BY_ENVIRONMENT = {
  sandbox: "sandbox.asaas.com",
  production: "asaas.com",
} as const;

const PRODUCTION_CHECKOUT_HOSTS = new Set(["asaas.com", "www.asaas.com"]);

export function isAllowedAsaasCheckoutUrl(
  candidate: string,
  environment: AsaasEnvironment,
): boolean {
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return false;
    if (
      environment === "production"
        ? !PRODUCTION_CHECKOUT_HOSTS.has(url.hostname)
        : url.hostname !== CHECKOUT_HOST_BY_ENVIRONMENT[environment]
    ) {
      return false;
    }
    if (url.port || url.username || url.password || url.hash) return false;
    const prefix = "/checkoutSession/show";
    if (url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) return false;

    // A documentação do Asaas já apresentou as duas formas oficiais: o ID no
    // path retornado pela API e o ID na query do checkout. Aceitamos somente
    // essas duas variantes, ambas no host/path exatos do ambiente selecionado.
    const pathId = url.pathname.slice(prefix.length).replace(/^\//, "");
    const keys = [...url.searchParams.keys()];
    if (pathId.length > 0) return keys.length === 0 && /^[A-Za-z0-9._-]{1,200}$/.test(pathId);
    return keys.length === 1 && keys[0] === "id" && (url.searchParams.get("id")?.trim().length ?? 0) > 0;
  } catch {
    return false;
  }
}
