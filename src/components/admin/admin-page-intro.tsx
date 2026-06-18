import { Badge } from "@/components/ui/badge";

type AdminPageIntroProps = {
  badge: string;
  title: string;
  description: string;
};

export function AdminPageIntro({ badge, title, description }: AdminPageIntroProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-3xl space-y-2">
        <Badge className="w-fit" variant="gold">
          {badge}
        </Badge>
        <h1 className="font-heading text-3xl font-bold leading-tight text-brand-navy-700 md:text-4xl">
          {title}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
