const users = [
  ["Jose Irabien", "CEO / Direccion General"],
  ["Beatriz Sierra", "Co-CEO"],
  ["Alejandro Cortes", "Data y analisis"],
  ["Paulina Castillo", "Administracion y Finanzas"],
  ["Mario Garcia", "Operaciones generales"],
  ["Pamela Molina", "Santagloria Merida"],
  ["Nayla Gutierrez", "Allo Mon Coco Merida"],
  ["Montserrat Pina", "Expansion"],
  ["Pilar Fuentes", "Excelencia de Marca"],
  ["Gabriela Medina", "Recursos Humanos"],
  ["Daniel Molina", "Marketing Performance"],
  ["Isaac Cob", "Marketing Creative / Brand"]
].map(([name, area]) => ({ name, area }));

const SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbx_sdWMzDehOJ69VoiQRyp0OlB3RL0bRV5G51D3_40gnOsmzp-JOTr6xY--k4GjEuMx4Q/exec";

const sheetMap = {
  ventas: {
    tab: "C_Fecha",
    fecha: "Fecha",
    documentos: "Documentos",
    ventaNeta: "Venta Neta",
    iva: "IVA",
    venta: "Venta",
    ticketMedio: "Ticket Medio",
    sucursal: "Sucursal",
    pais: "Pais",
    meta: "Meta",
    gap: "GAP $",
    estadoKpi: "Estado KPI",
    cumplimiento: "Cumplimiento"
  },
  productos: {
    tab: "C_Producto",
    sucursal: "Sucursal",
    fecha: "Fecha",
    producto: "Producto",
    categoria: "Categoria",
    ventaNeta: "Neto",
    cantidad: "Cantidad",
    ordenes: "Ordenes"
  },
  horas: {
    tab: "C_Hora",
    fecha: "Fecha",
    venta: "Venta",
    documentos: "Docs",
    unidades: "Uds.V",
    sucursal: "Sucursal",
    hora: "Hora",
    tiempo: "Tiempo"
  }
};

const sheetData = {
  loaded: false,
  error: null,
  ventas: [],
  productos: [],
  horas: []
};

const branchAliases = {
  "SG Paseo de Montejo": "SG Paseo Montejo",
  "SG Paseo Montejo": "SG Paseo Montejo",
  "SG Pedro Teixeria": "SG Pedro Teixeira",
  "SG Pedro Teixeira": "SG Pedro Teixeira"
};

const brandConfig = {
  "Santa Gloria MX": {
    cover: "assets/cover-sgmx.png",
    branches: ["SG Paseo Montejo", "SG La Isla", "SG Altabrisa", "SG Montejo Norte", "SG Victory Platz", "SG Xcanatun"]
  },
  "Santa Gloria ESP": {
    cover: "assets/cover-sgesp.png",
    branches: ["SG Alameda Recalde", "SG Alcala 164", "SG Alcala 244", "SG Atocha 84", "SG Av. Ciudad de Barcelona", "SG EASO", "SG Intermodal", "SG Iparraguirre", "SG Lopez de Hoyos", "SG Pedro Teixeira", "SG Puente de Deusto"]
  },
  "Allo mon Coco": {
    cover: "assets/cover-allomx.png",
    branches: ["AMC DAM", "AMC Cocoyoles", "AMC Carretera Motul"]
  },
  "Wetzel Pretzel ESP": {
    cover: "assets/cover-wetzesp.png",
    branches: []
  }
};

const branchPalette = ["#18c77a", "#2f8cff", "#ff5d55", "#f2b84b", "#9b7cff", "#22d3ee", "#fa7d45", "#7ee787", "#8ab4ff", "#ff9db2", "#c6a7ff"];

const branchData = Object.fromEntries(
  Object.entries(brandConfig).flatMap(([brand, config], brandIndex) =>
    config.branches.map((name, index) => {
      const seed = (brandIndex + 1) * 100 + index * 17;
      const daily = [1.02, 1.12, 0.96, 1.18, 1.14, 1.04, 1.26].map((factor, day) =>
        Math.round((18500 + seed * 125 + index * 6400) * factor)
      );
      const docsDaily = [38, 44, 41, 49, 53, 47, 58].map((base, day) =>
        Math.round(base + seed / 9 + index * 8 + day * 2)
      );
      const sales = daily.reduce((sum, value) => sum + value, 0);
      const target = Math.round(sales * (index % 3 === 0 ? 0.91 : index % 3 === 1 ? 1.08 : 1.18));
      const docs = docsDaily.reduce((sum, value) => sum + value, 0);
      return [name, {
        brand,
        name,
        color: branchPalette[index % branchPalette.length],
        daily,
        docsDaily,
        sales,
        target,
        docs,
        ticket: sales / docs,
        margin: 22 + ((seed + index * 7) % 13),
        previousFactor: 0.91 + ((seed + index) % 11) / 100,
        traffic: [31, 48, 72, 86, 104, 138, 92, 41].map((base, hour) => Math.round(base + index * 9 + brandIndex * 6 + hour * 2)),
        conversion: Math.max(58, 84 - index * 4 - brandIndex * 2)
      }];
    })
  )
);

const productCategories = [
  "Bebidas Calientes",
  "Bebidas frias",
  "Productos Salados",
  "Productos Dulces",
  "Cajas",
  "Extras",
  "Refrescos",
  "Merch",
  "0",
  "Combo",
  "BEBIDAS",
  "CAFÉ Y TÉ",
  "MENÚ LIGERO",
  "SIN CATEGORIA",
  "BENEDICTINOS",
  "BRUNCH DE LA CASA",
  "CAZUELAS",
  "CERVEZA",
  "CHILAQUILES",
  "COCO WAFFLES",
  "COCOS",
  "CREPAS Y PANCAKES",
  "COCTELES CON CAFÉ",
  "GRILLED CHEESE Y WRAPS",
  "JUGOS FRESCOS",
  "MALTEADAS",
  "MIMOSAS",
  "NIÑOS",
  "OMELETTES GOURMET",
  "POUTINES",
  "SMOOTHIES",
  "WAFFLES Y PAN FRANCÉS",
  "¡ARMA TU MINI BRUNCH!",
  "COCTELES",
  "SANGRIAS",
  "LUNCH"
];

const productSeed = [
  ["MD CAFE NORMAL", 1177, "CAFÉ Y TÉ"],
  ["MD LECHE DESLACTOSADA LIGHT", 864, "Extras"],
  ["CALIENTE", 514, "Bebidas Calientes"],
  ["Americano", 487, "CAFÉ Y TÉ"],
  ["MD LECHE ENTERA", 331, "Extras"],
  ["GLORIA DUBAI", 254, "Productos Dulces"],
  ["GLORIA PISTACHO", 229, "Productos Dulces"],
  ["GLORIA NUTELLA", 212, "Productos Dulces"],
  ["Sin clasificar", 212, "SIN CATEGORIA"],
  ["Jugo Fresco de Naranja", 209, "JUGOS FRESCOS"],
  ["CAFE AMERICANO GRANDE", 206, "CAFÉ Y TÉ"],
  ["AGUA PURIFICADA", 192, "Bebidas frias"],
  ["Refresco", 174, "Refrescos"],
  ["Croissant Mixto", 158, "Productos Salados"],
  ["Combo Mini Brunch", 146, "Combo"],
  ["Chilaquiles Verdes", 132, "CHILAQUILES"],
  ["Coco Waffle", 124, "COCO WAFFLES"],
  ["Crepa Nutella", 119, "CREPAS Y PANCAKES"],
  ["Omelette Gourmet", 107, "OMELETTES GOURMET"],
  ["Smoothie Mango", 96, "SMOOTHIES"],
  ["Mimosa Naranja", 82, "MIMOSAS"],
  ["Sangria Tinta", 73, "SANGRIAS"],
  ["Lunch Wrap", 68, "LUNCH"]
].map(([name, total, category]) => ({ name, total, category }));

const bottomProducts = [
  "BOCATA SEMILLADA",
  "EXTRA JARABE DE CHAI",
  "MUFFIN DE YOGURT",
  "DESAYUNO SG TOSTADO",
  "ICED COFFE GLORIOSO VAINILLA",
  "SW BLT",
  "EXTRA JARABE DE GALLETA",
  "MD EXTRA DE AGUACATE"
].map((name) => ({ name, total: 1 }));

const categoryMix = [
  { name: "Extras", value: 34.7, color: "#2f8cff" },
  { name: "Productos Dulces", value: 25.8, color: "#ff5d55" },
  { name: "Bebidas Frias", value: 16.0, color: "#f2b84b" },
  { name: "Bebidas Calientes", value: 11.9, color: "#18c77a" },
  { name: "CAFE Y TE", value: 11.6, color: "#9b7cff" }
];

const flowHours = ["08", "10", "12", "14", "16", "18", "20", "22"];
const moduleMeta = {
  sales: {
    title: "Ventas",
    subtitle: "KPIs comerciales y rendimiento financiero",
    eyebrow: "Ventas",
    heroTitle: "Radiografia comercial del periodo",
    heroText: "Monitorea avance contra meta 100%, GAP por sucursal y alertas de recuperacion antes del cierre.",
    metricLabel: "Venta neta"
  },
  products: {
    title: "Producto",
    subtitle: "Top sellers, mix y rentabilidad",
    eyebrow: "Producto",
    heroTitle: "Mix rentable y señales de producto",
    heroText: "Detecta productos lideres, items muertos, categorias dominantes y dispersion por sucursal.",
    metricLabel: "Cantidad"
  },
  flow: {
    title: "Flujo de Ventas",
    subtitle: "Horas pico y comportamiento de consumo",
    eyebrow: "Flujo",
    heroTitle: "Horas pico y comportamiento de consumo",
    heroText: "Cruza trafico, venta y conversion para decidir staffing, impulso comercial y horarios de alerta.",
    metricLabel: "Hora pico"
  }
};

const EXPORT_SECTION_DEFS = [
  {
    group: "VENTAS",
    module: "sales",
    items: [
      { key: "sales-kpis-alerts",  label: "KPIs y alertas comerciales" },
      { key: "sales-trend",        label: "Tendencia diaria de venta" },
      { key: "sales-waterfall",    label: "Acumulado semanal" },
      { key: "sales-scorecards",   label: "Semaforo por sucursal" },
      { key: "sales-risk",         label: "Riesgo operativo (GAP)" },
      { key: "sales-heatmap",      label: "Mapa de calor por dia" },
      { key: "sales-table",        label: "Tabla: Ventas vs meta" },
      { key: "sales-comparison",   label: "Comparativo por sucursal" }
    ]
  },
  {
    group: "PRODUCTOS",
    module: "products",
    items: [
      { key: "products-kpis-alerts", label: "KPIs y alertas de producto" },
      { key: "products-grid",        label: "Top sellers, mix y treemap" },
      { key: "products-table",       label: "Tabla: Matriz de producto" }
    ]
  },
  {
    group: "FLUJO DE VENTAS",
    module: "flow",
    items: [
      { key: "flow-kpis-alerts", label: "KPIs y alertas de flujo" },
      { key: "flow-cards",       label: "Resumen por sucursal" },
      { key: "flow-charts",      label: "Graficas horarias y conversion" },
      { key: "flow-table",       label: "Tabla: Plan de accion" }
    ]
  }
];

const state = {
  user: null,
  activeModule: "sales",
  activeBrand: "Santa Gloria MX",
  activeBranches: new Set(brandConfig["Santa Gloria MX"].branches),
  chartMode: "sales",
  compareMode: "sales",
  cumulativeMode: "sales",
  tableSearch: "",
  productCategories: new Set(["Todas"]),
  categoryMenuOpen: false,
  dateStart: "2026-05-11",
  dateEnd: "2026-05-17"
};

const _fmtMXN      = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const _exactFmtMXN = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const _fmtEUR      = new Intl.NumberFormat("es-MX", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const _exactFmtEUR = new Intl.NumberFormat("es-MX", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

const _ESP_BRANDS = new Set(["Santa Gloria ESP", "Wetzel Pretzel ESP"]);
const formatter      = { format: (n) => (_ESP_BRANDS.has(state.activeBrand) ? _fmtEUR      : _fmtMXN).format(n) };
const exactFormatter = { format: (n) => (_ESP_BRANDS.has(state.activeBrand) ? _exactFmtEUR : _exactFmtMXN).format(n) };
const numberFormatter = new Intl.NumberFormat("es-MX");

const els = {
  loginScreen: document.querySelector("#loginScreen"),
  appShell: document.querySelector("#appShell"),
  userSelect: document.querySelector("#userSelect"),
  loginForm: document.querySelector("#loginForm"),
  welcomeMessage: document.querySelector("#welcomeMessage"),
  printTitle: document.querySelector("#printTitle"),
  printSubtitle: document.querySelector("#printSubtitle"),
  printMeta: document.querySelector("#printMeta"),
  pageTitle: document.querySelector("#pageTitle"),
  pageSubtitle: document.querySelector("#pageSubtitle"),
  heroPanel: document.querySelector("#heroPanel"),
  heroEyebrow: document.querySelector("#heroEyebrow"),
  heroTitle: document.querySelector("#heroTitle"),
  heroText: document.querySelector("#heroText"),
  heroMetricLabel: document.querySelector("#heroMetricLabel"),
  heroMetricValue: document.querySelector("#heroMetricValue"),
  branchFilter: document.querySelector("#branchFilter"),
  periodCompare: document.querySelector("#periodCompare"),
  dateStart: document.querySelector("#dateStart"),
  dateEnd: document.querySelector("#dateEnd"),
  kpiGrid: document.querySelector("#kpiGrid"),
  alertStrip: document.querySelector("#alertStrip"),
  moduleContent: document.querySelector("#moduleContent"),
  rightAlerts: document.querySelector("#rightAlerts"),
  inspector: document.querySelector("#inspector"),
  inspectorTitle: document.querySelector("#inspectorTitle"),
  inspectorBody: document.querySelector("#inspectorBody"),
  inspectorMetrics: document.querySelector("#inspectorMetrics"),
  tooltip: document.querySelector("#tooltip"),
  toast: document.querySelector("#toast")
};

function boot() {
  els.userSelect.innerHTML = users.map((user, index) => `<option value="${index}">${user.name} · ${user.area}</option>`).join("");
  startCarousel();
  renderAll();
  loadSheetData();
}

function startCarousel() {
  const slides = [...document.querySelectorAll(".login-slide")];
  let current = 0;
  window.setInterval(() => {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }, 5000);
}

async function loadSheetData(manual = false) {
  setDataStatus("Conectando Sheets", "Leyendo Google Sheets API...");
  try {
    const response = await fetch(`${SHEETS_API_URL}?v=${Date.now()}`, { cache: "no-store" });
    const text = await response.text();
    if (!response.ok) throw new Error(`Google respondio HTTP ${response.status}`);
    if (!text.trim().startsWith("{")) {
      throw new Error("La URL del Apps Script no esta devolviendo JSON. Revisa el deployment y pon acceso: Anyone.");
    }
    const payload = JSON.parse(text);
    sheetData.ventas = normalizeVentas(extractSheetRows(payload, sheetMap.ventas.tab, "ventas"));
    sheetData.productos = normalizeProductos(extractSheetRows(payload, sheetMap.productos.tab, "productos"));
    sheetData.horas = normalizeHoras(extractSheetRows(payload, sheetMap.horas.tab, "horas"));
    sheetData.loaded = Boolean(sheetData.ventas.length || sheetData.productos.length || sheetData.horas.length);
    sheetData.error = null;
    if (!sheetData.loaded) throw new Error("Sheets respondio, pero no encontre filas en C_Fecha, C_Producto o C_Hora.");
    if (!manual) syncDateRangeFromSheets();
    setDataStatus("Sheets conectado", `${numberFormatter.format(sheetData.ventas.length)} ventas · ${numberFormatter.format(sheetData.productos.length)} productos · ${numberFormatter.format(sheetData.horas.length)} horas`);
    renderAll();
    if (manual) showToast("Datos actualizados desde Google Sheets");
  } catch (error) {
    sheetData.loaded = false;
    sheetData.error = error.message;
    setDataStatus("Live demo", "Datos simulados · revisa acceso de Sheets");
    console.warn("No se pudo cargar Google Sheets:", error);
    if (manual) showToast("No pude leer Sheets; sigo con demo local");
  }
}

function extractSheetRows(payload, sheetName, alias) {
  if (Array.isArray(payload?.[sheetName])) return payload[sheetName];
  if (Array.isArray(payload?.[alias])) return payload[alias];
  if (Array.isArray(payload?.data?.[sheetName])) return payload.data[sheetName];
  if (Array.isArray(payload?.data?.[alias])) return payload.data[alias];
  if (Array.isArray(payload?.sheets?.[sheetName])) return payload.sheets[sheetName];
  if (Array.isArray(payload?.sheets?.[alias])) return payload.sheets[alias];
  return [];
}

function canonicalBranchName(value) {
  const text = normalizeText(value);
  return branchAliases[text] || text;
}

function normalizeVentas(rows) {
  const m = sheetMap.ventas;
  return rows.map((row) => {
    const ventaNeta = parseNumber(row[m.ventaNeta]);
    const documentos = parseNumber(row[m.documentos]);
    const meta = parseNumber(row[m.meta]);
    const gap = row[m.gap] === undefined ? ventaNeta - meta : parseNumber(row[m.gap]);
    const cumplimiento = row[m.cumplimiento] === undefined
      ? ventaNeta / Math.max(meta, 1)
      : parsePercent(row[m.cumplimiento]);
    return {
      fecha: parseDateValue(row[m.fecha]),
      documentos,
      ventaNeta,
      iva: parseNumber(row[m.iva]),
      venta: parseNumber(row[m.venta]),
      ticketMedio: row[m.ticketMedio] === undefined ? ventaNeta / Math.max(documentos, 1) : parseNumber(row[m.ticketMedio]),
      sucursal: canonicalBranchName(row[m.sucursal]),
      pais: normalizeText(row[m.pais]),
      meta,
      gap,
      estadoKpi: normalizeText(row[m.estadoKpi]),
      cumplimiento
    };
  }).filter((row) => row.fecha && row.sucursal);
}

function normalizeProductos(rows) {
  const m = sheetMap.productos;
  return rows.map((row) => {
    const producto = normalizeText(row[m.producto]);
    return {
      fecha: parseDateValue(row[m.fecha]),
      sucursal: canonicalBranchName(row[m.sucursal]),
      producto,
      categoria: normalizeText(row[m.categoria]) || "SIN CATEGORIA",
      ventaNeta: parseNumber(row[m.ventaNeta]),
      cantidad: parseNumber(row[m.cantidad]),
      ordenes: parseNumber(row[m.ordenes])
    };
  }).filter((row) => row.fecha && row.sucursal && row.producto);
}

function normalizeHoras(rows) {
  const m = sheetMap.horas;
  return rows.map((row) => ({
    fecha: parseDateValue(row[m.fecha]),
    venta: parseNumber(row[m.venta]),
    documentos: parseNumber(row[m.documentos]),
    unidades: parseNumber(row[m.unidades]),
    sucursal: canonicalBranchName(row[m.sucursal]),
    hora: parseHourValue(row[m.hora] ?? row[m.tiempo]),
    tiempo: normalizeText(row[m.tiempo])
  })).filter((row) => row.fecha && row.sucursal && row.hora);
}

function syncDateRangeFromSheets() {
  const fechas = [...new Set(sheetData.ventas.map((row) => row.fecha).filter(Boolean))].sort();
  if (!fechas.length) return;
  const latest = fechas[fechas.length - 1];
  const start = new Date(`${latest}T00:00:00`);
  start.setDate(start.getDate() - 6);
  state.dateStart = isoDate(start);
  state.dateEnd = latest;
}

function moduleRows(module = state.activeModule) {
  const branches = new Set(activeBranchNames());
  const source = module === "products" ? sheetData.productos : module === "flow" ? sheetData.horas : sheetData.ventas;
  return source.filter((row) => branches.has(row.sucursal));
}

function ensureModuleDateRange() {
  if (!sheetData.loaded) return;
  const rows = moduleRows();
  if (!rows.length) return;
  const currentDates = dateKeySet();
  const hasDataNow = rows.some((row) => currentDates.has(row.fecha));
  if (hasDataNow) return;
  const fechas = [...new Set(rows.map((row) => row.fecha).filter(Boolean))].sort();
  const latest = fechas[fechas.length - 1];
  const start = new Date(`${latest}T00:00:00`);
  start.setDate(start.getDate() - 6);
  state.dateStart = isoDate(start);
  state.dateEnd = latest;
}

function setDataStatus(title, detail) {
  const titleNode = document.querySelector(".market-pulse strong");
  const detailNode = document.querySelector(".market-pulse div span");
  if (titleNode) titleNode.textContent = title;
  if (detailNode) detailNode.textContent = detail;
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const text = normalizeText(value);
  if (!text) return 0;
  const clean = text
    .replace(/[%$]/g, "")
    .replace(/\s/g, "")
    .replace(/,/g, "")
    .replace(/[()]/g, "")
    .replace(/[^\d.-]/g, "");
  const number = Number(clean);
  const sign = /\(.+\)/.test(text) || text.startsWith("-") ? -1 : 1;
  return Number.isFinite(number) ? Math.abs(number) * sign : 0;
}

function parsePercent(value) {
  if (typeof value === "number") return value > 2 ? value / 100 : value;
  const text = normalizeText(value);
  if (!text) return 0;
  const number = parseNumber(text);
  return text.includes("%") || number > 2 ? number / 100 : number;
}

function parseDateValue(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return isoDate(value);
  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    excelEpoch.setUTCDate(excelEpoch.getUTCDate() + value);
    return isoDate(excelEpoch);
  }
  const text = normalizeText(value);
  if (!text) return "";
  const direct = new Date(text);
  if (!Number.isNaN(direct.getTime())) return isoDate(direct);
  const parts = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!parts) return "";
  const [, day, month, year] = parts;
  const fullYear = year.length === 2 ? `20${year}` : year;
  const parsed = new Date(`${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? "" : isoDate(parsed);
}

function parseHourValue(value) {
  const text = normalizeText(value);
  const match = text.match(/(\d{1,2})/);
  if (!match) return "00";
  const lower = text.toLowerCase();
  let hour = Number(match[1]);
  const isPm = /p\.?\s*m\.?|pm/.test(lower);
  const isAm = /a\.?\s*m\.?|am/.test(lower);
  if (isPm && hour < 12) hour += 12;
  if (isAm && hour === 12) hour = 0;
  return String(Math.min(Math.max(hour, 0), 23)).padStart(2, "0");
}

function login(user) {
  state.user = user;
  els.welcomeMessage.textContent = `Bienvenido ${user.name}`;
  els.loginScreen.style.display = "none";
  els.appShell.classList.remove("locked");
  showToast(`Bienvenido ${user.name}`);
}

function currentBranches() {
  return [...state.activeBranches].map((name) => branchData[name]).filter(Boolean);
}

function activeBranchNames() {
  return [...state.activeBranches];
}

function dateList(start = state.dateStart, end = state.dateEnd) {
  const from = new Date(`${start}T00:00:00`);
  const to = new Date(`${end}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) return [];
  const out = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    out.push(new Date(d));
    if (out.length > 45) break;
  }
  return out;
}

