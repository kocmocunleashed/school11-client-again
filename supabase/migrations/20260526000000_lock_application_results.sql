drop policy if exists "Lookup application by code" on application_results;

revoke all on table application_results from anon;
revoke all on table application_results from authenticated;
