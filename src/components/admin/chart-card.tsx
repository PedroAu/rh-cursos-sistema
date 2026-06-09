import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="aspect-[4/3] min-h-72 sm:aspect-video xl:aspect-[16/9]">
        {children}
      </CardContent>
    </Card>
  );
}
