// Generador de IA (§9). Dada una fuente (libro/tema/tarea), Claude produce un
// PACK de cápsulas en la MISMA forma que los paquetes escritos a mano → el
// ingestor (ingest.ts) no distingue quién las escribió.
//
// Disciplina de API (§4, verificada): claude-sonnet-4-6, structured outputs vía
// output_config.format (json_schema), SIN temperature/top_p/budget_tokens.
//
// La key se lee de ANTHROPIC_API_KEY o, si no está, del archivo mobile/anthropic.key
// (nunca se imprime). Llamar a Claude consume tokens de tu cuenta (§16): ~$1-3/materia.

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Capsule, CapsuleFormat, QueueType, ThemeName } from "../../src/types";

function readKey(): string {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim();
  const f = resolve("anthropic.key");
  if (existsSync(f)) return readFileSync(f, "utf8").trim();
  throw new Error("Falta la API key: define ANTHROPIC_API_KEY o crea mobile/anthropic.key");
}

export interface Source {
  title: string;
  type: QueueType;
  theme: ThemeName;
  intent?: string;
  sourceText?: string; // texto real del libro (si se alimenta un PDF) → grounding
}

// Esquema plano: format + campos de payload opcionales. El ensamblador de abajo
// arma el payload correcto por formato (más robusto que oneOf con structured outputs).
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["capsules"],
  properties: {
    capsules: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["format", "novelty_score", "estimated_seconds", "reflection_prompt"],
        properties: {
          format: { type: "string", enum: ["narrative", "stat", "recall", "interactive", "quiz", "activity"] },
          novelty_score: { type: "number", description: "0-1: cuán contraintuitivo/provocador (gancho)" },
          estimated_seconds: { type: "integer" },
          reflection_prompt: { type: "string", description: "micro-reto final, aplicado a la vida del usuario" },
          // narrative
          slides: {
            type: "array",
            items: {
              type: "object", additionalProperties: false, required: ["type", "text"],
              properties: { type: { type: "string", enum: ["hook", "develop", "twist"] }, text: { type: "string" } },
            },
          },
          // stat
          figure: { type: "string", description: "la cifra que golpea, p.ej. '37×', '92 %'" },
          unit: { type: "string" },
          claim: { type: "string" },
          reveal: { type: "string", description: "el giro contraintuitivo (stat y recall)" },
          // recall
          prompt: { type: "string" },
          // interactive
          scenario: { type: "string" },
          insight: { type: "string" },
          choices: {
            type: "array",
            items: {
              type: "object", additionalProperties: false, required: ["label", "outcome"],
              properties: { label: { type: "string" }, outcome: { type: "string" } },
            },
          },
          // quiz
          question: { type: "string", description: "la pregunta del quiz" },
          options: {
            type: "array",
            items: {
              type: "object", additionalProperties: false, required: ["label", "correct"],
              properties: { label: { type: "string" }, correct: { type: "boolean" } },
            },
          },
          explanation: { type: "string", description: "por qué la opción correcta lo es (el aprendizaje)" },
          // activity
          challenge: { type: "string", description: "un reto concreto para hacer en el mundo real" },
          steps: { type: "array", items: { type: "string" } },
          why: { type: "string", description: "por qué el reto merece la pena (el principio)" },
        },
      },
    },
  },
};

function systemPrompt(s: Source): string {
  return [
    `Eres un destilador de conocimiento para Cortex, una app de micro-aprendizaje anti-TikTok.`,
    `Dado "${s.title}" (${s.type}), genera entre 9 y 13 cápsulas. Cada una es UNA idea autónoma que se entiende sola.`,
    `Prioriza lo CONTRAINTUITIVO y provocador — lo que hace parar a leer. Nada de resúmenes lineales ni obviedades; si suena a flashcard glorificada, descártala.`,
    `El usuario aprende esto porque: "${s.intent ?? "quiere entenderlo a fondo y aplicarlo"}". Adapta el ángulo a ese porqué.`,
    ``,
    `CATÁLOGO DE PLANTILLAS — NO uses solo frases. ELIGE la plantilla que mejor encaja con cada idea, y VARÍA de verdad:`,
    `· narrative (≈40%): 3 slides — hook contraintuitivo → develop con ejemplo concreto → twist que da la vuelta. Para historias e ideas que necesitan desarrollo.`,
    `· stat: figure (cifra que golpea) + claim + reveal con el giro. Cuando hay un dato potente.`,
    `· quiz: question + 2-4 options (UNA con correct=true) + explanation del porqué. Para datos/conceptos que se pueden poner a prueba. INCLUYE al menos 1-2.`,
    `· activity: challenge (un reto concreto para HACER hoy en el mundo real) + steps opcionales + why. Para tácticas accionables. INCLUYE al menos 1-2.`,
    `· interactive: scenario + 2 choices con outcome (sin correcto/incorrecto) + insight. Para dilemas/decisiones.`,
    `· recall: prompt + reveal. Solo 0-1, para la idea más central.`,
    ``,
    `Mezcla obligatoria: al menos 1 quiz Y al menos 1 activity. El resto, el formato que mejor sirva a cada idea (no todo narrative).`,
    `novelty_score: 0.4 para repaso, 0.7-1.0 para lo más contraintuitivo. estimated_seconds: 35-80.`,
    `Escribe en ESPAÑOL DE ESPAÑA (tú, no vos). Frases que llaman la atención. reflection_prompt aplicado a la vida real del usuario.`,
    ``,
    `FORMATO DE SALIDA: devuelve SOLO un objeto JSON válido (sin markdown, sin \`\`\`), con la forma:`,
    `{"capsules":[{ "format": "...", "novelty_score": 0.8, "estimated_seconds": 60, "reflection_prompt": "...", ...campos del formato... }]}`,
    `Campos por formato → narrative: slides:[{type:"hook|develop|twist",text}]. stat: figure,unit,claim,reveal. quiz: question,options:[{label,correct:bool}],explanation. activity: challenge,steps:[...],why. interactive: scenario,choices:[{label,outcome}],insight. recall: prompt,reveal.`,
  ].join("\n");
}

