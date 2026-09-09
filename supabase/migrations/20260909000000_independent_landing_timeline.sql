-- Separate homepage history from the detailed achievements timeline.
create table if not exists public.landing_timeline_entries (
  id uuid primary key default gen_random_uuid(),
  year integer not null check (year between 1900 and 2200),
  highlight_mn text not null,
  description_mn text,
  image_url text,
  is_milestone boolean not null default true,
  is_published boolean not null default false,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now()
);

alter table public.landing_timeline_entries enable row level security;
grant select on public.landing_timeline_entries to anon, authenticated;
grant all on public.landing_timeline_entries to service_role;
create policy "Read published landing timeline" on public.landing_timeline_entries
  for select to anon, authenticated using (is_published = true);

-- One-time snapshot preserves the current homepage. No shared rows, foreign
-- keys, or synchronization: subsequent edits belong to their own timeline.
insert into public.landing_timeline_entries
  (id, year, highlight_mn, description_mn, image_url, is_milestone, is_published)
select id, year, coalesce(highlight_mn, 'Онцлох үйл явдал'), description_mn,
  image_url, is_milestone, true
from public.achievement_years
on conflict (id) do nothing;
