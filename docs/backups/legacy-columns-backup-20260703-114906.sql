-- Backup read-only das colunas legadas antes da migration
-- 20260609120000_remove_legacy_course_instructor_fields.sql (DROP COLUMN)
-- Projeto: hwpsrujkxjhmmwphqdlz (site / producao)
-- Gerado: 2026-07-03T14:49:11.172Z
-- Para restaurar: recriar as colunas e rodar estes UPDATEs.

update public.curso set tipo_publico = 'Iniciantes' where id = 'course-dp-1';
update public.curso set tipo_publico = 'Avançado' where id = 'course-auditoria-2';
update public.curso set tipo_publico = 'Iniciantes' where id = 'course-auditoria-1';
update public.curso set tipo_publico = 'Iniciantes' where id = 'course-comunicacao-2';
update public.curso set tipo_publico = 'Profissionais' where id = 'course-licitacoes-2';
update public.curso set tipo_publico = 'Profissionais' where id = 'course-tech-2';
update public.curso set tipo_publico = 'Iniciantes' where id = 'course-licitacoes-1';
update public.curso set tipo_publico = 'Avançado' where id = 'course-pessoas-2';
update public.curso set tipo_publico = 'Profissionais' where id = 'course-tech-1';
update public.curso set tipo_publico = 'Iniciantes' where id = 'course-comunicacao-1';
update public.curso set tipo_publico = 'Profissionais' where id = 'course-1781008854778';
update public.curso set tipo_publico = 'Iniciantes' where id = 'course-dp-2';
update public.curso set tipo_publico = 'Iniciantes' where id = 'course-pessoas-1';
update public.instrutor set areas_atuacao = E'["Atua na capacitação de gestores", "servidores públicos e profissionais de departamento pessoal", "com foco em:", "•\\tLegislação Trabalhista aplicada", "•\\teSocial", "•\\tAuditoria de folha de pagamento", "•\\tCompliance trabalhista", "•\\tRotinas de Departamento Pessoal", "•\\tGestão de encargos trabalhistas e previdenciários"]'::jsonb where id = 'inst-1781898161618';
update public.instrutor set areas_atuacao = '["Empresário da Contabilidade", "Consultor de empresas nas áreas Contábil", "Tributária", "Empresarial e Planejamento Estratégico", "Pesquisador e Instrutor de cursos e palestras na área Contábil/Tributária. Larga experiência em reestruturação de empresas"]'::jsonb where id = 'inst-1781900828425';
update public.instrutor set areas_atuacao = '["governança", "inexigibilidade", "processos"]'::jsonb where id = 'inst-4';
update public.instrutor set areas_atuacao = '["liderança", "equipes", "desenvolvimento humano"]'::jsonb where id = 'inst-5';
update public.instrutor set areas_atuacao = '["DP", "folha de pagamento", "encargos"]'::jsonb where id = 'inst-1';
update public.instrutor set areas_atuacao = '["power bi", "dados", "dashboards"]'::jsonb where id = 'inst-7';
update public.instrutor set areas_atuacao = '["comunicação", "cnv", "atendimento"]'::jsonb where id = 'inst-6';
update public.instrutor set areas_atuacao = '["eSocial", "auditoria", "conformidade"]'::jsonb where id = 'inst-2';
update public.instrutor set areas_atuacao = '["indicadores", "automação", "relatórios"]'::jsonb where id = 'inst-8';
update public.instrutor set areas_atuacao = '["licitações", "contratos", "gestão de riscos"]'::jsonb where id = 'inst-3';
