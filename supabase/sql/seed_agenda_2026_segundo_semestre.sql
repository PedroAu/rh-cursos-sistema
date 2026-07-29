-- RH Cursos & Soluções — agenda oficial do 2º semestre de 2026
-- Fonte da agenda: Dropbox/RH CURSOS/Agenda de Cursos/2026/
--   "Calendário de Cursos 2026_ 2º semestre.docx" (agenda geral/público).
-- Conteúdo: documentos correspondentes em Dropbox/RH CURSOS/Cursos/.
--
-- Escopo: turmas de 05/08/2026 a 18/12/2026 (21 turmas, 14 cursos).
-- A agenda não informa capacidade; vagas_total permanece 0 para impedir
-- inscrições acidentais. Ajuste vagas_total/preenchidas no painel antes de
-- publicar cada turma.
--
-- A versão "area privada" possui preços e uma grade de setembro diferentes;
-- ela não foi misturada a este seed. O curso de IA na execução orçamentária
-- aparece na agenda, mas não possui ementa específica na pasta Cursos; por
-- isso suas listas de conteúdo ficam vazias e a pendência fica documentada.

begin;

-- -------------------------------------------------------------------------
-- Trilhas referenciadas pelos cursos (upsert para o seed ser autocontido)
-- -------------------------------------------------------------------------
insert into public.trilha
  (id, codigo, nome, nome_curto, slug, descricao, icone, ordem, ativa)
values
  ('path-dp', 'T01', 'Departamento Pessoal, Folha de Pagamento & eSocial', 'DP, Folha & eSocial', 'departamento-pessoal-folha-de-pagamento-esocial', 'Capacitação completa do DP público, da legislação trabalhista à conformidade digital com eSocial, FGTS Digital e LGPD.', 'Calculator', 1, true),
  ('path-licitacoes', 'T02', 'Licitações, Compras Públicas & Contratos Administrativos', 'Licitações & Contratos', 'licitacoes-compras-publicas-contratos-administrativos', 'Da legislação básica à fiscalização avançada de contratos, com cobertura da Lei nº 14.133/2021 e melhores práticas de contratação pública.', 'Scale', 2, true),
  ('path-pessoas', 'T03', 'Gestão de Pessoas, Liderança & Desenvolvimento Humano', 'Pessoas & Liderança', 'gestao-de-pessoas-lideranca-desenvolvimento-humano', 'Formação humanizada para líderes e equipes, com inteligência emocional, cultura organizacional, saúde mental e gestão por resultados.', 'Users', 3, true),
  ('path-comunicacao', 'T04', 'Comunicação Institucional, Redação & Atendimento ao Cidadão', 'Comunicação & Atendimento', 'comunicacao-institucional-redacao-atendimento-ao-cidadao', 'Comunicação clara e eficiente, do atendimento ao cidadão à redação oficial, oratória, mídias digitais e conformidade com LAI/LGPD.', 'MessageSquareText', 4, true),
  ('path-auditoria', 'T05', 'Auditoria, Contabilidade Pública & Gestão Tributária', 'Auditoria & Tributária', 'auditoria-contabilidade-publica-gestao-tributaria', 'Domínio técnico em contabilidade pública, obrigações acessórias, Tesouro Gerencial, SIAFI e auditoria governamental.', 'ClipboardCheck', 5, true),
  ('path-tech', 'T06', 'Tecnologia, Dados, Processos & Inovação', 'Tecnologia & Inovação', 'tecnologia-dados-processos-inovacao', 'Ferramentas digitais, análise de dados, modelagem de processos, inteligência artificial e governança para transformação digital.', 'BarChart3', 6, true)
on conflict (id) do update set
  codigo = excluded.codigo,
  nome = excluded.nome,
  nome_curto = excluded.nome_curto,
  slug = excluded.slug,
  descricao = excluded.descricao,
  icone = excluded.icone,
  ordem = excluded.ordem,
  ativa = excluded.ativa;

-- -------------------------------------------------------------------------
-- Instrutores identificados na agenda e nos materiais dos cursos
-- -------------------------------------------------------------------------
insert into public.instrutor
  (id, nome, email, bio, formacao, especialidade, status, deleted_at)
values
  (
    'inst-2026-jose-carlos',
    'José Carlos Fontão Giudice',
    null,
    'Professor e consultor com mais de 52 anos de atuação em Recursos Humanos, Administração de Pessoal, folha, previdência e auditoria trabalhista.',
    'Mestrando em Psicologia Organizacional; pós-graduado em Administração de Recursos Humanos; graduado em Administração; contabilista.',
    'Administração de pessoal, folha de pagamento e auditoria',
    'Ativo',
    null
  ),
  (
    'inst-2026-ester-lima',
    'Ester Lima',
    'ester@rhcursos.com.br',
    'Advogada, consultora e diretora da RH Cursos & Soluções, com mais de 26 anos em Direito Trabalhista, Previdenciário, eSocial e capacitação de órgãos públicos.',
    'Advogada com especialização em Direito Empresarial, Trabalhista e Previdenciário.',
    'eSocial, departamento pessoal e legislação trabalhista',
    'Ativo',
    null
  ),
  (
    'inst-2026-suely-cobucci',
    'Suely Cobucci',
    null,
    'Educadora empresarial, consultora e palestrante em Recursos Humanos, liderança, comunicação e redação oficial.',
    'Mestrados em Liderança e Recursos Humanos; pós-graduações em Didática do Ensino Superior e Psicopedagogia; licenciada em Letras.',
    'Redação oficial, comunicação, liderança e desenvolvimento humano',
    'Ativo',
    null
  ),
  (
    'inst-2026-daniel-tavares',
    'Daniel Tavares',
    null,
    'Instrutor indicado na agenda 2026 para a atualização tributária aplicada às contratações públicas.',
    null,
    'Reforma tributária e contratações públicas',
    'Ativo',
    null
  ),
  (
    'inst-2026-israel-oliveira',
    'Israel Antônio de Oliveira',
    null,
    'Contador, consultor e instrutor com experiência em contabilidade, tributação, retenções na fonte e planejamento empresarial.',
    'Bacharel em Ciências Contábeis; pós-graduado em Controladoria.',
    'Retenções tributárias, INSS, IRRF, ISS e reforma tributária',
    'Ativo',
    null
  ),
  (
    'inst-2026-welligton-monaco',
    'Wellington Antônio Monaco',
    null,
    'Especialista em governança, privacidade, proteção de dados, segurança da informação e sistemas de gestão.',
    'Bacharel em Administração e Análise de Sistemas; pós-graduado em Gestão de Projetos; MBA em Sistemas de Gestão.',
    'ISO/IEC 20000-1, governança de TI e privacidade',
    'Ativo',
    null
  ),
  (
    'inst-2026-luiz-fernando',
    'Luiz Fernando Pereira',
    null,
    'Instrutor indicado na agenda 2026 para planejamento e fiscalização de contratações públicas.',
    null,
    'Planejamento da contratação e gestão de riscos',
    'Ativo',
    null
  ),
  (
    'inst-2026-jose-airton',
    'José Airton Lacerda de Jesus',
    null,
    'Servidor público federal e instrutor de Tesouro Gerencial, SIAFI, orçamento e administração financeira.',
    'Pós-graduado em Administração Orçamentária e Financeira; servidor da Secretaria do Tesouro Nacional.',
    'Tesouro Gerencial, execução orçamentária e dashboards',
    'Ativo',
    null
  ),
  (
    'inst-2026-corpo-docente',
    'Corpo Docente RH Cursos',
    null,
    'Equipe docente da RH Cursos, utilizada na agenda quando o treinamento é conduzido por mais de um especialista.',
    null,
    'Contratações públicas, planilhas de custos e formação de preços',
    'Ativo',
    null
  )
