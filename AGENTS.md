# 🤖 Instrucciones para Asistentes de IA (AGENTS.md)

Este repositorio cuenta con una **Base de Conocimiento de Errores e Incidentes** en la carpeta [`docs/errores/`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/docs/errores/).

## 🚨 Reglas Obligatorias de Operación:

1. **Consultar antes de investigar:**
   Ante cualquier reporte de error, código de falla (ej: `ofid_...`), error 502, falla de conector MCP, error en base de datos o fallo de despliegue, **debes leer y consultar primero los archivos en `docs/errores/`**.
   - No comiences a formular hipótesis a ciegas si el problema ya fue diagnosticado y resuelto anteriormente.

2. **Aplicar soluciones validadas:**
   Si el síntoma o código coincide con una ficha en `docs/errores/`, aplica de inmediato la solución comprobada y ejecuta el comando de verificación correspondiente.

3. **Mantener la bitácora actualizada:**
   Cada vez que resuelvas un nuevo error o incidente que no esté registrado, añade su ficha respectiva en el archivo correspondiente dentro de `docs/errores/` siguiendo la plantilla establecida en [`docs/errores/README.md`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/docs/errores/README.md).

4. **Entorno Windows PowerShell:**
   Recuerda que la terminal local ejecuta Windows PowerShell 5.1; no uses `&&` para encadenar comandos, usa `;`.
