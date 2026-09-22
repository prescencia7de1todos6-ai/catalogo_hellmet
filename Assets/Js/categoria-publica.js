/* =========================================================
   HELLMET — Assets/Js/categoria-publica.js
   Lógica compartida por Hornos.html, Parrillas.html,
   Broasteras.html y Cocinas.html (Paginas/Categorias/).

   Cada página solo necesita llamar:
     inicializarPaginaCategoria("HORNOS", "Hornos industriales y domésticos para panadería");
   ========================================================= */

async function inicializarPaginaCategoria(nombreCategoria, descripcion) {
  document.getElementById("category-name").textContent = capitalizar(nombreCategoria);
  document.getElementById("category-description").textContent = descripcion;
  document.title = `HELLMET — ${capitalizar(nombreCategoria)}`;

  const categoria = await CategoriaService.obtenerPorNombre(nombreCategoria);

  if (!categoria) {
    mostrarEstadoVacio();
    return;
  }

  const { data: productos, error } = await ProductosService.listarPublicoPorCategoria(categoria.id_cate);

  if (error || !productos || productos.length === 0) {
    mostrarEstadoVacio();
    mostrarMensaje(MENSAJES.SIN_PRODUCTOS, "info");
    return;
  }

  renderGrilla(productos);
  renderDesplegable(productos);
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toUpperCase();
}

function renderGrilla(productos) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = productos.map((p) => {
    const primeraImagen = (p.img_producto || []).sort((a, b) => (a.orden || 0) - (b.orden || 0))[0];
    return `
      <a class="product-card" href="../Productos/Producto.html?producto=${p.id_prod}">
        <span class="product-card-image">
          ${primeraImagen
            ? `<img src="${primeraImagen.url_img}" alt="${p.nom_prod}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : ""}
          <span class="product-card-fallback" style="${primeraImagen ? "display:none;" : "display:flex;"}">${p.nom_prod}</span>
        </span>
        <span class="product-card-name">${p.nom_prod}</span>
      </a>
    `;
  }).join("");
}

function renderDesplegable(productos) {
  const wrap = document.getElementById("category-select-wrap");
  const select = document.getElementById("category-select");

  select.innerHTML = `<option value="">Ir directo a un producto...</option>` +
    productos.map((p) => `<option value="${p.id_prod}">${p.nom_prod}</option>`).join("");

  wrap.style.display = "";

  select.addEventListener("change", () => {
    if (select.value) {
      window.location.href = `../Productos/Producto.html?producto=${select.value}`;
    }
  });
}

function mostrarEstadoVacio() {
  document.getElementById("product-grid").style.display = "none";
  document.getElementById("category-select-wrap").style.display = "none";
  document.getElementById("category-empty-state").style.display = "";
}
