/* =========================================================
   HELLMET — Services / Supabase.js
   =========================================================
   ÚNICO LUGAR DONDE VAN TUS LLAVES DE SUPABASE.

   Cómo obtenerlas: Project Settings -> API en tu proyecto
   de Supabase. Copia "Project URL" y "anon public key".
   La anon key es segura para el navegador — la seguridad
   real la dan las políticas RLS de cada tabla.

   Orden de carga en el HTML (siempre en este orden):
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="RUTA/Services/Supabase.js"></script>
     ... el resto de los Services que necesites ...
   ========================================================= */

const SUPABASE_URL = "https://zdfljhgxoyccsyljhqri.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fshkZejvNfN1qQEJOw9-Hg_OaAhG_rf";
const SUPABASE_BUCKET_PRODUCTOS = "productos_imagen";

let supabaseClient = null;

if (SUPABASE_URL.startsWith("http") && typeof supabase !== "undefined") {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn(
    "[HELLMET] Supabase no está configurado todavía. Edita Services/Supabase.js " +
    "y pega tu URL y anon key."
  );
}
