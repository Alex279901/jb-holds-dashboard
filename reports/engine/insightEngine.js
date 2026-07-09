// Motor de insights automáticos.
// Recibe los datos del reporte y devuelve textos ejecutivos basados en reglas de negocio.
// No inventa datos. Si no existe información, devuelve texto apropiado.

window.InsightEngine = (function () {
  const { THRESHOLD, fmtCurrency, fmtPct, variacion, fmtMes } = window.RC;

  // ── Helpers internos ────────────────────────────────────────────────────────
  function pct(v) { return parseFloat(v) || 0; }
  function currency(v) { return parseFloat(v) || 0; }

  function varLabel(pctVar) {
    if (pctVar === null || pctVar === undefined) return null;
    const n = parseFloat(pctVar);
    if (n >= THRESHOLD.crecimiento.fuerte) return { tipo: "crecimiento_fuerte", valor: n };
    if (n > 0) return { tipo: "crecimiento", valor: n };
    if (n <= THRESHOLD.crecimiento.caida) return { tipo: "caida_fuerte", valor: n };
    if (n < 0) return { tipo: "caida", valor: n };
    return { tipo: "estable", valor: n };
  }

  // ── 1. Insight de ventas consolidado ───────────────────────────────────────
  function insightVentas(kpis, kpis_previo, metas) {
    if (!kpis || !kpis.length) return "Sin información de ventas para el periodo seleccionado.";

    const totalActual = kpis.reduce((acc, r) => acc + currency(r.venta_neta), 0);
    const totalPrevio = kpis_previo ? kpis_previo.reduce((acc, r) => acc + currency(r.venta_neta), 0) : null;

    const lines = [];
    const metaTotal = metas ? metas.reduce((acc, m) => acc + currency(m.meta_operativa_fija), 0) : null;

    if (metaTotal && metaTotal > 0) {
      const cumplimiento = (totalActual / metaTotal) * 100;
      if (cumplimiento >= THRESHOLD.meta.green) {
        lines.push(`Las ventas consolidadas alcanzaron ${fmtCurrency(totalActual, "$")} MXN, superando la meta operativa con un cumplimiento del ${fmtPct(cumplimiento)}.`);
      } else if (cumplimiento >= THRESHOLD.meta.amber) {
        lines.push(`Las ventas consolidadas fueron ${fmtCurrency(totalActual, "$")} MXN, con un cumplimiento del ${fmtPct(cumplimiento)} respecto a la meta — dentro del rango de alerta.`);
      } else {
        lines.push(`Las ventas consolidadas de ${fmtCurrency(totalActual, "$")} MXN representan un cumplimiento del ${fmtPct(cumplimiento)} vs meta, por debajo del umbral mínimo esperado. Se requiere atención inmediata.`);
      }
    } else {
      lines.push(`Las ventas consolidadas del periodo alcanzaron ${fmtCurrency(totalActual, "$")} MXN. Sin meta registrada para comparación.`);
    }

    if (totalPrevio && totalPrevio > 0) {
      const varPct = variacion(totalActual, totalPrevio);
      const lbl = varLabel(varPct);
      if (lbl) {
        if (lbl.tipo === "crecimiento_fuerte") {
          lines.push(`Comparado con el mes anterior, se registró un crecimiento fuerte del ${fmtPct(lbl.valor)} — señal positiva de momentum operativo.`);
        } else if (lbl.tipo === "crecimiento") {
          lines.push(`Las ventas crecieron ${fmtPct(lbl.valor)} respecto al mes anterior.`);
        } else if (lbl.tipo === "caida_fuerte") {
          lines.push(`Se detecta una caída del ${fmtPct(Math.abs(lbl.valor))} vs el mes anterior. Se recomienda revisar operación y factores externos.`);
        } else if (lbl.tipo === "caida") {
          lines.push(`Las ventas disminuyeron ${fmtPct(Math.abs(lbl.valor))} frente al mes anterior.`);
        } else {
          lines.push("Las ventas se mantuvieron estables respecto al mes anterior.");
        }
      }
    }

    return lines.join(" ");
  }

  // ── 2. Insight por sucursal ────────────────────────────────────────────────
  function insightSucursales(kpis, kpis_previo) {
    if (!kpis || !kpis.length) return [];

    const prevMap = {};
    (kpis_previo || []).forEach((r) => { prevMap[r.sucursal] = r.venta_neta; });

    return kpis.map((r) => {
      const varPct = prevMap[r.sucursal] ? variacion(r.venta_neta, prevMap[r.sucursal]) : null;
      const lbl = varLabel(varPct);
      let texto = "";
      let tipo = "neutro";

      if (lbl) {
        if (lbl.tipo === "crecimiento_fuerte") {
          texto = `Crecimiento fuerte: +${fmtPct(lbl.valor)} vs mes anterior.`;
          tipo = "positivo";
        } else if (lbl.tipo === "crecimiento") {
          texto = `Creció ${fmtPct(lbl.valor)} vs mes anterior.`;
          tipo = "positivo";
        } else if (lbl.tipo === "caida_fuerte") {
          texto = `Caída de ${fmtPct(Math.abs(lbl.valor))} vs mes anterior — requiere revisión.`;
          tipo = "alerta";
        } else if (lbl.tipo === "caida") {
          texto = `Disminuyó ${fmtPct(Math.abs(lbl.valor))} vs mes anterior.`;
          tipo = "advertencia";
        } else {
          texto = "Ventas estables vs mes anterior.";
          tipo = "neutro";
        }
      } else {
        texto = "Sin datos del mes anterior para comparar.";
        tipo = "neutro";
      }

      return { sucursal: r.sucursal, tipo, texto, varPct };
    });
  }

  // ── 3. Insight de renta ────────────────────────────────────────────────────
  function insightRenta(renta) {
    if (!renta || !renta.length) return "Sin información de renta disponible para el periodo.";

    const alertas = renta.filter((r) => pct(r.renta_pct) > THRESHOLD.renta.amber);
    const ok = renta.filter((r) => pct(r.renta_pct) <= THRESHOLD.renta.green);

    const lines = [];
    if (ok.length === renta.length) {
      lines.push("El indicador de renta se encuentra dentro del rango saludable en todas las sucursales.");
    } else if (alertas.length) {
      const nombres = alertas.map((r) => `${r.sucursal} (${fmtPct(r.renta_pct)})`).join(", ");
      lines.push(`Las siguientes sucursales presentan un costo de renta elevado que requiere atención: ${nombres}.`);
      if (alertas.length < renta.length) {
        lines.push("El resto de las sucursales mantiene el indicador dentro del rango aceptable.");
      }
    }

    return lines.join(" ") || "Sin información de renta para el periodo.";
  }

  // ── 4. Insight de labor cost ───────────────────────────────────────────────
  function insightLabor(kpis) {
    if (!kpis || !kpis.length) return "Sin información de labor cost disponible.";

    const altas = kpis.filter((r) => pct(r.labor_cost_pct) > THRESHOLD.labor.amber);
    const ok = kpis.filter((r) => pct(r.labor_cost_pct) <= THRESHOLD.labor.green);

    if (!kpis.some((r) => r.labor_cost_pct != null)) return "Sin meta de nómina registrada.";

    const lines = [];
    if (ok.length === kpis.length) {
      lines.push("El labor cost está controlado en todas las sucursales, por debajo del umbral de alerta.");
    } else if (altas.length) {
      const nombres = altas.map((r) => `${r.sucursal} (${fmtPct(r.labor_cost_pct)})`).join(", ");
      lines.push(`Labor cost elevado detectado en: ${nombres}. Se recomienda revisar planilla y asignación de turnos.`);
    }

    return lines.join(" ") || "Sin alertas de labor cost en el periodo.";
  }

  // ── 5. Sucursal destacada (mejor y peor) ───────────────────────────────────
  function mejorYPeor(kpis) {
    if (!kpis || kpis.length < 2) return { mejor: null, peor: null };
    const sorted = [...kpis].sort((a, b) => currency(b.venta_neta) - currency(a.venta_neta));
    return { mejor: sorted[0], peor: sorted[sorted.length - 1] };
  }

  // ── 6. Conclusiones ejecutivas ─────────────────────────────────────────────
  function conclusiones(data) {
    const { kpis, kpis_previo, renta, operativos, metas, params } = data;
    const { mejor, peor } = mejorYPeor(kpis);
    const items = [];

    // Conclusión de ventas
    const totalActual = (kpis || []).reduce((acc, r) => acc + currency(r.venta_neta), 0);
    const totalPrevio = (kpis_previo || []).reduce((acc, r) => acc + currency(r.venta_neta), 0);
    const varPct = totalPrevio > 0 ? variacion(totalActual, totalPrevio) : null;

    if (varPct !== null) {
      const signo = varPct >= 0 ? "+" : "";
      items.push({
        tipo: varPct >= 0 ? "positivo" : "alerta",
        texto: `Ventas consolidadas ${signo}${fmtPct(varPct)} vs mes anterior (${fmtCurrency(totalActual, "$")} MXN total).`,
      });
    } else {
      items.push({ tipo: "neutro", texto: `Ventas consolidadas del mes: ${fmtCurrency(totalActual, "$")} MXN.` });
    }

    // Mejor sucursal
    if (mejor) {
      items.push({
        tipo: "positivo",
        texto: `Sucursal líder: ${mejor.sucursal} con ${fmtCurrency(mejor.venta_neta, "$")} MXN en ventas.`,
      });
    }

    // Peor sucursal (solo si hay diferencia significativa)
    if (peor && mejor && currency(peor.venta_neta) < currency(mejor.venta_neta) * 0.7) {
      items.push({
        tipo: "advertencia",
        texto: `${peor.sucursal} registró el menor volumen de ventas. Revisar operación y condiciones de mercado local.`,
      });
    }

    // Labor cost
    const laborAlerta = (operativos || []).filter((r) => pct(r.labor_cost_pct) > THRESHOLD.labor.amber);
    if (laborAlerta.length) {
      items.push({
        tipo: "alerta",
        texto: `Labor cost por encima del umbral en ${laborAlerta.length} sucursal${laborAlerta.length > 1 ? "es" : ""}: ${laborAlerta.map((r) => r.sucursal).join(", ")}.`,
      });
    }

    // Renta
    const rentaAlerta = (renta || []).filter((r) => pct(r.renta_pct) > THRESHOLD.renta.amber);
    if (rentaAlerta.length) {
      items.push({
        tipo: "alerta",
        texto: `Costo de renta elevado en: ${rentaAlerta.map((r) => r.sucursal).join(", ")}. Revisar contratos y negociación.`,
      });
    } else if (renta && renta.length) {
      items.push({ tipo: "positivo", texto: "Indicadores de renta dentro del rango aceptable en todas las sucursales." });
    }

    return items;
  }

  // ── 7. Recomendaciones ─────────────────────────────────────────────────────
  function recomendaciones(data) {
    const { kpis, operativos, renta, metas } = data;
    const items = [];

    const laborAlerta = (operativos || []).filter((r) => pct(r.labor_cost_pct) > THRESHOLD.labor.amber);
    if (laborAlerta.length) {
      items.push("Optimizar planilla y asignación de turnos en sucursales con labor cost > 35%. Revisar ausentismo y horas extra.");
    }

    const rentaAlerta = (renta || []).filter((r) => pct(r.renta_pct) > THRESHOLD.renta.amber);
    if (rentaAlerta.length) {
      items.push("Iniciar revisión de contratos de arrendamiento en sucursales con renta/ventas > 22%. Evaluar renegociación o ajuste de metas.");
    }

    const { mejor, peor } = mejorYPeor(kpis || []);
    if (mejor && peor && mejor.sucursal !== peor.sucursal) {
      items.push(`Analizar las prácticas operativas de ${mejor.sucursal} para replicar en sucursales con menor desempeño.`);
    }

    if (!metas || !metas.length) {
      items.push("Registrar metas operativas en el sistema para habilitar el cálculo automático de cumplimiento.");
    }

    if (!items.length) {
      items.push("Mantener los niveles operativos actuales. Monitorear indicadores semanalmente para detección temprana de desviaciones.");
    }

    return items;
  }

  return {
    insightVentas,
    insightSucursales,
    insightRenta,
    insightLabor,
    mejorYPeor,
    conclusiones,
    recomendaciones,
  };

})();
