// ─── summarySection.js — Resumen Ejecutivo (M3) ──────────────────────────────
//
// Reescrito en M3. Lee EXCLUSIVAMENTE de data._payload.
// NO accede a rawData, tablas HTML ni filtros del dashboard.
//
// Soporta:
//   • Un solo país (modo estándar)
//   • Varios países en modo operativo (KPIs financieros por moneda separados;
//     KPIs relativos —cumplimiento%, labor%, renta%— sí comparables)
//
// Spec: reportRenderer.md §4.1
// Orden obligatorio:
//   banner → kpi_cards → h1 "Lo esencial…" → bullets (3–5) →
//   h1 "Las 5 conclusiones…" → bullets (exactamente 5) → comment_box
//
// Reglas de negocio: reportRules.md §10, §6, §2, §3

window.ReportSections = window.ReportSections || {};

window.ReportSections.summary = async function (pdf, pw, ph, data, params, pageNum, totalPages) {

  const {
    COLOR, FONT, PAGE, TEXTS, MESES, THRESHOLD,
    fmtCurrency, fmtPct, fmtNumber,
    colorMeta, colorRenta, colorLabor, colorVariation,
  } = window.RC;
  const CU = window.ChartUtils;

  // ── Fuente de datos: exclusivamente el payload ────────────────────────────────
  const payload = data?._payload;
  if (!payload) {
    CU.pageBackground(pdf, pw, ph);
    CU.text(pdf, "Resumen Ejecutivo — Payload no disponible.", PAGE.ml, 40, {
      size: 11, color: COLOR.NEG, bold: true,
    });
    return;
  }

  const { byCountry, consolidated, byStore, ranking, metas, costs, _raw, dateRange } = payload;

  // ── Helpers locales ───────────────────────────────────────────────────────────
  function parseN(v) { return parseFloat(v) || 0; }

  function safeDiv(a, b) { return b && b !== 0 ? a / b : null; }

  function fmtNetoCompact(neto, symbol) {
    if (neto === null || neto === undefined) return "—";
    const sym = symbol || "$";
    if (neto >= 1_000_000) return `${sym}${(neto / 1_000_000).toFixed(2)}M`;
    if (neto >= 1_000)     return `${sym}${(neto / 1_000).toFixed(1)}K`;
    return `${sym}${neto.toFixed(0)}`;
  }

  function varColor(delta) {
    if (delta === null || delta === undefined) return COLOR.MUTED;
    return parseFloat(delta) >= 0 ? COLOR.POS : COLOR.NEG;
  }

  // ── Contexto del reporte ──────────────────────────────────────────────────────
  const mesLabel    = MESES[(params.mes || 1) - 1] || "";
  const periodoStr  = `${mesLabel} ${params.anio}`;
  const countryKeys = Object.keys(byCountry || {});
  const isMulti     = countryKeys.length > 1;

  // País / bloque principal — si hay varios, usa el primer país de countries[]
  const primaryKey  = params.countries?.[0] || countryKeys[0] || "";
  const primary     = byCountry[primaryKey] || byCountry[countryKeys[0]] || {};
  const primKpis    = primary.consolidated?.kpis || consolidated?.kpis || {};
  const primSymbol  = primary.symbol || "$";

  // Datos del mes anterior (desde _raw)
  const kpis_previo = _raw?.kpis_previo || [];

  // Variación de ventas vs mes anterior — calculada por país
  function countryVarVentas(block) {
    const neto    = block?.consolidated?.kpis?.neto || 0;
    const storeIds= new Set((block?.stores || []).map(s => s.name));
    const prevNeto= kpis_previo
      .filter(r => storeIds.has(r.sucursal))
      .reduce((acc, r) => acc + parseN(r.venta_neta), 0);
    return prevNeto > 0 ? ((neto - prevNeto) / prevNeto) * 100 : null;
  }

  // ── Layout ────────────────────────────────────────────────────────────────────
  const ml  = PAGE.ml;
  const mr  = pw - PAGE.mr;
  const col = PAGE.col;

  CU.pageBackground(pdf, pw, ph);

  // ── BANNER de sección ─────────────────────────────────────────────────────────
  // Sección 1 en el orden canónico del reporte mensual.
  let y = PAGE.mt;
  y = CU.sectionBanner(pdf, 1, "Resumen Ejecutivo", ml, y, col);
  y += 3;

  // ─────────────────────────────────────────────────────────────────────────────
  // KPI CARDS
  // Un país  → 5 tarjetas en una fila (venta neta, venta bruta, tickets, ticket
  //            promedio, cumplimiento o nº sucursales).
  // Varios  → una fila de 4 tarjetas por país (financieras en su moneda) +
  //            tabla comparativa de KPIs relativos adimensionales.
  // ─────────────────────────────────────────────────────────────────────────────

  if (!isMulti) {
    // ── Modo single-country ──────────────────────────────────────────────────
    const varV    = countryVarVentas(primary);
    const cumpl   = primKpis.cumplimiento;
    const metaSum = (metas || []).reduce((acc, m) => acc + parseN(m.metaOperativa), 0);

    const cards = [
      {
        label:      "Venta Neta",
        value:      fmtNetoCompact(primKpis.neto, primSymbol),
        sub:        varV !== null
                      ? `${varV >= 0 ? "+" : ""}${fmtPct(varV)} vs mes ant.`
                      : "Sin dato anterior",
        valueColor: varV !== null ? varColor(varV) : COLOR.PRIMARY,
      },
      {
        label:      "Venta Bruta",
        value:      fmtNetoCompact(primKpis.bruto, primSymbol),
        sub:        `con IVA`,
        valueColor: COLOR.PRIMARY,
      },
      {
        label:      "Tickets",
        value:      primKpis.documentos ? fmtNumber(primKpis.documentos) : "—",
        sub:        "transacciones",
        valueColor: COLOR.PRIMARY,
      },
      {
        label:      "Ticket Promedio",
        value:      primKpis.ticketPromedio
                      ? fmtCurrency(primKpis.ticketPromedio, primSymbol)
                      : "—",
        sub:        "por transacción",
        valueColor: COLOR.PRIMARY,
      },
      {
        label:      cumpl !== null ? "Cumplimiento" : "Sucursales",
        value:      cumpl !== null ? fmtPct(cumpl) : String(primKpis.storesCount || "—"),
        sub:        cumpl !== null
                      ? (metaSum > 0 ? `Meta: ${fmtNetoCompact(metaSum, primSymbol)}` : "Meta registrada")
                      : "en el reporte",
        valueColor: cumpl !== null ? colorMeta(cumpl) : COLOR.MID,
      },
    ];

    y = CU.kpiCards(pdf, cards, ml, y, col);

    // Barra de cumplimiento
    if (cumpl !== null) {
      CU.text(pdf, "Cumplimiento de meta operativa", ml, y + 1.5, {
        size: 6.5, color: COLOR.MUTED,
      });
      CU.text(pdf, fmtPct(cumpl), mr, y + 1.5, {
        size: 6.5, color: colorMeta(cumpl), align: "right", bold: true,
      });
      CU.progressBar(pdf, ml, y + 3.5, col, 3.5, cumpl, colorMeta(cumpl));
      y += 11;
    }

  } else {
    // ── Modo multi-country ───────────────────────────────────────────────────
    // Un bloque por país con KPIs en su propia moneda
    for (const cKey of countryKeys) {
      const block    = byCountry[cKey] || {};
      const bKpis    = block.consolidated?.kpis || {};
      const symbol   = block.symbol || "$";
      const currency = block.currency || "?";
      const varV     = countryVarVentas(block);
      const cumpl    = bKpis.cumplimiento;

      // Mini-encabezado de país
      CU.fillRect(pdf, ml, y, col, 6, COLOR.PALE);
      CU.text(pdf, `${cKey.toUpperCase()}  ·  ${currency}`, ml + 3, y + 4, {
        size: 7, color: COLOR.PRIMARY, bold: true,
      });
      y += 8;

      const cards = [
        {
          label:      "Venta Neta",
          value:      fmtNetoCompact(bKpis.neto, symbol),
          sub:        varV !== null ? `${varV >= 0 ? "+" : ""}${fmtPct(varV)} vs mes ant.` : "Sin dato anterior",
          valueColor: varV !== null ? varColor(varV) : COLOR.PRIMARY,
        },
        {
          label:      "Tickets",
          value:      bKpis.documentos ? fmtNumber(bKpis.documentos) : "—",
          sub:        "transacciones",
          valueColor: COLOR.PRIMARY,
        },
        {
          label:      "Ticket Promedio",
          value:      bKpis.ticketPromedio ? fmtCurrency(bKpis.ticketPromedio, symbol) : "—",
          sub:        "por transacción",
          valueColor: COLOR.PRIMARY,
        },
        {
          label:      cumpl !== null ? "Cumplimiento" : "Sucursales",
          value:      cumpl !== null ? fmtPct(cumpl) : String(bKpis.storesCount || "—"),
          sub:        cumpl !== null
                        ? (cumpl >= 100 ? "Meta superada" : cumpl >= 90 ? "En rango" : "Por debajo")
                        : "en el reporte",
          valueColor: cumpl !== null ? colorMeta(cumpl) : COLOR.MID,
        },
      ];

      y = CU.kpiCards(pdf, cards, ml, y, col);
      y += 3;
    }

    // Tabla comparativa de KPIs relativos (adimensionales — comparables entre países)
    const costsData = costs || [];
    if (costsData.length) {
      y += 2;
      CU.text(pdf, "COMPARATIVA — KPIs RELATIVOS (adimensionales)", ml, y, {
        size: 6, color: COLOR.MUTED, bold: true,
      });
      y += 3;

      const tHeaders = [
        { label: "País / Cobertura", w: 46, align: "left" },
        { label: "Cumpl. %",   w: 28 },
        { label: "Labor Cost", w: 28 },
        { label: "Renta/V %",  w: 28 },
        { label: "Ticket prom.", w: 40 },
      ];
      const tTotalW = tHeaders.reduce((a, h) => a + h.w, 0);
      tHeaders[0].w += col - tTotalW;

      const tRows = countryKeys.map(cKey => {
        const block    = byCountry[cKey] || {};
        const bKpis    = block.consolidated?.kpis || {};
        const symbol   = block.symbol || "$";
        const storeIds = new Set((block.stores || []).map(s => s.storeId));
        const blockCosts = costsData.filter(c => storeIds.has(c.storeId));
        const n = blockCosts.length || 1;

        const avgLabor = blockCosts.reduce((acc, c) => acc + parseN(c.laborCostPct), 0) / n;
        const avgRenta = blockCosts.reduce((acc, c) => acc + parseN(c.rentaPct), 0) / n;

        return [
          cKey,
          bKpis.cumplimiento !== null && bKpis.cumplimiento !== undefined
            ? fmtPct(bKpis.cumplimiento) : "Sin meta",
          blockCosts.length ? fmtPct(avgLabor) : "—",
          blockCosts.length ? fmtPct(avgRenta) : "—",
          bKpis.ticketPromedio ? fmtCurrency(bKpis.ticketPromedio, symbol) : "—",
        ];
      });

      y = CU.dataTable(pdf, tHeaders, tRows, ml, y, { rowH: 6 });
      y += 4;
    }
  }

  y += 5;

  // ─────────────────────────────────────────────────────────────────────────────
  // h1: LO ESENCIAL DEL PERIODO
  // Bullets 3–5 con los hallazgos más importantes, cada uno sustentado en un dato.
  // ─────────────────────────────────────────────────────────────────────────────
  y = CU.h1(pdf, "Lo esencial del periodo", ml, y);

  const esencial = _buildEsencial(payload, primaryKey, countryKeys, isMulti, kpis_previo);

  y = _renderBullets(pdf, esencial, ml, y, col, COLOR, FONT);

  y += 5;

  // ─────────────────────────────────────────────────────────────────────────────
  // h1: LAS 5 CONCLUSIONES DEL PERIODO
  // Exactamente 5 bullets (reportRules.md §10):
  //   hallazgo cuantificado, líder, rezagada, costos, prioridad.
  // ─────────────────────────────────────────────────────────────────────────────
  y = CU.h1(pdf, "Las 5 conclusiones del periodo", ml, y);

  const conclusiones = _buildConclusiones(payload, primaryKey, countryKeys, isMulti, kpis_previo, metas);

  // Rellenar hasta exactamente 5 si algún dato no estaba disponible
  while (conclusiones.length < 5) {
    conclusiones.push({ tipo: "neutro", texto: "Sin información adicional disponible para este periodo." });
  }
  const cinco = conclusiones.slice(0, 5);

  y = _renderConclusiones(pdf, cinco, ml, y, col, COLOR, FONT);

  y += 5;

  // ─────────────────────────────────────────────────────────────────────────────
  // COMMENT BOX — alcance, disclaimer neto, nota multi-moneda, disclaimer finanzas
  // Spec: §4.1 "comment_box fijo"
  // ─────────────────────────────────────────────────────────────────────────────
  const storeNames = (payload.stores || []).map(s => s.name).join(", ");

  const partialNote = dateRange?.partialMonths?.length
    ? " Mes en curso — cifras parciales hasta la fecha de generación del reporte."
    : "";

  const multiNote = isMulti
    ? ` Cifras financieras expresadas en la moneda local de cada país (${
        countryKeys.map(k => `${k}: ${byCountry[k]?.currency || "?"}`).join(", ")
      }); no se consolidan entre países en modo operativo.`
    : "";

  const commentText =
    `${TEXTS.fixed.disclaimer_neto} ` +
    `Alcance: ${storeNames || "Sucursales no disponibles"}.` +
    `${partialNote}${multiNote} ` +
    `${TEXTS.fixed.disclaimer_finanzas}`;

  CU.commentBox(pdf, commentText, ml, y, col);
};

