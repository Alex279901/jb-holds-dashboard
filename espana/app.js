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
    value: "€8.24M",
    meta: "91.3% vs meta · corte 24 May",
    status: "amber",
    target: "#command",
    points: [1.42, 1.68, 1.87, 1.74, 1.53]
  },
  {
    label: "Resultado P&L",
    value: "€312K",
    meta: "Margen neto 7.4%",
    status: "amber",
    target: "[data-module='finanzas']",
    points: [-48, 62, 98, 104]
  },
  {
    label: "Venta vs meta",
    value: "91.3%",
    meta: "Consolidado Jan-May",
    status: "amber",
    target: "#risks",
    points: [88.2, 92.1, 97.4, 95.8, 91.3]
  },
  {
    label: "Documentos",
    value: "28.3K",
    meta: "Ticket medio SG €142",
    status: "green",
    target: "[data-module='operaciones']",
    points: [5.8, 5.6, 5.7, 5.8, 5.4]
  },
  {
    label: "Rotación SG ESP",
    value: "9.5%",
    meta: "Mayo 2026 · amarillo",
    status: "amber",
    target: "[data-module='rh']",
    points: [9.5, 9.5, 9.5, 9.5, 9.5]
  },
  {
    label: "Expansión ESP",
    value: "5",
    meta: "1 próxima apertura",
    status: "amber",
    target: "[data-module='expansion']",
    points: [2, 2, 1]
  },
  {
    label: "Costo resultado",
    value: "€0.68",
    meta: "€28.4K pauta · 41.8K resultados",
    status: "amber",
    target: "[data-module='marketing']",
    points: [0.71, 0.68]
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
    signal: "Ventas netas acumuladas €8.24M con 91.3% de cumplimiento. P&L Jan-Abr deja €312K neto y margen 7.4%, por debajo del umbral ejecutivo.",
    metrics: [
      ["Ventas netas", "€8.24M"],
      ["Resultado P&L", "€312K"],
      ["Margen neto", "7.4%"]
    ],
    bars: [62, 88, 100, 98, 91],
    visual: {
      title: "P&L Jan-Abr 2026",
      value: "€312K",
      meta: "Resultado neto acumulado · margen 7.4%",
      status: "amber",
      items: [
        ["Ingresos", "€6.69M", "Jan-Abr"],
        ["Gastos", "€6.38M", "control operativo"],
        ["Abril neto", "€104K", "mejor mes"],
        ["Enero", "-€48K", "punto rojo"]
      ],
      stages: [
        ["Ene", "-3.4%", "red", 10],
        ["Feb", "3.7%", "amber", 40],
        ["Mar", "5.2%", "amber", 58],
        ["Abr", "6.0%", "amber", 66]
      ]
    }
  },
  {
    key: "operaciones",
    label: "Operaciones",
    code: "OPS",
    accent: "#7cc9a8",
    accent2: "#9db9c7",
    tone: "Operaciones · ventas diarias ESP por sucursal, documentos y semáforo.",
    signal: "284 mediciones sucursal-día: 142 en verde, 28 en amarillo y 114 en rojo. SG Alameda de Urquijo concentra 68 lecturas rojas y SG Alameda Recalde 46.",
    metrics: [
      ["Documentos", "28.3K"],
      ["Lecturas en rojo", "114"],
      ["Cumplimiento", "91.3%"]
    ],
    bars: [62, 88, 100, 98, 91],
    visual: {
      title: "Semáforo Operativo",
      value: "114",
      meta: "lecturas en rojo de 284 mediciones",
      status: "red",
      items: [
        ["Verdes", "142", "50% lecturas"],
        ["Amarillos", "28", "10% lecturas"],
        ["SG Alameda de Urquijo", "68 lecturas rojas", "principal foco"],
        ["SG Alameda Recalde", "46 lecturas rojas", "seguimiento"]
      ],
      stages: [
        ["Verde", "142", "green", 86],
        ["Amarillo", "28", "amber", 24],
        ["Rojo", "114", "red", 100]
      ]
    }
  },
  {
    key: "marketing",
    label: "Marketing",
    code: "MKT",
    accent: "#9a8fb8",
    accent2: "#9db9c7",
    tone: "Marketing · Meta Ads pagado y social orgánico SG España.",
    signal: "18 campañas pagadas generan 41,800 resultados con €28.4K de pauta y costo por resultado de €0.68. Mayo orgánico suma 980K visualizaciones.",
    metrics: [
      ["Pauta", "€28.4K"],
      ["Resultados", "41.8K"],
      ["Costo result.", "€0.68"]
    ],
    bars: [22, 38, 56, 78, 92, 100, 88, 74],
    visual: {
      title: "Paid + Organic Signal",
      value: "41.8K",
      meta: "resultados pagados · CPR €0.68",
      status: "amber",
      items: [
        ["Gasto Meta", "€28.4K", "18 campañas"],
        ["Impresiones", "2.14M", "paid media"],
        ["Visualizaciones", "980K", "orgánico mayo"],
        ["Activas", "7", "campañas live"]
      ],
      stages: [
        ["SG Alameda Recalde Paid", "€15.2K", "amber", 86],
        ["SG Alameda Urquijo Paid", "€13.2K", "amber", 74],
        ["SG ESP Organic", "980K", "green", 100],
        ["SG ESP Social", "214K", "green", 62]
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
    signal: "SG Alameda Recalde registra 9.5% de rotación en mayo 2026. SG Alameda de Urquijo se mantiene en 6.7%. Corporativo permanece en verde.",
    metrics: [
      ["Rotación Alameda Recalde", "9.5%"],
      ["Rotación Alameda de Urquijo", "6.7%"],
      ["Corporativo ESP", "0.0%"]
    ],
    bars: [9, 6, 0, 9, 6, 0, 9, 6],
    visual: {
      title: "Rotación Mayo 2026",
      value: "9.5%",
      meta: "SG Alameda Recalde · amarillo",
      status: "amber",
      items: [
        ["SG Alameda Recalde", "9.5%", "amarillo"],
        ["SG Alameda de Urquijo", "6.7%", "verde"],
        ["CORP ESP", "0.0%", "verde"]
      ],
      stages: [
        ["SG Alameda Recalde", "9.5%", "amber", 100],
        ["SG Alameda de Urquijo", "6.7%", "green", 70],
        ["CORP ESP", "0.0%", "green", 4]
      ]
    }
  },
  {
    key: "expansion",
    label: "Expansión",
    code: "EXP",
    accent: "#2e86ff",
    accent2: "#c9a96a",
    tone: "Expansión · pipeline ESP con estatus, renta, m2 y contactos.",
    signal: "5 proyectos SG ESP en cartera. 1 próxima apertura identificada y renta conocida por €186K en 3 ubicaciones.",
    metrics: [
      ["Proyectos", "5"],
      ["Prox. apertura", "1"],
      ["Renta conocida", "€186K"]
    ],
    bars: [3, 1, 1],
    visual: {
      title: "Pipeline ESP 2026",
      value: "5",
      meta: "5 SG · pipeline activo",
      status: "amber",
      items: [
        ["Prospección", "3", "top funnel"],
        ["Espera contrato", "1", "legal/comercial"],
        ["Prox. apertura", "1", "SG Getxo"],
        ["Renta conocida", "€186K", "3 ubicaciones"]
      ],
      stages: [
        ["SG", "5", "amber", 100],
        ["Prospección", "3", "amber", 60],
        ["Contrato", "1", "green", 20],
        ["Cierre", "1", "red", 20]
      ]
    }
  },
  {
    key: "administracion",
    label: "Excelencia de Marca",
    code: "BRD",
    accent: "#c46b73",
    accent2: "#c9a96a",
    tone: "Excelencia de Marca · master data España, cobertura y control institucional.",
    signal: "2 marcas activas en España: Santagloria España con 2 sucursales activas y Wetzel Pretzel España en expansión.",
    metrics: [
      ["Marcas", "2"],
      ["Unidades activas", "2"],
      ["Sucursales SG ESP", "2"]
    ],
    bars: [2, 2, 2, 2, 2, 2, 2, 2],
    visual: {
      title: "Master Data Coverage ESP",
      value: "2",
      meta: "marcas activas España",
      status: "green",
      items: [
        ["Santagloria ESP", "2", "Soft Restaurant"],
        ["Wetzel Pretzel ESP", "0", "expansión"],
        ["IN-DEF ESP", "1", "corporativo"]
      ],
      stages: [
        ["SG ESP", "2 activas", "green", 100],
        ["WP ESP", "pipeline", "amber", 34],
        ["CORP ESP", "admin", "green", 50]
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
      ["sg", "Santagloria ESP"],
      ["corp", "Corporativo"]
    ],
    scope: [
      ["Global", "€8.24M", "ventas netas consolidadas"],
      ["Marca", "SG ESP €8.24M", "ventas Jan-May"],
      ["Sucursal", "2 unidades operativas", "SG Alameda Recalde + SG Alameda de Urquijo"],
      ["Detalle", "P&L Jan-Abr", "€312K neto · 7.4% margen"]
    ],
    cardsTitle: "P&L, ventas y margen",
    cards: [
      {
        tags: ["all"],
        title: "JB Holds ESP Consolidado",
        subtitle: "Global · Jan-May ventas / Jan-Abr P&L",
        status: "amber",
        metrics: [["Ventas", "€8.24M"], ["P&L", "€312K"], ["Margen", "7.4%"]]
      },
      {
        tags: ["all", "sg"],
        title: "Santagloria España",
        subtitle: "Marca · 2 sucursales activas",
        status: "amber",
        metrics: [["Ventas", "€8.24M"], ["Meta", "€9.03M"], ["Cumpl.", "91.3%"]]
      },
      {
        tags: ["all", "sg"],
        title: "SG Alameda Recalde",
        subtitle: "Sucursal · P&L Jan-Abr",
        status: "green",
        metrics: [["Ingresos", "€3.84M"], ["Neto", "€186K"], ["Margen", "4.8%"]]
      },
      {
        tags: ["all", "sg"],
        title: "SG Alameda de Urquijo",
        subtitle: "Sucursal · P&L Jan-Abr",
        status: "amber",
        metrics: [["Ingresos", "€2.85M"], ["Neto", "€126K"], ["Margen", "4.4%"]]
      },
      {
        tags: ["all", "corp"],
        title: "IN-DEF Corporativo ESP",
        subtitle: "Corporativo · P&L Jan-Abr",
        status: "green",
        metrics: [["Ingresos", "€0.0M"], ["Neto", "€0K"], ["Margen", "0.0%"]]
      }
    ],
    barsTitle: "Margen neto por periodo",
    bars: [
      { tags: ["all"], label: "Enero", value: "-3.4%", meta: "-€48K neto", status: "red", width: 10 },
      { tags: ["all"], label: "Febrero", value: "3.7%", meta: "€62K neto", status: "amber", width: 40 },
      { tags: ["all"], label: "Marzo", value: "5.2%", meta: "€98K neto", status: "amber", width: 58 },
      { tags: ["all"], label: "Abril", value: "6.0%", meta: "€104K neto", status: "amber", width: 66 }
    ],
    columns: ["Nivel", "Unidad", "KPI", "Valor", "Lectura"],
    rows: [
      { tags: ["all"], status: "amber", cells: ["Global", "JB Holds ESP", "Ventas netas", "€8.24M", "91.3% vs meta"] },
      { tags: ["all"], status: "amber", cells: ["Global", "JB Holds ESP", "P&L", "€312K", "7.4% margen"] },
      { tags: ["all", "sg"], status: "amber", cells: ["Marca", "Santagloria ESP", "Ventas", "€8.24M", "91.3% vs meta"] },
      { tags: ["all", "sg"], status: "green", cells: ["Sucursal", "SG Alameda Recalde", "P&L", "€186K", "4.8% margen"] },
      { tags: ["all", "sg"], status: "amber", cells: ["Sucursal", "SG Alameda de Urquijo", "P&L", "€126K", "4.4% margen"] }
    ],
    notes: ["P&L disponible solo Jan-Abr.", "Moneda: EUR (€). Dataset demo España 2026."]
  },
  operaciones: {
    title: "Desglose operativo",
    meta: "Ventas diarias, documentos, cumplimiento y semáforo por sucursal",
    filters: [
      ["all", "Global"],
      ["sg", "Santagloria ESP"],
      ["red", "Lecturas rojas"]
    ],
    scope: [
      ["Global", "284", "mediciones sucursal-día"],
      ["Marca", "SG ESP 91.3%", "cumplimiento Jan-May"],
      ["Sucursal", "SG Alameda Recalde · SG Alameda de Urquijo", "operación diaria"],
      ["Detalle", "114 rojas", "lecturas bajo umbral operativo"]
    ],
    cardsTitle: "Sucursal performance",
    cards: [
      {
        tags: ["all", "sg"],
        title: "SG Alameda Recalde",
        subtitle: "Sucursal · ventas Jan-May",
        status: "amber",
        metrics: [["Ventas", "€4.62M"], ["Cumpl.", "94.2%"], ["Rojas", "46"]]
      },
      {
        tags: ["all", "sg", "red"],
        title: "SG Alameda de Urquijo",
        subtitle: "Sucursal · ventas Jan-May",
        status: "red",
        metrics: [["Ventas", "€3.62M"], ["Cumpl.", "88.7%"], ["Rojas", "68"]]
      },
      {
        tags: ["all", "sg"],
        title: "Documentos Santagloria ESP",
        subtitle: "Tickets operativos acumulados",
        status: "green",
        metrics: [["Total", "28.3K"], ["SG Alameda Recalde", "16.2K"], ["SG Alameda de Urquijo", "12.1K"]]
      }
    ],
    barsTitle: "Últimas semanas",
    bars: [
      { tags: ["all"], label: "Semana 18", value: "€384K", meta: "92.1% vs meta", status: "amber", width: 68 },
      { tags: ["all"], label: "Semana 19", value: "€426K", meta: "102.4% vs meta", status: "green", width: 84 },
      { tags: ["all"], label: "Semana 20", value: "€398K", meta: "95.7% vs meta", status: "green", width: 76 },
      { tags: ["all", "red"], label: "Semana 21", value: "€362K", meta: "87.1% vs meta", status: "amber", width: 62 }
    ],
    columns: ["Nivel", "Unidad", "Ventas", "Meta", "Operación"],
    rows: [
      { tags: ["all"], status: "amber", cells: ["Global", "JB Holds ESP", "€8.24M", "€9.03M", "91.3% cumplimiento"] },
      { tags: ["all", "sg"], status: "amber", cells: ["Sucursal", "SG Alameda Recalde", "€4.62M", "€4.90M", "46 lecturas rojas"] },
      { tags: ["all", "sg", "red"], status: "red", cells: ["Sucursal", "SG Alameda de Urquijo", "€3.62M", "€4.08M", "68 lecturas rojas"] },
      { tags: ["all", "sg"], status: "green", cells: ["Marca", "Santagloria ESP", "28.3K docs", "2 POS", "Soft Restaurant"] }
    ],
    notes: ["Lectura roja = venta diaria debajo del umbral operativo.", "Dataset demo España 2026."]
  },
  marketing: {
    title: "Desglose marketing",
    meta: "Campañas pagadas, organic social y rendimiento España",
    filters: [
      ["all", "Global"],
      ["sg", "Santagloria ESP"],
      ["active", "Activas"]
    ],
    scope: [
      ["Global", "18 campañas", "€28.4K pauta"],
      ["Marca", "SG ESP €28.4K", "paid media"],
      ["Sucursal", "Sin tracking", "fuente por marca/campaña"],
      ["Detalle", "€0.68 CPR", "41.8K resultados"]
    ],
    cardsTitle: "Paid + Organic",
    cards: [
      {
        tags: ["all", "sg"],
        title: "Santagloria ESP Paid",
        subtitle: "18 campañas · 7 activas",
        status: "amber",
        metrics: [["Gasto", "€28.4K"], ["Resultados", "41.8K"], ["CPR", "€0.68"]]
      },
      {
        tags: ["all", "sg"],
        title: "Santagloria ESP Organic May",
        subtitle: "Instagram + TikTok",
        status: "green",
        metrics: [["Views", "980K"], ["Perfil", "18.4K"], ["Clicks", "7.2K"]]
      }
    ],
    barsTitle: "Campañas por gasto",
    bars: [
      { tags: ["all", "sg", "active"], label: "SG_ESP_BRUNCH_BILBAO", value: "€4.8K", meta: "7,214 resultados", status: "green", width: 100 },
      { tags: ["all", "sg"], label: "SG_ESP_DESAYUNO_REEL", value: "€4.2K", meta: "6,182 resultados", status: "green", width: 88 },
      { tags: ["all", "sg"], label: "SG_ESP_MENU_TARDE", value: "€3.6K", meta: "5,294 resultados", status: "amber", width: 75 },
      { tags: ["all", "sg"], label: "SG_ESP_NAVIDAD_2026", value: "€2.8K", meta: "4,118 resultados", status: "amber", width: 58 }
    ],
    columns: ["Nivel", "Campaña / Marca", "Gasto", "Resultado", "Lectura"],
    rows: [
      { tags: ["all"], status: "amber", cells: ["Global", "Meta Ads ESP", "€28.4K", "41.8K", "€0.68 CPR"] },
      { tags: ["all", "sg"], status: "amber", cells: ["Marca", "Santagloria ESP", "€28.4K", "41.8K", "€0.68 CPR"] },
      { tags: ["all", "sg", "active"], status: "green", cells: ["Campaña", "SG_ESP_BRUNCH_BILBAO", "€4.8K", "7,214", "Activa"] },
      { tags: ["all", "sg"], status: "green", cells: ["Campaña", "SG_ESP_DESAYUNO_REEL", "€4.2K", "6,182", "Activa / eficiente"] }
    ],
    notes: ["Fuente pagada a nivel marca/campaña.", "Dataset demo España 2026."]
  },
  rh: {
    title: "Desglose recursos humanos",
    meta: "Plantilla, altas, bajas y rotación por unidad",
    filters: [
      ["all", "Global"],
      ["sg", "Santagloria ESP"],
      ["corp", "Corporativo"]
    ],
    scope: [
      ["Global", "38 colaboradores", "3 unidades reportadas"],
      ["Marca", "SG ESP 34", "plantilla operativa"],
      ["Sucursal", "2 unidades", "rotación Mayo"],
      ["Detalle", "SG Alameda Recalde 9.5%", "principal seguimiento"]
    ],
    cardsTitle: "Rotación Mayo 2026",
    cards: [
      {
        tags: ["all", "sg"],
        title: "SG Alameda Recalde",
        subtitle: "Sucursal · Mayo 2026",
        status: "amber",
        metrics: [["Plantilla", "21"], ["Bajas", "2"], ["Rotación", "9.5%"]]
      },
      {
        tags: ["all", "sg"],
        title: "SG Alameda de Urquijo",
        subtitle: "Sucursal · Mayo 2026",
        status: "green",
        metrics: [["Plantilla", "13"], ["Bajas", "1"], ["Rotación", "6.7%"]]
      },
      {
        tags: ["all", "corp"],
        title: "IN-DEF Corporativo ESP",
        subtitle: "Oficina corporativa",
        status: "green",
        metrics: [["Plantilla", "4"], ["Bajas", "0"], ["Rotación", "0.0%"]]
      }
    ],
    barsTitle: "Rotación por unidad",
    bars: [
      { tags: ["all", "sg"], label: "SG Alameda Recalde", value: "9.5%", meta: "2 bajas / 21", status: "amber", width: 100 },
      { tags: ["all", "sg"], label: "SG Alameda de Urquijo", value: "6.7%", meta: "1 baja / 13", status: "green", width: 70 },
      { tags: ["all", "corp"], label: "Corporativo ESP", value: "0.0%", meta: "0 bajas / 4", status: "green", width: 4 }
    ],
    columns: ["Nivel", "Unidad", "Plantilla", "Bajas", "Lectura"],
    rows: [
      { tags: ["all", "sg"], status: "amber", cells: ["Sucursal", "SG Alameda Recalde", "21", "2", "9.5% rotación"] },
      { tags: ["all", "sg"], status: "green", cells: ["Sucursal", "SG Alameda de Urquijo", "13", "1", "Estable"] },
      { tags: ["all", "corp"], status: "green", cells: ["Corporativo", "IN-DEF ESP", "4", "0", "Equipo estable"] }
    ],
    notes: ["Rotación tomada de datos Mayo 2026.", "Dataset demo España 2026."]
  },
  expansion: {
    title: "Desglose expansión",
    meta: "Pipeline por ciudad, estatus, renta y obra",
    filters: [
      ["all", "Global"],
      ["sg", "Santagloria ESP"],
      ["hot", "Próxima apertura"]
    ],
    scope: [
      ["Global", "5 proyectos", "pipeline ESP"],
      ["Marca", "5 SG ESP", "mix de expansión"],
      ["Sucursal", "1 próxima apertura", "SG Getxo"],
      ["Detalle", "€186K renta", "3 ubicaciones con dato"]
    ],
    cardsTitle: "Pipeline ejecutivo",
    cards: [
      {
        tags: ["all", "sg", "hot"],
        title: "SG Getxo",
        subtitle: "Bilbao · próxima apertura",
        status: "green",
        metrics: [["Marca", "SG ESP"], ["Renta", "€68K"], ["Plazo", "Q3 2026"]]
      },
      {
        tags: ["all", "sg"],
        title: "SG Gran Vía Madrid",
        subtitle: "Madrid · espera contrato",
        status: "amber",
        metrics: [["M2", "310"], ["Renta", "€78K"], ["Obra", "20 sem."]]
      },
      {
        tags: ["all", "sg"],
        title: "SG Paseo de Gracia",
        subtitle: "Barcelona · prospección",
        status: "amber",
        metrics: [["Marca", "SG ESP"], ["Renta", "€40K"], ["Firma", "Pend."]]
      }
    ],
    barsTitle: "Estatus pipeline",
    bars: [
      { tags: ["all"], label: "Prospección", value: "3", meta: "top funnel", status: "amber", width: 100 },
      { tags: ["all"], label: "Espera contrato", value: "1", meta: "legal/comercial", status: "amber", width: 34 },
      { tags: ["all", "hot"], label: "Próxima apertura", value: "1", meta: "SG Getxo", status: "green", width: 34 }
    ],
    columns: ["Nivel", "Proyecto", "Marca", "Estatus", "Dato clave"],
    rows: [
      { tags: ["all", "sg", "hot"], status: "green", cells: ["Proyecto", "SG Getxo", "SG ESP", "proxima_apertura", "€68K renta"] },
      { tags: ["all", "sg"], status: "amber", cells: ["Proyecto", "SG Gran Vía Madrid", "SG ESP", "espera_contrato", "€78K renta"] },
      { tags: ["all", "sg"], status: "amber", cells: ["Proyecto", "SG Paseo de Gracia", "SG ESP", "prospeccion", "€40K renta"] },
      { tags: ["all", "sg"], status: "amber", cells: ["Proyecto", "SG Bilbao Centro", "SG ESP", "prospeccion", "Null"] },
      { tags: ["all", "sg"], status: "amber", cells: ["Proyecto", "SG Donostia", "SG ESP", "prospeccion", "Null"] }
    ],
    notes: ["Renta conocida por €186K en 3 ubicaciones.", "Los proyectos sin renta mantienen Null hasta siguiente carga."]
  },
  administracion: {
    title: "Desglose excelencia de marca",
    meta: "Master data España, cobertura de fuentes y control institucional",
    filters: [
      ["all", "Global"],
      ["sg", "Santagloria ESP"],
      ["wp", "Wetzel Pretzel ESP"],
      ["corp", "Corporativo"]
    ],
    scope: [
      ["Global", "2 marcas", "master data ESP"],
      ["Marca", "SG ESP · WP ESP", "catálogo"],
      ["Sucursal", "2 unidades activas", "SG Alameda Recalde + SG Alameda de Urquijo"],
      ["Detalle", "dataset demo", "fuentes cargadas al proyecto"]
    ],
    cardsTitle: "Master data",
    cards: [
      {
        tags: ["all", "sg"],
        title: "Santagloria España",
        subtitle: "Restaurante / Cafetería",
        status: "green",
        metrics: [["Sucursales", "2"], ["POS", "Soft"], ["País", "ES"]]
      },
      {
        tags: ["all", "wp"],
        title: "Wetzel Pretzel España",
        subtitle: "Snacks / expansión",
        status: "amber",
        metrics: [["Sucursales", "0"], ["Pipeline", "2"], ["País", "ES"]]
      },
      {
        tags: ["all", "corp"],
        title: "IN-DEF Corporativo ESP",
        subtitle: "Holding / Admin",
        status: "green",
        metrics: [["Unidades", "1"], ["RH", "4"], ["Rol", "Control"]]
      }
    ],
    barsTitle: "Cobertura de fuentes",
    bars: [
      { tags: ["all"], label: "Ventas diarias", value: "284", meta: "filas", status: "green", width: 100 },
      { tags: ["all"], label: "P&L", value: "172", meta: "filas", status: "green", width: 61 },
      { tags: ["all"], label: "Social organic", value: "48", meta: "filas", status: "green", width: 17 },
      { tags: ["all"], label: "Campañas paid", value: "18", meta: "filas", status: "amber", width: 6 }
    ],
    columns: ["Nivel", "Entidad", "Tipo", "Unidades", "Lectura"],
    rows: [
      { tags: ["all", "sg"], status: "green", cells: ["Marca", "Santagloria España", "Restaurante", "2", "operación activa"] },
      { tags: ["all", "wp"], status: "amber", cells: ["Marca", "Wetzel Pretzel España", "Snacks", "0", "pipeline expansión"] },
      { tags: ["all", "corp"], status: "green", cells: ["Unidad", "IN-DEF Corporativo ESP", "Holding/Admin", "1", "control corporativo"] }
    ],
    notes: ["Master data España. Dataset demo 2026.", "Listo para inyección de datos reales."]
  }
};

const pulseAlerts = [
  {
    level: "P1",
    title: "SG Alameda de Urquijo vende 88.7% vs meta",
    copy: "Mayo 2026 queda en rojo: €321.4K contra meta de €362.3K. Gap operativo de ventas.",
    owner: "DIR_OPS / SG ESP",
    status: "red"
  },
  {
    level: "P1",
    title: "Margen neto ESP bajo umbral ejecutivo",
    copy: "P&L Jan-Abr registra margen acumulado de 7.4%. El umbral ejecutivo es 10%. Tendencia al alza desde enero.",
    owner: "DIR_FIN ESP",
    status: "amber"
  },
  {
    level: "P2",
    title: "Rotación SG Alameda Recalde en amarillo",
    copy: "9.5% de rotación en mayo 2026: 2 bajas sobre 21 colaboradores. Requiere seguimiento.",
    owner: "DIR_RH / SG ESP",
    status: "amber"
  },
  {
    level: "P2",
    title: "Pipeline de expansión ESP exige cadencia",
    copy: "5 proyectos SG ESP en cartera. SG Getxo es próxima apertura. Tres proyectos en prospección sin fecha.",
    owner: "DIR_EXP ESP",
    status: "amber"
  },
  {
    level: "P2",
    title: "CPR Meta Ads ESP por optimizar",
    copy: "18 campañas activas con CPR de €0.68. Margen de mejora detectado en campañas nocturnas.",
    owner: "DIR_MKT ESP",
    status: "amber"
  }
];

const insights = [
  {
    tag: "Ventas",
    title: "91.3% vs meta",
    bullets: ["€8.24M ventas netas acumuladas", "Meta acumulada €9.03M", "Mayo cierra en 87.1% consolidado"],
    action: "Recuperar SG Alameda de Urquijo",
    status: "amber"
  },
  {
    tag: "Sucursal",
    title: "SG Alameda Recalde 94.2%",
    bullets: ["Mejor rendimiento de la red ESP", "€4.62M Jan-May 2026", "Cumplimiento por encima de la red"],
    action: "Replicar modelo comercial",
    status: "green"
  },
  {
    tag: "Marketing",
    title: "€0.68 CPR",
    bullets: ["18 campañas Meta Ads ESP", "€28.4K gasto total", "41.8K resultados · 2.14M impresiones"],
    action: "Optimizar campañas nocturnas",
    status: "amber"
  },
  {
    tag: "Expansión",
    title: "5 proyectos ESP",
    bullets: ["5 SG España en pipeline", "1 próxima apertura: SG Getxo", "Renta conocida €186K en 3 ubicaciones"],
    action: "Priorizar cierre SG Gran Vía",
    status: "amber"
  }
];

const risks = [
  {
    title: "SG Alameda de Urquijo por debajo de meta",
    copy: "Venta vs meta de 88.7% en mayo 2026. Requiere plan comercial inmediato.",
    meta: ["Ventas", "€321.4K", "Rojo"],
    status: "red"
  },
  {
    title: "Margen neto acumulado ESP bajo umbral",
    copy: "P&L real Jan-Abr cierra con 7.4% de margen neto. El umbral ejecutivo marca alerta por debajo de 10%.",
    meta: ["Finanzas", "€312K", "7.4%"],
    status: "amber"
  },
  {
    title: "Rotación SG Alameda Recalde en amarillo",
    copy: "9.5% de rotación en mayo 2026. 2 bajas sobre 21 colaboradores. Sin supervisor cubierto.",
    meta: ["RH", "Mayo 2026", "Amarillo"],
    status: "amber"
  },
  {
    title: "Pipeline expansión ESP sin cadencia definida",
    copy: "3 de 5 proyectos en prospección sin fecha objetivo. Riesgo de dilución del pipeline.",
    meta: ["Expansión", "5 proyectos", "Seguimiento"],
    status: "amber"
  }
];

const commitments = [];

const importantPending = [
  {
    lane: "Prioridad alta",
    title: "Definir POS para nuevas sucursales ESP",
    owner: "Dirección / Operaciones",
    due: "Confirmar Soft Restaurant u alternativa antes de firma de contratos",
    progress: 20,
    status: "amber"
  },
  {
    lane: "Prioridad alta",
    title: "Homologar nomenclatura de sucursales ESP",
    owner: "Dirección / Data",
    due: "Aplicar códigos SG-ESP-XXX en todos los sistemas",
    progress: 10,
    status: "amber"
  },
  {
    lane: "Riesgo operativo",
    title: "Activar reporting mensual automático ESP",
    owner: "Data / Administración",
    due: "Conectar fuentes ESP a pipeline de reportes existente",
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
  const revenue = [1.42, 1.68, 1.87, 1.74, 1.53];
  const pnlNet = [-0.048, 0.062, 0.098, 0.104, 0.104];
  const revenueLabels = ["€1.42M", "€1.68M", "€1.87M", "€1.74M", "€1.53M"];
  const pnlLabels = ["-€48K", "€62K", "€98K", "€104K", "Sin corte"];
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
    { label: "España", lat: 40.4, lon: -3.7, primary: true },
    { label: "Bilbao", lat: 43.3, lon: -2.9 },
    { label: "Barcelona", lat: 41.4, lon: 2.2 }
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
