import { describe, it, expect } from "vitest";
import { validateTask, metrics, csv, overdue } from "../src/domain";
const task = {
  id: "1",
  title: " Tarea ",
  description: "",
  project_id: "p",
  status: "pending",
  priority: "high",
  created_at: "2026-10-01T12:00:00Z",
  due_date: "2026-10-16",
};
describe("reglas y analítica", () => {
  it("rechaza títulos vacíos y referencias inválidas", () => {
    expect(() => validateTask({ ...task, title: " " })).toThrow();
    expect(() => validateTask({ ...task, project_id: "" })).toThrow();
    expect(() => validateTask({ ...task, status: "inventado" })).toThrow();
  });
  it("normaliza títulos y fechas opcionales", () =>
    expect(validateTask({ ...task, due_date: "" })).toMatchObject({
      title: "Tarea",
      due_date: null,
    }));
  it("cuenta vencidas excluyendo completadas y el día actual", () => {
    expect(overdue(task, "2026-10-17")).toBe(true);
    expect(overdue({ ...task, status: "done" }, "2026-10-17")).toBe(false);
    expect(overdue(task, "2026-10-16")).toBe(false);
  });
  it("calcula tasa con denominador vacío y con tareas", () => {
    expect(metrics([]).rate).toBe(0);
    expect(metrics([task, { ...task, status: "done" }], "2026-10-17")).toEqual({
      total: 2,
      done: 1,
      overdue: 1,
      rate: 50,
    });
  });
  it("escapa CSV y neutraliza fórmulas", () => {
    const result = csv(
      [task],
      [{ id: "p", name: '=SUM(1,2) "test"' }],
      "2026-10-17",
    );
    expect(result).toContain("'=SUM(1,2)");
    expect(result).toContain('""test""');
    expect(result).toContain('"0","1"');
  });
});
