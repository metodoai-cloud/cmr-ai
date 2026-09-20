# Catálogo Oficial de Servicios — Distribución por Pilares, Campos y Valores

Este documento detalla la estructura, campos, valores y funcionamiento comercial del **Catálogo de Servicios & Ofertas** de la agencia, organizado en sus **4 Pilares Estratégicos**.

---

## 1. Estructura de Campos del Catálogo (Base de Datos & Frontend)

Cada servicio en el catálogo cuenta con los siguientes campos clave:

| Campo (DB / Schema) | Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Nombre comercial de la oferta o entregable. | `Creación de Empresa desde Cero — Starter` |
| `category` | `string` | Subcategoría / Identificador del pilar estratégico. | `Servicio 1: Creación de Empresa` |
| `description` | `string` | Alcance y entregable concreto del servicio. | *Constitución legal, iniciación de actividades...* |
| `standard_setup_price` | `number` | Precio de implementación inicial (Setup en CLP). | `$390.000` |
| `standard_recurring_price` | `number` | Tarifa mensual recurrente (MRR en CLP). | `$750.000 / mes` (si aplica) |
| `billing_type` | `enum` | Tipo de cobro (`one_time`, `recurring`, `hybrid`). | `one_time` / `recurring` |
| `billing_frequency` | `enum` | Frecuencia de cobro (`one_time`, `monthly`). | `monthly` |
| `estimated_cost` | `number` | Costo estimado de entrega/herramientas (CLP). | `$90.000` |
| `target_margin` | `number` | Margen bruto operativo objetivo (%). | `75% - 80%` |
| `active` | `boolean` | Disponibilidad comercial del producto. | `true` (Activo) |

---

## 2. Distribución Completa de los 4 Pilares con Valores

### 🏢 PILAR 1: Creación de Empresa desde Cero
> **Rol Estratégico:** *Etapa de Entrada & Constitución Legal*  
> **Objetivo:** Adquisición de nuevos emprendimientos, formalización y fidelización temprana para posterior up-selling.

| Oferta / Entregable | Categoría Interna | Setup Inicial (CLP) | Mensualidad (MRR) | Modalidad | Margen Obj. | Costo Est. | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Creación de Empresa — Starter**<br><sub>Constitución legal, iniciación de actividades y configuración básica para nuevos emprendimientos.</sub> | Servicio 1: Creación de Empresa | **$390.000** | — | Pago Único | 75% | $90.000 | `Activo` |
| **Creación de Empresa — VIP**<br><sub>Constitución legal integral, cuenta bancaria, imagen corporativa inicial y asesoría personalizada.</sub> | Servicio 1: Creación de Empresa | **$780.000** | — | Pago Único | 77% | $180.000 | `Activo` |

---

### ⚡ PILAR 2: Automatización & Procesos
> **Rol Estratégico:** *Core Operativo & Retainers Mensuales*  
> **Objetivo:** Resolver cuellos de botella operativos mediante diagnósticos, implementación de flujos con IA/n8n/Make y contratos de mantención mensual recurrente.

| Oferta / Entregable | Categoría Interna | Setup Inicial (CLP) | Mensualidad (MRR) | Modalidad | Margen Obj. | Costo Est. | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Diagnóstico y Documentación de Procesos**<br><sub>Levantamiento completo de flujos operativos, mapa de procesos y detección de cuellos de botella.</sub> | Servicio 2.1: Diagnóstico | **$890.000** | — | Pago Único | 78% | $200.000 | `Activo` |
| **1 Automatización Puntual**<br><sub>Implementación core puntual: Flujo automatizado único (ej: WhatsApp a CRM o captura de leads).</sub> | Servicio 2.2: Automatización | **$500.000** | — | Pago Único | 80% | $100.000 | `Activo` |
| **2 Automatizaciones Puntuales**<br><sub>Implementación core dual: Dos flujos interconectados de automatización operativa.</sub> | Servicio 2.2: Automatización | **$750.000** | — | Pago Único | 80% | $150.000 | `Activo` |
| **3 Automatizaciones Puntuales**<br><sub>Implementación core completa: Tres flujos clave de automatización de ventas y operaciones.</sub> | Servicio 2.2: Automatización | **$1.000.000** | — | Pago Único | 80% | $200.000 | `Activo` |
| **Automatización — Retainer Continuo**<br><sub>Optimización continua, mantenimiento preventivo y desarrollo de nuevas automatizaciones mensuales.</sub> | Servicio 2.2: Automatización | **$0** (Sin setup) | **$750.000 / mes** | Retainer Mensual | 80% | $150.000 | `Activo` |

