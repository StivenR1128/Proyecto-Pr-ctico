# Evidencia de OpenCode — 2026-10-17

- Versión ejecutada: OpenCode 1.19.3.
- Agente seleccionado: qa (modo all; seleccionable y delegable).
- Modelo: opencode/glm-5.3-flash-free, disponible en el catálogo de OpenCode y ejecutado sin clave propia.
- Skill cargada correctamente: taskflow-quality.
- Archivos leídos: scripts/test-database.mjs y supabase/migrations/001_initial.sql.
- Revisión de solo lectura: no se le permitió ejecutar comandos, delegar ni editar.
- Primera revisión: detectó ramas del trigger sin cobertura y que los rechazos no distinguían el SQLSTATE.
- Cambios realizados tras la revisión: comprobación explícita de 42501/23503/23514; completar al crear; edición de perfiles propios/ajenos; acceso anónimo a perfiles/proyectos; actualización/borrado de proyecto ajeno; protección de timestamps; FK de proyecto inexistente y límite de título.
- Resultado del responsable de implementación: 31 comprobaciones PostgreSQL aprobadas, 7 pruebas de dominio/interfaz y build correcto.
- Segunda revisión del agente: confirmó la cobertura ampliada y señaló que sigue pendiente validar GoTrue, JWT, correo y API REST en Supabase cloud.

Esta revisión de IA no sustituye una aprobación humana de Pull Request. El trabajo es individual según declaración del estudiante; no se atribuyen commits a integrantes inexistentes.

Reproducción:
```sh
npm run opencode -- run --agent qa --model opencode/glm-5.3-flash-free "Carga taskflow-quality y revisa scripts/test-database.mjs y supabase/migrations/001_initial.sql. No ejecutes comandos ni edites archivos."
npm test
npm run test:database
npm run build
```

La disponibilidad futura del modelo gratuito depende del proveedor. Los logs completos quedan localmente y no se publican porque contienen rutas del equipo; no se incluyen credenciales.

## Revisión de cumplimiento y SQL cloud — 17 de octubre de 2026

Se ejecutó otra sesión real con `qa`, `taskflow-quality` y `opencode/glm-5.3-flash-free`. Leyó únicamente la skill, `scripts/test-cloud-sql.sql` y `docs/CUMPLIMIENTO.md`, sin comandos, edición ni delegación.

La revisión confirmó que el rol `authenticated` aplica las políticas RLS reales y que la documentación distingue identidad SQL simulada de JWT y de una segunda cuenta Auth. Detectó un marcador PASS final incondicional y señaló el límite de usar un UUID ajeno sin perfil real.

Se movió el aviso PASS al interior del bloque, después de las comprobaciones, y se eliminó el SELECT incondicional. Se mantuvo explícito el límite de identidad simulada y se añadió cómo cerrar la transacción si un cliente interrumpe el lote por un error. La consulta revisada se volvió a ejecutar en Supabase SQL Editor. Esta revisión de IA no se presenta como una aprobación humana de PR.
