/**
 * Cortex — Fase 0 (validación de contenido)
 * ------------------------------------------------------------------
 * Datos de cápsulas, separados de la lógica de render a propósito:
 * el renderer es GENÉRICO (lee `format` + `payload`, ver §8 del plan).
 * Para validar otro tema, reescribe este archivo y nada más.
 *
 * Cada materia (queue) declara su `theme`. El renderer aplica el mundo
 * visual correspondiente (colores + tipografía propios). Abrir una
 * materia u otra se SIENTE distinto: eso es parte de la recompensa
 * variable (§1). Los temas viven en index.html → bloque THEMES/CSS.
 *
 * Esquema de cada cápsula (subconjunto de §8, formato `narrative`):
 *   {
 *     id, queue {title, type, theme}, format: 'narrative',
 *     novelty_score (0-1), estimated_seconds,
 *     payload { slides: [{ type: 'hook'|'develop'|'twist', text }] },
 *     reflection_prompt   // el micro-reto del final (§7)
 *   }
 *
 * Barra de calidad (§1): si una cápsula se siente como una flashcard
 * glorificada, NO va. Cada una tiene que provocar un "anda, claro".
 * Español de España.
 */

window.CORTEX_CAPSULES = [
  // ════════════════════════════════════════════════════════════════
  // MATERIA — Hábitos Atómicos   ·   mundo "habits" (cálido / serif)
  // ════════════════════════════════════════════════════════════════
  {
    id: "ah-01",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "narrative",
    novelty_score: 0.9,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "No subes al nivel de tus metas. Caes al nivel de tus sistemas." },
        { type: "develop", text: "El ganador y el perdedor de una carrera comparten la misma meta: cruzar primero. La meta no los diferencia. Lo que los separa es el sistema de entrenamiento que cada uno repitió durante meses." },
        { type: "twist", text: "Por eso fijarte metas más ambiciosas casi nunca cambia nada. Lo que cambia el resultado es rediseñar el proceso diario que te lleva ahí, no la línea de meta." },
      ],
    },
    reflection_prompt: "Nombra un sistema tuyo que hoy produce un resultado que NO quieres. ¿Cuál es la pieza del proceso, no de la meta, que tendrías que cambiar?",
  },
  {
    id: "ah-02",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "narrative",
    novelty_score: 0.75,
    estimated_seconds: 60,
    payload: {
      slides: [
        { type: "hook", text: "Mejorar un 1% al día no te hace un 365% mejor en un año. Te hace 37 veces mejor." },
        { type: "develop", text: "1,01 elevado a 365 es 37,8. El comportamiento tiene interés compuesto, igual que el dinero. Las ganancias diarias parecen ridículas; lo que se acumula no lo es." },
        { type: "twist", text: "Lo incómodo: el mismo cálculo al revés. Empeorar un 1% al día te deja casi en cero. No es la caída de un día lo que te hunde, es la pendiente sostenida." },
      ],
    },
    reflection_prompt: "¿Cuál es ese 1% diario que llevas posponiendo porque 'es muy poco para que importe'?",
  },
  {
    id: "ah-03",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "narrative",
    novelty_score: 0.95,
    estimated_seconds: 75,
    payload: {
      slides: [
        { type: "hook", text: "El hábito que no te sale no es un problema de disciplina. Es un problema de identidad." },
        { type: "develop", text: "'Quiero dejar de fumar' te deja siendo un fumador que se resiste. 'No soy fumador' cierra la discusión antes de empezar. Cada acción es un voto por el tipo de persona que crees ser." },
        { type: "twist", text: "La meta no es leer un libro: es convertirte en lector. No es correr una maratón: es ser alguien que corre. Cuando cambia la identidad, el hábito deja de necesitar fuerza." },
      ],
    },
    reflection_prompt: "Mira lo que has hecho hoy. ¿Qué votos has emitido, sin querer, sobre quién eres?",
  },
  {
    id: "ah-04",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "narrative",
    novelty_score: 0.85,
    estimated_seconds: 65,
    payload: {
      slides: [
        { type: "hook", text: "La gente con más autocontrol es, en realidad, la que menos lo usa." },
        { type: "develop", text: "No están todo el día resistiendo la tentación con los dientes apretados. Han diseñado su entorno para que la tentación ni aparezca. Quien no tiene galletas en casa no necesita 'resistirlas'." },
        { type: "twist", text: "Dale la vuelta: no eres débil de voluntad. Tu entorno está mal diseñado. La fuerza de voluntad es una batería que se agota; el entorno trabaja gratis, las 24 horas." },
      ],
    },
    reflection_prompt: "Elige un mal hábito. ¿Qué fricción podrías AÑADIR para que sea molesto? Ahora uno bueno: ¿qué fricción podrías QUITAR?",
  },
  {
    id: "ah-05",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "narrative",
    novelty_score: 0.7,
    estimated_seconds: 55,
    payload: {
      slides: [
        { type: "hook", text: "Si un hábito nuevo tarda más de 2 minutos en empezar, lo estás diseñando para fracasar." },
        { type: "develop", text: "'Leer antes de dormir' se convierte en 'leer una página'. 'Hacer ejercicio' se convierte en 'ponerme las zapatillas'. Suena absurdamente fácil. Esa es la idea." },
        { type: "twist", text: "Primero dominas el arte de aparecer, y solo después el de mejorar. Un hábito tiene que existir antes de poder optimizarlo. Ridículamente fácil le gana a ambiciosamente abandonado." },
      ],
    },
    reflection_prompt: "Ese hábito que evitas: ¿cuál es su versión de 2 minutos, tan pequeña que sería raro no hacerla?",
  },
  {
    id: "ah-06",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "narrative",
    novelty_score: 0.9,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "No estás estancado. Estás acumulando bajo cero." },
        { type: "develop", text: "Un cubito de hielo no se derrite a -4°, ni a -2°, ni a -1°. Todo ese esfuerzo parece no hacer nada. A 0° se rompe de golpe. El cambio se veía nulo justo antes de ser total." },
        { type: "twist", text: "La mayoría abandona en el valle de la decepción: el punto donde más has trabajado y menos has visto. Los resultados llegan con retraso. Lo que sientes como fracaso suele ser energía almacenada." },
      ],
    },
    reflection_prompt: "¿En qué área llevas tiempo 'sin ver resultados'? ¿Y si estuvieras a un grado de que se rompa el hielo?",
  },
  {
    id: "ah-07",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "narrative",
    novelty_score: 0.65,
    estimated_seconds: 60,
    payload: {
      slides: [
        { type: "hook", text: "Todo hábito, bueno o malo, corre el mismo bucle de cuatro pasos." },
        { type: "develop", text: "Señal → anhelo → respuesta → recompensa. El móvil vibra (señal), quieres saber qué es (anhelo), miras (respuesta), dopamina (recompensa). Y se refuerza solo." },
        { type: "twist", text: "Para crear un hábito: hazlo obvio, atractivo, fácil y satisfactorio. Para romperlo, invierte cada paso: invisible, feo, difícil, insatisfactorio. No pelees con la fuerza de voluntad; interviene el bucle." },
      ],
    },
    reflection_prompt: "Coge un hábito que quieras romper. ¿En cuál de los 4 pasos te resultaría más fácil sabotearlo?",
  },

  // ════════════════════════════════════════════════════════════════
  // MATERIA — Pensamiento sistémico   ·   mundo "systems" (frío / técnico)
  // ════════════════════════════════════════════════════════════════
  {
    id: "sys-01",
    queue: { title: "Pensamiento sistémico", type: "concept", theme: "systems" },
    format: "narrative",
    novelty_score: 0.85,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "Un sistema no es la suma de sus partes. Es el producto de sus interacciones." },
        { type: "develop", text: "Puedes tener el mejor motor, la mejor caja y las mejores ruedas, y un coche que va mal: lo que importa es cómo encajan. Optimizar cada pieza por separado puede empeorar el todo." },
        { type: "twist", text: "Hay un cuello de botella que manda sobre el resto. Mejorar cualquier cosa que NO sea el cuello de botella es esfuerzo tirado: el sistema sigue yendo a la velocidad de su punto más lento." },
      ],
    },
    reflection_prompt: "En algo que estés intentando mejorar (tu trabajo, un proyecto): ¿cuál es el cuello de botella real, y cuánto esfuerzo estás poniendo en otra parte?",
  },
  {
    id: "sys-02",
    queue: { title: "Pensamiento sistémico", type: "concept", theme: "systems" },
    format: "narrative",
    novelty_score: 0.8,
    estimated_seconds: 65,
    payload: {
      slides: [
        { type: "hook", text: "Si algo persiste en el tiempo, hay un bucle de retroalimentación sosteniéndolo." },
        { type: "develop", text: "Dos tipos: el reforzador, que amplifica (más seguidores → más alcance → más seguidores), y el balanceador, que estabiliza (el termostato que apaga la calefacción al llegar a la temperatura)." },
        { type: "twist", text: "Tus hábitos son un bucle reforzador puro. La señal dispara la respuesta, la recompensa fortalece la señal. Por eso un hábito no se 'rompe' con voluntad: se desarma cortando el bucle." },
      ],
    },
    reflection_prompt: "¿Esto enlaza con lo que viste sobre el bucle señal→anhelo→respuesta→recompensa? ¿Son la misma idea contada en dos idiomas?",
  },
  {
    id: "sys-03",
    queue: { title: "Pensamiento sistémico", type: "concept", theme: "systems" },
    format: "narrative",
    novelty_score: 0.9,
    estimated_seconds: 70,
    payload: {
      slides: [
        { type: "hook", text: "La solución rápida casi siempre agranda el problema que pretende apagar." },
        { type: "develop", text: "Se llama 'desplazar la carga': el atajo alivia el síntoma hoy y atrofia tu capacidad de resolverlo de raíz. La deuda técnica, el analgésico que tapa la causa, el préstamo que financia otro préstamo." },
        { type: "twist", text: "Cada vez que eliges el parche, la solución de fondo se vuelve más difícil y el parche más necesario. El sistema te entrena para depender de lo que te está hundiendo." },
      ],
    },
    reflection_prompt: "¿Qué 'parche' aplicas a menudo que, siendo sincero, hace más difícil arreglar el problema de verdad?",
  },
  {
    id: "sys-04",
    queue: { title: "Pensamiento sistémico", type: "concept", theme: "systems" },
    format: "narrative",
    novelty_score: 0.95,
    estimated_seconds: 75,
    payload: {
      slides: [
        { type: "hook", text: "No guardes el estado actual. Guarda la secuencia de eventos que lo produjo." },
        { type: "develop", text: "Es la idea del 'event sourcing': en vez de almacenar 'saldo = 100 €', guardas cada ingreso y cada retirada. El estado se reconstruye sumando la historia. Nunca reescribes el pasado; solo añades eventos." },
        { type: "twist", text: "Aplícalo a ti: tus hábitos son un registro de eventos, no un estado fijo. Un mal día es un evento más, no una reescritura de quién eres. No tienes que 'volver a cero': solo añades el próximo evento bueno." },
      ],
    },
    reflection_prompt: "Si tu identidad fuera un registro de eventos en vez de un estado: ¿qué pesa más, los miles de eventos buenos acumulados o el evento malo de ayer?",
  },
  {
    id: "sys-05",
    queue: { title: "Pensamiento sistémico", type: "concept", theme: "systems" },
    format: "narrative",
    novelty_score: 0.7,
    estimated_seconds: 60,
    payload: {
      slides: [
        { type: "hook", text: "La latencia mata más sistemas que la falta de capacidad." },
        { type: "develop", text: "Algo lento se SIENTE roto, aunque funcione perfecto. El usuario abandona no porque falle, sino porque esperó. La velocidad percibida importa más que la potencia real." },
        { type: "twist", text: "Por eso lo pesado se pre-cocina y se cachea: cuando llega el momento de usarlo, ya está listo. Anticipar la demanda le gana a procesarla en directo, casi siempre." },
      ],
    },
    reflection_prompt: "¿Qué cosa importante de tu vida haces siempre 'sobre la marcha y con prisas' que funcionaría mucho mejor si la dejaras pre-cocinada?",
  },
];
