// LA INTERFAZ DE DATOS (§4). La app pide cápsulas aquí y no sabe — ni le importa —
// de dónde vienen. Si Supabase responde, vienen de la BD; si no (offline, sin
// config, BD vacía), cae al seed local. Cambiar la fuente NO cambia la app.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, hasSupabaseConfig } from "../lib/supabase";
import { DEV_EMAIL, DEV_PASSWORD } from "../lib/env";
import { SEED_CAPSULES } from "./capsules";
import { Capsule, CapsuleFormat, QueueType, ThemeName } from "../types";

// "supabase" = en vivo · "cache" = TU feed real cacheado (offline) · "seed" = semilla embebida
export type FeedSource = "supabase" | "cache" | "seed";
export interface FeedResult {
  capsules: Capsule[];
  source: FeedSource;
}

const CACHE_KEY = "cortex_feed_cache_v1";

// Caché offline (§4/§5): el último feed real leído de Supabase se guarda en local,
// para poder leer en el bus/metro sin cobertura. No bloquea la UX si falla.
async function writeCache(caps: Capsule[]): Promise<void> {
  try { await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(caps)); } catch { /* noop */ }
}
async function readCache(): Promise<Capsule[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const caps = JSON.parse(raw) as Capsule[];
    return Array.isArray(caps) && caps.length > 0 ? caps : null;
  } catch {
    return null;
  }
}

// Fase 1 no tiene pantalla de login: si no hay sesión, entra con el usuario dev.
async function ensureSession(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return;
  const { error } = await supabase.auth.signInWithPassword({ email: DEV_EMAIL, password: DEV_PASSWORD });
  if (error) throw error;
}

// fila normalizada (capsule + atom + queue) → Cápsula que el renderer entiende.
interface Row {
  id: string;
  format: CapsuleFormat;
  payload: unknown;
  reflection_prompt: string | null;
  estimated_seconds: number | null;
  atom: { id: string; novelty_score: number | null; queue: { title: string; type: QueueType; theme: ThemeName } | null } | null;
}

function mapRow(row: Row): Capsule | null {
  const queue = row.atom?.queue;
  if (!queue) return null;
  return {
    id: row.id,
    atom_id: row.atom?.id ?? null,
    format: row.format,
    payload: row.payload,
    reflection_prompt: row.reflection_prompt ?? "",
    estimated_seconds: row.estimated_seconds ?? 60,
    novelty_score: row.atom?.novelty_score ?? 0.5,
    queue: { title: queue.title, type: queue.type, theme: queue.theme },
  } as Capsule;
}

// Cascada offline-first (§4/§5): Supabase en vivo → caché del último feed real → seed embebido.
export async function loadFeed(): Promise<FeedResult> {
  if (hasSupabaseConfig) {
    try {
      await ensureSession();
      const { data, error } = await supabase
        .from("capsules")
        .select(
          "id, format, payload, reflection_prompt, estimated_seconds, atom:knowledge_atoms!primary_atom_id(id, novelty_score, queue:learning_queues(title, type, theme))",
        )
        .eq("status", "queued");
      if (error) throw error;
      const caps = (data as unknown as Row[]).map(mapRow).filter((c): c is Capsule => c !== null);
      if (caps.length > 0) {
        writeCache(caps); // refresca la caché para el próximo uso offline
        return { capsules: caps, source: "supabase" };
      }
    } catch {
      // sin red / fallo → intentamos la caché antes de rendirnos al seed
    }
  }
  const cached = await readCache();
  if (cached) return { capsules: cached, source: "cache" };
  return { capsules: SEED_CAPSULES, source: "seed" };
}
