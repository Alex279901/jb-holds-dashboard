// ═══════════════════════════════════════════════════════════════════════════
//  FRANCHISE EXCELLENCE — JB HOLDS COMMAND CENTER
//  Demo V1 · Datos hardcodeados · Preparado para Google Sheets
// ═══════════════════════════════════════════════════════════════════════════

// ── Paleta de estado ──────────────────────────────────────────────────────
const S = {
  green: { hex: '#7cc9a8', bg: 'rgba(124,201,168,0.15)', border: 'rgba(124,201,168,0.35)' },
  amber: { hex: '#c9a96a', bg: 'rgba(201,169,106,0.15)', border: 'rgba(201,169,106,0.35)' },
  red:   { hex: '#c46b73', bg: 'rgba(196,107,115,0.15)', border: 'rgba(196,107,115,0.35)' }
};

// ── Definiciones de KPI + semáforos ──────────────────────────────────────
const KPI_DEFS = [
  {
    id: 'margenNeto', label: 'Margen Neto', meta: '> 15%', unit: '%', suffix: '%',
    note: 'Utilidad Neta / Ventas Totales',
    getStatus: v => v > 15 ? 'green' : v >= 10 ? 'amber' : 'red',
    barMax: 25
  },
  {
    id: 'foodCost', label: 'Food Cost', meta: '25% – 30%', unit: '%', suffix: '%',
    note: 'Costo de alimentos / Ventas',
    getStatus: v => (v >= 25 && v <= 30) ? 'green' : ((v >= 22 && v < 25) || (v > 30 && v <= 33)) ? 'amber' : 'red',
    barMax: 50
  },
  {
    id: 'laborCost', label: 'Labor Cost', meta: '< 28%', unit: '%', suffix: '%',
    note: 'Costo de nómina / Ventas',
    getStatus: v => v < 28 ? 'green' : v <= 32 ? 'amber' : 'red',
    barMax: 45
  },
  {
    id: 'rentRatio', label: 'Renta / Ventas', meta: '< 8%', unit: '%', suffix: '%',
    note: 'Renta mensual / Ventas netas',
    getStatus: v => v < 8 ? 'green' : v <= 10 ? 'amber' : 'red',
    barMax: 20
  },
  {
    id: 'rotacion', label: 'Rotación de Personal', meta: '< 15%', unit: '%', suffix: '%',
    note: 'Promedio Ene–May 2026',
    getStatus: v => v < 15 ? 'green' : v <= 20 ? 'amber' : 'red',
    barMax: 30
  },
  {
    id: 'ausencias', label: 'Ausencias Injustificadas', meta: '< 5 / mes', unit: '', suffix: '',
    note: 'Mayo 2026',
    getStatus: v => v <= 4 ? 'green' : v <= 8 ? 'amber' : 'red',
    barMax: 20
  },
  {
    id: 'retardos', label: 'Retardos', meta: '< 3 / mes', unit: '', suffix: '',
    note: 'Mayo 2026',
    getStatus: v => v <= 2 ? 'green' : v <= 5 ? 'amber' : 'red',
    barMax: 10
  }
];

