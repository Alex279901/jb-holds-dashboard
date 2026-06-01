// ═══════════════════════════════════════════════════════════════════════════
//  FRANCHISE HEALTH CENTER — JB HOLDS
//  Demo V1 · Datos reales hardcodeados · Preparado para Google Sheets
// ═══════════════════════════════════════════════════════════════════════════

// ── Definiciones de KPI + semáforos ──────────────────────────────────────
const KPI_DEFS = [
  {
    id: 'margenNeto',
    label: 'Margen de Utilidad Neta',
    meta: '> 15%',
    getStatus: v => v > 15 ? 'green' : v >= 10 ? 'amber' : 'red'
  },
  {
    id: 'foodCost',
    label: 'Costo de Alimentos',
    meta: '25% – 30%',
    getStatus: v => (v >= 25 && v <= 30) ? 'green' : ((v >= 22 && v < 25) || (v > 30 && v <= 33)) ? 'amber' : 'red'
  },
  {
    id: 'laborCost',
    label: 'Costo de Nómina',
    meta: '< 28%',
    getStatus: v => v < 28 ? 'green' : v <= 32 ? 'amber' : 'red'
  },
  {
    id: 'rentRatio',
    label: 'Renta / Ventas',
    meta: '< 8%',
    getStatus: v => v < 8 ? 'green' : v <= 10 ? 'amber' : 'red'
  },
  {
    id: 'rotacion',
    label: 'Rotación de Personal',
    meta: '< 15%',
    getStatus: v => v < 15 ? 'green' : v <= 20 ? 'amber' : 'red'
  },
  {
    id: 'ausencias',
    label: 'Ausencias Injustificadas',
    meta: '< 5 / mes',
    getStatus: v => v <= 4 ? 'green' : v <= 8 ? 'amber' : 'red'
  },
  {
    id: 'retardos',
    label: 'Retardos',
    meta: '< 3 / mes',
    getStatus: v => v <= 2 ? 'green' : v <= 5 ? 'amber' : 'red'
  }
];

const FUTURE_KPI_DEFS = [
  { id: 'payback',       label: 'Payback',                meta: '< 48 meses' },
  { id: 'apertura',      label: 'Tiempo de Apertura',     meta: '< 120 días' },
  { id: 'nps',           label: 'NPS',                    meta: '> 70'       },
  { id: 'auditoria',     label: 'Auditoría Operativa',    meta: '> 90%'      },
  { id: 'satisfaccion',  label: 'Satisfacción del Cliente', meta: '> 85%'    }
];

// ── Datos maestros de unidades ────────────────────────────────────────────
const UNITS = [
  {
    id: 'sgpm',
    name: 'SG Paseo Montejo',
    shortName: 'PDM',
    brand: 'Santagloria',
    data: { margenNeto: 17.48, foodCost: 29.75, laborCost: 24.16, rentRatio: 9.02, rotacion: 6.00, ausencias: 7, retardos: 0 },
    lectura: 'Indicadores financieros y operativos dentro de rango. Renta/Ventas requiere seguimiento.',
    color: '#7cc9a8'
  },
  {
    id: 'sgla',
    name: 'SG La Isla',
    shortName: 'La Isla',
    brand: 'Santagloria',
    data: { margenNeto: 15.19, foodCost: 24.42, laborCost: 23.34, rentRatio: 14.16, rotacion: 20.98, ausencias: 15, retardos: 1 },
    lectura: 'Margen positivo sostenido. Renta y rotación de personal requieren plan de acción.',
    color: '#9db9c7'
  },
  {
    id: 'amcdam',
    name: 'AMC DAM',
    shortName: 'AMC',
    brand: 'Allô Mon Coco',
    data: { margenNeto: -7.00, foodCost: 40.54, laborCost: 33.55, rentRatio: 6.48, rotacion: 16.63, ausencias: 2, retardos: 2 },
    lectura: 'Margen negativo. Food Cost y Labor Cost críticos. Plan de turnaround requerido.',
    color: '#c46b73'
  }
];

