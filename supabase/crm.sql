begin;
create table if not exists public.crm_orders (
  id uuid primary key,
  lead_id uuid unique references public.inquiries(id) on delete set null,
  customer text not null,
  phone text not null default '',
  title text not null,
  address text not null default '',
  assignee text not null default '',
  notes text not null default '',
  next_task text not null default '',
  task_due date,
  survey_day date,
  install_day date,
  handover_day date,
  payment_due date,
  closed_day date not null,
  status text not null check (status in ('Đã chốt','Chờ duyệt thiết kế','Đang gia công','Chờ thi công','Đã bàn giao')),
  amount bigint not null check (amount between 0 and 1000000000000)
);
create table if not exists public.crm_payments (
  id uuid primary key,
  order_id uuid not null references public.crm_orders(id),
  paid_day date not null,
  amount bigint not null check (amount between 1 and 1000000000000),
  note text not null default ''
);
create index if not exists crm_payments_order_idx on public.crm_payments(order_id);
alter table public.crm_orders enable row level security;
alter table public.crm_payments enable row level security;
revoke all on public.crm_orders, public.crm_payments from public, anon, authenticated;
grant select, insert, update on public.crm_orders to service_role;
grant select, insert on public.crm_payments to service_role;
notify pgrst, 'reload schema';
commit;
