// ─── reportEngine.js — Orquestador del Report Engine ─────────────────────────
//
// Pipeline completo:
//   reportConfig (del wizard)
//   → fetch /api/report-data                 [Supabase — fuente oficial de datos]
//   → PayloadBuilder.build()                 [normalización según /Reporteo]
//   → ModuleRegistry.resolvePages()          [selección + ordenación de módulos]
//   → ChartUtils.pageHeader()               [header estándar por página]
//   → page.renderFn()                        [render de cada módulo]
//   → pdf.save()                             [descarga]
//
// Separación de responsabilidades:
//   - Supabase: entrega datos
//   - PayloadBuilder: normaliza
//   - ModuleRegistry: decide qué módulos existen y cuáles aplican
//   - ReportProfiles: decide qué módulos usar por tipo de reporte
//   - ReportEngine: orquesta (no decide, no renderiza, no normaliza)
//   - Cada módulo: renderiza únicamente su propia sección

window.ReportEngine = (function () {

  // ─── Fetch de rawData desde /api/report-data ─────────────────────────────────
  async function fetchReportData(reportConfig) {
    const { sucursales, anio, mes } = reportConfig;
    if (!sucursales?.length)   throw new Error("Se requiere al menos una sucursal.");
    if (!anio || !mes)         throw new Error("Se requiere año y mes.");

    const qs = new URLSearchParams({
      sucursales: sucursales.join(","),
      anio:       String(anio),
      mes:        String(mes),
    });

    // Parámetros opcionales — preparados para optimización futura del endpoint
    if (reportConfig.reportType)            qs.set("reportType", reportConfig.reportType);
    if (reportConfig.country)               qs.set("country",    reportConfig.country);
    if (reportConfig.brand)                 qs.set("brand",      reportConfig.brand);
    if (reportConfig.selectedModules?.length) {
      qs.set("modules", reportConfig.selectedModules.join(","));
    }

    const res = await fetch(`/api/report-data?${qs}`, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Error ${res.status} al obtener datos.`);
    }

    return res.json();
  }

  // ─── Ensamblado de páginas ────────────────────────────────────────────────────
  function assemblePages(reportConfig, payload) {
    const registry = window.ModuleRegistry;
    const profile  = window.ReportProfiles?.[reportConfig.reportType];

    if (!registry) throw new Error("ModuleRegistry no disponible.");
    if (!profile)  throw new Error(`No existe perfil para "${reportConfig.reportType}".`);

    const selectedSet    = new Set(reportConfig.selectedModules || []);
    const orderedSelected = profile.order.filter(id => selectedSet.has(id));

    return registry.resolvePages(orderedSelected, payload);
    // resolvePages preserva `skipHeader` por módulo
  }

  // ─── Generador principal ─────────────────────────────────────────────────────
  async function generate(reportConfig, { onProgress } = {}) {
    if (!window.jspdf?.jsPDF) throw new Error("jsPDF no está disponible.");

    const progress = onProgress || (() => {});

    // PASO 1 — Fetch rawData desde Supabase
    progress("Consultando Supabase…");
    const rawData = await fetchReportData(reportConfig);

    // PASO 2 — Normalizar a reportPayload
    progress("Normalizando datos…");
    if (!window.PayloadBuilder) throw new Error("PayloadBuilder no disponible.");
    const payload = window.PayloadBuilder.build(rawData, reportConfig);

    console.group("[ReportEngine] Payload generado");
    console.log("Tipo:", payload._meta.reportType);
    console.log("Periodo:", payload.dateRange.label);
    console.log("Sucursales:", payload.stores.map(s => s.name));
    console.log("Neto consolidado:", payload.consolidated.kpis.neto);
    console.log("Pareto N:", payload.consolidated.paretoInfo.paretoN);
    console.groupEnd();

    // PASO 3 — Ensamblar páginas desde ModuleRegistry + perfil
    const pages = assemblePages(reportConfig, payload);
    if (!pages.length) throw new Error("No hay módulos disponibles para renderizar.");

    // PASO 4 — Inicializar PDF (portrait A4)
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pw  = pdf.internal.pageSize.getWidth();   // 210 mm
    const ph  = pdf.internal.pageSize.getHeight();  // 297 mm

    // PASO 5 — Datos para secciones
    // Las secciones actuales (M1 compat) leen de rawData directamente.
    // Las secciones nuevas (M2B+) leen de _payload.
    // _pages expone el array de páginas para que indexSection pueda construir el TOC.
    const dataForSections = {
      ...rawData,
      _payload: payload,
      _pages:   pages,
    };

    const total = pages.length;

    // PASO 6 — Render página a página
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      progress(`${page.label} (${i + 1} / ${total})…`);

      if (i > 0) pdf.addPage("a4", "portrait");

      // Header estándar — se omite si el módulo declara skipHeader: true (ej. portada)
      if (!page.skipHeader && window.ChartUtils?.pageHeader) {
        window.ChartUtils.pageHeader(pdf, pw, i + 1);
      }

      try {
        await page.renderFn(pdf, pw, ph, dataForSections, reportConfig, i + 1, total);
      } catch (err) {
        console.error(`[ReportEngine] Error en módulo "${page.label}":`, err);
        if (window.ChartUtils) {
          window.ChartUtils.fillRect(pdf, 0, 0, pw, ph, window.RC.COLOR.WHITE);
          window.ChartUtils.text(pdf, `Error en módulo: ${page.label}`, window.RC.PAGE.ml, 60, {
            size: 11, color: window.RC.COLOR.NEG, bold: true,
          });
          window.ChartUtils.text(pdf, err.message, window.RC.PAGE.ml, 72, {
            size: 8, color: window.RC.COLOR.MUTED,
          });
        }
      }
    }

    // PASO 7 — Nombre del archivo y descarga
    const { MESES } = window.RC;
    const mesLabel = MESES[(reportConfig.mes || 1) - 1] || String(reportConfig.mes);
    const marca    = (reportConfig.marca || reportConfig.brand || "Reporte").replace(/\s+/g, "_");
    const fileName = `Reporte_${marca}_${mesLabel}_${reportConfig.anio}.pdf`;

    pdf.save(fileName);
    progress("Listo.");
    return fileName;
  }

  // ─── Punto de entrada público ─────────────────────────────────────────────────
  async function run(reportConfig, { onProgress, onError, onComplete } = {}) {
    if (!reportConfig?.reportType) {
      const msg = "reportConfig.reportType es requerido.";
      if (onError) onError(msg); else console.error(msg);
      return;
    }

    try {
      const fileName = await generate(reportConfig, { onProgress });
      if (onComplete) onComplete(fileName);
    } catch (err) {
      console.error("[ReportEngine] Error:", err);
      if (onError) onError(err.message || "Error al generar el reporte.");
    }
  }

  return { run, fetchReportData };

})();
