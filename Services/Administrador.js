/* =========================================================
   HELLMET — Services / Administrador.js
   =========================================================
   Todo lo relacionado a la tabla "administrador" y al login
   vive aquí. Las páginas (Login.html, Dashboard.html, etc.)
   solo llaman a estas funciones, nunca hablan con Supabase
   directamente.

   CAMBIO DE PLAN: se vuelve a usuario/contraseña de la tabla
   propia (no Supabase Auth, que estaba dando errores). Como
   ya no usamos supabaseClient.auth para saber "quién inició
   sesión", la sesión se guarda en sessionStorage del navegador
   (se borra sola al cerrar la pestaña).

   ⚠️ Nota de seguridad: comparar la contraseña en texto plano
   contra la tabla, desde el navegador, no es seguro para un
   sitio en producción con datos sensibles — cualquiera que
   abra las herramientas de desarrollador vería la contraseña
   viajando en la consulta. Para este proyecto (panel interno,
   pocos administradores) es un riesgo que se puede asumir por
   ahora; si más adelante quieres subirle el nivel de seguridad,
   se puede retomar Supabase Auth o mover esta validación a una
   Supabase Edge Function (código en el servidor, no en el navegador).
   ========================================================= */

const ADMIN_SESSION_STORAGE_KEY = "hellmet_admin_actual";

const AdministradorService = {

  /** Login directo contra la tabla "administrador" (usuario/contraseña propios). */
  async iniciarSesion(usuario, contrasena) {
    if (!supabaseClient) {
      return { error: "Supabase no está configurado todavía (ver Services/Supabase.js)." };
    }

    const { data, error } = await supabaseClient
      .from("administrador")
      .select("id_admin, nom_admin, ape_admin, usuario")
      .eq("usuario", usuario)
      .eq("contraseña", contrasena)
      .single();

    if (error || !data) {
      console.error("[HELLMET] Error de Supabase al iniciar sesión:", error);
      return { error: MENSAJES.CREDENCIALES_INVALIDAS };
    }

    // Se guarda la sesión en este navegador para que protegerPagina()
    // y obtenerAdminActual() sepan quién entró, sin depender de Auth.
    sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(data));

    return { data };
  },

  cerrarSesion() {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    window.location.href = "Login.html";
  },

  /** Redirige al login si no hay sesión activa. Llamar al cargar cualquier página del admin. */
  async protegerPagina() {
    if (!supabaseClient) return; // modo sin configurar: no bloquea, para poder ver el diseño
    if (!sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY)) {
      window.location.href = "Login.html";
    }
  },

  /** Trae los datos del administrador que inició sesión en este navegador. */
  async obtenerAdminActual() {
    const guardado = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!guardado) return null;
    return JSON.parse(guardado);
  },

  async listar() {
    if (!supabaseClient) return { data: [], error: null };
    return await supabaseClient.from("administrador").select('id_admin, nom_admin, ape_admin, usuario, "contraseña"');
  },

  async obtenerPorId(idAdmin) {
    if (!supabaseClient) return { data: null, error: "Supabase no configurado" };
    return await supabaseClient
      .from("administrador")
      .select("id_admin, nom_admin, ape_admin, usuario")
      .eq("id_admin", idAdmin)
      .single();
  },

  /** Crea un administrador. Usa la función insertar_administrador (nombre, apellido,
   *  contraseña) y después le guarda el "usuario" aparte, porque esa función original
   *  no la incluía todavía. */
  async crear(nombre, apellido, usuario, contrasena) {
    const { data: nuevoId, error } = await supabaseClient.rpc("insertar_administrador", {
      p_nombre: nombre,
      p_ape: apellido,
      p_contra: contrasena,
    });
    if (error) return { error };

    const { error: errorUsuario } = await supabaseClient
      .from("administrador")
      .update({ usuario })
      .eq("id_admin", nuevoId);

    if (errorUsuario) return { error: errorUsuario };
    return { data: nuevoId };
  },

  /** Actualiza nombre/apellido/usuario. La contraseña solo se cambia si se pasa un valor. */
  async actualizar(idAdmin, nombre, apellido, usuario, contrasena) {
    const cambios = { nom_admin: nombre, ape_admin: apellido, usuario };
    if (contrasena) cambios["contraseña"] = contrasena;

    return await supabaseClient.from("administrador").update(cambios).eq("id_admin", idAdmin);
  },

  async eliminar(idAdmin) {
    return await supabaseClient.from("administrador").delete().eq("id_admin", idAdmin);
  },
};
