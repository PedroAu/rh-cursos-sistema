# Redesign Handoff

> Hierarquia oficial: implementação real em `src/`; documentação operacional em `docs/design/redesign/`; material histórico em `docs/design/redesign/reference/`. Ver também `docs/design/README.md`.

Este documento consolida o pacote de handoff do redesign para implementação no projeto.

## Escopo

O pacote cobre:

- inventário de páginas reais do produto
- fidelidade recomendada por página
- wireframes HTML já existentes
- specs funcionais e visuais por página
- ordem recomendada de implementação

## Fontes operacionais

### Índice operacional

- [wireframes/README.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/wireframes/README.md)

### Specs públicas

- [spec-home.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-home.md)
- [spec-home-sections.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-home-sections.md)
- [spec-catalogo.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-catalogo.md)
- [spec-course-detail.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-course-detail.md)
- [spec-agenda.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-agenda.md)
- [spec-blog.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-blog.md)
- [spec-blog-post.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-blog-post.md)
- [spec-quem-somos.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-quem-somos.md)
- [spec-contato.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-contato.md)
- [spec-in-company.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-in-company.md)
- [spec-consultoria-especialista.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-consultoria-especialista.md)
- [spec-login.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-login.md)
- [spec-enrollment-success.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-enrollment-success.md)

### Specs admin e portais

- [spec-admin-dashboard.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-admin-dashboard.md)
- [spec-admin-resources.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-admin-resources.md)
- [spec-admin-configuracoes.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-admin-configuracoes.md)
- [spec-portal-aluno.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-portal-aluno.md)
- [spec-portal-instrutor.md](/Users/pedroaugusto/Documents/site_1.0/site-rh-cursos/docs/design/redesign/spec-portal-instrutor.md)

Se houver divergência com arquivos em `docs/design/redesign/reference/`, a fonte operacional acima prevalece.

## Cobertura atual

### Com wireframe e spec

- Home
- Cursos
- Agenda
- Blog
- In Company
- Sobre
- Login
- Admin Dashboard

### Com spec pronta, mas sem wireframe HTML no diretório atual

- Detalhe do Curso
- Contato
- Consultoria / Especialista
- Post do Blog
- Sucesso de inscrição
- Admin Recursos
- Admin Configurações
- Portal do Aluno
- Portal do Instrutor

### Artefato complementar

- Home Sections
  Não é rota independente. Serve como apoio visual à Home.

## Prioridade de implementação

### P0

- Home
- Cursos
- Detalhe do Curso
- Agenda
- Contato
- In Company
- Consultoria / Especialista

### P1

- Admin Dashboard
- Admin Recursos
- Blog
- Post do Blog
- Login
- Sucesso de inscrição

### P2

- Admin Configurações
- Portal do Aluno
- Portal do Instrutor
- Sobre

## Regra de implementação

- Se houver wireframe e spec: usar ambos, com a view atual como restrição real do projeto.
- Se houver só spec: a spec é a referência principal para produzir o wireframe e depois implementar.
- Se houver divergência entre wireframe antigo e spec nova: priorizar a spec mais recente e validar o impacto na view real.

## Próximo passo recomendado

Transformar as páginas sem wireframe em HTML de handoff nesta ordem:

1. Detalhe do Curso
2. Contato
3. Consultoria / Especialista
4. Post do Blog
5. Sucesso de inscrição
6. Admin Recursos
7. Admin Configurações
8. Portal do Aluno
9. Portal do Instrutor
