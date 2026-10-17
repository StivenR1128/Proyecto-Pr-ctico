# Validación de la entrega — 2026-10-17

Entorno: Windows, Node v24.19.0, npm 11.17.0.

- npm install: dependencias descargadas y package-lock.json generado.
- npm test: 7 pruebas aprobadas en 2 archivos: 5 de reglas/analítica/CSV y 2 de interfaz (tareas, proyectos, persistencia, filtros y Escape).
- npm run build: build de producción generado en dist; Vite 7.3.7, 74 módulos transformados.
- Servidor Vite: inicia en http://127.0.0.1:5173.
- Revisión visual en navegador: tablero y analítica abiertos y capturados correctamente. Se resolvió el aislamiento del servidor local usando la ejecución autorizada fuera del sandbox. Capturas reales en docs/images/.
- PostgreSQL local (PGlite 0.5.10): migración ejecutada y 31 comprobaciones aprobadas de RLS, catálogos, claves, timestamps, vista y cascada. Identidad simulada; no acredita JWT cloud.
- Supabase remoto: migración aplicada, RLS verificado en las cinco tablas, 5 comprobaciones reales de acceso anónimo/JWT aprobadas. Cuenta institucional registrada, correo confirmado y primer inicio de sesión observados en Auth. CRUD autenticado y aislamiento entre dos sesiones cloud pendientes; ver CLOUD.md.
- OpenCode 1.19.3: instalado con versión fija; CLI y descubrimiento de agentes/skills ejecutados correctamente. Revisión real del agente qa con skill taskflow-quality y modelo gratuito ejecutada; ver OPENCODE_QA.md.
- Looker Studio: reporte real creado con CSV sintético y 3 KPIs visibles. Componentes de gráficos añadidos pero no se renderizan; filtros y permisos del docente pendientes. Ver CLOUD.md.
- GitHub: CI, GitFlow y plantilla PR incluidos; carga inicial del proyecto en https://github.com/StivenR1128/Proyecto-Pr-ctico; historial colaborativo, PRs y revisiones reales pendientes.

El PDF original se conserva en docs/Proyecto Practico.pdf para trazabilidad.