function previousRange() {
  const current = dateList();
  if (!current.length) return { start: state.dateStart, end: state.dateEnd, dates: [] };
  const prevStart = new Date(current[0]);
  const prevEnd = new Date(current[current.length - 1]);
  prevStart.setDate(prevStart.getDate() - 7);
  prevEnd.setDate(prevEnd.getDate() - 7);
  return { start: isoDate(prevStart), end: isoDate(prevEnd), dates: dateList(isoDate(prevStart), isoDate(prevEnd)) };
}

function periodLabel() {
  const prev = previousRange();
  const days = dateList().length;
  return `${days} dias · vs ${formatShortDate(prev.start)} - ${formatShortDate(prev.end)}`;
}

function dateKeySet(previous = false) {
  return new Set((previous ? previousRange().dates : dateList()).map(isoDate));
}

function selectedProductCategories() {
  return [...(state.productCategories || new Set(["Todas"]))];
}

function allProductCategoriesSelected() {
  const selected = selectedProductCategories();
  return !selected.length || selected.includes("Todas");
}

function productCategoryMatches(category) {
  return allProductCategoriesSelected() || state.productCategories.has(category);
}

function productCategoryLabel() {
  const selected = selectedProductCategories().filter((category) => category !== "Todas");
  if (allProductCategoriesSelected()) return "Todas las categorias";
  if (selected.length === 1) return selected[0];
  if (selected.length <= 3) return selected.join(", ");
  return `${selected.length} categorias seleccionadas`;
}

function sheetVentasInRange(previous = false) {
  const dates = dateKeySet(previous);
  const branches = new Set(activeBranchNames());
  return sheetData.ventas.filter((row) => dates.has(row.fecha) && branches.has(row.sucursal));
}

function sheetProductosInRange(previous = false, applyCategory = true) {
  const dates = dateKeySet(previous);
  const branches = new Set(activeBranchNames());
  return sheetData.productos.filter((row) =>
    dates.has(row.fecha) &&
    branches.has(row.sucursal) &&
    (!applyCategory || productCategoryMatches(row.categoria))
  );
}

function sheetHorasInRange(previous = false) {
  const dates = dateKeySet(previous);
  const branches = new Set(activeBranchNames());
  return sheetData.horas.filter((row) => dates.has(row.fecha) && branches.has(row.sucursal));
}

function activeFlowHours(previous = false) {
  if (!sheetData.loaded) return flowHours;
  const hours = [...new Set(sheetHorasInRange(previous).map((row) => row.hora))].sort();
  return hours.length ? hours : flowHours;
}

function branchValue(branch, date, metric, previous = false) {
  if (sheetData.loaded) {
    const dateKey = isoDate(date);
    const rows = sheetData.ventas.filter((row) => row.sucursal === branch.name && row.fecha === dateKey);
    if (metric === "docs") return rows.reduce((sum, row) => sum + row.documentos, 0);
    if (metric === "margin") return rows.reduce((sum, row) => sum + row.ventaNeta * branch.margin / 100, 0);
    return rows.reduce((sum, row) => sum + row.ventaNeta, 0);
  }
  const day = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const drift = 1 + ((date.getDate() % 5) - 2) * 0.018;
  const prev = previous ? branch.previousFactor : 1;
  if (metric === "docs") return Math.round(branch.docsDaily[day] * drift * prev);
  if (metric === "margin") return Math.round(branch.daily[day] * drift * prev * branch.margin / 100);
  return Math.round(branch.daily[day] * drift * prev);
}

function rangeSeries(metric = "sales", previous = false) {
  const dates = previous ? previousRange().dates : dateList();
  return dates.map((date) => ({
    date,
    label: formatChartDate(date),
    total: currentBranches().reduce((sum, branch) => sum + branchValue(branch, date, metric, previous), 0)
  }));
}

function totals(previous = false) {
  const data = currentBranches();
  const dates = previous ? previousRange().dates : dateList();
  if (sheetData.loaded) {
    const rows = sheetVentasInRange(previous);
    const sales = rows.reduce((sum, row) => sum + row.ventaNeta, 0);
    const docs = rows.reduce((sum, row) => sum + row.documentos, 0);
    const fallbackTarget = data.reduce((sum, branch) => sum + branch.target / 7 * Math.max(dates.length, 1), 0);
    const rawTarget = rows.reduce((sum, row) => sum + row.meta, 0);
    const target = rawTarget || fallbackTarget;
    const weightedMargin = rows.reduce((sum, row) => {
      const branch = branchData[row.sucursal];
      return sum + row.ventaNeta * ((branch?.margin ?? 28) / 100);
    }, 0) / Math.max(sales, 1) * 100;
    return {
      sales,
      target,
      docs,
      ticket: sales / Math.max(docs, 1),
      compliance: sales / Math.max(target, 1),
      gap: sales - target,
      margin: weightedMargin
    };
  }
  const sales = dates.reduce((sum, date) => sum + data.reduce((inner, branch) => inner + branchValue(branch, date, "sales", previous), 0), 0);
  const docs = dates.reduce((sum, date) => sum + data.reduce((inner, branch) => inner + branchValue(branch, date, "docs", previous), 0), 0);
  const target = data.reduce((sum, branch) => sum + branch.target / 7 * Math.max(dates.length, 1), 0);
  const weightedMargin = data.reduce((sum, branch) => sum + branch.margin * branch.sales, 0) / Math.max(data.reduce((sum, branch) => sum + branch.sales, 0), 1);
  return {
    sales,
    target,
    docs,
    ticket: sales / Math.max(docs, 1),
    compliance: sales / Math.max(target, 1),
    gap: sales - target,
    margin: weightedMargin
  };
}

