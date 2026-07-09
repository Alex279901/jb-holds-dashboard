// ─── payloadBuilder.js ────────────────────────────────────────────────────────
// Convierte la respuesta de /api/report-data en el reportPayload oficial.
//
// Contrato:
//   PayloadBuilder.build(rawData, reportConfig) → reportPayload
//
// rawData    = respuesta JSON de /api/report-data
//              Formato:  { byCountry: { "México": { currency, kpis, ... }, ... }, ranking, ... }
//              Compat:   si rawData.byCountry no existe, se asume el formato plano legacy
//
// reportConfig = el objeto completo que produce el wizard:
//   { holding, brand, countries[], stores[], dateRange, reportType,
//     consolidationMode, exchangeRate, selectedModules[] }
//
// El payload resultante es determinista: mismo rawData + reportConfig → mismo payload.
// Las secciones de render NO vuelven a consultar Supabase.

window.PayloadBuilder = (function () {

  // ─── Helpers internos ────────────────────────────────────────────────────────

  const { IVA, TEXTS, MESES } = window.RC;

  function parseN(v) { return parseFloat(v) || 0; }

  function toStoreId(name) {
    return (name || "").replace(/\s+/g, "_");
  }

  function deriveBruto(neto, countryKey) {
    const iva = IVA[countryKey] || 0.16;
    return neto * (1 + iva);
  }

  function isCurrentMonth(anio, mes) {
    const now = new Date();
    return anio === now.getFullYear() && mes === (now.getMonth() + 1);
  }

  function periodLabel(mes, anio) {
    return `${MESES[(mes || 1) - 1] || ""} ${anio}`;
  }

  // Símbolo de moneda según código ISO
  const CURRENCY_SYMBOL = { MXN: "$", EUR: "€", USD: "$", GBP: "£" };
  function currencySymbol(code) { return CURRENCY_SYMBOL[code] || code; }

  // ─── 1. STORES ───────────────────────────────────────────────────────────────
  function buildStores(storeNames, brand, countryKey, currency) {
    return storeNames.map(name => ({
      storeId:  toStoreId(name),
      name,
      brand,
      country:  countryKey,
      currency,
      isNew:    false,   // TODO: leer de catalogo_sucursales.activo + openingDate
      active:   true,
      profile:  null,    // TODO: derivar de fecha apertura (Madura/Nueva/Reciente)
    }));
  }

  // ─── 2. CONSOLIDATED KPIs ────────────────────────────────────────────────────
  function buildConsolidatedKpis(kpis, ventas_diarias, metas, countryKey) {
    const totalNeto  = kpis.reduce((acc, r) => acc + parseN(r.venta_neta), 0);
    const totalBruto = deriveBruto(totalNeto, countryKey);
    const totalDocs  = ventas_diarias.reduce((acc, r) => acc + parseN(r["Documentos"]), 0);
    const metaTotal  = metas.reduce((acc, m) => acc + parseN(m.meta_operativa_fija), 0);

    return {
      neto:          totalNeto,
      bruto:         totalBruto,
      documentos:    totalDocs || null,
      ticketPromedio: totalDocs > 0 ? totalNeto / totalDocs : null,
      cumplimiento:  metaTotal > 0 ? (totalNeto / metaTotal) * 100 : null,
      storesCount:   kpis.length,
    };
  }

  // ─── 3. MONTHLY ──────────────────────────────────────────────────────────────
  function buildConsolidatedMonthly(historico, countryKey, anio, mes) {
    const byMes = {};
    historico.forEach(r => {
      const key = r.mes;
      if (!byMes[key]) byMes[key] = { neto: 0 };
      byMes[key].neto += parseN(r.venta_neta);
    });

    return Object.entries(byMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mesISO, d]) => {
        const dt    = new Date(mesISO + "T00:00:00");
        const month = dt.getMonth() + 1;
        const year  = dt.getFullYear();
        const neto  = d.neto;
        return {
          month, year, mesISO,
          neto,
          bruto:          deriveBruto(neto, countryKey),
          documentos:     null,
          ticketPromedio: null,
          partial:        isCurrentMonth(year, month),
        };
      });
  }

  // ─── 4. WEEKDAY ──────────────────────────────────────────────────────────────
  function buildWeekday(ventas_diarias, countryKey) {
    const ORDER = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
    const byDay = {};

    ventas_diarias.forEach(r => {
      const dia = r["Dia Semana"];
      if (!dia) return;
      if (!byDay[dia]) byDay[dia] = { neto: 0, docs: 0 };
      byDay[dia].neto += parseN(r["Venta Neta"]);
      byDay[dia].docs += parseN(r["Documentos"]);
    });

    return ORDER
      .filter(d => byDay[d])
      .map(d => ({
        weekday:    d,
        neto:       byDay[d].neto,
        bruto:      deriveBruto(byDay[d].neto, countryKey),
        documentos: byDay[d].docs || null,
      }));
  }

  // ─── 5. PRODUCTOS ────────────────────────────────────────────────────────────
  function buildProducts(productos, countryKey) {
    const byProduct = {};
    productos.forEach(r => {
      const name = r["Producto"] || "Sin nombre";
      const cat  = r["Categoria"] || null;
      if (!byProduct[name]) byProduct[name] = { name, category: cat, unidades: 0, neto: 0 };
      byProduct[name].neto     += parseN(r["Neto"]);
      byProduct[name].unidades += parseN(r["Cantidad"]);
    });

    const all = Object.values(byProduct)
      .map(p => ({ ...p, bruto: deriveBruto(p.neto, countryKey) }))
      .sort((a, b) => b.neto - a.neto);

    return {
      topProducts:    all.slice(0, 10),
      bottomProducts: [...all.filter(p => p.neto > 0)].reverse().slice(0, 10),
      allProducts:    all,
    };
  }

  // ─── 6. CATEGORÍAS ───────────────────────────────────────────────────────────
  function buildCategories(productos, countryKey) {
    const byCat = {};
    let hasCategory = false;

    productos.forEach(r => {
      const cat = r["Categoria"];
      if (!cat) return;
      hasCategory = true;
      if (!byCat[cat]) byCat[cat] = { name: cat, unidades: 0, neto: 0 };
      byCat[cat].neto     += parseN(r["Neto"]);
      byCat[cat].unidades += parseN(r["Cantidad"]);
    });

    if (!hasCategory) return [];

    const list = Object.values(byCat)
      .map(c => ({ ...c, bruto: deriveBruto(c.neto, countryKey) }))
      .sort((a, b) => b.neto - a.neto);

    const total = list.reduce((acc, c) => acc + c.neto, 0);
    return list.map(c => ({ ...c, partPct: total > 0 ? (c.neto / total) * 100 : 0 }));
  }

  // ─── 7. COMPARATIVES ─────────────────────────────────────────────────────────
  function buildComparatives(monthly) {
    const comparatives = [];
    for (let i = 1; i < monthly.length; i++) {
      const prev = monthly[i - 1];
      const curr = monthly[i];
      if (!prev.neto || prev.neto === 0) continue;

      const deltaAbs = curr.neto - prev.neto;
      const deltaPct = (deltaAbs / prev.neto) * 100;
      const absDelta = Math.abs(deltaPct);
      comparatives.push({
        metric:   "venta_neta",
        month:    curr.month,
        mesISO:   curr.mesISO,
        current:  curr.neto,
        previous: prev.neto,
        deltaAbs,
        deltaPct,
        trend: absDelta < 0.5 ? "FLAT" : deltaPct > 0 ? "UP" : "DOWN",
      });
    }
    return comparatives;
  }

  // ─── 8. BY STORE ─────────────────────────────────────────────────────────────
  function buildByStore(kpis, historico, productos, ventas_diarias, operativos, metas_raw, countryKey) {
    const byStore = {};

    kpis.forEach(r => {
      const storeId     = toStoreId(r.sucursal);
      const name        = r.sucursal;
      const neto        = parseN(r.venta_neta);
      const storeDiarios= ventas_diarias.filter(d => d["Sucursal"] === name);
      const totalDocs   = storeDiarios.reduce((acc, d) => acc + parseN(d["Documentos"]), 0);
      const ticketMedio = totalDocs > 0 ? neto / totalDocs : null;

      const storeHistorico = historico
        .filter(h => h.sucursal === name)
        .sort((a, b) => a.mes.localeCompare(b.mes))
        .map(h => {
          const dt    = new Date(h.mes + "T00:00:00");
          const month = dt.getMonth() + 1;
          const year  = dt.getFullYear();
          const n     = parseN(h.venta_neta);
          return { month, year, mesISO: h.mes, neto: n, bruto: deriveBruto(n, countryKey),
            documentos: null, ticketPromedio: null, partial: isCurrentMonth(year, month) };
        });

      const storeProd  = productos.filter(p => p["Sucursal"] === name);
      const prodByName = {};
      storeProd.forEach(p => {
        const pname = p["Producto"] || "Sin nombre";
        const cat   = p["Categoria"] || null;
        if (!prodByName[pname]) prodByName[pname] = { name: pname, category: cat, unidades: 0, neto: 0 };
        prodByName[pname].neto     += parseN(p["Neto"]);
        prodByName[pname].unidades += parseN(p["Cantidad"]);
      });
      const storeProducts = Object.values(prodByName)
        .sort((a, b) => b.neto - a.neto)
        .map(p => ({ ...p, bruto: deriveBruto(p.neto, countryKey) }));

      const op       = operativos.find(o => o.sucursal === name) || {};
      const meta     = metas_raw.find(m => m.sucursal === name) || {};
      const metaOp   = parseN(meta.meta_operativa_fija) || parseN(op.meta_operativa) || null;
      const cumplPct = metaOp && metaOp > 0 ? (neto / metaOp) * 100 : null;

      let estadoMeta = "SIN_META";
      if (cumplPct !== null) {
        estadoMeta = cumplPct >= 100 ? "VERDE" : cumplPct >= 90 ? "AMARILLO" : "ROJO";
      }

      byStore[storeId] = {
        kpiSet: {
          storeId, name, neto,
          bruto:                    deriveBruto(neto, countryKey),
          documentos:               totalDocs || null,
          comensales:               null,
          ticketMedio,
          gastoComensal:            null,
          meta:                     null,
          cumplimientoPct:          null,
          gapMeta:                  null,
          estadoMeta:               null,
          metaOperativa:            metaOp,
          cumplimientoOperativaPct: cumplPct,
          estadoMetaOperativa:      estadoMeta,
          gapMetaOperativa:         metaOp !== null ? neto - metaOp : null,
          rentaMensual:             parseN(r.renta_mensual) || null,
          rentaPct:                 parseN(r.renta_pct) || null,
          nomina:                   parseN(op.nomina_total) || null,
          laborCost:                parseN(r.labor_cost_pct) || null,
          estadoNomina:             r.labor_estado || null,
        },
        monthly:  storeHistorico,
        products: storeProducts,
        hours:    [],
      };
    });

    return byStore;
  }

  // ─── 9. RANKING ──────────────────────────────────────────────────────────────
  function buildRanking(ranking) {
    const filtered = (ranking || []).filter(r => parseN(r.venta_neta) > 0);
    const total    = filtered.reduce((acc, r) => acc + parseN(r.venta_neta), 0);

    return filtered.map(r => ({
      storeId: toStoreId(r.sucursal),
      name:    r.sucursal,
      value:   parseN(r.venta_neta),
      partPct: total > 0 ? (parseN(r.venta_neta) / total) * 100 : 0,
      rank:    r.ranking_ventas,
    }));
  }

  // ─── 10. METAS ───────────────────────────────────────────────────────────────
  function buildMetas(metas_raw, operativos, params) {
    const period = `${params.dateRange.anio}-${String(params.dateRange.mes).padStart(2, "0")}`;
    const metaMap = {};

    (metas_raw || []).forEach(m => {
      const id = toStoreId(m.sucursal);
      metaMap[id] = {
        storeId:       id, period,
        metaOperativa: parseN(m.meta_operativa_fija) || null,
        metaNominaPct: 0.28,
        metaRentaPct:  0.08,
      };
    });

    (operativos || []).forEach(op => {
      const id = toStoreId(op.sucursal);
      if (!metaMap[id]) metaMap[id] = { storeId: id, period, metaNominaPct: 0.28, metaRentaPct: 0.08 };
      if (!metaMap[id].metaOperativa && op.meta_operativa) {
        metaMap[id].metaOperativa = parseN(op.meta_operativa);
      }
    });

    return Object.values(metaMap);
  }

  // ─── 11. COSTS ───────────────────────────────────────────────────────────────
  function buildCosts(operativos, renta_raw, params) {
    const period = `${params.dateRange.anio}-${String(params.dateRange.mes).padStart(2, "0")}`;

    return (operativos || []).map(op => {
      const rv = (renta_raw || []).find(r => r.sucursal === op.sucursal) || {};
      return {
        storeId:      toStoreId(op.sucursal),
        period,
        rentaMensual: parseN(op.renta_mensual) || parseN(rv.renta_mensual) || null,
        rentaPct:     parseN(op.renta_pct) || parseN(rv.renta_pct) || null,
        nomina:       parseN(op.nomina_total) || null,
        laborCostPct: parseN(op.labor_cost_pct) || null,
        estadoNomina: op.semaforo_labor_cost || null,
        estadoRenta:  op.semaforo_renta || null,
      };
    });
  }

  // ─── 12. DATOS DE UN PAÍS (un bloque byCountry) ──────────────────────────────
  // Procesa los datos de un país y devuelve su bloque normalizado.
  function buildCountryBlock(countryData, countryKey, params) {
    const {
      currency       = "MXN",
      kpis           = [],
      kpis_previo    = [],
      historico      = [],
      ranking        = [],
      ranking_previo = [],
      renta          = [],
      operativos     = [],
      metas          = [],
      ventas_diarias = [],
      productos      = [],
      labor_semanal  = [],
    } = countryData;

    const { anio, mes } = params.dateRange;
    const { topProducts, bottomProducts, allProducts } = buildProducts(productos, countryKey);
    const categories   = buildCategories(productos, countryKey);
    const monthly      = buildConsolidatedMonthly(historico, countryKey, anio, mes);
    const weekday      = buildWeekday(ventas_diarias, countryKey);
    const comparatives = buildComparatives(monthly);
    const consKpis     = buildConsolidatedKpis(kpis, ventas_diarias, metas, countryKey);
    const byStore      = buildByStore(kpis, historico, productos, ventas_diarias, operativos, metas, countryKey);

    let paretoN = null;
    if (allProducts.length) {
      const total80 = allProducts.reduce((acc, p) => acc + p.neto, 0) * 0.8;
      let acc = 0, n = 0;
      for (const p of allProducts) {
        acc += p.neto; n++;
        if (acc >= total80) { paretoN = n; break; }
      }
    }

    const isPartial = isCurrentMonth(anio, mes);

    return {
      currency,
      symbol:    currencySymbol(currency),
      country:   countryKey,
      stores:    buildStores(
        kpis.map(r => r.sucursal),
        params.brand,
        countryKey,
        currency,
      ),
      consolidated: {
        kpis:   consKpis,
        monthly,
        weekday,
        weekly: [],
        topProducts,
        bottomProducts,
        categories,
        paretoInfo: {
          productsSortedByNeto_count: allProducts.length,
          paretoN,
          note: paretoN
            ? window.RC.TEXTS.templates.pareto.replace("{N}", paretoN)
            : null,
        },
      },
      byStore,
      ranking:      { byNeto: buildRanking(ranking) },
      metas:        buildMetas(metas, operativos, params),
      costs:        buildCosts(operativos, renta, params),
      comparatives,
      _raw: {
        labor_semanal,
        kpis_previo,
        ranking_previo,
      },
      _partial: isPartial,
    };
  }

  // ─── 13. BRANDING — construido desde reportConfig (nunca desde RC.BRAND) ──────
  function buildBranding(params) {
    // brandTitle: "SANTA GLORIA · MÉXICO" → lo construye el wizard desde brand + cobertura
    // El motor no conoce marcas; todo llega por parámetro.
    const brandLabel   = (params.brand || "").toUpperCase();
    const coverageLabel = (params.countries || []).map(c => c.toUpperCase()).join(" · ");
    const brandTitle   = coverageLabel
      ? `${brandLabel} · ${coverageLabel}`
      : brandLabel || "REPORTE EJECUTIVO";

    return {
      holding:    TEXTS.fixed.holding,
      holdingFull:TEXTS.fixed.holdingFull,
      holdingUrl: TEXTS.fixed.holdingUrl,
      logoRef:    "assets/indef-mark.png",
      brandTitle,
      // tagline viene de params si el wizard lo incluye (futuro); sino genérico
      tagline:    params.tagline || "Business Intelligence · Centro de Reportes Corporativo",
    };
  }

  // ─── 14. CONSOLIDACIÓN FINANCIERA (modo financiero) ──────────────────────────
  // Solo se ejecuta si consolidationMode === "financiera" y exchangeRate existe.
  // Devuelve un bloque adicional en payload.consolidatedFinanciero.
  function buildConsolidatedFinanciero(byCountryBlocks, exchangeRate, baseCurrency) {
    if (!exchangeRate || !baseCurrency) return null;

    let netoTotal = 0;
    const storeBreakdown = [];

    for (const [country, block] of Object.entries(byCountryBlocks)) {
      const rate = country === baseCurrency
        ? 1
        : (exchangeRate[`${block.currency}_${baseCurrency}`] || null);

      if (rate === null) continue; // sin tipo de cambio → no suma

      const netoConvertido = block.consolidated.kpis.neto * rate;
      netoTotal += netoConvertido;

      storeBreakdown.push({
        country,
        currency:        block.currency,
        netoOriginal:    block.consolidated.kpis.neto,
        rate,
        netoConvertido,
      });
    }

    return {
      baseCurrency,
      netoTotal,
      storeBreakdown,
      exchangeRate,
      disclaimer: TEXTS.fixed.note_consolidation_fx,
    };
  }

  // ─── 15. FUNCIÓN PRINCIPAL ───────────────────────────────────────────────────
  // Acepta tanto el formato nuevo (rawData.byCountry) como el formato legacy plano.
  function build(rawData, reportConfig) {
    const params  = reportConfig;
    const { anio, mes } = params.dateRange || {};

    // ── Normalizar a byCountry ──────────────────────────────────────────────────
    // Si rawData tiene byCountry → formato nuevo multi-país
    // Si no → compatibilidad con formato plano legacy (un solo país)
    let byCountryRaw;
    if (rawData.byCountry) {
      byCountryRaw = rawData.byCountry;
    } else {
      // Legacy: envolver los datos planos en un país derivado de params
      const legacyCountry = params.countries?.[0] || params.country || "México";
      const legacyCurrency = params.currency || "MXN";
      byCountryRaw = {
        [legacyCountry]: {
          currency:      legacyCurrency,
          kpis:          rawData.kpis          || [],
          kpis_previo:   rawData.kpis_previo   || [],
          historico:     rawData.historico      || [],
          ranking:       rawData.ranking        || [],
          ranking_previo:rawData.ranking_previo || [],
          renta:         rawData.renta          || [],
          operativos:    rawData.operativos     || [],
          metas:         rawData.metas          || [],
          ventas_diarias:rawData.ventas_diarias || [],
          productos:     rawData.productos      || [],
          labor_semanal: rawData.labor_semanal  || [],
        },
      };
    }

    // ── Construir bloque por país ────────────────────────────────────────────────
    const byCountry = {};
    for (const [countryKey, countryData] of Object.entries(byCountryRaw)) {
      byCountry[countryKey] = buildCountryBlock(countryData, countryKey, params);
    }

    // ── Stores totales (todas las sucursales del reporte) ───────────────────────
    const allStores = Object.values(byCountry).flatMap(b => b.stores);

    // ── Seleccionar bloque "principal" para compatibilidad con módulos M1–M2 ────
    // Si hay un solo país, ese es el principal. Si hay varios, el primero de countries[].
    const primaryCountry = params.countries?.[0] || Object.keys(byCountry)[0];
    const primary        = byCountry[primaryCountry] || Object.values(byCountry)[0];

    // ── Consolidación financiera (solo modo financiero) ──────────────────────────
    const consolidatedFinanciero =
      params.consolidationMode === "financiera"
        ? buildConsolidatedFinanciero(
            byCountry,
            params.exchangeRate,
            params.baseCurrency,
          )
        : null;

    // ── Partialidad ──────────────────────────────────────────────────────────────
    const isPartial     = isCurrentMonth(anio, mes);
    const partialMonths = primary?.consolidated?.monthly
      ?.filter(m => m.partial)
      .map(m => m.month) || [];

    // ── Payload final ────────────────────────────────────────────────────────────
    return {
      _meta: {
        spec:        "reportSchema.json v1.1.0",
        reportType:  params.reportType || "mensual_sucursal",
        generatedAt: new Date().toISOString(),
        reportConfig: params,
        consolidationMode: params.consolidationMode || "operativa",
        countries:   Object.keys(byCountry),
        dataProvenance: {
          real:    ["kpis","historico","ventas_diarias","productos","operativos","metas","ranking"],
          derived: ["bruto","ticketPromedio","comparatives","weekday","pareto","estadoMeta"],
          notas:   isPartial ? ["Mes en curso — datos parciales."] : [],
        },
      },

      // Identidad del reporte — construida desde reportConfig, sin RC.BRAND
      branding: buildBranding(params),

      filters: {
        holding:    params.holding || null,
        brand:      params.brand   || null,
        countries:  params.countries || [],
        storeIds:   allStores.map(s => s.storeId),
        reportType: params.reportType || "mensual_sucursal",
      },

      dateRange: {
        from:          rawData.params?.fechaInicio || `${anio}-${String(mes).padStart(2,"0")}-01`,
        to:            rawData.params?.fechaFin    || `${anio}-${String(mes).padStart(2,"0")}-30`,
        label:         periodLabel(mes, anio),
        granularity:   "monthly",
        partialMonths,
      },

      config: {
        consolidationMode: params.consolidationMode || "operativa",
        locale:            "es-MX",
        showBrutoNeto:     true,
        maxConclusionBullets: 10,
        roundMoney:        0,
        roundPct:          1,
      },

      // Lista plana de todas las sucursales del reporte (independiente de país)
      stores: allStores,

      // Bloque por país — la fuente oficial de datos para todos los módulos M3+
      // Cada módulo debe iterar byCountry y presentar datos separados por moneda.
      byCountry,

      // Accesos directos al país/bloque principal para compatibilidad con módulos M1–M2
      // que asumen un solo país. Solo válidos en modo operativo con 1 país.
      consolidated:  primary?.consolidated   || {},
      byStore:       primary?.byStore        || {},
      ranking:       primary?.ranking        || { byNeto: [] },
      metas:         primary?.metas          || [],
      costs:         primary?.costs          || [],
      comparatives:  primary?.comparatives   || [],
      _raw:          primary?._raw           || {},

      // Bloque financiero consolidado — solo en modo "financiera"
      consolidatedFinanciero,
    };
  }

  return { build, toStoreId };

})();
