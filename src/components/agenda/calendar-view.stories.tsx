import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CalendarView } from "./calendar-view";
import { withAppStore } from "@/components/storybook/decorators";
import { mockClass, mockClassLowSeats } from "@/components/storybook/mock-data";

/**
 * `CalendarView` renderiza as turmas num calendário mensal navegável. Lê cursos
 * e instrutores da store (decorator mockado) e recebe as turmas filtradas via
 * `filteredClasses`. Use `loading` para o estado de carregamento.
 */
const meta = {
  title: "Domínio/CalendarView",
  component: CalendarView,
  decorators: [withAppStore],
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: { filteredClasses: [mockClass, mockClassLowSeats] },
} satisfies Meta<typeof CalendarView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true, filteredClasses: [] } };
export const Empty: Story = { args: { filteredClasses: [] } };
