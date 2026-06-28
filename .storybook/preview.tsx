import type { Decorator, Preview } from "@storybook/nextjs";

import "@mantine/core/styles.css";
import "../src/styles/globals.css";

import { AppMantineProvider } from "../src/components/providers/mantine-provider";
import { MotionProvider } from "../src/components/providers/motion-provider";

/**
 * Decorator global: todo componente do design system renderiza dentro dos
 * mesmos providers da aplicação (Mantine + framer-motion), garantindo que
 * tokens de tema e animações reflitam o produto real.
 */
const withProviders: Decorator = (Story) => (
  <AppMantineProvider>
    <MotionProvider>
      <div style={{ padding: "1.5rem" }}>
        <Story />
      </div>
    </MotionProvider>
  </AppMantineProvider>
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
