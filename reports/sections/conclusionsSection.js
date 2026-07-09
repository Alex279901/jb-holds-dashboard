// Página 7: Conclusiones y Recomendaciones — generadas automáticamente.

window.ReportSections = window.ReportSections || {};

window.ReportSections.conclusions = async function (pdf, pw, ph, data, params, pageNum, totalPages) {
  const { COLOR, fmtCurrency, fmtPct, MESES } = window.RC;
  const CU = window.ChartUtils;
  const IE = window.InsightEngine;

  CU.pageBackground(pdf, pw, ph);
  CU.fillRect(pdf, 0, 0, 4, ph, COLOR.accent);

  const ml = window.RC.PAGE.ml;
  const mr = pw - window.RC.PAGE.mr;
  const col = window.RC.PAGE.col;
  const mesLabel = MESES[(params.mes || 1) - 1] || "";

  CU.text(pdf, "CONCLUSIONES Y RECOMENDACIONES", ml, 14, { size: 8, color: COLOR.accent, bold: true });
  CU.text(pdf, `${mesLabel} ${params.anio}`, mr, 14, { size: 7, color: COLOR.muted, align: "right" });
  CU.line(pdf, ml, 16, mr, 16, COLOR.border, 0.3);

  if (!IE) {
    CU.text(pdf, "Error: InsightEngine no disponible.", ml, 35, { size: 8, color: COLOR.red });
    CU.pageFooter(pdf, pw, ph, pageNum, totalPages, `${params.marca || "Santa Gloria MX"}`);
    return;
  }

  // ── Conclusiones automáticas ────────────────────────────────────────────────
  CU.sectionHeader(pdf, "Conclusiones del Periodo", ml, 22, col);

  const items = IE.conclusiones(data);
  let currentY = 28;

  items.forEach((item) => {
    const iconColor =
      item.tipo === "positivo" ? COLOR.green :
      item.tipo === "alerta" ? COLOR.red :
      item.tipo === "advertencia" ? COLOR.amber :
      COLOR.muted;

    const icon =
      item.tipo === "positivo" ? "▲" :
      item.tipo === "alerta" ? "▼" :
      item.tipo === "advertencia" ? "●" :
      "—";

    CU.fillRect(pdf, ml, currentY - 1, 2, 8, iconColor);
    CU.text(pdf, icon, ml + 3.5, currentY + 4, { size: 6, color: iconColor, bold: true });

    const wrapped = pdf.splitTextToSize(item.texto, col - 10);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    CU.setTextColor(pdf, COLOR.white);
    pdf.text(wrapped.slice(0, 2), ml + 9, currentY + 4);

    currentY += (wrapped.slice(0, 2).length * 4.5) + 5;
  });

  // ── Recomendaciones ────────────────────────────────────────────────────────
  const recY = Math.max(currentY + 8, ph * 0.48);
  CU.sectionHeader(pdf, "Recomendaciones Estratégicas", ml, recY, col);

  const recs = IE.recomendaciones(data);
  let recCurrentY = recY + 6;

  recs.forEach((rec, i) => {
    const wrapped = pdf.splitTextToSize(`${i + 1}. ${rec}`, col - 6);
    CU.fillRect(pdf, ml, recCurrentY - 1, col, wrapped.slice(0, 2).length * 4.5 + 4, i % 2 === 0 ? [10, 16, 28] : [0, 0, 0, 0]);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    CU.setTextColor(pdf, COLOR.white);
    pdf.text(wrapped.slice(0, 2), ml + 3, recCurrentY + 3.5);
    recCurrentY += (wrapped.slice(0, 2).length * 4.5) + 7;
  });

  // ── Bloque de cierre ───────────────────────────────────────────────────────
  const closingY = ph - 40;
  CU.fillRect(pdf, ml, closingY, col, 22, COLOR.cardBg);
  CU.fillRect(pdf, ml, closingY, col, 1.5, COLOR.accent);

  CU.text(pdf, "Reporte generado automáticamente por INDEF Intelligence Platform", ml + col / 2, closingY + 8, {
    size: 7, color: COLOR.muted, align: "center",
  });
  CU.text(pdf, "Los datos provienen directamente de Supabase. No se utilizaron fuentes externas.", ml + col / 2, closingY + 14, {
    size: 6, color: COLOR.dimmed, align: "center",
  });

  const today = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  CU.text(pdf, `${params.marca || "Santa Gloria México"} · ${mesLabel} ${params.anio} · Generado el ${today}`, ml + col / 2, closingY + 19, {
    size: 5.5, color: COLOR.dimmed, align: "center",
  });

  CU.pageFooter(pdf, pw, ph, pageNum, totalPages, `${params.marca || "Santa Gloria MX"} · ${mesLabel} ${params.anio}`);
};
