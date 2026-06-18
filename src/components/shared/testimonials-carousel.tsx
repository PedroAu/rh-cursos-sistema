"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type TestimonialItem = {
  author: string;
  role: string;
  text: string;
};

type TestimonialsCarouselProps = {
  items: TestimonialItem[];
};

export function TestimonialsCarousel({ items }: TestimonialsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: "previous" | "next") {
    const track = trackRef.current;
    if (!track) return;

    const amount = Math.max(track.clientWidth * 0.86, 320);
    track.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  }

  return (
    <section aria-label="Depoimentos de alunos e clientes" className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          aria-label="Depoimento anterior"
          onClick={() => scrollByCard("previous")}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Button>
        <Button
          aria-label="Próximo depoimento"
          onClick={() => scrollByCard("next")}
          size="icon"
          type="button"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </Button>
      </div>

      <div
        aria-label="Lista de depoimentos roláveis. Use as setas do teclado para navegar."
        className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:thin] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 xl:gap-6"
        ref={trackRef}
        role="region"
        tabIndex={0}
      >
        {items.map((item) => (
          <Card className="min-h-75 min-w-full snap-start bg-white md:min-w-[calc(50%-0.5rem)] xl:min-w-[calc(33.333%-1rem)]" key={item.author}>
            <CardContent className="flex h-full flex-col gap-6 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-md bg-brand-gold/20 text-brand-navy-800">
                  <Quote className="size-6" aria-hidden="true" />
                </div>
                <Badge variant="secondary">Relato real</Badge>
              </div>
              <p className="flex-1 text-lg font-bold leading-8 text-brand-navy-900">{item.text}</p>
              <div>
                <p className="font-extrabold text-brand-navy-800">{item.author}</p>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
