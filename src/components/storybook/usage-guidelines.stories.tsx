import type { Meta, StoryObj } from "@storybook/nextjs";

/**
 * Diretrizes de uso do design system RH Cursos. Esta página abre o catálogo e
 * resume as convenções que todas as stories seguem.
 */
const meta = {
  title: "Guia de Uso/Visão Geral",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <article className="mx-auto max-w-3xl space-y-6 p-10 text-sm leading-7 text-foreground">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-deep-navy">Design System — RH Cursos</h1>
        <p className="text-muted-foreground">
          Catálogo vivo dos componentes da plataforma, com exemplos interativos, notas de
          acessibilidade e variações documentadas.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Organização</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>UI</strong> — primitivos do design system (Button, Input, Card, Dialog...).
          </li>
          <li>
            <strong>Common</strong> — blocos reutilizáveis (EmptyState, SearchInput, SectionTitle...).
          </li>
          <li>
            <strong>Admin</strong> — componentes do painel administrativo.
          </li>
          <li>
            <strong>Domínio / Layout / Providers</strong> — componentes de produto, shells e contexto.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Acessibilidade</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>O painel <em>Accessibility</em> (addon a11y) audita cada story automaticamente.</li>
          <li>Estados nunca dependem só de cor — texto e ARIA reforçam o significado.</li>
          <li>Todo controle interativo expõe um nome acessível (texto, aria-label ou aria-labelledby).</li>
          <li>Animações respeitam <code>prefers-reduced-motion</code> via MotionProvider.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Convenções das stories</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Toda story renderiza dentro dos providers reais (Mantine + framer-motion).</li>
          <li>
            Componentes que consomem a store usam o decorator <code>withAppStore</code>, semeado com
            dados mockados tipados.
          </li>
          <li>
            A primeira story de cada componente é a variante padrão; as demais cobrem estados de
            erro, carregamento e limites.
          </li>
        </ul>
      </section>
    </article>
  ),
};
