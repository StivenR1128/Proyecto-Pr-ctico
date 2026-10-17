# Presentación (7–10 minutos)

1. Problema: tareas dispersas y prioridades poco visibles. Solución: tablero privado por cuenta.
2. Demo local: crear proyecto, crear tarea con prioridad/fecha, editar, completar, buscar y exportar CSV. Mostrar los tres KPIs y filtros.
3. Nube: tras configurar Supabase, mostrar registro/confirmación/inicio, una cuenta nueva vacía y una segunda cuenta aislada. La demo local no acredita persistencia cloud.
4. Arquitectura: mostrar ER, índices, relación proyecto/propietario, triggers, JWT y RLS. Mostrar resultado REAL de test-rls.
5. Agentes: abrir .opencode, ejecutar una tarea acotada con un especialista, mostrar skill cargada y validación real.
6. Analítica: abrir el reporte real de Looker, sus tres tarjetas, serie temporal, barras, distribución y filtros. Indicar cuándo se actualizó el CSV y que el período usa fecha de creación.
7. GitHub: mostrar ramas, commits de autores reales, PR revisado, CI y acceso docente.

## Correspondencia con PDF
| Requisito | Evidencia entregada | Acción externa pendiente |
|---|---|---|
| Agentes especializados y skills | .opencode y opencode.json | CLI, agentes y sesión QA con skill verificados; docs/OPENCODE_QA.md |
| Entorno homogéneo | .env.example, lockfile, README, TEAM | Node 24.19.0 y OpenCode 1.19.3 fijados; modelo gratuito probado |
| MCP si procede | Justificación de no usarlo | Ninguna |
| Supabase normalizado, FK, índices | Migración y ER, aplicados en cloud | Ninguna para la instalación actual; no repetir migración |
| Registro/login JWT y recursos protegidos | Registro/correo/login observados, 31 checks SQL y 5 cloud | Probar CRUD autenticado y dos identidades cloud |
| Looker: 3 KPIs, gráficos, filtros | Reporte real y captura Chrome; filtros comprobados | Abrir enlace desde cuenta docente y entregar en Classroom |
| GitHub y GitFlow con revisión | PRs, CI y protecciones reales | Trabajo individual; no hay revisión humana de otro integrante |
| Entrega Classroom | README completo | Adjuntar URLs reales con permisos |

No presentar este paquete como evidencia de trabajo colaborativo previo. El dashboard está compartido con datos sintéticos; la sesión privada del autor no se incluye en los archivos.
