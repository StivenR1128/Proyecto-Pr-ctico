-- Ejecutar en SQL Editor del proyecto configurado, como postgres.
-- Solo datos temporales; ROLLBACK revierte todas las operaciones.
-- Verifica PostgreSQL cloud con rol authenticated e identidades SQL simuladas.
-- NO emite JWT ni sustituye la prueba REST con dos sesiones reales.
begin;
select set_config('request.jwt.claim.sub', (select id::text from public.profiles order by created_at limit 1), true);
set local role authenticated;
do $$
declare
  owner_uid uuid := auth.uid();
  project_uid uuid;
  task_uid uuid;
  affected integer;
  denied boolean := false;
begin
  if owner_uid is null then raise exception '1: se necesita un perfil existente'; end if;
  insert into public.projects(name) values ('Comprobacion transaccional TaskFlow') returning id into project_uid;
  if not exists(select 1 from public.projects where id=project_uid and owner_id=owner_uid) then raise exception '2: proyecto propio'; end if;
  insert into public.tasks(project_id,title) values(project_uid,'Tarea temporal de comprobacion') returning id into task_uid;
  if not exists(select 1 from public.tasks where id=task_uid) then raise exception '3: tarea propia'; end if;
  update public.tasks set status='done' where id=task_uid;
  if not exists(select 1 from public.tasks where id=task_uid and completed_at is not null) then raise exception '4: trigger de finalizacion'; end if;
  if not exists(select 1 from public.task_analytics where task_id=task_uid and is_completed=1) then raise exception '5: vista propia'; end if;
  perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000099',true);
  if exists(select 1 from public.projects where id=project_uid) or exists(select 1 from public.tasks where id=task_uid) or exists(select 1 from public.task_analytics where task_id=task_uid) then raise exception '6: aislamiento de lectura'; end if;
  update public.tasks set title='No debe cambiar' where id=task_uid;
  get diagnostics affected = row_count;
  if affected<>0 then raise exception '7: modificacion ajena'; end if;
  delete from public.tasks where id=task_uid;
  get diagnostics affected = row_count;
  if affected<>0 then raise exception '8: borrado ajeno'; end if;
  begin
    insert into public.tasks(project_id,title) values(project_uid,'Insercion ajena');
  exception when insufficient_privilege then denied:=true;
  end;
  if not denied then raise exception '9: insercion ajena'; end if;
  perform set_config('request.jwt.claim.sub',owner_uid::text,true);
  delete from public.projects where id=project_uid;
  if exists(select 1 from public.tasks where id=task_uid) then raise exception '10: cascada'; end if;
  raise notice 'PASS: 10 comprobaciones SQL cloud; identidades SQL simuladas, JWT no probado aqui';
end $$;
rollback;
-- La aprobacion exige ejecutar todo sin errores. No hay un SELECT PASS incondicional.
-- Si el cliente interrumpe el lote por un error, ejecutar ROLLBACK para cerrar la transaccion.
