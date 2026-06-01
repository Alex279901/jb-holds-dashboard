const statusColors = {
  green: "#7cc9a8",
  amber: "#c9a96a",
  red: "#c46b73",
  cyan: "#9db9c7",
  blue: "#6f8ea8",
  violet: "#9a8fb8",
  grey: "#73808c"
};

// KPIs globales consolidados — MX en MXN, ESP en EUR (sin conversión FX)
const kpis = [
  {
    label: "Unidades operativas",
    value: "5",
    meta: "3 MX · 2 ESP",
    status: "green",
    target: "#geographic",
    points: [3, 3, 4, 5, 5]
  },
  {
    label: "Países activos",
    value: "2",
    meta: "México · España",
    status: "green",
    target: "#geographic",
    points: [1, 1, 2, 2, 2]
  },
  {
    label: "MX — Ventas netas",
    value: "$14.55M",
    meta: "94.5% vs meta Jan-May",
    status: "amber",
    target: "#geographic",
    points: [2.11, 2.93, 3.48, 3.36, 2.68]
  },
  {
    label: "ESP — Ventas netas",
    value: "€8.24M",
    meta: "91.3% vs meta Jan-May",
    status: "amber",
    target: "#geographic",
    points: [1.42, 1.68, 1.87, 1.74, 1.53]
  },
  {
    label: "Marcas en portafolio",
    value: "4",
    meta: "SG · AMC · WP · CBC",
    status: "green",
    target: "#brands",
    points: [2, 3, 4, 4, 4]
  },
  {
    label: "Pipeline expansión",
    value: "23",
    meta: "18 MX · 5 ESP",
    status: "amber",
    target: "#alerts",
    points: [8, 14, 18, 21, 23]
  },
  {
    label: "Próximas aperturas",
    value: "3",
    meta: "SG Victory · SG Altabrisa · SG Getxo",
    status: "green",
    target: "#alerts",
    points: [0, 1, 2, 3, 3]
  },
  {
    label: "Compromisos vencidos",
    value: "0",
    meta: "Primera sesión · sin minuta",
    status: "green",
    target: "#alerts",
    points: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
];

// Departamentos globales — dos países como "módulos"
const departments = [
  {
    key: "mexico",
    label: "México",
    code: "MX",
    accent: "#7cc9a8",
    accent2: "#9db9c7",
    tone: "Operaciones México · SG La Isla · SG Paseo de Montejo · AMC Mérida.",
    signal: "Ventas netas $14.55M con 94.5% de cumplimiento. AMC supera meta al 121.7%. SG La Isla con gap crítico al 68.47%.",
    metrics: [
      ["Ventas", "$14.55M"],
      ["P&L neto", "$660K"],
      ["Unidades", "3"]
    ],
    bars: [65, 91, 100, 100, 100],
    visual: {
      title: "MX Jan-May 2026",
      value: "$14.55M",
      meta: "3 unidades · 94.5% cumplimiento",
      status: "amber",
      items: [
        ["SG La Isla", "68.47%", "rojo"],
        ["SG Paseo Montejo", "79.74%", "rojo"],
        ["AMC Mérida", "121.7%", "verde"],
        ["P&L Jan-Abr", "$660K", "5.9% margen"]
      ],
      stages: [
        ["SG La Isla", "68%", "red", 68],
        ["SG Paseo Montejo", "79%", "red", 79],
        ["AMC Mérida", "121%", "green", 100],
        ["Consolidado", "94.5%", "amber", 94]
      ]
    }
  },
  {
    key: "espana",
    label: "España",
    code: "ES",
    accent: "#9a8fb8",
    accent2: "#9db9c7",
    tone: "Operaciones España · SG Alameda Recalde · SG Alameda de Urquijo.",
    signal: "Ventas netas €8.24M con 91.3% de cumplimiento. SG Alameda Recalde al 94.2%. SG Alameda de Urquijo al 88.7%.",
    metrics: [
      ["Ventas", "€8.24M"],
      ["P&L neto", "€312K"],
      ["Unidades", "2"]
    ],
    bars: [62, 88, 100, 98, 91],
    visual: {
      title: "ESP Jan-May 2026",
      value: "€8.24M",
      meta: "2 unidades · 91.3% cumplimiento",
      status: "amber",
      items: [
        ["SG Alameda Recalde", "94.2%", "verde"],
        ["SG Alameda Urquijo", "88.7%", "rojo"],
        ["P&L Jan-Abr", "€312K", "7.4% margen"],
        ["Próx. apertura", "SG Getxo", "Q3 2026"]
      ],
      stages: [
        ["SG Alameda Recalde", "94%", "green", 94],
        ["SG Alameda Urquijo", "88%", "red", 88],
        ["Consolidado", "91.3%", "amber", 91],
        ["Pipeline", "5 proy.", "amber", 50]
      ]
    }
  }
];

// Brand performance insights
const insights = [
  {
    tag: "Santagloria",
    title: "Multi-país activa",
    bullets: [
      "MX: 2 sucursales · $8.05M Jan-May",
      "ESP: 2 sucursales · €8.24M Jan-May",
      "3 próximas aperturas en pipeline"
    ],
    action: "Escalar modelo ESP",
    status: "amber"
  },
  {
    tag: "Allô Mon Coco",
    title: "AMC 121.7% MX",
    bullets: [
      "Mayo supera meta con $1.50M",
      "1 sucursal activa en Mérida",
      "3 proyectos en expansión MX"
    ],
    action: "Replicar en ESP",
    status: "green"
  },
  {
    tag: "Wetzel Pretzel",
    title: "ESP — Pipeline",
    bullets: [
      "0 sucursales activas aún",
      "2 proyectos en pipeline ESP",
      "Modelo en diseño"
    ],
    action: "Acelerar primer local",
    status: "amber"
  },
  {
    tag: "CoCo Bubble Tea",
    title: "4 proyectos MX",
    bullets: [
      "0 sucursales activas",
      "4 proyectos en pipeline MX",
      "Marca en expansión temprana"
    ],
    action: "Definir primer local",
    status: "amber"
  }
];

// Alertas globales consolidadas
const pulseAlerts = [
  {
    level: "P1",
    title: "MX — SG La Isla vende 68.47% vs meta",
    copy: "Mayo 2026: $751.7K vs meta de $1.10M. Principal gap operativo de ventas del grupo.",
    owner: "DIR_OPS / MX",
    status: "red"
  },
  {
    level: "P1",
    title: "ESP — SG Alameda de Urquijo al 88.7%",
    copy: "Mayo 2026: €321.4K vs meta de €362.3K. Gap operativo requiere plan comercial.",
    owner: "DIR_OPS / ESP",
    status: "red"
  },
  {
    level: "P2",
    title: "MX — Margen neto consolidado 5.9%",
    copy: "P&L Jan-Abr bajo umbral ejecutivo. Abril mejora a 12.8%. Tendencia positiva.",
    owner: "DIR_FIN / MX",
    status: "amber"
  },
  {
    level: "P2",
    title: "ESP — Margen neto 7.4% bajo umbral 10%",
    copy: "P&L Jan-Abr en construcción. Mejora mes a mes desde enero.",
    owner: "DIR_FIN / ESP",
    status: "amber"
  },
  {
    level: "P2",
    title: "Pipeline global: 3 próximas aperturas",
    copy: "SG Victory Platz y SG Altabrisa (MX) + SG Getxo (ESP). Cadencia de apertura requerida.",
    owner: "DIR_EXP / GLOBAL",
    status: "amber"
  }
];

// Riesgos globales
const risks = [
  {
    title: "SG La Isla MX — gap operativo crítico",
    copy: "Venta vs meta de 68.47% en mayo 2026. Requiere plan comercial y operativo inmediato.",
    meta: ["MX · Ventas", "$751.7K", "Rojo"],
    status: "red"
  },
  {
    title: "SG Alameda de Urquijo ESP — bajo meta",
    copy: "Venta vs meta de 88.7% en mayo 2026. Plan comercial requerido.",
    meta: ["ESP · Ventas", "€321.4K", "Rojo"],
    status: "red"
  },
  {
    title: "Márgenes netos por debajo de umbral",
    copy: "MX: 5.9% (umbral 8%). ESP: 7.4% (umbral 10%). Ambos con tendencia positiva.",
    meta: ["Global · P&L", "Ambos países", "Amarillo"],
    status: "amber"
  },
  {
    title: "Pipeline global exige cadencia de cierre",
    copy: "23 proyectos activos entre MX y ESP. 3 próximas aperturas identificadas sin fecha exacta.",
    meta: ["Expansión", "23 proyectos", "Seguimiento"],
    status: "amber"
  }
];

const commitments = [];

// ── Gráfica Revenue — dos líneas: MX y ESP en sus propias escalas ──
function setupRevenueChart() {
  const canvas = document.querySelector("#revenueCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const labels = ["Ene", "Feb", "Mar", "Abr", "May"];
  const revMX = [2.11, 2.93, 3.48, 3.36, 2.68];
  const revES = [1.42, 1.68, 1.87, 1.74, 1.53];
  const labelsMX = ["$2.11M", "$2.93M", "$3.48M", "$3.36M", "$2.68M"];
  const labelsES = ["€1.42M", "€1.68M", "€1.87M", "€1.74M", "€1.53M"];
  let anim = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function plotLine(pts, bounds) {
    const max = Math.max(...pts);
    const min = Math.min(...pts);
    const range = Math.max(0.1, max - min);
    const step = bounds.width / (pts.length - 1);
    return pts.map((v, i) => ({
      x: bounds.x + step * i,
      y: bounds.y + bounds.height - ((v - min) / range) * bounds.height
    }));
  }

  function drawLine(pts, color, prog) {
    const count = Math.max(2, Math.ceil(pts.length * prog));
    const active = pts.slice(0, count);
    ctx.beginPath();
    active.forEach(({ x, y }, i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
    active.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  function drawPill(text, x, y, color, cw, ch) {
    const pad = 8;
    ctx.font = "700 11px Inter, sans-serif";
    const tw = ctx.measureText(text).width;
    const bw = tw + pad * 2;
    const bh = 22;
    const bx = Math.max(8, Math.min(x - bw / 2, cw - bw - 8));
    const by = Math.max(8, Math.min(y - bh - 6, ch - bh - 8));
    ctx.fillStyle = "rgba(6,12,20,0.76)";
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 6);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, bx + bw / 2, by + bh / 2 + 0.5);
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);
    const bds = { x: 48, y: 34, width: w - 88, height: h - 82 };

    ctx.strokeStyle = "rgba(147,223,255,0.07)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = bds.y + (bds.height / 4) * i;
      ctx.beginPath(); ctx.moveTo(bds.x, y); ctx.lineTo(bds.x + bds.width, y); ctx.stroke();
    }

    const pMX = plotLine(revMX, bds);
    const pES = plotLine(revES, { ...bds, y: bds.y + bds.height * 0.1, height: bds.height * 0.7 });

    drawLine(pMX, statusColors.cyan, anim);
    drawLine(pES, statusColors.violet, Math.max(0, anim - 0.1));

    if (anim > 0.5) {
      pMX.forEach(({ x, y }, i) => drawPill(labelsMX[i], x, y, statusColors.cyan, w, h));
      pES.forEach(({ x, y }, i) => drawPill(labelsES[i], x, y + 24, statusColors.violet, w, h));
    }

    ctx.font = "700 11px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = statusColors.cyan;
    ctx.fillText("México (MXN)", bds.x, 20);
    ctx.fillStyle = statusColors.violet;
    ctx.fillText("España (EUR)", bds.x + 120, 20);

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(238,248,255,0.8)";
    ctx.font = "800 15px Inter, sans-serif";
    ctx.fillText("2 países · 5 unidades", bds.x + bds.width, 20);
    ctx.textAlign = "left";

    ctx.fillStyle = "rgba(143,167,189,0.8)";
    ctx.font = "600 11px Inter, sans-serif";
    labels.forEach((lbl, i) => {
      const x = bds.x + (bds.width / (labels.length - 1)) * i;
      ctx.fillText(lbl, x - 8, h - 16);
    });
  }

  function animate() {
    anim = Math.min(1, anim + 0.016);
    draw();
    if (anim < 1) requestAnimationFrame(animate);
  }

  resize();
  requestAnimationFrame(animate);
  window.addEventListener("resize", resize);
}

// ── Reutilizamos las funciones render de México adaptadas ──
function sparkline(points, width = 210, height = 58) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const step = width / (points.length - 1);
  const path = points.map((p, i) => {
    const x = i * step;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true"><path d="${path}"></path></svg>`;
}

function setStatusVariable(el, status) {
  el.style.setProperty("--status", statusColors[status] || statusColors.cyan);
}

function renderKpis() {
  const el = document.querySelector("#kpiConstellation");
  if (!el) return;
  el.innerHTML = kpis.map(k => `
    <button class="kpi-node" type="button" data-target="${k.target}" style="--status:${statusColors[k.status]}" aria-label="Ir a ${k.label}">
      <div class="kpi-label"><span>${k.label}</span><i class="kpi-dot" aria-hidden="true"></i></div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-meta">${k.meta}</div>
      ${sparkline(k.points)}
    </button>`).join("");
}

function renderDepartments() {
  const theater = document.querySelector("#moduleTheater");
  if (!theater) return;
  theater.innerHTML = departments.map((dept, i) => `
    <article class="module-environment reveal ${i === 0 ? "is-focused is-visible" : ""}" data-module="${dept.key}" style="--accent:${dept.accent};--accent-2:${dept.accent2}">
      <div class="module-header">
        <div><span>${dept.tone}</span><h3>${dept.label}</h3></div>
        <div class="module-badge">${dept.code}</div>
      </div>
      <div class="module-metrics">
        ${dept.metrics.map(([lbl, val]) => `<div class="metric-slab"><small>${lbl}</small><strong>${val}</strong></div>`).join("")}
      </div>
      <div class="module-visual">
        <div class="module-intelligence" style="--status:${statusColors[dept.visual.status] || statusColors.cyan}">
          <div class="visual-head"><span>${dept.visual.title}</span><strong>${dept.code}</strong></div>
          <div class="visual-hero"><strong>${dept.visual.value}</strong><p>${dept.visual.meta}</p></div>
          <div class="visual-metrics">
            ${dept.visual.items.map(([l, v, m]) => `<div><small>${l}</small><strong>${v}</strong><span>${m}</span></div>`).join("")}
          </div>
          <div class="visual-bars">
            ${dept.visual.stages.map(([l, v, s, w]) => `
              <div class="visual-bar" style="--bar-status:${statusColors[s]||statusColors.cyan};--bar-width:${Math.max(4,Math.min(100,w))}%">
                <span>${l}</span><i><b></b></i><strong>${v}</strong>
              </div>`).join("")}
          </div>
        </div>
      </div>
      <div class="module-signal"><span>Signal</span><p>${dept.signal}</p></div>
    </article>`).join("");
}

function renderInsights() {
  const el = document.querySelector("#insightGrid");
  if (!el) return;
  el.innerHTML = insights.map(ins => `
    <article class="executive-signal" style="--status:${statusColors[ins.status]}">
      <span>${ins.tag}</span>
      <h3>${ins.title}</h3>
      <ul class="signal-list">${ins.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
      <strong>${ins.action}</strong>
    </article>`).join("");
}

function renderPulse() {
  const el = document.querySelector("#pulseFeed");
  if (!el) return;
  el.innerHTML = pulseAlerts.map(a => `
    <article class="pulse-alert" style="--status:${statusColors[a.status]}">
      <div class="alert-priority">${a.level}</div>
      <div class="alert-copy"><h3>${a.title}</h3><p>${a.copy}</p></div>
      <div class="alert-owner">${a.owner}</div>
    </article>`).join("");
}

function renderRisks() {
  const el = document.querySelector("#riskStream");
  if (!el) return;
  el.innerHTML = risks.map(r => `
    <article class="risk-item" style="--status:${statusColors[r.status]}">
      <h3>${r.title}</h3>
      <p>${r.copy}</p>
      <div class="risk-meta">${r.meta.map(m => `<span>${m}</span>`).join("")}</div>
    </article>`).join("");
}

function setupReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    targets.forEach(t => t.classList.add("is-visible"));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -60px 0px" });
  targets.forEach(t => obs.observe(t));
}

function setupNavigation() {
  const links = document.querySelectorAll(".rail-link");
  const sections = document.querySelectorAll("[data-section]");
  if (!("IntersectionObserver" in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const sec = e.target.dataset.section;
      links.forEach(l => l.classList.toggle("is-active", l.dataset.section === sec));
    });
  }, { threshold: 0.4 });
  sections.forEach(s => obs.observe(s));
}

