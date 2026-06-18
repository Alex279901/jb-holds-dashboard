export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("URL VALUE:", process.env.SUPABASE_URL ? "OK" : "MISSING");
  console.log("KEY VALUE:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING");

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas" });
  }

  const headers = {
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
    console.log("Consultando:", url);
    let response;
    try {
      response = await fetch(url, { headers });
    } catch (networkError) {
      throw new Error(`Error consultando ${view}: ${networkError.message}`);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Error consultando ${view}: HTTP ${response.status} — ${body}`);
    }
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Error consultando ${view}: respuesta no es JSON válido`);
    }
    return { key, data };
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
