-- RH Cursos & Solucoes - seed de dados demonstrativos
-- Execute apos as migrations de schema.
-- Seed idempotente para trilhas, instrutores, cursos, turmas e blog.

begin;

insert into public.trilha (id, codigo, nome, nome_curto, slug, descricao, icone, ordem, ativa)
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

insert into public.instrutor (id, nome, email, telefone, bio, especialidade, areas_atuacao, rating, status)
values
  ('inst-1', 'Mariana Teles', 'mariana.teles@rhcursos.com', '(61) 98111-2001', 'Especialista em rotinas trabalhistas, cálculo de encargos e revisão de processos de DP.', 'Folha de pagamento', '["DP","folha de pagamento","encargos"]'::jsonb, 4.90, 'Ativo'),
  ('inst-2', 'Gustavo Ribeiro', 'gustavo.ribeiro@rhcursos.com', '(61) 98111-2002', 'Atua com implantação, auditoria e correção de eventos do eSocial em equipes públicas e privadas.', 'eSocial', '["eSocial","auditoria","conformidade"]'::jsonb, 4.80, 'Ativo'),
  ('inst-3', 'Lívia Cardoso', 'livia.cardoso@rhcursos.com', '(61) 98111-2003', 'Consultora em contratação pública, fiscalização e gestão de riscos em processos administrativos.', 'Licitações e contratos', '["licitações","contratos","gestão de riscos"]'::jsonb, 4.90, 'Ativo'),
  ('inst-4', 'Ricardo Braga', 'ricardo.braga@rhcursos.com', '(61) 98111-2004', 'Instrutor com foco em governança, inexigibilidade e melhoria de processos no setor público.', 'Gestão pública', '["governança","inexigibilidade","processos"]'::jsonb, 4.70, 'Ativo'),
  ('inst-5', 'Patrícia Nogueira', 'patricia.nogueira@rhcursos.com', '(61) 98111-2005', 'Facilitadora em liderança humanizada, prevenção de conflitos e desenvolvimento de equipes.', 'Liderança', '["liderança","equipes","desenvolvimento humano"]'::jsonb, 4.90, 'Ativo'),
  ('inst-6', 'Felipe Azevedo', 'felipe.azevedo@rhcursos.com', '(61) 98111-2006', 'Atua com comunicação não violenta, relações interpessoais e ambientes de trabalho seguros.', 'Comunicação', '["comunicação","cnv","atendimento"]'::jsonb, 4.80, 'Ativo'),
  ('inst-7', 'Bianca Salles', 'bianca.salles@rhcursos.com', '(61) 98111-2007', 'Especialista em dashboards, visualização de dados e indicadores aplicados a RH e áreas administrativas.', 'Power BI', '["power bi","dados","dashboards"]'::jsonb, 4.90, 'Ativo'),
  ('inst-8', 'Henrique Monteiro', 'henrique.monteiro@rhcursos.com', '(61) 98111-2008', 'Consultor em produtividade, relatórios gerenciais e automação de rotinas administrativas.', 'Indicadores e relatórios', '["indicadores","automação","relatórios"]'::jsonb, 4.80, 'Ativo')
on conflict (id) do update set
  nome = excluded.nome,
  email = excluded.email,
  telefone = excluded.telefone,
  bio = excluded.bio,
  especialidade = excluded.especialidade,
  areas_atuacao = excluded.areas_atuacao,
  rating = excluded.rating,
  status = excluded.status;

