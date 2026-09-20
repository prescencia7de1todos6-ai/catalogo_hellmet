/* =========================================================
   HELLMET — Componentes / Navbar.js
   =========================================================
   Sidebar lateral izquierdo que se repite en Dashboard.html,
   Productos.html, Administrador.html y Sucursal_redes.html.

   Cómo usarlo en cada página HTML del admin:

     <div id="navbar-container"></div>
     ...
     <script src="../Services/Supabase.js"></script>
     <script src="../Services/Administrador.js"></script>
     <script src="../Componentes/Navbar.js"></script>
     <script>
       document.addEventListener("DOMContentLoaded", () => {
         renderNavbar("dashboard"); // "dashboard" | "productos" | "administrador" | "sucursal"
       });
     </script>

   El parámetro le dice al Navbar cuál botón marcar como activo.
   ========================================================= */

const NAVBAR_ITEMS = [
  { id: "dashboard",     label: "General",        href: "Dashboard.html" },
  { id: "productos",     label: "Producto",       href: "Productos.html" },
  { id: "administrador", label: "Administrador",  href: "Administrador.html" },
  { id: "sucursal",      label: "Sucursal",       href: "Sucursal_redes.html" },
  { id: "reporte",       label: "Reporte",        href: "Reporte.html" },
];

async function renderNavbar(seccionActiva) {
  const contenedor = document.getElementById("navbar-container");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <aside class="admin-sidebar">
      <div class="sidebar-logo">
        <img src="../Assets/Img/logo.svg" alt="Logo HELLMET">
        HELLMET
      </div>
      <nav class="admin-nav">
        ${NAVBAR_ITEMS.map((item) => `
          <a href="${item.href}" class="${item.id === seccionActiva ? "active" : ""}">${item.label}</a>
        `).join("")}
      </nav>
      <div class="admin-user-block">
        <div class="admin-user-avatar">🙂</div>
        <span id="navbar-user-name">Usuario</span>
        <button id="navbar-logout-btn">Cerrar sesión</button>
      </div>
    </aside>
  `;

  document.getElementById("navbar-logout-btn").addEventListener("click", () => {
    AdministradorService.cerrarSesion();
  });

  // Pinta el nombre real del administrador que inició sesión, si ya se pudo obtener
  const admin = await AdministradorService.obtenerAdminActual();
  if (admin) {
    document.getElementById("navbar-user-name").textContent = admin.nom_admin;
  }
}