// ── Datos maestros de unidades ────────────────────────────────────────────
const UNITS = [
  {
    id: 'sgpm',
    name: 'SG Paseo Montejo',
    shortName: 'PDM',
    brand: 'Santagloria',
    color: '#7cc9a8',
    data: { margenNeto: 17.48, foodCost: 29.75, laborCost: 24.16, rentRatio: 9.02, rotacion: 6.00, ausencias: 7, retardos: 0 },
    lectura: 'La unidad más estable del grupo. Márgenes sanos con oportunidad de optimizar renta.',
    fortalezas: ['Margen Neto saludable', 'Food Cost en rango', 'Labor Cost controlado', 'Rotación mínima'],
    oportunidades: ['Reducir Renta/Ventas por debajo de 8%', 'Escalar margen por encima de 18%']
  },
  {
    id: 'sgla',
    name: 'SG La Isla',
    shortName: 'La Isla',
    brand: 'Santagloria',
    color: '#9db9c7',
    data: { margenNeto: 15.19, foodCost: 24.42, laborCost: 23.34, rentRatio: 14.16, rotacion: 20.98, ausencias: 15, retardos: 1 },
    lectura: 'Financieramente rentable, pero con riesgos operativos críticos: renta excesiva y alta rotación.',
    fortalezas: ['Margen Neto positivo', 'Labor Cost controlado'],
    oportunidades: ['Renegociar renta o incrementar ventas ≥25%', 'Plan de retención de personal', 'Control de ausentismo']
  },
  {
    id: 'amcdam',
    name: 'AMC DAM',
    shortName: 'AMC',
    brand: 'Allô Mon Coco',
    color: '#c46b73',
    data: { margenNeto: -7.00, foodCost: 40.54, laborCost: 33.55, rentRatio: 6.48, rotacion: 16.63, ausencias: 2, retardos: 2 },
    ventas: 5000646,
    utilidadNeta: -349503,
    lectura: 'Situación financiera crítica. Food Cost y Labor Cost muy por encima del estándar.',
    fortalezas: ['Renta saludable', 'Ausentismo bajo', 'Rotación estabilizándose'],
    oportunidades: ['Auditar recetas y proveedores urgentemente', 'Plan de eficiencia en nómina', 'Revisión de modelo operativo']
  }
];

// ── Health Score (sin NPS — redistribuido) ────────────────────────────────
// Pesos base: Margen 30, Food 15, Labor 15, Renta 15, Rotación 15, NPS 10
// NPS excluido → total 90 → normalizar sobre 90
const WEIGHTS = { margenNeto: 30/90, foodCost: 15/90, laborCost: 15/90, rentRatio: 15/90, rotacion: 15/90 };

function kpiScore(kpiId, value) {
  const def = KPI_DEFS.find(k => k.id === kpiId);
  if (!def) return 0;
  const s = def.getStatus(value);
  return s === 'green' ? 100 : s === 'amber' ? 50 : 0;
}

function healthScore(unit) {
  return Math.round(
    Object.entries(WEIGHTS).reduce((sum, [id, w]) => sum + kpiScore(id, unit.data[id]) * w, 0)
  );
}

// ── Riesgos detectados ────────────────────────────────────────────────────
const TOP_RISKS = [
  { priority: 'P1', unit: 'AMC DAM', kpi: 'Food Cost', value: '40.54%', status: 'red',
    accion: 'Auditar proveedores y recetas. Revisar porciones y desperdicios de forma urgente.' },
  { priority: 'P1', unit: 'AMC DAM', kpi: 'Margen Neto', value: '-7.00%', status: 'red',
    accion: 'Plan de turnaround financiero: reducir costos variables y revisar precio/mix de venta.' },
  { priority: 'P1', unit: 'SG La Isla', kpi: 'Renta / Ventas', value: '14.16%', status: 'red',
    accion: 'Negociar reducción de renta o incrementar ventas al menos 25% para normalizar el ratio.' },
  { priority: 'P2', unit: 'SG La Isla', kpi: 'Rotación de Personal', value: '20.98%', status: 'red',
    accion: 'Implementar plan de retención: incentivos, clima laboral y plan de carrera.' },
  { priority: 'P2', unit: 'SG La Isla', kpi: 'Ausencias Injustificadas', value: '15 en mayo', status: 'red',
    accion: 'Protocolo de asistencia. Identificar causas raíz con supervisión directa.' }
];

// ── KPIs futuros (sin datos) ──────────────────────────────────────────────
const FUTURE_KPIS = [
  { label: 'Payback', meta: '< 48 meses', icon: '⏱', desc: 'Meses para recuperar inversión inicial' },
  { label: 'Tiempo de Apertura', meta: '< 120 días', icon: '📅', desc: 'Días desde firma hasta apertura' },
  { label: 'NPS', meta: '> 70', icon: '⭐', desc: 'Net Promoter Score de clientes' },
  { label: 'Auditoría Operativa', meta: '> 90%', icon: '✓', desc: 'Calificación de inspección mensual' },
  { label: 'Satisfacción del Cliente', meta: '> 85%', icon: '◎', desc: 'Encuesta mensual de satisfacción' }
];

