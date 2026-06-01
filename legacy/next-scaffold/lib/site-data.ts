export type CourseArea =
  | "eSocial"
  | "DP"
  | "Compras"
  | "Licitações"
  | "Liderança"
  | "IA Gov"
  | "Auditoria"
  | "Governança";

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  area: CourseArea;
  instructor: string;
  modality: "Presencial" | "Online" | "Híbrido" | "In Company";
  level: "Iniciante" | "Intermediário" | "Avançado";
  duration: string;
  price: string;
  nextClass: string;
  seats: string;
  badges: string[];
  audience: string[];
  requirements?: string;
  logistics: string[];
  modules: Array<{ title: string; items: string[] }>;
  summary: string;
};

export type Testimonial = {
  name: string;
  role: string;
  organization: string;
  area: CourseArea | "Liderança";
  courseSlug?: string;
  result?: string;
  text: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: CourseArea | "Carreira";
  author: "Ester" | "Nilson";
  publishedAt: string;
  readingTime: string;
  featured?: boolean;
  ctaCourseSlug?: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
};

export type CalendarEvent = {
  courseSlug: string;
  date: string;
  location: string;
  status: "Disponível" | "Últimas vagas" | "Lotado";
};

export const navLinks = [
  { href: "/cursos", label: "Cursos" },
  { href: "/agenda", label: "Agenda" },
  { href: "/blog", label: "Blog" },
  { href: "/in-company", label: "In Company" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" }
];

export const impactNumbers = [
  { value: 50, prefix: "-", suffix: "%", label: "recusas de eSocial em 90 dias" },
  { value: 19, prefix: "", suffix: " anos", label: "de operação e formação contínua" },
  { value: 10, prefix: "+", suffix: " anos", label: "de experiência em eSocial público" },
  { value: 30, prefix: "+", suffix: " trilhas", label: "de capacitação com foco em aplicação" }
];

export const pains = [
  "Cursos teóricos que não resolvem o dia a dia.",
  "Medo de errar e pagar caro por isso.",
  "Quem serve ao público merece capacitação que funciona."
];

export const guideProofs = [
  "19 anos formando profissionais em Brasília",
  "+10 anos em eSocial e rotinas públicas",
  "Clientes em órgãos públicos e equipes de alta responsabilidade",
  "Propósito comprometido com resultado real e mensurável"
];

export const steps = [
  {
    number: "01",
    title: "Escolha sua trilha",
    description: "Encontre o curso certo por área, nível, modalidade e próxima turma."
  },
  {
    number: "02",
    title: "Aprenda na prática",
    description: "Conteúdo aplicável no dia seguinte, com linguagem clara e contexto real."
  },
  {
    number: "03",
    title: "Aplique e veja o resultado",
    description: "Reduza erros, ganhe confiança e se torne a referência técnica da sua equipe."
  }
];

export const courses: Course[] = [
  {
    slug: "esocial-na-administracao-publica",
    title: "eSocial na Administração Pública",
    subtitle: "Para equipes que precisam reduzir recusas e ganhar previsibilidade operacional.",
    area: "eSocial",
    instructor: "Nilson",
    modality: "Híbrido",
    level: "Intermediário",
    duration: "16h",
    price: "12x de R$ 149",
    nextClass: "14 e 15 de maio",
    seats: "12 vagas restantes",
    badges: ["Mais procurado", "Próxima turma"],
    audience: ["Chefes de DP", "Analistas de eSocial", "Auditores internos"],
    requirements: "Conhecimento básico de folha e eventos trabalhistas.",
    logistics: ["Certificado reconhecido", "NF-e disponível", "Aulas ao vivo + materiais", "Brasília + transmissão online"],
    summary:
      "Curso intensivo para dominar regras, envio de eventos e correções com foco no serviço público.",
    modules: [
      {
        title: "Dia 1 — Fundamentos e arquitetura",
        items: ["Linha do tempo dos eventos", "Mapeamento de erros críticos", "Checklist de saneamento"]
      },
      {
        title: "Dia 2 — Operação assistida",
        items: ["Rotina de conferência", "Tratamento de rejeições", "Plano de ação para 90 dias"]
      }
    ]
  },
  {
    slug: "departamento-pessoal-sem-retrabalho",
    title: "Departamento Pessoal sem Retrabalho",
    subtitle: "Rotinas enxutas, documentação certa e segurança para equipes pressionadas.",
    area: "DP",
    instructor: "Ester",
    modality: "Online",
    level: "Iniciante",
    duration: "8h",
    price: "6x de R$ 119",
    nextClass: "22 de maio",
    seats: "18 vagas restantes",
    badges: ["Novo"],
    audience: ["Assistentes de RH", "Analistas de DP", "Gestores de equipe"],
    logistics: ["Ao vivo", "Gravação por 30 dias", "Certificado digital", "Material de apoio"],
    summary:
      "Um roteiro prático para diminuir retrabalho, padronizar processos e blindar a operação do DP.",
    modules: [
      {
        title: "Módulo 1 — Mapeamento do caos",
        items: ["Fluxo ideal de admissão", "Checklist de documentos", "Priorização de gargalos"]
      },
      {
        title: "Módulo 2 — Padronização que escala",
        items: ["Templates de conferência", "Comunicação com líderes", "Rituais operacionais"]
      }
    ]
  },
  {
    slug: "compras-publicas-com-lei-14133",
    title: "Compras Públicas com a Lei 14.133",
    subtitle: "Decisões de compra com segurança jurídica e leitura aplicada da nova lei.",
    area: "Compras",
    instructor: "Nilson",
    modality: "Presencial",
    level: "Avançado",
    duration: "24h",
    price: "12x de R$ 189",
    nextClass: "05 a 07 de junho",
    seats: "Últimas 8 vagas",
    badges: ["Últimas vagas"],
    audience: ["Compradores públicos", "Pregoeiros", "Assessores jurídicos"],
    logistics: ["Presencial em Brasília", "Coffee break", "Workbook", "Certificado digital"],
    summary:
      "Interpretação prática da Lei 14.133 para quem precisa comprar com previsibilidade e documentação robusta.",
    modules: [
      {
        title: "Módulo 1 — Planejamento",
        items: ["ETP e termo de referência", "Gestão de risco", "Matriz de responsabilidade"]
      },
      {
        title: "Módulo 2 — Execução e controle",
        items: ["Fases do processo", "Pontos de atenção do controle", "Casos reais comentados"]
      }
    ]
  },
  {
    slug: "licitacoes-estrategicas-para-gestores",
    title: "Licitações Estratégicas para Gestores",
    subtitle: "Tomada de decisão, governança e leitura crítica dos ritos licitatórios.",
    area: "Licitações",
    instructor: "Ester",
    modality: "Presencial",
    level: "Intermediário",
    duration: "16h",
    price: "10x de R$ 159",
    nextClass: "18 e 19 de junho",
    seats: "15 vagas restantes",
    badges: ["Próxima turma"],
    audience: ["Diretores administrativos", "Gestores de contratos", "Coordenadores"],
    logistics: ["Presencial", "Estudos de caso", "Material impresso", "Rede de networking"],
    summary:
      "Curso para líderes que precisam decidir melhor, sustentar escolhas e reduzir risco institucional.",
    modules: [
      {
        title: "Módulo 1 — Governança decisória",
        items: ["Papéis da liderança", "Critérios de priorização", "Erros frequentes"]
      },
      {
        title: "Módulo 2 — Sustentação técnica",
        items: ["Jurisprudência aplicada", "Como justificar decisões", "Rito com menos ruído"]
      }
    ]
  },
  {
    slug: "lideranca-que-transforma-equipes",
    title: "Liderança que Transforma Equipes Públicas",
    subtitle: "Comunicação, alinhamento e gestão de performance sem perder humanidade.",
    area: "Liderança",
    instructor: "Ester",
    modality: "In Company",
    level: "Intermediário",
    duration: "12h",
    price: "Sob consulta",
    nextClass: "Sob medida",
    seats: "Turma corporativa",
    badges: ["In Company"],
    audience: ["Diretores", "Gerentes", "Coordenadores de RH"],
    logistics: ["Programa customizado", "Turmas fechadas", "Relatório executivo", "Aplicação no contexto do órgão"],
    summary:
      "Capacitação para lideranças que precisam alinhar pessoas, processos e cultura de entrega.",
    modules: [
      {
        title: "Trilha 1 — Liderança com clareza",
        items: ["Conversas difíceis", "Rituais de alinhamento", "Feedback que gera ação"]
      },
      {
        title: "Trilha 2 — Performance com responsabilidade",
        items: ["Cultura de responsabilização", "Leitura de maturidade", "Plano de evolução da equipe"]
      }
    ]
  },
  {
    slug: "ia-gov-aplicada-a-rotinas-administrativas",
    title: "IA Gov Aplicada a Rotinas Administrativas",
    subtitle: "Use IA para acelerar análise, documentação e apoio à decisão com responsabilidade.",
    area: "IA Gov",
    instructor: "Nilson",
    modality: "Online",
    level: "Iniciante",
    duration: "6h",
    price: "4x de R$ 99",
    nextClass: "28 de maio",
    seats: "24 vagas restantes",
    badges: ["Novo"],
    audience: ["Analistas", "Consultores", "Equipes de inovação"],
    logistics: ["Workshop ao vivo", "Prompt pack", "Casos públicos", "Certificado"],
    summary:
      "Uma introdução aplicada para ganhar produtividade com IA sem abrir mão de governança.",
    modules: [
      {
        title: "Módulo 1 — Fundamentos e limites",
        items: ["Casos de uso seguros", "Boas práticas de prompt", "Checklist de governança"]
      },
      {
        title: "Módulo 2 — Aplicação no dia a dia",
        items: ["Atas e minutas", "Pesquisa normativa assistida", "Automação de tarefas repetitivas"]
      }
    ]
  }
];

export const testimonials: Testimonial[] = [
  {
    name: "Maria Aparecida",
    role: "Chefe de DP",
    organization: "Prefeitura do Entorno",
    area: "eSocial",
    courseSlug: "esocial-na-administracao-publica",
    result: "-50% de recusas em 90 dias",
    text:
      "Saímos do curso com um plano claro. Em poucas semanas nossa equipe passou a revisar o processo inteiro com mais confiança."
  },
  {
    name: "Carlos Roberto",
    role: "Analista de RH",
    organization: "Autarquia Federal",
    area: "DP",
    courseSlug: "departamento-pessoal-sem-retrabalho",
    text:
      "O diferencial foi sair com checklists e uma rotina aplicável no dia seguinte, sem teoria vazia."
  },
  {
    name: "Tatiana Ferreira",
    role: "Diretora de T&D",
    organization: "Instituto de Pesquisa",
    area: "Liderança",
    text:
      "A proposta In Company foi desenhada para nossa realidade. Conseguimos capacitar três áreas com a mesma linguagem."
  },
  {
    name: "João Paulo",
    role: "Consultor",
    organization: "Escritório Especializado",
    area: "Licitações",
    courseSlug: "licitacoes-estrategicas-para-gestores",
    text:
      "O conteúdo foi direto ao ponto e me ajudou a sustentar decisões com mais embasamento técnico nas reuniões com clientes."
  },
  {
    name: "Renata Lima",
    role: "Coordenadora de Compras",
    organization: "Fundação Pública",
    area: "Compras",
    result: "Processos com menos devoluções internas",
    text:
      "O curso trouxe clareza para a fase de planejamento e diminuiu o vai e volta com jurídico e controle."
  }
];

export const blogPosts: BlogPost[] = [
  {
    slug: "3-sinais-de-que-seu-esocial-precisa-de-revisao",
    title: "3 sinais de que seu eSocial precisa de revisão urgente",
    excerpt:
      "Quando o volume de correções cresce, quase sempre o problema está na rotina, não nas pessoas.",
    category: "eSocial",
    author: "Nilson",
    publishedAt: "12 abr 2026",
    readingTime: "6 min",
    featured: true,
    ctaCourseSlug: "esocial-na-administracao-publica",
    sections: [
      {
        heading: "Os sintomas aparecem antes do colapso",
        paragraphs: [
          "A maioria das equipes percebe o problema tarde demais, quando as rejeições já viraram urgência.",
          "O primeiro papel da liderança é criar um radar de rotina, não esperar a cobrança externa."
        ],
        bullets: [
          "Correções recorrentes no mesmo evento",
          "Dependência de uma única pessoa",
          "Ausência de checklist formal"
        ]
      },
      {
        heading: "Como reorganizar a operação",
        paragraphs: [
          "Mapeie as etapas críticas, defina pontos de conferência e reduza o improviso nas entregas.",
          "Uma rotina confiável não nasce do heroísmo individual, e sim da padronização certa."
        ]
      }
    ]
  },
  {
    slug: "como-reduzir-retrabalho-no-dp",
    title: "Como reduzir retrabalho no DP sem aumentar o time",
    excerpt:
      "Produtividade não começa com ferramenta. Começa com fluxo claro, combinados e visão de prioridade.",
    category: "DP",
    author: "Ester",
    publishedAt: "02 abr 2026",
    readingTime: "5 min",
    ctaCourseSlug: "departamento-pessoal-sem-retrabalho",
    sections: [
      {
        heading: "Retrabalho é sintoma de desenho ruim",
        paragraphs: [
          "Quando a equipe refaz a mesma tarefa, quase sempre falta padrão ou critério de conferência.",
          "A boa notícia é que isso pode ser corrigido com poucos ajustes e disciplina operacional."
        ]
      }
    ]
  },
  {
    slug: "lei-14133-o-que-muda-para-quem-decide",
    title: "Lei 14.133: o que muda para quem decide",
    excerpt:
      "A nova lei impacta mais do que o rito. Ela muda a forma como gestores sustentam decisões.",
    category: "Compras",
    author: "Nilson",
    publishedAt: "25 mar 2026",
    readingTime: "7 min",
    ctaCourseSlug: "compras-publicas-com-lei-14133",
    sections: [
      {
        heading: "Decidir melhor exige processo melhor",
        paragraphs: [
          "A Lei 14.133 traz exigências que pressionam planejamento, governança e documentação.",
          "O erro mais comum é tratar a mudança como mera atualização de formulário."
        ]
      }
    ]
  }
];

export const calendarEvents: CalendarEvent[] = [
  {
    courseSlug: "esocial-na-administracao-publica",
    date: "2026-05-14",
    location: "Brasília + online",
    status: "Disponível"
  },
  {
    courseSlug: "departamento-pessoal-sem-retrabalho",
    date: "2026-05-22",
    location: "Online ao vivo",
    status: "Disponível"
  },
  {
    courseSlug: "ia-gov-aplicada-a-rotinas-administrativas",
    date: "2026-05-28",
    location: "Online ao vivo",
    status: "Disponível"
  },
  {
    courseSlug: "compras-publicas-com-lei-14133",
    date: "2026-06-05",
    location: "Brasília",
    status: "Últimas vagas"
  },
  {
    courseSlug: "licitacoes-estrategicas-para-gestores",
    date: "2026-06-18",
    location: "Brasília",
    status: "Disponível"
  }
];

export const institutionalLinks = [
  { href: "/politica-privacidade", label: "Política de Privacidade" },
  { href: "/termos-uso", label: "Termos de Uso" },
  { href: "/login", label: "Área do Aluno" },
  { href: "/admin/dashboard", label: "Painel Admin" }
];

export function getCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function getRelatedCourses(slug: string) {
  const current = getCourseBySlug(slug);
  if (!current) {
    return [];
  }

  return courses.filter((course) => course.slug !== slug && course.area === current.area).slice(0, 3);
}

export function getTestimonialsByCourse(slug: string) {
  return testimonials.filter((testimonial) => testimonial.courseSlug === slug);
}

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function estimatePostWordCount(post: BlogPost) {
  return post.sections
    .flatMap((section) => [...section.paragraphs, ...(section.bullets ?? [])])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}
