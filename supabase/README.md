# Cortex · Backend (Supabase)

Capa de datos de la Fase 1. Implementa el §6 (modelo de datos), §9 (cola del
pipeline) y §10 (RAG) del [`CORTEX_PLAN.md`](../CORTEX_PLAN.md), con las
correcciones técnicas verificadas ya aplicadas.

## Migraciones

| Archivo | Qué hace |
|---|---|
| `migrations/0001_init.sql` | Extensiones, tipos, tablas, índices (HNSW en los vectoriales) |
| `migrations/0002_rls.sql` | RLS en todas las tablas, aislamiento por `user_id` |
| `migrations/0003_functions.sql` | RPC de RAG (`match_knowledge`, SECURITY INVOKER) + trigger que encola la extracción |

## Cómo aplicarlas (cuando quieras — aún NO se ha tocado ningún proyecto)

**Opción A — Supabase CLI (recomendado, local primero):**
```bash
supabase init          # si no existe el proyecto local
supabase start         # stack local (Postgres + Auth + ...)
supabase db reset      # aplica todas las migraciones de migrations/
```

**Opción B — proyecto remoto:**
```bash
supabase link --project-ref <tu-ref>
supabase db push
```

> Las extensiones `vector`, `pg_cron` y `pg_net` deben estar habilitadas. En
> Supabase Cloud se activan desde *Database → Extensions* (o las crea
> `0001_init.sql` con `create extension if not exists`).

## Cosas a verificar antes de cerrar la fase

- [ ] **RLS con dos cuentas:** crear 2 usuarios, datos en cada uno, y comprobar
      que ninguno ve lo del otro (incluido `match_knowledge`). Es la prueba que
      faltó en Presupuestador.
- [ ] **`match_knowledge` no filtra entre usuarios:** llamarla autenticado como
      A y confirmar que jamás devuelve átomos/notas de B.
- [ ] **Disciplina service_role:** las Edge Functions usan la service_role key,
      que SALTEA RLS. Toda función debe filtrar `user_id` explícitamente.

## Siguiente (aún no construido)

`functions/` — Edge Functions del pipeline (§9): `extract-atoms`, `embed`,
`detect-bridges`, `build-capsules`, `chat`. Recordar la disciplina de API del
§4/§16: nada de `temperature`/`budget_tokens`; usar `effort` + `thinking:
adaptive` y `output_config.format` para JSON.
