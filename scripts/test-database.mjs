import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

// PostgreSQL real en memoria. Solo auth.uid()/auth.users se simulan;
// no sustituye la validación de GoTrue, JWT, correo y API en Supabase cloud.
const db = new PGlite();
const a = "00000000-0000-4000-8000-000000000001";
const b = "00000000-0000-4000-8000-000000000002";
let checks = 0;
function verify(condition, message) {
  assert(condition, message);
  checks++;
  console.log(`PASS ${message}`);
}
async function denied(sql, message, code = "42501") {
  let rejected = false;
  try {
    await db.query(sql);
  } catch (error) {
    assert.equal(error.code, code, `SQLSTATE inesperado: ${message}`);
    rejected = true;
  }
  verify(rejected, message);
}
async function asUser(id) {
  await db.exec("reset role; set role authenticated;");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}
try {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth,public to authenticated,anon;
    grant execute on function auth.uid() to authenticated,anon;
  `);
  await db.exec(
    await readFile(
      new URL("../supabase/migrations/001_initial.sql", import.meta.url),
      "utf8",
    ),
  );
  console.log("PASS migración completa en PostgreSQL");
  checks++;
  await db.query("insert into auth.users(id) values ($1),($2)", [a, b]);
  await asUser(a);
  verify(
    (await db.query("select * from public.profiles")).rows.length === 1,
    "perfil creado e identidad aislada",
  );
  verify(
    (
      await db.query(
        "update public.profiles set display_name='Cuenta A' where id=$1 returning id",
        [a],
      )
    ).rows.length === 1,
    "perfil propio permite editar display_name",
  );
  verify(
    (
      await db.query(
        "update public.profiles set display_name='ataque' where id=$1 returning id",
        [b],
      )
    ).rows.length === 0,
    "perfil ajeno no permite edición",
  );
  const pa = (
    await db.query(
      "insert into public.projects(name) values('Proyecto A') returning id",
    )
  ).rows[0].id;
  const task = (
    await db.query(
      "insert into public.tasks(project_id,title) values($1,'Privada A') returning *",
      [pa],
    )
  ).rows[0];
  verify(
    task.status === "pending" && !task.completed_at,
    "creación válida con catálogos y timestamp",
  );
  await denied(
    `insert into public.projects(name,owner_id) values('suplantado','${b}')`,
    "RLS impide suplantar propietario",
  );
  await denied(
    `insert into public.tasks(project_id,title,status) values('${pa}','mal estado','fake')`,
    "FK de estado rechaza valor desconocido",
    "23503",
  );
  await denied(
    `insert into public.tasks(project_id,title) values('${pa}','   ')`,
    "restricción rechaza título vacío",
    "23514",
  );
  await denied(
    `insert into public.tasks(project_id,title) values('${pa}','${"x".repeat(161)}')`,
    "restricción rechaza título de más de 160 caracteres",
    "23514",
  );
  const insertedDone = (
    await db.query(
      "insert into public.tasks(project_id,title,status) values($1,'Completada al crear','done') returning *",
      [pa],
    )
  ).rows[0];
  verify(
    !!insertedDone.completed_at,
    "trigger fija completed_at al insertar completada",
  );
  await db.query("delete from public.tasks where id=$1", [insertedDone.id]);
  await asUser(b);
  const pb = (
    await db.query(
      "insert into public.projects(name) values('Proyecto B') returning id",
    )
  ).rows[0].id;
  verify(
    (await db.query("select * from public.tasks")).rows.length === 0,
    "B no puede leer tareas de A",
  );
  verify(
    (await db.query("select * from public.projects")).rows.length === 1,
    "B solo ve su proyecto",
  );
  verify(
    (
      await db.query(
        "update public.projects set name='ataque' where id=$1 returning id",
        [pa],
      )
    ).rows.length === 0,
    "B no puede editar proyecto de A",
  );
  verify(
    (
      await db.query("delete from public.projects where id=$1 returning id", [
        pa,
      ])
    ).rows.length === 0,
    "B no puede borrar proyecto de A",
  );
  verify(
    (await db.query("select * from public.task_analytics")).rows.length === 0,
    "vista security_invoker respeta RLS",
  );
  verify(
    (
      await db.query(
        "update public.tasks set title=$1 where id=$2 returning id",
        ["ataque", task.id],
      )
    ).rows.length === 0,
    "B no puede editar tarea de A",
  );
  verify(
    (
      await db.query("delete from public.tasks where id=$1 returning id", [
        task.id,
      ])
    ).rows.length === 0,
    "B no puede borrar tarea de A",
  );
  await denied(
    `insert into public.tasks(project_id,title) values('${pa}','intrusión')`,
    "B no puede insertar en proyecto de A",
  );
  await denied(
    "insert into public.priorities values('critical','Crítica')",
    "catálogos no permiten escritura autenticada",
  );
  await asUser(a);
  await db.exec("reset role;");
  await denied(
    "insert into public.tasks(project_id,title) values('00000000-0000-4000-8000-000000000099','FK inválida')",
    "FK rechaza proyecto inexistente incluso sin RLS",
    "23503",
  );
  await asUser(a);
  await denied(
    `update public.tasks set project_id='${pb}' where id='${task.id}'`,
    "A no puede mover una tarea a un proyecto ajeno",
  );
  await db.query("update public.tasks set status='done' where id=$1", [
    task.id,
  ]);
  const done = (
    await db.query("select * from public.tasks where id=$1", [task.id])
  ).rows[0];
  verify(!!done.completed_at, "trigger fija completed_at al completar");
  const analytics = (await db.query("select * from public.task_analytics"))
    .rows;
  verify(
    analytics.length === 1 && analytics[0].is_completed === 1,
    "vista analítica conserva el grano y finalización",
  );
  await db.query("update public.tasks set title='Editada' where id=$1", [
    task.id,
  ]);
  const edited = (
    await db.query("select * from public.tasks where id=$1", [task.id])
  ).rows[0];
  await db.query(
    "update public.tasks set updated_at='2000-01-01',created_at='2000-01-01' where id=$1",
    [task.id],
  );
  const stamped = (
    await db.query("select * from public.tasks where id=$1", [task.id])
  ).rows[0];
  verify(
    new Date(stamped.updated_at).getUTCFullYear() !== 2000 &&
      String(stamped.created_at) === String(task.created_at),
    "trigger protege created_at y sella updated_at",
  );
  verify(
    String(edited.completed_at) === String(done.completed_at),
    "editar no altera fecha de finalización",
  );
  await db.query("update public.tasks set status='pending' where id=$1", [
    task.id,
  ]);
  verify(
    (
      await db.query("select completed_at from public.tasks where id=$1", [
        task.id,
      ])
    ).rows[0].completed_at === null,
    "reabrir limpia fecha de finalización",
  );
  await db.query("delete from public.projects where id=$1", [pa]);
  verify(
    (await db.query("select * from public.tasks")).rows.length === 0,
    "borrado de proyecto propaga cascade",
  );
  await db.exec("reset role; set role anon;");
  await denied(
    "select * from public.tasks",
    "anónimo no tiene acceso a tareas",
  );
  await denied(
    "select * from public.task_analytics",
    "anónimo no tiene acceso a analítica",
  );
  await denied(
    "select * from public.profiles",
    "anónimo no tiene acceso a perfiles",
  );
  await denied(
    "select * from public.projects",
    "anónimo no tiene acceso a proyectos",
  );
  console.log(
    `\n${checks} comprobaciones PostgreSQL aprobadas. JWT externo no probado.`,
  );
} finally {
  await db.close();
}
