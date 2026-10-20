# 🚀 Errores de Despliegue, PM2 y Servidor VPS

Este documento registra incidentes ocurridos en el pipeline de CI/CD (GitHub Actions), configuración del VPS Ubuntu, PM2, Systemd, Nginx y la terminal local de desarrollo.

---

### [ERR-003] Fallo de Sintaxis en Windows PowerShell con Encadenamiento `&&`
- **Fecha:** 2026-10-18
- **Componente:** Terminal Windows PowerShell (v5.1 por defecto del sistema)
- **Síntoma / Mensaje:**
  ```text
  El token '&&' no es un separador de instrucciones válido en esta versión.
  CategoryInfo: ParserError, ParentContainsErrorRecordException
  FullyQualifiedErrorId: InvalidEndOfLine
  ```
- **Causa Raíz:** 
  Windows PowerShell 5.1 no soporta la sintaxis bash/POSIX de operadores lógicos `&&` o `||` en línea de comandos directos sin PowerShell 7 Core.
- **Solución Aplicada:**
  Utilizar el separador punto y coma (`;`) para encadenar instrucciones secuenciales en Windows:
  ```powershell
  # INCORRECTO en PowerShell 5.1:
  git add -A && git commit -m "..."
  
  # CORRECTO:
  git add -A; git commit -m "..."
  ```

---

### [ERR-004] Interrupción o Timeout en Conexión SSH durante Despliegue
- **Fecha:** Histórico / 2026-08 a 2026-10
- **Componentes:** `.github/workflows/deploy.yml`, SSH en runner de GitHub Actions.
- **Síntoma / Mensaje:**
  El job de GitHub Actions finalizaba con error `Connection timed out` o `Permission denied (publickey)` tras 15 segundos sin completar el pull o la compilación.
- **Causa Raíz:** 
  1. Timeouts muy cortos en la conexión inicial (`ConnectTimeout 15` sin keepalive).
  2. Inclusión involuntaria de prefijos de usuario o espacios en blanco en la variable `VPS_HOST`.
- **Solución Aplicada:**
  - Se añadieron reintentos automáticos (bucle de 3 intentos con 10s de espera).
  - Se aumentó el timeout a `ConnectTimeout=30 -o ServerAliveInterval=15`.
  - Se sanitizaron las variables `VPS_HOST` y `VPS_USER` extrayendo el host si viene como `root@ip`.
- **Archivo Modificado:**
  [`/.github/workflows/deploy.yml`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/.github/workflows/deploy.yml)

---

### [ERR-005] Colisión de Webroot en Nginx VPS y Desacople a Hosting Web Hostinger vía FTP
- **Fecha:** 2026-10-20
- **Componente:** CI/CD (GitHub Actions) / Nginx VPS / Hosting Web Hostinger
- **Síntoma / Mensaje:**
  Al acceder a `https://goplanbe.metodoai.tech/`, el servidor Nginx entregaba la interfaz de usuario del CRM en lugar de la red GoPlanBe.
- **Causa Raíz:**
  1. Tanto `goplanbe.metodoai.tech` como `crm.metodoai.tech` apuntaban a la misma IP del VPS (2.25.164.77).
  2. El script `scripts/deploy_vps.sh` ejecutado por el workflow de GitHub Actions copiaba el frontend compilado del CRM (`frontend/dist/*`) a todos los webroots encontrados en `/etc/nginx/sites-enabled/`, sobreescribiendo el webroot de GoPlanBe.
- **Archivos Modificados:**
  - [`.github/workflows/deploy.yml`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/.github/workflows/deploy.yml)
  - [`frontend/public/.htaccess`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/frontend/public/.htaccess)
  - [`frontend/src/api.ts`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/frontend/src/api.ts)
  - [`package.json`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/package.json)
- **Solución Aplicada:**
  1. Se desacopló `crm.metodoai.tech` del VPS, migrándolo a un Hosting Web independiente en Hostinger (`public_html/`). El VPS (2.25.164.77) queda exclusivo para GoPlanBe y sus microservicios.
  2. Se sustituyó el workflow de despliegue SSH al VPS por un pipeline de CI/CD por FTP con `SamKirkland/FTP-Deploy-Action@v4.3.5`.
  3. Se configuró la compilación del frontend SPA Vite (`frontend/dist/`) copiándolo a `dist/` para el envío FTP automático a `./public_html/`.
  4. Se añadió `.htaccess` en `frontend/public/` para el enrutamiento correcto de la SPA y optimización de caché en el hosting web.
  5. Se añadió validación temprana de secretos (`HOSTINGER_FTP_HOST`, `HOSTINGER_FTP_USER`, `HOSTINGER_FTP_PASSWORD`) en el workflow.
- **Comando de Verificación:**
  Ejecutar el workflow en GitHub Actions tras registrar los 3 secrets de FTP en GitHub y comprobar carga de `https://crm.metodoai.tech`.