on conflict (id) do update set
  nome = excluded.nome,
  email = excluded.email,
  bio = excluded.bio,
  formacao = excluded.formacao,
  especialidade = excluded.especialidade,
  status = excluded.status,
  deleted_at = null;

-- -------------------------------------------------------------------------
-- Cursos: ementas resumidas dos documentos encontrados no Dropbox
-- -------------------------------------------------------------------------
insert into public.curso
  (id, titulo, slug, descricao_curta, descricao, ementa, objetivos,
   beneficios, publico_alvo, carga_horaria, modalidade, nivel, categoria,
   trilha_id, trilha_nome, preco_base, status, destaque, imagem_capa,
   deleted_at)
values
  (
    'course-2026-rotinas-adm-pessoal',
    'Formação de Especialista em Rotinas e Administração de Pessoal',
    'formacao-especialista-rotinas-administracao-pessoal',
    'Rotinas de pessoal, folha, encargos, eSocial e auditoria aplicadas à prática.',
    'Formação técnica e prática para verificar jornada, férias, 13º, rescisões, folha de pagamento, encargos e obrigações acessórias.',
    '[{"title":"Jornada, ponto e contratos","description":"Verificação das regras de jornada e dos controles de frequência.","topics":["Duração e prorrogação da jornada","Intervalos, DSR e trabalho noturno","Registro eletrônico, ponto por exceção e contratos intermitentes"],"duration":"4h"},{"title":"Férias, 13º salário e rescisão","description":"Conferência dos direitos, prazos e cálculos das principais verbas trabalhistas.","topics":["Períodos aquisitivo e concessivo","Parcelamento e férias coletivas","Aviso prévio, modalidades de rescisão e prazos"],"duration":"4h"},{"title":"Folha, rubricas e encargos","description":"Metodologia para revisar a folha e as incidências legais.","topics":["Salário, horas extras e adicionais","INSS, IRRF e FGTS Digital","Bases de cálculo, descontos e totalizadores"],"duration":"4h"},{"title":"eSocial, DCTFWeb e riscos","description":"Integração das obrigações e mapeamento de riscos da folha.","topics":["Eventos e relatórios do eSocial","DCTFWeb e DARF previdenciário","Mapa de riscos e procedimentos de revisão"],"duration":"4h"}]'::jsonb,
    '["Executar e revisar as principais rotinas de Administração de Pessoal","Identificar inconsistências e riscos em folha","Aplicar metodologia de conferência com estudos de caso"]'::jsonb,
    '["Material didático","Certificado","Aplicação teórico-prática"]'::jsonb,
    '["Profissionais de RH e DP","Analistas, supervisores e contabilistas","Gestores que revisam rotinas trabalhistas"]'::jsonb,
    16, 'Online', 'Intermediario', 'Departamento Pessoal', 'path-dp',
    'Departamento Pessoal, Folha de Pagamento & eSocial', 1990.90, 'Ativo', false,
    '/images/courses/departamento-pessoal-esocial.jpg', null
  ),
  (
    'course-2026-esocial-s13-publico',
    'Curso Prático de Atualização do eSocial: Novo Leiaute 1.3 para Órgãos Públicos',
    'curso-pratico-atualizacao-esocial-novo-leiaute-1-3-orgaos-publicos',
    'Atualização operacional do eSocial S-1.3 para RH, folha e conformidade pública.',
    'Capacitação teórico-prática para parametrizar tabelas, validar eventos, corrigir rejeições e integrar eSocial, folha e obrigações acessórias.',
    '[{"title":"Introdução e legislação do eSocial","description":"Contexto, finalidade, legislação e segurança de acesso para órgãos públicos.","topics":["Decreto 8.373/2014 e Portaria Conjunta 13/2024","Certificado digital e procuração eletrônica","Responsabilidades de RH, folha, contabilidade e TI"],"duration":"4h"},{"title":"Leiaute S-1.3 e eventos","description":"Principais alterações do leiaute e impactos nas rotinas públicas.","topics":["Novos campos, grupos e tabelas","Eventos S-1000 a S-5011","Substituição da DIRF e totalizadores"],"duration":"6h"},{"title":"Cadastro, folha e afastamentos","description":"Qualificação dos trabalhadores e transmissão de eventos periódicos.","topics":["Servidores, comissionados e estagiários","S-1200, S-1202, S-1207 e S-1210","Afastamentos, benefícios e salário-maternidade"],"duration":"6h"},{"title":"Integração e correção","description":"Conferência, retificação e tratamento de inconsistências.","topics":["Integração com folha e DCTFWeb","Retificação, exclusão e reabertura","Regras de validação e penalidades"],"duration":"4h"},{"title":"Oficina prática","description":"Demonstração de cenários reais e checklist de conformidade.","topics":["Consulta de eventos enviados e rejeitados","Saneamento de erros cadastrais e periódicos","Checklist mensal do órgão público"],"duration":"4h"}]'::jsonb,
    '["Mapear as mudanças do S-1.3","Diagnosticar e corrigir inconsistências","Enviar e conferir eventos de órgãos públicos com segurança"]'::jsonb,
    '["Apostila e material de apoio","Certificado","Demonstração prática do sistema"]'::jsonb,
    '["Profissionais de DP, RH, folha e contabilidade","Analistas de sistemas e compliance","Gestores de riscos trabalhistas, previdenciários e fiscais"]'::jsonb,
    24, 'Presencial', 'Avancado', 'eSocial', 'path-dp',
    'Departamento Pessoal, Folha de Pagamento & eSocial', 2990.90, 'Ativo', true,
    '/images/courses/departamento-pessoal-esocial.jpg', null
  ),
  (
    'course-2026-planejamento-contratacao',
    'Planejamento da Contratação: ETP, TR, Matriz de Riscos e Plano de Fiscalização',
    'planejamento-contratacao-etp-tr-matriz-riscos-fiscalizacao',
    'Do PCA ao plano de fiscalização, com documentos executáveis e uso responsável de IA.',
    'Curso prático para estruturar demanda, ETP, análise de riscos, termo de referência e plano de fiscalização, com validação humana no uso de IA.',
    '[{"title":"Fundamentos, PCA e resultados","description":"Encadeamento dos artefatos e organização do dossiê de planejamento.","topics":["Necessidade, objetivos e escopo","Previsão no PCA","Papéis, versões, evidências e checklists"],"duration":"4h"},{"title":"Estudo Técnico Preliminar","description":"Construção de ETP coerente, objetivo e fundamentado.","topics":["Requisitos e quantidades","Pesquisa de mercado e estimativa de valor","Parcelamento, impactos e conclusão"],"duration":"5h"},{"title":"Análise e matriz de riscos","description":"Identificação, tratamento e monitoramento dos riscos da contratação.","topics":["Causa, evento, consequência e criticidade","Responsáveis, gatilhos e evidências","Integração entre riscos, TR e fiscalização"],"duration":"5h"},{"title":"Termo de Referência","description":"Elaboração de TR executável e mensurável.","topics":["Objeto e solução","Execução, gestão, medição e pagamento","Seleção do fornecedor e adequação orçamentária"],"duration":"5h"},{"title":"Fiscalização e IA aplicada","description":"Rotinas de fiscalização e uso responsável de IA com validação humana.","topics":["Checklists, aceite e não conformidades","Revisão de consistência entre ETP, TR e riscos","Proteção de dados, logs e controle de versões"],"duration":"5h"}]'::jsonb,
    '["Elaborar ETP e TR consistentes","Construir matriz de riscos com responsáveis e evidências","Criar checklists de fiscalização e revisar documentos com IA de forma segura"]'::jsonb,
    '["Oficinas práticas","Material didático","Certificado"]'::jsonb,
    '["Agentes de contratação e pregoeiros","Gestores, fiscais e áreas demandantes","Jurídico, auditoria e controle interno"]'::jsonb,
    24, 'Presencial', 'Avancado', 'Licitações e Contratos', 'path-licitacoes',
    'Licitações, Compras Públicas & Contratos Administrativos', 2990.90, 'Ativo', false,
    '/images/courses/licitacoes-contratos.jpg', null
  ),
  (
    'course-2026-relacoes-feedback',
    'Relações Interpessoais, Feedback e Mediação de Conflitos',
    'relacoes-interpessoais-feedback-mediacao-conflitos',
    'Comunicação, feedback e relacionamento para equipes mais colaborativas.',
    'Capacitação baseada em comunicação assertiva, escuta, feedback e mediação de conflitos no ambiente de trabalho.',
    '[{"title":"Habilidades interpessoais","description":"Autoconhecimento, empatia e confiança para relações profissionais produtivas.","topics":["Inteligência emocional aplicada à liderança","Escuta ativa e empatia","Gestão de conflitos e cooperação"],"duration":"4h"},{"title":"Comunicação assertiva","description":"Comunicação adaptativa para diferentes perfis e contextos.","topics":["Persuasão e influência ética","Comunicação não verbal","Role-playing e perfis comunicacionais"],"duration":"4h"},{"title":"Técnicas de feedback","description":"Feedback como ferramenta de desenvolvimento e responsabilidade.","topics":["Feedback construtivo, feedforward e orientado a soluções","Situações delicadas e resistência","Simulações de feedback positivo e corretivo"],"duration":"4h"},{"title":"Cultura de colaboração","description":"Implantação de uma cultura contínua de feedback e desenvolvimento.","topics":["Papel da liderança","Monitoramento do desenvolvimento interpessoal","Plano de ação personalizado"],"duration":"4h"}]'::jsonb,
    '["Fortalecer relações profissionais","Aplicar técnicas de feedback em situações delicadas","Transformar conflitos em oportunidades de desenvolvimento"]'::jsonb,
    '["Dinâmicas e role-playing","Estudos de caso","Material didático e certificado"]'::jsonb,
    '["Gestores e líderes de equipes","Profissionais de RH e coordenadores","Pessoas interessadas em comunicação no trabalho"]'::jsonb,
    16, 'Presencial', 'Intermediario', 'Pessoas e Liderança', 'path-pessoas',
    'Gestão de Pessoas, Liderança & Desenvolvimento Humano', 1990.90, 'Ativo', false,
    '/images/courses/pessoas-lideranca.jpg', null
  ),
  (
    'course-2026-iso-20000',
    'Interpretação dos Requisitos da Norma ISO/IEC 20000-1',
    'interpretacao-requisitos-iso-iec-20000-1',
    'Interpretação prática dos requisitos para gestão de serviços de TI.',
    'Curso para identificar requisitos, analisar lacunas e apoiar a implementação e melhoria de um sistema de gestão de serviços de TI.',
    '[{"title":"Contexto, termos e liderança","description":"Fundamentos da ISO/IEC 20000-1:2018 e do sistema de gestão de serviços.","topics":["Histórico, finalidade e estrutura HLS","Termos e definições","Contexto, partes interessadas, política e responsabilidades"],"duration":"4h"},{"title":"Planejamento e suporte","description":"Requisitos para planejar, prover recursos e documentar o SGSTI.","topics":["Riscos, oportunidades e objetivos","Recursos, competência e conscientização","Comunicação e informação documentada"],"duration":"4h"},{"title":"Operação e fornecedores","description":"Controles operacionais e processos do ciclo de vida dos serviços.","topics":["Incidentes, mudanças e níveis de serviço","Continuidade e gestão de fornecedores","Planejamento e controle operacional"],"duration":"4h"},{"title":"Avaliação, melhoria e integração","description":"Medição, auditoria e melhoria contínua do sistema.","topics":["Monitoramento e análise crítica","Não conformidade e ação corretiva","Integração com ISO 9001 e ISO/IEC 27001"],"duration":"4h"}]'::jsonb,
    '["Interpretar requisitos da ISO/IEC 20000-1:2018","Identificar lacunas e oportunidades de melhoria","Relacionar requisitos a processos reais de serviços de TI"]'::jsonb,
    '["Estudos de caso","Material didático","Certificado"]'::jsonb,
    '["Profissionais e gestores de TI","Service Desk e suporte","Qualidade, compliance, governança, processos e auditoria"]'::jsonb,
    16, 'Online', 'Avancado', 'Tecnologia e Inovação', 'path-tech',
    'Tecnologia, Dados, Processos & Inovação', 1990.90, 'Ativo', false,
    '/images/courses/tecnologia-inovacao.jpg', null
  ),
  (
    'course-2026-auditoria-folha',
    'Auditoria da Folha de Pagamento',
    'auditoria-da-folha-de-pagamento',
    'Auditoria de jornada, rubricas, encargos e riscos na folha de pagamento.',
    'Aplicação de legislação trabalhista, previdenciária e tributária para identificar inconsistências, corrigir passivos e melhorar controles da folha.',
    '[{"title":"Jornada, férias e rescisão","description":"Metodologia de verificação das principais ocorrências trabalhistas.","topics":["Jornada, ponto, intervalos e DSR","Férias, licenças e 13º salário","Aviso prévio, estabilidades e rescisão"],"duration":"4h"},{"title":"Estrutura e cálculos da folha","description":"Revisão de rubricas e cálculo das parcelas da folha.","topics":["Mensalista, horista e horas extras","Insalubridade, periculosidade e adicionais","Descontos, pensão e totalização"],"duration":"4h"},{"title":"Encargos e obrigações","description":"Bases de cálculo, incidências e conferência dos recolhimentos.","topics":["INSS empregado e patronal","IRRF, FGTS e GFIP","DCTFWeb, DARF e relatórios"],"duration":"4h"},{"title":"eSocial e mapeamento de riscos","description":"Procedimentos de revisão e identificação de passivos.","topics":["Evento S-1010 e tabela de verbas","Totalizadores S-5001, S-5002 e S-5013","Relatório de mapeamento e plano de correção"],"duration":"4h"}]'::jsonb,
    '["Auditar rubricas e bases de cálculo","Reconhecer situações que geram passivos","Elaborar relatório de riscos e plano de correção"]'::jsonb,
    '["Casos e simulações","Material didático","Certificado"]'::jsonb,
    '["Gestores e profissionais de RH/DP","Contadores e escritórios de contabilidade","Consultores e compliance trabalhista"]'::jsonb,
    16, 'Online', 'Avancado', 'Auditoria e Tributária', 'path-auditoria',
    'Auditoria, Contabilidade Pública & Gestão Tributária', 1990.90, 'Ativo', false,
    '/images/courses/auditoria-tributaria.jpg', null
  ),
  (
    'course-2026-esocial-grps-rpps',
    'Formação de Especialista em eSocial para Órgãos Públicos: Regimes RGPS/RPPS',
    'formacao-especialista-esocial-orgaos-publicos-rgps-rpps',
    'Formação completa para eSocial, regimes previdenciários e obrigações integradas.',
    'Formação avançada sobre cadastro, RGPS/RPPS, folha, afastamentos, integrações, retificações, SST e governança do eSocial em órgãos públicos.',
    '[{"title":"Fundamentos e leiaute S-1.3","description":"Estrutura do eSocial e atualizações para órgãos públicos.","topics":["Eventos iniciais, de tabela, periódicos e totalizadores","Leiaute S-1.3 e regras de validação","Certificado, segurança e responsabilidades"],"duration":"6h"},{"title":"Cadastro e regimes RGPS/RPPS","description":"Qualificação e enquadramento previdenciário dos trabalhadores públicos.","topics":["Efetivos, comissionados, temporários e estagiários","RGPS, RPPS, aposentados e pensionistas","Matrícula, lotação e saneamento cadastral"],"duration":"6h"},{"title":"Folha, afastamentos e benefícios","description":"Eventos de remuneração e movimentações funcionais.","topics":["S-1200, S-1202, S-1207 e S-1210","Rubricas, férias, rescisões e retroativos","S-2230, licenças e benefícios por incapacidade"],"duration":"7h"},{"title":"Obrigações e integrações","description":"Conferência entre eSocial, folha, DCTFWeb, EFD-Reinf e contabilidade.","topics":["Substituição da DIRF e informações de IRRF","SIAPE, integradores e sistemas próprios","Protocolos, recibos, totalizadores e governança"],"duration":"5h"},{"title":"Retificações, SST e oficina","description":"Correção de erros, eventos de SST e casos reais de órgãos públicos.","topics":["S-3000, S-1298 e regras de retificação","S-2210, S-2220, S-2230, S-2240 e S-2299","Checklist final e plano de regularização"],"duration":"8h"}]'::jsonb,
    '["Distinguir os tratamentos RGPS e RPPS","Validar eventos, rubricas e totalizadores","Implantar fluxo de saneamento, conferência e conformidade mensal"]'::jsonb,
    '["Material didático","Certificado","Oficina com casos reais e sistema eSocial"]'::jsonb,
    '["Servidores e empregados públicos","Equipes de RH, folha, contabilidade, TI e jurídico","Controle interno, auditoria e gestores previdenciários"]'::jsonb,
    32, 'Hibrido', 'Avancado', 'eSocial', 'path-dp',
    'Departamento Pessoal, Folha de Pagamento & eSocial', 3990.90, 'Ativo', true,
    '/images/courses/departamento-pessoal-esocial.jpg', null
  ),
  (
    'course-2026-planilha-in05',
    'Como Elaborar e Julgar Planilha de Preço de Acordo com a IN nº 05/2017',
    'elaborar-julgar-planilha-preco-in-05-2017',
    'Planilha de custos e formação de preços para serviços com dedicação exclusiva de mão de obra.',
    'Capacitação para elaborar, validar e julgar planilhas, reduzindo riscos de sobrepreço, inexequibilidade, glosas e passivos trabalhistas.',
    '[{"title":"Base normativa e orçamento","description":"Papel da planilha no planejamento, julgamento e gestão contratual.","topics":["IN 05/2017 e critérios de aceitabilidade","Pesquisa conforme IN 65/2021","Riscos de sobrepreço e inexequibilidade"],"duration":"6h"},{"title":"Custos diretos de mão de obra","description":"Montagem do bloco de mão de obra com memorial de cálculo.","topics":["Salário, adicionais e benefícios","CCT, ACT e dissídio","Encargos previdenciários e FGTS"],"duration":"6h"},{"title":"Custos indiretos e tributos","description":"Fechamento do preço e testes de sensibilidade.","topics":["Administração, materiais e equipamentos","Tributos e lucro","Coerência com o termo de referência"],"duration":"5h"},{"title":"Julgamento e gestão contratual","description":"Análise de propostas e alterações durante a execução.","topics":["Conformidade, diligência e exequibilidade","Repactuação, reajuste e reequilíbrio","Oficinas com parecer e simulação"],"duration":"7h"}]'::jsonb,
    '["Montar memorial de cálculo defensável","Analisar exequibilidade e sanabilidade","Avaliar pedidos de repactuação e reequilíbrio"]'::jsonb,
    '["Oficinas com planilhas","Material didático","Certificado"]'::jsonb,
    '["Agentes de contratação e pregoeiros","Equipes de ETP/TR, gestores e fiscais","Controle interno, jurídico e licitantes"]'::jsonb,
    24, 'Presencial', 'Avancado', 'Licitações e Contratos', 'path-licitacoes',
    'Licitações, Compras Públicas & Contratos Administrativos', 2990.90, 'Ativo', false,
    '/images/courses/licitacoes-contratos.jpg', null
  ),
  (
    'course-2026-tesouro-avancado',
    'Tesouro Gerencial Avançado: Dashboards, Relatórios e Gestão Orçamentária',
    'tesouro-gerencial-avancado-dashboards-relatorios-gestao-orcamentaria',
    'Relatórios avançados, documentos analíticos e dashboards no Tesouro Gerencial.',
    'Treinamento prático para consultas customizadas de execução orçamentária e financeira, documentos analíticos e painéis gerenciais.',
    '[{"title":"Filtros, prompts e relatórios","description":"Recursos avançados para construir e exportar relatórios gerenciais.","topics":["Hierarquias, atributos e métricas","Grupos personalizados e elementos derivados","PPA, LDO, LOA e créditos orçamentários"],"duration":"4h"},{"title":"Métricas e gráficos","description":"Criação de métricas condicionais e visualizações para análise.","topics":["Funções e editor de fórmulas","Combinação de métricas","Execução da despesa e controle por célula"],"duration":"4h"},{"title":"Documentos analíticos","description":"Montagem de documentos com dados de relatórios do Tesouro Gerencial.","topics":["Modelos de documentos","Gráficos, seletores, textos e imagens","Execução por empenho e subitem"],"duration":"4h"},{"title":"Dashboards gerenciais","description":"Construção de painéis interativos para acompanhamento da execução.","topics":["Dashboards em branco e modelos","Painéis, seletores e widgets","Restos a pagar processados e não processados"],"duration":"4h"},{"title":"SIAFI e consultas construídas","description":"Relatórios de documentos e consultas customizadas.","topics":["OB, NE, ND e NC","Atributos específicos e Report Wizard","Previsão e realização da receita pública"],"duration":"4h"}]'::jsonb,
    '["Criar relatórios e métricas avançadas","Construir dashboards para acompanhamento da despesa","Aplicar consultas à realidade da unidade administrativa"]'::jsonb,
    '["Exercícios práticos","Material de apoio","Certificado"]'::jsonb,
    '["Gestores e servidores públicos com conhecimento prévio do Tesouro Gerencial","Responsáveis por execução orçamentária e financeira","Analistas de relatórios e controle"]'::jsonb,
    20, 'Online', 'Avancado', 'Tecnologia e Inovação', 'path-tech',
    'Tecnologia, Dados, Processos & Inovação', 2490.90, 'Ativo', false,
    '/images/courses/tecnologia-inovacao.jpg', null
  ),
  (
    'course-2026-redacao-oficial',
    'Redação Oficial e Elaboração de Documentos Técnicos com Foco nas Mais Recentes Alterações',
    'redacao-oficial-documentos-tecnicos-alteracoes-recentes',
    'Clareza, precisão e objetividade para documentos oficiais e técnicos.',
    'Curso prático de linguagem simples, documentos oficiais, relatórios, pareceres, notas técnicas, padronização e revisão gramatical.',
    '[{"title":"Princípios e linguagem simples","description":"Fundamentos da comunicação institucional clara, inclusiva e cidadã.","topics":["Legalidade, impessoalidade, moralidade, publicidade e eficiência","Empatia e assertividade","Plain Language no setor público"],"duration":"4h"},{"title":"Produção textual e comunicação oficial","description":"Técnicas para escrever com clareza, precisão e adequação.","topics":["Linguagem técnica e níveis de linguagem","Pronomes de tratamento e signatário","Vícios de linguagem e foco no leitor"],"duration":"4h"},{"title":"Documentos oficiais","description":"Estrutura e valor documental dos principais meios de comunicação.","topics":["Ofício, ofício conjunto e circular","SEI, e-mail e WhatsApp","Forma de tratamento e endereçamento"],"duration":"4h"},{"title":"Relatórios e documentos técnicos","description":"Organização, fundamentação e argumentação de documentos institucionais.","topics":["Relatórios, pareceres e notas informativas","ABNT e elementos do documento técnico","Planejamento, persuasão e contra-argumentos"],"duration":"4h"},{"title":"Padronização e revisão gramatical","description":"Revisão final para eliminar erros e melhorar a credibilidade do texto.","topics":["Concordância, regência, crase e pontuação","Siglas, abreviaturas, números e datas","Novo Acordo Ortográfico"],"duration":"4h"}]'::jsonb,
    '["Redigir documentos claros e objetivos","Adaptar a linguagem a públicos interno e externo","Reduzir erros gramaticais e vícios de linguagem"]'::jsonb,
    '["Prática guiada de redação","Material didático","Certificado"]'::jsonb,
    '["Profissionais que elaboram ofícios e relatórios","Assessorias, áreas administrativas e técnicas","Servidores que produzem comunicação institucional"]'::jsonb,
    20, 'Online', 'Intermediario', 'Comunicação e Atendimento', 'path-comunicacao',
    'Comunicação Institucional, Redação & Atendimento ao Cidadão', 2490.90, 'Ativo', false,
    '/images/courses/comunicacao-atendimento.jpg', null
  ),
  (
    'course-2026-ia-execucao-orcamentaria',
    'Inteligência Artificial na Execução Orçamentária e Financeira',
    'inteligencia-artificial-execucao-orcamentaria-financeira',
    'Curso previsto na agenda 2026; ementa específica não localizada na pasta Cursos.',
    'O título, as datas, o instrutor e a carga horária foram encontrados na agenda geral de 2026. O material didático específico deste curso não foi localizado no Dropbox; revisar a ementa antes de publicar.',
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    20, 'Online', 'Avancado', 'Tecnologia e Inovação', 'path-tech',
    'Tecnologia, Dados, Processos & Inovação', 2490.90, 'Rascunho', false,
    '/images/courses/tecnologia-inovacao.jpg', null
  ),
  (
    'course-2026-especialista-folha',
    'Formação de Especialista em Folha de Pagamento',
    'formacao-especialista-folha-pagamento',
    'Cálculos e conferência de folha, férias, rescisões e encargos.',
    'Formação para revisar cálculos, rubricas e obrigações previdenciárias e fiscais das rotinas de Administração de Pessoal.',
    '[{"title":"Jornada e repouso","description":"Conceitos e cálculos de jornada, descanso e controle de ponto.","topics":["Compensação, prorrogação e banco de horas","Descansos, trabalho noturno e ponto","Portaria 671/21 e jornadas flexíveis"],"duration":"3h"},{"title":"Remuneração e folha","description":"Cálculos de proventos, adicionais e descontos legais.","topics":["Mensalista, horista e horas extras","Periculosidade, insalubridade e DSR","INSS, IRRF, FGTS e descontos"],"duration":"4h"},{"title":"Férias e 13º salário","description":"Apuração de períodos, parcelas e afastamentos.","topics":["Períodos aquisitivo e concessivo","Abono, parcelamento e férias coletivas","13º salário e empregados afastados"],"duration":"3h"},{"title":"Rescisões contratuais","description":"Cálculo e conferência dos direitos na extinção do contrato.","topics":["Modalidades e aviso prévio","Verbas rescisórias e prazos","GFD rescisória e conferência"],"duration":"3h"},{"title":"Encargos e obrigações","description":"Fechamento de folha e conferência dos sistemas oficiais.","topics":["DARF, DCTFWeb e FGTS Digital","Relatórios eSocial 5001, 5002, 5003, 5011 e 5013","Revisão de rubricas no evento S-1010"],"duration":"3h"}]'::jsonb,
    '["Revisar cálculos de folha e verbas trabalhistas","Conferir bases e descontos legais","Aplicar conhecimentos a casos práticos de RH"]'::jsonb,
    '["Material didático","Certificado","Exercícios práticos"]'::jsonb,
    '["Gestores, supervisores e analistas de DP","Contabilistas e profissionais de RH","Profissionais que conferem folha, férias e rescisões"]'::jsonb,
    16, 'Online', 'Avancado', 'Departamento Pessoal', 'path-dp',
    'Departamento Pessoal, Folha de Pagamento & eSocial', 1990.90, 'Ativo', false,
    '/images/courses/departamento-pessoal-esocial.jpg', null
  ),
  (
    'course-2026-retencao-tributaria',
    'Retenção Tributária na Fonte e Contribuições Sociais com a Reforma Tributária',
    'retencao-tributaria-fonte-contribuicoes-sociais-reforma-tributaria',
    'Retenções de PIS/Cofins/CSLL, IRRF, INSS e ISS com atualização da reforma tributária.',
    'Orientação prática para calcular, compensar, contabilizar e recolher retenções em contratações públicas e privadas.',
    '[{"title":"Legislação e regimes tributários","description":"Fundamentos dos tributos federais, estaduais, municipais e do DF.","topics":["Princípios constitucionais","Regimes de tributação","Responsáveis e hipóteses de retenção"],"duration":"2h"},{"title":"PIS/Pasep, Cofins e CSLL","description":"Retenção das contribuições sociais em serviços contratados.","topics":["Serviços sujeitos e dispensas","Simples Nacional e medidas judiciais","Compensações, prazos e registros contábeis"],"duration":"3h"},{"title":"Imposto de Renda","description":"IRRF em pagamentos a pessoas físicas, jurídicas e entidades.","topics":["Órgãos públicos, MEI e autônomos","Simples, cooperativas e entidades sem fins lucrativos","Notas fiscais, RPA e comprovantes"],"duration":"3h"},{"title":"INSS e retenção previdenciária","description":"Incidência, bases e responsabilidades nas prestações de serviços.","topics":["Pessoas físicas e jurídicas","Cessão de mão de obra e empreitada","Desoneração, documentação e casos práticos"],"duration":"3h"},{"title":"ISS e documentos fiscais","description":"Regras de competência e retenção do imposto municipal.","topics":["LC 116/2003 e códigos municipais","Local de incidência e responsáveis","Nota fiscal eletrônica e contabilização"],"duration":"2h"},{"title":"Reforma tributária","description":"Impactos da LC 214/2025 e do IVA dual.","topics":["CBS, IBS e Imposto Seletivo","Transição, não cumulatividade e regimes específicos","Novos campos fiscais e aspectos contábeis"],"duration":"3h"}]'::jsonb,
    '["Identificar hipóteses e dispensas de retenção","Calcular bases, alíquotas e prazos","Registrar e conferir retenções e impactos da reforma tributária"]'::jsonb,
    '["Material didático","Certificado","Exercícios e casos práticos"]'::jsonb,
    '["Servidores públicos e organizações contratantes","Contadores e equipes fiscal/financeira","Prestadores de serviços e profissionais tributários"]'::jsonb,
    16, 'Presencial', 'Avancado', 'Auditoria e Tributária', 'path-auditoria',
    'Auditoria, Contabilidade Pública & Gestão Tributária', 1990.90, 'Ativo', false,
    '/images/courses/auditoria-tributaria.jpg', null
  ),
  (
    'course-2026-dp-completo-publica',
    'Curso Completo de Departamento Pessoal para Administração Pública',
    'curso-completo-departamento-pessoal-administracao-publica',
    'Controle, conformidade e precisão na folha do setor público celetista.',
    'Formação integrada do ciclo de admissão à rescisão, conectando folha, eSocial, DCTFWeb/MIT, FGTS Digital, EFD-Reinf e controle interno.',
    '[{"title":"Fundamentos e regimes públicos","description":"Natureza jurídica, vínculos e normas do DP público celetista.","topics":["RPPS, estatutário e celetista","CLT em estatais e fundações","Compliance e controle interno"],"duration":"5h"},{"title":"Admissão, contratação e jornada","description":"Do ingresso ao controle da jornada e das escalas.","topics":["Concurso, processo seletivo e documentação","CTPS Digital e eSocial","Escalas, banco de horas e ponto"],"duration":"5h"},{"title":"Remuneração, folha e licenças","description":"Conferência da folha e das ocorrências funcionais.","topics":["Proventos, adicionais e descontos","INSS, FGTS, IRRF e DCTFWeb","Férias, licenças e afastamentos"],"duration":"5h"},{"title":"Rescisões e sistemas oficiais","description":"Encerramento do vínculo e integração das obrigações.","topics":["Tipos de rescisão e prazos","S-2299, S-2399 e guias","FGTS Digital, EFD-Reinf e MIT"],"duration":"5h"},{"title":"Casos práticos e controle","description":"Aplicação integrada com simulações e checklists.","topics":["Admissão, férias e folha mensal","Rescisão com TRCT e guias","Checklist de conferência para órgãos públicos"],"duration":"4h"}]'::jsonb,
    '["Gerir o ciclo completo do DP público","Reduzir erros, glosas e passivos trabalhistas","Conferir a consistência entre folha, eSocial e obrigações fiscais"]'::jsonb,
    '["Material didático","Certificado","Coffee break e casos práticos"]'::jsonb,
    '["Servidores e empregados públicos","Profissionais terceirizados de RH/DP","Analistas, contadores e assessores jurídicos"]'::jsonb,
    24, 'Presencial', 'Avancado', 'Departamento Pessoal', 'path-dp',
    'Departamento Pessoal, Folha de Pagamento & eSocial', 3990.90, 'Ativo', true,
    '/images/courses/departamento-pessoal-esocial.jpg', null
  )
