import { vi } from "vitest";
import { loginAction } from "@/app/(auth)/login/actions";

const { redirect, createClient, createAdminClient } = vi.hoisted(() => ({
  redirect: vi.fn(),
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient,
}));

function buildFormData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

function buildSupabaseClient(options: {
  signInError?: { message: string } | null;
  user?: { id: string } | null;
}) {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        error: options.signInError ?? null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: options.user ?? null },
      }),
    },
  };
}

function buildAdminClient(profile: { role: string } | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: profile });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return { from };
}

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when email is missing and does not call supabase", async () => {
    const supabase = buildSupabaseClient({});
    createClient.mockResolvedValue(supabase);

    const result = await loginAction(
      { error: null },
      buildFormData({ password: "secret123" }),
    );

    expect(result).toEqual({ error: "Preencha e-mail e senha." });
    expect(createClient).not.toHaveBeenCalled();
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("returns authentication error when signInWithPassword fails", async () => {
    const supabase = buildSupabaseClient({
      signInError: { message: "Invalid credentials" },
    });
    createClient.mockResolvedValue(supabase);

    const result = await loginAction(
      { error: null },
      buildFormData({ email: "user@example.com", password: "wrongpass" }),
    );

    expect(result).toEqual({
      error: "Não foi possível autenticar com estas credenciais.",
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("returns invalid session error when getUser returns no user after successful login", async () => {
    const supabase = buildSupabaseClient({ signInError: null, user: null });
    createClient.mockResolvedValue(supabase);

    const result = await loginAction(
      { error: null },
      buildFormData({ email: "user@example.com", password: "correctpass" }),
    );

    expect(result).toEqual({ error: "Sessão inválida após o login." });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects to the requested admin path when user is admin and next starts with /admin", async () => {
    const supabase = buildSupabaseClient({
      signInError: null,
      user: { id: "user-1" },
    });
    createClient.mockResolvedValue(supabase);
    createAdminClient.mockReturnValue(buildAdminClient({ role: "admin" }));

    await loginAction(
      { error: null },
      buildFormData({
        email: "admin@example.com",
        password: "correctpass",
        next: "/admin/cursos",
      }),
    );

    expect(redirect).toHaveBeenCalledWith("/admin/cursos");
  });

  it("redirects to /admin fallback when admin user's next does not start with /admin", async () => {
    const supabase = buildSupabaseClient({
      signInError: null,
      user: { id: "user-1" },
    });
    createClient.mockResolvedValue(supabase);
    createAdminClient.mockReturnValue(buildAdminClient({ role: "admin" }));

    await loginAction(
      { error: null },
      buildFormData({
        email: "admin@example.com",
        password: "correctpass",
        next: "/evil",
      }),
    );

    expect(redirect).toHaveBeenCalledWith("/admin");
  });

  it("redirects to / when user role is not admin", async () => {
    const supabase = buildSupabaseClient({
      signInError: null,
      user: { id: "user-2" },
    });
    createClient.mockResolvedValue(supabase);
    createAdminClient.mockReturnValue(buildAdminClient({ role: "aluno" }));

    await loginAction(
      { error: null },
      buildFormData({ email: "aluno@example.com", password: "correctpass" }),
    );

    expect(redirect).toHaveBeenCalledWith("/");
  });
});
