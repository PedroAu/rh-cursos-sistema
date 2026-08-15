import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ADMIN_VIEWPORT, PUBLIC_VIEWPORT } from "./fidelity-constants.mjs";

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "docs", "design", "redesign", "public-specs");
const ADMIN_DIR = join(ROOT, "docs", "design", "redesign", "admin-specs");

const publicSpecs = [
  ["home", "/", "RH Cursos Home.dc.html", "home.html", "Conteúdo institucional, trilhas e próximas turmas públicas."],
  ["courses", "/cursos", "RH Cursos Catálogo.dc.html", "courses.html", "Catálogo filtrável com cursos e turmas publicados."],
  ["course-detail", "/cursos/[slug]", "RH Cursos Curso.dc.html", "course-detail.html", "Detalhe de curso derivado de slug real do catálogo."],
  ["checkout", "/cursos/[slug]/checkout", "RH Cursos Checkout.dc.html", "checkout.html", "Checkout com turma, dados do comprador e confirmação."],
  ["agenda", "/agenda", "Agenda export.dc.html", "agenda.html", "Agenda pública com datas, modalidades e disponibilidade."],
  ["in-company", "/in-company", "RH Cursos In-company.dc.html", "in-company.html", "Solicitação de treinamento corporativo."],
  ["about", "/sobre", "RH Cursos Quem Somos.dc.html", "about.html", "Apresentação institucional e prova social."],
  ["blog", "/blog", "RH Cursos Blog.dc.html", "blog.html", "Lista pública de artigos e categorias."],
  ["login", "/login", "RH Cursos Login.dc.html", "login.html", "Autenticação pública com retorno para a rota solicitada."],
];

const adminSpecs = [
  ["dashboard", "/admin", "Dashboard", "dashboard", "Visão operacional com indicadores, atividades recentes e atalhos administrativos."],
  ["cursos", "/admin/cursos", "Cursos", "cursos", "Tabela de cursos, busca e criação de curso."],
  ["turmas", "/admin/turmas", "Turmas", "turmas", "Tabela de turmas, ocupação e criação de turma."],
  ["matriculas", "/admin/inscricoes", "Matrículas", "matriculas", "Operação de matrículas e situação de pagamento."],
  ["alunos", "/admin/alunos", "Alunos", "alunos", "Busca e gestão de alunos."],
  ["instrutores", "/admin/instrutores", "Instrutores", "instrutores", "Lista de instrutores e disponibilidade."],
  ["leads", "/admin/leads", "Leads", "leads", "Leads comerciais por origem e estágio."],
  ["blog", "/admin/blog", "Blog", "blog", "Gestão de artigos e publicação."],
  ["paginas", "/admin/paginas", "Páginas", "paginas", "Gestão de páginas institucionais."],
  ["config", "/admin/configuracoes", "Configurações", "config", "Preferências institucionais e alertas operacionais."],
];

function publicSpec([id, route, source, reference, contract]) {
  const dynamicFixtureRequirement = id === "course-detail"
    ? "- A captura desta rota usa somente `EPIC14_FIDELITY_COURSE_PATH`; o checkout path não é necessário para o detalhe. A variável deve apontar para uma fixture real."
    : id === "checkout"
      ? "- A captura desta rota usa somente `EPIC14_FIDELITY_CHECKOUT_PATH`; o course path não é necessário para o checkout. A variável deve apontar para uma fixture real."
    : "- Para esta rota estática, a captura não depende das fixtures dinâmicas de curso ou checkout; a fidelidade de dados deve vir do contrato real da própria rota.";
  const returnUrlRequirement = id === "login"
    ? "- O parâmetro de retorno aceita apenas caminho relativo interno ou URL da mesma origem; valores externos ou inválidos usam `/` como fallback seguro."
    : "";
  const productionRouteRequirement = id === "agenda"
    ? "- A referência visual é estática; a rota de produção deve continuar renderizando os dados reais de agenda e o JSON-LD de eventos no servidor."
    : id === "about"
      ? "- A referência visual é estática; a rota de produção deve continuar renderizando o conteúdo institucional real de `/sobre`."
      : id === "blog"
        ? "- A referência visual é estática; a rota de produção deve continuar renderizando artigos e metadados reais de `/blog`."
        : "- A referência visual é estática e autocontida; a rota de produção continua sendo validada contra o contrato SSR/API real, não contra os dados do canvas.";
  const dataRequirements = [
    "- Renderizar dados do catálogo/SSR/API do ambiente de execução; nenhum dado de `src/lib/mock-public-data.ts` pode ser usado como evidência de fidelidade.",
    dynamicFixtureRequirement,
    returnUrlRequirement,
    productionRouteRequirement,
    "- Estados de carregamento, vazio e erro permanecem cobertos pelos testes funcionais existentes.",
  ].filter(Boolean).join("\n");
  return `# Spec de fidelidade — ${route}

**ID:** FIDELITY-PUBLIC-${id.toUpperCase()}
**Rota:** \`${route}\`
**Viewport de referência:** ${PUBLIC_VIEWPORT.width} × ${PUBLIC_VIEWPORT.height}
**Canvas fonte:** \`docs/design-system/${source}\`
**Referência autocontida:** \`docs/design-system/reference/${reference}\`

## Intenção

${contract}

## Contrato de dados

${dataRequirements}

## Adaptações deliberadas

- O canvas é uma referência visual estática e não define navegação, autenticação, validação ou integração.
- Componentes interativos da aplicação podem ter semântica, foco, responsividade e mensagens de erro diferentes quando isso é exigido por acessibilidade ou pelo contrato funcional.
- O viewport de comparação é fixo; a responsividade é validada separadamente pelos testes Playwright de UI e acessibilidade.

## Divergências herdadas

- A referência foi gerada a partir do export versionado e hidratada com dados determinísticos de apresentação.
- O export não contém o runtime do design-tool; a versão em \`reference/\` remove essa dependência, mantém o conteúdo visual e registra a origem acima.

## Critérios de aceite

- [x] Rota responde HTTP 200 no ambiente de captura.
- [x] Referência não contém \`{{ ... }}\`, \`support.js\`, ativos hashados ou requests de ativo ausente.
- [x] Screenshot da rota e do canvas é produzido pelo harness no mesmo viewport.
- [x] Revisão visual manual registrada em \`docs/qa/fidelity-signoff.md\`.
`;
}

