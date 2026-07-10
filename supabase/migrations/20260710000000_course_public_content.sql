-- Conteúdo editorial público da página de curso
-- Mantém copy, FAQ, CTA corporativo e depoimento em uma camada editável.

create table if not exists public.curso_public_content (
  id varchar(80) primary key default gen_random_uuid()::text,
  curso_id varchar(80) not null references public.curso(id) on delete cascade,
  hero_subtitle text,
  highlights jsonb not null default '[]'::jsonb,
  faq_items jsonb not null default '[]'::jsonb,
  sidebar jsonb not null default '{}'::jsonb,
  corporate_cta jsonb not null default '{}'::jsonb,
  testimonial_override jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint curso_public_content_curso_unique unique (curso_id)
);

create index if not exists curso_public_content_published_idx
  on public.curso_public_content (published)
  where deleted_at is null;

alter table public.curso_public_content enable row level security;

drop policy if exists "catalogo_publico_curso_public_content_select" on public.curso_public_content;
create policy "catalogo_publico_curso_public_content_select"
  on public.curso_public_content for select
  to anon, authenticated
  using (deleted_at is null and published = true);

drop trigger if exists set_updated_at on public.curso_public_content;
create trigger set_updated_at
before update on public.curso_public_content
for each row execute function public.set_updated_at();

insert into public.curso_public_content (
  curso_id,
  hero_subtitle,
  highlights,
  faq_items,
  sidebar,
  corporate_cta,
  testimonial_override,
  published
)
select
  c.id,
  coalesce(c.descricao, c.descricao_curta),
  jsonb_build_array(
    jsonb_build_object(
      'title', coalesce(nullif(c.beneficios->>0, ''), nullif(c.objetivos->>0, ''), c.descricao_curta, c.titulo),
      'description', coalesce(nullif(c.objetivos->>0, ''), c.descricao_curta, c.descricao, c.titulo)
    ),
    jsonb_build_object(
      'title', coalesce(nullif(c.beneficios->>1, ''), 'Aplicação prática'),
      'description', coalesce(nullif(c.objetivos->>1, ''), c.descricao_curta, c.descricao, 'Conteúdo pronto para uso imediato.')
    )
  ),
  jsonb_build_array(
    jsonb_build_object(
      'question', 'Como faço minha inscrição?',
      'answer', format(
        'Clique em "Inscrever-se agora", selecione a turma e conclua o checkout guiado. O curso "%s" usa o fluxo atual do app sem perder o contexto da turma escolhida.',
        c.titulo
      )
    ),
    jsonb_build_object(
      'question', 'Recebo certificado?',
      'answer', format('Sim. O curso tem carga de %sh e a confirmação segue o fluxo padrão de inscrição e atendimento.', c.carga_horaria)
    ),
    jsonb_build_object(
      'question', 'Há turma presencial e online?',
      'answer', format('As turmas abertas para "%s" aparecem no card lateral com a modalidade e a data de cada opção.', c.titulo)
    ),
    jsonb_build_object(
      'question', 'Órgãos públicos podem contratar?',
      'answer', 'Sim. O fluxo do site preserva o atendimento consultivo para proposta, empenho e contratação corporativa.'
    ),
    jsonb_build_object(
      'question', 'Como escolho a melhor turma?',
      'answer', 'Use a seleção lateral para comparar data, modalidade, local e vagas antes de seguir para a inscrição.'
    )
  ),
  jsonb_build_object(
    'investmentLabel', 'Investimento por participante',
    'installmentText', 'até 6x sem juros · ou empenho para órgãos públicos',
    'nextClassesLabel', 'Próximas turmas',
    'nextClassesEmptyLabel', 'Sem turmas abertas no momento.',
    'guaranteeTitle', 'Garantia de satisfação.',
    'guaranteeText', 'Cancele até 7 dias antes do início e receba 100% do valor de volta, sem burocracia.',
    'supportTitle', 'Dúvidas sobre a inscrição?',
    'supportText', 'Fale com nossa equipe comercial para validar turma, proposta e formato ideal.',
    'supportCtaLabel', 'Chamar no WhatsApp',
    'programPdfLabel', 'Programa PDF →',
    'preEnrollmentLabel', 'Pré-inscrição pronta'
  ),
  jsonb_build_object(
    'badge', 'Para equipes',
    'title', 'Quer este curso dentro da sua organização?',
    'description', 'Levamos este conteúdo para o seu time, adaptado ao seu contexto e ao seu calendário - presencial ou online.',
    'primaryLabel', 'Conhecer in-company',
    'primaryHref', '/in-company',
    'secondaryLabel', 'Solicitar proposta',
    'secondaryHref', '/in-company#quote-form'
  ),
  '{}'::jsonb,
  true
from public.curso c
where c.deleted_at is null
on conflict (curso_id) do update set
  hero_subtitle = excluded.hero_subtitle,
  highlights = excluded.highlights,
  faq_items = excluded.faq_items,
  sidebar = excluded.sidebar,
  corporate_cta = excluded.corporate_cta,
  testimonial_override = excluded.testimonial_override,
  published = excluded.published,
  updated_at = now();
