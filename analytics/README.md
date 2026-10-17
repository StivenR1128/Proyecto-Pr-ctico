# Dashboard Looker Studio: TaskFlow / Progreso de trabajo

Estado: material listo; el reporte externo aún no está creado. URL: pendiente de publicar por el equipo.
Se usa un dataset derivado, permitido expresamente por el PDF. Evita exponer la base Postgres o una clave de servicio a Looker.

## Crear el reporte
1. Ejecuta la aplicación, entra con la cuenta que aporta el dataset, limpia filtros y pulsa Exportar CSV. Para presentación sin Supabase usa sample.csv (datos sintéticos, snapshot 2026-10-17).
2. Importa el CSV a Google Sheets en una hoja llamada tasks. Configura zona horaria America/Bogota, primera fila como cabecera y tipos según la tabla inferior. No incluir nombres sensibles de proyectos en reportes públicos.
3. En Looker Studio crea un reporte vacío; añade fuente Google Sheets y selecciona esa hoja. Configura las credenciales de la fuente conforme al público autorizado. Verifica acceso con otra cuenta del docente.
4. Añade tres tarjetas: total de tareas, tasa de finalización y tareas vencidas. Todos los componentes usan la misma fuente, el mismo intervalo y los mismos filtros.
5. Añade serie temporal por created_date con COUNT_DISTINCT(task_id); barras por project con COUNT_DISTINCT(task_id); gráfico circular por status con COUNT_DISTINCT(task_id).
6. Añade control de intervalo (dimensión created_date), listas desplegables project, status y priority. Título visible: "Tareas por fecha de creación". La tasa representa la cohorte de tareas creadas en ese período, no entregas ocurridas en él.
7. Publica y comparte lectura con el docente; copia el enlace REAL en README.md. Entrega captura con filtros y fecha de actualización visibles.

## Campos calculados
| KPI | Fórmula Looker Studio | Formato |
|---|---|---|
| Total tareas | COUNT_DISTINCT(task_id) | entero |
| Tasa de finalización | SUM(is_completed) / COUNT_DISTINCT(task_id) | porcentaje; sin datos mostrar 0 o sin datos |
| Tareas vencidas al exportar | SUM(is_overdue) | entero |

No combinar el dataset con tablas que dupliquen tareas. `is_overdue` es un snapshot: reexportar diariamente y reemplazar filas de Sheets, sin anexarlas. Una actualización de Looker no vuelve a consultar Supabase automáticamente en esta ruta manual.

## Diccionario de la fuente
| Campo | Tipo | Uso |
|---|---|---|
| task_id | texto | Identificador único; nunca sumar |
| project | texto | Filtro y comparación |
| status | texto | pending / in_progress / done |
| priority | texto | low / medium / high |
| created_date | fecha YYYY-MM-DD | Intervalo y serie temporal |
| due_date | fecha opcional | Fecha límite |
| completed_date | fecha opcional | Análisis opcional de entregas |
| is_completed | número 0/1 | KPI de finalización |
| is_overdue | número 0/1 | KPI vencidas al exportar |

La vista SQL task_analytics devuelve los mismos campos con JWT y RLS. Puede exportarse con el SDK desde un proceso privado si se automatiza más adelante; no hay un proceso programado configurado.
Validación sample.csv: total 12, completadas 5, tasa 41.67%, vencidas 3. Filtra project=Sitio web: total 6, completadas 3, tasa 50%, vencidas 1.
Layout sugerido 1440×900: título/fecha arriba, 3 tarjetas en una fila, serie temporal central, barras y distribución abajo, controles en la parte superior. Paleta verde #204F3F y fondo #F7F8F5.
