-- Expande o conteúdo editorial dos cinco cursos identificados na auditoria SEO.
-- A migration é idempotente e só substitui conteúdo de catálogo que ainda está
-- no formato raso da primeira carga (até cinco módulos). Conteúdo editorial já
-- mais completo permanece preservado.

-- Corrige construções públicas que geravam "Curso de Prático" e "Curso de Completo".
update public.curso as c
set titulo = v.titulo,
    updated_at = now()
from (
  values
    (
      'curso-pratico-atualizacao-esocial-novo-leiaute-1-3-orgaos-publicos',
      'Curso Prático de Atualização do eSocial: Novo Leiaute 1.3 para Órgãos Públicos'
    ),
    (
      'curso-completo-departamento-pessoal-administracao-publica',
      'Curso Completo de Departamento Pessoal para Administração Pública'
    ),
    (
      'redacao-oficial-documentos-tecnicos-alteracoes-recentes',
      'Redação Oficial e Documentos Técnicos'
    )
) as v(slug, titulo)
where c.slug = v.slug
  and c.deleted_at is null
  and c.titulo in (
    'Prático de Atualização do eSocial: Novo Leiaute 1.3 para Órgãos Públicos',
    'Curso de Prático de Atualização do eSocial: Novo Leiaute 1.3 para Órgãos Públicos',
    'Completo de Departamento Pessoal para Administração Pública',
    'Curso de Completo de Departamento Pessoal para Administração Pública',
    'Curso de Redação Oficial e Elaboração de Documentos Técnicos com Foco nas Mais Recentes Alterações',
    'Redação Oficial e Elaboração de Documentos Técnicos com Foco nas Mais Recentes Alterações'
  );

-- ISO/IEC 20000-1
update public.curso as c
set descricao_curta = 'Interpretação prática dos requisitos da ISO/IEC 20000-1 para estruturar, avaliar e melhorar a gestão de serviços de TI.',
    descricao = 'Curso de ISO/IEC 20000-1 para interpretar os requisitos de um sistema de gestão de serviços de TI, relacionar a norma aos processos da organização e identificar oportunidades de melhoria. A abordagem combina fundamentos, exemplos de operação, avaliação de lacunas e construção de evidências para auditoria.',
    ementa = $$[
      {"title":"Contexto e fundamentos da ISO/IEC 20000-1","description":"Compreenda a finalidade da norma, o vocabulário essencial e a estrutura de um sistema de gestão de serviços de TI.","topics":["Escopo e finalidade da ISO/IEC 20000-1:2018","Termos, definições e estrutura de alto nível","Contexto da organização e partes interessadas","Serviços, processos e requisitos aplicáveis"],"duration":"Bloco 1"},
      {"title":"Liderança, política e responsabilidades","description":"Organize a governança necessária para que o sistema de gestão tenha direção, papéis definidos e compromisso institucional.","topics":["Política de gestão de serviços","Responsabilidades, autoridades e comunicação","Objetivos alinhados ao negócio","Gestão de mudanças organizacionais"],"duration":"Bloco 2"},
      {"title":"Planejamento, riscos e recursos","description":"Transforme riscos e oportunidades em planos objetivos, recursos adequados e competências verificáveis.","topics":["Identificação de riscos e oportunidades","Objetivos e planos para alcançá-los","Competência, conscientização e treinamento","Informação documentada e controle de registros"],"duration":"Bloco 3"},
      {"title":"Operação e desenho dos serviços","description":"Relacione o desenho e a entrega dos serviços aos controles operacionais e às necessidades dos usuários.","topics":["Planejamento e controle operacional","Catálogo, níveis e continuidade de serviço","Gestão de incidentes, requisições e problemas","Gestão de mudanças e configuração"],"duration":"Bloco 4"},
      {"title":"Fornecedores, desempenho e conformidade","description":"Acompanhe fornecedores e resultados com critérios que sustentem a qualidade e a continuidade dos serviços.","topics":["Gestão de fornecedores e acordos","Indicadores, metas e níveis de serviço","Monitoramento, medição e análise crítica","Evidências de conformidade e auditoria"],"duration":"Bloco 5"},
      {"title":"Não conformidade e melhoria contínua","description":"Estruture respostas para desvios e um ciclo de melhoria que possa ser demonstrado por evidências.","topics":["Tratamento de não conformidades","Ação corretiva e análise de causa","Auditoria interna e análise crítica","Integração com ISO 9001 e ISO/IEC 27001"],"duration":"Bloco 6"}
    ]$$::jsonb,
    objetivos = $$[
      "Interpretar os requisitos da ISO/IEC 20000-1:2018 no contexto da organização",
      "Mapear processos e serviços relacionados ao sistema de gestão",
      "Identificar riscos, lacunas e oportunidades de melhoria",
      "Definir evidências e indicadores para acompanhar o desempenho",
      "Relacionar operação, fornecedores, continuidade e níveis de serviço",
      "Apoiar auditorias internas e planos de ação de conformidade"
    ]$$::jsonb,
    beneficios = $$[
      "Visão estruturada do sistema de gestão de serviços de TI",
      "Estudos de caso para interpretar requisitos em situações reais",
      "Roteiro para avaliação de lacunas e priorização de melhorias",
      "Exemplos de indicadores, registros e evidências de conformidade",
      "Integração entre governança, operação e melhoria contínua",
      "Material de apoio e certificado conforme a turma"
    ]$$::jsonb,
    publico_alvo = $$[
      "Profissionais e gestores de TI",
      "Equipes de Service Desk, suporte e operações",
      "Qualidade, compliance, governança, processos e auditoria",
      "Organizações que desejam estruturar ou melhorar a gestão de serviços"
    ]$$::jsonb,
    updated_at = now()
