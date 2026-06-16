// Proxy de IA de Cortex (§4, §10). La API key de Anthropic vive SOLO aquí (en el
// servidor) — nunca llega al navegador. La app del enlace público llama a estos
// endpoints. Disciplina de API (verificada): claude-sonnet-4-6, JSON guiado por
// prompt (los structured outputs dan "Grammar compilation timed out"), SIN
// temperature/budget_tokens.
//
//   POST /suggest  {userModel, materias[]}            -> {suggestions:[{title,why,intent,theme}]}
//   POST /chat     {question, userModel, memory[]}    -> {answer}
//   GET  /health                                       -> {ok:true}
//
// La key se lee de ANTHROPIC_API_KEY (Render env). En local cae a ../mobile/anthropic.key.

import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function readKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim();
  const f = resolve(__dirname, "../mobile/anthropic.key");
  if (existsSync(f)) return readFileSync(f, "utf8").trim();
  throw new Error("Falta ANTHROPIC_API_KEY (env del servidor) o ../mobile/anthropic.key en local");
}

const anthropic = new Anthropic({ apiKey: readKey() });
const THEMES = ["habits", "systems", "behavioral", "stoic", "wealth", "influence", "negotiation", "manson", "ignite", "titans"];

// extrae el primer objeto JSON de una respuesta (tolera ```json y prosa alrededor)
function parseJson(text) {
  const raw = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = raw.indexOf("{"), end = raw.lastIndexOf("}");
  return JSON.parse(start >= 0 ? raw.slice(start, end + 1) : raw);
}

function textOf(msg) {
  const block = (msg.content || []).find((b) => b.type === "text");
  if (!block) throw new Error("Claude no devolvió texto");
  return block.text;
}

// ── prompts (coherentes con scripts/suggest.ts y la capa de chat) ──
const SUGGEST_SYSTEM = [
  "Eres el segundo cerebro de quien usa Cortex. Conoces lo que ya aprende y lo que le mueve.",
  "Propón 3 materias NUEVAS que le encajarían — ni obvias ni desconectadas: el punto dulce entre lo que ya le interesa y lo que aún no sabe que necesita.",
  "Para cada una: title (concreto, un libro/tema), why (2 frases atando con SU grafo y SUS motivaciones: «como te mueve X y ya tienes Y, esto te daría Z»), intent (para qué le serviría), theme (uno de: " + THEMES.join(", ") + ").",
  "Español de España (tú, no vos). Devuelve SOLO JSON: {\"suggestions\":[{title,why,intent,theme}]}. Sin markdown.",
].join(" ");

const CHAT_SYSTEM = [
  "Eres el segundo cerebro de quien usa Cortex: cálido, directo, un buen profesor. No eres un asistente genérico.",
  "Conversa y DIVAGA con la persona sobre lo que pregunta, apoyándote en lo que ya sabe (su conocimiento) cuando venga al caso, y conectando ideas entre sí.",
  "Si su conocimiento no cubre algo, dilo y aporta tú, breve. No inventes que algo está en su grafo si no aparece.",
  "Español de España (tú, no vos). Responde en 2-5 frases, con chispa, sin relleno ni listas largas. Termina a veces con una pregunta que invite a seguir pensando.",
].join(" ");

function userBlock(userModel) {
  if (!userModel) return "";
  const parts = [];
  if (userModel.motivations) parts.push(`Le mueve: ${userModel.motivations}`);
  if (userModel.goals) parts.push(`Quiere conseguir: ${userModel.goals}`);
  if (userModel.interests) parts.push(`Le interesan: ${userModel.interests}`);
  return parts.length ? `QUIÉN ES:\n${parts.join("\n")}\n\n` : "";
}

const app = express();
app.use(cors()); // respuestas sin secretos; la key nunca sale → CORS abierto es seguro
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "cortex-ai-proxy" }));

app.post("/suggest", async (req, res) => {
  try {
    const { userModel, materias = [] } = req.body || {};
    const context =
      userBlock(userModel) +
      `MATERIAS ACTIVAS:\n${(materias.length ? materias.map((m) => `- ${m}`).join("\n") : "(ninguna todavía)")}`;
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6", max_tokens: 1500, system: SUGGEST_SYSTEM,
      messages: [{ role: "user", content: context }],
    });
    const { suggestions } = parseJson(textOf(msg));
    res.json({ suggestions: (suggestions || []).filter((s) => s && s.title && THEMES.includes(s.theme)) });
  } catch (e) {
    console.error("suggest:", e?.message ?? e);
    res.status(500).json({ error: "suggest_failed" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { question, userModel, memory = [] } = req.body || {};
    if (!question || !String(question).trim()) return res.status(400).json({ error: "missing_question" });
    const mem = memory.length
      ? `LO RELEVANTE DE SU CONOCIMIENTO:\n${memory.map((m) => `- ${String(m).slice(0, 280)}`).join("\n")}\n\n`
      : "";
    const content = userBlock(userModel) + mem + `PREGUNTA:\n${question}`;
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6", max_tokens: 700, system: CHAT_SYSTEM,
      messages: [{ role: "user", content }],
    });
    res.json({ answer: textOf(msg).trim() });
  } catch (e) {
    console.error("chat:", e?.message ?? e);
    res.status(500).json({ error: "chat_failed" });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`✦ cortex-ai-proxy escuchando en :${PORT}`));
