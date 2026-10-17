// Node 22: node --env-file=.env scripts/test-rls.mjs
import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
const env = process.env;
for (const key of [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "TEST_USER_A_EMAIL",
  "TEST_USER_A_PASSWORD",
  "TEST_USER_B_EMAIL",
  "TEST_USER_B_PASSWORD",
])
  assert(env[key], `Falta ${key}`);
const client = () =>
  createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const a = client(),
  b = client(),
  anon = client();
async function ok(q) {
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
const ua = await ok(
  a.auth.signInWithPassword({
    email: env.TEST_USER_A_EMAIL,
    password: env.TEST_USER_A_PASSWORD,
  }),
);
const ub = await ok(
  b.auth.signInWithPassword({
    email: env.TEST_USER_B_EMAIL,
    password: env.TEST_USER_B_PASSWORD,
  }),
);
assert.notEqual(ua.user.id, ub.user.id, "Usa dos cuentas diferentes");
let pa, pb;
try {
  [pa] = await ok(
    a
      .from("projects")
      .insert({ name: "RLS test A", owner_id: ua.user.id })
      .select(),
  );
  [pb] = await ok(
    b
      .from("projects")
      .insert({ name: "RLS test B", owner_id: ub.user.id })
      .select(),
  );
  const [t] = await ok(
    a.from("tasks").insert({ title: "Private", project_id: pa.id }).select(),
  );
  assert.equal(
    (await ok(b.from("tasks").select("*").eq("id", t.id))).length,
    0,
  );
  assert.equal(
    (
      await ok(
        b.from("tasks").update({ title: "attack" }).eq("id", t.id).select(),
      )
    ).length,
    0,
  );
  assert.equal(
    (await ok(b.from("tasks").delete().eq("id", t.id).select())).length,
    0,
  );
  assert.equal(
    (await ok(b.from("task_analytics").select("*").eq("task_id", t.id))).length,
    0,
  );
  assert(
    (await b.from("tasks").insert({ title: "spoof", project_id: pa.id })).error,
  );
  assert(
    (
      await a
        .from("tasks")
        .insert({ title: "cross project", project_id: pb.id })
    ).error,
  );
  assert((await anon.from("tasks").select("*")).error);
  assert.equal(
    (await ok(b.from("projects").select("*").eq("id", pa.id))).length,
    0,
  );
  assert(
    (await a.from("tasks").update({ project_id: pb.id }).eq("id", t.id)).error,
  );
  await ok(a.from("tasks").update({ status: "done" }).eq("id", t.id));
  const [done] = await ok(a.from("tasks").select("*").eq("id", t.id));
  assert(done.completed_at);
  console.log(
    "RLS PASS: lectura, modificación, borrado, vista, suplantación, FK y anónimo.",
  );
} finally {
  if (pa) await ok(a.from("projects").delete().eq("id", pa.id));
  if (pb) await ok(b.from("projects").delete().eq("id", pb.id));
  await a.auth.signOut();
  await b.auth.signOut();
}
