// [DEPRECATED — Pre-M3]
// Este archivo NO se carga. Removido de indef/index.html en Pre-M3.
// Reemplazado por: reports/profiles/mensualSucursal.js + reports/wizard/reportWizard.js
// Conservado únicamente como referencia histórica. Puede eliminarse en M3.

window.ReportTemplates = window.ReportTemplates || {};

window.ReportTemplates.sgMexicoMonthly = {
  id: "sgMexicoMonthly",
  label: "Reporte Mensual — Santa Gloria México",
  marca: "Santa Gloria México",
  moneda: "MXN",
  defaultSucursales: ["SG Altabrisa", "SG La Isla", "SG Paseo Montejo"],

  // Secuencia de páginas del reporte.
  // Cada entrada tiene: id, label, renderFn.
  pages: [
    {
      id: "cover",
      label: "Portada",
      renderFn: async (pdf, pw, ph, data, params, pageNum, total) => {
        await window.ReportSections.cover(pdf, pw, ph, data, params);
      },
    },
    {
      id: "summary",
      label: "Resumen Ejecutivo",
      renderFn: async (pdf, pw, ph, data, params, pageNum, total) => {
        await window.ReportSections.summary(pdf, pw, ph, data, params, pageNum, total);
      },
    },
    {
      id: "sales",
      label: "Ventas del Periodo",
      renderFn: async (pdf, pw, ph, data, params, pageNum, total) => {
        await window.ReportSections.sales(pdf, pw, ph, data, params, pageNum, total);
      },
    },
    {
      id: "ranking",
      label: "Ranking de Sucursales",
      renderFn: async (pdf, pw, ph, data, params, pageNum, total) => {
        await window.ReportSections.ranking(pdf, pw, ph, data, params, pageNum, total);
      },
    },
    {
      id: "products",
      label: "Análisis de Productos",
      renderFn: async (pdf, pw, ph, data, params, pageNum, total) => {
        await window.ReportSections.products(pdf, pw, ph, data, params, pageNum, total);
      },
    },
    {
      id: "labor",
      label: "Labor Cost & Renta",
      renderFn: async (pdf, pw, ph, data, params, pageNum, total) => {
        await window.ReportSections.labor(pdf, pw, ph, data, params, pageNum, total);
      },
    },
    {
      id: "conclusions",
      label: "Conclusiones y Recomendaciones",
      renderFn: async (pdf, pw, ph, data, params, pageNum, total) => {
        await window.ReportSections.conclusions(pdf, pw, ph, data, params, pageNum, total);
      },
    },
  ],
};
