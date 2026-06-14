// Alimentar Cortex: ingiere un paquete de contenido = una fuente (libro/tema/tarea).
//
//   npx tsx scripts/generate.ts <pack>     (o: npm run generate -- <pack>)
//   ej:  npm run generate -- behavioral
//
// El paquete vive en src/content/<pack>.ts y exporta { PACK: Capsule[], intent? }.
// HOY los paquetes los escribe Claude (yo, en sesión). El día que exista
// ANTHROPIC_API_KEY, la Edge Function extract-atoms (§9) producirá un PACK con la
// MISMA forma y este mismo ingestor lo cargará — cambia el generador, no el sistema.

import { makeAdminClient, ensureDevUser, ingestCapsules } from "./lib/ingest";

const EMAIL = process.env.SEED_EMAIL || "dev@cortex.local";
const PASSWORD = process.env.SEED_PASSWORD || "cortex-dev-1234";

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error("Uso: tsx scripts/generate.ts <pack>   (ej: behavioral)");
    process.exit(1);
  }

  let mod: { PACK?: unknown; intent?: string };
  try {
    mod = await import(`../src/content/${name}.ts`);
  } catch {
    console.error(`✗ No encuentro el paquete src/content/${name}.ts`);
    process.exit(1);
  }

  const pack = mod.PACK as import("../src/types").Capsule[] | undefined;
  if (!Array.isArray(pack) || pack.length === 0) {
    console.error("✗ El paquete no exporta PACK con cápsulas.");
    process.exit(1);
  }

  const db = makeAdminClient();
  const userId = await ensureDevUser(db, EMAIL, PASSWORD);

  const title = pack[0].queue.title;
  const intentByQueue: Record<string, string> = {};
  if (mod.intent) intentByQueue[title] = mod.intent;

  const r = await ingestCapsules(db, userId, pack, { intentByQueue });
  console.log(`✓ Fuente ingerida: "${title}" → ${r.atoms} átomos · ${r.capsules} cápsulas`);
  console.log("\n✅ Cortex alimentado. Abre la app y la materia nueva entra en la mezcla.");
}

main().catch((e) => {
  console.error("✗ Error:", e?.message ?? e);
  process.exit(1);
});