// ── Datos históricos mensuales (sparklines y drill-down únicamente) ───────
// Los consolidados en UNITS[].data son la fuente oficial — NO modificar.
const UNIT_MONTHLY = {
  labels:    ['Ene', 'Feb', 'Mar', 'Abr'],
  labelsRot: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
  sgpm: {
    margenNeto: [ 48.04,  18.02, -28.64,  4.83],
    foodCost:   [ 24.93,  25.63,  42.06, 32.27],
    laborCost:  [ 16.71,  32.03,  48.42, 30.49],
    rentRatio:  [  0.00,  10.34,  14.51, 11.28],
    rotacion:   [  0.00,   0.00,  16.67,  0.00, 13.33],
    ausencias:  [  null,   null,   null,  null,  7],
    retardos:   [  null,   null,   null,  null,  0]
  },
  sgla: {
    margenNeto: [ 28.77,  20.18,  17.33, 13.52],
    foodCost:   [ 20.74,  20.04,  26.99, 19.24],
    laborCost:  [ 19.59,  37.93,  27.86, 23.59],
    rentRatio:  [  0.00,   5.74,   0.00, 19.10],
    rotacion:   [ 20.68,  20.68,  19.35, 17.14, 27.03],
    ausencias:  [  null,   null,   null,  null, 15],
    retardos:   [  null,   null,   null,  null,  1]
  },
  amcdam: {
    margenNeto: [  null,   4.57,  16.90, 14.86],
    foodCost:   [  null,  32.10,  35.30, 40.43],
    laborCost:  [  null,  29.13,  22.55, 22.50],
    rentRatio:  [  null,   7.83,   5.77,  6.21],
    rotacion:   [ 19.60,  28.57,  27.59,  7.41,  0.00],
    ausencias:  [  null,   null,   null,  null,  2],
    retardos:   [  null,   null,   null,  null,  2]
  }
};

// ── Health Score (ponderado, calculado automáticamente) ───────────────────
const WEIGHTS = { margenNeto: 30/90, foodCost: 15/90, laborCost: 15/90, rentRatio: 15/90, rotacion: 15/90 };

const STATUS = {
  green: { hex: '#7cc9a8', bg: 'rgba(124,201,168,0.13)', border: 'rgba(124,201,168,0.36)', label: 'En Meta'  },
  amber: { hex: '#c9a96a', bg: 'rgba(201,169,106,0.13)', border: 'rgba(201,169,106,0.36)', label: 'Vigilar'  },
  red:   { hex: '#c46b73', bg: 'rgba(196,107,115,0.13)', border: 'rgba(196,107,115,0.36)', label: 'Acción'   }
};

function kpiStatus(kpiId, value) {
  return KPI_DEFS.find(k => k.id === kpiId).getStatus(value);
}

function kpiPoints(kpiId, value) {
  const s = kpiStatus(kpiId, value);
  return s === 'green' ? 100 : s === 'amber' ? 50 : 0;
}

function healthScore(unit) {
  return Math.round(
    Object.entries(WEIGHTS).reduce((sum, [id, w]) => sum + kpiPoints(id, unit.data[id]) * w, 0)
  );
}

function unitRiskLevel(unit) {
  const reds = KPI_DEFS.filter(k => k.getStatus(unit.data[k.id]) === 'red').length;
  const margenRed = KPI_DEFS.find(k => k.id === 'margenNeto').getStatus(unit.data.margenNeto) === 'red';
  if (margenRed || reds >= 3) return 'critical';
  if (reds >= 1) return 'attention';
  return 'stable';
}

