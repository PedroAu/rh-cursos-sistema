import { readFileSync } from "node:fs";

describe("payment webhook RPC migration", () => {
  const sql = readFileSync(
    "supabase/migrations/20260619195800_payment_webhook_rpc.sql",
    "utf8",
  );

  it("deduplicates event audit rows inside the RPC", () => {
    expect(sql).toContain(
      "drop function if exists public.apply_payment_webhook_event(text, text, text, payment_status, jsonb)",
    );
    expect(sql).toContain("on conflict (asaas_event_id) do nothing");
    expect(sql).toContain("get diagnostics v_inserted = row_count");
  });

  it("prevents stale webhook deliveries from regressing payment status", () => {
    expect(sql).toContain("public.payment_status_rank(p_new_status) >= public.payment_status_rank(p.status)");
  });

  it("allows unknown statuses to be audited without updating the enum column", () => {
    expect(sql).toContain("p_new_status      payment_status");
    expect(sql).toContain("p_new_status is not null");
  });

  it("returns the payment status currently persisted after applying ordering guards", () => {
    expect(sql).toContain("applied_status payment_status");
    expect(sql).toContain("select status into v_payment_status");
    expect(sql).toContain("return query select v_payment_id, (v_inserted = 0), v_payment_status");
  });
});
