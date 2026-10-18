# 🛠️ Registro Central de Errores y Soluciones del CRM

> [!IMPORTANT]
> **REGLA PARA ASISTENTES IA (Antigravity / Claude / Desarrolladores):**
> Ante cualquier fallo, desconexión, error 502, error de base de datos o fallo de despliegue reportado por el usuario, **DEBES consultar obligatoriamente este directorio antes de formular hipótesis o investigar de cero**. 
> Si el síntoma o código de error ya está documentado aquí, aplica la solución validada de inmediato.

---

## 🗂️ Índice por Categoría

| Archivo | Área / Componente | Temas Cubiertos |
| :--- | :--- | :--- |
| [01-conector-mcp.md](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/docs/errores/01-conector-mcp.md) | **Conector MCP & Claude Cowork** | Códigos `ofid_...`, Error 502, colisiones de herramientas, SSE, Nginx proxy, timeouts |
| [02-base-de-datos.md](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/docs/errores/02-base-de-datos.md) | **Base de Datos & Supabase** | Migraciones SQL, restricciones de claves foráneas, estados de facturas, duplicados |
| [03-despliegue-vps.md](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/docs/errores/03-despliegue-vps.md) | **Despliegue, PM2 & CI/CD** | GitHub Actions, SSH timeouts, variables de entorno, systemd vs PM2, recarga Nginx |
| [04-frontend-dashboard.md](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/docs/errores/04-frontend-dashboard.md) | **Frontend & Dashboard Web** | Fallos de compilación Vite, parseo de métricas, rutas SPA |

---

## 🔍 Buscador Rápido por Códigos y Síntomas

| Código / Mensaje de Error | Componente Afectado | Documento con la Solución |
| :--- | :--- | :--- |
| `ofid_54ee02453327d687` / `ofid_e91eccc48a43714d` | Claude Cowork / MCP | [Ver [ERR-001] en 01-conector-mcp.md](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/docs/errores/01-conector-mcp.md#err-001) |
| `Error: Tool [nombre] is already registered` | SDK MCP / Tools Registration | [Ver [ERR-001] en 01-conector-mcp.md](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/docs/errores/01-conector-mcp.md#err-001) |
| `502 Bad Gateway` al consultar `/mcp` o `/sse` | Nginx & PM2 (Puertos 3005 / 3002) | [Ver [ERR-001] en 01-conector-mcp.md](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/docs/errores/01-conector-mcp.md#err-001) |
| Error en script de PowerShell: token `&&` | Terminal local Windows PowerShell | [Ver [ERR-002] en 03-despliegue-vps.md](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/docs/errores/03-despliegue-vps.md) |

---

## 📋 Plantilla para Registrar Nuevos Errores

Cada nuevo error que se resuelva debe añadirse al archivo correspondiente usando este formato:

```markdown
### [ERR-XXX] Título Descriptivo del Error
- **Fecha:** AAAA-MM-DD
- **Componente:** (MCP / Backend / Supabase / Nginx / Frontend)
- **Síntoma / Mensaje:** Copia literal del error visible para el usuario.
- **Causa Raíz:** Explicación técnica precisa de por qué ocurrió.
- **Archivos Modificados:** Enlaces a los archivos tocados.
- **Solución Aplicada:** Pasos concretos que resolvieron el problema.
- **Comando de Verificación:** Comando para comprobar que no vuelve a fallar.
```
