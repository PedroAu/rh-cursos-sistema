import { courseCoverByPath } from "@/data/courseCovers";
import { mockInstructors } from "@/data/mockInstructors";
import { trainingPaths } from "@/data/trainingPaths";
import { slugify } from "@/lib/utils";
import type { Course, CourseModule, CourseStatus } from "@/types";

type CatalogCourse = {
  title: string;
  level: Course["level"];
};

const courseCatalog: Record<string, CatalogCourse[]> = {
  "path-dp": [
    { title: "Departamento Pessoal para a Administração Pública: Fundamentos e Legislação", level: "Básico" },
    { title: "Legislação Trabalhista e Previdenciária para Servidores Públicos - Regime Estatutário", level: "Básico" },
    { title: "Aposentadoria e Pensão de Servidores Públicos: Emenda Constitucional 103/2019 Atualizado", level: "Intermediário" },
    { title: "Formação de Especialista em Folha de Pagamento do Setor Público", level: "Intermediário" },
    { title: "Cálculo Trabalhista Avançado na Administração Pública: Verbas, Rescisões e Encargos", level: "Avançado" },
    { title: "Cálculo Trabalhista para Gestores e Fiscais de Contratos Administrativos", level: "Intermediário" },
    { title: "Auditoria de Folha de Pagamento: Conformidade, Erros e Controles Internos", level: "Avançado" },
    { title: "eSocial Completo para Órgãos Públicos: Regime RPPS e RGPS", level: "Básico / Avançado" },
    { title: "eSocial 1.3 na Prática: Validação e Envio de Eventos para Órgãos Públicos", level: "Avançado" },
    { title: "FGTS Digital: Implementação, Obrigações e Recolhimento para o Setor Público", level: "Intermediário" },
    { title: "Gestão do Custo da Mão de Obra em Contratos Públicos: Planilha e Composição", level: "Intermediário" },
    { title: "Dimensionamento da Força de Trabalho no Setor Público: Métodos, Ferramentas e Práticas", level: "Intermediário" },
    { title: "PGR Psicossocial na Prática: Diagnóstico, Riscos e Plano de Ação para Órgãos Públicos", level: "Avançado" },
    { title: "LGPD no Departamento Pessoal: Como Aplicar a Lei de Proteção de Dados no RH Público", level: "Intermediário" }
  ],
  "path-licitacoes": [
    { title: "Introdução às Licitações e Contratos Administrativos: Noções Essenciais para o Setor Público", level: "Básico" },
    { title: "Nova Lei de Licitações na Prática: Lei nº 14.133/2021 - Teoria, Aplicação e Casos Reais", level: "Básico / Intermediário" },
    { title: "Implementação Prática da Nova Lei de Licitações: Lei nº 14.133/2021 Passo a Passo", level: "Intermediário" },
    { title: "Dispensa e Inexigibilidade de Licitação: Instrução Segura dos Processos - Lei 14.133/2021", level: "Intermediário" },
    { title: "Planejamento da Contratação Pública: ETP, Termo de Referência, Matriz de Riscos e Plano de Fiscalização", level: "Intermediário" },
    { title: "Elaboração e Julgamento de Planilha de Preços em Contratos Públicos - IN nº 05/2017", level: "Intermediário / Avançado" },
    { title: "Elaboração de Editais de Licitação para Aquisição de Bens e Serviços no Setor Público", level: "Avançado" },
    { title: "Elaboração de Planilha de Custos em Contratos de Terceirização no Setor Público", level: "Avançado" },
    { title: "Gestão e Fiscalização de Contratos Administrativos: Técnicas e Responsabilidades", level: "Avançado" },
    { title: "Gestão de Contratos de Soluções de TI na Administração Pública: IN SEGES e Boas Práticas", level: "Avançado" },
    { title: "Contratações Sustentáveis no Setor Público: Critérios, Requisitos e Práticas ESG", level: "Intermediário" },
    { title: "Resolução de Conflitos em Licitações: Conciliação, Mediação e Arbitragem na Lei 14.133/2021", level: "Avançado" }
  ],
  "path-pessoas": [
    { title: "Inteligência Emocional no Trabalho: Autoconhecimento, Regulação e Relações Profissionais", level: "Básico" },
    { title: "Qualidade de Vida no Trabalho e Saúde Mental do Servidor Público", level: "Básico" },
    { title: "Prevenção e Combate ao Assédio Moral e Sexual no Ambiente de Trabalho", level: "Básico" },
    { title: "Gestão do Tempo e Produtividade: Ferramentas Práticas para o Ambiente Profissional", level: "Básico" },
    { title: "Comunicação Não-Violenta (CNV) e Escuta Ativa: Relações Interpessoais no Trabalho", level: "Básico / Intermediário" },
    { title: "Feedback Eficaz e Gestão de Desempenho por Resultados nas Organizações Públicas", level: "Intermediário" },
    { title: "Mediação de Conflitos e Negociação na Administração Pública: Técnicas e Aplicação", level: "Intermediário" },
    { title: "Gestão por Competências na Administração Pública: Mapeamento, Avaliação e Desenvolvimento", level: "Intermediário" },
    { title: "Times de Alta Performance: Como Desenvolver e Liderar Equipes de Excelência", level: "Intermediário" },
    { title: "Liderança Estratégica para Gestores Públicos: Visão, Influência e Tomada de Decisão", level: "Avançado" },
    { title: "Liderança em Tempo de Crise e Incerteza: Estratégias para Gestores e Líderes", level: "Avançado" },
    { title: "Gestão de Processos Organizacionais (BPM): Mapeamento, Análise e Melhoria Contínua", level: "Intermediário" },
    { title: "Gestão de Projetos, Programas e Portfólios: PMBOK, Metodologias Ágeis e Aplicação Prática", level: "Avançado" },
    { title: "Planejamento Estratégico para Órgãos Públicos e Organizações: Métodos e Ferramentas", level: "Avançado" }
  ],
  "path-comunicacao": [
    { title: "Leitura Crítica e Interpretação de Textos para Profissionais: Reaprender a Ler e Compreender", level: "Básico" },
    { title: "Português para o Ambiente Profissional: Gramática, Escrita e Comunicação Corporativa", level: "Básico" },
    { title: "Redação Oficial e Documentos Técnicos na Administração Pública: Novas Normas e Práticas", level: "Básico / Intermediário" },
    { title: "Redação Jurídica para Servidores e Advogados: Peças, Pareceres e Documentos Legais", level: "Intermediário" },
    { title: "Oratória e Apresentações em Público na Administração Pública: Técnicas e Prática", level: "Intermediário" },
    { title: "Inglês para o Ambiente Profissional e Corporativo: Comunicação, E-mails e Reuniões", level: "Básico / Intermediário" },
    { title: "Atendimento ao Público na Administração Pública: Qualidade, Empatia e Gestão de Conflitos", level: "Básico" },
    { title: "Atendimento Omnichannel ao Cidadão: Integração de Canais Digitais e Presenciais", level: "Intermediário" },
    { title: "Comunicação nas Mídias Digitais para Órgãos Públicos: Estratégia, Conteúdo e Gestão", level: "Intermediário" },
    { title: "LGPD na Administração Pública: Programa de Conformidade, Implementação e Boas Práticas", level: "Avançado" }
  ],
  "path-auditoria": [
    { title: "Contabilidade Aplicada ao Setor Público (CASP) e Administração Financeira e Orçamentária (AFO): Fundamentos", level: "Básico" },
    { title: "Contabilidade Pública nos Conselhos de Fiscalização Profissional: Desafios e Atualização", level: "Intermediário" },
    { title: "Contabilidade Societária e Normas Brasileiras de Contabilidade (NBC/CPC/IFRS): Atualização", level: "Intermediário" },
    { title: "Análise de Demonstrações Contábeis: Interpretação de Balanços e Tomada de Decisão", level: "Intermediário" },
    { title: "Encerramento de Balanço: Procedimentos Contábeis, Ajustes e Boas Práticas", level: "Avançado" },
    { title: "Tesouro Gerencial Básico: Navegação, Relatórios e Consultas Orçamentárias", level: "Básico" },
    { title: "Tesouro Gerencial Intermediário: Análise de Execução e Relatórios Gerenciais", level: "Intermediário" },
    { title: "Tesouro Gerencial Avançado: Dashboards, Cubos e Gestão Orçamentária Estratégica", level: "Avançado" },
    { title: "SIAFI Gerencial e Operacional: Módulos, Consultas e Funcionalidades para Servidores", level: "Básico / Avançado" },
    { title: "Retenções na Fonte de Tributos e Contribuições Sociais na Administração Pública", level: "Intermediário" },
    { title: "eSocial, EFD-REINF e DCTF Web: Integração das Obrigações Acessórias do Setor Público", level: "Intermediário / Avançado" },
    { title: "EFD-REINF: Escrituração Fiscal Digital de Retenções e Informações Previdenciárias", level: "Avançado" },
    { title: "Lucro Real: Apuração de PIS, COFINS, PERDCOMP e Recuperação de Créditos Federais", level: "Avançado" },
    { title: "Gestão Tributária pelo Lucro Real na Prática: Planejamento, Cálculo e Conformidade Fiscal", level: "Avançado" },
    { title: "Planejamento Tributário Estratégico: Redução de Tributos dentro da Legalidade", level: "Avançado" },
    { title: "Reforma Tributária Brasileira 2024/2025: IVA, CBS, IBS e Impactos Práticos nas Empresas e Órgãos", level: "Intermediário" },
    { title: "Auditoria Baseada em Riscos: Metodologia, Planejamento e Relatórios de Auditoria", level: "Avançado" },
    { title: "Teoria e Prática em Auditoria Governamental: Do Planejamento ao Relatório Final", level: "Avançado" },
    { title: "IA-CM: Modelo de Capacidade de Auditoria Interna para o Setor Público - Implementação", level: "Avançado" }
  ],
  "path-tech": [
    { title: "Pacote Office Completo: Word, Excel e PowerPoint para o Setor Público e Empresas", level: "Básico" },
    { title: "Excel Básico: Primeiros Passos, Fórmulas Essenciais e Formatação de Planilhas", level: "Básico" },
    { title: "Excel Intermediário: Tabelas Dinâmicas, Gráficos Avançados e Funções de Busca", level: "Intermediário" },
    { title: "Excel Avançado: Macros, VBA, Power Query e Automação de Planilhas", level: "Avançado" },
    { title: "Power BI para Iniciantes e Intermediários: Dashboards, Relatórios e Visualização de Dados", level: "Básico / Intermediário" },
    { title: "Mapeamento de Processos na Prática: BPM, Fluxogramas e Identificação de Gargalos", level: "Básico / Intermediário" },
    { title: "Modelagem de Processos com Bizagi: BPMN, Simulação e Automação de Fluxos", level: "Intermediário" },
    { title: "Indicadores de Desempenho (KPIs): Construção, Monitoramento e Gestão por Resultados", level: "Intermediário" },
    { title: "Inovação no Setor Público: Design Thinking, Métodos Ágeis e Cultura de Inovação", level: "Intermediário" },
    { title: "Governança Institucional e Compliance: Princípios, Estruturas e Melhores Práticas", level: "Avançado" },
    { title: "Escrita Jurídica com ChatGPT e Inteligência Artificial: Peças, Contratos e Documentos Legais", level: "Intermediário" }
  ]
};

