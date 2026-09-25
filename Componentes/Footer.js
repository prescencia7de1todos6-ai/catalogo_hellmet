/* =========================================================
   HELLMET — Componentes / Footer.js
   Pie de página público, con 3 columnas:
     1. Mensaje de bienvenida de la empresa (texto fijo)
     2. Ubicación — cada sucursal registrada, con su dirección
        como enlace <a> hacia su url_ubi (link de Google Maps)
     3. Redes Sociales — cada una como enlace <a> hacia su url_red

   Uso:
     <div id="footer-container"></div>
     <script src="RUTA/Services/Sucursal_redes.js"></script>
     <script src="RUTA/Componentes/Footer.js"></script>
     <script>renderFooter();</script>

   Requiere que Services/Supabase.js y Services/Sucursal_redes.js
   ya estén cargados antes.
   ========================================================= */

async function renderFooter() {
  const contenedor = document.getElementById("footer-container");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <footer class="site-footer">
      <div class="footer-col">
        <h4>Compañía</h4>
        <p>Bienvenido a HELLMET, especialistas en hornos, cocinas, parrillas y broasteras; todas semi-industriales. Para usos domésticos o de negocio/emprendimientos.</p>
      </div>
      <div class="footer-col">
        <h4>Ubicación</h4>
        <ul id="footer-ubicaciones" class="footer-redes-list">
          <li>Cargando...</li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Redes Sociales</h4>
        <ul id="footer-redes" class="footer-redes-list">
          <li>Cargando...</li>
        </ul>
      </div>
    </footer>
  `;

  cargarUbicacionesFooter();
  cargarRedesFooter();
}

async function cargarUbicacionesFooter() {
  const cont = document.getElementById("footer-ubicaciones");
  if (typeof SucursalRedesService === "undefined") { cont.innerHTML = "<li>—</li>"; return; }

  const { data, error } = await SucursalRedesService.listarSucursales();
  if (error || !data || data.length === 0) {
    cont.innerHTML = `<li>Aún sin sucursales cargadas.</li>`;
    return;
  }

  cont.innerHTML = data.map((s) => {
    const texto = s.ubicacion || s.nom_sucursal;
    const logo=s.logo_ubi?`<img src="${s.logo_ubi}" alt="" class="footer-logo-circular">`:"";
    const enlace= s.url_ubi ? `<a href="${s.url_ubi}" target="_blank" rel="noopener">${texto}</a>`: `<span>${texto}</span>`;
    return `<li class="footer-fila-logo">${logo}${enlace}</li>`;
  }).join("");
}

async function cargarRedesFooter() {
  const cont = document.getElementById("footer-redes");
  if (typeof SucursalRedesService === "undefined") { cont.innerHTML = "<li>—</li>"; return; }

  const { data, error } = await SucursalRedesService.listarRedes();
  if (error || !data || data.length === 0) {
    cont.innerHTML = `<li>Aún sin redes sociales cargadas.</li>`;
    return;
  }
  cont.innerHTML = data.map((r) =>
  {
    const logo = r.logo_red_social ? `<img src="${r.logo_red_social}" alt="" class="footer-logo-circular">`:"";
    return `<li class="footer-fila-logo">${logo}<a href="${r.url_red}" target="_blank" rel="noopener">${r.nom_red}</a></li>`
  }
  ).join("");
}
