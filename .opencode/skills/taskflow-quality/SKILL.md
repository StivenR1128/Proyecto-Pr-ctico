---
name: taskflow-quality
description: Verifica flujos críticos, seguridad y regresiones.
compatibility: opencode
---
# Procedimiento

1. Lee README.md y docs/ARCHITECTURE.md.
2. Ejecuta npm test y npm run build. Para RLS usa cuentas de prueba y scripts/test-rls.mjs. Documenta límites y resultados reales, sin afirmar ejecuciones externas no realizadas.
3. Haz un cambio acotado con criterio de aceptación verificable.
4. Ejecuta las verificaciones aplicables y registra el resultado real.
5. Actualiza documentación si cambia el contrato de datos o uso.
