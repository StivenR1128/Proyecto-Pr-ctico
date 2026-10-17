export const statuses = {
  pending: "Pendiente",
  in_progress: "En curso",
  done: "Completada",
};
export const priorities = { low: "Baja", medium: "Media", high: "Alta" };
export function validateTask(t) {
  if (!t.title?.trim() || t.title.trim().length > 160)
    throw Error("El título debe tener entre 1 y 160 caracteres.");
  if (!t.project_id) throw Error("Selecciona un proyecto.");
  if (!statuses[t.status] || !priorities[t.priority])
    throw Error("Estado o prioridad inválidos.");
  if (t.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(t.due_date))
    throw Error("Fecha inválida.");
  return {
    ...t,
    title: t.title.trim(),
    description: (t.description || "").trim(),
    due_date: t.due_date || null,
  };
}
export const today = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Bogota" }).format(
    new Date(),
  );
export const overdue = (t, date = today()) =>
  !!t.due_date && t.due_date < date && t.status !== "done";
export function metrics(tasks, date = today()) {
  return {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter((t) => overdue(t, date)).length,
    rate: tasks.length
      ? Math.round(
          (tasks.filter((t) => t.status === "done").length / tasks.length) *
            100,
        )
      : 0,
  };
}
export const dateInBogota = (value) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Bogota" }).format(
    new Date(value),
  );
export function csv(tasks, projects, date = today()) {
  const header = [
    "task_id",
    "project",
    "status",
    "priority",
    "created_date",
    "due_date",
    "completed_date",
    "is_completed",
    "is_overdue",
  ];
  const safe = (v) =>
    '"' +
    String(v ?? "")
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  return [
    header,
    ...tasks.map((t) => [
      t.id,
      projects.find((p) => p.id === t.project_id)?.name || "",
      t.status,
      t.priority,
      dateInBogota(t.created_at),
      t.due_date,
      t.completed_at ? dateInBogota(t.completed_at) : null,
      t.status === "done" ? 1 : 0,
      overdue(t, date) ? 1 : 0,
    ]),
  ]
    .map((r) => r.map(safe).join(","))
    .join("\r\n");
}
export function sample() {
  const now = new Date();
  const day = (n) =>
    new Date(now.getTime() + n * 86400000).toISOString().slice(0, 10);
  const projects = [
    {
      id: "demo-product",
      name: "Lanzamiento de producto",
      description: "De la idea a la primera entrega",
    },
    {
      id: "demo-web",
      name: "Sitio web",
      description: "Una experiencia más clara",
    },
  ];
  const titles = [
    "Diseñar el flujo de bienvenida",
    "Validar el modelo de datos",
    "Preparar la presentación",
    "Revisar accesibilidad",
    "Publicar la primera versión",
    "Definir métricas de éxito",
  ];
  return {
    projects,
    tasks: titles.map((title, i) => ({
      id: "demo-" + i,
      project_id: projects[i % 2].id,
      title,
      description:
        "Coordinar la entrega y documentar las decisiones del proyecto.",
      status: ["in_progress", "done", "pending"][i % 3],
      priority: ["high", "medium", "low"][i % 3],
      due_date: day(i - 2),
      created_at: day(-8 + i) + "T12:00:00Z",
      completed_at: i % 3 === 1 ? day(-1) + "T15:00:00Z" : null,
    })),
  };
}
