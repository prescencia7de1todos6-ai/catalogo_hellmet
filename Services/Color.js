/* =========================================================
   HELLMET — Services / Color.js
   CRUD de la tabla "color" (catálogo de colores disponibles).
   Los colores se vinculan a cada producto desde la página
   Productos.html; aquí solo se administran los colores en sí.
   ========================================================= */

const ColorService = {
  async listar() {
    if (!supabaseClient) return { data: [], error: null };
    return await supabaseClient.from("color").select("*").order("nom_color");
  },

  /** Genera el id manualmente (COL_001, COL_002...) porque la tabla
   *  "color" no tiene una función SQL de inserción como producto o sucursal. */
  async crear(nomColor) {
    const { data: existentes, error: errorLista } = await supabaseClient
      .from("color")
      .select("id_color")
      .order("id_color", { ascending: false })
      .limit(1);

    if (errorLista) return { error: errorLista };

    let siguiente = 1;
    if (existentes && existentes.length > 0) {
      const ultimo = parseInt(existentes[0].id_color.replace("COL_", ""), 10);
      if (!isNaN(ultimo)) siguiente = ultimo + 1;
    }
    const nuevoId = "COL_" + String(siguiente).padStart(3, "0");

    return await supabaseClient.from("color").insert({ id_color: nuevoId, nom_color: nomColor });
  },

  async actualizar(idColor, nomColor) {
    return await supabaseClient.from("color").update({ nom_color: nomColor }).eq("id_color", idColor);
  },

  /** Ojo: si el color está vinculado a algún producto, Supabase va a
   *  rechazar el borrado por la llave foránea de producto_color. */
  async eliminar(idColor) {
    return await supabaseClient.from("color").delete().eq("id_color", idColor);
  },
};
