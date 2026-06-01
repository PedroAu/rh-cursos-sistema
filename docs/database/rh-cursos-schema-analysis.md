# Analise do modelo de dados RH Cursos

## Conclusao

O modelo proposto conversa bem com o site atual, mas precisava de quatro ajustes para representar os fluxos reais:

1. `aluno` e `inscricao` precisam ser entidades separadas. O checkout atual cria dados do aluno e uma inscricao, mas a inscricao pertence a um unico aluno.
2. `curso -> turma` e uma relacao 1:N, nao 1:1. Um curso tem varias turmas; cada turma pertence a um curso.
3. `curso -> instrutor` precisa de uma tabela de juncao. O requisito diz que um curso pode ter varios instrutores, enquanto o diagrama tinha apenas `instrutor_id` em `curso`. A migracao adiciona `curso_instrutor`.
4. `avaliacao` deve se vincular a `inscricao` e `turma`. Isso garante que apenas quem se inscreveu possa avaliar uma turma, e permite listar avaliacoes por turma.

## Tabelas implementadas

- `aluno`: dados pessoais e profissionais do aluno.
- `curso`: catalogo usado pelas paginas publicas.
- `curso_instrutor`: relacao N:N entre curso e instrutor.
- `turma`: agenda de turmas de cada curso.
- `inscricao`: inscricao de aluno em uma turma.
- `instrutor`: dados publicos e administrativos do instrutor.
- `lead`: solicitacoes de interesse, contato e in-company.
- `avaliacao`: nota/comentario por inscricao/turma.

## Campos adicionados em relacao ao pedido inicial

- `created_at`, `updated_at` e `deleted_at` onde faz sentido operacional.
- `descricao_curta`, `objetivos`, `beneficios`, `publico_alvo`, `nivel`, `trilha_id`, `trilha_nome`, `tipo_publico`, `destaque`, `rating` e `total_alunos` em `curso`, pois o site atual precisa desses dados para catalogo, cards e detalhe.
- `instrutor_id`, `vagas_preenchidas`, `vagas_restantes` gerado, `modalidade` e `observacoes` em `turma`, pois o site exibe agenda, vagas e instrutor.
- `tipo_inscricao`, `observacoes` e `certificado_emitido` em `inscricao`, pois o fluxo atual distingue PF/empresa/orgao publico e certificados.
- `curso_id`, `mensagem` e `origem` em `lead`, pois os formularios atuais registram origem e interesse.

## Politicas RLS

- Leitura publica: `curso`, `turma`, `instrutor`, `curso_instrutor`.
- Insercao publica: `lead`.
- Inscricoes publicas: via funcao `registrar_inscricao_publica`, evitando expor escrita direta em `aluno` e `inscricao`.
- `avaliacao` requer usuario autenticado para inserir.
- Leituras administrativas de `aluno`, `inscricao` e `lead` ficam restritas a `authenticated`.

## Integracao no site

O site agora possui um client Supabase em `src/lib/supabase/client.ts`.

