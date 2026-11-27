alter table public.crm_orders
  add column if not exists source text
    check (source in ('Giới thiệu', 'Facebook', 'Website', 'Zalo'));

notify pgrst, 'reload schema';
