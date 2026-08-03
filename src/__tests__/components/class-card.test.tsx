import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@/__tests__/utils";
import { ClassCard } from "@/components/agenda/class-card";
import type { Course, TrainingClass } from "@/types";

vi.mock("@/lib/router-compat", () => ({
  Link: ({ to, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>{children}</a>
  )
}));

const course = {
  id: "course-1",
  slug: "curso-teste",
  title: "Curso teste"
} as Course;

const trainingClass = {
  id: "class-1",
  courseId: course.id,
  startDate: "2026-08-12T00:00:00.000Z",
  endDate: "2026-08-12T00:00:00.000Z",
  time: "09:00 às 18:00",
  location: "Online ao vivo",
  modality: "Ao vivo online",
  status: "Inscrições abertas",
  totalSeats: 20,
  filledSeats: 20,
  availableSeats: 0,
  instructorId: "instructor-1",
  price: 1000,
  notes: ""
} satisfies TrainingClass;

describe("ClassCard", () => {
  it("indica turma esgotada e não oferece checkout", () => {
    render(<ClassCard trainingClass={trainingClass} course={course} />);

    expect(screen.getAllByText("Esgotada")).not.toHaveLength(0);
    expect(screen.queryByRole("link", { name: "Inscrever-se" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver curso" })).toHaveAttribute("href", "/cursos/curso-teste");
  });
});