insert into public.curso (
  id, titulo, slug, descricao_curta, descricao, ementa, objetivos, beneficios,
  publico_alvo, carga_horaria, modalidade, nivel, categoria, trilha_id, trilha_nome,
  tipo_publico, preco_base, status, destaque, imagem_capa, rating, total_alunos
)
values
  ('course-dp-1', 'Departamento Pessoal para a Administração Pública: Fundamentos e Legislação', 'departamento-pessoal-para-a-administracao-publica-fundamentos-e-legislacao', 'Capacitação em DP público com foco em legislação e rotinas essenciais.', 'Curso voltado à organização do departamento pessoal no contexto público, com exemplos práticos e segurança operacional.', '["Panorama do DP público","Legislação aplicável","Rotinas e controles"]'::jsonb, '["Compreender os fundamentos do tema","Aplicar boas práticas em situações reais","Reduzir retrabalho e risco técnico"]'::jsonb, '["Conteúdo organizado por trilha e nível","Aplicação prática no contexto profissional","Material de apoio e checklist"]'::jsonb, '["Servidores públicos e profissionais da área","Gestores que precisam decidir com segurança","Equipes que buscam padronização"]'::jsonb, 8, 'Online', 'Basico', 'Departamento Pessoal', 'path-dp', 'Departamento Pessoal, Folha de Pagamento & eSocial', 'Iniciantes', 0, 'Destaque', true, '/images/courses/departamento-pessoal-esocial.jpg', 4.70, 90),
  ('course-dp-2', 'Legislação Trabalhista e Previdenciária para Servidores Públicos - Regime Estatutário', 'legislacao-trabalhista-e-previdenciaria-para-servidores-publicos-regime-estatutario', 'Visão aplicada das regras trabalhistas e previdenciárias no serviço público.', 'Aborda a aplicação prática da legislação em rotinas de RH e gestão de pessoas no setor público.', '["Legislação básica","Regime estatutário","Casos recorrentes"]'::jsonb, '["Compreender o arcabouço legal","Interpretar regras com segurança","Apoiar decisões administrativas"]'::jsonb, '["Conteúdo objetivo","Casos comentados","Checklist de revisão"]'::jsonb, '["Profissionais de RH","Servidores de áreas administrativas","Gestores públicos"]'::jsonb, 8, 'Online', 'Basico', 'Departamento Pessoal', 'path-dp', 'Departamento Pessoal, Folha de Pagamento & eSocial', 'Iniciantes', 0, 'Ativo', false, '/images/courses/departamento-pessoal-esocial.jpg', 4.60, 113),
  ('course-licitacoes-1', 'Introdução às Licitações e Contratos Administrativos: Noções Essenciais para o Setor Público', 'introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico', 'Base para profissionais que atuam com compras públicas e contratos.', 'Curso introdutório sobre princípios, etapas e responsabilidades em licitações e contratos administrativos.', '["Princípios da contratação pública","Fases do processo","Responsabilidades"]'::jsonb, '["Dominar conceitos essenciais","Ler processos com segurança","Evitar falhas procedimentais"]'::jsonb, '["Aplicação prática","Material de apoio","Foco em conformidade"]'::jsonb, '["Servidores de compras","Pregoeiros e equipes de apoio","Gestores e fiscais"]'::jsonb, 8, 'Presencial', 'Basico', 'Licitações e Contratos', 'path-licitacoes', 'Licitações, Compras Públicas & Contratos Administrativos', 'Iniciantes', 0, 'Destaque', true, '/images/courses/licitacoes-contratos.jpg', 4.70, 84),
  ('course-licitacoes-2', 'Nova Lei de Licitações na Prática: Lei nº 14.133/2021 - Teoria, Aplicação e Casos Reais', 'nova-lei-de-licitacoes-na-pratica-lei-no-14-133-2021-teoria-aplicacao-e-casos-reais', 'Aplicação prática da Lei 14.133/2021 com foco em casos reais.', 'Curso para consolidar a leitura operacional da nova lei e reduzir insegurança no ciclo de contratação.', '["Lei 14.133/2021","Casos reais","Fluxos de contratação"]'::jsonb, '["Interpretar a lei na prática","Aplicar controles e fluxos","Apoiar decisões em compras públicas"]'::jsonb, '["Casos reais","Material de apoio","Visão consultiva"]'::jsonb, '["Equipes de contratação","Fiscais de contrato","Gestores públicos"]'::jsonb, 16, 'Online', 'Intermediario', 'Licitações e Contratos', 'path-licitacoes', 'Licitações, Compras Públicas & Contratos Administrativos', 'Profissionais', 0, 'Ativo', false, '/images/courses/licitacoes-contratos.jpg', 4.80, 126),
  ('course-pessoas-1', 'Inteligência Emocional no Trabalho: Autoconhecimento, Regulação e Relações Profissionais', 'inteligencia-emocional-no-trabalho-autoconhecimento-regulacao-e-relacoes-profissionais', 'Curso para desenvolver equilíbrio emocional e relações mais produtivas.', 'Aborda autoconhecimento, regulação emocional e convivência profissional com foco em resultados.', '["Autoconhecimento","Regulação emocional","Relações profissionais"]'::jsonb, '["Entender gatilhos e respostas","Melhorar convivência","Apoiar equipes em rotinas complexas"]'::jsonb, '["Exemplos práticos","Atividades reflexivas","Aplicação imediata"]'::jsonb, '["Lideranças","Equipes administrativas","Profissionais em transição"]'::jsonb, 8, 'Hibrido', 'Basico', 'Gestão de Pessoas', 'path-pessoas', 'Gestão de Pessoas, Liderança & Desenvolvimento Humano', 'Iniciantes', 0, 'Destaque', true, '/images/courses/pessoas-lideranca.jpg', 4.60, 97),
  ('course-pessoas-2', 'Liderança Estratégica para Gestores Públicos: Visão, Influência e Tomada de Decisão', 'lideranca-estrategica-para-gestores-publicos-visao-influencia-e-tomada-de-decisao', 'Formação para gestores que precisam liderar com clareza e consistência.', 'Curso de liderança aplicada ao setor público com foco em decisão, influência e gestão de pessoas.', '["Visão de liderança","Tomada de decisão","Gestão de equipes"]'::jsonb, '["Desenvolver liderança prática","Fortalecer autoridade técnica","Aprimorar comunicação com equipes"]'::jsonb, '["Ferramentas aplicáveis","Casos reais","Plano de ação"]'::jsonb, '["Gestores públicos","Supervisores","Coordenadores de equipe"]'::jsonb, 16, 'Presencial', 'Avancado', 'Liderança', 'path-pessoas', 'Gestão de Pessoas, Liderança & Desenvolvimento Humano', 'Avançado', 0, 'Ativo', false, '/images/courses/pessoas-lideranca.jpg', 4.80, 121),
  ('course-comunicacao-1', 'Redação Oficial e Documentos Técnicos na Administração Pública: Novas Normas e Práticas', 'redacao-oficial-e-documentos-tecnicos-na-administracao-publica-novas-normas-e-praticas', 'Padronização de escrita e comunicação oficial no setor público.', 'Curso sobre redação oficial, clareza textual e organização documental em rotinas administrativas.', '["Redação oficial","Documentos técnicos","Boas práticas de escrita"]'::jsonb, '["Escrever com clareza","Padronizar documentos","Reduzir retrabalho textual"]'::jsonb, '["Modelos práticos","Orientações objetivas","Aplicação imediata"]'::jsonb, '["Servidores administrativos","Secretarias","Gabinetes e áreas técnicas"]'::jsonb, 8, 'Online', 'Basico', 'Comunicação', 'path-comunicacao', 'Comunicação Institucional, Redação & Atendimento ao Cidadão', 'Iniciantes', 0, 'Ativo', false, '/images/courses/comunicacao-atendimento.jpg', 4.50, 102),
  ('course-comunicacao-2', 'Atendimento ao Público na Administração Pública: Qualidade, Empatia e Gestão de Conflitos', 'atendimento-ao-publico-na-administracao-publica-qualidade-empatia-e-gestao-de-conflitos', 'Treinamento para elevar qualidade de atendimento e resolução de conflitos.', 'Curso prático sobre atendimento ao cidadão com empatia, postura e segurança na comunicação.', '["Atendimento ao público","Gestão de conflitos","Postura profissional"]'::jsonb, '["Melhorar interação com o cidadão","Lidar com conflitos com segurança","Padronizar atendimento"]'::jsonb, '["Casos práticos","Roteiros de atendimento","Foco em experiência do cidadão"]'::jsonb, '["Atendentes","Recepção","Equipes de relacionamento"]'::jsonb, 8, 'Hibrido', 'Basico', 'Comunicação', 'path-comunicacao', 'Comunicação Institucional, Redação & Atendimento ao Cidadão', 'Iniciantes', 0, 'Destaque', true, '/images/courses/comunicacao-atendimento.jpg', 4.60, 89),
  ('course-auditoria-1', 'Contabilidade Aplicada ao Setor Público (CASP) e Administração Financeira e Orçamentária (AFO): Fundamentos', 'contabilidade-aplicada-ao-setor-publico-casp-e-administracao-financeira-e-orcamentaria-afo-fundamentos', 'Base para atuar em contabilidade pública e orçamento.', 'Curso que organiza os fundamentos de CASP e AFO com foco em leitura operacional.', '["CASP","AFO","Fundamentos contábeis"]'::jsonb, '["Entender conceitos estruturantes","Aplicar fundamentos em análises","Apoiar controle e registro"]'::jsonb, '["Conteúdo estruturado","Exercícios guiados","Material de apoio"]'::jsonb, '["Contadores públicos","Controle interno","Áreas financeiras"]'::jsonb, 8, 'Online', 'Basico', 'Auditoria', 'path-auditoria', 'Auditoria, Contabilidade Pública & Gestão Tributária', 'Iniciantes', 0, 'Ativo', false, '/images/courses/auditoria-tributaria.jpg', 4.70, 108),
  ('course-auditoria-2', 'Auditoria Baseada em Riscos: Metodologia, Planejamento e Relatórios de Auditoria', 'auditoria-baseada-em-riscos-metodologia-planejamento-e-relatorios-de-auditoria', 'Estrutura metodológica para auditorias com foco em risco.', 'Curso voltado ao planejamento, execução e comunicação de auditorias orientadas por risco.', '["Metodologia","Planejamento","Relatórios"]'::jsonb, '["Mapear riscos","Planejar auditorias","Produzir relatórios objetivos"]'::jsonb, '["Casos comentados","Templates","Método aplicável"]'::jsonb, '["Auditores","Controle interno","Gestores de risco"]'::jsonb, 16, 'Presencial', 'Avancado', 'Auditoria', 'path-auditoria', 'Auditoria, Contabilidade Pública & Gestão Tributária', 'Avançado', 0, 'Destaque', true, '/images/courses/auditoria-tributaria.jpg', 4.80, 75),
  ('course-tech-1', 'Excel Intermediário: Tabelas Dinâmicas, Gráficos Avançados e Funções de Busca', 'excel-intermediario-tabelas-dinamicas-graficos-avancados-e-funcoes-de-busca', 'Formação prática para ganho de produtividade com Excel.', 'Curso voltado à construção de planilhas mais robustas, análises e relatórios para rotinas administrativas.', '["Tabelas dinâmicas","Gráficos","Funções de busca"]'::jsonb, '["Criar relatórios mais claros","Automatizar análises","Ganhar produtividade"]'::jsonb, '["Exercícios práticos","Modelos de planilha","Aplicação imediata"]'::jsonb, '["Profissionais administrativos","RH","Analistas e assistentes"]'::jsonb, 8, 'Online', 'Intermediario', 'Tecnologia', 'path-tech', 'Tecnologia, Dados, Processos & Inovação', 'Profissionais', 0, 'Ativo', false, '/images/courses/tecnologia-inovacao.jpg', 4.60, 132),
  ('course-tech-2', 'Power BI para Iniciantes e Intermediários: Dashboards, Relatórios e Visualização de Dados', 'power-bi-para-iniciantes-e-intermediarios-dashboards-relatorios-e-visualizacao-de-dados', 'Dashboards e relatórios com foco em visualização e decisão.', 'Curso para construir painéis e relatórios com Power BI em cenários de RH e gestão.', '["Dashboards","Relatórios","Visualização de dados"]'::jsonb, '["Montar painéis úteis","Organizar dados com clareza","Apoiar decisões"]'::jsonb, '["Exemplos de negócio","Prática guiada","Boa base para evolução"]'::jsonb, '["Analistas de dados","RH","Gestores e coordenadores"]'::jsonb, 16, 'Online', 'Intermediario', 'Tecnologia', 'path-tech', 'Tecnologia, Dados, Processos & Inovação', 'Profissionais', 0, 'Destaque', true, '/images/courses/tecnologia-inovacao.jpg', 4.80, 141)
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
  tipo_publico = excluded.tipo_publico,
  preco_base = excluded.preco_base,
  status = excluded.status,
  destaque = excluded.destaque,
  imagem_capa = excluded.imagem_capa,
  rating = excluded.rating,
  total_alunos = excluded.total_alunos;

