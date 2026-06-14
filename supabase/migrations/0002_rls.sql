-- ════════════════════════════════════════════════════════════════
-- Cortex · 0002_rls — Row Level Security (§6)
-- ════════════════════════════════════════════════════════════════
-- Lección del fallo multi-tenant de Presupuestador: RLS OBLIGATORIO en
-- TODAS las tablas, aislamiento por user_id. Testear con DOS cuentas
-- distintas antes de cerrar la fase: la query de un usuario NUNCA debe
-- devolver datos de otro.
--
-- Patrón estándar (tablas con user_id): for all using/with check auth.uid()=user_id.
-- ai_messages no tiene user_id → se aísla por su ai_conversations padre.

-- ── tablas con user_id directo ──────────────────────────────────
alter table profiles            enable row level security;
alter table learning_queues     enable row level security;
alter table knowledge_atoms     enable row level security;
alter table bridges             enable row level security;
alter table capsules            enable row level security;
alter table user_notes          enable row level security;
alter table saved_atoms         enable row level security;
alter table capsule_interactions enable row level security;
alter table ai_conversations    enable row level security;
alter table ai_messages         enable row level security;
alter table generation_jobs     enable row level security;

-- profiles: la PK ES el user id (= auth.uid())
create policy "profiles owner" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "queues owner" on learning_queues
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "atoms owner" on knowledge_atoms
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "bridges owner" on bridges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "capsules owner" on capsules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notes owner" on user_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "saved owner" on saved_atoms
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "interactions owner" on capsule_interactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "conversations owner" on ai_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "jobs owner" on generation_jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── ai_messages: sin user_id → aislar por la conversación padre ──
create policy "messages via conversation" on ai_messages
  for all
  using (exists (
    select 1 from ai_conversations c
    where c.id = ai_messages.conversation_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from ai_conversations c
    where c.id = ai_messages.conversation_id and c.user_id = auth.uid()
  ));

-- ════════════════════════════════════════════════════════════════
-- NOTA: el pipeline (Edge Functions) escribe con la service_role key,
-- que SALTEA RLS por diseño. Está bien para los jobs de generación,
-- PERO toda Edge Function debe filtrar explícitamente por el user_id
-- del job/petición. Nunca confiar en que RLS te cubre cuando usas
-- service_role.
-- ════════════════════════════════════════════════════════════════
