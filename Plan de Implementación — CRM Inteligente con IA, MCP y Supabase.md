# Plan de Implementación: CRM Inteligente con IA + MCP + Supabase

Este documento define la arquitectura, modelo de datos, reglas de negocio y fases de implementación de un **CRM inteligente para una empresa de servicios de marketing y automatización**.

El sistema debe integrar en una única plataforma:

- Marketing
- Ventas
- Operaciones
- Clientes
- Facturación
- Finanzas
- Analítica

La **base de datos PostgreSQL de Supabase será la fuente única de verdad**.

La inteligencia artificial será la interfaz principal para interactuar con el CRM mediante lenguaje natural. La IA podrá consultar información y solicitar operaciones utilizando herramientas controladas mediante **MCP (Model Context Protocol)**.

La IA **NO debe tener acceso directo e irrestricto de escritura sobre PostgreSQL**.

El principio arquitectónico fundamental será:

> **La IA interpreta qué quiere hacer el usuario. El backend determina cómo debe ejecutarse. PostgreSQL registra lo que realmente ocurrió.**

---

# 1. Objetivo del Sistema

Construir un sistema operativo empresarial controlado mediante inteligencia artificial que conecte el ciclo completo:

```text
Marketing
    ↓
Lead
    ↓
Contacto / Empresa
    ↓
Oportunidad
    ↓
Venta
    ↓
Cliente
    ↓
Proyecto / Suscripción
    ↓
Factura
    ↓
Pago
    ↓
Rentabilidad
```

Paralelamente:

```text
Campaña
    ↓
Gancho
    ↓
Lead
    ↓
Oportunidad
    ↓
Venta
    ↓
Ingreso
    ↓
Margen
```

Y financieramente:

```text
Pagos de clientes
        +
Otros ingresos
        -
Gastos
        -
Impuestos
        -
Retiros
        =
Flujo neto de caja
```

El objetivo es poder seguir una relación desde el primer contacto de marketing hasta el dinero efectivamente cobrado y el beneficio generado.

---

# 2. Principios Arquitectónicos

El sistema debe cumplir los siguientes principios.

## 2.1 Fuente única de verdad

Supabase/PostgreSQL será la fuente única de verdad.

La IA no debe utilizar su memoria como almacenamiento de información empresarial.

---

## 2.2 IA como interfaz

El usuario debe poder interactuar mediante lenguaje natural.

Ejemplo:

```text
"Tuve una reunión con Laura de DentalPro.

Tienen 7 clínicas y están perdiendo leads de WhatsApp.

Le interesa nuestra automatización.

Hablamos de $8,000 de implementación y $1,500 mensuales.

Enviar propuesta el jueves."
```

La IA deberá convertir esto en operaciones estructuradas:

```text
buscar contacto
↓
crear/actualizar contacto
↓
buscar/crear empresa
↓
registrar actividad
↓
crear/actualizar oportunidad
↓
registrar setup = 8000
↓
registrar MRR = 1500
↓
crear próxima acción
```

---

## 2.3 La IA interpreta; el backend ejecuta

La IA nunca debe implementar procesos empresariales complejos ejecutando múltiples escrituras independientes.

Por ejemplo, si una oportunidad se gana:

```text
cerrar_oportunidad()
```

debe ser una única operación de negocio.

El backend será responsable de ejecutar:

```text
BEGIN TRANSACTION

Actualizar oportunidad → GANADA

Crear/actualizar cliente

Crear proyecto

Crear suscripción

Preparar factura

Crear onboarding

Registrar evento

Crear audit log

COMMIT
```

Si cualquier operación crítica falla:

```text
ROLLBACK
```

---

# 3. Arquitectura General

```text
                    ┌───────────────────────┐
                    │     AI / Claude       │
                    │   MCP Compatible      │
                    └───────────┬───────────┘
                                │
                               MCP
                                │
                                ▼
                    ┌───────────────────────┐
                    │      MCP ADAPTER      │
                    │ Tools estructuradas   │
                    └───────────┬───────────┘
                                │
                                ▼
┌─────────────────┐    ┌───────────────────────────────┐
│                 │    │                               │
│  REACT WEB APP  │───▶│       BUSINESS SERVICES       │
│                 │REST│                               │
└─────────────────┘    │ CRM / Sales / Marketing       │
                       │ Operations / Finance           │
                       └──────────────┬────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
              Event System        Job Queue         Audit Log
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
                      Repository Layer
                             │
                             ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │    Supabase     │
                    └─────────────────┘
```

