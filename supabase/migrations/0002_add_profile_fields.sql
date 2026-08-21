-- =============================================================================
-- 0002_add_profile_fields.sql
-- -----------------------------------------------------------------------------
-- The admin "Members Management" page (app/admin/members/page.tsx) selects the
-- columns savings_plan, date_of_birth, state_of_origin, occupation and
-- sponsor_name, and components/admin/members-table.tsx renders them. Those
-- columns were MISSING from the live `public.profiles` table, so the query
-- failed with "column profiles.savings_plan does not exist" and the page
-- silently rendered an empty list ("No members yet") even though the admin was
-- correctly authenticated (auth.uid() resolved fine).
--
-- We ADD the missing columns so the schema matches what the UI expects.
-- Idempotent via ADD COLUMN IF NOT EXISTS. All columns are nullable text so
-- existing rows are unaffected (they simply show NULL / "—" in the UI) and no
-- writes break. RLS is unchanged — admin gating still goes through is_admin().
-- =============================================================================

alter table public.profiles add column if not exists savings_plan  text;
alter table public.profiles add column if not exists date_of_birth text;
alter table public.profiles add column if not exists state_of_origin text;
alter table public.profiles add column if not exists occupation      text;
alter table public.profiles add column if not exists sponsor_name   text;
