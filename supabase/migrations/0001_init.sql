-- =============================================================================
-- EC Cooperative — migrations/0001_init.sql  (REGENERATED from live DB)
-- -----------------------------------------------------------------------------
-- This file is a FAITHFUL snapshot of the production schema + RLS policies,
-- introspected directly from the live Supabase project (2026-08-19). It is
-- idempotent: it uses CREATE TABLE IF NOT EXISTS / CREATE POLICY (via
-- DROP POLICY IF EXISTS + CREATE) so re-running is safe.
--
-- NOTE: Postgres does NOT support `CREATE POLICY IF NOT EXISTS` — the correct
-- idempotent pattern is `DROP POLICY IF EXISTS` then `CREATE POLICY`.
--
-- The recursive `profiles` policy ("Admins can view all profiles") that caused
-- 42P17 on 2026-08-18 was already removed (see fix_profiles_rls.sql). Admin
-- checks use the SECURITY DEFINER helper `public.is_admin()` to avoid recursion.
-- =============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- is_admin() — SECURITY DEFINER helper, bypasses RLS (no recursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  is_published boolean default true,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.deposits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  amount numeric not null,
  month text not null,
  year integer not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.fees (
  id uuid primary key default gen_random_uuid(),
  member_id uuid,
  amount numeric not null,
  fee_date date not null,
  created_at timestamptz default now()
);

create table if not exists public.financial_reports (
  id uuid primary key default uuid_generate_v4(),
  month text not null,
  year integer not null,
  total_assets numeric not null,
  deposit_ytd numeric not null,
  profit_ytd numeric not null,
  monthly_deposit numeric not null,
  monthly_profit numeric not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.loan_payments (
  id uuid primary key default uuid_generate_v4(),
  loan_id uuid not null,
  amount numeric not null,
  payment_date timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.loans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  amount numeric not null,
  purpose text not null,
  duration_months integer not null,
  guarantor_name text,
  guarantor_phone text,
  status text default 'pending',
  approved_by uuid,
  approved_at timestamptz,
  disbursed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.manual_adjustments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid,
  amount numeric not null,
  description text,
  year integer not null,
  month_number integer not null,
  created_by uuid,
  created_at timestamptz default now()
);

create table if not exists public.member_fees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  fee_type text default 'monthly',
  amount numeric default 0,
  month integer,
  year integer,
  paid boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  address text,
  next_of_kin_name text,
  next_of_kin_phone text,
  next_of_kin_relationship text,
  role text default 'member',
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  suspension_reason text
);

create table if not exists public.profits (
  id uuid primary key default gen_random_uuid(),
  member_id uuid,
  amount numeric not null,
  profit_date date not null,
  created_at timestamptz default now()
);

create table if not exists public.rollovers (
  id uuid primary key default gen_random_uuid(),
  member_id uuid,
  amount numeric,
  rollover_date date,
  created_at timestamptz default now()
);

create table if not exists public.shareholders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  shareholder_status text default 'Core Shareholder',
  active_status text default 'ACTIVE',
  registration_fee numeric default 0,
  yearly_fee numeric default 0,
  net_worth numeric default 0,
  total_deposit numeric default 0,
  shareholder_pct numeric default 0,
  ranking integer default 0,
  referrals integer default 0,
  updated_at timestamptz default now()
);

create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  key text,
  value text,
  created_at timestamptz default now()
);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  member_id uuid,
  amount numeric not null,
  withdrawal_date date not null,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- ENABLE RLS (idempotent)
-- ---------------------------------------------------------------------------
alter table public.announcements enable row level security;
alter table public.contact_messages enable row level security;
alter table public.deposits enable row level security;
alter table public.fees enable row level security;
alter table public.financial_reports enable row level security;
alter table public.loan_payments enable row level security;
alter table public.loans enable row level security;
alter table public.manual_adjustments enable row level security;
alter table public.member_fees enable row level security;
alter table public.profiles enable row level security;
alter table public.profits enable row level security;
alter table public.rollovers enable row level security;
alter table public.shareholders enable row level security;
alter table public.system_settings enable row level security;
alter table public.withdrawals enable row level security;

-- ---------------------------------------------------------------------------
-- POLICIES (idempotent: drop then create)
-- ---------------------------------------------------------------------------

-- announcements
drop policy if exists "announcements_admin_all" on public.announcements;
create policy "announcements_admin_all" on public.announcements for all
  using (public.is_admin())
  with check (public.is_admin() and (created_by is null or created_by = auth.uid()));

drop policy if exists "announcements_select_published" on public.announcements;
create policy "announcements_select_published" on public.announcements for select
  using (is_published = true);

-- contact_messages
drop policy if exists "contact_messages_admin_select" on public.contact_messages;
create policy "contact_messages_admin_select" on public.contact_messages for select
  using (public.is_admin());

drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update" on public.contact_messages for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "contact_messages_public_insert" on public.contact_messages;
create policy "contact_messages_public_insert" on public.contact_messages for insert
  with check (true);

-- deposits
drop policy if exists "savings_admin_delete" on public.deposits;
create policy "savings_admin_delete" on public.deposits for delete
  using (public.is_admin());

drop policy if exists "savings_admin_insert" on public.deposits;
create policy "savings_admin_insert" on public.deposits for insert
  with check (public.is_admin());

drop policy if exists "savings_admin_select" on public.deposits;
create policy "savings_admin_select" on public.deposits for select
  using (public.is_admin());

drop policy if exists "savings_admin_update" on public.deposits;
create policy "savings_admin_update" on public.deposits for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "savings_user_select_own" on public.deposits;
create policy "savings_user_select_own" on public.deposits for select
  using (auth.uid() = user_id);

-- fees
drop policy if exists "Admins full access fees" on public.fees;
create policy "Admins full access fees" on public.fees for all
  using (public.is_admin());

drop policy if exists "Users can view own records" on public.fees;
create policy "Users can view own records" on public.fees for select
  using (auth.uid() = member_id);

-- financial_reports
drop policy if exists "financial_reports_admin_all" on public.financial_reports;
create policy "financial_reports_admin_all" on public.financial_reports for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "financial_reports_public_select" on public.financial_reports;
create policy "financial_reports_public_select" on public.financial_reports for select
  using (true);

-- loan_payments
drop policy if exists "loan_payments_admin_all" on public.loan_payments;
create policy "loan_payments_admin_all" on public.loan_payments for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "loan_payments_select_own" on public.loan_payments;
create policy "loan_payments_select_own" on public.loan_payments for select
  using (exists (select 1 from public.loans l where l.id = loan_payments.loan_id and l.user_id = auth.uid()));

-- loans
drop policy if exists "loans_admin_select" on public.loans;
create policy "loans_admin_select" on public.loans for select
  using (public.is_admin());

drop policy if exists "loans_admin_update" on public.loans;
create policy "loans_admin_update" on public.loans for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "loans_user_insert_own" on public.loans;
create policy "loans_user_insert_own" on public.loans for insert
  with check (auth.uid() = user_id and coalesce(status, 'pending') = 'pending');

drop policy if exists "loans_user_select_own" on public.loans;
create policy "loans_user_select_own" on public.loans for select
  using (auth.uid() = user_id);

-- manual_adjustments
drop policy if exists "Admins full access manual_adjustments" on public.manual_adjustments;
create policy "Admins full access manual_adjustments" on public.manual_adjustments for all
  using (public.is_admin());

drop policy if exists "Users can view own records" on public.manual_adjustments;
create policy "Users can view own records" on public.manual_adjustments for select
  using (auth.uid() = member_id);

-- member_fees
drop policy if exists "Admin full access member_fees" on public.member_fees;
create policy "Admin full access member_fees" on public.member_fees for all
  using (public.is_admin());

drop policy if exists "Member read own fees" on public.member_fees;
create policy "Member read own fees" on public.member_fees for select
  using (user_id = auth.uid());

-- profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select" on public.profiles for select
  using (public.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "profiles_user_insert_own" on public.profiles;
create policy "profiles_user_insert_own" on public.profiles for insert
  with check (auth.uid() = id and coalesce(role, 'member') = 'member');

drop policy if exists "profiles_user_select_own" on public.profiles;
create policy "profiles_user_select_own" on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_user_update_own" on public.profiles;
create policy "profiles_user_update_own" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- profits
drop policy if exists "Admins full access profits" on public.profits;
create policy "Admins full access profits" on public.profits for all
  using (public.is_admin());

drop policy if exists "Users can view own records" on public.profits;
create policy "Users can view own records" on public.profits for select
  using (auth.uid() = member_id);

-- shareholders
drop policy if exists "Admin full access shareholders" on public.shareholders;
create policy "Admin full access shareholders" on public.shareholders for all
  using (public.is_admin());

drop policy if exists "Member read own shareholder" on public.shareholders;
create policy "Member read own shareholder" on public.shareholders for select
  using (user_id = auth.uid());

-- withdrawals
drop policy if exists "Admins full access withdrawals" on public.withdrawals;
create policy "Admins full access withdrawals" on public.withdrawals for all
  using (public.is_admin());

drop policy if exists "Users can view own records" on public.withdrawals;
create policy "Users can view own records" on public.withdrawals for select
  using (auth.uid() = member_id);

-- =============================================================================
-- Done. Schema + RLS in this file match the live project as of 2026-08-19.
-- =============================================================================
