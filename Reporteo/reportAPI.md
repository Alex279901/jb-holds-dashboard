# reportAPI.md — Contrato del Report Engine (VS1)

Contrato **funcional** de la función principal del motor. No es código: describe el INPUT que VS1 debe construir (tras consultar Supabase) y el OUTPUT que el motor devuelve. La implementación puede ser en cualquier stack; lo que se garantiza es este contrato.

Documentos hermanos: `reportSchema.json` (esquema maestro), `reportPayload.example.json` (payload real de ejemplo), `reportRenderer.md` (render por página), `reportRules.md` (reglas de negocio).

---

## 1. Función principal

```
generateExecutiveReport({
    brand,        // enum: "SG" | "AMC" | "MIXTO"
    country,      // enum: "Mexico" | "Espana"
    stores,       // array<storeId> | "ALL"
    dateRange,    // { from, to, granularity, monthChapterMonth? }
    reportType    // enum: "mensual_sucursal" | "semanal_red" | "semanal_ejecutivo_comite" | "anual_historico" | "semestral_consolidado"
}) -> ReportDocument
```

**Contrato conceptual del pipeline** (comportamiento, ver Apéndice de `VS1_MOTOR_REPORTES_INDEF.md`):
`resolver alcance → cargar de Supabase → normalizar → construir payload (reportPayload) → calcular KPIs/estados → seleccionar y ordenar secciones (schema) → aplicar reglas (insights/alertas/oportunidades/recomendaciones) → redactar textos (plantillas) → ensamblar documento → validar (checklist)`.

Se recomienda separar en dos pasos para testeo:
1. `buildReportPayload(input) -> reportPayload` (consulta Supabase + normaliza; salida = `reportPayload.example.json`).
2. `renderReport(reportPayload) -> ReportDocument` (motor puro, determinista, sin acceso a datos).

Así, el mismo `reportPayload` siempre produce el mismo `ReportDocument` (idempotente).

---

## 2. INPUT

### 2.1 Parámetros de la función

| Campo | Tipo | Req | Descripción |
|---|---|---|---|
| `brand` | enum | sí | Marca a reportar. `MIXTO` para consolidados multi-marca (México AMC+SG). |
| `country` | enum | sí | Define IVA (0.16/0.10), tagline y la regla Urquijo (España). |
| `stores` | array\<storeId\> \| "ALL" | sí | Sucursales incluidas. `ALL` = todas las activas del `brand`+`country`. |
| `dateRange` | object | sí | `{ from, to, granularity, monthChapterMonth? }`. `granularity`: `daily`\|`weekly`\|`monthly`\|`semester`. `monthChapterMonth` solo en `semestral_consolidado`. |
| `reportType` | enum | sí | Determina el orden de secciones (schema `sections.catalog[appliesTo]`). |
| `config?` | object | no | Overrides: `currency`, `locale`, `maxConclusionBullets`, `sectionsOverride`. Defaults en schema. |

**Reglas de resolución del input:**
- Si `country = Espana` ⇒ el motor fuerza `includeUrquijo = true`.
- Si `reportType` requiere comparativo (semanal_ejecutivo_comite) ⇒ `dateRange` debe permitir derivar el periodo anterior (semana N y N-1).
- Sucursales con `isNew = true` sin histórico se excluyen del cuerpo semestral/anual y se enrutan al `monthChapter`.

### 2.2 Datos requeridos desde Supabase (para construir `reportPayload`)

VS1 consulta estas tablas (nombres orientativos; el motor mapea por rol). Detalle de campos en `reportSchema.json → entities`.

| Tabla | Rol | Se usa en |
|---|---|---|
| `catalogo_sucursales` | identidad, país/marca, `isNew`, apertura | todos |
| `ventas_por_fecha` (diaria) | neto/bruto/iva, documentos, comensales, unidades, semana_iso, día | evolución, día de semana, semana, ticket |
| `ventas_por_hora` | hora, neto (docs/franja) | análisis por hora / horas pico |
| `ventas_por_producto` (+`catalogo_productos`) | producto, categoría, unidades, bruto/neto, TOP/BOTTOM | top/bottom, categorías, Pareto |
| `metas_operativas` | metas comercial/operativa (mes/sem/día), `meta_nomina=0.28`, `meta_renta=0.08` | cumplimiento, GAP, semáforos |
| `costos_sucursal` | renta, nómina, labor%, renta% | estructura de costos |
| `resumen_mensual_sucursal` | cierre mensual completo | usar para el mes cuando el diario está parcial; capítulo del mes |

