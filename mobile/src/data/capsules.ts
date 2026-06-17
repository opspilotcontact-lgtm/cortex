// Datos semilla (Fase 1 sin backend). Mismas cápsulas validadas en Fase 0.
// El día que Supabase esté vivo, esto se sustituye por una query a `capsules`
// — la app no cambia, solo la fuente. Español de España.

import { Capsule } from "../types";
import { PACK as behavioral } from "../content/behavioral";
import { PACK as meditaciones } from "../content/meditaciones";
import { PACK as piense } from "../content/piense";
import { PACK as influencia } from "../content/influencia";
import { PACK as voss } from "../content/voss";
import { PACK as manson } from "../content/manson";
import { PACK as robbins } from "../content/robbins";
import { PACK as titans } from "../content/titans";
import { PACK as retos } from "../content/retos";
import { PACK as generadas } from "../content/generadas";

const ORIGINAL_SEED: Capsule[] = [
  // ── Hábitos Atómicos (mundo "habits") ──────────────────────────
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

  // ── Pensamiento sistémico (mundo "systems") ────────────────────
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

  // ── INTERACTIVE — eliges y ves consecuencias (no hay correcto/incorrecto) (§8) ──
  {
    id: "int-01",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "interactive",
    novelty_score: 0.85,
    estimated_seconds: 50,
    payload: {
      scenario: "Quieres leer más. ¿Qué cambias?",
      choices: [
        { label: "Me propongo leer 30 minutos al día", outcome: "Depende de la motivación, que sube y baja. El día que no la tengas, no lees. Frágil." },
        { label: "Dejo un libro abierto en la almohada", outcome: "Cambiaste el entorno, no tu voluntad. El libro te encuentra a ti. Robusto." },
      ],
      insight: "El diseño del entorno le gana a la fuerza de voluntad casi siempre.",
    },
    reflection_prompt: "¿Qué cambio de ENTORNO (no de voluntad) haría casi automático ese hábito que persigues?",
  },
  {
    id: "int-02",
    queue: { title: "Pensamiento sistémico", type: "concept", theme: "systems" },
    format: "interactive",
    novelty_score: 0.9,
    estimated_seconds: 55,
    payload: {
      scenario: "Tu proyecto va lento. ¿Dónde inviertes el esfuerzo?",
      choices: [
        { label: "Optimizar la parte que ya es rápida", outcome: "El cuello de botella sigue mandando. Trabajaste mucho y el sistema va igual de lento." },
        { label: "Atacar el cuello de botella", outcome: "Todo el flujo se acelera de golpe. Ahí estaba la única palanca que movía el resultado." },
      ],
      insight: "Mejorar lo que NO es el cuello de botella es esfuerzo tirado (Teoría de las Restricciones).",
    },
    reflection_prompt: "En lo que estás intentando mejorar ahora: ¿estás puliendo lo que ya va bien, o atacando el cuello de botella real?",
  },

  // ── BRIDGE — la conexión inesperada entre materias (§8, máximo valor) ──
  {
    id: "br-01",
    queue: { title: "Puente inesperado", type: "bridge", theme: "bridge" },
    format: "bridge",
    novelty_score: 1.0,
    estimated_seconds: 65,
    payload: {
      atom_a: { title: "Un mal día es un evento, no quién eres", queue: "Hábitos Atómicos" },
      atom_b: { title: "Event sourcing: guarda los eventos, no el estado", queue: "Pensamiento sistémico" },
      rationale: "Ambos construyen un estado complejo a partir de pequeñas acciones encadenadas. No reescribes el pasado: solo añades el siguiente evento. Tu identidad y una base de datos se reconstruyen igual — sumando su historia.",
      question: "Si tus hábitos son un registro de eventos, ¿por qué un mal día no te 'reinicia a cero'?",
    },
    reflection_prompt: "¿Qué otra cosa de tu vida tratas como 'estado fijo' cuando en realidad es la suma de muchos eventos pequeños?",
  },
  {
    id: "br-02",
    queue: { title: "Puente inesperado", type: "bridge", theme: "bridge" },
    format: "bridge",
    novelty_score: 1.0,
    estimated_seconds: 65,
    payload: {
      atom_a: { title: "El bucle del hábito: señal → anhelo → respuesta → recompensa", queue: "Hábitos Atómicos" },
      atom_b: { title: "Bucles de retroalimentación reforzadores", queue: "Pensamiento sistémico" },
      rationale: "El bucle del hábito es un bucle reforzador puro: la recompensa fortalece la señal, que dispara otra vez la respuesta. Es la misma estructura que sostiene cualquier sistema que persiste en el tiempo.",
      question: "Si un hábito es un bucle que se refuerza solo, ¿por qué atacarlo con fuerza de voluntad casi nunca funciona?",
    },
    reflection_prompt: "Piensa en un hábito que quieres cambiar como un bucle: ¿en qué punto del bucle te resultaría más fácil cortarlo?",
  },

  // ── VISUAL — mapa conceptual / diagrama (§8) ──
  {
    id: "vis-01",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "visual",
    novelty_score: 0.8,
    estimated_seconds: 40,
    payload: {
      render: "concept_map",
      nodes: [
        { id: "senal", label: "Señal" },
        { id: "anhelo", label: "Anhelo" },
        { id: "respuesta", label: "Respuesta" },
        { id: "recompensa", label: "Recompensa" },
      ],
      edges: [
        { from: "senal", to: "anhelo" },
        { from: "anhelo", to: "respuesta" },
        { from: "respuesta", to: "recompensa" },
        { from: "recompensa", to: "senal" },
      ],
      caption: "El bucle del hábito es circular, no lineal: la recompensa alimenta la próxima señal.",
    },
    reflection_prompt: "Dibuja mentalmente un hábito tuyo como este bucle. ¿Cuál es la señal que lo dispara sin que te des cuenta?",
  },
  {
    id: "vis-02",
    queue: { title: "Pensamiento sistémico", type: "concept", theme: "systems" },
    format: "visual",
    novelty_score: 0.85,
    estimated_seconds: 40,
    payload: {
      render: "concept_map",
      nodes: [
        { id: "accion", label: "Acción" },
        { id: "resultado", label: "Resultado" },
        { id: "ajuste", label: "Ajuste" },
      ],
      edges: [
        { from: "accion", to: "resultado" },
        { from: "resultado", to: "ajuste" },
        { from: "ajuste", to: "accion" },
      ],
      caption: "Un bucle de retroalimentación: el resultado vuelve como señal que ajusta la próxima acción.",
    },
    reflection_prompt: "¿Qué bucle de retroalimentación gobierna algo de tu vida ahora mismo, para bien o para mal?",
  },

  // ── RECALL — repaso espaciado de algo ya visto (§8, §7) ──
  {
    id: "rec-01",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "recall",
    novelty_score: 0.4,
    estimated_seconds: 35,
    payload: {
      prompt: "Hace unos días viste por qué la gente con más autocontrol casi no lo usa. Antes de revelarlo: ¿de qué dependía en realidad?",
      reveal: "Del diseño del entorno, no de la fuerza de voluntad. La voluntad se agota; el entorno trabaja gratis las 24 horas.",
    },
    reflection_prompt: "¿Has cambiado algún entorno tuyo desde que viste esa idea, o sigues tirando de voluntad?",
  },
  {
    id: "rec-02",
    queue: { title: "Pensamiento sistémico", type: "concept", theme: "systems" },
    format: "recall",
    novelty_score: 0.4,
    estimated_seconds: 35,
    payload: {
      prompt: "Antes de mostrártelo: ¿recuerdas qué mata más sistemas que la falta de capacidad?",
      reveal: "La latencia. Algo lento se SIENTE roto aunque funcione perfecto. Por eso lo pesado se pre-cocina y se cachea.",
    },
    reflection_prompt: "¿Dónde de tu vida confundes 'va lento' con 'está roto'?",
  },

  // ── MOTION — escenas animadas HTML+GSAP (§8) ──
  {
    id: "mot-01",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "motion",
    novelty_score: 0.85,
    estimated_seconds: 40,
    payload: {
      render: "habit_loop",
      title: "El bucle del hábito",
      caption: "Señal → anhelo → respuesta → recompensa. Y vuelta a empezar: por eso se refuerza solo, sin que decidas.",
    },
    reflection_prompt: "¿Cuál es la señal que dispara tu hábito sin que te des cuenta?",
  },
  {
    id: "mot-02",
    queue: { title: "Hábitos Atómicos", type: "book", theme: "habits" },
    format: "motion",
    novelty_score: 0.8,
    estimated_seconds: 40,
    payload: {
      render: "compound",
      title: "1% mejor cada día",
      caption: "Las ganancias diarias parecen ridículas. Lo que se acumula, no: mejorar un 1% al día es ser 37× mejor en un año.",
    },
    reflection_prompt: "¿Cuál es tu 1% diario, ese que pospones porque 'es muy poco para que importe'?",
  },
];

// El seed embebido = originales + TODOS los packs de libros. Así la app funciona
// COMPLETA sin backend (offline real / demo pública en Render). Si Supabase
// responde (dev local), manda él; si no, esto da las 11 materias igualmente.
export const SEED_CAPSULES: Capsule[] = [
  ...ORIGINAL_SEED,
  ...behavioral, ...meditaciones, ...piense, ...influencia, ...voss, ...manson, ...robbins, ...titans,
  ...retos, // quiz · activity · coach · visual escritos a mano → formatos ricos por defecto
  ...generadas, // pack generado por IA (export:seed) → todas las formas, viaja a la nube
];
