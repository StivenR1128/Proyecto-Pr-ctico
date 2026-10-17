---
name: taskflow-supabase
description: Implementa Supabase Auth, SQL y seguridad de datos.
compatibility: opencode
---
# Procedimiento

1. Lee README.md y docs/ARCHITECTURE.md.
2. Escribe migraciones transaccionales y políticas RLS. Prueba dos identidades y anónimo. Nunca confíes en owner_id enviado desde el navegador. Conserva coherencia de completed_at mediante trigger.
3. Haz un cambio acotado con criterio de aceptación verificable.
4. Ejecuta las verificaciones aplicables y registra el resultado real.
5. Actualiza documentación si cambia el contrato de datos o uso.
