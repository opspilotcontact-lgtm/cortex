# Cortex

> Aprendizaje en tiempos muertos, sin la adicción. Reemplaza el *momento* de
> abrir TikTok, no la experiencia de scroll infinito.
>
> Proyecto personal de Juan Ortiz Romero · Disciplina bilingüe: **UI y contenido
> en español, código en inglés.**

La fuente de verdad de producto y arquitectura es **[`CORTEX_PLAN.md`](CORTEX_PLAN.md)**.
Léelo antes de tocar nada. Este README es solo el tablero de estado.

## Principio de ejecución

Se construye **por fases pequeñas y verificables** (§12). No se implementa todo de
golpe. Riesgo conocido del proyecto: *generar documentación/código en vez de validar*.
Cada fase tiene que producir algo usable y un criterio para seguir o frenar.

## Estado por fases

| Fase | Qué | Estado |
|---|---|---|
| **0 · Validación de contenido** | HTML con cápsulas `narrative` + swipe, sin app. Usar 7 días. | ✅ **Construido** → [`phase-0-validation/`](phase-0-validation/) |
| 1 · MVP Flow | Auth + 1 queue, pipeline mínimo (extract→embed→build), Modo Flow real, caché local, telemetría. | 🚧 **En progreso.** ✅ App Expo ([`mobile/`](mobile/)): Modo Flow real — renderer genérico con **7 formatos** (`narrative`, `interactive`, `bridge`, `visual` con SVG, `recall`, `stat`, `motion` = escena HTML+GSAP en iframe/WebView, "vídeo animado"), **swipe + animaciones** (Reanimated 4 + Gesture Handler), motor de servido, persistencia (AsyncStorage) y **pantalla de experimento** (telemetría §15). Verificado en Expo web. ✅ **Conectada a Supabase LOCAL** (Docker): auth real (auto-login dev) + RLS + feed normalizado leído vía embed (`source.ts`), con **fallback offline al seed**. ✅ **Camino de escritura** (`sync.ts`): telemetría, guardados y reflexiones se persisten en la BD — verificado fila a fila. ✅ **Sistema de ingesta** (`scripts/generate.ts` + `src/content/`): se le "da de comer" una fuente (libro/tema) y la mete en la BD; hoy el generador es Claude en sesión, listo para que lo sea la IA. Migraciones 0001–0007. ✅ **Generador de IA** (`scripts/generate-ai.ts` + `ai/extract.ts`): `npm run generate:ai -- "Libro" <mundo> ["intent"] [--pdf ruta]` destila una fuente con Claude (Sonnet 4.6, structured outputs) → ingiere por el mismo camino. ✅ **Ingesta de PDF** (`scripts/lib/pdf.ts`, pdftotext): el flag `--pdf` extrae el texto REAL del libro para fundamentar la extracción (verificado). Listo para encender con `ANTHROPIC_API_KEY`. Mientras tanto, packs fundamentados a mano desde los PDF de `CONTENIDO/` (p.ej. `src/content/piense.ts` desde *Piense y hágase rico*). ✅ **Aislamiento RLS verificado con 2 cuentas** (`npm run test:rls`, §6/§12 — 6 checks: tablas, lectura por id, RPC `match_knowledge`, `with_check`). ✅ **Caché offline** (`source.ts`): cascada Supabase en vivo → caché del feed real (AsyncStorage) → seed embebido; lee en el bus/metro sin cobertura. ⏳ Pendiente: ejecutar el pipeline IA con key (autónomo vía cron/EF), Supabase Cloud (facturación). |
| 2 · Variedad y repaso | Formatos `interactive`/`visual`, repaso espaciado, interleaving multi-queue. | ✅ **Construida.** ✅ Formatos `interactive`, `visual`, `recall` y `stat` en el renderer · ✅ **11 mundos visuales** por materia (habits, systems, bridge, behavioral, stoic, wealth, influence, negotiation, manson, ignite, titans) con colores Y tipografías propias · ✅ **Motor de servido §7 completo** (`serving.ts` + `sm2.ts`, verificado `npm run test:serving` — 13 checks): **repaso espaciado SM-2** (cada cápsula aprendida agenda su repaso; al recordarla te autocalificas «no/a medias/sí» y el intervalo se alarga o reinicia), **creación automática** del recall desde el contenido original (`buildAutoRecall`, sin IA — el §7 `buildRecallCapsule`), inyección de puentes (P_bridge), interleaving + novelty. · ✅ **animaciones** (`animation-principles` sobre Reanimated): count-up en `stat`, entradas coreografiadas con stagger + énfasis (`back.out`). |
| 3 · Puentes | Detección de puentes (vector search + juicio Opus), formato `bridge`. | 🟢 **Código completo, key-gated.** ✅ Formato `bridge` + puentes manuales (grafo, drag). ✅ Pipeline IA escrito: `match_cross_queue` (pgvector), EF `embed` (Voyage) y EF `detect-bridges` (vecinos semánticos + juicio de Opus 4.8 con thinking adaptativo → `bridges` ai_detected + cápsula servible). ⏳ Solo falta `VOYAGE_API_KEY` + `ANTHROPIC_API_KEY` para ejecutarlo. |
| 4 · Modo Depth | Expandir cápsula → guardar / nota / chat IA con RAG (streaming). | 🟡 **Iniciada.** ✅ Pantalla **"Tu mente"** ([`DepthView.tsx`](mobile/src/flow/DepthView.tsx)): **añadir contenido manual** (apuntar idea → `user_notes`; crear materia → `learning_queues`) y **preguntar a tu memoria** (recuperación por texto sobre tus átomos+notas, `contribute.ts`). Verificado en BD. ✅ **Chat RAG construido** ([`supabase/functions/chat`](supabase/functions/chat/index.ts)): la EF recupera el conocimiento del usuario (filtrado por `user_id`, §6) y Claude responde *pensando con él* (§10); el cliente (`askAI`) la invoca y **degrada con elegancia** a solo-recuperación si no hay key (verificado: 405 ms, sin colgarse). ⏳ Solo falta servir la EF con `ANTHROPIC_API_KEY` (y embeddings Voyage para pasar de recuperación-texto a vectorial). |
| 5 · Grafo personal | Vista de grafo, puentes manuales (drag), realimentan el algoritmo. | 🟢 **v1 construida.** ✅ Vista force-directed en SVG ([`GraphView.tsx`](mobile/src/flow/GraphView.tsx)): nodos = átomos guardados + notas, color por materia; aristas = puentes (sólida user / punteada IA, grosor=strength). ✅ **Conectar dos nodos crea un puente manual** (`bridges` origin `user_created`) **+ una cápsula `bridge` servible** → realimenta el motor §7 (verificado en BD). ✅ **Drag real**: nodos arrastrables (Reanimated + Gesture); soltar uno sobre otro tiende el puente, o tocar dos. ⏳ Puentes `ai_detected` (Fase 3, necesita key). |
| 6 · Pulido / multi-usuario | Hardening RLS con dos cuentas, offline robusto, decisión comercial. | ⬜ Pendiente |

## Ahora mismo: Fase 0

👉 **[`phase-0-validation/`](phase-0-validation/)** — abrí `index.html` en el
celular y usalo en tiempos muertos reales durante 7 días. El README de esa carpeta
explica el protocolo y el criterio de éxito (§15).

**La regla de oro:** no avanzar a Fase 1 hasta que Fase 0 demuestre que el formato
engancha. Si al día 7 no lo estás abriendo, el problema es el formato — y mejor
descubrirlo ahora que después de construir Supabase + Expo + el pipeline de IA.

## Stack (Fase 1+)

Expo (React Native) + TS · Reanimated 4 + Gesture Handler + react-native-svg ·
Supabase (Postgres + RLS + pgvector + Edge Functions) · Claude API
(`claude-opus-4-8` / `sonnet-4-6` / `haiku-4-5`) · Voyage embeddings. Detalle y
notas de implementación verificadas en [`CORTEX_PLAN.md`](CORTEX_PLAN.md) §4–§10.
