# reportRules.md — Reglas de negocio del Report Engine

Todas las reglas del motor. Los umbrales viven en `reportSchema.json → params.thresholds`; aquí se documentan con su semántica y su efecto. Regla marco: **cada texto interpretativo debe estar sustentado por un dato calculado del periodo; nunca genérico.**

---

## 1. Normalización de datos (antes de calcular)

1. **Neto = referencia.** Si un registro solo trae bruto: `neto = bruto / (1 + iva_pais)` (México 0.16, España 0.10). Siempre se conservan y muestran bruto y neto.
2. **Mes parcial.** Si el diario (`ventas_por_fecha`) no cubre el mes completo de cierre, ese mes se marca `partial=true` y su total se toma de `resumen_mensual_sucursal` (mes completo). Los meses previos se toman del diario.
   - Efecto: un mes `partial` se **excluye** del cálculo de "mejor/peor mes" y del "crecimiento".
3. **Homologación de producto.** Si `ventas_por_producto` no trae categoría, se busca en `catalogo_productos`. Si no existe categoría, se **omite** el análisis por categoría para esa marca (no se inventa).
4. **Sucursal nueva.** `stores[].isNew = true` y sin histórico ⇒ se **excluye del balance semestral/anual** y se analiza solo en el capítulo del mes.
5. **España — Urquijo.** En `country = Espana`, incluir SIEMPRE `SG Alameda de Urquijo` en todas las tablas, gráficas, rankings, KPIs y conclusiones.

---

## 2. Cálculos base (fórmulas)

| Métrica | Fórmula |
|---|---|
| Ticket promedio | `venta_neta / documentos` |
| Gasto por comensal | `venta_neta / comensales` |
| Participación | `neto_sucursal / neto_red * 100` |
| Variación % | `(actual - anterior) / anterior * 100` |
| Diferencia abs. | `actual - anterior` |
| **Cumplimiento** | `venta_neta / meta * 100` |
| GAP | `venta_neta - meta` |
| Renta/Ventas | `renta / venta_neta * 100` |
| Labor cost | `nomina / venta_neta * 100` |
| **Crecimiento del periodo** | `(neto_ultimo_mes_completo - neto_primer_mes) / neto_primer_mes * 100` |

- **Cumplimiento y crecimiento nunca usan el mes parcial** como extremo.
- Si `documentos = 0` ⇒ ticket promedio = `null` (no dividir por cero); la fila muestra "—".

---

## 3. Estados y semáforos

### 3.1 Estado de meta (`estadoMeta`)
- Si el payload trae `estado_meta`/`estado_meta_operativa`, **se usa ese**.
- Si no viene, se deriva del cumplimiento:
  - `VERDE` si `cumplimiento >= 100`
  - `AMARILLO` si `90 <= cumplimiento < 100`
  - `ROJO` si `cumplimiento < 90`
- `SIN_META` si no existe meta para la sucursal (ver §7).

### 3.2 Estado de nómina (labor)
- Usa `estado_nomina` del payload si viene.
- Si no: `VERDE` si `labor_cost <= 28`, `ROJO` si `> 28`.

### 3.3 Tendencia (flechas ↑↓→)
- `UP (↑, POS)` si mejora; `DOWN (↓, NEG)` si empeora; `FLAT (→, MUTED)` si `|Δ%| < 0.5`.
- **KPIs inversos** (mejoran a la baja): `renta_sobre_ventas`, `labor_cost`. Para ellos, una **disminución** es `UP`.

---

## 4. Reglas de color

| Elemento | Regla |
|---|---|
| Variación (barras divergentes, %, etiquetas) | verde `POS` si `>= 0`; rojo `NEG` si `< 0` |
| Barras de cumplimiento (chart) | `GOLD` si `>=90`; `MID` (azul) si `75–90`; `RED_SOFT` si `<75`; línea de meta 100% en `INK` discontinua |
| Barras de ventas por sucursal (semanal) | color por estado: `AMARILLO→GOLD`, `ROJO→MID` |
| Líneas por sucursal | color FIJO por sucursal (AMC=PRIMARY, La Isla=GOLD, Paseo=MID, Altabrisa=POS); las demás asignan de la paleta azul |
| Heatmap día | escala `PALE → PRIMARY` por intensidad de neto |
| Pareto | barras `PALE/MID`, curva `PRIMARY`, línea 80% `GOLD` |
| Costos | renta `PRIMARY`, labor `GOLD`, línea meta 28% `NEG` discontinua |
| Semáforo alerta | `● NEG` (rojo) / `● AMBER` (ámbar) |
| Serie principal / secundaria | `PRIMARY` / `MID`,`LIGHT`,`PALE` |

