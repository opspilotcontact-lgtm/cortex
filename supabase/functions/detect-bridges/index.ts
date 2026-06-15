// ════════════════════════════════════════════════════════════════
// Cortex · Edge Function: detect-bridges  (§9 paso 3, §3 — la magia)
// ════════════════════════════════════════════════════════════════
// La "IA que controla el grafo": por cada átomo nuevo, busca vecinos semánticos
// en OTRAS materias (match_cross_queue, pgvector) y Opus 4.8 juzga si hay un
// puente estructural REAL y no obvio. Si lo hay → fila en `bridges`
// (origin ai_detected) + cápsula `bridge` servible → vuelve al Flow y al grafo.
//
// API (§4/§9, verificado): Opus 4.8 con thinking adaptativo + effort high (el
// tipo de razonamiento profundo que justifica el thinking), salida estructurada
// con output_config.format. NADA de temperature/budget_tokens.
// Seguridad (§6): service_role + filtro user_id explícito (match_cross_queue).

import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.40.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });

const BRIDGE_SCHEMA = {
  type: "object", additionalProperties: false, required: ["bridge"],
  properties: {
    bridge: { type: "boolean", description: "¿hay conexión estructural profunda y no obvia?" },
    rationale: { type: "string", description: "2-3 frases que provoquen un «ajá»" },
    strength: { type: "number", description: "0-1, fuerza del puente" },
    question: { type: "string", description: "pregunta que dispara la conexión" },
  },
};
const SYSTEM = "Te doy dos ideas de campos distintos. Decide si existe una conexión estructural PROFUNDA y NO OBVIA entre ellas (mismo patrón subyacente, no mera coincidencia temática). Si la hay, explica el puente en 2-3 frases que provoquen un «ajá» y puntúa su fuerza 0-1, con una pregunta que la dispare. Si no la hay, bridge=false. Español de España.";

Deno.serve(async (req) => {
  let jobId: string | null = null;
  try {
    const { job_id, queue_id, user_id } = await req.json();
    jobId = job_id ?? null;
    if (!queue_id || !user_id) return json({ error: "queue_id y user_id requeridos" }, 400);
    if (jobId) await admin.from("generation_jobs").update({ status: "running" }).eq("id", jobId);

    // mapa queue_id → título (para el payload de la cápsula)
    const { data: queues } = await admin.from("learning_queues").select("id, title").eq("user_id", user_id);
    const qTitle: Record<string, string> = {};
    (queues ?? []).forEach((q: any) => (qTitle[q.id] = q.title));

    const { data: atoms } = await admin
      .from("knowledge_atoms").select("id, title, body, queue_id, embedding")
      .eq("queue_id", queue_id).not("embedding", "is", null).limit(40);

    let created = 0;
    for (const a of atoms ?? []) {
      const { data: cands } = await admin.rpc("match_cross_queue", { p_user_id: user_id, p_embedding: a.embedding, p_exclude_queue: queue_id, p_k: 3 });
      for (const c of (cands ?? []) as any[]) {
        if (c.similarity < 0.4) continue; // demasiado lejano, ni preguntamos a Opus

        // ¿ya existe ese puente (en cualquier dirección)?
        const { data: dup } = await admin.from("bridges").select("id")
          .eq("user_id", user_id)
          .or(`and(atom_a_id.eq.${a.id},atom_b_id.eq.${c.id}),and(atom_a_id.eq.${c.id},atom_b_id.eq.${a.id})`)
          .maybeSingle();
        if (dup) continue;

        // juicio de Opus
        const msg = await anthropic.messages.create({
          model: "claude-opus-4-8", max_tokens: 1200, system: SYSTEM,
          messages: [{ role: "user", content: `Idea A (${qTitle[a.queue_id] ?? "?"}): ${a.title} — ${a.body}\n\nIdea B (${qTitle[c.queue_id] ?? "?"}): ${c.title} — ${c.body}` }],
          thinking: { type: "adaptive" },
          output_config: { effort: "high", format: { type: "json_schema", schema: BRIDGE_SCHEMA } },
        } as any);
        const block = (msg.content as any[]).find((b) => b.type === "text");
        if (!block) continue;
        const j = JSON.parse(block.text);
        if (!j.bridge || (j.strength ?? 0) < 0.5) continue;

        const br = await admin.from("bridges").insert({
          user_id, atom_a_id: a.id, atom_b_id: c.id, origin: "ai_detected",
          rationale: j.rationale, strength: Math.max(0, Math.min(1, j.strength)),
        }).select("id").single();
        if (br.error) continue;

        await admin.from("capsules").insert({
          user_id, format: "bridge", bridge_id: br.data.id, primary_atom_id: a.id,
          payload: {
            atom_a: { title: a.title, queue: qTitle[a.queue_id] ?? "" },
            atom_b: { title: c.title, queue: qTitle[c.queue_id] ?? "" },
            rationale: j.rationale, question: j.question ?? "¿Qué patrón comparten?",
          },
          reflection_prompt: "¿Qué otra idea tuya late con este mismo patrón?",
          estimated_seconds: 65, status: "queued", priority: 0.95,
        });
        created++;
      }
    }

    // encadenar empaquetado de cápsulas (§9 paso 4) — opcional, lo cubre el ingest
    await admin.from("generation_jobs").insert({ user_id, type: "build_capsules", status: "pending", payload: { queue_id } });
    if (jobId) await admin.from("generation_jobs").update({ status: "done" }).eq("id", jobId);
    return json({ ok: true, bridges: created });
  } catch (e) {
    if (jobId) await admin.from("generation_jobs").update({ status: "failed", error: String((e as Error)?.message ?? e) }).eq("id", jobId);
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
