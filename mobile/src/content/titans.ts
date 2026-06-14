// Paquete — "Armas de titanes" (Tim Ferriss). Fundamentado en el texto real
// (CONTENIDO/Armas-de-titanes-PDFDrive-.pdf): fear-setting, "juzga por las
// preguntas", la rutina matinal, 80/20, lo incómodo como brújula.
// Mundo: theme "titans".

import { Capsule } from "../types";

export const intent = "robar las tácticas de los mejores y aplicarlas a mi día a día";

export const PACK: Capsule[] = [
  {
    id: "tit-01", queue: { title: "Armas de titanes", type: "book", theme: "titans" }, format: "narrative",
    novelty_score: 0.9, estimated_seconds: 70,
    payload: { slides: [
      { type: "hook", text: "No te fijes solo metas. Define tus MIEDOS. Sale más a cuenta." },
      { type: "develop", text: "Ferriss propone el «fear-setting»: escribe lo PEOR que podría pasar si actúas, cómo lo prevendrías y cómo lo repararías. Casi siempre descubres que el desastre que temías es reversible — y que el coste de NO actuar es enorme y silencioso." },
      { type: "twist", text: "Juzgamos las decisiones por el miedo, que es vívido, e ignoramos el coste de la inacción, que es invisible. Poner ambos por escrito invierte la balanza." },
    ] },
    reflection_prompt: "Esa decisión que te da miedo: escribe el peor caso. ¿Es irreversible, o solo incómodo?",
  },
  {
    id: "tit-02", queue: { title: "Armas de titanes", type: "book", theme: "titans" }, format: "narrative",
    novelty_score: 0.9, estimated_seconds: 65,
    payload: { slides: [
      { type: "hook", text: "«Juzga a un hombre por sus preguntas, no por sus respuestas.»" },
      { type: "develop", text: "Ferriss entrevistó a más de 200 cracks y encontró un patrón: no tenían mejores respuestas, se hacían MEJORES preguntas. Una favorita: «¿y si hiciera lo contrario de lo que hace todo el mundo?»." },
      { type: "twist", text: "Las respuestas te atan al marco actual; una buena pregunta lo rompe. Si estás atascado, casi nunca te falta una respuesta: te falta cambiar la pregunta." },
    ] },
    reflection_prompt: "El problema que te tiene atascado: ¿qué pregunta DISTINTA podrías hacerte sobre él?",
  },
  {
    id: "tit-03", queue: { title: "Armas de titanes", type: "book", theme: "titans" }, format: "stat",
    novelty_score: 0.85, estimated_seconds: 40,
    payload: { figure: "80/20", unit: "la ley de Pareto", claim: "El 80% de tus resultados viene del 20% de lo que haces. Y el 80% de tus problemas, del 20% de las fuentes.", reveal: "La pregunta de los titanes no es «¿cómo hago más?», sino «¿qué 20% elimino o multiplico?». Hacer más no es la palanca; elegir qué, sí." },
    reflection_prompt: "¿Cuál es el 20% de tu trabajo que da el 80% del valor? ¿Y el 20% que te roba la paz?",
  },
  {
    id: "tit-04", queue: { title: "Armas de titanes", type: "book", theme: "titans" }, format: "interactive",
    novelty_score: 0.85, estimated_seconds: 55,
    payload: {
      scenario: "Te despiertas. ¿Qué define tu día?",
      choices: [
        { label: "Miro el móvil y reacciono a lo urgente", outcome: "Empiezas en modo reactivo, con la agenda de otros. Los titanes casi nunca lo hacen." },
        { label: "Gano la mañana con un ritual corto (5-10 min)", outcome: "Más del 80% de los cracks que entrevistó Ferriss tienen ritual matinal. No por disciplina ciega: para entrar al día desde la intención, no desde la reacción." },
      ],
      insight: "«La rutina en un hombre inteligente es un signo de ambición.» Ganar la mañana es ganar el marco mental del día.",
    },
    reflection_prompt: "¿Tu primera media hora la diseñas tú, o la diseña tu bandeja de entrada?",
  },
  {
    id: "tit-05", queue: { title: "Armas de titanes", type: "book", theme: "titans" }, format: "narrative",
    novelty_score: 0.85, estimated_seconds: 60,
    payload: { slides: [
      { type: "hook", text: "Mide tu éxito por la cantidad de conversaciones incómodas que estás dispuesto a tener." },
      { type: "develop", text: "Es de las frases más citadas de Ferriss. Lo que de verdad te frena no suele ser falta de talento ni de plan: es evitar la incomodidad — pedir, negociar, decir que no, exponerte." },
      { type: "twist", text: "El crecimiento vive justo donde te quieres escapar. Si algo te incomoda y es importante, esa incomodidad es la flecha, no la pared." },
    ] },
    reflection_prompt: "¿Qué conversación incómoda llevas semanas evitando que probablemente lo desbloquearía todo?",
  },
  {
    id: "tit-06", queue: { title: "Armas de titanes", type: "book", theme: "titans" }, format: "recall",
    novelty_score: 0.4, estimated_seconds: 35,
    payload: { prompt: "Hace poco viste qué hacen los titanes con el miedo en vez de ignorarlo. Antes de revelarlo: ¿en qué consiste el «fear-setting»?", reveal: "Escribir lo peor que podría pasar, cómo prevenirlo y cómo repararlo — más el coste de NO actuar. Casi siempre el desastre es reversible y la inacción, carísima." },
    reflection_prompt: "¿Has escrito tus miedos de esa decisión, o siguen siendo un bulto difuso que te paraliza?",
  },
];