// ─── Helpers de contenido (internos al módulo) ────────────────────────────────

// Genera bullets de "Lo esencial" — 3 a 5 hallazgos clave sustentados en datos.
function _buildEsencial(payload, primaryKey, countryKeys, isMulti, kpis_previo) {
  const { byCountry, consolidated, metas, costs } = payload;
  const bullets = [];
  function parseN(v) { return parseFloat(v) || 0; }

  const primary  = byCountry[primaryKey] || byCountry[countryKeys[0]] || {};
  const primKpis = primary.consolidated?.kpis || consolidated?.kpis || {};

  // 1. Variación de ventas vs mes anterior
  const storeIds  = new Set((primary.stores || []).map(s => s.name));
  const prevNeto  = (kpis_previo || [])
    .filter(r => storeIds.has(r.sucursal))
    .reduce((acc, r) => acc + parseN(r.venta_neta), 0);
  const varVentas = prevNeto > 0
    ? ((primKpis.neto - prevNeto) / prevNeto) * 100
    : null;

  if (varVentas !== null) {
    const tipo  = varVentas >= 5 ? "positivo" : varVentas <= -5 ? "alerta" : "neutro";
    const verb  = varVentas >= 0 ? "crecieron" : "disminuyeron";
    const signo = varVentas >= 0 ? "+" : "";
    bullets.push({
      tipo,
      texto: `Las ventas ${verb} ${signo}${parseFloat(varVentas).toFixed(1)}% respecto al mes anterior.`,
    });
  }

  // 2. Concentración del fin de semana
  const weekday = primary.consolidated?.weekday || consolidated?.weekday || [];
  if (weekday.length) {
    const FSD       = ["Viernes", "Sábado", "Domingo"];
    const totalWkd  = weekday.reduce((acc, d) => acc + d.neto, 0);
    const netoFSD   = weekday.filter(d => FSD.includes(d.weekday)).reduce((acc, d) => acc + d.neto, 0);
    const pctFSD    = totalWkd > 0 ? (netoFSD / totalWkd) * 100 : 0;
    const sortedWkd = [...weekday].sort((a, b) => b.neto - a.neto);
    const mejorDia  = sortedWkd[0]?.weekday || "—";
    const peorDia   = sortedWkd[sortedWkd.length - 1]?.weekday || "—";
    bullets.push({
      tipo:  "neutro",
      texto: `${mejorDia} es el día de mayor venta y ${peorDia} el de menor. ` +
             `El fin de semana (vie–dom) concentra el ${pctFSD.toFixed(0)}% de la venta neta.`,
    });
  }

  // 3. Cumplimiento de meta (si hay datos)
  const cumpl = primKpis.cumplimiento;
  if (cumpl !== null && cumpl !== undefined) {
    const storesByStore  = primary.byStore || {};
    const totalConMeta   = (metas || []).filter(m => m.metaOperativa).length;
    const enVerde        = Object.values(storesByStore)
      .filter(b => (b.kpiSet?.cumplimientoOperativaPct || 0) >= 100).length;

    const tipo = cumpl >= 100 ? "positivo" : cumpl >= 90 ? "neutro" : "alerta";
    bullets.push({
      tipo,
      texto: `Cumplimiento de meta operativa: ${parseFloat(cumpl).toFixed(1)}%. ` +
             `${enVerde} de ${totalConMeta || Object.keys(storesByStore).length} sucursal(es) en verde.`,
    });
  }

  // 4. Labor cost y renta
  const costsData = costs || [];
  if (costsData.length) {
    const avgLabor  = costsData.reduce((a, c) => a + parseN(c.laborCostPct), 0) / costsData.length;
    const altasLab  = costsData.filter(c => parseN(c.laborCostPct) > 28);
    const avgRenta  = costsData.reduce((a, c) => a + parseN(c.rentaPct), 0) / costsData.length;
    const altasRent = costsData.filter(c => parseN(c.rentaPct) >= 15);
    const tipo      = (altasLab.length || altasRent.length) ? "alerta" : "positivo";

    let texto = `Labor cost promedio: ${avgLabor.toFixed(1)}%; renta/ventas promedio: ${avgRenta.toFixed(1)}%.`;
    if (altasLab.length) {
      texto += ` Labor cost > 28% en ${altasLab.length} sucursal${altasLab.length > 1 ? "es" : ""}.`;
    }
    if (altasRent.length) {
      texto += ` Renta ≥ 15% en ${altasRent.length} sucursal${altasRent.length > 1 ? "es" : ""}.`;
    }
    bullets.push({ tipo, texto });
  }

  // 5. Producto líder y Pareto
  const topProds = primary.consolidated?.topProducts || consolidated?.topProducts || [];
  const paretoN  = primary.consolidated?.paretoInfo?.paretoN || consolidated?.paretoInfo?.paretoN;
  if (topProds.length) {
    bullets.push({
      tipo:  "neutro",
      texto: paretoN
        ? `Producto líder: "${topProds[0].name}". El 80% de la venta neta se concentra en ${paretoN} producto${paretoN !== 1 ? "s" : ""}.`
        : `Producto líder del periodo: "${topProds[0].name}".`,
    });
  }

  return bullets.slice(0, 5);
}

