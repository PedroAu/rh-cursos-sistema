"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import {
  DP_ZERO_CHECKOUT_PATH,
  DP_ZERO_CTA_LABEL,
  DP_ZERO_SLUG
} from "@/features/public/landing-pages/departamento-pessoal-do-zero/content";

export function DepartmentPersonnelZeroCta({ className = "" }: { className?: string }) {
  return (
    <Button asChild size="lg" className={className}>
      <Link
        href={DP_ZERO_CHECKOUT_PATH}
        onClick={() =>
          trackEvent("inscricao_cta", {
            course: DP_ZERO_SLUG,
            origin: "lp_departamento_pessoal_do_zero"
          })
        }
      >
        {DP_ZERO_CTA_LABEL}
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Link>
    </Button>
  );
}
