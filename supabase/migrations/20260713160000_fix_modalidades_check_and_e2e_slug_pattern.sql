-- Corrige dois bugs introduzidos nas migrations 20260713100000 e
-- 20260713150000 (já aplicadas em produção com o conteúdo anterior). Como
-- essas versões já constam no histórico remoto, editar os arquivos originais
-- não teria efeito via `supabase db push` — as correções precisam vir em uma
-- migration nova.
--
-- 1. curso_modalidades_not_empty_chk usava array_length(modalidades, 1) > 0.
--    array_length('{}', 1) retorna NULL, e `NULL > 0` avalia para NULL (não
--    false), então o CHECK passava mesmo com array vazio. cardinality()
--    retorna 0 para array vazio e resolve isso corretamente.
--
-- 2. A limpeza de cursos e2e usava slug like 'e2e-%', que também apagaria um
--    curso legítimo com slug iniciando em "e2e-" (ex.: "e2e-testing"). O
--    padrão exato gerado pelo teste é "e2e-<timestamp>-curso", então o filtro
--    correto é 'e2e-%-curso'. Esta migration não repete o DELETE (já rodou
--    uma vez); apenas documenta o padrão correto para reexecuções futuras
--    deste tipo de limpeza.

alter table public.curso
  drop constraint if exists curso_modalidades_not_empty_chk;
alter table public.curso
  add constraint curso_modalidades_not_empty_chk check (cardinality(modalidades) > 0);