---

# 4. Stack Tecnológico

## Frontend

```text
React
TypeScript
Vite
```

El frontend debe poder ejecutarse localmente durante desarrollo y posteriormente desplegarse como aplicación web.

---

## Backend

```text
Node.js
TypeScript
```

Debe contener:

```text
REST API
Business Services
Repositories
Validation
Authentication
Authorization
Event System
Job Processing
Audit System
```

---

## Inteligencia Artificial

```text
MCP Server personalizado
```

Debe exponer herramientas empresariales controladas.

La IA nunca debe recibir credenciales administrativas de PostgreSQL.

---

## Base de datos

```text
Supabase
PostgreSQL
```

Utilizar:

```text
Foreign Keys
Constraints
Indexes
Transactions
Views
Row Level Security cuando corresponda
JSONB únicamente para metadata flexible
```

---

## Autenticación

```text
Supabase Auth
```

---

## Archivos

```text
Supabase Storage
```

Para almacenar:

```text
facturas
comprobantes
contratos
propuestas
documentos
adjuntos
```

---

# 5. Capas del Backend

El backend debe mantener una separación clara.

```text
MCP / REST
    ↓
Business Services
    ↓
Repositories
    ↓
PostgreSQL
```

Ejemplo:

```text
Claude

↓

MCP Tool:
registrar_pago()

↓

PaymentService.registerPayment()

↓

PaymentRepository

↓

PostgreSQL
```

El MCP NO debe contener lógica empresarial compleja.

El MCP debe actuar principalmente como adaptador entre la IA y los Business Services.

---

# 6. Reutilización de Business Services

REST y MCP deben utilizar exactamente los mismos servicios.

Ejemplo:

```text
OpportunityService.closeOpportunity()
```

puede ser utilizado por:

```text
POST /opportunities/:id/close
```

y por:

```text
MCP:
cerrar_oportunidad()
```

No deben existir dos implementaciones diferentes de la misma lógica empresarial.

---

# 7. Modelo de Datos Principal

Crear las siguientes entidades.

```text
1. users
2. contacts
3. companies
4. leads
5. opportunities
6. activities
7. campaigns
8. hooks
9. services
10. clients
11. projects
12. subscriptions
13. invoices
14. payments
15. expenses
16. vendors
17. taxes
18. withdrawals
19. business_events
20. audit_logs
```

Posteriormente podrán añadirse:

```text
tasks
goals
notifications
attachments
accounts
cash_movements
automation_rules
```

---

# 8. Contactos

Tabla:

```text
contacts
```

Campos principales:

```text
id
first_name
last_name
email
phone
whatsapp
company_id
job_title

country
city
timezone

original_source
original_campaign_id
original_hook_id

status

owner_id

created_at
updated_at
last_interaction_at

tags
notes
```

Estados posibles:

```text
prospect
client
former_client
```

La atribución original no debe sobrescribirse automáticamente.

---

# 9. Empresas

Tabla:

```text
companies
```

Campos:

```text
id
name
legal_name
tax_id
website

industry
company_size

country
city

sales_owner_id

is_active_client

created_at
updated_at
```

Las métricas como:

```text
lifetime_value
total_invoiced
total_collected
outstanding_balance
```

preferentemente deben calcularse mediante consultas, vistas o servicios en lugar de duplicarse innecesariamente.

---

# 10. Leads

Tabla:

```text
leads
```

Un contacto puede generar múltiples leads.

Campos:

```text
id
contact_id
company_id

created_at

source
channel

campaign_id
hook_id

landing_page
form_name

service_id

status
owner_id

lead_score

discard_reason

converted_to_opportunity
opportunity_id
```

Estados:

```text
new
working
qualified
discarded
converted
```

---

# 11. Oportunidades

Tabla:

```text
opportunities
```

Pipeline:

```text
new
↓
contacted
↓
qualified
↓
meeting_scheduled
↓
meeting_completed
↓
proposal_sent
↓
negotiation
↓
won / lost
```

Campos:

```text
id
name

contact_id
company_id
lead_id

service_id

owner_id

stage

setup_value
recurring_value

currency

probability

estimated_close_date
closed_at

campaign_id
hook_id

next_action
next_action_date

lost_reason
competitor

notes

created_at
updated_at
```

Valor ponderado:

```text
weighted_value =
setup_value * probability
```

---

# 12. Actividades

Tabla:

```text
activities
```

Tipos:

```text
call
email
whatsapp
meeting
demo
follow_up
proposal
task
note
```

Campos:

```text
id

type

contact_id
company_id
opportunity_id

owner_id

occurred_at

result
notes

next_action
next_action_date

created_at
```

---

# 13. Marketing — Campañas

Tabla:

```text
campaigns
```

Campos:

```text
id
name

channel
objective

start_date
end_date

budget
actual_spend

status

created_at
updated_at
```

Estados:

```text
draft
active
paused
completed
```

Las métricas deben calcularse utilizando relaciones con leads, oportunidades, ventas y pagos.

---

# 14. Marketing — Ganchos

Tabla:

```text
hooks
```

Campos:

```text
id
name

message
angle
format

target_audience

status

created_at
updated_at
```

Ángulos posibles:

```text
pain
saving
money
time
growth
risk
opportunity
```

Métricas:

```text
leads
meetings
opportunities
sales
revenue
collections
conversion_rate
revenue_per_lead
```

deben calcularse desde los datos relacionados.

---

# 15. Servicios

Tabla:

```text
services
```

Campos:

```text
id
name

category

description

standard_setup_price
standard_recurring_price

billing_type
billing_frequency

estimated_cost

target_margin

active

created_at
updated_at
```

Tipos:

```text
one_time
recurring
hybrid
```

---

# 16. Clientes

Tabla:

```text
clients
```

Campos:

```text
id

company_id
primary_contact_id

sales_owner_id
account_manager_id

start_date

status

created_at
updated_at
```

Estados:

```text
onboarding
active
paused
finished
```

Las métricas financieras deben calcularse desde proyectos, suscripciones, facturas, pagos y gastos.

---

# 17. Proyectos

Tabla:

```text
projects
```

Campos:

```text
id

client_id
opportunity_id
service_id

owner_id

name

start_date
due_date
completed_at

status

sold_price
estimated_cost

created_at
updated_at
```

Estados:

```text
onboarding
in_progress
review
completed
cancelled
```

---

# 18. Suscripciones

Tabla:

```text
subscriptions
```

Campos:

```text
id

client_id
service_id
opportunity_id

start_date
next_billing_date

amount
currency

billing_frequency

status

cancelled_at

created_at
updated_at
```

Estados:

```text
active
paused
cancelled
```

---

# 19. Facturas

Tabla:

```text
invoices
```

Campos:

```text
id

invoice_number

client_id
project_id
subscription_id

issue_date
due_date

subtotal
tax_amount
total

currency

status

document_url

created_at
updated_at
```

Estados:

```text
draft
issued
partial
paid
overdue
cancelled
```

IMPORTANTE:

```text
Venta ≠ Factura ≠ Pago
```

Estas entidades deben permanecer separadas.

---

# 20. Pagos

Tabla:

```text
payments
```

Campos:

```text
id

invoice_id
client_id

payment_date

amount
currency

payment_method

account_reference
external_reference

idempotency_key

confirmed

created_at
```

Una factura puede tener múltiples pagos.

Ejemplo:

```text
Factura:
$10,000

Pago 1:
$5,000

Pago 2:
$3,000

Saldo:
$2,000
```

---

# 21. Gastos

Tabla:

```text
expenses
```

Campos:

```text
id

date

vendor_id

category
description

project_id
client_id
campaign_id

subtotal
tax_amount
total

currency

status

due_date
paid_at

payment_account

receipt_url

external_reference
idempotency_key

created_at
updated_at
```

Un gasto puede asociarse opcionalmente a:

```text
cliente
proyecto
campaña
```

Esto permitirá calcular rentabilidad real.

---

# 22. Proveedores

Tabla:

```text
vendors
```

Campos:

```text
id

name

type

email
phone

tax_id

country

notes

created_at
updated_at
```

Tipos:

```text
freelancer
software
agency
supplier
government
other
```

---

# 23. Impuestos

Tabla:

```text
taxes
```

Campos:

```text
id

type

period_start
period_end

due_date

estimated_amount
actual_amount

currency

status

paid_at

receipt_url

created_at
updated_at
```

Estados:

```text
estimated
pending
paid
```

---

# 24. Retiros

Tabla:

```text
withdrawals
```

Campos:

```text
id

user_id

date

amount
currency

type

source_account

notes

created_at
```

Tipos:

```text
owner_draw
dividend
advance
other
```

Los retiros NO deben contabilizarse como gastos operativos.

---

# 25. Business Events

Crear:

```text
business_events
```