where c.slug = 'interpretacao-requisitos-iso-iec-20000-1'
  and c.deleted_at is null
  and jsonb_array_length(c.ementa) <= 5;

-- Redação oficial e documentos técnicos
update public.curso as c
set descricao_curta = 'Curso de Redação Oficial e Documentos Técnicos para escrever com clareza, precisão, objetividade e adequação institucional.',
    descricao = 'Curso de Redação Oficial e Documentos Técnicos com prática orientada para ofícios, relatórios, pareceres, notas técnicas e comunicações institucionais. O conteúdo trabalha linguagem simples, estrutura textual, padronização, revisão e adaptação da mensagem ao público, preservando a formalidade necessária ao setor público e às empresas.',
    ementa = $$[
      {"title":"Princípios da redação oficial","description":"Entenda os princípios que orientam a comunicação institucional e o impacto de cada escolha de linguagem.","topics":["Impessoalidade, clareza, concisão e objetividade","Adequação ao propósito e ao destinatário","Coerência, coesão e progressão das ideias","Responsabilidade e transparência na comunicação"],"duration":"Bloco 1"},
      {"title":"Linguagem simples e foco no leitor","description":"Converta textos difíceis em mensagens compreensíveis sem perder precisão técnica ou segurança institucional.","topics":["Plain language aplicada ao serviço público","Frases, parágrafos e títulos mais claros","Empatia, acessibilidade e inclusão","Redução de jargões, ambiguidades e vícios"],"duration":"Bloco 2"},
      {"title":"Ofícios, memorandos e comunicações","description":"Conheça a estrutura e a finalidade dos principais documentos e canais de comunicação oficial.","topics":["Ofício, ofício conjunto e circular","Pronomes de tratamento, vocativo e fecho","Comunicação por e-mail, SEI e mensagens institucionais","Endereçamento, assunto e identificação do signatário"],"duration":"Bloco 3"},
      {"title":"Relatórios, pareceres e notas técnicas","description":"Organize informação, análise e recomendação em documentos técnicos que apoiem decisões.","topics":["Estrutura de relatório e nota técnica","Contextualização, fundamentação e conclusão","Parecer, informação e despacho","Uso responsável de dados, referências e anexos"],"duration":"Bloco 4"},
      {"title":"Argumentação e comunicação institucional","description":"Construa argumentos verificáveis e apresente propostas de forma lógica, respeitosa e persuasiva.","topics":["Problema, evidência, análise e encaminhamento","Contra-argumentos e respostas técnicas","Comunicação com públicos interno e externo","Revisão de tom, intenção e risco de interpretação"],"duration":"Bloco 5"},
      {"title":"Padronização e revisão final","description":"Aplique uma lista de verificação para entregar textos corretos, consistentes e prontos para publicação.","topics":["Concordância, regência, crase e pontuação","Siglas, abreviaturas, números e datas","Novo Acordo Ortográfico e grafia institucional","Checklist de revisão, versão e aprovação"],"duration":"Bloco 6"}
    ]$$::jsonb,
    objetivos = $$[
      "Redigir documentos oficiais claros, objetivos e adequados ao destinatário",
      "Aplicar linguagem simples sem perder precisão técnica",
      "Estruturar ofícios, relatórios, pareceres e notas técnicas",
      "Organizar argumentos, evidências e recomendações",
      "Revisar textos para reduzir erros gramaticais e ambiguidades",
      "Padronizar documentos e comunicações institucionais"
    ]$$::jsonb,
    beneficios = $$[
      "Prática guiada com modelos de documentos institucionais",
      "Exercícios de reescrita e simplificação de textos",
      "Checklist para revisão gramatical e estrutural",
      "Orientação para comunicação em SEI, e-mail e canais digitais",
      "Aplicação em relatórios, pareceres e notas técnicas",
      "Material didático e certificado conforme a turma"
    ]$$::jsonb,
    publico_alvo = $$[
      "Profissionais que elaboram ofícios, relatórios e pareceres",
      "Assessorias, áreas administrativas e equipes técnicas",
      "Servidores que produzem comunicação institucional",
      "Gestores que revisam, aprovam ou assinam documentos"
    ]$$::jsonb,
    updated_at = now()
