import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PasswordRecoveryPage } from "@/views/public/PasswordRecovery";

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), searchParams: new URLSearchParams() }));

vi.mock("@/lib/router-compat", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("next/navigation", () => ({ useSearchParams: () => mocks.searchParams }));

describe("PasswordRecoveryPage", () => {
  beforeEach(() => { mocks.navigate.mockReset(); mocks.searchParams = new URLSearchParams(); });

  it("solicita link sem revelar se o e-mail existe", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }) as unknown as typeof fetch;
    render(<PasswordRecoveryPage />);
    fireEvent.change(screen.getByLabelText(/E-mail/), { target: { value: "admin@rhcursos.com.br" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar link/i }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/Se existir uma conta/));
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/password-recovery", expect.objectContaining({ method: "POST" }));
  });

  it("atualiza a senha no modo de recuperação", async () => {
    mocks.searchParams = new URLSearchParams({ mode: "update" });
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }) as unknown as typeof fetch;
    render(<PasswordRecoveryPage />);
    fireEvent.change(screen.getByLabelText(/Nova senha/), { target: { value: "SenhaForte123!" } });
    fireEvent.change(screen.getByLabelText(/Confirme a nova senha/), { target: { value: "SenhaForte123!" } });
    fireEvent.click(screen.getByRole("button", { name: /Atualizar senha/i }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/login?status=password-updated"));
  });
});