function setupAmbientCanvas() {
  const canvas = document.querySelector("#ambientCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let particles = [], width = 0, height = 0, frame = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(128, Math.max(48, Math.floor((width * height) / 18000)));
    particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.24,
      r: i % 7 === 0 ? 1.4 : 0.8 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function draw() {
    frame += 0.01;
    ctx.clearRect(0, 0, width, height);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    particles.forEach((p, i) => {
      if (!noMotion) { p.x += p.vx; p.y += p.vy; }
      if (p.x < -20) p.x = width + 20; if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20; if (p.y > height + 20) p.y = -20;
      const pulse = 0.45 + Math.sin(frame * 2 + p.phase) * 0.17;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(67,220,255,${0.15 + pulse * 0.22})`; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const n = particles[j];
        const d = Math.hypot(p.x - n.x, p.y - n.y);
        if (d < 116) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y);
          ctx.strokeStyle = `rgba(67,220,255,${0.046 * (1 - d / 116)})`; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    });
    ctx.restore();
    if (!noMotion) requestAnimationFrame(draw);
  }

  resize(); draw();
  window.addEventListener("resize", resize);
}

function setupKpiNavigation() {
  document.querySelectorAll(".kpi-node[data-target]").forEach(node => {
    node.addEventListener("click", () => {
      const target = document.querySelector(node.dataset.target);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function setupScrollDepth() {
  const beam = document.querySelector(".beam-field");
  const sections = Array.from(document.querySelectorAll(".section-shell"));
  let ticking = false;
  function update() {
    ticking = false;
    const offset = window.scrollY * 0.035;
    if (beam) beam.style.transform = `translateY(${offset}px)`;
    sections.forEach(s => {
      const rect = s.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      const depth = Math.max(-36, Math.min(36, (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.018));
      s.style.setProperty("--depth", `${depth}px`);
      s.style.setProperty("--chapter-progress", progress.toFixed(3));
    });
  }
  window.addEventListener("scroll", () => { if (ticking) return; ticking = true; requestAnimationFrame(update); }, { passive: true });
  update();
}

// Init
renderKpis();
renderDepartments();
renderInsights();
renderPulse();
renderRisks();
setupReveal();
setupNavigation();
setupKpiNavigation();
setupAmbientCanvas();
setupRevenueChart();
setupScrollDepth();
