import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CheckCircle2 } from "lucide-react";

import { CourseCard, FeatureListItem, PaperCard, SectionHeading, StatBlock, Testimonial } from "@/components/patterns";

const meta = {
  title: "Trust Keith/Patterns",
  parameters: { layout: "padded" }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: () => (
    <div className="grid gap-8">
      <SectionHeading
        eyebrow="Cursos RH"
        title="Formação prática para rotinas críticas"
        subtitle="Padrões compostos com tokens Trust Keith RH."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <CourseCard track="DP" title="eSocial aplicado" meta="Online ao vivo · 16 horas" />
        <PaperCard>
          <h3 className="font-tk-display text-section-heading font-bold">Consultoria sob medida</h3>
          <p className="mt-3 text-sm leading-6 text-tk-ink-muted">Diagnóstico e plano de ação para equipes públicas e privadas.</p>
        </PaperCard>
        <StatBlock value="25+" label="anos de experiência em capacitação." />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FeatureListItem icon={CheckCircle2} title="Aplicação imediata" description="Materiais e exemplos conectados à rotina das equipes." />
        <Testimonial quote="O treinamento organizou processos e reduziu dúvidas recorrentes." name="Marina Costa" role="Coordenadora de RH" company="Cliente RH" initials="MC" />
      </div>
    </div>
  )
};