interface RawCapsule {
  format: CapsuleFormat;
  novelty_score: number;
  estimated_seconds: number;
  reflection_prompt: string;
  slides?: { type: "hook" | "develop" | "twist"; text: string }[];
  figure?: string; unit?: string; claim?: string; reveal?: string;
  prompt?: string;
  scenario?: string; insight?: string; choices?: { label: string; outcome: string }[];
  question?: string; options?: { label: string; correct: boolean }[]; explanation?: string;
  challenge?: string; steps?: string[]; why?: string;
}

const slug = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") // quita diacríticos
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24);

// arma una Capsule válida por formato, o null si faltan campos
function assemble(raw: RawCapsule, source: Source, i: number): Capsule | null {
  const base = {
    id: `${slug(source.title)}-${String(i + 1).padStart(2, "0")}`,
    queue: { title: source.title, type: source.type, theme: source.theme },
    novelty_score: Math.max(0, Math.min(1, Number(raw.novelty_score) || 0.6)),
    estimated_seconds: Math.max(20, Math.min(180, Math.round(raw.estimated_seconds) || 60)),
    reflection_prompt: raw.reflection_prompt ?? "",
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
      const opts = (raw.options ?? []).filter((o) => o && o.label);
      if (!raw.question && !raw.scenario) return null;
      if (opts.length < 2 || !opts.some((o) => o.correct) || !raw.explanation) return null;
      return { ...base, format: "quiz", payload: { question: raw.question ?? raw.scenario ?? "", options: opts, explanation: raw.explanation } };
    }
    case "activity":
      if (!raw.challenge || !raw.why) return null;
      return { ...base, format: "activity", payload: { challenge: raw.challenge, steps: raw.steps?.filter(Boolean), why: raw.why } };
    default:
      return null;
  }
}

export async function generatePack(source: Source): Promise<Capsule[]> {
  const userContent = source.sourceText
    ? `Genera las cápsulas de "${source.title}" basándote en estos fragmentos REALES del libro (no en tu memoria; cita las ideas tal como aparecen):\n\n"""\n${source.sourceText}\n"""`
    : `Genera las cápsulas de "${source.title}". Usa tu conocimiento del tema.`;

  // NOTA (§4): los structured outputs (output_config json_schema) son lo ideal,
  // pero con este catálogo de plantillas (varios arrays de objetos) el compilador
  // de gramática de Claude da "Grammar compilation timed out". Usamos JSON guiado
  // por prompt + parseo validado (assemble descarta lo malformado). Sonnet 4.6 es
  // muy fiable con JSON; SCHEMA queda como documentación de la forma.
  void SCHEMA;
  const anthropic = new Anthropic({ apiKey: readKey() });
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 12000,
    system: systemPrompt(source),
    messages: [{ role: "user", content: userContent }],
  } as any);

  const block = (message.content as any[]).find((b) => b.type === "text");
  if (!block) throw new Error("Claude no devolvió texto");
  const raw = block.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = raw.indexOf("{"); const end = raw.lastIndexOf("}");
  const { capsules } = JSON.parse(start >= 0 ? raw.slice(start, end + 1) : raw) as { capsules: RawCapsule[] };
  const out = capsules.map((c, i) => assemble(c, source, i)).filter((c): c is Capsule => c !== null);
  if (out.length === 0) throw new Error("Ninguna cápsula válida en la respuesta");
  return out;
}
