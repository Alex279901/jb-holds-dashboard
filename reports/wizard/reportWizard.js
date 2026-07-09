// ─── reportWizard.js — Centro de Reportes Corporativo ────────────────────────
//
// Wizard de 4 pasos para configurar y generar reportes ejecutivos.
// Es la única interfaz de captura de parámetros del Report Engine.
//
// PRINCIPIO: el wizard NO es fuente de datos. Solo captura parámetros.
// Toda la información del reporte proviene de Supabase via api/report-data.js.
//
// Pasos:
//   1. Tipo de reporte
//   2. Alcance (franquicia · países · sucursales · periodo · consolidación)
//   3. Módulos (desde ModuleRegistry + perfil; sin hardcoding)
//   4. Revisión y generación
//
// Produce un reportConfig completo:
//   {
//     holding, brand, countries[], stores[], storesByCountry{},
//     dateRange: { anio, mes },
//     reportType, consolidationMode,
//     exchangeRate (solo modo financiero),
//     selectedModules[]
//   }
//
// STORE_CATALOG:
//   Datos verificados de catalogo_sucursales en Supabase.
//   TODO Pre-M3.5: reemplazar con llamada a /api/stores al abrir el wizard.
//   El catálogo estático permanece como fallback mientras ese endpoint no exista.

