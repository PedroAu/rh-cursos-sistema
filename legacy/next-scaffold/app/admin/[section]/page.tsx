import { notFound } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard-layout";
import { requireSession } from "@/lib/auth";

const adminSections: Record<
  string,
  { title: string; description: string; items: Array<{ label: string; value: string; helper: string }> }
> = {
  dashboard: {
    title: "Dashboard CRM",
    description: "Visão geral de leads, inscrições, receita e status operacional do funil.",
    items: [
      { label: "Leads", value: "48", helper: "Novos contatos, proposta e remarketing." },
      { label: "Inscrições", value: "26", helper: "Status de pagamento e turma associada." },
      { label: "Receita", value: "R$ 38 mil", helper: "Painel inicial para análise executiva." }
    ]
  },
  leads: {
    title: "Kanban de leads",
    description: "Estrutura pronta para funil por estágio, origem e prioridade comercial.",
    items: [
      { label: "Novos", value: "15", helper: "Entradas de formulários e WhatsApp." },
      { label: "Qualificados", value: "9", helper: "Leads com potencial de proposta." },
      { label: "Propostas", value: "4", helper: "Acompanhamento do ticket In Company." }
    ]
  },
  inscricoes: {
    title: "Inscrições",
    description: "Monitoramento de pagamentos, alunos e notas fiscais por curso.",
    items: [
      { label: "PIX", value: "11", helper: "Confirmação via webhook prevista." },
      { label: "Boleto", value: "7", helper: "Essencial para órgãos públicos." },
      { label: "Cartão", value: "8", helper: "Parcelamento e conciliação futuros." }
    ]
  },
  cursos: {
    title: "Gestão de cursos",
    description: "Base para CRUD de cursos, turmas, datas, vagas e relacionamento com CMS.",
    items: [
      { label: "Cursos ativos", value: "6", helper: "Mock inicial do catálogo." },
      { label: "Turmas", value: "5", helper: "Agenda conectada ao calendário público." },
      { label: "Vagas críticas", value: "2", helper: "Monitoramento de últimas vagas." }
    ]
  },
  blog: {
    title: "Gestão do blog",
    description: "Conteúdo SEO com destaque, categorias e CTA contextual por artigo.",
    items: [
      { label: "Artigos", value: "3", helper: "Base inicial pronta para CMS." },
      { label: "Destaques", value: "1", helper: "Hero editorial configurado." },
      { label: "Categorias", value: "4", helper: "Taxonomia preparada para expansão." }
    ]
  },
  alunos: {
    title: "Alunos",
    description: "Visão centralizada para histórico, documentos, acesso e recorrência.",
    items: [
      { label: "Cadastrados", value: "184", helper: "Base futura vinda de checkout + auth." },
      { label: "Ativos", value: "69", helper: "Com acesso recente à área do aluno." },
      { label: "Recorrentes", value: "41%", helper: "Meta estratégica do PDR." }
    ]
  },
  relatorios: {
    title: "Relatórios",
    description: "Receita, conversão, cursos mais vendidos e saúde da operação.",
    items: [
      { label: "Conversão", value: "3.2%", helper: "Meta inicial do site pós-go-live." },
      { label: "Bounce", value: "54%", helper: "Abaixo da meta crítica indicada no PDR." },
      { label: "SEO", value: "6 keywords", helper: "Monitoramento de evolução orgânica." }
    ]
  }
};

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const session = await requireSession(["admin"]);
  const { section: sectionSlug } = await params;
  const section = adminSections[sectionSlug];

  if (!section) {
    notFound();
  }

  return <DashboardLayout {...section} accent="gold" userName={session.name} userEmail={session.email} />;
}