function productRows(previous = false) {
  const branches = currentBranches();
  if (sheetData.loaded) {
    const grouped = new Map();
    sheetProductosInRange(previous).forEach((row) => {
      const key = `${row.producto}||${row.categoria}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          name: row.producto,
          category: row.categoria,
          quantities: Object.fromEntries(branches.map((branch) => [branch.name, 0])),
          salesByBranch: Object.fromEntries(branches.map((branch) => [branch.name, 0])),
          docsByBranch: Object.fromEntries(branches.map((branch) => [branch.name, 0])),
          total: 0,
          sales: 0,
          orders: 0
        });
      }
      const item = grouped.get(key);
      item.quantities[row.sucursal] = (item.quantities[row.sucursal] || 0) + row.cantidad;
      item.salesByBranch[row.sucursal] = (item.salesByBranch[row.sucursal] || 0) + row.ventaNeta;
      item.docsByBranch[row.sucursal] = (item.docsByBranch[row.sucursal] || 0) + row.ordenes;
      item.total += row.cantidad;
      item.sales += row.ventaNeta;
      item.orders += row.ordenes;
    });
    return [...grouped.values()].sort((a, b) => b.total - a.total);
  }
  return productSeed.filter((product) => productCategoryMatches(product.category)).map((product, productIndex) => {
    const quantities = Object.fromEntries(branches.map((branch, branchIndex) => {
      const weight = 0.55 + ((branchIndex + productIndex) % 5) * 0.14;
      return [branch.name, Math.max(0, Math.round(product.total * weight / Math.max(branches.length * 0.86, 1)))];
    }));
    const total = Object.values(quantities).reduce((sum, value) => sum + value, 0);
    const salesByBranch = Object.fromEntries(Object.entries(quantities).map(([branch, quantity]) => [branch, quantity * 57.55]));
    const docsByBranch = Object.fromEntries(Object.entries(quantities).map(([branch, quantity]) => [branch, Math.max(1, Math.round(quantity / 1.8))]));
    return {
      ...product,
      quantities,
      total,
      sales: Object.values(salesByBranch).reduce((sum, value) => sum + value, 0),
      orders: Object.values(docsByBranch).reduce((sum, value) => sum + value, 0),
      salesByBranch,
      docsByBranch
    };
  });
}

function productTotals(previous = false) {
  const rows = productRows(previous);
  const factor = sheetData.loaded ? 1 : previous ? 0.965 : 1;
  const quantity = Math.round(rows.reduce((sum, item) => sum + item.total, 0) * factor);
  const sales = sheetData.loaded ? rows.reduce((sum, item) => sum + item.sales, 0) : quantity * 57.55;
  const top = [...rows].sort((a, b) => b.total - a.total)[0] || { name: "Sin datos", total: 0, category: "N/A" };
  const leadingCategory = allProductCategoriesSelected() || selectedProductCategories().length > 1
    ? (categoryBreakdown(previous)[0] || { name: "Sin datos", value: 0, color: "#18c77a" })
    : { name: selectedProductCategories()[0], value: quantity ? 100 : 0, color: "#18c77a" };
  return { sales, quantity, avg: sales / Math.max(quantity, 1), top, leadingCategory };
}

function categoryBreakdown(previous = false) {
  if (sheetData.loaded) {
    const rows = sheetProductosInRange(previous, true);
    const total = rows.reduce((sum, row) => sum + row.cantidad, 0);
    const grouped = new Map();
    rows.forEach((row) => grouped.set(row.categoria, (grouped.get(row.categoria) || 0) + row.cantidad));
    return [...grouped.entries()].map(([name, quantity], index) => ({
      name,
      value: total ? quantity / total * 100 : 0,
      quantity,
      color: branchPalette[index % branchPalette.length]
    })).filter((item) => item.quantity > 0).sort((a, b) => b.quantity - a.quantity);
  }
  const filteredSeed = productSeed.filter((product) => productCategoryMatches(product.category));
  const total = filteredSeed.reduce((sum, product) => sum + product.total, 0);
  return productCategories
    .map((category, index) => {
      const value = filteredSeed.filter((product) => product.category === category).reduce((sum, product) => sum + product.total, 0);
      return {
        name: category,
        value: total ? value / total * 100 : 0,
        quantity: value,
        color: branchPalette[index % branchPalette.length]
      };
    })
    .filter((item) => item.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity);
}

function flowRows() {
  const hours = activeFlowHours();
  if (sheetData.loaded) {
    const rows = sheetHorasInRange();
    return currentBranches().map((branch) => {
      const sales = hours.map((hour) => rows.filter((row) => row.sucursal === branch.name && row.hora === hour).reduce((sum, row) => sum + row.venta, 0));
      const traffic = hours.map((hour) => rows.filter((row) => row.sucursal === branch.name && row.hora === hour).reduce((sum, row) => sum + row.documentos, 0));
      const units = hours.map((hour) => rows.filter((row) => row.sucursal === branch.name && row.hora === hour).reduce((sum, row) => sum + row.unidades, 0));
      const peakIndex = sales.indexOf(Math.max(...sales));
      const totalDocs = traffic.reduce((sum, value) => sum + value, 0);
      const totalUnits = units.reduce((sum, value) => sum + value, 0);
      const conversion = Math.min(100, Math.round(totalDocs / Math.max(totalUnits, 1) * 100));
      return { ...branch, sales, traffic, units, peakIndex: Math.max(peakIndex, 0), conversion };
    });
  }
  return currentBranches().map((branch) => {
    const sales = hours.map((hour, index) => Math.round(branch.daily[index % 7] * (0.34 + index * 0.045)));
    const peakIndex = sales.indexOf(Math.max(...sales));
    return { ...branch, sales, peakIndex };
  });
}

function flowTotals(previous = false) {
  const active = previous && sheetData.loaded ? flowRowsForRange(true) : flowRows();
  const hours = activeFlowHours(previous);
  const factor = sheetData.loaded ? 1 : previous ? 0.94 : 1;
  const points = active.flatMap((row) => row.sales.map((sale, index) => ({
    branch: row.name,
    hour: hours[index],
    sale: Math.round(sale * factor),
    traffic: row.traffic[index],
    color: row.color
  })));
  const peak = [...points].sort((a, b) => b.sale - a.sale)[0];
  const traffic = active.reduce((sum, row) => sum + row.traffic.reduce((a, b) => a + b, 0), 0);
  const sales = points.reduce((sum, point) => sum + point.sale, 0);
  const avgConversion = active.reduce((sum, row) => sum + row.conversion, 0) / Math.max(active.length, 1);
  return { active, peak, traffic, sales, avgConversion };
}

function flowRowsForRange(previous = false) {
  if (!sheetData.loaded) return flowRows();
  const hours = activeFlowHours(previous);
  const rows = sheetHorasInRange(previous);
  return currentBranches().map((branch) => {
    const sales = hours.map((hour) => rows.filter((row) => row.sucursal === branch.name && row.hora === hour).reduce((sum, row) => sum + row.venta, 0));
    const traffic = hours.map((hour) => rows.filter((row) => row.sucursal === branch.name && row.hora === hour).reduce((sum, row) => sum + row.documentos, 0));
    const units = hours.map((hour) => rows.filter((row) => row.sucursal === branch.name && row.hora === hour).reduce((sum, row) => sum + row.unidades, 0));
    const peakIndex = sales.indexOf(Math.max(...sales));
    const totalDocs = traffic.reduce((sum, value) => sum + value, 0);
    const totalUnits = units.reduce((sum, value) => sum + value, 0);
    const conversion = Math.min(100, Math.round(totalDocs / Math.max(totalUnits, 1) * 100));
    return { ...branch, sales, traffic, units, peakIndex: Math.max(peakIndex, 0), conversion };
  });
}

function renderAll() {
  renderChrome();
  renderBranchFilter();
  renderHero();
  renderAlerts();
  renderKpis();
  renderModuleContent();
}

function renderChrome() {
  const meta = moduleMeta[state.activeModule];
  els.pageTitle.textContent = meta.title;
  els.pageSubtitle.textContent = meta.subtitle;
  els.printTitle.textContent = `${meta.title} · ${state.activeBrand}`;
  els.printSubtitle.textContent = meta.subtitle;
  els.printMeta.textContent = `Periodo: ${formatShortDate(state.dateStart)} - ${formatShortDate(state.dateEnd)} · ${periodLabel()}`;
  els.dateStart.value = state.dateStart;
  els.dateEnd.value = state.dateEnd;
  els.periodCompare.textContent = periodLabel();
  document.querySelectorAll(".module-card").forEach((button) => button.classList.toggle("active", button.dataset.module === state.activeModule));
  document.querySelectorAll(".brand-card").forEach((button) => button.classList.toggle("active", button.dataset.brand === state.activeBrand));
}

function renderBranchFilter() {
  const branches = brandConfig[state.activeBrand].branches;
  if (!branches.length) {
    els.branchFilter.innerHTML = `<span class="period-compare">Sin sucursales por ahora</span>`;
    return;
  }
  const allSelected = branches.every((branch) => state.activeBranches.has(branch));
  els.branchFilter.innerHTML = `
    <button class="chip select-all ${allSelected ? "active" : ""}" type="button" data-toggle-branches>${allSelected ? "Deselect All" : "Select All"}</button>
  ` + branches.map((branch) => `
    <button class="chip ${state.activeBranches.has(branch) ? "active" : ""}" type="button" data-branch="${branch}">${branch}</button>
  `).join("");
  els.branchFilter.querySelector("[data-toggle-branches]").addEventListener("click", () => {
    state.activeBranches = allSelected ? new Set() : new Set(branches);
    ensureModuleDateRange();
    renderAll();
  });
  els.branchFilter.querySelectorAll("[data-branch]").forEach((button) => {
    button.addEventListener("click", () => {
      const branch = button.dataset.branch;
      if (state.activeBranches.has(branch) && state.activeBranches.size > 1) state.activeBranches.delete(branch);
      else state.activeBranches.add(branch);
      ensureModuleDateRange();
      renderAll();
    });
  });
}

function renderHero() {
  const meta = moduleMeta[state.activeModule];
  const cover = brandConfig[state.activeBrand].cover;
  els.heroPanel.style.setProperty("--hero-image", `url("${cover}")`);
  els.heroEyebrow.textContent = `${meta.eyebrow} · ${state.activeBrand}`;
  els.heroTitle.textContent = meta.heroTitle;
  els.heroText.textContent = meta.heroText;
  els.heroMetricLabel.textContent = meta.metricLabel;
  if (state.activeModule === "sales") els.heroMetricValue.textContent = formatter.format(totals().sales);
  if (state.activeModule === "products") els.heroMetricValue.textContent = numberFormatter.format(productTotals().quantity);
  if (state.activeModule === "flow") els.heroMetricValue.textContent = flowTotals().peak ? `${flowTotals().peak.hour}:00` : "Sin datos";
}

function renderKpis() {
  const kpis = state.activeModule === "sales" ? salesKpis() : state.activeModule === "products" ? productKpis() : flowKpis();
  els.kpiGrid.innerHTML = kpis.map((kpi) => `
    <button class="kpi-card" type="button" data-kpi="${kpi.key}">
      <span class="kpi-label">${kpi.label}</span>
      <span class="kpi-value">${kpi.value}</span>
      <span class="kpi-meta">${kpi.meta}</span>
      <span class="kpi-previous">Anterior: ${kpi.previous}</span>
      <span class="delta ${kpi.up ? "up" : "down"}">${kpi.delta}</span>
      <span class="meter"><span style="width:${Math.min(kpi.progress, 1.18) * 100}%; background:${kpi.up ? "var(--green)" : "var(--red)"}"></span></span>
    </button>
  `).join("");
  document.querySelectorAll("[data-kpi]").forEach((card) => card.addEventListener("click", () => openInspectorForKpi(card.dataset.kpi)));
}

function salesKpis() {
  const current = totals();
  const previous = totals(true);
  return [
    kpi("Venta neta", exactFormatter.format(current.sales), `${percent(current.compliance)} de meta 100%`, previous.sales, current.sales, "sales", current.compliance),
    kpi("Ticket medio", exactFormatter.format(current.ticket), `${numberFormatter.format(current.docs)} documentos`, previous.ticket, current.ticket, "ticket", current.ticket / 500, true, exactFormatter),
    kpi("Cumplimiento", percent(current.compliance), `${formatter.format(current.gap)} GAP`, previous.compliance, current.compliance, "compliance", current.compliance, true, null, true),
    { label: "Margen estimado", value: `${current.margin.toFixed(1)}%`, meta: "Promedio ponderado", previous: `${previous.margin.toFixed(1)}%`, delta: `${current.margin - previous.margin >= 0 ? "+" : ""}${percentChange(current.margin, previous.margin)} vs periodo anterior`, up: current.margin >= previous.margin, progress: current.margin / 40, key: "margin" }
  ];
}

function productKpis() {
  const current = productTotals();
  const previous = productTotals(true);
  const hasProductRows = current.quantity > 0;
  return [
    kpi("Venta producto", exactFormatter.format(current.sales), "Venta neta de producto", previous.sales, current.sales, "product-sales", current.sales / Math.max(previous.sales, 1)),
    kpi("Cantidad", numberFormatter.format(current.quantity), "Unidades vendidas", previous.quantity, current.quantity, "product-units", current.quantity / Math.max(previous.quantity, 1), true, numberFormatter),
    { label: "Top producto", value: compactName(current.top.name), meta: `${numberFormatter.format(current.top.total)} unidades`, previous: compactName(productTotals(true).top.name), delta: hasProductRows ? "Producto lider" : "Sin datos", up: hasProductRows, progress: current.top.total / 1300, key: "top-product" },
    { label: "Categoria lider", value: `${current.leadingCategory.value.toFixed(1)}%`, meta: current.leadingCategory.name, previous: `${(previous.leadingCategory.value || 0).toFixed(1)}%`, delta: hasProductRows ? "Alta concentracion" : "Sin datos", up: hasProductRows, progress: current.leadingCategory.value / 40, key: "category-mix" }
  ];
}

function flowKpis() {
  const current = flowTotals();
  const previous = flowTotals(true);
  const weakest = [...current.active].sort((a, b) => a.conversion - b.conversion)[0];
  const trafficLabel = sheetData.loaded ? "documentos" : "visitas demo";
  return [
    { label: "Hora pico", value: current.peak ? `${current.peak.hour}:00` : "Sin datos", meta: current.peak ? `${current.peak.branch} · ${formatter.format(current.peak.sale)}` : "Sin sucursal activa", previous: previous.peak ? `${previous.peak.hour}:00` : "Sin datos", delta: "Mayor venta por franja", up: true, progress: 0.9, key: "peak-hour" },
    kpi("Venta en flujo", formatter.format(current.sales), `${numberFormatter.format(current.traffic)} ${trafficLabel}`, previous.sales, current.sales, "flow-sales", current.sales / Math.max(previous.sales, 1)),
    { label: "Conversion prom.", value: `${current.avgConversion.toFixed(0)}%`, meta: "Promedio sucursales", previous: `${Math.max(current.avgConversion - 3, 0).toFixed(0)}%`, delta: current.avgConversion >= 72 ? "Sana" : "Requiere accion", up: current.avgConversion >= 72, progress: current.avgConversion / 100, key: "flow-conversion" },
    { label: "Riesgo operativo", value: weakest ? shortName(weakest.name) : "N/A", meta: weakest ? `${weakest.conversion}% conversion` : "Sin datos", previous: "Mismo riesgo", delta: "Revisar staffing", up: false, progress: 0.62, key: "flow-risk" }
  ];
}

function kpi(label, value, meta, previous, current, key, progress, higherIsGood = true, customFormatter = formatter, percentMode = false) {
  const diff = current - previous;
  const directionGood = higherIsGood ? diff >= 0 : diff <= 0;
  const prevLabel = percentMode ? `${(previous * 100).toFixed(1)}%` : customFormatter.format(previous);
  return {
    label,
    value,
    meta,
    previous: prevLabel,
    delta: `${diff >= 0 ? "+" : ""}${percentChange(current, previous)} vs periodo anterior`,
    up: directionGood,
    progress,
    key
  };
}

function renderAlerts() {
  const alerts = moduleAlerts();
  els.alertStrip.innerHTML = alerts.map((alert) => `
    <button class="alert-card ${alert.tone}" type="button" data-alert="${alert.title}">
      <strong>${alert.title}</strong>
      <p>${alert.body}</p>
    </button>
  `).join("");
  els.rightAlerts.innerHTML = alerts.map((alert) => `
    <button class="right-alert" type="button" data-side-alert="${alert.title}">
      <strong>${alert.title}</strong>
      <span>${alert.body}</span>
    </button>
  `).join("");
  document.querySelectorAll("[data-alert], [data-side-alert]").forEach((card) => {
    const alert = alerts.find((item) => item.title === card.dataset.alert || item.title === card.dataset.sideAlert);
    card.addEventListener("click", () => openInspector({
      title: alert.title,
      body: alert.body,
      metrics: [["Prioridad", alert.tone === "danger" ? "Alta" : "Media"], ["Periodo", periodLabel()]]
    }));
  });
}

function moduleAlerts() {
  if (!currentBranches().length) return [{ tone: "warning", title: "Sin sucursales activas", body: `${state.activeBrand} queda reservado para carga futura.` }];
  if (state.activeModule === "products") {
    if (sheetData.loaded && !sheetData.productos.length) {
      return [
        { tone: "danger", title: "C_Producto vacio", body: "El Apps Script esta enviando 0 filas de producto. Hay que revisar esa pestana o el script." },
        { tone: "warning", title: "Ventas si conectadas", body: `${numberFormatter.format(sheetData.ventas.length)} filas en C_Fecha ya estan entrando correctamente.` },
        { tone: "warning", title: "Flujo si conectado", body: `${numberFormatter.format(sheetData.horas.length)} filas en C_Hora ya estan entrando correctamente.` }
      ];
    }
    const top = productTotals().top;
    const categoryLabel = productCategoryLabel();
    return [
      { tone: "warning", title: `${top.name} concentra demanda`, body: `${numberFormatter.format(top.total)} unidades${allProductCategoriesSelected() ? "" : ` en ${categoryLabel}`}. Revisar si depende de una sucursal.` },
      { tone: "danger", title: "Bottom con 1 unidad", body: "8 productos se mueven minimo. Revisar exhibicion, inventario o baja." },
      { tone: "good", title: allProductCategoriesSelected() ? "Categoria lider detectada" : "Filtro de categoria activo", body: allProductCategoriesSelected() ? `${productTotals().leadingCategory.name} domina el mix actual.` : `La vista esta filtrada por ${categoryLabel}.` }
    ];
  }
  if (state.activeModule === "flow") {
    const flow = flowTotals();
    return [
      { tone: "good", title: `Pico principal ${flow.peak?.hour ?? "--"}:00`, body: flow.peak ? `${flow.peak.branch} genera ${formatter.format(flow.peak.sale)} en la franja lider.` : "Sin datos activos." },
      { tone: "danger", title: "Conversion baja", body: "Mayor trafico no siempre se convierte. Revisar filas, caja y oferta." },
      { tone: "warning", title: "Staffing 16:00 a 19:00", body: "Franja ideal para reforzar piso y preparar producto antes del pico." }
    ];
  }
  const data = activeBranchRows();
  const worst = [...data].sort((a, b) => a.gap - b.gap)[0];
  const best = [...data].sort((a, b) => b.compliance - a.compliance)[0];
  const total = totals();
  return [
    { tone: worst && worst.gap < 0 ? "danger" : "good", title: worst && worst.gap < 0 ? `${worst.name} debajo de meta` : "Sin deficit activo", body: worst && worst.gap < 0 ? `Faltan ${formatter.format(Math.abs(worst.gap))}. Meta fija al 100%.` : "Todas las sucursales activas estan en zona saludable." },
    { tone: "warning", title: "Concentracion comercial", body: `${best?.name ?? "Sucursal lider"} concentra ${percent((best?.sales ?? 0) / Math.max(total.sales, 1))} de la venta.` },
    { tone: total.compliance >= 1 ? "good" : "danger", title: total.compliance >= 1 ? "Meta cubierta" : "Meta en riesgo", body: total.compliance >= 1 ? `Vas ${formatter.format(total.gap)} arriba de la meta.` : `Faltan ${formatter.format(Math.abs(total.gap))} para cerrar al 100%.` }
  ];
}

function activeBranchRows(previous = false) {
  const dates = previous ? previousRange().dates : dateList();
  if (sheetData.loaded) {
    const rows = sheetVentasInRange(previous);
    return currentBranches().map((branch) => {
      const branchRows = rows.filter((row) => row.sucursal === branch.name);
      const sales = branchRows.reduce((sum, row) => sum + row.ventaNeta, 0);
      const docs = branchRows.reduce((sum, row) => sum + row.documentos, 0);
      const rawTarget = branchRows.reduce((sum, row) => sum + row.meta, 0);
      const target = rawTarget || branch.target / 7 * Math.max(dates.length, 1);
      return {
        ...branch,
        sales,
        docs,
        target,
        gap: sales - target,
        compliance: sales / Math.max(target, 1),
        ticket: sales / Math.max(docs, 1)
      };
    });
  }
  return currentBranches().map((branch) => {
    const sales = dates.reduce((sum, date) => sum + branchValue(branch, date, "sales", previous), 0);
    const docs = dates.reduce((sum, date) => sum + branchValue(branch, date, "docs", previous), 0);
    const target = branch.target / 7 * Math.max(dates.length, 1);
    return { ...branch, sales, docs, target, gap: sales - target, compliance: sales / Math.max(target, 1), ticket: sales / Math.max(docs, 1) };
  });
}

function renderModuleContent() {
  if (!currentBranches().length) {
    els.moduleContent.innerHTML = `<section class="panel"><p class="eyebrow">Sin datos</p><h2>${state.activeBrand}</h2><p class="subtitle">Este apartado queda listo para conectar sucursales cuando tengas la data.</p></section>`;
    return;
  }
  if (state.activeModule === "products") renderProductContent();
  else if (state.activeModule === "flow") renderFlowContent();
  else renderSalesContent();
}

function renderSalesContent() {
  els.moduleContent.innerHTML = `
    <section class="content-grid sales-grid">
      <article class="panel trend-panel full">
        <div class="panel-heading">
          <div><p class="eyebrow">Tendencia</p><h2>Ventas netas por dia</h2><p class="chart-note">${periodLabel()}</p></div>
          <div class="segmented" role="group" aria-label="Vista de tendencia">
            <button class="segment ${state.chartMode === "sales" ? "active" : ""}" type="button" data-chart-mode="sales">Ventas</button>
            <button class="segment ${state.chartMode === "docs" ? "active" : ""}" type="button" data-chart-mode="docs">Docs</button>
            <button class="segment ${state.chartMode === "margin" ? "active" : ""}" type="button" data-chart-mode="margin">Margen</button>
          </div>
        </div>
        <div id="trendChart" class="chart"></div>
      </article>
      <article class="panel cumulative-panel">
        <div class="panel-heading">
          <div><p class="eyebrow">Acumulado</p><h2>Acumulado</h2><p class="chart-note">${state.cumulativeMode === "sales" ? "Ordenado por venta neta" : "Ordenado por documentos"}</p></div>
          <div class="segmented" role="group" aria-label="Vista de acumulado">
            <button class="segment ${state.cumulativeMode === "sales" ? "active" : ""}" type="button" data-cumulative-mode="sales">Ventas</button>
            <button class="segment ${state.cumulativeMode === "docs" ? "active" : ""}" type="button" data-cumulative-mode="docs">Docs</button>
          </div>
        </div>
        <div id="waterfallChart" class="chart cumulative-chart"></div>
      </article>
      <article class="panel score-panel"><div class="panel-heading"><div><p class="eyebrow">Diagnostico</p><h2>Semaforo por sucursal</h2></div></div><div id="branchScorecards" class="score-list"></div></article>
      <article class="panel risk-panel"><div class="panel-heading"><div><p class="eyebrow">Riesgo</p><h2>Riesgo operativo</h2><p class="chart-note">Linea horizontal en $0</p></div></div><div id="deficitChart" class="chart risk-chart"></div></article>
      <article class="panel full"><div class="panel-heading"><div><p class="eyebrow">Mapa de calor</p><h2>Documentos por dia y sucursal</h2></div></div><div id="heatmap" class="heatmap"></div></article>
    </section>
    <section class="table-section">
      <div class="table-toolbar"><div><p class="eyebrow">Detalle accionable</p><h2>Ventas netas vs meta</h2></div><input id="tableSearch" type="search" placeholder="Buscar sucursal, estado o alerta"></div>
      <div class="table-wrap"><table><thead><tr><th>Sucursal</th><th>Venta neta</th><th>Periodo anterior</th><th>Meta 100%</th><th>Cumplimiento</th><th>GAP</th><th>Estado</th></tr></thead><tbody id="detailRows"></tbody></table></div>
    </section>
    <article class="panel full">
      <div class="panel-heading">
        <div><p class="eyebrow">Comparativo</p><h2>Desempeño por sucursal</h2><p class="chart-note">${periodLabel()}</p></div>
        <div class="segmented">
          <button class="segment ${state.compareMode === "sales" ? "active" : ""}" type="button" data-compare-mode="sales">Ventas</button>
          <button class="segment ${state.compareMode === "docs" ? "active" : ""}" type="button" data-compare-mode="docs">Docs</button>
        </div>
      </div>
      <div id="branchComparisonChart" class="chart"></div>
    </article>`;
  bindSegmented();
  renderTrendChart();
  renderWaterfall();
  renderScorecards();
  renderHeatmap();
  renderDeficit();
  renderSalesTable();
  renderBranchComparison();
}

function renderBranchComparison() {
  const container = document.querySelector("#branchComparisonChart");
  if (!container) return;
  const branches = activeBranchRows();
  if (!branches.length) {
    container.innerHTML = `<div class="empty-state">Selecciona sucursales para comparar.</div>`;
    return;
  }
  const metric = state.compareMode;
  const data = branches.map((b) => ({
    name: b.name,
    value: metric === "docs" ? b.docs : b.sales,
    color: b.color
  }));
  const n = data.length;
  const width = Math.max(460, n * 160 + 116);
  const height = 300;
  const pad = { top: 26, right: 24, bottom: 56, left: 62 };
  const max = Math.max(...data.map((d) => d.value), 1) * 1.22;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const slot = innerW / n;
  const barW = Math.min(80, Math.max(28, slot * 0.62));
  const bars = data.map((item, i) => {
    const x = pad.left + i * slot + (slot - barW) / 2;
    const h = Math.max(2, item.value / max * innerH);
    const y = pad.top + innerH - h;
    const label = metric === "docs" ? numberFormatter.format(item.value) : formatter.format(item.value);
    const shortName = item.name.length > 16 ? item.name.slice(0, 15) + "…" : item.name;
    return `
      <rect class="bar" data-title="${item.name}" data-value="${label}" x="${x}" y="${y}" width="${barW}" height="${h}" rx="6" fill="${item.color}"></rect>
      <text class="value-label" x="${x + barW / 2}" y="${Math.max(y - 7, 14)}" text-anchor="middle">${compactNumber(item.value)}</text>
      <text class="axis-label" x="${x + barW / 2}" y="${height - 10}" text-anchor="middle">${shortName}</text>`;
  }).join("");
  container.innerHTML = `<svg style="width:${width}px; min-width:100%" viewBox="0 0 ${width} ${height}" role="img" aria-label="Comparativo por sucursal">
    ${gridLines(width, pad, innerH, max)}${bars}
  </svg>`;
  bindChartHover(container);
}

function renderProductContent() {
  const categorySummary = productCategoryLabel();
  els.moduleContent.innerHTML = `
    <section class="product-filter-strip">
      <div class="category-picker" id="categoryPicker">
        <span class="filter-title">Categoria</span>
        <details class="category-menu" ${state.categoryMenuOpen ? "open" : ""}>
          <summary>${categorySummary}</summary>
          <div class="category-options">
            <label class="category-option"><input type="checkbox" data-category-option value="Todas" ${allProductCategoriesSelected() ? "checked" : ""}>Todas las categorias</label>
            ${productCategories.map((category) => `<label class="category-option"><input type="checkbox" data-category-option value="${category}" ${state.productCategories.has(category) ? "checked" : ""}>${category}</label>`).join("")}
          </div>
        </details>
      </div>
      <span>${allProductCategoriesSelected() ? "Mostrando todas las familias de producto." : `Filtrado por ${categorySummary}.`}</span>
    </section>
    <section class="content-grid equal">
      <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Top</p><h2>Productos lideres</h2><p class="chart-note">${periodLabel()}</p></div></div><div id="topProducts" class="ranking-list"></div></article>
      <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Bottom</p><h2>Productos con menor movimiento</h2></div></div><div id="bottomProducts" class="ranking-list"></div></article>
      <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Categoria</p><h2>Mix de cantidad</h2></div></div><div class="donut-wrap"><div id="categoryDonut" class="chart compact"></div><div id="categoryLegend" class="legend"></div></div></article>
      <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Distribucion</p><h2>Treemap de productos</h2></div></div><div id="productTreemap" class="treemap"></div></article>
    </section>
    <section class="table-section"><div class="table-toolbar"><div><p class="eyebrow">Matriz de producto</p><h2>Cantidad por sucursal</h2></div><input id="productSearch" type="search" placeholder="Buscar producto o categoria"></div><div class="table-wrap"><table><thead id="productHead"></thead><tbody id="productRows"></tbody></table></div></section>`;
  document.querySelectorAll("[data-category-option]").forEach((input) => input.addEventListener("change", (event) => {
    const value = event.target.value;
    state.categoryMenuOpen = true;
    if (value === "Todas") {
      state.productCategories = new Set(["Todas"]);
    } else {
      state.productCategories.delete("Todas");
      if (event.target.checked) state.productCategories.add(value);
      else state.productCategories.delete(value);
      if (!state.productCategories.size) state.productCategories = new Set(["Todas"]);
    }
    state.tableSearch = "";
    renderAll();
  }));
  document.querySelector(".category-menu").addEventListener("toggle", (event) => {
    state.categoryMenuOpen = event.currentTarget.open;
  });
  renderProductRanks();
  renderProductDonut();
  renderTreemap();
  renderProductTable();
}

function renderFlowContent() {
  els.moduleContent.innerHTML = `
    <section class="flow-cards" id="flowCards"></section>
    <section class="content-grid">
      <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Horas pico</p><h2>Venta por franja horaria</h2><p class="chart-note">${periodLabel()}</p></div></div><div id="peakSalesChart" class="chart"></div></article>
      <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Conversion</p><h2>Flujo vs venta</h2></div></div><div id="flowScatter" class="chart compact"></div></article>
      <article class="panel full"><div class="panel-heading"><div><p class="eyebrow">Mapa operativo</p><h2>Intensidad de trafico por hora</h2></div></div><div id="hourHeatmap" class="hour-heatmap"></div></article>
    </section>
    <section class="table-section"><div class="table-toolbar"><div><p class="eyebrow">Plan de accion</p><h2>Recomendaciones por sucursal</h2></div></div><div class="table-wrap"><table><thead><tr><th>Sucursal</th><th>Hora pico</th><th>Conversion</th><th>Venta pico</th><th>Periodo anterior</th><th>Senal</th></tr></thead><tbody id="flowRows"></tbody></table></div></section>`;
  renderFlowCards();
  renderPeakSalesChart();
  renderFlowScatter();
  renderHourHeatmap();
  renderFlowTable();
}

function renderTrendChart() {
  const container = document.querySelector("#trendChart");
  const series = rangeSeries(state.chartMode);
  const previous = rangeSeries(state.chartMode, true);
  if (!series.length) {
    container.innerHTML = `<div class="empty-state">Selecciona un rango valido para graficar.</div>`;
    return;
  }
  const width = Math.max(860, series.length * 66 + 116);
  const height = 320;
  const pad = { top: 26, right: 24, bottom: 46, left: 62 };
  const max = Math.max(...series.map((item) => item.total), 1) * 1.22;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const slot = innerW / series.length;
  const barW = Math.max(12, slot * 0.58);
  container.classList.toggle("scrollable", series.length > 14);
  container.innerHTML = `
    <svg style="width:${width}px; min-width:100%" viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafica de tendencia">
      ${gridLines(width, pad, innerH, max)}
      ${previousLine(previous, max, width, height, pad)}
      ${series.map((item, index) => {
        const x = pad.left + index * slot + (slot - barW) / 2;
        const h = item.total / max * innerH;
        const y = pad.top + innerH - h;
        const label = state.chartMode === "docs" ? numberFormatter.format(item.total) : formatter.format(item.total);
        return `
          <rect class="bar" data-title="${item.label}" data-value="${label}" x="${x}" y="${y}" width="${barW}" height="${h}" rx="6" fill="#18c77a"></rect>
          <text class="value-label" x="${x + barW / 2}" y="${Math.max(y - 7, 14)}" text-anchor="middle">${compactNumber(item.total)}</text>
          <text class="axis-label" x="${x + barW / 2}" y="${height - 14}" text-anchor="middle">${item.label}</text>
        `;
      }).join("")}
    </svg>`;
  bindChartHover(container);
}

function renderWaterfall() {
  const container = document.querySelector("#waterfallChart");
  const daily = rangeSeries(state.cumulativeMode);
  if (!daily.length) {
    container.innerHTML = `<div class="empty-state">Selecciona un rango valido para graficar.</div>`;
    return;
  }
  const dayLabels = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
  const valueFormatter = state.cumulativeMode === "docs" ? numberFormatter : exactFormatter;
  const weekly = dayLabels.map((label, index) => ({
    label,
    total: daily
      .filter((item) => (item.date.getDay() === 0 ? 6 : item.date.getDay() - 1) === index)
      .reduce((sum, item) => sum + item.total, 0)
  })).sort((a, b) => a.total - b.total);
  let runningTotal = 0;
  const bars = weekly.map((item) => {
    const start = runningTotal;
    runningTotal += item.total;
    return { ...item, start, end: runningTotal };
  });
  bars.push({ label: "Total", total: runningTotal, start: 0, end: runningTotal, final: true });
  const width = Math.max(620, bars.length * 76 + 116);
  const height = 280;
  const pad = { top: 26, right: 20, bottom: 42, left: 58 };
  const max = Math.max(...bars.map((item) => item.end), 1) * 1.12;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const slot = innerW / bars.length;
  const barW = Math.max(12, slot * 0.58);
  container.classList.remove("scrollable");
  container.innerHTML = `<svg style="width:${width}px; min-width:100%" viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafica acumulada">
    ${gridLines(width, pad, innerH, max)}
    ${bars.map((item, index) => {
      const x = pad.left + index * slot + (slot - barW) / 2;
      const h = (item.end - item.start) / max * innerH;
      const y = pad.top + innerH - item.end / max * innerH;
      const tooltip = item.final
        ? `${valueFormatter.format(item.total)} total`
        : `${valueFormatter.format(item.end)} (${item.total >= 0 ? "+" : ""}${valueFormatter.format(item.total)})`;
      return `<rect class="bar" data-title="${item.label}" data-value="${tooltip}" x="${x}" y="${y}" width="${barW}" height="${Math.max(h, 2)}" rx="5" fill="${item.final ? "#18c77a" : "#2f8cff"}"></rect>
        <text class="value-label" x="${x + barW / 2}" y="${Math.max(y - 7, 14)}" text-anchor="middle">${compactNumber(item.total)}</text>
        <text class="axis-label" x="${x + barW / 2}" y="${height - 12}" text-anchor="middle">${item.label}</text>`;
    }).join("")}
  </svg>`;
  bindChartHover(container);
}

function renderScorecards() {
  const container = document.querySelector("#branchScorecards");
  container.innerHTML = activeBranchRows().map((branch) => {
    const risk = branch.compliance >= 1 ? "good" : branch.compliance >= 0.75 ? "warning" : "danger";
    const label = risk === "good" ? "Fuerte" : risk === "warning" ? "Vigilar" : "Critico";
    return `<button class="score-card" type="button" data-branch-card="${branch.name}">
      <span class="score-top"><strong>${branch.name}</strong><span class="badge ${risk}">${label}</span></span>
      <span class="progress-line"><span>${percent(branch.compliance)}</span><span class="meter"><span style="width:${Math.min(branch.compliance, 1.15) * 100}%; background:${branch.color}"></span></span></span>
      <span class="kpi-meta">${formatter.format(branch.gap)} GAP · ${branch.margin.toFixed(1)}% margen</span>
    </button>`;
  }).join("");
  document.querySelectorAll("[data-branch-card]").forEach((button) => button.addEventListener("click", () => openInspectorForBranch(button.dataset.branchCard)));
}

function renderHeatmap() {
  const container = document.querySelector("#heatmap");
  const rows = activeBranchRows();
  const dates = dateList();
  const values = rows.flatMap((branch) => dates.map((date) => branchValue(branch, date, "docs")));
  const max = Math.max(...values, 1);
  container.style.gridTemplateColumns = `132px repeat(${dates.length}, 76px)`;
  container.classList.toggle("scrollable", dates.length > 7);
  container.innerHTML = [
    `<div class="heat-head">Sucursal</div>`,
    ...dates.map((date) => `<div class="heat-head">${formatChartDate(date)}</div>`),
    ...rows.flatMap((branch) => [
      `<div class="heat-head">${branch.name}</div>`,
      ...dates.map((date) => {
        const value = branchValue(branch, date, "docs");
        const bg = mixColor("#0f3328", branch.color, value / max);
        return `<button class="heat-cell" type="button" data-heat="${branch.name}|${formatChartDate(date)}|${value}" style="background:${bg}">${value}</button>`;
      })
    ])
  ].join("");
  document.querySelectorAll("[data-heat]").forEach((cell) => {
    cell.addEventListener("click", () => {
      const [branch, day, value] = cell.dataset.heat.split("|");
      openInspector({ title: `${branch} · ${day}`, body: `${value} documentos registrados.`, metrics: [["Documentos", value], ["Periodo", periodLabel()]] });
    });
  });
}

function renderDeficit() {
  const container = document.querySelector("#deficitChart");
  const values = activeBranchRows().map((branch) => ({ name: branch.name, value: branch.gap, color: branch.color }));
  const width = 720;
  const height = 400;
  const pad = { top: 34, right: 34, bottom: 66, left: 86 };
  const maxAbs = Math.max(...values.map((item) => Math.abs(item.value)), 100000) * 1.18;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const zeroY = pad.top + innerH / 2;
  const slot = innerW / values.length;
  const barW = Math.max(20, slot * 0.55);
  container.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Riesgo operativo">
    <line x1="${pad.left}" y1="${zeroY}" x2="${width - pad.right}" y2="${zeroY}" stroke="rgba(244,247,251,.58)" stroke-width="1.4" stroke-dasharray="6 4"></line>
    <text class="axis-label" x="${pad.left - 8}" y="${zeroY + 4}" text-anchor="end">$0</text>
    ${[-1, 1].map((sign) => {
      const y = zeroY - sign * innerH / 2;
      return `<line class="grid-line" x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}"></line><text class="axis-label" x="${pad.left - 8}" y="${y + 4}" text-anchor="end">${formatter.format(sign * maxAbs)}</text>`;
    }).join("")}
    ${values.map((item, index) => {
      const x = pad.left + index * slot + (slot - barW) / 2;
      const h = Math.abs(item.value) / maxAbs * (innerH / 2);
      const y = item.value >= 0 ? zeroY - h : zeroY;
      const labelY = item.value >= 0 ? Math.max(y - 7, 14) : y + h + 14;
      return `<rect class="bar" data-title="${item.name}" data-value="${formatter.format(item.value)}" x="${x}" y="${y}" width="${barW}" height="${Math.max(h, 2)}" rx="7" fill="${item.value >= 0 ? "#18c77a" : "#ff5d55"}"></rect>
        <text class="value-label" x="${x + barW / 2}" y="${labelY}" text-anchor="middle">${compactNumber(item.value)}</text>
        <text class="axis-label" x="${x + barW / 2}" y="${height - 14}" text-anchor="middle">${shortName(item.name)}</text>`;
    }).join("")}
  </svg>`;
  bindChartHover(container);
}

function renderSalesTable() {
  const input = document.querySelector("#tableSearch");
  const rows = document.querySelector("#detailRows");
  const query = state.tableSearch.trim().toLowerCase();
  const previous = Object.fromEntries(activeBranchRows(true).map((branch) => [branch.name, branch]));
  const data = activeBranchRows().filter((branch) => branch.name.toLowerCase().includes(query));
  rows.innerHTML = data.map((branch) => {
    const risk = branch.compliance >= 1 ? "good" : branch.compliance >= 0.75 ? "warning" : "danger";
    return `<tr data-row="${branch.name}">
      <td><strong>${branch.name}</strong></td><td>${exactFormatter.format(branch.sales)}</td><td>${exactFormatter.format(previous[branch.name]?.sales ?? 0)}</td><td>${exactFormatter.format(branch.target)}</td>
      <td><span class="progress-line"><span>${percent(branch.compliance)}</span><span class="meter"><span style="width:${Math.min(branch.compliance, 1.15) * 100}%; background:${branch.color}"></span></span></span></td>
      <td>${exactFormatter.format(branch.gap)}</td><td><span class="badge ${risk}">${risk === "good" ? "Fuerte" : risk === "warning" ? "Vigilar" : "Critico"}</span></td>
    </tr>`;
  }).join("");
  input.value = state.tableSearch;
  input.addEventListener("input", (event) => { state.tableSearch = event.target.value; renderSalesTable(); });
  document.querySelectorAll("[data-row]").forEach((row) => row.addEventListener("click", () => openInspectorForBranch(row.dataset.row)));
}

function renderProductRanks() {
  const topContainer = document.querySelector("#topProducts");
  const bottomContainer = document.querySelector("#bottomProducts");
  const allProducts = productRows();
  const previousProducts = productRows(true);
  const previousByName = new Map(previousProducts.map((item) => [item.name, item]));
  const sorted = [...allProducts].sort((a, b) => b.total - a.total).slice(0, 8);
  const bottom = sheetData.loaded
    ? [...allProducts].filter((item) => item.total > 0).sort((a, b) => a.total - b.total).slice(0, 8)
    : bottomProducts;
  const topMax = Math.max(...sorted.map((item) => item.total), ...sorted.map((item) => previousByName.get(item.name)?.total || 0), 1);
  const bottomMax = Math.max(...bottom.map((item) => item.total), ...bottom.map((item) => previousByName.get(item.name)?.total || 0), 1);
  topContainer.innerHTML = sorted.length
    ? sorted.map((item, index) => rankRow(item.name, item.total, item.category, item.total / topMax, index, false, previousByName.get(item.name)?.total || 0, topMax)).join("")
    : `<div class="empty-state">No hay productos en esta categoria para el periodo.</div>`;
  bottomContainer.innerHTML = bottom.length
    ? bottom.map((item, index) => rankRow(item.name, item.total, item.category || "Minimo movimiento", item.total / bottomMax, index, true, previousByName.get(item.name)?.total || 0, bottomMax)).join("")
    : `<div class="empty-state">Sin bottom en el periodo seleccionado.</div>`;
  document.querySelectorAll("[data-product]").forEach((button) => button.addEventListener("click", () => openInspectorForProduct(button.dataset.product)));
}

function rankRow(name, value, meta, progress, index, bottom = false, previousValue = 0, scaleMax = 1) {
  const delta = value - previousValue;
  const hasPrevious = previousValue > 0;
  const deltaLabel = hasPrevious ? `${delta >= 0 ? "+" : ""}${percentChange(value, previousValue)} vs anterior` : "Sin periodo anterior";
  const previousProgress = previousValue / Math.max(scaleMax, 1);
  return `<button class="rank-row" type="button" data-product="${name}">
    <span class="rank-top"><strong>${index + 1}. ${name}</strong><span class="badge ${bottom ? "danger" : "good"}">${numberFormatter.format(value)}</span></span>
    <span class="rank-bars">
      <span class="meter current"><span style="width:${Math.max(progress * 100, 4)}%; background:${bottom ? "var(--red)" : "var(--green)"}"></span></span>
      <span class="meter previous"><span style="width:${hasPrevious ? Math.max(previousProgress * 100, 4) : 0}%;"></span></span>
    </span>
    <span class="rank-compare"><span>Anterior: ${hasPrevious ? numberFormatter.format(previousValue) : "s/d"}</span><span class="${delta >= 0 ? "rank-up" : "rank-down"}">${deltaLabel}</span></span>
    <span class="kpi-meta">${meta}</span>
  </button>`;
}

function renderProductDonut() {
  const container = document.querySelector("#categoryDonut");
  const legend = document.querySelector("#categoryLegend");
  const selected = selectedProductCategories();
  const mix = allProductCategoriesSelected() || selected.length > 1
    ? categoryBreakdown().slice(0, 6)
    : [{ name: selected[0], value: productTotals().quantity ? 100 : 0, color: "#18c77a" }];
  const width = 280;
  const height = 250;
  const cx = 138;
  const cy = 122;
  const radius = 86;
  const stroke = 34;
  let start = -90;
  const slices = mix.map((item) => {
    const angle = item.value / 100 * 360;
    const path = donutArc(cx, cy, radius, start, start + angle);
    const mid = polarToCartesian(cx, cy, radius + 34, start + angle / 2);
    const label = `${item.value.toFixed(1)}%`;
    start += angle;
    return `<path data-title="${item.name}" data-value="${label}" d="${path}" fill="none" stroke="${item.color}" stroke-width="${stroke}" stroke-linecap="round"></path>
      <text class="value-label" x="${mid.x}" y="${mid.y}" text-anchor="middle">${label}</text>`;
  }).join("");
  container.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Mix de categorias">
    <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="${stroke}"></circle>${slices}
    <text x="${cx}" y="${cy - 2}" text-anchor="middle" fill="#f4f7fb" font-size="28" font-weight="900">${(mix[0]?.value ?? 0).toFixed(1)}%</text>
    <text x="${cx}" y="${cy + 22}" text-anchor="middle" fill="#8f9bad" font-size="12">categoria lider</text>
  </svg>`;
  legend.innerHTML = mix.map((item) => `<div class="legend-item"><span class="legend-swatch" style="background:${item.color}"></span><span>${item.name} · ${item.value.toFixed(1)}%</span></div>`).join("");
  bindChartHover(container);
}

