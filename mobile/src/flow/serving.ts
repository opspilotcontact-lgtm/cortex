// Motor de servido (§7) — el corazón del Modo Flow. Recompensa variable
// CONTROLADA, no aleatoria ni lineal:
//   1) Repaso espaciado (P_recall): si toca repasar algo ya aprendido (SM-2),
//      se CREA AUTOMÁTICAMENTE una cápsula `recall` a partir del contenido
//      original (buildAutoRecall) — sin IA. Fija el conocimiento.
//   2) Puente inesperado (P_bridge): un `bridge` sin ver, la cápsula que más engancha.
//   3) Avance normal: interleaving entre materias + sesgo por novelty.

import { Capsule, ExperimentState } from "../types";
import { isDue } from "./sm2";

const P_RECALL = 0.2;
const P_BRIDGE = 0.15;
const RECALL_DUE_MS = 2 * 24 * 60 * 60 * 1000;
const RECALL_MIN_QUEUE_COMPLETED = 2;

type Rng = () => number;

const isReviewable = (c: Capsule) => c.format !== "recall"; // narrative/stat/interactive/bridge/visual

// CREACIÓN AUTOMÁTICA (§7 buildRecallCapsule): deriva una cápsula de repaso del
// contenido original, sin IA. El reviewKey apunta a la fuente para calificarla.
function recallCore(c: Capsule): { prompt: string; reveal: string } {
  const fallback = { prompt: `Repaso de «${c.queue.title}». ¿Recuerdas la idea?`, reveal: c.reflection_prompt || "" };
  switch (c.format) {
    case "narrative": {
      const slides = c.payload.slides ?? [];
      const hook = slides.find((s) => s.type === "hook") ?? slides[0];
      if (!hook) return fallback;
      return { prompt: `Repaso de «${c.queue.title}». Antes de revelarlo: ¿recuerdas la idea?`, reveal: hook.text };
    }
    case "stat":
      return { prompt: `Repaso: ${c.payload.claim} ¿Recuerdas la cifra y el giro?`, reveal: `${c.payload.figure}${c.payload.unit ? " · " + c.payload.unit : ""}. ${c.payload.reveal}` };
    case "interactive":
      return { prompt: c.payload.scenario, reveal: c.payload.insight };
    case "bridge":
      return { prompt: c.payload.question, reveal: c.payload.rationale };
    case "visual":
      return { prompt: "Repaso de un mapa que viste. Antes de revelarlo: ¿recuerdas la idea?", reveal: c.payload.caption };
    case "recall":
      return { prompt: c.payload.prompt, reveal: c.payload.reveal };
  }
}

export function buildAutoRecall(source: Capsule): Capsule {
  const { prompt, reveal } = recallCore(source);
  return {
    id: "review:" + source.id,
    reviewKey: source.id,
    queue: source.queue,
    novelty_score: 0.4,
    estimated_seconds: 35,
    reflection_prompt: source.reflection_prompt,
    format: "recall",
    payload: { prompt, reveal },
  } as Capsule;
}

function weightedPick(pool: Capsule[], rng: Rng): Capsule {
  const weights = pool.map((c) => Math.pow(c.novelty_score ?? 0.5, 2) + 0.15);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export function pickCapsule(
  all: Capsule[],
  state: ExperimentState,
  sessionSeen: Set<string>,
  lastQueue: string | null,
  rng: Rng = Math.random,
): Capsule {
  const seen = state.seen;
  const reviews = state.reviews ?? {};
  const now = Date.now();

  const lastSeenAt: Record<string, number> = {};
  for (const e of state.events) {
    if (e.capsuleId) lastSeenAt[e.capsuleId] = Math.max(lastSeenAt[e.capsuleId] ?? 0, e.ts);
  }
  const completedByQueue: Record<string, number> = {};
  for (const c of all) if (seen[c.id]) completedByQueue[c.queue.title] = (completedByQueue[c.queue.title] ?? 0) + 1;

  // ── 1) REPASO ESPACIADO (SM-2 + creación automática) ────────────
  // auto-repasos DEBIDOS de lo aprendido (lo prioritario)
  const dueAuto = all
    .filter((c) => isReviewable(c) && isDue(reviews[c.id], now) && !sessionSeen.has("review:" + c.id))
    .sort((a, b) => (reviews[a.id]?.due ?? 0) - (reviews[b.id]?.due ?? 0));
  // fallback: recalls escritos a mano, cuando su materia ya tiene material
  const isDuePre = (c: Capsule) => {
    if ((completedByQueue[c.queue.title] ?? 0) < RECALL_MIN_QUEUE_COMPLETED) return false;
    if (!seen[c.id]) return true;
    const last = lastSeenAt[c.id];
    return !last || now - last >= RECALL_DUE_MS;
  };
  const recallPool = all.filter((c) => c.format === "recall" && !sessionSeen.has(c.id) && isDuePre(c));

  if ((dueAuto.length || recallPool.length) && rng() < P_RECALL) {
    if (dueAuto.length) return buildAutoRecall(dueAuto[0]); // el más vencido → repaso autogenerado
    recallPool.sort((a, b) => (lastSeenAt[a.id] ?? 0) - (lastSeenAt[b.id] ?? 0));
    return recallPool[0];
  }

  // ── 2) PUENTE INESPERADO ────────────────────────────────────────
  const bridgePool = all.filter((c) => c.format === "bridge" && !seen[c.id] && !sessionSeen.has(c.id));
  if (bridgePool.length && rng() < P_BRIDGE) return weightedPick(bridgePool, rng);

  // ── 3) AVANCE NORMAL — interleaving + novelty ───────────────────
  let pool = all.filter((c) => isReviewable(c) && c.format !== "bridge" && !seen[c.id] && !sessionSeen.has(c.id));
  if (pool.length === 0) {
    sessionSeen.clear();
    pool = all.filter((c) => isReviewable(c) && c.format !== "bridge" && !sessionSeen.has(c.id));
    if (pool.length === 0) pool = all.filter((c) => !sessionSeen.has(c.id));
  }
  const diff = pool.filter((c) => c.queue.title !== lastQueue);
  if (diff.length) pool = diff;
  return weightedPick(pool, rng);
}
