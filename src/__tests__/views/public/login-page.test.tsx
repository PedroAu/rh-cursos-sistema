import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";

import type { DashboardRole } from "@/lib/auth";
import { LoginPage } from "@/views/public/Login";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  setSession: vi.fn(),
  setSessionToken: vi.fn(),
  setSupabaseSession: vi.fn(),
  toastSuccess: vi.fn(),
  pathname: "/login/aluno" as string,
  searchParams: new URLSearchParams()
}));

vi.mock("@/lib/router-compat", () => ({
  useNavigate: () => mocks.navigate
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useSearchParams: () => mocks.searchParams
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...(props as Record<string, string>)} />;
  }
}));

vi.mock("@/lib/app-store", () => ({
  useAppStore: () => ({ setSession: mocks.setSession })
}));

vi.mock("@/lib/supabase/session-token", () => ({
  setSessionToken: (...args: unknown[]) => mocks.setSessionToken(...args),
  setSupabaseSession: (...args: unknown[]) => mocks.setSupabaseSession(...args)
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: null
}));

vi.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => mocks.toastSuccess(...args) }
}));

function mockLoginResponse(role: DashboardRole) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      session: { role, email: "user@test.com", name: "User" },
      token: "hmac-token",
      supabaseSession: null
    })
  }) as unknown as typeof fetch;
}

async function submitCredentials() {
  fireEvent.change(screen.getByPlaceholderText("voce@empresa.com.br"), {
    target: { value: "user@test.com" }
  });
  fireEvent.change(screen.getByPlaceholderText("••••••••"), {
    target: { value: "password123" }
  });
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("LoginPage — destino deriva do papel server-side (REC-305)", () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.setSession.mockReset();
    mocks.setSessionToken.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.pathname = "/login/aluno";
    mocks.searchParams = new URLSearchParams();
  });

  it("redireciona o aluno para /aluno quando o servidor devolve role=student", async () => {
    mockLoginResponse("student");
    render(<LoginPage />);
    await submitCredentials();

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/aluno"));
  });

  it("redireciona o instrutor para /instrutor quando o servidor devolve role=instructor", async () => {
    mocks.pathname = "/login/instrutor";
    mockLoginResponse("instructor");
    render(<LoginPage />);
    await submitCredentials();

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/instrutor"));
  });

  it("redireciona o admin para /admin quando o servidor devolve role=admin", async () => {
    mocks.pathname = "/login";
    mockLoginResponse("admin");
    render(<LoginPage />);
    await submitCredentials();

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/admin"));
  });

  it("segue o papel do SERVIDOR, nao o do pathname do portal", async () => {
    // Portal do aluno, porem a resposta HMAC do servidor diz admin:
    // o destino deve derivar da resposta server-side, nao de /login/aluno.
    mocks.pathname = "/login/aluno";
    mockLoginResponse("admin");
    render(<LoginPage />);
    await submitCredentials();

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/admin"));
    expect(mocks.navigate).not.toHaveBeenCalledWith("/aluno");
  });

  it("respeita ?next apenas quando pertence ao namespace do papel server-side", async () => {
    mocks.pathname = "/login/aluno";
    mocks.searchParams = new URLSearchParams({ next: "/aluno/certificados" });
    mockLoginResponse("student");
    render(<LoginPage />);
    await submitCredentials();

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/aluno/certificados"));
  });

  it("ignora ?next fora do namespace do papel e cai no dashboard padrao (sem open redirect)", async () => {
    mocks.pathname = "/login/aluno";
    mocks.searchParams = new URLSearchParams({ next: "/admin/leads" });
    mockLoginResponse("student");
    render(<LoginPage />);
    await submitCredentials();

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/aluno"));
    expect(mocks.navigate).not.toHaveBeenCalledWith("/admin/leads");
  });

  it("persiste o token HMAC devolvido pelo servidor no login", async () => {
    mockLoginResponse("student");
    render(<LoginPage />);
    await submitCredentials();

    await waitFor(() => expect(mocks.setSessionToken).toHaveBeenCalledWith("hmac-token"));
  });
});

describe("LoginPage — recovery enganoso removido (REC-305 / Article IV)", () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.pathname = "/login/aluno";
    mocks.searchParams = new URLSearchParams();
  });

  it("nao renderiza mais o botao falso 'Esqueci minha senha'", () => {
    render(<LoginPage />);
    expect(screen.queryByRole("button", { name: /Esqueci minha senha/i })).not.toBeInTheDocument();
  });

  it("nunca dispara o toast de falso sucesso de recuperacao", () => {
    render(<LoginPage />);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });

  it("mantem o canal de recuperacao real: 'Fale com a coordenacao' navega para /contato", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /Fale com a coordena/i }));
    expect(mocks.navigate).toHaveBeenCalledWith("/contato");
  });
});

describe("LoginPage — acessibilidade da jornada crítica (REC-308)", () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.pathname = "/login";
    mocks.searchParams = new URLSearchParams();
  });

  it("expõe e-mail e senha pelo rótulo associado", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/E-mail/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/)).toBeInTheDocument();
  });

  it("marca os campos como inválidos e anuncia o erro quando o envio falha na validação", async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    const emailField = screen.getByLabelText(/E-mail/);
    await waitFor(() => expect(emailField).toHaveAttribute("aria-invalid", "true"));

    const describedBy = emailField.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const errorNode = document.getElementById(describedBy as string);
    expect(errorNode).toHaveAttribute("role", "alert");
  });
});
