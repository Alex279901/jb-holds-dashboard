// ─── moduleRegistry.js — Fuente única de verdad de todos los módulos ──────────
//
// REGLAS DE ARQUITECTURA:
// 1. Todo módulo existente y futuro se registra ÚNICAMENTE aquí.
// 2. Los perfiles solo referencian IDs de este registry. Nunca duplican datos.
// 3. Cada módulo es completamente independiente: no conoce a los demás módulos.
// 4. requiresPayloadKeys declara qué datos del payload necesita cada módulo.
//    Permite auditar el impacto de cambios en Supabase y optimizar queries.
// 5. dataSources documenta qué vistas/tablas de Supabase alimentan cada módulo.
//    Uso: auditoría, documentación, impacto de cambios, optimización futura.
// 6. skipHeader: true indica que el engine NO dibuja el header estándar en esa página.
//
// Carga: después de todas las secciones, antes de reportEngine y reportWizard.

window.ModuleRegistry = (function () {

  const ALL_TYPES = [
    "mensual_sucursal",
    "semanal_red",
    "semanal_ejecutivo_comite",
    "anual_historico",
    "semestral_consolidado",
  ];

  const _registry = {

    // ── ESTRUCTURA ─────────────────────────────────────────────────────────────

    portada: {
      id:                  "portada",
      label:               "Portada",
      description:         "Portada ejecutiva con marca, periodo, KPIs de resumen y metadata.",
      group:               "Estructura",
      sectionFn:           window.ReportSections?.cover    || null,
      availableFor:        ALL_TYPES,
      requiredFor:         ALL_TYPES,
      requiresPayloadKeys: ["branding", "dateRange", "consolidated.kpis", "stores"],
      dataSources:         ["vw_kpis_ejecutivos"],
      hideWhen:            null,
      implemented:         true,
      skipHeader:          true,   // La portada gestiona su propio layout completo
    },

    indice: {
      id:                  "indice",
      label:               "Índice",
      description:         "Tabla de contenidos generada automáticamente a partir de los módulos incluidos.",
      group:               "Estructura",
      sectionFn:           window.ReportSections?.index    || null,
      availableFor:        ALL_TYPES,
      requiredFor:         ALL_TYPES,
      requiresPayloadKeys: [],
      dataSources:         [],     // No consulta Supabase; se construye desde el array de páginas
      hideWhen:            null,
      implemented:         true,   // M2B: indexSection.js implementado
      skipHeader:          false,
    },

    cierre: {
      id:                  "cierre",
      label:               "Cierre",
      description:         "Franja de cierre obligatoria con notas de metodología, alcance y disclaimers.",
      group:               "Estructura",
      sectionFn:           window.ReportSections?.closing  || null,
      availableFor:        ALL_TYPES,
      requiredFor:         ALL_TYPES,
      requiresPayloadKeys: ["branding", "dateRange", "stores"],
      dataSources:         [],     // No consulta Supabase; usa textos fijos del schema
      hideWhen:            null,
      implemented:         true,   // M2B: closingSection.js implementado
      skipHeader:          false,
    },

    // ── ANÁLISIS DE VENTAS ─────────────────────────────────────────────────────

    resumen_ejecutivo: {
      id:                  "resumen_ejecutivo",
      label:               "Resumen Ejecutivo",
      description:         "KPIs consolidados, hallazgos esenciales y las 5 conclusiones del periodo.",
      group:               "Análisis de Ventas",
      sectionFn:           window.ReportSections?.summary  || null,
      availableFor:        ["mensual_sucursal", "semanal_ejecutivo_comite", "anual_historico"],
      requiredFor:         ["mensual_sucursal", "semanal_ejecutivo_comite"],
      requiresPayloadKeys: ["consolidated.kpis", "consolidated.monthly", "metas", "costs"],
      dataSources:         ["vw_kpis_ejecutivos", "vw_metas_operativas", "vw_c_fecha"],
      hideWhen:            (p) => !p?.consolidated?.kpis?.neto,
      implemented:         true,
      skipHeader:          false,
    },

    cumplimiento_meta: {
      id:                  "cumplimiento_meta",
      label:               "Cumplimiento de Metas",
      description:         "Gráfica de barras de cumplimiento comercial y operativo por sucursal.",
      group:               "Análisis de Ventas",
      sectionFn:           window.ReportSections?.ranking  || null, // M3: reemplazar con cumplimientoSection
      availableFor:        ["mensual_sucursal", "semanal_red", "semestral_consolidado"],
      requiredFor:         [],
      requiresPayloadKeys: ["metas", "byStore", "ranking.byNeto"],
      dataSources:         ["vw_ranking_sucursales", "vw_metas_operativas"],
      hideWhen:            (p) => !(p?.metas?.length),
      implemented:         true,
      skipHeader:          false,
    },

    comparativa_semanal: {
      id:                  "comparativa_semanal",
      label:               "Comparativa Semanal",
      description:         "Ventas semana a semana del mes con variación porcentual y tendencia.",
      group:               "Análisis de Ventas",
      sectionFn:           window.ReportSections?.sales    || null, // M3: reemplazar con comparativaSemanalSection
      availableFor:        ["mensual_sucursal"],
      requiredFor:         [],
      requiresPayloadKeys: ["consolidated.monthly", "comparatives", "_raw.labor_semanal"],
      dataSources:         ["vw_kpis_ejecutivos", "vw_c_fecha"],
      hideWhen:            (p) => !(p?.consolidated?.monthly?.length),
      implemented:         true,
      skipHeader:          false,
    },

    dia_de_semana: {
      id:                  "dia_de_semana",
      label:               "Análisis por Día de Semana",
      description:         "Distribución de ventas por día y concentración del fin de semana.",
      group:               "Análisis de Ventas",
      sectionFn:           null,
      availableFor:        ["mensual_sucursal", "anual_historico", "semestral_consolidado"],
      requiredFor:         [],
      requiresPayloadKeys: ["consolidated.weekday"],
      dataSources:         ["vw_c_fecha"],
      hideWhen:            (p) => !(p?.consolidated?.weekday?.length),
      implemented:         false, // M3: crear diaSemanaSection.js
      skipHeader:          false,
    },

    evolucion_historica: {
      id:                  "evolucion_historica",
      label:               "Evolución Histórica",
      description:         "Gráfica de líneas y tabla de ventas mes a mes del periodo completo.",
      group:               "Análisis de Ventas",
      sectionFn:           null,
      availableFor:        ["anual_historico", "semestral_consolidado"],
      requiredFor:         ["semestral_consolidado"],
      requiresPayloadKeys: ["consolidated.monthly"],
      dataSources:         ["vw_kpis_ejecutivos"],
      hideWhen:            (p) => !(p?.consolidated?.monthly?.length),
      implemented:         false, // M3
      skipHeader:          false,
    },

    comparativo_mensual: {
      id:                  "comparativo_mensual",
      label:               "Comparativo Mensual",
      description:         "Variaciones mes a mes y diferencias absolutas con flechas de tendencia.",
      group:               "Análisis de Ventas",
      sectionFn:           null,
      availableFor:        ["anual_historico", "semestral_consolidado"],
      requiredFor:         ["semestral_consolidado"],
      requiresPayloadKeys: ["comparatives"],
      dataSources:         ["vw_kpis_ejecutivos"],
      hideWhen:            (p) => !(p?.comparatives?.length),
      implemented:         false, // M3
      skipHeader:          false,
    },

    // ── PRODUCTOS ──────────────────────────────────────────────────────────────

    top_productos: {
      id:                  "top_productos",
      label:               "Top 10 Productos",
      description:         "Los 10 productos de mayor venta del periodo con gráfica de barras y tabla.",
      group:               "Productos",
      sectionFn:           window.ReportSections?.products || null,
      availableFor:        ["mensual_sucursal", "anual_historico", "semestral_consolidado"],
      requiredFor:         ["mensual_sucursal"],
      requiresPayloadKeys: ["consolidated.topProducts"],
      dataSources:         ["vw_c_producto"],
      hideWhen:            (p) => !(p?.consolidated?.topProducts?.length),
      implemented:         true,
      skipHeader:          false,
    },

    bottom_productos: {
      id:                  "bottom_productos",
      label:               "Bottom 10 Productos",
      description:         "Los 10 productos de menor rotación, candidatos a revisión de menú.",
      group:               "Productos",
      sectionFn:           null,
      availableFor:        ["mensual_sucursal", "anual_historico"],
      requiredFor:         [],
      requiresPayloadKeys: ["consolidated.bottomProducts"],
      dataSources:         ["vw_c_producto"],
      hideWhen:            (p) => !(p?.consolidated?.bottomProducts?.length),
      implemented:         false, // M3
      skipHeader:          false,
    },

    top5_por_categoria: {
      id:                  "top5_por_categoria",
      label:               "Top 5 por Categoría",
      description:         "Los 5 productos más vendidos dentro de cada categoría principal.",
      group:               "Productos",
      sectionFn:           null,
      availableFor:        ["mensual_sucursal"],
      requiredFor:         [],
      requiresPayloadKeys: ["consolidated.categories", "consolidated.topProducts"],
      dataSources:         ["vw_c_producto", "catalogo_productos"],
      hideWhen:            (p) => !(p?.consolidated?.categories?.length),
      implemented:         false, // M3
      skipHeader:          false,
    },

    mix_pareto: {
      id:                  "mix_pareto",
      label:               "Mix de Ventas & Pareto",
      description:         "Distribución por categoría y curva de Pareto (~80% en N productos).",
      group:               "Productos",
      sectionFn:           null,
      availableFor:        ["mensual_sucursal", "anual_historico"],
      requiredFor:         [],
      requiresPayloadKeys: ["consolidated.categories", "consolidated.paretoInfo"],
      dataSources:         ["vw_c_producto", "catalogo_productos"],
      hideWhen:            (p) => !(p?.consolidated?.categories?.length),
      implemented:         false, // M3
      skipHeader:          false,
    },

    // ── COSTOS OPERATIVOS ──────────────────────────────────────────────────────

    labor_cost: {
      id:                  "labor_cost",
      label:               "Labor Cost & Nómina",
      description:         "Semáforos de labor cost, detalle de nómina semanal y análisis por sucursal.",
      group:               "Costos Operativos",
      sectionFn:           window.ReportSections?.labor    || null,
      availableFor:        ["mensual_sucursal", "semestral_consolidado", "semanal_ejecutivo_comite"],
      requiredFor:         [],
      requiresPayloadKeys: ["costs", "_raw.labor_semanal"],
      dataSources:         ["vw_kpis_operativos_mensuales", "vw_renta_vs_ventas", "vw_labor_cost"],
      hideWhen:            (p) => !(p?.costs?.length),
      implemented:         true,
      skipHeader:          false,
    },

    renta: {
      id:                  "renta",
      label:               "Renta / Ventas",
      description:         "Indicadores de renta mensual como porcentaje de ventas netas por sucursal.",
      group:               "Costos Operativos",
      sectionFn:           null,
      availableFor:        ["mensual_sucursal", "semestral_consolidado"],
      requiredFor:         [],
      requiresPayloadKeys: ["costs"],
      dataSources:         ["vw_renta_vs_ventas", "vw_kpis_ejecutivos"],
      hideWhen:            (p) => !(p?.costs?.some(c => c.rentaPct)),
      implemented:         false, // M3
      skipHeader:          false,
    },

    estructura_costos: {
      id:                  "estructura_costos",
      label:               "Estructura de Costos",
      description:         "Renta y labor cost consolidados con gráfica comparativa por sucursal.",
      group:               "Costos Operativos",
      sectionFn:           null,
      availableFor:        ["semestral_consolidado"],
      requiredFor:         [],
      requiresPayloadKeys: ["costs"],
      dataSources:         ["vw_kpis_operativos_mensuales", "vw_renta_vs_ventas"],
      hideWhen:            (p) => !(p?.costs?.length),
      implemented:         false, // M3
      skipHeader:          false,
    },

    // ── RANKING & COMPARATIVOS ─────────────────────────────────────────────────

    ranking_sucursales: {
      id:                  "ranking_sucursales",
      label:               "Ranking de Sucursales",
      description:         "Rankings por venta, cumplimiento, ticket, tráfico y costos.",
      group:               "Ranking & Comparativos",
      sectionFn:           null,
      availableFor:        ["semanal_ejecutivo_comite", "semestral_consolidado"],
      requiredFor:         [],
      requiresPayloadKeys: ["ranking.byNeto", "byStore"],
      dataSources:         ["vw_ranking_sucursales"],
      hideWhen:            null,
      implemented:         false, // M3
      skipHeader:          false,
    },

    desempeno_por_sucursal: {
      id:                  "desempeno_por_sucursal",
      label:               "Desempeño por Sucursal",
      description:         "Tendencias históricas, ranking horizontal y tabla de KPIs por sucursal.",
      group:               "Ranking & Comparativos",
      sectionFn:           null,
      availableFor:        ["semestral_consolidado"],
      requiredFor:         ["semestral_consolidado"],
      requiresPayloadKeys: ["byStore", "ranking.byNeto"],
      dataSources:         ["vw_kpis_ejecutivos", "vw_ranking_sucursales"],
      hideWhen:            null,
      implemented:         false, // M3
      skipHeader:          false,
    },

    // ── ANÁLISIS OPERATIVO ─────────────────────────────────────────────────────

    analisis_por_hora: {
      id:                  "analisis_por_hora",
      label:               "Análisis por Hora",
      description:         "Perfil horario normalizado y horas pico por sucursal.",
      group:               "Análisis Operativo",
      sectionFn:           null,
      availableFor:        ["semanal_ejecutivo_comite", "semestral_consolidado"],
      requiredFor:         [],
      requiresPayloadKeys: ["byStore"],
      dataSources:         ["vw_c_hora"],  // GAP: vw_c_hora no se fetcha en report-data.js aún
      hideWhen:            (p) => !Object.values(p?.byStore || {}).some(s => s.hours?.length),
      implemented:         false, // M3 + requiere agregar vw_c_hora al endpoint
      skipHeader:          false,
    },

    alertas: {
      id:                  "alertas",
      label:               "Alertas",
      description:         "Tabla de alertas disparadas automáticamente por umbrales de negocio.",
      group:               "Análisis Operativo",
      sectionFn:           null,
      availableFor:        ["semanal_ejecutivo_comite"],
      requiredFor:         ["semanal_ejecutivo_comite"],
      requiresPayloadKeys: ["consolidated.kpis", "costs", "metas"],
      dataSources:         ["vw_kpis_ejecutivos", "vw_kpis_operativos_mensuales", "vw_metas_operativas"],
      hideWhen:            null,
      implemented:         false, // M4
      skipHeader:          false,
    },

    // ── CIERRE ─────────────────────────────────────────────────────────────────

    insights: {
      id:                  "insights",
      label:               "Insights Automáticos",
      description:         "Hallazgos detectados automáticamente por el motor de reglas de negocio.",
      group:               "Cierre",
      sectionFn:           null,
      availableFor:        ALL_TYPES,
      requiredFor:         [],
      requiresPayloadKeys: ["consolidated.kpis", "consolidated.weekday", "costs", "metas"],
      dataSources:         ["vw_kpis_ejecutivos", "vw_c_fecha", "vw_kpis_operativos_mensuales"],
      hideWhen:            null,
      implemented:         false, // M4: insightEngine rewrite
      skipHeader:          false,
    },

    conclusiones: {
      id:                  "conclusiones",
      label:               "Conclusiones Ejecutivas",
      description:         "Hallazgos clave y orden de prioridades generados automáticamente por el motor.",
      group:               "Cierre",
      sectionFn:           window.ReportSections?.conclusions || null,
      availableFor:        ["mensual_sucursal", "semestral_consolidado"],
      requiredFor:         ["mensual_sucursal"],
      requiresPayloadKeys: ["consolidated.kpis", "costs", "metas", "byStore"],
      dataSources:         ["vw_kpis_ejecutivos", "vw_kpis_operativos_mensuales", "vw_renta_vs_ventas", "vw_metas_operativas"],
      hideWhen:            null,
      implemented:         true,
      skipHeader:          false,
    },

    recomendaciones: {
      id:                  "recomendaciones",
      label:               "Recomendaciones",
      description:         "Acciones accionables por sucursal con KPI a monitorear.",
      group:               "Cierre",
      sectionFn:           null,
      availableFor:        ["semanal_ejecutivo_comite", "semanal_red"],
      requiredFor:         [],
      requiresPayloadKeys: ["costs", "metas", "byStore"],
      dataSources:         ["vw_kpis_ejecutivos", "vw_kpis_operativos_mensuales", "vw_metas_operativas"],
      hideWhen:            null,
      implemented:         false, // M3
      skipHeader:          false,
    },

    plan_accion: {
      id:                  "plan_accion",
      label:               "Plan de Acción",
      description:         "Tabla de estrategias, sucursales objetivo y plazos de ejecución.",
      group:               "Cierre",
      sectionFn:           null,
      availableFor:        ["semanal_red", "semestral_consolidado"],
      requiredFor:         ["semestral_consolidado"],
      requiresPayloadKeys: [],
      dataSources:         [],
      hideWhen:            null,
      implemented:         false, // M3
      skipHeader:          false,
    },

    anexos: {
      id:                  "anexos",
      label:               "Anexos",
      description:         "Tablas de datos completas para referencia o auditoría.",
      group:               "Cierre",
      sectionFn:           null,
      availableFor:        ALL_TYPES,
      requiredFor:         [],
      requiresPayloadKeys: [],
      dataSources:         ["vw_c_fecha", "vw_c_producto"],
      hideWhen:            null,
      implemented:         false, // futuro
      skipHeader:          false,
    },

  }; // fin _registry

  // ── API pública ──────────────────────────────────────────────────────────────

  return {
    get(id) { return _registry[id] || null; },

    getAll() { return Object.values(_registry); },

    availableFor(reportType) {
      return Object.values(_registry).filter(m => m.availableFor.includes(reportType));
    },

    byGroup(reportType) {
      const modules = this.availableFor(reportType);
      const groups  = {};
      modules.forEach(m => {
        if (!groups[m.group]) groups[m.group] = [];
        groups[m.group].push(m);
      });
      return groups;
    },

    // Resuelve los IDs seleccionados a páginas renderizables.
    // Aplica: implemented, sectionFn, hideWhen(payload).
    // Propaga skipHeader para que el engine sepa cuándo omitir el header estándar.
    resolvePages(selectedModuleIds, payload) {
      return selectedModuleIds
        .map(id => _registry[id])
        .filter(Boolean)
        .filter(m => m.implemented && typeof m.sectionFn === "function")
        .filter(m => !m.hideWhen || !m.hideWhen(payload))
        .map(m => ({
          id:         m.id,
          label:      m.label,
          renderFn:   m.sectionFn,
          skipHeader: !!m.skipHeader,
        }));
    },
  };

})();