// Genera exactamente 5 conclusiones ejecutivas (reportRules.md §10).
function _buildConclusiones(payload, primaryKey, countryKeys, isMulti, kpis_previo, metas) {
  const { byCountry, consolidated, ranking, costs } = payload;
  const conclusiones = [];
  function parseN(v) { return parseFloat(v) || 0; }

  const primary    = byCountry[primaryKey] || byCountry[countryKeys[0]] || {};
  const primKpis   = primary.consolidated?.kpis || consolidated?.kpis || {};
  const primSymbol = primary.symbol || "$";
  const rankArr    = ranking?.byNeto || primary.ranking?.byNeto || [];
  const costsData  = costs || [];

  // ── C1: Hallazgo principal cuantificado (ventas + variación + cumplimiento) ──
  const storeIds = new Set((primary.stores || []).map(s => s.name));
  const prevNeto = (kpis_previo || [])
    .filter(r => storeIds.has(r.sucursal))
    .reduce((acc, r) => acc + parseN(r.venta_neta), 0);
  const varV     = prevNeto > 0 ? ((primKpis.neto - prevNeto) / prevNeto) * 100 : null;
  const cumpl    = primKpis.cumplimiento;

  const neto    = primKpis.neto || 0;
  const netoStr = neto >= 1e6
    ? `${primSymbol}${(neto / 1e6).toFixed(2)}M`
    : `${primSymbol}${neto.toFixed(0)}`;

  let c1;
  if (varV !== null && cumpl !== null) {
    const signo = varV >= 0 ? "+" : "";
    c1 = {
      tipo:  varV >= 0 && cumpl >= 90 ? "positivo" : varV < -5 || cumpl < 70 ? "alerta" : "neutro",
      texto: `Ventas netas del periodo: ${netoStr} ` +
             `(${signo}${parseFloat(varV).toFixed(1)}% vs mes ant.), ` +
             `con cumplimiento de meta del ${parseFloat(cumpl).toFixed(1)}%.`,
    };
  } else if (varV !== null) {
    const signo = varV >= 0 ? "+" : "";
    c1 = {
      tipo:  varV >= 0 ? "positivo" : "alerta",
      texto: `Ventas netas del periodo: ${netoStr} ` +
             `(${signo}${parseFloat(varV).toFixed(1)}% vs mes ant.). Sin meta registrada.`,
    };
  } else {
    c1 = {
      tipo:  "neutro",
      texto: `Ventas netas del periodo: ${netoStr}. Sin dato del mes anterior para comparar.`,
    };
  }
  conclusiones.push(c1);

  // ── C2: Sucursal líder y concentración (reportRules.md §5) ────────────────
  const lider = rankArr[0];
  if (lider) {
    const part      = lider.partPct;
    const esConcentrado = part > THRESHOLD.concentration;
    conclusiones.push({
      tipo:  esConcentrado ? "alerta" : "positivo",
      texto: `${lider.name} lidera la red con el ${parseFloat(part).toFixed(1)}% de participación` +
             (esConcentrado
               ? `. Riesgo de concentración: el consolidado depende de una sola sucursal.`
               : `.`),
    });
  } else {
    conclusiones.push({ tipo: "neutro", texto: "Sin datos de ranking disponibles para el periodo." });
  }

  // ── C3: Sucursal de atención / mayor brecha (reportRules.md §5) ───────────
  const rezagada = rankArr.length > 1 ? rankArr[rankArr.length - 1] : null;
  if (rezagada) {
    const storesByStore = primary.byStore || {};
    const rezBlock      = Object.values(storesByStore).find(b => b.kpiSet?.name === rezagada.name);
    const cumplRez      = rezBlock?.kpiSet?.cumplimientoOperativaPct;
    const estadoRez     = rezBlock?.kpiSet?.estadoMetaOperativa || "SIN_META";
    const cumplStr      = cumplRez !== null && cumplRez !== undefined
                            ? `, cumplimiento ${parseFloat(cumplRez).toFixed(1)}%`
                            : "";

    conclusiones.push({
      tipo:  estadoRez === "ROJO" ? "alerta" : "neutro",
      texto: `${rezagada.name} registra el menor volumen de la red${cumplStr}. ` +
             `Priorizar revisión operativa y análisis de tráfico en horarios valle.`,
    });
  } else {
    conclusiones.push({ tipo: "neutro", texto: "Red de una sola sucursal — análisis de brecha no aplica." });
  }

  // ── C4: Costos operativos — labor cost + renta (reportRules.md §3) ─────────
  if (costsData.length) {
    const avgLabor  = costsData.reduce((a, c) => a + parseN(c.laborCostPct), 0) / costsData.length;
    const avgRenta  = costsData.reduce((a, c) => a + parseN(c.rentaPct), 0) / costsData.length;
    const altasLab  = costsData.filter(c => parseN(c.laborCostPct) > 28);
    const altasRent = costsData.filter(c => parseN(c.rentaPct) >= 15);
    const tipo      = (altasLab.length || altasRent.length) ? "alerta" : "positivo";

    let texto = `Labor cost promedio: ${avgLabor.toFixed(1)}% (meta ≤28%); ` +
                `renta/ventas promedio: ${avgRenta.toFixed(1)}% (objetivo <15%).`;
    if (altasLab.length) {
      texto += ` Ajuste urgente en: ${altasLab.map(c => c.storeId.replace(/_/g, " ")).join(", ")}.`;
    }
    if (altasRent.length) {
      texto += ` Revisar contratos de renta en: ${altasRent.map(c => c.storeId.replace(/_/g, " ")).join(", ")}.`;
    }
    conclusiones.push({ tipo, texto });
  } else {
    conclusiones.push({ tipo: "neutro", texto: "Datos de costos operativos no disponibles para el periodo." });
  }

  // ── C5: Prioridad / acción inmediata (reportRules.md §11) ─────────────────
  const altasLab5 = costsData.filter(c => parseN(c.laborCostPct) > 28);
  const cumplRojo = Object.values(primary.byStore || {})
    .filter(b => b.kpiSet?.estadoMetaOperativa === "ROJO");
  const topProd   = (primary.consolidated?.topProducts || consolidated?.topProducts || [])[0];

  let c5texto;
  if (altasLab5.length && cumplRojo.length) {
    c5texto = `Dos frentes de atención: (1) ajuste de planilla en ${altasLab5.length} ` +
              `sucursal${altasLab5.length > 1 ? "es" : ""} con labor cost > 28%; ` +
              `(2) plan de recuperación de tráfico en ${cumplRojo.length} ` +
              `sucursal${cumplRojo.length > 1 ? "es" : ""} en rojo de cumplimiento.`;
  } else if (altasLab5.length) {
    c5texto = `Acción prioritaria: ajuste de planilla en ` +
              `${altasLab5.length} sucursal${altasLab5.length > 1 ? "es" : ""} ` +
              `con labor cost > 28%. Revisar programación de turnos para la semana siguiente.`;
  } else if (cumplRojo.length) {
    c5texto = `Acción prioritaria: plan de recuperación de tráfico en ` +
              `${cumplRojo.length} sucursal${cumplRojo.length > 1 ? "es" : ""} ` +
              `en rojo de cumplimiento. Activar campañas en horarios valle.`;
  } else if (topProd) {
    c5texto = `Resultados estables. Aprovechar el impulso del producto líder ` +
              `"${topProd.name}" mediante combos y venta sugestiva para elevar ` +
              `el ticket promedio en sucursales por debajo del promedio de red.`;
  } else {
    c5texto = `Monitorear indicadores semanalmente. ` +
              `Priorizar sucursales con variación negativa respecto al mes anterior.`;
  }
  conclusiones.push({ tipo: altasLab5.length || cumplRojo.length ? "alerta" : "positivo", texto: c5texto });

  return conclusiones;
}

