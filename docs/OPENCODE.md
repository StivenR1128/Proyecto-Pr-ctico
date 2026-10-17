# Entorno OpenCode verificado

OpenCode **1.19.3** está fijado como dependencia de desarrollo y en package-lock.json. Todos los integrantes ejecutan la misma versión con:

```sh
npm ci
npm run opencode -- --version
npm run opencode -- agent list
npm run opencode
```

El lanzador mantiene configuración global, logs, caché y credenciales de OpenCode en `.local/opencode/`, excluido de Git. Las definiciones compartidas permanecen en `.opencode/` y `opencode.json`.

Se verificó que OpenCode arranca y reconoce los agentes architect, frontend, backend, qa y analytics, además de las cinco carpetas de skills. Se ejecutó además una revisión de QA con el modelo gratuito opencode/glm-5.3-flash-free. Ver [evidencia de la sesión](OPENCODE_QA.md).

Para usar un modelo, cada integrante debe conectar su propio proveedor con `/connect` en la interfaz. La revisión incluida usó un modelo gratuito sin clave propia. No se han suministrado credenciales de proveedores de pago ni autorización para facturación. No se presupuesta ni se contrata ningún proveedor.

Ejemplo de trabajo real: solicitar a `@qa` que cargue `taskflow-quality`, revise `scripts/test-database.mjs` y documente sus resultados. En otra sesión, `@backend` puede revisar la migración SQL. Registrar fecha, proveedor/modelo, agente, skill, resultado y PR en TEAM.md; no copiar tokens ni conversaciones con secretos al repositorio.

Documentación de instalación y CLI: https://opencode.ai/docs/ y https://opencode.ai/docs/cli/.
