# Wireframes Index

Este diretório concentra os wireframes HTML do redesign e funciona como ponte entre design e implementação.

## Objetivo

- Inventariar todas as páginas reais do produto
- Definir a fidelidade recomendada por página
- Registrar o caso de uso principal de cada tela
- Mapear quais wireframes já existem e quais ainda precisam ser produzidos

## Convenção

- `hi-fi`: pronto para handoff visual e implementação
- `mid-fi`: estrutura, hierarquia e conteúdo definidos; acabamento visual ainda pode evoluir
- `lo-fi`: exploração inicial; não recomendado como artefato final deste projeto

## Matriz de Páginas

| Página | Rota | Fidelidade | Prioridade | Caso de uso principal | Arquivo atual | Spec atual |
| --- | --- | --- | --- | --- | --- | --- |
| Home | `/` | hi-fi | P0 | Apresentar proposta de valor e distribuir navegação para as jornadas principais | `RH Cursos Home.html`, `RH Cursos Home.dc.html` | `docs/design/redesign/spec-home.md` |
| Cursos | `/cursos` | hi-fi | P0 | Permitir descoberta e comparação de cursos com foco em navegação, filtro e CTA | `RH Cursos Catálogo.dc.html` | `docs/design/redesign/spec-catalogo.md` |
| Detalhe do Curso | `/cursos/[slug]` | hi-fi | P0 | Converter interesse em inscrição com conteúdo, agenda e sinais de confiança | `RH Cursos Detalhe do Curso.html` | `docs/design/redesign/spec-course-detail.md` |
| Agenda | `/agenda` | hi-fi | P0 | Mostrar turmas disponíveis por período e formato para facilitar decisão | `RH Cursos Agenda.html`, `RH Cursos Agenda.dc.html` | `docs/design/redesign/spec-agenda.md` |
| Contato | `/contato` | hi-fi | P0 | Captar contato comercial com baixo atrito | `RH Cursos Contato.html` | `docs/design/redesign/spec-contato.md` |
| In Company | `/in-company` | hi-fi | P0 | Captar demanda B2B com briefing consultivo | `RH Cursos In-company.dc.html` | `docs/design/redesign/spec-in-company.md` |
| Consultoria / Especialista | `/consultoria` | hi-fi | P0 | Captar lead qualificado para atendimento com especialista | `RH Cursos Consultoria.html` | `docs/design/redesign/spec-consultoria-especialista.md` |
| Blog | `/blog` | mid-fi | P1 | Organizar descoberta de conteúdo editorial | `RH Cursos Blog.dc.html` | `docs/design/redesign/spec-blog.md` |
| Post do Blog | `/blog/[slug]` | mid-fi | P1 | Sustentar leitura e autoridade com conversão indireta | `pendente` | `docs/design/redesign/spec-blog-post.md` |
| Sobre | `/sobre` | mid-fi | P1 | Explicar posicionamento, história e credenciais | `RH Cursos Quem Somos.dc.html` | `docs/design/redesign/spec-quem-somos.md` |
| Login | `/login` | mid-fi | P1 | Autenticar e encaminhar o usuário para a área correta | `RH Cursos Login.dc.html` | `docs/design/redesign/spec-login.md` |
| Sucesso de inscrição | `/inscricao/sucesso` | mid-fi | P1 | Confirmar conclusão e orientar próximos passos | `pendente` | `docs/design/redesign/spec-enrollment-success.md` |
| Admin Dashboard | `/admin` | hi-fi | P1 | Dar visão operacional do negócio com métricas e atalhos | `RH Cursos Admin Dashboard.dc.html` | `docs/design/redesign/spec-admin-dashboard.md` |
| Admin Recursos | `/admin/*` | hi-fi | P1 | Operar CRUDs de cursos, turmas, leads, alunos, inscrições, instrutores e blog | `pendente` | `docs/design/redesign/spec-admin-resources.md` |
| Admin Configurações | `/admin/configuracoes` | mid-fi | P2 | Ajustar parâmetros administrativos | `pendente` | `docs/design/redesign/spec-admin-configuracoes.md` |
| Portal do Aluno | `/aluno` | mid-fi | P2 | Consultar inscrições, progresso e perfil | `pendente` | `docs/design/redesign/spec-portal-aluno.md` |
| Portal do Instrutor | `/instrutor` | mid-fi | P2 | Acompanhar turmas, alunos e rotina operacional | `pendente` | `docs/design/redesign/spec-portal-instrutor.md` |

## Cobertura Atual

### Wireframes já existentes

- Home
- Home Sections
- Cursos
- Detalhe do Curso
- Agenda
- Blog
- Contato
- In Company
- Consultoria / Especialista
- Sobre
- Login
- Admin Dashboard

### Wireframes ainda ausentes

- Post do Blog
- Sucesso de inscrição
- Admin Recursos
- Admin Configurações
- Portal do Aluno
- Portal do Instrutor

## Cobertura de Specs

### Specs já existentes

- `docs/design/redesign/spec-home.md`
- `docs/design/redesign/spec-home-sections.md`
- `docs/design/redesign/spec-catalogo.md`
- `docs/design/redesign/spec-agenda.md`
- `docs/design/redesign/spec-blog.md`
- `docs/design/redesign/spec-blog-post.md`
- `docs/design/redesign/spec-in-company.md`
- `docs/design/redesign/spec-quem-somos.md`
- `docs/design/redesign/spec-course-detail.md`
- `docs/design/redesign/spec-contato.md`
- `docs/design/redesign/spec-consultoria-especialista.md`
- `docs/design/redesign/spec-enrollment-success.md`
- `docs/design/redesign/spec-login.md`
- `docs/design/redesign/spec-admin-dashboard.md`
- `docs/design/redesign/spec-admin-resources.md`
- `docs/design/redesign/spec-admin-configuracoes.md`
- `docs/design/redesign/spec-portal-aluno.md`
- `docs/design/redesign/spec-portal-instrutor.md`

### Páginas com spec e wireframe

- Home
- Cursos
- Detalhe do Curso
- Agenda
- Blog
- Contato
- In Company
- Consultoria / Especialista
- Sobre
- Login
- Admin Dashboard

### Páginas com wireframe, mas sem spec dedicada

- Home Sections

### Páginas sem wireframe, mas com spec pronta

- Post do Blog
- Sucesso de inscrição
- Admin Recursos
- Admin Configurações
- Portal do Aluno
- Portal do Instrutor

## Ordem Recomendada de Produção

1. Home
2. Cursos
3. Detalhe do Curso
4. Agenda
5. Contato
6. In Company
7. Consultoria / Especialista
8. Admin Dashboard
9. Admin Recursos
10. Blog
11. Post do Blog
12. Login
13. Sucesso de inscrição
14. Admin Configurações
15. Portal do Aluno
16. Portal do Instrutor

## Relação com as Views do Projeto

Referência de implementação no app:

- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Home.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Courses.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/CourseDetail.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Agenda.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Blog.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/BlogPost.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/About.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Contact.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/InCompany.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/SpecialistContact.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/Login.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/public/EnrollmentSuccess.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/admin/AdminDashboard.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/admin/AdminResourcePage.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/admin/AdminSettingsPage.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/portal/StudentPortal.tsx`
- `/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/src/views/portal/InstructorPortal.tsx`

## Observações

- `RH Home Sections.dc.html` é um artefato complementar da Home, não uma rota independente.
- Os arquivos `.dc.html` podem coexistir com `.html` quando o wireframe depende do runtime/export específico do pacote.
- Quando um wireframe for promovido para implementação, a referência de verdade passa a ser a view em `src/views/` e os componentes em `src/components/`.
