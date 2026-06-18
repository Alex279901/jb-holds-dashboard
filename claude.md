# CLAUDE.md — Contexto del proyecto JB Holds Dashboard

## Objetivo del proyecto

Este repositorio contiene el dashboard JB Holds Command Center.

El objetivo actual es migrar el dashboard desde Google Sheets hacia Supabase sin romper la funcionalidad existente.

## Arquitectura actual

El dashboard está desplegado en Vercel.

URL producción:
https://jb-holds-dashboard.vercel.app/

Secciones principales:

- Inicio
- Global
- México
- España
- INDEF

## Fuente actual de datos

Actualmente varias partes del dashboard consumen Google Sheets.

Antes de modificar cualquier conexión, se debe auditar:

- qué archivo JS consume datos
- qué hoja consume
- qué KPI genera
- qué pantalla lo usa

## Nueva fuente oficial

Supabase será la fuente oficial de datos.

Tablas principales:

- ventas_por_fecha
- ventas_por_hora
- ventas_por_producto
- catalogo_sucursales
- catalogo_productos
- nomina_semanal

Vistas principales:

- vw_c_fecha
- vw_c_hora
- vw_c_producto
- vw_kpis_ejecutivos
- vw_renta_vs_ventas
- vw_ranking_sucursales
- vw_labor_cost
- vw_kpi_labor_cost
- vw_kpi_nomina_semanal
- vw_kpi_renta_mensual

## Reglas de negocio

- Semana operativa: lunes a domingo.
- México usa MXN.
- España usa EUR.
- AMC usa MXN.
- Usar siempre prefijo SG, nunca SGB.
- SG Alameda de Urquijo se preserva en catálogo, pero normalmente no entra en consolidados.
- No eliminar funcionalidades sin autorización.
- No cambiar nomenclaturas sin revisar impacto.
- No tocar Vercel/deploy sin aprobación.
- No exponer claves de Supabase.
- No usar EBITDA como KPI principal.
- Usar venta_neta como métrica financiera base.

## Flujo de trabajo obligatorio

Antes de hacer cambios:

1. Leer este archivo.
2. Analizar el repositorio.
3. Identificar archivos afectados.
4. Explicar impacto.
5. Explicar riesgos.
6. Proponer plan.
7. Esperar aprobación.

Después de aprobación:

1. Hacer cambios mínimos.
2. Validar localmente.
3. Explicar qué cambió.
4. No hacer commit/push sin autorización explícita.

## Objetivo inmediato

Auditar la migración Google Sheets → Supabase.

Necesitamos documentar:

- todas las conexiones a Google Sheets
- todos los fetch
- todos los Spreadsheet IDs
- todas las pestañas usadas
- todos los KPIs calculados
- qué vista de Supabase reemplaza cada fuente
- qué vistas faltan
- plan de migración por fases
