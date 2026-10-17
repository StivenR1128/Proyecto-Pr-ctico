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

**Pendiente:** los tres gráficos no se renderizan en el navegador de verificación. No se considera el dashboard terminado ni se ha verificado acceso del docente. Resolver el renderizado, validar los filtros y configurar permisos de lectura antes de entregarlo en Classroom. La receta y las fórmulas están en `analytics/README.md`.
