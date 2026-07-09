// ─── closingSection.js — Franja de cierre (obligatoria) ──────────────────────
//
// Según reportRenderer.md §5 y reportRules.md §13:
// "Regla dorada + caption de metodología: disclaimer_neto, alcance
//  (qué sucursales), notas de datos (mes parcial, sucursales nuevas),
//  y disclaimer_finanzas si aplica."
//
// Esta sección cierra todos los reportes. No tiene número de sección.

window.ReportSections = window.ReportSections || {};

window.ReportSections.closing = async function (pdf, pw, ph, data, params, pageNum, total) {
  const { COLOR, FONT, PAGE, TEXTS, MESES, fmtCurrency } = window.RC;
  const CU = window.ChartUtils;

  CU.pageBackground(pdf, pw, ph);

  const ml  = PAGE.ml;
  const col = PAGE.col;
  const cx  = pw / 2;
  // El engine ya dibujó el header estándar.
  let y = PAGE.mt;

  // ── Título de sección ─────────────────────────────────────────────────────────
  pdf.setFont(FONT.family, "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(COLOR.MUTED[0], COLOR.MUTED[1], COLOR.MUTED[2]);
  pdf.text("NOTAS DE METODOLOGÍA", ml, y);

  CU.goldRule(pdf, ml, y + 4, col);
  y += 14;

  // ── Construir textos de metodología ──────────────────────────────────────────
  const payload  = data?._payload;
  const mesLabel = MESES[(params.mes || 1) - 1] || "";
  const stores   = params.sucursales || [];
  const partials = payload?.dateRange?.partialMonths || [];

  const blocks = [];

  // 1. Referencia principal: neto
  blocks.push({
    titulo: "Cifras de referencia",
    texto:  TEXTS.fixed.disclaimer_neto,
  });

  // 2. Alcance del reporte
  const country = params.country === "Mexico" ? "México" : "España";
  const scope   = stores.length
    ? `Este reporte cubre las siguientes sucursales de ${country}: ${stores.join(", ")}. Período: ${mesLabel} ${params.anio}.`
    : `Período: ${mesLabel} ${params.anio}.`;
  blocks.push({ titulo: "Alcance", texto: scope });

  // 3. Nota de mes parcial (si aplica)
  if (partials.length) {
    const mesesParciales = partials.map(m => MESES[m - 1]).join(", ");
    const noteParcial = TEXTS.templates.note_partial
      ? TEXTS.fixed.note_partial
          .replace("{mes}", mesesParciales)
          .replace("{dia}", new Date().getDate())
      : `Los datos de ${mesesParciales} son parciales; no comparables con meses completos.`;
    blocks.push({ titulo: "Datos parciales", texto: noteParcial });
  }

  // 4. Disclaimer financiero
  blocks.push({
    titulo: "Alcance financiero",
    texto:  TEXTS.fixed.disclaimer_finanzas,
  });

  // ── Dibujar bloques de metodología ───────────────────────────────────────────
  blocks.forEach(block => {
    if (y > ph - PAGE.mb - 20) return;

    // Título del bloque
    pdf.setFont(FONT.family, "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(COLOR.GOLD[0], COLOR.GOLD[1], COLOR.GOLD[2]);
    pdf.text(block.titulo.toUpperCase(), ml, y);
    y += 5;

    // Texto del bloque
    pdf.setFont(FONT.family, "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(COLOR.INK[0], COLOR.INK[1], COLOR.INK[2]);
    const lines = pdf.splitTextToSize(block.texto, col);
    pdf.text(lines, ml, y);
    y += lines.length * 4 + 8;
  });

  // ── Regla de cierre y datos de generación ────────────────────────────────────
  const closingY = ph - PAGE.mb - 30;
  if (y < closingY) y = closingY;

  CU.goldRule(pdf, ml, y, col);
  y += 8;

  // Empresa y URL
  pdf.setFont(FONT.family, "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(COLOR.PRIMARY[0], COLOR.PRIMARY[1], COLOR.PRIMARY[2]);
  pdf.text(TEXTS.fixed.company, cx, y, { align: "center" });
  y += 5;

  pdf.setFont(FONT.family, "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(COLOR.MUTED[0], COLOR.MUTED[1], COLOR.MUTED[2]);
  pdf.text(TEXTS.fixed.url, cx, y, { align: "center" });
  y += 5;

  // Tagline
  const tagline = payload?.branding?.tagline || TEXTS.fixed.tagline_mexico;
  pdf.setFont(FONT.family, "italic");
  pdf.setFontSize(8);
  pdf.setTextColor(COLOR.MUTED[0], COLOR.MUTED[1], COLOR.MUTED[2]);
  pdf.text(tagline, cx, y, { align: "center" });
  y += 8;

  // Fecha y folio de emisión
  const today = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  pdf.setFont(FONT.family, "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(COLOR.MUTED[0], COLOR.MUTED[1], COLOR.MUTED[2]);
  pdf.text(
    `Documento generado el ${today}  ·  Pág. ${pageNum} de ${total}  ·  Información confidencial — Uso interno`,
    cx, y, { align: "center" }
  );
};