**Reglas de datos** (ver `reportRules.md §1`): neto obligatorio (derivar si falta); mes parcial → usar `resumen_mensual_sucursal`; sin categoría → homologar o omitir categoría; sucursal nueva → solo capítulo del mes; España → incluir Urquijo.

### 2.3 Estructura del `reportPayload` (entregado al motor)

Forma completa en `reportSchema.json → payloadSchema`; ejemplo real en `reportPayload.example.json`. Bloques:

```
reportPayload = {
  _meta,            // spec, reportType, dataProvenance (real vs illustrative)
  branding,         // company, url, logoRef, brandTitle, tagline
  filters,          // reportType, country, brand, storeIds, includeUrquijo
  dateRange,        // from, to, label, partialMonths[], granularity, monthChapterMonth?
  config,           // currency, locale, showBrutoNeto, maxConclusionBullets, rounding
  stores[],         // Store: id, name, brand, country, isNew, profile
  consolidated {    // agregado de la red (o sucursal única)
    kpis, monthly[], weekday[], weekly[], topProducts[], bottomProducts[], categories[], paretoInfo
  },
  byStore { storeId: { monthly[], kpiSet, products[], hours[] } },
  ranking { byNeto[], byGrowth?, byCumplimiento?, ... },
  metas[],          // Meta por sucursal
  costs[],          // Cost por sucursal (renta/nómina/labor)
  comparatives[],   // deltas periodo vs anterior (semanal ejecutivo / mensual)
  monthChapter?     // solo semestral: { month, byStore[](4 suc incl. nuevas), hours[] }
}
```

**Contrato de tipos y unidades:** todo importe es `number` en `config.currency`, con par (bruto, neto). Porcentajes en `number` (0–100, salvo cumplimiento que puede superar 100). Fechas ISO-8601. El motor **no** vuelve a consultar Supabase: todo lo que necesita está en `reportPayload`.

---

## 3. OUTPUT

`renderReport(reportPayload)` devuelve un **ReportDocument**: un árbol estructurado, agnóstico de formato, que un renderer (PDF/otro) materializa. NO es HTML/PDF; es la representación intermedia.

### 3.1 Estructura del ReportDocument

```
ReportDocument = {
  meta {
    reportType, brand, country, currency,
    periodLabel, generatedAt, storeCount,
    validation { passed: bool, checklist: [{ id, passed, note }] }
  },
  cover {                          // ver renderer §1
    logoRef, brandTitle, reportTypeLabel, periodLabel,
    descSubtitle, metadata: [{ label, value }], tagline
  },
  toc: [{ number, title, level }], // ver renderer §2
  sections: [ Section, ... ],      // en orden final (contador global)
  closing { methodologyText }      // franja de cierre
}
```

### 3.2 Estructura de una Section

```
Section = {
  number,            // int (los divisores de PARTE => number = null)
  id,                // enum(sectionId)
  title,             // string
  partDivider?,      // { title } si abre una PARTE (semestral)
  blocks: [ Block, ... ]   // en orden de render
}
```

### 3.3 Tipos de Block (unión discriminada por `type`)

```
Block =
  | { type:"kpi_cards", cards:[{ value, label }] }
  | { type:"comment_box", text }
  | { type:"bullets", items:[ string ] }         // string puede incluir marcas ↑↓→/● y <b>…</b>
  | { type:"h1", text }
  | { type:"caption", text }
  | { type:"data_table", tableId, header:[…], rows:[[cell,…]], colWidths:[…], aligns:[…], highlightRowIndex? }
      // cell = { text, color?, trend? }  (trend => sufijo ↑↓→ coloreado)
  | { type:"chart", chartType, data:{ series, labels, options }, caption }
  | { type:"rule", color:"GOLD", weight }
  | { type:"spacer", size }
```

