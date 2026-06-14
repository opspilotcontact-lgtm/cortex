// Test determinista del motor de servido (§7). Inyecta un rng controlado para
// forzar cada rama (repaso / puente / avance) y verifica el gating.
//
//   npm run test:serving

import { pickCapsule } from "../src/flow/serving";
import { schedule, firstSchedule } from "../src/flow/sm2";
import type { Capsule, ExperimentState, CapsuleFormat, ReviewState } from "../src/types";

// fábrica de cápsulas mínimas (el motor solo lee id/queue/format/novelty_score)
function payloadFor(format: CapsuleFormat, id: string): unknown {
  switch (format) {
    case "narrative": return { slides: [{ type: "hook", text: `${id} hook` }] };
    case "recall": return { prompt: `${id}?`, reveal: `${id}!` };
    case "stat": return { figure: "1", claim: `${id} claim`, reveal: `${id} reveal` };
    case "interactive": return { scenario: `${id}?`, choices: [{ label: "a", outcome: "x" }], insight: `${id} insight` };
    case "bridge": return { atom_a: { title: "A", queue: "Q" }, atom_b: { title: "B", queue: "Q" }, rationale: "r", question: "q" };
    case "visual": return { render: "concept_map", nodes: [], edges: [], caption: `${id} cap` };
  }
}
function cap(id: string, queueTitle: string, format: CapsuleFormat, novelty = 0.7): Capsule {
  return {
    id, format, novelty_score: novelty, estimated_seconds: 60, reflection_prompt: "",
    queue: { title: queueTitle, type: "book", theme: "habits" }, payload: payloadFor(format, id),
  } as unknown as Capsule;
}

const FEED: Capsule[] = [
  cap("ah1", "Hábitos", "narrative"), cap("ah2", "Hábitos", "narrative"), cap("ah3", "Hábitos", "narrative"),
  cap("sy1", "Sistemas", "narrative"), cap("sy2", "Sistemas", "narrative"),
  cap("recA", "Hábitos", "recall", 0.4), cap("recB", "Sistemas", "recall", 0.4),
  cap("br1", "Puente", "bridge", 1.0),
];

const DAY = 24 * 60 * 60 * 1000;
function state(seen: string[] = [], events: { capsuleId: string; ts: number }[] = [], reviews: Record<string, ReviewState> = {}): ExperimentState {
  return {
    firstDay: "2026-06-01", byDay: {}, saved: [], notes: [], reviews,
    seen: Object.fromEntries(seen.map((id) => [id, true])) as Record<string, true>,
    events: events.map((e) => ({ action: "served" as const, capsuleId: e.capsuleId, ts: e.ts })),
  };
}
// rng con secuencia fija (repite el último valor al agotarse)
const seq = (vals: number[]) => { let i = 0; return () => vals[Math.min(i++, vals.length - 1)]; };

const checks: { name: string; pass: boolean; detail: string }[] = [];
const check = (name: string, pass: boolean, detail: string) => checks.push({ name, pass, detail });
const now = Date.now();

