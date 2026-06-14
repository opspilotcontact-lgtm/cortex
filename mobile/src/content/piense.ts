// Paquete de contenido — "Piense y hágase rico" (Napoleon Hill). FUNDAMENTADO
// en el texto real del PDF (CONTENIDO/piense_y_hagase_rico.pdf): historias y
// framing del libro, no de memoria genérica. Mundo visual: theme "wealth".
// Español de España. Escrito por Claude leyendo la fuente (camino sin API key).

import { Capsule } from "../types";

export const intent = "aplicar la mentalidad de riqueza, deseo definido y persistencia a mi vida";

export const PACK: Capsule[] = [
  // ── NARRATIVE — Barnes: el que quemó los puentes ────────────────
  {
    id: "pir-01",
    queue: { title: "Piense y hágase rico", type: "book", theme: "wealth" },
    format: "narrative",
    novelty_score: 0.85,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "No quería trabajar PARA Edison. Quería ser su SOCIO. Esa diferencia lo cambió todo." },
        { type: "develop", text: "Edwin Barnes llegó al laboratorio de Edison con pinta de vagabundo, sin dinero ni contactos. Aceptó un puesto insignificante y esperó cinco años. Edison le dio al fin la oportunidad por una sola cosa: «vi que estaba decidido a no ceder hasta lograrlo»." },
        { type: "twist", text: "Un deseo ordinario se conforma con un «me gustaría». El de Barnes era una obsesión que lo apostaba todo a una carta. La diferencia entre desear y decidir es que la decisión quema los puentes de vuelta." },
      ],
    },
    reflection_prompt: "Eso que dices que «te gustaría» conseguir: ¿es un deseo de verdad, o una preferencia cómoda que sueltas al primer «no»?",
  },
  // ── STAT — a un metro del oro ───────────────────────────────────
  {
    id: "pir-02",
    queue: { title: "Piense y hágase rico", type: "book", theme: "wealth" },
    format: "stat",
    novelty_score: 0.9,
    estimated_seconds: 45,
    payload: {
      figure: "500",
      unit: "hombres ricos coinciden",
      claim: "Más de 500 de los hombres más prósperos le contaron a Hill que su mayor éxito llegó un paso DESPUÉS del punto donde casi se rinden.",
      reveal: "Como Darby: vendió su mina de oro por chatarra al quedarse sin veta. El comprador cavó un metro más… y sacó millones. La veta estaba justo ahí.",
    },
    reflection_prompt: "¿En qué «mina» tuya dejaste de cavar a un metro del oro? ¿Y si la veta sigue ahí?",
  },
  // ── NARRATIVE — la riqueza empieza en la mente ──────────────────
  {
    id: "pir-03",
    queue: { title: "Piense y hágase rico", type: "book", theme: "wealth" },
    format: "narrative",
    novelty_score: 0.9,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "La riqueza no premia al que más madruga. Según Hill, empieza en un estado mental — con poco trabajo duro, o ninguno." },
        { type: "develop", text: "Pasó 25 años estudiando a los ricos para responder una pregunta: ¿cómo llegan a serlo? Su conclusión lo sorprendió: no era el esfuerzo bruto, sino una mente magnetizada por un propósito definido y un deseo concreto de dinero." },
        { type: "twist", text: "«Trabaja duro mucho tiempo» es la creencia popular. Pero cuando la riqueza llega —dice Hill— lo hace tan rápido que te preguntas dónde estuvo escondida tantos años. El cuello de botella casi nunca fue el esfuerzo: era la claridad del deseo." },
      ],
    },
    reflection_prompt: "¿Estás echando MÁS horas a algo cuando lo que falta es decidir con exactitud qué quieres y por qué?",
  },
  // ── INTERACTIVE — el «imposible» motor V8 de Ford ───────────────
  {
    id: "pir-04",
    queue: { title: "Piense y hágase rico", type: "book", theme: "wealth" },
    format: "interactive",
    novelty_score: 0.9,
    estimated_seconds: 55,
    payload: {
      scenario: "Tus ingenieros te juran que el motor que quieres es imposible. ¿Qué haces?",
      choices: [
        { label: "Aceptas que es imposible y buscas otra cosa", outcome: "Razonable… y te quedas con el motor que ya todos saben hacer. Lo imposible sigue siendo de otro." },
        { label: "«Síganlo intentando hasta lograrlo, tarde lo que tarde»", outcome: "Es lo que dijo Ford con el V8. Un año entero sin resultados… y un día el secreto se reveló. La determinación abrió la puerta." },
      ],
      insight: "Ford no sabía más que sus ingenieros. Solo se negó a aceptar el «imposible» como respuesta final (Piense y hágase rico, cap. 1).",
    },
    reflection_prompt: "¿Qué «imposible» has aceptado sin pelearlo, solo porque alguien con autoridad lo dijo?",
  },
  // ── NARRATIVE — la niña y el «no» ───────────────────────────────
  {
    id: "pir-05",
    queue: { title: "Piense y hágase rico", type: "book", theme: "wealth" },
    format: "narrative",
    novelty_score: 0.8,
    estimated_seconds: 65,
    payload: {
      slides: [
        { type: "hook", text: "Una niña le sacó 50 centavos a un hombre furioso que se acercaba a pegarle. No se movió, lo miró a los ojos y gritó su necesidad." },
        { type: "develop", text: "Darby vio cómo esa niña «dominó» a su tío con pura determinación. Años después, vendiendo seguros, cada vez que un cliente intentaba quitárselo de encima la visualizaba: «mis mejores ventas fueron a gente que ya me había dicho NO»." },
        { type: "twist", text: "El «no» casi nunca es definitivo: es el punto donde la mayoría se rinde. Darby llegó a vender un millón de dólares al año porque aprendió que «no» no siempre significa no." },
      ],
    },
    reflection_prompt: "Piensa en el último «no» que aceptaste como final. ¿Lo era de verdad, o solo dejaste de insistir?",
  },
  // ── NARRATIVE — los 6 pasos: del deseo difuso al propósito ──────
  {
    id: "pir-06",
    queue: { title: "Piense y hágase rico", type: "book", theme: "wealth" },
    format: "narrative",
    novelty_score: 0.85,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "Querer «mucho dinero» no sirve de nada. El cerebro no obedece a lo vago." },
        { type: "develop", text: "Hill da seis pasos: fija la cantidad EXACTA; decide qué darás a cambio; pon una fecha; traza un plan y empieza ya, estés listo o no; escríbelo; y léelo en voz alta dos veces al día, viéndote y sintiéndote ya en posesión del dinero." },
        { type: "twist", text: "No es magia, es enfoque: lo que repites con emoción se vuelve obsesión, y la obsesión filtra lo que ves, decides y haces. Lo difuso no moviliza; lo concreto, sí." },
      ],
    },
    reflection_prompt: "Pon número y fecha a tu meta más importante ahora mismo. ¿Notas cómo pasa de «sueño» a «objetivo»?",
  },
  // ── RECALL — repaso del deseo ardiente ──────────────────────────
  {
    id: "pir-07",
    queue: { title: "Piense y hágase rico", type: "book", theme: "wealth" },
    format: "recall",
    novelty_score: 0.4,
    estimated_seconds: 35,
    payload: {
      prompt: "Hace poco viste por qué Barnes acabó siendo socio de Edison y no su empleado. Antes de revelarlo: ¿qué tenía Barnes que casi nadie tiene?",
      reveal: "Un deseo tan imperioso que lo apostaba todo a una carta y quemaba los puentes de vuelta. No «esperanza»: decisión. Eso es lo que Edison vio en un vagabundo.",
    },
    reflection_prompt: "Tu meta más importante, ¿es un deseo ardiente… o una esperanza con plan B?",
  },
  // ── STAT — concebir y creer ─────────────────────────────────────
  {
    id: "pir-08",
    queue: { title: "Piense y hágase rico", type: "book", theme: "wealth" },
    format: "stat",
    novelty_score: 0.8,
    estimated_seconds: 45,
    payload: {
      figure: "25",
      unit: "años estudiando a los ricos",
      claim: "Hill dedicó 25 años, animado por Andrew Carnegie, a destilar cómo piensan los que se hacen ricos.",
      reveal: "Su conclusión cabe en una frase: «Todo aquello que la mente humana pueda concebir y creer, se puede alcanzar». Concebir y CREER — ahí está el filtro que casi nadie pasa.",
    },
    reflection_prompt: "¿Hay algo que deseas pero, en el fondo, no crees poder lograr? Esa incredulidad, ¿es tu verdadero techo?",
  },
  // ── NARRATIVE — dueño de tu destino (Henley) ────────────────────
  {
    id: "pir-09",
    queue: { title: "Piense y hágase rico", type: "book", theme: "wealth" },
    format: "narrative",
    novelty_score: 0.85,
    estimated_seconds: 65,
    payload: {
      slides: [
        { type: "hook", text: "«Soy el dueño de mi destino, el capitán de mi alma». Henley lo escribió como poesía. Hill lo leyó como instrucciones de uso." },
        { type: "develop", text: "Eres el dueño de tu destino porque tienes el poder de controlar tus pensamientos dominantes. Y, dice Hill, tu mente se magnetiza con ellos: atrae personas, circunstancias y oportunidades que armonizan con lo que más piensas." },
        { type: "twist", text: "No es que pensar baste. Es que tus pensamientos dominantes deciden qué oportunidades RECONOCES — y cuáles te pasan por delante «disfrazadas de infortunio» sin que las veas." },
      ],
    },
    reflection_prompt: "Tu pensamiento dominante con el dinero, ¿es «nunca llega» o «sé exactamente cuánto quiero y por qué»? ¿Qué atrae cada uno?",
  },
];
