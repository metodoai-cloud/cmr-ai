# 🗄️ Errores de Base de Datos y Supabase

Este documento registra los incidentes relacionados con migraciones de esquema SQL, inconsistencias en tablas, restricciones de integridad referencial y procedimientos de Supabase.

---

### [ERR-002] Facturas en Borrador sin Folio e IVA Calculado sobre Bruto
- **Fecha:** 2026-10-18
- **Componentes:** `invoices`, `subscriptions`, migraciones SQL `07_` y `08_`.
- **Síntoma / Mensaje:** 
  Aparecen facturas en estado `pendiente` / `draft` sin folio asignado (`#--`) con montos inflados donde el valor pactado se toma como neto en lugar de valor bruto con IVA incluido.
- **Causa Raíz:** 
  Generación automática de borradores por scripts de recurrencia mensuales que no contaban con lógica de desglose de IVA inverso (`Neto = Total / 1.19`) ni validación de folio oficial emitido.
- **Solución Aplicada:**
  - Simplificación de estados en español (`pagada`, `pendiente`, `vencida`, `anulada`).
  - Prohibición de creación de facturas sin número de folio real emitido.
  - Implementación de cálculo inverso de IVA cuando el precio pactado es IVA incluido.
- **Archivos Relacionados:**
  - [`src/db/migrations/07_add_invoices_notes_and_activities_status.sql`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/src/db/migrations/07_add_invoices_notes_and_activities_status.sql)
  - [`src/db/migrations/08_add_lost_at_stage_and_state_machine.sql`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/src/db/migrations/08_add_lost_at_stage_and_state_machine.sql)
  - [`src/services/index.ts`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/src/services/index.ts)

---

<a id="err-003"></a>
### [ERR-003] Omisión de Filtro por ID y Categoría en findAll de Repositorios
- **Fecha:** 2026-10-18
- **Componentes:** `BaseRepository`, `ExpenseRepository`, `ProjectRepository`.
- **Síntoma / Mensaje:**
  Al consultar registros invocando `.findAll({ id: '...' })` o filtrando gastos por categoría (`.findAll({ category: '...' })`), la consulta devolvía la lista completa o ignoraba el filtro por ID, lo que previamente causó afectaciones masivas (ej: cancelación accidental de proyectos de oportunidades al no filtrar por `opportunity_id`).
- **Causa Raíz:**
  La interfaz `QueryFilters` definía `id?: string`, pero en la implementación de `BaseRepository.findAll` faltaba la cláusula `if (filters.id) query = query.eq('id', filters.id);`. Asimismo, `ExpenseRepository` no sobrescribía `findAll` para soportar filtros por `category` o `id`, ni asociaba los datos del proveedor (`vendors`).
- **Archivos Modificados:**
  - [`src/repositories/BaseRepository.ts`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/src/repositories/BaseRepository.ts)
  - [`src/repositories/index.ts`](file:///c:/Users/casa/Documents/_TRABAJO/_D300/GESTION%20AG/CMR/src/repositories/index.ts)
- **Solución Aplicada:**
  - Se incorporó `if (filters.id) query = query.eq('id', filters.id);` en `BaseRepository.findAll`.
  - Se implementaron métodos dedicados `findAll` y `findById` en `ExpenseRepository` con filtros por `id`, `category` (con `ilike`), `status`, `vendor_id`, fechas y unión relacional a `vendors(id, name)`.
- **Comando de Verificación:**
  ```powershell
  npx tsx src/scripts/test-actualizar-gasto.ts
  ```

