# Configuración cloud verificada — 17 de octubre de 2026

## Supabase

Proyecto TaskFlow: `rhkcvhgzcbxggmbmtwso`, en la organización StivenR1128.
La migración `supabase/migrations/001_initial.sql` se aplicó correctamente mediante SQL Editor. No volver a ejecutarla: las modificaciones posteriores necesitan una migración nueva. La aplicación manual no registra historial de migraciones de Supabase CLI.

Se verificó RLS habilitado en profiles, projects, tasks, task_statuses y priorities. La configuración pública del proyecto está en `.env.example`; copiarla a `.env` activa la conexión. La clave publishable está diseñada para el frontend y no concede privilegios administrativos. No se incluyen contraseñas, claves secretas ni service_role.

`npm run test:cloud` comprueba contra el servicio real que profiles, projects, tasks y task_analytics rechazan lecturas anónimas y que Auth rechaza un JWT inválido: 5 comprobaciones aprobadas.

El panel Authentication confirmó el registro, la confirmación de correo y el primer inicio de sesión de la cuenta institucional del autor. Esta observación no acredita todavía el flujo completo de CRUD desde esa sesión ni aislamiento entre dos usuarios cloud. Para este último existe `npm run test:rls`, con dos cuentas de prueba confirmadas y sus credenciales únicamente en `.env` local.

Origen local configurado: `http://127.0.0.1:5173`. Para publicar la aplicación se debe configurar el origen HTTPS del alojamiento en Auth y reconstruir con las variables públicas. El repositorio no proporciona un alojamiento web de producción.

## Looker Studio / Data Studio

Reporte real creado en la cuenta institucional:
https://datastudio.google.com/u/1/reporting/281c1997-00c3-4873-bb45-5c6b59fbeb8d/page/SKVBG

Fuente CSV sintética `analytics/sample.csv`, de 12 tareas; no es una conexión automática a Supabase. KPIs observados: 12 tareas, 41,67 % finalizadas y 3 vencidas. Se añadieron controles por proyecto, estado y periodo y componentes de serie temporal, barras y distribución por estado.

El autor verificó los tres gráficos en Chrome y aportó la captura `docs/images/looker-verificado-chrome.png`. El navegador automatizado no renderiza esos marcos, aunque sí permite comprobar los KPIs y controles. Se amplió el lienzo a 1200 × 1100 para evitar recortar los gráficos inferiores.

Filtros comprobados contra la muestra:

| Selección | Tareas | Finalización | Vencidas |
|---|---:|---:|---:|
| Todas | 12 | 41,67 % | 3 |
| Proyecto Sitio web | 6 | 50 % | 1 |
| Estado done | 5 | 100 % | 0 |
| Creación del 1 al 6 de octubre de 2026 | 6 | 83,33 % | 1 |

Se restablecieron todos los filtros. El autor autorizó acceso de lectura para cualquier persona con el enlace y se guardó esa configuración (Oculto / Lector). Entregar el enlace en Classroom; no se ha realizado esa entrega ni una apertura desde la cuenta del docente. La receta y las fórmulas están en `analytics/README.md`.