// ── Formato de valor ───────────────────────────────────────────────────────
function fmtVal(kpiId, val) {
  if (kpiId === 'ausencias' || kpiId === 'retardos') return `${val}`;
  return val < 0 ? `${val.toFixed(2)}%` : `${val}%`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  RENDER — HERO COMPACTO
// ═══════════════════════════════════════════════════════════════════════════
function renderHeroUnits() {
  const el = document.querySelector('#heroUnits');
  if (!el) return;

  el.innerHTML = UNITS.map(u => {
    const score = healthScore(u);
    const scoreColor = score >= 75 ? STATUS.green.hex : score >= 45 ? STATUS.amber.hex : STATUS.red.hex;
    const kpisToShow = ['margenNeto','foodCost','laborCost','rentRatio'];

    const kpiCells = kpisToShow.map(id => {
      const def = KPI_DEFS.find(k => k.id === id);
      const s = def.getStatus(u.data[id]);
      const c = STATUS[s];
      return `<div class="hu-kpi">
        <span class="hu-kpi-label">${def.label.split(' ').slice(0,2).join(' ')}</span>
        <span class="hu-kpi-value" style="color:${c.hex}">${fmtVal(id, u.data[id])}</span>
      </div>`;
    }).join('');

    return `
      <article class="hero-unit-card">
        <div class="hu-top">
          <div>
            <div class="hu-brand">${u.brand}</div>
            <div class="hu-name">${u.name}</div>
          </div>
          <div class="hu-score-wrap">
            <span class="hu-score-num" style="color:${scoreColor}">${score}</span>
            <span class="hu-score-label">Health Score</span>
          </div>
        </div>
        <div class="hu-kpis">${kpiCells}</div>
      </article>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
//  RENDER — RESUMEN DE ESTADO POR UNIDAD
// ═══════════════════════════════════════════════════════════════════════════
function renderStatusSummary() {
  const el = document.querySelector('#statusSummary');
  if (!el) return;

  el.innerHTML = UNITS.map(u => {
    const counts = { green: 0, amber: 0, red: 0 };
    KPI_DEFS.forEach(k => counts[k.getStatus(u.data[k.id])]++);
    const score = healthScore(u);
    const scoreColor = score >= 75 ? STATUS.green.hex : score >= 45 ? STATUS.amber.hex : STATUS.red.hex;
    const risk = unitRiskLevel(u);
    const riskLabel = risk === 'critical' ? 'RIESGO CRÍTICO' : risk === 'attention' ? 'ATENCIÓN PRIORITARIA' : 'OPERACIÓN ESTABLE';
    const riskColor = risk === 'critical' ? STATUS.red.hex : risk === 'attention' ? STATUS.amber.hex : STATUS.green.hex;

    return `
      <div class="ss-card">
        <div class="ss-name">${u.name}</div>
        <div class="ss-indicators">
          <span class="ss-dot green">${counts.green}</span>
          <span class="ss-dot amber">${counts.amber}</span>
          <span class="ss-dot red">${counts.red}</span>
        </div>
        <div class="ss-score" style="color:${scoreColor}">${score}<span>pts</span></div>
        <div class="ss-risk" style="color:${riskColor}">${riskLabel}</div>
      </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
//  RENDER — MATRIZ KPI PREMIUM (EL CORAZÓN)
// ═══════════════════════════════════════════════════════════════════════════
function renderKpiMatrix() {
  const el = document.querySelector('#kpiMatrix');
  if (!el) return;

  function sparkSvg(kpiId, unitId) {
    const mu = UNIT_MONTHLY[unitId];
    if (!mu) return '';
    const vals = mu[kpiId];
    if (!vals) return '';
    const available = vals.filter(v => v !== null);
    if (available.length === 0) return '';
    const def = KPI_DEFS.find(k => k.id === kpiId);
    if (!def) return '';
    const W = 64, H = 18, n = vals.length;
    const bw = Math.floor((W - (n - 1) * 2) / n);
    const maxV = Math.max(...available.map(v => Math.abs(v)), 1);
    const bars = vals.map((v, i) => {
      const x = i * (bw + 2);
      if (v === null) return `<rect x="${x}" y="${H - 2}" width="${bw}" height="2" fill="rgba(255,255,255,0.1)" rx="1"/>`;
      const s = def.getStatus(v);
      const col = STATUS[s].hex;
      const h = Math.max(2, Math.round((Math.abs(v) / maxV) * (H - 2)));
      return `<rect x="${x}" y="${H - h}" width="${bw}" height="${h}" fill="${col}" rx="1" opacity="0.75"/>`;
    }).join('');
    return `<svg class="mx-spark" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${bars}</svg>`;
  }

  function statusCell(kpiId, val, unitId) {
    const s = kpiStatus(kpiId, val);
    const c = STATUS[s];
    return `<td class="mx-cell mx-cell-click" data-kpiid="${kpiId}" data-unitid="${unitId}">
      <div class="mx-value" style="color:${c.hex}">${fmtVal(kpiId, val)}</div>
      <span class="mx-pill" style="background:${c.bg};border-color:${c.border};color:${c.hex}">${c.label}</span>
      ${sparkSvg(kpiId, unitId)}
    </td>`;
  }

  function pendingCell() {
    return `<td class="mx-cell mx-pending">
      <span class="mx-pending-badge">Pendiente de captura</span>
    </td>`;
  }

  // Data KPI rows
  const dataRows = KPI_DEFS.map(def => `
    <tr class="mx-row">
      <td class="mx-kpi-col">
        <div class="mx-kpi-name">${def.label}</div>
        <div class="mx-kpi-meta">Meta: ${def.meta}</div>
      </td>
      ${UNITS.map(u => statusCell(def.id, u.data[def.id], u.id)).join('')}
    </tr>`).join('');

  // Future KPI rows
  const futureRows = FUTURE_KPI_DEFS.map(def => `
    <tr class="mx-row mx-future-row">
      <td class="mx-kpi-col">
        <div class="mx-kpi-name">${def.label}</div>
        <div class="mx-kpi-meta">Meta: ${def.meta}</div>
      </td>
      ${UNITS.map(() => pendingCell()).join('')}
    </tr>`).join('');

  el.innerHTML = `
    <table class="mx-table" aria-label="Matriz de KPIs críticos por unidad">
      <thead>
        <tr>
          <th class="mx-kpi-col mx-th">Indicador</th>
          ${UNITS.map(u => `<th class="mx-th mx-unit-th">
            <div class="mx-unit-name">${u.name}</div>
            <div class="mx-unit-brand">${u.brand}</div>
          </th>`).join('')}
        </tr>
      </thead>
      <tbody>${dataRows}${futureRows}</tbody>
    </table>`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  RENDER — HEALTH SCORE RINGS (SVG animados)
// ═══════════════════════════════════════════════════════════════════════════
function renderScoreRings() {
  const el = document.querySelector('#scoreRings');
  if (!el) return;

  el.innerHTML = UNITS.map(u => {
    const score = healthScore(u);
    const color = score >= 75 ? STATUS.green.hex : score >= 45 ? STATUS.amber.hex : STATUS.red.hex;
    const bgColor = score >= 75 ? STATUS.green.bg : score >= 45 ? STATUS.amber.bg : STATUS.red.bg;
    const classification = score >= 75 ? 'Saludable' : score >= 45 ? 'En Seguimiento' : 'Requiere Intervención';
    const risk = unitRiskLevel(u);
    const stateLabel = risk === 'critical' ? 'RIESGO CRÍTICO' : risk === 'attention' ? 'ATENCIÓN PRIORITARIA' : 'OPERACIÓN ESTABLE';

    const r = 56, cx = 72, cy = 72;
    const circ = 2 * Math.PI * r;
    const id = `ring-${u.id}`;

    return `
      <div class="score-ring-card" style="border-color:${color}22">
        <svg width="144" height="144" viewBox="0 0 144 144" aria-label="Health Score ${u.name}">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="9"/>
          <circle id="${id}" cx="${cx}" cy="${cy}" r="${r}" fill="none"
            stroke="${color}" stroke-width="9" stroke-linecap="round"
            stroke-dasharray="${circ}" stroke-dashoffset="${circ}"
            transform="rotate(-90 ${cx} ${cy})"
            style="transition:stroke-dashoffset 1.6s cubic-bezier(0.2,0.8,0.2,1)"/>
          <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="#eef8ff"
            font-size="26" font-weight="860" font-family="Inter,ui-sans-serif,sans-serif">${score}</text>
          <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="rgba(143,167,189,0.7)"
            font-size="10" font-weight="680" font-family="Inter,ui-sans-serif,sans-serif">/ 100</text>
        </svg>
        <div class="ring-unit-name">${u.name}</div>
        <div class="ring-classification" style="color:${color}">${classification}</div>
        <div class="ring-state">${stateLabel}</div>
      </div>`;
  }).join('');

  // Animate rings after paint
  requestAnimationFrame(() => {
    UNITS.forEach(u => {
      const score = healthScore(u);
      const color = score >= 75 ? STATUS.green.hex : score >= 45 ? STATUS.amber.hex : STATUS.red.hex;
      const r = 56;
      const circ = 2 * Math.PI * r;
      const offset = circ * (1 - score / 100);
      const ring = document.querySelector(`#ring-${u.id}`);
      if (ring) ring.style.strokeDashoffset = offset;
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  RENDER — RIESGOS EJECUTIVOS
// ═══════════════════════════════════════════════════════════════════════════
function renderExecRisks() {
  const el = document.querySelector('#execRisks');
  if (!el) return;

  el.innerHTML = UNITS.map(u => {
    const risk = unitRiskLevel(u);
    const reds = KPI_DEFS.filter(k => k.getStatus(u.data[k.id]) === 'red');
    const ambers = KPI_DEFS.filter(k => k.getStatus(u.data[k.id]) === 'amber');
    const greens = KPI_DEFS.filter(k => k.getStatus(u.data[k.id]) === 'green');

    const riskConfig = {
      critical: { label: 'RIESGO CRÍTICO', c: STATUS.red  },
      attention: { label: 'ATENCIÓN PRIORITARIA', c: STATUS.amber },
      stable:    { label: 'OPERACIÓN ESTABLE', c: STATUS.green }
    }[risk];

    const c = riskConfig.c;

    const kpiLines = [
      ...reds.map(k => `<div class="risk-kpi-line risk-red">
        <span class="risk-kpi-dot red"></span>${k.label}: <strong>${fmtVal(k.id, u.data[k.id])}</strong>
      </div>`),
      ...ambers.map(k => `<div class="risk-kpi-line risk-amber">
        <span class="risk-kpi-dot amber"></span>${k.label}: <strong>${fmtVal(k.id, u.data[k.id])}</strong>
      </div>`),
      ...greens.map(k => `<div class="risk-kpi-line risk-green">
        <span class="risk-kpi-dot green"></span>${k.label}: <strong>${fmtVal(k.id, u.data[k.id])}</strong>
      </div>`)
    ].join('');

    return `
      <article class="exec-risk-card" style="border-color:${c.border}">
        <div class="erc-header" style="border-bottom-color:${c.border}">
          <div>
            <div class="erc-unit">${u.name}</div>
            <div class="erc-brand">${u.brand}</div>
          </div>
          <span class="erc-badge" style="background:${c.bg};border-color:${c.border};color:${c.hex}">
            ${riskConfig.label}
          </span>
        </div>
        <div class="erc-kpis">${kpiLines}</div>
        <div class="erc-lectura">${u.lectura}</div>
      </article>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
//  RENDER — COMPARATIVO DE UNIDADES
// ═══════════════════════════════════════════════════════════════════════════
function renderComparison() {
  const el = document.querySelector('#comparison');
  if (!el) return;

  const kpisToShow = ['margenNeto','foodCost','laborCost','rentRatio','rotacion'];

  el.innerHTML = UNITS.map(u => {
    const score = healthScore(u);
    const scoreColor = score >= 75 ? STATUS.green.hex : score >= 45 ? STATUS.amber.hex : STATUS.red.hex;
    const risk = unitRiskLevel(u);
    const riskColor = risk === 'critical' ? STATUS.red.hex : risk === 'attention' ? STATUS.amber.hex : STATUS.green.hex;

    const kpiRows = kpisToShow.map(id => {
      const def = KPI_DEFS.find(k => k.id === id);
      const s = def.getStatus(u.data[id]);
      const c = STATUS[s];
      return `<div class="comp-kpi-row">
        <span class="comp-kpi-label">${def.label}</span>
        <span class="comp-kpi-value" style="color:${c.hex}">${fmtVal(id, u.data[id])}</span>
        <span class="comp-kpi-pill" style="background:${c.bg};border-color:${c.border};color:${c.hex}">${c.label}</span>
      </div>`;
    }).join('');

    return `
      <article class="comp-card reveal">
        <div class="comp-header">
          <div>
            <div class="comp-brand">${u.brand}</div>
            <div class="comp-name">${u.name}</div>
          </div>
          <div class="comp-score-block">
            <span class="comp-score-num" style="color:${scoreColor}">${score}</span>
            <span class="comp-score-label">Health Score</span>
          </div>
        </div>
        <div class="comp-kpis">${kpiRows}</div>
        <div class="comp-lectura">${u.lectura}</div>
      </article>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
//  RENDER — RANKING EJECUTIVO (auto-calculado)
// ═══════════════════════════════════════════════════════════════════════════
function renderRanking() {
  const el = document.querySelector('#ranking');
  if (!el) return;

  const sorted = [...UNITS].map(u => ({ unit: u, score: healthScore(u) }))
    .sort((a, b) => b.score - a.score);

  el.innerHTML = sorted.map(({ unit: u, score }, i) => {
    const color = score >= 75 ? STATUS.green.hex : score >= 45 ? STATUS.amber.hex : STATUS.red.hex;
    const bgColor = score >= 75 ? STATUS.green.bg : score >= 45 ? STATUS.amber.bg : STATUS.red.bg;
    return `
      <div class="rank-row reveal">
        <div class="rank-pos" style="color:${color}">0${i + 1}</div>
        <div class="rank-info">
          <div class="rank-name">${u.name}</div>
          <div class="rank-brand">${u.brand}</div>
        </div>
        <div class="rank-bar-wrap">
          <div class="rank-bar" style="width:${score}%;background:${color}22;border-right:3px solid ${color}"></div>
        </div>
        <div class="rank-score" style="color:${color}">${score}<span>/100</span></div>
      </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
//  RENDER — KPIs FUTUROS
// ═══════════════════════════════════════════════════════════════════════════
function renderFutureKpis() {
  const el = document.querySelector('#futureKpis');
  if (!el) return;

  el.innerHTML = FUTURE_KPI_DEFS.map(def => `
    <div class="fk-item">
      <div class="fk-label">${def.label}</div>
      <div class="fk-meta">Meta: ${def.meta}</div>
      <span class="fk-pending">Pendiente de captura</span>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
//  SETUP — AMBIENT CANVAS
// ═══════════════════════════════════════════════════════════════════════════
function setupAmbientCanvas() {
  const canvas = document.querySelector('#ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let particles = [], width = 0, height = 0, frame = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.max(36, Math.floor((width * height) / 22000)));
    particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.26, vy: (Math.random() - 0.5) * 0.2,
      r: i % 7 === 0 ? 1.4 : 0.7 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function draw() {
    frame += 0.01;
    ctx.clearRect(0, 0, width, height);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    particles.forEach((p, i) => {
      if (!noMotion) { p.x += p.vx; p.y += p.vy; }
      if (p.x < -10) p.x = width + 10; if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10; if (p.y > height + 10) p.y = -10;
      const pulse = 0.4 + Math.sin(frame * 2 + p.phase) * 0.15;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(67,220,255,${0.12 + pulse * 0.18})`; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const n = particles[j];
        const d = Math.hypot(p.x - n.x, p.y - n.y);
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y);
          ctx.strokeStyle = `rgba(67,220,255,${0.038 * (1 - d / 100)})`; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    });
    ctx.restore();
    if (!noMotion) requestAnimationFrame(draw);
  }
  resize(); draw();
  window.addEventListener('resize', resize);
}

function setupReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { targets.forEach(t => t.classList.add('is-visible')); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(t => obs.observe(t));
}

function setupNavigation() {
  const links = document.querySelectorAll('.rail-link');
  const sections = document.querySelectorAll('[data-section]');
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const sec = e.target.dataset.section;
      links.forEach(l => l.classList.toggle('is-active', l.dataset.section === sec));
    });
  }, { threshold: 0.35 });
  sections.forEach(s => obs.observe(s));
}

// ═══════════════════════════════════════════════════════════════════════════
//  DRILL-DOWN — Modal de detalle mensual por KPI / unidad
// ═══════════════════════════════════════════════════════════════════════════
function openDrillModal(kpiId, unitId) {
  const existing = document.querySelector('#mxDrillOverlay');
  if (existing) existing.remove();

  const unit = UNITS.find(u => u.id === unitId);
  const def  = KPI_DEFS.find(k => k.id === kpiId);
  if (!unit || !def) return;

  const consolidated = unit.data[kpiId];
  const s = kpiStatus(kpiId, consolidated);
  const c = STATUS[s];

  const isExt = (kpiId === 'rotacion' || kpiId === 'ausencias' || kpiId === 'retardos');
  const mu    = UNIT_MONTHLY[unitId];
  const vals  = mu ? mu[kpiId] : null;
  const labs  = isExt ? UNIT_MONTHLY.labelsRot : UNIT_MONTHLY.labels;

  const rows = vals ? vals.map((v, i) => {
    if (v === null) return `
      <div class="mx-drill-row">
        <span class="mx-drill-label">${labs[i]}</span>
        <span class="mx-drill-val" style="color:var(--muted-2)">Sin dato</span>
        <span></span>
      </div>`;
    const ms = def.getStatus(v);
    const mc = STATUS[ms];
    return `
      <div class="mx-drill-row">
        <span class="mx-drill-label">${labs[i]}</span>
        <span class="mx-drill-val" style="color:${mc.hex}">${fmtVal(kpiId, v)}</span>
        <span class="mx-drill-pill" style="background:${mc.bg};border-color:${mc.border};color:${mc.hex}">${mc.label}</span>
      </div>`;
  }).join('') : `<div class="mx-drill-row"><span style="color:var(--muted-2);font-size:0.78rem">Sin datos históricos disponibles</span></div>`;

  const overlay = document.createElement('div');
  overlay.id = 'mxDrillOverlay';
  overlay.className = 'mx-drill-overlay';
  overlay.innerHTML = `
    <div class="mx-drill-panel">
      <div class="mx-drill-head">
        <div>
          <div class="mx-drill-kpi">${def.label}</div>
          <div class="mx-drill-unit">${unit.name} · ${unit.brand}</div>
        </div>
        <button class="mx-drill-close" aria-label="Cerrar">✕</button>
      </div>
      <div class="mx-drill-consolidated">
        <span class="mx-drill-con-label">Consolidado Ene–Abr</span>
        <span class="mx-drill-con-val" style="color:${c.hex}">${fmtVal(kpiId, consolidated)}</span>
        <span class="mx-drill-pill" style="background:${c.bg};border-color:${c.border};color:${c.hex}">${c.label}</span>
      </div>
      <div class="mx-drill-meta">Meta: ${def.meta}</div>
      <div class="mx-drill-rows">${rows}</div>
    </div>`;

  overlay.querySelector('.mx-drill-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function setupDrilldown() {
  document.addEventListener('click', e => {
    const cell = e.target.closest('.mx-cell-click');
    if (cell) openDrillModal(cell.dataset.kpiid, cell.dataset.unitid);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════════════════
renderHeroUnits();
renderStatusSummary();
renderKpiMatrix();
renderScoreRings();
renderExecRisks();
renderComparison();
renderRanking();
renderFutureKpis();
setupReveal();
setupNavigation();
setupDrilldown();
setupAmbientCanvas();
