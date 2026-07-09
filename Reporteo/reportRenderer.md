# reportRenderer.md — Render página a página del Report Engine

**Objetivo:** especificar exactamente cómo se renderiza cada página, sin dejar decisiones abiertas. Los tokens de color/tipografía/umbral están en `reportSchema.json → params`. Las reglas de negocio en `reportRules.md`. Este documento indica, por página/sección: **objetivo, componentes, orden, títulos, subtítulos, tablas, gráficas, tarjetas, insights, conclusiones.**

Regla de oro de layout: **no se fuerzan saltos de página.** Los bloques fluyen; se mantienen juntos (banner+primer visual), cada tabla y cada (gráfica+caption) como unidad; los comentarios fluyen. El espaciado va al inicio de cada bloque.

---

## 0. Layout global de página (todas las páginas de contenido)

- **Tamaño:** A4 vertical, márgenes 2.0 cm.
- **Encabezado:** izquierda `INDEF · INVERSIÓN EN DESARROLLO DE FRANQUICIAS` (8 pt, MUTED, mayúsculas); derecha, número de página (folio).
- **Pie de página:** VACÍO (obligatorio).
- **Ancho útil:** ≈17 cm (todas las gráficas y tablas se ajustan a este ancho).
- **Fuente:** Carlito. Glifos permitidos: `↑ ↓ → ●`. Prohibidos: `▲ ▼`, emojis a color.

---

## 1. PORTADA (obligatoria, sin número)

- **Objetivo:** identificar marca, tipo de reporte, periodo y metadatos.
- **Orden vertical, centrado:**
  1. Logo INDEF (≈6.2 cm de ancho).
  2. Regla dorada corta (≈7 cm) centrada.
  3. **Título** (PRIMARY, bold, mayúsculas, 20–24 pt) = `branding.brandTitle`.
  4. **Subtítulo dorado** (GOLD, bold, 15–16 pt) = etiqueta del tipo + periodo (p.ej. `REPORTE EJECUTIVO SEMESTRAL 2026`).
  5. **Subtítulo descriptivo** (INK, 12 pt) = alcance (p.ej. `Consolidado de operaciones México · Enero – Junio 2026, con capítulo especial de Junio`).
  6. **Tabla de metadatos** (2 columnas: etiqueta MUTED derecha + valor bold INK; regla dorada vertical entre columnas). Filas: Empresa (enlace), Cobertura, Sucursales, Período, Moneda, Fecha de generación.
  7. **Tagline** itálica MUTED (según país: `branding.tagline`).
- Tras la portada: salto de página.

---

## 2. ÍNDICE (obligatorio, sin número)

- **Objetivo:** navegación.
- **Componentes:** título "Índice" (PRIMARY, 16 pt) + regla dorada + TOC automático.
- **Niveles:** sección (número + título, PRIMARY bold) y subsección (indentada, INK). Los **divisores de PARTE** aparecen como línea destacada (GOLD) sin número.
- Tras el índice: salto de página.

---

## 3. DIVISOR DE PARTE (solo `semestral_consolidado`, sin número)

- **Objetivo:** separar bloques mayores.
- **Render:** título de parte (GOLD, bold, 15 pt) — p.ej. `PARTE A · Balance Semestral (Enero – Junio 2026)` — + regla dorada. No consume número de sección.

---

## 4. Estructura de cada SECCIÓN numerada

Toda sección analítica sigue este patrón:

```
[Spacer]
BANNER: [n] TÍTULO          (cuadro PRIMARY con número blanco + título versalitas PRIMARY + regla tenue)
[componentes en el orden que define la sección: kpi_cards / chart+caption / data_table / bullets / h1 / comment_box]
```

- **Banner:** el número `n` es un contador **global** que incrementa por sección (los divisores de PARTE no incrementan).
- **Sub-encabezados internos (`h1`)**: bold PRIMARY 12.5 pt (p.ej. "Top 10 productos (consolidado México)").
- **Caption**: itálica MUTED bajo cada gráfica.
- **comment_box**: recuadro con borde izquierdo dorado; **interpreta**, no describe la tabla.

A continuación, el render específico por sección (se activa según `reportType`; ver orden en `reportSchema → sections.catalog[appliesTo]`).

---

