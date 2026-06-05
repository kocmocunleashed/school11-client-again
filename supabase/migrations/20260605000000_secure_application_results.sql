-- Application result records contain applicant-specific data and must not be
-- directly readable through the public Supabase Data API. Public lookup stays
-- available only through /api/check-application, which uses the server-side
-- Supabase service role and returns a deliberately narrow response.

alter table public.application_results enable row level security;

drop policy if exists "Lookup application by code" on public.application_results;

revoke all privileges on table public.application_results from anon, authenticated;
grant select, insert, update, delete on table public.application_results to service_role;

comment on table public.application_results is
  'Applicant result records. Direct anon/authenticated reads are disabled; public lookup must go through the server API.';

-- Remove fake application lookup rows that were previously bundled with the
-- schema migration. Real application codes should be loaded through the admin
-- CMS or an environment-specific seed/import step.
delete from public.application_results
where code in ('AB123456', 'CD789012', 'EF345678', 'GH901234')
  and student_name like 'Тест%';
