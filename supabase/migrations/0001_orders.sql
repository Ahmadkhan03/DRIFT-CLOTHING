-- DRIFT: customers, orders, discount codes, newsletter
-- Run once in Supabase → SQL Editor (or `supabase db push`).
--
-- All tables have Row Level Security ON with no public policies, so they are
-- only reachable from our server using the secret key. The browser never
-- talks to these tables directly.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type order_status as enum ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned');
create type payment_method as enum ('cod', 'safepay');
create type payment_status as enum ('unpaid', 'paid', 'refunded');
create type discount_type as enum ('percent', 'fixed');

-- ---------------------------------------------------------------------------
-- Customers (CRM). One row per phone number.
-- ---------------------------------------------------------------------------
create table customers (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null unique,
  email       text,
  full_name   text,
  city        text,
  tags        text[] not null default '{}',
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index customers_email_idx on customers (lower(email));

-- ---------------------------------------------------------------------------
-- Discount codes
-- ---------------------------------------------------------------------------
create table discount_codes (
  code              text primary key,          -- stored upper-case
  type              discount_type not null,
  value             integer not null check (value > 0),  -- percent (1-100) or PKR
  min_subtotal      integer not null default 0,
  first_order_only  boolean not null default false,
  usage_limit       integer,                   -- null = unlimited
  times_used        integer not null default 0,
  active            boolean not null default true,
  expires_at        timestamptz,
  created_at        timestamptz not null default now()
);

insert into discount_codes (code, type, value, first_order_only)
values ('DRIFT10', 'percent', 10, true);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create sequence order_number_seq start 10001;

create table orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique default ('DR' || nextval('order_number_seq')),
  access_token     uuid not null default gen_random_uuid(),  -- lets the buyer view their order page
  customer_id      uuid references customers (id) on delete set null,

  status           order_status   not null default 'pending',
  payment_method   payment_method not null,
  payment_status   payment_status not null default 'unpaid',

  -- Snapshot of contact + address at time of order
  full_name        text not null,
  email            text not null,
  phone            text not null,
  address_line1    text not null,
  address_line2    text,
  city             text not null,
  province         text not null,
  postal_code      text,
  notes            text,

  -- Money, all in whole PKR
  subtotal         integer not null check (subtotal >= 0),
  discount         integer not null default 0 check (discount >= 0),
  shipping         integer not null default 0 check (shipping >= 0),
  total            integer not null check (total >= 0),
  discount_code    text references discount_codes (code) on delete set null,

  tracking_number  text,
  courier          text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index orders_customer_idx on orders (customer_id);
create index orders_status_idx on orders (status);
create index orders_created_idx on orders (created_at desc);

create table order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders (id) on delete cascade,
  product_slug  text not null,
  product_name  text not null,
  colour        text not null,
  size          text not null,
  image         text,
  unit_price    integer not null check (unit_price >= 0),
  quantity      integer not null check (quantity between 1 and 10),
  line_total    integer not null check (line_total >= 0)
);
create index order_items_order_idx on order_items (order_id);

-- Status history, used for the tracking timeline and the admin audit trail
create table order_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders (id) on delete cascade,
  status      order_status not null,
  note        text,
  created_at  timestamptz not null default now()
);
create index order_events_order_idx on order_events (order_id, created_at);

-- ---------------------------------------------------------------------------
-- Newsletter / waitlist
-- ---------------------------------------------------------------------------
create table newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  source      text not null default 'popup',   -- popup | footer | drop-waitlist | checkout
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger customers_updated_at before update on customers
  for each row execute function set_updated_at();
create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- create_order: writes customer, order, items, first event and discount usage
-- in a single transaction. Prices are validated by the app server before this
-- is called; this function only persists.
-- ---------------------------------------------------------------------------
create or replace function create_order(payload jsonb)
returns table (order_number text, access_token uuid)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_customer_id uuid;
  v_order       orders%rowtype;
  v_code        text := nullif(upper(payload->>'discount_code'), '');
begin
  insert into customers (phone, email, full_name, city)
  values (payload->>'phone', payload->>'email', payload->>'full_name', payload->>'city')
  on conflict (phone) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        city = excluded.city
  returning id into v_customer_id;

  insert into orders (
    customer_id, payment_method, full_name, email, phone,
    address_line1, address_line2, city, province, postal_code, notes,
    subtotal, discount, shipping, total, discount_code
  ) values (
    v_customer_id,
    (payload->>'payment_method')::payment_method,
    payload->>'full_name', payload->>'email', payload->>'phone',
    payload->>'address_line1', nullif(payload->>'address_line2', ''),
    payload->>'city', payload->>'province', nullif(payload->>'postal_code', ''),
    nullif(payload->>'notes', ''),
    (payload->>'subtotal')::int, (payload->>'discount')::int,
    (payload->>'shipping')::int, (payload->>'total')::int,
    v_code
  )
  returning * into v_order;

  insert into order_items (order_id, product_slug, product_name, colour, size, image, unit_price, quantity, line_total)
  select v_order.id,
         i->>'product_slug', i->>'product_name', i->>'colour', i->>'size', i->>'image',
         (i->>'unit_price')::int, (i->>'quantity')::int, (i->>'line_total')::int
  from jsonb_array_elements(payload->'items') as i;

  insert into order_events (order_id, status, note)
  values (v_order.id, 'pending', 'Order placed');

  if v_code is not null then
    update discount_codes set times_used = times_used + 1 where code = v_code;
  end if;

  return query select v_order.order_number, v_order.access_token;
end $$;

revoke all on function create_order(jsonb) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security: on everywhere, no public policies.
-- ---------------------------------------------------------------------------
alter table customers              enable row level security;
alter table discount_codes         enable row level security;
alter table orders                 enable row level security;
alter table order_items            enable row level security;
alter table order_events           enable row level security;
alter table newsletter_subscribers enable row level security;
