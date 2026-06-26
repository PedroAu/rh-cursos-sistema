import { CalendarDays, Clock3, Tag } from "lucide-react";
import { Link } from "@/lib/router-compat";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <Card
      variant={featured ? "filled" : "base"}
      interactive={false}
      size="md"
      className={`h-full overflow-hidden ${featured ? "bg-deep-navy text-white" : ""}`}
    >
      <div className={`min-h-40 border-b ${featured ? "border-white/10 bg-white/5" : "border-primary/8 bg-secondary/30"} p-6`}>
        <div className={`inline-flex rounded px-4 py-2 text-label font-semibold uppercase tracking-[0.16em] ${
          featured ? "bg-white/12 text-white" : "bg-surface-muted text-deep-navy"
        }`}>
          {post.category}
        </div>
      </div>
      <CardContent className="space-y-5 p-6">
        <div className="space-y-3">
          <h3 className={`text-article font-bold ${featured ? "text-white" : ""}`}>
            {post.title}
          </h3>
          <p className={`text-sm leading-7 ${featured ? "text-white/75" : "text-muted-foreground"}`}>
            {post.summary}
          </p>
        </div>
        <div className={`grid gap-2 text-sm ${featured ? "text-white/70" : "text-muted-foreground"}`}>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatDate(post.date)}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {post.readingTime}
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            {post.tags.join(" • ")}
          </div>
        </div>
        <Button
          asChild
          variant={featured ? "secondary" : "outline"}
          className={featured ? "bg-white text-primary hover:bg-white/[0.92]" : ""}
        >
          <Link to={`/blog/${post.slug}`}>Ler artigo</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