const modalities: Course["modality"][] = [
  "Ao vivo online",
  "Presencial",
  "In company",
  "Híbrido",
  "Gravado"
];

function levelToPublicType(level: Course["level"]): Course["publicType"] {
  if (level === "Básico") return "Iniciantes";
  if (level === "Avançado" || level.includes("Avançado")) return "Avançado";
  return "Profissionais";
}

function buildModules(title: string, level: Course["level"]): CourseModule[] {
  return [
    {
      title: "Módulo 1 - Contexto e fundamentos",
      description: `Base conceitual e normativa para compreender ${title.toLowerCase()}.`,
      duration: "2h",
      topics: ["Panorama do tema", "Termos essenciais", "Riscos e oportunidades"]
    },
    {
      title: "Módulo 2 - Aplicação prática",
      description: "Rotinas, exemplos e decisões recorrentes no contexto profissional.",
      duration: "3h",
      topics: ["Fluxos de trabalho", "Casos comentados", "Erros mais comuns"]
    },
    {
      title: "Módulo 3 - Plano de implementação",
      description: `Atividades, checklists e próximos passos adequados ao nível ${level.toLowerCase()}.`,
      duration: "3h",
      topics: ["Checklist de aplicação", "Materiais de apoio", "Plano de ação"]
    }
  ];
}