where c.slug = 'redacao-oficial-documentos-tecnicos-alteracoes-recentes'
  and c.deleted_at is null
  and jsonb_array_length(c.ementa) <= 5;

-- Tesouro Gerencial
update public.curso as c
set descricao_curta = 'Curso de Tesouro Gerencial para criar relatórios, métricas, documentos analíticos e dashboards de execução orçamentária.',
    descricao = 'Curso de Tesouro Gerencial Avançado com foco na criação de consultas, relatórios, métricas e dashboards para apoiar a gestão orçamentária e financeira. A trilha percorre filtros, hierarquias, documentos analíticos, visualizações e leitura de informações do SIAFI, sempre conectando a ferramenta à rotina de análise da unidade administrativa.',
    ementa = $$[
      {"title":"Ambiente, filtros e navegação","description":"Revise a lógica do Tesouro Gerencial e organize consultas para encontrar dados com mais consistência.","topics":["Ambiente, pastas e objetos de análise","Filtros, prompts e seleções","Hierarquias, atributos e métricas","Período, unidade e dimensões da consulta"],"duration":"Bloco 1"},
      {"title":"Relatórios e consultas customizadas","description":"Monte relatórios reutilizáveis para responder perguntas de execução e acompanhamento orçamentário.","topics":["Estrutura de linhas, colunas e filtros","Grupos personalizados e elementos derivados","PPA, LDO, LOA e créditos orçamentários","Exportação, validação e documentação da consulta"],"duration":"Bloco 2"},
      {"title":"Métricas, fórmulas e indicadores","description":"Crie métricas que transformem dados brutos em informação comparável para tomada de decisão.","topics":["Funções e editor de fórmulas","Combinação de métricas e condições","Indicadores de execução e acompanhamento","Testes de consistência e interpretação dos resultados"],"duration":"Bloco 3"},
      {"title":"Documentos analíticos","description":"Estruture documentos que integrem tabelas, gráficos, textos e seletores em uma narrativa gerencial.","topics":["Modelos e documentos analíticos","Gráficos, seletores, textos e imagens","Execução por empenho, subitem e natureza","Leitura crítica e apresentação dos resultados"],"duration":"Bloco 4"},
      {"title":"Dashboards para gestão orçamentária","description":"Construa painéis que ajudem a acompanhar a despesa e comunicar desvios de forma objetiva.","topics":["Dashboards em branco e modelos","Painéis, widgets e seletores","Restos a pagar processados e não processados","Visões para gestores, controle e equipes técnicas"],"duration":"Bloco 5"},
      {"title":"SIAFI, receitas e plano de aplicação","description":"Aplique consultas construídas a documentos e decisões da rotina financeira e orçamentária.","topics":["Documentos OB, NE, ND e NC","Atributos específicos e Report Wizard","Previsão e realização da receita pública","Plano de ação para uso na unidade administrativa"],"duration":"Bloco 6"}
    ]$$::jsonb,
    objetivos = $$[
      "Criar relatórios e consultas customizadas no Tesouro Gerencial",
      "Utilizar filtros, hierarquias, métricas e fórmulas com segurança",
      "Construir indicadores para acompanhamento da execução",
      "Montar documentos analíticos com tabelas e gráficos",
      "Desenvolver dashboards para comunicação gerencial",
      "Relacionar consultas do sistema à rotina da unidade administrativa"
    ]$$::jsonb,
    beneficios = $$[
      "Exercícios práticos com consultas e relatórios",
      "Roteiro de organização de filtros, métricas e dimensões",
      "Modelos de indicadores para acompanhamento da despesa",
      "Prática de dashboards e documentos analíticos",
      "Leitura orientada de documentos e informações do SIAFI",
      "Material de apoio e certificado conforme a turma"
    ]$$::jsonb,
    publico_alvo = $$[
      "Gestores e servidores públicos com conhecimento prévio do sistema",
      "Responsáveis por execução orçamentária e financeira",
      "Analistas de relatórios, planejamento e controle",
      "Equipes que precisam comunicar dados orçamentários para decisão"
    ]$$::jsonb,
    updated_at = now()