function renderTreemap() {
  const container = document.querySelector("#productTreemap");
  const sorted = [...productRows()].sort((a, b) => b.total - a.total).slice(0, 10);
  const colors = ["#18c77a", "#2f8cff", "#ff5d55", "#f2b84b", "#9b7cff"];
  if (!sorted.length) {
    container.innerHTML = `<div class="empty-state">Sin productos para graficar.</div>`;
    return;
  }
  container.innerHTML = sorted.map((item, index) => `<button class="tree-cell" type="button" data-product="${item.name}" style="background:${colors[index % colors.length]}"><span>${compactName(item.name)}</span><strong>${item.total}</strong></button>`).join("");
  document.querySelectorAll(".tree-cell").forEach((cell) => cell.addEventListener("click", () => openInspectorForProduct(cell.dataset.product)));
}

function renderProductTable() {
  const input = document.querySelector("#productSearch");
  const head = document.querySelector("#productHead");
  const rows = document.querySelector("#productRows");
  const branches = currentBranches();
  const query = state.tableSearch.trim().toLowerCase();
  const data = productRows().filter((row) => `${row.name} ${row.category}`.toLowerCase().includes(query));
  head.innerHTML = `<tr><th>Producto</th>${branches.map((branch) => `<th>${branch.name}</th>`).join("")}<th>Total</th><th>Categoria</th></tr>`;
  rows.innerHTML = data.length
    ? data.map((row) => `<tr data-product-row="${row.name}"><td><strong>${row.name}</strong></td>${branches.map((branch) => `<td>${numberFormatter.format(row.quantities[branch.name] || 0)}</td>`).join("")}<td>${numberFormatter.format(row.total)}</td><td>${row.category}</td></tr>`).join("")
    : `<tr><td colspan="${branches.length + 3}">No hay productos demo para esta categoria. Al conectar la base, aqui entraran los productos reales.</td></tr>`;
  input.value = state.tableSearch;
  input.addEventListener("input", (event) => { state.tableSearch = event.target.value; renderProductTable(); });
  document.querySelectorAll("[data-product-row]").forEach((row) => row.addEventListener("click", () => openInspectorForProduct(row.dataset.productRow)));
}

function renderFlowCards() {
  const container = document.querySelector("#flowCards");
  const hours = activeFlowHours();
  const trafficLabel = sheetData.loaded ? "docs" : "visitas demo";
  container.innerHTML = flowRows().map((row) => `<article class="flow-card"><p class="eyebrow">${row.name}</p><strong>${hours[row.peakIndex]}:00 · ${formatter.format(row.sales[row.peakIndex])}</strong><span class="kpi-meta">${row.conversion}% conversion · ${numberFormatter.format(row.traffic.reduce((a, b) => a + b, 0))} ${trafficLabel}</span><span class="meter"><span style="width:${row.conversion}%; background:${row.color}"></span></span></article>`).join("");
}

function renderPeakSalesChart() {
  const container = document.querySelector("#peakSalesChart");
  const data = flowRows();
  const hours = activeFlowHours();
  const hourTotals = hours.map((hour, index) => ({ hour, sale: data.reduce((sum, row) => sum + row.sales[index], 0) }));
  const width = 860;
  const height = 320;
  const pad = { top: 26, right: 24, bottom: 44, left: 62 };
  const max = Math.max(...hourTotals.map((item) => item.sale), 1) * 1.2;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const slot = innerW / hourTotals.length;
  const barW = slot * 0.58;
  container.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Ventas por hora">
    ${gridLines(width, pad, innerH, max)}
    ${hourTotals.map((item, index) => {
      const x = pad.left + index * slot + (slot - barW) / 2;
      const h = item.sale / max * innerH;
      const y = pad.top + innerH - h;
      return `<rect class="bar" data-title="${item.hour}:00" data-value="${formatter.format(item.sale)}" x="${x}" y="${y}" width="${barW}" height="${h}" rx="6" fill="#22d3ee"></rect>
        <text class="value-label" x="${x + barW / 2}" y="${Math.max(y - 7, 14)}" text-anchor="middle">${compactNumber(item.sale)}</text>
        <text class="axis-label" x="${x + barW / 2}" y="${height - 12}" text-anchor="middle">${item.hour}:00</text>`;
    }).join("")}
  </svg>`;
  bindChartHover(container);
}

function renderFlowScatter() {
  const container = document.querySelector("#flowScatter");
  const hours = activeFlowHours();
  const points = flowRows().flatMap((row) => row.sales.map((sale, index) => ({ branch: row.name, color: row.color, hour: hours[index], sale, traffic: row.traffic[index] })));
  const width = Math.max(540, points.length * 34 + 160);
  const height = 280;
  const pad = { top: 28, right: 24, bottom: 38, left: 58 };
  const maxSale = Math.max(...points.map((point) => point.sale), 1);
  const maxTraffic = Math.max(...points.map((point) => point.traffic), 1);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  container.classList.toggle("scrollable", points.length > 16);
  container.innerHTML = `<svg style="width:${width}px; min-width:100%" viewBox="0 0 ${width} ${height}" role="img" aria-label="Flujo contra ventas">
    ${gridLines(width, pad, innerH, maxSale)}
    ${points.map((point) => {
      const x = pad.left + point.traffic / maxTraffic * innerW;
      const y = pad.top + innerH - point.sale / maxSale * innerH;
      return `<circle data-title="${point.branch} ${point.hour}:00" data-value="${formatter.format(point.sale)} · ${point.traffic} visitas" cx="${x}" cy="${y}" r="6" fill="${point.color}" opacity="0.86"></circle><text class="axis-label" x="${x + 8}" y="${y - 7}">${compactNumber(point.sale)}</text>`;
    }).join("")}
    <text class="axis-label" x="${width / 2}" y="${height - 8}" text-anchor="middle">${sheetData.loaded ? "Documentos" : "Trafico estimado"}</text>
  </svg>`;
  bindChartHover(container);
}

function renderHourHeatmap() {
  const container = document.querySelector("#hourHeatmap");
  const data = flowRows();
  const hours = activeFlowHours();
  const max = Math.max(...data.flatMap((row) => row.traffic), 1);
  container.style.gridTemplateColumns = `132px repeat(${hours.length}, minmax(70px, 1fr))`;
  container.innerHTML = [
    `<div class="heat-head">Sucursal</div>`,
    ...hours.map((hour) => `<div class="heat-head">${hour}:00</div>`),
    ...data.flatMap((row) => [
      `<div class="heat-head">${row.name}</div>`,
      ...row.traffic.map((value, index) => `<button class="heat-cell" type="button" data-hour="${row.name}|${hours[index]}|${value}" style="background:${mixColor("#0f3328", row.color, value / max)}">${value}</button>`)
    ])
  ].join("");
  document.querySelectorAll("[data-hour]").forEach((cell) => {
    cell.addEventListener("click", () => {
      const [branch, hour, value] = cell.dataset.hour.split("|");
      openInspector({ title: `${branch} · ${hour}:00`, body: `${value} ${sheetData.loaded ? "documentos" : "visitas demo"} en la franja.`, metrics: [["Trafico", value], ["Accion", Number(value) > 100 ? "Refuerzo operativo" : "Monitoreo"]] });
    });
  });
}

function renderFlowTable() {
  const rows = document.querySelector("#flowRows");
  const hours = activeFlowHours();
  const previousRows = Object.fromEntries(flowRowsForRange(true).map((row) => [row.name, row]));
  rows.innerHTML = flowRows().map((row) => {
    const risk = row.conversion >= 80 ? "good" : row.conversion >= 68 ? "warning" : "danger";
    const previousRow = previousRows[row.name];
    const previous = sheetData.loaded
      ? previousRow?.sales[previousRow.peakIndex] ?? 0
      : Math.round(row.sales[row.peakIndex] * row.previousFactor);
    return `<tr data-flow-row="${row.name}"><td><strong>${row.name}</strong></td><td>${hours[row.peakIndex]}:00</td><td>${row.conversion}%</td><td>${formatter.format(row.sales[row.peakIndex])}</td><td>${formatter.format(previous)}</td><td><span class="badge ${risk}">${risk === "good" ? "Replicar" : risk === "warning" ? "Vigilar" : "Reforzar"}</span></td></tr>`;
  }).join("");
  document.querySelectorAll("[data-flow-row]").forEach((row) => row.addEventListener("click", () => openInspectorForFlow(row.dataset.flowRow)));
}

function bindSegmented() {
  document.querySelectorAll("[data-chart-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.chartMode = button.dataset.chartMode;
      renderSalesContent();
    });
  });
  document.querySelectorAll("[data-compare-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.compareMode = button.dataset.compareMode;
      renderBranchComparison();
      document.querySelectorAll("[data-compare-mode]").forEach((b) =>
        b.classList.toggle("active", b.dataset.compareMode === state.compareMode)
      );
    });
  });
  document.querySelectorAll("[data-cumulative-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.cumulativeMode = button.dataset.cumulativeMode;
      renderSalesContent();
    });
  });
}

function gridLines(width, pad, innerH, max) {
  return [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = pad.top + innerH - ratio * innerH;
    return `<line class="grid-line" x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}"></line><text class="axis-label" x="${pad.left - 10}" y="${y + 4}" text-anchor="end">${compactNumber(max * ratio)}</text>`;
  }).join("");
}

