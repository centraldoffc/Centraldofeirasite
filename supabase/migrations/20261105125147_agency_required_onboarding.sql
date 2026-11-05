create schema if not exists agency_private;
revoke all on schema agency_private from public;
grant usage on schema agency_private to authenticated;
create or replace function agency_private.onboarding_complete()
returns boolean language sql stable security definer set search_path = ''
as $$ select auth.uid() is not null and exists (
select 1 from auth.users where id = auth.uid() and coalesce(raw_app_meta_data->>'onboarding_required','false') <> 'true'
) $$;
revoke all on function agency_private.onboarding_complete() from public, anon;
grant execute on function agency_private.onboarding_complete() to authenticated;
do $$ declare t record; begin
for t in select tablename from pg_tables where schemaname='public' and tablename like 'agency\_%' escape '\' loop
execute format('create policy agency_requires_completed_onboarding on public.%I as restrictive for all to authenticated using ((select agency_private.onboarding_complete())) with check ((select agency_private.onboarding_complete()))',t.tablename);
end loop; end $$;