# GUÍA DE INYECCIÓN DE CONTEXTO — CODEX
## JB Holds · Data Warehouse Enterprise
## Cómo pasar toda la arquitectura al agente de IA

---

## PASO 1 — QUÉ ARCHIVOS TIENES Y PARA QUÉ SIRVE CADA UNO

| Archivo | Qué contiene | Cuándo usarlo |
|---|---|---|
| `JB_HOLDS_ARCHITECTURE.md` | Arquitectura completa: carpetas, flujo, KPIs, semáforos, dashboard, comité, seguridad, roadmap | Como **contexto general** al inicio de cada sesión |
| `JB_HOLDS_DB_SCHEMA.sql` | Schema PostgreSQL ejecutable: 30+ tablas, índices, vistas, función de semáforo | Para **crear la DB** en Supabase y como referencia de estructura |
| `JB_HOLDS_CODEX_SPEC.json` | Spec técnico estructurado: marcas, sucursales, KPIs, roles, ETL, design tokens | **El archivo principal para Codex** — lo más denso y útil |

---

## PASO 2 — CÓMO INYECTAR EL CONTEXTO A CODEX

### OPCIÓN A — Si usas OpenAI Codex / ChatGPT con archivos (recomendada)

**1. Adjunta los 3 archivos** directamente al chat antes de empezar.

**2. Usa este prompt de apertura exacto:**

```
Eres el arquitecto de datos y desarrollador principal de JB Holds, 
un holding restaurantero mexicano (marcas: SG = Santagloria México, 
AMC = Allô Mon Coco México, CBC = CoCo Bubble Tea México).

Te comparto 3 archivos que definen TODA la arquitectura del sistema:
1. JB_HOLDS_ARCHITECTURE.md — Visión general, KPIs, semáforos, flujo
2. JB_HOLDS_DB_SCHEMA.sql   — Schema PostgreSQL completo y ejecutable
3. JB_HOLDS_CODEX_SPEC.json — Spec técnico estructurado (marcas, roles, KPIs, diseño)

Lee los 3 archivos y confirma que entendiste:
- Los 4 brand codes oficiales (SG, AMC, CBC, CORP)
- Los 3 branch codes activos (SG-001-MER-LAISLA, SG-002-MER-PDM, AMC-001-MER-MAIN)  
- El sistema de semáforos automáticos (fn_get_semaphore)
- El stack: Supabase + FastAPI + Next.js 14 + Tailwind

A partir de ahora cada tarea que te dé debe ser coherente con esta arquitectura.
```

---

### OPCIÓN B — Si usas GitHub Copilot en VS Code

**1. Crea una carpeta `.context/` en la raíz del proyecto:**
```
mi-proyecto/
├── .context/
│   ├── JB_HOLDS_ARCHITECTURE.md
│   ├── JB_HOLDS_DB_SCHEMA.sql
│   └── JB_HOLDS_CODEX_SPEC.json
├── src/
└── ...
```

**2. Agrega al archivo `.github/copilot-instructions.md`:**
```markdown
# JB Holds — Contexto del Proyecto

Estás trabajando en el ERP/DWH de JB Holds, un holding restaurantero MX.

## Brand Codes
- SG   = Santagloria México
- AMC  = Allô Mon Coco México  
- CBC  = CoCo Bubble Tea México
- CORP = IN-DEF Corporativo

## Stack
- DB: Supabase (PostgreSQL 15+)
- API: FastAPI (Python)
- Frontend: Next.js 14 + Tailwind CSS
- Tema: Dark mode, glassmorphism, Bloomberg/Stripe style

## Reglas de negocio
- Semáforos: usar fn_get_semaphore(kpi_code, value)
- Branch code format: {BRAND}-{NNN}-{CITY}-{LOCATION}
- Toda tabla lleva created_at TIMESTAMPTZ y updated_at TIMESTAMPTZ
- Porcentajes: columna con sufijo _pct
- Booleanos: columna con prefijo is_

## Archivos de referencia completos
Ver .context/ para schema SQL, spec JSON y arquitectura completa.
```

---

### OPCIÓN C — Si usas Claude (Projects) o Cursor

**1. En Claude Projects:** sube los 3 archivos como "Project Knowledge".  
**2. En Cursor:** ponlos en `.cursorrules` o en el chat con `@file`.

**Prompt de sistema para el Project:**
```
Eres el arquitecto técnico de JB Holds. 
El proyecto tiene 3 archivos de contexto en el knowledge base:
- ARCHITECTURE.md, DB_SCHEMA.sql, CODEX_SPEC.json

Siempre que escribas código:
✓ Usa los brand codes exactos: SG, AMC, CBC, CORP
✓ Usa los branch codes exactos: SG-001-MER-LAISLA, SG-002-MER-PDM, AMC-001-MER-MAIN
✓ Respeta el naming convention (snake_case, prefijos dim_/fact_, sufijos _pct/_at/_date)
✓ Conecta a Supabase usando el cliente oficial
✓ Semáforos: verde/amarillo/rojo según umbrales del dim_kpi_catalog
✓ Dark mode: usa los design tokens del CODEX_SPEC.json
```

