# Cortex · Fase 0 — Validación de contenido

> **Objetivo (del §12 del plan):** validar que el *formato cápsula* engancha
> **ANTES** de construir la app. Si al día 7 lo seguís abriendo → seguir a Fase 1.
> Si lo abandonás al día 3 → el formato no engancha y hay que repensar.
> Esto te ahorra un mes de Expo + Supabase si la apuesta es mala.

## Qué es

Un prototipo **autocontenido** (HTML + JS, sin servidor, sin build) que reproduce
el **Modo Flow** del §2 con cápsulas `narrative`:

- Abrís → **una** cápsula → swipe vertical entre slides → reflexión → fin.
- Botones **"Otra"** y **"Listo por ahora"** igual de prominentes (§11, anti-adicción).
- Sin autoplay, sin feed infinito, sin contador "siguiente en 3, 2, 1".
- Progreso hacia la meta diaria como **identidad**, no racha de culpa.
- Guardar una idea con un gesto (botón marcador / feedback háptico en móvil).
- Telemetría local: completadas, saltadas, guardadas, reflexiones, días activos.

El renderer es **genérico**: lee `capsule.format` + `capsule.payload` (igual que el
§8 del plan) y despacha. Hoy implementa `narrative`; agregar `interactive`/`visual`/
`bridge` después es agregar un `case`. Eso ya valida tu diseño de schema.

## Cómo usarlo (el experimento de 7 días)

1. **Abrí `index.html`** en el navegador del celular (es donde se usa de verdad:
   bondi, cola del súper, sofá). En escritorio también anda.
   - Para tenerlo a mano en el teléfono: subilo a cualquier hosting estático
     (Netlify drop, GitHub Pages, `python -m http.server`) o abrilo desde el
     archivo. "Agregar a pantalla de inicio" lo deja como una app.
2. **Usalo en tiempos muertos reales**, no en una sesión de prueba sentado.
   La regla del producto es esa: reemplazar el *momento* de abrir TikTok.
3. **No te fuerces.** Si no te dan ganas de abrirlo, NO lo abras. Ese dato
   (que no lo abrís) es justamente lo que el experimento mide.
4. Al día 7, abrí **"ver mi experimento de 7 días"** desde el inicio y mirá:
   - ¿En cuántos días lo abriste?
   - ¿Completás o cerrás sin terminar? (skip rápido = mal gancho, §7)
   - ¿Guardaste ideas? ¿Escribiste reflexiones?

## Criterio de éxito (§15)

> A los ~14 días, al desbloquear el teléfono en un hueco, abrís Cortex en vez
> de TikTok **más de la mitad de las veces** — y sentís que aprendiste algo
> que conecta con lo que ya sabés.

La telemetría no te da el "vs TikTok" (eso es honestidad tuya), pero sí te da
la base: frecuencia, finalización, retención de ideas.

## Cómo cambiar el contenido

Todo el contenido vive en **`capsules.js`** (separado a propósito: el renderer es
genérico). Reescribí ese array con tu propio tema real y recargá. El esquema de
cada cápsula está documentado arriba del archivo. La barra de calidad del §1:
**provocador y contraintuitivo, no resúmenes**. Si se siente como flashcard, no va.

El prototipo trae 12 cápsulas en 2 queues (*Hábitos Atómicos* y *Pensamiento
sistémico*) para que al abrir no sepas de cuál vendrá — eso testea la **recompensa
variable**, no solo el formato. Dos de las cápsulas de sistemas conectan a propósito
con las de hábitos: es un anticipo de la magia del *puente* (§8), sin construirlo aún.

## Lo que esta fase NO hace (a propósito)

- No hay backend, ni Supabase, ni IA: el contenido es manual (así lo pide la Fase 0).
- No hay Modo Depth, ni grafo, ni puentes generados, ni repaso espaciado.
- No hay sync ni multi-dispositivo: los datos viven en `localStorage` de ese navegador.

Todo eso es Fase 1+ — y solo si la Fase 0 pasa.
