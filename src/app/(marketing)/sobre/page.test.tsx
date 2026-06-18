import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "@/app/(marketing)/sobre/page";
import { renderWithProviders } from "@/test/test-utils";

describe("AboutPage", () => {
  it("renders the wireframe sections for the about page", () => {
    renderWithProviders(<AboutPage />);

    expect(
      screen.getByRole("heading", { name: /Formando quem transforma o setor público/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Desde 2007/i)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /Missão/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Visão/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Valores/i })).toBeInTheDocument();
    expect(screen.getByText(/15k\+/i)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /Nossa Trajetória/i })).toBeInTheDocument();
    expect(screen.getByText("Fundação")).toBeInTheDocument();
    expect(screen.getByText("Expansão Nacional")).toBeInTheDocument();
    expect(screen.getByText("Transformação Digital")).toBeInTheDocument();
    expect(screen.getByText("Liderança em Capacitação")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /Nossa Liderança/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Ricardo Henrique/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Ana Silveira/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Marcus Oliveira/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Carla Mendes/i })).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /Pronto para transformar sua gestão/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver Catálogo de Cursos/i })).toHaveAttribute(
      "href",
      "/cursos",
    );
    expect(screen.getByRole("link", { name: /Falar com Consultor/i })).toHaveAttribute(
      "href",
      "/especialista",
    );
  });
});