// Renderiza una lista de bullets (esencial). Retorna la y final.
function _renderBullets(pdf, bullets, ml, y, col, COLOR, FONT) {
  const dotX  = ml + 1.5;
  const textX = ml + 5.5;
  const textW = col - 5.5;

  bullets.forEach(bullet => {
    const color = bullet.tipo === "alerta"   ? COLOR.NEG
                : bullet.tipo === "positivo" ? COLOR.POS
                : COLOR.INK;

    pdf.setFont(FONT.family, "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.text("▪", dotX, y);

    pdf.setFont(FONT.family, "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(COLOR.INK[0], COLOR.INK[1], COLOR.INK[2]);
    const lines = pdf.splitTextToSize(bullet.texto, textW);
    pdf.text(lines.slice(0, 3), textX, y);
    y += Math.max(6, lines.slice(0, 3).length * 4.5 + 1);
  });

  return y;
}

// Renderiza las 5 conclusiones numeradas. Retorna la y final.
function _renderConclusiones(pdf, cinco, ml, y, col, COLOR, FONT) {
  const numberW  = 7;
  const numberH  = 5.5;
  const textX    = ml + numberW + 3;
  const textW    = col - numberW - 4;

  cinco.forEach((c, idx) => {
    const color = c.tipo === "alerta"   ? COLOR.NEG
                : c.tipo === "positivo" ? COLOR.POS
                : COLOR.INK;

    // Cuadro numerado en PRIMARY
    pdf.setFillColor(COLOR.PRIMARY[0], COLOR.PRIMARY[1], COLOR.PRIMARY[2]);
    pdf.rect(ml, y - numberH + 1, numberW, numberH, "F");
    pdf.setFont(FONT.family, "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(COLOR.WHITE[0], COLOR.WHITE[1], COLOR.WHITE[2]);
    pdf.text(String(idx + 1), ml + numberW / 2, y - 0.5, { align: "center" });

    // Texto de la conclusión
    const lines = pdf.splitTextToSize(c.texto, textW);
    pdf.setFont(FONT.family, "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.text(lines.slice(0, 3), textX, y);

    y += Math.max(7.5, lines.slice(0, 3).length * 4.5 + 2);
  });

  return y;
}
