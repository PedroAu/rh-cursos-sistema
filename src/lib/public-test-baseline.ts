import type {
  BlogPost,
  Course,
  CoursePublicContent,
  Instructor,
  TrainingClass,
  TrainingPath
} from "@/types";

export const publicTestBaselineTrainingPaths: TrainingPath[] = [
  {
    id: "path-public-licitacoes",
    code: "P01",
    name: "Licitações e Contratos Administrativos",
    shortName: "Licitações",
    slug: "licitacoes-e-contratos-administrativos",
    description: "Formação aplicada para compras públicas, contratação e fiscalização contratual.",
    icon: "Scale",
    courseCount: 2
  },
  {
    id: "path-public-esocial",
    code: "P02",
    name: "Departamento Pessoal e eSocial",
    shortName: "DP & eSocial",
    slug: "departamento-pessoal-e-esocial",
    description: "Conteúdos práticos para rotinas de DP, eSocial e conformidade trabalhista.",
    icon: "Calculator",
    courseCount: 1
  }
];

export const publicTestBaselineInstructors: Instructor[] = [
  {
    id: "inst-public-licitacoes",
    name: "Equipe RH Cursos - Licitações",
    email: "licitacoes@rhcursos.com.br",
    phone: "(61) 3000-1001",
    specialty: "Licitações e contratos",
    bio: "Instrutoria dedicada a compras públicas, contratos e fiscalização.",
    rating: 4.8,
    avatar: "ER",
    courseIds: ["course-public-licitacoes-1"],
    status: "Ativo"
  },
  {
    id: "inst-public-esocial",
    name: "Equipe RH Cursos - eSocial",
    email: "esocial@rhcursos.com.br",
    phone: "(61) 3000-1002",
    specialty: "eSocial e departamento pessoal",
    bio: "Instrutoria dedicada a eventos do eSocial, folha e obrigações acessórias.",
    rating: 4.8,
    avatar: "ER",
    courseIds: ["course-public-esocial-1"],
    status: "Ativo"
  }
];

export const publicTestBaselineClasses: TrainingClass[] = [
  {
    id: "class-public-licitacoes-1",
    courseId: "course-public-licitacoes-1",
    startDate: "2026-08-20",
    endDate: "2026-08-20",
    time: "09:00 às 17:00",
    modality: "Presencial",
    location: "Brasília • DF",
    instructorId: "inst-public-licitacoes",
    totalSeats: 30,
    manualFilledSeats: 12,
    filledSeats: 12,
    availableSeats: 18,
    status: "Inscrições abertas",
    price: 1290,
    notes: "Turma pública baseline para catálogo e smoke tests."
  },
  {
    id: "class-public-esocial-1",
    courseId: "course-public-esocial-1",
    startDate: "2026-08-27",
    endDate: "2026-08-27",
    time: "09:00 às 17:00",
    modality: "Ao vivo online",
    location: "Online ao vivo",
    instructorId: "inst-public-esocial",
    totalSeats: 30,
    manualFilledSeats: 10,
    filledSeats: 10,
    availableSeats: 20,
    status: "Inscrições abertas",
    price: 990,
    notes: "Turma pública baseline para jornada editorial e fluxo de inscrição."
  }
];

