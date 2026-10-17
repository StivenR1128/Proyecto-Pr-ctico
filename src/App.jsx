import React, { useEffect, useState } from "react";
import {
  repository,
  supabase,
  mode,
  configError,
  initializationError,
} from "./data";
import {
  statuses,
  priorities,
  metrics,
  overdue,
  csv,
  dateInBogota,
} from "./domain";
import "./style.css";
function App() {
  const [session, setSession] = useState(null),
    [ready, setReady] = useState(mode === "demo"),
    [data, setData] = useState({ projects: [], tasks: [] }),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [view, setView] = useState("board"),
    [project, setProject] = useState(""),
    [status, setStatus] = useState(""),
    [search, setSearch] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [editor, setEditor] = useState(null),
    [projectForm, setProjectForm] = useState(false),
    [register, setRegister] = useState(false);
  const userId = session?.user.id;
  useEffect(() => {
    if (!editor && !projectForm) return;
    const previous = document.activeElement;
    const handler = (e) => {
      const dialog = document.querySelector('[role="dialog"]');
      if (e.key === "Escape") {
        setEditor(null);
        setProjectForm(false);
      }
      if (e.key === "Tab" && dialog) {
        const items = [
          ...dialog.querySelectorAll(
            "button:not(:disabled),input,textarea,select",
          ),
        ];
        const first = items[0],
          last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [!!editor, !!projectForm]);

  async function load() {
    setData(await repository.load());
  }
  async function action(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e.message || "Ocurrió un error.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (alive) {
        setSession(data.session);
        setReady(true);
        if (error) setError(error.message);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setData({ projects: [], tasks: [] });
      setReady(true);
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (ready && (mode === "demo" || session)) action(load);
  }, [ready, userId]);
  const filtered = data.tasks.filter(
    (t) =>
      (!project || t.project_id === project) &&
      (!status || t.status === status) &&
      t.title.toLowerCase().includes(search.toLowerCase()) &&
      (!from || dateInBogota(t.created_at) >= from) &&
      (!to || dateInBogota(t.created_at) <= to),
  );
  const kpi = metrics(filtered);
  function download() {
    const blob = new Blob(["\ufeff" + csv(filtered, data.projects)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "taskflow-analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  async function auth(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await action(async () => {
      const credentials = {
        email: f.get("email"),
        password: f.get("password"),
      };
      const { error } = register
        ? await supabase.auth.signUp({
            ...credentials,
            options: { emailRedirectTo: window.location.origin },
          })
        : await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      setNotice(
        register
          ? "Revisa tu correo para confirmar la cuenta antes de iniciar sesión."
          : "Sesión iniciada.",
      );
    });
  }
  if (configError || initializationError)
    return (
      <main className="auth">
        <h1>Configura TaskFlow</h1>
        <p role="alert">{configError || initializationError}</p>
        <p>Consulta el README y reinicia el servidor después de editar .env.</p>
      </main>
    );
  if (!ready) return <main className="auth">Cargando sesión…</main>;
  if (mode === "supabase" && !session)
    return (
      <main className="auth">
        <div className="brand">▧ TaskFlow</div>
        <span className="eyebrow">ESPACIO DE TRABAJO PERSONAL</span>
        <h1>
          Tu próximo gran
          <br />
          proyecto empieza aquí.
        </h1>
        <p>Organiza tus tareas. Haz espacio para lo importante.</p>
        <form onSubmit={auth}>
          <label>
            Correo electrónico
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              minLength="8"
              autoComplete={register ? "new-password" : "current-password"}
              required
            />
          </label>
          <button disabled={busy}>
            {register ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </form>
        <button
          className="link"
          onClick={() => {
            setRegister(!register);
            setError("");
          }}
        >
          {register ? "Ya tengo cuenta" : "Crear una cuenta"}
        </button>
        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
      </main>
    );
  return (
    <div className="shell">
      <aside>
        <div className="brand">
          ▧ TaskFlow<span>WORKSPACE</span>
        </div>
        <div className="workspace">
          <b>TF</b>
          <div>
            Mi espacio personal
            <small>
              {mode === "demo" ? "Demostración local" : session.user.email}
            </small>
          </div>
        </div>
        <span className="nav-label">TRABAJO</span>
        <button
          className={view === "board" ? "nav active" : "nav"}
          onClick={() => setView("board")}
        >
          ▦ &nbsp; Tablero de tareas
        </button>
        <button
          className={view === "analytics" ? "nav active" : "nav"}
          onClick={() => setView("analytics")}
        >
          ◷ &nbsp; Analítica
        </button>
        <div className="project-heading">
          <span className="nav-label">PROYECTOS</span>
          <button
            aria-label="Crear proyecto"
            className="link"
            onClick={() => setProjectForm({})}
          >
            ＋
          </button>
        </div>
        <button className="nav" onClick={() => setProject("")}>
          Todos los proyectos
        </button>
        {data.projects.map((p) => (
          <button
            className={"nav " + (project === p.id ? "selected" : "")}
            key={p.id}
            onClick={() => setProject(p.id)}
          >
            ◦ &nbsp; {p.name}
          </button>
        ))}
        <div className="aside-bottom">
          <p>
            Un paso a la vez.
            <br />
            <b>Todo empieza con una tarea.</b>
          </p>
          {supabase && (
            <button
              className="nav"
              disabled={busy}
              onClick={() =>
                action(async () => {
                  const { error } = await supabase.auth.signOut();
                  if (error) throw error;
                })
              }
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </aside>
      <main>
        <header>
          <span>
            Mi espacio{" "}
            <span className="muted">
              {" "}
              / {view === "board" ? "Tablero" : "Analítica"}
            </span>
          </span>
          <span className="mode">
            ●{" "}
            {mode === "demo"
              ? "Demo · datos en este navegador"
              : "Supabase · sesión protegida"}
          </span>
        </header>
        <section className="content">
          <div className="title-row">
            <div>
              <span className="eyebrow">MENOS RUIDO, MÁS PROGRESO</span>
              <h1>
                {view === "board"
                  ? "Tu trabajo, en movimiento."
                  : "Una mirada al progreso."}
              </h1>
              <p className="muted">
                {view === "board"
                  ? "Organiza tus prioridades y convierte los planes en entregas."
                  : "Explora las tareas y prepara tus datos para Looker Studio."}
              </p>
            </div>
            <button
              onClick={() =>
                setEditor({
                  title: "",
                  description: "",
                  project_id: project || data.projects[0]?.id || "",
                  status: "pending",
                  priority: "medium",
                  due_date: "",
                })
              }
            >
              ＋ Nueva tarea
            </button>
          </div>
          {mode === "demo" && (
            <div className="demo-note">
              Modo demostración: datos de ejemplo editables, guardados en este
              navegador. Activa Supabase en .env para usar cuentas y
              persistencia en la nube.
            </div>
          )}
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <div className="stats">
            <article>
              <span>Tareas en el período</span>
              <strong>{kpi.total}</strong>
              <small>Según los filtros seleccionados</small>
            </article>
            <article>
              <span>Tasa de finalización</span>
              <strong>
                {kpi.rate}
                <em>%</em>
              </strong>
              <small>{kpi.done} tareas completadas</small>
            </article>
            <article>
              <span>Tareas vencidas</span>
              <strong>
                {kpi.overdue}
                <em className="orange"> ↗</em>
              </strong>
              <small>Pendientes con fecha anterior a hoy</small>
            </article>
          </div>
          <div className="section-title">
            <h2>
              {view === "board" ? "Tablero de tareas" : "Resumen de actividad"}
            </h2>
            <button className="secondary" onClick={download}>
              ↓ Exportar CSV
            </button>
          </div>
          <div className="filters">
            <label className="search">
              Buscar tareas
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título…"
              />
            </label>
            <label>
              Proyecto
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
              >
                <option value="">Todos los proyectos</option>
                {data.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Todos los estados</option>
                {Object.entries(statuses).map(([v, n]) => (
                  <option key={v} value={v}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Creada desde
              <input
                aria-label="Creada desde"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label>
              Hasta
              <input
                aria-label="Creada hasta"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
            <button
              className="link"
              onClick={() => {
                setProject("");
                setStatus("");
                setSearch("");
                setFrom("");
                setTo("");
              }}
            >
              Limpiar
            </button>
          </div>
          {busy && <p role="status">Guardando o cargando…</p>}
          {view === "board" ? (
            <div className="board">
              {Object.entries(statuses).map(([s, label]) => (
                <section key={s} className={"column " + s}>
                  <h3>
                    <i /> {label}{" "}
                    <span>{filtered.filter((t) => t.status === s).length}</span>
                  </h3>
                  {filtered
                    .filter((t) => t.status === s)
                    .map((t) => (
                      <article className="task" key={t.id}>
                        <div className="task-top">
                          <span className={"badge " + t.priority}>
                            {priorities[t.priority]}
                          </span>
                          <button
                            className="link"
                            aria-label={"Editar " + t.title}
                            onClick={() => setEditor(t)}
                          >
                            Editar ↗
                          </button>
                        </div>
                        <h4>{t.title}</h4>
                        <p>{t.description}</p>
                        <small className="project-name">
                          {
                            data.projects.find((p) => p.id === t.project_id)
                              ?.name
                          }
                        </small>
                        <footer>
                          <span className={overdue(t) ? "late" : ""}>
                            {t.due_date
                              ? "◷ " + t.due_date
                              : "Sin fecha límite"}
                          </span>
                          <select
                            aria-label={"Estado de " + t.title}
                            value={t.status}
                            disabled={busy}
                            onChange={(e) =>
                              action(async () => {
                                await repository.task(
                                  {
                                    title: t.title,
                                    description: t.description,
                                    project_id: t.project_id,
                                    status: e.target.value,
                                    priority: t.priority,
                                    due_date: t.due_date,
                                  },
                                  userId,
                                  t.id,
                                );
                                await load();
                              })
                            }
                          >
                            {Object.entries(statuses).map(([v, n]) => (
                              <option value={v} key={v}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </footer>
                      </article>
                    ))}
                  {!filtered.some((t) => t.status === s) && (
                    <p className="empty">No hay tareas en este estado.</p>
                  )}
                </section>
              ))}
            </div>
          ) : (
            <div className="charts">
              <article>
                <h3>Distribución por estado</h3>
                {Object.entries(statuses).map(([s, n]) => (
                  <div className="bar-row" key={s}>
                    <span>{n}</span>
                    <meter
                      min="0"
                      max={Math.max(1, kpi.total)}
                      value={filtered.filter((t) => t.status === s).length}
                    />
                    <b>{filtered.filter((t) => t.status === s).length}</b>
                  </div>
                ))}
              </article>
              <article>
                <h3>Comparación por proyecto</h3>
                {data.projects.map((p) => (
                  <div className="bar-row" key={p.id}>
                    <span>{p.name}</span>
                    <meter
                      min="0"
                      max={Math.max(1, kpi.total)}
                      value={
                        filtered.filter((t) => t.project_id === p.id).length
                      }
                    />
                    <b>
                      {filtered.filter((t) => t.project_id === p.id).length}
                    </b>
                  </div>
                ))}
              </article>
              <article>
                <h3>Tareas creadas por fecha</h3>
                {[...new Set(filtered.map((t) => dateInBogota(t.created_at)))]
                  .sort()
                  .map((d) => (
                    <div className="bar-row" key={d}>
                      <span>{d}</span>
                      <meter
                        min="0"
                        max={Math.max(1, kpi.total)}
                        value={
                          filtered.filter(
                            (t) => dateInBogota(t.created_at) === d,
                          ).length
                        }
                      />
                      <b>
                        {
                          filtered.filter(
                            (t) => dateInBogota(t.created_at) === d,
                          ).length
                        }
                      </b>
                    </div>
                  ))}
                {!filtered.length && <p>Sin datos para estos filtros.</p>}
              </article>
            </div>
          )}
          <div className="bottom-note">
            TaskFlow / Haz que cada tarea cuente.
            <span>{filtered.length} tareas visibles</span>
          </div>
          {project && (
            <button
              className="link"
              onClick={() =>
                setProjectForm(data.projects.find((p) => p.id === project))
              }
            >
              Editar proyecto seleccionado
            </button>
          )}
          {project && (
            <button
              className="danger link"
              disabled={busy}
              onClick={() => {
                if (confirm("¿Eliminar este proyecto y todas sus tareas?"))
                  action(async () => {
                    await repository.remove("projects", project);
                    setProject("");
                    await load();
                  });
              }}
            >
              Eliminar proyecto seleccionado y sus tareas
            </button>
          )}
        </section>
      </main>
      {editor && (
        <div className="overlay">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-title"
          >
            <h2 id="task-title">
              {editor.id ? "Editar tarea" : "Nueva tarea"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = Object.fromEntries(new FormData(e.currentTarget));
                action(async () => {
                  await repository.task(f, userId, editor.id);
                  setEditor(null);
                  await load();
                });
              }}
            >
              <label>
                Título
                <input
                  name="title"
                  defaultValue={editor.title}
                  required
                  maxLength="160"
                  autoFocus
                />
              </label>
              <label>
                Descripción
                <textarea
                  name="description"
                  defaultValue={editor.description}
                />
              </label>
              <label>
                Proyecto
                <select
                  name="project_id"
                  defaultValue={editor.project_id}
                  required
                >
                  <option value="">Selecciona un proyecto</option>
                  {data.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label>
                  Estado
                  <select name="status" defaultValue={editor.status}>
                    {Object.entries(statuses).map(([v, n]) => (
                      <option key={v} value={v}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Prioridad
                  <select name="priority" defaultValue={editor.priority}>
                    {Object.entries(priorities).map(([v, n]) => (
                      <option key={v} value={v}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Fecha límite
                <input
                  type="date"
                  name="due_date"
                  defaultValue={editor.due_date || ""}
                />
              </label>
              {error && (
                <p role="alert" className="error">
                  {error}
                </p>
              )}
              <div className="actions">
                <button disabled={busy}>Guardar tarea</button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setEditor(null)}
                >
                  Cancelar
                </button>
                {editor.id && (
                  <button
                    type="button"
                    className="danger secondary"
                    disabled={busy}
                    onClick={() => {
                      if (confirm("¿Eliminar esta tarea?"))
                        action(async () => {
                          await repository.remove("tasks", editor.id);
                          setEditor(null);
                          await load();
                        });
                    }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      )}
      {projectForm && (
        <div className="overlay">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-title"
          >
            <h2 id="project-title">
              {projectForm.id ? "Editar proyecto" : "Nuevo proyecto"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                action(async () => {
                  await repository.project(
                    f.get("name"),
                    f.get("description"),
                    userId,
                    projectForm.id,
                  );
                  setProjectForm(false);
                  await load();
                });
              }}
            >
              <label>
                Nombre
                <input
                  name="name"
                  defaultValue={projectForm.name || ""}
                  required
                  maxLength="100"
                  autoFocus
                />
              </label>
              <label>
                Descripción
                <textarea
                  name="description"
                  defaultValue={projectForm.description || ""}
                />
              </label>
              {error && <p role="alert">{error}</p>}
              <div className="actions">
                <button disabled={busy}>
                  {projectForm.id ? "Guardar proyecto" : "Crear proyecto"}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setProjectForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
export { App };
