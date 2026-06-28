import type { Meta, StoryObj } from "@storybook/nextjs";

import { TestimonialCard } from "./testimonial-card";
import { mockTestimonial } from "@/components/storybook/mock-data";

/**
 * `TestimonialCard` exibe depoimentos com avatar de iniciais, avaliação em
 * estrelas e o curso relacionado. Recebe um objeto `Testimonial` do domínio.
 */
const meta = {
  title: "Domínio/TestimonialCard",
  component: TestimonialCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { testimonial: mockTestimonial },
} satisfies Meta<typeof TestimonialCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const FourStars: Story = {
  args: { testimonial: { ...mockTestimonial, rating: 4, name: "Carlos Lima" } },
};
