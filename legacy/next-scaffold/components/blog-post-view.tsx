"use client";

import Link from "next/link";

import { BlogCard } from "@/components/blog-card";
import type { BlogPost, Course } from "@/lib/site-data";

export function BlogPostView({
  post,
  related,
  ctaCourse
}: {
  post: BlogPost;
  related: BlogPost[];
  ctaCourse: Course | null;
}) {
  return (
    <>
      <section className="section">
        <div className="container post-grid">
          <article className="stack-lg">
            <div className="section-heading">
              <span className="eyebrow">{post.category}</span>
              <h1>{post.title}</h1>
              <p>{post.excerpt}</p>
            </div>

            <div className="meta">
              <span>{post.author}</span>
              <span>{post.publishedAt}</span>
              <span>{post.readingTime}</span>
            </div>

            {post.sections.map((section) => (
              <section
                key={section.heading}
                id={section.heading.toLowerCase().replace(/\s+/g, "-")}
                className="article-section"
              >
                <h2>{section.heading}</h2>
                <div className="stack-md">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}

            {ctaCourse ? (
              <div className="surface-card inline-cta">
                <strong>Quer dominar este tema na prática?</strong>
                <p className="muted">{ctaCourse.title}</p>
                <Link className="button" href={`/cursos/${ctaCourse.slug}`}>
                  Ver curso relacionado
                </Link>
              </div>
            ) : null}

            <div className="surface-card author-box">
              <div className="author-photo">Autor</div>
              <div className="stack-sm">
                <strong>{post.author}</strong>
                <p>
                  Conteúdo assinado por quem vive a prática, traduz complexidade e forma
                  profissionais para agir com segurança.
                </p>
              </div>
            </div>

            {related.length ? (
              <div className="stack-md">
                <h2>Artigos relacionados</h2>
                <div className="site-grid grid-3">
                  {related.map((item) => (
                    <BlogCard key={item.slug} post={item} />
                  ))}
                </div>
              </div>
            ) : null}
          </article>

          <aside className="surface-card toc">
            <strong>Sumário</strong>
            <nav className="stack-sm">
              {post.sections.map((section) => (
                <a key={section.heading} href={`#${section.heading.toLowerCase().replace(/\s+/g, "-")}`}>
                  {section.heading}
                </a>
              ))}
            </nav>
            <div className="share stack-sm">
              <strong>Compartilhar</strong>
              <div className="button-row">
                <a
                  className="button-outline"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=https://rhcursos.com.br/blog/${post.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
                <a
                  className="button-outline"
                  href={`https://wa.me/?text=https://rhcursos.com.br/blog/${post.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <style jsx>{`
        .post-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.48fr;
          gap: 28px;
          align-items: start;
        }

        h1,
        h2 {
          margin: 0;
          font-family: var(--font-merriweather), serif;
          color: var(--color-primary);
        }

        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          color: rgba(61, 61, 61, 0.72);
          font-weight: 600;
        }

        .article-section {
          scroll-margin-top: 120px;
        }

        .article-section p,
        .article-section ul {
          margin: 0;
          line-height: 1.8;
        }

        .article-section ul {
          padding-left: 18px;
        }

        .inline-cta,
        .author-box,
        .toc {
          padding: 24px;
        }

        .author-box {
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 18px;
          align-items: center;
        }

        .author-photo {
          min-height: 120px;
          border-radius: 20px;
          display: flex;
          align-items: flex-end;
          padding: 14px;
          background:
            linear-gradient(180deg, rgba(200, 150, 46, 0.14), rgba(27, 47, 94, 0.88)),
            linear-gradient(135deg, #d8c09e, #6f83a2);
          color: var(--color-white);
          font-weight: 700;
        }

        .toc {
          position: sticky;
          top: 104px;
          display: grid;
          gap: 16px;
        }

        .toc a {
          color: var(--color-primary);
          font-weight: 700;
        }

        @media (max-width: 1199px) {
          .post-grid,
          .author-box {
            grid-template-columns: 1fr;
          }

          .toc {
            position: static;
          }
        }
      `}</style>
    </>
  );
}