### 4.1 RESUMEN EJECUTIVO / RESUMEN EJECUTIVO SEMESTRAL
- **Objetivo:** en ≤1 página responder cómo fue el periodo, mejor/peor que anterior, qué cambió, sucursales destacadas y en riesgo; cerrar con 5 conclusiones.
- **Componentes en orden:** banner → `kpi_cards` (4–5) → `h1` "Lo esencial…" → `bullets` (3–5) → `h1` "Las 5 conclusiones…" → `bullets` (exactamente 5) → `comment_box` de alcance/notas.
- **Tarjetas (kpi_cards):** Venta neta · Venta bruta · Tickets · Ticket promedio · Nº sucursales (o Cumplimiento). Valor grande PRIMARY + label MUTED.
- **Insights:** generados por `reportRules → insight_rules` (afluencia vs ticket, concentración, fin de semana, estacionalidad, cartera concentrada).
- **comment_box fijo:** disclaimer de neto + alcance (qué sucursales incluye) + `disclaimer_finanzas` si faltan P&L/marketing.

### 4.2 EVOLUCIÓN HISTÓRICA
- **Objetivo:** ver evolución mensual del periodo.
- **Orden:** banner → `data_table` (evolucion_mensual) → `chart` `linea_evolucion` → caption → comment_box.
- **Tabla:** columnas `Mes · Venta bruta · Venta neta · Tickets · Ticket prom. [· Unidades]` + fila **TOTAL**.
- **Gráfica:** dos líneas (bruta LIGHT, neta PRIMARY con área tenue), etiqueta de dato sobre neto.
- **Caption:** "Evolución mensual consolidada de venta bruta y neta…". Añadir nota de apertura reciente si aplica.
- **Insight:** mejor/peor mes (meses completos), rango feb–may, caída de junio.

### 4.3 COMPARATIVO MENSUAL
- **Objetivo:** variación mensual y diferencia absoluta.
- **Orden:** banner → `chart` `barras_variacion_mensual` → caption → `data_table` (comparativo_mensual) → comment_box.
- **Tabla:** `Mes · Venta neta · Variación % · Diferencia abs.` (primer mes: "—").
- **Insight:** punto de inflexión (junio), salto de febrero (entra AMC).

### 4.4 DESEMPEÑO POR SUCURSAL
- **Objetivo:** tendencias por sucursal + ranking + KPIs.
- **Orden:** banner → `chart` `lineas_por_sucursal` → caption → `chart` `ranking_horizontal` → caption → `data_table` (desempeno_por_sucursal) → comment_box.
- **Tabla:** `Sucursal · Venta neta sem. · Part. % · Mejor mes · Peor mes`.
- **Insight:** líder (participación), rezagada, estacionalidad SG vs AMC.

### 4.5 ANÁLISIS POR DÍA DE LA SEMANA
- **Objetivo:** día más fuerte/débil y concentración de fin de semana.
- **Orden:** banner → `chart` `heatmap_dia` → caption → `data_table` (dia_semana ordenada desc por neto) → comment_box.
- **Insight fijo:** día fuerte/flojo + "el fin de semana (vie–dom) concentra el {pct}% de la venta neta" (plantilla `fin_de_semana`).

### 4.6 ANÁLISIS POR SEMANA
- **Objetivo:** perfil semanal; semana más fuerte/débil (excluyendo parcial de cierre).
- **Orden:** banner → `chart` `linea_semanal` → caption → comment_box.

### 4.7 PRODUCTOS Y CATEGORÍAS / MIX DE VENTAS
- **Objetivo:** Top/Bottom, categorías, Pareto.
- **Orden (semestral):** banner → `h1` "Top 10 productos" → `chart` `barras_horizontales_producto` (top) → caption → `data_table` (productos) → `h1` "Mix por categoría y Pareto" → `chart` `barras_categoria` → caption → `chart` `pareto` → caption → comment_box.
- **Tabla productos:** `# · Producto · [Categoría] · Uds. · Bruta · Neta`.
- **Pareto:** anotación "80% en {N} productos" (N calculado). Insight de racionalización de cola.

### 4.8 TOP 10 / BOTTOM 10 (mensual/anual)
- **Orden:** banner → `chart` `barras_horizontales_producto` → caption → `data_table` (productos) → comment_box.
- **Top:** barras PRIMARY. **Bottom:** barras RED_SOFT + recomendación de revisar exposición/precio/reconversión.