insert into public.curso_instrutor (curso_id, instrutor_id, principal)
values
  ('course-dp-1', 'inst-1', true),
  ('course-dp-2', 'inst-2', true),
  ('course-licitacoes-1', 'inst-3', true),
  ('course-licitacoes-2', 'inst-4', true),
  ('course-pessoas-1', 'inst-5', true),
  ('course-pessoas-2', 'inst-5', true),
  ('course-comunicacao-1', 'inst-6', true),
  ('course-comunicacao-2', 'inst-6', true),
  ('course-auditoria-1', 'inst-8', true),
  ('course-auditoria-2', 'inst-8', true),
  ('course-tech-1', 'inst-7', true),
  ('course-tech-2', 'inst-7', true)
on conflict (curso_id, instrutor_id) do update set principal = excluded.principal;

insert into public.turma (
  id, curso_id, instrutor_id, data_inicio, data_fim, horario, local,
  vagas_total, vagas_preenchidas, preco_turma, modalidade, status, observacoes
)
values
  ('class-1-1', 'course-dp-1', 'inst-1', '2026-05-05', '2026-05-05', '09:00 às 17:00', 'Brasília • Asa Sul', 30, 10, 0, 'Online', 'Aberta', 'Turma demonstrativa para o catálogo público.'),
  ('class-1-2', 'course-dp-2', 'inst-2', '2026-05-10', '2026-05-10', '19:00 às 22:00', 'Ao vivo via Zoom', 30, 12, 0, 'Online', 'PoucasVagas', 'Restam poucas vagas nesta turma.'),
  ('class-1-3', 'course-licitacoes-1', 'inst-3', '2026-05-15', '2026-05-15', '09:00 às 17:00', 'Sede do cliente', 30, 26, 0, 'Presencial', 'PoucasVagas', 'Turma com boa ocupação.'),
  ('class-1-4', 'course-licitacoes-2', 'inst-4', '2026-05-20', '2026-05-20', '19:00 às 22:00', 'Híbrido • Brasília + online', 30, 30, 0, 'Hibrido', 'Encerrada', 'Turma encerrada para novas inscrições.'),
  ('class-1-5', 'course-pessoas-1', 'inst-5', '2026-05-25', '2026-05-26', '09:00 às 17:00', 'Brasília • Asa Sul', 40, 18, 0, 'Hibrido', 'Aberta', 'Turma ideal para equipes e lideranças.'),
  ('class-2-1', 'course-pessoas-2', 'inst-5', '2026-05-30', '2026-05-30', '19:00 às 22:00', 'Ao vivo via Zoom', 40, 22, 0, 'Online', 'PoucasVagas', 'Restam poucas vagas nesta turma.'),
  ('class-2-2', 'course-comunicacao-1', 'inst-6', '2026-06-04', '2026-06-04', '09:00 às 17:00', 'Plataforma gravada', 30, 8, 0, 'Gravado', 'Aberta', 'Disponível como demonstração de catálogo.'),
  ('class-2-3', 'course-comunicacao-2', 'inst-6', '2026-06-09', '2026-06-09', '19:00 às 22:00', 'Brasília • Asa Sul', 30, 15, 0, 'Presencial', 'Aberta', 'Turma prática com foco em atendimento.'),
  ('class-2-4', 'course-auditoria-1', 'inst-8', '2026-06-14', '2026-06-14', '09:00 às 17:00', 'Ao vivo via Zoom', 30, 20, 0, 'Online', 'PoucasVagas', 'Turma com lista de espera simulada.'),
  ('class-2-5', 'course-auditoria-2', 'inst-8', '2026-06-19', '2026-06-20', '09:00 às 17:00', 'Sede do cliente', 30, 30, 0, 'Presencial', 'Encerrada', 'Turma já realizada para o catálogo.'),
  ('class-3-1', 'course-tech-1', 'inst-7', '2026-06-24', '2026-06-24', '09:00 às 17:00', 'Híbrido • Brasília + online', 30, 13, 0, 'Hibrido', 'Aberta', 'Turma aberta para teste do fluxo de inscrição.'),
  ('class-3-2', 'course-tech-2', 'inst-7', '2026-06-29', '2026-06-29', '19:00 às 22:00', 'Ao vivo via Zoom', 30, 29, 0, 'Online', 'PoucasVagas', 'Quase encerrada devido à alta procura.')
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
  observacoes = excluded.observacoes;

