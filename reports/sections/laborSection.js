// Página 6: Labor Cost & Renta — semáforos, tabla semanal, insight.

window.ReportSections = window.ReportSections || {};

window.ReportSections.labor = async function (pdf, pw, ph, data, params, pageNum, totalPages) {
  const { COLOR, fmtCurrency, fmtPct, colorRenta, colorLabor, colorEstado, MESES } = window.RC;
  const CU = window.ChartUtils;
  const IE = window.InsightEngine;

  CU.pageBackground(pdf, pw, ph);
  CU.fillRect(pdf, 0, 0, 4, ph, COLOR.accent);

  const ml = window.RC.PAGE.ml;
  const mr = pw - window.RC.PAGE.mr;
  const col = window.RC.PAGE.col;
  const mesLabel = MESES[(params.mes || 1) - 1] || "";

  CU.text(pdf, "LABOR COST & RENTA", ml, 14, { size: 8, color: COLOR.accent, bold: true });
  CU.text(pdf, `${mesLabel} ${params.anio}`, mr, 14, { size: 7, color: COLOR.muted, align: "right" });
  CU.line(pdf, ml, 16, mr, 16, COLOR.border, 0.3);

  const { operativos, renta, labor_semanal } = data;

  // ── Semáforos por sucursal ────────────────────────────────────────────────
  CU.sectionHeader(pdf, "Semáforo Operativo por Sucursal", ml, 22, col);

  if (operativos && operativos.length) {
    const cw = col / Math.min(operativos.length, 4);
    const ch = 40;
    const cardY = 26;

    operativos.slice(0, 4).forEach((op, i) => {
      const cx = ml + i * cw;
      const laborColor = colorLabor(op.labor_cost_pct);
      const rentaColor = colorRenta(op.renta_pct);

      CU.fillRect(pdf, cx + 1, cardY, cw - 2, ch, COLOR.cardBg);

      // Nombre sucursal
      const shortName = (op.sucursal || "").replace("SG ", "");
      CU.text(pdf, shortName, cx + cw / 2, cardY + 6, { size: 7, color: COLOR.white, bold: true, align: "center" });

      // Labor cost
      CU.fillRect(pdf, cx + 4, cardY + 9, cw - 8, 12, [10, 16, 28]);
      CU.text(pdf, "Labor Cost", cx + cw / 2, cardY + 14, { size: 5.5, color: COLOR.muted, align: "center" });
      CU.text(pdf, fmtPct(op.labor_cost_pct), cx + cw / 2, cardY + 19, { size: 9, color: laborColor, bold: true, align: "center" });
      CU.fillRect(pdf, cx + 4, cardY + 20, cw - 8, 1.5, laborColor);

      // Renta
      CU.fillRect(pdf, cx + 4, cardY + 24, cw - 8, 12, [10, 16, 28]);
      CU.text(pdf, "Renta / Ventas", cx + cw / 2, cardY + 29, { size: 5.5, color: COLOR.muted, align: "center" });
      CU.text(pdf, fmtPct(op.renta_pct), cx + cw / 2, cardY + 34, { size: 9, color: rentaColor, bold: true, align: "center" });
      CU.fillRect(pdf, cx + 4, cardY + 35, cw - 8, 1.5, rentaColor);
    });

    // Tabla de detalle operativo
    const tableY = cardY + ch + 10;
    CU.sectionHeader(pdf, "Detalle Operativo", ml, tableY, col);

    const headers = [
      { label: "Sucursal", w: 65, align: "left" },
      { label: "Venta Prom. Mensual", w: 48 },
      { label: "Renta Mensual", w: 40 },
      { label: "Renta %", w: 28 },
      { label: "Nómina Total", w: 38 },
      { label: "Labor %", w: 28 },
    ];
    const totalW = headers.reduce((a, h) => a + h.w, 0);
    headers[0].w += col - totalW;

    const rows = operativos.map((op) => [
      op.sucursal,
      fmtCurrency(op.venta_promedio_mensual, "$"),
      fmtCurrency(op.renta_mensual, "$"),
      fmtPct(op.renta_pct),
      fmtCurrency(op.nomina_total, "$"),
      fmtPct(op.labor_cost_pct),
    ]);

    CU.dataTable(pdf, headers, rows, ml, tableY + 4, { rowH: 7 });
  } else {
    CU.text(pdf, "Sin información operativa disponible.", ml, 40, { size: 7, color: COLOR.dimmed });
  }

  // ── Labor cost semanal ────────────────────────────────────────────────────
  if (labor_semanal && labor_semanal.length) {
    const semY = 130;
    CU.sectionHeader(pdf, "Labor Cost Semanal", ml, semY, col);

    const headers = [
      { label: "Sucursal", w: 58, align: "left" },
      { label: "Semana", w: 22 },
      { label: "Inicio", w: 28 },
      { label: "Fin", w: 28 },
      { label: "Venta Neta", w: 38 },
      { label: "Nómina", w: 35 },
      { label: "Labor %", w: 28 },
      { label: "Estado", w: 22 },
    ];
    const totalW = headers.reduce((a, h) => a + h.w, 0);
    headers[0].w += col - totalW;

    const rows = labor_semanal.slice(0, 10).map((r) => [
      (r.sucursal || "").replace("SG ", ""),
      String(r.semana || "—"),
      r.fecha_inicio || "—",
      r.fecha_fin || "—",
      fmtCurrency(r.venta_neta, "$"),
      fmtCurrency(r.nomina_total, "$"),
      fmtPct(r.labor_cost_pct),
      r.estado_kpi || "—",
    ]);

    CU.dataTable(pdf, headers, rows, ml, semY + 4, { rowH: 5.5, fontSize: 6 });
  }

  // ── Insight de labor y renta ──────────────────────────────────────────────
  const insightLaborText = IE.insightLabor(operativos);
  const insightRentaText = IE.insightRenta(renta);
  const insightY = ph - 35;

  CU.sectionHeader(pdf, "Análisis", ml, insightY, col);

  const combined = `${insightLaborText} ${insightRentaText}`;
  const lines = pdf.splitTextToSize(combined, col);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  CU.setTextColor(pdf, COLOR.white);
  pdf.text(lines.slice(0, 3), ml, insightY + 5);

  CU.pageFooter(pdf, pw, ph, pageNum, totalPages, `${params.marca || "Santa Gloria MX"} · ${mesLabel} ${params.anio}`);
};