### 4.9 TOP 5 POR CATEGORÍA (mensual)
- **Orden:** banner → caption → un `data_table` por categoría principal (hasta 6): `# · Producto · Uds. · Bruta · Neta · Part.`.
- **Ocultar si** no hay categoría (ver reportRules `hide.top5_categoria`).

### 4.10 PANORAMA GENERAL (semanal red)
- **Orden:** banner → `kpi_cards` (Venta semanal · Cumplimiento · Ticket medio · Tickets) → `kpi_cards` (H1 · vs año anterior · maduras · semáforo 0/ámbar/rojo) → comment_box.

### 4.11 VENTAS DE LA SEMANA POR SUCURSAL (semanal red)
- **Objetivo:** venta ABSOLUTA por sucursal (números, no solo variación).
- **Orden:** banner → `chart` `barras_absolutas_sucursal` (color por estado) → caption → `data_table` (detalle_por_sucursal_semanal) → comment_box.
- **Tabla:** `Sucursal · Venta sem. · Var. $ · Var. % · Tickets · Ticket · Cumpl. · Estado`.

### 4.12 CUMPLIMIENTO DE META(S)
- **mensual/semanal:** banner → `chart` `barras_cumplimiento` (línea meta 100%, bandas de color) → caption → `kpi_cards` → comment_box.
- **semestral (metas):** banner → `chart` `barras_agrupadas_cumplimiento` (comercial vs operativa) → caption → `data_table` (cumplimiento_metas_semestral) → comment_box.
- **Si no hay meta:** ver reportRules `sin_meta` (mostrar "Sin meta", ocultar cumplimiento).

### 4.13 ESTRUCTURA DE COSTOS (semestral)
- **Orden:** banner → `chart` `barras_agrupadas_costos` (renta% vs labor%, línea 28%) → caption → `data_table` (estructura_costos) → comment_box con **nota fija** de que utilidad/estados financieros/ROAS requieren P&L/marketing.

### 4.14 ANÁLISIS POR HORA / HORAS PICO
- **comité:** banner → `chart` `linea_por_hora` (red, 2 semanas) → caption → `chart` `perfil_horario_normalizado` → caption → `data_table` (horas_pico) → bullets.
- **semestral:** banner → `chart` `perfil_horario_normalizado` → caption → `data_table` (horas_pico) → comment_box.
- **Insight fijo:** AMC = mañana (10–13h); SG = tarde-noche (17–21h). Franjas definidas en `texts.fixed.hourBands`. Semáforo por franja: verde (fuerte)/amarillo (medio)/rojo (muerta).

### 4.15 INDICADORES CORPORATIVOS (comité)
- **Orden:** banner → `data_table` comercial → `h1` → `data_table` meta/costos → comment_box.
- **Tabla A:** `Sucursal · Venta neta · Venta total · Docs · Comensales · Ticket medio · Gasto/com.`
- **Tabla B:** `Sucursal · Meta · Cumplimiento · GAP · Renta/Ventas · Labor Cost`.
- **Tendencia:** debajo de cada valor, `↑`(POS) / `↓`(NEG) / `→`(FLAT) vs periodo anterior. Para renta/labor la mejora es a la baja (`inverse`).

### 4.16 COMPARATIVO VS SEMANA ANTERIOR (comité)
- **Orden:** banner → `chart` `barras_divergentes_variacion` (verde der / rojo izq, ordenado) → caption → `bullets` (1 por sucursal con lectura de negocio) → comment_box.

### 4.17 RANKING DE SUCURSALES (comité)
- **Orden:** banner → `bullets` (rankings: mayor venta, cumplimiento, ticket, documentos, mejor renta/ventas, menor caída) → `h1` "Top 3 mejores" → bullets → `h1` "Top 3 oportunidad" → bullets.

### 4.18 ALERTAS (comité)
- **Orden:** banner → `data_table` (`Sucursal · Nivel · Alerta`; Nivel = `●` rojo/ámbar) → comment_box.
- Solo alertas disparadas (reportRules). Si ninguna: "Sin alertas relevantes".

### 4.19 HALLAZGOS / VALIDACIÓN DE TENDENCIAS
- **Orden:** banner → `bullets`. Cada bullet = un insight sustentado (reportRules `insight_rules`). Validación: bullets de "confirma / aporta".

