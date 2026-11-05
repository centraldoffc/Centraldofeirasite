create table public.agency_roles (
name text primary key check (name = btrim(name) and char_length(name) between 1 and 40),
created_at timestamptz not null default now()
);
create unique index agency_roles_name_case_insensitive on public.agency_roles (lower(name));
alter table public.agency_roles enable row level security;
grant select, insert on public.agency_roles to authenticated;
create policy members_read_roles on public.agency_roles for select to authenticated using (public.agency_is_member());
create policy leaders_create_roles on public.agency_roles for insert to authenticated with check (public.agency_is_leader());
create policy agency_requires_completed_onboarding on public.agency_roles as restrictive for all to authenticated using ((select agency_private.onboarding_complete())) with check ((select agency_private.onboarding_complete()));
insert into public.agency_roles(name) values ('Assistente'),('Designer'),('Redator'),('Editor de vídeo'),('Social media');
insert into public.agency_roles(name) select distinct on (lower(btrim(role_title))) btrim(role_title) from public.agency_members where char_length(btrim(role_title)) between 1 and 40 on conflict do nothing;