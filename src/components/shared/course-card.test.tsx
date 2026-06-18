import { screen } from "@testing-library/react";
import { CourseCard } from "@/components/shared/course-card";
import { courses } from "@/lib/site-data";
import { renderWithProviders } from "@/test/test-utils";

describe("CourseCard", () => {
  it("renders course information and both destination links", () => {
    renderWithProviders(<CourseCard course={courses[0]} />);

    expect(
      screen.getByRole("heading", { name: courses[0].title }),
    ).toBeInTheDocument();
    expect(screen.getByText(courses[0].summary)).toBeInTheDocument();
    expect(screen.getByText(courses[0].price)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute(
      "href",
      `/cursos/${courses[0].slug}`,
    );
    expect(screen.getByRole("link", { name: "Inscricao" })).toHaveAttribute(
      "href",
      `/inscricao/${courses[0].slug}`,
    );
  });
});
