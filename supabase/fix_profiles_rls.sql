-- =============================================================================
-- EC Cooperative — fix_profiles_rls.sql  (WHAT WAS ACTUALLY APPLIED, 2026-08-18)
-- -----------------------------------------------------------------------------
-- ROOT CAUSE: the live `profiles` table had a policy named
--   "Admins can view all profiles"  (SELECT)
--   USING ( exists ( select 1 from profiles p where p.id = auth.uid() and p.role='admin' ) )
-- Because the USING clause queries `profiles` again, RLS re-evaluated on that
-- subquery -> infinite recursion -> Postgres 42P17. This 500'd every page that
-- reads profiles through the anon/server client (dashboard, admin, whoami).
--
-- FIX: drop that single recursive policy. The remaining profiles policies
-- (auth.uid()=id, and is_admin() which is SECURITY DEFINER) are non-recursive,
-- so the recursion is fully resolved. No other policy needed to change.
--
-- This file is idempotent and safe to re-run.
-- =============================================================================

drop policy if exists "Admins can view all profiles" on public.profiles;

-- Verify (anon key) — must return HTTP 200 now:
--   curl -s -w "\nHTTP=%{http_code}\n" \
--     -H "apikey: <anon>" -H "Authorization: Bearer <anon>" \
--     "https://wkijomnsaekmlkdveumb.supabase.co/rest/v1/profiles?select=id&limit=1"
