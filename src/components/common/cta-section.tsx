import { MessageCircle } from "lucide-react";
import { Link } from "@/lib/router-compat";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CTASection() {
  return (
    <Card className="mx-auto max-w-4xl overflow-hidden border-primary/10 bg-primary text-primary-foreground shadow-card">
      <CardContent className="space-y-8 p-8 md:p-10">
        <div className="max-w-3xl space-y-4">
          <h3 className="max-w-xl text-white">Pronto para ser referência?</h3>
          <p className="text-sm leading-8 text-white/75 md:text-base">
            Escolha a trilha certa para o seu desafio e comece a transformação que a sua equipe precisa.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="secondary">
            <Link to="/cursos">Ver trilhas de capacitação</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border border-white/12 bg-white/10 text-white hover:bg-white/15"
          >
            <a href="#atendimento">
              <MessageCircle className="h-4 w-4" />
              Falar com especialista
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
