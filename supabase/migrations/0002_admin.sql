-- DRIFT admin: staff access + CRM customer stats
-- Run after 0001_orders.sql.

-- ---------------------------------------------------------------------------
-- Staff: who may sign in to /admin. Users are created in Supabase →
-- Authentication → Users; add their email here to grant access.
-- ---------------------------------------------------------------------------
create type staff_role as enum ('owner', 'admin', 'staff');

create table staff (
  email       text primary key check (email = lower(email)),
  full_name   text,
  role        staff_role not null default 'staff',
  created_at  timestamptz not null default now()
);
alter table staff enable row level security;

-- Who changed an order's status (null = system / checkout)
alter table order_events add column created_by text;

-- ---------------------------------------------------------------------------
-- Customer lifetime stats for the CRM (cancelled/returned orders excluded)
-- ---------------------------------------------------------------------------
create view customer_stats
with (security_invoker = on) as
select
  c.id,
  c.phone,
  c.email,
  c.full_name,
  c.city,
  c.tags,
  c.notes,
  c.created_at,
  count(o.id) filter (where o.status not in ('cancelled', 'returned'))                    as order_count,
  coalesce(sum(o.total) filter (where o.status not in ('cancelled', 'returned')), 0)::int as total_spent,
  max(o.created_at)                                                                      as last_order_at
from customers c
left join orders o on o.customer_id = c.id
group by c.id;

-- ---------------------------------------------------------------------------
-- Replace this with the store owner's email, then run.
-- ---------------------------------------------------------------------------
-- insert into staff (email, full_name, role) values ('owner@example.com', 'Store Owner', 'owner');
