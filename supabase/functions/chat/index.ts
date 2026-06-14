// ════════════════════════════════════════════════════════════════
// Cortex · Edge Function: chat  (§10 — RAG sobre el grafo personal)
// ════════════════════════════════════════════════════════════════
// El usuario pregunta desde "Tu mente"; respondemos con Claude usando SU
// contexto (lo que ha visto, guardado y escrito), no como ChatGPT genérico.
//
// Seguridad (§6, la trampa de Presupuestador): usamos service_role (saltea RLS),
// así que filtramos SIEMPRE por el user_id del JWT del que llama. Nunca confiar
// en que RLS nos cubra con service_role.
//
// Recuperación: por ahora TEXTO (ilike). Cuando haya embeddings (Voyage), se
// cambia por match_knowledge (vector) sin tocar el cliente.
//
// Requiere el secreto ANTHROPIC_API_KEY. En local: `supabase functions serve`
// con el secreto, o añadirlo a supabase/functions/.env.

import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.40.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });

const SYSTEM = [
  "Eres el segundo cerebro de quien te pregunta — su pensamiento, no un manual.",
  "Responde en ESPAÑOL DE ESPAÑA (tú, no vos), breve (2-4 frases) y con chispa.",
  "Usa SOLO el contexto que te paso (lo que esta persona ha visto, guardado y escrito).",
  "Conecta ideas entre sus materias y, si detectas una contradicción entre sus notas, señálala.",
  "Si su contexto no alcanza para responder bien, dilo con honestidad y sugiere qué le convendría aprender.",
].join(" ");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: u } = await admin.auth.getUser(jwt);
    const userId = u.user?.id;
    if (!userId) return json({ error: "no autenticado" }, 401);

    const { question } = await req.json();
    if (!question || typeof question !== "string") return json({ error: "falta question" }, 400);
    const term = question.replace(/[%,()]/g, " ").trim().slice(0, 80);

    // recuperación filtrada por user_id (§6) — texto por ahora
    const [atoms, notes] = await Promise.all([
      admin.from("knowledge_atoms").select("title, body, queue:learning_queues(title)")
        .eq("user_id", userId).or(`title.ilike.%${term}%,body.ilike.%${term}%`).limit(8),
      admin.from("user_notes").select("body").eq("user_id", userId).ilike("body", `%${term}%`).limit(4),
    ]);
    const context = [
      ...(atoms.data ?? []).map((a: any) => `- [${a.queue?.title ?? "?"}] ${a.title}: ${a.body}`),
      ...(notes.data ?? []).map((n: any) => `- (tu nota) ${n.body}`),
    ].join("\n");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: "user", content: `Mi pregunta: ${question}\n\nMi conocimiento relevante:\n${context || "(no hay nada en mi grafo sobre esto)"}` }],
    });
    const text = (message.content as any[]).find((b) => b.type === "text")?.text ?? "";
    return json({ answer: text, sources: (atoms.data?.length ?? 0) + (notes.data?.length ?? 0) });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