Esta tabla registrará eventos relevantes del dominio.

Ejemplos:

```text
lead.created
lead.qualified

opportunity.created
opportunity.stage_changed
opportunity.won
opportunity.lost

client.created

project.created

subscription.created
subscription.cancelled

invoice.created
invoice.issued
invoice.paid

payment.received

expense.created
expense.paid
```

Campos:

```text
id

event_type

entity_type
entity_id

payload JSONB

created_by

created_at

processed_at
```

Los eventos permitirán desacoplar automatizaciones.

---

# 26. Audit Log

Crear:

```text
audit_logs
```

Toda operación relevante debe poder ser auditada.

Campos:

```text
id

timestamp

user_id

actor_type
actor_id

source

tool_name

entity_type
entity_id

action

before_data JSONB
after_data JSONB

raw_input

conversation_id

request_id
```

Valores posibles para:

```text
actor_type:
human
ai
system

source:
web
mcp
api
automation
```

Debe ser posible determinar:

```text
Quién hizo el cambio
Cuándo
Desde dónde
Qué cambió
Qué había antes
Qué quedó después
Qué instrucción originó el cambio
```

---

# 27. Entrada Original de IA

Cuando una operación se origine mediante lenguaje natural, conservar cuando corresponda:

```text
raw_input
```

y:

```text
structured_interpretation
```

Ejemplo:

```json
{
  "raw_input": "Acme me pagó los 2 mil que faltaban",
  "structured_interpretation": {
    "intent": "register_payment",
    "company": "Acme",
    "amount": 2000,
    "currency": "USD"
  }
}
```

Esto permite auditar interpretaciones incorrectas.

---

# 28. Entity Resolution

La IA nunca debe asumir automáticamente una entidad cuando existan múltiples coincidencias razonables.

Ejemplo:

```text
Usuario:
"Registra un pago de Acme."
```

Base de datos:

```text
Acme USA
Acme Chile
Acme España
```

Proceso:

```text
buscar entidades
        ↓
calcular coincidencias
        ↓
¿Existe una coincidencia inequívoca?

Sí → continuar

No → solicitar aclaración
```

La resolución debe realizarse antes de ejecutar operaciones críticas.

---

# 29. Idempotencia

Las operaciones financieras y otras operaciones sensibles deben soportar idempotencia.

Ejemplo:

```text
registrar_pago()
```

debe aceptar:

```text
idempotency_key
```

El backend debe impedir que una misma solicitud genere accidentalmente:

```text
Pago #1 = $5,000
Pago #2 = $5,000
```

por reintentos de red, duplicación de herramientas o repetición accidental de la IA.

---

# 30. MCP Server

Crear un MCP Server específico para el CRM.

NO exponer SQL libre de escritura.

Las herramientas deben representar acciones empresariales.

---

# 31. Herramientas MCP — CRM

Inicialmente:

```text
buscar_contacto
crear_contacto
actualizar_contacto

buscar_empresa
crear_empresa
actualizar_empresa

crear_lead
actualizar_lead
calificar_lead
```

---

# 32. Herramientas MCP — Ventas

```text
buscar_oportunidades
crear_oportunidad
actualizar_oportunidad
mover_oportunidad
cerrar_oportunidad

registrar_actividad
crear_seguimiento
```

---

# 33. Herramientas MCP — Operaciones

```text
crear_cliente
crear_proyecto
actualizar_proyecto

crear_suscripcion
actualizar_suscripcion
cancelar_suscripcion
```

---

# 34. Herramientas MCP — Finanzas

```text
buscar_facturas
crear_factura
emitir_factura

registrar_pago

crear_gasto
actualizar_gasto

registrar_impuesto
registrar_retiro
```

---

# 35. Herramientas MCP — Analítica

No utilizar SQL libre inicialmente.

Crear herramientas de alto nivel:

```text
consultar_pipeline

consultar_ventas

consultar_facturacion

consultar_cobros

consultar_cuentas_por_cobrar

consultar_cashflow

consultar_gastos

consultar_rentabilidad_cliente

consultar_rentabilidad_proyecto

consultar_marketing

consultar_atribucion_marketing

consultar_dashboard_ejecutivo
```

Estas herramientas pueden aceptar filtros como:

```text
date_from
date_to
owner
client
campaign
service
currency
```

---

# 36. Clasificación de Riesgo de Herramientas

Cada herramienta debe tener un nivel de riesgo.

## LOW

Ejemplos:

