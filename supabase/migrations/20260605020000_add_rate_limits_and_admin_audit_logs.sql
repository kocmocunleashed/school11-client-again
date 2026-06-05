create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0 check (count >= 0),
  window_start timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists idx_rate_limits_expires_at on public.rate_limits(expires_at);

alter table public.rate_limits enable row level security;

revoke all on table public.rate_limits from anon, authenticated;
grant select, insert, update, delete on table public.rate_limits to service_role;

comment on table public.rate_limits is
  'Server-side shared rate limit buckets. Access is restricted to service-role server code.';

create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table(limited boolean, count integer, reset_at timestamptz)
language plpgsql
as $$
declare
  v_now timestamptz := now();
  v_row public.rate_limits%rowtype;
begin
  if p_key is null or length(p_key) < 8 or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit arguments';
  end if;

  insert into public.rate_limits as rl (key, count, window_start, expires_at)
  values (p_key, 1, v_now, v_now + make_interval(secs => p_window_seconds))
  on conflict (key) do update
    set count = case
          when rl.expires_at <= v_now then 1
          else rl.count + 1
        end,
        window_start = case
          when rl.expires_at <= v_now then v_now
          else rl.window_start
        end,
        expires_at = case
          when rl.expires_at <= v_now then v_now + make_interval(secs => p_window_seconds)
          else rl.expires_at
        end
  returning * into v_row;

  delete from public.rate_limits
  where expires_at < v_now - interval '1 day';

  return query select v_row.count > p_limit, v_row.count, v_row.expires_at;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

create table if not exists public.admin_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  action text not null,
  resource text not null,
  resource_id text,
  created_at timestamptz not null default now(),
  request_ip_hash text,
  user_agent text,
  metadata jsonb
);

create index if not exists idx_admin_audit_logs_created_at on public.admin_audit_logs(created_at desc);
create index if not exists idx_admin_audit_logs_resource on public.admin_audit_logs(resource, created_at desc);

alter table public.admin_audit_logs enable row level security;

revoke all on table public.admin_audit_logs from anon, authenticated;
grant select, insert on table public.admin_audit_logs to service_role;

comment on table public.admin_audit_logs is
  'Minimal safe admin CMS audit trail. Raw IPs, cookies, passwords, and applicant details must not be stored here.';