**Restricción estética:** en reportes editoriales tipo comité España (ámbar/dorado + carbón sobre greige) **no** usar acentos verdes; en reportes operativos sí (verde/rojo para variación).

---

## 5. Líder, rezagada y rankings

- **Sucursal líder** = mayor `venta_neta` del periodo. Se resalta en `PRIMARY` en el ranking.
- **Sucursal rezagada / de oportunidad** = menor `venta_neta` del periodo (o mayor caída, según el ranking).
- **Concentración (riesgo):** si `participacion_lider > 45%` ⇒ insight de riesgo de concentración.
- **Rankings del comité:** mayor venta, mayor crecimiento (`variacion_pct` vs periodo anterior), mayor cumplimiento, mejor ticket promedio, mayor documentos, mayor gasto/comensal, **mejor renta/ventas (menor %)**, **mejor labor cost (menor %)**.
- **Top 3 mejores** = mejores por venta/cumplimiento/resiliencia. **Top 3 oportunidad** = mayor caída, menor cumplimiento y mayor presión de costos.

---

## 6. Insights (cuándo aparece cada uno)

| Insight | Condición | Texto guía |
|---|---|---|
| Afluencia vs ticket | `Δventa < 0` y `Δticket >= -1%` | Problema de afluencia (tickets), no de gasto. Palanca = tráfico. |
| Concentración | `participacion_max > 45%` | Riesgo: la sucursal X aporta N%; mueve el consolidado. |
| Dos velocidades | hay AMC + SG en la red | AMC mañana/ticket alto; SG tarde-noche/ticket bajo. |
| Fin de semana | `%_fin_de_semana > 50%` | El fin de semana concentra la mayoría → palanca operativa. |
| Correlación ventas~documentos | `Δventa ≈ Δdocumentos` y ticket estable | Causa = tráfico. |
| Renta como semáforo | renta/ventas sube al caer ventas | Vigilar rentabilidad. |
| Cartera concentrada | 80% en ≤ N productos | Cola de baja rotación candidata a racionalización. |
| Meta no es alarma | ninguna llega a 100% | Metas exigentes = listón, no umbral conquistado. |

---

## 7. "Sin meta" y ocultamiento de secciones

- **Sin meta:** si una sucursal no tiene `meta` ⇒ su cumplimiento se muestra como **"Sin meta"** (no 0%), estado `SIN_META`, y se excluye del promedio de cumplimiento de la red.
- **Ocultar `cumplimiento_meta`:** si NINGUNA sucursal tiene meta.
- **Ocultar `top5_por_categoria` / `mix_pareto`(categorías):** si no hay categoría en los productos (p.ej. SG sin categoría).
- **Ocultar `analisis_por_hora` / `horas_pico`:** si no hay `ventas_por_hora`.
- **Ocultar `estructura_de_costos`:** si no hay `costos_sucursal` ni labor/renta en el resumen.
- **Ocultar `distribucion_importe_ticket`:** si no hay detalle de importe por ticket.
- **Ocultar `comparativo_historico`:** si no hay datos del año anterior.
- **`alertas` vacío:** mostrar "Sin alertas relevantes" en vez de tabla vacía.
- Regla general: una sección **opcional** sin datos suficientes se oculta; una **obligatoria** sin datos muestra la nota correspondiente ("Sin meta", "Datos no disponibles"), nunca una tabla/gráfica vacía.

---

## 8. Alertas (cuándo se dispara cada una)

Solo si el dato la dispara (nunca inventar). Cada alerta: `{sucursal, nivel(● RED/AMBER), mensaje}`.

| Alerta | Disparador | Nivel |
|---|---|---|
| No alcanza meta | `cumplimiento < 70` | RED si `<55`, AMBER si `55–70` |
| Caída fuerte de ventas | `variacion_ventas <= -10%` | RED |
| Descenso de documentos | `variacion_documentos <= -10%` | AMBER |
| Ticket en descenso | `variacion_ticket < 0` sostenida | AMBER |
| Labor cost elevado | `labor_cost > 28%` | AMBER |
| Renta/Ventas fuera de objetivo | `renta_sobre_ventas >= 15%` | AMBER |
| Sin ventas | `venta = 0` habiendo facturado el periodo anterior | RED (verificar de inmediato) |

