// Núcleo de ingesta (§9, paso de empaquetado). Mapea cápsulas con forma de app
// (desnormalizadas) → esquema normalizado (queue → atom → capsule). Lo usan
// tanto el seed bulk (seed-db) como el alimentador continuo (generate).
//
// Es idempotente POR MATERIA: reingerir una fuente reemplaza esa materia y deja
// las demás intactas. La fuente puede venir de Claude (yo, ahora) o del pipeline
// de IA (extract-atoms, mañana) — la forma es la misma.

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import type { Capsule } from "../../src/types";

const LOCAL_URL = "http://127.0.0.1:54321";
const LOCAL_SERVICE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

export function makeAdminClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL || LOCAL_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || LOCAL_SERVICE;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Crea (o reutiliza) el usuario de desarrollo dueño del contenido sembrado.
export async function ensureDevUser(db: SupabaseClient, email: string, password: string): Promise<string> {
  const list = await db.auth.admin.listUsers();
  if (list.error) throw list.error;
  let userId = list.data.users.find((u) => u.email === email)?.id;
  if (!userId) {
    const created = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error) throw created.error;
    userId = created.data.user!.id;
  }
  await db.from("profiles").upsert({ id: userId, display_name: "Dev", daily_capsule_goal: 5 });
  return userId;
}

// ── derivaciones cápsula (app) → átomo (BD) ───────────────────────
export function atomTitle(c: Capsule): string {
  switch (c.format) {
    case "narrative": return c.payload.slides[0].text;
    case "interactive": return c.payload.scenario;
    case "bridge": return c.payload.question;
    case "visual": return c.payload.caption;
    case "recall": return c.payload.prompt;
    case "stat": return c.payload.claim;
    case "motion": return c.payload.title;
  }
}
export function atomBody(c: Capsule): string {
  switch (c.format) {
    case "narrative": return c.payload.slides.map((s) => s.text).join("\n\n");
    case "interactive": return `${c.payload.scenario}\n\n${c.payload.insight}`;
    case "bridge": return c.payload.rationale;
    case "visual": return c.payload.caption;
    case "recall": return c.payload.reveal;
    case "stat": return `${c.payload.figure} ${c.payload.unit ?? ""}\n\n${c.payload.claim}\n\n${c.payload.reveal}`;
    case "motion": return `${c.payload.title}\n\n${c.payload.caption}`;
  }
}
export const atomKind = (c: Capsule) => (c.novelty_score > 0.8 ? "counterintuitive" : "core_idea");

export interface IngestResult { queues: number; atoms: number; capsules: number }

export async function ingestCapsules(
  db: SupabaseClient,
  userId: string,
  capsules: Capsule[],
  opts?: { intentByQueue?: Record<string, string> },
): Promise<IngestResult> {
  // materias distintas presentes en el lote
  const queues = new Map<string, { type: string; theme: string }>();
  for (const c of capsules) {
    if (!queues.has(c.queue.title)) queues.set(c.queue.title, { type: c.queue.type, theme: c.queue.theme });
  }

  const result: IngestResult = { queues: 0, atoms: 0, capsules: 0 };

  for (const [title, meta] of queues) {
    // idempotente: borrar la materia (cascade → atoms, capsules) y recrear
    await db.from("learning_queues").delete().eq("user_id", userId).eq("title", title);

    const queueId = randomUUID();
    const qIns = await db.from("learning_queues").insert({
      id: queueId, user_id: userId, title, type: meta.type, theme: meta.theme,
      status: "active", intent: opts?.intentByQueue?.[title] ?? null,
    });
    if (qIns.error) throw qIns.error;
    result.queues++;

    // el trigger enqueue_extraction encola un job extract_atoms; aquí los átomos
    // ya vienen dados (autoría humana/Claude), así que retiramos ese job espurio.
    await db.from("generation_jobs").delete()
      .eq("user_id", userId).eq("type", "extract_atoms")
      .filter("payload->>queue_id", "eq", queueId);

    const inQueue = capsules.filter((c) => c.queue.title === title);
    const atomRows = inQueue.map((c, i) => ({
      id: randomUUID(), user_id: userId, queue_id: queueId,
      title: atomTitle(c).slice(0, 200), body: atomBody(c),
      kind: atomKind(c), novelty_score: c.novelty_score, order_index: i,
    }));
    const capsuleRows = inQueue.map((c, i) => ({
      id: randomUUID(), user_id: userId, format: c.format, primary_atom_id: atomRows[i].id,
      payload: c.payload, reflection_prompt: c.reflection_prompt,
      estimated_seconds: c.estimated_seconds, status: "queued", priority: c.novelty_score,
    }));

    const a = await db.from("knowledge_atoms").insert(atomRows);
    if (a.error) throw a.error;
    const cc = await db.from("capsules").insert(capsuleRows);
    if (cc.error) throw cc.error;
    result.atoms += atomRows.length;
    result.capsules += capsuleRows.length;
  }

  return result;
}