where c.slug = 'tesouro-gerencial-avancado-dashboards-relatorios-gestao-orcamentaria'
  and c.deleted_at is null
  and jsonb_array_length(c.ementa) <= 5;

-- Planilha de preço IN 05/2017
update public.curso as c
set descricao_curta = 'Curso de Planilha de Preço IN 05/2017 para elaborar, validar e julgar custos de serviços com dedicação exclusiva de mão de obra.',
    descricao = 'Curso de Planilha de Preço IN 05/2017 para equipes que elaboram, analisam e julgam propostas de contratação de serviços com dedicação exclusiva de mão de obra. O conteúdo detalha custos diretos e indiretos, encargos, benefícios, tributos, lucro, exequibilidade, diligência, repactuação e reequilíbrio, com exercícios de memorial de cálculo.',
    ementa = $$[
      {"title":"Base normativa e estrutura da planilha","description":"Entenda o papel da planilha no planejamento, no julgamento e na gestão do contrato.","topics":["IN 05/2017 e critérios de aceitabilidade","Relação entre ETP, termo de referência e planilha","Pesquisa de preços e referência de mercado","Riscos de sobrepreço e inexequibilidade"],"duration":"Bloco 1"},
      {"title":"Mão de obra e remuneração","description":"Monte o bloco de mão de obra com premissas verificáveis e coerentes com a contratação.","topics":["Salário, adicionais e benefícios","CCT, ACT, dissídio e vigência","Jornada, composição e substituições","Encargos previdenciários e FGTS"],"duration":"Bloco 2"},
      {"title":"Encargos, benefícios e provisões","description":"Analise os componentes que impactam o custo mensal e a provisão de direitos trabalhistas.","topics":["Férias, adicional de férias e 13º salário","Aviso-prévio e rescisão","Custos de reposição e ausências","Memorial de cálculo e premissas"],"duration":"Bloco 3"},
      {"title":"Insumos, equipamentos e custos indiretos","description":"Complete a planilha com itens necessários à execução e avalie sua pertinência ao objeto.","topics":["Materiais, uniformes e equipamentos","Administração local e custos operacionais","Despesas administrativas e seguro","Coerência com o termo de referência"],"duration":"Bloco 4"},
      {"title":"Tributos, lucro e formação do preço","description":"Feche o preço e teste cenários para identificar inconsistências antes do julgamento.","topics":["Tributos incidentes e base de cálculo","Taxa de administração, lucro e BDI quando aplicável","Composição do preço mensal e global","Testes de sensibilidade e conferência"],"duration":"Bloco 5"},
      {"title":"Julgamento e gestão contratual","description":"Aplique critérios de análise e acompanhe alterações econômicas durante a execução.","topics":["Conformidade, diligência e exequibilidade","Saneamento de falhas e documentação da decisão","Repactuação, reajuste e reequilíbrio","Oficina com análise de proposta e parecer"],"duration":"Bloco 6"}
    ]$$::jsonb,
    objetivos = $$[
      "Montar um memorial de cálculo claro e defensável",
      "Conferir salários, benefícios, encargos e provisões",
      "Analisar custos indiretos, tributos e margem de lucro",
      "Avaliar exequibilidade e inconsistências de propostas",
      "Documentar diligências e decisões de julgamento",
      "Analisar repactuação, reajuste e reequilíbrio contratual"
    ]$$::jsonb,
    beneficios = $$[
      "Oficinas com planilhas e memoriais de cálculo",
      "Exemplos de premissas e pontos de conferência",
      "Roteiro para análise de exequibilidade e diligência",
      "Visão integrada entre planejamento, licitação e contrato",
      "Prática de repactuação e alterações de custos",
      "Material didático e certificado conforme a turma"
    ]$$::jsonb,
    publico_alvo = $$[
      "Agentes de contratação, pregoeiros e comissões de licitação",
      "Equipes de ETP, termo de referência, gestão e fiscalização",
      "Controle interno, jurídico e áreas requisitantes",
      "Empresas e profissionais que elaboram ou analisam propostas"
    ]$$::jsonb,
    updated_at = now()
