// ─── coverSection.js — Portada ejecutiva ─────────────────────────────────────
//
// Según reportRenderer.md §1 (A4 portrait):
//   1. Logo INDEF (centrado, ≈6 cm ancho)
//   2. Regla dorada corta (≈7 cm, centrada)
//   3. Título PRIMARY bold mayúsculas (brandTitle)
//   4. Subtítulo dorado (tipo de reporte + periodo)
//   5. Subtítulo descriptivo INK (alcance)
//   6. Tabla de metadatos 2 columnas (label MUTED | valor INK bold)
//   7. Tagline itálica MUTED
//
// Esta sección no recibe el header estándar (skipHeader: true en el registry).

window.ReportSections = window.ReportSections || {};

window.ReportSections.cover = async function (pdf, pw, ph, data, params) {
  const { COLOR, FONT, PAGE, TEXTS, MESES, fmtMes } = window.RC;
  const CU = window.ChartUtils;

  // Fondo blanco
  CU.pageBackground(pdf, pw, ph);

  const cx = pw / 2; // centro horizontal: 105mm

  // ── 1. Logo INDEF ─────────────────────────────────────────────────────────────
  let logoY = 32;
  const logoH = 18;   // altura en mm
  const logoW = 62;   // ancho en mm (≈6.2 cm)

  try {
    const logoDataUrl = await _loadImageAsDataUrl("assets/indef-mark.png");
    pdf.addImage(logoDataUrl, "PNG", cx - logoW / 2, logoY, logoW, logoH);
    logoY += logoH + 8;
  } catch {
    // Fallback: texto si la imagen no carga
    CU.text(pdf, "INDEF", cx - 10, logoY + 10, { size: 20, color: COLOR.PRIMARY, bold: true });
    CU.text(pdf, "Inversión en Desarrollo de Franquicias", cx, logoY + 17, {
      size: 7, color: COLOR.MUTED, align: "center",
    });
    logoY += logoH + 10;
  }

  // ── 2. Regla dorada corta centrada (≈7 cm) ────────────────────────────────────
  const ruleW = 70;
  CU.goldRule(pdf, cx - ruleW / 2, logoY, ruleW);
  logoY += 10;

  // ── 3. Título PRIMARY bold mayúsculas ─────────────────────────────────────────
  // brandTitle proviene del payload.branding, construido por PayloadBuilder desde
  // el reportConfig del wizard. RC.BRAND eliminado en Pre-M3.
  const payload    = data?._payload;
  const brandTitle = payload?.branding?.brandTitle || params.brand?.toUpperCase() || params.marca?.toUpperCase() || "REPORTE";

  pdf.setFont(FONT.family, "bold");
  pdf.setFontSize(FONT.size.portada_titulo);
  const { r: pr, g: pg, b: pb } = { r: COLOR.PRIMARY[0], g: COLOR.PRIMARY[1], b: COLOR.PRIMARY[2] };
  pdf.setTextColor(pr, pg, pb);
  pdf.text(brandTitle, cx, logoY, { align: "center" });
  logoY += 14;

  // ── 4. Subtítulo dorado (tipo de reporte + periodo) ───────────────────────────
  const REPORT_LABELS = {
    mensual_sucursal:       "REPORTE EJECUTIVO MENSUAL",
    semanal_red:            "REPORTE SEMANAL — RED",
    semanal_ejecutivo_comite: "REPORTE SEMANAL — COMITÉ EJECUTIVO",
    anual_historico:        "REPORTE ANUAL HISTÓRICO",
    semestral_consolidado:  "REPORTE EJECUTIVO SEMESTRAL",
  };
  const reportTypeLabel = REPORT_LABELS[params.reportType || "mensual_sucursal"] || "REPORTE EJECUTIVO";
  const mesLabel        = MESES[(params.mes || 1) - 1] || "";
  const periodoLabel    = `${mesLabel} ${params.anio}`.toUpperCase();
  const subGold         = `${reportTypeLabel} · ${periodoLabel}`;

  pdf.setFont(FONT.family, "bold");
  pdf.setFontSize(FONT.size.portada_subtitulo_gold);
  pdf.setTextColor(COLOR.GOLD[0], COLOR.GOLD[1], COLOR.GOLD[2]);
  pdf.text(subGold, cx, logoY, { align: "center" });
  logoY += 10;

  // ── 5. Subtítulo descriptivo INK (alcance) ────────────────────────────────────
  // Cobertura: viene del payload o del reportConfig. Nunca hardcodeada.
  const coverageArr = payload?.filters?.countries || params.countries || (params.country ? [params.country] : []);
  const coverageStr = coverageArr.join(" · ") || params.country || "";
  const alcance     = coverageStr
    ? `Consolidado de operaciones ${coverageStr} · ${mesLabel} ${params.anio}`
    : `Consolidado de operaciones · ${mesLabel} ${params.anio}`;
  pdf.setFont(FONT.family, "normal");
  pdf.setFontSize(FONT.size.portada_subtitulo_desc);
  pdf.setTextColor(COLOR.INK[0], COLOR.INK[1], COLOR.INK[2]);
  pdf.text(alcance, cx, logoY, { align: "center" });
  logoY += 14;

  // ── Separador ─────────────────────────────────────────────────────────────────
  CU.line(pdf, PAGE.ml, logoY, pw - PAGE.mr, logoY, COLOR.GRID, 0.3);
  logoY += 10;

  // ── 6. Tabla de metadatos (2 columnas) ───────────────────────────────────────
  // Layout: tabla de 130mm centrada en la página
  // Col label: 42mm, right-aligned, MUTED
  // Separador dorado vertical: en x = cx - 2
  // Col valor: 84mm desde cx + 3, left-aligned, INK bold
  const tableW    = 130;
  const tableX    = cx - tableW / 2;        // x = 40mm
  const labelEndX = tableX + 43;            // fin de la columna de labels
  const sepX      = labelEndX + 2;          // línea vertical dorada
  const valX      = sepX + 4;               // inicio de valores

  const sucursalesStr = (params.sucursales || params.stores || []).join(", ");
  // Moneda: si hay varias, mostrar todas
  const currencies = payload?.filters?.countries?.length > 0
    ? [...new Set((payload.filters.countries).map(c => {
        const block = payload.byCountry?.[c];
        return block?.currency || "?";
      }))]
    : [params.currency || "MXN"];
  const monedaStr = currencies.join(" · ");
  const today     = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

  const metaRows = [
    ["Holding",          TEXTS.fixed.holdingFull],
    ["Cobertura",        coverageStr || "—"],
    ["Sucursales",       sucursalesStr],
    ["Período",          `${mesLabel} ${params.anio}`],
    ["Moneda",           monedaStr],
    ["Fecha de emisión", today],
  ];

  const rowH = 9;
  metaRows.forEach(([lbl, val], i) => {
    const ry = logoY + i * rowH;

    // Fondo alternado
    if (i % 2 === 0) {
      CU.fillRect(pdf, tableX, ry - 3, tableW, rowH, COLOR.ROW_ALT);
    }

    // Label (MUTED, right-aligned)
    pdf.setFont(FONT.family, "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(COLOR.MUTED[0], COLOR.MUTED[1], COLOR.MUTED[2]);
    pdf.text(lbl, labelEndX, ry + 2, { align: "right" });

    // Separador vertical dorado
    CU.line(pdf, sepX, logoY - 3, sepX, logoY + metaRows.length * rowH - 3, COLOR.GOLD, 0.5);

    // Valor (INK bold)
    pdf.setFont(FONT.family, "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(COLOR.INK[0], COLOR.INK[1], COLOR.INK[2]);
    const valLines = pdf.splitTextToSize(val, tableW - 48);
    pdf.text(valLines[0] || "", valX, ry + 2);
  });

  logoY += metaRows.length * rowH + 8;

  // ── Separador final ───────────────────────────────────────────────────────────
  CU.goldRule(pdf, cx - 35, logoY, 70);
  logoY += 12;

  // ── 7. Tagline itálica MUTED ──────────────────────────────────────────────────
  const tagline = payload?.branding?.tagline || params.tagline || "Business Intelligence · Centro de Reportes Corporativo";
  pdf.setFont(FONT.family, "italic");
  pdf.setFontSize(FONT.size.portada_subtitulo_desc);
  pdf.setTextColor(COLOR.MUTED[0], COLOR.MUTED[1], COLOR.MUTED[2]);
  pdf.text(tagline, cx, logoY, { align: "center" });
};

// ── Helper: carga imagen como DataURL ─────────────────────────────────────────
function _loadImageAsDataUrl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
    img.src = src;
  });
}
