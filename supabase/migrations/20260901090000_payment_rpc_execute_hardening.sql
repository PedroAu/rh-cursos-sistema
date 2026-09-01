-- Payment webhook RPCs are an internal service boundary.  Supabase creates
-- EXECUTE grants for PUBLIC by default; without these revokes an anonymous
-- client could call the SECURITY DEFINER function and mutate payment state.

revoke execute on function public.apply_payment_webhook_event(
  text, text, text, payment_status, timestamptz, jsonb
) from public, anon, authenticated;

revoke execute on function public.apply_payment_webhook_event(
  text, text, text, payment_status, jsonb
) from public, anon, authenticated;

grant execute on function public.apply_payment_webhook_event(
  text, text, text, payment_status, timestamptz, jsonb
) to service_role;

grant execute on function public.apply_payment_webhook_event(
  text, text, text, payment_status, jsonb
) to service_role;
