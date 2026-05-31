# INDEF Command Center - Guia de instalacion

Este dashboard es una pagina web estatica. No necesita build, npm, React, base de datos local ni servidor especial para correr. Solo necesita que el navegador pueda leer los archivos y que el Google Apps Script este publicado con acceso correcto.

## Archivos necesarios

Sube estos archivos y carpetas al servidor:

- `index.html`
- `styles.css`
- `app.js`
- `assets/`

La carpeta `preview/` no es necesaria para produccion.

## Probar localmente

Desde la carpeta del proyecto:

```bash
python3 -m http.server 4174
```

Despues abre:

```text
http://localhost:4174/index.html
```

## Descargar reportes PDF

Dentro del dashboard usa el boton `Descargar PDF`. La pagina genera y descarga un PDF limpio del reporte actual: sin menu lateral izquierdo, sin modulo lateral derecho, sin controles de filtros y sin encabezados/pies blancos del navegador.

## Subir a un hosting o servidor

### Opcion simple: cPanel, Hostinger, GoDaddy, etc.

1. Entra al administrador de archivos del hosting.
2. Abre la carpeta publica del dominio, normalmente `public_html`.
3. Sube `index.html`, `styles.css`, `app.js` y `assets/`.
4. Abre tu dominio en el navegador.

Si el dashboard queda dentro de una subcarpeta, por ejemplo `/dashboard`, la URL sera:

```text
https://tudominio.com/dashboard/index.html
```

### Opcion servidor propio con Nginx

Ejemplo de carpeta:

```text
/var/www/indef-command-center
```

Copia ahi los archivos necesarios y usa una configuracion similar:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    root /var/www/indef-command-center;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Luego activa SSL con Let's Encrypt / Certbot.

## Conexion con Google Sheets

La URL del Apps Script esta en `app.js`, constante:

```js
const SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbx_sdWMzDehOJ69VoiQRyp0OlB3RL0bRV5G51D3_40gnOsmzp-JOTr6xY--k4GjEuMx4Q/exec";
```

Si vuelves a desplegar Apps Script y cambia la URL, reemplazala ahi.

El Apps Script debe estar publicado asi:

- Execute as: `Me`
- Who has access: `Anyone`

Si la app muestra datos demo o no actualiza, revisa que la URL del Apps Script abra JSON en el navegador y no una pantalla de login de Google.

## Hojas esperadas

El dashboard espera estas pestañas:

- `C_Fecha`
- `C_Producto`
- `C_Hora`

Columnas principales:

- `C_Fecha`: Fecha, Documentos, Venta Neta, IVA, Venta, Ticket Medio, Sucursal, Pais, Meta, GAP $, Cumplimiento
- `C_Producto`: Sucursal, Fecha, Producto, Categoria, Neto, Cantidad, Ordenes
- `C_Hora`: Fecha, Venta, Docs, Uds.V, Sucursal, Hora, Tiempo

## Importante sobre seguridad

El login actual es visual/demo para presentacion. No es autenticacion real de servidor.

Para produccion con datos sensibles, lo correcto es agregar una capa real de seguridad:

- login con backend,
- usuarios/sesiones,
- o una API propia que proteja el acceso a Google Sheets.

Si el Apps Script queda como `Anyone`, cualquier persona con la URL directa podria consultar el JSON. Para presentacion interna puede servir; para produccion sensible conviene protegerlo.

## Actualizar cambios

Cuando modifiques archivos:

1. Sube de nuevo `index.html`, `styles.css` y `app.js`.
2. Si cambias imagenes, sube tambien `assets/`.
3. Haz hard refresh en el navegador:
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + F5`
