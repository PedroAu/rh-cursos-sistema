import { Mail } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { useSearchParams } from "@/lib/router-compat";

import { BlogCard } from "@/components/blog/blog-card";
import { EmptyState } from "@/components/common/empty-state";
import { SearchInput } from "@/components/common/search-input";
import { SectionTitle } from "@/components/common/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/app-store";
import { useHotkey } from "@/hooks/use-hotkey";

const categories = ["Todos", "Departamento Pessoal", "eSocial", "Gestão Pública", "Liderança", "Tecnologia", "Assédio e Compliance"] as const;

export function BlogPage() {
  const { blogPosts, createLead } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState<(typeof categories)[number]>(
    (searchParams.get("category") as (typeof categories)[number]) || "Todos"
  );
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (category !== "Todos") params.category = category;
    setSearchParams(params);
  }, [query, category, setSearchParams]);

  useHotkey(
    (event) => event.key === "/" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName),
    (event) => {
      event.preventDefault();
      searchRef.current?.focus();
    }
  );

  const posts = useMemo(
    () =>
      blogPosts.filter(
        (post) =>
          post.status !== "Arquivado" &&
          (!query || [post.title, post.summary, post.category].join(" ").toLowerCase().includes(query.toLowerCase())) &&
          (category === "Todos" || post.category === category)
      ),
    [blogPosts, category, query]
  );

  const featuredPost = posts[0];

  const submitNewsletter = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error("Informe um e-mail válido para continuar.");
      return;
    }

    try {
      await createLead({
        name: newsletterEmail.split("@")[0],
        email: newsletterEmail,
        phone: "",
        courseInterest: "Newsletter",
        origin: "Blog",
        message: "Cadastro de newsletter pelo blog."
      });
      setNewsletterEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir o cadastro.");
    }
  };

  return (
    <section className="page-section">
      <div className="container space-y-8">
        <SectionTitle
          eyebrow="Conteúdo e SEO"
          title="Conteúdo institucional para apoiar decisão e atualização profissional."
          description="Artigos por categoria com temas de departamento pessoal, gestão pública, liderança e compliance."
        />

        <div className="surface-card grid gap-4 p-6 xl:grid-cols-[1.5fr_1fr]">
          <SearchInput
            ref={searchRef}
            placeholder="Busque por tema, categoria ou assunto"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  category === item ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-secondary hover:text-primary"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {featuredPost ? (
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <BlogCard post={featuredPost} featured />
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="rounded-lg bg-secondary/60 p-3 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Newsletter</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Capture leads interessados em conteúdo e capacitações futuras.
                  </p>
                </div>
                <Input
                  placeholder="Seu e-mail"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={submitNewsletter}
                >
                  Quero receber conteúdos
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {posts.length ? (
          <div className="grid gap-5 xl:grid-cols-3">
            {posts.slice(1).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhum post encontrado." description="Ajuste a busca ou escolha outra categoria para visualizar conteúdos." />
        )}
      </div>
    </section>
  );
}
