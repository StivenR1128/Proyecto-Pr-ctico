import { createClient } from "@supabase/supabase-js";
import { sample, validateTask } from "./domain";
export const mode = import.meta.env.VITE_DATA_MODE || "demo";
const url = import.meta.env.VITE_SUPABASE_URL,
  key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configError =
  mode !== "demo" && mode !== "supabase"
    ? "VITE_DATA_MODE debe ser demo o supabase."
    : mode === "supabase" && (!url || !key)
      ? "Completa la URL y la clave pública de Supabase en .env."
      : null;
let client = null;
let initializationError = null;
if (mode === "supabase" && !configError) {
  try {
    client = createClient(url, key);
  } catch {
    initializationError =
      "La URL o la clave pública de Supabase no son válidas. Revisa .env.";
  }
}
export { initializationError };
export const supabase = client;
const storage = "taskflow-demo-v1";
function read() {
  try {
    const raw = localStorage.getItem(storage);
    if (raw) return JSON.parse(raw);
  } catch {
    /* Restablecer demostración dañada. */
  }
  return sample();
}
function save(state) {
  localStorage.setItem(storage, JSON.stringify(state));
  return state;
}
async function check(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
export const repository = {
  async load() {
    if (mode === "demo") return read();
    const [projects, tasks] = await Promise.all([
      check(supabase.from("projects").select("*").order("created_at")),
      check(
        supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false }),
      ),
    ]);
    return { projects, tasks };
  },
  async project(name, description, userId, id) {
    if (!name.trim() || name.trim().length > 100)
      throw Error("El nombre debe tener entre 1 y 100 caracteres.");
    const p = { name: name.trim(), description: description.trim() };
    if (mode === "demo") {
      const state = read();
      state.projects = id
        ? state.projects.map((x) => (x.id === id ? { ...x, ...p } : x))
        : [...state.projects, { ...p, id: crypto.randomUUID() }];
      save(state);
      return;
    }
    await check(
      id
        ? supabase.from("projects").update(p).eq("id", id)
        : supabase.from("projects").insert({ ...p, owner_id: userId }),
    );
  },
  async task(input, userId, id) {
    const t = validateTask(input);
    if (mode === "demo") {
      const state = read();
      const previous = state.tasks.find((x) => x.id === id);
      const row = {
        ...previous,
        ...t,
        id: id || crypto.randomUUID(),
        created_at: previous?.created_at || new Date().toISOString(),
        completed_at:
          t.status === "done"
            ? previous?.completed_at || new Date().toISOString()
            : null,
      };
      state.tasks = id
        ? state.tasks.map((x) => (x.id === id ? row : x))
        : [row, ...state.tasks];
      save(state);
      return;
    }
    const row = { ...t };
    await check(
      id
        ? supabase.from("tasks").update(row).eq("id", id)
        : supabase.from("tasks").insert(row),
    );
  },
  async remove(table, id) {
    if (!["tasks", "projects"].includes(table))
      throw Error("Recurso inválido.");
    if (mode === "demo") {
      let s = read();
      s[table] = s[table].filter((x) => x.id !== id);
      if (table === "projects")
        s.tasks = s.tasks.filter((t) => t.project_id !== id);
      save(s);
      return;
    }
    await check(supabase.from(table).delete().eq("id", id));
  },
};
