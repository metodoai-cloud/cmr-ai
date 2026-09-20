# 🤖 Guía para Claude Cowork: Estándar de Carga en Catálogo de Servicios del CRM

Esta guía contiene la especificación técnica y los parámetros exactos que **Claude Cowork** debe seguir al registrar o actualizar servicios en el CRM a través del conector MCP (`crear_servicio` / `actualizar_servicio` o inserción directa en Supabase).

---

## 📌 1. Regla de Mapeo a los 4 Pilares

El frontend del CRM clasifica y renderiza automáticamente las ofertas en **4 Pilares Estratégicos** según el valor del campo `category` y `name`:

| Pilar | `category` Requerido | Palabras Clave en `name` | Rol Comercial |
| :--- | :--- | :--- | :--- |
| **Pilar 1** | `Servicio 1: Creación de Empresa` | `Creación de Empresa` | Etapa de Entrada & Legal |
| **Pilar 2** | `Servicio 2.1: Diagnóstico de Procesos` o `Servicio 2.2: Automatización de Procesos` | `Diagnóstico`, `Automatización`, `Retainer Continuo` | Core Operativo & Retainers |
| **Pilar 3** | `Servicio 3: Marketing & Campaña` | `Marketing`, `Campaña`, `Growth` | Tráfico & Escala Comercial |
| **Pilar 4** | `Servicio 4: Desarrollo de Producto / Web App` | `Desarrollo de Producto`, `Web App`, `Plataforma` | High-Ticket & Software |

---

## 📋 2. Catálogo Oficial: Los 9 Servicios con sus Parámetros Exactos

### 🏢 PILAR 1: Creación de Empresa desde Cero

#### 1.1 Starter
```json
{
  "name": "Creación de Empresa desde Cero — Starter",
  "category": "Servicio 1: Creación de Empresa",
  "description": "Etapa de entrada: Constitución legal, iniciación de actividades y configuración básica para nuevos emprendimientos.",
  "standard_setup_price": 390000,
  "standard_recurring_price": 0,
  "billing_type": "one_time",
  "billing_frequency": "one_time",
  "estimated_cost": 90000,
  "target_margin": 75,
  "active": true
}
```

#### 1.2 VIP
```json
{
  "name": "Creación de Empresa desde Cero — VIP",
  "category": "Servicio 1: Creación de Empresa",
  "description": "Etapa de entrada VIP: Constitución legal integral, cuenta bancaria, imagen corporativa inicial y asesoría personalizada.",
  "standard_setup_price": 780000,
  "standard_recurring_price": 0,
  "billing_type": "one_time",
  "billing_frequency": "one_time",
  "estimated_cost": 180000,
  "target_margin": 77,
  "active": true
}
```

---

### ⚡ PILAR 2: Automatización & Procesos

#### 2.1 Diagnóstico de Procesos
```json
{
  "name": "Diagnóstico y Documentación de Procesos",
  "category": "Servicio 2.1: Diagnóstico de Procesos",
  "description": "Puente estratégico: Levantamiento completo de flujos operativos, mapa de procesos y detección de cuellos de botella.",
  "standard_setup_price": 890000,
  "standard_recurring_price": 0,
  "billing_type": "one_time",
  "billing_frequency": "one_time",
  "estimated_cost": 200000,
  "target_margin": 78,
  "active": true
}
```

#### 2.2 1 Automatización Puntual
```json
{
  "name": "1 Automatización Puntual",
  "category": "Servicio 2.2: Automatización de Procesos",
  "description": "Implementación core puntual: Flujo automatizado único (ej: WhatsApp a CRM o captura de leads).",
  "standard_setup_price": 500000,
  "standard_recurring_price": 0,
  "billing_type": "one_time",
  "billing_frequency": "one_time",
  "estimated_cost": 100000,
  "target_margin": 80,
  "active": true
}
```

#### 2.3 2 Automatizaciones Puntuales
```json
{
  "name": "2 Automatizaciones Puntuales",
  "category": "Servicio 2.2: Automatización de Procesos",
  "description": "Implementación core dual: Dos flujos interconectados de automatización operativa.",
  "standard_setup_price": 750000,
  "standard_recurring_price": 0,
  "billing_type": "one_time",
  "billing_frequency": "one_time",
  "estimated_cost": 150000,
  "target_margin": 80,
  "active": true
}
```

#### 2.4 3 Automatizaciones Puntuales
```json
{
  "name": "3 Automatizaciones Puntuales",
  "category": "Servicio 2.2: Automatización de Procesos",
  "description": "Implementación core completa: Tres flujos clave de automatización de ventas y operaciones.",
  "standard_setup_price": 1000000,
  "standard_recurring_price": 0,
  "billing_type": "one_time",
  "billing_frequency": "one_time",
  "estimated_cost": 200000,
  "target_margin": 80,
  "active": true
}
```

#### 2.5 Retainer Continuo de Automatización (Mensual Recurrente)
```json
{
  "name": "Automatización de Procesos — Retainer Continuo",
  "category": "Servicio 2.2: Automatización de Procesos",
  "description": "Up-selling / Retención mensual: Optimización continua, mantenimiento y nuevas automatizaciones mensuales.",
  "standard_setup_price": 0,
  "standard_recurring_price": 750000,
  "billing_type": "recurring",
  "billing_frequency": "monthly",
  "estimated_cost": 150000,
  "target_margin": 80,
  "active": true
}
```

---

### 📈 PILAR 3: Marketing & Campañas Growth

#### 3.1 Marketing / Campaña Growth (Mensual Recurrente)
```json
{
  "name": "Marketing / Campaña Growth",
  "category": "Servicio 3: Marketing & Campaña",
  "description": "Up-selling de crecimiento: Gestión de pauta publicitaria (Meta/Google), embudos de captación y optimización de CAC.",
  "standard_setup_price": 0,
  "standard_recurring_price": 250000,
  "billing_type": "recurring",
  "billing_frequency": "monthly",
  "estimated_cost": 50000,
  "target_margin": 80,
  "active": true
}
```

---

### 💻 PILAR 4: Desarrollo de Producto & Web App

#### 4.1 Desarrollo de Producto / Web App
```json
{
  "name": "Desarrollo de Producto / Web App",
  "category": "Servicio 4: Desarrollo de Producto / Web App",
  "description": "High-Ticket / Escala: Desarrollo de plataformas a medida, portales de clientes y aplicaciones web.",
  "standard_setup_price": 500000,
  "standard_recurring_price": 0,
  "billing_type": "one_time",
  "billing_frequency": "one_time",
  "estimated_cost": 150000,
  "target_margin": 70,
  "active": true
}
```

---

## 🛠️ 3. Uso de Herramientas MCP por Claude Cowork

1. **Para crear un nuevo servicio:**
   Usa la herramienta `crear_servicio` pasando el objeto JSON correspondiente:
   ```typescript
   crear_servicio({
     name: "...",
     category: "...",
     description: "...",
     standard_setup_price: 500000,
     standard_recurring_price: 0,
     billing_type: "one_time",
     billing_frequency: "one_time",
     estimated_cost: 100000,
     target_margin: 80
   })
   ```

2. **Para verificar el catálogo:**
   Usa `listar_servicios` para comprobar que los servicios quedaron agrupados correctamente por Servicio Madre.

3. **Para actualizar un servicio existente:**
   Usa `actualizar_servicio` con el `id` y los campos a modificar.
