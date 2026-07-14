-- Reintroduz um baseline público mínimo com IDs novos, após a remoção do
-- seed demo. Objetivo: manter catálogo/blog públicos funcionais em ambientes
-- recém-resetados e sustentar testes SSR/E2E sem repovoar dados fictícios
-- antigos removidos por 20260713120000_remove_demo_seed_data.sql.

begin;

insert into public.trilha (id, codigo, nome, nome_curto, slug, descricao, icone, ordem, ativa)
values
  (
    'path-public-licitacoes',
    'P01',
    'Licitações e Contratos Administrativos',
    'Licitações',
    'licitacoes-e-contratos-administrativos',
    'Formação aplicada para compras públicas, contratação e fiscalização contratual.',
    'Scale',
    101,
    true
  ),
  (
    'path-public-esocial',
    'P02',
    'Departamento Pessoal e eSocial',
    'DP & eSocial',
    'departamento-pessoal-e-esocial',
    'Conteúdos práticos para rotinas de DP, eSocial e conformidade trabalhista.',
    'Calculator',
    102,
    true
  )
on conflict (id) do update set
  codigo = excluded.codigo,
  nome = excluded.nome,
  nome_curto = excluded.nome_curto,
  slug = excluded.slug,
  descricao = excluded.descricao,
  icone = excluded.icone,
  ordem = excluded.ordem,
  ativa = excluded.ativa;

insert into public.instrutor (id, nome, email, telefone, bio, especialidade, rating, status)
values
  (
    'inst-public-licitacoes',
    'Equipe RH Cursos - Licitações',
    'licitacoes@rhcursos.com.br',
    '(61) 3000-1001',
    'Instrutoria dedicada a compras públicas, contratos e fiscalização.',
    'Licitações e contratos',
    4.8,
    'Ativo'
  ),
  (
    'inst-public-esocial',
    'Equipe RH Cursos - eSocial',
    'esocial@rhcursos.com.br',
    '(61) 3000-1002',
    'Instrutoria dedicada a eventos do eSocial, folha e obrigações acessórias.',
    'eSocial e departamento pessoal',
    4.8,
    'Ativo'
  )
on conflict (id) do update set
  nome = excluded.nome,
  email = excluded.email,
  telefone = excluded.telefone,
  bio = excluded.bio,
  especialidade = excluded.especialidade,
  rating = excluded.rating,
  status = excluded.status;