---

## PASO 3 — PROMPTS LISTOS POR TAREA

Copia y pega el que necesites. Cada uno incluye el contexto mínimo necesario.

---

### 🗄️ TAREA: Crear la base de datos en Supabase

```
Usando el schema en JB_HOLDS_DB_SCHEMA.sql, ayúdame a:

1. Ejecutar el schema en Supabase (dame los pasos exactos desde el dashboard)
2. Verificar que las tablas se crearon correctamente
3. Insertar los datos iniciales (dim_countries, dim_brands, dim_branches, dim_areas, dim_roles)
4. Activar Row Level Security (RLS) en las tablas más sensibles: fact_pnl, fact_payroll, dim_employees
5. Darme la política RLS básica para que cada STORE_MANAGER solo vea su branch_id

Stack: Supabase dashboard + SQL Editor
```

---

### 🔌 TAREA: Conector Soft Restaurant → fact_sales_daily

```
Necesito un ETL en Python que:

1. Conecte a Soft Restaurant vía ODBC/MySQL
2. Extraiga ventas del día anterior (total_sales, total_transactions, avg_ticket)
3. Calcule sales_vs_meta_pct = (total_sales / sales_meta) * 100
4. Evalúe el semáforo de ventas:
   - verde si >= 95%, amarillo si >= 85%, rojo si < 85%
5. Inserte en fact_sales_daily con UPSERT (ON CONFLICT branch_id, sale_date)
6. Registre el resultado en etl_logs (status, records_loaded, error_message si falla)

Branch activo: SG-001-MER-LAISLA (branch_id=1, brand_id=1)
DB: Supabase PostgreSQL
Lenguaje: Python 3.11 con supabase-py y pandas
Incluye manejo de errores y rollback si falla.
```

---

### 📊 TAREA: API endpoint de semáforo corporativo

```
Crea un endpoint en FastAPI:

GET /api/v1/semaforo
- Query params: fecha (default: ayer), brand_code (optional)
- Consulta la view v_semaforo_corporativo de Supabase
- Responde con JSON:
  {
    "date": "2026-05-26",
    "summary": { "red": 3, "yellow": 2, "green": 8 },
    "items": [
      { "brand": "SG", "branch": "La Isla", "kpi": "VTA_VS_META", 
        "value": 82.1, "target": 95, "semaphore": "red", "alert": "..." }
    ]
  }
- Ordenado: rojo primero, luego amarillo, luego verde
- Auth: JWT de Supabase (bearer token)

Consulta la view v_semaforo_corporativo del schema.
```

---

### 🎨 TAREA: Card de KPI para el dashboard

```
Crea un componente React (Next.js 14 + Tailwind) para una KPI Card del Command Center.

Props:
- title: string
- value: string | number  
- unit: string (%, MXN, x, pts)
- semaphore: 'green' | 'yellow' | 'red'
- delta: number (variación vs período anterior, ej: +3.2)
- sparkline: number[] (últimos 7 valores)

Diseño (usa estos tokens exactos del CODEX_SPEC.json):
- bg: #111118 con border rgba(255,255,255,0.08)
- glassmorphism: backdrop-blur-md con bg rgba(255,255,255,0.04)
- Verde: #22c55e (bg #052e16) | Amarillo: #eab308 (bg #422006) | Rojo: #ef4444 (bg #450a0a)
- Fuente números: JetBrains Mono
- Fuente labels: Inter
- border-radius: 12px
- Efecto glow sutil en el badge de semáforo

Incluye animación de entrada (framer-motion fadeInUp).
El semáforo debe tener tanto color como ícono (● verde, ▲ amarillo, ✕ rojo) para accesibilidad.
```

---

### 📋 TAREA: Vista de compromisos del comité

```
Crea una página Next.js /comite/compromisos que:

1. Consulte el endpoint GET /api/v1/commitments?status=pending,delayed
2. Muestre una tabla con columnas:
   - Compromiso (título)
   - Marca (brand_code → badge de color por marca)
   - Área
   - Responsable
   - Fecha límite
   - Días vencido (columna roja si > 0)
   - Status (badge: pending/in_progress/completed/delayed)
   - Semáforo

3. Filtros: por área, por responsable, por status
4. Badge rojo en el header si hay compromisos vencidos: "3 vencidos"
5. Botón "Nuevo compromiso" → modal con form
6. Dark mode, mismo estilo que el Command Center

Datos vienen de fact_commitments via v_compromisos_vencidos.
```

---

### 📁 TAREA: Crear estructura de carpetas del proyecto

