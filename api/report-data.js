// ─── api/report-data.js ───────────────────────────────────────────────────────
// Endpoint del Report Engine. Única capa que consulta Supabase.
//
// Parámetros de entrada (query string):
//   Requeridos: stores (csv), anio, mes
//   Opcionales: holding, brand, countries (csv), reportType, modules (csv),
//               consolidationMode
//
// Salida:
//   {
//     params,
//     byCountry: {
//       "México":  { currency, kpis, kpis_previo, historico, ... },
//       "España":  { currency, kpis, kpis_previo, historico, ... },
//     },
//     ranking,         // ranking global entre todas las sucursales del reporte
//     ranking_previo,
//   }
//
// Nota sobre monedas:
//   El endpoint NUNCA consolida monedas automáticamente.
//   Si el reporte incluye México + España, los datos de cada país vienen separados.
//   La consolidación financiera (si el usuario la activa) es responsabilidad
//   de PayloadBuilder, no del endpoint.
//
// Compatibilidad legacy:
//   El parámetro "sucursales" sigue siendo aceptado como alias de "stores"
//   para no romper integraciones existentes.

const PAGE_SIZE = 1000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function monthISO(year, month) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

// Pagina automáticamente sobre PostgREST usando Range headers
async function fetchAll(url, filters, headers) {
  const rows = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams();
    for (const [k, v] of filters) params.append(k, v);
    const fullUrl = `${url}?${params}`;

    const res = await fetch(fullUrl, {
      headers: {
        ...headers,
        "Range-Unit": "items",
        Range: `${offset}-${offset + PAGE_SIZE - 1}`,
        Prefer: "count=none",
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} — ${body.slice(0, 300)}`);
    }

    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return rows;
}

async function query(base, view, select, filters, headers) {
  const url        = `${base}/rest/v1/${view}`;
  const allFilters = [["select", select], ...filters];
  return fetchAll(url, allFilters, headers);
}

// ─── Consultas por país ───────────────────────────────────────────────────────
// Ejecuta todas las queries necesarias para un conjunto de sucursales del mismo país.
// Devuelve el bloque de datos de ese país.

async function fetchCountryBlock(
  base, h,
  storeList, currency,
  fechaInicio, fechaFin,
  fechaPrevMes, fechaHistorico,
) {
  const sucursalFilter = `in.(${storeList.join(",")})`;

  const [
    kpis,
    kpis_previo,
    historico,
    renta,
    operativos,
    metas,
    ventas_diarias,
    productos,
    labor_semanal,
  ] = await Promise.all([

    query(base, "vw_kpis_ejecutivos",
      "sucursal,pais,moneda,mes,venta_neta,renta_mensual,renta_pct,labor_cost_pct,labor_estado,renta_estado",
      [["sucursal", sucursalFilter], ["mes", `eq.${fechaInicio}`]], h),

    query(base, "vw_kpis_ejecutivos",
      "sucursal,mes,venta_neta,renta_pct,labor_cost_pct",
      [["sucursal", sucursalFilter], ["mes", `eq.${fechaPrevMes}`]], h),

    query(base, "vw_kpis_ejecutivos",
      "sucursal,mes,venta_neta,renta_pct,labor_cost_pct",
      [["sucursal", sucursalFilter],
       ["mes", `gte.${fechaHistorico}`],
       ["mes", `lte.${fechaInicio}`],
       ["order", "mes.asc"]], h),

    query(base, "vw_renta_vs_ventas",
      "sucursal,mes,venta_neta_mes,renta_mensual,renta_pct,estado_kpi",
      [["sucursal", sucursalFilter], ["mes", `eq.${fechaInicio}`]], h),

    query(base, "vw_kpis_operativos_mensuales",
      "sucursal,venta_promedio_mensual,renta_mensual,nomina_total,renta_pct,labor_cost_pct,meta_operativa,cumplimiento_pct,semaforo_labor_cost,semaforo_renta",
      [["sucursal", sucursalFilter]], h),

    query(base, "vw_metas_operativas",
      "sucursal,pais,meta_operativa_fija",
      [["sucursal", sucursalFilter]], h),

    query(base, "vw_c_fecha",
      `Fecha,Sucursal,"Venta Neta",Documentos,"Ticket Medio","% Meta",Meta,"Estado KPI","Dia Semana"`,
      [["Sucursal", sucursalFilter],
       ["Fecha", `gte.${fechaInicio}`],
       ["Fecha", `lte.${fechaFin}`],
       ["order", "Fecha.asc"]], h),

    query(base, "vw_c_producto",
      `Sucursal,Producto,Categoria,Neto,Cantidad,Ordenes`,
      [["Sucursal", sucursalFilter],
       ["Fecha", `gte.${fechaInicio}`],
       ["Fecha", `lte.${fechaFin}`]], h),

    query(base, "vw_labor_cost",
      "sucursal,semana,fecha_inicio,fecha_fin,venta_neta,nomina_total,labor_cost_pct,estado_kpi",
      [["sucursal", sucursalFilter],
       ["fecha_inicio", `gte.${fechaInicio}`],
       ["fecha_fin", `lte.${fechaFin}`]], h),
  ]);

  return {
    currency,
    kpis,
    kpis_previo,
    historico,
    renta,
    operativos,
    metas,
    ventas_diarias,
    productos,
    labor_semanal,
  };
}

// ─── Mapa de país a moneda ────────────────────────────────────────────────────
// Fuente de verdad: Supabase (catalogo_sucursales.pais + moneda).
// Mientras no exista el endpoint /api/stores, se usa este mapa como fallback.
// Pre-M3: el wizard envía el país y la moneda correcta; el endpoint confía en él.
const COUNTRY_CURRENCY_FALLBACK = {
  "México":  "MXN",
  "España":  "EUR",
  "Mexico":  "MXN",
  "Espana":  "EUR",
};

// ─── Handler principal ────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Variables SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no configuradas" });
  }

  // ── Parámetros de entrada ──────────────────────────────────────────────────
  const {
    // Requeridos
    anio,
    mes,
    // Nuevo formato: stores + countries (multi-país)
    stores,
    countries,
    // Contexto del reporte
    holding,
    brand,
    reportType,
    consolidationMode = "operativa",
    // Legacy: "sucursales" como alias de "stores"
    sucursales,
  } = req.query;

  // Normalizar: "stores" tiene prioridad; "sucursales" es legacy alias
  const storesRaw = stores || sucursales;
  if (!storesRaw || !anio || !mes) {
    return res.status(400).json({ error: "Parámetros requeridos: stores (o sucursales), anio, mes" });
  }

  const allStores = storesRaw.split(",").map(s => s.trim()).filter(Boolean);
  if (!allStores.length) return res.status(400).json({ error: "Se requiere al menos una sucursal" });

  const yearNum  = parseInt(anio, 10);
  const monthNum = parseInt(mes, 10);
  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ error: "anio y mes deben ser números válidos" });
  }

  // ── Fechas ────────────────────────────────────────────────────────────────
  const fechaInicio  = monthISO(yearNum, monthNum);
  const fechaFin     = `${yearNum}-${String(monthNum).padStart(2, "0")}-${lastDayOfMonth(yearNum, monthNum)}`;
  const prevMonth    = monthNum === 1 ? 12 : monthNum - 1;
  const prevYear     = monthNum === 1 ? yearNum - 1 : yearNum;
  const fechaPrevMes = monthISO(prevYear, prevMonth);

  const hist6 = new Date(yearNum, monthNum - 1, 1);
  hist6.setMonth(hist6.getMonth() - 5);
  const fechaHistorico = monthISO(hist6.getFullYear(), hist6.getMonth() + 1);

  // ── Auth headers Supabase ──────────────────────────────────────────────────
  const h = {
    apikey:        SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    // ── Agrupar sucursales por país ──────────────────────────────────────────
    // El wizard envía countries[] y stores[] ya alineados.
    // Si no vienen países (compat legacy), todas las sucursales van al mismo bloque.
    let storesByCountry = {};

    if (countries) {
      const countryList = countries.split(",").map(c => c.trim()).filter(Boolean);

      // En el futuro: el wizard envía storesByCountry serializado o
      // lo resuelve el endpoint vía catalogo_sucursales.
      // Por ahora: si hay más de un país, el wizard debe enviar
      // "stores_<país>" en el query string. Si no, asignar al primer país.
      for (const country of countryList) {
        const paramKey = `stores_${country.replace(/\s+/g, "_")}`;
        const countryStores = req.query[paramKey]
          ? req.query[paramKey].split(",").map(s => s.trim()).filter(Boolean)
          : allStores.filter(s => {
              // Heurística de prefijo: sucursales con prefijo del país
              // (funciona mientras los prefijos sean distintos por país)
              // El wizard siempre debe enviar stores_<país> para multi-país.
              return true; // fallback: todas al primer país
            });

        if (countryStores.length) {
          storesByCountry[country] = countryStores;
        }
      }
    }

    // Fallback: un solo grupo con todas las sucursales
    if (!Object.keys(storesByCountry).length) {
      const defaultCountry = (countries || "").split(",")[0]?.trim() || "México";
      storesByCountry[defaultCountry] = allStores;
    }

    // ── Ranking global (todas las sucursales del reporte juntas) ────────────
    const allStoresFilter  = `in.(${allStores.join(",")})`;
    const [ranking, ranking_previo] = await Promise.all([
      query(SUPABASE_URL, "vw_ranking_sucursales",
        "sucursal,mes,venta_neta,renta_pct,labor_cost_pct,ranking_ventas",
        [["mes", `eq.${fechaInicio}`], ["order", "ranking_ventas.asc"]], h),

      query(SUPABASE_URL, "vw_ranking_sucursales",
        "sucursal,mes,venta_neta,ranking_ventas",
        [["sucursal", allStoresFilter], ["mes", `eq.${fechaPrevMes}`]], h),
    ]);

    // ── Datos por país en paralelo ───────────────────────────────────────────
    const byCountryEntries = await Promise.all(
      Object.entries(storesByCountry).map(async ([country, storeList]) => {
        const currency = COUNTRY_CURRENCY_FALLBACK[country] || "MXN";
        const block = await fetchCountryBlock(
          SUPABASE_URL, h,
          storeList, currency,
          fechaInicio, fechaFin,
          fechaPrevMes, fechaHistorico,
        );
        return [country, block];
      })
    );

    const byCountry = Object.fromEntries(byCountryEntries);

    // ── Respuesta ──────────────────────────────────────────────────────────
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      params: {
        holding:          holding || null,
        brand:            brand   || null,
        countries:        Object.keys(byCountry),
        stores:           allStores,
        anio:             yearNum,
        mes:              monthNum,
        fechaInicio,
        fechaFin,
        reportType:       reportType       || null,
        consolidationMode: consolidationMode,
      },
      byCountry,
      ranking,
      ranking_previo,
    });

  } catch (err) {
    console.error("[report-data]", err);
    return res.status(500).json({ error: err.message });
  }
}
