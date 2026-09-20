/* =========================================================
   HELLMET — Services / Reporte.js
   =========================================================
   Lee la vista "vista_reporte_cambios" de Supabase, que une
   producto + sucursal + red_social con los datos del
   administrador que registró o actualizó cada uno.

   La vista hay que crearla una sola vez en Supabase — el SQL
   está en LEEME-SUPABASE.md, sección "Reporte de cambios".

   Nota: con el esquema actual, los productos no guardan quién
   los editó (no existe id_admin_act en esa tabla) y las redes
   sociales no guardan fecha de registro. Esos campos llegan
   vacíos y la página los muestra como "—".
   ========================================================= */

const ReporteService = {
  async listarCambios() {
    if (!supabaseClient) return { data: [], error: null };
    return await supabaseClient
      .from("vista_reporte_cambios")
      .select("*")
      .order("fecha_registro", { ascending: false, nullsFirst: false });
  },
};
