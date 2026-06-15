-- ════════════════════════════════════════════════════════════════
-- Cortex · 0008 — añadir 'motion' a capsule_format (§8)
-- ════════════════════════════════════════════════════════════════
-- Nuevo formato: escena animada HTML+GSAP que se reproduce en bucle (un
-- "vídeo animado" sin vídeo), renderizada en WebView/iframe. Alinea el enum
-- con el renderer (MotionBody + scenes.ts).

alter type capsule_format add value if not exists 'motion';