// ── Radar scores (0-100, donde 100 = mejor desempeño) ─────────────────────
function radarScores(unit) {
  return [
    kpiScore('margenNeto', unit.data.margenNeto),
    kpiScore('foodCost', unit.data.foodCost),
    kpiScore('laborCost', unit.data.laborCost),
    kpiScore('rentRatio', unit.data.rentRatio),
    kpiScore('rotacion', unit.data.rotacion),
    kpiScore('ausencias', unit.data.ausencias)
  ];
}

const RADAR_LABELS = ['Margen\nNeto', 'Food\nCost', 'Labor\nCost', 'Renta /\nVentas', 'Rotación', 'Ausencias'];

// ═══════════════════════════════════════════════════════════════════════════
//  RENDER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function renderExecutiveCards() {
  const grid = document.querySelector('#kpiGrid');
  if (!grid) return;

  const kpisToShow = KPI_DEFS.slice(0, 6); // first 6 (excl. retardos for cards)

  grid.innerHTML = kpisToShow.map(def => {
    const statuses = UNITS.map(u => def.getStatus(u.data[def.id]));
    const overallStatus = statuses.includes('red') ? 'red' : statuses.includes('amber') ? 'amber' : 'green';
    const c = S[overallStatus];

    const unitRows = UNITS.map(u => {
      const v = u.data[def.id];
      const s = def.getStatus(v);
      const sc = S[s];
      const barPct = Math.min(100, (Math.abs(v) / def.barMax) * 100);
      const displayVal = v < 0 ? `${v.toFixed(2)}%` : `${v}${def.suffix}`;
      return `
        <div class="fe-unit-row">
          <span class="fe-unit-name">${u.shortName}</span>
          <span class="fe-unit-value" style="color:${sc.hex}">${displayVal}</span>
          <div class="fe-unit-bar-wrap">
            <div class="fe-unit-bar" style="width:${barPct}%;background:${sc.hex}"></div>
          </div>
        </div>`;
    }).join('');

    return `
      <article class="fe-kpi-card" style="border-color:${c.border};background:${c.bg}">
        <div class="fe-kpi-card-top">
          <div>
            <div class="fe-kpi-label">${def.label}</div>
            <div class="fe-kpi-meta">Meta: ${def.meta}</div>
          </div>
          <span class="fe-dot ${overallStatus}"></span>
        </div>
        <div class="fe-unit-rows">${unitRows}</div>
        <div class="fe-kpi-note">${def.note}</div>
      </article>`;
  }).join('');

  // NPS pending card
  grid.innerHTML += `
    <article class="fe-kpi-card fe-pending-card">
      <div class="fe-kpi-card-top">
        <div>
          <div class="fe-kpi-label">NPS</div>
          <div class="fe-kpi-meta">Meta: > 70</div>
        </div>
        <span class="fe-dot" style="background:rgba(147,223,255,0.3);box-shadow:none"></span>
      </div>
      <div style="text-align:center;padding:24px 0 16px">
        <div style="font-size:1.8rem;opacity:0.25;margin-bottom:12px">◎</div>
        <div style="font-size:0.78rem;color:var(--muted)">Pendiente de captura</div>
        <div style="font-size:0.68rem;color:var(--muted-2);margin-top:6px">Net Promoter Score — encuesta a clientes</div>
      </div>
    </article>`;
}

function renderHealthScore() {
  const container = document.querySelector('#healthScoreGrid');
  if (!container) return;

  const scores = UNITS.map(u => ({ unit: u, score: healthScore(u) }))
    .sort((a, b) => b.score - a.score);

  const medals = ['🥇', '🥈', '🥉'];
  const rankLabels = ['Líder operativo', 'Segundo lugar', 'Requiere atención'];

  container.innerHTML = scores.map(({ unit, score }, i) => {
    const color = score >= 75 ? S.green.hex : score >= 45 ? S.amber.hex : S.red.hex;
    const barColor = score >= 75 ? S.green.hex : score >= 45 ? S.amber.hex : S.red.hex;
    return `
      <article class="fe-health-card reveal">
        <div class="fe-rank-badge">${medals[i]}</div>
        <div class="fe-health-label">${rankLabels[i]}</div>
        <div class="fe-score-num" style="color:${color}">${score}</div>
        <div class="fe-score-bar-wrap">
          <div class="fe-score-bar" style="width:${score}%;background:${barColor}"></div>
        </div>
        <div style="font-size:0.92rem;font-weight:780;color:#eef8ff;margin-bottom:4px">${unit.name}</div>
        <div style="font-size:0.74rem;color:var(--muted);line-height:1.45">${unit.lectura}</div>
        <div style="margin-top:14px;font-size:0.68rem;color:var(--muted-2)">
          NPS excluido temporalmente · 5 KPIs ponderados · Score / 100
        </div>
      </article>`;
  }).join('');
}