export const mockCourses: Course[] = trainingPaths.flatMap((path, pathIndex) =>
  courseCatalog[path.id].map((course, index) => {
    const globalIndex = trainingPaths
      .slice(0, pathIndex)
      .reduce((total, currentPath) => total + courseCatalog[currentPath.id].length, 0) + index;
    const modality = modalities[(pathIndex + index) % modalities.length];
    const instructor = mockInstructors[(pathIndex + index) % mockInstructors.length];
    const status: CourseStatus =
      index === 0 ? "Destaque" : index === courseCatalog[path.id].length - 1 ? "Em breve" : "Ativo";
    const durationHours = course.level === "Avançado" || course.level.includes("Avançado") ? 24 : course.level === "Básico" ? 8 : 16;

    return {
      id: `course-${path.code.toLowerCase()}-${index + 1}`,
      slug: slugify(course.title),
      title: course.title,
      pathId: path.id,
      pathName: path.name,
      modality,
      durationLabel: `${durationHours}h`,
      durationHours,
      level: course.level,
      publicType: levelToPublicType(course.level),
      price: 0,
      shortDescription: `Capacitação ${course.level.toLowerCase()} da trilha ${path.shortName}, com foco em aplicação prática, clareza técnica e aderência ao contexto público.`,
      fullDescription: `Este curso faz parte da trilha ${path.name} e usa o nome SEO recomendado no portfólio RH Cursos. Foi desenhado para transformar o tema "${course.title}" em aprendizado aplicável, com exemplos, checklists e orientação para execução segura.`,
      targetAudience: [
        "Servidores públicos e profissionais da área",
        "Gestores que precisam decidir com segurança",
        "Equipes que buscam padronização e atualização técnica"
      ],
      objectives: [
        "Compreender os fundamentos e termos-chave do tema",
        "Aplicar boas práticas em situações reais",
        "Reduzir retrabalho, risco técnico e insegurança operacional"
      ],
      benefits: [
        "Nome e posicionamento otimizados para SEO",
        "Conteúdo organizado por trilha e nível",
        "Aplicação prática no contexto profissional",
        "Material de apoio e checklist"
      ],
      modules: buildModules(course.title, course.level),
      instructorId: instructor.id,
      image: courseCoverByPath[path.id],
      rating: 4.6 + ((pathIndex + index) % 4) * 0.1,
      studentsCount: 90 + pathIndex * 80 + index * 23,
      status,
      featured: index < 2,
      nextClassId: `class-${Math.floor(globalIndex / 5) + 1}-${(globalIndex % 5) + 1}`
    };
  })
);
