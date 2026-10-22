# 💻 Errores del Frontend y Dashboard Web

Este documento registra los incidentes relacionados con la interfaz web SPA (React + Vite), el renderizado del dashboard ejecutivo, comunicación cliente-servidor y resolución de rutas.

---

<a id="err-006"></a>
### [ERR-006] Dashboard Ejecutivo Invisible por Desalineación de API_BASE_URL tras Desacople a Hostinger

- **Fecha:** 2026-10-21
- **Componentes:** Frontend React (`frontend/src/api.ts`, `frontend/src/App.tsx`, `frontend/src/components/ClientPanelScreen.tsx`, `frontend/src/components/AgencyTasksSection.tsx`), CI/CD GitHub Actions (`.github/workflows/deploy.yml`), Nginx/Express en VPS (`https://crm-ia.metodoai.tech`).
- **Síntoma / Mensaje:**
  1. Al iniciar sesión en el CRM (`https://crm.metodoai.tech`), la pestaña del Dashboard Ejecutivo no muestra ningún contenido (espacio completamente vacío/en blanco), a pesar de que el indicador del sistema marca "Online".
  2. Al ingresar a la pestaña "Panel Clientes" (o secciones con llamadas directas), aparece un banner rojo con el mensaje:
     `Unexpected token '<', "<!doctype "... is not valid JSON`
- **Causa Raíz:**
  1. Al desacoplar el frontend del VPS y alojarlo en Hostinger Web Hosting (`crm.metodoai.tech`), el servidor web ya no cuenta con el proxy inverso local hacia Node.js (puerto 3005).
  2. En `.github/workflows/deploy.yml`, la variable `VITE_API_BASE_URL` se definía como `${{ secrets.VITE_API_BASE_URL || '' }}`. Al no existir dicho secreto en el repositorio, Vite compilaba la aplicación con `API_BASE_URL = ""`.
  3. Existían llamadas `fetch('/api/client-panel')` en `ClientPanelScreen.tsx` y `fetch('/api/activities')` en `AgencyTasksSection.tsx` codificadas con rutas relativas duras que ignoraban el cliente API unificado.
  4. Las peticiones a `/api/...` se enviaban al dominio estático de Hostinger (`https://crm.metodoai.tech/api/...`). La regla de reescritura `.htaccess` de la SPA devolvía el archivo `index.html` con código HTTP 200.
  5. `res.json()` fallaba al intentar parsear HTML como JSON (`SyntaxError: Unexpected token '<'`), arrojando el error en el banner de la vista.
- **Archivos Modificados:**
  - [`frontend/src/api.ts`](frontend/src/api.ts)
  - [`frontend/src/components/ClientPanelScreen.tsx`](frontend/src/components/ClientPanelScreen.tsx)
  - [`frontend/src/components/AgencyTasksSection.tsx`](frontend/src/components/AgencyTasksSection.tsx)
  - [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
  - [`frontend/src/App.tsx`](frontend/src/App.tsx)
- **Solución Aplicada:**
  1. Se configuró `DEFAULT_API_BASE_URL` en `frontend/src/api.ts` para que en entornos no-localhost (producción en Hostinger) apunte automáticamente al backend activo en `https://crm-ia.metodoai.tech`.
  2. Se añadió `getClientPanel` a `crmApi` y se migraron todas las llamadas `fetch('/api/...')` de `ClientPanelScreen.tsx` y `AgencyTasksSection.tsx` a `crmApi`.
  3. Se añadió validación en `fetchApi` para comprobar que `Content-Type` contenga `application/json` antes de procesar la respuesta, previniendo fallos silenciosos por páginas HTML interceptadas.
  4. Se estableció en `.github/workflows/deploy.yml` el valor por defecto `VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL || 'https://crm-ia.metodoai.tech' }}` durante la compilación.
  5. En `frontend/src/App.tsx`:
     - Se añadió un estado de carga y reconexión amigable con botón de reintento si `dashboardData` aún no está disponible.
     - Se aseguraron los accesos a `dashboardData?.marketing?.campaigns` con encadenamiento opcional y array seguro de respaldo.
     - Se vinculó `setServerOnline` a la recepción efectiva de métricas u oportunidades para evitar falsos positivos "Online".
- **Comando de Verificación:**
  Verificar que el endpoint del backend responda con JSON válido:
  ```powershell
  # Verificar endpoint de dashboard en el backend
  Invoke-RestMethod -Uri "https://crm-ia.metodoai.tech/api/dashboard"
  ```