---

### 📈 PILAR 3: Marketing & Campañas Growth
> **Rol Estratégico:** *Tráfico & Escala Comercial*  
> **Objetivo:** Generación de demanda predecible y captación de clientes calificados para los clientes mediante pauta digital.

| Oferta / Entregable | Categoría Interna | Setup Inicial (CLP) | Mensualidad (MRR) | Modalidad | Margen Obj. | Costo Est. | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Marketing / Campaña Growth**<br><sub>Gestión de pauta publicitaria (Meta/Google Ads), embudos de captación directa y optimización continua de CAC.</sub> | Servicio 3: Marketing & Campaña | **$0** (Sin setup) | **$250.000 / mes** | Retainer Mensual | 80% | $50.000 | `Activo` |

---

### 💻 PILAR 4: Desarrollo de Producto & Web App
> **Rol Estratégico:** *High-Ticket & Software a Medida*  
> **Objetivo:** Creación de plataformas escalables, portales de autoservicio para clientes y aplicaciones web complejas.

| Oferta / Entregable | Categoría Interna | Setup Inicial (CLP) | Mensualidad (MRR) | Modalidad | Margen Obj. | Costo Est. | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Desarrollo de Producto / Web App**<br><sub>Desarrollo de portales para clientes, plataformas SaaS y aplicaciones web personalizadas para modelos de escala.</sub> | Servicio 4: Desarrollo de Producto | **$500.000** (Base setup) | A cotizar / Custom | Híbrido / Setup | 70% | $150.000 | `Activo` |

---

## 3. Resumen Consolidado del Catálogo (Los 9 Servicios)

| # | Pilar | Oferta | Setup | MRR | Modalidad | Margen | Costo Est. |
| :-: | :--- | :--- | :-: | :-: | :-: | :-: | :-: |
| 1 | 🏢 **Pilar 1** | Creación de Empresa — Starter | $390.000 | — | Pago Único | 75% | $90.000 |
| 2 | 🏢 **Pilar 1** | Creación de Empresa — VIP | $780.000 | — | Pago Único | 77% | $180.000 |
| 3 | ⚡ **Pilar 2** | Diagnóstico y Documentación de Procesos | $890.000 | — | Pago Único | 78% | $200.000 |
| 4 | ⚡ **Pilar 2** | 1 Automatización Puntual | $500.000 | — | Pago Único | 80% | $100.000 |
| 5 | ⚡ **Pilar 2** | 2 Automatizaciones Puntuales | $750.000 | — | Pago Único | 80% | $150.000 |
| 6 | ⚡ **Pilar 2** | 3 Automatizaciones Puntuales | $1.000.000 | — | Pago Único | 80% | $200.000 |
| 7 | ⚡ **Pilar 2** | Automatización — Retainer Continuo | $0 | $750.000/mes | Retainer | 80% | $150.000 |
| 8 | 📈 **Pilar 3** | Marketing / Campaña Growth | $0 | $250.000/mes | Retainer | 80% | $50.000 |
| 9 | 💻 **Pilar 4** | Desarrollo de Producto / Web App | $500.000 | Custom | Híbrido | 70% | $150.000 |
