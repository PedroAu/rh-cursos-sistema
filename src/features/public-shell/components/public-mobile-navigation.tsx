"use client";

import { Menu, MessageCircle } from "lucide-react";
import Image from "next/image";

import { publicNavItems } from "@/features/public-shell/config/public-navigation";
import { company } from "@/lib/company";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function PublicMobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Abrir menu"
          className="material-nav-trigger border-primary/20 bg-white/90"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="space-y-6 border-primary/10 bg-background">
        <div>
          <Image src={company.logo.src} alt={company.logo.alt} width={453} height={285} className="h-20 w-auto" />
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Acesso rápido às principais áreas do site.
          </p>
        </div>
        <div className="grid gap-3">
          {publicNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="material-nav-card rounded-xl border border-primary/10 bg-white px-4 py-4 font-medium text-foreground shadow-soft"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="grid gap-3">
          <Button asChild variant="secondary" className="w-full">
            <Link to="/cursos">Ver cursos</Link>
          </Button>
          <Button asChild className="w-full">
            <Link to="/login">Admin</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <a href="#atendimento">
              <MessageCircle className="h-4 w-4" />
              Falar com atendimento
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
