/* =========================================================
   HELLMET — Services / Productos.js
   Todo lo relacionado a la tabla "producto" y sus relaciones
   (imágenes, elementos, colores, datos extra) vive aquí.
   ========================================================= */

const ProductosService = {
  /** Cuenta cuántos productos activos hay en una categoría (para el Dashboard). */
  async contarPorCategoria(idCategoria) {
    if (!supabaseClient) return 0;
    const { count, error } = await supabaseClient
      .from("producto")
      .select("id_prod", { count: "exact", head: true })
      .eq("id_cate", idCategoria);
    if (error) return 0;
    return count || 0;
  },

  /** Lista productos de una categoría (para el panel de admin, incluye inactivos). */
  async listarPorCategoria(idCategoria) {
    if (!supabaseClient) return { data: [], error: null };
    return await supabaseClient
      .from("producto")
      .select("id_prod, nom_prod, precio, activo")
      .eq("id_cate", idCategoria)
      .order("nom_prod");
  },

  /** Lista productos ACTIVOS de una categoría, versión liviana para la grilla
   *  pública y el desplegable de la página de categoría. */
  async listarPublicoPorCategoria(idCategoria) {
    if (!supabaseClient) return { data: [], error: null };
    return await supabaseClient
      .from("producto")
      .select("id_prod, nom_prod, precio, img_producto(url_img, orden)")
      .eq("id_cate", idCategoria)
      .eq("activo", true)
      .order("nom_prod");
  },

  /** Trae un producto activo completo con todas sus relaciones, por su id_prod
   *  (para la página pública de producto). */
  async obtenerPublicoPorId(idProd) {
    if (!supabaseClient) return { data: null, error: "Supabase no configurado" };
    return await supabaseClient
      .from("producto")
      .select(`
        *,
        categoria(id_cate, nom_cate),
        img_producto(id_img, url_img, orden),
        producto_elemento(elemento(id_elem, nom_elem, detalle)),
        dato_extra(id_dat_ext, etiqueta, valor)
      `)
      .eq("id_prod", idProd)
      .eq("activo", true)
      .single();
  },

  /** Trae un producto completo por su id_prod (para precargar el formulario de edición). */
  async obtenerPorId(idProd) {
    if (!supabaseClient) return { data: null, error: "Supabase no configurado" };
    return await supabaseClient
      .from("producto")
      .select(`
        *,
        img_producto(id_img, url_img, orden),
        producto_elemento(elemento(id_elem, nom_elem)),
        producto_color(color(id_color, nom_color)),
        dato_extra(id_dat_ext, etiqueta, valor)
      `)
      .eq("id_prod", idProd)
      .single();
  },

  async crear(datos) {
    return await supabaseClient.rpc("insertar_producto", {
      n_nom: datos.nom_prod,
      n_precio: datos.precio,
      n_garantia: datos.garantia,
      n_categoria: datos.id_cate,
      n_admi: datos.id_admin,
      n_alto: datos.alto,
      n_ancho: datos.ancho,
      n_largo: datos.largo,
    });
  },

  /** Requiere la función "actualizar_producto" en Supabase — ver LEEME-SUPABASE.md. */
  async actualizar(idProd, datos) {
    return await supabaseClient
      .from("producto")
      .update({
        nom_prod: datos.nom_prod,
        precio: datos.precio,
        id_cate: datos.id_cate,
        garantia: datos.garantia,
        alto: datos.alto,
        ancho: datos.ancho,
        largo: datos.largo,
      })
      .eq("id_prod", idProd);
  },

  async inhabilitar(idProd) {
    return await supabaseClient.from("producto").update({ activo: false }).eq("id_prod", idProd);
  },

  async habilitar(idProd) {
    return await supabaseClient.from("producto").update({ activo: true }).eq("id_prod", idProd);
  },

  // ---------- Colores ----------
  async listarColores() {
    if (!supabaseClient) return { data: [], error: null };
    return await supabaseClient.from("color").select("*").order("nom_color");
  },

  async vincularColor(idProd, idColor) {
    return await supabaseClient.from("producto_color").insert({ id_prod: idProd, id_color: idColor });
  },

  async desvincularColor(idProd, idColor) {
    return await supabaseClient.from("producto_color").delete().eq("id_prod", idProd).eq("id_color", idColor);
  },

  // ---------- Elementos (características generales, reutilizables) ----------
  async listarElementos() {
    if (!supabaseClient) return { data: [], error: null };
    return await supabaseClient.from("elemento").select("*").order("nom_elem");
  },

  async vincularElemento(idProd, idElem) {
    return await supabaseClient.from("producto_elemento").insert({ id_prod: idProd, id_elem: idElem });
  },

  async desvincularElemento(idProd, idElem) {
    return await supabaseClient.from("producto_elemento").delete().eq("id_prod", idProd).eq("id_elem", idElem);
  },

  // ---------- Datos extra (específicos de un solo producto) ----------
  async crearDatoExtra(etiqueta, valor, idProd) {
    return await supabaseClient.rpc("insertar_detalle", { n_etiqueta: etiqueta, n_valor: valor, n_prod: idProd });
  },

  async actualizarDatoExtra(idDatExt, etiqueta, valor) {
    return await supabaseClient
      .from("dato_extra")
      .update({ etiqueta, valor })
      .eq("id_dat_ext", idDatExt);
  },

  async eliminarDatoExtra(idDatExt) {
    return await supabaseClient.from("dato_extra").delete().eq("id_dat_ext", idDatExt);
  },

  // ---------- Imágenes (máximo 10 por producto) ----------
  async subirImagen(archivo, idProd, orden) {
    const nombreArchivo = `${idProd}/${Date.now()}_${archivo.name}`;
    const { error: errorSubida } = await supabaseClient.storage
      .from(SUPABASE_BUCKET_PRODUCTOS)
      .upload(nombreArchivo, archivo);
    if (errorSubida) return { data: null, error: errorSubida };

    const { data: urlPublica } = supabaseClient.storage
      .from(SUPABASE_BUCKET_PRODUCTOS)
      .getPublicUrl(nombreArchivo);

    return await supabaseClient.rpc("insertar_imagen", {
      n_url_img: urlPublica.publicUrl,
      n_prod: idProd,
      n_orden: orden,
    });
  },

  async eliminarImagen(idImg) {
    return await supabaseClient.from("img_producto").delete().eq("id_img", idImg);
  },
};
