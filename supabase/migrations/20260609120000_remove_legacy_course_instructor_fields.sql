alter table public.curso
  drop column if exists tipo_publico;

alter table public.instrutor
  drop column if exists areas_atuacao;
