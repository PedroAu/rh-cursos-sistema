import type { Metadata } from "next";

import { DepartmentPersonnelZeroCampaignShell } from "@/features/public/landing-pages/departamento-pessoal-do-zero/department-personnel-zero-campaign-shell";
import { DepartmentPersonnelZeroCheckout } from "@/features/public/landing-pages/departamento-pessoal-do-zero/department-personnel-zero-checkout";
import { isAsaasInterestFreeInstallmentsEnabled } from "@/lib/payments/asaas/config";

export const metadata: Metadata = {
  title: "Inscrição — Departamento Pessoal do Zero",
  description: "Complete seus dados e escolha Pix ou cartão no ambiente seguro do Asaas.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <DepartmentPersonnelZeroCampaignShell>
      <DepartmentPersonnelZeroCheckout
        interestFreeInstallmentsConfirmed={isAsaasInterestFreeInstallmentsEnabled()}
      />
    </DepartmentPersonnelZeroCampaignShell>
  );
}