insert into public.curso (
  id,
  titulo,
  slug,
  descricao_curta,
  descricao,
  ementa,
  objetivos,
  beneficios,
  publico_alvo,
  carga_horaria,
  modalidade,
  modalidades,
  nivel,
  categoria,
  trilha_id,
  trilha_nome,
  preco_base,
  status,
  destaque,
  imagem_capa,
  rating,
  total_alunos
)
values
  (
    'course-public-licitacoes-1',
    'Introdução às Licitações e Contratos Administrativos: Noções Essenciais para o Setor Público',
    'introducao-as-licitacoes-e-contratos-administrativos-nocoes-essenciais-para-o-setor-publico',
    'Base prática para profissionais que atuam com compras públicas e contratos.',
    'Curso introdutório com foco em princípios, etapas do processo e responsabilidades no ciclo de contratação pública.',
    '["Panorama da contratação pública","Fases do processo","Responsabilidades e controles"]'::jsonb,
    '["Compreender os conceitos essenciais","Ler processos com mais segurança","Reduzir falhas procedimentais"]'::jsonb,
    '["Material de apoio","Casos comentados","Aplicação imediata"]'::jsonb,
    '["Servidores de compras","Pregoeiros","Gestores e fiscais de contrato"]'::jsonb,
    8,
    'Presencial',
    array['Presencial','Online']::public.modalidade_curso[],
    'Basico',
    'Licitações e Contratos',
    'path-public-licitacoes',
    'Licitações e Contratos Administrativos',
    1290,
    'Destaque',
    true,
    '/images/courses/licitacoes-contratos.jpg',
    4.8,
    24
  ),
  (
    'course-public-esocial-1',
    'eSocial na prática: revisão orientada antes do envio',
    'esocial-na-pratica-revisao-orientada-antes-do-envio',
    'Revisão objetiva para reduzir inconsistências antes do fechamento e envio.',
    'Curso curto e aplicado sobre conferência de eventos, validações e erros recorrentes no eSocial.',
    '["Eventos críticos","Validação pré-envio","Checklist de revisão"]'::jsonb,
    '["Identificar alertas recorrentes","Padronizar revisão","Aumentar segurança operacional"]'::jsonb,
    '["Checklist prático","Exemplos reais","Aplicação no dia seguinte"]'::jsonb,
    '["Analistas de RH","Departamento pessoal","Equipes de fechamento"]'::jsonb,
    8,
    'Online',
    array['Online']::public.modalidade_curso[],
    'Basico',
    'eSocial',
    'path-public-esocial',
    'Departamento Pessoal e eSocial',
    990,
    'Ativo',
    false,
    '/images/courses/departamento-pessoal-esocial.jpg',
    4.7,
    18
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
  modalidades = excluded.modalidades,
  nivel = excluded.nivel,
  categoria = excluded.categoria,
  trilha_id = excluded.trilha_id,
  trilha_nome = excluded.trilha_nome,
  preco_base = excluded.preco_base,
  status = excluded.status,
  destaque = excluded.destaque,
  imagem_capa = excluded.imagem_capa,
  rating = excluded.rating,
  total_alunos = excluded.total_alunos,
  deleted_at = null;

insert into public.curso_instrutor (curso_id, instrutor_id, principal)
values
  ('course-public-licitacoes-1', 'inst-public-licitacoes', true),
  ('course-public-esocial-1', 'inst-public-esocial', true)
on conflict (curso_id, instrutor_id) do update set principal = excluded.principal;

insert into public.turma (
  id,
  curso_id,
  instrutor_id,
  data_inicio,
  data_fim,
  horario,
  local,
  vagas_total,
  vagas_preenchidas,
  preco_turma,
  modalidade,
  status,
  observacoes
)
values
  (
    'class-public-licitacoes-1',
    'course-public-licitacoes-1',
    'inst-public-licitacoes',
    '2026-08-20',
    '2026-08-20',
    '09:00 às 17:00',
    'Brasília • DF',
    30,
    12,
    1290,
    'Presencial',
    'Aberta',
    'Turma pública baseline para catálogo e smoke tests.'
  ),
  (
    'class-public-esocial-1',
    'course-public-esocial-1',
    'inst-public-esocial',
    '2026-08-27',
    '2026-08-27',
    '09:00 às 17:00',
    'Online ao vivo',
    30,
    10,
    990,
    'Online',
    'Aberta',
    'Turma pública baseline para jornada editorial e fluxo de inscrição.'
  )
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

insert into public.post_blog (
  id,
  titulo,
  slug,
  resumo,
  conteudo,
  categoria,
  tags,
  autor,
  publicado_em,
  tempo_leitura,
  status,
  imagem_url,
  curso_id
)
values
  (
    'post-public-esocial-1',
    '3 alertas para revisar antes de enviar eventos do eSocial',
    '3-alertas-para-revisar-antes-de-enviar-eventos-do-esocial',
    'Pontos de atenção para revisar dados, eventos e consistências antes do envio.',
    'Antes de transmitir eventos ao eSocial, uma revisão orientada reduz erros evitáveis e acelera correções. Este artigo organiza um roteiro curto para checar cadastros, vínculos e rubricas críticas, com foco em segurança operacional e previsibilidade.\n\nA leitura foi desenhada para orientar a decisão do time sem jargão excessivo, reforçando critérios de revisão, taxonomia mínima do problema e um CTA contextual para aprofundamento no curso relacionado.',
    'eSocial',
    '["esocial","compliance","eventos"]'::jsonb,
    'Equipe RH Cursos',
    '2026-07-14T00:00:00Z',
    '5 min',
    'Publicado',
    'https://images.unsplash.com/photo-1521737605000?auto=format&fit=crop&w=1200&q=80',
    'course-public-esocial-1'
  )
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
  curso_id = excluded.curso_id,
  deleted_at = null;

commit;