window.ReportWizard = (function () {

  // ── Catálogo de franquicias, países y sucursales ─────────────────────────────
  // Estructura: { franquicia: { país: [sucursales] } }
  // TODO: cargar dinámicamente desde /api/stores
  const STORE_CATALOG = {
    "Santa Gloria": {
      "México": ["SG Altabrisa", "SG La Isla", "SG Paseo Montejo"],
      "España": [
        "SG Alameda de Urquijo", "SG Alameda Recalde 31", "SG Alcalá 164",
        "SG Alcalá 244", "SG Antonio López", "SG Atocha 84", "SG Autonomía",
        "SG Av Ciudad de Barcelona 77", "SG Av Sancho el Sabio 26",
        "SG CC Bilbao Intermodal", "SG CC Paseo del Mar", "SG Correos",
        "SG Easo 73", "SG Iparraguirre 11", "SG López de Hoyos 126",
        "SG Málaga", "SG Moraleja Green", "SG Moraleja Green 2",
        "SG Pedro Teixeira 7", "SG Puente Deusto 13",
      ],
    },
    "Allô Mon Coco": {
      "México": ["AMC DAM"],
    },
  };

  // Moneda por país — fuente: catalogo_sucursales.moneda
  const COUNTRY_CURRENCY = { "México": "MXN", "España": "EUR" };

  // Tipos de reporte disponibles
  const REPORT_TYPES = [
    {
      id:          "mensual_sucursal",
      label:       "Mensual por Sucursal",
      description: "Ventas, productos, costos y conclusiones de un mes completo.",
      implemented: true,
    },
    {
      id:          "semanal_red",
      label:       "Semanal (Red)",
      description: "Ventas semanales de toda la red de sucursales por país.",
      implemented: false,
    },
    {
      id:          "semanal_ejecutivo_comite",
      label:       "Semanal Comité Ejecutivo",
      description: "Indicadores, alertas y recomendaciones para dirección.",
      implemented: false,
    },
    {
      id:          "semestral_consolidado",
      label:       "Semestral Consolidado",
      description: "Balance semestral con capítulo especial del mes de cierre.",
      implemented: false,
    },
    {
      id:          "anual_historico",
      label:       "Anual Histórico",
      description: "Análisis completo del año con evolución y tendencias.",
      implemented: false,
    },
  ];

  const MESES = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ];

  // ── Estado interno del wizard ────────────────────────────────────────────────
  let _state = null;

  function resetState(initialValues) {
    const now = new Date();
    const defaultBrand   = Object.keys(STORE_CATALOG)[0] || "";
    const defaultCountry = Object.keys(STORE_CATALOG[defaultBrand] || {})[0] || "";

    _state = {
      step:    1,
      // Tipo de reporte
      reportType: "mensual_sucursal",
      // Alcance
      brand:      initialValues?.brand   || defaultBrand,
      countries:  initialValues?.countries || (defaultCountry ? [defaultCountry] : []),
      stores:     initialValues?.stores  || [],
      // storesByCountry: { "México": ["SG Altabrisa", ...], "España": [...] }
      storesByCountry: initialValues?.storesByCountry || {},
      // Periodo
      anio:       initialValues?.dateRange?.anio || now.getFullYear(),
      mes:        initialValues?.dateRange?.mes  || (now.getMonth() + 1),
      // Consolidación
      consolidationMode: initialValues?.consolidationMode || "operativa",
      // Módulos — se inicializa en paso 3
      selectedModules: null,
    };

    // Asegurar que los países seleccionados existan en el catálogo de la marca
    const availableCountries = Object.keys(STORE_CATALOG[_state.brand] || {});
    _state.countries = _state.countries.filter(c => availableCountries.includes(c));

    // Si no hay países seleccionados, seleccionar el primero
    if (!_state.countries.length && availableCountries.length) {
      _state.countries = [availableCountries[0]];
    }

    _syncStoresByCountry();
  }

  // Sincroniza storesByCountry con los países actualmente seleccionados
  function _syncStoresByCountry() {
    const next = {};
    for (const country of _state.countries) {
      const available = STORE_CATALOG[_state.brand]?.[country] || [];
      // Preservar selección previa si existe; sino, seleccionar todas
      const prev = _state.storesByCountry?.[country];
      next[country] = prev?.length ? prev.filter(s => available.includes(s)) : available.slice();
    }
    _state.storesByCountry = next;
    // Stores plano (para compatibilidad con la UI de revisión)
    _state.stores = Object.values(next).flat();
  }

  // ── Inyección del HTML ───────────────────────────────────────────────────────
  function injectDOM() {
    if (document.getElementById("reportWizard")) return;

    const html = `
      <div id="reportWizard" role="dialog" aria-modal="true" aria-labelledby="rw-title">
        <div class="rw-dialog">
          <div class="rw-header">
            <div class="rw-header-text">
              <div class="rw-brand">INDEF · Centro de Reportes</div>
              <div class="rw-title" id="rw-title">Generar Reporte Ejecutivo</div>
            </div>
            <button class="rw-close" id="rwClose" aria-label="Cerrar">✕</button>
          </div>
          <div class="rw-steps" id="rwSteps"></div>
          <div class="rw-divider"></div>
          <div class="rw-body" id="rwBody"></div>
          <div class="rw-footer">
            <div class="rw-footer-left">
              <button class="rw-btn rw-btn-ghost" id="rwCancel">Cancelar</button>
            </div>
            <div class="rw-footer-right">
              <button class="rw-btn rw-btn-secondary" id="rwPrev" style="display:none">← Anterior</button>
              <button class="rw-btn rw-btn-primary"   id="rwNext">Siguiente →</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
    bindEvents();
  }

  // ── Eventos ──────────────────────────────────────────────────────────────────
  function bindEvents() {
    document.getElementById("rwClose") .addEventListener("click", close);
    document.getElementById("rwCancel").addEventListener("click", close);
    document.getElementById("rwPrev")  .addEventListener("click", prevStep);
    document.getElementById("rwNext")  .addEventListener("click", nextStep);

    document.getElementById("reportWizard").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const w = document.getElementById("reportWizard");
        if (w?.classList.contains("visible")) close();
      }
    });
  }

  // ── Navegación ───────────────────────────────────────────────────────────────
  function nextStep() {
    if (!validateCurrentStep()) return;
    if (_state.step < 4) { _state.step++; render(); }
    else generate();
  }

  function prevStep() {
    if (_state.step > 1) { _state.step--; render(); }
  }

  function validateCurrentStep() {
    clearError();

    if (_state.step === 1) {
      if (!_state.reportType) { showError("Selecciona un tipo de reporte."); return false; }
      if (!window.ReportProfiles?.[_state.reportType]) {
        showError("Este tipo de reporte no está disponible todavía."); return false;
      }
    }

    if (_state.step === 2) {
      if (!_state.brand)           { showError("Selecciona una franquicia."); return false; }
      if (!_state.countries.length){ showError("Selecciona al menos un país."); return false; }
      if (!_state.stores.length)   { showError("Selecciona al menos una sucursal."); return false; }
      if (!_state.mes || !_state.anio) { showError("Selecciona el periodo."); return false; }
    }

    if (_state.step === 3) {
      const profile  = window.ReportProfiles?.[_state.reportType] || {};
      const required = profile.requiredModules || [];
      const current  = _state.selectedModules || [];
      const missing  = required.filter(id => !current.includes(id));
      if (missing.length) {
        const labels = missing.map(id => window.ModuleRegistry?.get(id)?.label || id).join(", ");
        showError(`Módulos obligatorios: ${labels}`);
        return false;
      }
      if (!current.length) { showError("Selecciona al menos un módulo."); return false; }
    }

    return true;
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  function render() {
    renderStepIndicator();
    renderBody();
    renderFooter();
    clearError();
  }

  function renderStepIndicator() {
    const labels    = ["Tipo", "Alcance", "Módulos", "Generar"];
    const container = document.getElementById("rwSteps");
    container.innerHTML = labels.map((lbl, i) => {
      const n     = i + 1;
      const done  = _state.step > n;
      const active= _state.step === n;
      const cls   = done ? "done" : active ? "active" : "";
      const icon  = done ? "✓" : String(n);
      const line  = i < labels.length - 1
        ? `<div class="rw-step-line ${done ? "done" : ""}"></div>` : "";
      return `<div class="rw-step ${cls}" data-step="${n}">
        <div class="rw-step-dot">${icon}</div>
        <div class="rw-step-label">${lbl}</div>
      </div>${line}`;
    }).join("");
  }

  function renderBody() {
    const body = document.getElementById("rwBody");
    body.innerHTML = "";
    if (_state.step === 1) body.innerHTML = buildStep1();
    if (_state.step === 2) body.innerHTML = buildStep2();
    if (_state.step === 3) body.innerHTML = buildStep3();
    if (_state.step === 4) body.innerHTML = buildStep4();
    attachStepListeners();
  }

  function renderFooter() {
    const prev = document.getElementById("rwPrev");
    const next = document.getElementById("rwNext");
    prev.style.display = _state.step > 1 ? "flex" : "none";
    next.disabled      = false;
    next.textContent   = _state.step === 4 ? "⬇ Generar Reporte" : "Siguiente →";
  }

  // ── PASO 1 — Tipo de Reporte ─────────────────────────────────────────────────
  function buildStep1() {
    const cards = REPORT_TYPES.map(t => {
      const sel  = _state.reportType === t.id && t.implemented ? "selected" : "";
      const soon = !t.implemented ? "rw-soon" : "";
      const badge= !t.implemented ? `<span class="rw-soon-badge">Próximamente</span>` : "";
      return `
        <div class="rw-type-card ${sel} ${soon}" data-type="${t.id}">
          ${badge}
          <div class="rw-type-card-label">${t.label}</div>
          <div class="rw-type-card-desc">${t.description}</div>
        </div>
      `;
    }).join("");

    return `
      <div class="rw-step-title">¿Qué tipo de reporte necesitas?</div>
      <div class="rw-step-desc">El tipo de reporte determina las secciones disponibles y el alcance del análisis.</div>
      <div class="rw-type-grid">${cards}</div>
    `;
  }

  // ── PASO 2 — Alcance ─────────────────────────────────────────────────────────
  function buildStep2() {
    // Franquicia
    const brandOpts = Object.keys(STORE_CATALOG).map(b =>
      `<option value="${b}" ${b === _state.brand ? "selected" : ""}>${b}</option>`
    ).join("");

    // Países disponibles para la franquicia seleccionada
    const availableCountries = Object.keys(STORE_CATALOG[_state.brand] || {});
    const countryChecks = availableCountries.map(c => {
      const chk = _state.countries.includes(c) ? "checked" : "";
      const currency = COUNTRY_CURRENCY[c] || "";
      return `
        <label class="rw-country-item">
          <input type="checkbox" name="rw-country" value="${c}" ${chk}>
          <span>${c}</span>
          <span class="rw-currency-badge">${currency}</span>
        </label>
      `;
    }).join("");

    // Sucursales agrupadas por país
    let storeListHTML = "";
    for (const country of _state.countries) {
      const available = STORE_CATALOG[_state.brand]?.[country] || [];
      if (!available.length) continue;
      const selected  = _state.storesByCountry?.[country] || [];

      storeListHTML += `<div class="rw-store-group">`;
      storeListHTML += `<div class="rw-store-group-header">
        <span>${country}</span>
        <div class="rw-store-group-actions">
          <button class="rw-store-action-btn" data-action="all" data-country="${country}">Todas</button>
          <button class="rw-store-action-btn" data-action="none" data-country="${country}">Ninguna</button>
        </div>
      </div>`;

      storeListHTML += available.map(s => {
        const chk = selected.includes(s) ? "checked" : "";
        return `
          <label class="rw-store-item">
            <input type="checkbox" name="rw-store" data-country="${country}" value="${s}" ${chk}>
            <span>${s}</span>
          </label>
        `;
      }).join("");

      storeListHTML += `</div>`;
    }

    if (!_state.countries.length) {
      storeListHTML = `<div class="rw-store-empty">Selecciona al menos un país para ver las sucursales.</div>`;
    }

    // Periodo
    const currentYear = new Date().getFullYear();
    const yearOpts    = Array.from({ length: 4 }, (_, i) => currentYear - i)
      .map(y => `<option value="${y}" ${y === _state.anio ? "selected" : ""}>${y}</option>`)
      .join("");
    const monthOpts   = MESES.map((m, i) => {
      const v = i + 1;
      return `<option value="${v}" ${v === _state.mes ? "selected" : ""}>${m}</option>`;
    }).join("");

    // Consolidación (solo visible cuando hay más de un país seleccionado)
    const multiCountry      = _state.countries.length > 1;
    const consolidationHTML = multiCountry ? `
      <div class="rw-section-label">Consolidación</div>
      <div class="rw-consolidation-options">
        <label class="rw-consolidation-option ${_state.consolidationMode === "operativa" ? "selected" : ""}">
          <input type="radio" name="rw-consolidation" value="operativa"
            ${_state.consolidationMode === "operativa" ? "checked" : ""}>
          <div class="rw-consolidation-text">
            <div class="rw-consolidation-label">Operativa <span class="rw-consolidation-default">(por defecto)</span></div>
            <div class="rw-consolidation-desc">Los KPIs financieros permanecen separados por moneda. Los KPIs relativos (cumplimiento%, labor%, renta%) sí se comparan.</div>
          </div>
        </label>
        <label class="rw-consolidation-option ${_state.consolidationMode === "financiera" ? "selected" : ""}">
          <input type="radio" name="rw-consolidation" value="financiera"
            ${_state.consolidationMode === "financiera" ? "checked" : ""}>
          <div class="rw-consolidation-text">
            <div class="rw-consolidation-label">Financiera <span class="rw-consolidation-soon">Próximamente</span></div>
            <div class="rw-consolidation-desc">Consolida ventas usando tipo de cambio. El reporte indicará la fuente y fecha del tipo de cambio utilizado.</div>
          </div>
        </label>
      </div>
    ` : "";

    // Monedas involucradas
    const currencies = [...new Set(_state.countries.map(c => COUNTRY_CURRENCY[c]).filter(Boolean))];
    const monedaInfo = currencies.length > 1
      ? `<div class="rw-currency-note">Este reporte incluye ${currencies.join(" + ")}. Los datos financieros se presentarán separados por moneda.</div>`
      : currencies.length === 1
        ? `<div class="rw-field"><label>Moneda</label><div class="rw-currency-pill">${currencies[0]}</div></div>`
        : "";

    return `
      <div class="rw-step-title">Configura el alcance del reporte</div>
      <div class="rw-step-desc">Define la franquicia, los países, las sucursales y el periodo a analizar.</div>

      <div class="rw-section-label">Franquicia</div>
      <div class="rw-field">
        <select id="rw-brand">${brandOpts}</select>
      </div>

      <div class="rw-section-label">País / Cobertura</div>
      <div class="rw-country-list" id="rw-country-list">${countryChecks}</div>

      <div class="rw-section-label">Sucursales</div>
      <div class="rw-store-list" id="rw-store-list">${storeListHTML}</div>

      <div class="rw-section-label">Periodo</div>
      <div class="rw-row rw-row-3">
        <div class="rw-field">
          <label>Mes</label>
          <select id="rw-mes">${monthOpts}</select>
        </div>
        <div class="rw-field">
          <label>Año</label>
          <select id="rw-anio">${yearOpts}</select>
        </div>
        ${monedaInfo}
      </div>

      ${consolidationHTML}
    `;
  }

  // ── PASO 3 — Módulos ─────────────────────────────────────────────────────────
  function buildStep3() {
    const registry = window.ModuleRegistry;
    const profile  = window.ReportProfiles?.[_state.reportType];

    if (!registry || !profile) {
      return `<div class="rw-step-title">Error: perfil no disponible.</div>`;
    }

    const required  = new Set(profile.requiredModules  || []);
    const defaults  = new Set(profile.defaultModules   || []);
    const available = new Set(profile.availableModules || []);
    const allIds    = new Set([...required, ...defaults, ...available]);

    if (!_state.selectedModules) {
      _state.selectedModules = [...required, ...defaults];
    }
    const selected = new Set(_state.selectedModules);
    const grouped  = registry.byGroup(_state.reportType);

    let html = `
      <div class="rw-step-title">Selecciona los módulos del reporte</div>
      <div class="rw-step-desc">Los módulos obligatorios no pueden desactivarse.</div>
    `;

    for (const [group, modules] of Object.entries(grouped)) {
      const inProfile = modules.filter(m => allIds.has(m.id));
      if (!inProfile.length) continue;

      html += `<div class="rw-section-label">${group}</div><div class="rw-module-grid">`;

      inProfile.forEach(m => {
        const isRequired = required.has(m.id);
        const isSoon     = !m.implemented;
        const isChecked  = selected.has(m.id) || isRequired;
        html += `
          <label class="rw-module-item ${isRequired ? "rw-module-locked" : isSoon ? "rw-module-soon" : ""}" data-module="${m.id}">
            <input type="checkbox" name="rw-module" value="${m.id}"
              ${isChecked ? "checked" : ""} ${(isRequired || isSoon) ? "disabled" : ""}>
            <div class="rw-module-text">
              <div class="rw-module-label">${m.label}</div>
              <div class="rw-module-desc">${m.description}</div>
            </div>
            ${isRequired ? `<span class="rw-module-locked-icon">🔒</span>` : ""}
            ${isSoon     ? `<span class="rw-module-soon-badge">Próximamente</span>` : ""}
          </label>
        `;
      });

      html += `</div>`;
    }

    return html;
  }

  // ── PASO 4 — Revisión ────────────────────────────────────────────────────────
  function buildStep4() {
    const registry  = window.ModuleRegistry;
    const typeLabel = REPORT_TYPES.find(t => t.id === _state.reportType)?.label || _state.reportType;
    const mesLabel  = MESES[(_state.mes || 1) - 1] || "";

    const implementedCount = (_state.selectedModules || []).filter(id => {
      const m = registry?.get(id);
      return m?.implemented && typeof m.sectionFn === "function";
    }).length;

    const moduleChips = (_state.selectedModules || []).map(id => {
      const mod = registry?.get(id);
      return mod ? `<span class="rw-review-chip">${mod.label}</span>` : "";
    }).join("");

    const currencies = [...new Set(_state.countries.map(c => COUNTRY_CURRENCY[c]).filter(Boolean))];
    const monedaStr  = currencies.length > 1
      ? `${currencies.join(" + ")} · Consolidación ${_state.consolidationMode}`
      : (currencies[0] || "—");

    // Resumen de sucursales por país
    const storesSummary = _state.countries.map(country => {
      const list = _state.storesByCountry?.[country] || [];
      return `${country}: ${list.length} sucursal${list.length !== 1 ? "es" : ""}`;
    }).join(" · ");

    return `
      <div class="rw-step-title">Revisa la configuración del reporte</div>
      <div class="rw-step-desc">Confirma los parámetros. El reporte consultará Supabase directamente.</div>

      <div class="rw-review-block">
        <div class="rw-review-row">
          <span class="rw-review-key">Tipo de Reporte</span>
          <span class="rw-review-val">${typeLabel}</span>
        </div>
        <div class="rw-review-row">
          <span class="rw-review-key">Franquicia</span>
          <span class="rw-review-val">${_state.brand}</span>
        </div>
        <div class="rw-review-row">
          <span class="rw-review-key">Cobertura</span>
          <span class="rw-review-val">${_state.countries.join(" + ")}</span>
        </div>
        <div class="rw-review-row">
          <span class="rw-review-key">Sucursales</span>
          <span class="rw-review-val">${storesSummary}</span>
        </div>
        <div class="rw-review-row">
          <span class="rw-review-key">Periodo</span>
          <span class="rw-review-val">${mesLabel} ${_state.anio}</span>
        </div>
        <div class="rw-review-row">
          <span class="rw-review-key">Moneda</span>
          <span class="rw-review-val">${monedaStr}</span>
        </div>
        <div class="rw-review-row">
          <span class="rw-review-key">Módulos</span>
          <span class="rw-review-val">${(_state.selectedModules || []).length} seleccionados · ${implementedCount} disponibles</span>
        </div>
      </div>

      <div class="rw-review-block">
        <div class="rw-review-modules">${moduleChips}</div>
      </div>

      <div class="rw-progress" id="rwProgress">
        <div class="rw-spinner"></div>
        <span id="rwProgressText">Iniciando…</span>
      </div>
      <div class="rw-error" id="rwError"></div>
    `;
  }

  // ── Listeners del paso actual ─────────────────────────────────────────────────
  function attachStepListeners() {
    if (_state.step === 1) {
      document.querySelectorAll(".rw-type-card:not(.rw-soon)").forEach(card => {
        card.addEventListener("click", () => {
          _state.reportType    = card.dataset.type;
          _state.selectedModules = null;
          document.querySelectorAll(".rw-type-card").forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
        });
      });
    }

    if (_state.step === 2) {
      // Cambio de franquicia
      document.getElementById("rw-brand")?.addEventListener("change", (e) => {
        _state.brand           = e.target.value;
        const firstCountry     = Object.keys(STORE_CATALOG[_state.brand] || {})[0] || "";
        _state.countries       = firstCountry ? [firstCountry] : [];
        _state.storesByCountry = {};
        _syncStoresByCountry();
        renderBody();
      });

      // Cambio de países (checkboxes)
      document.querySelectorAll('input[name="rw-country"]').forEach(cb => {
        cb.addEventListener("change", () => {
          _state.countries = [...document.querySelectorAll('input[name="rw-country"]:checked')]
            .map(c => c.value);
          _syncStoresByCountry();
          renderBody();
        });
      });

      // Cambio de sucursales individuales
      document.querySelectorAll('input[name="rw-store"]').forEach(cb => {
        cb.addEventListener("change", () => {
          const country = cb.dataset.country;
          if (!country) return;
          _state.storesByCountry[country] = [
            ...document.querySelectorAll(`input[name="rw-store"][data-country="${country}"]:checked`)
          ].map(c => c.value);
          _state.stores = Object.values(_state.storesByCountry).flat();
        });
      });

      // Botones "Todas" / "Ninguna" por país
      document.querySelectorAll('[data-action="all"],[data-action="none"]').forEach(btn => {
        btn.addEventListener("click", () => {
          const country = btn.dataset.country;
          const action  = btn.dataset.action;
          const cbs     = document.querySelectorAll(`input[name="rw-store"][data-country="${country}"]`);
          cbs.forEach(cb => { cb.checked = action === "all"; });
          const available = STORE_CATALOG[_state.brand]?.[country] || [];
          _state.storesByCountry[country] = action === "all" ? available.slice() : [];
          _state.stores = Object.values(_state.storesByCountry).flat();
        });
      });

      // Periodo
      document.getElementById("rw-mes") ?.addEventListener("change", (e) => { _state.mes  = parseInt(e.target.value, 10); });
      document.getElementById("rw-anio")?.addEventListener("change", (e) => { _state.anio = parseInt(e.target.value, 10); });

      // Consolidación
      document.querySelectorAll('input[name="rw-consolidation"]').forEach(r => {
        r.addEventListener("change", (e) => {
          // Modo financiero deshabilitado en Pre-M3 — ignorar selección
          if (e.target.value === "financiera") {
            e.target.checked = false;
            document.querySelector('input[name="rw-consolidation"][value="operativa"]').checked = true;
            _state.consolidationMode = "operativa";
            return;
          }
          _state.consolidationMode = e.target.value;
          document.querySelectorAll(".rw-consolidation-option").forEach(el => {
            el.classList.toggle("selected", el.querySelector("input").value === _state.consolidationMode);
          });
        });
      });
    }

    if (_state.step === 3) {
      document.querySelectorAll('input[name="rw-module"]').forEach(cb => {
        cb.addEventListener("change", () => {
          const required = new Set(window.ReportProfiles?.[_state.reportType]?.requiredModules || []);
          _state.selectedModules = [
            ...required,
            ...[...document.querySelectorAll('input[name="rw-module"]:checked')]
              .map(c => c.value)
              .filter(id => !required.has(id)),
          ];
        });
      });
    }
  }

  // ── Generación ───────────────────────────────────────────────────────────────
  async function generate() {
    setGenerating(true);
    clearError();

    // reportConfig completo — el contrato oficial con el Report Engine
    const reportConfig = {
      // Holding e identidad
      holding:          "INDEF",
      brand:            _state.brand,
      // Cobertura
      countries:        _state.countries,
      storesByCountry:  _state.storesByCountry,
      stores:           _state.stores,
      // Compatibilidad con módulos M1 que aún leen params.sucursales
      sucursales:       _state.stores,
      // Periodo
      dateRange: {
        anio: _state.anio,
        mes:  _state.mes,
      },
      // Compat legacy (módulos M1 leen params.anio / params.mes directamente)
      anio: _state.anio,
      mes:  _state.mes,
      // Tipo de reporte
      reportType:       _state.reportType,
      // Consolidación
      consolidationMode: _state.consolidationMode,
      exchangeRate:     null,   // TODO M-financiero: capturar en paso 2 modo financiero
      baseCurrency:     null,
      // Módulos
      selectedModules:  _state.selectedModules || [],
      // Campos de compat que secciones M1 leen
      marca:   _state.brand,
      country: _state.countries[0] || "",
      currency: COUNTRY_CURRENCY[_state.countries[0]] || "MXN",
    };

    await window.ReportEngine.run(reportConfig, {
      onProgress: (msg) => setProgress(true, msg),
      onError:    (msg) => {
        showError(`Error: ${msg}`);
        setProgress(false);
        setGenerating(false);
      },
      onComplete: (fileName) => {
        setProgress(false);
        setGenerating(false);
        close();
        if (typeof showToast === "function") showToast(`Reporte descargado: ${fileName}`);
      },
    });
  }

  // ── Helpers de estado UI ──────────────────────────────────────────────────────
  function setProgress(visible, text) {
    const el  = document.getElementById("rwProgress");
    const txt = document.getElementById("rwProgressText");
    if (!el) return;
    el.classList.toggle("visible", visible);
    if (txt && text) txt.textContent = text;
  }

  function showError(msg) {
    const el = document.getElementById("rwError");
    if (!el) return;
    el.classList.add("visible");
    el.textContent = msg;
  }

  function clearError() {
    const el = document.getElementById("rwError");
    if (el) { el.classList.remove("visible"); el.textContent = ""; }
  }

  function setGenerating(yes) {
    const next   = document.getElementById("rwNext");
    const prev   = document.getElementById("rwPrev");
    const cancel = document.getElementById("rwCancel");
    const cls    = document.getElementById("rwClose");
    if (next) {
      next.disabled  = yes;
      next.innerHTML = yes
        ? '<span class="rw-spinner" style="width:12px;height:12px;border:2px solid rgba(7,10,15,0.3);border-top-color:#070a0f;"></span> Generando…'
        : "⬇ Generar Reporte";
    }
    if (prev)   prev.disabled   = yes;
    if (cancel) cancel.disabled = yes;
    if (cls)    cls.disabled    = yes;
  }

  // ── API pública ───────────────────────────────────────────────────────────────
  function open(initialValues) {
    injectDOM();
    resetState(initialValues || {});
    render();
    document.getElementById("reportWizard").classList.add("visible");
  }

  function close() {
    const w = document.getElementById("reportWizard");
    if (w) w.classList.remove("visible");
  }

  return { open, close };

})();
