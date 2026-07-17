export type SitePage = {
  title: string;
  path: string;
  purpose: string;
};

/**
 * Rotas institucionais estáticas que existem no App Router. Páginas
 * transacionais, áreas autenticadas e rotas dinâmicas não entram neste
 * inventário editorial.
 */
export const SITE_PAGES = [
  { title: "Início", path: "/", purpose: "Apresentação institucional e destaques." },
  { title: "Cursos", path: "/cursos", purpose: "Catálogo público de capacitações." },
  { title: "Agenda", path: "/agenda", purpose: "Próximas turmas com inscrições abertas." },
  { title: "In company", path: "/in-company", purpose: "Soluções de capacitação para equipes." },
  { title: "Consultoria", path: "/consultoria", purpose: "Serviços especializados para organizações." },
  { title: "Quem somos", path: "/sobre", purpose: "História, atuação e posicionamento da empresa." },
  { title: "Blog", path: "/blog", purpose: "Conteúdos e artigos publicados." },
  { title: "Contato", path: "/contato", purpose: "Canais de contato e envio de mensagem." },
  { title: "Falar com especialista", path: "/falar-com-especialista", purpose: "Atendimento consultivo para interessados." },
] as const satisfies readonly SitePage[];
