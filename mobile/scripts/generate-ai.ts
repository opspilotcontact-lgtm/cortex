// Generación AUTÓNOMA: le das una fuente y Claude crea las cápsulas, que se
// ingieren por el mismo camino que los paquetes a mano.
//
//   npm run generate:ai -- "Título del libro" [theme] ["intent"]
//   ej:  npm run generate:ai -- "Pensar rápido, pensar despacio" behavioral
//
// Necesita ANTHROPIC_API_KEY (o el archivo mobile/anthropic.key). Consume tokens
// de tu cuenta de Claude (§16): del orden de $1-3 por materia.

import { generatePack } from "./ai/extract";
import { makeAdminClient, ensureDevUser, ingestCapsules } from "./lib/ingest";
import { pdfToText } from "./lib/pdf";
import type { ThemeName } from "../src/types";

const EMAIL = process.env.SEED_EMAIL || "dev@cortex.local";
const PASSWORD = process.env.SEED_PASSWORD || "cortex-dev-1234";
const VALID_THEMES: ThemeName[] = ["neutral", "habits", "systems", "bridge", "behavioral", "stoic", "wealth", "influence", "negotiation", "manson", "ignite", "titans"];

async function main() {
  // args posicionales + flag opcional --pdf <ruta> (alimentar el libro real)
  const argv = process.argv.slice(2);
  const pdfIdx = argv.indexOf("--pdf");
  let pdfPath: string | undefined;
  if (pdfIdx >= 0) { pdfPath = argv[pdfIdx + 1]; argv.splice(pdfIdx, 2); }
  const title = argv[0];
  const theme = (argv[1] as ThemeName) || "habits";
  const intent = argv[2];
  if (!title) {
    console.error('Uso: tsx scripts/generate-ai.ts "Título" [theme] ["intent"] [--pdf ruta.pdf]');
    console.error(`themes disponibles: ${VALID_THEMES.join(", ")}`);
    process.exit(1);
  }
  if (!VALID_THEMES.includes(theme)) {
    console.error(`✗ theme "${theme}" no válido. Usa uno de: ${VALID_THEMES.join(", ")}`);
    process.exit(1);
  }

  let sourceText: string | undefined;
  if (pdfPath) {
    sourceText = pdfToText(pdfPath);
    console.log(`✓ Texto extraído del PDF: ${sourceText.length} caracteres (grounding real)`);
  }

  console.log(`⟳ Generando con Claude (sonnet-4-6): "${title}" [mundo: ${theme}]${pdfPath ? " · desde el libro" : ""} …`);
  const capsules = await generatePack({ title, type: "book", theme, intent, sourceText });
  const formats = capsules.reduce<Record<string, number>>((a, c) => ({ ...a, [c.format]: (a[c.format] || 0) + 1 }), {});
  console.log(`✓ Claude produjo ${capsules.length} cápsulas`, formats);

  const db = makeAdminClient();
  const userId = await ensureDevUser(db, EMAIL, PASSWORD);
  const r = await ingestCapsules(db, userId, capsules, intent ? { intentByQueue: { [title]: intent } } : undefined);
  console.log(`✓ Ingeridas: ${r.atoms} átomos · ${r.capsules} cápsulas en "${title}"`);
  console.log("\n✅ Materia generada por IA. Abre la app y entra en la mezcla del Flow.");
}

main().catch((e) => {
  console.error("✗ Error:", e?.message ?? e);
  process.exit(1);
});
