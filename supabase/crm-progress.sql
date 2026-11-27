begin;

alter table public.crm_orders
  add column if not exists install_end_day date,
  add column if not exists task_done boolean not null default false;

alter table public.crm_orders drop constraint if exists crm_orders_status_check;
alter table public.crm_orders add constraint crm_orders_status_check
  check (status in ('Đã chốt','Chờ duyệt thiết kế','Đang gia công','Chờ thi công','Đang thi công','Đã bàn giao'));

alter table public.crm_orders drop constraint if exists crm_orders_install_dates_check;
alter table public.crm_orders add constraint crm_orders_install_dates_check
  check (install_end_day is null or (install_day is not null and install_end_day >= install_day));

create or replace function public.crm_reset_changed_task() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.next_task is distinct from old.next_task then
    new.task_done := false;
  end if;
  return new;
end;
$$;

drop trigger if exists crm_reset_changed_task on public.crm_orders;
create trigger crm_reset_changed_task before update of next_task on public.crm_orders
for each row execute function public.crm_reset_changed_task();

notify pgrst, 'reload schema';
commit;