function previousLine(series, max, width, height, pad) {
  if (!series.length) return "";
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const slot = innerW / series.length;
  const path = series.map((item, index) => {
    const x = pad.left + index * slot + slot / 2;
    const y = pad.top + innerH - item.total / max * innerH;
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
  return `<path d="${path}" fill="none" stroke="#8f9bad" stroke-width="2" stroke-dasharray="7 6"></path><text class="axis-label" x="${width - pad.right}" y="16" text-anchor="end">periodo anterior</text>`;
}

function donutArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx, cy, r, angle) {
  const angleRad = (angle - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function bindChartHover(container) {
  container.querySelectorAll("[data-title]").forEach((node) => {
    node.addEventListener("mousemove", (event) => {
      els.tooltip.textContent = `${node.dataset.title}: ${node.dataset.value}`;
      els.tooltip.style.left = `${event.clientX + 12}px`;
      els.tooltip.style.top = `${event.clientY + 12}px`;
      els.tooltip.classList.add("show");
    });
    node.addEventListener("mouseleave", () => els.tooltip.classList.remove("show"));
    node.addEventListener("click", () => openInspector({ title: node.dataset.title, body: `Valor seleccionado: ${node.dataset.value}.`, metrics: [["Periodo", periodLabel()], ["Modulo", moduleMeta[state.activeModule].title]] }));
  });
}

function openInspectorForKpi(key) {
  const current = totals();
  const previous = totals(true);
  const product = productTotals();
  const flow = flowTotals();
  const map = {
    sales: { title: "Venta neta", body: "Indicador principal de ingreso neto contra meta 100%.", metrics: [["Actual", exactFormatter.format(current.sales)], ["Anterior", exactFormatter.format(previous.sales)], ["GAP", exactFormatter.format(current.gap)]] },
    ticket: { title: "Ticket medio", body: "Promedio por documento.", metrics: [["Actual", exactFormatter.format(current.ticket)], ["Anterior", exactFormatter.format(previous.ticket)], ["Documentos", numberFormatter.format(current.docs)]] },
    compliance: { title: "Cumplimiento", body: "Avance contra meta fija al 100%.", metrics: [["Actual", percent(current.compliance)], ["Anterior", percent(previous.compliance)], ["Meta", exactFormatter.format(current.target)]] },
    margin: { title: "Margen estimado", body: "Margen ponderado por venta.", metrics: [["Actual", `${current.margin.toFixed(1)}%`], ["Anterior", `${previous.margin.toFixed(1)}%`]] },
    "product-sales": { title: "Venta de producto", body: "Venta neta del modulo producto.", metrics: [["Venta", exactFormatter.format(product.sales)], ["Periodo", periodLabel()]] },
    "product-units": { title: "Cantidad", body: "Volumen vendido en el rango.", metrics: [["Cantidad", numberFormatter.format(product.quantity)], ["Ticket por unidad", exactFormatter.format(product.avg)]] },
    "top-product": { title: product.top.name, body: "Producto lider del periodo.", metrics: [["Unidades", product.top.total], ["Categoria", product.top.category]] },
    "category-mix": { title: product.leadingCategory.name, body: "Categoria con mayor participacion.", metrics: [["Participacion", `${product.leadingCategory.value}%`]] },
    "peak-hour": { title: "Hora pico", body: "Franja con mayor venta estimada.", metrics: [["Hora", `${flow.peak?.hour}:00`], ["Sucursal", flow.peak?.branch ?? "N/A"], ["Venta", formatter.format(flow.peak?.sale ?? 0)]] },
    "flow-sales": { title: "Venta en flujo", body: "Venta acumulada por hora.", metrics: [["Venta", formatter.format(flow.sales)], ["Trafico", numberFormatter.format(flow.traffic)]] },
    "flow-conversion": { title: "Conversion promedio", body: "Cuanto del trafico estimado termina convirtiendo.", metrics: [["Conversion", `${flow.avgConversion.toFixed(0)}%`]] },
    "flow-risk": { title: "Riesgo operativo", body: "Sucursal con menor conversion relativa.", metrics: [["Accion", "Reforzar staffing"], ["Periodo", periodLabel()]] }
  };
  openInspector(map[key]);
}

function openInspectorForBranch(name) {
  const branch = activeBranchRows().find((item) => item.name === name);
  if (!branch) return;
  openInspector({ title: branch.name, body: branch.gap >= 0 ? "Sucursal arriba de meta." : "Sucursal con brecha contra meta 100%.", metrics: [["Venta", exactFormatter.format(branch.sales)], ["Meta", exactFormatter.format(branch.target)], ["Cumplimiento", percent(branch.compliance)], ["GAP", exactFormatter.format(branch.gap)]] });
}

function openInspectorForProduct(name) {
  const product = productRows().find((item) => item.name === name);
  const bottom = bottomProducts.find((item) => item.name === name);
  if (product) {
    const sales = product.sales ?? product.total * 57.55;
    const docs = product.orders ?? Math.max(1, Math.round(product.total / 1.8));
    const branchMetrics = currentBranches().map((branch) => {
      const quantity = product.quantities?.[branch.name] || 0;
      const branchSales = product.salesByBranch?.[branch.name] ?? quantity * 57.55;
      const branchDocs = product.docsByBranch?.[branch.name] ?? Math.max(0, Math.round(quantity / 1.8));
      return [branch.name, `${numberFormatter.format(quantity)} uds · ${exactFormatter.format(branchSales)} · ${branchDocs ? `${numberFormatter.format(branchDocs)} docs` : "docs s/d"}`];
    });
    openInspector({
      title: product.name,
      body: `${product.category}. Detalle de venta, documentos y distribucion por sucursal.`,
      metrics: [
        ["Venta", exactFormatter.format(sales)],
        ["Documentos", docs ? numberFormatter.format(docs) : "Sin dato"],
        ["Cantidad", numberFormatter.format(product.total)],
        ["Ticket/unidad", exactFormatter.format(sales / Math.max(product.total, 1))],
        ...branchMetrics
      ]
    });
  } else if (bottom) {
    openInspector({ title: bottom.name, body: "Producto con movimiento minimo.", metrics: [["Cantidad", bottom.total], ["Accion", "Auditar disponibilidad"]] });
  }
}

function openInspectorForFlow(branchName) {
  const row = flowRows().find((item) => item.name === branchName);
  if (!row) return;
  const hours = activeFlowHours();
  openInspector({ title: row.name, body: `Hora pico ${hours[row.peakIndex]}:00 con ${row.conversion}% conversion.`, metrics: [["Venta pico", formatter.format(row.sales[row.peakIndex])], ["Trafico pico", row.traffic[row.peakIndex]], ["Accion", row.conversion < 70 ? "Reforzar caja/piso" : "Replicar operacion"]] });
}

function openInspector(payload) {
  if (!payload) return;
  els.inspectorTitle.textContent = payload.title;
  els.inspectorBody.textContent = payload.body;
  els.inspectorMetrics.innerHTML = payload.metrics.map(([label, value]) => `<div class="mini-metric"><span>${label}</span><strong>${value}</strong></div>`).join("");
  els.inspector.classList.add("open");
}

function percent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function percentChange(current, previous) {
  return `${(((current - previous) / Math.max(Math.abs(previous), 1)) * 100).toFixed(1)}%`;
}

function compactNumber(value) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${sign}${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}${Math.round(abs / 1000)}K`;
  return `${sign}${Math.round(abs)}`;
}

function compactName(name) {
  return name.replace("MD ", "").replace("DESLACTOSADA", "DESL.").replace("AMERICANO", "AMER.").slice(0, 17);
}

function shortName(name) {
  return name.replace("SG ", "").replace("AMC ", "").replace("Paseo de Montejo", "Montejo").replace("Paseo Montejo", "Montejo").replace("Carretera Motul", "Motul").slice(0, 14);
}

function mixColor(start, end, ratio) {
  const parse = (hex) => hex.match(/\w\w/g).map((part) => parseInt(part, 16));
  const [r1, g1, b1] = parse(start);
  const [r2, g2, b2] = parse(end);
  const mix = (a, b) => Math.round(a + (b - a) * Math.min(Math.max(ratio, 0), 1));
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatShortDate(value) {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function formatChartDate(date) {
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 1800);
}

els.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  login(users[Number(els.userSelect.value)]);
});

document.querySelectorAll(".module-card").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeModule = button.dataset.module;
    state.tableSearch = "";
    ensureModuleDateRange();
    renderAll();
  });
});

document.querySelectorAll(".brand-card").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeBrand = button.dataset.brand;
    state.activeBranches = new Set(brandConfig[state.activeBrand].branches);
    state.tableSearch = "";
    ensureModuleDateRange();
    renderAll();
    showToast(`${state.activeBrand} seleccionado`);
  });
});

els.dateStart.addEventListener("change", (event) => {
  state.dateStart = event.target.value;
  if (state.dateEnd < state.dateStart) state.dateEnd = state.dateStart;
  renderAll();
});

els.dateEnd.addEventListener("change", (event) => {
  state.dateEnd = event.target.value;
  if (state.dateStart > state.dateEnd) state.dateStart = state.dateEnd;
  renderAll();
});

document.querySelector("#closeInspector").addEventListener("click", () => els.inspector.classList.remove("open"));
document.querySelector("#refreshButton").addEventListener("click", () => loadSheetData(true));
document.querySelector("#exportButton").addEventListener("click", openExportModal);
document.querySelector("#logoutButton").addEventListener("click", () => {
  els.appShell.classList.add("locked");
  els.loginScreen.style.display = "grid";
});

async function exportCurrentView() {
  const meta = moduleMeta[state.activeModule];
  const exportButton = document.querySelector("#exportButton");
  const fileName = `${slugify(`INDEF ${meta.title} ${state.activeBrand} ${state.dateStart} ${state.dateEnd}`)}.pdf`;

  if (!window.html2canvas || !window.jspdf?.jsPDF) {
    showToast("No se pudo cargar el generador PDF");
    return;
  }

  exportButton.disabled = true;
  exportButton.textContent = "Generando...";
  showToast("Generando PDF limpio");

  let stage;
  try {
    stage = buildPdfStage();
    await waitForPdfAssets(stage);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pages = [...stage.querySelectorAll(".pdf-page")];

    for (let index = 0; index < pages.length; index += 1) {
      const canvas = await window.html2canvas(pages[index], {
        backgroundColor: "#070a0f",
        scale: 1.55,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: pages[index].scrollWidth,
        windowHeight: pages[index].scrollHeight
      });
      if (index > 0) pdf.addPage("a4", "landscape");
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.94), "JPEG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
    }

    pdf.save(fileName);
    showToast("PDF descargado");
  } catch (error) {
    console.error(error);
    showToast("No se pudo generar el PDF");
  } finally {
    stage?.remove();
    exportButton.disabled = false;
    exportButton.textContent = "Descargar PDF";
  }
}

function buildPdfStage() {
  const stage = document.createElement("div");
  stage.className = "pdf-export-stage";
  document.body.appendChild(stage);

  let page = createPdfPage(stage);
  const appendBlock = (block) => {
    page.appendChild(block);
    if (page.scrollHeight > 1131 && page.children.length > 1) {
      page.removeChild(block);
      page = createPdfPage(stage);
      page.appendChild(block);
    }
  };

  collectPdfBlocks().forEach(appendBlock);
  return stage;
}

function createPdfPage(stage) {
  const page = document.createElement("section");
  page.className = "pdf-page";
  stage.appendChild(page);
  return page;
}

function collectPdfBlocks() {
  const blocks = [
    cloneForPdf(els.printHeader),
    cloneForPdf(els.heroPanel),
    cloneForPdf(els.alertStrip),
    cloneForPdf(els.kpiGrid)
  ];

  [...els.moduleContent.children].forEach((child) => {
    if (child.classList.contains("content-grid") || child.classList.contains("sales-grid")) {
      blocks.push(...splitGridForPdf(child));
    } else if (child.classList.contains("table-section")) {
      blocks.push(...splitTableForPdf(child));
    } else {
      blocks.push(cloneForPdf(child));
    }
  });

  return blocks.filter(Boolean);
}

function splitGridForPdf(grid) {
  const blocks = [];
  let pair = [];
  const flushPair = () => {
    if (!pair.length) return;
    const wrapper = cloneForPdf(grid, false);
    pair.forEach((item) => wrapper.appendChild(cloneForPdf(item)));
    blocks.push(wrapper);
    pair = [];
  };

  [...grid.children].forEach((item) => {
    const full = item.classList.contains("full") || item.classList.contains("trend-panel") || item.classList.contains("risk-panel");
    if (full) {
      flushPair();
      const wrapper = cloneForPdf(grid, false);
      wrapper.appendChild(cloneForPdf(item));
      blocks.push(wrapper);
      return;
    }
    pair.push(item);
    if (pair.length === 2) flushPair();
  });

  flushPair();
  return blocks;
}

function splitTableForPdf(section) {
  const rows = [...section.querySelectorAll("tbody tr")];
  if (rows.length <= 12) return [cloneForPdf(section)];
  const chunks = [];
  const chunkSize = section.querySelectorAll("th").length > 8 ? 8 : 12;

  for (let index = 0; index < rows.length; index += chunkSize) {
    const clone = cloneForPdf(section);
    const input = clone.querySelector("input");
    const tbody = clone.querySelector("tbody");
    input?.remove();
    if (tbody) {
      tbody.innerHTML = "";
      rows.slice(index, index + chunkSize).forEach((row) => tbody.appendChild(cloneForPdf(row)));
    }
    const note = document.createElement("p");
    note.className = "chart-note";
    note.textContent = `Registros ${index + 1}-${Math.min(index + chunkSize, rows.length)} de ${rows.length}`;
    clone.querySelector(".table-toolbar")?.appendChild(note);
    chunks.push(clone);
  }

  return chunks;
}

function cloneForPdf(node, deep = true) {
  if (!node) return null;
  const clone = node.cloneNode(deep);
  if (clone.nodeType === Node.ELEMENT_NODE) {
    clone.removeAttribute("id");
    clone.querySelectorAll?.("[id]").forEach((item) => item.removeAttribute("id"));
    clone.querySelectorAll?.("details").forEach((item) => item.removeAttribute("open"));
  }
  return clone;
}

async function waitForPdfAssets(root) {
  if (document.fonts?.ready) await document.fonts.ready;
  await Promise.all([...root.querySelectorAll("img")].map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.onload = resolve;
      image.onerror = resolve;
    });
  }));
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// ─── PDF Export Engine V2 — Modal listeners ──────────────────────────────────

document.querySelector("#closeExportModal").addEventListener("click", () => {
  document.querySelector("#exportModal").classList.add("hidden");
});

document.querySelector("#cancelExportModal").addEventListener("click", () => {
  document.querySelector("#exportModal").classList.add("hidden");
});

document.querySelector("#exportModal").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.classList.add("hidden");
});

document.querySelector("#generateReportBtn").addEventListener("click", async () => {
  const selectedKeys = new Set(
    [...document.querySelectorAll("#exportSections input[name='export-section']:checked")].map((cb) => cb.value)
  );
  if (!selectedKeys.size) { showToast("Selecciona al menos una seccion"); return; }
  document.querySelector("#exportModal").classList.add("hidden");
  await buildExportPdf(selectedKeys).catch(() => {});
});

// ─── 1. openExportModal() ─────────────────────────────────────────────────────

function openExportModal() {
  const modal = document.querySelector("#exportModal");
  const metaContainer = document.querySelector("#exportModalMeta");
  const sectionsContainer = document.querySelector("#exportSections");

  const branchCount = [...state.activeBranches].length;
  const dateFrom = formatShortDate(state.dateStart);
  const dateTo = formatShortDate(state.dateEnd);

  metaContainer.innerHTML = [
    ["Marca", state.activeBrand],
    ["Periodo", `${dateFrom} – ${dateTo}`],
    ["Sucursales", `${branchCount} activa${branchCount !== 1 ? "s" : ""}`]
  ].map(([label, value]) => `
    <div class="export-meta-chip">
      <span class="chip-label">${label}</span>
      <span class="chip-value">${value}</span>
    </div>
  `).join("");

  sectionsContainer.innerHTML = EXPORT_SECTION_DEFS.map(({ group, module, items }) => `
    <div class="export-group">
      <div class="export-group-header">
        <span class="export-group-label">${group}</span>
        <button class="export-toggle-all" type="button" data-toggle-module="${module}">Deseleccionar todo</button>
      </div>
      ${items.map(({ key, label }) => `
        <label class="export-section-item">
          <input type="checkbox" name="export-section" value="${key}" checked>
          <span>${label}</span>
        </label>
      `).join("")}
    </div>
  `).join("");

  sectionsContainer.querySelectorAll("[data-toggle-module]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mod = btn.dataset.toggleModule;
      const group = EXPORT_SECTION_DEFS.find((g) => g.module === mod);
      const boxes = group.items
        .map((item) => sectionsContainer.querySelector(`input[value="${item.key}"]`))
        .filter(Boolean);
      const allOn = boxes.every((cb) => cb.checked);
      boxes.forEach((cb) => { cb.checked = !allOn; });
      btn.textContent = allOn ? "Seleccionar todo" : "Deseleccionar todo";
    });
  });

  modal.classList.remove("hidden");
}

// ─── 2. buildExportPdf(selectedKeys) ─────────────────────────────────────────

async function buildExportPdf(selectedKeys) {
  if (!window.jspdf?.jsPDF) {
    showToast("No se pudo cargar jsPDF");
    throw new Error("jsPDF not loaded");
  }
  const btn = document.querySelector("#generateReportBtn");
  if (btn) { btn.disabled = true; btn.textContent = "Generando..."; }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();

  try {
    showToast("Generando portada...");
    await pdfV3Cover(pdf, pw, ph);

    const pages = [];
    for (const { items } of EXPORT_SECTION_DEFS) {
      for (const { key } of items) {
        if (selectedKeys.has(key) && V3_SECTION_MAP[key]) pages.push({ key, fn: V3_SECTION_MAP[key] });
      }
    }

    const total = pages.length + 1;
    for (let i = 0; i < pages.length; i++) {
      showToast(`Pagina ${i + 2} de ${total}...`);
      pdf.addPage("a4", "landscape");
      await pages[i].fn(pdf, pw, ph, i + 2, total);
    }

    const fileName = slugify(`INDEF Reporte Ejecutivo ${state.activeBrand} ${state.dateStart} ${state.dateEnd}`);
    pdf.save(`${fileName}.pdf`);
    showToast("Reporte Ejecutivo descargado");
  } catch (error) {
    console.error("[PDF V3]", error);
    showToast("No se pudo generar el reporte");
    throw error;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Generar Reporte Ejecutivo"; }
  }
}

// ─── 3. renderModuleToBuffer(element) ────────────────────────────────────────

async function renderModuleToBuffer(element) {
  if (!window.html2canvas) throw new Error("html2canvas not loaded");
  return window.html2canvas(element, {
    backgroundColor: "#070a0f",
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    logging: false,
    windowWidth: element.scrollWidth || element.offsetWidth,
    windowHeight: element.scrollHeight || element.offsetHeight,
    onclone: (doc) => {
      doc.querySelectorAll(".scrollable").forEach((el) => {
        el.classList.remove("scrollable");
        el.style.overflow = "visible";
      });
    }
  });
}

// ─── 4. createPdfCover(pdf, pageWidth, pageHeight) ────────────────────────────

async function createPdfCover(pdf, pageWidth, pageHeight) {
  const cover = document.createElement("div");
  cover.style.cssText = [
    "position:absolute", "left:-9999px", "top:0",
    "width:1680px", "height:945px", "overflow:hidden",
    `background:url("${brandConfig[state.activeBrand].cover}") center/cover no-repeat, #05080d`
  ].join(";");

  const gradient = document.createElement("div");
  gradient.style.cssText = [
    "position:absolute", "inset:0",
    "background:linear-gradient(90deg,rgba(5,8,13,0.88) 0%,rgba(5,8,13,0.52) 50%,rgba(5,8,13,0.94) 100%)"
  ].join(";");
  cover.appendChild(gradient);

  const logoWrap = document.createElement("div");
  logoWrap.style.cssText = "position:absolute;top:48px;left:64px;display:flex;align-items:center;gap:12px;";
  const logoImg = document.createElement("img");
  logoImg.src = "assets/logo-blanco.png";
  logoImg.style.cssText = "height:34px;opacity:0.92;";
  logoWrap.appendChild(logoImg);
  cover.appendChild(logoWrap);

  const branchCount = [...state.activeBranches].length;
  const dateFrom = formatShortDate(state.dateStart);
  const dateTo = formatShortDate(state.dateEnd);
  const today = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

  const box = document.createElement("div");
  box.style.cssText = [
    "position:absolute", "right:80px", "top:50%", "transform:translateY(-50%)",
    "width:500px",
    "background:rgba(7,10,15,0.93)",
    "border:1px solid rgba(34,211,238,0.35)",
    "border-radius:20px",
    "padding:40px",
    "color:#f4f7fb",
    "font-family:Inter,sans-serif"
  ].join(";");

  box.innerHTML = `
    <p style="font-size:11px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:#22d3ee;margin:0 0 6px;">INDEF Intelligence Platform</p>
    <h1 style="font-size:34px;font-weight:800;margin:0 0 4px;line-height:1.1;color:#f4f7fb;">JB HOLDS</h1>
    <p style="font-size:8.5px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#22d3ee;margin:0 0 28px;">CORPORATE INTELLIGENCE OPERATING SYSTEM</p>
    <div style="height:1px;background:rgba(169,184,204,0.18);margin-bottom:24px;"></div>
    <h2 style="font-size:15px;font-weight:700;margin:0 0 26px;color:#c8d2df;letter-spacing:0.01em;">Reporte Ejecutivo Corporativo</h2>
    <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:26px;">
      <div>
        <p style="font-size:8.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8f9bad;margin:0 0 3px;">Periodo Analizado</p>
        <p style="font-size:13px;font-weight:600;color:#f4f7fb;margin:0;">${dateFrom} – ${dateTo}</p>
      </div>
      <div>
        <p style="font-size:8.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8f9bad;margin:0 0 3px;">Marca Analizada</p>
        <p style="font-size:13px;font-weight:600;color:#f4f7fb;margin:0;">${state.activeBrand}</p>
      </div>
      <div>
        <p style="font-size:8.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8f9bad;margin:0 0 3px;">Sucursales Incluidas</p>
        <p style="font-size:13px;font-weight:600;color:#f4f7fb;margin:0;">${branchCount} activas</p>
      </div>
      <div>
        <p style="font-size:8.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8f9bad;margin:0 0 3px;">Fecha de Generacion</p>
        <p style="font-size:13px;font-weight:600;color:#f4f7fb;margin:0;">${today}</p>
      </div>
    </div>
    <div style="height:1px;background:rgba(169,184,204,0.18);margin-bottom:20px;"></div>
    <div>
      <p style="font-size:8.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8f9bad;margin:0 0 4px;">Preparado por</p>
      <p style="font-size:13px;font-weight:700;color:#22d3ee;margin:0;">INDEF Intelligence Platform</p>
    </div>
    <p style="font-size:8px;color:#8f9bad;margin:22px 0 0;text-align:center;letter-spacing:0.04em;">Confidencial · Uso Interno</p>
  `;
  cover.appendChild(box);

  document.body.appendChild(cover);
  await waitForPdfAssets(cover);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const canvas = await window.html2canvas(cover, {
    backgroundColor: "#05080d",
    scale: 2.0,
    useCORS: true,
    allowTaint: true,
    logging: false,
    windowWidth: 1680,
    windowHeight: 945
  });
  cover.remove();

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, pageHeight);
}

