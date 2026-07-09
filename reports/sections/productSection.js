// Página 5: Top productos por ventas y categoría.

window.ReportSections = window.ReportSections || {};

window.ReportSections.products = async function (pdf, pw, ph, data, params, pageNum, totalPages) {
  const { COLOR, fmtCurrency, fmtNumber, fmtPct, MESES } = window.RC;
  const CU = window.ChartUtils;

  CU.pageBackground(pdf, pw, ph);
  CU.fillRect(pdf, 0, 0, 4, ph, COLOR.accent);

  const ml = window.RC.PAGE.ml;
  const mr = pw - window.RC.PAGE.mr;
  const col = window.RC.PAGE.col;
  const mesLabel = MESES[(params.mes || 1) - 1] || "";

  CU.text(pdf, "ANÁLISIS DE PRODUCTOS", ml, 14, { size: 8, color: COLOR.accent, bold: true });
  CU.text(pdf, `${mesLabel} ${params.anio}`, mr, 14, { size: 7, color: COLOR.muted, align: "right" });
  CU.line(pdf, ml, 16, mr, 16, COLOR.border, 0.3);

  const { productos } = data;

  if (!productos || !productos.length) {
    CU.text(pdf, "Sin información de productos para el periodo seleccionado.", ml, 40, { size: 8, color: COLOR.dimmed });
    CU.pageFooter(pdf, pw, ph, pageNum, totalPages, `${params.marca || "Santa Gloria MX"} · ${mesLabel} ${params.anio}`);
    return;
  }

  // ── Agregar por producto ────────────────────────────────────────────────────
  const productoMap = {};
  productos.forEach((r) => {
    const key = r["Producto"] || "Sin nombre";
    const cat = r["Categoria"] || "Sin categoría";
    if (!productoMap[key]) productoMap[key] = { producto: key, categoria: cat, neto: 0, cantidad: 0, ordenes: 0 };
    productoMap[key].neto += parseFloat(r["Neto"] || 0);
    productoMap[key].cantidad += parseFloat(r["Cantidad"] || 0);
    productoMap[key].ordenes += parseFloat(r["Ordenes"] || 0);
  });

  const productoList = Object.values(productoMap).sort((a, b) => b.neto - a.neto);
  const totalNeto = productoList.reduce((acc, p) => acc + p.neto, 0);

  // ── Top 15 productos ───────────────────────────────────────────────────────
  CU.sectionHeader(pdf, `Top Productos — ${mesLabel} ${params.anio}`, ml, 22, col * 0.6);

  const top15 = productoList.slice(0, 15);
  const headers = [
    { label: "Producto", w: 75, align: "left" },
    { label: "Categoría", w: 42, align: "left" },
    { label: "Venta Neta", w: 38 },
    { label: "Cant.", w: 22 },
    { label: "% del Total", w: 28 },
  ];
  const rows = top15.map((p) => [
    p.producto.length > 28 ? p.producto.slice(0, 26) + "…" : p.producto,
    p.categoria,
    fmtCurrency(p.neto, "$"),
    fmtNumber(Math.round(p.cantidad)),
    fmtPct(totalNeto > 0 ? (p.neto / totalNeto) * 100 : 0),
  ]);

  CU.dataTable(pdf, headers, rows, ml, 26, { rowH: 5.5, fontSize: 6 });

  // ── Top categorías (resumen lateral) ──────────────────────────────────────
  const categoriaMap = {};
  productoList.forEach((p) => {
    if (!categoriaMap[p.categoria]) categoriaMap[p.categoria] = 0;
    categoriaMap[p.categoria] += p.neto;
  });
  const categorias = Object.entries(categoriaMap)
    .map(([cat, neto]) => ({ cat, neto }))
    .sort((a, b) => b.neto - a.neto);

  const rx = ml + col * 0.63;
  const ry = 22;

  CU.sectionHeader(pdf, "Por Categoría", rx, ry, col * 0.36);

  const catColors = [COLOR.accent, COLOR.green, COLOR.gold, COLOR.amber, COLOR.red, COLOR.muted];
  categorias.slice(0, 6).forEach((c, i) => {
    const cy = ry + 6 + i * 14;
    const barW = col * 0.34;
    const pct = totalNeto > 0 ? c.neto / totalNeto : 0;

    CU.text(pdf, c.cat.length > 22 ? c.cat.slice(0, 20) + "…" : c.cat, rx, cy, { size: 6.5, color: COLOR.white });
    CU.text(pdf, fmtCurrency(c.neto, "$"), rx + barW, cy, { size: 6.5, color: catColors[i] || COLOR.muted, align: "right" });
    CU.progressBar(pdf, rx, cy + 2, barW, 3, pct * 100, catColors[i] || COLOR.muted);
    CU.text(pdf, fmtPct(pct * 100), rx + barW, cy + 5, { size: 5.5, color: COLOR.dimmed, align: "right" });
  });

  // ── Nota si hay más productos ──────────────────────────────────────────────
  if (productoList.length > 15) {
    const noteY = 26 + 5.5 * (top15.length + 1) + 5;
    CU.text(pdf, `Mostrando top 15 de ${productoList.length} productos únicos del periodo.`, ml, Math.min(noteY, ph - 20), { size: 5.5, color: COLOR.dimmed });
  }

  CU.pageFooter(pdf, pw, ph, pageNum, totalPages, `${params.marca || "Santa Gloria MX"} · ${mesLabel} ${params.anio}`);
};
