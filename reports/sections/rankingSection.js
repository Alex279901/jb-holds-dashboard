// Página 4: Ranking de sucursales + comparativo vs mes anterior.

window.ReportSections = window.ReportSections || {};

window.ReportSections.ranking = async function (pdf, pw, ph, data, params, pageNum, totalPages) {
  const { COLOR, fmtCurrency, fmtPct, variacion, colorMeta, colorRenta, colorLabor, MESES } = window.RC;
  const CU = window.ChartUtils;
  const IE = window.InsightEngine;

  CU.pageBackground(pdf, pw, ph);
  CU.fillRect(pdf, 0, 0, 4, ph, COLOR.accent);

  const ml = window.RC.PAGE.ml;
  const mr = pw - window.RC.PAGE.mr;
  const col = window.RC.PAGE.col;
  const mesLabel = MESES[(params.mes || 1) - 1] || "";
  const prevMesNum = (params.mes || 1) === 1 ? 12 : (params.mes || 1) - 1;
  const prevMesLabel = MESES[prevMesNum - 1] || "";

  CU.text(pdf, "RANKING DE SUCURSALES", ml, 14, { size: 8, color: COLOR.accent, bold: true });
  CU.text(pdf, `${mesLabel} ${params.anio}`, mr, 14, { size: 7, color: COLOR.muted, align: "right" });
  CU.line(pdf, ml, 16, mr, 16, COLOR.border, 0.3);

  const { ranking, ranking_previo, kpis } = data;

  // ── Ranking consolidado ────────────────────────────────────────────────────
  CU.sectionHeader(pdf, `Ranking de Ventas — ${mesLabel} ${params.anio}`, ml, 22, col);

  const allRanking = ranking && ranking.length ? ranking : [];
  const prevMap = {};
  (ranking_previo || []).forEach((r) => { prevMap[r.sucursal] = r; });

  if (allRanking.length) {
    const headers = [
      { label: "#", w: 10 },
      { label: "Sucursal", w: 70, align: "left" },
      { label: `Ventas ${mesLabel}`, w: 44 },
      { label: `Ventas ${prevMesLabel}`, w: 44 },
      { label: "Variación", w: 32 },
      { label: "Renta %", w: 28 },
      { label: "Labor %", w: 28 },
    ];
    const totalW = headers.reduce((a, h) => a + h.w, 0);
    const extraW = col - totalW;
    headers[1].w += extraW;

    const rows = allRanking.map((r, i) => {
      const prev = prevMap[r.sucursal];
      const varPct = prev ? variacion(r.venta_neta, prev.venta_neta) : null;
      const varStr = varPct !== null ? `${varPct >= 0 ? "+" : ""}${fmtPct(varPct)}` : "—";
      return [
        String(i + 1),
        r.sucursal,
        fmtCurrency(r.venta_neta, "$"),
        prev ? fmtCurrency(prev.venta_neta, "$") : "—",
        varStr,
        fmtPct(r.renta_pct),
        fmtPct(r.labor_cost_pct),
      ];
    });

    CU.dataTable(pdf, headers, rows, ml, 26, { rowH: 7 });
  } else {
    CU.text(pdf, "Sin datos de ranking para el periodo seleccionado.", ml, 32, { size: 7, color: COLOR.dimmed });
  }

  // ── Insights por sucursal ──────────────────────────────────────────────────
  const sucursalesData = kpis || [];
  const sucInsights = IE.insightSucursales(sucursalesData, data.kpis_previo);

  if (sucInsights.length) {
    const insightStartY = allRanking.length ? 26 + 7 * (allRanking.length + 1) + 10 : 50;
    const clampedY = Math.min(insightStartY, ph * 0.52);

    CU.sectionHeader(pdf, "Análisis por Sucursal", ml, clampedY, col);

    const cw = (col - 8) / Math.min(sucInsights.length, 3);
    sucInsights.slice(0, 3).forEach((ins, i) => {
      const cx = ml + i * (cw + 4);
      const cy = clampedY + 4;
      const ch = 22;

      const borderColor =
        ins.tipo === "positivo" ? COLOR.green :
        ins.tipo === "alerta" ? COLOR.red :
        ins.tipo === "advertencia" ? COLOR.amber :
        COLOR.border;

      CU.fillRect(pdf, cx, cy, cw, ch, COLOR.cardBg);
      CU.fillRect(pdf, cx, cy, 2, ch, borderColor);
      CU.text(pdf, ins.sucursal, cx + 4, cy + 5, { size: 7, color: COLOR.white, bold: true });
      CU.text(pdf, ins.tipo === "positivo" ? "▲ Crecimiento" : ins.tipo === "alerta" ? "▼ Alerta" : ins.tipo === "advertencia" ? "▼ Advertencia" : "— Estable",
        cx + 4, cy + 10, { size: 6, color: borderColor });
      const wrapped = pdf.splitTextToSize(ins.texto, cw - 6);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      CU.setTextColor(pdf, COLOR.muted);
      pdf.text(wrapped.slice(0, 2), cx + 4, cy + 15);
    });
  }

  // ── Mejor y peor sucursal (visual destacado) ──────────────────────────────
  const { mejor, peor } = IE.mejorYPeor(kpis || []);
  if (mejor && peor) {
    const destY = ph * 0.78;
    CU.sectionHeader(pdf, "Desempeño Extremos del Mes", ml, destY, col);

    const hw = (col - 6) / 2;

    // Mejor
    CU.fillRect(pdf, ml, destY + 4, hw, 22, [10, 30, 18]);
    CU.fillRect(pdf, ml, destY + 4, 2, 22, COLOR.green);
    CU.text(pdf, "SUCURSAL LÍDER", ml + 4, destY + 9, { size: 5.5, color: COLOR.green, bold: true });
    CU.text(pdf, mejor.sucursal, ml + 4, destY + 15, { size: 8, color: COLOR.white, bold: true });
    CU.text(pdf, fmtCurrency(mejor.venta_neta, "$") + " MXN", ml + 4, destY + 21, { size: 7, color: COLOR.green });

    // Peor
    const px = ml + hw + 6;
    CU.fillRect(pdf, px, destY + 4, hw, 22, [30, 12, 12]);
    CU.fillRect(pdf, px, destY + 4, 2, 22, COLOR.amber);
    CU.text(pdf, "OPORTUNIDAD DE MEJORA", px + 4, destY + 9, { size: 5.5, color: COLOR.amber, bold: true });
    CU.text(pdf, peor.sucursal, px + 4, destY + 15, { size: 8, color: COLOR.white, bold: true });
    CU.text(pdf, fmtCurrency(peor.venta_neta, "$") + " MXN", px + 4, destY + 21, { size: 7, color: COLOR.amber });
  }

  CU.pageFooter(pdf, pw, ph, pageNum, totalPages, `${params.marca || "Santa Gloria MX"} · ${mesLabel} ${params.anio}`);
};
