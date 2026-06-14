// Test de aislamiento RLS con DOS cuentas (§6, §12 — la lección de Presupuestador).
// Verifica que la query de un usuario NUNCA devuelve datos de otro: tablas
// directas, lectura por id, la RPC match_knowledge (la "trampa" SECURITY del §6)
// y el with_check de inserción. Gate obligatorio para cerrar la Fase 1.
//
//   npm run test:rls

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { makeAdminClient, ensureDevUser } from "./lib/ingest";

const URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const U1 = { email: "dev@cortex.local", password: "cortex-dev-1234" };
const U2 = { email: "dev2@cortex.local", password: "cortex-dev-2-pass" };

const randomEmbedding = () => Array.from({ length: 1024 }, () => Math.random() * 2 - 1);

async function signIn(email: string, password: string): Promise<SupabaseClient> {
  const c = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`login ${email}: ${error.message}`);
  return c;
}

const checks: { name: string; pass: boolean; detail: string }[] = [];
const check = (name: string, pass: boolean, detail: string) => checks.push({ name, pass, detail });

async function main() {
  const admin = makeAdminClient();
  const u1 = await ensureDevUser(admin, U1.email, U1.password);
  const u2 = await ensureDevUser(admin, U2.email, U2.password);

  // u2 recibe SU propia materia + átomo (con embedding) + cápsula
  await admin.from("learning_queues").delete().eq("user_id", u2);
  const q2 = randomUUID();
  await admin.from("learning_queues").insert({ id: q2, user_id: u2, title: "Materia privada de U2", type: "concept", theme: "systems", status: "active" });
  const a2 = randomUUID();
  await admin.from("knowledge_atoms").insert({ id: a2, user_id: u2, queue_id: q2, title: "Secreto de U2", body: "solo de U2", kind: "core_idea", novelty_score: 0.5, order_index: 0, embedding: JSON.stringify(randomEmbedding()) });
  await admin.from("capsules").insert({ id: randomUUID(), user_id: u2, format: "narrative", primary_atom_id: a2, payload: { slides: [{ type: "hook", text: "secreto" }] }, reflection_prompt: "x", estimated_seconds: 60, status: "queued", priority: 0.5 });

  // u1: darle embedding a un átomo suyo para el test de la RPC
  const { data: u1atoms } = await admin.from("knowledge_atoms").select("id").eq("user_id", u1).limit(1);
  const u1AtomId = u1atoms?.[0]?.id;
  if (u1AtomId) await admin.from("knowledge_atoms").update({ embedding: JSON.stringify(randomEmbedding()) }).eq("id", u1AtomId);

  const c1 = await signIn(U1.email, U1.password);
  const c2 = await signIn(U2.email, U2.password);

  // CHECK 1 — u2 solo ve SUS cápsulas
  const cap2 = await c2.from("capsules").select("id,user_id");
  const leakCap2 = (cap2.data ?? []).filter((r) => r.user_id !== u2);
  check("u2 capsules: cero filas de otros", leakCap2.length === 0, `${cap2.data?.length ?? 0} filas, ${leakCap2.length} ajenas`);

  // CHECK 2 — u2 solo ve SUS átomos
  const at2 = await c2.from("knowledge_atoms").select("id,user_id");
  const leakAt2 = (at2.data ?? []).filter((r) => r.user_id !== u2);
  check("u2 atoms: cero filas de otros", leakAt2.length === 0, `${at2.data?.length ?? 0} filas`);

  // CHECK 3 — u1 ve lo suyo (y mucho), sin fugas
  const cap1 = await c1.from("capsules").select("id,user_id");
  const leakCap1 = (cap1.data ?? []).filter((r) => r.user_id !== u1);
  check("u1 capsules: cero filas de otros", leakCap1.length === 0, `${cap1.data?.length ?? 0} filas`);

  // CHECK 4 — u2 NO puede leer una cápsula de u1 pidiéndola por id
  const u1CapId = (cap1.data ?? [])[0]?.id;
  const direct = await c2.from("capsules").select("id").eq("id", u1CapId ?? "00000000-0000-0000-0000-000000000000");
  check("u2 no lee cápsula de u1 por id directo", (direct.data ?? []).length === 0, `${direct.data?.length ?? 0} filas`);

  // CHECK 5 — match_knowledge (§6 trampa): u2 solo recupera vectores suyos
  const u2AtomIds = new Set(((await admin.from("knowledge_atoms").select("id").eq("user_id", u2)).data ?? []).map((r) => r.id));
  const rpc2 = await c2.rpc("match_knowledge", { query_embedding: JSON.stringify(randomEmbedding()), match_count: 50 });
  if (rpc2.error) {
    check("match_knowledge RPC ejecuta", false, rpc2.error.message);
  } else {
    const rpcLeak = (rpc2.data ?? []).filter((r: { kind: string; id: string }) => r.kind === "atom" && !u2AtomIds.has(r.id));
    check("match_knowledge: u2 solo recupera lo suyo", rpcLeak.length === 0, `${rpc2.data?.length ?? 0} resultados, ${rpcLeak.length} ajenos`);
  }

  // CHECK 6 — with_check: u2 NO puede insertar una fila a nombre de u1
  const badInsert = await c2.from("learning_queues").insert({ user_id: u1, title: "inyección", type: "concept" });
  check("with_check bloquea insertar como otro usuario", badInsert.error !== null, badInsert.error ? `rechazado (${badInsert.error.code})` : "SIN ERROR (¡FUGA!)");

  // informe
  console.log("\n── Test de aislamiento RLS (2 cuentas) ──");
  let allPass = true;
  for (const c of checks) {
    console.log(`${c.pass ? "✓ PASS" : "✗ FAIL"} — ${c.name}  ·  ${c.detail}`);
    if (!c.pass) allPass = false;
  }
  console.log(allPass ? "\n✅ Aislamiento verificado: ningún usuario ve datos de otro." : "\n❌ HAY FUGA — revisar las policies RLS.");
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error("✗ Error en el test:", e?.message ?? e);
  process.exit(1);
});
