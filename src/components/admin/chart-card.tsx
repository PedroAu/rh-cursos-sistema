import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ChartCard({
  title,
  description,
  children,
  summary,
}: {
  title: string;
  description: string;
  children: ReactNode;
  summary?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-[4/3] min-h-72 sm:aspect-video xl:aspect-[16/9]">
          {children}
        </div>
        {summary ? <div className="border-t border-border pt-4">{summary}</div> : null}
      </CardContent>
    </Card>
  );
}
