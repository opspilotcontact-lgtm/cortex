-- ════════════════════════════════════════════════════════════════
-- Cortex · 0009 — match_cross_queue: vecinos semánticos de OTRAS materias (§3)
-- ════════════════════════════════════════════════════════════════
-- Soporte para la detección de puentes (detect-bridges): dado el embedding de un
-- átomo, devuelve los más parecidos de OTRAS materias del MISMO usuario.
--
-- SECURITY DEFINER (la usa el pipeline con service_role), pero filtra user_id
-- EXPLÍCITAMENTE (§6, la trampa de Presupuestador): nunca cruza datos de otro.

create or replace function match_cross_queue(
  p_user_id uuid,
  p_embedding vector(1024),
  p_exclude_queue uuid,
  p_k int default 5
)
returns table (id uuid, title text, body text, queue_id uuid, similarity float)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.title, a.body, a.queue_id,
         1 - (a.embedding <=> p_embedding) as similarity
  from knowledge_atoms a
  where a.user_id = p_user_id                      -- defensa explícita
    and a.embedding is not null
    and (p_exclude_queue is null or a.queue_id <> p_exclude_queue)
  order by a.embedding <=> p_embedding
  limit p_k;
$$;

grant execute on function match_cross_queue(uuid, vector, uuid, int) to service_role;
