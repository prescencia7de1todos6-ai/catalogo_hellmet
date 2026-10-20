/* =========================================================
   HELMET — Componentes / Footer.js
   Franja de Redes Sociales (encima del footer) + pie de página
   público con 2 columnas:
     - Redes Sociales — solo el icono (logo_red_social) dentro de
       un círculo, que funciona como botón <a> hacia su url_red
     1. Mensaje de bienvenida de la empresa (texto fijo)
     2. Ubicación — cada sucursal registrada, con su dirección
        como enlace <a> hacia su url_ubi (link de Google Maps)

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
    <nav class="redes-bar" aria-label="Redes sociales">
      <ul id="footer-redes" class="redes-bar-list"></ul>
    </nav>
    <footer class="site-footer">
      <div class="footer-col">
        <h4>Sobre el nosotros</h4>
        <p>Bienvenido a HELMET, especialistas en hornos, cocinas, parrillas y broasteras; todas semi-industriales. Para usos domésticos o de negocio/emprendimientos.</p>
      </div>
      <div class="footer-col">
        <h4>Ubicación</h4>
        <ul id="footer-ubicaciones" class="footer-redes-list">
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
  const barra = cont.closest(".redes-bar");
  if (typeof SucursalRedesService === "undefined") { barra.style.display = "none"; return; }

  const { data, error } = await SucursalRedesService.listarRedes();
  if (error || !data || data.length === 0) {
    barra.style.display = "none";
    return;
  }

  // Cada red = un botón circular con su icono, que abre su url_red.
  cont.innerHTML = data.map((r) => {
    const nombre = r.nom_red || "Red social";
    const icono = r.logo_red_social
      ? `<img src="${r.logo_red_social}" alt="${nombre}">`
      : `<span class="redes-bar-inicial">${nombre.charAt(0).toUpperCase()}</span>`;
    const boton = r.url_red
      ? `<a class="redes-bar-btn" href="${r.url_red}" target="_blank" rel="noopener" title="${nombre}" aria-label="${nombre}">${icono}</a>`
      : `<span class="redes-bar-btn" title="${nombre}">${icono}</span>`;
    return `<li>${boton}</li>`;
  }).join("");
}
