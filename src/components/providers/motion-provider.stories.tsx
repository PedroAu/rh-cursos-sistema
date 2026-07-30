import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { motion } from "framer-motion";

import { MotionProvider } from "./motion-provider";

/**
 * `MotionProvider` configura o framer-motion com `reducedMotion="user"`,
 * respeitando a preferência do sistema do usuário. Envolva a aplicação uma vez;
 * componentes animados (`motion.*`) herdam a configuração.
 */
const meta = {
  title: "Providers/MotionProvider",
  component: MotionProvider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { children: null },
} satisfies Meta<typeof MotionProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <MotionProvider>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="surface-card p-6 text-sm"
      >
        Animação respeitando prefers-reduced-motion.
      </motion.div>
    </MotionProvider>
  ),
};