Quando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` existem, o app Next.js:

- carrega catalogo publico de `curso`, `turma`, `instrutor` e `curso_instrutor`;
- tenta carregar leads se a sessao/policy permitir;
- grava leads enviados por formularios;
- grava inscricoes usando a funcao SQL `registrar_inscricao_publica`.

Sem variaveis de ambiente, o app continua usando os mocks locais.

## Auditoria pagina a pagina em 26/05/2026

Escopo auditado: rotas ativas em `app/`, telas em `src/views/`, componentes de
checkout/agenda/layout e estado em `src/lib/app-store.tsx`. A classificacao
abaixo distingue dados operacionais de conteudo institucional fixo; textos de
marketing, FAQ e canais de contato nao exigem tabela enquanto permanecerem
editados em codigo.

Nesta matriz, "coberto" significa previsto nas migrations locais. Na
verificacao remota anterior, o projeto Supabase configurado ainda retornava
ausencia de `curso`, `turma`, `instrutor`, `curso_instrutor` e `lead`; as
migrations ainda precisam ser executadas no SQL Editor ou pela CLI.

| Pagina / rota | Informacoes exibidas ou coletadas | Persistencia necessaria | Cobertura atual |
| --- | --- | --- | --- |
| Layout publico / atendimento rapido | mensagem, origem WhatsApp, interesse geral | `lead` | Coberto no schema e enviado por `/api/leads`; identificacao do visitante ainda usa valores demonstrativos |
| Home `/` | trilhas, quantidade de cursos, depoimentos e avaliacao | `trilha`; `avaliacao` vinculada a aluno/inscricao/curso | `avaliacao` existe; `trilha` e depoimentos carregados ainda sao mocks |
| Cursos `/cursos` | trilha, curso, modalidade, carga, nivel, imagem, rating, alunos e proxima turma | `trilha`, `curso`, `turma` | `curso`/`turma` cobertos; `trilha` nao tem tabela propria |
| Detalhe `/cursos/[slug]` | curso completo, ementa, objetivos, beneficios, instrutor, turmas, depoimentos; checkout coleta aluno, CPF, organizacao, cargo, tipo, turma e pagamento | `curso`, `instrutor`, `curso_instrutor`, `turma`, `aluno`, `inscricao`, `pagamento`, `avaliacao` | Coberto pelas migrations existentes; leitura de depoimentos e pagamento ainda nao integrada na UI |
| Agenda `/agenda` | curso, trilha, data, horario, modalidade, local, instrutor e status | `trilha`, `curso`, `turma`, `instrutor` | Coberto exceto entidade `trilha` |
| Blog `/blog` | posts; captura de e-mail de newsletter | `post_blog`; `lead` com tipo `Newsletter` | `post_blog` ausente; enum de `lead` suporta Newsletter, mas o botao apenas exibe toast |
| Artigo `/blog/[slug]` | titulo, resumo, conteudo, categoria, tags, autor, data, tempo, imagem e curso relacionado | `post_blog` com FK opcional para `curso` | Ausente; usa `mockBlogPosts` |
| In Company `/in-company` | nome, e-mail, empresa, telefone, tamanho da equipe, modalidade e objetivo/desafios | `lead` | Parcial: schema possui `orgao` e `num_participantes`, mas a UI concatena empresa, tamanho e modalidade em `mensagem` |
| Contato `/contato` | nome, e-mail, telefone e mensagem | `lead` | Coberto e enviado por `/api/leads` |
| Login `/login` | usuario autenticado, nome/e-mail e papel | `auth.users`, `profiles`, vinculo com `aluno`/`instrutor` | Parcial: Auth existe; `profiles.role` atualmente modela apenas `user`/`admin`, enquanto a UI usa aluno/instrutor/admin |
| Confirmacao `/inscricao-confirmada` | curso, turma, aluno e forma de pagamento | `inscricao` com joins e `pagamento` | Coberto no schema; pagina usa state local apos checkout |
| Dashboard aluno `/aluno` | inscricoes, turmas, certificado e pagamento; progresso, tempo de estudo, pontos, materiais e duvidas | `aluno`, `inscricao`, `turma`, `certificado`, `pagamento`; futuras entidades de progresso/material/atendimento | Basico coberto; progresso, materiais e duvidas sao somente demonstrativos |
| Dashboard instrutor `/instrutor` | perfil, cursos, turmas, alunos e avaliacao; acao concluir aula | `instrutor`, `curso_instrutor`, `turma`, `inscricao`, `avaliacao` | Coberto; acao ainda altera apenas estado local e pode usar `turma.status = Realizada` |
| Admin `/admin` | contagens, leads por status, inscricoes por trilha e turmas por modalidade | consultas agregadas sobre tabelas operacionais | Coberto quando os dados base forem persistidos; receita e conversao sao valores simulados |
| Admin recursos | CRUD de cursos, turmas, alunos, leads, inscricoes, instrutores e blog | tabelas correspondentes e APIs administrativas | Todas exceto blog existem; os CRUDs ainda escrevem somente em `localStorage` |
| Sobre `/sobre` | texto institucional e numeros de marketing | nenhuma obrigatoria no escopo atual | Conteudo fixo em codigo |

## Lacunas confirmadas

### Necessarias para dados que a interface ja apresenta

1. Criar entidade `trilha` e referenciar `curso.trilha_id`.
   - A Home, o catalogo e a agenda apresentam `code`, `name`, `shortName`,
     `slug`, `description`, `icon` e contagem de cursos.
   - Hoje a tabela `curso` armazena somente identificador/nome
     desnormalizados; o restante vem de `src/data/trainingPaths.ts`.
2. Criar entidade `post_blog`.
   - O blog publico e o CRUD administrativo exibem titulo, slug, resumo,
     conteudo, categoria, tags, autor, data, tempo de leitura, status, imagem
     e curso relacionado.
   - Nenhuma migration atual armazena posts.
3. Preservar os campos estruturados de propostas In Company.
   - `lead.orgao` e `lead.num_participantes` ja existem, mas nao sao enviados
     pelo mapper atual.
   - A modalidade desejada nao possui coluna especifica e hoje fica misturada
     no texto da mensagem.
4. Persistir newsletter como lead.
   - `tipo_lead = 'Newsletter'` ja existe, portanto nao e obrigatorio criar
     nova tabela para o formulario atual.
   - Falta ligar o envio da pagina Blog a `/api/leads`.
5. Alinhar papeis de acesso autenticado.
   - A UI possui perfis `student`, `instructor` e `admin`.
   - A migration de `profiles` restringe `role` a `user` e `admin`; isso nao
     representa o portal do instrutor/aluno de forma consultavel por RLS.

### Ja cobertas no schema, mas ainda sem persistencia completa na aplicacao

- CRUD administrativo de `curso`, `turma`, `aluno`, `lead`, `inscricao` e
  `instrutor`: as tabelas existem, mas as acoes administrativas permanecem
  em `localStorage`.
- Depoimentos: podem ser derivados de `avaliacao` publicada, junto a
  `inscricao`, `aluno`, `turma` e `curso`; a tela ainda usa mocks.
- Certificados e pagamentos: as tabelas foram adicionadas na Sprint 4; o
  dashboard do aluno ainda apresenta valores simulados.
- Conclusao de aula pelo instrutor: a coluna `turma.status` suporta
  `Realizada`, mas o botao ainda nao persiste alteracao.

### Dados demonstrativos sem requisito de tabela no escopo atual

- Textos institucionais da Home, Sobre, FAQ, footer e beneficios In Company.
- Numeros de marketing fixos como anos de atuacao, satisfacao e organizacoes
  atendidas.
- Progresso de estudo, pontos, materiais para download e duvidas do aluno,
  pois os botoes e indicadores estao explicitamente marcados como simulados.
- Receita e taxa de conversao do dashboard admin, tambem identificadas como
  simuladas.

## Ordem recomendada antes de popular o banco manualmente

1. Executar as migrations existentes para liberar catalogo, turmas,
   inscricoes, leads, RLS, certificados e pagamentos.
2. Validar por API que `curso`, `turma`, `instrutor`, `curso_instrutor`,
   `lead` e `registrar_inscricao_publica` existem.
3. Criar uma nova migration, rastreada pela story, para `trilha`,
   `post_blog`, campos estruturados de In Company e papeis de acesso.
4. Somente depois inserir dados reais do catalogo, posts e trilhas ou trocar
   os mocks por queries.

## Arquivos principais

- `supabase/migrations/20260512193000_initial_rh_cursos_schema.sql`
- `supabase/migrations/20260513100000_sprint1_security.sql`
- `supabase/migrations/20260513200000_sprint2_integrity.sql`
- `supabase/migrations/20260513300000_sprint3_performance.sql`
- `supabase/migrations/20260513400000_sprint4_evolution.sql`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/database.types.ts`
- `src/lib/supabase/mappers.ts`
- `src/lib/supabase/rh-cursos-api.ts`
- `src/lib/app-store.tsx`
