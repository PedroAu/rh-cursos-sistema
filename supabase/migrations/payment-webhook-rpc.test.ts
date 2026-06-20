import { readFileSync } from "node:fs";

describe("payment webhook RPC migration", () => {
  const atomicSql = readFileSync(
    "supabase/migrations/20260619195800_payment_webhook_rpc.sql",
    "utf8",
  );
  const timestampSql = readFileSync(
    "supabase/migrations/20260619203000_payment_webhook_timestamp_ordering.sql",
    "utf8",
  );

  it("deduplicates event audit rows inside the RPC", () => {
    expect(atomicSql).toContain(
      "drop function if exists public.apply_payment_webhook_event(text, text, text, payment_status, jsonb)",
    );
    expect(timestampSql).toContain("on conflict (asaas_event_id) do nothing");
    expect(timestampSql).toContain("get diagnostics v_inserted = row_count");
  });

  it("orders status application by webhook event timestamp instead of status rank", () => {
    expect(timestampSql).toContain("add column if not exists status_event_at timestamptz");
    expect(timestampSql).toContain("p_event_created_at timestamptz");
    expect(timestampSql).toContain("p_event_created_at >= p.status_event_at");
    expect(timestampSql).toContain("drop function if exists public.payment_status_rank(payment_status)");
    expect(timestampSql).not.toContain("payment_status_rank(p_new_status)");
  });

  it("allows unknown statuses to be audited without updating the enum column", () => {
    expect(timestampSql).toContain("p_new_status       payment_status");
    expect(timestampSql).toContain("p_new_status is not null");
  });

  it("returns the payment status currently persisted after applying ordering guards", () => {
    expect(timestampSql).toContain("applied_status payment_status");
    expect(timestampSql).toContain("select status into v_payment_status");
    expect(timestampSql).toContain("return query select v_payment_id, (v_inserted = 0), v_payment_status");
  });
});
