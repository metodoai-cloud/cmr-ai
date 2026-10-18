# 🔌 Errores del Conector MCP (Claude Cowork / Claude Desktop)

Este documento registra los fallos detectados en el servidor MCP, el transporte HTTP/SSE, la integración con Nginx y la comunicación con Claude Cowork.

---

<a id="err-001"></a>
### [ERR-001] Falla de Conexión de Claude Cowork con Códigos "ofid_..." y Error 502

- **Fecha:** 2026-10-18
- **Componentes:** Conector MCP (`src/mcp/`), API Express (`src/api/server.ts`), Nginx y PM2 en VPS.
- **Códigos de Referencia Reportados por Claude Cowork:**
  - `ofid_54ee02453327d687`
  - `ofid_e91eccc48a43714d`
- **Síntoma Visible:**
  > *"No se pudo conectar con CRM IA. Puedes verificar la URL del servidor y confirmar que esté en funcionamiento. Si esto persiste, comparte esta referencia con el soporte: “ofid_...”"*
  Al probar con curl o inspeccionar peticiones, el servidor devolvía `502 Bad Gateway` o `500 Internal Server Error`.

#### 🔍 Causas Raíz Identificadas:
1. **Desalineación de Puertos Nginx / PM2:**
   - El backend principal (`src/index.ts`) corría en el puerto `3005`, pero **no tenía registradas las rutas `/mcp` ni `/sse`**. Si Nginx recibía tráfico a `/mcp` y lo enviaba al puerto 3005, el servidor devolvía 404 o el HTML de la SPA de React.
   - El servidor MCP dedicado (`src/mcp/http-server.ts`) escuchaba en el puerto `3002`, pero el flujo de GitHub Actions **no lo levantaba en PM2** (solo levantaba `crm` en el puerto 3005). Nginx arrojaba `502 Bad Gateway` al intentar conectar con el puerto 3002 apagado.
2. **Colisión de Herramientas Duplicadas en el SDK de MCP:**
   - En [`src/mcp/tools.ts`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/src/mcp/tools.ts), las herramientas `listar_proyectos` (líneas 839 y 1503) y `actualizar_proyecto` (líneas 876 y 1527) estaban declaradas **dos veces**.
   - Al recibir la petición `initialize` de Claude Cowork, el SDK lanzaba la excepción:
     ```text
     Error: Tool listar_proyectos is already registered
     ```
   - Al no estar capturada dentro de un bloque `try/catch` en la inicialización de la conexión, Express devolvía un error 500 en formato HTML en lugar de JSON-RPC, provocando el rechazo inmediato de Claude Cowork.

#### 🛠️ Solución Aplicada:
1. **Arquitectura de Doble Redundancia en Puertos:**
   - Se modularizó la lógica en [`src/mcp/handler.ts`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/src/mcp/handler.ts) con un transporte sin estado (`StreamableHTTPServerTransport`).
   - Se montaron los endpoints `/mcp` y `/sse` directamente en [`src/api/server.ts`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/src/api/server.ts) (puerto 3005) con soporte CORS total (`mcp-session-id`, `mcp-protocol-version`, `x-session-id`).
   - Se mantuvo activo el servidor dedicado en [`src/mcp/http-server.ts`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/src/mcp/http-server.ts) (puerto 3002).
2. **Eliminación de Herramientas Duplicadas:**
   - Se eliminaron las definiciones redundantes en [`src/mcp/tools.ts`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/src/mcp/tools.ts), dejando las 53 herramientas operativas únicas y verificadas.
3. **Blindaje contra Caídas (Try/Catch):**
   - En [`src/mcp/handler.ts`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/src/mcp/handler.ts), la inicialización del servidor y el registro de herramientas se envolvieron en `try/catch/finally` para que cualquier error interno se gestione limpiamente y libere los recursos del transporte.
4. **Gestión Dual en PM2 y Despliegue Automatizado:**
   - Se creó [`ecosystem.config.cjs`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/ecosystem.config.cjs).
   - Se actualizó [`.github/workflows/deploy.yml`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/.github/workflows/deploy.yml) para reiniciar tanto `crm` (3005) como `crm-mcp` (3002) y validar `/health` en ambos puertos en cada push a `main`.

#### 🧪 Comprobación y Verificación Rápida:
Ejecutar desde terminal para confirmar que el servidor responde con HTTP 200 y formato JSON-RPC:
```bash
node -e "fetch('https://crm-ia.metodoai.tech/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'verifier', version: '1.0' } } }) }).then(r => r.json()).then(d => console.log('MCP OK:', d.result?.serverInfo));"
```

#### 🌐 URLs Oficiales y Válidas:
- **Streamable HTTP (Recomendada para Claude Cowork):**
  `https://crm-ia.metodoai.tech/mcp`
- **Server-Sent Events (SSE):**
  `https://crm-ia.metodoai.tech/sse`
- **Monitoreo de Salud:**
  `https://crm-ia.metodoai.tech/health`
