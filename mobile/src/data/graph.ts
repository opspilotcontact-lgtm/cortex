// Grafo personal (§3, §5, §11). Nodos = átomos guardados (+ notas); aristas =
// puentes (bridges). Crear un puente manual inserta en `bridges` (origin
// 'user_created') Y genera una cápsula `bridge` status='queued' → el motor §7
// la vuelve a servir en el Flow: el pensamiento del usuario alimenta el feed.

import { supabase, hasSupabaseConfig } from "../lib/supabase";
import { ThemeName } from "../types";

export interface GraphNode {
  id: string;        // atom id (o note:<id>)
  label: string;
  queueTitle: string;
  theme: ThemeName;
  kind: "atom" | "note";
}
export interface GraphEdge {
  a: string;
  b: string;
  origin: "ai_detected" | "user_created";
  strength: number;
}
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function loadGraph(): Promise<GraphData> {
  if (!hasSupabaseConfig) return { nodes: [], edges: [] };
  try {
    // nodos: átomos guardados (subgrafo "mío")
    const saved = await supabase
      .from("saved_atoms")
      .select("atom:knowledge_atoms!inner(id, title, queue:learning_queues(title, theme))");
    const notes = await supabase.from("user_notes").select("id, body, atom_id");
    const bridges = await supabase.from("bridges").select("atom_a_id, atom_b_id, origin, strength");

    const nodes: GraphNode[] = [];
    for (const r of (saved.data ?? []) as any[]) {
      const a = r.atom;
      if (!a) continue;
      nodes.push({
        id: a.id,
        label: a.title,
        queueTitle: a.queue?.title ?? "",
        theme: (a.queue?.theme ?? "neutral") as ThemeName,
        kind: "atom",
      });
    }
    for (const n of (notes.data ?? []) as any[]) {
      nodes.push({ id: `note:${n.id}`, label: n.body, queueTitle: "Mis notas", theme: "neutral", kind: "note" });
    }
    const edges: GraphEdge[] = ((bridges.data ?? []) as any[]).map((b) => ({
      a: b.atom_a_id, b: b.atom_b_id, origin: b.origin, strength: b.strength ?? 0.5,
    }));
    return { nodes, edges };
  } catch {
    return { nodes: [], edges: [] };
  }
}

// Crea un puente manual entre dos átomos: fila en `bridges` + cápsula servible.
export async function createUserBridge(a: GraphNode, b: GraphNode): Promise<boolean> {
  try {
    const userId = await uid();
    if (!userId || a.kind !== "atom" || b.kind !== "atom") return false;
    const bridge = await supabase
      .from("bridges")
      .insert({
        user_id: userId, atom_a_id: a.id, atom_b_id: b.id,
        origin: "user_created", rationale: "Tú conectaste estas dos ideas.", strength: 0.7,
      })
      .select("id")
      .single();
    if (bridge.error) return false;
    // cápsula bridge para que el motor §7 la sirva (P_bridge)
    await supabase.from("capsules").insert({
      user_id: userId, format: "bridge", bridge_id: bridge.data.id, primary_atom_id: a.id,
      payload: {
        atom_a: { title: a.label, queue: a.queueTitle },
        atom_b: { title: b.label, queue: b.queueTitle },
        rationale: "Tú viste una conexión entre estas dos ideas. Mereció la pena pararse en ella.",
        question: `¿Qué patrón profundo comparten «${a.label}» y «${b.label}»?`,
      },
      reflection_prompt: "Esa conexión que hiciste, ¿dónde más la has visto aparecer?",
      estimated_seconds: 60, status: "queued", priority: 0.9,
    });
    return true;
  } catch {
    return false;
  }
}