// ─── 5. calculateDensity(element) ────────────────────────────────────────────

function calculateDensity(element) {
  if (!element) return 0;

  const PAGE_H = 1080;
  const h = element.scrollHeight || element.offsetHeight || 200;

  const bars = element.querySelectorAll("rect.bar").length;
  const rows = element.querySelectorAll("tbody tr").length;
  const cols = element.querySelectorAll("th").length;
  const kpiCards = element.querySelectorAll(".kpi-card").length;
  const heatCells = element.querySelectorAll(".heat-cell, .hour-cell, .tree-cell").length;
  const scoreCards = element.querySelectorAll(".score-card").length;
  const flowCards = element.querySelectorAll(".flow-card").length;

  const heightScore = h / PAGE_H;
  const complexityBonus =
    bars * 0.012 +
    rows * 0.05 +
    cols * 0.04 +
    kpiCards * 0.08 +
    heatCells * 0.006 +
    scoreCards * 0.06 +
    flowCards * 0.05;

  return Math.min(heightScore + complexityBonus * 0.25, 2.0);
}

// ─── 6. planPages(blocks) ─────────────────────────────────────────────────────

function planPages(blocks) {
  const THRESHOLD = 0.84;
  const pages = [];
  let current = [];
  let density = 0;

  for (const block of blocks) {
    const d = block.density ?? calculateDensity(block.element);

    if (d >= THRESHOLD) {
      if (current.length) { pages.push(current); current = []; density = 0; }
      pages.push([block]);
    } else if (current.length && density + d > THRESHOLD) {
      pages.push(current);
      current = [block];
      density = d;
    } else {
      current.push(block);
      density += d;
    }
  }

  if (current.length) pages.push(current);
  return pages;
}

// ─── 7. describeSection(key) ──────────────────────────────────────────────────

function describeSection(key) {
  const brand = state.activeBrand;
  const period = `${formatShortDate(state.dateStart)}–${formatShortDate(state.dateEnd)}`;
  try {
    if (key === "sales-trend") {
      const t = totals();
      const prev = totals(true);
      const chg = ((t.sales - prev.sales) / Math.max(prev.sales, 1) * 100);
      const dir = chg >= 0 ? "incremento" : "descenso";
      return `${brand} registro una venta neta de ${formatter.format(t.sales)} en el periodo ${period}, lo que representa un ${dir} del ${Math.abs(chg).toFixed(1)}% frente al periodo inmediato anterior. El cumplimiento de meta se situa en ${(t.compliance * 100).toFixed(1)}%.`;
    }
    if (key === "sales-waterfall") {
      const t = totals();
      return `La distribucion acumulada por dia de la semana revela el patron de concentracion de venta de ${brand}. El GAP acumulado frente a meta es de ${formatter.format(t.gap)}, con un ticket medio de ${exactFormatter.format(t.ticket)} por documento.`;
    }
    if (key === "sales-scorecards") {
      const rows = activeBranchRows();
      const above = rows.filter((r) => r.compliance >= 1).length;
      const below = rows.filter((r) => r.compliance < 1).length;
      return `De las ${rows.length} sucursales activas de ${brand}, ${above} superan la meta al 100% y ${below} se encuentran por debajo en el periodo ${period}. El semaforo identifica en tiempo real que operaciones requieren intervencion antes del cierre.`;
    }
    if (key === "sales-risk") {
      const rows = activeBranchRows();
      const worst = [...rows].sort((a, b) => a.gap - b.gap)[0];
      return worst && worst.gap < 0
        ? `El grafico de riesgo operativo muestra que ${worst.name} presenta el mayor deficit con ${formatter.format(worst.gap)} frente a meta. Se recomienda accion correctiva para mitigar el cierre por debajo del objetivo en el periodo ${period}.`
        : `El analisis de riesgo operativo indica que todas las sucursales activas de ${brand} se mantienen en zona positiva respecto a su meta durante el periodo ${period}. No se detectan deficits que requieran intervencion urgente.`;
    }
    if (key === "sales-heatmap") {
      const dates = dateList();
      const rows = activeBranchRows();
      return `El mapa de calor muestra la distribucion de documentos por sucursal y dia para ${brand} en el periodo ${period}. Permite identificar dias de bajo trafico y sucursales con concentracion irregular de actividad comercial a traves de ${rows.length} unidades y ${dates.length} dias de analisis.`;
    }
    if (key === "sales-table") {
      const t = totals();
      const rows = activeBranchRows();
      return `La tabla presenta el detalle de venta neta, meta, cumplimiento y GAP para las ${rows.length} sucursales activas de ${brand} en el periodo ${period}. La venta total consolidada asciende a ${formatter.format(t.sales)}, con un cumplimiento promedio del ${(t.compliance * 100).toFixed(1)}%.`;
    }
    if (key === "sales-comparison") {
      const rows = activeBranchRows();
      const t = totals();
      const leader = [...rows].sort((a, b) => b.sales - a.sales)[0];
      return leader
        ? `El comparativo de desempeno posiciona a ${leader.name} como la unidad lider con ${formatter.format(leader.sales)}, equivalente al ${(leader.sales / Math.max(t.sales, 1) * 100).toFixed(1)}% del total de ${brand} en el periodo analizado.`
        : `El comparativo muestra la distribucion de venta neta entre las sucursales activas de ${brand} para el periodo ${period}.`;
    }
    if (key === "products-grid") {
      const pt = productTotals();
      return `El analisis de producto de ${brand} posiciona a ${pt.top.name} como el articulo de mayor rotacion con ${numberFormatter.format(pt.top.total)} unidades. La categoria dominante es ${pt.leadingCategory.name} con ${pt.leadingCategory.value.toFixed(1)}% del mix total. La venta neta de producto en el periodo ${period} asciende a ${formatter.format(pt.sales)}.`;
    }
    if (key === "products-table") {
      const pt = productTotals();
      const rows = productRows();
      return `La matriz de producto detalla la distribucion de ${rows.length} referencias activas entre las sucursales de ${brand}. La venta neta consolidada de producto es ${formatter.format(pt.sales)} con ${numberFormatter.format(pt.quantity)} unidades vendidas en el periodo ${period}.`;
    }
    if (key === "flow-cards" || key === "flow-charts") {
      const ft = flowTotals();
      return ft.peak
        ? `El analisis de flujo de ${brand} identifica las ${ft.peak.hour}:00 como la franja horaria de mayor concentracion de venta, con ${formatter.format(ft.peak.sale)} generados por ${ft.peak.branch}. La conversion promedio entre sucursales activas es del ${ft.avgConversion.toFixed(0)}% en el periodo ${period}.`
        : `El analisis de flujo de ventas presenta la distribucion horaria de trafico y conversion por sucursal de ${brand} en el periodo ${period}.`;
    }
    if (key === "flow-table") {
      const ft = flowTotals();
      return `El plan de accion presenta recomendaciones operativas por sucursal de ${brand} basadas en su comportamiento de flujo, conversion y venta pico en el periodo ${period}. La conversion promedio del sistema es del ${ft.avgConversion.toFixed(0)}%. Cada senal indica la prioridad de intervencion sugerida.`;
    }
  } catch {
    return "";
  }
  return "";
}

// ─── Helpers V2 ───────────────────────────────────────────────────────────────

function collectV2PdfBlocks(selectedKeys, moduleKey) {
  const blocks = [];
  const content = els.moduleContent;

  const add = (key, getEl) => {
    if (!selectedKeys.has(key)) return;
    const el = getEl();
    if (el) blocks.push({ key, element: el });
  };

  if (moduleKey === "sales") {
    if (selectedKeys.has("sales-kpis-alerts")) {
      if (els.alertStrip.children.length) blocks.push({ key: "sales-alerts", element: els.alertStrip });
      blocks.push({ key: "sales-kpis-alerts", element: els.kpiGrid });
    }
    add("sales-trend",      () => content.querySelector(".trend-panel"));
    add("sales-waterfall",  () => content.querySelector(".cumulative-panel"));
    add("sales-scorecards", () => content.querySelector(".score-panel"));
    add("sales-risk",       () => content.querySelector(".risk-panel"));
    add("sales-heatmap",    () => content.querySelector("#heatmap")?.closest(".panel"));
    add("sales-table",      () => content.querySelector(".table-section"));
    add("sales-comparison", () => content.querySelector("#branchComparisonChart")?.closest(".panel"));
  }

  if (moduleKey === "products") {
    if (selectedKeys.has("products-kpis-alerts")) {
      if (els.alertStrip.children.length) blocks.push({ key: "products-alerts", element: els.alertStrip });
      blocks.push({ key: "products-kpis-alerts", element: els.kpiGrid });
    }
    add("products-grid",  () => content.querySelector(".content-grid.equal"));
    add("products-table", () => content.querySelector(".table-section"));
  }

  if (moduleKey === "flow") {
    if (selectedKeys.has("flow-kpis-alerts")) {
      if (els.alertStrip.children.length) blocks.push({ key: "flow-alerts", element: els.alertStrip });
      blocks.push({ key: "flow-kpis-alerts", element: els.kpiGrid });
    }
    add("flow-cards",  () => content.querySelector(".flow-cards"));
    add("flow-charts", () => content.querySelector(".content-grid"));
    add("flow-table",  () => content.querySelector(".table-section"));
  }

  return blocks.filter((b) => b.element);
}

