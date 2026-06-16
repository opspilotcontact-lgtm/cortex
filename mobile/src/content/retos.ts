// Pack de formatos RICOS escritos a mano (§8): quiz, activity, coach y visual,
// atados a las materias que ya existen en el seed. Sin esto, el seed era casi
// todo narrativa → "app de frases". Esto hace que veas quiz, retos y a la IA
// hablándote DESDE EL PRIMER ARRANQUE, también en la demo pública (sin IA).

import { Capsule } from "../types";

export const PACK: Capsule[] = [
  // ── QUIZ ─────────────────────────────────────────────────────────
  {
    id: "rt-quiz-01",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "quiz",
    novelty_score: 0.85,
    estimated_seconds: 45,
    payload: {
      question: "Quieres ir al gimnasio cada día. ¿Qué dispara MÁS el hábito?",
      options: [
        { label: "Proponerte una meta ambiciosa y visualizarla", correct: false },
        { label: "Dejar la ropa de deporte preparada la noche anterior", correct: true },
        { label: "Castigarte cada vez que fallas un día", correct: false },
      ],
      explanation: "Reducir la fricción del primer paso pesa más que la motivación o el castigo. El entorno le gana a la fuerza de voluntad casi siempre.",
    },
    reflection_prompt: "¿Qué fricción de 10 segundos podrías quitar hoy para que tu buen hábito sea el camino fácil?",
  },
  {
    id: "rt-quiz-02",
    queue: { title: "Economía del comportamiento", type: "book", theme: "behavioral" },
    format: "quiz",
    novelty_score: 0.9,
    estimated_seconds: 50,
    payload: {
      question: "Un abrigo de 1.000 € está rebajado a 600 €. Te parece una ganga aunque no lo necesites. ¿Por qué?",
      options: [
        { label: "Porque 600 € es objetivamente barato para un abrigo", correct: false },
        { label: "Por el efecto ancla: tu mente lo juzga contra los 1.000 €, no contra su valor real", correct: true },
        { label: "Porque una rebaja siempre indica buena calidad", correct: false },
      ],
      explanation: "El ancla (1.000 €) secuestra tu juicio. Sin esa cifra, 600 € te parecería caro. Los precios 'antes/ahora' explotan justo este sesgo.",
    },
    reflection_prompt: "¿En qué compra reciente crees que te ancló un precio 'antes' que ni era real?",
  },
  {
    id: "rt-quiz-03",
    queue: { title: "Influencia", type: "book", theme: "influence" },
    format: "quiz",
    novelty_score: 0.85,
    estimated_seconds: 45,
    payload: {
      question: "Un camarero te trae la cuenta con un caramelo y las propinas suben. ¿Qué principio actúa?",
      options: [
        { label: "Escasez", correct: false },
        { label: "Reciprocidad: un regalo pequeño crea la urgencia de devolver el favor", correct: true },
        { label: "Autoridad", correct: false },
      ],
      explanation: "Cialdini lo midió: un caramelo sube la propina; y si el camarero 'vuelve' para darte el segundo como gesto personal, se dispara. El regalo inesperado activa la deuda.",
    },
    reflection_prompt: "¿Quién te 'regaló' algo pequeño últimamente y te dejó con sensación de deber algo?",
  },
  {
    id: "rt-quiz-04",
    queue: { title: "Meditaciones (Marco Aurelio)", type: "book", theme: "stoic" },
    format: "quiz",
    novelty_score: 0.88,
    estimated_seconds: 45,
    payload: {
      question: "Te critican injustamente en público. Según los estoicos, ¿dónde está tu poder?",
      options: [
        { label: "En convencer a todos de que se equivocaron", correct: false },
        { label: "En tu juicio sobre el hecho, no en el hecho ni en lo que opinen", correct: true },
        { label: "En fingir que no te ha afectado", correct: false },
      ],
      explanation: "Marco Aurelio: no te hiere el hecho, sino tu opinión sobre él. La opinión ajena no la controlas; tu respuesta, sí. Ahí, y solo ahí, eres libre.",
    },
    reflection_prompt: "¿Qué crítica te ronda hoy a la que le estás dando un poder que no depende de ti?",
  },
  {
    id: "rt-quiz-05",
    queue: { title: "Rompe la barrera del no", type: "book", theme: "negotiation" },
    format: "quiz",
    novelty_score: 0.9,
    estimated_seconds: 50,
    payload: {
      question: "En una negociación, ¿qué te da MÁS control al arrancar?",
      options: [
        { label: "Buscar un 'sí' rápido del otro", correct: false },
        { label: "Hacer una pregunta que invite a un 'no' seguro", correct: true },
        { label: "Poner tu oferta final desde el principio", correct: false },
      ],
      explanation: "Voss: el 'sí' temprano pone a la gente a la defensiva; el 'no' la hace sentir a salvo y en control, y ahí empieza a hablar de verdad. «¿Sería una locura que…?» abre más que «¿Estás de acuerdo?».",
    },
    reflection_prompt: "¿En qué conversación pendiente podrías hacer una pregunta que invite a un 'no' cómodo?",
  },
  {
    id: "rt-quiz-06",
    queue: { title: "Piense y hágase rico", type: "book", theme: "wealth" },
    format: "quiz",
    novelty_score: 0.82,
    estimated_seconds: 45,
    payload: {
      question: "Según Hill, ¿qué distingue a quien acumula riqueza del que solo la desea?",
      options: [
        { label: "Tener una idea genial", correct: false },
        { label: "Un deseo definido con plan y fecha, no un 'ojalá'", correct: true },
        { label: "Trabajar más horas que nadie", correct: false },
      ],
      explanation: "El deseo vago no mueve nada. Hill exige concreción: cuánto, para cuándo, qué darás a cambio y con qué plan. La especificidad convierte el deseo en obsesión operativa.",
    },
    reflection_prompt: "Tu objetivo de dinero: ¿tiene cifra y fecha, o sigue siendo un 'ojalá'?",
  },

  // ── ACTIVITY ─────────────────────────────────────────────────────
  {
    id: "rt-act-01",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "activity",
    novelty_score: 0.8,
    estimated_seconds: 60,
    payload: {
      challenge: "Aplica hoy la regla de los dos minutos a UNA cosa que pospones.",
      steps: ["Elige lo que evitas (leer, entrenar, escribir).", "Redúcelo a 2 minutos: 'una página', 'una flexión'.", "Hazlo ahora, sin negociar contigo."],
      why: "El hábito no nace del tamaño sino de la repetición. Primero dominas el arte de aparecer; escalarlo viene solo.",
    },
    reflection_prompt: "¿Lo hiciste? ¿Qué notaste al empezar que no esperabas?",
  },
  {
    id: "rt-act-02",
    queue: { title: "Economía del comportamiento", type: "book", theme: "behavioral" },
    format: "activity",
    novelty_score: 0.83,
    estimated_seconds: 55,
    payload: {
      challenge: "Cambia un 'por defecto' tuyo hoy para que la opción buena sea la fácil.",
      steps: ["Detecta una mala decisión automática (el móvil en la mesilla).", "Cambia el entorno: cárgalo en otra habitación.", "Deja que la pereza juegue a tu favor."],
      why: "No decides mil veces al día; decides el entorno una vez y él decide por ti el resto.",
    },
    reflection_prompt: "¿Qué 'default' tuyo está tomando malas decisiones por ti sin que te des cuenta?",
  },
  {
    id: "rt-act-03",
    queue: { title: "Meditaciones (Marco Aurelio)", type: "book", theme: "stoic" },
    format: "activity",
    novelty_score: 0.85,
    estimated_seconds: 60,
    payload: {
      challenge: "Antes de algo que te dé ansiedad hoy, haz el ejercicio estoico del peor caso.",
      steps: ["Escribe qué es lo peor que podría pasar de verdad.", "Pregúntate: ¿sobreviviría? ¿qué haría justo después?", "Mira cómo encoge el miedo al ponerle nombre."],
      why: "Marco Aurelio ensayaba la adversidad en la mente para quitarle el poder de sorprenderle. El miedo casi siempre es a la imaginación, no al hecho.",
    },
    reflection_prompt: "¿El peor caso era tan terrible como la ansiedad te lo vendía?",
  },
  {
    id: "rt-act-04",
    queue: { title: "El poder de los 5 segundos", type: "book", theme: "ignite" },
    format: "activity",
    novelty_score: 0.84,
    estimated_seconds: 40,
    payload: {
      challenge: "Hoy, cuando dudes en hacer algo que sabes que deberías, cuenta 5-4-3-2-1 y muévete.",
      why: "La duda es la ventana por la que entra la excusa. El conteo interrumpe el freno y te empuja a actuar antes de que el cerebro te sabotee.",
    },
    reflection_prompt: "¿En qué momento del día el 5-4-3-2-1 te sacó de la inercia?",
  },
  {
    id: "rt-act-05",
    queue: { title: "Influencia", type: "book", theme: "influence" },
    format: "activity",
    novelty_score: 0.78,
    estimated_seconds: 45,
    payload: {
      challenge: "Da hoy un favor pequeño, inesperado y sin pedir nada a cambio.",
      why: "La reciprocidad que funciona es genuina y va primero. Y de paso te recuerda que influir bien empieza por dar, no por sacar.",
    },
    reflection_prompt: "¿A quién, y qué notaste en ti al darlo sin esperar vuelta?",
  },

  // ── COACH (la IA te habla directo) ───────────────────────────────
  {
    id: "rt-coach-01",
    queue: { title: "Piense y hágase rico", type: "book", theme: "wealth" },
    format: "coach",
    novelty_score: 0.9,
    estimated_seconds: 50,
    payload: {
      question: "Si el dinero no fuera un problema, ¿en qué seguirías trabajando igual? Sé concreto.",
      placeholder: "Lo que harías aunque no te pagaran…",
      followUp: "Eso que has nombrado es tu brújula. No significa dejarlo todo mañana, sino acercar tu semana —una hora al día— a ese trabajo. El deseo definido de Hill empezaba justo en una respuesta así de concreta.",
    },
    reflection_prompt: "¿Qué hora de tu semana podrías reorientar hacia eso, ya?",
  },
  {
    id: "rt-coach-02",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "coach",
    novelty_score: 0.9,
    estimated_seconds: 45,
    payload: {
      question: "¿Cuál es el ÚNICO hábito que, sostenido un año, cambiaría más tu vida?",
      placeholder: "Un solo hábito…",
      followUp: "Ahora redúcelo a su versión de dos minutos y hazla hoy. Un año no empieza con motivación mañana, empieza con la primera repetición ridículamente pequeña ahora.",
    },
    reflection_prompt: "¿Cuál es la versión de 2 minutos de ese hábito?",
  },
  {
    id: "rt-coach-03",
    queue: { title: "Meditaciones (Marco Aurelio)", type: "book", theme: "stoic" },
    format: "coach",
    novelty_score: 0.88,
    estimated_seconds: 45,
    payload: {
      question: "¿Qué cosa que te quita el sueño NO depende realmente de ti?",
      placeholder: "Eso que no controlas…",
      followUp: "Si no depende de ti, la energía que pones ahí es un impuesto que pagas sin recibir nada. Devuélvela a lo único que sí controlas: tu próxima acción. Eso es la dicotomía del control.",
    },
    reflection_prompt: "¿Cuál es la próxima acción que SÍ está en tu mano?",
  },
  {
    id: "rt-coach-04",
    queue: { title: "Rompe la barrera del no", type: "book", theme: "negotiation" },
    format: "coach",
    novelty_score: 0.9,
    estimated_seconds: 55,
    payload: {
      question: "Piensa en una conversación difícil pendiente. ¿Qué quiere DE VERDAD la otra persona, por debajo de lo que pide?",
      placeholder: "Lo que de verdad busca…",
      followUp: "Voss lo llama el 'cisne negro': la necesidad oculta. Cuando le hablas a eso —seguridad, respeto, control— y no a la posición de superficie, la conversación se desbloquea. Prueba nombrando su emoción antes que tu oferta.",
    },
    reflection_prompt: "¿Cómo le nombrarías esa emoción en la primera frase?",
  },

  // ── VISUAL (mapa conceptual) ─────────────────────────────────────
  {
    id: "rt-vis-01",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "visual",
    novelty_score: 0.8,
    estimated_seconds: 45,
    payload: {
      render: "concept_map",
      nodes: [
        { id: "s", label: "Señal" },
        { id: "a", label: "Anhelo" },
        { id: "r", label: "Rutina" },
        { id: "re", label: "Recompensa" },
      ],
      edges: [
        { from: "s", to: "a" },
        { from: "a", to: "r" },
        { from: "r", to: "re" },
        { from: "re", to: "s" },
      ],
      caption: "El bucle del hábito: la recompensa realimenta la señal. Cambia o rompe un eslabón y el bucle entero cambia.",
    },
    reflection_prompt: "De un mal hábito tuyo: ¿cuál es la señal que lo dispara casi siempre?",
  },
];
