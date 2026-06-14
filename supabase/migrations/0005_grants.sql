-- ════════════════════════════════════════════════════════════════
-- Cortex · 0005 — GRANTs a la Data API (§6)
-- ════════════════════════════════════════════════════════════════
-- Con el nuevo default de Supabase (auto_expose_new_tables sin definir), las
-- tablas nuevas de `public` NO se exponen a los roles de la Data API. PostgREST
-- necesita permiso a NIVEL DE TABLA antes de que RLS entre a filtrar filas.
-- RLS (0002) sigue siendo la frontera real fila-a-fila; esto es solo el GRANT.
--
-- · authenticated: CRUD en todas las tablas → RLS lo acota a sus propias filas.
-- · service_role:   acceso total (lo usa el pipeline; ya saltaba RLS).
-- · anon:           sin acceso (la app exige sesión; RLS lo bloquearía igual).

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to authenticated, service_role;

grant execute on all functions in schema public
  to authenticated, service_role;

-- Que lo anterior aplique también a objetos creados en migraciones futuras.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to authenticated, service_role;
