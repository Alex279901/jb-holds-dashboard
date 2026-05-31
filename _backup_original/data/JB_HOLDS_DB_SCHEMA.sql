-- =============================================================================
-- JB HOLDS | DATA WAREHOUSE SCHEMA v1.1 — MÉXICO ONLY
-- Engine: PostgreSQL 15+ (Supabase compatible)
-- Scope: MX · Moneda: MXN · Marcas: SG, AMC, CBC
-- Nota: Arquitectura lista para expansión internacional futura.
--       Para agregar España u otros países: INSERT en dim_countries
--       y dim_brands — el schema ya lo soporta sin cambios.
-- =============================================================================

-- Naming conventions:
--   Tablas:   snake_case, plural, prefijadas (dim_ / fact_)
--   Columnas: snake_case
--   PKs:      {prefix}_id (SERIAL / BIGSERIAL)
--   FKs:      {referenced_prefix}_id
--   Booleanos: is_ prefix
--   %:        _pct suffix
--   Fechas:   _date (DATE) / _at (TIMESTAMPTZ)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- SECTION 1 — DIMENSIONES (Catálogos Maestros)
-- =============================================================================

-- 1.1 Países
CREATE TABLE dim_countries (
    country_id      SERIAL       PRIMARY KEY,
    country_code    CHAR(2)      NOT NULL UNIQUE,
    country_name    VARCHAR(100) NOT NULL,
    currency_code   CHAR(3)      NOT NULL DEFAULT 'MXN',
    currency_symbol VARCHAR(5)   NOT NULL DEFAULT '$',
    timezone        VARCHAR(50)  NOT NULL DEFAULT 'America/Merida',
    tax_rate_pct    NUMERIC(5,2) DEFAULT 16.00,
    is_active       BOOLEAN      DEFAULT TRUE,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

INSERT INTO dim_countries VALUES
(1, 'MX', 'México', 'MXN', '$', 'America/Merida', 16.00, TRUE, NOW(), NOW());

-- 1.2 Ciudades
CREATE TABLE dim_cities (
    city_id      SERIAL       PRIMARY KEY,
    country_id   INT          NOT NULL REFERENCES dim_countries(country_id),
    state_region VARCHAR(100),
    city_name    VARCHAR(100) NOT NULL,
    is_active    BOOLEAN      DEFAULT TRUE,
    created_at   TIMESTAMPTZ  DEFAULT NOW()
);

INSERT INTO dim_cities (country_id, state_region, city_name) VALUES
(1, 'Yucatán',           'Mérida'),
(1, 'Quintana Roo',      'Cancún'),
(1, 'Ciudad de México',  'CDMX'),
(1, 'Jalisco',           'Guadalajara'),
(1, 'Nuevo León',        'Monterrey');

-- 1.3 Marcas
-- Brand codes oficiales JB Holds MX:
--   SG   = Santagloria México
--   AMC  = Allô Mon Coco México
--   CBC  = CoCo Bubble Tea México
--   CORP = IN-DEF Corporativo
CREATE TABLE dim_brands (
    brand_id          SERIAL       PRIMARY KEY,
    brand_code        VARCHAR(10)  NOT NULL UNIQUE,
    brand_name        VARCHAR(100) NOT NULL,
    brand_type        VARCHAR(30)  NOT NULL,          -- own | franchise | corporate
    country_id        INT          NOT NULL REFERENCES dim_countries(country_id),
    concept           VARCHAR(200),
    logo_url          TEXT,
    primary_color_hex CHAR(7),
    is_active         BOOLEAN      DEFAULT TRUE,
    created_at        TIMESTAMPTZ  DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

INSERT INTO dim_brands (brand_code, brand_name, brand_type, country_id, concept, is_active) VALUES
('SG',   'Santagloria México',     'own',       1, 'Coffee & Bakery',  TRUE),
('AMC',  'Allô Mon Coco México',   'own',       1, 'Brunch Pétillant', TRUE),
('CBC',  'CoCo Bubble Tea México', 'own',       1, 'Bubble Tea',       TRUE),
('CORP', 'IN-DEF Corporativo',     'corporate', 1, 'Holding',          TRUE);

-- 1.4 Sucursales
-- Branch code format: {BRAND}-{NNN}-{CITY}-{LOCATION}
-- Ejemplos: SG-001-MER-LAISLA | SG-002-MER-PDM | AMC-001-MER-MAIN
CREATE TABLE dim_branches (
    branch_id            SERIAL       PRIMARY KEY,
    branch_code          VARCHAR(30)  NOT NULL UNIQUE,
    brand_id             INT          NOT NULL REFERENCES dim_brands(brand_id),
    country_id           INT          NOT NULL REFERENCES dim_countries(country_id) DEFAULT 1,
    city_id              INT          NOT NULL REFERENCES dim_cities(city_id),
    branch_name          VARCHAR(150) NOT NULL,
    address              TEXT,
    zone                 VARCHAR(100),
    mall_name            VARCHAR(100),
    opening_date         DATE,
    closing_date         DATE,
    is_franchise         BOOLEAN      DEFAULT FALSE,
    franchise_partner    VARCHAR(150),
    pos_system           VARCHAR(50),                -- Soft Restaurant | Hiopos
    seating_capacity     INT,
    monthly_rent_mxn     NUMERIC(14,2),
    branch_status        VARCHAR(20)  DEFAULT 'active'
                             CHECK (branch_status IN ('active','inactive','closed','construction')),
    is_active            BOOLEAN      DEFAULT TRUE,
    created_at           TIMESTAMPTZ  DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  DEFAULT NOW()
);

INSERT INTO dim_branches (branch_code, brand_id, city_id, branch_name, pos_system, branch_status) VALUES
('SG-001-MER-LAISLA', 1, 1, 'Santagloria La Isla',        'Soft Restaurant', 'active'),
('SG-002-MER-PDM',    1, 1, 'Santagloria Paseo de Montejo','Soft Restaurant', 'active'),
('AMC-001-MER-MAIN',  2, 1, 'Allô Mon Coco Mérida',        'Hiopos',          'active');

-- 1.5 Áreas funcionales
CREATE TABLE dim_areas (
    area_id        SERIAL       PRIMARY KEY,
    area_code      VARCHAR(20)  NOT NULL UNIQUE,
    area_name      VARCHAR(100) NOT NULL,
    area_type      VARCHAR(30),                      -- corporate | operational | strategic
    parent_area_id INT          REFERENCES dim_areas(area_id),
    is_active      BOOLEAN      DEFAULT TRUE,
    created_at     TIMESTAMPTZ  DEFAULT NOW()
);

INSERT INTO dim_areas (area_code, area_name, area_type) VALUES
('FIN',    'Administración y Finanzas', 'corporate'),
('OPS',    'Operaciones',               'operational'),
('MKT',    'Marketing',                 'corporate'),
('RH',     'Recursos Humanos',          'corporate'),
('EXP',    'Expansión',                 'strategic'),
('EXCMRC', 'Excelencia de Marca',       'operational'),
('DIR',    'Dirección General',         'corporate'),
('COMP',   'Compras',                   'corporate'),
('TI',     'Tecnología',                'corporate');

-- 1.6 Roles y permisos
CREATE TABLE dim_roles (
    role_id                SERIAL       PRIMARY KEY,
    role_code              VARCHAR(30)  NOT NULL UNIQUE,
    role_name              VARCHAR(100) NOT NULL,
    role_level             INT          NOT NULL,     -- 1=super admin … 5=staff
    can_view_all_brands    BOOLEAN      DEFAULT FALSE,
    can_edit_financials    BOOLEAN      DEFAULT FALSE,
    can_approve_budgets    BOOLEAN      DEFAULT FALSE,
    can_manage_users       BOOLEAN      DEFAULT FALSE,
    can_export_data        BOOLEAN      DEFAULT FALSE,
    created_at             TIMESTAMPTZ  DEFAULT NOW()
);

INSERT INTO dim_roles
  (role_code, role_name, role_level, can_view_all_brands, can_edit_financials, can_approve_budgets, can_manage_users, can_export_data)
VALUES
('SUPER_ADMIN',  'Super Administrador',     1, TRUE,  TRUE,  TRUE,  TRUE,  TRUE),
('DIR_GENERAL',  'Director General',        2, TRUE,  TRUE,  TRUE,  FALSE, TRUE),
('DIR_FIN',      'Director de Finanzas',    2, TRUE,  TRUE,  TRUE,  FALSE, TRUE),
('DIR_OPS',      'Director de Operaciones', 2, TRUE,  FALSE, FALSE, FALSE, TRUE),
('DIR_MKT',      'Director de Marketing',   2, TRUE,  FALSE, FALSE, FALSE, TRUE),
('DIR_RH',       'Director de RH',          2, TRUE,  FALSE, FALSE, TRUE,  TRUE),
('DIR_EXP',      'Director de Expansión',   2, TRUE,  FALSE, FALSE, FALSE, TRUE),
('AREA_MANAGER', 'Area Manager',            3, FALSE, FALSE, FALSE, FALSE, TRUE),
('STORE_MANAGER','Gerente de Sucursal',     4, FALSE, FALSE, FALSE, FALSE, FALSE),
('SUBGERENTE',   'Subgerente',              4, FALSE, FALSE, FALSE, FALSE, FALSE),
('STAFF',        'Staff Operativo',         5, FALSE, FALSE, FALSE, FALSE, FALSE);

-- 1.7 Usuarios del sistema
CREATE TABLE dim_users (
    user_id      SERIAL       PRIMARY KEY,
    user_uuid    UUID         DEFAULT uuid_generate_v4() UNIQUE,
    brand_id     INT          REFERENCES dim_brands(brand_id),
    area_id      INT          REFERENCES dim_areas(area_id),
    branch_id    INT          REFERENCES dim_branches(branch_id),
    role_id      INT          NOT NULL REFERENCES dim_roles(role_id),
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(200) NOT NULL UNIQUE,
    is_active    BOOLEAN      DEFAULT TRUE,
    last_login   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- 1.8 Catálogo de KPIs con umbrales de semáforo
CREATE TABLE dim_kpi_catalog (
    kpi_id              SERIAL       PRIMARY KEY,
    kpi_code            VARCHAR(30)  NOT NULL UNIQUE,
    kpi_name            VARCHAR(150) NOT NULL,
    kpi_category        VARCHAR(30)  NOT NULL,  -- financial | operational | hr | marketing | expansion | governance
    unit_type           VARCHAR(20)  NOT NULL,  -- percentage | currency_mxn | count | ratio | score
    calculation_formula TEXT,
    green_threshold     NUMERIC(10,4),
    yellow_threshold    NUMERIC(10,4),
    red_threshold       NUMERIC(10,4),
    direction           VARCHAR(15)  DEFAULT 'higher_better', -- higher_better | lower_better
    data_source_table   VARCHAR(100),
    frequency           VARCHAR(10),            -- daily | weekly | monthly
    area_id             INT          REFERENCES dim_areas(area_id),
    is_active           BOOLEAN      DEFAULT TRUE,
    created_at          TIMESTAMPTZ  DEFAULT NOW()
);

INSERT INTO dim_kpi_catalog
  (kpi_code, kpi_name, kpi_category, unit_type, green_threshold, yellow_threshold, red_threshold, direction, frequency)
VALUES
-- FINANCIEROS
('VTA_VS_META',    'Ventas vs Meta %',         'financial',   'percentage',   95,    85,    0,     'higher_better', 'daily'),
('EBITDA_PCT',     'EBITDA %',                 'financial',   'percentage',   15,    10,    0,     'higher_better', 'monthly'),
('NOMINA_PCT',     'Nómina % sobre Ventas',    'financial',   'percentage',   28,    32,    100,   'lower_better',  'monthly'),
('RENTA_PCT',      'Renta % sobre Ventas',     'financial',   'percentage',   8,     10,    100,   'lower_better',  'monthly'),
('COSTO_ALIM_PCT', 'Costo Alimentos %',        'financial',   'percentage',   28,    32,    100,   'lower_better',  'monthly'),
('TICKET_PROM',    'Ticket Promedio MXN',      'financial',   'currency_mxn', 0,     0,     0,     'higher_better', 'daily'),
-- OPERATIVOS
('MERMA_PCT',      'Merma % sobre Ventas',     'operational', 'percentage',   3,     5,     100,   'lower_better',  'weekly'),
('QUEJAS_PCT',     'Quejas % Transacciones',   'operational', 'percentage',   1,     3,     100,   'lower_better',  'weekly'),
('RESENAS_SCORE',  'Score Reseñas Google',     'operational', 'score',        4.5,   4.0,   0,     'higher_better', 'weekly'),
('AUD_CUMPL_PCT',  'Cumplimiento Auditoría %', 'operational', 'percentage',   90,    75,    0,     'higher_better', 'monthly'),
-- MARKETING
('ROAS',           'ROAS Campañas Digitales',  'marketing',   'ratio',        3.0,   2.0,   0,     'higher_better', 'weekly'),
('CPL',            'Costo por Lead MXN',       'marketing',   'currency_mxn', 0,     0,     0,     'lower_better',  'weekly'),
-- RH
('ROTACION_PCT',   'Rotación de Personal %',   'hr',          'percentage',   5,     10,    100,   'lower_better',  'monthly'),
('AUSENTISMO_PCT', 'Ausentismo %',             'hr',          'percentage',   2,     5,     100,   'lower_better',  'monthly'),
('CLIMA_SCORE',    'Score Clima Laboral',      'hr',          'score',        80,    65,    0,     'higher_better', 'monthly'),
-- EXPANSIÓN Y GOBERNANZA
('APT_AVANCE_PCT', 'Avance Apertura %',        'expansion',   'percentage',   90,    70,    0,     'higher_better', 'monthly'),
('COMP_VENCIDOS',  'Compromisos Vencidos',     'governance',  'count',        0,     2,     999,   'lower_better',  'weekly');

-- 1.9 Dimensión Tiempo
CREATE TABLE dim_periods (
    period_id    SERIAL      PRIMARY KEY,
    year_num     INT         NOT NULL,
    month_num    INT         NOT NULL CHECK (month_num BETWEEN 1 AND 12),
    week_num     INT,
    quarter_num  INT         NOT NULL CHECK (quarter_num BETWEEN 1 AND 4),
    period_label VARCHAR(20) NOT NULL,          -- '2026-05' | '2026-W21'
    date_start   DATE        NOT NULL,
    date_end     DATE        NOT NULL,
    is_current   BOOLEAN     DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SECTION 2 — FINANZAS
-- =============================================================================

-- 2.1 Estado de Resultados (P&L) — por sucursal × mes
CREATE TABLE fact_pnl (
    pnl_id              BIGSERIAL    PRIMARY KEY,
    branch_id           INT          NOT NULL REFERENCES dim_branches(branch_id),
    brand_id            INT          NOT NULL REFERENCES dim_brands(brand_id),
    period_id           INT          NOT NULL REFERENCES dim_periods(period_id),

    -- INGRESOS
    ventas_netas        NUMERIC(14,2) DEFAULT 0,
    ventas_meta         NUMERIC(14,2) DEFAULT 0,
    otros_ingresos      NUMERIC(14,2) DEFAULT 0,

    -- COSTOS DE VENTA
    costo_alimentos     NUMERIC(14,2) DEFAULT 0,
    costo_bebidas       NUMERIC(14,2) DEFAULT 0,
    costo_mercancia     NUMERIC(14,2) DEFAULT 0,
    total_cogs          NUMERIC(14,2) DEFAULT 0,

    -- GASTOS OPERATIVOS
    nomina_total        NUMERIC(14,2) DEFAULT 0,
    nomina_directa      NUMERIC(14,2) DEFAULT 0,
    nomina_indirecta    NUMERIC(14,2) DEFAULT 0,
    renta_local         NUMERIC(14,2) DEFAULT 0,
    servicios           NUMERIC(14,2) DEFAULT 0,
    mantenimiento       NUMERIC(14,2) DEFAULT 0,
    marketing_local     NUMERIC(14,2) DEFAULT 0,
    otros_gastos_op     NUMERIC(14,2) DEFAULT 0,
    total_gastos_op     NUMERIC(14,2) DEFAULT 0,

    -- GASTOS ADMIN / CORPORATIVOS
    gastos_admin        NUMERIC(14,2) DEFAULT 0,
    depreciacion        NUMERIC(14,2) DEFAULT 0,
    amortizacion        NUMERIC(14,2) DEFAULT 0,

    -- RESULTADOS
    utilidad_bruta      NUMERIC(14,2) DEFAULT 0,
    ebitda              NUMERIC(14,2) DEFAULT 0,
    ebit                NUMERIC(14,2) DEFAULT 0,
    utilidad_neta       NUMERIC(14,2) DEFAULT 0,

    -- KPI RATIOS (calculados en ETL)
    ventas_vs_meta_pct  NUMERIC(7,4),
    cogs_pct            NUMERIC(7,4),
    nomina_pct          NUMERIC(7,4),
    renta_pct           NUMERIC(7,4),
    ebitda_pct          NUMERIC(7,4),

    data_source         VARCHAR(50),   -- soft_restaurant | hiopos | google_sheets | manual
    is_audited          BOOLEAN        DEFAULT FALSE,
    created_at          TIMESTAMPTZ    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    DEFAULT NOW(),
    UNIQUE (branch_id, period_id)
);

-- 2.2 Presupuestos
CREATE TABLE fact_budgets (
    budget_id        BIGSERIAL    PRIMARY KEY,
    branch_id        INT          REFERENCES dim_branches(branch_id),
    brand_id         INT          NOT NULL REFERENCES dim_brands(brand_id),
    area_id          INT          REFERENCES dim_areas(area_id),
    period_id        INT          NOT NULL REFERENCES dim_periods(period_id),
    budget_type      VARCHAR(30)  NOT NULL,  -- opex | capex | marketing | nomina
    amount_budgeted  NUMERIC(14,2) NOT NULL,
    amount_executed  NUMERIC(14,2) DEFAULT 0,
    variance_pct     NUMERIC(7,4),
    approved_by      INT          REFERENCES dim_users(user_id),
    notes            TEXT,
    created_at       TIMESTAMPTZ  DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- 2.3 Flujo de Caja
CREATE TABLE fact_cashflow (
    cashflow_id         BIGSERIAL    PRIMARY KEY,
    branch_id           INT          REFERENCES dim_branches(branch_id),
    brand_id            INT          NOT NULL REFERENCES dim_brands(brand_id),
    period_id           INT          NOT NULL REFERENCES dim_periods(period_id),
    inflow_operations   NUMERIC(14,2) DEFAULT 0,
    inflow_other        NUMERIC(14,2) DEFAULT 0,
    outflow_operations  NUMERIC(14,2) DEFAULT 0,
    outflow_capex       NUMERIC(14,2) DEFAULT 0,
    outflow_financing   NUMERIC(14,2) DEFAULT 0,
    net_cashflow        NUMERIC(14,2) DEFAULT 0,
    cash_beginning      NUMERIC(14,2) DEFAULT 0,
    cash_ending         NUMERIC(14,2) DEFAULT 0,
    created_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- 2.4 CAPEX — Inversiones de capital
CREATE TABLE fact_capex (
    capex_id        BIGSERIAL    PRIMARY KEY,
    branch_id       INT          REFERENCES dim_branches(branch_id),
    brand_id        INT          NOT NULL REFERENCES dim_brands(brand_id),
    capex_category  VARCHAR(50),  -- obra | equipamiento | mobiliario | tech
    description     TEXT,
    amount_budgeted NUMERIC(14,2) NOT NULL,
    amount_executed NUMERIC(14,2) DEFAULT 0,
    payment_date    DATE,
    supplier        VARCHAR(150),
    invoice_number  VARCHAR(50),
    is_expansion    BOOLEAN       DEFAULT FALSE,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- 2.5 Cuentas por Pagar / Cobrar
CREATE TABLE fact_ap_ar (
    record_id       BIGSERIAL    PRIMARY KEY,
    branch_id       INT          REFERENCES dim_branches(branch_id),
    brand_id        INT          NOT NULL REFERENCES dim_brands(brand_id),
    record_type     VARCHAR(10)  NOT NULL CHECK (record_type IN ('AP','AR')),
    counterpart     VARCHAR(150) NOT NULL,
    invoice_number  VARCHAR(50),
    issue_date      DATE,
    due_date        DATE,
    amount          NUMERIC(14,2) NOT NULL,
    amount_paid     NUMERIC(14,2) DEFAULT 0,
    status          VARCHAR(20)  DEFAULT 'pending'
                        CHECK (status IN ('pending','partial','paid','overdue','cancelled')),
    days_overdue    INT          GENERATED ALWAYS AS
                        (CASE WHEN due_date < CURRENT_DATE AND amount_paid < amount
                         THEN CURRENT_DATE - due_date ELSE 0 END) STORED,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- 2.6 Nómina
CREATE TABLE fact_payroll (
    payroll_id          BIGSERIAL    PRIMARY KEY,
    branch_id           INT          REFERENCES dim_branches(branch_id),
    brand_id            INT          NOT NULL REFERENCES dim_brands(brand_id),
    period_id           INT          NOT NULL REFERENCES dim_periods(period_id),
    period_type         VARCHAR(20),              -- weekly | biweekly | monthly
    headcount           INT          NOT NULL,
    gross_payroll       NUMERIC(14,2) NOT NULL,
    imss_employee       NUMERIC(12,2) DEFAULT 0,
    imss_employer       NUMERIC(12,2) DEFAULT 0,
    infonavit           NUMERIC(12,2) DEFAULT 0,
    isr                 NUMERIC(12,2) DEFAULT 0,
    total_employer_cost NUMERIC(14,2) NOT NULL,
    nomina_pct_ventas   NUMERIC(7,4),
    semaphore           VARCHAR(10)  CHECK (semaphore IN ('green','yellow','red')),
    created_at          TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE (branch_id, period_id, period_type)
);

-- =============================================================================
-- SECTION 3 — OPERACIONES
-- =============================================================================

-- 3.1 Ventas Diarias (granularidad: sucursal × día)
CREATE TABLE fact_sales_daily (
    sales_id            BIGSERIAL    PRIMARY KEY,
    branch_id           INT          NOT NULL REFERENCES dim_branches(branch_id),
    brand_id            INT          NOT NULL REFERENCES dim_brands(brand_id),
    sale_date           DATE         NOT NULL,
    period_id           INT          REFERENCES dim_periods(period_id),
    day_of_week         INT,                      -- 0=Lun … 6=Dom
    is_holiday          BOOLEAN      DEFAULT FALSE,

    -- Ventas
    total_sales         NUMERIC(14,2) DEFAULT 0,
    sales_cash          NUMERIC(14,2) DEFAULT 0,
    sales_card          NUMERIC(14,2) DEFAULT 0,
    sales_digital       NUMERIC(14,2) DEFAULT 0, -- Rappi, UberEats, etc.
    sales_meta          NUMERIC(14,2) DEFAULT 0, -- meta = presupuesto del día
    sales_vs_meta_pct   NUMERIC(7,4),

    -- Transacciones
    total_transactions  INT          DEFAULT 0,
    avg_ticket          NUMERIC(10,2),
    covers_count        INT          DEFAULT 0,

    -- Merma
    merma_amount        NUMERIC(10,2) DEFAULT 0,
    merma_pct           NUMERIC(7,4),

    data_source         VARCHAR(50),
    pos_batch_id        VARCHAR(100),
    is_reconciled       BOOLEAN      DEFAULT FALSE,
    created_at          TIMESTAMPTZ  DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE (branch_id, sale_date)
);

-- 3.2 Tickets Individuales (desde POS)
CREATE TABLE fact_transactions (
    transaction_id    BIGSERIAL    PRIMARY KEY,
    branch_id         INT          NOT NULL REFERENCES dim_branches(branch_id),
    brand_id          INT          NOT NULL REFERENCES dim_brands(brand_id),
    transaction_date  TIMESTAMPTZ  NOT NULL,
    sale_date         DATE         NOT NULL,
    ticket_number     VARCHAR(50),
    pos_terminal_id   VARCHAR(50),
    subtotal          NUMERIC(10,2) NOT NULL,
    discount_amount   NUMERIC(10,2) DEFAULT 0,
    tax_amount        NUMERIC(10,2) DEFAULT 0,
    total_amount      NUMERIC(10,2) NOT NULL,
    payment_method    VARCHAR(30),               -- cash | card | digital | mixed
    covers            INT          DEFAULT 1,
    order_channel     VARCHAR(30),               -- dine_in | takeout | delivery
    delivery_platform VARCHAR(30),               -- rappi | ubereats | didi | internal
    promo_code        VARCHAR(50),
    is_voided         BOOLEAN      DEFAULT FALSE,
    data_source       VARCHAR(50),
    created_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- 3.3 Merma
CREATE TABLE fact_waste (
    waste_id          BIGSERIAL    PRIMARY KEY,
    branch_id         INT          NOT NULL REFERENCES dim_branches(branch_id),
    brand_id          INT          NOT NULL REFERENCES dim_brands(brand_id),
    waste_date        DATE         NOT NULL,
    period_id         INT          REFERENCES dim_periods(period_id),
    product_category  VARCHAR(100),
    product_name      VARCHAR(150),
    quantity          NUMERIC(10,3),
    unit              VARCHAR(20),
    unit_cost         NUMERIC(10,2),
    total_cost        NUMERIC(10,2),
    waste_reason      VARCHAR(100),  -- expiration | prep_error | damage | other
    responsible_id    INT          REFERENCES dim_users(user_id),
    notes             TEXT,
    created_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- 3.4 Incidencias Operativas
CREATE TABLE fact_incidents (
    incident_id       BIGSERIAL    PRIMARY KEY,
    branch_id         INT          NOT NULL REFERENCES dim_branches(branch_id),
    brand_id          INT          NOT NULL REFERENCES dim_brands(brand_id),
    area_id           INT          REFERENCES dim_areas(area_id),
    incident_date     TIMESTAMPTZ  NOT NULL,
    incident_type     VARCHAR(50)  NOT NULL,  -- equipment | safety | quality | staff | other
    severity          VARCHAR(20)  DEFAULT 'medium'
                          CHECK (severity IN ('low','medium','high','critical')),
    title             VARCHAR(200),
    description       TEXT,
    action_taken      TEXT,
    resolved_at       TIMESTAMPTZ,
    is_resolved       BOOLEAN      DEFAULT FALSE,
    reported_by       INT          REFERENCES dim_users(user_id),
    assigned_to       INT          REFERENCES dim_users(user_id),
    created_at        TIMESTAMPTZ  DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- 3.5 Reseñas (Google, TripAdvisor, etc.)
CREATE TABLE fact_reviews (
    review_id         BIGSERIAL    PRIMARY KEY,
    branch_id         INT          NOT NULL REFERENCES dim_branches(branch_id),
    brand_id          INT          NOT NULL REFERENCES dim_brands(brand_id),
    review_date       DATE         NOT NULL,
    platform          VARCHAR(50),   -- google | tripadvisor | facebook | internal
    rating_score      NUMERIC(3,1),  -- 1.0 a 5.0
    sentiment         VARCHAR(20),   -- positive | neutral | negative
    review_text       TEXT,
    was_responded     BOOLEAN      DEFAULT FALSE,
    response_date     DATE,
    created_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- 3.6 Quejas Formales
CREATE TABLE fact_complaints (
    complaint_id      BIGSERIAL    PRIMARY KEY,
    branch_id         INT          NOT NULL REFERENCES dim_branches(branch_id),
    brand_id          INT          NOT NULL REFERENCES dim_brands(brand_id),
    complaint_date    DATE         NOT NULL,
    channel           VARCHAR(50),   -- in_store | phone | social | email | form
    complaint_type    VARCHAR(100),  -- service | quality | wait_time | hygiene
    severity          VARCHAR(20)  DEFAULT 'medium',
    description       TEXT,
    resolution        TEXT,
    is_resolved       BOOLEAN      DEFAULT FALSE,
    resolution_days   INT,
    satisfaction_score INT         CHECK (satisfaction_score BETWEEN 1 AND 5),
    created_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- SECTION 4 — RECURSOS HUMANOS
-- =============================================================================

-- 4.1 Empleados
CREATE TABLE dim_employees (
    employee_id        SERIAL       PRIMARY KEY,
    employee_code      VARCHAR(30)  NOT NULL UNIQUE,
    branch_id          INT          REFERENCES dim_branches(branch_id),
    brand_id           INT          NOT NULL REFERENCES dim_brands(brand_id),
    area_id            INT          REFERENCES dim_areas(area_id),
    first_name         VARCHAR(100) NOT NULL,
    last_name          VARCHAR(100) NOT NULL,
    position           VARCHAR(100) NOT NULL,    -- store_manager | subgerente | staff | etc.
    position_level     VARCHAR(30),              -- staff | supervisor | manager | director
    hire_date          DATE         NOT NULL,
    termination_date   DATE,
    termination_reason VARCHAR(50),  -- voluntary | performance | abandonment | contract_rescission
    salary_monthly     NUMERIC(10,2),
    contract_type      VARCHAR(30),  -- permanent | temporal | part_time
    is_active          BOOLEAN      DEFAULT TRUE,
    created_at         TIMESTAMPTZ  DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  DEFAULT NOW()
);

-- 4.2 Rotación mensual (granularidad: sucursal × mes)
-- Datos reales disponibles: AMC y SG (La Isla y Paseo de Montejo), 2026
CREATE TABLE fact_turnover (
    turnover_id          BIGSERIAL    PRIMARY KEY,
    branch_id            INT          REFERENCES dim_branches(branch_id),
    brand_id             INT          NOT NULL REFERENCES dim_brands(brand_id),
    period_id            INT          NOT NULL REFERENCES dim_periods(period_id),
    headcount_start      INT          NOT NULL,
    headcount_end        INT          NOT NULL,
    authorized_headcount INT,
    new_hires            INT          DEFAULT 0,
    terminations         INT          DEFAULT 0,
    voluntary_exits      INT          DEFAULT 0,
    involuntary_exits    INT          DEFAULT 0,
    abandonments         INT          DEFAULT 0,
    turnover_rate_pct    NUMERIC(7,4),           -- (bajas / headcount_start) * 100
    semaphore            VARCHAR(10)  CHECK (semaphore IN ('green','yellow','red')),
    notes                TEXT,
    created_at           TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE (branch_id, period_id)
);

-- 4.3 Incidencias de Asistencia
CREATE TABLE fact_attendance (
    attendance_id   BIGSERIAL    PRIMARY KEY,
    employee_id     INT          REFERENCES dim_employees(employee_id),
    branch_id       INT          NOT NULL REFERENCES dim_branches(branch_id),
    brand_id        INT          NOT NULL REFERENCES dim_brands(brand_id),
    period_id       INT          NOT NULL REFERENCES dim_periods(period_id),
    attendance_date DATE         NOT NULL,
    incident_type   VARCHAR(30)  NOT NULL,  -- absence_unjustified | absence_justified | tardiness
    hours_lost      NUMERIC(5,2) DEFAULT 0,
    justification   TEXT,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- 4.4 Vacantes
CREATE TABLE fact_vacancies (
    vacancy_id      BIGSERIAL    PRIMARY KEY,
    branch_id       INT          REFERENCES dim_branches(branch_id),
    brand_id        INT          NOT NULL REFERENCES dim_brands(brand_id),
    area_id         INT          REFERENCES dim_areas(area_id),
    position_title  VARCHAR(100) NOT NULL,
    open_date       DATE         NOT NULL,
    close_date      DATE,
    hired_date      DATE,
    days_to_fill    INT,
    vacancy_reason  VARCHAR(50),   -- growth | replacement | expansion | new_branch
    status          VARCHAR(20)  DEFAULT 'open'
                        CHECK (status IN ('open','in_process','filled','cancelled')),
    applications_count INT        DEFAULT 0,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- 4.5 Capacitación
CREATE TABLE fact_training (
    training_id      BIGSERIAL    PRIMARY KEY,
    branch_id        INT          REFERENCES dim_branches(branch_id),
    brand_id         INT          NOT NULL REFERENCES dim_brands(brand_id),
    training_name    VARCHAR(200) NOT NULL,
    training_type    VARCHAR(50),  -- onboarding | brand_immersion | compliance | skills
    training_date    DATE         NOT NULL,
    duration_hours   NUMERIC(5,2),
    participants_count INT        DEFAULT 0,
    completion_rate  NUMERIC(5,2),
    satisfaction_score NUMERIC(3,1),
    notes            TEXT,
    created_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- 4.6 Encuesta de Clima Laboral
-- Tipos: corporate_quarterly (IN-DEF) | operational_monthly (sucursales)
CREATE TABLE fact_climate_survey (
    survey_id           BIGSERIAL    PRIMARY KEY,
    branch_id           INT          REFERENCES dim_branches(branch_id),
    brand_id            INT          NOT NULL REFERENCES dim_brands(brand_id),
    survey_type         VARCHAR(30)  NOT NULL,  -- corporate_quarterly | operational_monthly
    period_id           INT          REFERENCES dim_periods(period_id),
    survey_date         DATE         NOT NULL,
    respondents_count   INT          DEFAULT 0,
    response_rate_pct   NUMERIC(5,2),
    -- Dimensiones 0–100
    score_environment   NUMERIC(5,2),
    score_workload      NUMERIC(5,2),
    score_leadership    NUMERIC(5,2),
    score_teamwork      NUMERIC(5,2),
    score_communication NUMERIC(5,2),
    score_growth        NUMERIC(5,2),
    score_belonging     NUMERIC(5,2),
    score_stress        NUMERIC(5,2),
    score_overall       NUMERIC(5,2),
    semaphore           VARCHAR(10)  CHECK (semaphore IN ('green','yellow','red')),
    strengths           TEXT,
    improvement_areas   TEXT,
    created_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- SECTION 5 — MARKETING
-- =============================================================================

-- 5.1 Campañas
CREATE TABLE fact_campaigns (
    campaign_id        BIGSERIAL    PRIMARY KEY,
    brand_id           INT          NOT NULL REFERENCES dim_brands(brand_id),
    campaign_name      VARCHAR(200) NOT NULL,
    campaign_type      VARCHAR(50),  -- paid_social | seo | email | influencer | promo | event
    platform           VARCHAR(50),  -- meta | google | tiktok | instagram | email | organic
    status             VARCHAR(20)  DEFAULT 'draft'
                           CHECK (status IN ('draft','active','paused','finished','cancelled')),
    start_date         DATE         NOT NULL,
    end_date           DATE,
    budget_total       NUMERIC(12,2),
    budget_spent       NUMERIC(12,2) DEFAULT 0,
    -- Performance
    impressions        BIGINT       DEFAULT 0,
    reach              BIGINT       DEFAULT 0,
    clicks             BIGINT       DEFAULT 0,
    ctr_pct            NUMERIC(7,4),
    conversions        INT          DEFAULT 0,
    leads              INT          DEFAULT 0,
    cpl                NUMERIC(10,2),
    roas               NUMERIC(7,4),
    revenue_attributed NUMERIC(12,2) DEFAULT 0,
    -- Social
    likes              INT          DEFAULT 0,
    comments           INT          DEFAULT 0,
    shares             INT          DEFAULT 0,
    engagement_rate    NUMERIC(7,4),
    responsible_id     INT          REFERENCES dim_users(user_id),
    notes              TEXT,
    created_at         TIMESTAMPTZ  DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  DEFAULT NOW()
);

-- 5.2 Reservas
CREATE TABLE fact_reservations (
    reservation_id    BIGSERIAL    PRIMARY KEY,
    branch_id         INT          NOT NULL REFERENCES dim_branches(branch_id),
    brand_id          INT          NOT NULL REFERENCES dim_brands(brand_id),
    reservation_date  DATE         NOT NULL,
    reservation_time  TIME,
    covers_requested  INT          DEFAULT 1,
    channel           VARCHAR(50),   -- phone | web | app | walk_in | whatsapp
    status            VARCHAR(20)  DEFAULT 'confirmed'
                          CHECK (status IN ('pending','confirmed','arrived','no_show','cancelled')),
    is_converted      BOOLEAN      DEFAULT FALSE,
    revenue_generated NUMERIC(10,2),
    campaign_id       INT          REFERENCES fact_campaigns(campaign_id),
    created_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- 5.3 Métricas de Redes Sociales
CREATE TABLE fact_social_metrics (
    metric_id             BIGSERIAL    PRIMARY KEY,
    brand_id              INT          NOT NULL REFERENCES dim_brands(brand_id),
    platform              VARCHAR(50)  NOT NULL,  -- instagram | tiktok | facebook | google
    metric_date           DATE         NOT NULL,
    period_id             INT          REFERENCES dim_periods(period_id),
    followers             BIGINT       DEFAULT 0,
    followers_delta       INT          DEFAULT 0,
    posts_count           INT          DEFAULT 0,
    reach                 BIGINT       DEFAULT 0,
    impressions           BIGINT       DEFAULT 0,
    avg_engagement_rate   NUMERIC(7,4),
    profile_visits        INT          DEFAULT 0,
    website_clicks        INT          DEFAULT 0,
    created_at            TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE (brand_id, platform, metric_date)
);

-- =============================================================================
-- SECTION 6 — EXPANSIÓN
-- =============================================================================

-- 6.1 Proyectos de Apertura
-- Project code: EXP-{YYYY}-{NNN}-{BRAND}-{CITY}
-- Ejemplo: EXP-2026-001-AMC-CDMX
CREATE TABLE fact_expansion_projects (
    project_id               BIGSERIAL    PRIMARY KEY,
    project_code             VARCHAR(30)  NOT NULL UNIQUE,
    brand_id                 INT          NOT NULL REFERENCES dim_brands(brand_id),
    city_id                  INT          REFERENCES dim_cities(city_id),
    project_name             VARCHAR(200) NOT NULL,
    location_address         TEXT,
    mall_center              VARCHAR(150),
    project_type             VARCHAR(30),  -- own | franchise | subfranquicia
    franchise_partner        VARCHAR(150),
    -- Fechas clave
    prospect_date            DATE,
    contract_signed_date     DATE,
    construction_start       DATE,
    construction_end         DATE,
    planned_opening_date     DATE,
    actual_opening_date      DATE,
    -- Estado
    project_status           VARCHAR(30)  NOT NULL DEFAULT 'prospect'
                                 CHECK (project_status IN (
                                     'prospect','negotiation','contract_signed',
                                     'permits','construction','fit_out',
                                     'training','soft_opening','open','cancelled','paused')),
    completion_pct           NUMERIC(5,2) DEFAULT 0,
    semaphore                VARCHAR(10)  CHECK (semaphore IN ('green','yellow','red')),
    -- Financiero
    capex_budget_mxn         NUMERIC(14,2),
    capex_executed_mxn       NUMERIC(14,2) DEFAULT 0,
    expected_monthly_revenue NUMERIC(14,2),
    expected_roi_months      INT,
    -- Responsables
    responsible_id           INT          REFERENCES dim_users(user_id),
    architect_firm           VARCHAR(150),
    contractor_firm          VARCHAR(150),
    notes                    TEXT,
    created_at               TIMESTAMPTZ  DEFAULT NOW(),
    updated_at               TIMESTAMPTZ  DEFAULT NOW()
);

-- 6.2 Hitos de Expansión
CREATE TABLE fact_expansion_milestones (
    milestone_id    BIGSERIAL    PRIMARY KEY,
    project_id      INT          NOT NULL REFERENCES fact_expansion_projects(project_id),
    milestone_name  VARCHAR(200) NOT NULL,
    milestone_type  VARCHAR(50),  -- permit | contract | construction | equipment | training
    planned_date    DATE         NOT NULL,
    actual_date     DATE,
    status          VARCHAR(20)  DEFAULT 'pending'
                        CHECK (status IN ('pending','in_progress','completed','delayed','blocked')),
    delay_days      INT          GENERATED ALWAYS AS
                        (CASE WHEN actual_date IS NOT NULL AND actual_date > planned_date
                         THEN actual_date - planned_date ELSE 0 END) STORED,
    responsible_id  INT          REFERENCES dim_users(user_id),
    notes           TEXT,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- 6.3 Contratos (renta, proveedor, franquicia)
CREATE TABLE fact_contracts (
    contract_id          BIGSERIAL    PRIMARY KEY,
    branch_id            INT          REFERENCES dim_branches(branch_id),
    brand_id             INT          NOT NULL REFERENCES dim_brands(brand_id),
    contract_type        VARCHAR(50)  NOT NULL,  -- lease | franchise | supplier | labor | service
    counterpart          VARCHAR(200) NOT NULL,
    start_date           DATE         NOT NULL,
    end_date             DATE,
    monthly_amount_mxn   NUMERIC(12,2),
    renewal_type         VARCHAR(30),            -- automatic | manual | not_applicable
    notice_days          INT,
    renewal_alert_date   DATE,                   -- end_date - notice_days
    status               VARCHAR(20)  DEFAULT 'active'
                             CHECK (status IN ('active','expired','terminated','under_review')),
    contract_document_url TEXT,
    notes                TEXT,
    created_at           TIMESTAMPTZ  DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- SECTION 7 — EXCELENCIA DE MARCA
-- =============================================================================

-- 7.1 Auditorías
CREATE TABLE fact_audits (
    audit_id             BIGSERIAL    PRIMARY KEY,
    branch_id            INT          NOT NULL REFERENCES dim_branches(branch_id),
    brand_id             INT          NOT NULL REFERENCES dim_brands(brand_id),
    audit_date           DATE         NOT NULL,
    audit_type           VARCHAR(50),  -- mystery_shopper | internal | external | surprise
    auditor_id           INT          REFERENCES dim_users(user_id),
    -- Dimensiones 0–100
    score_cleanliness    NUMERIC(5,2),
    score_service        NUMERIC(5,2),
    score_product        NUMERIC(5,2),
    score_presentation   NUMERIC(5,2),
    score_standards      NUMERIC(5,2),
    score_safety         NUMERIC(5,2),
    score_overall        NUMERIC(5,2),
    semaphore            VARCHAR(10)  CHECK (semaphore IN ('green','yellow','red')),
    deviations_count     INT          DEFAULT 0,
    critical_issues      INT          DEFAULT 0,
    action_plan          TEXT,
    reaudit_date         DATE,
    report_url           TEXT,
    created_at           TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- SECTION 8 — GOBERNANZA (Comité y Compromisos)
-- =============================================================================

-- 8.1 Sesiones de Comité
CREATE TABLE fact_committee_sessions (
    session_id        BIGSERIAL    PRIMARY KEY,
    session_date      DATE         NOT NULL,
    session_type      VARCHAR(20)  DEFAULT 'weekly'
                          CHECK (session_type IN ('weekly','monthly','emergency','strategic')),
    title             VARCHAR(200),
    attendees         JSONB,        -- [{user_id, name, confirmed}]
    agenda_url        TEXT,
    minutes_url       TEXT,
    status            VARCHAR(20)  DEFAULT 'scheduled'
                          CHECK (status IN ('scheduled','completed','cancelled')),
    next_session_date DATE,
    created_by        INT          REFERENCES dim_users(user_id),
    created_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- 8.2 Compromisos y Acuerdos
CREATE TABLE fact_commitments (
    commitment_id     BIGSERIAL    PRIMARY KEY,
    session_id        INT          REFERENCES fact_committee_sessions(session_id),
    brand_id          INT          REFERENCES dim_brands(brand_id),
    branch_id         INT          REFERENCES dim_branches(branch_id),
    area_id           INT          REFERENCES dim_areas(area_id),
    commitment_title  VARCHAR(300) NOT NULL,
    description       TEXT,
    responsible_id    INT          NOT NULL REFERENCES dim_users(user_id),
    due_date          DATE         NOT NULL,
    completion_date   DATE,
    priority          VARCHAR(10)  DEFAULT 'medium'
                          CHECK (priority IN ('low','medium','high','critical')),
    status            VARCHAR(20)  DEFAULT 'pending'
                          CHECK (status IN ('pending','in_progress','completed','delayed','cancelled')),
    completion_pct    INT          DEFAULT 0 CHECK (completion_pct BETWEEN 0 AND 100),
    days_overdue      INT          GENERATED ALWAYS AS
                          (CASE WHEN due_date < CURRENT_DATE AND status NOT IN ('completed','cancelled')
                           THEN CURRENT_DATE - due_date ELSE 0 END) STORED,
    semaphore         VARCHAR(10)  CHECK (semaphore IN ('green','yellow','red')),
    evidence_url      TEXT,
    notes             TEXT,
    created_at        TIMESTAMPTZ  DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- 8.3 Riesgos Corporativos
CREATE TABLE fact_risks (
    risk_id           BIGSERIAL    PRIMARY KEY,
    brand_id          INT          REFERENCES dim_brands(brand_id),
    branch_id         INT          REFERENCES dim_branches(branch_id),
    area_id           INT          REFERENCES dim_areas(area_id),
    risk_category     VARCHAR(50)  NOT NULL,  -- financial | operational | legal | hr | market | reputational
    risk_title        VARCHAR(200) NOT NULL,
    description       TEXT,
    probability       INT          CHECK (probability BETWEEN 1 AND 5),
    impact            INT          CHECK (impact BETWEEN 1 AND 5),
    risk_score        INT          GENERATED ALWAYS AS (probability * impact) STORED,
    semaphore         VARCHAR(10)  CHECK (semaphore IN ('green','yellow','red')),
    mitigation_plan   TEXT,
    responsible_id    INT          REFERENCES dim_users(user_id),
    status            VARCHAR(20)  DEFAULT 'open'
                          CHECK (status IN ('open','in_mitigation','resolved','accepted','closed')),
    review_date       DATE,
    created_at        TIMESTAMPTZ  DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- SECTION 9 — KPI READINGS (Lectura diaria de semáforos)
-- =============================================================================

CREATE TABLE fact_kpi_readings (
    reading_id      BIGSERIAL    PRIMARY KEY,
    kpi_id          INT          NOT NULL REFERENCES dim_kpi_catalog(kpi_id),
    branch_id       INT          REFERENCES dim_branches(branch_id),
    brand_id        INT          NOT NULL REFERENCES dim_brands(brand_id),
    reading_date    DATE         NOT NULL,
    period_id       INT          REFERENCES dim_periods(period_id),
    value_actual    NUMERIC(14,4),
    value_target    NUMERIC(14,4),
    value_previous  NUMERIC(14,4),
    pct_vs_target   NUMERIC(7,4),
    pct_vs_previous NUMERIC(7,4),
    semaphore       VARCHAR(10)  NOT NULL CHECK (semaphore IN ('green','yellow','red','grey')),
    alert_triggered BOOLEAN      DEFAULT FALSE,
    alert_message   TEXT,
    data_source     VARCHAR(50),
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE (kpi_id, branch_id, reading_date)
);

-- =============================================================================
-- SECTION 10 — ETL LOGS
-- =============================================================================

CREATE TABLE etl_logs (
    log_id             BIGSERIAL    PRIMARY KEY,
    process_name       VARCHAR(100) NOT NULL,
    source_system      VARCHAR(50),   -- soft_restaurant | hiopos | google_sheets | excel | meta | manual
    target_table       VARCHAR(100),
    branch_id          INT          REFERENCES dim_branches(branch_id),
    brand_id           INT          REFERENCES dim_brands(brand_id),
    run_date           TIMESTAMPTZ  DEFAULT NOW(),
    records_extracted  INT          DEFAULT 0,
    records_loaded     INT          DEFAULT 0,
    records_rejected   INT          DEFAULT 0,
    status             VARCHAR(20)  DEFAULT 'running'
                           CHECK (status IN ('running','success','failed','partial')),
    error_message      TEXT,
    duration_seconds   INT,
    created_at         TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- SECTION 11 — ÍNDICES
-- =============================================================================

CREATE INDEX idx_sales_branch_date      ON fact_sales_daily(branch_id, sale_date);
CREATE INDEX idx_sales_brand_date       ON fact_sales_daily(brand_id, sale_date);
CREATE INDEX idx_sales_date             ON fact_sales_daily(sale_date);
CREATE INDEX idx_txn_branch_date        ON fact_transactions(branch_id, sale_date);
CREATE INDEX idx_pnl_branch_period      ON fact_pnl(branch_id, period_id);
CREATE INDEX idx_pnl_brand_period       ON fact_pnl(brand_id, period_id);
CREATE INDEX idx_turnover_brand_period  ON fact_turnover(brand_id, period_id);
CREATE INDEX idx_kpi_brand_date         ON fact_kpi_readings(brand_id, reading_date);
CREATE INDEX idx_kpi_semaphore          ON fact_kpi_readings(semaphore, reading_date);
CREATE INDEX idx_commit_status          ON fact_commitments(status);
CREATE INDEX idx_commit_due             ON fact_commitments(due_date);
CREATE INDEX idx_commit_owner           ON fact_commitments(responsible_id);

-- =============================================================================
-- SECTION 12 — VISTAS
-- =============================================================================

-- Semáforo corporativo — todos los KPIs actuales
CREATE OR REPLACE VIEW v_semaforo_corporativo AS
SELECT
    kr.reading_date,
    b.brand_code,
    b.brand_name,
    br.branch_code,
    br.branch_name,
    k.kpi_code,
    k.kpi_name,
    k.kpi_category,
    kr.value_actual,
    kr.value_target,
    kr.pct_vs_target,
    kr.semaphore,
    kr.alert_message
FROM fact_kpi_readings kr
JOIN dim_kpi_catalog k   ON k.kpi_id   = kr.kpi_id
JOIN dim_brands      b   ON b.brand_id  = kr.brand_id
LEFT JOIN dim_branches br ON br.branch_id = kr.branch_id
WHERE kr.reading_date = CURRENT_DATE - 1
ORDER BY
    CASE kr.semaphore WHEN 'red' THEN 1 WHEN 'yellow' THEN 2 WHEN 'green' THEN 3 ELSE 4 END,
    b.brand_code, br.branch_name;

-- Resumen de ventas para dashboard
CREATE OR REPLACE VIEW v_ventas_resumen AS
SELECT
    sd.sale_date,
    b.brand_code,
    b.brand_name,
    br.branch_code,
    br.branch_name,
    sd.total_sales,
    sd.sales_meta,
    sd.sales_vs_meta_pct,
    sd.total_transactions,
    sd.avg_ticket,
    sd.merma_pct,
    CASE
        WHEN sd.sales_vs_meta_pct >= 95 THEN 'green'
        WHEN sd.sales_vs_meta_pct >= 85 THEN 'yellow'
        ELSE 'red'
    END AS ventas_semaforo
FROM fact_sales_daily sd
JOIN dim_branches     br ON br.branch_id = sd.branch_id
JOIN dim_brands       b  ON b.brand_id   = sd.brand_id;

-- Compromisos vencidos
CREATE OR REPLACE VIEW v_compromisos_vencidos AS
SELECT
    cm.commitment_id,
    cm.commitment_title,
    b.brand_name,
    a.area_name,
    u.first_name || ' ' || u.last_name AS responsible,
    cm.due_date,
    cm.days_overdue,
    cm.priority,
    cm.status
FROM fact_commitments cm
LEFT JOIN dim_brands b ON b.brand_id = cm.brand_id
LEFT JOIN dim_areas  a ON a.area_id  = cm.area_id
JOIN  dim_users      u ON u.user_id  = cm.responsible_id
WHERE cm.days_overdue > 0
  AND cm.status NOT IN ('completed','cancelled')
ORDER BY cm.days_overdue DESC, cm.priority;

-- P&L mensual consolidado
CREATE OR REPLACE VIEW v_pnl_mensual AS
SELECT
    pr.period_label,
    pr.year_num,
    pr.month_num,
    b.brand_code,
    b.brand_name,
    br.branch_name,
    p.ventas_netas,
    p.ventas_meta,
    p.ventas_vs_meta_pct,
    p.total_cogs,
    p.cogs_pct,
    p.nomina_total,
    p.nomina_pct,
    p.renta_local,
    p.renta_pct,
    p.ebitda,
    p.ebitda_pct,
    p.utilidad_neta,
    p.data_source
FROM fact_pnl   p
JOIN dim_branches br ON br.branch_id = p.branch_id
JOIN dim_brands   b  ON b.brand_id   = p.brand_id
JOIN dim_periods  pr ON pr.period_id = p.period_id
ORDER BY pr.year_num DESC, pr.month_num DESC, b.brand_code;

-- Rotación RH
CREATE OR REPLACE VIEW v_rotacion_mensual AS
SELECT
    pr.period_label,
    b.brand_code,
    b.brand_name,
    br.branch_name,
    t.headcount_start,
    t.authorized_headcount,
    t.new_hires,
    t.terminations,
    t.voluntary_exits,
    t.involuntary_exits,
    t.abandonments,
    t.turnover_rate_pct,
    t.semaphore
FROM fact_turnover  t
JOIN dim_brands     b  ON b.brand_id   = t.brand_id
LEFT JOIN dim_branches br ON br.branch_id = t.branch_id
JOIN dim_periods    pr ON pr.period_id = t.period_id
ORDER BY pr.year_num DESC, pr.month_num DESC, b.brand_code;

-- Expansión
CREATE OR REPLACE VIEW v_expansion_status AS
SELECT
    ep.project_code,
    ep.project_name,
    b.brand_name,
    ep.project_type,
    ep.project_status,
    ep.completion_pct,
    ep.semaphore,
    ep.planned_opening_date,
    ep.actual_opening_date,
    ep.capex_budget_mxn,
    ep.capex_executed_mxn,
    ROUND((ep.capex_executed_mxn / NULLIF(ep.capex_budget_mxn,0)) * 100, 2) AS capex_pct,
    u.first_name || ' ' || u.last_name AS responsible
FROM fact_expansion_projects ep
JOIN dim_brands  b ON b.brand_id  = ep.brand_id
LEFT JOIN dim_users u ON u.user_id = ep.responsible_id
WHERE ep.project_status NOT IN ('open','cancelled');

-- =============================================================================
-- SECTION 13 — FUNCIÓN SEMÁFORO AUTOMÁTICO
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_get_semaphore(
    p_kpi_code VARCHAR,
    p_value    NUMERIC
) RETURNS VARCHAR AS $$
DECLARE
    v_green     NUMERIC;
    v_yellow    NUMERIC;
    v_direction VARCHAR;
BEGIN
    SELECT green_threshold, yellow_threshold, direction
    INTO   v_green, v_yellow, v_direction
    FROM   dim_kpi_catalog
    WHERE  kpi_code = p_kpi_code AND is_active = TRUE;

    IF v_direction = 'higher_better' THEN
        IF p_value >= v_green  THEN RETURN 'green';
        ELSEIF p_value >= v_yellow THEN RETURN 'yellow';
        ELSE RETURN 'red';
        END IF;
    ELSE  -- lower_better
        IF p_value <= v_green  THEN RETURN 'green';
        ELSEIF p_value <= v_yellow THEN RETURN 'yellow';
        ELSE RETURN 'red';
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Ejemplos:
-- SELECT fn_get_semaphore('ROTACION_PCT', 27.03);  → 'red'
-- SELECT fn_get_semaphore('EBITDA_PCT',   15.5);   → 'green'
-- SELECT fn_get_semaphore('MERMA_PCT',    4.2);    → 'yellow'
-- SELECT fn_get_semaphore('VTA_VS_META',  91);     → 'yellow'

-- =============================================================================
-- FIN DEL SCHEMA — JB HOLDS DATA WAREHOUSE v1.1 (MX-only)
-- =============================================================================
