create table if not exists public.portfolio_content (
  id bigint primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.portfolio_content (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

create or replace function public.set_portfolio_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolio_content_set_updated_at on public.portfolio_content;
create trigger portfolio_content_set_updated_at
before update on public.portfolio_content
for each row
execute function public.set_portfolio_updated_at();

alter table public.portfolio_content enable row level security;

drop policy if exists "public read portfolio" on public.portfolio_content;
create policy "public read portfolio"
on public.portfolio_content
for select
to anon, authenticated
using (true);

drop policy if exists "public write portfolio" on public.portfolio_content;
create policy "public write portfolio"
on public.portfolio_content
for all
to anon, authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

drop policy if exists "public read portfolio assets" on storage.objects;
create policy "public read portfolio assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'portfolio-assets');

drop policy if exists "public write portfolio assets" on storage.objects;
create policy "public write portfolio assets"
on storage.objects
for all
to anon, authenticated
using (bucket_id = 'portfolio-assets')
with check (bucket_id = 'portfolio-assets');
