// Paquete — "El poder de los 5 segundos" (Mel Robbins). Fundamentado en el texto
// real (CONTENIDO/36...Mel Robbins.pdf): la Técnica de los 5 segundos, 5-4-3-2-1,
// el córtex prefrontal, la valentía como empujón. Mundo: theme "ignite".

import { Capsule } from "../types";

export const intent = "vencer la procrastinación y actuar antes de que el cerebro me sabotee";

export const PACK: Capsule[] = [
  {
    id: "rob-01", queue: { title: "El poder de los 5 segundos", type: "book", theme: "ignite" }, format: "stat",
    novelty_score: 0.9, estimated_seconds: 40,
    payload: { figure: "5", unit: "segundos para actuar", claim: "Hay una ventana de unos 5 segundos entre el impulso de actuar y el instante en que tu cerebro lo mata con excusas.", reveal: "Si en esos 5 segundos no te mueves, el instinto se apaga y la duda gana por defecto." },
    reflection_prompt: "¿Cuántos buenos impulsos mataste hoy esperando «el momento adecuado»?",
  },
  {
    id: "rob-02", queue: { title: "El poder de los 5 segundos", type: "book", theme: "ignite" }, format: "narrative",
    novelty_score: 0.95, estimated_seconds: 70,
    payload: { slides: [
      { type: "hook", text: "Cuenta hacia atrás: 5-4-3-2-1. Como el despegue de un cohete. Y muévete antes del 1." },
      { type: "develop", text: "Mel Robbins descubrió que contar 5-4-3-2-1 interrumpe el bucle de la duda y despierta el córtex prefrontal —el del cambio y la acción—. El conteo le da una orden a tu cerebro mientras le quitas tiempo para sabotearte." },
      { type: "twist", text: "No necesitas más motivación; es un mito para la acción difícil. Necesitas un EMPUJÓN mecánico que actúe antes de que tus sentimientos voten en contra." },
    ] },
    reflection_prompt: "Eso que llevas posponiendo: ¿harías 5-4-3-2-1 y el primer micro-paso ahora mismo?",
  },
  {
    id: "rob-03", queue: { title: "El poder de los 5 segundos", type: "book", theme: "ignite" }, format: "interactive",
    novelty_score: 0.9, estimated_seconds: 55,
    payload: {
      scenario: "Suena la alarma para entrenar o ponerte con tu proyecto. No tienes ninguna gana. ¿Qué haces?",
      choices: [
        { label: "Espero a sentirme motivado", outcome: "La motivación rara vez llega antes. Esperarla es darle a tus sentimientos el voto decisivo, y casi siempre votan «mañana»." },
        { label: "5-4-3-2-1 y me muevo antes de pensarlo", outcome: "Te adelantas al cerebro. La motivación, si aparece, lo hace DESPUÉS de empezar, no antes." },
      ],
      insight: "No actúas porque te sientes motivado; te sientes motivado porque actuaste. El conteo rompe el orden equivocado.",
    },
    reflection_prompt: "¿Dónde esperas «tener ganas» para algo que solo arranca si empiezas sin ellas?",
  },
  {
    id: "rob-04", queue: { title: "El poder de los 5 segundos", type: "book", theme: "ignite" }, format: "narrative",
    novelty_score: 0.85, estimated_seconds: 60,
    payload: { slides: [
      { type: "hook", text: "La valentía no es un rasgo de personalidad. Es un empujón de cinco segundos." },
      { type: "develop", text: "Robbins: ser valiente no es no tener miedo, es moverte en los 5 segundos antes de que el miedo te paralice. La gente «valiente» no siente menos miedo; actúa más rápido que él." },
      { type: "twist", text: "Eso significa que la valentía está disponible para cualquiera, ahora mismo. No hace falta cambiar quién eres: hace falta un conteo y un movimiento." },
    ] },
    reflection_prompt: "¿Qué acto pequeño de valentía cabe en tus próximos 5 segundos?",
  },
  {
    id: "rob-05", queue: { title: "El poder de los 5 segundos", type: "book", theme: "ignite" }, format: "narrative",
    novelty_score: 0.85, estimated_seconds: 60,
    payload: { slides: [
      { type: "hook", text: "Tu vida no la cambian las grandes decisiones. La cambian los micro-momentos de cinco segundos." },
      { type: "develop", text: "Cada día tienes decenas de instantes en que puedes empujarte o rendirte: levantarte, hablar, empezar, parar. Robbins lo llama el poder de las decisiones de cinco segundos: pequeñas, constantes, acumulativas." },
      { type: "twist", text: "Esperas el gran momento de transformación. Pero el cambio no es un evento: es la suma de cientos de empujones de cinco segundos que nadie ve." },
    ] },
    reflection_prompt: "¿Qué micro-decisión de cinco segundos, repetida cada día, te cambiaría en un año?",
  },
  {
    id: "rob-06", queue: { title: "El poder de los 5 segundos", type: "book", theme: "ignite" }, format: "recall",
    novelty_score: 0.4, estimated_seconds: 35,
    payload: { prompt: "Hace poco viste por qué actúas o no actúas. Antes de revelarlo: ¿qué pasa en los 5 segundos tras un impulso?", reveal: "Si no te mueves, el cerebro lo mata con excusas y la duda gana. 5-4-3-2-1 interrumpe ese bucle y despierta el córtex prefrontal." },
    reflection_prompt: "¿Usaste la cuenta atrás hoy, o dejaste que el cerebro votara que no?",
  },
];
