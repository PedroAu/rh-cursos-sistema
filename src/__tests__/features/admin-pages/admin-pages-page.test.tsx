import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { AdminPagesPage } from "@/features/admin/pages/admin-pages-page";
import { SITE_PAGES } from "@/features/admin/pages/model/site-pages";

describe("AdminPagesPage", () => {
  test("lista somente o inventário canônico de rotas públicas", () => {
    render(<AdminPagesPage />);

    expect(screen.getByRole("heading", { name: "Páginas do site", level: 1 })).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Páginas públicas do site" });
    const rows = within(table).getAllByRole("row").slice(1);

    expect(rows).toHaveLength(SITE_PAGES.length);
    for (const page of SITE_PAGES) {
      const row = within(table).getByRole("row", { name: new RegExp(page.title, "i") });
      expect(within(row).getByText(page.path)).toBeInTheDocument();
      expect(within(row).getByRole("link", { name: new RegExp(`Abrir ${page.title}`, "i") })).toHaveAttribute("href", page.path);
    }
  });

  test("é explicitamente read-only e não oferece ações de edição", () => {
    render(<AdminPagesPage />);

    expect(screen.getByText("Sem edição simulada ou conteúdo fictício.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /editar|nova página|excluir/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /editar|nova página|excluir/i })).not.toBeInTheDocument();
  });
});
