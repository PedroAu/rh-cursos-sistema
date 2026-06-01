import { notFound } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard-layout";
import { requireSession } from "@/lib/auth";

const instructorSections: Record<
  string,
  { title: string; description: string; items: Array<{ label: string; value: string; helper: string }> }
> = {
  dashboard: {
    title: "Dashboard do instrutor",
    description: "Visão operacional das próximas turmas, materiais e acompanhamento dos alunos.",
    items: [
      { label: "Turmas atribuídas", value: "3", helper: "Agenda preparada para integração com Supabase." },
      { label: "Materiais", value: "8", helper: "Apostilas, checklists e arquivos de apoio." },
      { label: "Avaliações", value: "4.8", helper: "Média simulada de satisfação dos alunos." }
    ]
  },
  turmas: {
    title: "Minhas turmas",
    description: "Próximas datas, lista de presença e status de preparação.",
    items: [
      { label: "Esta semana", value: "1", helper: "Turma com confirmação operacional." },
      { label: "Próximos 30 dias", value: "3", helper: "Agenda com materiais pendentes." },
      { label: "Concluídas", value: "12", helper: "Histórico para relatórios e recorrência." }
    ]
  }
};

export default async function InstructorSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const session = await requireSession(["instructor"]);
  const { section: sectionSlug } = await params;
  const section = instructorSections[sectionSlug];

  if (!section) {
    notFound();
  }

  return <DashboardLayout {...section} accent="navy" userName={session.name} userEmail={session.email} />;
}
