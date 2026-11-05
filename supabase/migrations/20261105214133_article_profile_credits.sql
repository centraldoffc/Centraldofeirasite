alter table public.articles add column source_draft_id uuid;
create table public.article_credits (
article_id uuid primary key references public.articles(id) on delete cascade,
author_profile_id uuid,
created_by uuid,
published_by uuid,
first_published_at timestamptz
);
alter table public.article_credits enable row level security;
revoke all on public.article_credits from anon, authenticated;
grant select on public.article_credits to authenticated;
create policy admins_read_credits on public.article_credits for select to authenticated using (public.is_admin());
create or replace function agency_private.track_article_credit() returns trigger language plpgsql security definer set search_path='' as $$
declare writer uuid;
begin
 if tg_op = 'INSERT' then
   writer := auth.uid();
   if new.source_draft_id is not null then
     select author_id into writer from public.agency_drafts where id=new.source_draft_id and status='aprovado';
     if writer is null then raise exception 'A matéria de origem precisa estar aprovada'; end if;
   end if;
   insert into public.article_credits(article_id,author_profile_id,created_by,published_by,first_published_at)
   values(new.id,writer,auth.uid(),case when new.published then auth.uid() end,case when new.published then now() end);
 else
   if new.source_draft_id is distinct from old.source_draft_id then raise exception 'A origem da notícia não pode ser alterada'; end if;
   if new.published and not old.published then
     insert into public.article_credits(article_id,published_by,first_published_at) values(new.id,auth.uid(),now())
     on conflict(article_id) do update set published_by=coalesce(public.article_credits.published_by,excluded.published_by),first_published_at=coalesce(public.article_credits.first_published_at,excluded.first_published_at);
   end if;
 end if;
 return new;
end $$;
revoke all on function agency_private.track_article_credit() from public,anon,authenticated;
create trigger track_article_credit after insert or update on public.articles for each row execute function agency_private.track_article_credit();
