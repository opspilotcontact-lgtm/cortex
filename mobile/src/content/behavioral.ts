// Paquete de contenido — "Economía del comportamiento" (materia/fuente).
// Esto es lo que se le "da de comer" al sistema de ingesta (scripts/generate.ts).
// Hoy lo escribe Claude (yo); mañana lo produce el pipeline de IA (§9) con la
// misma forma. Cada paquete = una fuente: un libro, un tema, una tarea.
// Mundo visual: theme "behavioral" (§11). Español de España.

import { Capsule } from "../types";

export const intent = "entender por qué tomo decisiones irracionales para decidir mejor en el día a día";

export const PACK: Capsule[] = [
  // ── STAT — la cifra que golpea ──────────────────────────────────
  {
    id: "be-01",
    queue: { title: "Economía del comportamiento", type: "book", theme: "behavioral" },
    format: "stat",
    novelty_score: 0.9,
    estimated_seconds: 40,
    payload: {
      figure: "2×",
      unit: "más duele perder que ganar",
      claim: "Perder 50 € duele aproximadamente el doble de lo que disfrutas al ganarlos.",
      reveal: "Por eso te aferras a inversiones que caen y a decisiones que ya no sirven: no calculas el futuro, huyes del dolor de aceptar la pérdida.",
    },
    reflection_prompt: "¿Qué mantienes en tu vida solo para no sentir que 'perdiste' lo que ya invertiste?",
  },
  // ── NARRATIVE — anclaje ─────────────────────────────────────────
  {
    id: "be-02",
    queue: { title: "Economía del comportamiento", type: "book", theme: "behavioral" },
    format: "narrative",
    novelty_score: 0.85,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "El primer número que oyes secuestra todos los que piensas después." },
        { type: "develop", text: "Giraban una ruleta trucada que solo caía en 10 o en 65, y justo después preguntaban qué porcentaje de países africanos hay en la ONU. Los que habían visto el 65 respondían mucho más alto que los que vieron el 10. Un número sin ninguna relación movió su juicio." },
        { type: "twist", text: "No es estupidez: es cómo funciona tu mente. Ante la incertidumbre te agarras al primer punto de referencia disponible y ajustas desde ahí, casi siempre demasiado poco. Quien dice el primer precio en una negociación ya ha movido el campo a su favor." },
      ],
    },
    reflection_prompt: "¿En qué decisión reciente aceptaste sin darte cuenta el 'primer número' que alguien puso sobre la mesa?",
  },
  // ── INTERACTIVE — el señuelo ────────────────────────────────────
  {
    id: "be-03",
    queue: { title: "Economía del comportamiento", type: "book", theme: "behavioral" },
    format: "interactive",
    novelty_score: 0.95,
    estimated_seconds: 55,
    payload: {
      scenario: "Una revista ofrece: solo web 59 €, o web+papel 125 €. Pocos cogen el combo. Añaden una opción: solo papel… también 125 €. ¿Qué pasa?",
      choices: [
        { label: "Nadie elige 'solo papel', así que da igual", outcome: "Eso parece. Pero su simple presencia lo cambia todo: ahora 'web+papel por 125' parece un chollo al lado de 'papel por 125'." },
        { label: "Las ventas del combo se disparan", outcome: "Exacto. La opción inútil no se vende: existe para que otra parezca irresistible por comparación." },
      ],
      insight: "El efecto señuelo: no comparamos en abstracto, comparamos contra lo que tenemos al lado. Quien diseña las opciones diseña tu elección.",
    },
    reflection_prompt: "¿Qué 'opción señuelo' crees que pusieron a tu lado la última vez que elegiste el plan 'mediano' de algo?",
  },
  // ── STAT — el poder de la opción por defecto ────────────────────
  {
    id: "be-04",
    queue: { title: "Economía del comportamiento", type: "book", theme: "behavioral" },
    format: "stat",
    novelty_score: 0.9,
    estimated_seconds: 40,
    payload: {
      figure: "99 %",
      unit: "vs. 12 % al lado",
      claim: "En Austria casi todos son donantes de órganos. En la vecina Alemania, solo el 12 %.",
      reveal: "Misma cultura, misma gente. La única diferencia: en Austria donar viene marcado por defecto y hay que salir; en Alemania hay que entrar. Casi nadie cambia la casilla que viene puesta.",
    },
    reflection_prompt: "¿Qué 'casillas por defecto' (suscripciones, ajustes, rutinas) sigues aceptando solo porque venían marcadas?",
  },
  // ── VISUAL — los dos sistemas de la mente ───────────────────────
  {
    id: "be-05",
    queue: { title: "Economía del comportamiento", type: "book", theme: "behavioral" },
    format: "visual",
    novelty_score: 0.8,
    estimated_seconds: 45,
    payload: {
      render: "concept_map",
      nodes: [
        { id: "s1", label: "Sistema 1\nrápido" },
        { id: "sesgo", label: "Respuesta\nintuitiva" },
        { id: "s2", label: "Sistema 2\nlento" },
      ],
      edges: [
        { from: "s1", to: "sesgo" },
        { from: "sesgo", to: "s2" },
        { from: "s2", to: "s1" },
      ],
      caption: "El Sistema 1 responde solo y al instante; el Sistema 2, perezoso, suele firmar sin revisar. Por ese atajo se cuela el sesgo.",
    },
    reflection_prompt: "¿Cuándo fue la última vez que tu 'Sistema 2' se molestó de verdad en revisar una corazonada rápida?",
  },
  // ── NARRATIVE — coste hundido ───────────────────────────────────
  {
    id: "be-06",
    queue: { title: "Economía del comportamiento", type: "book", theme: "behavioral" },
    format: "narrative",
    novelty_score: 0.9,
    estimated_seconds: 65,
    payload: {
      slides: [
        { type: "hook", text: "Terminar una película malísima que ya odias no recupera las dos horas. Las convierte en cuatro." },
        { type: "develop", text: "Es la falacia del coste hundido: lo que ya gastaste —tiempo, dinero, esfuerzo— no vuelve, elijas lo que elijas, así que no debería pesar en la decisión. Pero pesa. 'Llevo demasiado metido para dejarlo ahora' es justo la trampa." },
        { type: "twist", text: "La pregunta correcta nunca es '¿cuánto llevo invertido?', sino '¿empezaría esto HOY desde cero, sabiendo lo que ya sé?'. Si la respuesta es no, lo demás es aversión a la pérdida disfrazada de coherencia." },
      ],
    },
    reflection_prompt: "Aplica la pregunta: ¿qué cosa NO empezarías hoy desde cero… y sigues manteniendo solo por lo que ya metiste?",
  },
  // ── RECALL — repaso de la aversión a la pérdida ─────────────────
  {
    id: "be-07",
    queue: { title: "Economía del comportamiento", type: "book", theme: "behavioral" },
    format: "recall",
    novelty_score: 0.4,
    estimated_seconds: 35,
    payload: {
      prompt: "Hace poco viste por qué cuesta tanto soltar lo que ya no funciona. Antes de revelarlo: ¿cuánto más pesa una pérdida que una ganancia equivalente?",
      reveal: "Alrededor del doble. Esa aversión a la pérdida es la que hace que el coste hundido te atrape: no decides hacia el futuro, huyes del dolor presente.",
    },
    reflection_prompt: "¿Has soltado algo desde que viste esa idea, o sigues 'esperando a recuperar lo invertido'?",
  },
];
