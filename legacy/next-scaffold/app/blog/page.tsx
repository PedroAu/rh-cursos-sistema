import { BlogExplorer } from "@/components/blog-explorer";
import { blogPosts } from "@/lib/site-data";

export default function BlogPage() {
  return (
    <section className="section">
      <div className="container stack-lg">
        <div className="section-heading">
          <span className="eyebrow">M06 • Blog</span>
          <h1>Conhecimento que transforma</h1>
          <p>
            Conteúdo pensado para gerar tráfego orgânico qualificado e reforçar autoridade
            em eSocial, DP, Compras, Licitações e liderança pública.
          </p>
        </div>
        <BlogExplorer posts={blogPosts} />
      </div>
    </section>
  );
}