function renderHeatmap() {
  const wrap = document.querySelector('#heatmap');
  if (!wrap) return;

  const cols = KPI_DEFS.length;
  const totalCols = 1 + cols;
  wrap.style.gridTemplateColumns = `170px repeat(${cols}, 1fr)`;

  // Header row
  const headerCells = ['<div class="fe-hm-cell fe-hm-header">Unidad</div>',
    ...KPI_DEFS.map(d => `<div class="fe-hm-cell fe-hm-header">${d.label}</div>`)
  ].join('');

  // Data rows
  const dataRows = UNITS.map(u => {
    const cells = KPI_DEFS.map(def => {
      const v = u.data[def.id];
      const s = def.getStatus(v);
      const display = def.id === 'ausencias' || def.id === 'retardos' ? v : `${v}%`;
      return `<div class="fe-hm-cell fe-hm-${s}" title="${def.label}: ${display}">${display}</div>`;
    }).join('');
    return `<div class="fe-hm-cell fe-hm-unit">${u.name}</div>${cells}`;
  }).join('');

  wrap.innerHTML = headerCells + dataRows;
}

function renderRadar() {
  const svg = document.querySelector('#radarSvg');
  if (!svg) return;

  const cx = 200, cy = 190, r = 140;
  const axes = RADAR_LABELS.length;
  const levels = [25, 50, 75, 100];

  function polar(val, axisIndex) {
    const angle = ((360 / axes) * axisIndex - 90) * Math.PI / 180;
    const d = (val / 100) * r;
    return [cx + d * Math.cos(angle), cy + d * Math.sin(angle)];
  }

  // Grid rings
  let rings = levels.map(lvl => {
    const pts = Array.from({ length: axes }, (_, i) => polar(lvl, i).join(','));
    return `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(147,223,255,0.09)" stroke-width="1"/>`;
  }).join('');

  // Axis lines
  let axisLines = Array.from({ length: axes }, (_, i) => {
    const [x, y] = polar(100, i);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(147,223,255,0.12)" stroke-width="1"/>`;
  }).join('');

  // Axis labels
  let axisLabels = RADAR_LABELS.map((lbl, i) => {
    const [x, y] = polar(120, i);
    const lines = lbl.split('\n');
    const dy = lines.length > 1 ? -7 : 0;
    return `<text x="${x}" y="${y + dy}" text-anchor="middle" fill="rgba(170,192,210,0.7)" font-size="10" font-family="Inter,sans-serif">
      ${lines.map((l, li) => `<tspan x="${x}" dy="${li === 0 ? 0 : 14}">${l}</tspan>`).join('')}
    </text>`;
  }).join('');

  // Unit polygons
  let polygons = UNITS.map(u => {
    const scores = radarScores(u);
    const pts = scores.map((s, i) => polar(s, i).join(','));
    return `
      <polygon points="${pts.join(' ')}" fill="${u.color}22" stroke="${u.color}" stroke-width="1.8" stroke-linejoin="round" opacity="0.85"/>
      ${scores.map((s, i) => { const [x, y] = polar(s, i); return `<circle cx="${x}" cy="${y}" r="3.5" fill="${u.color}" opacity="0.9"/>`; }).join('')}`;
  }).join('');

  // Center dot
  const center = `<circle cx="${cx}" cy="${cy}" r="3" fill="rgba(147,223,255,0.3)"/>`;

  svg.innerHTML = rings + axisLines + axisLabels + polygons + center;
}

