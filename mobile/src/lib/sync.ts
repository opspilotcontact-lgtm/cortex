// Camino de ESCRITURA a Supabase (§7). Espejo del de lectura (source.ts):
// la app sigue guardando todo en local (AsyncStorage, offline-first), y ADEMÁS
// empuja telemetría, guardados y reflexiones a la BD cuando hay sesión y la
// cápsula viene de la BD (id = uuid real). Todo fire-and-forget: si falla la
// red, la UX no se entera. La telemetría alimentará el algoritmo (§7).

import { supabase } from "./supabase";
import { InteractionAction } from "../types";

const isUuid = (s: string | null | undefined): s is string =>
  !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

// Una interacción con una cápsula (served/completed/skipped/saved/reflected…).
export async function syncInteraction(
  action: InteractionAction,
  capsuleId: string | null,
  opts?: { dwellMs?: number; responseText?: string },
): Promise<void> {
  try {
    if (!isUuid(capsuleId)) return; // cápsula del seed local → no hay fila en BD
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from("capsule_interactions").insert({
      user_id: userId,
      capsule_id: capsuleId,
      action,
      dwell_ms: opts?.dwellMs ?? null,
      response_text: opts?.responseText ?? null,
    });
  } catch {
    /* offline-first: nunca rompemos la UX por un fallo de red */
  }
}

// Guardar/quitar un ATOMO del subgrafo "mío" (§3). El ★ guarda el concepto.
export async function syncSaved(atomId: string | null | undefined, saved: boolean): Promise<void> {
  try {
    if (!isUuid(atomId)) return;
    const userId = await currentUserId();
    if (!userId) return;
    if (saved) {
      await supabase.from("saved_atoms").upsert({ user_id: userId, atom_id: atomId });
    } else {
      await supabase.from("saved_atoms").delete().eq("user_id", userId).eq("atom_id", atomId);
    }
  } catch {
    /* offline-first */
  }
}

// Una reflexión del usuario → nodo del grafo (§3, §10). Se embeberá en el pipeline.
export async function syncNote(atomId: string | null | undefined, body: string): Promise<void> {
  try {
    const text = body.trim();
    if (!text) return;
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from("user_notes").insert({
      user_id: userId,
      atom_id: isUuid(atomId) ? atomId : null, // nota libre si no hay átomo asociado
      body: text,
    });
  } catch {
    /* offline-first */
  }
}
