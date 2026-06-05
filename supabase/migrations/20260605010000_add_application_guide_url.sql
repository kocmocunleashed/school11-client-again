alter table public.school_settings
  add column if not exists application_guide_url text;

comment on column public.school_settings.application_guide_url is
  'Public URL for the CMS-managed application guide PDF. Falls back to the bundled PDF when null.';
