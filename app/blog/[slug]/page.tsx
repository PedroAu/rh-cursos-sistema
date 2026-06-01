import type { Metadata } from "next";

import { BlogPostClient } from "@/components/page-clients/blog-post-client";
import { mockBlogPosts } from "@/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return mockBlogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = mockBlogPosts.find((item) => item.slug === slug);

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
