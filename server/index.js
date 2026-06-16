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

// ── generación de cápsulas (§9): mismo catálogo de plantillas y mismo assemble
//    validado que scripts/ai/extract.ts, portado a JS. Devuelve Capsules listas. ──
function genSystem({ title, type = "topic", theme, intent }) {
  return [
    `Eres un destilador de conocimiento para Cortex, una app de micro-aprendizaje anti-TikTok.`,
    `Dado "${title}" (${type}), genera entre 9 y 13 cápsulas. Cada una es UNA idea autónoma que se entiende sola.`,
    `Prioriza lo CONTRAINTUITIVO y provocador — lo que hace parar a leer. Nada de resúmenes lineales ni obviedades.`,
    `El usuario aprende esto porque: "${intent || "quiere entenderlo a fondo y aplicarlo"}". Adapta el ángulo a ese porqué.`,
    ``,
    `CATÁLOGO DE PLANTILLAS — NO uses solo frases. ELIGE la que mejor encaja con cada idea y VARÍA:`,
    `· narrative (≈40%): 3 slides — hook contraintuitivo → develop con ejemplo → twist que da la vuelta.`,
    `· stat: figure (cifra que golpea) + claim + reveal con el giro.`,
    `· quiz: question + 2-4 options (UNA con correct=true) + explanation. INCLUYE al menos 1.`,
    `· activity: challenge (reto para HACER hoy) + steps opcionales + why. INCLUYE al menos 1.`,
    `· interactive: scenario + 2 choices con outcome + insight.`,
    `· recall: prompt + reveal. Solo 0-1.`,
    ``,
    `novelty_score: 0.4 repaso, 0.7-1.0 lo más contraintuitivo. estimated_seconds: 35-80.`,
    `Escribe en ESPAÑOL DE ESPAÑA (tú, no vos). reflection_prompt aplicado a la vida real del usuario.`,
    `Devuelve SOLO JSON válido (sin markdown): {"capsules":[{ "format":"...", "novelty_score":0.8, "estimated_seconds":60, "reflection_prompt":"...", ...campos del formato... }]}`,
    `Campos → narrative: slides:[{type:"hook|develop|twist",text}]. stat: figure,unit,claim,reveal. quiz: question,options:[{label,correct}],explanation. activity: challenge,steps,why. interactive: scenario,choices:[{label,outcome}],insight. recall: prompt,reveal.`,
  ].join("\n");
}

const slug = (t) =>
  String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24);

function assemble(raw, source, i) {
  const base = {
    id: `gen-${slug(source.title)}-${String(i + 1).padStart(2, "0")}`,
    queue: { title: source.title, type: source.type || "topic", theme: source.theme },
    novelty_score: Math.max(0, Math.min(1, Number(raw.novelty_score) || 0.6)),
    estimated_seconds: Math.max(20, Math.min(180, Math.round(raw.estimated_seconds) || 60)),
    reflection_prompt: raw.reflection_prompt || "",
  };
  switch (raw.format) {
    case "narrative":
      if (!raw.slides?.length) return null;
      return { ...base, format: "narrative", payload: { slides: raw.slides } };
    case "stat":
      if (!raw.figure || !raw.claim || !raw.reveal) return null;
      return { ...base, format: "stat", payload: { figure: raw.figure, unit: raw.unit, claim: raw.claim, reveal: raw.reveal } };
    case "recall":
      if (!raw.prompt || !raw.reveal) return null;
      return { ...base, format: "recall", payload: { prompt: raw.prompt, reveal: raw.reveal } };
    case "interactive":
      if (!raw.scenario || !raw.choices?.length || !raw.insight) return null;
      return { ...base, format: "interactive", payload: { scenario: raw.scenario, choices: raw.choices, insight: raw.insight } };
    case "quiz": {
      const opts = (raw.options || []).filter((o) => o && o.label);
      if ((!raw.question && !raw.scenario) || opts.length < 2 || !opts.some((o) => o.correct) || !raw.explanation) return null;
      return { ...base, format: "quiz", payload: { question: raw.question || raw.scenario, options: opts, explanation: raw.explanation } };
    }
    case "activity":
      if (!raw.challenge || !raw.why) return null;
      return { ...base, format: "activity", payload: { challenge: raw.challenge, steps: (raw.steps || []).filter(Boolean), why: raw.why } };
    default:
      return null;
  }
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

app.post("/generate", async (req, res) => {
  try {
    const { title, theme, type, intent } = req.body || {};
    if (!title || !String(title).trim() || !theme) return res.status(400).json({ error: "missing_title_or_theme" });
    if (!THEMES.includes(theme)) return res.status(400).json({ error: "bad_theme" });
    const source = { title: String(title).trim(), theme, type: type || "topic", intent };
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6", max_tokens: 12000, system: genSystem(source),
      messages: [{ role: "user", content: `Genera las cápsulas de "${source.title}". Usa tu conocimiento del tema.` }],
    });
    const { capsules } = parseJson(textOf(msg));
    const out = (capsules || []).map((c, i) => assemble(c, source, i)).filter(Boolean);
    if (!out.length) return res.status(502).json({ error: "no_valid_capsules" });
    res.json({ capsules: out });
  } catch (e) {
    console.error("generate:", e?.message ?? e);
    res.status(500).json({ error: "generate_failed" });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`✦ cortex-ai-proxy escuchando en :${PORT}`));
