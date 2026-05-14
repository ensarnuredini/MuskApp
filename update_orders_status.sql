-- Run this once in the Supabase SQL Editor for the deployed project.
-- It lets the admin dashboard use: pending, completed, and cancelled.

alter table orders drop constraint if exists orders_status_check;

alter table orders
  add constraint orders_status_check
  check (status in ('pending', 'completed', 'cancelled'));

-- 4. Fix timezone issue by using timestamptz
alter table orders
  alter column created_at type timestamptz using created_at at time zone 'UTC';

alter table products
  alter column created_at type timestamptz using created_at at time zone 'UTC';
