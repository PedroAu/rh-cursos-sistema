import type { Decorator, Preview } from "@storybook/nextjs";

import "../src/styles/globals.css";

import { MotionProvider } from "../src/components/providers/motion-provider";

/**
 * Decorator global: todo componente do design system renderiza dentro do
 * mesmo provider de animação da aplicação (framer-motion), garantindo que
 * tokens de tema e animações reflitam o produto real. (Mantine foi removido
 * no Epic 14 — o design system agora usa Tailwind + tokens `--tk-*`.)
 */
const withProviders: Decorator = (Story) => (
  <MotionProvider>
    <div style={{ padding: "1.5rem" }}>
      <Story />
    </div>
  </MotionProvider>
);

const preview: Preview = {
  decorators: [withProviders],
  parameters: {
    a11y: {
      // "todo" mantém o painel de a11y informativo sem reprovar o build.
      // Eleve para "error" quando todas as stories estiverem auditadas.
      test: "todo",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Guia de Uso", "UI", "Common", "Admin", "Domínio"],
      },
    },
  },
};

export default preview;
