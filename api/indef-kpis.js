export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas" });
  }

  const { fecha_inicio, fecha_fin, sucursales } = req.query;

  if (!fecha_inicio || !fecha_fin || !sucursales) {
    return res.status(400).json({ error: "Parámetros requeridos: fecha_inicio, fecha_fin, sucursales" });
  }

  const p_sucursales = sucursales.split(",").map((s) => s.trim()).filter(Boolean);

  if (!p_sucursales.length) {
    return res.status(400).json({ error: "Se requiere al menos una sucursal" });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/fn_indef_kpis`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_fecha_inicio: fecha_inicio,
        p_fecha_fin: fecha_fin,
        p_sucursales,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Supabase RPC HTTP ${response.status} — ${body}`);
    }

    const data = await response.json();
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
