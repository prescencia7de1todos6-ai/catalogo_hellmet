/* =========================================================
   HELLMET — Componentes / Header.js
   Encabezado público (logo + nombre). Se usa en index.html
   y en las páginas de Paginas/Categorias/ y Paginas/Productos/.

   Uso:
     <div id="header-container"></div>
     <script src="RUTA/Componentes/Header.js"></script>
     <script>renderHeader("RUTA_A_ASSETS");</script>

   "RUTA_A_ASSETS" es la ruta relativa hacia la carpeta Assets
   desde esa página (ej: "../../Assets" desde Paginas/Categorias/).
   ========================================================= */

function renderHeader(rutaAssets, rutaInicio) {
  const contenedor = document.getElementById("header-container");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <header class="site-header">
      <a href="${rutaInicio}" class="site-header-logo">HELLMET</a>
      <div class="header-logo-badge">
        <img src="${rutaAssets}/Img/logo.svg" alt="Logo HELLMET">
      </div>
      <span class="site-header-title">CATÁLOGO</span>
    </header>
  `;
}
