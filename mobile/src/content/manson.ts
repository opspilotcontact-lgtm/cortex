// Paquete — "El sutil arte de que te importe un carajo" (Mark Manson).
// Fundamentado en el texto real (CONTENIDO/9786079765453.pdf): la felicidad es
// un problema, tú no eres especial, los valores, responsabilidad vs culpa.
// Mundo: theme "manson". Español de España.

import { Capsule } from "../types";

export const intent = "elegir mejor en qué me importa y dejar de perseguir sentirme bien";

export const PACK: Capsule[] = [
  {
    id: "man-01", queue: { title: "El sutil arte", type: "book", theme: "manson" }, format: "narrative",
    novelty_score: 0.9, estimated_seconds: 70,
    payload: { slides: [
      { type: "hook", text: "La felicidad no es un estado al que llegas. Es resolver problemas. Y no se acaban nunca." },
      { type: "develop", text: "Manson le da la vuelta: no buscas una vida SIN problemas (eso es la muerte), buscas MEJORES problemas. La felicidad nace de resolverlos, no de evitarlos. Quien los evita no es feliz: está anestesiado." },
      { type: "twist", text: "Por eso «quiero ser feliz» es una meta vacía. La pregunta útil es: ¿qué dolor estás dispuesto a aguantar? Eliges tu vida eligiendo tus problemas." },
    ] },
    reflection_prompt: "¿Qué problema MERECE la pena en tu vida ahora? ¿Y cuál aguantas que no la merece?",
  },
  {
    id: "man-02", queue: { title: "El sutil arte", type: "book", theme: "manson" }, format: "stat",
    novelty_score: 0.85, estimated_seconds: 40,
    payload: { figure: "0", unit: "energía infinita para que te importe", claim: "Tu atención y tus cuidados son finitos. No puedes hacer que te importe todo.", reveal: "Madurar no es dejar de que te importen las cosas: es elegir mejor EN QUÉ. Reservar tus pocas «mierdas que dar» para lo que de verdad las merece." },
    reflection_prompt: "Enumera 3 cosas que te quitan energía. ¿De verdad merecen que te importen?",
  },
  {
    id: "man-03", queue: { title: "El sutil arte", type: "book", theme: "manson" }, format: "narrative",
    novelty_score: 0.9, estimated_seconds: 65,
    payload: { slides: [
      { type: "hook", text: "Creerte extraordinario es la receta más fiable para sentirte una mierda." },
      { type: "develop", text: "Si tu vara de medir es «ser especial», cualquier día normal sabe a fracaso. Manson: la gente sólida no necesita sentirse por encima; acepta su mediocridad en casi todo y por eso se vuelca en lo poco que sí domina." },
      { type: "twist", text: "Bajarte del pedestal no es rendirte. Es dejar de gastar energía en aparentar para poder usarla en mejorar de verdad." },
    ] },
    reflection_prompt: "¿En qué te exiges ser «excepcional» y eso te paraliza, en vez de empezar siendo normalito?",
  },
  {
    id: "man-04", queue: { title: "El sutil arte", type: "book", theme: "manson" }, format: "interactive",
    novelty_score: 0.9, estimated_seconds: 55,
    payload: {
      scenario: "Te pasa algo malo que no provocaste. ¿Qué postura tomas?",
      choices: [
        { label: "No es culpa mía, así que no es mi problema", outcome: "Cierto que no es tu culpa. Pero al soltar la responsabilidad sueltas tu único poder: tu respuesta." },
        { label: "No es mi culpa, pero SÍ mi responsabilidad responder", outcome: "Ahí está. La culpa mira al pasado; la responsabilidad, a lo que haces ahora — lo único que controlas." },
      ],
      insight: "Manson separa culpa de responsabilidad: casi nada es culpa tuya, pero tu respuesta siempre es responsabilidad tuya.",
    },
    reflection_prompt: "Algo que te pasó y no provocaste: ¿qué parte de tu respuesta sigue siendo 100% tuya?",
  },
  {
    id: "man-05", queue: { title: "El sutil arte", type: "book", theme: "manson" }, format: "narrative",
    novelty_score: 0.9, estimated_seconds: 65,
    payload: { slides: [
      { type: "hook", text: "Cuanto más persigues sentirte bien, peor te sientes. Perseguirlo te recuerda que te falta." },
      { type: "develop", text: "Es la «ley inversa»: querer una experiencia positiva es, en sí, una experiencia negativa; aceptar la negativa es una positiva. Cuanto más desesperado buscas riqueza, más pobre te sientes, tengas lo que tengas." },
      { type: "twist", text: "Lo que mejora tu vida no es querer MÁS, sino que te importen MENOS cosas, y mejores. Menos, pero más hondo." },
    ] },
    reflection_prompt: "¿Qué persigues tan fuerte que el propio perseguirlo te amarga?",
  },
  {
    id: "man-06", queue: { title: "El sutil arte", type: "book", theme: "manson" }, format: "narrative",
    novelty_score: 0.85, estimated_seconds: 60,
    payload: { slides: [
      { type: "hook", text: "Pensar en tu muerte es lo menos morboso y lo más clarificador que puedes hacer." },
      { type: "develop", text: "Manson cierra con la muerte: es lo único seguro, y por eso la mejor brújula. Casi todo lo que te angustia —el qué dirán, el ego, lo trivial— se evapora al mirarlo desde el final." },
      { type: "twist", text: "No es para deprimirte: es para que dejes de malgastar tus pocas «mierdas que dar» en lo que no importará dentro de cinco años." },
    ] },
    reflection_prompt: "Si esto no importara dentro de 5 años, ¿por qué le das tanta energía hoy?",
  },
  {
    id: "man-07", queue: { title: "El sutil arte", type: "book", theme: "manson" }, format: "recall",
    novelty_score: 0.4, estimated_seconds: 35,
    payload: { prompt: "Hace poco viste la vuelta de tuerca de Manson sobre la felicidad. Antes de revelarlo: ¿de qué viene?", reveal: "De resolver problemas, no de evitarlos. No buscas una vida sin problemas: buscas mejores problemas. La pregunta es qué dolor merece la pena." },
    reflection_prompt: "¿Has cambiado de problema desde que lo viste, o sigues evitando en vez de elegir?",
  },
];
