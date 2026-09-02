export const DP_ZERO_SLUG = "departamento-pessoal-do-zero";
export const DP_ZERO_LANDING_PATH = `/lp/${DP_ZERO_SLUG}`;
export const DP_ZERO_CHECKOUT_PATH = `/lp/${DP_ZERO_SLUG}/checkout`;
export const DP_ZERO_CTA_LABEL = "Quero me preparar para vagas de DP";

export const departmentPersonnelZeroContent = {
  audiences: [
    "Ainda não possui experiência em Departamento Pessoal.",
    "Busca a primeira oportunidade como auxiliar ou assistente de DP.",
    "Deseja migrar da área administrativa para Departamento Pessoal.",
    "Precisa de uma sequência completa para organizar o que deve aprender.",
    "Quer desenvolver conhecimento técnico e melhorar currículo, LinkedIn e entrevista."
  ],
  notFor: [
    "Quem busca uma formação avançada ou especialização em um único sistema.",
    "Quem já executa todas as rotinas de DP com autonomia e precisa apenas de atualização pontual.",
    "Quem espera promessa de contratação, salário garantido ou indicação automática para vagas.",
    "Quem não pretende realizar os exercícios e montar o projeto final."
  ],
  outcomes: [
    "Identificar responsabilidades e documentos essenciais de Departamento Pessoal.",
    "Simular admissão, jornada, folha, férias, décimo terceiro, afastamentos e rescisão.",
    "Compreender a função do eSocial, FGTS Digital e DCTFWeb nas rotinas de DP.",
    "Conferir cálculos e reconhecer erros básicos em exercícios práticos.",
    "Montar um miniportfólio com evidências do aprendizado.",
    "Direcionar currículo, LinkedIn e respostas de entrevista para vagas de entrada."
  ],
  modules: [
    {
      title: "Fundamentos de Departamento Pessoal e mercado de trabalho",
      duration: "2 horas",
      description: "Papel do DP, cargos de entrada, rotina mensal, documentos, sigilo, postura e competências valorizadas."
    },
    {
      title: "Admissão, contratos e integração",
      duration: "5 horas",
      description: "Documentos admissionais, tipos de contrato, registro, Carteira de Trabalho Digital, eSocial e checklist de integração."
    },
    {
      title: "Jornada, remuneração e benefícios",
      duration: "5 horas",
      description: "Ponto, horas extras, banco de horas, intervalos, faltas, salário, adicionais, benefícios e descontos."
    },
    {
      title: "Folha de pagamento na prática",
      duration: "6 horas",
      description: "Proventos, descontos, salário proporcional, adicionais, DSR, INSS, IRRF, FGTS, fechamento e conferência."
    },
    {
      title: "Férias e décimo terceiro salário",
      duration: "4 horas",
      description: "Períodos, fracionamento, abono, pagamentos, cálculos, parcelas do décimo terceiro e descontos."
    },
    {
      title: "eSocial, FGTS Digital e DCTFWeb para iniciantes",
      duration: "5 horas",
      description: "Finalidade, eventos, integração entre obrigações, prazos básicos e cuidados nos fluxos vigentes em 2026."
    },
    {
      title: "Afastamentos e rescisão contratual",
      duration: "5 horas",
      description: "Atestados, licenças, estabilidade, desligamentos, verbas, aviso prévio, prazos, documentos e conferência."
    },
    {
      title: "Currículo, LinkedIn, busca por vagas e entrevista",
      duration: "4 horas",
      description: "Currículo direcionado, perfil no LinkedIn, pesquisa de vagas, candidatura, entrevista e apresentação profissional."
    }
  ],
  portfolio: [
    "Checklist admissional",
    "Simulação de folha de pagamento",
    "Cálculo de férias",
    "Cálculo de décimo terceiro salário",
    "Simulação de rescisão contratual",
    "Currículo e perfil de LinkedIn direcionados a DP",
    "Roteiro de apresentação e respostas de entrevista"
  ],
  included: [
    "40 horas de formação gravada e online",
    "Plano de estudo de 30 dias",
    "Kit de modelos editáveis de Departamento Pessoal",
    "Kit Primeira Candidatura, com currículo, LinkedIn e entrevista",
    "Checklist “Pronto para me candidatar?”"
  ],
  faqs: [
    {
      question: "Não tenho nenhuma experiência. Vou acompanhar?",
      answer: "Sim. A formação começa pelos fundamentos e foi estruturada para iniciantes. As siglas e rotinas são apresentadas em sequência, e os exercícios ajudam a transformar teoria em prática. Você precisa reservar tempo para estudar e concluir as atividades."
    },
    {
      question: "Quarenta horas não é muito?",
      answer: "O conteúdo foi organizado em uma Rota Essencial de 36 horas, acompanhada por um projeto final de 4 horas e um plano de estudo de 30 dias. Os exercícios se conectam às entregas do miniportfólio para reduzir retrabalho."
    },
    {
      question: "Concluir o curso garante uma vaga?",
      answer: "Não. A contratação depende de cada processo seletivo. A formação entrega conhecimento técnico, simulações, miniportfólio e preparação para candidatura. A promessa é de preparo, não de emprego garantido."
    },
    {
      question: "Já encontro conteúdo gratuito na internet. Qual é a diferença?",
      answer: "Conteúdos isolados podem ajudar, mas nem sempre organizam a aplicação. Aqui você segue uma sequência, realiza atividades conectadas, usa modelos editáveis e reúne o que praticou em um miniportfólio."
    },
    {
      question: "O curso vai me indicar para empresas?",
      answer: "Não. A oferta não inclui indicação ou encaminhamento para vagas. Ela prepara você para buscar oportunidades e se apresentar melhor em processos seletivos."
    },
    {
      question: "Como funciona a garantia?",
      answer: "Compras online contam com garantia de satisfação de 7 dias, dentro das condições aplicáveis ao período inicial de acesso."
    }
  ]
} as const;

// Regra editorial: não adicionar prova social, escassez, certificado ou promessa
// profissional sem uma fonte aprovada e vinculada especificamente a este produto.
export const departmentPersonnelZeroStructuredData = {
  course: {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Departamento Pessoal do Zero",
    description: "Formação gravada e online de 40 horas para aprender e simular rotinas essenciais de Departamento Pessoal e construir um miniportfólio técnico.",
    provider: {
      "@type": "Organization",
      name: "Departamento Pessoal do Zero"
    },
    courseMode: "Online",
    timeRequired: "PT40H",
    educationalLevel: "Iniciante",
    offers: {
      "@type": "Offer",
      price: "297",
      priceCurrency: "BRL"
    }
  },
  faq: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: departmentPersonnelZeroContent.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  }
} as const;