insert into public.post_blog (
  id, titulo, slug, resumo, conteudo, categoria, tags, autor, publicado_em, tempo_leitura, status, imagem_url, curso_id
)
values
  ('post-1', 'Como reduzir retrabalho no departamento pessoal com processos mais claros', 'como-reduzir-retrabalho-no-departamento-pessoal-com-processos-mais-claros', 'Conteúdo orientado à prática para rotinas de DP mais seguras.', 'Este conteúdo foi criado para demonstrar uma experiência editorial realista, com leitura fluida, sem exageros e conectada à jornada comercial da plataforma.\n\nA proposta é mostrar como a empresa pode educar o lead, reforçar autoridade e conectar o problema do público a uma solução formativa aplicável.\n\nAo longo do artigo, a navegação deve favorecer leitura confortável, boa hierarquia e CTA contextual para o curso relacionado.', 'Departamento Pessoal', '["folha","rotina","produtividade"]'::jsonb, 'Mariana Teles', '2026-04-10T10:00:00Z', '4 min', 'Publicado', 'https://images.unsplash.com/photo-1521737604893?auto=format&fit=crop&w=1200&q=80', 'course-dp-1'),
  ('post-2', '3 alertas para revisar antes de enviar eventos do eSocial', '3-alertas-para-revisar-antes-de-enviar-eventos-do-esocial', 'Pontos de atenção que evitam erros em envios do eSocial.', 'Este conteúdo foi criado para demonstrar uma experiência editorial realista, com leitura fluida, sem exageros e conectada à jornada comercial da plataforma.\n\nA proposta é mostrar como a empresa pode educar o lead, reforçar autoridade e conectar o problema do público a uma solução formativa aplicável.\n\nAo longo do artigo, a navegação deve favorecer leitura confortável, boa hierarquia e CTA contextual para o curso relacionado.', 'eSocial', '["esocial","compliance","eventos"]'::jsonb, 'Gustavo Ribeiro', '2026-04-11T10:00:00Z', '5 min', 'Publicado', 'https://images.unsplash.com/photo-1521737605000?auto=format&fit=crop&w=1200&q=80', 'course-dp-2'),
  ('post-3', 'Quando a inexigibilidade faz sentido para contratação de capacitação', 'quando-a-inexigibilidade-faz-sentido-para-contratacao-de-capacitacao', 'Orientação editorial sobre contratação pública e capacitação.', 'Este conteúdo foi criado para demonstrar uma experiência editorial realista, com leitura fluida, sem exageros e conectada à jornada comercial da plataforma.\n\nA proposta é mostrar como a empresa pode educar o lead, reforçar autoridade e conectar o problema do público a uma solução formativa aplicável.\n\nAo longo do artigo, a navegação deve favorecer leitura confortável, boa hierarquia e CTA contextual para o curso relacionado.', 'Gestão Pública', '["contratação","gestão pública","capacitação"]'::jsonb, 'Ricardo Braga', '2026-04-12T10:00:00Z', '6 min', 'Publicado', 'https://images.unsplash.com/photo-1521737605111?auto=format&fit=crop&w=1200&q=80', 'course-licitacoes-1'),
  ('post-4', 'Liderança humanizada: o que muda na rotina do gestor', 'lideranca-humanizada-o-que-muda-na-rotina-do-gestor', 'Reflexões práticas para liderança e gestão de pessoas.', 'Este conteúdo foi criado para demonstrar uma experiência editorial realista, com leitura fluida, sem exageros e conectada à jornada comercial da plataforma.\n\nA proposta é mostrar como a empresa pode educar o lead, reforçar autoridade e conectar o problema do público a uma solução formativa aplicável.\n\nAo longo do artigo, a navegação deve favorecer leitura confortável, boa hierarquia e CTA contextual para o curso relacionado.', 'Liderança', '["liderança","equipes","gestão"]'::jsonb, 'Patrícia Nogueira', '2026-04-13T10:00:00Z', '7 min', 'Publicado', 'https://images.unsplash.com/photo-1521737605222?auto=format&fit=crop&w=1200&q=80', 'course-pessoas-2'),
  ('post-5', 'Power BI para RH: por onde começar sem complicar', 'power-bi-para-rh-por-onde-comecar-sem-complicar', 'Primeiros passos para dashboards mais claros e úteis.', 'Este conteúdo foi criado para demonstrar uma experiência editorial realista, com leitura fluida, sem exageros e conectada à jornada comercial da plataforma.\n\nA proposta é mostrar como a empresa pode educar o lead, reforçar autoridade e conectar o problema do público a uma solução formativa aplicável.\n\nAo longo do artigo, a navegação deve favorecer leitura confortável, boa hierarquia e CTA contextual para o curso relacionado.', 'Tecnologia', '["power bi","dashboards","rh"]'::jsonb, 'Bianca Salles', '2026-04-14T10:00:00Z', '4 min', 'Publicado', 'https://images.unsplash.com/photo-1521737605333?auto=format&fit=crop&w=1200&q=80', 'course-tech-2'),
  ('post-6', 'Como prevenir assédio moral e sexual com políticas mais claras', 'como-prevenir-assedio-moral-e-sexual-com-politicas-mais-claras', 'Conteúdo para reforço de políticas internas e prevenção.', 'Este conteúdo foi criado para demonstrar uma experiência editorial realista, com leitura fluida, sem exageros e conectada à jornada comercial da plataforma.\n\nA proposta é mostrar como a empresa pode educar o lead, reforçar autoridade e conectar o problema do público a uma solução formativa aplicável.\n\nAo longo do artigo, a navegação deve favorecer leitura confortável, boa hierarquia e CTA contextual para o curso relacionado.', 'Assédio e Compliance', '["compliance","assédio","políticas"]'::jsonb, 'Felipe Azevedo', '2026-04-15T10:00:00Z', '5 min', 'Publicado', 'https://images.unsplash.com/photo-1521737605444?auto=format&fit=crop&w=1200&q=80', 'course-pessoas-1'),
  ('post-7', 'FGTS Digital e DCTFWeb: onde equipes mais erram', 'fgts-digital-e-dctfweb-onde-equipes-mais-erram', 'Checklist editorial para reduzir falhas em obrigações acessórias.', 'Este conteúdo foi criado para demonstrar uma experiência editorial realista, com leitura fluida, sem exageros e conectada à jornada comercial da plataforma.\n\nA proposta é mostrar como a empresa pode educar o lead, reforçar autoridade e conectar o problema do público a uma solução formativa aplicável.\n\nAo longo do artigo, a navegação deve favorecer leitura confortável, boa hierarquia e CTA contextual para o curso relacionado.', 'eSocial', '["fgts digital","dctfweb","obrigações"]'::jsonb, 'Gustavo Ribeiro', '2026-04-16T10:00:00Z', '6 min', 'Rascunho', 'https://images.unsplash.com/photo-1521737605555?auto=format&fit=crop&w=1200&q=80', 'course-dp-1'),
  ('post-8', 'Indicadores de treinamento que ajudam a provar valor para a gestão', 'indicadores-de-treinamento-que-ajudam-a-provar-valor-para-a-gestao', 'Indicadores úteis para apoiar decisões e resultados.', 'Este conteúdo foi criado para demonstrar uma experiência editorial realista, com leitura fluida, sem exageros e conectada à jornada comercial da plataforma.\n\nA proposta é mostrar como a empresa pode educar o lead, reforçar autoridade e conectar o problema do público a uma solução formativa aplicável.\n\nAo longo do artigo, a navegação deve favorecer leitura confortável, boa hierarquia e CTA contextual para o curso relacionado.', 'Tecnologia', '["indicadores","treinamento","dados"]'::jsonb, 'Henrique Monteiro', '2026-04-17T10:00:00Z', '7 min', 'Arquivado', 'https://images.unsplash.com/photo-1521737605666?auto=format&fit=crop&w=1200&q=80', 'course-tech-1')
on conflict (id) do update set
  titulo = excluded.titulo,
  slug = excluded.slug,
  resumo = excluded.resumo,
  conteudo = excluded.conteudo,
  categoria = excluded.categoria,
  tags = excluded.tags,
  autor = excluded.autor,
  publicado_em = excluded.publicado_em,
  tempo_leitura = excluded.tempo_leitura,
  status = excluded.status,
  imagem_url = excluded.imagem_url,
  curso_id = excluded.curso_id;

commit;
