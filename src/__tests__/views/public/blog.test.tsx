import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@/__tests__/utils";
import { BlogPage } from "@/views/public/Blog";
import type { BlogPost } from "@/types";

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  setSearchParams: vi.fn(),
  createLead: vi.fn()
}));

function buildPost(overrides: Partial<BlogPost>): BlogPost {
  return {
    id: overrides.id ?? "post-id",
    title: overrides.title ?? "Título padrão",
    slug: overrides.slug ?? "slug-padrao",
    summary: "Resumo do post.",
    content: "Conteúdo completo.",
    category: overrides.category ?? "Licitações",
    tags: [],
    author: "Autor Teste",
    date: "2026-07-01",
    readingTime: overrides.readingTime ?? "5 min",
    status: "Publicado",
    image: "",
    relatedCourseId: "",
    ...overrides
  };
}

const mockStore = {
  blogPosts: [
    buildPost({
      id: "featured",
      slug: "nova-lei-licitacoes-7-erros-pregoes-2026",
      title: "7 erros que travam pregões em 2026"
    }),
    buildPost({
      id: "trending-1",
      slug: "pesquisa-de-precos-como-montar-uma-que-resiste-ao-tcu",
      title: "Pesquisa de preços: como montar uma que resiste ao TCU",
      category: "Licitações",
      readingTime: "9 min"
    }),
    buildPost({
      id: "trending-2",
      slug: "ripd-quando-deixa-de-ser-opcional",
      title: "RIPD: quando deixa de ser opcional",
      category: "LGPD",
      readingTime: "6 min"
    })
    // "canal-denuncias-que-as-pessoas-realmente-usam" e
    // "gestao-de-riscos-transformando-matriz-em-decisao" ficam de fora de
    // propósito para provar que slugs sem post publicado somem da lista.
  ],
  createLead: mocks.createLead
};

vi.mock("@/lib/router-compat", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
  useSearchParams: () => [mocks.params, mocks.setSearchParams]
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("@/lib/app-store", () => ({
  useAppStore: () => mockStore
}));

describe("BlogPage 'Em alta esta semana'", () => {
  it("mostra o título real do post de destino, nunca um título hardcoded divergente", () => {
    render(<BlogPage />);

    const trendingLink = screen
      .getAllByRole("link", { name: /Pesquisa de preços: como montar uma que resiste ao TCU/i })
      .find((link) => link.getAttribute("href") === "/blog/pesquisa-de-precos-como-montar-uma-que-resiste-ao-tcu");
    expect(trendingLink).toBeDefined();
    expect(trendingLink).toHaveAttribute(
      "href",
      "/blog/pesquisa-de-precos-como-montar-uma-que-resiste-ao-tcu"
    );

    const ripdLinks = screen.getAllByRole("link", { name: /RIPD: quando deixa de ser opcional/i });
    expect(ripdLinks.some((link) => link.getAttribute("href") === "/blog/ripd-quando-deixa-de-ser-opcional")).toBe(true);
  });

  it("nunca aponta para post inexistente ou não publicado", () => {
    render(<BlogPage />);

    expect(screen.queryByText(/canal-denuncias-que-as-pessoas-realmente-usam/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Indicadores que a alta gestão realmente acompanha/i })
    ).not.toBeInTheDocument();
  });
});
