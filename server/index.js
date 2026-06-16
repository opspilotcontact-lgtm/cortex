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

// lo que la persona ha escrito/reflexionado/respondido al coach últimamente → su
// "señal viva". Personaliza la generación con lo que de verdad piensa AHORA.
function recentBlock(recent) {
  const items = (recent || []).map((s) => String(s).trim()).filter(Boolean).slice(-8);
  if (!items.length) return "";
  return `LO QUE HA ESCRITO/REFLEXIONADO ÚLTIMAMENTE (úsalo para afinar el ángulo, conéctalo si encaja):\n${items.map((s) => `- ${s.slice(0, 240)}`).join("\n")}\n\n`;
}

// ── generación de cápsulas (§9): mismo catálogo de plantillas y mismo assemble
//    validado que scripts/ai/extract.ts, portado a JS. Devuelve Capsules listas. ──
function genSystem({ title, type = "topic", theme, intent, userModel, recent }) {
  return [
    `Eres un destilador de conocimiento para Cortex, una app de micro-aprendizaje anti-TikTok.`,
    `Dado "${title}" (${type}), genera entre 9 y 13 cápsulas. Cada una es UNA idea autónoma que se entiende sola.`,
    `Prioriza lo CONTRAINTUITIVO y provocador — lo que hace parar a leer. Nada de resúmenes lineales ni obviedades.`,
    `El usuario aprende esto porque: "${intent || "quiere entenderlo a fondo y aplicarlo"}". Adapta el ángulo a ese porqué.`,
    userModel ? userBlock(userModel).trim() : "",
    recent ? recentBlock(recent).trim() : "",
    ``,
    `ESTO NO ES UNA APP DE FRASES. La mayoría de cápsulas deben ser INTERACTIVAS, animadas o visuales — no texto pasivo.`,
    `CATÁLOGO — elige para CADA idea la forma más viva de mostrarla, y que NO se repitan dos del mismo formato seguidas:`,
    `· quiz: question + 2-4 options (UNA correct=true) + explanation. Pon a prueba. (≥2)`,
    `· activity: challenge (reto para HACER hoy en el mundo real) + steps + why. (≥2)`,
    `· coach: la IA te habla y te pregunta DIRECTO a ti (2ª persona, atado a tus metas/intereses): question + placeholder + followUp (lo que aprendes al responder). (≥1)`,
    `· interactive: scenario + 2 choices con outcome + insight. Un dilema donde decides.`,
    `· visual: mini mapa conceptual — nodes:[{id,label}] (3-6) + edges:[{from,to}] + caption.`,
    `· motion: escena ANIMADA. render ∈ {habit_loop, compound, anchor, countdown} + title + caption. Cuando una idea se entiende mejor en movimiento. (≥1 si encaja)`,
    `· stat: figure (cifra que golpea) + claim + reveal con el giro.`,
    `· narrative: 3 slides hook→develop→twist. SOLO si la idea necesita desarrollo en 3 actos. MÁXIMO 2-3 de estas en todo el lote.`,
    `· recall: prompt + reveal. Solo 0-1.`,
    ``,
    `novelty_score: 0.4 repaso, 0.7-1.0 lo más contraintuitivo. estimated_seconds: 35-80.`,
    `Escribe en ESPAÑOL DE ESPAÑA (tú, no vos). Háblale de tú, directo. reflection_prompt aplicado a SU vida real.`,
    `Devuelve SOLO JSON válido (sin markdown): {"capsules":[{ "format":"...", "novelty_score":0.8, "estimated_seconds":60, "reflection_prompt":"...", ...campos del formato... }]}`,
    `Campos → quiz: question,options:[{label,correct}],explanation. activity: challenge,steps,why. coach: question,placeholder,followUp. interactive: scenario,choices:[{label,outcome}],insight. visual: nodes:[{id,label}],edges:[{from,to}],caption. motion: render,title,caption. stat: figure,unit,claim,reveal. narrative: slides:[{type:"hook|develop|twist",text}]. recall: prompt,reveal.`,
  ].filter(Boolean).join("\n");
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
    case "visual": {
      const nodes = (raw.nodes || []).filter((n) => n && n.id && n.label);
      if (nodes.length < 2 || !raw.caption) return null;
      const ids = new Set(nodes.map((n) => n.id));
      const edges = (raw.edges || []).filter((e) => e && ids.has(e.from) && ids.has(e.to));
      return { ...base, format: "visual", payload: { render: "concept_map", nodes, edges, caption: raw.caption } };
    }
    case "quiz": {
      const opts = (raw.options || []).filter((o) => o && o.label);
      if ((!raw.question && !raw.scenario) || opts.length < 2 || !opts.some((o) => o.correct) || !raw.explanation) return null;
      return { ...base, format: "quiz", payload: { question: raw.question || raw.scenario, options: opts, explanation: raw.explanation } };
    }
    case "activity":
      if (!raw.challenge || !raw.why) return null;
      return { ...base, format: "activity", payload: { challenge: raw.challenge, steps: (raw.steps || []).filter(Boolean), why: raw.why } };
    case "coach":
      if (!raw.question || !raw.followUp) return null;
      return { ...base, format: "coach", payload: { question: raw.question, placeholder: raw.placeholder, followUp: raw.followUp } };
    case "motion": {
      const scenes = ["habit_loop", "compound", "anchor", "countdown"];
      if (!scenes.includes(raw.render) || !raw.title || !raw.caption) return null;
      return { ...base, format: "motion", payload: { render: raw.render, title: raw.title, caption: raw.caption } };
    }
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
    const { title, theme, type, intent, userModel, recent } = req.body || {};
    if (!title || !String(title).trim() || !theme) return res.status(400).json({ error: "missing_title_or_theme" });
    if (!THEMES.includes(theme)) return res.status(400).json({ error: "bad_theme" });
    const source = { title: String(title).trim(), theme, type: type || "topic", intent, userModel, recent };
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

// /replenish: la IA con MANOS. Decide ELLA qué enseñar a continuación (profundizar
// en algo que ya aprendes o traer una idea adyacente fresca) y en qué formatos, y
// genera el lote. Es el motor de "constantemente ideas nuevas, sin repetir".
const REPLENISH_SYSTEM = [
  "Eres el curador del segundo cerebro de esta persona. Tú decides qué merece la pena enseñarle AHORA.",
  "Elige UN ángulo nuevo: o profundizas en algo que ya aprende (una faceta que aún no ha visto), o traes una idea adyacente que le encajaría. NO repitas materias de la lista a evitar.",
  "Genera 6-10 cápsulas, cada una UNA idea autónoma y contraintuitiva. ESTO NO ES UNA APP DE FRASES: la mayoría deben ser INTERACTIVAS, animadas o visuales, no texto pasivo. No repitas dos formatos iguales seguidos.",
  "Formatos (prioriza los ricos): quiz (question+options[{label,correct}]+explanation), activity (challenge+steps+why), coach (la IA te pregunta DIRECTO a ti, 2ª persona atado a tus metas: question+placeholder+followUp), interactive (scenario+choices[{label,outcome}]+insight), visual (nodes[{id,label}]+edges[{from,to}]+caption), motion (escena animada: render∈{habit_loop,compound,anchor,countdown}+title+caption), stat (figure+claim+reveal). narrative (3 slides hook/develop/twist) SOLO 1-2 como mucho. recall (prompt+reveal) 0-1.",
  "Incluye al menos 1 coach y al menos 1 quiz o activity. Háblale de tú, directo.",
  "Español de España (tú, no vos). Devuelve SOLO JSON (sin markdown): {\"title\":\"...\",\"theme\":\"<uno de: " + THEMES.join(", ") + ">\",\"capsules\":[{format,novelty_score,estimated_seconds,reflection_prompt, ...campos del formato...}]}",
].join(" ");

app.post("/replenish", async (req, res) => {
  try {
    const { userModel, avoidTitles = [], recent } = req.body || {};
    const content =
      userBlock(userModel) +
      recentBlock(recent) +
      `MATERIAS QUE YA TIENE (evita repetirlas como título, pero puedes profundizar en sus temas):\n${avoidTitles.length ? avoidTitles.map((t) => `- ${t}`).join("\n") : "(ninguna)"}`;
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6", max_tokens: 12000, system: REPLENISH_SYSTEM,
      messages: [{ role: "user", content }],
    });
    const data = parseJson(textOf(msg));
    const theme = THEMES.includes(data.theme) ? data.theme : "neutral";
    const title = String(data.title || "Idea nueva").trim();
    const source = { title, theme, type: "topic" };
    const out = (data.capsules || []).map((c, i) => assemble(c, source, i)).filter(Boolean);
    if (!out.length) return res.status(502).json({ error: "no_valid_capsules" });
    res.json({ title, theme, capsules: out });
  } catch (e) {
    console.error("replenish:", e?.message ?? e);
    res.status(500).json({ error: "replenish_failed" });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`✦ cortex-ai-proxy escuchando en :${PORT}`));
