-- ════════════════════════════════════════════════════════════════
-- Cortex · 0003_functions — RAG retrieval + wiring del pipeline
-- ════════════════════════════════════════════════════════════════

-- ── match_knowledge: búsqueda vectorial sobre el grafo del usuario (§10) ──
-- CORRECCIÓN DE SEGURIDAD (la trampa del §6): esta función es la del RAG.
--   · SECURITY INVOKER (no DEFINER) → respeta el RLS de quien la llama.
--   · ADEMÁS filtra user_id = auth.uid() explícitamente (cinturón + tirantes).
-- Así un usuario NUNCA recupera vectores de otro. Testear con dos cuentas.
--
-- Devuelve átomos + notas (ambos participan del RAG, §10), con un 'kind'
-- para distinguirlos. similarity = 1 - distancia coseno (1 = idéntico).

create or replace function match_knowledge(
  query_embedding vector(1024),
  match_count int default 8,
  anchor_queue uuid default null,   -- sesgo: priorizar el vecindario del anchor (§10)
  exclude_queue uuid default null
)
returns table (
  kind text,
  id uuid,
  title text,
  body text,
  queue_id uuid,
  similarity float
)
language sql
stable
security invoker                    -- ← clave: NO definer
set search_path = public
as $$
  (
    select 'atom'::text as kind, a.id, a.title, a.body, a.queue_id,
           1 - (a.embedding <=> query_embedding) as similarity
    from knowledge_atoms a
    where a.user_id = auth.uid()                 -- defensa explícita además de RLS
      and a.embedding is not null
      and (exclude_queue is null or a.queue_id <> exclude_queue)
  )
  union all
  (
    select 'note'::text as kind, n.id, null::text as title, n.body, null::uuid as queue_id,
           1 - (n.embedding <=> query_embedding) as similarity
    from user_notes n
    where n.user_id = auth.uid()
      and n.embedding is not null
  )
  order by similarity desc
  limit match_count;
$$;

-- ── wiring del pipeline (§9, paso 1) ──────────────────────────────
-- Al crear una learning_queue, encolar el job de extracción de átomos.
-- Un worker (pg_cron + pg_net → Edge Function, §5) recoge los 'pending'.

create or replace function enqueue_extraction()
returns trigger
language plpgsql
security definer                    -- inserta en la cola en nombre del sistema
set search_path = public
as $$
begin
  insert into generation_jobs (user_id, type, payload, status)
  values (
    new.user_id,
    'extract_atoms',
    jsonb_build_object(
      'queue_id', new.id,
      'title', new.title,
      'type', new.type,
      'source_ref', new.source_ref,
      'intent', new.intent
    ),
    'pending'
  );
  return new;
end;
$$;

create trigger trg_enqueue_extraction
  after insert on learning_queues
  for each row
  execute function enqueue_extraction();
