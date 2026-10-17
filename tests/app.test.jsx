import React from "react";
import {
  render,
  screen,
  waitFor,
  cleanup,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, it, expect } from "vitest";
// main.jsx exporta App; raíz separada para evitar un montaje lateral en pruebas.
import { App } from "../src/App";
beforeEach(() => localStorage.clear());
afterEach(cleanup);
it("crea una tarea, filtra y la mueve a completada con persistencia", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Diseñar el flujo de bienvenida");
  await user.click(screen.getByRole("button", { name: "＋ Nueva tarea" }));
  await user.type(screen.getByLabelText("Título"), "Entrega de prueba");
  await user.click(screen.getByRole("button", { name: "Guardar tarea" }));
  await screen.findByText("Entrega de prueba");
  await user.selectOptions(
    screen.getByLabelText("Estado de Entrega de prueba"),
    "done",
  );
  await waitFor(() =>
    expect(
      JSON.parse(localStorage.getItem("taskflow-demo-v1")).tasks.find(
        (t) => t.title === "Entrega de prueba",
      ).status,
    ).toBe("done"),
  );
  await user.type(
    screen.getByPlaceholderText("Buscar por título…"),
    "Entrega de prueba",
  );
  expect(screen.queryByText("Diseñar el flujo de bienvenida")).toBeNull();
});

it("crea y edita un proyecto y cancela el formulario con Escape", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Diseñar el flujo de bienvenida");
  await user.click(screen.getByLabelText("Crear proyecto"));
  await user.type(screen.getByLabelText("Nombre"), "Proyecto QA");
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Crear proyecto",
    }),
  );
  await user.click(
    await screen.findByRole("button", { name: "◦ Proyecto QA" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Editar proyecto seleccionado" }),
  );
  await user.clear(screen.getByLabelText("Nombre"));
  await user.type(screen.getByLabelText("Nombre"), "Proyecto actualizado");
  await user.click(screen.getByRole("button", { name: "Guardar proyecto" }));
  await screen.findByRole("button", { name: "◦ Proyecto actualizado" });
  await user.click(screen.getByRole("button", { name: "＋ Nueva tarea" }));
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
});