function renderRisks() {
  const container = document.querySelector('#risksGrid');
  if (!container) return;

  container.innerHTML = TOP_RISKS.map(r => {
    const c = r.priority === 'P1' ? S.red : S.amber;
    return `
      <article class="fe-risk-item" style="border-color:${c.border};background:${c.bg}">
        <div class="fe-priority" style="border-color:${c.border};background:rgba(0,0,0,0.2);color:${c.hex}">${r.priority}</div>
        <div class="fe-risk-body">
          <h4><span style="color:${c.hex}">${r.unit}</span> — ${r.kpi}</h4>
          <p>${r.accion}</p>
        </div>
        <div class="fe-risk-kpi">
          <strong style="color:${c.hex}">${r.value}</strong>
          <span>${r.kpi}</span>
        </div>
      </article>`;
  }).join('');
}

function renderTable() {
  const tbody = document.querySelector('#execTableBody');
  if (!tbody) return;

  tbody.innerHTML = UNITS.map(u => {
    function td(kpiId, val) {
      const s = KPI_DEFS.find(k => k.id === kpiId).getStatus(val);
      const display = kpiId === 'ausencias' || kpiId === 'retardos' ? val : `${val}%`;
      return `<td class="fe-td-${s}">${display}</td>`;
    }
    const d = u.data;
    return `
      <tr>
        <td class="fe-unit-col"><div style="display:flex;align-items:center;gap:8px">
          <span style="width:8px;height:8px;border-radius:50%;background:${u.color};display:inline-block;flex-shrink:0"></span>
          ${u.name}
        </div></td>
        ${td('margenNeto', d.margenNeto)}
        ${td('foodCost', d.foodCost)}
        ${td('laborCost', d.laborCost)}
        ${td('rentRatio', d.rentRatio)}
        ${td('rotacion', d.rotacion)}
        ${td('ausencias', d.ausencias)}
        ${td('retardos', d.retardos)}
        <td class="fe-lectura">${u.lectura}</td>
      </tr>`;
  }).join('');
}

function renderFutureKpis() {
  const grid = document.querySelector('#futureGrid');
  if (!grid) return;

  grid.innerHTML = FUTURE_KPIS.map(k => `
    <article class="fe-future-card">
      <div class="fe-future-icon">${k.icon}</div>
      <div class="fe-future-label">${k.label}</div>
      <div class="fe-future-meta">Meta: ${k.meta}</div>
      <div style="font-size:0.68rem;color:var(--muted-2);margin-bottom:12px;line-height:1.4">${k.desc}</div>
      <span class="fe-future-badge">Pendiente de captura</span>
    </article>`).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
//  SETUP FUNCTIONS (visual / animation)
// ═══════════════════════════════════════════════════════════════════════════

function setupReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(t => t.classList.add('is-visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
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
  }, { threshold: 0.4 });
  sections.forEach(s => obs.observe(s));
}

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
    const count = Math.min(100, Math.max(40, Math.floor((width * height) / 20000)));
    particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.22,
      r: i % 7 === 0 ? 1.4 : 0.7 + Math.random() * 0.6,
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
      const pulse = 0.42 + Math.sin(frame * 2 + p.phase) * 0.16;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(67,220,255,${0.13 + pulse * 0.2})`; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const n = particles[j];
        const d = Math.hypot(p.x - n.x, p.y - n.y);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y);
          ctx.strokeStyle = `rgba(67,220,255,${0.04 * (1 - d / 110)})`; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    });
    ctx.restore();
    if (!noMotion) requestAnimationFrame(draw);
  }
  resize(); draw();
  window.addEventListener('resize', () => { resize(); renderRadar(); });
}

function setupScrollDepth() {
  const beam = document.querySelector('.beam-field');
  const sections = Array.from(document.querySelectorAll('.section-shell'));
  let ticking = false;
  function update() {
    ticking = false;
    if (beam) beam.style.transform = `translateY(${window.scrollY * 0.035}px)`;
    sections.forEach(s => {
      const rect = s.getBoundingClientRect();
      const d = Math.max(-36, Math.min(36, (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.018));
      s.style.setProperty('--depth', `${d}px`);
    });
  }
  window.addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(update); }, { passive: true });
  update();
}

// ═══════════════════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════════════════

renderExecutiveCards();
renderHealthScore();
renderHeatmap();
renderRisks();
renderTable();
renderFutureKpis();
setupReveal();
setupNavigation();
setupAmbientCanvas();
setupScrollDepth();

// Radar needs DOM to be painted first
requestAnimationFrame(() => renderRadar());
