import { NextResponse } from "next/server";
import { verifyPaymentStatusToken } from "@/lib/payments/status-token";
import { createAdminClient } from "@/lib/supabase/admin";

type PaymentStatusRow = {
  status: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chargeId: string }> },
) {
  const { chargeId } = await params;

  if (!chargeId || !/^pay_[A-Za-z0-9_-]{1,80}$/.test(chargeId)) {
    return NextResponse.json({ error: "chargeId is required" }, { status: 400 });
  }

  const token =
    new URL(request.url).searchParams.get("token") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token || !verifyPaymentStatusToken(token, chargeId).ok) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Service-role read stays server-only and is constrained to a token-validated
  // charge id, returning only the payment status.
  const supabase = createAdminClient();
  const result = await supabase
    .from("payments")
    .select("status")
    .eq("asaas_charge_id", chargeId)
    .maybeSingle<PaymentStatusRow>();

  if (result.error || !result.data) {
    return NextResponse.json(
      { error: "payment not found" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { status: result.data.status },
    { headers: { "Cache-Control": "no-store" } },
  );
}
