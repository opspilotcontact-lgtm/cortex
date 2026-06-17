// Exportador local → seed (§9). Tira del proxy de IA y genera un lote CURADO que
// cubre TODAS las formas de mostrar contenido (quiz, reto, coach, interactivo,
// visual, animación, dato, narrativa…), lo dedupe y lo escribe como un pack del
// seed: src/content/generadas.ts. Al commitear, ese contenido viaja a la nube.
//
//   1) arranca el proxy:  cd server && npm start
//   2) npm run export:seed
//   3) revisa src/content/generadas.ts (ya queda cableado en el seed) y commitea.
//
// Es reproducible: vuelve a correrlo para añadir más (dedupa por idea, no repite).

import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Capsule } from "../src/types";

const PROXY = process.env.AI_PROXY_URL || "http://127.0.0.1:8787";
const OUT = resolve("src/content/generadas.ts");
// formas que queremos ver representadas sí o sí
const WANT = ["quiz", "activity", "coach", "interactive", "visual", "motion", "stat", "narrative"];
const MAX_CALLS = 6;

const userModel = {
  motivations: "construir cosas que de verdad importen y dejar de perder el tiempo",
  goals: "lanzar mi propio producto y aprender de forma real, no superficial",
  interests: "sistemas, hábitos, persuasión, estoicismo, dinero, productividad",
};

const gist = (c: any): string =>
  String(c.payload.question || c.payload.claim || c.payload.challenge || c.payload.scenario || c.payload.title || c.payload.caption || c.payload.prompt || c.payload.slides?.[0]?.text || "")
    .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 90);

async function replenish(avoidIdeas: string[]): Promise<Capsule[]> {
  const r = await fetch(`${PROXY}/replenish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userModel, avoidTitles: [], avoidIdeas }),
  });
  if (!r.ok) throw new Error(`proxy /replenish HTTP ${r.status}`);
  const j = (await r.json()) as { capsules: Capsule[] };
  return j.capsules ?? [];
}

async function main() {
  // arranca de lo ya generado si existe (acumula, no pisa)
  const collected: Capsule[] = [];
  const seenGists = new Set<string>();
  if (existsSync(OUT)) {
    try {
      const prev = readFileSync(OUT, "utf8");
      const m = prev.match(/=\s*(\[[\s\S]*\])\s*as unknown/);
      if (m) for (const c of JSON.parse(m[1]) as Capsule[]) { collected.push(c); seenGists.add(gist(c)); }
    } catch { /* pack previo no parseable → empezamos limpio */ }
  }
  const have = () => new Set(collected.map((c) => c.format));

  console.log(`⟳ Generando contenido que cubra: ${WANT.join(", ")}\n`);
  for (let call = 0; call < MAX_CALLS; call++) {
    const missing = WANT.filter((f) => !have().has(f));
    if (!missing.length && collected.length >= 16) break;
    process.stdout.write(`  lote ${call + 1} (faltan: ${missing.join(", ") || "ninguno, ampliando"})… `);
    let batch: Capsule[] = [];
    try { batch = await replenish([...seenGists]); } catch (e: any) { console.log(`✗ ${e.message}`); break; }
    let added = 0;
    for (const c of batch) {
      const g = gist(c);
      if (!g || seenGists.has(g)) continue; // dedupe por idea → nunca repetido
      seenGists.add(g);
      collected.push(c);
      added++;
    }
    console.log(`+${added} (total ${collected.length})`);
  }

  // re-id estables para el seed + recorta a un tamaño sano
  const pack = collected.slice(0, 40).map((c, i) => ({ ...c, id: `gn-${String(i + 1).padStart(2, "0")}` }));
  const mix: Record<string, number> = {};
  pack.forEach((c) => (mix[c.format] = (mix[c.format] || 0) + 1));

  const file = [
    "// Pack GENERADO por la IA y horneado en el seed (scripts/export-seed.ts).",
    "// Cubre todas las formas de mostrar contenido. Al ir por git, viaja a la nube.",
    "// Regenerar/ampliar: arranca el proxy y `npm run export:seed`.",
    "",
    'import { Capsule } from "../types";',
    "",
    `export const PACK: Capsule[] = ${JSON.stringify(pack, null, 2)} as unknown as Capsule[];`,
    "",
  ].join("\n");
  writeFileSync(OUT, file, "utf8");

  console.log(`\n✦ Escrito ${OUT}`);
  console.log(`  ${pack.length} cápsulas · mezcla: ${JSON.stringify(mix)}`);
  const still = WANT.filter((f) => !mix[f]);
  console.log(still.length ? `  ⚠ sin cubrir: ${still.join(", ")}` : "  ✓ todas las formas representadas");
}

main().catch((e) => { console.error("✗", e?.message ?? e); process.exit(1); });
