// ════════════════════════════════════════════════════════════════
// Cortex · Edge Function: extract-atoms  (§9, paso 1 del pipeline)
// ════════════════════════════════════════════════════════════════
// Destila una materia (libro/skill/concepto) en knowledge atoms.
// Disparada por el worker (pg_cron + pg_net) que lee generation_jobs
// con type='extract_atoms' y status='pending'.
//
// Disciplina de API (verificada, §4/§16):
//   · Modelo claude-sonnet-4-6.
//   · NADA de temperature/top_p/budget_tokens → devuelven 400.
//   · Salida estructurada con output_config.format (json_schema),
//     NO prompting de "devuelve solo JSON".
//
// Seguridad (§0002_rls): usamos la service_role key, que SALTEA RLS.
// Por eso filtramos/escribimos SIEMPRE con el user_id del job, nunca
// confiando en que RLS nos cubra.

import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.40.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ── esquema de salida (structured outputs) ───────────────────────
const ATOMS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["atoms"],
  properties: {
    atoms: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body", "kind", "novelty_score"],
        properties: {
          title: { type: "string", description: "Titular corto, el gancho" },
          body: { type: "string", description: "La idea desarrollada, máx 3 párrafos" },
          kind: { type: "string", enum: ["core_idea", "counterintuitive", "definition", "example", "principle"] },
          novelty_score: { type: "number", description: "0-1: cuán contraintuitivo/provocador" },
          source_ref: { type: "string", description: "Página, sección o timestamp (opcional)" },
        },
      },
    },
  },
};

function systemPrompt(title: string, type: string, intent: string) {
  // §9. Español de España en el contenido generado.
  return `Eres un destilador de conocimiento. Dado el contenido de "${title}" (${type}), extrae entre 15 y 40 knowledge atoms. Cada atom es UNA idea autónoma que se entiende sola. Prioriza ideas contraintuitivas, provocadoras o que cambien la forma de ver el tema — esas enganchan. Evita resúmenes lineales y obviedades. El usuario aprende esto porque: "${intent ?? "quiere entenderlo a fondo"}". Escribe en español de España (tú, no vos). Si una idea se siente como una flashcard glorificada, descártala.`;
}

Deno.serve(async (req) => {
  let jobId: string | null = null;
  try {
    const { job_id } = await req.json();
    jobId = job_id;
    if (!jobId) return json({ error: "job_id requerido" }, 400);

    // 1. cargar y marcar el job como running
    const { data: job, error: jobErr } = await supabase
      .from("generation_jobs").select("*").eq("id", jobId).single();
    if (jobErr || !job) return json({ error: "job no encontrado" }, 404);

    await supabase.from("generation_jobs").update({ status: "running" }).eq("id", jobId);

    const { queue_id, title, type, intent, source_ref } = job.payload;
    const userId = job.user_id;

    // 2. llamar a Claude con structured outputs (sin temperature)
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: systemPrompt(title, type, intent),
      messages: [{
        role: "user",
        content: `Extrae los knowledge atoms de "${title}". Fuente/contexto: ${source_ref ?? "(usa tu conocimiento del tema)"}.`,
      }],
      output_config: { format: { type: "json_schema", schema: ATOMS_SCHEMA } },
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("sin salida de texto");
    const { atoms } = JSON.parse(textBlock.text) as { atoms: AtomDraft[] };

    // 3. insertar átomos con order_index acumulativo dentro de la materia
    const { data: last } = await supabase
      .from("knowledge_atoms").select("order_index")
      .eq("queue_id", queue_id).order("order_index", { ascending: false }).limit(1).maybeSingle();
    let order = (last?.order_index ?? -1) + 1;

    const rows = atoms.map((a) => ({
      user_id: userId,            // ← siempre el del job (service_role saltea RLS)
      queue_id,
      title: a.title,
      body: a.body,
      kind: a.kind,
      novelty_score: clamp01(a.novelty_score),
      order_index: order++,
      source_ref: a.source_ref ?? null,
      // embedding lo rellena el job 'embed' (paso 2)
    }));

    const { error: insErr } = await supabase.from("knowledge_atoms").insert(rows);
    if (insErr) throw insErr;

    // 4. encadenar el siguiente job del pipeline: embed (§9, paso 2)
    await supabase.from("generation_jobs").insert({
      user_id: userId, type: "embed", status: "pending",
      payload: { queue_id },
    });

    // 5. cerrar este job
    await supabase.from("generation_jobs").update({ status: "done" }).eq("id", jobId);

    return json({ ok: true, inserted: rows.length, usage: message.usage });
  } catch (e) {
    if (jobId) {
      await supabase.from("generation_jobs")
        .update({ status: "failed", error: String(e?.message ?? e) }).eq("id", jobId);
    }
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

// ── helpers ──────────────────────────────────────────────────────
type AtomDraft = {
  title: string; body: string;
  kind: "core_idea" | "counterintuitive" | "definition" | "example" | "principle";
  novelty_score: number; source_ref?: string;
};
const clamp01 = (n: number) => Math.max(0, Math.min(1, Number(n) || 0.5));
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
