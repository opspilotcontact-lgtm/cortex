// Cliente Supabase (§4, §6). En RN el almacenamiento de la sesión es AsyncStorage
// (no hay localStorage). El polyfill de URL es obligatorio: supabase-js usa la
// API URL/URLSearchParams que Hermes/RN no traen completas.

import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

// Siempre hay config (por defecto, Supabase local). Si la red falla en runtime,
// la capa de datos (source.ts) cae al seed local sin romper la UX.
export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // RN no tiene URL de redirección OAuth en este flujo
  },
});
