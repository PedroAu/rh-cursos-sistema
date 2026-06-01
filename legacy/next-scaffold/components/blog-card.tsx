"use client";

import Link from "next/link";

import type { BlogPost } from "@/lib/site-data";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <>
      <article className={`surface-card blog-card ${post.featured ? "featured" : ""}`}>
        <span className="pill">{post.category}</span>
        <div className="stack-sm">
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
        </div>
        <div className="meta">
          <span>{post.author}</span>
          <span>{post.publishedAt}</span>
          <span>{post.readingTime}</span>
        </div>
        <Link className="button-outline" href={`/blog/${post.slug}`}>
          Ler artigo
        </Link>
      </article>

      <style jsx>{`
        .blog-card {
          padding: 24px;
          display: grid;
          gap: 18px;
          height: 100%;
        }

        .featured {
          background:
            linear-gradient(145deg, rgba(27, 47, 94, 0.96), rgba(44, 74, 143, 0.9)),
            var(--color-primary);
          color: var(--color-white);
        }

        h3 {
          margin: 0;
          font-family: var(--font-merriweather), serif;
          font-size: 1.42rem;
          line-height: 1.3;
        }

        p {
          margin: 0;
          line-height: 1.7;
        }

        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          color: inherit;
          opacity: 0.75;
          font-size: 0.92rem;
        }
      `}</style>
    </>
  );
}
