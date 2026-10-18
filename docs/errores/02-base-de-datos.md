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
