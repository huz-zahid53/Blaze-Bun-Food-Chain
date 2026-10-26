-- ============================================================================
-- Migration: Fix daily_revenue View Security and Explicit Grants
-- ----------------------------------------------------------------------------
-- Applies `security_invoker = on` to ensure the daily_revenue view enforces
-- the underlying table's Row Level Security rather than bypassing it via
-- view-owner permissions. Also revokes direct access from anon and authenticated.
--
-- NOTE: Prepared for review. Do NOT apply to production without approval.
-- ============================================================================

-- Recreate view with security_invoker = on
create or replace view public.daily_revenue
with (security_invoker = on) as
select
  date_trunc('day', placed_at)       as day,
  count(*)                           as orders,
  coalesce(sum(total), 0)            as revenue,
  coalesce(avg(total), 0)            as aov
from public.orders
where status <> 'cancelled'
group by 1
order by 1 desc;

-- Explicitly revoke direct PostgREST access from anon and authenticated roles
revoke all on public.daily_revenue from anon, authenticated;
grant select on public.daily_revenue to service_role;

revoke all on all tables in schema public from anon, authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
