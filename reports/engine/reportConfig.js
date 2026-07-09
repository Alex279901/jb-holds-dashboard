// ─── reportConfig.js — Fuente única de verdad del Report Engine ───────────────
// Tokens, umbrales, textos y formatters según /Reporteo/reportSchema.json v1.0.0
//
// Compatibilidad: exporta window.RC con las mismas funciones que antes.
// Los alias legacy (COLOR.accent, COLOR.pageBg, etc.) se mantienen durante M1
// para que las secciones existentes no rompan. Se eliminarán en M2.

window.RC = (function () {

  // ─── 1. DESIGN TOKENS — reportSchema.json → params.designTokens ────────────
  // Valores RGB para jsPDF + hex para referencia.
  const COLOR = {
    // ── Paleta oficial (spec) ──────────────────────────────────────────────────
    PRIMARY:  [0,   68,  107],   // #00446B — azul corporativo principal
    GOLD:     [184, 146, 74],    // #B8924A — dorado corporativo
    MID:      [46,  125, 168],   // #2E7DA8 — azul medio
    LIGHT:    [127, 178, 209],   // #7FB2D1 — azul claro
    PALE:     [207, 224, 236],   // #CFE0EC — azul muy claro
    INK:      [36,  55,  70],    // #243746 — texto principal (casi negro)
    POS:      [46,  125, 91],    // #2E7D5B — positivo / verde
    NEG:      [178, 58,  72],    // #B23A48 — negativo / rojo
    MUTED:    [107, 119, 133],   // #6B7785 — texto secundario
    GRID:     [199, 208, 218],   // #C7D0DA — líneas de cuadrícula
    AMBER:    [201, 146, 43],    // #C9922B — alerta ámbar
    RED_SOFT: [176, 96,  95],    // #B0605F — rojo suave (bottom products)
    ROW_ALT:  [244, 247, 250],   // #F4F7FA — filas alternas de tabla
    WHITE:    [255, 255, 255],   // #FFFFFF — fondo de página

    // ── Alias legacy — M1: mantener para no romper secciones existentes ────────
    // Se eliminarán en M2 cuando las secciones sean reescritas.
    pageBg:   [255, 255, 255],   // era [7,10,15] oscuro → ahora blanco (spec)
    cardBg:   [244, 247, 250],   // era oscuro → ROW_ALT
    cardBg2:  [207, 224, 236],   // era oscuro → PALE
    border:   [199, 208, 218],   // era [30,45,70] → GRID
    accent:   [0,   68,  107],   // era cyan → PRIMARY
    accentDim:[46,  125, 168],   // era cyan oscuro → MID
    white:    [36,  55,  70],    // era texto claro → INK (texto sobre fondo blanco)
    muted:    [107, 119, 133],   // igual → MUTED
    dimmed:   [199, 208, 218],   // era [71,85,105] → GRID
    green:    [46,  125, 91],    // → POS
    greenDim: [46,  125, 91],    // → POS
    amber:    [201, 146, 43],    // → AMBER
    amberDim: [201, 146, 43],    // → AMBER
    red:      [178, 58,  72],    // → NEG
    redDim:   [178, 58,  72],    // → NEG
    gold:     [184, 146, 74],    // → GOLD
  };

  // ─── 2. TIPOGRAFÍA — reportSchema.json → params.designTokens.typography ─────
  const FONT = {
    family: "helvetica",          // M2: registrar Carlito. Hasta entonces helvetica como fallback.
    // Tamaños en pt según spec:
    size: {
      portada_titulo:       24,
      portada_subtitulo_gold: 16,
      portada_subtitulo_desc: 12,
      banner:               13,
      h1_bloque:            12.5,
      cuerpo:               10,
      tabla:                8.5,
      caption:              8.5,
      kpi_valor:            16,
      kpi_label:            8.5,
      header_pie:           8,
    },
  };

  // ─── 3. LAYOUT DE PÁGINA — A4 Portrait (M2B) ────────────────────────────────
  // Spec: A4 vertical, márgenes 2.0 cm, ancho útil ≈17 cm.
  // Header estándar en cada página de contenido (excepto portada).
  // Pie de página: VACÍO (obligatorio según spec).
  const PAGE = {
    w:       210,   // mm — A4 portrait
    h:       297,   // mm — A4 portrait
    ml:       20,   // margen izquierdo (spec: 2.0 cm)
    mr:       20,   // margen derecho
    mt:       24,   // top del área de contenido (deja espacio al header estándar)
    mb:       20,   // margen inferior
    col:     170,   // ancho útil (210 - 20 - 20)
    headerY:   8,   // y del texto de header desde el top de página
    headerH:  12,   // alto total reservado al header (texto + separador + padding)
    orientation: "portrait",
  };

  // ─── 4. UMBRALES — reportSchema.json → params.thresholds ────────────────────
  const THRESHOLD = {
    // Cumplimiento de meta (estadoMeta)
    cumplimiento: {
      verde:    100,  // >= 100 → VERDE
      amarillo:  90,  // >= 90 and < 100 → AMARILLO
                      // < 90 → ROJO
    },
    // Bandas de color para gráfica de barras de cumplimiento
    cumplimientoChart: {
      gold:  90,   // >= 90% → GOLD
      mid:   75,   // >= 75% and < 90% → MID
                   // < 75% → RED_SOFT
    },
    // Renta / Ventas (KPI inverso)
    renta: {
      objetivo:  8,   // meta oficial: 8% (metaRentaPct)
      alerta:   15,   // >= 15% → AMBER alert (reportRules §8)
    },
    // Labor cost / Nómina (KPI inverso)
    labor: {
      objetivo:  28,  // meta oficial: 28% (metaNominaPct)
                      // <= 28% → VERDE; > 28% → ROJO (binario, spec reportRules §3.2)
    },
    // Variación (flechas ↑↓→)
    variation: {
      flatEpsilon: 0.5,  // |Δ%| < 0.5 → FLAT (→)
    },
    // Alertas — reportRules.md §8
    alerts: {
      noMeta_red:           55,   // cumplimiento < 55 → RED
      noMeta_amber:         70,   // cumplimiento >= 55 and < 70 → AMBER
      caida_ventas:        -10,   // variacion_ventas <= -10% → RED
      caida_documentos:    -10,   // variacion_documentos <= -10% → AMBER
      labor_alto:           28,   // labor_cost > 28% → AMBER
      renta_alta:           15,   // renta_sobre_ventas >= 15% → AMBER
    },
    // Oportunidades — reportRules.md §9
    concentration: 45,            // participacion_lider > 45% → riesgo concentración
    weekendLever:  50,            // %_fin_de_semana > 50% → palanca operativa
    paretoTarget:  80,            // 80% de venta en N productos
  };

  // ─── 5. KPIs INVERSOS — reportRules.md §3.3 ─────────────────────────────────
  // Para estos KPIs, una disminución es positiva (↑ cuando baja).
  const INVERSE_KPIS = ["renta_sobre_ventas", "labor_cost", "renta_pct", "labor_cost_pct"];

  // ─── 6. TEXTOS FIJOS — reportSchema.json → texts.fixed ──────────────────────
  // Textos institucionales del holding. El contenido de marca (brandTitle, tagline)
  // siempre proviene del payload.branding, nunca de este objeto.
  const TEXTS = {
    fixed: {
      // Holding — identidad institucional
      holding:              "INDEF",
      holdingFull:          "INDEF | Inversión en Desarrollo de Franquicias",
      holdingUrl:           "https://indef.mx/",
      // Header estándar de página — invariante por ser el holding emisor del reporte
      pageHeader:           "INDEF · Centro de Reportes Corporativo",
      // Disclaimers — invariantes de negocio
      disclaimer_neto:      "Cifras en venta neta (sin IVA) y bruta; la venta neta es la referencia principal.",
      disclaimer_finanzas:  "No se incluyen utilidad, estados financieros ni ROAS por no disponer de P&L ni inversión de marketing; el análisis financiero se cubre con la estructura de costos (renta y nómina).",
      note_partial:         "Los datos de {mes} son parciales (hasta el {dia}); no comparables directamente con meses completos.",
      note_consolidation_fx: "Cifras financieras consolidadas. Tipo de cambio: {pair} {rate} al {date} (fuente: {source}).",
      sin_meta:             "Sin meta",
      sin_info:             "Sin información disponible",
    },
    // Plantillas con placeholders — reportSchema.json → texts.templates
    templates: {
      kpi_variacion:     "{sign}{value}% vs {prevLabel}",
      dia_fuerte:        "El {diaFuerte} es el día más fuerte ({venta}, {part}%), frente al {diaFlojo} como más débil.",
      fin_de_semana:     "El bloque viernes-domingo concentra el {pct}% de la venta neta.",
      pareto:            "~80% de la venta neta se concentra en {N} productos.",
      cumplimiento_red:  "La red alcanzó el {cumpl}% de su meta operativa; {v} en verde, {a} en ámbar y {r} en rojo.",
      mejor_peor_mes:    "El mejor mes fue {mesTop} ({ventaTop}) y el más débil {mesBottom} ({ventaBottom}) —meses completos—.",
      crecimiento:       "Trayectoria entre {primerMes} y el último mes completo ({ultimoCompleto}): {sign}{pct}%.",
      lider:             "{store} concentra {part}% del negocio; {laggard} es la de menor volumen.",
      afluencia:         "La caída viene por menos visitas con ticket estable → reactivar tráfico.",
      concentracion:     "Riesgo de concentración: {store} aporta {part}% del total; mueve el consolidado.",
    },
    // Franjas horarias — reportSchema.json → texts.fixed.hourBands
    hourBands: {
      Manana:       "07-10",
      Mediodia:     "11-13",
      TardeTemprana:"14-16",
      TardeNoche:   "17-20",
      Noche:        "21-23",
      Madrugada:    "00-06",
    },
    // Glifos permitidos / prohibidos — reportSchema.json → params.designTokens.glyphs
    glyphs: {
      up:       "↑",
      down:     "↓",
      flat:     "→",
      dot:      "●",
      bullet:   "▪",
      forbidden: ["▲", "▼"],   // nunca usar en reportes
    },
  };

  // ─── 7. MESES ────────────────────────────────────────────────────────────────
  const MESES = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ];

  // ─── 8. COLORES SEMÁFORO ─────────────────────────────────────────────────────
  // RC.BRAND eliminado en Pre-M3. Toda la metadata de marca (brandTitle, tagline,
  // moneda, símbolo, cobertura) proviene exclusivamente del payload.branding,
  // construido por PayloadBuilder a partir del reportConfig del wizard.

  // Cumplimiento de meta — spec: VERDE>=100, AMARILLO>=90, ROJO<90
  function colorMeta(pct) {
    if (pct === null || pct === undefined || isNaN(pct)) return COLOR.MUTED;
    const n = parseFloat(pct);
    if (n >= THRESHOLD.cumplimiento.verde)    return COLOR.POS;
    if (n >= THRESHOLD.cumplimiento.amarillo) return COLOR.AMBER;
    return COLOR.NEG;
  }

  // Renta / Ventas — inverso: alerta si >= 15% (spec reportRules §8)
  function colorRenta(pct) {
    if (pct === null || pct === undefined || isNaN(pct)) return COLOR.MUTED;
    const n = parseFloat(pct);
    if (n < THRESHOLD.renta.objetivo)  return COLOR.POS;    // < 8% → excelente
    if (n < THRESHOLD.renta.alerta)    return COLOR.AMBER;  // 8–15% → en rango
    return COLOR.NEG;                                        // >= 15% → alerta
  }

  // Labor cost — binario: VERDE si <= 28%, ROJO si > 28% (spec reportRules §3.2)
  function colorLabor(pct) {
    if (pct === null || pct === undefined || isNaN(pct)) return COLOR.MUTED;
    const n = parseFloat(pct);
    return n <= THRESHOLD.labor.objetivo ? COLOR.POS : COLOR.NEG;
  }

  // Color por estado de texto (VERDE/AMARILLO/ROJO/SIN_META)
  function colorEstado(estado) {
    if (!estado) return COLOR.MUTED;
    const e = String(estado).toUpperCase();
    if (e === "VERDE")    return COLOR.POS;
    if (e === "AMARILLO") return COLOR.AMBER;
    if (e === "ROJO")     return COLOR.NEG;
    if (e === "SIN_META") return COLOR.MUTED;
    return COLOR.MUTED;
  }

  // Tendencia con soporte para KPIs inversos — reportRules §3.3
  function colorTrend(trend, kpiId) {
    const isInverse = INVERSE_KPIS.includes(kpiId);
    if (trend === "FLAT") return COLOR.MUTED;
    const isPositive = (trend === "UP" && !isInverse) || (trend === "DOWN" && isInverse);
    return isPositive ? COLOR.POS : COLOR.NEG;
  }

  // Variación numérica → color (spec §4: POS si >=0, NEG si <0)
  function colorVariation(deltaPct, isInverse) {
    if (deltaPct === null || deltaPct === undefined) return COLOR.MUTED;
    const n = parseFloat(deltaPct);
    const positive = isInverse ? n < 0 : n >= 0;
    return positive ? COLOR.POS : COLOR.NEG;
  }

  // ─── 10. CÁLCULO DE TENDENCIA ────────────────────────────────────────────────
  function calcTrend(deltaPct, kpiId) {
    if (deltaPct === null || deltaPct === undefined) return "FLAT";
    const n = parseFloat(deltaPct);
    if (Math.abs(n) < THRESHOLD.variation.flatEpsilon) return "FLAT";
    const isInverse = INVERSE_KPIS.includes(kpiId);
    if (!isInverse) return n > 0 ? "UP" : "DOWN";
    return n < 0 ? "UP" : "DOWN";   // inverso: baja = mejora = UP
  }

  function trendGlyph(trend) {
    if (trend === "UP")   return TEXTS.glyphs.up;
    if (trend === "DOWN") return TEXTS.glyphs.down;
    return TEXTS.glyphs.flat;
  }

  // ─── 11. FORMATTERS ──────────────────────────────────────────────────────────

  function fmtCurrency(value, symbol) {
    const sym = symbol || "$";
    if (value === null || value === undefined || isNaN(value)) return TEXTS.fixed.sin_info;
    const n = parseFloat(value);
    if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000)     return `${sym}${(n / 1_000).toFixed(1)}K`;
    return `${sym}${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  function fmtCurrencyFull(value, symbol) {
    const sym = symbol || "$";
    if (value === null || value === undefined || isNaN(value)) return TEXTS.fixed.sin_info;
    return `${sym}${parseFloat(value).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  function fmtPct(value, decimals) {
    const d = decimals !== undefined ? decimals : 1;
    if (value === null || value === undefined || isNaN(value)) return "—";
    return `${parseFloat(value).toFixed(d)}%`;
  }

  function fmtNumber(value) {
    if (value === null || value === undefined || isNaN(value)) return "—";
    return parseFloat(value).toLocaleString("es-MX");
  }

  function fmtMes(isoDate) {
    if (!isoDate) return "—";
    const d = new Date(isoDate + "T00:00:00");
    return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
  }

  function fmtMesCorto(isoDate) {
    if (!isoDate) return "—";
    const d = new Date(isoDate + "T00:00:00");
    return `${MESES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
  }

  // Variación % entre dos valores (devuelve null si no computable)
  function variacion(actual, previo) {
    if (previo === null || previo === undefined || parseFloat(previo) === 0) return null;
    return ((parseFloat(actual) - parseFloat(previo)) / parseFloat(previo)) * 100;
  }

  // Resuelve una plantilla de texto sustituyendo placeholders
  function resolveTpl(tpl, vars) {
    return tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
  }

  // ─── 12. IVA POR PAÍS ────────────────────────────────────────────────────────
  const IVA = { Mexico: 0.16, Espana: 0.10 };

  return {
    // Tokens
    COLOR, FONT, PAGE, THRESHOLD, INVERSE_KPIS,
    // Textos y constantes
    TEXTS, MESES, IVA,
    // Semáforos
    colorMeta, colorRenta, colorLabor, colorEstado, colorTrend, colorVariation,
    // Tendencia
    calcTrend, trendGlyph,
    // Formatters
    fmtCurrency, fmtCurrencyFull, fmtPct, fmtNumber, fmtMes, fmtMesCorto,
    // Helpers
    variacion, resolveTpl,
  };

})();
