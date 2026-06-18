export type Course = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  duration: string;
  format: string;
  level?: string;
  price: string;
  audience: string[];
  outcomes: string[];
  instructor: {
    name: string;
    role: string;
  };
};

export const marketingNavItems = [
  { href: "/", label: "Início" },
  { href: "/cursos", label: "Cursos" },
  { href: "/agenda", label: "Agenda" },
  { href: "/in-company", label: "In Company" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/alunos", label: "Alunos" },
  { href: "/admin/professores", label: "Professores" },
  { href: "/admin/cursos", label: "Cursos" },
  { href: "/admin/agenda", label: "Turmas" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export const heroStats = [
  { label: "empresas atendidas", value: "120+" },
  { label: "alunos capacitados", value: "4.8k" },
  { label: "trilhas corporativas", value: "18" },
];

export const capabilities = [
  {
    title: "Formação para decisões críticas",
    text: "Programas objetivos para RH, gestão pública, compras e auditoria.",
  },
  {
    title: "Turmas abertas e In Company",
    text: "Execução flexível para equipes pequenas, grandes operações e órgãos públicos.",
  },
  {
    title: "Operação administrativa integrada",
    text: "Site, captação, agenda e backoffice conectados numa mesma base.",
  },
];

export const journeySteps = [
  {
    title: "Diagnóstico e alinhamento",
    text: "Mapeamos necessidade, público, contexto técnico e objetivo de negócio antes de definir a trilha.",
  },
  {
    title: "Curadoria da trilha",
    text: "Estruturamos conteúdo, carga horária, instrutor e agenda com foco em aplicação prática.",
  },
  {
    title: "Operação da inscrição",
    text: "Centralizamos captação, inscrição e apoio administrativo para reduzir atrito da equipe.",
  },
  {
    title: "Acompanhamento do resultado",
    text: "Consolidamos aprendizados e próximos ciclos para dar continuidade ao desenvolvimento.",
  },
];

export const testimonials = [
  {
    author: "Marina Couto",
    role: "Gerente de RH",
    text: "A trilha In Company encurtou o tempo de adaptação do time e melhorou a consistência operacional.",
  },
  {
    author: "Eduardo Matos",
    role: "Controladoria pública",
    text: "Conteúdo direto, professor experiente e uma operação muito mais profissional do que os treinamentos anteriores.",
  },
  {
    author: "Celia Nunes",
    role: "Compras e licitações",
    text: "A agenda clara e o processo de inscrição simplificado reduziram muito o atrito com nossas equipes.",
  },
];

export const faqs = [
  {
    question: "Como faço minha inscrição?",
    answer:
      "Você pode realizar a inscrição diretamente pelo nosso site em cada página de curso ou falar com nossos consultores para orçamentos por nota de empenho.",
  },
  {
    question: "Recebo certificado após o curso?",
    answer:
      "Sim. Todos os cursos conferem certificado com carga horária e conteúdo programático ministrado.",
  },
  {
    question: "Órgãos públicos podem contratar?",
    answer:
      "Sim. A RH Cursos atende a administração pública direta e indireta, incluindo contratação com nota de empenho conforme as regras aplicáveis.",
  },
];

export const courses: Course[] = [
  {
    slug: "dp-estrategico",
    title: "Departamento Pessoal Estratégico",
    category: "Departamento pessoal",
    summary: "Rotinas, riscos trabalhistas e padrão operacional para times de DP.",
    description:
      "Programa desenhado para equipes que precisam consolidar processos, reduzir erro operacional e elevar a confiança da liderança nas entregas do departamento pessoal.",
    duration: "24h",
    format: "Ao vivo online",
    price: "R$ 1.290",
    audience: ["Analistas de DP", "Coordenadores de RH", "Consultorias"],
    outcomes: [
      "Padronizar admissão, folha, benefícios e desligamento",
      "Mapear riscos recorrentes e pontos de controle",
      "Aumentar previsibilidade da operação",
    ],
    instructor: {
      name: "Patricia Freitas",
      role: "Especialista em DP e legislação trabalhista",
    },
  },
  {
    slug: "licitacoes-sem-ruido",
    title: "Licitações sem Ruído Operacional",
    category: "Licitações",
    summary: "Fluxo decisório, governança documental e leitura prática da nova lei.",
    description:
      "Formação para órgãos e equipes privadas que precisam atuar com segurança em compras públicas, planejamento e conformidade documental.",
    duration: "20h",
    format: "Presencial ou In Company",
    price: "R$ 1.480",
    audience: ["Pregoeiros", "Compras", "Assessoria jurídica"],
    outcomes: [
      "Organizar fases do processo licitatório",
      "Melhorar comunicação entre compras e jurídico",
      "Reduzir retrabalho documental",
    ],
    instructor: {
      name: "Rafael Paes",
      role: "Consultor em compras públicas",
    },
  },
  {
    slug: "lideranca-rh-publico",
    title: "Liderança para RH e Gestão Pública",
    category: "Gestão de pessoas",
    summary: "Ritmo de equipe, comunicação e gestão por indicadores.",
    description:
      "Trilha para lideranças que precisam alinhar cultura, operação e governança sem perder velocidade de execução.",
    duration: "16h",
    format: "Ao vivo online",
    price: "R$ 990",
    audience: ["Coordenadores", "Gerentes", "Líderes de projeto"],
    outcomes: [
      "Criar rotina gerencial objetiva",
      "Conectar indicadores com ação",
      "Melhorar previsibilidade da equipe",
    ],
    instructor: {
      name: "Luciana Prado",
      role: "Consultora em performance organizacional",
    },
  },
];

export const timelineItems = [
  "2009 – início das operações em treinamentos corporativos especializados",
  "2015 – expansão para trilhas em gestão pública e auditoria",
  "2021 – consolidação do modelo In Company e consultivo",
  "2026 – digitalização do comercial, agenda e backoffice",
];

export const partners = [
  "Prefeituras",
  "Institutos",
  "Hospitais",
  "Autarquias",
  "Empresas de serviços",
  "Consultorias",
];

export function getCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug) ?? null;
}
