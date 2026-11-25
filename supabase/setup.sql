create table if not exists public.site_content (
  id integer primary key check (id = 1),
  body jsonb not null,
  revision integer not null check (revision > 0)
);

create table if not exists public.inquiries (
  id uuid primary key,
  name text not null,
  phone text not null,
  service text not null,
  message text not null,
  created bigint not null,
  status text not null check (status in ('Mới', 'Đang tư vấn', 'Đã xử lý'))
);

create index if not exists inquiries_created_idx on public.inquiries (created desc);

alter table public.site_content enable row level security;
alter table public.inquiries enable row level security;
revoke all on public.site_content, public.inquiries from anon, authenticated;
grant select, insert, update on public.site_content, public.inquiries to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('colorcenter-media', 'colorcenter-media', false, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
