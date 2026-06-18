import { screen } from "@testing-library/react";
import { SectionHeading } from "@/components/shared/section-heading";
import { renderWithProviders } from "@/test/test-utils";

describe("SectionHeading", () => {
  it("renders eyebrow, title and description", () => {
    renderWithProviders(
      <SectionHeading
        eyebrow="FAQ"
        title="Perguntas frequentes"
        description="Respostas objetivas para dúvidas comuns."
      />,
    );

    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Perguntas frequentes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Respostas objetivas para dúvidas comuns."),
    ).toBeInTheDocument();
  });

  it("omits description when not provided", () => {
    renderWithProviders(
      <SectionHeading eyebrow="Sobre" title="Nossa história" />,
    );

    expect(
      screen.queryByText("Respostas objetivas para dúvidas comuns."),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nossa história" })).toBeInTheDocument();
  });
});
