// ─── profiles/mensualSucursal.js — Perfil: Reporte Mensual por Sucursal ────────
//
// Declara ÚNICAMENTE IDs del ModuleRegistry. No duplica definiciones.
// El wizard construye el formulario de módulos leyendo el registry.
//
// Orden canónico según reportRenderer.md §6:
//   Portada · Índice · 1 Resumen · 2 Cumplimiento meta · 3 Día de semana ·
//   4 Comparativa semanal · 5 Top 10 · 6 Bottom 10 · 7 Top 5 por categoría ·
//   8 Mix/Pareto · 9 Conclusiones · Cierre

window.ReportProfiles = window.ReportProfiles || {};

window.ReportProfiles["mensual_sucursal"] = {
  reportType:   "mensual_sucursal",
  label:        "Mensual por Sucursal",
  description:  "Reporte mensual de ventas, productos, costos y conclusiones.",
  granularity:  "monthly",

  // Módulos que el usuario NO puede desactivar
  requiredModules: [
    "portada",
    "indice",
    "resumen_ejecutivo",
    "top_productos",
    "conclusiones",
    "cierre",         // obligatorio — franja de cierre al final de todo reporte
  ],

  // Módulos activos por defecto; el usuario puede desactivarlos
  defaultModules: [
    "cumplimiento_meta",
    "comparativa_semanal",
    "labor_cost",
  ],

  // Módulos disponibles pero inactivos por defecto; el usuario puede activarlos
  availableModules: [
    "dia_de_semana",
    "bottom_productos",
    "top5_por_categoria",
    "mix_pareto",
    "renta",
    "insights",
    "anexos",
  ],

  // Orden canónico del reporte final.
  // El engine respeta este orden independientemente del orden de selección del usuario.
  // Los IDs no seleccionados se omiten automáticamente.
  order: [
    "portada",
    "indice",
    "resumen_ejecutivo",
    "cumplimiento_meta",
    "dia_de_semana",
    "comparativa_semanal",
    "top_productos",
    "bottom_productos",
    "top5_por_categoria",
    "mix_pareto",
    "labor_cost",
    "renta",
    "insights",
    "conclusiones",
    "anexos",
    "cierre",         // siempre al final
  ],
};