where c.slug = 'elaborar-julgar-planilha-preco-in-05-2017'
  and c.deleted_at is null
  and jsonb_array_length(c.ementa) <= 5;

-- Relações interpessoais, feedback e mediação de conflitos
update public.curso as c
set descricao_curta = 'Curso de Relações Interpessoais, Feedback e Mediação de Conflitos para fortalecer comunicação, cooperação e liderança.',
    descricao = 'Curso de Relações Interpessoais, Feedback e Mediação de Conflitos para desenvolver comunicação assertiva, escuta ativa e acordos de convivência no trabalho. As atividades conectam inteligência emocional, perfis comunicacionais, feedback, negociação e mediação a situações reais de equipes, liderança e atendimento.',
    ementa = $$[
      {"title":"Autoconhecimento e inteligência emocional","description":"Reconheça padrões de comportamento e emoções que influenciam relações, decisões e conversas difíceis.","topics":["Autopercepção e autorregulação","Inteligência emocional aplicada à liderança","Valores, limites e responsabilidade relacional","Gatilhos e respostas em situações de pressão"],"duration":"Bloco 1"},
      {"title":"Escuta ativa e empatia","description":"Pratique a escuta que reduz ruídos e cria condições para compreender necessidades e perspectivas.","topics":["Escuta ativa e perguntas abertas","Empatia sem concordância automática","Comunicação não violenta e observação","Paráfrase, validação e confirmação de entendimento"],"duration":"Bloco 2"},
      {"title":"Comunicação assertiva","description":"Adapte a comunicação a diferentes perfis sem abrir mão de clareza, respeito e responsabilidade.","topics":["Assertividade, passividade e agressividade","Comunicação verbal e não verbal","Perfis comunicacionais e adaptação da mensagem","Role-playing de conversas profissionais"],"duration":"Bloco 3"},
      {"title":"Feedback e feedforward","description":"Transforme feedback em uma conversa objetiva sobre comportamento, impacto e próximos passos.","topics":["Feedback construtivo e orientado a soluções","Momento, contexto e linguagem do feedback","Situações delicadas, resistência e acolhimento","Feedforward e plano de desenvolvimento"],"duration":"Bloco 4"},
      {"title":"Mediação e negociação de conflitos","description":"Estruture conversas de mediação para sair da personalização do conflito e buscar acordos possíveis.","topics":["Conflito de tarefa, processo e relacionamento","Interesses, posições e necessidades","Etapas de uma conversa de mediação","Acordos, responsabilidades e acompanhamento"],"duration":"Bloco 5"},
      {"title":"Cultura de colaboração","description":"Leve as ferramentas para a rotina e crie combinados que sustentem relações profissionais mais saudáveis.","topics":["Papel da liderança na confiança da equipe","Rituais de alinhamento e acompanhamento","Indicadores comportamentais e percepção do clima","Plano de ação individual e coletivo"],"duration":"Bloco 6"}
    ]$$::jsonb,
    objetivos = $$[
      "Fortalecer relações profissionais baseadas em respeito e clareza",
      "Aplicar escuta ativa e comunicação assertiva",
      "Oferecer feedback com foco em comportamento e desenvolvimento",
      "Conduzir conversas difíceis com mais segurança",
      "Utilizar técnicas de mediação e negociação de conflitos",
      "Construir um plano de ação para a rotina da equipe"
    ]$$::jsonb,
    beneficios = $$[
      "Dinâmicas, role-playing e simulações de conversas",
      "Estudos de caso sobre liderança e trabalho em equipe",
      "Roteiros para feedback, escuta e mediação",
      "Ferramentas para lidar com resistência e tensão",
      "Plano de ação individual e coletivo",
      "Material didático e certificado conforme a turma"
    ]$$::jsonb,
    publico_alvo = $$[
      "Gestores e líderes de equipes",
      "Profissionais de RH e coordenadores",
      "Servidores e profissionais que atuam em equipes multidisciplinares",
      "Pessoas interessadas em comunicação e desenvolvimento no trabalho"
    ]$$::jsonb,
    updated_at = now()