on conflict (id) do update set
  titulo = excluded.titulo,
  slug = excluded.slug,
  descricao_curta = excluded.descricao_curta,
  descricao = excluded.descricao,
  ementa = excluded.ementa,
  objetivos = excluded.objetivos,
  beneficios = excluded.beneficios,
  publico_alvo = excluded.publico_alvo,
  carga_horaria = excluded.carga_horaria,
  modalidade = excluded.modalidade,
  nivel = excluded.nivel,
  categoria = excluded.categoria,
  trilha_id = excluded.trilha_id,
  trilha_nome = excluded.trilha_nome,
  preco_base = excluded.preco_base,
  status = excluded.status,
  destaque = excluded.destaque,
  imagem_capa = excluded.imagem_capa,
  deleted_at = null;

insert into public.curso_instrutor (curso_id, instrutor_id, principal)
values
  ('course-2026-rotinas-adm-pessoal', 'inst-2026-jose-carlos', true),
  ('course-2026-esocial-s13-publico', 'inst-2026-ester-lima', true),
  ('course-2026-planejamento-contratacao', 'inst-2026-corpo-docente', true),
  ('course-2026-relacoes-feedback', 'inst-2026-suely-cobucci', true),
  ('course-2026-iso-20000', 'inst-2026-welligton-monaco', true),
  ('course-2026-auditoria-folha', 'inst-2026-jose-carlos', true),
  ('course-2026-esocial-grps-rpps', 'inst-2026-ester-lima', true),
  ('course-2026-planilha-in05', 'inst-2026-corpo-docente', true),
  ('course-2026-tesouro-avancado', 'inst-2026-jose-airton', true),
  ('course-2026-redacao-oficial', 'inst-2026-suely-cobucci', true),
  ('course-2026-ia-execucao-orcamentaria', 'inst-2026-jose-airton', true),
  ('course-2026-especialista-folha', 'inst-2026-jose-carlos', true),
  ('course-2026-retencao-tributaria', 'inst-2026-israel-oliveira', true),
  ('course-2026-dp-completo-publica', 'inst-2026-ester-lima', true)
