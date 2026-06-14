-- ════════════════════════════════════════════════════════════════
-- Cortex · 0007 — añadir 'stat' a capsule_format (§8)
-- ════════════════════════════════════════════════════════════════
-- Nuevo formato de cápsula: una cifra que golpea (gancho) → toque revela el
-- giro contraintuitivo. Alinea el enum del esquema con el renderer de la app.

alter type capsule_format add value if not exists 'stat';