function buildV2PageStage(blocks, pageNum, totalPages) {
  const stage = document.createElement("div");
  stage.className = "pdf-v2-stage";

  const header = document.createElement("div");
  header.className = "pdf-page-header";
  header.innerHTML = `
    <span style="color:#22d3ee;font-weight:800;letter-spacing:0.06em;">INDEF</span>
    <span class="header-sep">|</span>
    <span>${state.activeBrand}</span>
    <span class="header-spacer">${formatShortDate(state.dateStart)} – ${formatShortDate(state.dateEnd)}</span>
    <span class="header-page">Pág. ${pageNum} de ${totalPages}</span>
  `;
  stage.appendChild(header);

  const body = document.createElement("div");
  body.className = "pdf-v2-body";

  blocks.forEach(({ key, element }) => {
    const clone = element.cloneNode ? element : cloneForPdf(element);
    if (!clone) return;

    clone.querySelectorAll("input, .segmented, details[open]").forEach((el) => el.remove());
    clone.querySelectorAll(".scrollable").forEach((el) => {
      el.classList.remove("scrollable");
      el.style.overflow = "visible";
    });
    clone.querySelectorAll(".chart, .heatmap, .hour-heatmap, .treemap, .ranking-list").forEach((el) => {
      el.style.overflow = "visible";
    });

    const description = describeSection(key);
    if (description) {
      const wrapper = document.createElement("div");
      wrapper.className = "pdf-block-wrapper";
      wrapper.appendChild(clone);
      const note = document.createElement("p");
      note.className = "pdf-section-description";
      note.textContent = description;
      wrapper.appendChild(note);
      body.appendChild(wrapper);
    } else {
      body.appendChild(clone);
    }
  });

  stage.appendChild(body);

  const footer = document.createElement("div");
  footer.className = "pdf-page-footer";
  footer.innerHTML = `
    <span>Sistema JB Holds Command Center</span>
    <span style="color:#22d3ee;font-weight:700;">INDEF Intelligence Platform</span>
    <span>Confidencial · Uso Interno</span>
  `;
  stage.appendChild(footer);

  document.body.appendChild(stage);
  return stage;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF EXPORT ENGINE V3 — Executive Report · pure jsPDF, zero html2canvas
// ═══════════════════════════════════════════════════════════════════════════════

// ── V3 Color palette ──────────────────────────────────────────────────────────

const V3C = {
  bg:     [7, 10, 15],
  panel:  [13, 19, 28],
  panel2: [17, 26, 37],
  panel3: [22, 33, 48],
  line:   [169, 184, 204],
  ink:    [244, 247, 251],
  muted:  [143, 155, 173],
  soft:   [200, 210, 223],
  green:  [24, 199, 122],
  red:    [255, 93, 85],
  amber:  [242, 184, 75],
  blue:   [47, 140, 255],
  cyan:   [34, 211, 238],
};

function v3alpha(color, a, bg = V3C.bg) {
  return color.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
}

function v3rgb(pdf, color, mode = "fill") {
  const [r, g, b] = color;
  if (mode === "fill")      pdf.setFillColor(r, g, b);
  else if (mode === "draw") pdf.setDrawColor(r, g, b);
  else if (mode === "text") pdf.setTextColor(r, g, b);
}

function v3font(pdf, size, style = "normal") {
  pdf.setFont("helvetica", style);
  pdf.setFontSize(size);
}

function withModule(mod, fn) {
  const saved = state.activeModule;
  state.activeModule = mod;
  const result = fn();
  state.activeModule = saved;
  return result;
}

// ── Page primitives ───────────────────────────────────────────────────────────

function v3page(pdf, pw, ph) {
  v3rgb(pdf, V3C.bg);
  pdf.rect(0, 0, pw, ph, "F");
}

function v3header(pdf, pw, pn, total) {
  v3rgb(pdf, V3C.panel);
  pdf.rect(0, 0, pw, 10, "F");
  v3rgb(pdf, v3alpha(V3C.line, 0.35), "draw");
  pdf.setLineWidth(0.18);
  pdf.line(0, 10, pw, 10);

  v3font(pdf, 7.5, "bold");
  v3rgb(pdf, V3C.cyan, "text");
  pdf.text("INDEF", 10, 7, { baseline: "bottom" });

  v3font(pdf, 7.5, "normal");
  v3rgb(pdf, v3alpha(V3C.line, 0.55), "text");
  pdf.text("|", 20, 7, { baseline: "bottom" });
  v3rgb(pdf, V3C.soft, "text");
  pdf.text(state.activeBrand, 24, 7, { baseline: "bottom" });

  v3font(pdf, 6.5, "normal");
  v3rgb(pdf, V3C.muted, "text");
  pdf.text(`${formatShortDate(state.dateStart)} – ${formatShortDate(state.dateEnd)}`, pw / 2, 7, { align: "center", baseline: "bottom" });

  v3font(pdf, 6.5, "bold");
  v3rgb(pdf, V3C.muted, "text");
  pdf.text(`Pág. ${pn} / ${total}`, pw - 10, 7, { align: "right", baseline: "bottom" });
}

function v3footer(pdf, pw, ph) {
  const fy = ph - 7;
  v3rgb(pdf, V3C.panel);
  pdf.rect(0, fy, pw, 7, "F");
  v3rgb(pdf, v3alpha(V3C.line, 0.28), "draw");
  pdf.setLineWidth(0.15);
  pdf.line(0, fy, pw, fy);

  v3font(pdf, 6, "normal");
  v3rgb(pdf, V3C.muted, "text");
  pdf.text("Sistema JB Holds Command Center", 10, fy + 4.8, { baseline: "bottom" });
  v3font(pdf, 6, "bold");
  v3rgb(pdf, V3C.cyan, "text");
  pdf.text("INDEF Intelligence Platform", pw / 2, fy + 4.8, { align: "center", baseline: "bottom" });
  v3font(pdf, 6, "normal");
  v3rgb(pdf, V3C.muted, "text");
  pdf.text("Confidencial · Uso Interno", pw - 10, fy + 4.8, { align: "right", baseline: "bottom" });
}

function v3eyebrow(pdf, text, x, y) {
  v3font(pdf, 6.5, "bold");
  v3rgb(pdf, V3C.cyan, "text");
  pdf.text(text.toUpperCase(), x, y, { baseline: "top" });
}

function v3heading(pdf, text, x, y) {
  v3font(pdf, 13, "bold");
  v3rgb(pdf, V3C.ink, "text");
  pdf.text(text, x, y, { baseline: "top" });
}

function v3rule(pdf, x, y, w) {
  v3rgb(pdf, v3alpha(V3C.line, 0.32), "draw");
  pdf.setLineWidth(0.18);
  pdf.line(x, y, x + w, y);
}

// ── Component: KPI row ────────────────────────────────────────────────────────

function v3kpiRow(pdf, kpis, x, y, w, h) {
  const gap = 3;
  const cardW = (w - gap * (kpis.length - 1)) / kpis.length;
  kpis.forEach((kpi, i) => {
    const cx = x + i * (cardW + gap);
    v3rgb(pdf, V3C.panel);
    pdf.roundedRect(cx, y, cardW, h, 2, 2, "F");
    v3rgb(pdf, kpi.up ? V3C.green : V3C.red);
    pdf.roundedRect(cx, y, cardW, 1, 0.5, 0.5, "F");

    v3font(pdf, 6.5, "normal");
    v3rgb(pdf, V3C.muted, "text");
    pdf.text(kpi.label, cx + cardW / 2, y + 5, { align: "center", baseline: "top" });

    v3font(pdf, 15, "bold");
    v3rgb(pdf, V3C.ink, "text");
    pdf.text(kpi.value, cx + cardW / 2, y + 13, { align: "center", baseline: "top" });

    v3font(pdf, 6.5, "normal");
    v3rgb(pdf, V3C.muted, "text");
    pdf.text(kpi.meta, cx + cardW / 2, y + 23, { align: "center", baseline: "top" });

    v3font(pdf, 6.5, "normal");
    v3rgb(pdf, kpi.up ? V3C.green : V3C.red, "text");
    pdf.text(kpi.delta, cx + cardW / 2, y + 28, { align: "center", baseline: "top" });

    v3rgb(pdf, V3C.panel3);
    pdf.roundedRect(cx + 4, y + h - 5, cardW - 8, 2, 1, 1, "F");
    if ((kpi.progress || 0) > 0) {
      v3rgb(pdf, kpi.up ? V3C.green : V3C.red);
      pdf.roundedRect(cx + 4, y + h - 5, (cardW - 8) * Math.min(kpi.progress, 1), 2, 1, 1, "F");
    }
  });
}

// ── Component: Alert rows ─────────────────────────────────────────────────────

function v3alertRows(pdf, alerts, x, y, w) {
  const colorMap = { danger: V3C.red, warning: V3C.amber, good: V3C.green };
  const rh = 9, gap = 2;
  alerts.forEach((alert, i) => {
    const ay = y + i * (rh + gap);
    const col = colorMap[alert.tone] || V3C.blue;
    v3rgb(pdf, V3C.panel);
    pdf.roundedRect(x, ay, w, rh, 1, 1, "F");
    v3rgb(pdf, col);
    pdf.roundedRect(x, ay, 2.5, rh, 0.8, 0.8, "F");
    v3font(pdf, 7, "bold");
    v3rgb(pdf, V3C.ink, "text");
    pdf.text(alert.title, x + 6, ay + 3, { baseline: "top" });
    v3font(pdf, 6.5, "normal");
    v3rgb(pdf, V3C.muted, "text");
    const tw = pdf.getTextWidth(alert.title) + 4;
    const body = alert.body.length > 90 ? alert.body.slice(0, 90) + "…" : alert.body;
    pdf.text(body, x + 6 + tw, ay + 3.2, { baseline: "top", maxWidth: w - tw - 10 });
  });
  return y + alerts.length * (rh + gap);
}

// ── Component: Bar chart ──────────────────────────────────────────────────────

function v3barChart(pdf, items, x, y, w, h, opts = {}) {
  if (!items.length) return;
  const { colorFn } = opts;
  const lblArea = 9, valArea = 4;
  const chartH = h - lblArea - valArea;
  const max = Math.max(...items.map((d) => Math.abs(d.value)), 1) * 1.1;
  const slot = w / items.length;
  const bw = Math.max(3, slot * 0.62);

  [0.25, 0.5, 0.75, 1].forEach((f) => {
    const gy = y + valArea + chartH * (1 - f);
    v3rgb(pdf, V3C.panel3, "draw");
    pdf.setLineWidth(0.1);
    pdf.line(x, gy, x + w, gy);
    v3font(pdf, 5.5, "normal");
    v3rgb(pdf, V3C.muted, "text");
    pdf.text(compactNumber(max * f), x - 1, gy, { align: "right", baseline: "middle" });
  });

  items.forEach((item, i) => {
    const bx = x + i * slot + (slot - bw) / 2;
    const barH = Math.max(1.5, (Math.abs(item.value) / max) * chartH);
    const by = y + valArea + chartH - barH;
    const color = colorFn ? colorFn(item, i) : V3C.green;
    const col = Array.isArray(color) ? color : V3C.green;
    v3rgb(pdf, col);
    pdf.roundedRect(bx, by, bw, barH, 1, 1, "F");
    v3font(pdf, 5.5, "bold");
    v3rgb(pdf, V3C.soft, "text");
    pdf.text(compactNumber(item.value), bx + bw / 2, by - 0.5, { align: "center", baseline: "bottom" });
    v3font(pdf, 6, "normal");
    v3rgb(pdf, V3C.muted, "text");
    const lbl = item.label && item.label.length > 7 ? item.label.slice(0, 6) + "…" : (item.label || "");
    pdf.text(lbl, bx + bw / 2, y + valArea + chartH + 2, { align: "center", baseline: "top" });
  });
}

// ── Component: Branch cards ───────────────────────────────────────────────────

function v3branchCards(pdf, branches, x, y, w, h) {
  if (!branches.length) return;
  const cardH = Math.min(28, (h - (branches.length - 1) * 2.5) / branches.length);
  branches.forEach((branch, i) => {
    const cy = y + i * (cardH + 2.5);
    const risk = branch.compliance >= 1 ? "good" : branch.compliance >= 0.75 ? "warning" : "danger";
    const acl = risk === "good" ? V3C.green : risk === "danger" ? V3C.red : V3C.amber;
    v3rgb(pdf, V3C.panel);
    pdf.roundedRect(x, cy, w, cardH, 1.5, 1.5, "F");
    v3rgb(pdf, acl);
    pdf.roundedRect(x, cy, 2.5, cardH, 1, 1, "F");
    const tx = x + 6;
    v3font(pdf, 7.5, "bold");
    v3rgb(pdf, V3C.ink, "text");
    pdf.text(branch.name, tx, cy + 4, { baseline: "top" });
    const badge = risk === "good" ? "FUERTE" : risk === "danger" ? "CRÍTICO" : "VIGILAR";
    v3font(pdf, 5.5, "bold");
    v3rgb(pdf, acl, "text");
    pdf.text(badge, x + w - 3, cy + 4.5, { align: "right", baseline: "top" });
    const bw2 = w - tx + x - 4;
    const bry = cy + 14;
    v3rgb(pdf, V3C.panel3);
    pdf.roundedRect(tx, bry, bw2, 2.5, 1, 1, "F");
    v3rgb(pdf, acl);
    pdf.roundedRect(tx, bry, bw2 * Math.min(Math.max(branch.compliance, 0), 1), 2.5, 1, 1, "F");
    v3font(pdf, 6.5, "normal");
    v3rgb(pdf, V3C.soft, "text");
    pdf.text(exactFormatter.format(branch.sales), tx, cy + cardH - 5, { baseline: "top" });
    pdf.text(`${(branch.compliance * 100).toFixed(1)}% meta`, tx + 34, cy + cardH - 5, { baseline: "top" });
    v3rgb(pdf, branch.gap >= 0 ? V3C.green : V3C.red, "text");
    pdf.text(`GAP ${formatter.format(branch.gap)}`, x + w - 3, cy + cardH - 5, { align: "right", baseline: "top" });
  });
}

// ── Component: Insight panel ──────────────────────────────────────────────────

function v3insight(pdf, blocks, x, y, w, h) {
  v3rgb(pdf, V3C.panel2);
  pdf.roundedRect(x, y, w, h, 2, 2, "F");
  v3rgb(pdf, V3C.cyan);
  pdf.roundedRect(x, y, 2, h, 1, 1, "F");

  let ty = y + 5;
  const tx = x + 6, tw = w - 10;
  for (const block of blocks) {
    if (ty > y + h - 6) break;
    if (block.type === "eyebrow") {
      v3font(pdf, 6, "bold");
      v3rgb(pdf, V3C.cyan, "text");
      pdf.text(block.text.toUpperCase(), tx, ty, { baseline: "top" });
      ty += 4.5;
    } else if (block.type === "value") {
      v3font(pdf, 13, "bold");
      v3rgb(pdf, V3C.ink, "text");
      pdf.text(String(block.text).slice(0, 22), tx, ty, { baseline: "top" });
      ty += 8;
      if (block.sub) {
        v3font(pdf, 7, "normal");
        v3rgb(pdf, V3C.muted, "text");
        pdf.text(String(block.sub), tx, ty - 2, { baseline: "top" });
        ty += 2;
      }
    } else if (block.type === "metric") {
      v3font(pdf, 7, "bold");
      v3rgb(pdf, V3C.muted, "text");
      pdf.text(block.label, tx, ty, { baseline: "top" });
      v3font(pdf, 7.5, "bold");
      v3rgb(pdf, block.color || V3C.ink, "text");
      pdf.text(String(block.value).slice(0, 20), tx + tw, ty, { align: "right", baseline: "top" });
      ty += 5.5;
    } else if (block.type === "divider") {
      ty += 2;
      v3rule(pdf, tx, ty, tw);
      ty += 4;
    } else if (block.type === "body") {
      v3font(pdf, 7.5, "normal");
      v3rgb(pdf, V3C.soft, "text");
      const lines = pdf.splitTextToSize(block.text, tw);
      for (const line of lines) {
        if (ty > y + h - 8) break;
        pdf.text(line, tx, ty, { baseline: "top" });
        ty += 4.5;
      }
      ty += 2;
    }
  }
}

// ── Component: Data table ─────────────────────────────────────────────────────

function v3dataTable(pdf, cols, rows, x, y, w, availH) {
  const cw = cols.map((c) => (c.pct * w) / 100);
  const hdrH = 7, rh = 6.5;
  v3rgb(pdf, V3C.panel3);
  pdf.rect(x, y, w, hdrH, "F");
  let cx = x;
  cols.forEach((col, i) => {
    const align = col.align || "left";
    const tx = align === "right" ? cx + cw[i] - 2 : align === "center" ? cx + cw[i] / 2 : cx + 2;
    v3font(pdf, 6.5, "bold");
    v3rgb(pdf, V3C.soft, "text");
    pdf.text(col.label, tx, y + hdrH / 2, { align, baseline: "middle" });
    if (i < cols.length - 1) {
      v3rgb(pdf, V3C.panel2, "draw");
      pdf.setLineWidth(0.12);
      pdf.line(cx + cw[i], y, cx + cw[i], y + hdrH);
    }
    cx += cw[i];
  });

  const maxRows = Math.floor((availH - hdrH) / rh);
  const display = rows.slice(0, maxRows);
  let ry = y + hdrH;
  display.forEach((row, ri) => {
    v3rgb(pdf, ri % 2 === 0 ? V3C.panel : V3C.panel2);
    pdf.rect(x, ry, w, rh, "F");
    cx = x;
    row.forEach((cell, ci) => {
      const col = cols[ci] || {};
      const align = col.align || "left";
      const tx = align === "right" ? cx + cw[ci] - 2 : align === "center" ? cx + cw[ci] / 2 : cx + 2;
      if (cell && typeof cell === "object" && cell.badge) {
        const bc = cell.badge === "good" ? V3C.green : cell.badge === "danger" ? V3C.red : V3C.amber;
        const bt = cell.badge === "good" ? "Fuerte" : cell.badge === "danger" ? "Crítico" : "Vigilar";
        v3rgb(pdf, bc);
        pdf.roundedRect(cx + 1.5, ry + 1.5, cw[ci] - 3, 3.5, 1, 1, "F");
        v3font(pdf, 5.5, "bold");
        v3rgb(pdf, V3C.bg, "text");
        pdf.text(bt, cx + cw[ci] / 2, ry + rh / 2, { align: "center", baseline: "middle" });
      } else if (cell && typeof cell === "object" && cell.pct !== undefined) {
        const pc = cell.pct;
        const bc2 = pc >= 1 ? V3C.green : pc >= 0.75 ? V3C.amber : V3C.red;
        v3rgb(pdf, V3C.panel3);
        pdf.roundedRect(cx + 1, ry + 2, cw[ci] - 2, 2.5, 1, 1, "F");
        v3rgb(pdf, bc2);
        pdf.roundedRect(cx + 1, ry + 2, (cw[ci] - 2) * Math.min(pc, 1), 2.5, 1, 1, "F");
        v3font(pdf, 6, "bold");
        v3rgb(pdf, V3C.ink, "text");
        pdf.text(`${(pc * 100).toFixed(1)}%`, cx + cw[ci] / 2, ry + rh / 2 + 0.5, { align: "center", baseline: "middle" });
      } else {
        const text = cell !== null && cell !== undefined ? String(cell) : "";
        v3font(pdf, 7, ci === 0 ? "bold" : "normal");
        v3rgb(pdf, ci === 0 ? V3C.ink : V3C.soft, "text");
        pdf.text(text, tx, ry + rh / 2, { align, baseline: "middle" });
      }
      cx += cw[ci];
    });
    v3rgb(pdf, V3C.panel3, "draw");
    pdf.setLineWidth(0.1);
    pdf.line(x, ry + rh, x + w, ry + rh);
    ry += rh;
  });
  v3rgb(pdf, v3alpha(V3C.line, 0.28), "draw");
  pdf.setLineWidth(0.22);
  pdf.rect(x, y, w, ry - y, "S");
  if (rows.length > display.length) {
    v3font(pdf, 6, "italic");
    v3rgb(pdf, V3C.muted, "text");
    pdf.text(`Mostrando ${display.length} de ${rows.length} registros`, x, ry + 3.5, { baseline: "top" });
    ry += 5;
  }
  return ry;
}

// ── Smart insights ────────────────────────────────────────────────────────────

function v3iTrend() {
  const series = rangeSeries("sales");
  if (!series.length) return [{ type: "body", text: "Sin datos en el periodo seleccionado." }];
  const t = totals(), prev = totals(true);
  const best = series.reduce((a, b) => (a.total > b.total ? a : b));
  const positives = series.filter((s) => s.total > 0);
  const worst = positives.length ? positives.reduce((a, b) => (a.total < b.total ? a : b)) : best;
  const chg = ((t.sales - prev.sales) / Math.max(prev.sales, 1)) * 100;
  const conc = ((best.total / Math.max(t.sales, 1)) * 100).toFixed(0);
  return [
    { type: "eyebrow", text: "Mejor día" },
    { type: "value", text: formatter.format(best.total), sub: best.label },
    { type: "metric", label: "Peor día", value: formatter.format(worst.total), color: V3C.red },
    { type: "metric", label: "Concentración", value: `${conc}% del total` },
    { type: "divider" },
    { type: "metric", label: "Variación vs anterior", value: `${chg >= 0 ? "+" : ""}${chg.toFixed(1)}%`, color: chg >= 0 ? V3C.green : V3C.red },
    { type: "metric", label: "Cumplimiento meta", value: `${(t.compliance * 100).toFixed(1)}%`, color: t.compliance >= 1 ? V3C.green : V3C.red },
    { type: "metric", label: "GAP acumulado", value: formatter.format(t.gap), color: t.gap >= 0 ? V3C.green : V3C.red },
    { type: "divider" },
    { type: "body", text: `${state.activeBrand} ${chg >= 0 ? "creció" : "cayó"} ${Math.abs(chg).toFixed(1)}% vs el periodo anterior. ${best.label} concentró el ${conc}% de la venta semanal. ${t.compliance >= 1 ? `Meta superada en ${formatter.format(t.gap)}.` : `Restan ${formatter.format(Math.abs(t.gap))} para cerrar al 100%.`}` },
  ];
}

function v3iWaterfall() {
  const t = totals(), prev = totals(true);
  const series = rangeSeries("sales");
  const names = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const byDay = Object.entries(series.reduce((acc, d) => {
    const dow = d.date instanceof Date ? d.date.getDay() : -1;
    if (dow >= 0) { const n = names[dow]; acc[n] = (acc[n] || 0) + d.total; }
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]);
  const topDay = byDay[0] || ["—", 0];
  const lowDay = byDay[byDay.length - 1] || ["—", 0];
  const chg = ((t.sales - prev.sales) / Math.max(prev.sales, 1) * 100);
  return [
    { type: "eyebrow", text: "Día más fuerte" },
    { type: "value", text: formatter.format(topDay[1]), sub: topDay[0] },
    { type: "metric", label: "Día más débil", value: formatter.format(lowDay[1]), color: V3C.amber },
    { type: "metric", label: "Diferencia pico/valle", value: formatter.format(topDay[1] - lowDay[1]) },
    { type: "divider" },
    { type: "metric", label: "Total acumulado", value: formatter.format(t.sales) },
    { type: "metric", label: "vs Periodo anterior", value: `${chg >= 0 ? "+" : ""}${chg.toFixed(1)}%`, color: chg >= 0 ? V3C.green : V3C.red },
    { type: "metric", label: "Ticket medio", value: exactFormatter.format(t.ticket) },
    { type: "divider" },
    { type: "body", text: `${topDay[0]} fue el día de mayor venta acumulada (${formatter.format(topDay[1])}). ${lowDay[0]} fue el de menor actividad. Dispersión pico/valle: ${formatter.format(topDay[1] - lowDay[1])}.` },
  ];
}

function v3iBranches() {
  const rows = activeBranchRows();
  if (!rows.length) return [{ type: "body", text: "Sin sucursales activas." }];
  const t = totals();
  const leader = [...rows].sort((a, b) => b.sales - a.sales)[0];
  const riskiest = [...rows].sort((a, b) => a.gap - b.gap)[0];
  const above = rows.filter((r) => r.compliance >= 1).length;
  const below = rows.length - above;
  const share = ((leader.sales / Math.max(t.sales, 1)) * 100).toFixed(0);
  return [
    { type: "eyebrow", text: "Sucursal líder" },
    { type: "value", text: leader.name, sub: `${exactFormatter.format(leader.sales)} · ${(leader.compliance * 100).toFixed(0)}% meta` },
    { type: "divider" },
    { type: "metric", label: "Sobre meta", value: `${above} de ${rows.length}`, color: V3C.green },
    { type: "metric", label: "Bajo meta", value: `${below} de ${rows.length}`, color: below > 0 ? V3C.red : V3C.green },
    { type: "metric", label: "Concentración líder", value: `${share}% del total` },
    { type: "metric", label: "Mayor riesgo", value: riskiest.gap < 0 ? riskiest.name.slice(0, 16) : "Sin déficit", color: riskiest.gap < 0 ? V3C.red : V3C.green },
    { type: "metric", label: "GAP de riesgo", value: riskiest.gap < 0 ? formatter.format(riskiest.gap) : "—", color: riskiest.gap < 0 ? V3C.red : V3C.green },
    { type: "divider" },
    { type: "body", text: `${leader.name} lidera con el ${share}% de la venta. ${below > 0 ? `${below} sucursal${below > 1 ? "es requieren" : " requiere"} intervención.${riskiest.gap < 0 ? ` Mayor déficit: ${formatter.format(Math.abs(riskiest.gap))}.` : ""}` : "Todas las sucursales superan su meta."}` },
  ];
}

function v3iProducts() {
  const pt = productTotals(), prev = productTotals(true);
  const cat = categoryBreakdown()[0] || { name: "—", value: 0 };
  const rows = productRows().slice(0, 3);
  const top3share = rows.reduce((s, r) => s + r.total, 0) / Math.max(pt.quantity, 1) * 100;
  const chg = ((pt.quantity - prev.quantity) / Math.max(prev.quantity, 1) * 100);
  return [
    { type: "eyebrow", text: "Producto líder" },
    { type: "value", text: pt.top.name.slice(0, 22), sub: `${numberFormatter.format(pt.top.total)} unidades` },
    { type: "divider" },
    { type: "metric", label: "Categoría dominante", value: cat.name.slice(0, 18) },
    { type: "metric", label: "Peso en mix", value: `${cat.value.toFixed(1)}%` },
    { type: "metric", label: "Top 3 concentran", value: `${top3share.toFixed(0)}% unidades` },
    { type: "metric", label: "Variación vs anterior", value: `${chg >= 0 ? "+" : ""}${chg.toFixed(1)}%`, color: chg >= 0 ? V3C.green : V3C.red },
    { type: "metric", label: "Venta de producto", value: formatter.format(pt.sales) },
    { type: "divider" },
    { type: "body", text: `${pt.top.name.slice(0, 25)} lidera con ${numberFormatter.format(pt.top.total)} unidades. ${cat.name} domina el mix con ${cat.value.toFixed(1)}%. Los 3 líderes concentran el ${top3share.toFixed(0)}% del volumen.` },
  ];
}

function v3iFlow() {
  const ft = flowTotals();
  const active = [...(ft.active || [])].sort((a, b) => b.conversion - a.conversion);
  const best = active[0], worst = active[active.length - 1];
  const hours = activeFlowHours();
  return [
    { type: "eyebrow", text: "Hora pico" },
    { type: "value", text: ft.peak ? `${ft.peak.hour}:00` : "Sin datos", sub: ft.peak ? `${ft.peak.branch.slice(0, 18)} · ${formatter.format(ft.peak.sale)}` : "" },
    { type: "divider" },
    { type: "metric", label: "Conversión promedio", value: `${ft.avgConversion.toFixed(0)}%`, color: ft.avgConversion >= 72 ? V3C.green : V3C.amber },
    { type: "metric", label: "Mejor conversión", value: best ? `${best.name.slice(0, 12)} (${best.conversion}%)` : "—", color: V3C.green },
    { type: "metric", label: "Menor conversión", value: worst ? `${worst.name.slice(0, 12)} (${worst.conversion}%)` : "—", color: V3C.red },
    { type: "metric", label: "Franjas analizadas", value: `${hours.length} horas` },
    { type: "divider" },
    { type: "body", text: ft.peak ? `Hora pico: ${ft.peak.hour}:00 en ${ft.peak.branch.slice(0, 20)}. Conversión promedio: ${ft.avgConversion.toFixed(0)}%. ${ft.avgConversion < 70 ? "Reforzar staffing en horas pico para mejorar conversión." : "Nivel de conversión saludable."}` : "Sin datos de flujo para el periodo." },
  ];
}

// ── V3 Page builders ──────────────────────────────────────────────────────────

async function pdfV3Cover(pdf, pw, ph) {
  const CW = 3360, CH = 2376;
  const c = document.createElement("canvas");
  c.width = CW; c.height = CH;
  const ctx = c.getContext("2d");

  // Layer 1 — dark base
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, CW, CH);

  // Layer 2 — brand photo as cinematic texture only (heavy blur, very dark)
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => resolve(el);
      el.onerror = reject;
      setTimeout(() => reject(), 4000);
      el.src = brandConfig[state.activeBrand].cover;
    });
    const scale = Math.max(CW / img.naturalWidth, CH / img.naturalHeight) * 1.1;
    const sw = img.naturalWidth * scale, sh = img.naturalHeight * scale;
    ctx.save();
    ctx.filter = "blur(38px) brightness(0.20) saturate(0.7)";
    ctx.drawImage(img, (CW - sw) / 2, (CH - sh) / 2, sw, sh);
    ctx.restore();
  } catch { /* keep dark base */ }

  // Layer 3 — radial overlay (matches .hero-overlay from the landing)
  const rad = ctx.createRadialGradient(CW / 2, CH / 2, 0, CW / 2, CH / 2, CW * 0.65);
  rad.addColorStop(0, "rgba(2,6,23,0.05)");
  rad.addColorStop(0.5, "rgba(2,6,23,0.62)");
  rad.addColorStop(1, "rgba(2,6,23,0.95)");
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, CW, CH);

  // Layer 4 — strong bottom vignette (readable text area)
  const btm = ctx.createLinearGradient(0, CH * 0.48, 0, CH);
  btm.addColorStop(0, "rgba(2,6,23,0)");
  btm.addColorStop(1, "rgba(2,6,23,0.97)");
  ctx.fillStyle = btm;
  ctx.fillRect(0, 0, CW, CH);

  // Layer 5 — top vignette
  const top = ctx.createLinearGradient(0, 0, 0, CH * 0.20);
  top.addColorStop(0, "rgba(2,6,23,0.82)");
  top.addColorStop(1, "rgba(2,6,23,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, CW, CH);

  const setFont = (size, weight) => { ctx.font = `${weight} ${size}px Inter,system-ui,sans-serif`; };

  // ── HERO ────────────────────────────────────────────────────────────────────

  // Eyebrow — "CENTRO DE INTELIGENCIA CORPORATIVA"
  setFont(26, "600");
  ctx.fillStyle = "rgba(195,245,255,0.45)";
  ctx.textAlign = "center";
  try { ctx.letterSpacing = "8px"; } catch {}
  ctx.fillText("CENTRO DE INTELIGENCIA CORPORATIVA", CW / 2, CH * 0.38);
  try { ctx.letterSpacing = "0px"; } catch {}

  // JB HOLDS — massive, protagonist, glow
  setFont(272, "900");
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,218,243,0.28)";
  ctx.shadowBlur = 100;
  ctx.fillStyle = "#dce1fb";
  ctx.fillText("JB HOLDS", CW / 2, CH * 0.548);
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  // Cyan line — matches h-[1px] w-24 bg-primary opacity-50 from the HTML
  ctx.strokeStyle = "rgba(195,245,255,0.50)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CW / 2 - 96, CH * 0.624);
  ctx.lineTo(CW / 2 + 96, CH * 0.624);
  ctx.stroke();

  // ── BOTTOM INFO — secondary, discrete, no panel ─────────────────────────────

  const branchCount = [...state.activeBranches].length;
  const today = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });

  setFont(20, "600");
  ctx.fillStyle = "rgba(195,245,255,0.36)";
  ctx.textAlign = "center";
  try { ctx.letterSpacing = "5px"; } catch {}
  ctx.fillText("REPORTE EJECUTIVO CORPORATIVO", CW / 2, CH * 0.800);
  try { ctx.letterSpacing = "0px"; } catch {}

  setFont(24, "400");
  ctx.fillStyle = "rgba(220,225,251,0.62)";
  ctx.textAlign = "center";
  const infoLine = `${state.activeBrand}  ·  ${formatShortDate(state.dateStart)} → ${formatShortDate(state.dateEnd)}  ·  ${branchCount} sucursal${branchCount !== 1 ? "es" : ""}  ·  ${today}`;
  ctx.fillText(infoLine, CW / 2, CH * 0.854);

  setFont(18, "400");
  ctx.fillStyle = "rgba(186,201,204,0.34)";
  ctx.textAlign = "center";
  ctx.fillText("INDEF Intelligence Platform  ·  Confidencial · Uso Interno", CW / 2, CH * 0.905);

  pdf.addImage(c.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, pw, ph);
}

