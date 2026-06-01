"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { BlogCard } from "@/components/blog-card";
import type { BlogPost } from "@/lib/site-data";

const categories = ["Todos", "eSocial", "DP", "Compras", "Licitações", "Liderança", "IA Gov", "Carreira"];

export function BlogExplorer({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const deferredQuery = useDeferredValue(query);

  const filteredPosts = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesQuery =
        !normalized ||
        [post.title, post.excerpt, post.category, post.author]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesCategory = category === "Todos" || post.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, deferredQuery, posts]);

  return (
    <div className="stack-lg">
      <div className="surface-card explorer">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busque por assunto, autor ou área"
        />
        <div className="pill-row">
          {categories.map((option) => (
            <button
              key={option}
              type="button"
              className={`pill-button ${category === option ? "active" : ""}`}
              onClick={() => setCategory(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="site-grid grid-3">
        {filteredPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      <style jsx>{`
        .explorer {
          display: grid;
          gap: 18px;
          padding: 20px;
        }

        input {
          min-height: 54px;
          padding: 0 16px;
          border-radius: 16px;
          border: 1px solid rgba(27, 47, 94, 0.12);
          background: rgba(255, 255, 255, 0.96);
        }

        .pill-button {
          min-height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(27, 47, 94, 0.12);
          background: rgba(255, 255, 255, 0.9);
          font-weight: 700;
        }

        .pill-button.active {
          background: var(--color-primary);
          color: var(--color-white);
        }
      `}</style>
    </div>
  );
}
