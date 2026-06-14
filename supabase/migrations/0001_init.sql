-- ════════════════════════════════════════════════════════════════
-- Cortex · 0001_init — esquema base (§6 del plan, con correcciones)
-- ════════════════════════════════════════════════════════════════
-- Correcciones aplicadas respecto al §6 original:
--   · índices vectoriales con HNSW (no ivfflat): mejor recall y no
--     depende de tener datos presentes al crear el índice.
--   · índice HNSW también en user_notes.embedding (faltaba; participa del RAG).
--   · vector(1024) = dimensión de voyage-3 (ajustar si se cambia de modelo).
-- RLS y funciones van en migraciones aparte (0002, 0003).

-- ── extensiones ──────────────────────────────────────────────────
create extension if not exists "vector";      -- pgvector (embeddings)
create extension if not exists "pg_cron";      -- jobs programados
create extension if not exists "pg_net";       -- pg_cron -> Edge Functions vía net.http_post (§5)

-- ════════════════════════════════════════════════════════════════
-- PROFILES (perfil extendido; auth.users lo gestiona Supabase Auth)
-- ════════════════════════════════════════════════════════════════
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  daily_capsule_goal int not null default 5,    -- identidad, no adicción
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════
-- LEARNING QUEUES (las materias activas del usuario)
-- ════════════════════════════════════════════════════════════════
create type queue_type as enum ('book', 'skill', 'concept', 'topic');
create type queue_status as enum ('active', 'paused', 'completed');

create table learning_queues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type queue_type not null,
  theme text,                                   -- identidad visual de la materia (§11)
  source_ref text,
  intent text,
  status queue_status not null default 'active',
  created_at timestamptz not null default now()
);
create index on learning_queues (user_id, status);

-- ════════════════════════════════════════════════════════════════
-- KNOWLEDGE ATOMS (la unidad atómica de conocimiento)
-- ════════════════════════════════════════════════════════════════
create type atom_kind as enum ('core_idea', 'counterintuitive', 'definition', 'example', 'principle');

create table knowledge_atoms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  queue_id uuid not null references learning_queues(id) on delete cascade,
  title text not null,
  body text not null,
  kind atom_kind not null,
  novelty_score float not null default 0.5,
  order_index int not null,
  source_ref text,
  embedding vector(1024),                       -- voyage-3
  created_at timestamptz not null default now()
);
create index on knowledge_atoms (user_id, queue_id, order_index);
-- HNSW (no ivfflat): buen recall sin necesitar datos al crear el índice.
create index on knowledge_atoms using hnsw (embedding vector_cosine_ops);

-- ════════════════════════════════════════════════════════════════
-- BRIDGES (las aristas del grafo: conexiones entre átomos)
-- ════════════════════════════════════════════════════════════════
create type bridge_origin as enum ('ai_detected', 'user_created');

create table bridges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  atom_a_id uuid not null references knowledge_atoms(id) on delete cascade,
  atom_b_id uuid not null references knowledge_atoms(id) on delete cascade,
  origin bridge_origin not null,
  rationale text,
  strength float not null default 0.5,
  created_at timestamptz not null default now(),
  unique (user_id, atom_a_id, atom_b_id)
);
create index on bridges (user_id);

-- ════════════════════════════════════════════════════════════════
-- CAPSULES (átomos empaquetados con formato, listos para servir)
-- ════════════════════════════════════════════════════════════════
create type capsule_format as enum ('narrative', 'interactive', 'visual', 'bridge', 'recall');
create type capsule_status as enum ('queued', 'served', 'seen', 'archived');

create table capsules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  format capsule_format not null,
  primary_atom_id uuid references knowledge_atoms(id) on delete cascade,
  bridge_id uuid references bridges(id) on delete cascade,   -- solo si format='bridge'
  payload jsonb not null,                       -- estructura renderizable (§8)
  reflection_prompt text,
  estimated_seconds int not null default 90,
  status capsule_status not null default 'queued',
  priority float not null default 0.5,
  served_at timestamptz,
  created_at timestamptz not null default now()
);
create index on capsules (user_id, status, priority desc);

-- ════════════════════════════════════════════════════════════════
-- USER NOTES (reflexiones del usuario; también nodos del grafo)
-- ════════════════════════════════════════════════════════════════
create table user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  atom_id uuid references knowledge_atoms(id) on delete set null,
  body text not null,
  embedding vector(1024),
  created_at timestamptz not null default now()
);
create index on user_notes (user_id);
-- corrección: las notas también participan del RAG → necesitan índice.
create index on user_notes using hnsw (embedding vector_cosine_ops);

-- ════════════════════════════════════════════════════════════════
-- SAVED ATOMS (subgrafo "mío")
-- ════════════════════════════════════════════════════════════════
create table saved_atoms (
  user_id uuid not null references auth.users(id) on delete cascade,
  atom_id uuid not null references knowledge_atoms(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, atom_id)
);

-- ════════════════════════════════════════════════════════════════
-- CAPSULE INTERACTIONS (telemetría que alimenta el algoritmo, §7)
-- ════════════════════════════════════════════════════════════════
create type interaction_action as enum ('completed', 'skipped', 'saved', 'expanded', 'reflected', 'asked_ai');

create table capsule_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  capsule_id uuid not null references capsules(id) on delete cascade,
  action interaction_action not null,
  dwell_ms int,
  response_text text,
  created_at timestamptz not null default now()
);
create index on capsule_interactions (user_id, capsule_id);

-- ════════════════════════════════════════════════════════════════
-- AI CONVERSATIONS (chat contextual del Modo Depth, §10)
-- ════════════════════════════════════════════════════════════════
create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  anchor_atom_id uuid references knowledge_atoms(id) on delete set null,
  created_at timestamptz not null default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  retrieved_atom_ids uuid[],
  created_at timestamptz not null default now()
);
create index on ai_messages (conversation_id, created_at);

-- ════════════════════════════════════════════════════════════════
-- GENERATION JOBS (cola del pipeline asíncrono, §9)
-- ════════════════════════════════════════════════════════════════
create type job_type as enum ('extract_atoms', 'embed', 'detect_bridges', 'build_capsules');
create type job_status as enum ('pending', 'running', 'done', 'failed');

create table generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type job_type not null,
  payload jsonb,
  status job_status not null default 'pending',
  error text,
  created_at timestamptz not null default now()
);
create index on generation_jobs (status, created_at);
