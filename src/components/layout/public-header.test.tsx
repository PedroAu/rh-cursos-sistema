import { screen } from "@testing-library/react";
import { PublicHeader } from "@/components/layout/public-header";
import { mockedUsePathname } from "@/test/setup";
import { renderWithProviders } from "@/test/test-utils";

describe("PublicHeader", () => {
  it("marks the current navigation item as active", () => {
    mockedUsePathname.mockReturnValue("/cursos");

    renderWithProviders(<PublicHeader />);

    expect(screen.getByRole("link", { name: "Cursos" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Portal do aluno" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
