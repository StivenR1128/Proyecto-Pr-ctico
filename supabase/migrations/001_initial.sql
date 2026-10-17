-- Ejecutar una vez en un proyecto Supabase nuevo (Postgres 15+).
begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check(length(display_name)<=100),
 created_at timestamptz not null default now()
);
create table public.projects (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 100),
 description text not null default '',
 created_at timestamptz not null default now()
);
create table public.task_statuses (id text primary key, label text not null unique);
insert into public.task_statuses values ('pending','Pendiente'),('in_progress','En curso'),('done','Completada');
create table public.priorities (id text primary key, label text not null unique);
insert into public.priorities values ('low','Baja'),('medium','Media'),('high','Alta');
create table public.tasks (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.projects(id) on delete cascade,
 title text not null check(length(trim(title)) between 1 and 160),
 description text not null default '',
 status text not null default 'pending' references public.task_statuses(id),
 priority text not null default 'medium' references public.priorities(id),
 due_date date,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 completed_at timestamptz
);
create index projects_owner_created_idx on public.projects(owner_id,created_at);
create index tasks_project_created_idx on public.tasks(project_id,created_at desc);

create index tasks_project_status_idx on public.tasks(project_id,status);
create index tasks_status_idx on public.tasks(status);
create index tasks_priority_idx on public.tasks(priority);
create index tasks_project_due_open_idx on public.tasks(project_id,due_date) where status <> 'done';
create function public.create_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id) values(new.id);
 return new;
end;$$;
revoke all on function public.create_profile() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile();
-- También cubre usuarios creados antes de la migración.
insert into public.profiles(id) select id from auth.users on conflict do nothing;
create function public.stamp_task() returns trigger language plpgsql set search_path='' as $$
begin
 new.updated_at=now();
 if TG_OP='INSERT' then
   new.created_at=now();
   new.completed_at=case when new.status='done' then now() else null end;
 else
   new.created_at=old.created_at;
   new.completed_at=case when new.status<>'done' then null when old.status='done' then old.completed_at else now() end;
 end if;
 return new;
end;$$;
revoke all on function public.stamp_task() from public,anon,authenticated;
create trigger stamp_task before insert or update on public.tasks for each row execute function public.stamp_task();
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_statuses enable row level security;
alter table public.priorities enable row level security;
create policy profile_read on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profile_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy projects_owner on public.projects for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy tasks_owner on public.tasks for all to authenticated
 using(exists(select 1 from public.projects p where p.id=project_id and p.owner_id=(select auth.uid())))
 with check(exists(select 1 from public.projects p where p.id=project_id and p.owner_id=(select auth.uid())));
create policy statuses_read on public.task_statuses for select to authenticated using(true);
create policy priorities_read on public.priorities for select to authenticated using(true);
revoke all on public.profiles,public.projects,public.tasks,public.task_statuses,public.priorities from anon,authenticated;
grant select on public.profiles,public.task_statuses,public.priorities to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant select,insert,update,delete on public.projects,public.tasks to authenticated;
create view public.task_analytics with(security_invoker=true) as
select t.id as task_id,p.name as project,t.status,t.priority,
 (t.created_at at time zone 'America/Bogota')::date as created_date,t.due_date,
 (t.completed_at at time zone 'America/Bogota')::date as completed_date,
 case when t.status='done' then 1 else 0 end as is_completed,
 case when t.status<>'done' and t.due_date<(now() at time zone 'America/Bogota')::date then 1 else 0 end as is_overdue
from public.tasks t join public.projects p on p.id=t.project_id;
revoke all on public.task_analytics from anon;
grant select on public.task_analytics to authenticated;
commit;
