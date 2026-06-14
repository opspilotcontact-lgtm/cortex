// Paquete de contenido — "Meditaciones (Marco Aurelio)". Mundo visual: theme
// "stoic" (§11). Escrito por Claude en sesión (camino sin API key); el día que
// haya ANTHROPIC_API_KEY, `npm run generate:ai -- "Meditaciones" stoic` produce
// un paquete así de forma autónoma. Español de España.

import { Capsule } from "../types";

export const intent = "aplicar el estoicismo a la vida diaria: distinguir lo que controlo de lo que no";

export const PACK: Capsule[] = [
  // ── NARRATIVE — la dicotomía del control ────────────────────────
  {
    id: "med-01",
    queue: { title: "Meditaciones (Marco Aurelio)", type: "book", theme: "stoic" },
    format: "narrative",
    novelty_score: 0.9,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "Casi todo tu sufrimiento nace de intentar controlar lo que no depende de ti." },
        { type: "develop", text: "Marco Aurelio, el hombre más poderoso del mundo conocido, abría el día recordándose qué NO estaba en su mano: la opinión ajena, el clima, su cuerpo, el resultado. Una sola cosa lo estaba: su juicio y su acción." },
        { type: "twist", text: "La libertad estoica no es conseguir lo que quieres. Es dejar de exigirle al mundo que sea distinto de como es. Lo que no controlas no es tu problema; lo que haces con ello, sí." },
      ],
    },
    reflection_prompt: "Coge algo que te quita el sueño. Pártelo en dos: lo que depende de ti y lo que no. ¿En cuál estás gastando la energía?",
  },
  // ── STAT — cero garantías ───────────────────────────────────────
  {
    id: "med-02",
    queue: { title: "Meditaciones (Marco Aurelio)", type: "book", theme: "stoic" },
    format: "stat",
    novelty_score: 0.85,
    estimated_seconds: 40,
    payload: {
      figure: "0",
      unit: "cosas externas bajo tu control",
      claim: "Marco Aurelio gobernaba un imperio y, aun así, no tenía garantía alguna sobre el mundo exterior.",
      reveal: "Por eso el estoico no pone su paz en los resultados. Mide su vida por la calidad de sus decisiones — lo único que el destino no le puede quitar.",
    },
    reflection_prompt: "¿Cuánta de tu tranquilidad de hoy depende de algo que, en el fondo, no controlas?",
  },
  // ── NARRATIVE — premeditatio malorum ────────────────────────────
  {
    id: "med-03",
    queue: { title: "Meditaciones (Marco Aurelio)", type: "book", theme: "stoic" },
    format: "narrative",
    novelty_score: 0.9,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "Imaginar que pierdes lo que amas no es pesimismo. Es la única forma de dejar de darlo por hecho." },
        { type: "develop", text: "Los estoicos practicaban la premeditatio malorum: visualizar la pérdida —del trabajo, de alguien, de la salud— no para sufrir por adelantado, sino para verlo hoy con ojos nuevos, mientras todavía lo tienes." },
        { type: "twist", text: "Das por seguro lo que crees garantizado. El ejercicio invierte la lente: lo que podrías perder mañana se vuelve un regalo esta misma noche. La gratitud nace del filo de la pérdida imaginada." },
      ],
    },
    reflection_prompt: "Piensa en alguien que ves casi a diario. Si fuese la última vez, ¿cambiaría algo en cómo lo tratas hoy?",
  },
  // ── INTERACTIVE — el espacio entre estímulo y reacción ──────────
  {
    id: "med-04",
    queue: { title: "Meditaciones (Marco Aurelio)", type: "book", theme: "stoic" },
    format: "interactive",
    novelty_score: 0.95,
    estimated_seconds: 55,
    payload: {
      scenario: "Alguien te critica con dureza en público. ¿Qué haces?",
      choices: [
        { label: "Te defiendes y demuestras que se equivoca", outcome: "Le has entregado el mando de tu ánimo. Ahora tu paz depende de ganar una discusión que él eligió." },
        { label: "Te preguntas si tiene parte de razón; si no, lo sueltas", outcome: "Si acierta, aprendes; si no, no es asunto tuyo. En ningún caso decide él cómo te sientes." },
      ],
      insight: "No te hiere el insulto, sino tu juicio sobre el insulto. Entre el estímulo y tu reacción hay un espacio: ahí vive tu libertad.",
    },
    reflection_prompt: "¿Qué crítica reciente te dolió de más? ¿Fue por lo que dijeron, o por lo que tú decidiste que significaba?",
  },
  // ── NARRATIVE — memento mori ────────────────────────────────────
  {
    id: "med-05",
    queue: { title: "Meditaciones (Marco Aurelio)", type: "book", theme: "stoic" },
    format: "narrative",
    novelty_score: 0.85,
    estimated_seconds: 65,
    payload: {
      slides: [
        { type: "hook", text: "No temes a la muerte. Temes no haber vivido — y eso sí lo puedes arreglar hoy." },
        { type: "develop", text: "Marco Aurelio se repetía que podía dejar la vida en cualquier instante, y dejaba que eso ordenara sus prioridades. No como amenaza, sino como brújula: si esto fuera lo último, ¿merece de verdad mi atención?" },
        { type: "twist", text: "La consciencia de la muerte no paraliza: aclara. Casi todo lo que te estresa se encoge al mirarlo desde el final. Lo trivial se cae solo." },
      ],
    },
    reflection_prompt: "Si te quedara un año exacto, ¿qué de tu semana actual desaparecería sin que lo echaras de menos?",
  },
  // ── NARRATIVE — el obstáculo es el camino ───────────────────────
  {
    id: "med-06",
    queue: { title: "Meditaciones (Marco Aurelio)", type: "book", theme: "stoic" },
    format: "narrative",
    novelty_score: 0.9,
    estimated_seconds: 65,
    payload: {
      slides: [
        { type: "hook", text: "Lo que se interpone en el camino se convierte en el camino." },
        { type: "develop", text: "Quizá su frase más célebre. El fuego se alimenta de lo que le echas encima: el estoico convierte cada obstáculo en materia prima para practicar una virtud — paciencia, coraje, templanza." },
        { type: "twist", text: "No es que 'todo pase por algo'. Es que TÚ le das el sentido: el mismo problema es un muro o un entrenamiento según lo que decidas hacer con él." },
      ],
    },
    reflection_prompt: "Piensa en tu mayor fastidio de ahora. ¿Qué virtud concreta te está pidiendo practicar?",
  },
  // ── STAT — lo más personal, lo más universal ────────────────────
  {
    id: "med-07",
    queue: { title: "Meditaciones (Marco Aurelio)", type: "book", theme: "stoic" },
    format: "stat",
    novelty_score: 0.7,
    estimated_seconds: 40,
    payload: {
      figure: "1.800",
      unit: "años después, aún se lee",
      claim: "Marco Aurelio escribió las Meditaciones solo para sí mismo, sin ninguna intención de publicarlas.",
      reveal: "Lo más privado resultó ser lo más universal. No escribía para enseñar: se escribía para recordar. Por eso suena tan honesto.",
    },
    reflection_prompt: "¿Qué te dirías a ti mismo si supieras con certeza que nadie más lo va a leer nunca?",
  },
  // ── RECALL — repaso de la dicotomía del control ─────────────────
  {
    id: "med-08",
    queue: { title: "Meditaciones (Marco Aurelio)", type: "book", theme: "stoic" },
    format: "recall",
    novelty_score: 0.4,
    estimated_seconds: 35,
    payload: {
      prompt: "Hace poco viste la idea que sostiene todo el estoicismo. Antes de revelarlo: ¿en qué deberías invertir tu energía, según Marco Aurelio?",
      reveal: "Solo en lo que depende de ti: tu juicio y tu acción. Lo demás —opiniones, resultados, el mundo— no es tu problema, solo el material con el que trabajas.",
    },
    reflection_prompt: "¿Lo aplicaste en algo desde que lo viste, o seguiste peleándote con lo incontrolable?",
  },
];
