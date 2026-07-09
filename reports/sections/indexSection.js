// ─── indexSection.js — Índice automático (TOC) ───────────────────────────────
//
// Genera la tabla de contenidos a partir del array de páginas (_pages)
// que el engine inyecta en dataForSections.
//
// Reglas según spec (reportRenderer.md §2, reportRules.md §13):
// - Sin número de sección (igual que portada)
// - Numeración: portada e índice no consumen número; resto empieza en 1
// - cierre: se lista sin número al final
// - Cada sección muestra: [n]  Título  ......  página

window.ReportSections = window.ReportSections || {};

window.ReportSections.index = async function (pdf, pw, ph, data, params, pageNum, total) {
  const { COLOR, FONT, PAGE, TEXTS } = window.RC;
  const CU = window.ChartUtils;

  CU.pageBackground(pdf, pw, ph);

  const ml  = PAGE.ml;
  const col = PAGE.col;
  // El engine ya dibujó el header estándar antes de llamar a esta función.
  let y = PAGE.mt;

  // ── Título del índice ─────────────────────────────────────────────────────────
  pdf.setFont(FONT.family, "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(COLOR.PRIMARY[0], COLOR.PRIMARY[1], COLOR.PRIMARY[2]);
  pdf.text("ÍNDICE", ml, y);

  // Regla dorada
  CU.goldRule(pdf, ml, y + 5, col);
  y += 14;

  // ── Construir entradas del TOC ────────────────────────────────────────────────
  // data._pages contiene el array de módulos resueltos con su posición en el PDF.
  // Posición PDF: portada = 1, índice = 2, primera sección = 3, etc.
  const pages = data._pages || [];

  // Asignar números de sección (excluir portada, índice y cierre del conteo)
  const NO_NUMBER = new Set(["portada", "indice", "cierre"]);
  let sectionNum = 1;

  const entries = pages.map((page, i) => {
    const pdfPage = i + 1;
    let num = null;
    if (!NO_NUMBER.has(page.id)) {
      num = sectionNum++;
    }
    return {
      id:       page.id,
      label:    page.label,
      pdfPage,
      num,
      isSpecial: page.id === "cierre",
    };
  });

  // Mostrar solo las entradas que no son portada ni índice
  const tocEntries = entries.filter(e => e.id !== "portada" && e.id !== "indice");

  // ── Dibujar TOC ───────────────────────────────────────────────────────────────
  const rowH       = 8;
  const numColW    = 10;
  const pageNumX   = ml + col;
  const dotsFill   = "·";

  tocEntries.forEach((entry, i) => {
    if (y + rowH > ph - PAGE.mb - 10) return; // safety: no salir de página

    // Fondo alternado
    if (i % 2 === 0) {
      pdf.setFillColor(COLOR.ROW_ALT[0], COLOR.ROW_ALT[1], COLOR.ROW_ALT[2]);
      pdf.rect(ml, y - rowH * 0.35, col, rowH, "F");
    }

    // Número de sección
    if (entry.num !== null) {
      pdf.setFont(FONT.family, "bold");
      pdf.setFontSize(FONT.size.cuerpo);
      pdf.setTextColor(COLOR.PRIMARY[0], COLOR.PRIMARY[1], COLOR.PRIMARY[2]);
      pdf.text(String(entry.num), ml, y + 2);
    }

    // Etiqueta
    const labelX = ml + numColW;
    const labelColor = entry.isSpecial ? COLOR.MUTED : COLOR.INK;
    pdf.setFont(FONT.family, entry.isSpecial ? "italic" : "normal");
    pdf.setFontSize(FONT.size.cuerpo);
    pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
    pdf.text(entry.label, labelX, y + 2);

    // Número de página (derecha)
    pdf.setFont(FONT.family, "normal");
    pdf.setFontSize(FONT.size.cuerpo);
    pdf.setTextColor(COLOR.MUTED[0], COLOR.MUTED[1], COLOR.MUTED[2]);
    pdf.text(String(entry.pdfPage), pageNumX, y + 2, { align: "right" });

    // Línea de puntos entre título y número
    const labelW    = pdf.getTextWidth(entry.label);
    const pageNumW  = pdf.getTextWidth(String(entry.pdfPage));
    const dotsStart = labelX + labelW + 3;
    const dotsEnd   = pageNumX - pageNumW - 3;
    if (dotsEnd > dotsStart) {
      pdf.setFont(FONT.family, "normal");
      pdf.setFontSize(6);
      pdf.setTextColor(COLOR.GRID[0], COLOR.GRID[1], COLOR.GRID[2]);
      const dotsW     = dotsEnd - dotsStart;
      const dotStr    = dotsFill.repeat(Math.floor(dotsW / 1.8));
      pdf.text(dotStr, dotsStart, y + 2);
    }

    y += rowH;
  });

  y += 4;
  CU.goldRule(pdf, ml, y, col);
};
