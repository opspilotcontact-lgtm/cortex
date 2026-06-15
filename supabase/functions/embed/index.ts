// ════════════════════════════════════════════════════════════════
// Cortex · Edge Function: embed  (§9, paso 2 del pipeline)
// ════════════════════════════════════════════════════════════════
// Genera embeddings (Voyage) de los átomos sin vector y los guarda. Luego
// encadena el job detect_bridges. Disparada por el worker (pg_cron + pg_net)
// tras extract_atoms, o invocable directamente.
//
// Seguridad (§6): service_role saltea RLS → escribimos siempre con el user_id
// del job. Requiere VOYAGE_API_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const VOYAGE_KEY = Deno.env.get("VOYAGE_API_KEY")!;

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });

Deno.serve(async (req) => {
  let jobId: string | null = null;
  try {
    const { job_id, queue_id, user_id } = await req.json();
    jobId = job_id ?? null;
    if (!queue_id || !user_id) return json({ error: "queue_id y user_id requeridos" }, 400);
    if (jobId) await admin.from("generation_jobs").update({ status: "running" }).eq("id", jobId);

    // átomos de la materia que aún no tienen embedding
    const { data: atoms, error } = await admin
      .from("knowledge_atoms").select("id, title, body")
      .eq("queue_id", queue_id).is("embedding", null).limit(128);
    if (error) throw error;
    if (!atoms?.length) {
      if (jobId) await admin.from("generation_jobs").update({ status: "done" }).eq("id", jobId);
      return json({ ok: true, embedded: 0 });
    }

    // Voyage: un lote (voyage-3 = 1024 dims, alineado con vector(1024))
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${VOYAGE_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "voyage-3", input: atoms.map((a) => `${a.title}\n\n${a.body}` ) }),
    });
    if (!res.ok) throw new Error(`Voyage ${res.status}: ${await res.text()}`);
    const { data: embs } = await res.json();

    for (let i = 0; i < atoms.length; i++) {
      await admin.from("knowledge_atoms")
        .update({ embedding: JSON.stringify(embs[i].embedding) })
        .eq("id", atoms[i].id);
    }

    // encadenar detección de puentes (§9, paso 3)
    await admin.from("generation_jobs").insert({ user_id, type: "detect_bridges", status: "pending", payload: { queue_id } });
    if (jobId) await admin.from("generation_jobs").update({ status: "done" }).eq("id", jobId);
    return json({ ok: true, embedded: atoms.length });
  } catch (e) {
    if (jobId) await admin.from("generation_jobs").update({ status: "failed", error: String((e as Error)?.message ?? e) }).eq("id", jobId);
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
