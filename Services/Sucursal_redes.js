/* =========================================================
   HELLMET — Services / Sucursal_redes.js
   =========================================================
   "sucursal" = ubicación física (para que el cliente sepa
   dónde ir). "red_social" = publicidad de la empresa en
   general, YA NO depende de una sucursal — ahora se relaciona
   con "administrador" (quién la registró/actualizó), porque
   son las redes del negocio completo, no de una sucursal
   puntual. Por eso van en funciones separadas aquí abajo,
   aunque compartan archivo.
   ========================================================= */

const SucursalRedesService = {

  /** Sucursales activas (ubicación, celular) — sin relación con redes sociales. */
  async listarSucursales() {
    if (!supabaseClient) return { data: [], error: null };
    return await supabaseClient
      .from("sucursal")
      .select("*")
      .eq("activo", true)
      .order("nom_sucursal");
  },

  /** Todas las sucursales (activas e inactivas) — para la tabla del panel admin. */
  async listarSucursalesAdmin() {
    if (!supabaseClient) return { data: [], error: null };
    return await supabaseClient.from("sucursal").select("*").order("nom_sucursal");
  },

  /** Usa la función SQL "insertar_sucursal" (nombre, celular, dirección, url mapa, admin). */
  async crearSucursal(nombre, celular, ubicacion, urlUbi, idAdmin) {
    return await supabaseClient.rpc("insertar_sucursal", {
      n_nombre: nombre,
      n_celular: celular,
      n_ubicacion: ubicacion,
      n_url_ubi: urlUbi,
      n_admin: idAdmin,
    });
  },

  /** Usa la función SQL "actualizar_sucursal". */
  async actualizarSucursal(idSucursal, nombre, celular, ubicacion, urlUbi, idAdmin) {
    return await supabaseClient.rpc("actualizar_sucursal", {
      n_id_sucursal: idSucursal,
      n_nombre: nombre,
      n_celular: celular,
      n_ubicacion: ubicacion,
      n_url_ubi: urlUbi,
      n_admin: idAdmin,
    });
  },

  async inhabilitarSucursal(idSucursal) {
    return await supabaseClient.from("sucursal").update({ activo: false }).eq("id_sucursal", idSucursal);
  },

  async habilitarSucursal(idSucursal) {
    return await supabaseClient.from("sucursal").update({ activo: true }).eq("id_sucursal", idSucursal);
  },

  /** Redes sociales de la empresa (Facebook, Instagram, etc.), para mostrar en el footer público. */
  async listarRedes() {
    if (!supabaseClient) return { data: [], error: null };
    return await supabaseClient
      .from("red_social")
      .select("id_red, nom_red, url_red")
      .order("nom_red");
  },

  async crearRed(nomRed, urlRed, idAdmin) {
    return await supabaseClient.rpc("insertar_redes",{
      n_nom_red: nomRed, n_url_red: urlRed, n_admin: idAdmin,
    });
  },

  async actualizarRed(idRed, nomRed, urlRed, idAdmin) {
    return await supabaseClient
      .from("red_social")
      .update({ nom_red: nomRed, url_red: urlRed, fec_act: new Date().toISOString(), id_admin_act: idAdmin })
      .eq("id_red", idRed);
  },

  async eliminarRed(idRed) {
    return await supabaseClient.from("red_social").delete().eq("id_red", idRed);
  },
};