Orden de la tabla: por severidad (RED antes que AMBER).

---

## 9. Oportunidades (cuándo aparece cada una)

| Oportunidad | Disparador |
|---|---|
| Captación en día/franja valle | día u hora de menor venta identificado |
| Subir ticket en tienda de oficina | ticket promedio bajo (zona oficinas) |
| Racionalizar cola | productos en cola de Pareto (fuera del 80%) |
| Recorrido de crecimiento | `cumplimiento_operativa < 100` |
| Transferir buenas prácticas | brecha grande líder vs rezagada |
| Preparar campañas del pico | estacionalidad favorable por delante (p.ej. pico otoño) |

---

## 10. Conclusiones (cómo se arman)

- **Longitud:** máx 10 bullets (comité); exactamente 5 en el resumen ejecutivo.
- **Deben responder:** qué debe conocer Dirección de inmediato, prioridades del próximo periodo, sucursales a seguir, decisiones a tomar.
- **Deben incluir:** hallazgo principal cuantificado, líder(es), sucursal(es) a seguir, producto/categoría líder, riesgos, oportunidades, próximos pasos.
- Cada bullet **sustentado en un dato** del periodo.

---

## 11. Recomendaciones (cuándo se agregan y cómo)

- **Se agregan** cuando existe una condición accionable: caída, incumplimiento, ticket bajo, costo alto, apertura reciente, cola de baja rotación.
- **Formato:** específicas por sucursal, medibles, ejecutables en el horizonte inmediato, **con KPI a monitorear**.
- **Organización por palanca:**
  - *Recuperar tráfico:* promos en horas valle (p.ej. 15–17h) en tiendas en caída; horario ampliado en zonas con demanda no cubierta; marketing local/alianzas; happy hour de verano.
  - *Elevar ticket:* combos café+bollería y venta sugestiva; menú desayuno a precio cerrado; fidelización empezando por tiendas en caída; redes con ofertas por tienda.
  - *Rentabilidad/costos:* plan de nómina para acercar labor cost a 28% (programación por franjas); revisar renta donde renta/ventas es alta; escalonar metas por madurez.
  - *Consolidación de aperturas:* objetivos desde el día 1; formación en venta sugestiva para subir ticket sobre umbral; seguimiento semanal reaccionando a caídas >5%; protocolo de apertura estandarizado.

---

## 12. Textos fijos vs dinámicos

- **Fijos:** títulos de sección, marca/encabezado, tagline, plantillas de caption, notas de metodología/parcialidad, disclaimers (neto=referencia; utilidad/estados financieros/ROAS requieren P&L/marketing), definiciones de franja horaria, insights de patrón (fin de semana; AMC mañana/SG tarde).
- **Dinámicos:** todas las cifras y %, nombres de sucursal/mes/producto/categoría, quién es mejor/peor/líder, signos y magnitudes de variación, conteo de semáforos, día fuerte/flojo, hora pico/valle, N de Pareto, estados.
- **Plantillas** con placeholders en `reportSchema → texts.templates`.
- **Estilo:** tercera persona, ejecutivo; nunca "la tabla muestra…"; directo a la interpretación de negocio.

---

## 13. Numeración, paginación y cierre

- **Numeración de secciones:** contador global secuencial; los **divisores de PARTE no consumen número**.
- **Paginación:** sin saltos forzados; agrupar banner+primer visual; mantener juntas tablas y (gráfica+caption); dejar fluir comentarios; espacio al inicio de cada bloque.
- **Cierre obligatorio:** regla dorada + caption de metodología.

---

## 14. Checklist de validación (debe cumplirse siempre)

1. Venta neta es la cifra principal; se muestran bruto y neto.
2. Encabezado marca izq + folio der; pie de página VACÍO.
3. Fuente Carlito; sin `▲▼` ni emojis a color; solo `↑↓→` y `●`.
4. Cada gráfica con caption; cada sección analítica con comment_box interpretativo (no descriptivo).
5. Mes/semana parcial marcado con `*`; crecimiento vs último mes completo.
6. Semáforos coherentes; alertas solo si el dato las dispara.
7. España incluye SG Alameda de Urquijo en todo.
8. Sin repetir información entre secciones (productos/categorías históricos no se repiten en el análisis mensual de España).
9. Notas de alcance cuando falten insumos (utilidad/estados financieros/ROAS).
10. Numeración secuencial; índice coherente con el cuerpo.