export const publicTestBaselineCourses: Course[] = [
  {
    id: "course-public-licitacoes-1",
    slug: "introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico",
    title: "Introdução às Licitações e Contratos Administrativos: Noções Essenciais para o Setor Público",
    pathId: "path-public-licitacoes",
    pathName: "Licitações e Contratos Administrativos",
    category: "Licitações e Contratos",
    categories: ["Licitações e Contratos"],
    modality: "Presencial",
    modalities: ["Presencial", "Ao vivo online"],
    durationLabel: "8h",
    durationHours: 8,
    level: "Básico",
    price: 1290,
    shortDescription: "Base prática para profissionais que atuam com compras públicas e contratos.",
    fullDescription: "Curso introdutório com foco em princípios, etapas do processo e responsabilidades no ciclo de contratação pública.",
    targetAudience: ["Servidores de compras", "Pregoeiros", "Gestores e fiscais de contrato"],
    objectives: ["Compreender os conceitos essenciais", "Ler processos com mais segurança", "Reduzir falhas procedimentais"],
    benefits: ["Material de apoio", "Casos comentados", "Aplicação imediata"],
    modules: [
      {
        title: "Panorama da contratação pública",
        description: "Visão geral das etapas e responsabilidades do processo.",
        topics: ["Princípios", "Fases do processo", "Responsabilidades e controles"],
        duration: "8h"
      }
    ],
    instructorId: "inst-public-licitacoes",
    image: "/images/courses/licitacoes-contratos.jpg",
    rating: 4.8,
    studentsCount: 24,
    status: "Destaque",
    featured: true,
    featuredCourseIds: [],
    nextClassId: "class-public-licitacoes-1"
  },
  {
    id: "course-public-esocial-1",
    slug: "esocial-na-pratica-revisao-orientada-antes-do-envio",
    title: "eSocial na prática: revisão orientada antes do envio",
    pathId: "path-public-esocial",
    pathName: "Departamento Pessoal e eSocial",
    category: "eSocial",
    categories: ["eSocial"],
    modality: "Ao vivo online",
    modalities: ["Ao vivo online"],
    durationLabel: "8h",
    durationHours: 8,
    level: "Básico",
    price: 990,
    shortDescription: "Revisão objetiva para reduzir inconsistências antes do fechamento e envio.",
    fullDescription: "Curso curto e aplicado sobre conferência de eventos, validações e erros recorrentes no eSocial.",
    targetAudience: ["Analistas de RH", "Departamento pessoal", "Equipes de fechamento"],
    objectives: ["Identificar alertas recorrentes", "Padronizar revisão", "Aumentar segurança operacional"],
    benefits: ["Checklist prático", "Exemplos reais", "Aplicação no dia seguinte"],
    modules: [
      {
        title: "Checklist de revisão",
        description: "Roteiro objetivo para validar eventos críticos.",
        topics: ["Eventos críticos", "Validação pré-envio", "Checklist de revisão"],
        duration: "8h"
      }
    ],
    instructorId: "inst-public-esocial",
    image: "/images/courses/departamento-pessoal-esocial.jpg",
    rating: 4.7,
    studentsCount: 18,
    status: "Ativo",
    featured: false,
    featuredCourseIds: [],
    nextClassId: "class-public-esocial-1"
  },
  {
    id: "course-public-gestao-contratos-1",
    slug: "gestao-e-fiscalizacao-de-contratos-administrativos",
    title: "Gestão e fiscalização de contratos administrativos",
    pathId: "path-public-licitacoes",
    pathName: "Licitações e Contratos Administrativos",
    category: "Licitações e Contratos",
    categories: ["Licitações e Contratos"],
    modality: "Ao vivo online",
    modalities: ["Ao vivo online"],
    durationLabel: "12h",
    durationHours: 12,
    level: "Intermediário",
    price: 990,
    shortDescription: "Fiscalização, indicadores e gestão operacional de contratos administrativos.",
    fullDescription: "Curso focado na governança diária e na fiscalização de contratos administrativos.",
    targetAudience: ["Gestores de contratos", "Fiscalização", "Controle interno"],
    objectives: ["Fortalecer fiscalização", "Organizar execução contratual"],
    benefits: ["Roteiros de fiscalização", "Checklists práticos"],
    modules: [],
    instructorId: "inst-public-licitacoes",
    image: "/images/courses/pessoas-lideranca.jpg",
    rating: 4.7,
    studentsCount: 112,
    status: "Ativo",
    featured: false,
    featuredCourseIds: [],
    nextClassId: ""
  }
];

export const publicTestBaselineCoursePublicContents: CoursePublicContent[] = [
  {
    id: "course-content-public-licitacoes-1",
    courseId: "course-public-licitacoes-1",
    heroSubtitle: "Noções essenciais para navegar compras públicas com mais segurança operacional.",
    highlights: [
      {
        title: "Foco aplicado",
        description: "Conteúdo orientado a decisões e fluxos reais do setor público."
      }
    ],
    faqItems: [],
    sidebar: {},
    corporateCta: {},
    published: true
  }
];

export const publicTestBaselineBlogPosts: BlogPost[] = [
  {
    id: "post-public-esocial-1",
    title: "3 alertas para revisar antes de enviar eventos do eSocial",
    slug: "3-alertas-para-revisar-antes-de-enviar-eventos-do-esocial",
    summary: "Pontos de atenção para revisar dados, eventos e consistências antes do envio.",
    content:
      "Antes de transmitir eventos ao eSocial, uma revisão orientada reduz erros evitáveis e acelera correções.\n\nOrganize a checagem por níveis de risco, valide cadastros e confirme rubricas críticas antes do fechamento.",
    category: "eSocial",
    tags: ["esocial", "compliance", "eventos"],
    author: "Equipe RH Cursos",
    date: "2026-07-10",
    readingTime: "6 min",
    status: "Publicado",
    image: "/images/blog/esocial-alertas.jpg",
    relatedCourseId: "course-public-esocial-1"
  }
];

export const publicTestBaselineCourseCategories = ["Licitações e Contratos", "eSocial"];
