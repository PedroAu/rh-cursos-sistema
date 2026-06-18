import { Card, CardContent } from "@/components/ui/card";

type TocItem = {
  id: string;
  label: string;
};

type TocCardProps = {
  title: string;
  items: TocItem[];
};

export function TocCard({ title, items }: TocCardProps) {
  return (
    <Card className="sticky top-30">
      <CardContent className="space-y-4 p-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-brand-navy-700">
          {title}
        </p>
        <nav className="max-h-80 overflow-y-auto pr-1" aria-label={title}>
          <div className="space-y-1.5">
            {items.map((item) => (
              <a
                className="block rounded-md px-3 py-2 text-sm font-semibold leading-6 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`#${item.id}`}
                key={item.id}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </CardContent>
    </Card>
  );
}