```text
buscar_contacto
consultar_pipeline
registrar_nota
crear_lead
```

Puede ejecutarse directamente.

---

## MEDIUM

Ejemplos:

```text
crear_oportunidad
mover_oportunidad
registrar_actividad
registrar_gasto informado por el usuario
```

Puede ejecutarse directamente pero siempre debe generar audit log.

---

## HIGH

Ejemplos:

```text
emitir_factura
cancelar_suscripcion
eliminar_pago
modificar_factura emitida
```

Debe requerir confirmación explícita.

---

## CRITICAL

Ejemplos:

```text
eliminar datos contables
modificar períodos financieros cerrados
eliminar audit logs
cambios masivos financieros
```

Deben bloquearse o requerir permisos administrativos especiales.

---

# 37. Roles y Permisos

Implementar desde el principio:

```text
owner
admin
sales
marketing
operations
finance
viewer
```

Ejemplo:

```text
SALES

✓ contactos
✓ leads
✓ oportunidades
✓ actividades

✗ impuestos
✗ retiros
✗ eliminar pagos
```

Los permisos deben verificarse en el backend.

Nunca confiar únicamente en instrucciones enviadas a la IA.

---

# 38. Automatización: Oportunidad Ganada

Esta será una de las automatizaciones centrales.

Entrada:

```text
cerrar_oportunidad(
    opportunity_id,
    status = "won"
)
```

Backend:

```text
BEGIN TRANSACTION

1. Validar oportunidad

2. Cambiar stage → WON

3. Registrar closed_at

4. Crear/actualizar client

5. Si setup_value > 0:
      crear project

6. Si recurring_value > 0:
      crear subscription

7. Crear invoice draft cuando corresponda

8. Registrar:
      opportunity.won

9. Crear audit log

COMMIT
```

Las tareas no críticas pueden continuar de manera asíncrona.

---

# 39. Event System

Ejemplo:

```text
opportunity.won
        ↓
 ┌──────┼────────────┬─────────────┐
 ↓      ↓            ↓             ↓
Onboard Marketing  Finance     Notification
```

Posibles listeners:

```text
crear onboarding

actualizar atribución

actualizar métricas

crear notificación

preparar factura

crear tareas

enviar integraciones externas
```

---

# 40. Job Queue / Workers

No ejecutar todos los procesos dentro de la petición HTTP o MCP.

Implementar una cola para procesos asíncronos.

Ejemplos:

```text
enviar emails

generar PDFs

procesar documentos

sincronizar APIs

generar facturas recurrentes

enviar recordatorios

procesar automatizaciones

actualizar métricas costosas
```

Arquitectura:

```text
Business Event
      ↓
Job Queue
      ↓
Worker
      ↓
External Service / Database
```

---

# 41. Facturación Recurrente

Las suscripciones deben permitir generar facturación recurrente.

Worker programado:

```text
buscar subscriptions activas
con next_billing_date <= hoy

↓

crear invoice draft

↓

actualizar next_billing_date

↓

registrar subscription.billing_generated
```

Debe existir protección contra facturas duplicadas.

---

# 42. Cuentas por Cobrar

Crear consultas para determinar:

```text
invoice.total
-
SUM(payments.amount)
=
outstanding_balance
```

Estados automáticos:

```text
issued
partial
paid
overdue
```

Una factura debe cambiar automáticamente a:

```text
paid
```

cuando:

```text
SUM(payments) >= invoice.total
```

---

# 43. Rentabilidad por Cliente

Calcular:

```text
Ingresos cobrados
-
Gastos atribuibles
=
Margen bruto de cliente
```

También mostrar:

```text
total vendido
total facturado
total cobrado
total pendiente
total gastos
beneficio
margen %
MRR
LTV
```

---

# 44. Rentabilidad por Proyecto

Calcular:

```text
precio vendido
-
costes directos
=
beneficio proyecto
```

y:

```text
beneficio / precio vendido
=
margen %
```

---

# 45. Atribución de Marketing

El sistema debe conectar:

```text
Campaign
   ↓
Hook
   ↓
Lead
   ↓
Opportunity
   ↓
Sale
   ↓
Invoice
   ↓
Payment
```

Debe poder responder:

```text
¿Qué campaña genera más leads?

¿Qué campaña genera más oportunidades?

¿Qué campaña genera más ventas?

¿Qué campaña genera más dinero facturado?

¿Qué campaña genera más dinero cobrado?

¿Qué campaña genera clientes más rentables?

¿Qué gancho genera mayor revenue por lead?
```

