import type { TrainingPath } from "@/types";

export const trainingPaths: TrainingPath[] = [
  {
    id: "path-dp",
    code: "T01",
    name: "Departamento Pessoal, Folha de Pagamento & eSocial",
    shortName: "DP, Folha & eSocial",
    slug: "departamento-pessoal-folha-de-pagamento-esocial",
    description: "Capacitação completa do DP público, da legislação trabalhista à conformidade digital com eSocial, FGTS Digital e LGPD.",
    icon: "Calculator",
    courseCount: 14
  },
  {
    id: "path-licitacoes",
    code: "T02",
    name: "Licitações, Compras Públicas & Contratos Administrativos",
    shortName: "Licitações & Contratos",
    slug: "licitacoes-compras-publicas-contratos-administrativos",
    description: "Da legislação básica à fiscalização avançada de contratos, com cobertura da Lei nº 14.133/2021 e melhores práticas de contratação pública.",
    icon: "Scale",
    courseCount: 12
  },
  {
    id: "path-pessoas",
    code: "T03",
    name: "Gestão de Pessoas, Liderança & Desenvolvimento Humano",
    shortName: "Pessoas & Liderança",
    slug: "gestao-de-pessoas-lideranca-desenvolvimento-humano",
    description: "Formação humanizada para líderes e equipes, com inteligência emocional, cultura organizacional, saúde mental e gestão por resultados.",
    icon: "Users",
    courseCount: 14
  },
  {
    id: "path-comunicacao",
    code: "T04",
    name: "Comunicação Institucional, Redação & Atendimento ao Cidadão",
    shortName: "Comunicação & Atendimento",
    slug: "comunicacao-institucional-redacao-atendimento-ao-cidadao",
    description: "Comunicação clara e eficiente, do atendimento ao cidadão à redação oficial, oratória, mídias digitais e conformidade com LAI/LGPD.",
    icon: "MessageSquareText",
    courseCount: 10
  },
  {
    id: "path-auditoria",
    code: "T05",
    name: "Auditoria, Contabilidade Pública & Gestão Tributária",
    shortName: "Auditoria & Tributária",
    slug: "auditoria-contabilidade-publica-gestao-tributaria",
    description: "Domínio técnico em contabilidade pública, obrigações acessórias, Tesouro Gerencial, SIAFI e auditoria governamental.",
    icon: "ClipboardCheck",
    courseCount: 19
  },
  {
    id: "path-tech",
    code: "T06",
    name: "Tecnologia, Dados, Processos & Inovação",
    shortName: "Tecnologia & Inovação",
    slug: "tecnologia-dados-processos-inovacao",
    description: "Ferramentas digitais, análise de dados, modelagem de processos, inteligência artificial e governança para transformação digital.",
    icon: "BarChart3",
    courseCount: 11
  }
];