```
Crea la estructura de carpetas completa del proyecto Next.js/FastAPI siguiendo 
la arquitectura de JB Holds. Debe incluir:

Frontend (Next.js 14 App Router):
- /app/(dashboard)/page.tsx — Command Center
- /app/(dashboard)/finanzas/page.tsx
- /app/(dashboard)/operaciones/page.tsx
- /app/(dashboard)/rh/page.tsx
- /app/(dashboard)/marketing/page.tsx
- /app/(dashboard)/expansion/page.tsx
- /app/(dashboard)/comite/page.tsx
- /components/kpi/ — KpiCard, SemaforoGrid, SparkLine
- /components/charts/ — LineChart, HeatMap, BarRanking
- /components/ui/ — Badge, Modal, Table, Alert
- /lib/supabase.ts — cliente Supabase
- /lib/api.ts — fetchers tipados
- /types/jbholds.ts — tipos TypeScript de todas las entidades

Backend (FastAPI):
- /api/v1/semaforo
- /api/v1/ventas
- /api/v1/pnl
- /api/v1/rh
- /api/v1/marketing
- /api/v1/expansion
- /api/v1/compromisos
- /api/v1/riesgos

Dame el código de la estructura con mkdir -p y los archivos index vacíos.
```

---

### 🔔 TAREA: Sistema de alertas automáticas

```
Crea un módulo Python de alertas que:

1. Se ejecute vía cron todos los días a las 06:00 AM
2. Consulte fact_kpi_readings WHERE reading_date = yesterday AND semaphore = 'red'
3. Para cada alerta:
   - Si es VTA_VS_META < 85: notifica a DIR_GENERAL + DIR_OPS + AREA_MANAGER de esa sucursal
   - Si es ROTACION_PCT > 15: notifica a DIR_RH + DIR_GENERAL  
   - Si es EBITDA_PCT < 10: notifica a DIR_FIN + DIR_GENERAL
4. Canales:
   - Email via SendGrid (HTML template con el semáforo en color)
   - WhatsApp via Twilio Business API (mensaje corto)
   - Dashboard badge (UPDATE en una tabla fact_alerts)
5. No reenviar la misma alerta si ya se envió en las últimas 24h

Incluye logs en etl_logs con process_name='alert_engine'.
Respeta los brand codes: SG, AMC, CBC.
```

---

## PASO 4 — REGLAS DE ORO PARA CADA SESIÓN CON CODEX

Incluye estas reglas al inicio de cada sesión nueva:

```
CONTEXTO ACTIVO — JB Holds ERP (MX-only v1.1)

BRAND CODES OFICIALES:
  SG   = Santagloria México
  AMC  = Allô Mon Coco México  
  CBC  = CoCo Bubble Tea México
  CORP = IN-DEF Corporativo

BRANCH CODES ACTIVOS:
  SG-001-MER-LAISLA  → branch_id = 1
  SG-002-MER-PDM     → branch_id = 2
  AMC-001-MER-MAIN   → branch_id = 3

STACK:
  DB:       Supabase (PostgreSQL 15+) — schema en JB_HOLDS_DB_SCHEMA.sql
  API:      FastAPI + supabase-py
  Frontend: Next.js 14 App Router + Tailwind CSS
  Theme:    Dark (#0a0a0f base) + Glassmorphism + Bloomberg style

REGLAS:
  ✓ snake_case en todo
  ✓ Tablas: prefijo dim_ (catálogos) o fact_ (transacciones)
  ✓ Semáforos: fn_get_semaphore(kpi_code, value) o lógica equivalent
  ✓ Toda tabla mutable: created_at + updated_at TIMESTAMPTZ
  ✓ Porcentajes: sufijo _pct | Fechas: sufijo _date | Booleans: prefijo is_
  ✓ Nunca borrar registros — usar is_active=FALSE o status='cancelled'
  ✓ ETL siempre registra en etl_logs
  ✓ Moneda: MXN (México only por ahora)
```

---

## PASO 5 — ORDEN RECOMENDADO DE IMPLEMENTACIÓN

Comparte este orden con Codex para que sepa qué construir primero:

```
SPRINT 0 — Fundación (Semana 1)
□ Ejecutar JB_HOLDS_DB_SCHEMA.sql en Supabase
□ Insertar datos iniciales (países, marcas, sucursales, áreas, roles)
□ Configurar RLS básico
□ Setup proyecto Next.js 14 + FastAPI

SPRINT 1 — Datos (Semanas 2-3)
□ Conector Soft Restaurant → fact_sales_daily
□ Conector Hiopos → fact_sales_daily
□ Carga histórica P&L de los Excel (12 meses) → fact_pnl
□ Carga histórica RH → fact_turnover (datos del RRHH PDF ya en el spec)

SPRINT 2 — KPIs y Semáforos (Semanas 4-5)
□ KPI Engine (calcula fact_kpi_readings diariamente)
□ Función fn_get_semaphore aplicada en todas las cargas
□ Alert Engine (email + WhatsApp)
□ API endpoints básicos

SPRINT 3 — Dashboard (Semanas 6-9)
□ Command Center — layout y KPI cards
□ Semáforo multi-marca grid
□ Ventas trend (12 semanas)
□ Focos rojos (alert feed)
□ Módulo de compromisos del comité
□ Módulo de expansión

SPRINT 4 — Automatización (Semanas 10-12)
□ Agenda de comité automática (lunes 8am)
□ Reporte mensual PDF automático
□ Alertas de contratos por vencer
□ Dashboard mobile responsive
```

---

*Archivos generados: 2026-05-27 | JB Holds Data Architecture v1.1 | MX-only*