function pdfV3SalesKpis(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Módulo: Ventas", cx, cy);
  v3heading(pdf, "Indicadores Clave de Desempeño", cx, cy + 4.5);
  v3kpiRow(pdf, salesKpis(), cx, cy + 21, cw, 38);
  const alertY = cy + 67;
  v3eyebrow(pdf, "Alertas activas", cx, alertY);
  const afterAlerts = v3alertRows(pdf, withModule("sales", moduleAlerts), cx, alertY + 5, cw);
  const insightH = ph - 7 - afterAlerts - 8;
  if (insightH > 18) {
    const t = totals(), prev = totals(true);
    const chg = ((t.sales - prev.sales) / Math.max(prev.sales, 1) * 100);
    v3insight(pdf, [
      { type: "eyebrow", text: "Análisis ejecutivo" },
      { type: "body", text: `${state.activeBrand} cerró el periodo con ${exactFormatter.format(t.sales)}, ${chg >= 0 ? "creciendo" : "cayendo"} un ${Math.abs(chg).toFixed(1)}% vs el periodo anterior. Cumplimiento: ${(t.compliance * 100).toFixed(1)}%. GAP: ${formatter.format(t.gap)}.` },
    ], cx, afterAlerts + 6, cw, insightH);
  }
}

function pdfV3Trend(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Ventas · Tendencia diaria", cx, cy);
  v3heading(pdf, "Ventas Netas por Día", cx, cy + 4.5);
  const chartW = cw * 0.60, insightW = cw * 0.37;
  const contentY = cy + 21, contentH = ph - 7 - contentY - 4;
  const insightX = cx + chartW + cw * 0.03;
  v3barChart(pdf, rangeSeries("sales").map((d) => ({ value: d.total, label: d.label })),
    cx, contentY, chartW, contentH, { colorFn: () => V3C.green });
  v3insight(pdf, v3iTrend(), insightX, contentY, insightW, contentH);
}

function pdfV3Waterfall(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Ventas · Acumulado semanal", cx, cy);
  v3heading(pdf, "Distribución de Venta por Día de Semana", cx, cy + 4.5);
  const names = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const series = rangeSeries("sales");
  const byDay = [0,1,2,3,4,5,6].map((dow) => ({
    label: names[dow],
    value: series.filter((d) => d.date instanceof Date && (d.date.getDay() === 0 ? 6 : d.date.getDay() - 1) === dow).reduce((s, d) => s + d.total, 0),
  })).sort((a, b) => b.value - a.value);
  const chartW = cw * 0.60, insightW = cw * 0.37;
  const contentY = cy + 21, contentH = ph - 7 - contentY - 4;
  v3barChart(pdf, byDay, cx, contentY, chartW, contentH, {
    colorFn: (_, i) => i === 0 ? V3C.green : i === byDay.length - 1 ? V3C.red : V3C.blue,
  });
  v3insight(pdf, v3iWaterfall(), cx + chartW + cw * 0.03, contentY, insightW, contentH);
}

function pdfV3Branches(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Ventas · Semáforo por sucursal", cx, cy);
  v3heading(pdf, "Desempeño por Sucursal", cx, cy + 4.5);
  const contentY = cy + 21, contentH = ph - 7 - contentY - 2;
  const cardsW = cw * 0.55, insightW = cw * 0.42;
  v3branchCards(pdf, activeBranchRows(), cx, contentY, cardsW, contentH);
  v3insight(pdf, v3iBranches(), cx + cardsW + cw * 0.03, contentY, insightW, contentH);
}

function pdfV3Risk(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Ventas · Riesgo operativo", cx, cy);
  v3heading(pdf, "GAP vs Meta por Sucursal", cx, cy + 4.5);
  const branches = activeBranchRows();
  const chartW = cw * 0.62, insightW = cw * 0.35;
  const chartY = cy + 21, chartH = ph - 7 - chartY - 18;
  const insightX = cx + chartW + cw * 0.03;
  const maxAbs = Math.max(...branches.map((b) => Math.abs(b.gap)), 1) * 1.1;
  const slot = chartW / Math.max(branches.length, 1);
  const bw = Math.max(3, slot * 0.62);
  const midY = chartY + chartH / 2;
  v3rgb(pdf, v3alpha(V3C.line, 0.45), "draw");
  pdf.setLineWidth(0.25);
  pdf.line(cx, midY, cx + chartW, midY);
  v3font(pdf, 6, "normal");
  v3rgb(pdf, V3C.muted, "text");
  pdf.text("$0", cx - 1, midY, { align: "right", baseline: "middle" });
  branches.forEach((branch, i) => {
    const bx = cx + i * slot + (slot - bw) / 2;
    const hh = Math.max(1.5, (Math.abs(branch.gap) / maxAbs) * (chartH / 2));
    const by = branch.gap >= 0 ? midY - hh : midY;
    const col = branch.gap >= 0 ? V3C.green : V3C.red;
    v3rgb(pdf, col);
    pdf.roundedRect(bx, by, bw, hh, 1, 1, "F");
    v3font(pdf, 5.5, "bold");
    v3rgb(pdf, V3C.soft, "text");
    const lblY = branch.gap >= 0 ? by - 0.5 : by + hh + 0.5;
    pdf.text(compactNumber(branch.gap), bx + bw / 2, lblY, { align: "center", baseline: branch.gap >= 0 ? "bottom" : "top" });
    v3font(pdf, 6, "normal");
    v3rgb(pdf, V3C.muted, "text");
    pdf.text(shortName(branch.name), bx + bw / 2, chartY + chartH + 2, { align: "center", baseline: "top" });
  });
  const riskiest = [...branches].sort((a, b) => a.gap - b.gap)[0];
  v3insight(pdf, [
    { type: "eyebrow", text: "Mayor déficit" },
    riskiest && riskiest.gap < 0
      ? { type: "value", text: riskiest.name.slice(0, 18), sub: `GAP ${formatter.format(riskiest.gap)}` }
      : { type: "value", text: "Sin déficit activo", sub: "Todas sobre meta" },
    { type: "divider" },
    ...branches.map((b) => ({ type: "metric", label: shortName(b.name), value: formatter.format(b.gap), color: b.gap >= 0 ? V3C.green : V3C.red })),
  ], insightX, chartY, insightW, chartH + 15);
}

function pdfV3Heatmap(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Ventas · Actividad por día", cx, cy);
  v3heading(pdf, "Documentos por Día y Sucursal", cx, cy + 4.5);
  const branches = activeBranchRows(), dates = dateList();
  const tableY = cy + 21, availH = ph - 7 - tableY - 2;
  const bPct = Math.max(6, Math.floor(68 / Math.max(dates.length, 1)));
  const cols = [
    { label: "Sucursal", pct: 100 - dates.length * bPct, align: "left" },
    ...dates.map((d) => ({ label: formatChartDate(d).slice(0, 5), pct: bPct, align: "center" })),
  ];
  const rows = branches.map((branch) => [
    branch.name,
    ...dates.map((date) => String(branchValue(branch, date, "docs"))),
  ]);
  v3dataTable(pdf, cols, rows, cx, tableY, cw, availH);
}

function pdfV3SalesTable(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Ventas · Detalle accionable", cx, cy);
  v3heading(pdf, "Ventas Netas vs Meta por Sucursal", cx, cy + 4.5);
  const tableY = cy + 21;
  const prev = Object.fromEntries(activeBranchRows(true).map((b) => [b.name, b]));
  const branches = activeBranchRows();
  const cols = [
    { label: "Sucursal", pct: 22, align: "left" },
    { label: "Venta Neta", pct: 16, align: "right" },
    { label: "Periodo Ant.", pct: 14, align: "right" },
    { label: "Meta 100%", pct: 14, align: "right" },
    { label: "Cumpl.", pct: 14, align: "center" },
    { label: "GAP", pct: 12, align: "right" },
    { label: "Estado", pct: 8, align: "center" },
  ];
  const rows = branches.map((b) => [
    b.name,
    exactFormatter.format(b.sales),
    exactFormatter.format(prev[b.name]?.sales || 0),
    exactFormatter.format(b.target),
    { pct: b.compliance },
    exactFormatter.format(b.gap),
    { badge: b.compliance >= 1 ? "good" : b.compliance >= 0.75 ? "warning" : "danger" },
  ]);
  const tableBottom = v3dataTable(pdf, cols, rows, cx, tableY, cw, ph - 7 - tableY - 2);
  if (tableBottom < ph - 14) {
    const t = totals();
    v3font(pdf, 7, "bold");
    v3rgb(pdf, V3C.soft, "text");
    pdf.text(`Total: ${exactFormatter.format(t.sales)}  |  Meta: ${exactFormatter.format(t.target)}  |  Cumpl: ${(t.compliance * 100).toFixed(1)}%  |  GAP: ${formatter.format(t.gap)}`, cx, tableBottom + 5, { baseline: "top" });
  }
}

function pdfV3Comparison(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Ventas · Comparativo", cx, cy);
  v3heading(pdf, "Desempeño Comparativo por Sucursal", cx, cy + 4.5);
  const branches = activeBranchRows();
  const chartW = cw * 0.62, insightW = cw * 0.35;
  const contentY = cy + 21, contentH = ph - 7 - contentY - 6;
  const hexToRgb = (hex) => { const m = hex.match(/\w\w/g); return m ? m.map((h) => parseInt(h, 16)) : V3C.cyan; };
  v3barChart(pdf, branches.map((b) => ({ value: b.sales, label: shortName(b.name), color: b.color })),
    cx, contentY, chartW, contentH, { colorFn: (item) => item.color ? hexToRgb(item.color) : V3C.cyan });
  v3insight(pdf, v3iBranches(), cx + chartW + cw * 0.03, contentY, insightW, contentH);
}

function pdfV3ProductKpis(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Módulo: Productos", cx, cy);
  v3heading(pdf, "Indicadores de Producto", cx, cy + 4.5);
  v3kpiRow(pdf, productKpis(), cx, cy + 21, cw, 38);
  const alertY = cy + 67;
  v3eyebrow(pdf, "Alertas de producto", cx, alertY);
  const afterAlerts = v3alertRows(pdf, withModule("products", moduleAlerts), cx, alertY + 5, cw);
  const insightH = ph - 7 - afterAlerts - 8;
  if (insightH > 18) v3insight(pdf, v3iProducts(), cx, afterAlerts + 6, cw, insightH);
}

function v3iProductsSpecific() {
  const products = productRows();
  const pt = productTotals();
  if (!products.length) return [{ type: "body", text: "Sin datos de producto en el periodo." }];
  const sorted = [...products].sort((a, b) => b.total - a.total);
  const top = sorted[0];
  const topShare = ((top.total / Math.max(pt.quantity, 1)) * 100).toFixed(1);
  const withVol = sorted.filter((p) => p.total > 0);
  const bottom = withVol.length ? withVol[withVol.length - 1] : null;
  const cats = categoryBreakdown();
  const top3 = sorted.slice(0, 3).reduce((s, p) => s + p.total, 0);
  const top3Share = ((top3 / Math.max(pt.quantity, 1)) * 100).toFixed(0);
  const blocks = [
    { type: "eyebrow", text: "Producto líder" },
    { type: "value", text: top.name.slice(0, 22), sub: `${numberFormatter.format(top.total)} uds. · ${topShare}% del volumen` },
    { type: "divider" },
  ];
  if (cats.length) {
    blocks.push({ type: "eyebrow", text: "Mix de categorías" });
    cats.slice(0, 5).forEach((cat) => blocks.push({
      type: "metric",
      label: cat.name.slice(0, 20),
      value: `${cat.value.toFixed(1)}%`,
      color: cat.value > 25 ? V3C.green : cat.value > 12 ? V3C.blue : V3C.muted,
    }));
    blocks.push({ type: "divider" });
  }
  blocks.push({ type: "metric", label: "Top 3 concentran", value: `${top3Share}% del volumen` });
  blocks.push({ type: "metric", label: "Referencias activas", value: `${products.length}` });
  blocks.push({ type: "divider" });
  if (bottom && bottom.total <= 5) {
    blocks.push({ type: "body", text: `${bottom.name.slice(0, 28)} registra ${numberFormatter.format(bottom.total)} unidad${bottom.total !== 1 ? "es" : ""} — revisar exhibición, rotación o permanencia en carta.` });
  }
  blocks.push({ type: "body", text: `${top.name.slice(0, 25)} lidera con ${numberFormatter.format(top.total)} unidades (${topShare}% del total).${cats[0] ? ` ${cats[0].name} concentra ${cats[0].value.toFixed(1)}% del mix.${cats[1] ? ` ${cats[1].name} representa ${cats[1].value.toFixed(1)}%.` : ""}` : ""}` });
  return blocks;
}

async function pdfV3Products(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Productos · Ranking y mix", cx, cy);
  v3heading(pdf, "Productos Líderes y Mix de Categorías", cx, cy + 4.5);
  const contentY = cy + 21, contentH = ph - 7 - contentY - 2;

  // Capture the real products grid from the DOM at natural proportions
  const savedModule = state.activeModule, savedSearch = state.tableSearch;
  let captureCanvas = null;
  try {
    state.activeModule = "products";
    state.tableSearch = "";
    renderAll();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const grid = els.moduleContent.querySelector(".content-grid.equal");
    if (grid && window.html2canvas) {
      captureCanvas = await window.html2canvas(grid, {
        backgroundColor: "#0d131c",
        scale: 1.8,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: grid.scrollWidth,
        windowHeight: grid.scrollHeight,
        onclone: (doc) => {
          doc.querySelectorAll("input, .segmented, details, .category-picker").forEach((el) => el.remove());
          doc.querySelectorAll(".scrollable").forEach((el) => {
            el.classList.remove("scrollable");
            el.style.overflow = "visible";
          });
          doc.querySelectorAll(".treemap, .chart, .ranking-list, .donut-wrap").forEach((el) => {
            el.style.overflow = "visible";
          });
        },
      });
    }
  } catch (err) {
    console.warn("[V3 Products]", err);
  } finally {
    state.activeModule = savedModule;
    state.tableSearch = savedSearch;
    renderAll();
  }

  if (captureCanvas) {
    // Natural proportions — NO stretch, NO fill-to-page
    const aspect = captureCanvas.height / captureCanvas.width;
    const maxW = cw * 0.62;
    const maxH = contentH;
    let imgW = maxW, imgH = imgW * aspect;
    if (imgH > maxH) { imgH = maxH; imgW = imgH / aspect; }

    pdf.addImage(captureCanvas.toDataURL("image/png"), "PNG", cx, contentY, imgW, imgH);

    const insightX = cx + imgW + 4;
    const insightW = cw - imgW - 4;
    if (insightW >= 28) {
      v3insight(pdf, v3iProductsSpecific(), insightX, contentY, insightW, Math.min(imgH, contentH));
    }
  } else {
    // Fallback: pure jsPDF insight only
    v3insight(pdf, v3iProductsSpecific(), cx, contentY, cw, contentH);
  }
}

function pdfV3ProductsTable(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Productos · Matriz completa", cx, cy);
  v3heading(pdf, "Cantidad por Sucursal", cx, cy + 4.5);
  const tableY = cy + 21;
  const branches = currentBranches();
  const products = productRows().slice(0, 25);
  const bPct = branches.length > 0 ? Math.min(11, Math.floor(65 / branches.length)) : 11;
  const namePct = 100 - branches.length * bPct - 12;
  const cols = [
    { label: "Producto", pct: namePct, align: "left" },
    { label: "Total", pct: 12, align: "right" },
    ...branches.map((b) => ({ label: shortName(b.name), pct: bPct, align: "right" })),
  ];
  const rows = products.map((p) => [
    p.name.slice(0, 28),
    numberFormatter.format(p.total),
    ...branches.map((b) => numberFormatter.format(p.quantities[b.name] || 0)),
  ]);
  v3dataTable(pdf, cols, rows, cx, tableY, cw, ph - 7 - tableY - 2);
}

function pdfV3FlowKpis(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Módulo: Flujo de ventas", cx, cy);
  v3heading(pdf, "Indicadores de Flujo Horario", cx, cy + 4.5);
  v3kpiRow(pdf, flowKpis(), cx, cy + 21, cw, 38);
  const alertY = cy + 67;
  v3eyebrow(pdf, "Señales operativas", cx, alertY);
  const afterAlerts = v3alertRows(pdf, withModule("flow", moduleAlerts), cx, alertY + 5, cw);
  const insightH = ph - 7 - afterAlerts - 8;
  if (insightH > 18) v3insight(pdf, v3iFlow(), cx, afterAlerts + 6, cw, insightH);
}

function pdfV3FlowCards(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Flujo · Venta horaria consolidada", cx, cy);
  v3heading(pdf, "Venta por Franja Horaria", cx, cy + 4.5);
  const ft = flowTotals();
  const hours = activeFlowHours();
  const active = ft.active || [];
  const hourlyTotals = hours.map((h, hi) => ({
    label: `${h}h`,
    value: active.reduce((sum, branch) => sum + (branch.sales[hi] || 0), 0),
  }));
  const chartW = cw * 0.60, insightW = cw * 0.37;
  const contentY = cy + 21, contentH = ph - 7 - contentY - 6;
  const peak = Math.max(...hourlyTotals.map((h) => h.value), 1);
  v3barChart(pdf, hourlyTotals, cx, contentY, chartW, contentH, {
    colorFn: (item) => item.value >= peak * 0.85 ? V3C.green : item.value >= peak * 0.5 ? V3C.blue : v3alpha(V3C.muted, 0.7),
  });
  v3insight(pdf, v3iFlow(), cx + chartW + cw * 0.03, contentY, insightW, contentH);
}

function pdfV3FlowCharts(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Flujo · Conversión por sucursal", cx, cy);
  v3heading(pdf, "Conversión y Eficiencia Operativa", cx, cy + 4.5);
  const ft = flowTotals();
  const active = [...(ft.active || [])].sort((a, b) => b.conversion - a.conversion);
  const chartW = cw * 0.60, insightW = cw * 0.37;
  const contentY = cy + 21, contentH = ph - 7 - contentY - 6;
  v3barChart(pdf, active.map((b) => ({ value: b.conversion, label: shortName(b.name) })),
    cx, contentY, chartW, contentH, {
      colorFn: (item) => item.value >= 80 ? V3C.green : item.value >= 65 ? V3C.amber : V3C.red,
    });
  v3insight(pdf, v3iFlow(), cx + chartW + cw * 0.03, contentY, insightW, contentH);
}

function pdfV3FlowTable(pdf, pw, ph, pn, total) {
  v3page(pdf, pw, ph); v3header(pdf, pw, pn, total); v3footer(pdf, pw, ph);
  const cx = 10, cy = 13, cw = pw - 20;
  v3eyebrow(pdf, "Flujo · Plan de accion", cx, cy);
  v3heading(pdf, "Recomendaciones por Sucursal", cx, cy + 4.5);
  const tableY = cy + 21;
  const ft = flowTotals();
  const active = ft.active || [];
  const hours = activeFlowHours();
  const cols = [
    { label: "Sucursal", pct: 22, align: "left" },
    { label: "Hora Pico", pct: 11, align: "center" },
    { label: "Conversión", pct: 13, align: "center" },
    { label: "Venta Pico", pct: 16, align: "right" },
    { label: "Señal operativa", pct: 38, align: "left" },
  ];
  const rows = active.map((branch) => {
    const peakHour = hours[branch.peakIndex] || "--";
    const peakSale = branch.sales[branch.peakIndex] || 0;
    const signal = branch.conversion >= 80
      ? "Conversión fuerte — mantener staffing actual"
      : branch.conversion >= 65
        ? "Conversión media — revisar impulso comercial en hora pico"
        : "Conversión baja — reforzar equipo y oferta en piso";
    return [branch.name, `${peakHour}:00`, { pct: branch.conversion / 100 }, formatter.format(peakSale), signal];
  });
  v3dataTable(pdf, cols, rows, cx, tableY, cw, ph - 7 - tableY - 2);
}

// ── V3 Section → Page builder map ────────────────────────────────────────────

const V3_SECTION_MAP = {
  "sales-kpis-alerts":    pdfV3SalesKpis,
  "sales-trend":          pdfV3Trend,
  "sales-waterfall":      pdfV3Waterfall,
  "sales-scorecards":     pdfV3Branches,
  "sales-risk":           pdfV3Risk,
  "sales-heatmap":        pdfV3Heatmap,
  "sales-table":          pdfV3SalesTable,
  "sales-comparison":     pdfV3Comparison,
  "products-kpis-alerts": pdfV3ProductKpis,
  "products-grid":        pdfV3Products,
  "products-table":       pdfV3ProductsTable,
  "flow-kpis-alerts":     pdfV3FlowKpis,
  "flow-cards":           pdfV3FlowCards,
  "flow-charts":          pdfV3FlowCharts,
  "flow-table":           pdfV3FlowTable,
};

// ─────────────────────────────────────────────────────────────────────────────

boot();
