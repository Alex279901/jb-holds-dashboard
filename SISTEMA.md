# JB Holds Command Center — Guía de Sistema

**Versión:** 3.0 · **Última actualización:** 2026-05-31  
**Operado por:** Una persona · **Repositorio:** https://github.com/Alex279901/jb-holds-dashboard

---

## 1. Qué es este sistema

Un dashboard ejecutivo multi-país para el holding JB Holds / INDEF / JBBlue Group.
Muestra ventas, P&L, operaciones, marketing, RH y expansión de forma visual.
Es un sitio web estático (HTML + CSS + JS). No tiene base de datos ni servidor. Los datos se escriben directamente en los archivos JS.

---

## 2. Estructura de carpetas

```
/ (raíz)
├── index.html          ← Dashboard original JB Holds (respaldo vivo en raíz)
├── app.js              ← Datos y lógica del dashboard raíz
├── styles.css          ← Estilos del dashboard raíz
├── SISTEMA.md          ← Este archivo — guía de sistema
├── README.md           ← Descripción general del proyecto
├── SECURITY.md         ← Notas de seguridad para producción
├── package.json        ← Configuración básica (sin dependencias)
├── data/               ← CSVs y specs técnicos (referencia, no se leen automáticamente)
│
├── _backup_original/   ← Copia exacta del estado inicial del proyecto
│
├── mexico/             ← Dashboard México (MXN · $)
│   ├── index.html      ← Estructura HTML
│   ├── app.js          ← TODOS los datos de México van aquí
│   └── styles.css      ← Diseño visual (idéntico a España)
│
├── espana/             ← Dashboard España (EUR · €)
│   ├── index.html      ← Estructura HTML adaptada a España
│   ├── app.js          ← TODOS los datos de España van aquí
│   └── styles.css      ← Diseño visual (idéntico a México)
│
├── global/             ← Placeholder — próximamente
│   └── index.html
│
└── indef/              ← INDEF Command Center (sistema separado con Google Sheets)
    ├── index.html
    ├── app.js          ← Se conecta a Google Sheets automáticamente
    ├── styles.css
    └── assets/         ← Imágenes de portada y librerías PDF
```

---

## 3. Cómo correr el sistema localmente

```bash
cd /ruta/al/proyecto
python3 -m http.server 8098 --bind 127.0.0.1
```

Luego abrir en el navegador:
- `http://localhost:8098/` — Dashboard raíz
- `http://localhost:8098/mexico/` — Dashboard México
- `http://localhost:8098/espana/` — Dashboard España
- `http://localhost:8098/indef/` — INDEF Command Center
- `http://localhost:8098/global/` — Placeholder

---

## 4. Dónde actualizar cada fuente de información

### MÉXICO — archivo: `mexico/app.js`

| Sección | Qué contiene | Líneas aprox. |
|---|---|---|
| `const kpis = [...]` | 8 KPI cards principales | 11–76 |
| `const departments = [...]` | 6 módulos departamentales con métricas | 78–276 |
| `const departmentDrilldowns = {...}` | Tablas y filtros de cada módulo | 278–670 |
| `const pulseAlerts = [...]` | Alertas P1/P2 del Executive Pulse | 672–712 |
| `const insights = [...]` | Señales ejecutivas de 4 tarjetas | 714–743 |
| `const risks = [...]` | 4 riesgos del Centro de Riesgos | 745–770 |
| `const commitments = []` | Compromisos del comité (vacío) | 772 |
| `const importantPending = [...]` | Pendientes importantes | 774–807 |
| `setupRevenueChart()` — datos | Gráfica de barras Jan-May | ~1443–1449 |
| `setupGlobeCanvas()` — markers | Marcadores del globo 3D | ~1734–1737 |

### ESPAÑA — archivo: `espana/app.js`

Misma estructura que México. Buscar las mismas secciones.
Todos los valores monetarios usan `€` en lugar de `$`.

### INDEF Command Center — archivo: `indef/app.js`

```
const SHEETS_API_URL = "..."  ← línea 16: URL del Apps Script de Google Sheets
```
Los datos llegan automáticamente desde Google Sheets cuando el Apps Script está publicado.
Si no conecta, muestra datos demo automáticamente.

---

## 5. Proceso de actualización semanal (para una sola persona)

### México — actualización rápida (15-20 minutos)

1. Abrir `mexico/app.js` en cualquier editor de texto (VS Code recomendado)
2. Buscar la sección a actualizar (ver tabla arriba)
3. Cambiar los valores numéricos y textos
4. Guardar el archivo
5. Verificar en el navegador con el servidor local
6. Hacer commit y push:
   ```bash
   git add mexico/app.js
   git commit -m "Actualización semanal México - Semana XX"
   git push origin main
   ```

