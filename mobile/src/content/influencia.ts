// Paquete de contenido — "Influencia: ciencia y práctica" (Robert Cialdini).
// FUNDAMENTADO en el texto real (CONTENIDO/robert-caldini-influencia...pdf):
// la joyería de turquesas, "clic, bzzz" (Langer/«porque»), el principio del
// contraste, las armas de influencia. Mundo visual: theme "influence".
// Español de España. Escrito por Claude leyendo la fuente (camino sin API key).

import { Capsule } from "../types";

export const intent = "reconocer y resistir las armas de persuasión en el día a día";

export const PACK: Capsule[] = [
  // ── STAT — la joyería de turquesas ──────────────────────────────
  {
    id: "inf-01",
    queue: { title: "Influencia", type: "book", theme: "influence" },
    format: "stat",
    novelty_score: 0.95,
    estimated_seconds: 45,
    payload: {
      figure: "2×",
      unit: "el precio… y se agotaron",
      claim: "Una joyería no lograba vender sus turquesas. Por error las marcaron al DOBLE de precio. Se agotaron en días.",
      reveal: "Ante la duda, usamos un atajo: «caro = bueno». No compraron piedras; compraron una señal de calidad. Clic, bzzz.",
    },
    reflection_prompt: "¿Qué compraste (o descartaste) hace poco juzgando por el precio, sin saber nada más del producto?",
  },
  // ── NARRATIVE — clic, bzzz / el poder de «porque» ───────────────
  {
    id: "inf-02",
    queue: { title: "Influencia", type: "book", theme: "influence" },
    format: "narrative",
    novelty_score: 0.9,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "La palabra «porque» te hace decir que sí — aunque la razón no diga nada." },
        { type: "develop", text: "En el experimento de Langer, pedir colarse en la fotocopiadora «porque tengo que hacer copias» (¡una obviedad!) funcionaba casi tanto como dar un motivo real. La estructura «petición + porque» disparaba el sí automático." },
        { type: "twist", text: "Tenemos cintas de conducta pregrabadas: ante cierta señal se activa la respuesta sin pensar. Clic (la señal), bzzz (la secuencia). Nos ahorra colapsar… y la explota quien conoce el botón." },
      ],
    },
    reflection_prompt: "¿En qué decisiones vas en piloto automático («clic, bzzz») cuando deberías pararte a pensar?",
  },
  // ── NARRATIVE — el principio del contraste ──────────────────────
  {
    id: "inf-03",
    queue: { title: "Influencia", type: "book", theme: "influence" },
    format: "narrative",
    novelty_score: 0.9,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "El vendedor te enseña primero el traje caro. No es casualidad: es para que el jersey te parezca barato." },
        { type: "develop", text: "El contraste perceptivo: un objeto se juzga según el que viene justo antes. Los inmobiliarios enseñan primero un par de casas malas y caras; los concesionarios cierran el precio del coche y LUEGO ofrecen los extras, que al lado parecen calderilla." },
        { type: "twist", text: "Nunca juzgas en absoluto: juzgas en relativo. Y quien controla el ORDEN en que ves las cosas controla lo que te parece caro, feo o razonable." },
      ],
    },
    reflection_prompt: "¿Qué te han hecho ver como «una ganga» poniéndote justo antes algo mucho peor o más caro?",
  },
  // ── INTERACTIVE — reciprocidad ──────────────────────────────────
  {
    id: "inf-04",
    queue: { title: "Influencia", type: "book", theme: "influence" },
    format: "interactive",
    novelty_score: 0.9,
    estimated_seconds: 55,
    payload: {
      scenario: "Un desconocido te hace un pequeño favor o regalo sin que lo pidas. Después te pide algo. ¿Qué notas?",
      choices: [
        { label: "Nada; valoro su petición de forma independiente", outcome: "Eso te gustaría. Pero la reciprocidad es de las reglas más fuertes que existen: la mayoría siente una deuda incómoda y cede más de lo que querría." },
        { label: "Una presión incómoda a devolverle el favor", outcome: "Exacto. Por eso funcionan la muestra gratis, el caramelo con la cuenta o la flor de los Hare Krishna: el regalo crea una deuda que pagas comprando." },
      ],
      insight: "La reciprocidad obliga: «debemos corresponder a lo que otro nos da». Quien da primero, dirige.",
    },
    reflection_prompt: "¿A qué dijiste «sí» últimamente más por sentirte en deuda que por quererlo de verdad?",
  },
  // ── NARRATIVE — autoridad ───────────────────────────────────────
  {
    id: "inf-05",
    queue: { title: "Influencia", type: "book", theme: "influence" },
    format: "narrative",
    novelty_score: 0.85,
    estimated_seconds: 65,
    payload: {
      slides: [
        { type: "hook", text: "Una bata blanca o un título te apagan el sentido crítico más de lo que crees." },
        { type: "develop", text: "Cialdini avisa de una tendencia inquietante: aceptar sin pensar lo que dice quien «parece» una autoridad. Y no la autoridad real — bastan sus SÍMBOLOS: el título, el uniforme, el coche caro." },
        { type: "twist", text: "El atajo «si un experto lo dice, es verdad» ahorra esfuerzo… y por eso salen actores con bata en los anuncios. La pregunta no es «¿es una autoridad?», sino «¿es experto EN ESTO, y es honesto aquí?»." },
      ],
    },
    reflection_prompt: "¿A quién obedeces por su símbolo de autoridad (cargo, bata, traje) más que por lo que de verdad sabe del tema?",
  },
  // ── STAT — escasez ──────────────────────────────────────────────
  {
    id: "inf-06",
    queue: { title: "Influencia", type: "book", theme: "influence" },
    format: "stat",
    novelty_score: 0.85,
    estimated_seconds: 40,
    payload: {
      figure: "1",
      unit: "«última unidad»",
      claim: "«Solo quedan 2», «oferta hasta medianoche», «edición limitada». La galleta sabe mejor cuando queda una.",
      reveal: "La escasez dispara el deseo: lo que puedes perder pesa más que lo que puedes ganar. No quieres el objeto; temes quedarte fuera.",
    },
    reflection_prompt: "¿Qué compraste por «se acaba ya» y luego no usaste? ¿Era deseo… o miedo a perdértelo?",
  },
  // ── NARRATIVE — compromiso y coherencia ─────────────────────────
  {
    id: "inf-07",
    queue: { title: "Influencia", type: "book", theme: "influence" },
    format: "narrative",
    novelty_score: 0.85,
    estimated_seconds: 65,
    payload: {
      slides: [
        { type: "hook", text: "Si consiguen que digas un «sí» pequeño, el «sí» grande viene casi solo." },
        { type: "develop", text: "Una vez tomas una postura, sientes la presión de comportarte de forma coherente con ella. Por eso piden primero algo mínimo (una firma, un cartelito): después aceptas peticiones mucho mayores para no contradecirte." },
        { type: "twist", text: "La coherencia te ahorra repensarlo todo, pero te vuelve previsible: ese primer compromiso público es el ancla que el otro usará para llevarte donde quiera." },
      ],
    },
    reflection_prompt: "¿A qué pequeño «sí» te comprometiste que luego te arrastró a algo mucho mayor?",
  },
  // ── RECALL — repaso de clic, bzzz ───────────────────────────────
  {
    id: "inf-08",
    queue: { title: "Influencia", type: "book", theme: "influence" },
    format: "recall",
    novelty_score: 0.4,
    estimated_seconds: 35,
    payload: {
      prompt: "Hace poco viste por qué la joyería agotó las turquesas al DOBLE de precio. Antes de revelarlo: ¿qué atajo mental usaron los clientes?",
      reveal: "«Caro = bueno». Ante la incertidumbre reaccionaron solo al precio (clic, bzzz) en vez de evaluar la joya. El precio era la señal, no el valor.",
    },
    reflection_prompt: "¿Dónde usas tú «caro = bueno» sin darte cuenta?",
  },
];
