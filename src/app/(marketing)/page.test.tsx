import { screen } from "@testing-library/react";
import HomePage from "@/app/(marketing)/page";
import { faqs, testimonials } from "@/lib/site-data";
import { renderWithProviders } from "@/test/test-utils";

describe("HomePage", () => {
  it("renders the full home structure with the expected sections and content contracts", () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /Formando quem transforma, há 19 anos\./i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Ver Trilhas de Conhecimento/i }),
    ).toHaveAttribute("href", "/cursos");
    expect(screen.getByRole("link", { name: /Falar com Especialista/i })).toHaveAttribute(
      "href",
      "/especialista",
    );

    expect(
      screen.getByRole("heading", {
        name: "A burocracia muda. Quem não se atualiza, erra.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Escolha sua trilha de capacitação" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Três passos para transformar resultado" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Dúvidas frequentes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Relatos de quem aplicou a capacitação na rotina" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pronto para ser referência?" })).toBeInTheDocument();

    expect(screen.getAllByRole("link", { name: "Ver cursos da trilha" })).toHaveLength(6);
    expect(screen.getAllByText("Relato real")).toHaveLength(testimonials.length);
    expect(screen.getByRole("link", { name: /Ver trilhas agora/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /WhatsApp Consultoria/i })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/5561991129682"),
    );
    expect(screen.getByRole("link", { name: /WhatsApp Consultoria/i })).toHaveAttribute(
      "target",
      "_blank",
    );

    for (const item of faqs) {
      expect(screen.getByRole("button", { name: item.question })).toBeInTheDocument();
    }

    expect(screen.queryByText("Ver todos os cursos")).not.toBeInTheDocument();
    expect(screen.getByText(/CRUD de avaliações/i)).toBeInTheDocument();
  });
});