---

# 46. Métricas de Marketing

Calcular:

```text
Leads

CPL =
Campaign Spend / Leads

Conversion Rate

Opportunities

Sales

CAC =
Campaign Spend / New Customers

Revenue

Collected Revenue

ROAS =
Attributed Revenue / Campaign Spend

Collected ROAS =
Attributed Collections / Campaign Spend

Revenue Per Lead

Margin by Campaign
```

---

# 47. Dashboard Ejecutivo

Crear una vista principal con:

## Ventas

```text
Pipeline total
Weighted forecast
Ventas del mes
Win rate
Ticket promedio
MRR vendido
```

## Finanzas

```text
Facturado
Cobrado
Por cobrar
Vencido
Gastos
Impuestos pendientes
Retiros
Caja
```

## Marketing

```text
Leads
CPL
Opportunities
CAC
Revenue
ROAS
Mejor campaña
Mejor gancho
```

## Operaciones

```text
Clientes activos
Proyectos activos
Proyectos atrasados
Suscripciones
MRR
Churn
```

---

# 48. Dashboard de Ventas

Crear Kanban:

```text
Nuevo
Contactado
Calificado
Reunión
Propuesta
Negociación
Ganado
Perdido
```

Cada tarjeta debe mostrar como mínimo:

```text
empresa
contacto
valor
MRR
responsable
próxima acción
fecha próxima acción
```

---

# 49. Dashboard Financiero

Mostrar:

```text
Cashflow

Facturas emitidas

Facturas vencidas

Pagos recibidos

Cuentas por cobrar

Gastos

Cuentas por pagar

Impuestos

Retiros

Rentabilidad
```

---

# 50. Dashboard Marketing

Mostrar:

```text
Campañas

Ganchos

Spend

Leads

CPL

Meetings

Opportunities

Sales

CAC

Revenue

Collections

ROAS

Margin
```

---

# 51. Interfaz Conversacional

La IA debe poder entender instrucciones como:

```text
"Registra una reunión con Juan de Acme."

"Acme aceptó la propuesta de $5,000 y $1,000 mensual."

"Pagué $420 de Zapier."

"Entraron $2,500 de la factura de DentalPro."

"Muéstrame las oportunidades que llevan más de una semana sin actividad."

"¿Cuánto hemos cobrado este mes?"

"¿Qué campaña está produciendo clientes más rentables?"

"¿Cuánto dinero debería reservar para impuestos?"

"¿Qué tengo pendiente hoy?"
```

---

# 52. Comportamiento ante Información Faltante

La IA no debe preguntar innecesariamente.

Debe intentar resolver primero la información utilizando el CRM.

Ejemplo:

```text
Usuario:
"Acme pagó $2,000."
```

Proceso:

```text
buscar Acme
↓
buscar facturas pendientes
↓
si existe una sola factura compatible
    proponer/registrar pago según nivel de riesgo

si existen varias posibilidades
    solicitar aclaración
```

---

# 53. Consultas en Lenguaje Natural

La IA debe poder consultar el sistema utilizando herramientas analíticas.

Ejemplo:

```text
Usuario:

"¿Cómo vamos este mes?"
```

La IA puede ejecutar:

```text
consultar_ventas()
consultar_pipeline()
consultar_cashflow()
consultar_marketing()
```

y construir un resumen ejecutivo.

---

# 54. Proactividad

La arquitectura debe permitir generar alertas como:

```text
"Hay 6 oportunidades por $32,000 sin actividad durante más de 7 días."

"Hay $8,400 en facturas vencidas."

"En los próximos 10 días vencen $4,200 de impuestos."

"El gancho B genera 3.2 veces más ingresos por lead que el gancho A."

"El margen del cliente Acme cayó por debajo del 30%."

"Hay una suscripción que debe renovarse mañana."
```

Estas alertas deben generarse mediante reglas determinísticas sobre los datos, no depender exclusivamente de que la IA las descubra.

---

# 55. Seguridad

Nunca almacenar secretos directamente en código.

Utilizar variables de entorno:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

DATABASE_URL

MCP_CONFIG