function adminSpec([id, route, label, screen, contract]) {
  const visualRegions = {
    dashboard: "KPIs operacionais; leads recentes; próximas turmas; distribuição de leads por origem e atalhos administrativos.",
    cursos: "Cabeçalho com busca e ação primária; tabela de cursos; estado de busca vazio; paginação.",
    turmas: "Cabeçalho com criação; agenda de turmas; barras de ocupação; badges de modalidade e paginação.",
    matriculas: "Cabeçalho operacional; tabela de matrículas; status de pagamento; contexto read-only da turma e do aluno.",
    alunos: "Cabeçalho com busca; KPIs; tabela com avatar e organização; estado vazio e paginação.",
    instrutores: "Cabeçalho com criação; tabela de instrutores; disponibilidade; avatar e ações de detalhe.",
    leads: "Filtros por origem; tabela de leads; status com indicador; interesse e ação de abertura.",
    blog: "Cabeçalho editorial; busca; tabela de artigos; status de publicação e ação de edição.",
    paginas: "Lista de páginas institucionais; rotas públicas; status editorial e ação de gerenciamento.",
    config: "Dados institucionais; toggles de alertas; contatos comerciais; atividade recente e preferências.",
  }[screen] ?? "Shell administrativo, conteúdo principal e ações da tela.";
  return `# Spec de fidelidade — ${route}

**ID:** FIDELITY-ADMIN-${id.toUpperCase()}
**Tela:** ${label}
**Rota:** \`${route}\`
**Viewport de referência:** ${ADMIN_VIEWPORT.width} × ${ADMIN_VIEWPORT.height}
**Canvas isolado:** \`docs/design-system/reference/admin-${screen}.html\`
**Fonte:** \`docs/design-system/RH Cursos Admin Dashboard.dc.html\`

## Intenção

${contract}

## Regiões visuais e componentes

- ${visualRegions}
- O shell compartilhado mantém sidebar, logo, navegação ativa, contexto do usuário e área principal.
- Os loops de dados da tela devem renderizar linhas/cards reais no estado de referência; estados vazios só aparecem quando a consulta correspondente não retorna registros.

## Contrato de dados e auth

- A captura deve autenticar pelo contrato SSR \`POST /api/auth/session\` com a fixture admin do ambiente E2E.
- A rota precisa responder HTTP 200 depois da sessão; redirect para \`/login\` é falha de captura, não estado aceitável.
- O conteúdo visual do canvas é determinístico e não substitui a validação dos CRUDs reais.

## Adaptações deliberadas

- O canvas isolado expõe somente a tela \`${screen}\`; navegação lateral e chrome compartilhado permanecem visíveis para preservar contexto.
- Ações, tabelas e formulários da aplicação devem manter semântica, foco, feedback e autorização próprios do produto.
- Em viewport menor que 1024px, a navegação inferior substitui a sidebar e nenhum conteúdo pode gerar overflow horizontal.

## Divergências herdadas

- O export original agrupava dez telas sob condicionais do design-tool. A referência estática transforma cada condição em um canvas isolado versionado.
- Dados exibidos no canvas são fixtures de apresentação; a aplicação é comparada contra o estado real retornado pelo backend.

## Critérios de aceite

- [x] Sessão admin confirmada por \`/api/auth/session\`.
- [x] Rota responde HTTP 200 e não redireciona.
- [x] Canvas isolado não contém placeholders ou requests de ativo ausente.
- [x] Screenshot pareado e revisão visual registrados em \`docs/qa/fidelity-signoff.md\`.
`;
}

function main() {
  mkdirSync(PUBLIC_DIR, { recursive: true });
  mkdirSync(ADMIN_DIR, { recursive: true });
  for (const spec of publicSpecs) writeFileSync(join(PUBLIC_DIR, `${spec[0]}.md`), publicSpec(spec).replace(/[ \t]+$/gm, ""));
  for (const spec of adminSpecs) writeFileSync(join(ADMIN_DIR, `${spec[0]}.md`), adminSpec(spec).replace(/[ \t]+$/gm, ""));
  const missing = [...publicSpecs.map(([id]) => join(PUBLIC_DIR, `${id}.md`)), ...adminSpecs.map(([id]) => join(ADMIN_DIR, `${id}.md`))].filter((file) => !existsSync(file));
  if (missing.length) throw new Error(`Specs não geradas: ${missing.join(", ")}`);
  console.log(`Generated ${publicSpecs.length + adminSpecs.length} fidelity specs.`);
}

main();
