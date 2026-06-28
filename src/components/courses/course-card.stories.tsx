import type { Meta, StoryObj } from "@storybook/nextjs";

import { CourseCard } from "./course-card";
import { withAppStore } from "@/components/storybook/decorators";
import { mockClass, mockCourse } from "@/components/storybook/mock-data";

/**
 * `CourseCard` é o cartão de curso do catálogo. Usa `useQuoteModal` para o CTA
 * de orçamento In Company, por isso a story é envolvida pela store mockada e
 * pela `QuoteModalProvider`. Use `compact` em grades densas.
 */
const meta = {
  title: "Domínio/CourseCard",
  component: CourseCard,
  decorators: [withAppStore],
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { course: mockCourse, nextClass: mockClass },
} satisfies Meta<typeof CourseCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Compact: Story = { args: { compact: true } };
export const WithoutNextClass: Story = { args: { nextClass: undefined } };
