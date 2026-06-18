import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type PaymentStatusRow = {
  status: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chargeId: string }> },
) {
  const { chargeId } = await params;

  if (!chargeId) {
    return NextResponse.json({ error: "chargeId is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const result = await supabase
    .from("payments")
    .select("status")
    .eq("asaas_charge_id", chargeId)
    .maybeSingle<PaymentStatusRow>();

  if (result.error || !result.data) {
    return NextResponse.json({ error: "payment not found" }, { status: 404 });
  }

  return NextResponse.json({ status: result.data.status });
}
