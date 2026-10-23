-- ============================================================================
--  Blaze & Bun — Hybrid Payment System Database Migration
-- ----------------------------------------------------------------------------
--  Run this in the Supabase SQL editor AFTER schema.sql has been applied.
--  It is completely idempotent: re-running it on a database that already has
--  the columns, indexes, or table is a safe no-op.
--
--  Changes:
--    1. Adds payment_status, payment_reference, is_simulated, settled_at,
--       and settled_by to public.orders.
--    2. Creates public.payment_attempts ledger for attempt-level audit trails.
--    3. Configures triggers and Row Level Security (RLS) matching schema.sql.
--    4. Safely backfills existing historical orders.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Add payment columns to public.orders (idempotent DO blocks)
-- ----------------------------------------------------------------------------

-- payment_status: financial lifecycle ('unpaid','pending','paid','failed','refunded')
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'payment_status'
  ) then
    alter table public.orders
      add column payment_status text not null default 'unpaid'
        check (payment_status in ('unpaid','pending','paid','failed','refunded'));
  end if;
end $$;

-- payment_reference: simulator or gateway transaction reference
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'payment_reference'
  ) then
    alter table public.orders add column payment_reference text;
  end if;
end $$;

-- is_simulated: true when processed by the demo simulator; false for cash/card on delivery
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'is_simulated'
  ) then
    alter table public.orders add column is_simulated boolean not null default false;
  end if;
end $$;

-- settled_at: timestamp when doorstep COD or Cash on Card payment was confirmed by staff
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'settled_at'
  ) then
    alter table public.orders add column settled_at timestamptz;
  end if;
end $$;

-- settled_by: staff identity / POS register name that confirmed offline collection
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'settled_by'
  ) then
    alter table public.orders add column settled_by text;
  end if;
end $$;

-- Index for payment queries and settlement reporting
create index if not exists orders_payment_status_idx on public.orders (payment_status);

-- ----------------------------------------------------------------------------
-- 2. Payment attempts audit ledger (public.payment_attempts)
-- ----------------------------------------------------------------------------
-- Records every authorization attempt, failure, cancellation, and settlement
-- event. A single order can have multiple attempts without losing the audit trail.

create table if not exists public.payment_attempts (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid references public.orders (id) on delete set null,
  method          text not null,
  mode            text not null default 'demo'
                    check (mode in ('demo','sandbox','live','delivery')),
  status          text not null default 'pending'
                    check (status in ('pending','paid','failed','cancelled','refunded')),
  reference       text not null,
  amount          numeric(12,2) not null default 0,
  currency        text not null default 'PKR',
  is_simulated    boolean not null default true,
  provider_data   jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists pa_order_idx     on public.payment_attempts (order_id, created_at desc);
create index if not exists pa_reference_idx on public.payment_attempts (reference);
create index if not exists pa_status_idx    on public.payment_attempts (status);

-- Guarantee touch_updated_at helper function exists
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Touch updated_at on payment_attempts
drop trigger if exists pa_touch_updated_at on public.payment_attempts;
create trigger pa_touch_updated_at
  before update on public.payment_attempts
  for each row execute function public.touch_updated_at();

-- RLS: Strict service-role access model matching schema.sql
alter table public.payment_attempts enable row level security;

-- ----------------------------------------------------------------------------
-- 3. Idempotent backfill of historical orders
-- ----------------------------------------------------------------------------
-- Orders created before this migration have default 'unpaid'.
-- For non-doorstep orders that were previously placed in demo mode, mark paid & simulated.
update public.orders
  set payment_status = 'paid',
      is_simulated   = true
  where payment_status = 'unpaid'
    and payment_method is not null
    and payment_method not in ('cod', 'cash_on_card')
    and status <> 'cancelled';
