-- ════════════════════════════════════════════════════════════════
-- Cortex · 0004 — añadir 'bridge' a queue_type (§8, §11)
-- ════════════════════════════════════════════════════════════════
-- El modelo de la app trata el "Puente inesperado" como una materia con
-- su propio mundo visual (theme 'bridge'). El enum original no lo incluía;
-- esto alinea el esquema con el dominio. ADD VALUE no puede usarse en la
-- misma transacción en que se crea, pero aquí se consume desde el seed
-- (conexión aparte, ya commiteado), así que es seguro.

alter type queue_type add value if not exists 'bridge';
