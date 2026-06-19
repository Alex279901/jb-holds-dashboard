const PAGE_SIZE = 1000;

async function fetchAllRows(baseUrl, authHeaders) {
  const rows = [];
  let offset = 0;

  while (true) {
    const rangeEnd = offset + PAGE_SIZE - 1;
    const response = await fetch(baseUrl, {
      headers: {
        ...authHeaders,
        "Range-Unit": "items",
        "Range": `${offset}-${rangeEnd}`,
        "Prefer": "count=none",
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status} — ${body}`);
    }

    const page = await response.json();
    rows.push(...page);

    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return rows;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas" });
  }

  const authHeaders = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };

  const views = [
    {
      key: "C_Fecha",
      view: "vw_c_fecha",
      select: 'Fecha,Sucursal,"Venta Neta",Documentos,Meta',
    },
    {
      key: "C_Hora",
      view: "vw_c_hora",
      select: 'Fecha,Sucursal,Hora,Venta,Docs,"Uds.V"',
    },
    {
      key: "C_Producto",
      view: "vw_c_producto",
      select: "Fecha,Sucursal,Producto,Categoria,Neto,Cantidad,Ordenes",
    },
  ];

  async function queryView({ key, view, select }) {
    const params = new URLSearchParams({ select });
    const url = `${SUPABASE_URL}/rest/v1/${view}?${params}`;
    try {
      const data = await fetchAllRows(url, authHeaders);
      return { key, data };
    } catch (err) {
      throw new Error(`Error consultando ${view}: ${err.message}`);
    }
  }

  let results;
  try {
    results = await Promise.all(views.map(queryView));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const payload = {};
  for (const { key, data } of results) {
    payload[key] = data;
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(payload);
}
