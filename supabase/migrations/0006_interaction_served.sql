-- ════════════════════════════════════════════════════════════════
-- Cortex · 0006 — añadir 'served' a interaction_action (§7)
-- ════════════════════════════════════════════════════════════════
-- La app registra cuándo se SIRVE una cápsula (denominador del skip-rate:
-- served vs skipped/completed mide si el gancho funciona). El enum original
-- solo tenía las acciones posteriores. Esto alinea la telemetría persistida
-- con la que ya recoge el cliente.

alter type interaction_action add value if not exists 'served';
