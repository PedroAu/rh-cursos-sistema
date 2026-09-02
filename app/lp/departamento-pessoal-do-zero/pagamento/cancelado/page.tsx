import type { Metadata } from "next";

import { DepartmentPersonnelZeroCampaignShell } from "@/features/public/landing-pages/departamento-pessoal-do-zero/department-personnel-zero-campaign-shell";
import { DepartmentPersonnelZeroPaymentStatus } from "@/features/public/landing-pages/departamento-pessoal-do-zero/department-personnel-zero-payment-status";

export const metadata: Metadata = {
  title: "Pagamento cancelado | Departamento Pessoal do Zero",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <DepartmentPersonnelZeroCampaignShell>
      <DepartmentPersonnelZeroPaymentStatus status="cancelado" />
    </DepartmentPersonnelZeroCampaignShell>
  );
}