### 4.20 RECOMENDACIONES / PLAN DE ACCIÓN / RECOM. TIENDAS NUEVAS
- **Recomendaciones (comité):** banner → `bullets` (1 por sucursal, específica, con **KPI a monitorear**).
- **Plan de acción (semanal red):** banner → `data_table` (`Estrategia · Descripción · Tiendas objetivo · Plazo`) → comment_box.
- **Recom. tiendas nuevas:** banner → `data_table` (`Acción preventiva · Objetivo · KPI a monitorear`) → comment_box.
- **Plan H2 (semestral):** banner → `h1` "Comercial" → bullets → `h1` "Rentabilidad · costos" → bullets → `h1` "Expansión y seguimiento" → bullets.

### 4.21 CONCLUSIONES / CONCLUSIÓN EJECUTIVA / CONCLUSIONES Y PRIORIDADES
- **Orden:** banner → `h1` "Hallazgos clave" → bullets → `h1` "Orden de prioridades / Sucursales a seguir" → bullets.
- **Conclusión ejecutiva (comité):** máx **10 bullets**. Resumen ejecutivo: exactamente **5** conclusiones.

### 4.22 RESUMEN GLOBAL 2026 (anual)
- **Orden:** banner → `h1` "Consolidado anual" → `kpi_cards` → `h1` "Ranking de sucursales" → `chart` `ranking_horizontal` → caption → `data_table` (ranking_sucursal) → `h1` "Hallazgos estratégicos" → bullets.

### 4.23 ANÁLISIS MENSUAL POR SUCURSAL (anual)
- **Objetivo:** bloque individual por cada sucursal.
- **Por sucursal (en orden):** `h1` nombre + regla dorada → `kpi_cards` (Neta · Bruta · Tickets · Ticket prom · Unidades) → `data_table` mensual (`Mes · Bruta · Neta · Tickets · Tkt prom · Uds · Var%`) → `chart` `barras_variacion_mensual` → caption → **[solo México]** `data_table` productos por sucursal → comment_box (mejor/peor mes + día fuerte/flojo + crecimiento vs último mes completo).
- **España:** NO repetir productos/categorías aquí (van en secciones consolidadas).

---

## 5. FRANJA DE CIERRE (obligatoria, al final)
- **Render:** regla dorada + `caption` con metodología: `disclaimer_neto`, alcance (qué sucursales), notas de datos (mes parcial, sucursales nuevas), y `disclaimer_finanzas` si aplica.

---

## 6. Orden completo por tipo (resumen)

- **mensual_sucursal:** Portada · Índice · 1 Resumen · 2 Cumplimiento meta · 3 Día de semana · 4 Comparativa semanal · 5 Top 10 · 6 Bottom 10 · 7 Top 5 por categoría · 8 Mix/Pareto · 9 Conclusiones · Cierre.
- **semanal_red (España):** Portada · Índice · 1 Panorama · 2 Ventas por sucursal · 3 Cumplimiento · 4 Variación semanal · 5 Comparativo histórico · 6 Detalle por sucursal · 7 Plan de acción · 8 Recom. tiendas nuevas · 9 Conclusiones y prioridades · Cierre.
- **semanal_ejecutivo_comite (México):** Portada · Índice · 1 Resumen · 2 Indicadores corporativos · 3 Comparativo vs semana anterior · 4 Ranking · 5 Análisis por hora · 6 Productos · 7 Alertas · 8 Hallazgos · 9 Recomendaciones · 10 Conclusión ejecutiva · (Hallazgos adicionales) · Cierre.
- **anual_historico:** Portada · Índice · 1 Resumen · 2 Evolución histórica · 3 Comparativo mensual · 4 Día de semana · (Tickets por día) · 5 Análisis por semana · (Distribución por importe de ticket) · 6 Top 10 · 7 Bottom 10 · 8 Mix/Pareto · 9 Análisis mensual · 10 Análisis mensual por sucursal · 11 Resumen global/ranking · Cierre.
- **semestral_consolidado:** Portada · Índice · **PARTE A**: 1 Resumen semestral · 2 Evolución histórica · 3 Comparativo mensual · 4 Desempeño por sucursal · 5 Día de semana · 6 Análisis por semana · 7 Productos y categorías · **PARTE B (capítulo del mes)**: 8 Panorama · 9 Cumplimiento de metas · 10 Estructura de costos · 11 Horas pico/operativo · 12 Validación de tendencias · **PARTE C**: 13 Conclusiones · 14 Plan H2 · Cierre.

> El motor toma este orden de `reportSchema → sections.catalog` filtrando por `appliesTo == reportType` y respetando `required`/`hideWhen`.
