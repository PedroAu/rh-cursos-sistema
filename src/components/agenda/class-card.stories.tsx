import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ClassCard } from "./class-card";
import { mockClass, mockClassLowSeats, mockCourse, mockInstructor } from "@/components/storybook/mock-data";

/**
 * `ClassCard` resume uma turma na agenda: data em destaque, modalidade, status
 * e instrutor. Combina `StatusBadge` para comunicar a disponibilidade de vagas.
 */
const meta = {
  title: "Domínio/ClassCard",
  component: ClassCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { trainingClass: mockClass, course: mockCourse, instructor: mockInstructor },
} satisfies Meta<typeof ClassCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OpenEnrollment: Story = {};
export const LowSeats: Story = { args: { trainingClass: mockClassLowSeats } };
export const WithoutInstructor: Story = { args: { instructor: undefined } };
