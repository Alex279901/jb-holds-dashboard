// Página 3: Ventas — tendencia diaria + comparativo de sucursales.

window.ReportSections = window.ReportSections || {};

window.ReportSections.sales = async function (pdf, pw, ph, data, params, pageNum, totalPages) {
  const { COLOR, fmtCurrency, fmtPct, fmtNumber, colorMeta, MESES } = window.RC;
  const CU = window.ChartUtils;

  CU.pageBackground(pdf, pw, ph);
  CU.fillRect(pdf, 0, 0, 4, ph, COLOR.accent);

  const ml = window.RC.PAGE.ml;
  const mr = pw - window.RC.PAGE.mr;
  const col = window.RC.PAGE.col;
  const mesLabel = MESES[(params.mes || 1) - 1] || "";

  CU.text(pdf, "VENTAS DEL PERIODO", ml, 14, { size: 8, color: COLOR.accent, bold: true });
  CU.text(pdf, `${mesLabel} ${params.anio}`, mr, 14, { size: 7, color: COLOR.muted, align: "right" });
  CU.line(pdf, ml, 16, mr, 16, COLOR.border, 0.3);

  const { ventas_diarias, kpis, historico } = data;
  const sucursales = params.sucursales || [];

  // ── Gráfica de tendencia histórica ────────────────────────────────────────
  CU.sectionHeader(pdf, "Tendencia de Ventas — Últimos 6 meses", ml, 22, col);

  if (historico && historico.length) {
    // Construir datos por mes
    const mesesSet = [...new Set(historico.map((r) => r.mes))].sort();
    const mesesLabels = mesesSet.map((m) => {
      const d = new Date(m + "T00:00:00");
      return MESES[d.getMonth()].slice(0, 3);
    });

    // Serie consolidada (suma de todas las sucursales por mes)
    const ventasPorMes = mesesSet.map((mes) => {
      return historico
        .filter((r) => r.mes === mes)
        .reduce((acc, r) => acc + parseFloat(r.venta_neta || 0), 0);
    });

    CU.lineChart(
      pdf,
      mesesLabels,
      [{ label: "Ventas Netas", values: ventasPorMes, color: COLOR.accent }],
      ml, 25, col * 0.55, 42
    );

    // Mini-tarjetas de cambio mes a mes a la derecha
    if (ventasPorMes.length >= 2) {
      const varPct = ((ventasPorMes[ventasPorMes.length - 1] - ventasPorMes[ventasPorMes.length - 2]) / ventasPorMes[ventasPorMes.length - 2]) * 100;
      const best = Math.max(...ventasPorMes);
      const bestMes = mesesLabels[ventasPorMes.indexOf(best)];

      const rx = ml + col * 0.58;
      const ry = 25;
      const cw = col * 0.4;
      const ch = 18;

      CU.kpiCard(pdf, rx, ry, cw, ch, {
        label: "Variación vs Mes Anterior",
        value: `${varPct >= 0 ? "+" : ""}${fmtPct(varPct)}`,
        sub: `${mesesLabels[mesesLabels.length - 2]} → ${mesesLabels[mesesLabels.length - 1]}`,
        valueColor: varPct >= 0 ? COLOR.green : COLOR.red,
      });

      CU.kpiCard(pdf, rx, ry + ch + 4, cw, ch, {
        label: "Mejor Mes (6 meses)",
        value: fmtCurrency(best, "$"),
        sub: bestMes,
        valueColor: COLOR.gold,
      });
    }
  } else {
    CU.text(pdf, "Sin datos históricos disponibles para el periodo.", ml, 40, { size: 7, color: COLOR.dimmed });
  }

  // ── Comparativo de ventas por sucursal (barras) ────────────────────────────
  CU.sectionHeader(pdf, "Ventas por Sucursal — Mes Actual", ml, 74, col);

  if (kpis && kpis.length) {
    const sorted = [...kpis].sort((a, b) => parseFloat(b.venta_neta) - parseFloat(a.venta_neta));
    const barData = sorted.map((r) => ({
      label: r.sucursal.replace("SG ", ""),
      value: parseFloat(r.venta_neta || 0),
      color: COLOR.accent,
    }));

    CU.barChartH(pdf, barData, ml, 77, col * 0.55, barData.length * 11, { symbol: "$" });

    // Tabla compacta a la derecha
    const rx = ml + col * 0.58;
    const headers = [
      { label: "Sucursal", w: 50, align: "left" },
      { label: "Ventas", w: 36 },
      { label: "% Total", w: 24 },
    ];
    const total = sorted.reduce((acc, r) => acc + parseFloat(r.venta_neta || 0), 0);
    const rows = sorted.map((r) => {
      const v = parseFloat(r.venta_neta || 0);
      return [
        r.sucursal.replace("SG ", ""),
        fmtCurrency(v, "$"),
        fmtPct(total > 0 ? (v / total) * 100 : 0),
      ];
    });
    CU.dataTable(pdf, headers, rows, rx, 77, { rowH: 6.5 });
  } else {
    CU.text(pdf, "Sin datos de ventas para el periodo seleccionado.", ml, 85, { size: 7, color: COLOR.dimmed });
  }

  // ── Detalle diario (si hay pocos días, mostrar tabla) ─────────────────────
  if (ventas_diarias && ventas_diarias.length) {
    const diasAgrupados = {};
    ventas_diarias.forEach((r) => {
      if (!diasAgrupados[r["Fecha"]]) diasAgrupados[r["Fecha"]] = { fecha: r["Fecha"], venta: 0, docs: 0, meta: 0 };
      diasAgrupados[r["Fecha"]].venta += parseFloat(r["Venta Neta"] || 0);
      diasAgrupados[r["Fecha"]].docs += parseFloat(r["Documentos"] || 0);
      diasAgrupados[r["Fecha"]].meta += parseFloat(r["Meta"] || 0);
    });

    const dias = Object.values(diasAgrupados).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const topY = 140;

    if (dias.length > 0) {
      CU.sectionHeader(pdf, "Detalle Diario — Consolidado Sucursales", ml, topY, col);

      const sliced = dias.slice(0, 14); // Caben ~14 filas
      const headers = [
        { label: "Fecha", w: 28, align: "left" },
        { label: "Venta Neta", w: 38 },
        { label: "Docs", w: 22 },
        { label: "Meta", w: 34 },
        { label: "% Meta", w: 26 },
      ];
      const totalW = headers.reduce((a, h) => a + h.w, 0);
      const extraW = col - totalW;
      headers[headers.length - 1].w += extraW;

      const rows = sliced.map((d) => {
        const cumpl = d.meta > 0 ? (d.venta / d.meta) * 100 : null;
        return [
          d.fecha,
          fmtCurrency(d.venta, "$"),
          fmtNumber(d.docs),
          d.meta > 0 ? fmtCurrency(d.meta, "$") : "Sin meta",
          cumpl !== null ? fmtPct(cumpl) : "—",
        ];
      });

      CU.dataTable(pdf, headers, rows, ml, topY + 4, { rowH: 4.5, fontSize: 6 });

      if (dias.length > 14) {
        CU.text(pdf, `Mostrando 14 de ${dias.length} días del mes.`, ml, topY + 4 + 4.5 * (sliced.length + 1) + 3, { size: 5.5, color: COLOR.dimmed });
      }
    }
  }

  CU.pageFooter(pdf, pw, ph, pageNum, totalPages, `${params.marca || "Santa Gloria MX"} · ${mesLabel} ${params.anio}`);
};