### Campos más comunes a actualizar cada semana

```js
// En kpis[] — cambiar value, meta y points:
{ label: "Ventas netas", value: "$XX.XXM", meta: "XX.X% vs meta · corte DD Mes", points: [...] }

// En setupRevenueChart() — agregar el mes nuevo:
const revenue = [2.11, 2.93, 3.48, 3.36, 2.68, NUEVO_MES];
const revenueLabels = ["Ene","Feb","Mar","Abr","May","Jun"];

// En pulseAlerts[] — actualizar alertas del periodo:
{ level: "P1", title: "...", copy: "...", owner: "...", status: "red" }
```

### España — misma mecánica, mismo archivo `espana/app.js`

---

## 6. Flujo de datos

```
Datos reales (POS Soft Restaurant, Hiopos, Meta Ads, etc.)
    ↓ (proceso manual: extraer cifras y escribirlas)
mexico/app.js  o  espana/app.js
    ↓ (JavaScript los lee al cargar la página)
Navegador del usuario (dashboard visual)
```

El INDEF Command Center es el único que se conecta automáticamente:
```
Google Sheets (pestaña C_Fecha, C_Producto, C_Hora)
    ↓ (Google Apps Script publica JSON)
indef/app.js fetch() → datos en tiempo real
```

---

## 7. Reglas de oro para no romper nada

1. **Nunca modificar `mexico/styles.css` ni `espana/styles.css`** sin respaldo. Tienen 5,215 líneas.
2. **Siempre crear un tag de git antes de cambios grandes:**
   ```bash
   git tag -a "backup-YYYYMMDD" -m "Descripción del backup"
   ```
3. **Verificar en el navegador antes de hacer push.**
4. **Los datos de México y España son independientes.** Cambiar uno no afecta al otro.
5. **La carpeta `/indef/` no se toca.** Tiene su propio sistema.
6. **La carpeta `/_backup_original/`** es el estado del proyecto antes de toda la arquitectura. No tocar.

---

## 8. Pendientes para la siguiente sesión

### Alta prioridad
- [ ] **Landing principal** — crear `index.html` en la raíz que conecte los 5 dashboards con navegación (México · España · Global · INDEF · Inicio)
- [ ] **Validación visual España** — navegar `/espana/` en el navegador y confirmar que todos los módulos cargan correctamente
- [ ] **Definir proceso de inyección semanal** — documentar exactamente qué campos se actualizan cada lunes y desde qué fuente

### Media prioridad
- [ ] **Global** — definir qué va en `/global/` (consolidado MX + ESP, o placeholder indefinido)
- [ ] **INDEF validación** — confirmar que la conexión a Google Sheets funciona en producción (Vercel)
- [ ] **España datos reales** — cuando existan datos reales de España, actualizar `espana/app.js`

### Baja prioridad
- [ ] Optimizar imágenes de portada del INDEF (actualmente ~3 MB cada una)
- [ ] Agregar `favicon.ico` al proyecto
- [ ] Revisar responsive en móvil para España

---

## 9. Estado del repositorio

```
URL: https://github.com/Alex279901/jb-holds-dashboard
Rama principal: main
Último commit: 8f0e02c — Fase 3 dashboard España

Historial:
8f0e02c  Fase 3 dashboard España — réplica funcional con datos demo EUR
7548ac4  Fase 2A integración INDEF Command Center en /indef
4d21953  Fase 1 arquitectura mexico espana global
5909ed0  Actualizacion nueva version
38ec172  Initial commit

Tags de seguridad:
backup-pre-arquitectura-mx-es-global → 5909ed0 (antes de toda la arquitectura)
backup-pre-fase3-espana              → 7548ac4 (antes de crear España)
```

---

## 10. Para retomar el trabajo mañana

```bash
# 1. Ir al directorio del proyecto
cd "/Users/alexcortes/Documents/INDEF/JB HOLDS CONTROL MAESTRO/JBH_CommandCenter/files-mentioned-by-the-user-jb"

# 2. Verificar estado
git status
git log --oneline -5

# 3. Arrancar servidor local
python3 -m http.server 8098 --bind 127.0.0.1

# 4. Abrir en navegador
# http://localhost:8098/mexico/
# http://localhost:8098/espana/
# http://localhost:8098/indef/
```

**Siguiente tarea:** Crear el landing principal en la raíz (`index.html` nuevo) que conecte todos los dashboards.
