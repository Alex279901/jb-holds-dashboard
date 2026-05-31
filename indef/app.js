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

const state = {
  user: null,
  activeModule: "sales",
  activeBrand: "Santa Gloria MX",
  activeBranches: new Set(brandConfig["Santa Gloria MX"].branches),
  chartMode: "sales",
  cumulativeMode: "sales",
  tableSearch: "",
  productCategories: new Set(["Todas"]),
  categoryMenuOpen: false,
  dateStart: "2026-05-11",
  dateEnd: "2026-05-17"
};

const formatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const exactFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    </section>`;
  bindSegmented();
  renderTrendChart();
  renderWaterfall();
  renderScorecards();
  renderHeatmap();
  renderDeficit();
  renderSalesTable();
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
document.querySelector("#exportButton").addEventListener("click", exportCurrentView);
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

boot();
