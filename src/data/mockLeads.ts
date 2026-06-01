import type { Lead } from "@/types";

export const mockLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Carla Menezes",
    email: "carla.menezes@prefeitura.gov.br",
    phone: "(61) 98122-3101",
    courseInterest: "eSocial para Órgãos Públicos",
    origin: "WhatsApp",
    status: "Novo",
    message: "Quero entender turmas disponíveis para equipe de RH.",
    createdAt: "2026-04-15T10:20:00.000Z"
  },
  {
    id: "lead-2",
    name: "Paulo Torres",
    email: "paulo.torres@empresa.com",
    phone: "(61) 98122-3102",
    courseInterest: "Power BI para Iniciantes",
    origin: "Site",
    status: "Em atendimento",
    message: "Gostaria de confirmar se há opção in company.",
    createdAt: "2026-04-16T14:40:00.000Z"
  },
  {
    id: "lead-3",
    name: "Bianca Duarte",
    email: "bianca.duarte@autarquia.gov.br",
    phone: "(61) 98122-3103",
    courseInterest: "Contratações Públicas para Capacitação",
    origin: "LinkedIn",
    status: "Proposta enviada",
    message: "Preciso de orçamento para capacitar 25 servidores.",
    createdAt: "2026-04-17T09:00:00.000Z"
  },
  {
    id: "lead-4",
    name: "Fábio Santos",
    email: "fabio.santos@contabilidade.com",
    phone: "(61) 98122-3104",
    courseInterest: "Cálculos Trabalhistas na Prática",
    origin: "Blog",
    status: "Convertido",
    message: "Vi o artigo sobre cálculos e quero fazer o curso.",
    createdAt: "2026-04-17T16:30:00.000Z"
  },
  {
    id: "lead-5",
    name: "Renata Paixão",
    email: "renata.paixao@instituto.org",
    phone: "(61) 98122-3105",
    courseInterest: "Comunicação Não Violenta para Equipes",
    origin: "Indicação",
    status: "Perdido",
    message: "Estamos avaliando outras datas para o segundo semestre.",
    createdAt: "2026-04-18T11:15:00.000Z"
  }
];
