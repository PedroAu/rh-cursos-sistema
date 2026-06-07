import type { Metadata } from "next";

import { BlogPostClient } from "@/components/page-clients/blog-post-client";
import { mockBlogPosts } from "@/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getBlogPosts() {
  return mockBlogPosts;
}

export async function generateStaticParams() {
  return (await getBlogPosts()).map((post: any) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getBlogPosts()).find((item: any) => item.slug === slug);

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
