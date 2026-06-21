import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { AdminSettingsForm } from "@/components/forms/admin-settings-form";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/app/actions/admin", () => ({
  saveAdminSettingsAction: vi.fn(),
}));

describe("AdminSettingsForm", () => {
  it("renders logo and favicon upload controls with recommended sizes", () => {
    renderWithProviders(
      <AdminSettingsForm
        settings={{
          operationName: "RH Cursos",
          commercialEmail: "atendimento@rhcursos.com.br",
          mainLogoUrl: "/uploads/logo-rh.svg",
          faviconUrl: "/uploads/favicon.ico",
          notifyEnrollments: true,
          notifyLeads: true,
          dataSource: "Supabase",
          priorityChannel: "Site institucional",
        }}
      />,
    );

    expect(screen.getByLabelText("Alterar logo principal")).toHaveAttribute(
      "type",
      "file",
    );
    expect(screen.getByLabelText("Alterar favicon")).toHaveAttribute("type", "file");
    expect(screen.getByLabelText("Alterar logo principal atual")).toHaveValue(
      "/uploads/logo-rh.svg",
    );
    expect(screen.getByLabelText("Alterar favicon atual")).toHaveValue(
      "/uploads/favicon.ico",
    );
    expect(screen.getByText(/320 x 96 px/)).toBeInTheDocument();
    expect(screen.getByText(/32 x 32 px ou 48 x 48 px/)).toBeInTheDocument();
  });
});
