/* =========================================================
   HELLMET — Services / Categoria.js
   Todo lo relacionado a la tabla "categoria" vive aquí.
   ========================================================= */

const CategoriaService = {
  async listar() {
    if (!supabaseClient) return { data: [], error: null };
    return await supabaseClient.from("categoria").select("*").order("nom_cate");
  },

  /** Busca una categoría por nombre (case-insensitive). La tabla "categoria"
   *  no tiene columna "slug", así que cada página pública (Hornos.html, etc.)
   *  llama esto con su propio nombre fijo (ej: "HORNOS"). */
  async obtenerPorNombre(nombre) {
    if (!supabaseClient) return null;
    const { data, error } = await supabaseClient
      .from("categoria")
      .select("*")
      .ilike("nom_cate", nombre)
      .single();
    if (error) return null;
    return data;
  },
};
