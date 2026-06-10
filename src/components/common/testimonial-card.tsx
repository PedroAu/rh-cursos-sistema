import { Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Testimonial } from "@/types";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = testimonial.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <Card className="h-full border-primary/10">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="font-display text-base">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-base font-semibold text-foreground">{testimonial.name}</div>
            <div className="text-sm text-label-secondary">
              {testimonial.role} • {testimonial.organization}
            </div>
          </div>
        </div>
        <div className="flex gap-1 text-accent">
          {Array.from({ length: testimonial.rating }).map((_, index) => (
            <Star key={index} className="h-4 w-4 fill-current" />
          ))}
        </div>
        <p className="text-sm leading-7 text-label-secondary">{testimonial.text}</p>
        <div className="rounded-lg bg-secondary/60 px-4 py-3 text-sm font-medium text-foreground">
          {testimonial.course}
        </div>
      </CardContent>
    </Card>
  );
}