APP_SECRET
```

Las credenciales administrativas solo deben existir en procesos backend autorizados.

Nunca enviarlas al frontend ni al contexto del modelo.

---

# 56. Supabase RLS

Implementar Row Level Security cuando corresponda.

Las políticas deben considerar:

```text
usuario
rol
organización
propiedad del registro
```

La seguridad real debe existir en backend/base de datos.

No depender de la IA para seguridad.

---

# 57. Multi-Tenant Ready

Aunque inicialmente exista una sola empresa, diseñar las tablas principales para poder soportar múltiples organizaciones.

Agregar:

```text
organization_id
```

a las entidades empresariales principales.

Ejemplo:

```text
contacts
companies
leads
opportunities
clients
projects
subscriptions
invoices
payments
expenses
campaigns
```

Esto evitará una migración compleja si el sistema posteriormente se convierte en SaaS.

---

# 58. Monedas

No asumir una única moneda.

Los registros financieros deben incluir:

```text
amount
currency
```

Utilizar códigos ISO:

```text
USD
EUR
CLP
MXN
COP
etc.
```

No realizar conversiones implícitas sin definir previamente una fuente de tipo de cambio.

---

# 59. Fechas

Guardar timestamps en UTC.

Convertir a la zona horaria del usuario únicamente para presentación.

Ejemplo:

```text
created_at
updated_at
occurred_at
paid_at
closed_at
```

---

# 60. Soft Delete

Evitar eliminación física de información empresarial sensible.

Cuando corresponda utilizar:

```text
deleted_at
deleted_by
```

Especialmente para:

```text
contactos
oportunidades
facturas
pagos
gastos
clientes
```

Información financiera confirmada no debe eliminarse silenciosamente.

---

# 61. Estrategia de Desarrollo

NO intentar construir todo simultáneamente.

Implementar por fases.

---

# FASE 1 — Foundation

Construir:

```text
Supabase project

PostgreSQL schema

Migrations

Seeds

Authentication

Organizations

Users

Roles

Permissions

Audit Logs

Repository Layer

Business Service architecture
```

Resultado:

La infraestructura central funciona.

---

# FASE 2 — CRM + Ventas

Implementar:

```text
contacts
companies
leads
opportunities
activities
services
```

Frontend:

```text
Contact list
Company detail
Opportunity Kanban
Activity timeline
```

Business Services:

```text
ContactService
CompanyService
LeadService
OpportunityService
ActivityService
```

Resultado:

El CRM comercial funciona sin IA.

---

# FASE 3 — MCP + IA

Implementar MCP Server.

Primeras herramientas:

```text
buscar_contacto
crear_contacto

buscar_empresa
crear_empresa

crear_lead

crear_oportunidad
mover_oportunidad

registrar_actividad

consultar_pipeline
```

Resultado:

El usuario puede operar el CRM comercial mediante lenguaje natural.

---

# FASE 4 — Operaciones

Implementar:

```text
clients
projects
subscriptions
```

Crear:

```text
ClientService
ProjectService
SubscriptionService
```

Implementar:

```text
opportunity.won
```

Resultado:

Una venta ganada se transforma automáticamente en cliente y servicio contratado.

---

# FASE 5 — Finanzas

Implementar:

```text
invoices
payments
expenses
vendors
taxes
withdrawals
```

Business Services:

```text
InvoiceService
PaymentService
ExpenseService
TaxService
WithdrawalService
```

MCP:

```text
crear_factura
registrar_pago
crear_gasto
registrar_impuesto
registrar_retiro
```

Resultado:

La IA puede registrar y consultar operaciones financieras controladas.

---

# FASE 6 — Marketing

Implementar:

```text
campaigns
hooks
attribution
```

Conectar:

```text
Campaign
→ Hook
→ Lead
→ Opportunity
→ Client
→ Invoice
→ Payment
```

Resultado:

Puede medirse marketing hasta revenue y margen.

---

# FASE 7 — Eventos y Automatizaciones

Implementar:

```text
business_events
job queue
workers
scheduled jobs
notifications
```

Automatizaciones iniciales:

```text
Opportunity won

Invoice overdue

Subscription billing

Tax deadline

Opportunity inactivity

Project deadline
```

---

# FASE 8 — Dashboards

Implementar:

```text
Executive Dashboard

Sales Dashboard

Finance Dashboard

Marketing Dashboard

Operations Dashboard
```

---

# FASE 9 — Inteligencia Avanzada

Añadir:

```text
resúmenes diarios

detección de oportunidades abandonadas

alertas financieras

forecast

análisis de campañas

rentabilidad por cliente

rentabilidad por proyecto

análisis de churn

detección de anomalías
```

---

# 62. Pruebas Obligatorias

Crear tests para Business Services críticos.

Especialmente:

```text
OpportunityService.closeOpportunity()