on conflict (curso_id, instrutor_id) do update set
  principal = excluded.principal;

-- -------------------------------------------------------------------------
-- Turmas da agenda geral (agosto a dezembro de 2026)
-- -------------------------------------------------------------------------
insert into public.turma
  (id, curso_id, instrutor_id, data_inicio, data_fim, horario, local,
   vagas_total, vagas_preenchidas, preco_turma, modalidade, status,
   observacoes, deleted_at)
values
  ('class-2026-0805-rotinas', 'course-2026-rotinas-adm-pessoal', 'inst-2026-jose-carlos', '2026-08-05', '2026-08-10', '08:30 às 12:30', 'Online ao vivo', 0, 0, 890.00, 'Online', 'EmBreve', 'Agenda geral 2026; datas: 05, 06, 07 e 10/08. Capacidade não informada.', null),
  ('class-2026-0819-esocial', 'course-2026-esocial-s13-publico', 'inst-2026-ester-lima', '2026-08-19', '2026-08-21', '08:30 às 17:30', 'Brasília/DF', 0, 0, 2990.90, 'Presencial', 'EmBreve', 'Agenda geral 2026; turma presencial.', null),
  ('class-2026-0826-planejamento', 'course-2026-planejamento-contratacao', 'inst-2026-luiz-fernando', '2026-08-26', '2026-08-28', '08:30 às 17:30', 'Brasília/DF', 0, 0, 2990.90, 'Presencial', 'EmBreve', 'Agenda geral 2026; turma presencial.', null),
  ('class-2026-0824-relacoes', 'course-2026-relacoes-feedback', 'inst-2026-suely-cobucci', '2026-08-24', '2026-08-28', '08:30 às 12:30', 'Brasília/DF', 0, 0, 1990.90, 'Presencial', 'EmBreve', 'Agenda geral 2026; datas: 24 a 28/08.', null),
  ('class-2026-0908-auditoria', 'course-2026-auditoria-folha', 'inst-2026-jose-carlos', '2026-09-08', '2026-09-11', '13:30 às 17:30', 'Online ao vivo', 0, 0, 1990.90, 'Online', 'EmBreve', 'Agenda geral 2026; turma online ao vivo.', null),
  ('class-2026-0914-iso', 'course-2026-iso-20000', 'inst-2026-welligton-monaco', '2026-09-14', '2026-09-17', '08:30 às 17:30', 'Online ao vivo', 0, 0, 1990.90, 'Online', 'EmBreve', 'Agenda geral 2026; transmissão ao vivo.', null),
  ('class-2026-0915-esocial-grps', 'course-2026-esocial-grps-rpps', 'inst-2026-ester-lima', '2026-09-15', '2026-09-18', '08:30 às 17:30', 'Rio de Janeiro/RJ', 0, 0, 3990.90, 'Hibrido', 'EmBreve', 'Agenda geral 2026; modalidade registrada como presencial/online.', null),
  ('class-2026-0928-planilha', 'course-2026-planilha-in05', 'inst-2026-corpo-docente', '2026-09-28', '2026-09-30', '08:30 às 17:30', 'Brasília/DF', 0, 0, 2990.90, 'Presencial', 'EmBreve', 'Agenda geral 2026; turma presencial.', null),
  ('class-2026-1002-redacao', 'course-2026-redacao-oficial', 'inst-2026-suely-cobucci', '2026-10-02', '2026-10-06', '08:30 às 12:30', 'Brasília/DF', 0, 0, 2490.90, 'Presencial', 'EmBreve', 'Agenda geral 2026; datas: 02 e 06/10.', null),
  ('class-2026-1005-tesouro', 'course-2026-tesouro-avancado', 'inst-2026-jose-airton', '2026-10-05', '2026-10-09', '08:00 às 12:00', 'Online ao vivo', 0, 0, 2490.90, 'Online', 'EmBreve', 'Agenda geral 2026; transmissão ao vivo.', null),
  ('class-2026-1013-esocial', 'course-2026-esocial-s13-publico', 'inst-2026-ester-lima', '2026-10-13', '2026-10-14', '08:30 às 17:00', 'Rio de Janeiro/RJ', 0, 0, 2990.90, 'Presencial', 'EmBreve', 'Agenda geral 2026; turma presencial.', null),
  ('class-2026-1019-auditoria', 'course-2026-auditoria-folha', 'inst-2026-jose-carlos', '2026-10-19', '2026-10-22', '13:30 às 17:30', 'Online ao vivo', 0, 0, 1990.90, 'Online', 'EmBreve', 'Agenda geral 2026; turma online ao vivo.', null),
  ('class-2026-1019-ia-orcamentaria', 'course-2026-ia-execucao-orcamentaria', 'inst-2026-jose-airton', '2026-10-19', '2026-10-23', '08:00 às 12:00', 'Online ao vivo', 0, 0, 2490.90, 'Online', 'EmBreve', 'Agenda geral 2026; revisar ementa específica antes de publicar.', null),
  ('class-2026-1109-especialista-folha', 'course-2026-especialista-folha', 'inst-2026-jose-carlos', '2026-11-09', '2026-11-13', '08:30 às 12:30', 'Online ao vivo', 0, 0, 1990.90, 'Online', 'EmBreve', 'Agenda geral 2026; transmissão ao vivo.', null),
  ('class-2026-1117-esocial-grps', 'course-2026-esocial-grps-rpps', 'inst-2026-ester-lima', '2026-11-17', '2026-11-20', '08:30 às 17:30', 'São Paulo/SP', 0, 0, 3990.90, 'Presencial', 'EmBreve', 'Agenda geral 2026; turma presencial.', null),
  ('class-2026-1118-retencao', 'course-2026-retencao-tributaria', 'inst-2026-israel-oliveira', '2026-11-18', '2026-11-19', '08:30 às 17:30', 'Brasília/DF', 0, 0, 1990.90, 'Presencial', 'EmBreve', 'Agenda geral 2026; turma presencial.', null),
  ('class-2026-1124-redacao', 'course-2026-redacao-oficial', 'inst-2026-suely-cobucci', '2026-11-24', '2026-11-27', '08:30 às 12:30', 'Online ao vivo', 0, 0, 2490.90, 'Online', 'EmBreve', 'Agenda geral 2026; agenda informa online e Brasília/DF.', null),
  ('class-2026-1207-auditoria', 'course-2026-auditoria-folha', 'inst-2026-jose-carlos', '2026-12-07', '2026-12-10', '13:30 às 17:30', 'Online ao vivo', 0, 0, 1990.90, 'Online', 'EmBreve', 'Agenda geral 2026; transmissão ao vivo.', null),
  ('class-2026-1208-dp-completo', 'course-2026-dp-completo-publica', 'inst-2026-ester-lima', '2026-12-08', '2026-12-11', '08:30 às 17:00', 'São Paulo/SP', 0, 0, 3990.90, 'Presencial', 'EmBreve', 'Agenda geral 2026; turma presencial.', null),
  ('class-2026-1215-relacoes', 'course-2026-relacoes-feedback', 'inst-2026-suely-cobucci', '2026-12-15', '2026-12-18', '08:30 às 12:30', 'Brasília/DF', 0, 0, 1990.90, 'Presencial', 'EmBreve', 'Agenda geral 2026; turma presencial.', null),
  ('class-2026-1216-esocial', 'course-2026-esocial-s13-publico', 'inst-2026-ester-lima', '2026-12-16', '2026-12-18', '08:30 às 17:00', 'São Paulo/SP', 0, 0, 2990.90, 'Presencial', 'EmBreve', 'Agenda geral 2026; turma presencial.', null)
on conflict (id) do update set
  curso_id = excluded.curso_id,
  instrutor_id = excluded.instrutor_id,
  data_inicio = excluded.data_inicio,
  data_fim = excluded.data_fim,
  horario = excluded.horario,
  local = excluded.local,
  vagas_total = excluded.vagas_total,
  vagas_preenchidas = excluded.vagas_preenchidas,
  preco_turma = excluded.preco_turma,
  modalidade = excluded.modalidade,
  status = excluded.status,
  observacoes = excluded.observacoes,
  deleted_at = null;

commit;

-- Verificação rápida pós-seed:
-- select count(*) from public.turma where id like 'class-2026-%';
-- select t.data_inicio, t.data_fim, c.titulo, i.nome
--   from public.turma t
--   join public.curso c on c.id = t.curso_id
--   left join public.instrutor i on i.id = t.instrutor_id
--  where t.id like 'class-2026-%'
--  order by t.data_inicio;
