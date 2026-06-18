import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  items: FaqItem[];
  className?: string;
};

export function FaqSection({
  eyebrow = "FAQ",
  title,
  description,
  items,
  className,
}: FaqSectionProps) {
  return (
    <section className={cn("mx-auto w-full max-w-4xl", className)}>
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Badge variant="gold">{eyebrow}</Badge>
        <div className="space-y-3">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <Accordion collapsible className="w-full" type="single">
            {items.map((item, index) => (
              <AccordionItem
                className={index === items.length - 1 ? "border-b-0" : undefined}
                key={item.question}
                value={item.question}
              >
                <AccordionTrigger className="px-6">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-6">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
}

