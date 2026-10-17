# GitFlow y colaboración real

Este paquete no contiene un historial inventado. El requisito académico de participación debe cumplirse con trabajo real del equipo.

```sh
git init -b main
git add .
git commit -m "chore: base ejecutable de TaskFlow"
git switch -c develop
git switch -c feature/task-board
# Implementar y verificar; commitear con la identidad real del autor.
git add .
git commit -m "feat: mejorar tablero de tareas"
git push -u origin feature/task-board
```

Crear un repositorio en la cuenta del equipo; agregar su URL REAL con `git remote add origin URL_REAL` y subir main/develop. Invitar al docente.
Abrir PR feature/* → develop. Otro integrante revisa, registra evidencia y aprueba; CI debe pasar. Integrar con merge commit para conservar la historia.
Desde develop crear release/1.0.0; estabilizar allí sin nuevas funcionalidades, PR a main, etiqueta v1.0.0 y reintegración a develop.
Desde main crear hotfix/1.0.1 si existe un fallo crítico; revisar, integrar a main, etiquetar y reintegrar a develop y cualquier release activa.
Proteger main/develop: prohibir push directo, exigir revisión y CI, sin force push. No confundir un archivo de documentación con la configuración real en GitHub.

| Responsable real | Área sugerida | Evidencia requerida |
|---|---|---|
| Por completar | Arquitectura / SQL | Commits y PR revisado |
| Por completar | Interfaz / accesibilidad | Commits y PR revisado |
| Por completar | QA / analítica | Pruebas y PR revisado |

Repartir las mejoras y revisiones equitativamente; no añadir coautores que no participaron.