where c.slug = 'relacoes-interpessoais-feedback-mediacao-conflitos'
  and c.deleted_at is null
  and jsonb_array_length(c.ementa) <= 5;

-- Densifica a camada editorial pública sem apagar uma edição já mais completa.
with editorial(slug, hero_subtitle, highlights, faq_items) as (
  values
    (
      'interpretacao-requisitos-iso-iec-20000-1',
      'Interprete os requisitos da ISO/IEC 20000-1 e relacione a norma aos processos, serviços, evidências e oportunidades de melhoria da sua organização.',
      $$[
        {"title":"Interpretar os requisitos da norma","description":"Relacione contexto, liderança, planejamento, operação, avaliação e melhoria ao sistema de gestão de serviços."},
        {"title":"Mapear serviços e processos","description":"Identifique entradas, responsabilidades, controles e evidências ao longo do ciclo de vida do serviço."},
        {"title":"Avaliar lacunas","description":"Compare a prática atual com os requisitos e priorize oportunidades de melhoria de forma objetiva."},
        {"title":"Acompanhar desempenho","description":"Defina indicadores e registros para monitorar níveis de serviço, resultados e conformidade."},
        {"title":"Preparar evidências","description":"Organize documentos, registros e critérios que apoiem auditorias internas e análises críticas."},
        {"title":"Integrar governança e operação","description":"Conecte gestão de serviços, fornecedores, continuidade, segurança e melhoria contínua."}
      ]$$::jsonb,
      $$[
        {"question":"É necessário conhecer a ISO/IEC 20000-1 antes do curso?","answer":"Não é obrigatório conhecer todos os requisitos. O conteúdo parte dos fundamentos e avança para interpretação, aplicação e avaliação de evidências."},
        {"question":"O curso aborda a ISO/IEC 20000-1:2018?","answer":"Sim. A programação utiliza a edição ISO/IEC 20000-1:2018 como referência para interpretar requisitos de gestão de serviços de TI."},
        {"question":"Vou aprender a fazer uma auditoria completa?","answer":"O curso apresenta critérios, evidências, lacunas e melhoria contínua para apoiar auditorias e avaliações internas. A auditoria formal depende do escopo e da organização."},
        {"question":"Quem pode fazer o curso?","answer":"Profissionais de TI, Service Desk, governança, processos, qualidade, compliance e auditoria podem aplicar o conteúdo em suas rotinas."},
        {"question":"Recebo certificado?","answer":"Sim. O certificado segue a carga horária e as regras da turma escolhida."},
        {"question":"Há aplicação prática?","answer":"Sim. A abordagem usa exemplos, estudos de caso e roteiros para relacionar os requisitos a processos e serviços reais."}
      ]$$::jsonb
    ),
    (
      'redacao-oficial-documentos-tecnicos-alteracoes-recentes',
      'Aprenda a escrever ofícios, relatórios, pareceres, notas técnicas e comunicações institucionais com clareza, precisão e foco no leitor.',
      $$[
        {"title":"Escrever com clareza e objetividade","description":"Organize ideias, reduza ambiguidades e entregue mensagens mais fáceis de compreender."},
        {"title":"Aplicar linguagem simples","description":"Simplifique textos sem perder precisão técnica, formalidade ou segurança institucional."},
        {"title":"Estruturar documentos oficiais","description":"Use modelos e critérios para ofícios, circulares, e-mails, relatórios e comunicações no SEI."},
        {"title":"Produzir documentos técnicos","description":"Apresente contexto, análise, evidências, conclusão e encaminhamento em uma sequência lógica."},
        {"title":"Argumentar com segurança","description":"Construa recomendações e respostas técnicas sustentadas por dados, referências e propósito."},
        {"title":"Revisar e padronizar","description":"Aplique uma lista de verificação para gramática, consistência, forma e adequação ao público."}
      ]$$::jsonb,
      $$[
        {"question":"O curso é apenas sobre gramática?","answer":"Não. A gramática é uma parte do programa. O foco também está em clareza, estrutura, linguagem simples, documentos técnicos, argumentação e revisão."},
        {"question":"Quais documentos são trabalhados?","answer":"A programação inclui ofícios, circulares, e-mails institucionais, relatórios, pareceres, notas técnicas e outros documentos usados na rotina administrativa."},
        {"question":"O conteúdo serve para órgãos públicos e empresas?","answer":"Sim. Os princípios de clareza, objetividade, padronização e revisão podem ser aplicados em comunicações públicas, corporativas e técnicas."},
        {"question":"Há exercícios de reescrita?","answer":"Sim. A abordagem prevê prática guiada para identificar ambiguidades, melhorar a estrutura e adaptar o texto ao destinatário."},
        {"question":"Recebo certificado?","answer":"Sim. O certificado segue a carga horária e as regras da turma escolhida."},
        {"question":"Preciso levar um texto para revisar?","answer":"Não é obrigatório, mas exemplos reais da rotina podem ajudar a aproveitar as orientações durante os exercícios."}
      ]$$::jsonb
    ),
    (
      'tesouro-gerencial-avancado-dashboards-relatorios-gestao-orcamentaria',
      'Crie consultas, métricas, documentos analíticos e dashboards no Tesouro Gerencial para acompanhar a execução orçamentária com mais clareza.',
      $$[
        {"title":"Construir consultas customizadas","description":"Combine filtros, hierarquias, atributos e métricas para responder perguntas da unidade administrativa."},
        {"title":"Criar métricas e indicadores","description":"Use fórmulas e critérios de análise para transformar dados de execução em indicadores úteis."},
        {"title":"Montar relatórios gerenciais","description":"Organize relatórios reutilizáveis para acompanhamento de despesas, receitas e documentos."},
        {"title":"Produzir documentos analíticos","description":"Integre tabelas, gráficos, textos, imagens e seletores em uma apresentação gerencial."},
        {"title":"Desenvolver dashboards","description":"Crie painéis para comunicar evolução, desvios, restos a pagar e pontos de atenção."},
        {"title":"Aplicar à rotina orçamentária","description":"Relacione consultas e documentos do SIAFI às decisões, controles e acompanhamentos da equipe."}
      ]$$::jsonb,
      $$[
        {"question":"Preciso ter conhecimento básico do Tesouro Gerencial?","answer":"Sim. O curso é avançado e aproveita conhecimentos prévios de navegação e consulta no sistema."},
        {"question":"O curso aborda dashboards?","answer":"Sim. A programação inclui painéis, widgets, seletores e critérios para comunicar dados de execução orçamentária."},
        {"question":"Quais documentos do SIAFI são considerados?","answer":"A programação trabalha consultas e análises que podem envolver documentos como OB, NE, ND e NC, conforme o escopo da turma."},
        {"question":"Vou aprender a criar relatórios para minha unidade?","answer":"Sim. Os exercícios conectam filtros, métricas e dimensões às perguntas de análise da rotina administrativa."},
        {"question":"Recebo certificado?","answer":"Sim. O certificado segue a carga horária e as regras da turma escolhida."},
        {"question":"Posso fazer o curso online?","answer":"A modalidade depende da turma disponível. Consulte a agenda para verificar as opções presenciais e online."}
      ]$$::jsonb
    ),
    (
      'elaborar-julgar-planilha-preco-in-05-2017',
      'Aprenda a montar e analisar planilhas de custos e formação de preços para serviços com dedicação exclusiva de mão de obra.',
      $$[
        {"title":"Estruturar a planilha de custos","description":"Organize mão de obra, encargos, benefícios, insumos, tributos, custos indiretos e lucro."},
        {"title":"Documentar premissas","description":"Registre fontes, critérios e memórias de cálculo para tornar a análise verificável."},
        {"title":"Avaliar propostas","description":"Identifique inconsistências, riscos, omissões e sinais de inexequibilidade."},
        {"title":"Conduzir diligências","description":"Separe falhas sanáveis de problemas que afetam a proposta e documente o julgamento."},
        {"title":"Analisar alterações contratuais","description":"Acompanhe repactuação, reajuste, reequilíbrio e impactos na composição de custos."},
        {"title":"Aplicar em casos práticos","description":"Use planilhas e exercícios para conectar planejamento, licitação e gestão contratual."}
      ]$$::jsonb,
      $$[
        {"question":"O curso aborda serviços com dedicação exclusiva de mão de obra?","answer":"Sim. A programação é direcionada à elaboração e análise de planilhas para esse tipo de contratação, conforme o escopo da turma."},
        {"question":"Vou aprender a julgar uma planilha de preços?","answer":"Sim. O curso trabalha conferência de premissas, custos, exequibilidade, diligência e documentação da decisão."},
        {"question":"A repactuação está incluída?","answer":"Sim. O programa aborda repactuação, reajuste e reequilíbrio, relacionando cada análise à composição de custos e ao contrato."},
        {"question":"O curso serve para empresas e órgãos públicos?","answer":"Sim. O conteúdo atende equipes públicas que analisam propostas e profissionais de empresas que elaboram ou revisam planilhas."},
        {"question":"Recebo certificado?","answer":"Sim. O certificado segue a carga horária e as regras da turma escolhida."},
        {"question":"Há exercícios com planilhas?","answer":"Sim. A proposta inclui oficinas e exemplos de memorial de cálculo para tornar a análise mais prática."}
      ]$$::jsonb
    ),
    (
      'relacoes-interpessoais-feedback-mediacao-conflitos',
      'Desenvolva comunicação assertiva, escuta ativa, feedback e mediação para fortalecer relações e colaboração no trabalho.',
      $$[
        {"title":"Reconhecer padrões de comportamento","description":"Observe emoções, gatilhos e respostas que influenciam conversas, decisões e relações profissionais."},
        {"title":"Praticar escuta ativa","description":"Use perguntas, validação e confirmação de entendimento para reduzir ruídos e ampliar a confiança."},
        {"title":"Comunicar com assertividade","description":"Adapte a mensagem a diferentes perfis sem abrir mão de clareza, respeito e responsabilidade."},
        {"title":"Dar e receber feedback","description":"Conduza conversas sobre comportamentos, impactos, expectativas e próximos passos."},
        {"title":"Mediar conflitos","description":"Separe posições de interesses e facilite acordos possíveis em situações de tensão."},
        {"title":"Criar uma cultura colaborativa","description":"Leve as ferramentas para rituais de equipe, liderança, acompanhamento e desenvolvimento."}
      ]$$::jsonb,
      $$[
        {"question":"O curso é indicado para líderes?","answer":"Sim. Líderes, gestores, profissionais de RH, coordenadores e integrantes de equipes podem aplicar as ferramentas."},
        {"question":"Feedback e mediação são trabalhados com prática?","answer":"Sim. A programação inclui dinâmicas, role-playing, estudos de caso e simulações de conversas profissionais."},
        {"question":"O curso ensina a resolver qualquer conflito?","answer":"Ele oferece técnicas para compreender, conversar e construir acordos. A solução depende das pessoas, do contexto e das políticas da organização."},
        {"question":"Preciso ter cargo de liderança?","answer":"Não. As competências de escuta, comunicação e feedback são úteis para profissionais em diferentes funções e níveis."},
        {"question":"Recebo certificado?","answer":"Sim. O certificado segue a carga horária e as regras da turma escolhida."},
        {"question":"Há um plano de ação ao final?","answer":"Sim. A proposta inclui a definição de ações individuais e coletivas para levar os aprendizados à rotina."}
      ]$$::jsonb
    )
)
insert into public.curso_public_content (
  curso_id,
  hero_subtitle,
  highlights,
  faq_items,
  published
)
select c.id, e.hero_subtitle, e.highlights, e.faq_items, true
from editorial e
join public.curso c on c.slug = e.slug and c.deleted_at is null
on conflict (curso_id) do update
set hero_subtitle = case
      when public.curso_public_content.hero_subtitle is null
        or length(public.curso_public_content.hero_subtitle) < 180
      then excluded.hero_subtitle
      else public.curso_public_content.hero_subtitle
    end,
    highlights = case
      when jsonb_array_length(coalesce(public.curso_public_content.highlights, '[]'::jsonb)) < 6
      then excluded.highlights
      else public.curso_public_content.highlights
    end,
    faq_items = case
      when jsonb_array_length(coalesce(public.curso_public_content.faq_items, '[]'::jsonb)) < 5
      then excluded.faq_items
      else public.curso_public_content.faq_items
    end,
    updated_at = now();