- **Cada `chart`** trae los datos ya listos para graficar (no requiere recomputar): `series`, `labels`, `options` (colores, refLine, annotations) según `reportSchema → charts[chartType]`.
- **Cada `data_table`** trae celdas resueltas (texto + color/tendencia), no fórmulas.
- **Textos** ya redactados (plantillas resueltas con valores dinámicos).

### 3.4 Garantías del OUTPUT

1. **Determinista:** mismo `reportPayload` ⇒ mismo `ReportDocument` (byte-equivalente en el árbol).
2. **Auto-contenido:** el renderer final no necesita datos externos ni decisiones; todo (orden, textos, colores, números) está resuelto.
3. **Validado:** `meta.validation` refleja el checklist de `reportRules.md §14`; si `passed=false`, lista qué falló.
4. **Trazable:** cada `Section` referencia su `id` del schema; cada `chart`/`data_table` su `chartType`/`tableId`.

---

## 4. Errores y casos límite

| Situación | Comportamiento |
|---|---|
| Falta `venta_neta` y `venta_bruta` | Error de validación de payload: `MISSING_SALES`. No se genera reporte. |
| Sin meta para una sucursal | Cumplimiento = "Sin meta", estado `SIN_META`; se excluye del promedio (ver reglas §7). |
| Sin `ventas_por_hora` | Se oculta la sección de horas (opcional). |
| Sin categoría en productos | Se omite análisis por categoría; Top/Bottom siguen por producto. |
| Mes de cierre parcial | Se usa `resumen_mensual_sucursal`; se marca `*`; se excluye de mejor/peor y crecimiento. |
| Sucursal nueva sin histórico | Excluida del cuerpo semestral; incluida en `monthChapter`. |
| `stores = "ALL"` sin sucursales activas | Error `NO_STORES`. |
| País España | `includeUrquijo` forzado a true; si Urquijo falta en datos ⇒ warning `URQUIJO_EXPECTED`. |
| Datos financieros de utilidad/ROAS ausentes | Normal: se añade `disclaimer_finanzas`; no es error. |

---

## 5. Ejemplo de invocación (conceptual) + salida esperada

**INPUT:**
```
generateExecutiveReport({
  brand: "MIXTO",
  country: "Mexico",
  stores: "ALL",
  dateRange: { from:"2026-01-01", to:"2026-06-30", granularity:"semester", monthChapterMonth:6 },
  reportType: "semestral_consolidado"
})
```

**payload construido:** ver `reportPayload.example.json` (datos reales de este caso).

**OUTPUT (resumen del ReportDocument):**
- `meta.periodLabel = "Enero – Junio 2026"`, `storeCount = 4`, `validation.passed = true`.
- `cover.brandTitle = "MÉXICO · SANTA GLORIA Y ALLÔ MON COCO"`.
- `sections`: PARTE A (1 Resumen semestral → 7 Productos y categorías), PARTE B (8 Panorama junio → 12 Validación), PARTE C (13 Conclusiones, 14 Plan H2).
- KPIs de portada/resumen: neto ≈ 17,553,229; ticket promedio derivado; participación líder ≈ 49% (AMC).
- `monthChapter`: 4 sucursales (incluida SG Altabrisa), con cumplimiento comercial vs operativa, renta% y labor cost.
- `closing.methodologyText`: neto=referencia + alcance (3 con histórico; Altabrisa en capítulo de junio) + disclaimer de utilidad/estados financieros/ROAS.

---

## 6. Criterio de aceptación

El motor de VS1 se considera conforme cuando, para el mismo `reportPayload`, produce un `ReportDocument` equivalente al de referencia en: **estructura, orden de secciones, numeración, KPIs y cifras, gráficas (tipo y datos), tablas (columnas y valores), semáforos/colores, textos dinámicos e insights/alertas/recomendaciones disparadas.** Ante cualquier discrepancia, **manda lo definido en `reportSchema.json` + `reportRules.md`**.