// 1) Fresco: el repaso NO se sirve (nada completado aún); con bridge a 0.99 → avance normal
{
  const r = pickCapsule(FEED, state(), new Set(), null, seq([0.99, 0.0]));
  check("1 · fresco → avance normal (ni recall ni bridge)", r.format !== "recall" && r.format !== "bridge", `salió ${r.id} (${r.format})`);
}
// 2) Puente: recall no disponible, bridge check < 0.15 → sirve el puente
{
  const r = pickCapsule(FEED, state(), new Set(), null, seq([0.0, 0.0]));
  check("2 · P_bridge → sirve bridge", r.format === "bridge", `salió ${r.id} (${r.format})`);
}
// 3) Repaso debido: 2 completadas en Hábitos → recA disponible; recall check < 0.2 → recA
{
  const r = pickCapsule(FEED, state(["ah1", "ah2"]), new Set(), null, seq([0.0]));
  check("3 · P_recall con 2 completadas → sirve recall", r.format === "recall" && r.queue.title === "Hábitos", `salió ${r.id} (${r.format})`);
}
// 4) Gating: con solo 1 completada, el repaso NO está debido aunque rng=0
{
  const r = pickCapsule(FEED, state(["ah1"]), new Set(), null, seq([0.0, 0.0]));
  check("4 · gating: 1 completada → NO recall", r.format !== "recall", `salió ${r.id} (${r.format})`);
}
// 5) Interleaving: lastQueue=Hábitos → el avance normal evita Hábitos
{
  const r = pickCapsule(FEED, state(), new Set(), "Hábitos", seq([0.99, 0.0]));
  check("5 · interleaving evita la materia anterior", r.queue.title !== "Hábitos", `salió ${r.id} (${r.queue.title})`);
}
// 6) Repaso espaciado: recA visto hace 3 días → vuelve a estar debido
{
  const r = pickCapsule(FEED, state(["ah1", "ah2", "recA"], [{ capsuleId: "recA", ts: now - 3 * DAY }]), new Set(), null, seq([0.0]));
  check("6 · repaso re-debido tras ~3 días", r.id === "recA", `salió ${r.id}`);
}
// 7) Espaciado: recA visto hace 1 hora → NO debido (no se repite tan pronto)
{
  const r = pickCapsule(FEED, state(["ah1", "ah2", "recA"], [{ capsuleId: "recA", ts: now - 3600 * 1000 }]), new Set(), null, seq([0.0, 0.0]));
  check("7 · repaso reciente NO se repite", r.id !== "recA", `salió ${r.id}`);
}
// 8) Invariante: 3000 tiradas aleatorias → siempre devuelve una cápsula del feed y nunca recall sin material
{
  let ok = true; let detail = "";
  const ids = new Set(FEED.map((c) => c.id));
  for (let i = 0; i < 3000; i++) {
    const seenN = Math.random() < 0.5 ? [] : ["ah1"]; // 0 o 1 completada en Hábitos (recall NO debe salir de Hábitos)
    const r = pickCapsule(FEED, state(seenN), new Set(), null, Math.random);
    if (!r || !ids.has(r.id)) { ok = false; detail = "devolvió algo fuera del feed"; break; }
    if (r.format === "recall" && r.queue.title === "Hábitos") { ok = false; detail = `recall servido con <2 completadas (${r.id})`; break; }
  }
  check("8 · invariante (3000 tiradas): válido y gating respetado", ok, detail || "ok");
}

// 9) SM-2: again reinicia, good alarga el intervalo, ease dentro de límites
{
  const t = 1_700_000_000_000;
  const again = schedule(firstSchedule(t), "again", t);
  const good1 = schedule(undefined, "good", t);
  const good2 = schedule(good1, "good", good1.due);
  check("9 · SM-2: «again» reinicia a 1 día", again.intervalDays === 1 && again.reps === 0, `int=${again.intervalDays}, reps=${again.reps}`);
  check("9 · SM-2: «good» alarga el intervalo", good2.intervalDays > good1.intervalDays, `${good1.intervalDays}→${good2.intervalDays} días`);
  check("9 · SM-2: ease entre 1.3 y 2.8", again.ease >= 1.3 && good2.ease <= 2.8, `again=${again.ease.toFixed(2)}, good=${good2.ease.toFixed(2)}`);
}
// 10) auto-repaso DEBIDO se sirve como recall autogenerado (reviewKey = fuente)
{
  const now = Date.now();
  const r = pickCapsule(FEED, state(["ah1", "ah2"], [], { ah1: { reps: 0, ease: 2.5, intervalDays: 1, due: now - 1000 } }), new Set(), null, seq([0.0]));
  check("10 · auto-repaso debido → recall autogenerado", r.format === "recall" && r.reviewKey === "ah1", `salió ${r.id} (${r.format}, key=${r.reviewKey})`);
}
// 11) auto-repaso NO debido (due futuro) no se sirve
{
  const now = Date.now();
  const r = pickCapsule(FEED, state([], [], { ah1: { reps: 0, ease: 2.5, intervalDays: 1, due: now + 86_400_000 } }), new Set(), null, seq([0.99, 0.0]));
  check("11 · auto-repaso no debido NO se sirve", r.format !== "recall", `salió ${r.id} (${r.format})`);
}

console.log("\n── Test del motor de servido (§7) ──");
let all = true;
for (const c of checks) { console.log(`${c.pass ? "✓ PASS" : "✗ FAIL"} — ${c.name}  ·  ${c.detail}`); if (!c.pass) all = false; }
console.log(all ? "\n✅ Motor de servido §7 verificado." : "\n❌ Falla el motor — revisar.");
process.exit(all ? 0 : 1);
