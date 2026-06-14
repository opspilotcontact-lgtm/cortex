// Modo Depth — aportar y consultar tu propia mente (§2, §10).
// · addNote: apuntar una idea → user_notes (nodo del grafo).
// · addQueue: declarar una materia nueva → learning_queues (el trigger encola la
//   extracción; con API key el pipeline la rellena, §9).
// · searchMemory: RECUPERACIÓN sin IA sobre tus átomos + notas (la base del RAG,
//   §10). La respuesta conversacional de la IA es la capa que enciende la key.

import { supabase, hasSupabaseConfig } from "../lib/supabase";
import { QueueType, ThemeName } from "../types";

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export interface MemoryHit {
  kind: "atom" | "note";
  id: string;
  title: string;
  body: string;
  queueTitle?: string;
  theme?: ThemeName;
}

export async function addNote(body: string): Promise<boolean> {
  try {
    const text = body.trim();
    if (!text || !hasSupabaseConfig) return false;
    const userId = await uid();
    if (!userId) return false;
    const r = await supabase.from("user_notes").insert({ user_id: userId, body: text, atom_id: null });
    return !r.error;
  } catch {
    return false;
  }
}

export async function addQueue(input: { title: string; type: QueueType; theme: ThemeName; intent?: string }): Promise<boolean> {
  try {
    const title = input.title.trim();
    if (!title || !hasSupabaseConfig) return false;
    const userId = await uid();
    if (!userId) return false;
    const r = await supabase.from("learning_queues").insert({
      user_id: userId, title, type: input.type, theme: input.theme,
      intent: input.intent?.trim() || null, status: "active",
    });
    return !r.error;
  } catch {
    return false;
  }
}

// Respuesta conversacional de la IA (§10 RAG): invoca la Edge Function `chat`.
// Devuelve null si no hay key/EF (sin red, sin desplegar) → el cliente cae a la
// recuperación de searchMemory. El día que la EF esté servida con ANTHROPIC_API_KEY,
// esto empieza a responder sin tocar nada más.
export async function askAI(question: string): Promise<{ answer: string; sources: number } | null> {
  if (!question.trim() || !hasSupabaseConfig) return null;
  const invoke = supabase.functions
    .invoke("chat", { body: { question } })
    .then((r) => (r.error || typeof r.data?.answer !== "string" || !r.data.answer ? null : { answer: r.data.answer as string, sources: (r.data.sources as number) ?? 0 }))
    .catch(() => null);
  // si la EF no está servida o tarda (cold start, sin key), no bloqueamos la UI
  const timeout = new Promise<null>((res) => setTimeout(() => res(null), 9000));
  return Promise.race([invoke, timeout]);
}

// Recuperación sobre el grafo del usuario (texto; sin embeddings todavía).
export async function searchMemory(query: string): Promise<MemoryHit[]> {
  const term = query.replace(/[%,()]/g, " ").trim();
  if (!term || !hasSupabaseConfig) return [];
  try {
    const sel = "id, title, body, queue:learning_queues(title, theme)";
    const [byTitle, byBody, notes] = await Promise.all([
      supabase.from("knowledge_atoms").select(sel).ilike("title", `%${term}%`).limit(6),
      supabase.from("knowledge_atoms").select(sel).ilike("body", `%${term}%`).limit(6),
      supabase.from("user_notes").select("id, body").ilike("body", `%${term}%`).limit(4),
    ]);
    const seen = new Set<string>();
    const hits: MemoryHit[] = [];
    for (const r of [...(byTitle.data ?? []), ...(byBody.data ?? [])] as any[]) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      hits.push({ kind: "atom", id: r.id, title: r.title, body: r.body, queueTitle: r.queue?.title, theme: r.queue?.theme });
    }
    for (const n of (notes.data ?? []) as any[]) hits.push({ kind: "note", id: n.id, title: "Tu nota", body: n.body });
    return hits.slice(0, 10);
  } catch {
    return [];
  }
}
