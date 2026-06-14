// Siembra Supabase LOCAL desde la fuente de verdad bundled: SEED_CAPSULES (TS).
// Carga las cápsulas offline embebidas en la BD normalizada bajo el usuario dev.
//
//   npx tsx scripts/seed-db.ts   (o: npm run db:seed)
//
// Usa la service_role key (salta RLS) — SOLO contra el stack local.

import { SEED_CAPSULES } from "../src/data/capsules";
import { makeAdminClient, ensureDevUser, ingestCapsules } from "./lib/ingest";

const EMAIL = process.env.SEED_EMAIL || "dev@cortex.local";
const PASSWORD = process.env.SEED_PASSWORD || "cortex-dev-1234";

async function main() {
  const db = makeAdminClient();
  const userId = await ensureDevUser(db, EMAIL, PASSWORD);
  console.log(`✓ usuario dev: ${EMAIL} (${userId})`);

  const r = await ingestCapsules(db, userId, SEED_CAPSULES);
  console.log(`✓ ${r.queues} materias · ${r.atoms} átomos · ${r.capsules} cápsulas`);
  console.log("\n✅ Siembra completa.");
}

main().catch((e) => {
  console.error("✗ Error sembrando:", e?.message ?? e);
  process.exit(1);
});
