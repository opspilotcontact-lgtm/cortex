// Motor proactivo (§2, pilares 2+3): la IA TE ENTIENDE y TE TRAE contenido.
// Lee tu grafo real (materias activas, sus intenciones, lo que has guardado y
// los puentes que has tendido) y Claude propone materias NUEVAS a tu medida,
// conectadas con lo que ya te mueve. Es "te entiende tus motivaciones".
//
//   npm run suggest
//
// Necesita ANTHROPIC_API_KEY (o mobile/anthropic.key).

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { makeAdminClient, ensureDevUser } from "./lib/ingest";
import { SEED_CAPSULES } from "../src/data/capsules";

function readKey(): string {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim();
  const f = resolve("anthropic.key");
  if (existsSync(f)) return readFileSync(f, "utf8").trim();
  throw new Error("Falta la API key (ANTHROPIC_API_KEY o mobile/anthropic.key)");
}

const SYSTEM = [
  "Eres el segundo cerebro de quien usa Cortex. Conoces lo que ya aprende y lo que le mueve.",
  "Propón 3 materias NUEVAS que le encajarían — ni demasiado obvias ni desconectadas: el punto dulce entre lo que ya le interesa y lo que aún no sabe que necesita.",
  "Para cada una: title (concreto, un libro/tema), why (2 frases atando con SU grafo: «como conectas X con Y, esto te daría Z»), intent (para qué le serviría), theme (uno de: habits, systems, behavioral, stoic, wealth, influence, negotiation, manson, ignite, titans).",
  "Español de España. Devuelve SOLO JSON: {\"suggestions\":[{title,why,intent,theme}]}. Sin markdown.",
].join(" ");

async function main() {
  // ── modelo del usuario: su grafo (BD) con fallback al seed si no hay BD ──
  let materias = "", guardadas = "", puentes = "";
  try {
    const db = makeAdminClient();
    const userId = await ensureDevUser(db, "dev@cortex.local", "cortex-dev-1234");
    const queues = await db.from("learning_queues").select("title, intent").eq("user_id", userId);
    if (queues.error) throw queues.error;
    const saved = await db.from("saved_atoms").select("atom:knowledge_atoms!inner(title, queue:learning_queues(title))").eq("user_id", userId);
    const bridges = await db.from("bridges").select("rationale").eq("user_id", userId).limit(8);
    materias = (queues.data ?? []).map((q: any) => `- ${q.title}${q.intent ? ` (porque: ${q.intent})` : ""}`).join("\n");
    guardadas = (saved.data ?? []).map((s: any) => `- ${s.atom?.title} [${s.atom?.queue?.title}]`).join("\n");
    puentes = (bridges.data ?? []).map((b: any) => `- ${b.rationale}`).join("\n");
  } catch {
    // BD no disponible (Docker/Supabase parado) → derivamos del seed embebido
    const titles = [...new Set(SEED_CAPSULES.map((c) => c.queue.title))];
    materias = titles.map((t) => `- ${t}`).join("\n");
    guardadas = "(sin BD: usando las materias del seed)";
    puentes = "";
  }

  const context = [
    `MATERIAS ACTIVAS Y MOTIVACIONES:\n${materias || "(ninguna)"}`,
    `\nIDEAS QUE HA GUARDADO (lo que le resonó):\n${guardadas || "(ninguna)"}`,
    `\nCONEXIONES QUE HA TENDIDO:\n${puentes || "(ninguna)"}`,
  ].join("\n");

  console.log("⟳ Analizando tu grafo y pensando qué te traería…\n");
  const anthropic = new Anthropic({ apiKey: readKey() });
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6", max_tokens: 1500, system: SYSTEM,
    messages: [{ role: "user", content: context }],
  } as any);
  const block = (msg.content as any[]).find((b) => b.type === "text");
  const raw = block.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const { suggestions } = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));

  console.log("✦ Cortex te sugiere:\n");
  for (const s of suggestions) {
    console.log(`  📘 ${s.title}  [mundo: ${s.theme}]`);
    console.log(`     ${s.why}`);
    console.log(`     → ${s.intent}\n`);
  }
  console.log("Para generar una: npm run generate:ai -- \"<title>\" <theme> \"<intent>\"");
}

main().catch((e) => { console.error("✗", e?.message ?? e); process.exit(1); });
