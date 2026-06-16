// Configuración de entorno (§4). Por defecto apunta a Supabase LOCAL: las claves
// son las demo estándar de `supabase start` — deterministas y NO secretas (el
// propio CLI avisa: "shared defaults, do not use in production").
//
// Para un backend real, define estas EXPO_PUBLIC_* en un archivo `.env` (Expo las
// inyecta en tiempo de build) y tendrán prioridad sobre estos valores locales.
//
// OJO en móvil físico (Expo Go): 127.0.0.1 es el propio teléfono, no tu PC.
// Sustituye la URL por la IP LAN de tu máquina (p.ej. http://192.168.1.50:54321).

// Default local genérico. Para Expo Go en un móvil físico, define en mobile/.env
// EXPO_PUBLIC_SUPABASE_URL=http://<IP-LAN-de-tu-PC>:54321 (p.ej. 192.168.1.148);
// el .env está en .gitignore y no ensucia el repo.
const LOCAL_URL = "http://127.0.0.1:54321";
const LOCAL_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || LOCAL_URL;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || LOCAL_ANON;

// Auto-login de desarrollo (Fase 1 aún no tiene pantalla de auth).
export const DEV_EMAIL = process.env.EXPO_PUBLIC_DEV_EMAIL || "dev@cortex.local";
export const DEV_PASSWORD = process.env.EXPO_PUBLIC_DEV_PASSWORD || "cortex-dev-1234";

// Proxy de IA (§10): guarda la API key en el servidor (server/). La app lo llama
// para sugerencias y chat. En local cae al proxy local; en producción se define
// EXPO_PUBLIC_AI_PROXY_URL en el entorno del sitio en Render (la URL del servicio
// cortex-ai-proxy). Si está vacío en prod, la IA en vivo se desactiva con elegancia.
const DEV = typeof __DEV__ !== "undefined" && __DEV__;
export const AI_PROXY_URL = process.env.EXPO_PUBLIC_AI_PROXY_URL || (DEV ? "http://127.0.0.1:8787" : "");
