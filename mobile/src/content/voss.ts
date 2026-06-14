// Paquete de contenido — "Rompe la barrera del no" (Chris Voss). FUNDAMENTADO
// en el texto real (CONTENIDO/rompe-la-barrera-del-no-chris-voss.pdf): la
// apertura del secuestro, el reflejo, empatía táctica, preguntas calibradas,
// el cisne negro. Mundo visual: theme "negotiation". Español de España.
// Escrito por Claude leyendo la fuente (camino sin API key).

import { Capsule } from "../types";

export const intent = "negociar y comunicar mejor con empatía táctica en el día a día";

export const PACK: Capsule[] = [
  // ── NARRATIVE — la pregunta calibrada (apertura del secuestro) ──
  {
    id: "voss-01",
    queue: { title: "Rompe la barrera del no", type: "book", theme: "negotiation" },
    format: "narrative",
    novelty_score: 0.9,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "«Tenemos a su hijo. Un millón o muere.» Voss no respondió a la amenaza. Preguntó: «¿Cómo sé que sigue con vida?»." },
        { type: "develop", text: "Es una pregunta calibrada: empieza por «cómo» o «qué», no se puede contestar con un sí o un no, y obliga al otro a resolver TU problema. En vez de discutir el millón, puso al secuestrador a pensar en logística." },
        { type: "twist", text: "Discutir la postura del otro es perder. Hacerle una pregunta que no puede esquivar le da la ilusión de control… mientras eres tú quien dirige la conversación." },
      ],
    },
    reflection_prompt: "En tu próximo conflicto, en vez de rebatir: ¿qué pregunta de «cómo» o «qué» pondría la pelota en su tejado?",
  },
  // ── NARRATIVE — el reflejo (mirroring) ──────────────────────────
  {
    id: "voss-02",
    queue: { title: "Rompe la barrera del no", type: "book", theme: "negotiation" },
    format: "narrative",
    novelty_score: 0.9,
    estimated_seconds: 65,
    payload: {
      slides: [
        { type: "hook", text: "Repite las tres últimas palabras de quien te habla. Es ridículo… y casi mágico." },
        { type: "develop", text: "El FBI lo llama «reflejo»: repetir, en tono de pregunta, las últimas 1-3 palabras del otro. «¿Hicimos huir a tu conductor?». Por instinto, el interlocutor desarrolla, se explica más y se siente conectado." },
        { type: "twist", text: "Tememos lo distinto y nos atrae lo similar. Imitar las palabras del otro dispara ese instinto: no necesitas mejores argumentos, necesitas que siga hablando hasta revelarse." },
      ],
    },
    reflection_prompt: "La próxima vez que alguien suelte algo tenso, refleja sus últimas palabras y calla. ¿Qué más te cuenta?",
  },
  // ── INTERACTIVE — «tienes razón» vs «así es» ────────────────────
  {
    id: "voss-03",
    queue: { title: "Rompe la barrera del no", type: "book", theme: "negotiation" },
    format: "interactive",
    novelty_score: 0.95,
    estimated_seconds: 55,
    payload: {
      scenario: "Le resumes a alguien su propia situación hasta que reacciona. ¿Qué frase suya buscas?",
      choices: [
        { label: "«Tienes razón»", outcome: "Suena bien… pero suele ser el modo educado de que te calles y le dejes en paz. Por dentro no ha cambiado nada." },
        { label: "«Así es»", outcome: "Ahí está el avance. Significa que se ha sentido COMPRENDIDO, no presionado. A partir de ese «así es», la negociación se mueve." },
      ],
      insight: "«Tienes razón» te despide; «así es» te abre la puerta. Resume la perspectiva del otro hasta que diga «así es».",
    },
    reflection_prompt: "¿Cuándo dijiste «tienes razón» solo para terminar la conversación? ¿Te habían comprendido de verdad?",
  },
  // ── NARRATIVE — etiquetar emociones + auditoría de acusaciones ──
  {
    id: "voss-04",
    queue: { title: "Rompe la barrera del no", type: "book", theme: "negotiation" },
    format: "narrative",
    novelty_score: 0.85,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "Nombra el miedo del otro en voz alta y, en vez de crecer, se encoge." },
        { type: "develop", text: "Etiquetar: «parece que esto te preocupa», «da la impresión de que no te fías». Y la auditoría de acusaciones: di TÚ primero lo peor que el otro piensa de ti — «vas a pensar que soy un aprovechado…». Al ponerlo sobre la mesa, le quitas la carga." },
        { type: "twist", text: "Las emociones no se evitan, se etiquetan. Lo que callas crece; lo que nombras con calma se desactiva. El negociador no esquiva lo negativo: lo dice primero." },
      ],
    },
    reflection_prompt: "Esa conversación que evitas por miedo a su reacción: ¿y si nombras tú esa reacción antes que él?",
  },
  // ── STAT — el cisne negro ───────────────────────────────────────
  {
    id: "voss-05",
    queue: { title: "Rompe la barrera del no", type: "book", theme: "negotiation" },
    format: "stat",
    novelty_score: 0.9,
    estimated_seconds: 45,
    payload: {
      figure: "3-5",
      unit: "datos que lo cambian todo",
      claim: "En toda negociación hay entre 3 y 5 piezas de información que, de descubrirse, lo cambiarían todo. Voss las llama «cisnes negros».",
      reveal: "No negocias contra una postura, sino contra lo que NO sabes del otro. Escuchar no es esperar tu turno: es cazar el dato que reescribe la partida.",
    },
    reflection_prompt: "En tu último desacuerdo, ¿qué NO sabías de lo que de verdad le importaba al otro?",
  },
  // ── NARRATIVE — busca el «no», no el «sí» ───────────────────────
  {
    id: "voss-06",
    queue: { title: "Rompe la barrera del no", type: "book", theme: "negotiation" },
    format: "narrative",
    novelty_score: 0.85,
    estimated_seconds: 65,
    payload: {
      slides: [
        { type: "hook", text: "Quien tiene miedo a oír un «no» ya ha perdido la negociación." },
        { type: "develop", text: "Voss invierte la regla: no persigas el «sí» rápido (da miedo, compromete, pone en guardia). Busca el «no»: «¿Sería una locura que…?». El «no» hace que el otro se sienta seguro y al mando." },
        { type: "twist", text: "El «sí» prematuro es defensivo y vacío. El «no» es el principio de la conversación, no el final: le da permiso al otro para bajar la guardia y, entonces, abrirse." },
      ],
    },
    reflection_prompt: "¿Dónde persigues un «sí» rápido que en realidad es solo un «sí» para quitarte de encima?",
  },
  // ── RECALL — repaso de la pregunta calibrada ────────────────────
  {
    id: "voss-07",
    queue: { title: "Rompe la barrera del no", type: "book", theme: "negotiation" },
    format: "recall",
    novelty_score: 0.4,
    estimated_seconds: 35,
    payload: {
      prompt: "Hace poco viste cómo respondió Voss a «tenemos a su hijo, un millón o muere». Antes de revelarlo: ¿qué hizo en vez de discutir la cifra?",
      reveal: "Una pregunta calibrada: «¿Cómo sé que sigue con vida?». «Cómo/qué» en vez de rebatir → el otro resuelve tu problema y tú diriges la conversación.",
    },
    reflection_prompt: "¿En qué discusión reciente habrías ganado más preguntando «¿cómo?» que afirmando?",
  },
];
