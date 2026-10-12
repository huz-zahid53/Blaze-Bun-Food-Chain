-- ============================================================================
--  Blaze & Bun — Supabase / Postgres schema
-- ----------------------------------------------------------------------------
--  Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query)
--  or via `supabase db push` if you use the CLI.
--
--  SECURITY MODEL
--  --------------
--  Row Level Security is ENABLED on every table and NO policies are defined for
--  `anon` or `authenticated`. That means direct PostgREST access from the
--  browser is denied outright.
--
--  All reads and writes go through Next.js Route Handlers under /api/*, which
--  use the SERVICE ROLE key on the server. The service role bypasses RLS, and
--  authorisation is enforced in application code (guest orders are scoped to a
--  random `client_token`; admin endpoints require `ADMIN_TOKEN`).
--
--  Consequence: the service-role key must NEVER be exposed to the browser.
--  It is read from `process.env.SUPABASE_SERVICE_ROLE_KEY` in server-only code.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ORDERS
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,
  -- Guest authorisation token. The browser holds it; the API requires it to
  -- match before returning an order. Not a secret of consequence — it only
  -- gates a guest's own order history.
  client_token    uuid not null,

  status          text not null default 'placed'
                    check (status in (
                      'placed','confirmed','preparing','on-the-flame',
                      'out-for-delivery','ready-for-pickup','delivered','cancelled'
                    )),
  order_type      text not null
                    check (order_type in ('delivery','pickup','catering')),

  branch_id       text,
  branch_name     text,

  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text,
  address         text,
  area            text,
  city            text,
  instructions    text,
  slot            text,

  subtotal        numeric(12,2) not null default 0,
  delivery_fee    numeric(12,2) not null default 0,
  discount        numeric(12,2) not null default 0,
  tax             numeric(12,2) not null default 0,
  tip             numeric(12,2) not null default 0,
  total           numeric(12,2) not null default 0,

  payment_method  text,
  payment_label   text,
  coupon_code     text,
  item_count      int not null default 0,
  eta_minutes     int,
  loyalty_earned  int not null default 0,

  placed_at       timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orders_client_token_idx on public.orders (client_token, placed_at desc);
create index if not exists orders_status_idx       on public.orders (status);
create index if not exists orders_placed_at_idx    on public.orders (placed_at desc);
create index if not exists orders_branch_idx       on public.orders (branch_id);

-- ----------------------------------------------------------------------------
-- ORDER ITEMS
-- ----------------------------------------------------------------------------
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  position     int  not null default 0,

  slug         text not null,
  name         text not null,
  category_id  text,
  qty          int  not null default 1 check (qty > 0),
  base_price   numeric(12,2) not null default 0,
  unit_price   numeric(12,2) not null default 0,
  line_total   numeric(12,2) not null default 0,

  size_label   text,
  -- SelectedOption[] / SelectedAddOn[] — kept as JSON so the menu can evolve
  -- without a migration.
  options      jsonb not null default '[]'::jsonb,
  addons       jsonb not null default '[]'::jsonb,
  note         text,

  created_at   timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id, position);
create index if not exists order_items_slug_idx  on public.order_items (slug);

-- ----------------------------------------------------------------------------
-- ENQUIRIES  (contact, franchise, careers, catering — one table, `kind` splits)
-- ----------------------------------------------------------------------------
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('contact','franchise','careers','catering')),
  name        text not null,
  email       text,
  phone       text,
  subject     text,
  -- Every form-specific field lands here, so new fields never need a migration.
  payload     jsonb not null default '{}'::jsonb,
  status      text not null default 'new' check (status in ('new','in-progress','resolved','spam')),
  created_at  timestamptz not null default now()
);

create index if not exists enquiries_kind_idx   on public.enquiries (kind, created_at desc);
create index if not exists enquiries_status_idx on public.enquiries (status);

-- ----------------------------------------------------------------------------
-- FEEDBACK
-- ----------------------------------------------------------------------------
create table if not exists public.feedback (
  id            uuid primary key default gen_random_uuid(),
  branch_id     text,
  order_number  text,
  food          int check (food    between 1 and 5),
  service       int check (service between 1 and 5),
  value         int check (value   between 1 and 5),
  overall       numeric(3,2),
  aspects       text[] not null default '{}',
  comment       text,
  recommend     boolean,
  created_at    timestamptz not null default now()
);

create index if not exists feedback_branch_idx on public.feedback (branch_id, created_at desc);

-- ----------------------------------------------------------------------------
-- NEWSLETTER
-- ----------------------------------------------------------------------------
create table if not exists public.newsletter (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- GUEST STATE  (replaces localStorage entirely)
-- ----------------------------------------------------------------------------
-- The cart, chosen branch/order-type, coupon, tip and loyalty balance are
-- ephemeral session data. They are stored here as one JSONB blob keyed by the
-- guest token cookie, so:
--   * nothing is written to localStorage, and
--   * the server never renders it, which removes the whole class of
--     persisted-store hydration mismatches — client state is fetched
--     asynchronously after mount, so the first render always matches SSR.
--
-- Real business data (orders, enquiries, feedback) stays normalised below so
-- the POS can run SQL aggregations against it.
-- ----------------------------------------------------------------------------
create table if not exists public.guest_state (
  client_token  uuid primary key,
  state         jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- INVENTORY  (POS: per-item stock state, overrides the static menu)
-- ----------------------------------------------------------------------------
create table if not exists public.inventory (
  item_slug   text primary key,
  in_stock    boolean not null default true,
  stock_count int,
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- updated_at maintenance
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

drop trigger if exists inventory_touch_updated_at on public.inventory;
create trigger inventory_touch_updated_at
  before update on public.inventory
  for each row execute function public.touch_updated_at();

drop trigger if exists guest_state_touch_updated_at on public.guest_state;
create trigger guest_state_touch_updated_at
  before update on public.guest_state
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY — deny everything to anon/authenticated.
-- Only the service role (server-side route handlers) can reach these tables.
-- ----------------------------------------------------------------------------
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;
alter table public.enquiries    enable row level security;
alter table public.feedback     enable row level security;
alter table public.newsletter   enable row level security;
alter table public.inventory    enable row level security;
alter table public.guest_state  enable row level security;

-- Deliberately NO policies. If you later add Supabase Auth and want customers
-- to read their own orders directly, add something like:
--
--   create policy "own orders" on public.orders
--     for select to authenticated
--     using (auth.uid() = customer_uuid);
--
-- and add a `customer_uuid uuid references auth.users(id)` column to orders.

-- ----------------------------------------------------------------------------
-- Convenience view for the POS dashboard (server-side only — RLS blocks anon)
-- ----------------------------------------------------------------------------
create or replace view public.daily_revenue as
select
  date_trunc('day', placed_at)       as day,
  count(*)                           as orders,
  coalesce(sum(total), 0)            as revenue,
  coalesce(avg(total), 0)            as aov
from public.orders
where status <> 'cancelled'
group by 1
order by 1 desc;
