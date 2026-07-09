// [DEPRECATED — Pre-M3]
// Este archivo NO se carga. Removido de indef/index.html en Pre-M3.
// Reemplazado por: reports/wizard/reportWizard.js
// Conservado únicamente como referencia histórica. Puede eliminarse en M3.

window.ReportModal = (function () {
  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  // ── Inyectar el HTML del modal en el DOM ────────────────────────────────────
  function injectModal() {
    if (document.getElementById("reportGeneratorModal")) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Opciones de años (3 años atrás hasta año actual)
    const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i)
      .map((y) => `<option value="${y}" ${y === currentYear ? "selected" : ""}>${y}</option>`)
      .join("");

    // Opciones de meses
    const monthOptions = MESES.map((m, i) => {
      const val = i + 1;
      return `<option value="${val}" ${val === currentMonth ? "selected" : ""}>${m}</option>`;
    }).join("");

    // Sucursales del template sgMexicoMonthly
    const defaultSucursales = window.ReportTemplates?.sgMexicoMonthly?.defaultSucursales || [
      "SG Altabrisa", "SG La Isla", "SG Paseo Montejo",
    ];

    const sucursalesHTML = defaultSucursales.map((s) => `
      <label class="rg-check-item">
        <input type="checkbox" name="rg-sucursal" value="${s}" checked>
        <span>${s}</span>
      </label>
    `).join("");

    const html = `
      <div id="reportGeneratorModal" role="dialog" aria-modal="true" aria-labelledby="rg-title">
        <div class="rg-dialog">
          <div class="rg-header">
            <div>
              <div class="rg-title" id="rg-title">Generar Reporte Ejecutivo</div>
              <div class="rg-subtitle">Santa Gloria México — Reporte Mensual</div>
            </div>
            <button class="rg-close" id="rgCloseBtn" aria-label="Cerrar">✕</button>
          </div>

          <div class="rg-body">
            <!-- Periodo -->
            <div>
              <div class="rg-section-label">Periodo</div>
              <div class="rg-row">
                <div class="rg-field">
                  <label>Mes</label>
                  <select id="rgMes">${monthOptions}</select>
                </div>
                <div class="rg-field">
                  <label>Año</label>
                  <select id="rgAnio">${yearOptions}</select>
                </div>
              </div>
            </div>

            <!-- Sucursales -->
            <div>
              <div class="rg-section-label">Sucursales incluidas</div>
              <div class="rg-sucursales" id="rgSucursales">
                ${sucursalesHTML}
              </div>
            </div>

            <!-- Progress -->
            <div class="rg-progress" id="rgProgress">
              <div class="rg-spinner"></div>
              <span id="rgProgressText">Iniciando…</span>
            </div>

            <!-- Error -->
            <div class="rg-error" id="rgError"></div>
          </div>

          <div class="rg-footer">
            <button class="rg-btn-cancel" id="rgCancelBtn">Cancelar</button>
            <button class="rg-btn-generate" id="rgGenerateBtn">
              <span>⬇</span> Generar Reporte
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
    bindEvents();
  }

  // ── Eventos del modal ───────────────────────────────────────────────────────
  function bindEvents() {
    const modal = document.getElementById("reportGeneratorModal");

    document.getElementById("rgCloseBtn").addEventListener("click", close);
    document.getElementById("rgCancelBtn").addEventListener("click", close);
    document.getElementById("rgGenerateBtn").addEventListener("click", handleGenerate);

    // Cerrar al hacer click fuera del dialog
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });

    // Cerrar con Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("visible")) close();
    });
  }

  // ── Abrir modal ─────────────────────────────────────────────────────────────
  function open() {
    injectModal();
    const modal = document.getElementById("reportGeneratorModal");
    modal.classList.add("visible");
    setProgress(false);
    setError("");
    setGenerating(false);
  }

  // ── Cerrar modal ────────────────────────────────────────────────────────────
  function close() {
    const modal = document.getElementById("reportGeneratorModal");
    if (modal) modal.classList.remove("visible");
  }

  // ── Disparar generación ─────────────────────────────────────────────────────
  async function handleGenerate() {
    const mes = parseInt(document.getElementById("rgMes")?.value, 10);
    const anio = parseInt(document.getElementById("rgAnio")?.value, 10);
    const sucursales = [...document.querySelectorAll('input[name="rg-sucursal"]:checked')].map((cb) => cb.value);

    if (!sucursales.length) {
      setError("Selecciona al menos una sucursal.");
      return;
    }

    setError("");
    setGenerating(true);
    setProgress(true, "Iniciando…");

    const params = {
      marca: "Santa Gloria México",
      mes,
      anio,
      sucursales,
    };

    await window.ReportEngine.run(
      "sgMexicoMonthly",
      params,
      {
        onProgress: (msg) => setProgress(true, msg),
        onError: (msg) => {
          setError(`Error: ${msg}`);
          setProgress(false);
          setGenerating(false);
        },
        onComplete: (fileName) => {
          setProgress(false);
          setGenerating(false);
          close();
          // Toast del dashboard si está disponible
          if (typeof showToast === "function") showToast(`Reporte descargado: ${fileName}`);
        },
      }
    );
  }

  // ── Helpers de estado ───────────────────────────────────────────────────────
  function setProgress(visible, text = "") {
    const el = document.getElementById("rgProgress");
    const txt = document.getElementById("rgProgressText");
    if (!el) return;
    el.classList.toggle("visible", visible);
    if (txt) txt.textContent = text;
  }

  function setError(msg) {
    const el = document.getElementById("rgError");
    if (!el) return;
    el.classList.toggle("visible", !!msg);
    el.textContent = msg;
  }

  function setGenerating(generating) {
    const btn = document.getElementById("rgGenerateBtn");
    const cancel = document.getElementById("rgCancelBtn");
    const close_ = document.getElementById("rgCloseBtn");
    if (btn) {
      btn.disabled = generating;
      btn.innerHTML = generating
        ? '<span class="rg-spinner" style="width:11px;height:11px;border:2px solid rgba(7,10,15,0.3);border-top-color:#070a0f;"></span> Generando…'
        : '<span>⬇</span> Generar Reporte';
    }
    if (cancel) cancel.disabled = generating;
    if (close_) close_.disabled = generating;
  }

  return { open, close };

})();
