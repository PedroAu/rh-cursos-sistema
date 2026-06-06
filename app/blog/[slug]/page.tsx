import type { Metadata } from "next";

import { BlogPostClient } from "@/components/page-clients/blog-post-client";
import { mockBlogPosts } from "@/data";
import { fetchBlogPostsFromSupabase } from "@/lib/supabase/rh-cursos-api";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getBlogPosts() {
  try {
    return (await fetchBlogPostsFromSupabase()) ?? mockBlogPosts;
  } catch {
    return mockBlogPosts;
  }
}

export async function generateStaticParams() {
  return (await getBlogPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getBlogPosts()).find((item) => item.slug === slug);

  if (!post) {
    return {
      title: "Post não encontrado | RH Cursos"
    };
  }

  return {
    title: `${post.title} | RH Cursos`,
    description: post.summary
  };
}

export default function Page() {
  return <BlogPostClient />;
}
