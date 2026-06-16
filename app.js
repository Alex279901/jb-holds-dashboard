const statusColors = {
  green: "#7cc9a8",
  amber: "#c9a96a",
  red: "#c46b73",
  cyan: "#9db9c7",
  blue: "#6f8ea8",
  violet: "#9a8fb8",
  grey: "#73808c"
};

const kpis = [
  {
    label: "Ventas netas",
    value: "$14.55M",
    meta: "94.5% vs meta · corte 24 May",
    status: "amber",
    target: "#command",
    points: [2.11, 2.93, 3.48, 3.36, 2.68]
  },
  {
    label: "Resultado P&L",
    value: "$660K",
    meta: "Margen neto 5.9%",
    status: "red",
    target: "[data-module='finanzas']",
    points: [-259, 158, 351, 411]
  },
  {
    label: "Venta vs meta",
    value: "94.5%",
    meta: "Consolidado Jan-May",
    status: "amber",
    target: "#risks",
    points: [65.3, 90.8, 107.9, 104.1, 107.2]
  },
  {
    label: "Documentos",
    value: "41.6K",
    meta: "Ticket medio SG $194",
    status: "green",
    target: "[data-module='operaciones']",
    points: [10.5, 8.1, 8.1, 8.2, 6.7]
  },
  {
    label: "Rotación AMC",
    value: "20.0%",
    meta: "Mayo 2026 · rojo",
    status: "red",
    target: "[data-module='rh']",
    points: [20, 20, 20, 20, 20]
  },
  {
    label: "Expansión MX",
    value: "18",
    meta: "2 próximas aperturas",
    status: "amber",
    target: "[data-module='expansion']",
    points: [5, 9, 4]
  },
  {
    label: "Costo resultado",
    value: "$0.72",
    meta: "$52.3K pauta · 73.0K resultados",
    status: "amber",
    target: "[data-module='marketing']",
    points: [0.7, 0.73]
  },
  {
    label: "Compromisos vencidos",
    value: "0",
    meta: "Primera sesión · sin minuta",
    status: "green",
    target: "#commitments",
    points: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
];

const departments = [
  {
    key: "finanzas",
    label: "Finanzas",
    code: "FIN",
    accent: "#9db9c7",
    accent2: "#6f8ea8",
    tone: "Administración y Finanzas · ventas diarias + P&L real Jan-Abr 2026.",
    signal: "Ventas netas acumuladas $14.55M con 94.5% de cumplimiento. P&L Jan-Abr deja $660K neto y margen 5.9%, debajo del umbral ejecutivo.",
    metrics: [
      ["Ventas netas", "$14.55M"],
      ["Resultado P&L", "$660K"],
      ["Margen neto", "5.9%"]
    ],
    bars: [65, 91, 100, 100, 100],
    visual: {
      title: "P&L Jan-Abr 2026",
      value: "$660K",
      meta: "Resultado neto acumulado · margen 5.9%",
      status: "amber",
      items: [
        ["Ingresos", "$11.27M", "Jan-Abr"],
        ["Gastos", "$10.61M", "control operativo"],
        ["Abril neto", "$411K", "mejor mes"],
        ["Enero", "-$259K", "punto rojo"]
      ],
      stages: [
        ["Ene", "-13.4%", "red", 13],
        ["Feb", "5.7%", "amber", 44],
        ["Mar", "10.5%", "amber", 72],
        ["Abr", "12.8%", "green", 86]
      ]
    }
  },
  {
    key: "operaciones",
    label: "Operaciones",
    code: "OPS",
    accent: "#7cc9a8",
    accent2: "#9db9c7",
    tone: "Operaciones · ventas diarias MX por sucursal, documentos y semáforo.",
    signal: "432 mediciones sucursal-día: 185 en verde, 36 en amarillo y 211 en rojo. Rojo significa venta diaria por debajo del umbral operativo; SG La Isla concentra 93 lecturas rojas y SG Paseo Montejo 77.",
    metrics: [
      ["Documentos", "41.6K"],
      ["Lecturas en rojo", "211"],
      ["Cumplimiento", "94.5%"]
    ],
    bars: [65, 91, 100, 100, 100],
    visual: {
      title: "Semáforo Operativo",
      value: "211",
      meta: "lecturas en rojo de 432 mediciones",
      status: "red",
      items: [
        ["Verdes", "185", "43% lecturas"],
        ["Amarillos", "36", "8% lecturas"],
        ["SG La Isla", "93 lecturas rojas", "principal foco"],
        ["SG Paseo Montejo", "77 lecturas rojas", "seguimiento"]
      ],
      stages: [
        ["Verde", "185", "green", 86],
        ["Amarillo", "36", "amber", 24],
        ["Rojo", "211", "red", 100]
      ]
    }
  },
  {
    key: "marketing",
    label: "Marketing",
    code: "MKT",
    accent: "#9a8fb8",
    accent2: "#9db9c7",
    tone: "Marketing · Meta Ads pagado y social orgánico SG / AMC.",
    signal: "39 campañas pagadas generan 73,027 resultados con $52.3K de pauta y costo por resultado de $0.72. Mayo orgánico suma 1.68M visualizaciones.",
    metrics: [
      ["Pauta", "$52.3K"],
      ["Resultados", "73.0K"],
      ["Costo result.", "$0.72"]
    ],
    bars: [19, 31, 52, 74, 86, 100, 92, 78],
    visual: {
      title: "Paid + Organic Signal",
      value: "73.0K",
      meta: "resultados pagados · CPR $0.72",
      status: "amber",
      items: [
        ["Gasto Meta", "$52.3K", "39 campañas"],
        ["Impresiones", "3.61M", "paid media"],
        ["Visualizaciones", "1.68M", "orgánico mayo"],
        ["Activas", "13", "campañas live"]
      ],
      stages: [
        ["SG Paid", "$27.2K", "amber", 86],
        ["AMC Paid", "$25.1K", "amber", 80],
        ["SG Organic", "910.6K", "green", 100],
        ["AMC Organic", "768.9K", "green", 84]
      ]
    }
  },
  {
    key: "rh",
    label: "Recursos Humanos",
    code: "RH",
    accent: "#c9a96a",
    accent2: "#7cc9a8",
    tone: "Recursos Humanos · rotación real por unidad Mayo 2026.",
    signal: "AMC marca rojo con 20.0% de rotación. SG La Isla queda en 11.1% y SG Paseo Montejo en 14.3%, ambos en amarillo. Corporativo permanece verde.",
    metrics: [
      ["Rotación AMC", "20.0%"],
      ["Rotación SG La Isla", "11.1%"],
      ["Rotación SG Paseo Montejo", "14.3%"]
    ],
    bars: [20, 11, 14, 0, 20, 11, 14, 0],
    visual: {
      title: "Rotación Mayo 2026",
      value: "20.0%",
      meta: "AMC rojo · 3 bajas / 15 colaboradores",
      status: "red",
      items: [
        ["AMC", "20.0%", "rojo"],
        ["SG La Isla", "11.1%", "amarillo"],
        ["SG Paseo Montejo", "14.3%", "amarillo"],
        ["CORP", "0.0%", "verde"]
      ],
      stages: [
        ["AMC", "20.0%", "red", 100],
        ["SG La Isla", "11.1%", "amber", 56],
        ["SG Paseo Montejo", "14.3%", "amber", 72],
        ["CORP", "0.0%", "green", 4]
      ]
    }
  },
  {
    key: "expansion",
    label: "Expansión",
    code: "EXP",
    accent: "#2e86ff",
    accent2: "#c9a96a",
    tone: "Expansión · pipeline MX con estatus, renta, m2 y contactos.",
    signal: "18 proyectos: 9 SG, 5 AMC y 4 CBC. Hay 2 próximas aperturas y renta conocida por $709K MXN en 7 ubicaciones.",
    metrics: [
      ["Proyectos", "18"],
      ["Prox. apertura", "2"],
      ["Renta conocida", "$709K"]
    ],
    bars: [6, 3, 2, 1, 1, 1, 1, 1],
    visual: {
      title: "Pipeline MX 2026",
      value: "18",
      meta: "9 SG · 5 AMC · 4 CBC",
      status: "amber",
      items: [
        ["Prospeccion", "6", "top funnel"],
        ["Espera contrato", "3", "legal/comercial"],
        ["Prox. apertura", "2", "SG Victory / Altabrisa"],
        ["Renta conocida", "$709K", "7 ubicaciones"]
      ],
      stages: [
        ["SG", "9", "amber", 100],
        ["AMC", "5", "green", 56],
        ["CBC", "4", "violet", 44],
        ["Cierres", "2", "red", 22]
      ]
    }
  },
  {
    key: "administracion",
    label: "Excelencia de Marca",
    code: "BRD",
    accent: "#c46b73",
    accent2: "#c9a96a",
    tone: "Excelencia de Marca · master data, cobertura y control institucional.",
    signal: "4 marcas oficiales y 4 unidades activas en master data: Santagloria, Allô Mon Coco, CoCo Bubble Tea e IN-DEF Corporativo.",
    metrics: [
      ["Marcas", "4"],
      ["Unidades activas", "4"],
      ["Sucursales SG", "2"]
    ],
    bars: [4, 4, 4, 4, 4, 4, 4, 4],
    visual: {
      title: "Master Data Coverage",
      value: "4",
      meta: "marcas oficiales · 4 unidades activas",
      status: "green",
      items: [
        ["Santagloria", "2", "Soft Restaurant"],
        ["Allô Mon Coco", "1", "Hiopos"],
        ["CoCo Bubble Tea", "0", "expansión"],
        ["IN-DEF", "1", "corporativo"]
      ],
      stages: [
        ["SG", "2 activas", "green", 100],
        ["AMC", "1 activa", "green", 50],
        ["CBC", "pipeline", "amber", 34],
        ["CORP", "admin", "green", 50]
      ]
    }
  }
];

const departmentDrilldowns = {
  finanzas: {
    title: "Desglose financiero",
    meta: "Global -> marca -> sucursal -> P&L operativo",
    filters: [
      ["all", "Global"],
      ["sg", "Santagloria"],
      ["amc", "Allô Mon Coco"],
      ["corp", "Corporativo"]
    ],
    scope: [
      ["Global", "$14.55M", "ventas netas consolidadas"],
      ["Marca", "SG $8.05M · AMC $6.50M", "ventas Jan-May"],
      ["Sucursal", "3 unidades operativas", "2 SG + 1 AMC"],
      ["Detalle", "P&L Jan-Abr", "$660K neto · 5.9% margen"]
    ],
    cardsTitle: "P&L, ventas y margen",
    cards: [
      {
        tags: ["all"],
        title: "JB Holds Consolidado",
        subtitle: "Global · Jan-May ventas / Jan-Abr P&L",
        status: "amber",
        metrics: [["Ventas", "$14.55M"], ["P&L", "$660K"], ["Margen", "5.9%"]]
      },
      {
        tags: ["all", "sg"],
        title: "Santagloria México",
        subtitle: "Marca · 2 sucursales activas",
        status: "red",
        metrics: [["Ventas", "$8.05M"], ["Meta", "$10.05M"], ["Cumpl.", "80.1%"]]
      },
      {
        tags: ["all", "amc"],
        title: "Allô Mon Coco México",
        subtitle: "Marca · 1 sucursal activa",
        status: "green",
        metrics: [["Ventas", "$6.50M"], ["Meta", "$5.34M"], ["Cumpl.", "121.7%"]]
      },
      {
        tags: ["all", "sg"],
        title: "SG La Isla",
        subtitle: "Sucursal · P&L Jan-Abr",
        status: "green",
        metrics: [["Ingresos", "$3.76M"], ["Neto", "$572K"], ["Margen", "15.2%"]]
      },
      {
        tags: ["all", "sg"],
        title: "SG Paseo Montejo",
        subtitle: "Sucursal · P&L Jan-Abr",
        status: "green",
        metrics: [["Ingresos", "$2.50M"], ["Neto", "$438K"], ["Margen", "17.5%"]]
      },
      {
        tags: ["all", "corp"],
        title: "IN-DEF Corporativo",
        subtitle: "Corporativo · P&L Jan-Abr",
        status: "red",
        metrics: [["Ingresos", "$5.00M"], ["Neto", "-$350K"], ["Margen", "-7.0%"]]
      }
    ],
    barsTitle: "Margen neto por periodo",
    bars: [
      { tags: ["all"], label: "Enero", value: "-13.4%", meta: "-$259K neto", status: "red", width: 13 },
      { tags: ["all"], label: "Febrero", value: "5.7%", meta: "$158K neto", status: "amber", width: 44 },
      { tags: ["all"], label: "Marzo", value: "10.5%", meta: "$351K neto", status: "amber", width: 72 },
      { tags: ["all"], label: "Abril", value: "12.8%", meta: "$411K neto", status: "green", width: 86 }
    ],
    columns: ["Nivel", "Unidad", "KPI", "Valor", "Lectura"],
    rows: [
      { tags: ["all"], status: "amber", cells: ["Global", "JB Holds", "Ventas netas", "$14.55M", "94.5% vs meta"] },
      { tags: ["all"], status: "red", cells: ["Global", "JB Holds", "P&L", "$660K", "5.9% margen"] },
      { tags: ["all", "sg"], status: "red", cells: ["Marca", "Santagloria", "Ventas", "$8.05M", "80.1% vs meta"] },
      { tags: ["all", "amc"], status: "green", cells: ["Marca", "Allô Mon Coco", "Ventas", "$6.50M", "121.7% vs meta"] },
      { tags: ["all", "sg"], status: "green", cells: ["Sucursal", "SG La Isla", "P&L", "$572K", "15.2% margen"] },
      { tags: ["all", "sg"], status: "green", cells: ["Sucursal", "SG Paseo Montejo", "P&L", "$438K", "17.5% margen"] },
      { tags: ["all", "corp"], status: "red", cells: ["Corporativo", "IN-DEF", "P&L", "-$350K", "-7.0% margen"] }
    ],
    notes: ["P&L disponible solo Jan-Abr.", "EBITDA exacto no viene en fuente; se conserva Resultado P&L."]
  },
  operaciones: {
    title: "Desglose operativo",
    meta: "Ventas diarias, documentos, cumplimiento y semáforo por sucursal",
    filters: [
      ["all", "Global"],
      ["sg", "Santagloria"],
      ["amc", "Allô Mon Coco"],
      ["red", "Lecturas rojas"]
    ],
    scope: [
      ["Global", "432", "mediciones sucursal-día"],
      ["Marca", "SG 80.1% · AMC 121.7%", "cumplimiento Jan-May"],
      ["Sucursal", "SG La Isla · SG Paseo Montejo · AMC", "operación diaria"],
      ["Detalle", "211 rojas", "lecturas bajo umbral operativo"]
    ],
    cardsTitle: "Sucursal performance",
    cards: [
      {
        tags: ["all", "sg", "red"],
        title: "SG La Isla",
        subtitle: "Sucursal · ventas Jan-May",
        status: "red",
        metrics: [["Ventas", "$5.14M"], ["Cumpl.", "75.9%"], ["Rojas", "93"]]
      },
      {
        tags: ["all", "sg", "red"],
        title: "SG Paseo Montejo",
        subtitle: "Sucursal · ventas Jan-May",
        status: "red",
        metrics: [["Ventas", "$2.91M"], ["Cumpl.", "88.6%"], ["Rojas", "77"]]
      },
      {
        tags: ["all", "amc"],
        title: "Allô Mon Coco Mérida",
        subtitle: "Sucursal · ventas Jan-May",
        status: "green",
        metrics: [["Ventas", "$6.50M"], ["Cumpl.", "121.7%"], ["Rojas", "41"]]
      },
      {
        tags: ["all", "sg"],
        title: "Documentos Santagloria",
        subtitle: "Tickets operativos acumulados",
        status: "green",
        metrics: [["Total", "41.6K"], ["SG La Isla", "25.1K"], ["SG Paseo Montejo", "16.4K"]]
      }
    ],
    barsTitle: "Ultimas semanas",
    bars: [
      { tags: ["all"], label: "Semana 18", value: "$719K", meta: "96.9% vs meta", status: "amber", width: 70 },
      { tags: ["all"], label: "Semana 19", value: "$802K", meta: "110.2% vs meta", status: "green", width: 88 },
      { tags: ["all"], label: "Semana 20", value: "$745K", meta: "102.3% vs meta", status: "green", width: 79 },
      { tags: ["all", "red"], label: "Semana 21", value: "$677K", meta: "93.0% vs meta", status: "amber", width: 66 }
    ],
    columns: ["Nivel", "Unidad", "Ventas", "Meta", "Operación"],
    rows: [
      { tags: ["all"], status: "amber", cells: ["Global", "JB Holds", "$14.55M", "$15.39M", "94.5% cumplimiento"] },
      { tags: ["all", "sg", "red"], status: "red", cells: ["Sucursal", "SG La Isla", "$5.14M", "$6.77M", "93 lecturas rojas"] },
      { tags: ["all", "sg", "red"], status: "red", cells: ["Sucursal", "SG Paseo Montejo", "$2.91M", "$3.28M", "77 lecturas rojas"] },
      { tags: ["all", "amc"], status: "green", cells: ["Sucursal", "AMC Mérida", "$6.50M", "$5.34M", "121.7% cumplimiento"] },
      { tags: ["all", "sg"], status: "green", cells: ["Marca", "Santagloria", "41.6K docs", "2 POS", "Soft Restaurant"] }
    ],
    notes: ["Lectura roja = venta diaria debajo del umbral operativo.", "AMC no trae documentos en la fuente diaria; se mantiene 0 en documentos."]
  },
  marketing: {
    title: "Desglose marketing",
    meta: "Campanas pagadas, organic social y rendimiento por marca",
    filters: [
      ["all", "Global"],
      ["sg", "Santagloria"],
      ["amc", "Allô Mon Coco"],
      ["active", "Activas"]
    ],
    scope: [
      ["Global", "39 campañas", "$52.3K pauta"],
      ["Marca", "SG $27.2K · AMC $25.1K", "paid media"],
      ["Sucursal", "Sin tracking", "fuente por marca/campaña"],
      ["Detalle", "$0.72 CPR", "73.0K resultados"]
    ],
    cardsTitle: "Paid + Organic",
    cards: [
      {
        tags: ["all", "sg"],
        title: "Santagloria Paid",
        subtitle: "25 campañas · 7 activas",
        status: "amber",
        metrics: [["Gasto", "$27.2K"], ["Resultados", "38.6K"], ["CPR", "$0.70"]]
      },
      {
        tags: ["all", "amc"],
        title: "Allô Mon Coco Paid",
        subtitle: "14 campañas · 6 activas",
        status: "amber",
        metrics: [["Gasto", "$25.1K"], ["Resultados", "34.5K"], ["CPR", "$0.73"]]
      },
      {
        tags: ["all", "sg"],
        title: "Santagloria Organic May",
        subtitle: "Instagram + TikTok",
        status: "green",
        metrics: [["Views", "910.6K"], ["Perfil", "30.0K"], ["Clicks", "11.8K"]]
      },
      {
        tags: ["all", "amc"],
        title: "AMC Organic May",
        subtitle: "Instagram + TikTok",
        status: "green",
        metrics: [["Views", "768.9K"], ["Perfil", "28.3K"], ["Clicks", "8.2K"]]
      }
    ],
    barsTitle: "Campanas por gasto",
    bars: [
      { tags: ["all", "amc", "active"], label: "ALLO_CARR_NUEVOMENU", value: "$5.3K", meta: "8,159 resultados", status: "green", width: 100 },
      { tags: ["all", "sg"], label: "SG_MX_POST8", value: "$5.1K", meta: "12,292 resultados", status: "green", width: 96 },
      { tags: ["all", "amc"], label: "ALLO_REEL_COMIDAS", value: "$4.4K", meta: "7,474 resultados", status: "amber", width: 83 },
      { tags: ["all", "amc"], label: "REEL_MENUCOMIDA", value: "$3.1K", meta: "3,961 resultados", status: "amber", width: 59 }
    ],
    columns: ["Nivel", "Campaña / Marca", "Gasto", "Resultado", "Lectura"],
    rows: [
      { tags: ["all"], status: "amber", cells: ["Global", "Meta Ads", "$52.3K", "73.0K", "$0.72 CPR"] },
      { tags: ["all", "sg"], status: "green", cells: ["Marca", "Santagloria", "$27.2K", "38.6K", "$0.70 CPR"] },
      { tags: ["all", "amc"], status: "amber", cells: ["Marca", "Allô Mon Coco", "$25.1K", "34.5K", "$0.73 CPR"] },
      { tags: ["all", "amc", "active"], status: "green", cells: ["Campaña", "ALLO_CARR_NUEVOMENU", "$5.3K", "8,159", "Activa"] },
      { tags: ["all", "sg"], status: "green", cells: ["Campaña", "SG_MX_POST8", "$5.1K", "12,292", "Inactiva / eficiente"] }
    ],
    notes: ["La fuente pagada esta a nivel marca/campaña.", "No hay atribucion directa por sucursal en esta carga."]
  },
  rh: {
    title: "Desglose recursos humanos",
    meta: "Plantilla, altas, bajas y rotación por unidad",
    filters: [
      ["all", "Global"],
      ["sg", "Santagloria"],
      ["amc", "Allô Mon Coco"],
      ["corp", "Corporativo"],
      ["red", "Riesgo"]
    ],
    scope: [
      ["Global", "55 colaboradores", "4 unidades reportadas"],
      ["Marca", "SG 32 · AMC 15", "plantilla operativa"],
      ["Sucursal", "4 unidades", "rotación Mayo"],
      ["Detalle", "AMC 20.0%", "principal foco rojo"]
    ],
    cardsTitle: "Rotación Mayo 2026",
    cards: [
      {
        tags: ["all", "amc", "red"],
        title: "Allô Mon Coco Mérida",
        subtitle: "Sucursal · Mayo 2026",
        status: "red",
        metrics: [["Plantilla", "15"], ["Bajas", "3"], ["Rotación", "20.0%"]]
      },
      {
        tags: ["all", "sg"],
        title: "SG La Isla",
        subtitle: "Sucursal · Mayo 2026",
        status: "amber",
        metrics: [["Plantilla", "18"], ["Bajas", "2"], ["Rotación", "11.1%"]]
      },
      {
        tags: ["all", "sg"],
        title: "SG Paseo Montejo",
        subtitle: "Sucursal · Mayo 2026",
        status: "amber",
        metrics: [["Plantilla", "14"], ["Bajas", "2"], ["Rotación", "14.3%"]]
      },
      {
        tags: ["all", "corp"],
        title: "IN-DEF Corporativo",
        subtitle: "Oficina corporativa",
        status: "green",
        metrics: [["Plantilla", "8"], ["Bajas", "0"], ["Rotación", "0.0%"]]
      }
    ],
    barsTitle: "Rotación por unidad",
    bars: [
      { tags: ["all", "amc", "red"], label: "AMC Mérida", value: "20.0%", meta: "3 bajas / 15", status: "red", width: 100 },
      { tags: ["all", "sg"], label: "SG Paseo Montejo", value: "14.3%", meta: "2 bajas / 14", status: "amber", width: 72 },
      { tags: ["all", "sg"], label: "SG La Isla", value: "11.1%", meta: "2 bajas / 18", status: "amber", width: 56 },
      { tags: ["all", "corp"], label: "Corporativo", value: "0.0%", meta: "0 bajas / 8", status: "green", width: 4 }
    ],
    columns: ["Nivel", "Unidad", "Plantilla", "Bajas", "Lectura"],
    rows: [
      { tags: ["all", "amc", "red"], status: "red", cells: ["Sucursal", "AMC Mérida", "15", "3", "20.0% rotación"] },
      { tags: ["all", "sg"], status: "amber", cells: ["Sucursal", "SG La Isla", "18", "2", "Supervisor pendiente"] },
      { tags: ["all", "sg"], status: "amber", cells: ["Sucursal", "SG Paseo Montejo", "14", "2", "Ventas bajas elevan riesgo"] },
      { tags: ["all", "corp"], status: "green", cells: ["Corporativo", "IN-DEF", "8", "0", "Equipo estable"] }
    ],
    notes: ["Rotación tomada del archivo real de Mayo 2026.", "Ausentismo y nómina no vienen en esta carga; se dejan pendientes para siguiente inyección."]
  },
  expansion: {
    title: "Desglose expansión",
    meta: "Pipeline por marca, ciudad, estatus, renta y obra",
    filters: [
      ["all", "Global"],
      ["sg", "Santagloria"],
      ["amc", "Allô Mon Coco"],
      ["cbc", "CoCo Bubble Tea"],
      ["hot", "Proxima apertura"]
    ],
    scope: [
      ["Global", "18 proyectos", "pipeline MX"],
      ["Marca", "9 SG · 5 AMC · 4 CBC", "mix de expansión"],
      ["Sucursal", "2 próximas aperturas", "SG Victory / SG Altabrisa"],
      ["Detalle", "$709K renta", "7 ubicaciones con dato"]
    ],
    cardsTitle: "Pipeline ejecutivo",
    cards: [
      {
        tags: ["all", "sg", "hot"],
        title: "SG Victory Platz",
        subtitle: "Mérida · proxima apertura",
        status: "green",
        metrics: [["Marca", "SG"], ["Renta", "Null"], ["Plazo", "Null"]]
      },
      {
        tags: ["all", "sg", "hot"],
        title: "SG Altabrisa",
        subtitle: "Mérida · proxima apertura",
        status: "green",
        metrics: [["Marca", "SG"], ["Renta", "Null"], ["Plazo", "Null"]]
      },
      {
        tags: ["all", "amc"],
        title: "AMC Carr. Cholul",
        subtitle: "Contrato firmado",
        status: "amber",
        metrics: [["M2", "523.9"], ["Renta", "$134K"], ["Obra", "24 sem."]]
      },
      {
        tags: ["all", "cbc"],
        title: "CBC La Isla",
        subtitle: "Cancun · carta enviada",
        status: "amber",
        metrics: [["Marca", "CBC"], ["Renta", "$35K"], ["Firma", "Pend."]]
      }
    ],
    barsTitle: "Estatus pipeline",
    bars: [
      { tags: ["all"], label: "Prospeccion", value: "6", meta: "top funnel", status: "amber", width: 100 },
      { tags: ["all"], label: "Espera contrato", value: "3", meta: "legal/comercial", status: "amber", width: 50 },
      { tags: ["all", "hot"], label: "Proxima apertura", value: "2", meta: "SG", status: "green", width: 34 },
      { tags: ["all"], label: "Otros estatus", value: "7", meta: "firma/autorizado/planos", status: "blue", width: 76 }
    ],
    columns: ["Nivel", "Proyecto", "Marca", "Estatus", "Dato clave"],
    rows: [
      { tags: ["all", "sg", "hot"], status: "green", cells: ["Proyecto", "SG Victory Platz", "SG", "proxima_apertura", "Mérida"] },
      { tags: ["all", "sg", "hot"], status: "green", cells: ["Proyecto", "SG Altabrisa", "SG", "proxima_apertura", "Mérida"] },
      { tags: ["all", "amc"], status: "amber", cells: ["Proyecto", "AMC Carr. Cholul", "AMC", "contrato_firmado", "$134K renta"] },
      { tags: ["all", "sg"], status: "amber", cells: ["Proyecto", "SG Plaza Universidad", "SG", "firma_pendiente", "$163K renta"] },
      { tags: ["all", "cbc"], status: "amber", cells: ["Proyecto", "CBC La Isla", "CBC", "carta_enviada", "$35K renta"] }
    ],
    notes: ["Renta conocida por $709K en 7 ubicaciones.", "Los proyectos sin renta/plazo mantienen Null hasta siguiente carga."]
  },
  administracion: {
    title: "Desglose excelencia de marca",
    meta: "Master data, cobertura de fuentes y control institucional",
    filters: [
      ["all", "Global"],
      ["sg", "Santagloria"],
      ["amc", "Allô Mon Coco"],
      ["cbc", "CoCo Bubble Tea"],
      ["corp", "Corporativo"]
    ],
    scope: [
      ["Global", "4 marcas", "master data oficial"],
      ["Marca", "SG · AMC · CBC · CORP", "catalogo"],
      ["Sucursal", "4 unidades activas", "3 operativas + 1 corporativa"],
      ["Detalle", "969 filas", "fuentes cargadas al proyecto"]
    ],
    cardsTitle: "Master data",
    cards: [
      {
        tags: ["all", "sg"],
        title: "Santagloria México",
        subtitle: "Restaurante / Cafeteria",
        status: "green",
        metrics: [["Sucursales", "2"], ["POS", "Soft"], ["Pais", "MX"]]
      },
      {
        tags: ["all", "amc"],
        title: "Allô Mon Coco México",
        subtitle: "Restaurante / Brunch",
        status: "green",
        metrics: [["Sucursales", "1"], ["POS", "Hiopos"], ["Pais", "MX"]]
      },
      {
        tags: ["all", "cbc"],
        title: "CoCo Bubble Tea México",
        subtitle: "Bebidas / expansión",
        status: "amber",
        metrics: [["Sucursales", "0"], ["Pipeline", "4"], ["Pais", "MX"]]
      },
      {
        tags: ["all", "corp"],
        title: "IN-DEF Corporativo",
        subtitle: "Holding / Admin",
        status: "green",
        metrics: [["Unidades", "1"], ["RH", "8"], ["Rol", "Control"]]
      }
    ],
    barsTitle: "Cobertura de fuentes",
    bars: [
      { tags: ["all"], label: "Ventas diarias", value: "432", meta: "filas", status: "green", width: 100 },
      { tags: ["all"], label: "P&L", value: "317", meta: "filas", status: "green", width: 73 },
      { tags: ["all"], label: "Social organic", value: "96", meta: "filas", status: "green", width: 22 },
      { tags: ["all"], label: "Campañas paid", value: "39", meta: "filas", status: "amber", width: 9 }
    ],
    columns: ["Nivel", "Entidad", "Tipo", "Unidades", "Lectura"],
    rows: [
      { tags: ["all", "sg"], status: "green", cells: ["Marca", "Santagloria México", "Restaurante", "2", "operación activa"] },
      { tags: ["all", "amc"], status: "green", cells: ["Marca", "Allô Mon Coco México", "Restaurante", "1", "operación activa"] },
      { tags: ["all", "cbc"], status: "amber", cells: ["Marca", "CoCo Bubble Tea México", "Bebidas", "0", "pipeline expansión"] },
      { tags: ["all", "corp"], status: "green", cells: ["Unidad", "IN-DEF Corporativo", "Holding/Admin", "1", "control corporativo"] }
    ],
    notes: ["Master data conserva nombres, códigos y unidades de los CSV.", "Compromisos queda preparado para inyecciónes futuras."]
  }
};

const pulseAlerts = [
  {
    level: "P1",
    title: "SG La Isla vende 68.47% vs meta",
    copy: "Mayo 2026 queda en rojo: $751.7K contra meta de $1.10M. Es el principal gap operativo de ventas.",
    owner: "DIR_OPS / SG",
    status: "red"
  },
  {
    level: "P1",
    title: "SG Paseo Montejo vende 79.74% vs meta",
    copy: "Mayo 2026 también queda en rojo: $424.4K contra meta de $532.3K.",
    owner: "DIR_OPS / SG",
    status: "red"
  },
  {
    level: "P1",
    title: "Rotación AMC en rojo",
    copy: "Allô Mon Coco Mérida registra 20.0% de rotación en mayo 2026: 3 bajas sobre 15 colaboradores.",
    owner: "DIR_RH / AMC",
    status: "red"
  },
  {
    level: "P2",
    title: "Margen neto bajo objetivo",
    copy: "P&L Jan-Abr registra margen acumulado de 5.9%. Abril mejora a 12.8%, pero el acumulado sigue bajo umbral.",
    owner: "DIR_FIN",
    status: "amber"
  },
  {
    level: "P2",
    title: "Pipeline de expansión exige cadencia",
    copy: "18 proyectos MX en cartera; SG Victory Platz y SG Altabrisa aparecen como próximas aperturas.",
    owner: "DIR_EXP",
    status: "amber"
  }
];

const insights = [
  {
    tag: "Ventas",
    title: "94.5% vs meta",
    bullets: ["$14.55M ventas netas acumuladas", "Meta acumulada $15.39M", "Mayo mejora a 107.2% consolidado"],
    action: "Recuperar SG La Isla",
    status: "amber"
  },
  {
    tag: "Sucursal",
    title: "AMC 173.23%",
    bullets: ["Mayo supera meta con $1.50M", "Meta mensual $866K", "Contrasta contra dos focos rojos SG"],
    action: "Replicar lectura comercial",
    status: "green"
  },
  {
    tag: "Marketing",
    title: "$0.72 CPR",
    bullets: ["39 campañas Meta Ads", "$52.3K gasto total", "73.0K resultados y 3.61M impresiones"],
    action: "Optimizar campañas activas",
    status: "amber"
  },
  {
    tag: "Expansión",
    title: "18 proyectos MX",
    bullets: ["9 SG, 5 AMC y 4 CBC", "2 próximas aperturas", "Renta conocida $709K en 7 ubicaciones"],
    action: "Priorizar cierres",
    status: "amber"
  }
];

const risks = [
  {
    title: "SG La Isla por debajo de meta",
    copy: "Venta vs meta de 68.47% en mayo 2026. Requiere plan comercial y operativo inmediato.",
    meta: ["Ventas", "$751.7K", "Rojo"],
    status: "red"
  },
  {
    title: "SG Paseo Montejo en rojo comercial",
    copy: "Venta vs meta de 79.74% en mayo 2026. La tendencia de ventas bajas se conecta con riesgo de rotación.",
    meta: ["Ventas", "$424.4K", "Rojo"],
    status: "red"
  },
  {
    title: "Rotación AMC al 20.0%",
    copy: "3 bajas sobre 15 colaboradores. El reporte indica equipo nuevo de barra principal y regularizacion pendiente.",
    meta: ["RH", "Mayo 2026", "Rojo"],
    status: "red"
  },
  {
    title: "Margen neto acumulado bajo",
    copy: "P&L real Jan-Abr cierra con 5.9% de margen neto. El umbral ejecutivo marca rojo por debajo de 8%.",
    meta: ["Finanzas", "$660K", "5.9%"],
    status: "amber"
  }
];

const commitments = [];

const importantPending = [
  {
    lane: "Prioridad alta",
    title: "Homologar nomenclatura de sucursales",
    owner: "Dirección / Data",
    due: "Aplicar en todos los departamentos",
    progress: 25,
    status: "amber"
  },
  {
    lane: "Riesgo operativo",
    title: "Trámite CFE Allô Mon Coco",
    owner: "Operaciones / Mantenimiento",
    due: "Actualmente con 3 transformadores; riesgo por tiempo insuficiente de trámite si se ocupan",
    progress: 10,
    status: "red"
  },
  {
    lane: "Equipamiento",
    title: "Máquina de hielo Allô Mon Coco",
    owner: "Operaciones",
    due: "Validar compra, instalación o mantenimiento",
    progress: 0,
    status: "amber"
  },
  {
    lane: "Equipamiento",
    title: "Juguera Allô Mon Coco",
    owner: "Operaciones",
    due: "Definir requerimiento, proveedor y fecha objetivo",
    progress: 0,
    status: "amber"
  }
];

function sparkline(points, width = 210, height = 58) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const step = width / (points.length - 1);
  const path = points
    .map((point, index) => {
      const x = index * step;
      const y = height - ((point - min) / range) * (height - 8) - 4;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true"><path d="${path}"></path></svg>`;
}

function setStatusVariable(element, status) {
  element.style.setProperty("--status", statusColors[status] || statusColors.cyan);
}

function tagList(tags = []) {
  return Array.from(new Set(["all", ...tags])).join(" ");
}

function renderModuleDrilldown(dept) {
  const detail = departmentDrilldowns[dept.key];
  if (!detail) return "";

  return `
    <section class="module-drilldown" data-drilldown="${dept.key}">
      <div class="drill-header">
        <div>
          <span>Enterprise drill-down</span>
          <h4>${detail.title}</h4>
          <p>${detail.meta}</p>
        </div>
        <div class="drill-filters" aria-label="Filtros de ${dept.label}">
          ${detail.filters
            .map(
              ([key, label], index) => `
                <button type="button" class="drill-filter ${index === 0 ? "is-active" : ""}" data-filter="${key}">
                  ${label}
                </button>
              `
            )
            .join("")}
        </div>
      </div>

      <div class="drill-scope">
        ${detail.scope
          .map(
            ([level, value, meta]) => `
              <div>
                <small>${level}</small>
                <strong>${value}</strong>
                <span>${meta}</span>
              </div>
            `
          )
          .join("")}
      </div>

      <div class="drill-grid">
        <article class="drill-panel drill-panel-wide">
          <div class="drill-panel-head">
            <span>Vista jerarquica</span>
            <strong>${detail.cardsTitle}</strong>
          </div>
          <div class="drill-card-grid">
            ${detail.cards
              .map(
                (card) => `
                  <article class="drill-card drill-item status-${card.status}" data-filter-tags="${tagList(card.tags)}">
                    <div class="drill-card-top">
                      <div>
                        <span>${card.subtitle}</span>
                        <h5>${card.title}</h5>
                      </div>
                      <i aria-hidden="true"></i>
                    </div>
                    <div class="drill-card-metrics">
                      ${card.metrics
                        .map(
                          ([label, value]) => `
                            <div>
                              <small>${label}</small>
                              <strong>${value}</strong>
                            </div>
                          `
                        )
                        .join("")}
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </article>

        <article class="drill-panel">
          <div class="drill-panel-head">
            <span>Comparativo</span>
            <strong>${detail.barsTitle}</strong>
          </div>
          <div class="drill-bars">
            ${detail.bars
              .map(
                (bar) => `
                  <div class="drill-bar drill-item" data-filter-tags="${tagList(bar.tags)}" style="--bar-status: ${statusColors[bar.status] || statusColors.cyan}; --bar-width: ${Math.max(4, Math.min(100, bar.width))}%">
                    <div>
                      <span>${bar.label}</span>
                      <small>${bar.meta}</small>
                    </div>
                    <i><b></b></i>
                    <strong>${bar.value}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
      </div>

      <article class="drill-table-panel">
        <div class="drill-panel-head">
          <span>Trazabilidad</span>
          <strong>Tabla ejecutiva</strong>
        </div>
        <div class="executive-table-wrap">
          <table class="executive-table">
            <thead>
              <tr>${detail.columns.map((column) => `<th>${column}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${detail.rows
                .map(
                  (row) => `
                    <tr class="drill-item status-${row.status}" data-filter-tags="${tagList(row.tags)}">
                      ${row.cells.map((cell) => `<td>${cell}</td>`).join("")}
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </article>

      <div class="drill-notes">
        ${detail.notes.map((note) => `<span>${note}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderKpis() {
  const container = document.querySelector("#kpiConstellation");
  if (!container) return;

  container.innerHTML = kpis
    .map(
      (kpi) => `
        <button class="kpi-node" type="button" data-target="${kpi.target}" style="--status: ${statusColors[kpi.status]}" aria-label="Ir a ${kpi.label}">
          <div class="kpi-label">
            <span>${kpi.label}</span>
            <i class="kpi-dot" aria-hidden="true"></i>
          </div>
          <div class="kpi-value">${kpi.value}</div>
          <div class="kpi-meta">${kpi.meta}</div>
          ${sparkline(kpi.points)}
        </button>
      `
    )
    .join("");
}

function renderDepartments() {
  const lens = document.querySelector("#departmentLens");
  const theater = document.querySelector("#moduleTheater");
  if (!lens || !theater) return;

  lens.innerHTML = departments
    .map(
      (dept, index) => `
        <button type="button" class="${index === 0 ? "is-active" : ""}" data-module-target="${dept.key}" style="--accent: ${dept.accent}">
          ${dept.label}
        </button>
      `
    )
    .join("");

  theater.innerHTML = departments
    .map(
      (dept, index) => `
        <article class="module-environment reveal ${index === 0 ? "is-focused is-visible" : ""}" data-module="${dept.key}" style="--accent: ${dept.accent}; --accent-2: ${dept.accent2}">
          <div class="module-header">
            <div>
              <span>${dept.tone}</span>
              <h3>${dept.label}</h3>
            </div>
            <div class="module-badge">${dept.code}</div>
          </div>
          <div class="module-metrics">
            ${dept.metrics
              .map(
                ([label, value]) => `
                  <div class="metric-slab">
                    <small>${label}</small>
                    <strong>${value}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="module-visual">
            <div class="module-intelligence" style="--status: ${statusColors[dept.visual.status] || statusColors.cyan}">
              <div class="visual-head">
                <span>${dept.visual.title}</span>
                <strong>${dept.code}</strong>
              </div>
              <div class="visual-hero">
                <strong>${dept.visual.value}</strong>
                <p>${dept.visual.meta}</p>
              </div>
              <div class="visual-metrics">
                ${dept.visual.items
                  .map(
                    ([label, value, meta]) => `
                      <div>
                        <small>${label}</small>
                        <strong>${value}</strong>
                        <span>${meta}</span>
                      </div>
                    `
                  )
                  .join("")}
              </div>
              <div class="visual-bars">
                ${dept.visual.stages
                  .map(
                    ([label, value, status, width]) => `
                      <div class="visual-bar" style="--bar-status: ${statusColors[status] || statusColors.cyan}; --bar-width: ${Math.max(4, Math.min(100, width))}%">
                        <span>${label}</span>
                        <i><b></b></i>
                        <strong>${value}</strong>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </div>
          <div class="module-signal">
            <span>Signal</span>
            <p>${dept.signal}</p>
          </div>
          ${renderModuleDrilldown(dept)}
        </article>
      `
    )
    .join("");

  lens.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.moduleTarget;
      lens.querySelectorAll("button").forEach((item) => item.classList.remove("is-active"));
      theater.querySelectorAll(".module-environment").forEach((module) => {
        const isTarget = module.dataset.module === target;
        module.classList.toggle("is-focused", isTarget);
        if (isTarget) module.classList.add("is-visible");
        if (isTarget) {
          module.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      button.classList.add("is-active");
    });
  });

  theater.querySelectorAll(".module-drilldown").forEach((drilldown) => {
    const filters = drilldown.querySelectorAll(".drill-filter");
    const items = drilldown.querySelectorAll(".drill-item");

    filters.forEach((filter) => {
      filter.addEventListener("click", () => {
        const target = filter.dataset.filter;

        filters.forEach((item) => item.classList.toggle("is-active", item === filter));
        items.forEach((item) => {
          const tags = (item.dataset.filterTags || "").split(" ");
          const visible = target === "all" || tags.includes(target);
          item.classList.toggle("is-hidden", !visible);
        });
      });
    });
  });
}

function renderPulse() {
  const container = document.querySelector("#pulseFeed");
  if (!container) return;

  container.innerHTML = pulseAlerts
    .map(
      (alert) => `
        <article class="pulse-alert" style="--status: ${statusColors[alert.status]}">
          <div class="alert-priority">${alert.level}</div>
          <div class="alert-copy">
            <h3>${alert.title}</h3>
            <p>${alert.copy}</p>
          </div>
          <div class="alert-owner">${alert.owner}</div>
        </article>
      `
    )
    .join("");
}

function renderInsights() {
  const container = document.querySelector("#insightGrid");
  if (!container) return;

  container.innerHTML = insights
    .map(
      (insight) => `
        <article class="executive-signal" style="--status: ${statusColors[insight.status]}">
          <span>${insight.tag}</span>
          <h3>${insight.title}</h3>
          <ul class="signal-list">
            ${insight.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
          </ul>
          <strong>${insight.action}</strong>
        </article>
      `
    )
    .join("");
}

function renderRisks() {
  const container = document.querySelector("#riskStream");
  if (!container) return;

  container.innerHTML = risks
    .map(
      (risk) => `
        <article class="risk-item" style="--status: ${statusColors[risk.status]}">
          <h3>${risk.title}</h3>
          <p>${risk.copy}</p>
          <div class="risk-meta">
            ${risk.meta.map((item) => `<span>${item}</span>`).join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderCommitments() {
  const board = document.querySelector("#commitmentBoard");
  if (!board) return;

  if (!commitments.length) {
    board.innerHTML = `
      <section class="commitment-empty">
        <span>Tracker de Compromisos</span>
        <strong>0 compromisos</strong>
        <p>Primera sesión sin minuta registrada. Cuando exista fact_commitments, aquí apareceran responsables, fechas límite, avance y semáforo.</p>
      </section>
    `;
    return;
  }

  const lanes = ["Críticos", "En proceso", "Seguimiento", "Completados"];
  board.innerHTML = lanes
    .map((lane) => {
      const laneItems = commitments.filter((item) => item.lane === lane);
      return `
        <section class="commitment-lane">
          <div class="lane-title">${lane}<span>${laneItems.length}</span></div>
          ${laneItems
            .map(
              (item) => `
                <article class="commitment-item" style="--status: ${statusColors[item.status]}">
                  <strong>${item.title}</strong>
                  <p>${item.owner} · ${item.due}</p>
                  <small>${item.progress}% avance</small>
                  <div class="progress-line"><span style="--progress: ${item.progress}%"></span></div>
                </article>
              `
            )
            .join("")}
        </section>
      `;
    })
    .join("");
}

function renderImportantPending() {
  const board = document.querySelector("#importantPendingBoard");
  if (!board) return;

  const lanes = ["Prioridad alta", "Riesgo operativo", "Equipamiento"];
  board.innerHTML = lanes
    .map((lane) => {
      const laneItems = importantPending.filter((item) => item.lane === lane);
      return `
        <section class="commitment-lane">
          <div class="lane-title">${lane}<span>${laneItems.length}</span></div>
          ${laneItems
            .map(
              (item) => `
                <article class="commitment-item" style="--status: ${statusColors[item.status]}">
                  <strong>${item.title}</strong>
                  <p>${item.owner} · ${item.due}</p>
                  <small>${item.progress}% avance</small>
                  <div class="progress-line"><span style="--progress: ${item.progress}%"></span></div>
                </article>
              `
            )
            .join("")}
        </section>
      `;
    })
    .join("");
}

function setupReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -80px 0px" }
  );

  targets.forEach((target) => observer.observe(target));
}

function setupNavigation() {
  const links = document.querySelectorAll(".rail-link");
  const sections = document.querySelectorAll("[data-section]");

  document.querySelectorAll("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.jump);
      if (!target) return;

      document.body.classList.add("is-transitioning");
      setTimeout(() => {
        const top = target.getBoundingClientRect().top + window.scrollY - 82;
        window.scrollTo({ top, behavior: "smooth" });
      }, 260);
      setTimeout(() => {
        document.body.classList.remove("is-transitioning");
      }, 920);
    });
  });

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target.dataset.section;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.dataset.section === section);
        });
      });
    },
    { threshold: 0.44 }
  );

  sections.forEach((section) => observer.observe(section));
}

function focusSection(target) {
  if (!target) return;
  document.body.classList.add("is-transitioning");
  target.classList.add("section-focus");
  target.scrollIntoView({ behavior: "smooth", block: "center" });

  setTimeout(() => {
    document.body.classList.remove("is-transitioning");
  }, 980);

  setTimeout(() => {
    target.classList.remove("section-focus");
  }, 2100);
}

function setupKpiNavigation() {
  document.querySelectorAll(".kpi-node[data-target]").forEach((node) => {
    node.addEventListener("click", () => {
      const target = document.querySelector(node.dataset.target);
      if (target?.dataset.module) {
        document.querySelectorAll(".module-environment").forEach((module) => {
          module.classList.toggle("is-focused", module === target);
          if (module === target) module.classList.add("is-visible");
        });
        document.querySelectorAll("[data-module-target]").forEach((button) => {
          button.classList.toggle("is-active", button.dataset.moduleTarget === target.dataset.module);
        });
      }
      focusSection(target);
    });
  });
}

function setupMagneticButtons() {
  const magnets = document.querySelectorAll(".magnetic");
  magnets.forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.setProperty("--mx", `${Math.max(-8, Math.min(8, x * 0.12))}px`);
      element.style.setProperty("--my", `${Math.max(-6, Math.min(6, y * 0.12))}px`);
    });

    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--mx", "0px");
      element.style.setProperty("--my", "0px");
    });
  });
}

function setupAmbientCanvas() {
  const canvas = document.querySelector("#ambientCanvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let particles = [];
  let width = 0;
  let height = 0;
  let frame = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(128, Math.max(58, Math.floor((width * height) / 17500)));
    particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.26,
      r: index % 7 === 0 ? 1.45 : 0.82 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function draw() {
    frame += 0.01;
    context.clearRect(0, 0, width, height);

    context.save();
    context.globalCompositeOperation = "lighter";

    particles.forEach((particle, index) => {
      if (!reduceMotion) {
        particle.x += particle.vx;
        particle.y += particle.vy;
      }
      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;

      const pulse = 0.45 + Math.sin(frame * 2 + particle.phase) * 0.18;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      context.fillStyle = `rgba(67, 220, 255, ${0.16 + pulse * 0.24})`;
      context.fill();

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const next = particles[nextIndex];
        const dx = particle.x - next.x;
        const dy = particle.y - next.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 118) {
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(next.x, next.y);
          context.strokeStyle = `rgba(67, 220, 255, ${0.05 * (1 - distance / 118)})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }
    });

    for (let i = 0; i < 7; i += 1) {
      const y = ((frame * 38 + i * 130) % (height + 180)) - 90;
      const gradient = context.createLinearGradient(0, y, width, y + 80);
      gradient.addColorStop(0, "rgba(67, 220, 255, 0)");
      gradient.addColorStop(0.5, "rgba(67, 220, 255, 0.08)");
      gradient.addColorStop(1, "rgba(67, 220, 255, 0)");
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y + 80);
      context.strokeStyle = gradient;
      context.lineWidth = 1;
      context.stroke();
    }

    context.restore();
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
}

function setupRevenueChart() {
  const canvas = document.querySelector("#revenueCanvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const labels = ["Ene", "Feb", "Mar", "Abr", "May"];
  const revenue = [2.11, 2.93, 3.48, 3.36, 2.68];
  const pnlNet = [-0.26, 0.16, 0.35, 0.41, 0.41];
  const revenueLabels = ["$2.11M", "$2.93M", "$3.48M", "$3.36M", "$2.68M"];
  const pnlLabels = ["-$259K", "$158K", "$351K", "$411K", "Sin corte"];
  let animation = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function plot(points, bounds) {
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = Math.max(0.1, max - min);
    const step = bounds.width / (points.length - 1);
    return points.map((point, index) => {
      const x = bounds.x + step * index;
      const y = bounds.y + bounds.height - ((point - min) / range) * bounds.height;
      return [x, y];
    });
  }

  function drawLabelPill(text, x, y, color, offsetY, canvasWidth, canvasHeight) {
    const boxHeight = 22;
    const paddingX = 8;
    const width = context.measureText(text).width + paddingX * 2;
    const left = Math.max(8, Math.min(x - width / 2, canvasWidth - width - 8));
    const top = Math.max(26, Math.min(y + offsetY - boxHeight / 2, canvasHeight - 46 - boxHeight));
    const radius = 8;

    context.beginPath();
    context.moveTo(left + radius, top);
    context.lineTo(left + width - radius, top);
    context.quadraticCurveTo(left + width, top, left + width, top + radius);
    context.lineTo(left + width, top + boxHeight - radius);
    context.quadraticCurveTo(left + width, top + boxHeight, left + width - radius, top + boxHeight);
    context.lineTo(left + radius, top + boxHeight);
    context.quadraticCurveTo(left, top + boxHeight, left, top + boxHeight - radius);
    context.lineTo(left, top + radius);
    context.quadraticCurveTo(left, top, left + radius, top);
    context.closePath();
    context.fillStyle = "rgba(6, 12, 20, 0.72)";
    context.strokeStyle = `${color}72`;
    context.lineWidth = 1;
    context.fill();
    context.stroke();
    context.fillStyle = color;
    context.fillText(text, left + width / 2, top + boxHeight / 2 + 0.5);
  }

  function drawPointLabels(points, values, color, offsetY, progress, visibleIndexes) {
    const activeCount = Math.max(2, Math.ceil(points.length * progress));
    const visible = visibleIndexes ? new Set(visibleIndexes) : null;
    const rect = canvas.getBoundingClientRect();

    context.save();
    context.font = "800 11px Inter, system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.shadowColor = color;
    context.shadowBlur = 8;

    points.slice(0, activeCount).forEach(([x, y], index) => {
      if (visible && !visible.has(index)) return;
      if (!values[index]) return;
      drawLabelPill(values[index], x, y, color, offsetY, rect.width, rect.height);
    });

    context.restore();
  }

  function drawLine(points, color, progress, fill = false) {
    const count = Math.max(2, Math.ceil(points.length * progress));
    const active = points.slice(0, count);
    if (!active.length) return;

    context.beginPath();
    active.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });

    if (fill) {
      const last = active[active.length - 1];
      const first = active[0];
      const gradient = context.createLinearGradient(0, 60, 0, canvas.getBoundingClientRect().height - 44);
      gradient.addColorStop(0, `${color}42`);
      gradient.addColorStop(1, `${color}00`);
      context.lineTo(last[0], canvas.getBoundingClientRect().height - 50);
      context.lineTo(first[0], canvas.getBoundingClientRect().height - 50);
      context.closePath();
      context.fillStyle = gradient;
      context.fill();
    }

    context.beginPath();
    active.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.strokeStyle = color;
    context.lineWidth = 3;
    context.shadowColor = color;
    context.shadowBlur = 14;
    context.stroke();
    context.shadowBlur = 0;

    active.forEach(([x, y]) => {
      context.beginPath();
      context.arc(x, y, 3.2, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
    });
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    context.clearRect(0, 0, w, h);

    const bounds = { x: 42, y: 34, width: w - 82, height: h - 82 };
    context.strokeStyle = "rgba(147, 223, 255, 0.09)";
    context.lineWidth = 1;
    for (let i = 0; i < 5; i += 1) {
      const y = bounds.y + (bounds.height / 4) * i;
      context.beginPath();
      context.moveTo(bounds.x, y);
      context.lineTo(bounds.x + bounds.width, y);
      context.stroke();
    }

    const revenuePoints = plot(revenue, bounds);
    const pnlPoints = plot(pnlNet, {
      x: bounds.x,
      y: bounds.y + bounds.height * 0.22,
      width: bounds.width,
      height: bounds.height * 0.58
    });

    drawLine(revenuePoints, statusColors.cyan, animation, true);
    drawLine(pnlPoints, statusColors.green, Math.max(0, animation - 0.08), false);

    const compactLabels = w < 720;
    drawPointLabels(revenuePoints, revenueLabels, statusColors.cyan, -24, animation, compactLabels ? [0, 2, 4] : null);
    drawPointLabels(pnlPoints, pnlLabels, statusColors.green, 24, Math.max(0, animation - 0.08), compactLabels ? [0, 3, 4] : null);

    context.fillStyle = "rgba(238, 248, 255, 0.74)";
    context.font = "700 12px Inter, system-ui, sans-serif";
    context.fillText("Ventas netas", bounds.x, 18);
    context.fillStyle = statusColors.green;
    context.fillText("Resultado P&L", bounds.x + 112, 18);

    context.textAlign = "right";
    context.fillStyle = "rgba(238, 248, 255, 0.84)";
    context.font = "800 16px Inter, system-ui, sans-serif";
    context.fillText("$14.55M · 94.5%", bounds.x + bounds.width, 18);
    context.textAlign = "left";

    context.fillStyle = "rgba(143, 167, 189, 0.9)";
    context.font = "600 11px Inter, system-ui, sans-serif";
    labels.forEach((label, index) => {
      const x = bounds.x + (bounds.width / (labels.length - 1)) * index;
      context.fillText(label, x - 8, h - 18);
    });
  }

  function animate() {
    animation = Math.min(1, animation + 0.018);
    draw();
    if (animation < 1) requestAnimationFrame(animate);
  }

  resize();
  requestAnimationFrame(animate);
  window.addEventListener("resize", resize);
}

function setupGlobeCanvas() {
  const canvas = document.querySelector("#globeCanvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let radius = 0;
  let yaw = (102 * Math.PI) / 180;
  let pitch = (-8 * Math.PI) / 180;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let frame = 0;

  const landmasses = [
    [
      [71, -168],
      [66, -138],
      [57, -124],
      [49, -100],
      [39, -122],
      [31, -112],
      [22, -105],
      [15, -92],
      [9, -82],
      [18, -76],
      [28, -82],
      [43, -74],
      [53, -61],
      [61, -74],
      [69, -96],
      [74, -128]
    ],
    [
      [12, -81],
      [6, -76],
      [-6, -79],
      [-18, -70],
      [-34, -70],
      [-54, -68],
      [-52, -54],
      [-32, -49],
      [-16, -39],
      [-5, -35],
      [5, -52]
    ],
    [
      [72, -10],
      [60, 4],
      [50, -4],
      [43, 2],
      [38, -8],
      [36, 12],
      [45, 28],
      [57, 30],
      [66, 22]
    ],
    [
      [35, -17],
      [28, -6],
      [12, -14],
      [4, 8],
      [-12, 14],
      [-31, 18],
      [-35, 31],
      [-23, 45],
      [-2, 41],
      [15, 34],
      [31, 32],
      [37, 12]
    ],
    [
      [68, 38],
      [58, 58],
      [52, 82],
      [56, 112],
      [43, 135],
      [24, 122],
      [10, 105],
      [6, 78],
      [20, 62],
      [32, 44],
      [45, 36]
    ],
    [
      [8, 95],
      [2, 103],
      [-7, 112],
      [-8, 122],
      [3, 127],
      [16, 121],
      [20, 107]
    ],
    [
      [-11, 113],
      [-24, 116],
      [-38, 125],
      [-40, 144],
      [-28, 154],
      [-16, 145],
      [-12, 130]
    ]
  ];

  const markers = [
    { label: "Mexico", lat: 23.6, lon: -102.5, primary: true },
    { label: "Spain", lat: 40.4, lon: -3.7 },
    { label: "Yucatan", lat: 20.9, lon: -89.6 }
  ];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width || 520;
    height = rect.height || width;
    radius = Math.min(width, height) * 0.39;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function project(lat, lon) {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    const cosLat = Math.cos(latRad);
    const x = cosLat * Math.sin(lonRad);
    const y = Math.sin(latRad);
    const z = cosLat * Math.cos(lonRad);

    const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
    const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
    const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);

    return {
      x: width / 2 + x1 * radius,
      y: height / 2 - y2 * radius,
      z: z2,
      visible: z2 > -0.08
    };
  }

  function drawVisibleLine(points, color, lineWidth = 1) {
    context.beginPath();
    let open = false;
    points.forEach((point) => {
      if (!point.visible) {
        open = false;
        return;
      }
      if (!open) {
        context.moveTo(point.x, point.y);
        open = true;
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
  }

  function drawLand(poly) {
    const projected = poly.map(([lat, lon]) => project(lat, lon));
    if (projected.filter((point) => point.visible).length < 3) return;
    context.beginPath();
    let started = false;
    projected.forEach((point) => {
      if (!point.visible) return;
      if (!started) {
        context.moveTo(point.x, point.y);
        started = true;
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.closePath();
    context.fillStyle = "rgba(141, 162, 176, 0.22)";
    context.strokeStyle = "rgba(204, 218, 226, 0.16)";
    context.lineWidth = 1;
    context.fill();
    context.stroke();
  }

  function draw() {
    frame += 0.012;
    if (!dragging && !reduceMotion) yaw += 0.0012;

    context.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;

    const halo = context.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.55);
    halo.addColorStop(0, "rgba(157, 185, 199, 0.18)");
    halo.addColorStop(0.58, "rgba(201, 169, 106, 0.05)");
    halo.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = halo;
    context.beginPath();
    context.arc(cx, cy, radius * 1.55, 0, Math.PI * 2);
    context.fill();

    const sphere = context.createRadialGradient(cx - radius * 0.32, cy - radius * 0.35, radius * 0.18, cx, cy, radius);
    sphere.addColorStop(0, "rgba(184, 203, 214, 0.34)");
    sphere.addColorStop(0.45, "rgba(38, 55, 72, 0.72)");
    sphere.addColorStop(1, "rgba(5, 9, 15, 0.96)");
    context.fillStyle = sphere;
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.clip();

    for (let lat = -60; lat <= 60; lat += 20) {
      const points = [];
      for (let lon = -180; lon <= 180; lon += 4) points.push(project(lat, lon));
      drawVisibleLine(points, "rgba(219, 229, 235, 0.095)", 0.85);
    }

    for (let lon = -180; lon < 180; lon += 20) {
      const points = [];
      for (let lat = -80; lat <= 80; lat += 3) points.push(project(lat, lon));
      drawVisibleLine(points, "rgba(219, 229, 235, 0.075)", 0.8);
    }

    landmasses.forEach(drawLand);

    markers.forEach((marker) => {
      const point = project(marker.lat, marker.lon);
      if (!point.visible) return;
      const size = marker.primary ? 7.5 + Math.sin(frame * 3) * 1.2 : 4.5;
      context.beginPath();
      context.arc(point.x, point.y, marker.primary ? 24 : 14, 0, Math.PI * 2);
      context.fillStyle = marker.primary ? "rgba(201, 169, 106, 0.15)" : "rgba(157, 185, 199, 0.1)";
      context.fill();
      context.beginPath();
      context.arc(point.x, point.y, size, 0, Math.PI * 2);
      context.fillStyle = marker.primary ? "#c9a96a" : "#9db9c7";
      context.shadowColor = marker.primary ? "rgba(201, 169, 106, 0.72)" : "rgba(157, 185, 199, 0.45)";
      context.shadowBlur = marker.primary ? 24 : 12;
      context.fill();
      context.shadowBlur = 0;
      if (marker.primary) {
        context.font = "700 12px Inter, system-ui, sans-serif";
        context.fillStyle = "rgba(243, 246, 248, 0.86)";
        context.fillText("Mexico", point.x + 16, point.y - 13);
      }
    });

    context.restore();

    context.strokeStyle = "rgba(255, 255, 255, 0.16)";
    context.lineWidth = 1;
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.stroke();

    context.font = "700 11px Inter, system-ui, sans-serif";
    context.fillStyle = "rgba(243, 246, 248, 0.42)";
    context.fillText("GLOBAL OPERATING VIEW", cx - radius, cy + radius + 34);

    requestAnimationFrame(draw);
  }

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    yaw += dx * 0.008;
    pitch = Math.max(-0.85, Math.min(0.85, pitch + dy * 0.006));
    lastX = event.clientX;
    lastY = event.clientY;
  });

  canvas.addEventListener("pointerup", () => {
    dragging = false;
  });

  canvas.addEventListener("pointercancel", () => {
    dragging = false;
  });

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
}

function setupScrollDepth() {
  const beam = document.querySelector(".beam-field");
  const heroTheater = document.querySelector(".hero-theater");
  const sections = Array.from(document.querySelectorAll(".section-shell"));
  let ticking = false;

  function update() {
    ticking = false;
    const offset = window.scrollY * 0.035;
    if (beam) beam.style.transform = `translateY(${offset}px)`;
    if (heroTheater) {
      heroTheater.style.setProperty("--hero-depth", `${Math.max(-52, Math.min(52, window.scrollY * -0.035))}px`);
    }
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const centerDistance = rect.top + rect.height / 2 - window.innerHeight / 2;
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      const depth = Math.max(-36, Math.min(36, centerDistance * -0.018));
      const cinemaDepth = Math.max(-58, Math.min(58, centerDistance * -0.032));
      section.style.setProperty("--depth", `${depth}px`);
      section.style.setProperty("--cinema-depth", `${cinemaDepth}px`);
      section.style.setProperty("--chapter-progress", progress.toFixed(3));
      section.style.setProperty("--chapter-glow", `${Math.round(progress * 120)}px`);
    });
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
  update();
}

renderKpis();
renderDepartments();
renderPulse();
renderInsights();
renderRisks();
renderCommitments();
renderImportantPending();
setupReveal();
setupNavigation();
setupKpiNavigation();
setupMagneticButtons();
setupAmbientCanvas();
setupRevenueChart();
setupGlobeCanvas();
setupScrollDepth();
