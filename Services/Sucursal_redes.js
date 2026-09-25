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
  async crearSucursal(nombre, celular, ubicacion, urlUbi, urlLogo, idAdmin) {
    return await supabaseClient.rpc("insertar_sucursal", {
      n_nombre: nombre,
      n_celular: celular,
      n_ubicacion: ubicacion,
      n_url_ubi: urlUbi,
      n_logo: urlLogo,
      n_admin: idAdmin,
    });
  },

  /** Usa la función SQL "actualizar_sucursal". */
  async actualizarSucursal(idSucursal, nombre, celular, ubicacion, urlUbi, urlLogo, idAdmin) {
    return await supabaseClient.rpc("actualizar_sucursal", {
      n_id_sucursal: idSucursal,
      n_nombre: nombre,
      n_celular: celular,
      n_ubicacion: ubicacion,
      n_url_ubi: urlUbi,
      n_logo: urlLogo,
      n_admin: idAdmin,
    });
  },

  async subirLogoSucursal(archivo, idSucursal){
    const extension=archivo.name.includes(".")? archivo.name.split(".").pop():"png";
    const nombreArchivo = `sucursales/${idSucursal}-${Date.now()}.${extension}`;
    const {error: errorSubida } = await supabaseClient.storage.from(SUPABASE_BUCKET_PRODUCTOS).upload(nombreArchivo, archivo);
    if(errorSubida) return {data:null, error:errorSubida};

    const {data: urlPublica}=supabaseClient.storage.from(SUPABASE_BUCKET_PRODUCTOS).getPublicUrl(nombreArchivo);
    return{ data:urlPublica.publicUrl, error:null};
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
      .select("id_red, nom_red, url_red, logo_red_social")
      .order("nom_red");
  },

  async crearRed(nomRed, urlRed, idAdmin) {
  return await supabaseClient.rpc("insertar_redes", {
    n_nom_red: nomRed, n_url_red: urlRed, n_logo: null, n_admin: idAdmin,
  });
},

async actualizarRed(idRed, nomRed, urlRed, urlLogo, idAdmin) {
  return await supabaseClient
    .from("red_social")
    .update({
      nom_red: nomRed,
      url_red: urlRed,
      logo_red_social: urlLogo,
      fec_act: new Date().toISOString(),
      id_admin_act: idAdmin,
    })
    .eq("id_red", idRed);
},

async subirLogoRed(archivo, idRed) {
  const tiposPermitidos = ["png", "jpg", "jpeg", "webp", "svg"];
  const extension = archivo.name.includes(".") ? archivo.name.split(".").pop().toLowerCase() : "png";
  if (!tiposPermitidos.includes(extension)) {
    return { data: null, error: { message: "Formato de imagen no permitido. Usa PNG, JPG, WEBP o SVG." } };
  }

  const nombreArchivo = `redes/${idRed}-${Date.now()}.${extension}`;
  const { error: errorSubida } = await supabaseClient.storage
    .from(SUPABASE_BUCKET_PRODUCTOS)
    .upload(nombreArchivo, archivo);
  if (errorSubida) return { data: null, error: errorSubida };

  const { data: urlPublica } = supabaseClient.storage
    .from(SUPABASE_BUCKET_PRODUCTOS)
    .getPublicUrl(nombreArchivo);

  return { data: urlPublica.publicUrl, error: null };
},

  async eliminarRed(idRed) {
    return await supabaseClient.from("red_social").delete().eq("id_red", idRed);
  },
};
