import { afterEach, describe, expect, it, vi } from "vitest";

// REC-104 (FND-03): garante, no nível de aplicação, que nenhum caminho
// público de `rh-cursos-api.ts` importa ou prefere o cliente SSR
// privilegiado (`createSupabaseServerClient`, service role). Complementa
// `supabase/tests/database/rec-104-anon-client.test.sql`, que prova a
// barreira de RLS/grants no banco: este teste prova a fiação no código —
// que caminho chama qual construtor de cliente — sem depender de Docker.

const createSupabaseServerClient = vi.fn(() => null);
const createSupabasePublicServerClient = vi.fn(() => null);

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient,
  createSupabasePublicServerClient,
  isSupabaseServerConfigured: false,
  isSupabasePublicServerConfigured: false,
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: null,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("REC-104 — roteamento do cliente SSR público vs. privilegiado", () => {
  it("fetchPublicCatalogFromSupabaseServer usa exclusivamente o cliente anon dedicado", async () => {
    const { fetchPublicCatalogFromSupabaseServer } = await import("@/lib/supabase/rh-cursos-api");

    await fetchPublicCatalogFromSupabaseServer(true);

    expect(createSupabasePublicServerClient).toHaveBeenCalledTimes(1);
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("fetchPublicBlogPostsFromSupabaseServer usa exclusivamente o cliente anon dedicado", async () => {
    const { fetchPublicBlogPostsFromSupabaseServer } = await import("@/lib/supabase/rh-cursos-api");

    await fetchPublicBlogPostsFromSupabaseServer(true);

    expect(createSupabasePublicServerClient).toHaveBeenCalledTimes(1);
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("fetchPublicTestimonialsFromSupabaseServer usa exclusivamente o cliente anon dedicado", async () => {
    const { fetchPublicTestimonialsFromSupabaseServer } = await import("@/lib/supabase/rh-cursos-api");

    await fetchPublicTestimonialsFromSupabaseServer();

    expect(createSupabasePublicServerClient).toHaveBeenCalledTimes(1);
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("fetchAdminCatalogFromSupabaseServer continua usando o cliente privilegiado (fora de escopo de REC-104)", async () => {
    const { fetchAdminCatalogFromSupabaseServer } = await import("@/lib/supabase/rh-cursos-api");

    await fetchAdminCatalogFromSupabaseServer();

    expect(createSupabaseServerClient).toHaveBeenCalledTimes(1);
    expect(createSupabasePublicServerClient).not.toHaveBeenCalled();
  });

  it("fetchAdminBlogPostsFromSupabaseServer continua usando o cliente privilegiado (fora de escopo de REC-104)", async () => {
    const { fetchAdminBlogPostsFromSupabaseServer } = await import("@/lib/supabase/rh-cursos-api");

    await fetchAdminBlogPostsFromSupabaseServer();

    expect(createSupabaseServerClient).toHaveBeenCalledTimes(1);
    expect(createSupabasePublicServerClient).not.toHaveBeenCalled();
  });
});
