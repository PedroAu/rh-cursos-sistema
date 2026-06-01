import { notFound } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard-layout";
import { requireSession } from "@/lib/auth";

const studentSections: Record<
  string,
  { title: string; description: string; items: Array<{ label: string; value: string; helper: string }> }
> = {
  dashboard: {
    title: "Dashboard do aluno",
    description: "Visão geral de cursos, certificados, histórico e próximos passos.",
    items: [
      { label: "Cursos inscritos", value: "4", helper: "Inscrito, concluído e cancelado em um só lugar." },
      { label: "Certificados", value: "2", helper: "Downloads preparados para geração em PDF." },
      { label: "Próxima aula", value: "14 mai", helper: "Integração prevista com agenda e lembretes." }
    ]
  },
  cursos: {
    title: "Meus cursos",
    description: "Lista dos cursos adquiridos com status, datas e ações rápidas.",
    items: [
      { label: "Ativos", value: "3", helper: "Próximos conteúdos e materiais disponíveis." },
      { label: "Concluídos", value: "1", helper: "Histórico para recorrência e recompra." },
      { label: "Em análise", value: "1", helper: "Pagamento aguardando confirmação." }
    ]
  },
  certificados: {
    title: "Certificados",
    description: "Downloads digitais, histórico e emissão sob demanda.",
    items: [
      { label: "Disponíveis", value: "2", helper: "Certificados com carga horária e assinatura." },
      { label: "Pendentes", value: "1", helper: "Aguardando conclusão ou conferência." },
      { label: "Declarações", value: "3", helper: "Preparadas para fins administrativos." }
    ]
  },
  declaracoes: {
    title: "Declarações",
    description: "Segunda via de documentos para diárias, comprovação e tramitação interna.",
    items: [
      { label: "Emitidas", value: "3", helper: "PDFs com geração on demand prevista." },
      { label: "Solicitações", value: "1", helper: "Fila operacional para atendimento." },
      { label: "Tempo médio", value: "24h", helper: "Meta de resposta para o suporte." }
    ]
  },
  perfil: {
    title: "Meu perfil",
    description: "Dados pessoais, preferências, senha e histórico de pagamentos.",
    items: [
      { label: "Dados completos", value: "92%", helper: "Campos prontos para integração com CRM e NF." },
      { label: "Pagamentos", value: "5", helper: "Extrato preparado para o aluno." },
      { label: "Preferências", value: "4", helper: "Comunicações, áreas de interesse e LGPD." }
    ]
  }
};

export default async function StudentSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const session = await requireSession(["student"]);
  const { section: sectionSlug } = await params;
  const section = studentSections[sectionSlug];

  if (!section) {
    notFound();
  }

  return <DashboardLayout {...section} accent="navy" userName={session.name} userEmail={session.email} />;
}
