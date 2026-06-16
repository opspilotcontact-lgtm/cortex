-- ════════════════════════════════════════════════════════════════
-- Cortex · 0010 — añadir 'quiz' y 'activity' a capsule_format (§8)
-- ════════════════════════════════════════════════════════════════
-- Sistema de plantillas: más que frases. quiz (pregunta + opciones + por qué)
-- y activity (un reto para hacer en el mundo real). Alinea el enum con el
-- renderer (QuizBody / ActivityBody) y el generador de IA.

alter type capsule_format add value if not exists 'quiz';
alter type capsule_format add value if not exists 'activity';
