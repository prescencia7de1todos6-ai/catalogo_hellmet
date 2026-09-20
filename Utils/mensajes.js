/* =========================================================
   HELLMET — Utils / Mensajes
   Sistema único de alertas para toda la página (pública y admin).
   No usa alert() del navegador — muestra un mensaje flotante
   con estilo propio, para que se vea consistente en todo el sitio.

   Uso, desde cualquier página o servicio:
     mostrarMensaje("Completa todos los campos", "error");
     mostrarMensaje("Producto guardado con éxito", "exito");
     mostrarMensaje("No hay productos para mostrar", "info");

   Requiere que el HTML tenga en algún lugar:
     <div id="mensaje-contenedor"></div>
   Si no existe, este script lo crea automáticamente.
   ========================================================= */

const MENSAJES = {
  PAGINA_INEXISTENTE: "Esta página no existe o todavía no fue creada.",
  CAMPOS_INCOMPLETOS: "Completa todos los campos obligatorios antes de continuar.",
  SIN_PRODUCTOS: "No hay productos para mostrar en esta categoría todavía.",
  ERROR_CONEXION: "No se pudo conectar con la base de datos. Intenta de nuevo.",
  CONTRASENAS_NO_COINCIDEN: "Las contraseñas no coinciden.",
  CREDENCIALES_INVALIDAS: "Usuario o contraseña incorrectos.",
  GUARDADO_EXITO: "Los datos se guardaron correctamente.",
  ELIMINADO_EXITO: "Se eliminó correctamente.",
  CONFIRMAR_ELIMINAR: "¿Seguro que quieres eliminar esto? Esta acción no se puede deshacer.",
};

function obtenerContenedorMensajes() {
  let contenedor = document.getElementById("mensaje-contenedor");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "mensaje-contenedor";
    contenedor.style.position = "fixed";
    contenedor.style.bottom = "24px";
    contenedor.style.right = "24px";
    contenedor.style.zIndex = "9999";
    contenedor.style.display = "flex";
    contenedor.style.flexDirection = "column";
    contenedor.style.gap = "10px";
    document.body.appendChild(contenedor);
  }
  return contenedor;
}

/**
 * Muestra un mensaje flotante.
 * @param {string} texto
 * @param {"info"|"exito"|"error"} tipo
 * @param {number} duracionMs
 */
function mostrarMensaje(texto, tipo = "info", duracionMs = 3500) {
  const contenedor = obtenerContenedorMensajes();

  const colores = {
    info: { fondo: "#5C5548", texto: "#F2EDE3" },
    exito: { fondo: "#3E6B3E", texto: "#F2EDE3" },
    error: { fondo: "#7A1E1E", texto: "#F2EDE3" },
  };
  const c = colores[tipo] || colores.info;

  const caja = document.createElement("div");
  caja.textContent = texto;
  caja.style.background = c.fondo;
  caja.style.color = c.texto;
  caja.style.padding = "12px 18px";
  caja.style.borderRadius = "8px";
  caja.style.fontFamily = "var(--font-body, sans-serif)";
  caja.style.fontSize = "0.9rem";
  caja.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
  caja.style.maxWidth = "320px";
  caja.style.opacity = "0";
  caja.style.transition = "opacity 0.25s ease";

  contenedor.appendChild(caja);
  requestAnimationFrame(() => { caja.style.opacity = "1"; });

  setTimeout(() => {
    caja.style.opacity = "0";
    setTimeout(() => caja.remove(), 300);
  }, duracionMs);
}

/**
 * Pregunta de confirmación simple (usa confirm nativo por ahora;
 * se puede reemplazar más adelante por un modal propio si se quiere
 * mantener 100% del estilo visual).
 */
function confirmarAccion(texto = MENSAJES.CONFIRMAR_ELIMINAR) {
  return window.confirm(texto);
}