PaymentService.registerPayment()

InvoiceService.issueInvoice()

SubscriptionService.cancelSubscription()

ExpenseService.createExpense()
```

Probar:

```text
transacciones

rollbacks

permisos

duplicados

idempotencia

entity resolution

confirmaciones

audit logs
```

---

# 63. Casos de Prueba Críticos

## Caso 1

```text
"Acme aceptó la propuesta."
```

Resultado esperado:

```text
Resolver oportunidad
↓
Solicitar aclaración si existe ambigüedad
↓
Cerrar oportunidad
↓
Crear cliente
↓
Crear proyecto/suscripción
↓
Crear eventos
↓
Audit log
```

---

## Caso 2

```text
"Acme pagó $5,000."
```

Resultado esperado:

```text
Resolver cliente
↓
Buscar facturas pendientes
↓
Resolver factura
↓
Evitar duplicados
↓
Registrar pago
↓
Actualizar estado factura
↓
Registrar evento
↓
Audit log
```

---

## Caso 3

```text
"Pagué $300 de Zapier."
```

Resultado:

```text
buscar/crear proveedor
↓
crear gasto
↓
categorizar software
↓
audit log
```

---

## Caso 4

```text
"¿Qué campaña está funcionando mejor?"
```

La IA no debe responder únicamente por cantidad de leads.

Debe poder comparar:

```text
leads
CPL
opportunities
sales
CAC
revenue
collections
ROAS
margin
```

---

# 64. Restricciones Importantes

NO:

```text
dar SQL write access libre a la IA

duplicar lógica entre REST y MCP

guardar lógica empresarial dentro del frontend

usar la memoria del modelo como fuente de verdad

permitir escrituras financieras sin audit log

eliminar registros financieros silenciosamente

crear procesos empresariales complejos mediante múltiples tool calls independientes si pueden ejecutarse transaccionalmente en backend

confiar en prompts como mecanismo de seguridad
```

SÍ:

```text
Business Services centralizados

transacciones PostgreSQL

validaciones

permisos

audit logs

idempotencia

eventos

workers

herramientas MCP específicas

entity resolution

confirmaciones basadas en riesgo
```

---

# 65. Criterio de Éxito

El sistema se considerará exitoso cuando un usuario pueda operar la mayor parte de la empresa mediante conversaciones como:

```text
"¿Qué tengo pendiente hoy?"

"Registra la reunión que acabo de tener."

"Mueve DentalPro a propuesta."

"Acme aceptó."

"Registra este gasto."

"Entraron $5,000 de Acme."

"¿Cuánto tenemos por cobrar?"

"¿Cómo vamos de caja?"

"¿Cuál es nuestro MRR?"

"¿Qué clientes son más rentables?"

"¿Qué campaña está produciendo más dinero?"

"¿Qué oportunidades debería priorizar esta semana?"
```

sin necesidad de introducir manualmente la misma información en diferentes módulos.

---

# 66. Resultado Final Esperado

El producto final debe comportarse como un:

> **Sistema Operativo Empresarial controlado mediante Inteligencia Artificial.**

La base de datos proporciona estructura y verdad.

```text
PostgreSQL = Verdad
```

El backend proporciona reglas y seguridad.

```text
Business Services = Reglas
```

MCP proporciona acceso estructurado.

```text
MCP = Herramientas
```

La IA proporciona comprensión e interacción.

```text
IA = Interpretación
```

El frontend proporciona control visual.

```text
Dashboard = Visualización
```

Las automatizaciones proporcionan ejecución continua.

```text
Events + Workers = Automatización
```

Arquitectura conceptual final:

```text
                         USER
                           │
                    Natural Language
                           │
                           ▼
                     AI / CLAUDE
                           │
                           ▼
                     MCP SERVER
                           │
                           ▼
                  BUSINESS SERVICES
                    /      |       \
                   /       |        \
                CRM     FINANCE    MARKETING
                 │          │          │
                 └──────────┼──────────┘
                            │
                            ▼
                       POSTGRESQL
                        SUPABASE
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
           EVENTS         AUDIT         JOBS
              │                           │
              └─────────────┬─────────────┘
                            ▼
                      AUTOMATIONS

              ┌───────────────────────────┐
              │                           │
              ▼                           ▼
         REACT DASHBOARD             AI RESPONSES
```

La implementación debe priorizar siempre:

**integridad de datos → seguridad → trazabilidad → facilidad de uso → automatización → inteligencia.**