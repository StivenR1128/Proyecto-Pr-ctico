# Correspondencia con Proyecto Práctico.pdf

Revisión: 17 de octubre de 2026. Especificación original: [Proyecto Practico.pdf](Proyecto%20Practico.pdf).

**Modalidad individual:** el estudiante confirmó en esta conversación que el profesor autorizó presentar individualmente por su modalidad virtual. Esta declaración no equivale a una constancia emitida por el docente. No se inventan integrantes, participación ni aprobaciones humanas.

| Requisito del profesor | Implementación y evidencia | Estado y límite |
|---|---|---|
| Aplicación funcional | React/Vite/Tailwind; proyectos y tareas, filtros, tablero, analítica y CSV; tests de interfaz | Implementada; flujo demo probado |
| Agentes especializados OpenCode | Cinco agentes en `.opencode/agents`, configuración `opencode.json` | Configurados y descubiertos por CLI |
| Skills del stack | Cinco skills en `.opencode/skills` | Configuradas; QA cargó su skill en sesión real |
| Uso de OpenCode | Revisión con agente QA y modelo gratuito | Evidencia en `OPENCODE_QA.md`; no se atribuye toda la implementación a OpenCode |
| MCP si el flujo lo requiere | Justificación en README: SDK, SQL Editor y archivos cubren el flujo | Opcional según el PDF; no requerido para este diseño |
| Entorno homogéneo | Node fijado, lockfile, OpenCode fijado, `.env.example` y scripts | Reproducible mediante `npm ci` |
| PostgreSQL Supabase normalizado | Cinco tablas, FK, índices, triggers, 3FN, migración y ER | Migración aplicada en proyecto cloud real |
| Registro e inicio mediante JWT | SDK Supabase Auth; registro, confirmación y login del autor observados en Auth | Implementado; 5 comprobaciones REST de acceso anónimo/JWT inválido |
| Recursos protegidos | Permisos, RLS y vista security_invoker | 31 comprobaciones SQL locales y 10 en PostgreSQL cloud |
| Persistencia/CRUD cloud | `scripts/test-cloud-sql.sql`: inserta, consulta, completa, borra, verifica cascada y aislamiento | Aprobada con rol authenticated e identidades SQL simuladas, dentro de ROLLBACK; no prueba emisión de JWT |
| Dashboard Looker | Reporte real, fuente CSV de 12 tareas sintéticas del modelo de la aplicación | Sin sincronización automática con Supabase; su procedencia está documentada |
| Tres KPIs | Total 12, finalización 41,67 %, vencidas 3 | Comprobados |
| Gráficos temporal, comparativo y distribución | Serie por creación, barras por proyecto, circular por estado | Verificados por el estudiante en Chrome, con captura |
| Filtros dinámicos | Proyecto, estado y fecha de creación | Valores contrastados con CSV; ver `CLOUD.md` |
| GitHub y acceso docente | Repositorio público, fuente, SQL y documentación | Enlace real en README |
| GitFlow | main/develop, feature y release, tags, PRs y CI | Historial real; hotfix se reserva para bugs críticos, no se fabricó uno |
| Revisión de código | Revisión real de IA documentada y validaciones CI en PRs | No hay aprobación humana independiente; modalidad individual declarada |
| README raíz detallado | Descripción, stack, agentes/skills, instalación, ER, diccionario y dashboard | Incluidos |
| Entrega Classroom | Dos enlaces reales preparados en `ENTREGA.md` | No se ha enviado en Classroom; no hay acceso a la actividad desde esta sesión |

## Evidencia adicional y límites

La consulta cloud se ejecutó en SQL Editor el 17 de octubre de 2026:
https://supabase.com/dashboard/project/rhkcvhgzcbxggmbmtwso/sql/58dd6f14-1cff-4a1c-80dd-095a892a3515

Resultado: `PASS: 10 comprobaciones SQL cloud; transaccion revertida; identidades SQL simuladas, JWT no probado aqui`.

Ese resultado corresponde a la ejecución inicial. Tras la revisión de OpenCode QA, el script mueve el aviso PASS al interior del bloque de comprobaciones y elimina el SELECT final incondicional. La versión revisada se aprueba solo si el lote termina sin errores. Si el cliente corta la ejecución por un error, se debe ejecutar ROLLBACK para cerrar la transacción.

La versión revisada terminó sin errores en esta consulta:
https://supabase.com/dashboard/project/rhkcvhgzcbxggmbmtwso/sql/1baef404-eb68-40a6-bd64-3d88a05522b8

El SQL Editor comienza como administrador, selecciona un perfil existente y cambia explícitamente al rol `authenticated` para comprobar RLS. La identidad ajena es un UUID simulado, no una segunda cuenta Auth. No cambia políticas ni concede permisos. Todas las operaciones se revierten. Para probar dos sesiones REST reales existe `scripts/test-rls.mjs`; requiere dos cuentas confirmadas y credenciales locales. No se ha ejecutado ni se declara aprobado ese ensayo.

No se puede garantizar una calificación: la aceptación de revisión de IA en modalidad individual y la evaluación final corresponden al profesor.
