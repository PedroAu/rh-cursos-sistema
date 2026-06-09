import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Link, useParams } from "@/lib/router-compat";

import { BlogCard } from "@/components/blog/blog-card";
import { EmptyState } from "@/components/common/empty-state";
import { SectionTitle } from "@/components/common/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/app-store";
import { formatDate } from "@/lib/utils";

export function BlogPostPage() {
  const { slug } = useParams();
  const { blogPosts, courses } = useAppStore();

  const post = blogPosts.find((item) => item.slug === slug);
  const relatedPosts = blogPosts.filter((item) => item.slug !== slug && item.category === post?.category).slice(0, 3);
  const relatedCourse = courses.find((course) => course.id === post?.relatedCourseId);

  if (!post) {
    return (
      <section className="page-section">
        <div className="container">
          <EmptyState title="Post não encontrado." description="Volte ao blog para explorar os conteúdos disponíveis." />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-section">
        <div className="container grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="space-y-8">
            <div className="space-y-4">
              <span className="eyebrow">{post.category}</span>
              <h1 className="text-4xl font-semibold md:text-5xl">{post.title}</h1>
              <p className="text-lg leading-8 text-muted-foreground">{post.summary}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDate(post.date)}</div>
                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{post.readingTime}</div>
              </div>
            </div>
            <Card>
              <CardContent className="space-y-5 p-7">
                {post.content.split("\n\n").map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </CardContent>
            </Card>
          </article>

          <div className="space-y-6">
            <Card className="bg-primary text-white">
              <CardContent className="space-y-4 p-6">
                <div className="text-sm uppercase tracking-[0.18em] text-blue-100/80">CTA relacionado</div>
                <h3 className="text-2xl font-semibold text-white">{relatedCourse?.title}</h3>
                <p className="text-sm leading-6 text-blue-50/80">
                  Conecte o conteúdo do artigo à jornada comercial com um CTA direto para o curso relacionado.
                </p>
                {relatedCourse ? (
                  <Button asChild className="bg-white text-primary hover:bg-white/90">
                    <Link to={`/curso?slug=${relatedCourse.slug}`}>
                      Ver curso relacionado
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <SectionTitle eyebrow="Relacionados" title="Outros conteúdos da mesma categoria" />
              <div className="grid gap-4">
                {relatedPosts.map((item) => (
                  <BlogCard key={item.id} post={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
