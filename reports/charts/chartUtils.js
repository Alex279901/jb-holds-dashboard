// ─── chartUtils.js — Primitivas de dibujo para jsPDF (M2B) ──────────────────
//
// A4 Portrait: 210 × 297 mm, márgenes 20mm, ancho útil 170mm.
// Paleta: tokens oficiales de reportSchema.json (blanco, PRIMARY, GOLD, INK...).
// Footer: VACÍO por spec. El header se gestiona desde reportEngine.js.
//
// Compatibilidad M2B: todas las firmas de funciones existentes se conservan.
// Las secciones de contenido legacy (summary, sales, ranking, products, labor,
// conclusions) seguirán funcionando pero con coordenadas desajustadas hasta M3.
// Las secciones nuevas (cover, index, closing) usan coordenadas portrait correctas.

window.ChartUtils = (function () {

  const { COLOR, FONT, PAGE, TEXTS } = window.RC;

  // ── Helpers de color ─────────────────────────────────────────────────────────
  function rgb(arr) { return { r: arr[0], g: arr[1], b: arr[2] }; }

  function setFill(pdf, color) {
    const c = rgb(color);
    pdf.setFillColor(c.r, c.g, c.b);
  }

  function setDraw(pdf, color) {
    const c = rgb(color);
    pdf.setDrawColor(c.r, c.g, c.b);
  }

  function setTextColor(pdf, color) {
    const c = rgb(color);
    pdf.setTextColor(c.r, c.g, c.b);
  }

  // ── Primitivas base ───────────────────────────────────────────────────────────

  function fillRect(pdf, x, y, w, h, color) {
    setFill(pdf, color || COLOR.ROW_ALT);
    pdf.rect(x, y, w, h, "F");
  }

  function strokeRect(pdf, x, y, w, h, color, lw) {
    setDraw(pdf, color || COLOR.GRID);
    pdf.setLineWidth(lw || 0.3);
    pdf.rect(x, y, w, h, "S");
  }

  function line(pdf, x1, y1, x2, y2, color, lw) {
    setDraw(pdf, color || COLOR.GRID);
    pdf.setLineWidth(lw || 0.3);
    pdf.line(x1, y1, x2, y2);
  }

  // text() — firma idéntica a la versión anterior; colores ahora son los tokens spec.
  function text(pdf, str, x, y, { size, color, bold, align } = {}) {
    pdf.setFont(FONT.family, bold ? "bold" : "normal");
    pdf.setFontSize(size || FONT.size.cuerpo);
    setTextColor(pdf, color || COLOR.INK);
    pdf.text(String(str ?? ""), x, y, { align: align || "left" });
  }

  // ── Fondo de página (blanco — spec: documentos ejecutivos sobre blanco) ───────
  function pageBackground(pdf, pw, ph) {
    setFill(pdf, COLOR.WHITE);
    pdf.rect(0, 0, pw, ph, "F");
  }

  // ── Header estándar de página ─────────────────────────────────────────────────
  // Spec: "Encabezado: izquierda INDEF · INVERSIÓN EN DESARROLLO DE FRANQUICIAS
  //       (8 pt, MUTED, mayúsculas); derecha, número de página (folio)."
  // Se llama desde reportEngine.js para todas las páginas excepto portada.
  function pageHeader(pdf, pw, folio) {
    const y = PAGE.headerY;
    pdf.setFont(FONT.family, "normal");
    pdf.setFontSize(FONT.size.header_pie);
    setTextColor(pdf, COLOR.MUTED);
    pdf.text(TEXTS.fixed.pageHeader, PAGE.ml, y);
    pdf.text(String(folio), pw - PAGE.mr, y, { align: "right" });
    // Separador sutil
    setDraw(pdf, COLOR.GRID);
    pdf.setLineWidth(0.25);
    pdf.line(PAGE.ml, y + 2.5, pw - PAGE.mr, y + 2.5);
  }

  // ── Footer vacío (obligatorio por spec) ───────────────────────────────────────
  // Esta función no dibuja nada. Existe para compatibilidad si algo la llama.
  function pageFooter() { /* VACÍO — spec reportRenderer.md §0 */ }

  // ── Regla dorada ─────────────────────────────────────────────────────────────
  // length: longitud en mm; cx: centro horizontal de la página
  function goldRule(pdf, x, y, length, cx) {
    const center = cx || (PAGE.ml + PAGE.col / 2);
    const startX = cx ? center - length / 2 : x;
    setDraw(pdf, COLOR.GOLD);
    pdf.setLineWidth(1.0);
    pdf.line(startX, y, startX + (length || PAGE.col), y);
  }

  // ── Banner de sección numerado ────────────────────────────────────────────────
  // Spec: "cuadro PRIMARY con número blanco + título versalitas PRIMARY + regla tenue"
  // Devuelve la y donde empieza el contenido de la sección.
  function sectionBanner(pdf, number, title, x, y, w) {
    const bw = 8;   // ancho del cuadro de número
    const bh = 8;   // alto del banner
    // Cuadro del número
    setFill(pdf, COLOR.PRIMARY);
    pdf.rect(x, y, bw, bh, "F");
    setTextColor(pdf, COLOR.WHITE);
    pdf.setFont(FONT.family, "bold");
    pdf.setFontSize(9);
    pdf.text(String(number), x + bw / 2, y + bh / 2 + 1.5, { align: "center" });
    // Título en versalitas
    setTextColor(pdf, COLOR.PRIMARY);
    pdf.setFont(FONT.family, "bold");
    pdf.setFontSize(FONT.size.banner);
    pdf.text(title.toUpperCase(), x + bw + 3, y + bh / 2 + 2);
    // Regla sutil debajo
    setDraw(pdf, COLOR.GRID);
    pdf.setLineWidth(0.25);
    pdf.line(x, y + bh + 1, x + w, y + bh + 1);
    return y + bh + 5;
  }

  // ── Encabezado de sección simple (compat M1 para secciones existentes) ────────
  // Las secciones existentes llaman a esto; en M3 migrarán a sectionBanner.
  function sectionHeader(pdf, label, x, y, w) {
    setDraw(pdf, COLOR.GOLD);
    pdf.setLineWidth(0.5);
    pdf.line(x, y, x + w, y);
    text(pdf, label.toUpperCase(), x, y - 1.5, { size: 7, color: COLOR.GOLD, bold: true });
  }

  // ── h1 interno de sección ─────────────────────────────────────────────────────
  // Spec: "Sub-encabezados internos (h1): bold PRIMARY 12.5pt"
  function h1(pdf, texto, x, y) {
    text(pdf, texto, x, y, { size: FONT.size.h1_bloque, color: COLOR.PRIMARY, bold: true });
    return y + 7;
  }

  // ── Caption bajo gráfica ──────────────────────────────────────────────────────
  // Spec: "itálica MUTED bajo la gráfica"
  function caption(pdf, texto, x, y, w) {
    pdf.setFont(FONT.family, "italic");
    pdf.setFontSize(FONT.size.caption);
    setTextColor(pdf, COLOR.MUTED);
    const lines = pdf.splitTextToSize(texto, w || PAGE.col);
    pdf.text(lines, x, y);
    return y + lines.length * 4.5;
  }

  // ── Comment box (borde izquierdo dorado) ─────────────────────────────────────
  // Spec: "borde izq dorado, texto 3a persona, sin bold decorativo; interpreta, NO describe"
  function commentBox(pdf, texto, x, y, w) {
    const borderW = 3;
    const textX   = x + borderW + 4;
    const textW   = (w || PAGE.col) - borderW - 6;
    pdf.setFont(FONT.family, "normal");
    pdf.setFontSize(FONT.size.cuerpo);
    setTextColor(pdf, COLOR.INK);
    const lines = pdf.splitTextToSize(texto, textW);
    const boxH  = lines.length * 5 + 6;
    setFill(pdf, COLOR.PALE);
    pdf.rect(x, y, (w || PAGE.col), boxH, "F");
    setFill(pdf, COLOR.GOLD);
    pdf.rect(x, y, borderW, boxH, "F");
    pdf.text(lines, textX, y + 5);
    return y + boxH + 4;
  }

  // ── KPI Cards (spec: valor PRIMARY grande + label MUTED sobre banda clara) ───
  // Versión spec-compliant para secciones M2B+.
  function kpiCards(pdf, cards, x, y, w) {
    const n   = Math.min(cards.length, 5);
    const gap = 4;
    const cw  = (w - gap * (n - 1)) / n;
    const ch  = 28;

    cards.slice(0, n).forEach((card, i) => {
      const cx = x + i * (cw + gap);
      setFill(pdf, COLOR.ROW_ALT);
      pdf.rect(cx, y, cw, ch, "F");

      // Label (arriba, MUTED)
      pdf.setFont(FONT.family, "normal");
      pdf.setFontSize(FONT.size.kpi_label);
      setTextColor(pdf, COLOR.MUTED);
      pdf.text(card.label || "", cx + cw / 2, y + 6, { align: "center" });

      // Valor (centro, grande, color de semáforo o PRIMARY)
      pdf.setFont(FONT.family, "bold");
      pdf.setFontSize(FONT.size.kpi_valor);
      setTextColor(pdf, card.valueColor || COLOR.PRIMARY);
      pdf.text(String(card.value ?? "—"), cx + cw / 2, y + ch / 2 + 3, { align: "center" });

      // Sub (abajo, caption)
      if (card.sub) {
        pdf.setFont(FONT.family, "normal");
        pdf.setFontSize(FONT.size.caption);
        setTextColor(pdf, COLOR.MUTED);
        pdf.text(card.sub, cx + cw / 2, y + ch - 4, { align: "center" });
      }
    });

    return y + ch + 4;
  }

  // ── KPI Card individual (compat M1) ───────────────────────────────────────────
  function kpiCard(pdf, x, y, w, h, { label, value, sub, valueColor } = {}) {
    setFill(pdf, COLOR.ROW_ALT);
    pdf.rect(x, y, w, h, "F");
    setDraw(pdf, COLOR.GRID);
    pdf.setLineWidth(0.25);
    pdf.rect(x, y, w, h, "S");

    text(pdf, label || "", x + w / 2, y + 5, { size: FONT.size.kpi_label, color: COLOR.MUTED, align: "center" });

    const vc = valueColor || COLOR.PRIMARY;
    text(pdf, value || "—", x + w / 2, y + h / 2 + 2, { size: FONT.size.kpi_valor, color: vc, bold: true, align: "center" });

    if (sub) {
      text(pdf, sub, x + w / 2, y + h - 4, { size: FONT.size.caption, color: COLOR.MUTED, align: "center" });
    }
  }

  // ── Badge (compat M1) ─────────────────────────────────────────────────────────
  function badge(pdf, label, x, y, bgColor) {
    const c   = bgColor || COLOR.PRIMARY;
    const pad = 2;
    pdf.setFontSize(6);
    const tw = pdf.getTextWidth(label);
    setFill(pdf, c);
    pdf.rect(x, y - 3.2, tw + pad * 2, 4.5, "F");
    setTextColor(pdf, COLOR.WHITE);
    pdf.setFont(FONT.family, "bold");
    pdf.text(label, x + pad, y, { align: "left" });
  }

  // ── Tabla de datos ────────────────────────────────────────────────────────────
  // Firma igual que M1; colores actualizados a spec (header PRIMARY, alt ROW_ALT).
  function dataTable(pdf, headers, rows, x, y, { rowH, headerColor, stripeColor, fontSize } = {}) {
    const rh       = rowH       || 6.5;
    const hColor   = headerColor || COLOR.WHITE;
    const stripe   = stripeColor || COLOR.ROW_ALT;
    const fs       = fontSize    || FONT.size.tabla;
    const totalW   = headers.reduce((acc, h) => acc + h.w, 0);

    // Encabezado
    setFill(pdf, COLOR.PRIMARY);
    pdf.rect(x, y, totalW, rh, "F");
    let cx = x;
    headers.forEach(h => {
      text(pdf, h.label, cx + h.w / 2, y + rh / 2 + 1.5, { size: fs - 0.5, color: hColor, bold: true, align: "center" });
      cx += h.w;
    });

    // Filas
    rows.forEach((row, ri) => {
      const ry = y + rh * (ri + 1);
      if (ri % 2 === 0) {
        setFill(pdf, stripe);
        pdf.rect(x, ry, totalW, rh, "F");
      }
      cx = x;
      headers.forEach((h, ci) => {
        const cellVal = row[ci] !== undefined && row[ci] !== null ? String(row[ci]) : "—";
        const align   = h.align || "center";
        const textX   = align === "left"  ? cx + 1.5
                      : align === "right" ? cx + h.w - 1.5
                      : cx + h.w / 2;
        text(pdf, cellVal, textX, ry + rh / 2 + 1.5, { size: fs, color: COLOR.INK, align });
      });
      setDraw(pdf, COLOR.GRID);
      pdf.setLineWidth(0.15);
      pdf.line(x, ry + rh, x + totalW, ry + rh);
    });

    strokeRect(pdf, x, y, totalW, rh * (rows.length + 1), COLOR.GRID, 0.3);
    return y + rh * (rows.length + 1);
  }

  // ── Gráfica de barras horizontales ────────────────────────────────────────────
  function barChartH(pdf, data, x, y, w, h, { symbol, showValues } = {}) {
    if (!data || !data.length) return;
    const maxVal = Math.max(...data.map(d => parseFloat(d.value) || 0));
    if (maxVal <= 0) return;
    const rowH    = h / data.length;
    const labelW  = 40;
    const barMaxW = w - labelW - 20;

    data.forEach((d, i) => {
      const val    = parseFloat(d.value) || 0;
      const barW   = (val / maxVal) * barMaxW;
      const ry     = y + i * rowH;
      const barColor = d.color || COLOR.PRIMARY;

      if (i % 2 === 0) {
        setFill(pdf, COLOR.ROW_ALT);
        pdf.rect(x, ry, w, rowH, "F");
      }

      text(pdf, d.label, x + 1, ry + rowH / 2 + 1.5, { size: 7, color: COLOR.MUTED });
      setFill(pdf, barColor);
      pdf.rect(x + labelW, ry + rowH * 0.2, Math.max(barW, 0.5), rowH * 0.6, "F");

      if (showValues !== false) {
        const sym = symbol || "$";
        const v   = val >= 1_000_000 ? `${sym}${(val / 1_000_000).toFixed(2)}M`
                  : val >= 1_000     ? `${sym}${(val / 1_000).toFixed(1)}K`
                  : `${sym}${val.toFixed(0)}`;
        text(pdf, v, x + labelW + barW + 2, ry + rowH / 2 + 1.5, { size: 6.5, color: COLOR.INK });
      }
    });
  }

  // ── Gráfica de línea (tendencia) ──────────────────────────────────────────────
  function lineChart(pdf, labels, series, x, y, w, h) {
    if (!labels?.length || !series?.length) return;
    const allVals = series.flatMap(s => s.values.map(v => parseFloat(v) || 0));
    const maxVal  = Math.max(...allVals) || 1;
    const minVal  = 0;
    const range   = maxVal - minVal;

    const padL = 24, padB = 10, padR = 5, padT = 5;
    const chartX = x + padL, chartY = y + padT;
    const chartW = w - padL - padR, chartH = h - padT - padB;

    // Fondo de gráfica
    setFill(pdf, COLOR.ROW_ALT);
    pdf.rect(x, y, w, h, "F");

    // Grid horizontal
    for (let i = 0; i <= 4; i++) {
      const gy  = chartY + chartH - (i / 4) * chartH;
      const gv  = minVal + (i / 4) * range;
      const lbl = gv >= 1000 ? `${(gv / 1000).toFixed(0)}K` : gv.toFixed(0);
      setDraw(pdf, COLOR.GRID);
      pdf.setLineWidth(0.2);
      pdf.line(chartX, gy, chartX + chartW, gy);
      text(pdf, lbl, chartX - 1, gy + 1, { size: 5, color: COLOR.MUTED, align: "right" });
    }

    // Eje X
    labels.forEach((lbl, i) => {
      const lx = chartX + (i / (labels.length - 1 || 1)) * chartW;
      text(pdf, lbl, lx, chartY + chartH + 5, { size: 5, color: COLOR.MUTED, align: "center" });
    });

    // Series
    series.forEach(serie => {
      const pts = serie.values.map((v, i) => ({
        px: chartX + (i / (labels.length - 1 || 1)) * chartW,
        py: chartY + chartH - ((parseFloat(v) - minVal) / range) * chartH,
      }));
      const color = serie.color || COLOR.PRIMARY;
      setDraw(pdf, color);
      pdf.setLineWidth(0.7);
      for (let i = 1; i < pts.length; i++) {
        pdf.line(pts[i - 1].px, pts[i - 1].py, pts[i].px, pts[i].py);
      }
      setFill(pdf, color);
      pts.forEach(({ px, py }) => pdf.ellipse(px, py, 0.8, 0.8, "F"));
    });
  }

  // ── Barra de progreso (compat M1) ─────────────────────────────────────────────
  function progressBar(pdf, x, y, w, h, pct, color) {
    setFill(pdf, COLOR.ROW_ALT);
    pdf.rect(x, y, w, h, "F");
    const filled = Math.min(Math.max(parseFloat(pct) / 100, 0), 1) * w;
    setFill(pdf, color || COLOR.PRIMARY);
    pdf.rect(x, y, filled, h, "F");
    setDraw(pdf, COLOR.GRID);
    pdf.setLineWidth(0.2);
    pdf.rect(x, y, w, h, "S");
  }

  // ── Logo text (fallback cuando no hay imagen) ─────────────────────────────────
  function logoText(pdf, x, y) {
    text(pdf, "INDEF", x, y, { size: 14, color: COLOR.PRIMARY, bold: true });
    text(pdf, "Intelligence", x + 24, y, { size: 14, color: COLOR.INK });
  }

  // ── Bullets (spec: marcador ▪ dorado) ────────────────────────────────────────
  // items: string[]
  // Devuelve la Y después del último bullet.
  function bullets(pdf, items, x, y, w) {
    const bullet = TEXTS.glyphs.bullet; // ▪
    let cy = y;
    items.forEach(item => {
      text(pdf, bullet, x, cy, { size: FONT.size.cuerpo, color: COLOR.GOLD, bold: true });
      pdf.setFont(FONT.family, "normal");
      pdf.setFontSize(FONT.size.cuerpo);
      setTextColor(pdf, COLOR.INK);
      const lines = pdf.splitTextToSize(item, (w || PAGE.col) - 8);
      pdf.text(lines, x + 5, cy);
      cy += lines.length * 5 + 2;
    });
    return cy + 2;
  }

  return {
    rgb, setFill, setDraw, setTextColor,
    fillRect, strokeRect, line, text,
    pageBackground, pageHeader, pageFooter,
    goldRule, sectionBanner, sectionHeader, h1, caption,
    commentBox, kpiCards, kpiCard, badge, bullets,
    barChartH, lineChart, dataTable, progressBar,
    logoText,
  };

})();
