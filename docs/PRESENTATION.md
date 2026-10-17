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
| Agentes especializados y skills | .opencode y opencode.json | Instalar/autenticar OpenCode, ejecutar y capturar |
| Entorno homogéneo | .env.example, lockfile, README, TEAM | Acordar versión exacta OpenCode/modelo |
| MCP si procede | Justificación de no usarlo | Ninguna |
| Supabase normalizado, FK, índices | Migración y ER | Crear proyecto y aplicar SQL |
| Registro/login JWT y recursos protegidos | SDK Auth, RLS y test externo | Configurar Auth y probar dos cuentas |
| Looker: 3 KPIs, gráficos, filtros | CSV y receta reproducible | Crear, validar y compartir reporte |
| GitHub y GitFlow con revisión | Guía, CI, plantilla PR | Publicar e implementar historial real |
| Entrega Classroom | README completo | Adjuntar URLs reales con permisos |

No presentar este paquete como evidencia de trabajo colaborativo previo ni como dashboard ya publicado.
